
from django.db import models
from django.utils import timezone


class Attendance(models.Model):
    employee = models.ForeignKey(
        "employees.Employee",
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    date = models.DateField(default=timezone.localdate)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)

    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Late", "Late"),
        ("Absent", "Absent"),
        ("On Leave", "On Leave"),
        ("Half Day", "Half Day"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Present",
    )

    class Meta:
        ordering = ["-date", "-check_in"]
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_employee_attendance_per_day",
            )
        ]

    def __str__(self):
        return f"{self.employee} - {self.date}"
