
from django.db import models
from inventory.models import Product


class Sale(models.Model):
    PAYMENT_METHODS = [
        ("UPI", "UPI"),
        ("Bank Transfer", "Bank Transfer"),
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("Cheque", "Cheque"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Cancelled", "Cancelled"),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.CharField(max_length=200)
    sale_date = models.DateField()
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="sales",
    )
    quantity = models.PositiveIntegerField(default=1)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHODS,
        default="UPI",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.invoice_number
