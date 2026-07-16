"""
DebtProof — Payment & Receipt API URL Configuration
"""
from django.urls import path
from .views import (
    AllPaymentsListView,
    PaymentRetrieveUpdateDestroyView,
    ReceiptUploadView,
    GenerateProofView,
    StoreProofMetadataView,
    GetProofStatusView,
    VerifyProofView,
)

urlpatterns = [
    path("", AllPaymentsListView.as_view(), name="payment-list"),
    path("verify/", VerifyProofView.as_view(), name="proof-verify"),
    path("<uuid:pk>/", PaymentRetrieveUpdateDestroyView.as_view(), name="payment-detail"),
    path("<uuid:payment_id>/receipt/", ReceiptUploadView.as_view(), name="receipt-upload"),
    path("<uuid:payment_id>/proof/generate/", GenerateProofView.as_view(), name="proof-generate"),
    path("<uuid:payment_id>/proof/store/", StoreProofMetadataView.as_view(), name="proof-store"),
    path("<uuid:payment_id>/proof/status/", GetProofStatusView.as_view(), name="proof-status"),
]
