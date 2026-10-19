
from rest_framework import serializers

from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:
        model = Sale
        fields = [
            "id",
            "invoice_number",
            "customer",
            "sale_date",
            "product",
            "product_name",
            "quantity",
            "amount",
            "payment_method",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "amount",
            "created_at",
        ]

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )
        return value
