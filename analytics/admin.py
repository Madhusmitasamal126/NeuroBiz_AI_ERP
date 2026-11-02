from django.contrib import admin

from .models import (
    BusinessMetric,
    DepartmentMetric
)


@admin.register(BusinessMetric)
class BusinessMetricAdmin(admin.ModelAdmin):

    list_display = (
        "month",
        "revenue",
        "expenses",
        "sales_count",
        "stock_value",
        "attendance_percentage",
    )

    list_filter = (
        "month",
    )


@admin.register(DepartmentMetric)
class DepartmentMetricAdmin(admin.ModelAdmin):

    list_display = (
        "department_name",
        "month",
        "employee_count",
        "revenue",
        "target",
        "attendance_percentage",
    )

    list_filter = (
        "department_name",
        "month",
    )
