"""
DebtProof — Credit Card API Views
"""
from django.db.models import Sum, Avg
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.credit_cards.models import CreditCard
from .serializers import CreditCardSerializer


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
