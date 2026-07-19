import uuid
from django.db import models
from django.conf import settings

class AssetClass(models.TextChoices):
    CURRENT = "current", "Current Asset"
    FIXED = "fixed", "Fixed Asset"

class AssetType(models.TextChoices):
    CASH = "cash", "Cash"
    BANK = "bank", "Bank Account"
    FD = "fd", "Fixed Deposit (FD)"
    RD = "rd", "Recurring Deposit (RD)"
    INVESTMENT = "investment", "Investment"
    RECEIVABLE = "receivable", "Receivable / Money Due"
    REAL_ESTATE = "real_estate", "Real Estate"
    GOLD = "gold", "Gold"
    BUSINESS = "business", "Business Equity"
    VEHICLE = "vehicle", "Vehicle"
    OTHER = "other", "Other"

class Asset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assets"
    )
    name = models.CharField(max_length=100)
    asset_type = models.CharField(
        max_length=20,
        choices=AssetType.choices,
        default=AssetType.CASH
    )
    asset_class = models.CharField(
        max_length=10,
        choices=AssetClass.choices,
        default=AssetClass.CURRENT
    )
    value = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        # Automatically assign asset class based on type
        current_types = [
            AssetType.CASH,
            AssetType.BANK,
            AssetType.FD,
            AssetType.RD,
            AssetType.RECEIVABLE,
            AssetType.INVESTMENT
        ]
        if self.asset_type in current_types:
            self.asset_class = AssetClass.CURRENT
        else:
            self.asset_class = AssetClass.FIXED
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_asset_type_display()}) - {self.value}"


class LiabilityClass(models.TextChoices):
    SHORT_TERM = "short_term", "Short-term Liability"
    LONG_TERM = "long_term", "Long-term Liability"

class LiabilityType(models.TextChoices):
    BILL = "bill", "Unpaid Bill"
    RENT = "rent", "Rent Due"
    TAX = "tax", "Tax Due"
    PERSONAL_DEBT = "personal_debt", "Personal Debt"
    OTHER = "other", "Other Liability"

class Liability(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="custom_liabilities"
    )
    name = models.CharField(max_length=100)
    liability_type = models.CharField(
        max_length=20,
        choices=LiabilityType.choices,
        default=LiabilityType.BILL
    )
    liability_class = models.CharField(
        max_length=15,
        choices=LiabilityClass.choices,
        default=LiabilityClass.SHORT_TERM
    )
    value = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Liabilities"

    def save(self, *args, **kwargs):
        # Automatically assign liability class based on type
        long_term_types = [LiabilityType.PERSONAL_DEBT]
        if self.liability_type in long_term_types:
            self.liability_class = LiabilityClass.LONG_TERM
        else:
            self.liability_class = LiabilityClass.SHORT_TERM
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_liability_type_display()}) - {self.value}"
