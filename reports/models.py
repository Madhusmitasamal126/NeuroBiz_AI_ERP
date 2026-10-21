
from django.conf import settings
from django.db import models


class Report(models.Model):
    CATEGORY_CHOICES = [
        ("Sales", "Sales"),
        ("HR", "HR"),
        ("Inventory", "Inventory"),
        ("Analytics", "Analytics"),
    ]

    STATUS_CHOICES = [
        ("Completed", "Completed"),
        ("Processing", "Processing"),
        ("Failed", "Failed"),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Completed",
    )
    format = models.CharField(max_length=10, default="CSV")
    records = models.PositiveIntegerField(default=0)

    # The user who created the report.
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_reports",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
