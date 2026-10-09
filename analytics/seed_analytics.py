from datetime import date

from django.core.management.base import BaseCommand

from analytics.models import (
    BusinessMetric,
    DepartmentMetric
)
class Command(BaseCommand):

    help = "Create demo analytics data"

    def handle(
        self,
        *args,
        **options
    ):

        BusinessMetric.objects.all().delete()

        DepartmentMetric.objects.all().delete()

        business_data = [

            {
                "month": date(2026, 1, 1),
                "revenue": 850000,
                "expenses": 520000,
                "sales_count": 120,
                "stock_value": 250000,
                "attendance_percentage": 91,
            },

            {
                "month": date(2026, 2, 1),
                "revenue": 920000,
                "expenses": 540000,
                "sales_count": 135,
                "stock_value": 270000,
                "attendance_percentage": 92,
            },
 {
                "month": date(2026, 3, 1),
                "revenue": 980000,
                "expenses": 570000,
                "sales_count": 148,
                "stock_value": 290000,
                "attendance_percentage": 93,
            },

            {
                "month": date(2026, 4, 1),
                "revenue": 1050000,
                "expenses": 610000,
                "sales_count": 160,
                "stock_value": 300000,
                "attendance_percentage": 94,
            },

            {
                "month": date(2026, 5, 1),
                "revenue": 1150000,
                "expenses": 650000,
                "sales_count": 178,
                "stock_value": 315000,
                "attendance_percentage": 94,
            },

            {
                "month": date(2026, 6, 1),
                "revenue": 1280000,
                "expenses": 690000,
                "sales_count": 192,
                "stock_value": 330000,
                "attendance_percentage": 95,
            },

            {
                "month": date(2026, 7, 1),
                "revenue": 1360000,
                "expenses": 720000,
                "sales_count": 210,
                "stock_value": 345000,
                "attendance_percentage": 95,
            },

            {
                "month": date(2026, 8, 1),
                "revenue": 1450000,
                "expenses": 760000,
                "sales_count": 230,
                "stock_value": 360000,
                "attendance_percentage": 96,
            },

            {
                "month": date(2026, 9, 1),
                "revenue": 1580000,
                "expenses": 810000,
                "sales_count": 248,
                "stock_value": 375000,
                "attendance_percentage": 96,
            },

        ]

        for item in business_data:

            BusinessMetric.objects.create(
                **item
            )

        departments = [

            (
                "IT",
                25,
                450000,
                500000,
                96
            ),

            (
                "HR",
                10,
                180000,
                200000,
                95
            ),

            (
                "Sales",
                20,
                620000,
                600000,
                94
            ),

            (
                "Finance",
                12,
                250000,
                280000,
                97
            ),

        ]

        for name, employees, revenue, target, attendance in departments:

            DepartmentMetric.objects.create(

                department_name=name,

                month=date(
                    2026,
                    9,
                    1
                ),

                employee_count=employees,

                revenue=revenue,

                target=target,

                attendance_percentage=attendance,
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Analytics demo data created successfully."
            )
        )
