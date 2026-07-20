"""
DebtProof — Credit Card Model
Model tracking limits, balances, rates and cycles.
"""
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel
from apps.users.models import User


class CreditCardStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    FROZEN = "frozen", "Frozen"
    CLOSED = "closed", "Closed"


class CreditCard(BaseModel):
    """
    Tracks credit card details, credit limits, outstandings and statement cycles.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="credit_cards",
        db_index=True,
    )
    card_name = models.CharField(max_length=150, help_text="e.g. Regalia, Amazon Pay")
    bank_name = models.CharField(max_length=150, help_text="e.g. HDFC Bank, ICICI Bank")
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    current_outstanding = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annualized interest rate % (APR), e.g. 42.00",
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    minimum_due = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    statement_date = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text="Day of the month when statement is generated",
    )
    due_date = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text="Day of the month when payment is due",
    )
    status = models.CharField(
        max_length=20,
        choices=CreditCardStatus.choices,
        default=CreditCardStatus.ACTIVE,
        db_index=True,
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "credit_cards"
        verbose_name = "Credit Card"
        verbose_name_plural = "Credit Cards"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.card_name} - {self.bank_name} ({self.user.email})"

    @property
    def utilization_rate(self) -> float:
        if self.credit_limit == 0:
            return 0.0
        return float((self.current_outstanding / self.credit_limit) * 100)

    @property
    def available_limit(self) -> Decimal:
        return self.credit_limit - self.current_outstanding


class CreditCardPayment(BaseModel):
    """
    Tracks payment history for credit cards.
    """
    card = models.ForeignKey(
        CreditCard,
        on_delete=models.CASCADE,
        related_name="payments",
        db_index=True,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    payment_date = models.DateField(db_index=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices if 'PaymentMethod' in globals() else [
            ("bank_transfer", "Bank Transfer"),
            ("upi", "UPI"),
            ("neft", "NEFT"),
            ("rtgs", "RTGS"),
            ("cheque", "Cheque"),
            ("auto_debit", "Auto Debit"),
            ("cash", "Cash"),
            ("other", "Other"),
        ],
        default="bank_transfer",
    )
    reference_number = models.CharField(
        max_length=200,
        blank=True,
        help_text="Reference/UTR number",
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "credit_card_payments"
        verbose_name = "Credit Card Payment"
        verbose_name_plural = "Credit Card Payments"
        ordering = ["-payment_date", "-created_at"]

    def __str__(self) -> str:
        return f"Payment ₹{self.amount} for {self.card.card_name} on {self.payment_date}"

