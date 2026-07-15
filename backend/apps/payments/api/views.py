"""
DebtProof — Payment & Receipt API Views
Handles payment CRUD and receipt file uploads with SHA-256 hashing.
"""
import hashlib
import logging
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.loans.models import Loan
from apps.payments.models import Payment, Receipt
from apps.core.pagination import StandardResultsSetPagination
from .serializers import (
    PaymentSerializer,
    PaymentListSerializer,
    PaymentCreateSerializer,
    ReceiptSerializer,
    ReceiptUploadSerializer,
)

logger = logging.getLogger(__name__)


class LoanPaymentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/loans/{loan_id}/payments/  — List payments for a specific loan
    POST /api/v1/loans/{loan_id}/payments/  — Create a payment for a specific loan
    """

    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["payment_date", "amount", "created_at"]
    ordering = ["-payment_date"]

    def _get_loan(self) -> Loan:
        loan_id = self.kwargs["loan_id"]
        try:
            return Loan.objects.get(id=loan_id, user=self.request.user)
        except Loan.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Loan not found.")

    def get_queryset(self):
        loan = self._get_loan()
        return Payment.objects.filter(loan=loan).select_related("receipt")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PaymentSerializer
        return PaymentCreateSerializer

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PaymentSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = PaymentSerializer(queryset, many=True, context={"request": request})
        return Response({"success": True, "results": serializer.data})

    def create(self, request: Request, *args, **kwargs) -> Response:
        loan = self._get_loan()
        serializer = PaymentCreateSerializer(
            data=request.data, context={"request": request, "loan": loan}
        )
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        logger.info("Payment created: ₹%s for loan %s", payment.amount, loan.name)
        return Response(
            {
                "success": True,
                "message": "Payment recorded successfully.",
                "payment": PaymentSerializer(payment, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/payments/{id}/  — Retrieve payment detail
    PATCH  /api/v1/payments/{id}/  — Update payment
    DELETE /api/v1/payments/{id}/  — Delete payment
    """

    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Payment.objects.filter(loan__user=self.request.user).select_related("receipt", "loan")

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = PaymentSerializer(instance, context={"request": request})
        return Response({"success": True, "payment": serializer.data})

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = PaymentSerializer(instance, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        logger.info("Payment updated: %s", payment.id)
        return Response(
            {"success": True, "message": "Payment updated.", "payment": PaymentSerializer(payment, context={"request": request}).data}
        )

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        # Delete receipt file if exists
        if hasattr(instance, "receipt") and instance.receipt:
            try:
                instance.receipt.document.delete(save=False)
                instance.receipt.delete()
            except Exception:
                pass
        instance.delete()
        logger.info("Payment deleted: %s by %s", instance.id, request.user.email)
        return Response(
            {"success": True, "message": "Payment deleted successfully."},
            status=status.HTTP_200_OK,
        )


class AllPaymentsListView(generics.ListAPIView):
    """
    GET /api/v1/payments/  — All payments across all user's loans (paginated)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = PaymentListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["loan__name", "reference_number", "loan__lender_name"]
    ordering_fields = ["payment_date", "amount", "created_at"]
    ordering = ["-payment_date"]

    def get_queryset(self):
        qs = Payment.objects.filter(loan__user=self.request.user).select_related("loan", "receipt")

        # Status filter
        payment_status = self.request.query_params.get("status")
        if payment_status:
            qs = qs.filter(status=payment_status)

        # Loan filter
        loan_id = self.request.query_params.get("loan_id")
        if loan_id:
            qs = qs.filter(loan_id=loan_id)

        return qs

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "results": serializer.data})


class ReceiptUploadView(APIView):
    """
    POST /api/v1/payments/{payment_id}/receipt/
    Upload a receipt document. Computes SHA-256 hash for future blockchain anchoring.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request: Request, payment_id: str) -> Response:
        try:
            payment = Payment.objects.get(
                id=payment_id,
                loan__user=request.user,
            )
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Payment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if receipt already exists
        if hasattr(payment, "receipt") and payment.receipt:
            return Response(
                {"success": False, "error": {"code": "RECEIPT_EXISTS", "message": "A receipt already exists for this payment. Delete it first."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReceiptUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uploaded_file = serializer.validated_data["file"]

        # Compute SHA-256 hash
        sha256 = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            sha256.update(chunk)
        document_hash = sha256.hexdigest()

        # Check hash uniqueness
        if Receipt.objects.filter(document_hash=document_hash).exists():
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "DUPLICATE_RECEIPT",
                        "message": "This document has already been uploaded. Duplicate receipts are not allowed.",
                    },
                },
                status=status.HTTP_409_CONFLICT,
            )

        # Reset file pointer after hashing
        uploaded_file.seek(0)

        # Determine MIME type
        import mimetypes
        mime_type, _ = mimetypes.guess_type(uploaded_file.name)
        if not mime_type:
            mime_type = uploaded_file.content_type or "application/octet-stream"

        receipt = Receipt.objects.create(
            payment=payment,
            document=uploaded_file,
            original_filename=uploaded_file.name,
            file_size_bytes=uploaded_file.size,
            mime_type=mime_type,
            document_hash=document_hash,
            hash_algorithm="sha256",
        )

        logger.info("Receipt uploaded for payment %s. Hash: %s...", payment_id, document_hash[:16])

        return Response(
            {
                "success": True,
                "message": "Receipt uploaded and hashed successfully.",
                "receipt": ReceiptSerializer(receipt, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request: Request, payment_id: str) -> Response:
        """Delete a receipt."""
        try:
            payment = Payment.objects.get(id=payment_id, loan__user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Payment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hasattr(payment, "receipt") or not payment.receipt:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "No receipt found for this payment."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            payment.receipt.document.delete(save=False)
            payment.receipt.delete()
        except Exception as e:
            logger.error("Failed to delete receipt: %s", e)
            return Response(
                {"success": False, "error": {"code": "DELETE_FAILED", "message": "Failed to delete receipt."}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"success": True, "message": "Receipt deleted successfully."})
