
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    ChatRequest,
    ChatResponse,
    ReportRequest,
    ReportResponse,
)
from .auth import get_access_token
from .analytics_client import get_analytics
from .openai_service import (
    generate_report,
    chat_with_business_ai,
)


app = FastAPI(
    title="NeuroBiz AI Service",
    description="FastAPI AI service for NeuroBiz AI ERP",
    version="1.0.0",
)

# React development server CORS configuration
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


@app.get("/analytics")
async def analytics(
    token: str = Depends(get_access_token),
):
    data = await get_analytics(token)
    return data


@app.post(
    "/ai/report",
    response_model=ReportResponse,
)
async def ai_report(
    request: ReportRequest,
    token: str = Depends(get_access_token),
):
    data = await get_analytics(token)

    report = await generate_report(
        data=data,
        question=request.question,
    )

    return {"report": report}


@app.post(
    "/ai/chat",
    response_model=ChatResponse,
)
async def ai_chat(
    request: ChatRequest,
    token: str = Depends(get_access_token),
):
    data = await get_analytics(token)

    answer = await chat_with_business_ai(
        message=request.message,
        data=data,
    )

    return {"answer": answer}
