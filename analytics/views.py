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

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            kpis = calculate_kpis()

            trends = monthly_trends()

            growth = revenue_growth()

            departments = department_analysis()

            return Response({
                "kpis": kpis,
                "monthly_trends": trends,
                "revenue_growth": growth,
                "department_analysis": departments,
            })

        except Exception as e:

            return Response(
                {
                    "error": "Analytics calculation failed",
                    "details": str(e),
                },
                status=500,
            )