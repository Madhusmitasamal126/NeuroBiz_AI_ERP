
from io import BytesIO
import re

import numpy as np
import pandas as pd


MAX_ROWS = 100_000
MAX_COLUMNS = 50

COLUMN_ALIASES = {
    "order_id": [
        "order_id", "order id", "orderid", "invoice_id", "invoice id"
    ],
    "order_date": [
        "order_date", "order date", "date", "sale_date", "sales date"
    ],
    "product": [
        "product", "product_name", "product name", "item", "item_name"
    ],
    "quantity": [
        "quantity", "qty", "units", "units_sold"
    ],
    "unit_price": [
        "unit_price", "unit price", "price", "selling_price", "rate"
    ],
    "revenue": [
        "revenue", "sales", "total_sales", "total sales",
        "amount", "total_amount", "total amount"
    ],
}


def normalize_column_name(value: str) -> str:
    value = str(value).strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def read_sales_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    extension = filename.lower().rsplit(".", 1)[-1]

    if extension == "csv":
        df = pd.read_csv(
            BytesIO(file_bytes),
            encoding="utf-8-sig",
        )
    elif extension in {"xlsx", "xls"}:
        df = pd.read_excel(
            BytesIO(file_bytes),
            engine="openpyxl" if extension == "xlsx" else "xlrd",
        )
    else:
        raise ValueError("Only CSV, XLSX, and XLS files are supported.")

    if df.empty:
        raise ValueError("The uploaded file contains no data.")

    if len(df) > MAX_ROWS:
        raise ValueError(f"Maximum supported rows: {MAX_ROWS}.")

    if len(df.columns) > MAX_COLUMNS:
        raise ValueError(f"Maximum supported columns: {MAX_COLUMNS}.")

    if any(isinstance(col, (list, dict, set)) for col in df.columns):
        raise ValueError("Invalid column names.")

    df.columns = [normalize_column_name(c) for c in df.columns]

    if len(set(df.columns)) != len(df.columns):
        raise ValueError(
            "Column names must be unique after normalization."
        )

    return df


