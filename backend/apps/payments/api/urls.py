"""
DebtProof — Payment & Receipt API URL Configuration
"""
from django.urls import path
from .views import (
    AllPaymentsListView,
    PaymentRetrieveUpdateDestroyView,
    ReceiptUploadView,
)

urlpatterns = [
    path("", AllPaymentsListView.as_view(), name="payment-list"),
    path("<uuid:pk>/", PaymentRetrieveUpdateDestroyView.as_view(), name="payment-detail"),
    path("<uuid:payment_id>/receipt/", ReceiptUploadView.as_view(), name="receipt-upload"),
]
