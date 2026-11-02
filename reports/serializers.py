
from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "name",
            "category",
            "description",
            "status",
            "format",
            "records",
            "createdAt",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "createdAt",
            "created_at",
            "updated_at",
        ]
