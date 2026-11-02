
import json
import logging
from io import BytesIO
from pathlib import Path

import pandas as pd
from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# Use package-relative imports for modules inside fastapi_service.
from .auth import get_access_token
from .analytics_client import get_analytics
from .openai_service import (
    generate_report,
    chat_with_business_ai,
)
from .excel import (
    read_sales_file,
    clean_sales_data,
    build_report_sheets,
    create_excel_report,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


# ---------------------------------------------------------
# Request and response schemas
# ---------------------------------------------------------

class ReportRequest(BaseModel):
    question: str = Field(
        default="Summarize business performance and key trends.",
        min_length=1,
        max_length=2000,
    )


class ReportResponse(BaseModel):
    report: str


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=4000,
    )


class ChatResponse(BaseModel):
    answer: str


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="NeuroBiz AI Service",
    description=(
        "AI, business analytics, and Excel reporting "
        "service for NeuroBiz AI ERP"
    ),
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# JSON conversion helpers
# ---------------------------------------------------------

def make_json_safe(value):
    """Convert pandas/numpy values into JSON-compatible values."""

    if isinstance(value, dict):
        return {
            str(key): make_json_safe(item)
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [make_json_safe(item) for item in value]

    if value is None:
        return None

    # Convert numpy scalar values to normal Python values.
    if hasattr(value, "item") and callable(value.item):
        try:
            value = value.item()
        except (ValueError, TypeError):
            pass

    # Convert pandas timestamps to ISO strings.
    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()

    # Handle NaN and NaT without treating lists/arrays as booleans.
    try:
        missing = pd.isna(value)
        if isinstance(missing, bool) and missing:
            return None
    except (TypeError, ValueError):
        pass

    # Convert any remaining date/path-like objects to strings.
    if isinstance(value, Path):
        return str(value)

    return value


def dataframe_records(dataframe):
    """Convert a DataFrame to records with missing values as null."""

    # pandas' JSON encoder handles NaN and common numpy types.
    records = json.loads(
        dataframe.to_json(
            orient="records",
            date_format="iso",
        )
    )
    return make_json_safe(records)


# ---------------------------------------------------------
# Basic endpoints
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "NeuroBiz AI Service is running",
        "status": "success",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "NeuroBiz FastAPI AI",
    }


# ---------------------------------------------------------
# Excel upload processing
# ---------------------------------------------------------

async def process_sales_upload(file: UploadFile):
    """Validate, read, clean, and analyze a sales file."""

    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Upload a CSV, XLSX, or XLS file.",
        )

    content = await file.read(MAX_UPLOAD_BYTES + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="The maximum upload size is 10 MB.",
        )

    try:
        original_df = read_sales_file(content, filename)

        cleaned_df, kpis = clean_sales_data(original_df)

        sheets = build_report_sheets(cleaned_df, kpis)

        # These sheet names must match excel.py.
        monthly_df = sheets.get("Monthly Trends")
        products_df = sheets.get("Top Products")

        monthly_trends = (
            dataframe_records(monthly_df)
            if isinstance(monthly_df, pd.DataFrame)
            else []
        )

        top_products = (
            dataframe_records(products_df)
            if isinstance(products_df, pd.DataFrame)
            else []
        )

        cleaned_preview = dataframe_records(
            cleaned_df.head(20)
        )

        result = {
            "filename": filename,
            "kpis": make_json_safe(kpis),
            "monthly_trends": monthly_trends,
            "top_products": top_products,
            "cleaned_preview": cleaned_preview,
        }

        return result, cleaned_df, kpis

    except HTTPException:
        raise

    except (ValueError, UnicodeDecodeError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.exception("Sales file processing failed")

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not process this file. "
                "Check the file format and required column names."
            ),
        ) from exc


@app.post("/excel/analyze")
async def analyze_excel(
    file: UploadFile = File(...),
    token: str = Depends(get_access_token),
):
    """Return KPIs, chart data, and a cleaned-data preview."""

    del token

    try:
        result, _, _ = await process_sales_upload(file)
        return result
    finally:
        await file.close()


@app.post("/excel/report")
async def download_excel_report(
    file: UploadFile = File(...),
    token: str = Depends(get_access_token),
):
    """Generate and download a multi-sheet Excel report."""

    del token

    try:
        _, cleaned_df, kpis = await process_sales_upload(file)

        sheets = build_report_sheets(cleaned_df, kpis)
        report_file = create_excel_report(sheets)

        # Support bytes, bytearray, or file-like return values.
        if isinstance(report_file, BytesIO):
            report_file.seek(0)
            report_stream = report_file
        elif isinstance(report_file, (bytes, bytearray)):
            report_stream = BytesIO(report_file)
        elif hasattr(report_file, "getvalue"):
            report_stream = BytesIO(report_file.getvalue())
        else:
            raise TypeError(
                "create_excel_report() must return bytes "
                "or a file-like object."
            )

        return StreamingResponse(
            report_stream,
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition": (
                    'attachment; filename="neurobiz_sales_report.xlsx"'
                )
            },
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Excel report generation failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate the Excel report.",
        ) from exc

    finally:
        await file.close()


# ---------------------------------------------------------
# Django analytics endpoint
# ---------------------------------------------------------

@app.get("/analytics")
async def analytics(
    token: str = Depends(get_access_token),
):
    try:
        return await get_analytics(token)

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Failed to fetch Django analytics")

        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve analytics from Django.",
        ) from exc


# ---------------------------------------------------------
# AI business report endpoint
# ---------------------------------------------------------

@app.post("/ai/report", response_model=ReportResponse)
async def ai_report(
    request: ReportRequest,
    token: str = Depends(get_access_token),
):
    try:
        data = await get_analytics(token)

        report = await generate_report(
            data=data,
            question=request.question,
        )

        return {"report": str(report)}

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("AI report generation failed")

        raise HTTPException(
            status_code=502,
            detail="Unable to generate the business report.",
        ) from exc


# ---------------------------------------------------------
# AI chat endpoint
# ---------------------------------------------------------

@app.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    token: str = Depends(get_access_token),
):
    try:
        data = await get_analytics(token)

        answer = await chat_with_business_ai(
            message=request.message,
            data=data,
        )

        return {"answer": str(answer)}

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("AI chat failed")

        raise HTTPException(
            status_code=502,
            detail="Unable to generate the AI response.",
        ) from exc
