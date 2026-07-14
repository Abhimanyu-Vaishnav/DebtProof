"""
DebtProof — Abstract Base Models
All domain models inherit from these to ensure consistency.
"""
import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract base providing auto-managed created_at and updated_at timestamps.
    All production models should inherit from this.
    """

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class UUIDModel(models.Model):
    """
    Abstract base that uses UUID as primary key instead of sequential integers.
    Prevents enumeration attacks and is blockchain-friendly.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel):
    """
    Combination base model: UUID PK + timestamps.
    Most domain models should inherit from this.
    """

    class Meta(UUIDModel.Meta):
        abstract = True
        ordering = ["-created_at"]
