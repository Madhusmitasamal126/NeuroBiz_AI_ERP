from rest_framework import serializers

from .models import (
    BusinessMetric,
    DepartmentMetric
)


class BusinessMetricSerializer(serializers.ModelSerializer):

    profit = serializers.SerializerMethodField()

    class Meta:
        model = BusinessMetric

        fields = [
            "id",
            "month",
            "revenue",
            "expenses",
            "profit",
            "sales_count",
            "stock_value",
            "attendance_percentage",
        ]

    def get_profit(self, obj):
        return obj.profit


class DepartmentMetricSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = DepartmentMetric

        fields = [
            "id",
            "department_name",
            "month",
            "employee_count",
            "revenue",
            "target",
            "attendance_percentage",
        ]