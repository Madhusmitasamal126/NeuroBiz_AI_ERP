
from decimal import Decimal

from django.db import transaction
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from inventory.models import Product
from .models import Sale
from .serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    queryset = Sale.objects.select_related("product").all()

    @transaction.atomic
    def perform_create(self, serializer):
        product_id = serializer.validated_data["product"].id
        quantity = serializer.validated_data["quantity"]

        product = Product.objects.select_for_update().get(
            pk=product_id
        )

        if not product.is_active:
            raise ValidationError({
                "product": "This product is inactive."
            })

        if quantity < 1:
            raise ValidationError({
                "quantity": "Quantity must be at least 1."
            })

        if product.stock_quantity < quantity:
            raise ValidationError({
                "quantity": (
                    f"Only {product.stock_quantity} units "
                    "are available."
                )
            })

        amount = Decimal(str(product.price)) * quantity

        product.stock_quantity -= quantity
        product.save(
            update_fields=["stock_quantity", "updated_at"]
        )

        serializer.save(amount=amount)
