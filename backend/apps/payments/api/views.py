"""
DebtProof — Payment & Receipt API Views
Handles payment CRUD and receipt file uploads with SHA-256 hashing.
"""
import hashlib
import logging
import uuid
from django.utils import timezone
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


def sync_loan_after_payment(payment: Payment):
    """
    Recalculates loan outstanding balance, advances next_emi_date, and updates loan status.
    """
    loan = payment.loan
    if not loan:
        return

    from decimal import Decimal
    from apps.loans.models import LoanStatus
    from apps.payments.models import PaymentStatus
    from datetime import date
    import calendar

    confirmed_payments = loan.payments.filter(status=PaymentStatus.CONFIRMED)

    total_principal_paid = Decimal("0.00")
    for p in confirmed_payments:
        p_comp = p.principal_component
        if not p_comp or p_comp == Decimal("0.00"):
            rate = (loan.interest_rate / Decimal("1200"))
            interest_est = min(p.amount, round(loan.principal_amount * rate, 2))
            p_comp = max(Decimal("0.00"), p.amount - interest_est)
        total_principal_paid += p_comp

    loan.outstanding_amount = max(Decimal("0.00"), loan.principal_amount - total_principal_paid)

    if loan.next_emi_date and confirmed_payments.exists():
        latest_payment_date = confirmed_payments.order_by("-payment_date").first().payment_date
        today = date.today()

        if loan.next_emi_date <= latest_payment_date or loan.next_emi_date <= today:
            y = loan.next_emi_date.year + (loan.next_emi_date.month // 12)
            m = (loan.next_emi_date.month % 12) + 1
            max_days = calendar.monthrange(y, m)[1]
            day = min(loan.next_emi_date.day, max_days)
            loan.next_emi_date = date(y, m, day)

    if loan.outstanding_amount <= Decimal("0.00"):
        loan.status = LoanStatus.CLOSED

    loan.save()


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
        sync_loan_after_payment(payment)
        logger.info("Payment created: INR %s for loan %s", payment.amount, loan.name)
        try:
            from apps.ai_engine.models import ActivityTimelineEntry
            ActivityTimelineEntry.objects.create(
                user=request.user,
                event_type="payment_added",
                title=f"Payment Recorded: ₹{payment.amount:,.0f}",
                description=f"Paid towards {loan.lender_name or loan.name} on {payment.payment_date or 'today'}",
                icon="💸",
                color="green",
            )
        except Exception as err:
            logger.error("Failed to record activity entry for payment: %s", err)
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
        sync_loan_after_payment(payment)
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
            blockchain_proof_id=str(uuid.uuid4()),
        )

        logger.info("Receipt uploaded for payment %s. Hash: %s...", payment_id, document_hash[:16])

        try:
            from apps.ai_engine.models import ActivityTimelineEntry
            ActivityTimelineEntry.objects.create(
                user=request.user,
                event_type="receipt_uploaded",
                title=f"Receipt Uploaded: {uploaded_file.name}",
                description=f"SHA-256 Hash computed: {document_hash[:16]}...",
                icon="📄",
                color="orange",
            )
        except Exception:
            pass

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


