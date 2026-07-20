"""
DebtProof — Credit Card API Views
"""
from django.db.models import Sum, Avg
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from apps.credit_cards.models import CreditCard, CreditCardPayment
from .serializers import CreditCardSerializer, CreditCardPaymentSerializer


class CreditCardViewSet(viewsets.ModelViewSet):
    """
    CRUD Viewset for authenticated user's credit cards.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreditCardSerializer

    def get_queryset(self):
        return CreditCard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """
        Aggregate cards data.
        """
        qs = self.get_queryset()
        aggregates = qs.aggregate(
            total_limit=Sum("credit_limit"),
            total_outstanding=Sum("current_outstanding"),
            avg_interest=Avg("interest_rate"),
        )
        total_limit = aggregates["total_limit"] or 0.0
        total_outstanding = aggregates["total_outstanding"] or 0.0
        overall_utilization = (
            float((total_outstanding / total_limit) * 100)
            if total_limit > 0
            else 0.0
        )

        return Response({
            "total_cards": qs.count(),
            "total_limit": float(total_limit),
            "total_outstanding": float(total_outstanding),
            "available_limit": float(total_limit - total_outstanding),
            "overall_utilization": overall_utilization,
            "avg_interest_rate": float(aggregates["avg_interest"] or 0.0),
        })

    @action(detail=True, methods=["get"])
    def payments(self, request, pk=None):
        """
        Get payments history for a specific credit card.
        """
        card = self.get_object()
        payments = card.payments.all()
        serializer = CreditCardPaymentSerializer(payments, many=True)
        return Response(serializer.data)


class CreditCardPaymentViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing credit card payments.
    When a payment is created, it decreases the card's outstanding balance.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreditCardPaymentSerializer

    def get_queryset(self):
        return CreditCardPayment.objects.filter(card__user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            card = serializer.validated_data["card"]
            amount = serializer.validated_data["amount"]
            
            # Reduce current outstanding
            card.current_outstanding -= amount
            if card.current_outstanding < 0:
                card.current_outstanding = 0
            card.save()
            
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        with transaction.atomic():
            card = instance.card
            # Restore current outstanding if payment deleted
            card.current_outstanding += instance.amount
            card.save()
            self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

