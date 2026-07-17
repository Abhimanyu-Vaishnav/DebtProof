import io
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from apps.loans.models import Loan
from apps.payments.models import Payment, Receipt

User = get_user_model()

class PaymentAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="borrower@example.com",
            password="SecurePassword123!"
        )
        self.client.force_authenticate(user=self.user)
        
        self.loan = Loan.objects.create(
            user=self.user,
            name="Education Loan",
            lender_name="Bank of India",
            loan_type="education",
            principal_amount=Decimal("200000.00"),
            outstanding_amount=Decimal("200000.00"),
            interest_rate=Decimal("0.00"),
            monthly_emi=Decimal("8000.00"),
            start_date="2026-01-01",
            end_date="2028-01-01",
            status="active"
        )
        self.nested_payments_url = reverse(
            "loan-payment-list-create",
            kwargs={"loan_id": self.loan.id}
        )
        
        self.payment_data = {
            "amount": Decimal("8000.00"),
            "payment_date": "2026-02-01",
            "payment_method": "bank_transfer",
            "reference_number": "TXN1234567890",
            "status": "confirmed",
            "notes": "Feb EMI payment"
        }

    def test_record_payment_success(self):
        """Test recording a repayment successfully updates the loan's outstanding balance."""
        response = self.client.post(self.nested_payments_url, self.payment_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(float(response.data["payment"]["amount"]), 8000.0)
        
        # Verify signal updated loan outstanding balance
        self.loan.refresh_from_db()
        self.assertEqual(float(self.loan.outstanding_amount), 192000.0)

    def test_upload_receipt_and_hash(self):
        """Test uploading a receipt, checking that SHA-256 is generated successfully."""
        payment = Payment.objects.create(
            loan=self.loan,
            amount=Decimal("8000.00"),
            payment_date="2026-02-01",
            payment_method="bank_transfer",
            status="confirmed"
        )
        
        file_content = b"PDF dummy content matching a payment receipt"
        receipt_file = SimpleUploadedFile("receipt.pdf", file_content, content_type="application/pdf")
        
        upload_url = reverse("receipt-upload", kwargs={"payment_id": payment.id})
        response = self.client.post(upload_url, {"file": receipt_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        
        receipt = Receipt.objects.get(payment=payment)
        self.assertIsNotNone(receipt.document_hash)
        self.assertEqual(receipt.original_filename, "receipt.pdf")

    def test_blockchain_proof_flow(self):
        """Test the generation and storage of blockchain metadata (proof_id, tx_hash)."""
        payment = Payment.objects.create(
            loan=self.loan,
            amount=Decimal("8000.00"),
            payment_date="2026-02-01",
            payment_method="bank_transfer",
            status="confirmed"
        )
        
        # Create a mock receipt
        receipt = Receipt.objects.create(
            payment=payment,
            document_hash="3f786850e387550fdab836ed7e6dc881de23001b37dec7a7522d057790b4d49a",
            original_filename="receipt.pdf",
            file_size_bytes=42,
            mime_type="application/pdf",
            blockchain_proof_id="123e4567-e89b-12d3-a456-426614174000"
        )
        
        # Step 1: Generate/Retrieve proof endpoint
        gen_url = reverse("proof-generate", kwargs={"payment_id": payment.id})
        response = self.client.post(gen_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["proof_id"], receipt.blockchain_proof_id)
        self.assertEqual(response.data["receipt_hash"], receipt.document_hash)
        
        # Step 2: Store proof metadata after MetaMask confirms transaction
        store_url = reverse("proof-store", kwargs={"payment_id": payment.id})
        store_data = {
            "blockchain_tx_hash": "0xabc123789abcdef123456789abcdef123456789abcdef123456789abcdef1234",
            "blockchain_wallet_address": "0x1234567890123456789012345678901234567890",
            "blockchain_block_number": 15432,
            "blockchain_proof_id": "123e4567-e89b-12d3-a456-426614174000"
        }
        
        response = self.client.post(store_url, store_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
        receipt.refresh_from_db()
        self.assertTrue(receipt.is_blockchain_verified)
        self.assertEqual(receipt.blockchain_tx_hash, store_data["blockchain_tx_hash"])
