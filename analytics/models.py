from django.db import models


class BusinessMetric(models.Model):

    month = models.DateField()

    revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    expenses = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    sales_count = models.PositiveIntegerField(
        default=0
    )

    stock_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["month"]

    @property
    def profit(self):
        return float(self.revenue) - float(self.expenses)

    def __str__(self):
        return self.month.strftime("%B %Y")


class DepartmentMetric(models.Model):

    department_name = models.CharField(
        max_length=150
    )

    month = models.DateField()

    employee_count = models.PositiveIntegerField(
        default=0
    )

    revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    target = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.department_name} - {self.month}"