def map_sales_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename = {}

    for standard_name, aliases in COLUMN_ALIASES.items():
        normalized_aliases = {
            normalize_column_name(alias) for alias in aliases
        }

        matches = [
            col for col in df.columns
            if col in normalized_aliases
        ]

        if len(matches) > 1:
            raise ValueError(
                f"Multiple columns match '{standard_name}': {matches}"
            )

        if matches:
            rename[matches[0]] = standard_name

    df = df.rename(columns=rename)

    # Revenue is required, or it can be calculated from quantity and price.
    if "revenue" not in df.columns:
        if {"quantity", "unit_price"}.issubset(df.columns):
            df["quantity"] = pd.to_numeric(
                df["quantity"], errors="coerce"
            )
            df["unit_price"] = pd.to_numeric(
                df["unit_price"], errors="coerce"
            )
            df["revenue"] = df["quantity"] * df["unit_price"]
        else:
            raise ValueError(
                "Provide a revenue/sales/amount column, or both "
                "quantity and unit_price columns."
            )

    if "order_date" in df.columns:
        df["order_date"] = pd.to_datetime(
            df["order_date"], errors="coerce", format="mixed"
        )

    for col in ("quantity", "unit_price", "revenue"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def clean_sales_data(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    original_rows = len(df)

    df = map_sales_columns(df)

    # Drop exact duplicate rows.
    df = df.drop_duplicates().copy()
    duplicates_removed = original_rows - len(df)

    # Rows without a usable revenue value cannot contribute to sales KPIs.
    missing_revenue_rows = int(df["revenue"].isna().sum())
    df = df.dropna(subset=["revenue"]).copy()

    # Do not silently turn missing quantities into sales.
    if "quantity" in df.columns:
        df = df.dropna(subset=["quantity"]).copy()

    if df.empty:
        raise ValueError(
            "No usable sales records remain after cleaning."
        )

    if not np.isfinite(df["revenue"].to_numpy(dtype=float)).all():
        raise ValueError("Revenue contains infinite or invalid values.")

    if (df["revenue"] < 0).any():
        raise ValueError(
            "Negative revenue was found. Review refunds or corrections "
            "before using this report."
        )

    if "quantity" in df.columns:
        if not np.isfinite(df["quantity"].to_numpy(dtype=float)).all():
            raise ValueError("Quantity contains invalid values.")
        if (df["quantity"] < 0).any():
            raise ValueError(
                "Negative quantities were found. Review returns first."
            )

    if "unit_price" in df.columns:
        if not np.isfinite(
            df["unit_price"].to_numpy(dtype=float)
        ).all():
            raise ValueError("Unit price contains invalid values.")
        if (df["unit_price"] < 0).any():
            raise ValueError("Negative unit prices were found.")

    if "product" in df.columns:
        df["product"] = df["product"].fillna("Unknown product").astype(str)

    if "order_id" in df.columns:
        df["order_id"] = df["order_id"].fillna("Unknown order").astype(str)

    # A sales line's revenue is the sum of its row-level revenue.
    # Order count is distinct order IDs when available.
    if "order_id" in df.columns:
        order_count = int(df["order_id"].nunique())
    else:
        order_count = int(len(df))

    total_revenue = float(df["revenue"].sum())

    kpis = {
        "rows_received": original_rows,
        "rows_analyzed": int(len(df)),
        "duplicates_removed": duplicates_removed,
        "rows_missing_revenue_removed": missing_revenue_rows,
        "total_revenue": round(total_revenue, 2),
        "order_count": order_count,
        "average_order_value": round(
            total_revenue / order_count if order_count else 0, 2
        ),
        "total_units": (
            round(float(df["quantity"].sum()), 2)
            if "quantity" in df.columns else None
        ),
        "unique_products": (
            int(df["product"].nunique())
            if "product" in df.columns else None
        ),
    }

    return df, kpis


def build_report_sheets(df: pd.DataFrame, kpis: dict) -> dict:
    summary = pd.DataFrame(
        [{"metric": key, "value": value} for key, value in kpis.items()]
    )

    if "order_date" in df.columns:
        dated = df.dropna(subset=["order_date"]).copy()

        if not dated.empty:
            dated["month"] = dated["order_date"].dt.to_period("M").astype(str)
            monthly = (
                dated.groupby("month", as_index=False)["revenue"]
                .sum()
                .sort_values("month")
            )
        else:
            monthly = pd.DataFrame(columns=["month", "revenue"])
    else:
        monthly = pd.DataFrame(columns=["month", "revenue"])

    if "product" in df.columns:
        products = (
            df.groupby("product", as_index=False)
            .agg(
                revenue=("revenue", "sum"),
                **(
                    {"units_sold": ("quantity", "sum")}
                    if "quantity" in df.columns else {}
                ),
            )
            .sort_values("revenue", ascending=False)
            .head(10)
        )
    else:
        products = pd.DataFrame(columns=["product", "revenue"])

    cleaned = df.copy()

    if "order_date" in cleaned.columns:
        cleaned["order_date"] = cleaned["order_date"].astype(str)

    return {
        "KPI Summary": summary,
        "Monthly Trends": monthly,
        "Top Products": products,
        "Cleaned Sales": cleaned,
    }


def create_excel_report(sheets: dict) -> bytes:
    output = BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        for sheet_name, frame in sheets.items():
            frame.to_excel(
                writer,
                sheet_name=sheet_name,
                index=False,
            )

            ws = writer.sheets[sheet_name]
            ws.freeze_panes = "A2"
            ws.auto_filter.ref = ws.dimensions

            for column_cells in ws.columns:
                max_length = max(
                    len(str(cell.value or ""))
                    for cell in column_cells
                )
                ws.column_dimensions[
                    column_cells[0].column_letter
                ].width = min(max(max_length + 2, 12), 40)

    output.seek(0)
    return output.getvalue()
