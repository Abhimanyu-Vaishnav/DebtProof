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


# ── Staff Profile ──────────────────────────────────────────────────────────────

class StaffRole(models.TextChoices):
    SUPER_ADMIN = "SuperAdmin", "Super Admin"
    ADMIN_MANAGER = "AdminManager", "Admin Manager"
    CUSTOMER_SUPPORT = "CustomerSupport", "Customer Support"
    BILLING_FINANCE = "BillingFinance", "Billing & Finance"
    RISK_AUDITOR = "RiskAuditor", "Risk Auditor"
    WEB3_GOVERNOR = "Web3Governor", "Web3 Governor"


class StaffProfile(BaseModel):
    """
    Extended profile for staff/admin members.
    Linked to an existing User account. Admin promotes users to staff.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="staff_profile",
        db_index=True,
    )
    role = models.CharField(max_length=30, choices=StaffRole.choices, default=StaffRole.CUSTOMER_SUPPORT)
    department = models.CharField(max_length=100, blank=True, default="Support")
    queries_resolved = models.PositiveIntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "staff_profiles"
        verbose_name = "Staff Profile"
        verbose_name_plural = "Staff Profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} — {self.role}"


# ── Support Tickets ────────────────────────────────────────────────────────────

class TicketPriority(models.TextChoices):
    URGENT = "urgent", "Urgent"
    HIGH = "high", "High"
    NORMAL = "normal", "Normal"
    LOW = "low", "Low"


class TicketStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In Progress"
    ESCALATED = "escalated", "Escalated"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"


class SupportTicket(BaseModel):
    """
    Customer support ticket raised by a user or filed by admin on behalf of a user.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
        db_index=True,
    )
    subject = models.CharField(max_length=300)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=TicketPriority.choices, default=TicketPriority.NORMAL, db_index=True)
    status = models.CharField(max_length=15, choices=TicketStatus.choices, default=TicketStatus.OPEN, db_index=True)
    assigned_to = models.ForeignKey(
        StaffProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
    )
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    filed_by_admin = models.BooleanField(default=False, help_text="True if admin created this ticket on behalf of user")

    class Meta:
        db_table = "support_tickets"
        verbose_name = "Support Ticket"
        verbose_name_plural = "Support Tickets"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        user_str = self.user.email if self.user else "Unknown"
        return f"[{self.priority.upper()}] {self.subject} — {user_str}"
