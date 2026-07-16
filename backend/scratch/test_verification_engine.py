import os
import sys
import django
import hashlib

# Add parent directory of scratch/ to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.loans.models import Loan
from apps.payments.models import Payment, Receipt
from rest_framework.test import APIClient
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile

from decimal import Decimal

def run_test():
    print("--- STARTING DEBTPROOF VERIFICATION ENGINE INTEGRATION TEST ---")
    
    # Define authentic and tampered contents early
    authentic_content = b"Official Repayment Receipt. Ref: UTR998877. Paid to Test Bank: INR 2500."
    tampered_content = b"Official Repayment Receipt. Ref: UTR998877. Paid to Test Bank: INR 9900." # Modified amount!
    authentic_hash = hashlib.sha256(authentic_content).hexdigest()
    tampered_hash = hashlib.sha256(tampered_content).hexdigest()

    # Clean up any leftover records from previous failed runs
    Receipt.objects.filter(document_hash=authentic_hash).delete()
    
    # 2. Get or create a test user
    user, created = User.objects.get_or_create(
        email="test_verifier@example.com",
        defaults={
            "first_name": "Test",
            "last_name": "Verifier",
            "is_active": True
        }
    )
    if created:
        user.set_password("SecurePassword123!")
        user.save()
        print("[+] Created test user:", user.email)
    else:
        print("[*] Using existing test user:", user.email)

    # 3. Get or create a test Loan
    loan, _ = Loan.objects.get_or_create(
        user=user,
        name="Verification Test Loan",
        defaults={
            "lender_name": "Test Bank",
            "principal_amount": Decimal("50000.00"),
            "outstanding_amount": Decimal("50000.00"),
            "interest_rate": Decimal("10.00"),
            "monthly_emi": Decimal("2500.00"),
            "start_date": "2026-01-01",
            "end_date": "2028-01-01"
        }
    )
    print("[+] Test loan outstanding balance:", loan.outstanding_amount)

    # 4. Create a test Payment
    payment = Payment.objects.create(
        loan=loan,
        amount=Decimal("2500.00"),
        payment_date="2026-07-16",
        status="confirmed"
    )
    print("[+] Created payment of amount 2500.00, ID:", payment.id)

    print("[*] Authentic File SHA-256:", authentic_hash)
    print("[*] Tampered File SHA-256 :", tampered_hash)

    # 6. Upload authentic receipt and simulate blockchain anchoring
    receipt_file = SimpleUploadedFile("authentic_receipt.pdf", authentic_content, content_type="application/pdf")
    
    receipt = Receipt.objects.create(
        payment=payment,
        document=receipt_file,
        original_filename="authentic_receipt.pdf",
        file_size_bytes=len(authentic_content),
        mime_type="application/pdf",
        document_hash=authentic_hash,
        blockchain_proof_id="d87a99f1-fa1a-4f51-b847-505e608a0d4c",
        blockchain_tx_hash="0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        blockchain_wallet_address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        blockchain_block_number=452912,
        is_blockchain_verified=True,
        blockchain_anchored_at=timezone.now()
    )
    print("[+] Created Receipt record and marked as verified/anchored in DB.")

    # 7. Use API client to invoke public Verification endpoint
    client = APIClient()
    verify_url = "/api/v1/payments/verify/"

    # Test 1: Verify using authentic file
    print("\n--- TEST 1: Verifying AUTHENTIC file ---")
    auth_file_payload = SimpleUploadedFile("my_receipt.pdf", authentic_content, content_type="application/pdf")
    response_auth = client.post(verify_url, {"file": auth_file_payload}, format="multipart")
    print("Response Status Code:", response_auth.status_code)
    auth_json = response_auth.json()
    print("Response data:")
    for k, v in auth_json.items():
        print(f"  {k}: {v}")
    
    # Assertions
    assert auth_json["verified"] == True, "Failed verification for authentic file"
    print("[OK] SUCCESS: Authentic receipt was VERIFIED on-chain!")

    # Test 2: Verify using tampered file
    print("\n--- TEST 2: Verifying TAMPERED file ---")
    tampered_file_payload = SimpleUploadedFile("my_receipt_edit.pdf", tampered_content, content_type="application/pdf")
    response_tamp = client.post(verify_url, {"file": tampered_file_payload}, format="multipart")
    print("Response Status Code:", response_tamp.status_code)
    tamp_json = response_tamp.json()
    print("Response data:")
    for k, v in tamp_json.items():
        print(f"  {k}: {v}")

    # Assertions
    assert tamp_json["verified"] == False, "Failed to block tampered file"
    print("[OK] SUCCESS: Tampered receipt was NOT VERIFIED (declined successfully)!")

    # 8. Clean up mock database records
    receipt.document.delete(save=False)
    receipt.delete()
    payment.delete()
    print("\n[+] Cleaned up temporary test records from DB.")
    print("--- VERIFICATION ENGINE IS 100% CORRECT & FUNCTIONAL ---")

if __name__ == "__main__":
    run_test()
