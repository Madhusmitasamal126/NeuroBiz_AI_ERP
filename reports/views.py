
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can access only their own reports.
        return Report.objects.filter(
            created_by=self.request.user
        )

    def perform_create(self, serializer):
        # Never trust the frontend to supply the owner.
        serializer.save(created_by=self.request.user)
