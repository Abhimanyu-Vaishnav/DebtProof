"""
DebtProof — Loan Model
Production-ready model for tracking individual loans.
Blockchain fields will be added in a future sprint.
"""
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.users.models import User


class LoanType(models.TextChoices):
    """Supported loan categories."""
    HOME = "home", "Home Loan"
    PERSONAL = "personal", "Personal Loan"
    VEHICLE = "vehicle", "Vehicle Loan"
    EDUCATION = "education", "Education Loan"
    BUSINESS = "business", "Business Loan"
    CREDIT_CARD = "credit_card", "Credit Card"
    OTHER = "other", "Other"


class LoanStatus(models.TextChoices):
    """Lifecycle states of a loan."""
    ACTIVE = "active", "Active"
    CLOSED = "closed", "Closed"
    DEFAULTED = "defaulted", "Defaulted"
    ON_HOLD = "on_hold", "On Hold"


class Loan(BaseModel):
    """
    Represents a loan tracked by a user.

    Design notes:
    - Principal and outstanding use DecimalField for financial precision
    - EMI schedule stored as monthly_emi; actual payments tracked in Payment model
    - blockchain_tx_hash field reserved for future Monad integration
    """

    # ── Ownership ─────────────────────────────────────────────
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="loans",
        db_index=True,
    )

    # ── Loan Details ──────────────────────────────────────────
    name = models.CharField(max_length=200, help_text="Descriptive name, e.g. 'HDFC Home Loan'")
    loan_type = models.CharField(
        max_length=20,
        choices=LoanType.choices,
        default=LoanType.PERSONAL,
        db_index=True,
    )
    lender_name = models.CharField(max_length=200)
    account_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Loan account number from lender — stored encrypted in production",
    )

    # ── Financial ─────────────────────────────────────────────
    principal_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    outstanding_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annual interest rate as a percentage, e.g. 8.50 for 8.5%",
    )
    monthly_emi = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Equated Monthly Installment amount",
    )

    # ── Dates ─────────────────────────────────────────────────
    start_date = models.DateField()
    end_date = models.DateField()
    next_emi_date = models.DateField(null=True, blank=True)

    # ── Status ────────────────────────────────────────────────
    status = models.CharField(
        max_length=20,
        choices=LoanStatus.choices,
        default=LoanStatus.ACTIVE,
        db_index=True,
    )

    # ── Notes ─────────────────────────────────────────────────
    notes = models.TextField(blank=True)

    # ── Blockchain (Future / Escrow) ──────────────────────────
    # blockchain_tx_hash = models.CharField(max_length=66, blank=True)
    # blockchain_verified = models.BooleanField(default=False)
    
    is_escrow = models.BooleanField(
        default=False, 
        help_text="If true, this loan is managed via smart contract on Monad"
    )
    borrower_wallet = models.CharField(max_length=42, blank=True)
    lender_wallet = models.CharField(max_length=42, blank=True)
    escrow_contract_address = models.CharField(max_length=42, blank=True)

    # ── P2P Promissory Agreement ──────────────────────────────
    is_p2p_agreement = models.BooleanField(
        default=False,
        help_text="If true, this is a peer-to-peer debt agreement with a formal digital promissory note"
    )
    counterparty_name = models.CharField(max_length=200, blank=True, help_text="Name of friend/family/business partner")
    counterparty_email = models.EmailField(blank=True)
    counterparty_phone = models.CharField(max_length=20, blank=True)
    contract_status = models.CharField(
        max_length=30,
        default="active",
        choices=[
            ("draft", "Draft"),
            ("pending_signature", "Pending Counterparty Signature"),
            ("active", "Active / Binding"),
            ("settled", "Settled / Complete"),
        ]
    )
    agreement_signed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "loans"
        verbose_name = "Loan"
        verbose_name_plural = "Loans"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["user", "next_emi_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.user.email})"

    @property
    def is_active(self) -> bool:
        return self.status == LoanStatus.ACTIVE

    @property
    def paid_amount(self) -> Decimal:
        """Amount paid so far = principal - outstanding."""
        return self.principal_amount - self.outstanding_amount

    @property
    def interest_paid(self) -> Decimal:
        """Sum of interest components for all confirmed payments."""
        return self.payments.filter(status="confirmed").aggregate(total=models.Sum("interest_component"))["total"] or Decimal("0.00")

    @property
    def repayment_progress_percent(self) -> float:
        """Percentage of the loan that has been repaid."""
        if self.principal_amount == 0:
            return 0.0
        return float((self.paid_amount / self.principal_amount) * 100)
