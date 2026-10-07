from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import (
    calculate_kpis,
    monthly_trends,
    revenue_growth,
    department_analysis,
)


class AnalyticsDashboardView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        return Response({

            "kpis": calculate_kpis(),

            "growth": revenue_growth(),

            "monthly_trends": monthly_trends(),

            "departments": department_analysis(),

        })