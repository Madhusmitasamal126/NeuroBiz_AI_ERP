
import pandas as pd


def number(value, default=0.0):
    try:
        if value is None or isinstance(value, bool):
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def first_value(data, *keys, default=0):
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return default


def build_analytics(raw: dict) -> dict:
    # Support common dashboard field names.
    employees = int(number(first_value(
        raw, "total_employees", "employee_count",
        "totalEmployees", default=0
    )))

    revenue = number(first_value(
        raw, "total_revenue", "revenue",
        "totalRevenue", default=0
    ))

    monthly_sales = number(first_value(
        raw, "monthly_sales", "monthly_revenue",
        "monthlySales", default=0
    ))

    stock_alerts = int(number(first_value(
        raw, "stock_alerts", "low_stock_count",
        "stockAlerts", default=0
    )))

    attendance = number(first_value(
        raw, "attendance_percentage",
        "attendance", "attendancePercentage", default=0
    ))

    # Accept monthly trend data when Django provides it.
    trends = first_value(
        raw, "monthly_trends", "monthly_revenue",
        "monthlyTrends", default=[]
    )

    if isinstance(trends, dict):
        trends = [
            {"month": month, "revenue": value}
            for month, value in trends.items()
        ]

    if not isinstance(trends, list):
        trends = []

    df = pd.DataFrame(trends)

    cleaned_trends = []

    if not df.empty:
        month_col = next(
            (c for c in ["month", "label", "period"] if c in df.columns),
            None,
        )
        revenue_col = next(
            (c for c in ["revenue", "sales", "total"] if c in df.columns),
            None,
        )

        if month_col and revenue_col:
            df = df[[month_col, revenue_col]].copy()
            df.columns = ["month", "revenue"]
            df["revenue"] = pd.to_numeric(
                df["revenue"], errors="coerce"
            ).fillna(0)

            cleaned_trends = [
                {
                    "month": str(row["month"]),
                    "revenue": round(float(row["revenue"]), 2),
                }
                for _, row in df.iterrows()
            ]

    insights = []

    if revenue > 0:
        insights.append(
            f"Recorded total revenue is ₹{revenue:,.2f}."
        )

    if stock_alerts > 0:
        insights.append(
            f"{stock_alerts} inventory items need a stock review."
        )

    if attendance > 0:
        insights.append(
            f"Recorded attendance is {attendance:.1f}%."
        )

    if not insights:
        insights.append(
            "No usable KPI data was returned. Verify the Django "
            "analytics response and database records."
        )

    return {
        "source": "Django API + Pandas",
        "total_employees": employees,
        "total_revenue": round(revenue, 2),
        "monthly_sales": round(monthly_sales, 2),
        "stock_alerts": stock_alerts,
        "attendance_percentage": round(attendance, 2),
        "monthly_trends": cleaned_trends,
        "insights": insights,
    }
