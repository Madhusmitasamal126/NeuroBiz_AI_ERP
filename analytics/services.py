import pandas as pd
import numpy as np

from .models import (
    BusinessMetric,
    DepartmentMetric
)


def get_business_dataframe():

    metrics = BusinessMetric.objects.all().values(
        "month",
        "revenue",
        "expenses",
        "sales_count",
        "stock_value",
        "attendance_percentage",
    )

    df = pd.DataFrame(list(metrics))

    if df.empty:
        return df

    df["month"] = pd.to_datetime(df["month"])

    df["revenue"] = pd.to_numeric(
        df["revenue"],
        errors="coerce"
    ).fillna(0)

    df["expenses"] = pd.to_numeric(
        df["expenses"],
        errors="coerce"
    ).fillna(0)

    df["profit"] = (
        df["revenue"] -
        df["expenses"]
    )

    return df


def calculate_kpis():

    df = get_business_dataframe()

    if df.empty:

        return {
            "total_revenue": 0,
            "total_expenses": 0,
            "total_profit": 0,
            "total_sales": 0,
            "average_attendance": 0,
            "stock_value": 0,
        }

    return {
        "total_revenue": float(
            df["revenue"].sum()
        ),

        "total_expenses": float(
            df["expenses"].sum()
        ),

        "total_profit": float(
            df["profit"].sum()
        ),

        "total_sales": int(
            df["sales_count"].sum()
        ),

        "average_attendance": round(
            float(
                df["attendance_percentage"].mean()
            ),
            2
        ),

        "stock_value": float(
            df["stock_value"].iloc[-1]
        ),
    }


def monthly_trends():

    df = get_business_dataframe()

    if df.empty:
        return []

    df = df.sort_values("month")

    result = []

    for _, row in df.iterrows():

        result.append({
            "month": row["month"].strftime(
                "%b %Y"
            ),

            "revenue": float(
                row["revenue"]
            ),

            "expenses": float(
                row["expenses"]
            ),

            "profit": float(
                row["profit"]
            ),

            "sales": int(
                row["sales_count"]
            ),
        })

    return result


def revenue_growth():

    df = get_business_dataframe()

    if len(df) < 2:
        return 0

    current = float(
        df.iloc[-1]["revenue"]
    )

    previous = float(
        df.iloc[-2]["revenue"]
    )

    if previous == 0:
        return 0

    growth = (
        (current - previous)
        / previous
    ) * 100

    return round(growth, 2)


def department_analysis():

    data = DepartmentMetric.objects.all().values(
        "department_name",
        "month",
        "employee_count",
        "revenue",
        "target",
        "attendance_percentage",
    )

    df = pd.DataFrame(list(data))

    if df.empty:
        return []

    df["revenue"] = pd.to_numeric(
        df["revenue"],
        errors="coerce"
    ).fillna(0)

    df["target"] = pd.to_numeric(
        df["target"],
        errors="coerce"
    ).fillna(0)

    grouped = (
        df.groupby("department_name")
        .agg({
            "employee_count": "max",
            "revenue": "sum",
            "target": "sum",
            "attendance_percentage": "mean"
        })
        .reset_index()
    )

    grouped["achievement"] = np.where(
        grouped["target"] > 0,
        (
            grouped["revenue"]
            / grouped["target"]
        ) * 100,
        0
    )

    result = []

    for _, row in grouped.iterrows():

        result.append({

            "department": row[
                "department_name"
            ],

            "employees": int(
                row["employee_count"]
            ),

            "revenue": float(
                row["revenue"]
            ),

            "target": float(
                row["target"]
            ),

            "achievement": round(
                float(
                    row["achievement"]
                ),
                2
            ),

            "attendance": round(
                float(
                    row[
                        "attendance_percentage"
                    ]
                ),
                2
            ),
        })

    return result