"""
DebtProof — Custom User Model
Replaces Django's default User with email-as-username and extended profile fields.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from apps.core.models import BaseModel


class UserManager(BaseUserManager):
    """Custom manager for the email-based User model."""

    def create_user(
        self,
        email: str,
        password: str | None = None,
        **extra_fields,
    ) -> "User":
        if not email:
            raise ValueError("The Email field is required.")
        email = self.normalize_email(email)
        user: User = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields) -> "User":
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


def _avatar_upload_path(instance: "User", filename: str) -> str:
    """Dynamic upload path: avatars/<user_id>/<filename>"""
    return f"avatars/{instance.id}/{filename}"


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    """
    Production-ready custom User model.

    Key design decisions:
    - Email is the unique identifier (no username)
    - UUID primary key for security
    - Inherits from BaseModel for consistent timestamps
    - Avatar stored locally; future: IPFS or S3
    """

    # ── Identity ──────────────────────────────────────────────
    email = models.EmailField(unique=True, db_index=True, max_length=255)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)

    # ── Profile ───────────────────────────────────────────────
    phone_number = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(
        upload_to=_avatar_upload_path,
        null=True,
        blank=True,
    )
    bio = models.TextField(max_length=500, blank=True)

    # ── Status Flags ──────────────────────────────────────────
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    # ── Metadata ──────────────────────────────────────────────
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        """Returns the user's full name or email if name is not set."""
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.email

    @property
    def avatar_url(self) -> str | None:
        """Returns the avatar URL or None."""
        return self.avatar.url if self.avatar else None
