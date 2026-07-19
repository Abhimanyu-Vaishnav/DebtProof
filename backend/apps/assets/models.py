import uuid
from django.db import models
from django.conf import settings

class AssetType(models.TextChoices):
    CASH = "cash", "Cash"
    BANK = "bank", "Bank Account"
    INVESTMENT = "investment", "Investment"
    REAL_ESTATE = "real_estate", "Real Estate"
    GOLD = "gold", "Gold"
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
    value = models.DecimalField(max_length=15, max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_asset_type_display()}) - {self.value}"
