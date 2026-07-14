"""
DebtProof — Payment and Receipt Models
Core financial models. Receipt stores document metadata + cryptographic hash
which will later be anchored on Monad Blockchain.
"""
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.loans.models import Loan
from apps.users.models import User


def _receipt_upload_path(instance: "Receipt", filename: str) -> str:
    """Dynamic upload path: receipts/<user_id>/<loan_id>/<filename>"""
    return f"receipts/{instance.payment.loan.user_id}/{instance.payment.loan_id}/{filename}"


class PaymentMethod(models.TextChoices):
    """Supported payment methods."""
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    UPI = "upi", "UPI"
    NEFT = "neft", "NEFT"
    RTGS = "rtgs", "RTGS"
    CHEQUE = "cheque", "Cheque"
    AUTO_DEBIT = "auto_debit", "Auto Debit"
    CASH = "cash", "Cash"
    OTHER = "other", "Other"


class PaymentStatus(models.TextChoices):
    """Payment lifecycle statuses."""
    PENDING = "pending", "Pending"
    CONFIRMED = "confirmed", "Confirmed"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


class Payment(BaseModel):
    """
    Records an individual loan repayment.

    Linked 1:1 with a Receipt which stores the document hash.
    The hash will be anchored on Monad Testnet in a future sprint.
    """

    # ── Relationships ─────────────────────────────────────────
    loan = models.ForeignKey(
        Loan,
        on_delete=models.PROTECT,  # Never delete a loan with payments
        related_name="payments",
        db_index=True,
    )

    # ── Financial ─────────────────────────────────────────────
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    payment_date = models.DateField(db_index=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.BANK_TRANSFER,
    )
    reference_number = models.CharField(
        max_length=200,
        blank=True,
        help_text="Bank reference / UTR / transaction ID",
    )

    # ── Status ────────────────────────────────────────────────
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.CONFIRMED,
        db_index=True,
    )

    # ── Breakdown ─────────────────────────────────────────────
    principal_component = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Portion of EMI that reduces principal",
    )
    interest_component = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Portion of EMI that covers interest",
    )

    # ── Notes ─────────────────────────────────────────────────
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "payments"
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-payment_date", "-created_at"]
        indexes = [
            models.Index(fields=["loan", "payment_date"]),
            models.Index(fields=["loan", "status"]),
        ]

    def __str__(self) -> str:
        return f"Payment ₹{self.amount} for {self.loan.name} on {self.payment_date}"


class Receipt(BaseModel):
    """
    Stores the cryptographic hash of a payment receipt document.

    Design rationale:
    - The actual PDF/image is stored in Django media storage (private)
    - Only the SHA-256 hash will be stored on the blockchain
    - This preserves user privacy while enabling trustless verification
    - document_hash is the field that gets anchored on Monad Testnet (Day 2+)
    """

    # ── Relationship ──────────────────────────────────────────
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name="receipt",
    )

    # ── Document Storage ──────────────────────────────────────
    document = models.FileField(
        upload_to=_receipt_upload_path,
        help_text="The original receipt document (PDF/image)",
    )
    original_filename = models.CharField(max_length=255)
    file_size_bytes = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100)

    # ── Cryptographic Hash ────────────────────────────────────
    document_hash = models.CharField(
        max_length=64,  # SHA-256 produces 64 hex characters
        unique=True,
        db_index=True,
        help_text="SHA-256 hash of the receipt document. This is what gets anchored on blockchain.",
    )
    hash_algorithm = models.CharField(
        max_length=20,
        default="sha256",
        help_text="Algorithm used to generate document_hash",
    )

    # ── Blockchain (Future — Day 2+) ──────────────────────────
    # blockchain_tx_hash = models.CharField(max_length=66, blank=True)
    # blockchain_block_number = models.PositiveBigIntegerField(null=True)
    # blockchain_network = models.CharField(max_length=50, default="monad-testnet")
    # blockchain_anchored_at = models.DateTimeField(null=True)
    # is_blockchain_verified = models.BooleanField(default=False)

    class Meta:
        db_table = "receipts"
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Receipt for {self.payment} — Hash: {self.document_hash[:16]}..."


class AuditLog(BaseModel):
    """
    Immutable audit trail of all significant events in the system.
    Used for compliance, debugging, and security monitoring.
    """

    # ── Actor ─────────────────────────────────────────────────
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs",
        db_index=True,
    )

    # ── Event ─────────────────────────────────────────────────
    action = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Machine-readable action name, e.g. 'user.registered', 'payment.created'",
    )
    resource_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="The type of resource affected, e.g. 'Loan', 'Payment'",
    )
    resource_id = models.CharField(
        max_length=36,
        blank=True,
        help_text="UUID of the affected resource",
    )

    # ── Context ───────────────────────────────────────────────
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional structured context for the event",
    )

    # ── Integrity ─────────────────────────────────────────────
    # AuditLog records should never be updated after creation
    # Enforced at the model level: no update() methods should be called

    class Meta:
        db_table = "audit_logs"
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "action"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"[{self.created_at}] {self.action} by {self.user}"