class GenerateProofView(APIView):
    """
    POST /api/v1/payments/{payment_id}/proof/generate/
    Retrieve or generate the blockchain proof UUID and get the SHA-256 receipt hash.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, payment_id: str) -> Response:
        try:
            payment = Payment.objects.get(id=payment_id, loan__user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Payment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hasattr(payment, "receipt") or not payment.receipt:
            return Response(
                {"success": False, "error": {"code": "NO_RECEIPT", "message": "No receipt uploaded for this payment. Please upload a receipt first."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receipt = payment.receipt
        if not receipt.blockchain_proof_id:
            receipt.blockchain_proof_id = str(uuid.uuid4())
            receipt.save()

        return Response({
            "success": True,
            "proof_id": receipt.blockchain_proof_id,
            "receipt_hash": receipt.document_hash,
        })


class StoreProofMetadataView(APIView):
    """
    POST /api/v1/payments/{payment_id}/proof/store/
    Save blockchain metadata after transaction has been successfully confirmed.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, payment_id: str) -> Response:
        try:
            payment = Payment.objects.get(id=payment_id, loan__user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Payment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hasattr(payment, "receipt") or not payment.receipt:
            return Response(
                {"success": False, "error": {"code": "NO_RECEIPT", "message": "No receipt exists for this payment."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receipt = payment.receipt
        
        tx_hash = request.data.get("blockchain_tx_hash")
        wallet_address = request.data.get("blockchain_wallet_address")
        block_number = request.data.get("blockchain_block_number")
        proof_id = request.data.get("blockchain_proof_id")

        if not tx_hash or not wallet_address:
            return Response(
                {"success": False, "error": {"code": "INVALID_PARAMS", "message": "blockchain_tx_hash and blockchain_wallet_address are required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receipt.blockchain_tx_hash = tx_hash
        receipt.blockchain_wallet_address = wallet_address
        if block_number:
            receipt.blockchain_block_number = int(block_number)
        if proof_id:
            receipt.blockchain_proof_id = proof_id
        
        receipt.is_blockchain_verified = True
        receipt.blockchain_anchored_at = timezone.now()
        receipt.save()

        logger.info("Blockchain metadata stored for receipt %s. Tx: %s", receipt.id, tx_hash)

        return Response({
            "success": True,
            "message": "Blockchain metadata saved successfully.",
            "receipt": ReceiptSerializer(receipt, context={"request": request}).data
        })


class GetProofStatusView(APIView):
    """
    GET /api/v1/payments/{payment_id}/proof/status/
    Retrieve the current blockchain proof status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, payment_id: str) -> Response:
        try:
            payment = Payment.objects.get(id=payment_id, loan__user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Payment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hasattr(payment, "receipt") or not payment.receipt:
            return Response(
                {"success": False, "error": {"code": "NO_RECEIPT", "message": "No receipt exists for this payment."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        receipt = payment.receipt
        return Response({
            "success": True,
            "is_blockchain_verified": receipt.is_blockchain_verified,
            "blockchain_proof_id": receipt.blockchain_proof_id,
            "blockchain_tx_hash": receipt.blockchain_tx_hash,
            "blockchain_wallet_address": receipt.blockchain_wallet_address,
            "blockchain_network": receipt.blockchain_network,
            "blockchain_anchored_at": receipt.blockchain_anchored_at
        })


class VerifyProofView(APIView):
    """
    POST /api/v1/proofs/verify/
    Public portal to verify any receipt's authenticity against on-chain database proofs.
    """
    permission_classes = []  # Publicly accessible
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request: Request) -> Response:
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"success": False, "error": {"code": "FILE_MISSING", "message": "Receipt file is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Compute SHA-256 hash of the uploaded file
        sha256 = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            sha256.update(chunk)
        document_hash = sha256.hexdigest()

        # Find verified receipt in database with this hash
        try:
            receipt = Receipt.objects.get(document_hash=document_hash, is_blockchain_verified=True)
            return Response({
                "success": True,
                "verified": True,
                "document_hash": document_hash,
                "proof_id": receipt.blockchain_proof_id,
                "tx_hash": receipt.blockchain_tx_hash,
                "anchored_at": receipt.blockchain_anchored_at,
                "wallet_address": receipt.blockchain_wallet_address,
                "network": receipt.blockchain_network,
                "block_number": receipt.blockchain_block_number
            })
        except Receipt.DoesNotExist:
            return Response({
                "success": True,
                "verified": False,
                "document_hash": document_hash,
                "message": "No verified on-chain proof found for this receipt. Verify file integrity or ensure proof has been anchored."
            })


import csv
from django.http import HttpResponse

class ExportPaymentsCSVView(APIView):
    """
    GET /api/v1/payments/export/csv/
    Exports payment history with date range, format, and loan filtering options.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> HttpResponse:
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        loan_id = request.query_params.get("loan_id")
        export_format = request.query_params.get("format", "csv")

        payments = Payment.objects.filter(loan__user=request.user).select_related("loan").order_by("-payment_date")

        if loan_id:
            payments = payments.filter(loan_id=loan_id)
        if start_date:
            payments = payments.filter(payment_date__gte=start_date)
        if end_date:
            payments = payments.filter(payment_date__lte=end_date)

        # JSON Export Option
        if export_format == "json":
            from django.http import JsonResponse
            data = [{
                "payment_id": str(p.id),
                "payment_date": p.payment_date.isoformat(),
                "loan_name": p.loan.name,
                "lender": p.loan.lender_name,
                "amount": float(p.amount),
                "principal_component": float(p.principal_component),
                "interest_component": float(p.interest_component),
                "payment_method": p.get_payment_method_display(),
                "reference_number": p.reference_number,
                "status": p.get_status_display()
            } for p in payments]
            response = JsonResponse({"payments": data}, safe=False)
            response["Content-Disposition"] = 'attachment; filename="debtproof_payments_history.json"'
            return response

        # Default CSV Export
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="debtproof_payments_history.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Payment ID",
            "Payment Date",
            "Loan Name",
            "Lender",
            "Amount (INR)",
            "Principal Component (INR)",
            "Interest Component (INR)",
            "Payment Method",
            "Reference Number",
            "Status",
        ])

        for p in payments:
            writer.writerow([
                str(p.id),
                p.payment_date.isoformat(),
                p.loan.name,
                p.loan.lender_name,
                float(p.amount),
                float(p.principal_component),
                float(p.interest_component),
                p.get_payment_method_display(),
                p.reference_number,
                p.get_status_display(),
            ])

        return response


