"""
DebtProof — Multi-Tenant SaaS Models
Organizations, Workspaces, RBAC Roles, Invitations, Feature Flags,
Subscription Plans, Usage Tracking, Invoices, Transactions, and Settings.
"""
from decimal import Decimal
import uuid
from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel
from apps.users.models import User


# ── 1. ROLES & TYPES ──────────────────────────────────────────
class TenantRole(models.TextChoices):
    """5-Tier Role-Based Access Control."""
    OWNER = "owner", "Owner"
    ADMIN = "admin", "Admin"
    MANAGER = "manager", "Manager"
    MEMBER = "member", "Member"
    VIEWER = "viewer", "Viewer"


class WorkspaceType(models.TextChoices):
    """Supported workspace categorizations."""
    PERSONAL = "personal", "Personal"
    FAMILY = "family", "Family"
    BUSINESS = "business", "Business"
    INVESTMENT = "investment", "Investment"
    RENTAL = "rental", "Rental Property"
    STARTUP = "startup", "Startup"


class InvitationStatus(models.TextChoices):
    """Email invitation lifecycle statuses."""
    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    REJECTED = "rejected", "Rejected"
    EXPIRED = "expired", "Expired"
    CANCELED = "canceled", "Canceled"


class SubscriptionPlanCode(models.TextChoices):
    """Subscription tiers."""
    FREE = "free", "Free"
    BASIC = "basic", "Basic"
    PREMIUM = "premium", "Premium"
    BUSINESS = "business", "Business"
    ENTERPRISE = "enterprise", "Enterprise"


class SubscriptionStatus(models.TextChoices):
    """Subscription lifecycle statuses."""
    ACTIVE = "active", "Active"
    TRIALING = "trialing", "Trialing"
    PAST_DUE = "past_due", "Past Due"
    CANCELED = "canceled", "Canceled"


class InvoiceStatus(models.TextChoices):
    """Invoice payment statuses."""
    DRAFT = "draft", "Draft"
    OPEN = "open", "Open"
    PAID = "paid", "Paid"
    UNCOLLECTIBLE = "uncollectible", "Uncollectible"
    VOID = "void", "Void"


# ── 2. ORGANIZATIONS & WORKSPACES ──────────────────────────────
class Organization(BaseModel):
    """
    Primary SaaS Tenant Boundary.
    One user may own/belong to multiple Organizations.
    """

    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_organizations",
        db_index=True,
    )
    logo = models.ImageField(upload_to="org_logos/", null=True, blank=True)
    timezone = models.CharField(max_length=50, default="UTC")
    currency = models.CharField(max_length=10, default="INR")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "organizations"
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.slug})"


class OrganizationMember(BaseModel):
    """Associates Users with Organizations and assigns RBAC Roles."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="memberships",
        db_index=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
        db_index=True,
    )
    role = models.CharField(
        max_length=20,
        choices=TenantRole.choices,
        default=TenantRole.MEMBER,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=[("active", "Active"), ("suspended", "Suspended")],
        default="active",
        db_index=True,
    )
    last_login_at = models.DateTimeField(null=True, blank=True)
    assigned_workspaces = models.ManyToManyField("Workspace", blank=True, related_name="assigned_members")

    class Meta:
        db_table = "organization_members"
        verbose_name = "Organization Member"
        verbose_name_plural = "Organization Members"
        unique_together = ("organization", "user")

    def __str__(self) -> str:
        return f"{self.user.email} - {self.organization.name} [{self.get_role_display()}]"


class Workspace(BaseModel):
    """
    Sub-tenant partition within an Organization.
    (Personal, Family, Business, Investment, Rental Property, Startup).
    """

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="workspaces",
        db_index=True,
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220)
    workspace_type = models.CharField(
        max_length=30,
        choices=WorkspaceType.choices,
        default=WorkspaceType.PERSONAL,
    )
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_workspaces",
    )

    class Meta:
        db_table = "workspaces"
        verbose_name = "Workspace"
        verbose_name_plural = "Workspaces"
        unique_together = ("organization", "slug")

    def __str__(self) -> str:
        return f"{self.organization.name} / {self.name}"


class WorkspaceMember(BaseModel):
    """Workspace-level permission assignments."""

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="memberships",
        db_index=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="workspace_memberships",
        db_index=True,
    )
    role = models.CharField(
        max_length=20,
        choices=TenantRole.choices,
        default=TenantRole.MEMBER,
    )

    class Meta:
        db_table = "workspace_members"
        verbose_name = "Workspace Member"
        verbose_name_plural = "Workspace Members"
        unique_together = ("workspace", "user")


# ── 3. INVITATIONS ─────────────────────────────────────────────
class OrganizationInvitation(BaseModel):
    """Email invitation token for onboarding team members into an Organization."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invitations",
    )
    email = models.EmailField(db_index=True)
    role = models.CharField(
        max_length=20,
        choices=TenantRole.choices,
        default=TenantRole.MEMBER,
    )
    invited_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_invitations",
    )
    token = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    status = models.CharField(
        max_length=20,
        choices=InvitationStatus.choices,
        default=InvitationStatus.PENDING,
        db_index=True,
    )
    expires_at = models.DateTimeField()
    canceled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "organization_invitations"
        verbose_name = "Organization Invitation"
        verbose_name_plural = "Organization Invitations"
        ordering = ["-created_at"]

    def is_valid(self) -> bool:
        return self.status == InvitationStatus.PENDING and self.expires_at > timezone.now()


# ── 4. FEATURE FLAGS ────────────────────────────────────────────
class FeatureFlag(BaseModel):
    """Global SaaS feature flag definition."""

    key = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    default_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "feature_flags"
        verbose_name = "Feature Flag"
        verbose_name_plural = "Feature Flags"

    def __str__(self) -> str:
        return f"{self.name} ({self.key})"


class OrganizationFeatureFlag(BaseModel):
    """Organization-level Feature Flag toggle override."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="feature_flags",
    )
    feature_flag = models.ForeignKey(
        FeatureFlag,
        on_delete=models.CASCADE,
        related_name="org_overrides",
    )
    is_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "org_feature_flags"
        unique_together = ("organization", "feature_flag")


# ── 5. SUBSCRIPTION PLANS & USAGE LIMITS ────────────────────────
class Plan(BaseModel):
    """SaaS Subscription Tier defining quotas and capabilities."""

    code = models.CharField(
        max_length=20,
        choices=SubscriptionPlanCode.choices,
        unique=True,
        db_index=True,
    )
    name = models.CharField(max_length=100)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    # Badges & Visibility
    is_recommended = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    savings_badge = models.CharField(max_length=100, blank=True)

    # Quotas & Limits
    max_loans = models.IntegerField(default=5, help_text="-1 for unlimited")
    max_storage_bytes = models.BigIntegerField(default=104857600)  # 100 MB default
    max_reports = models.IntegerField(default=10)
    max_ai_requests = models.IntegerField(default=20)
    max_blockchain_proofs = models.IntegerField(default=5)
    max_team_members = models.IntegerField(default=1)
    workspace_limit = models.IntegerField(default=1)

    # Feature Toggles
    allow_api_access = models.BooleanField(default=False)
    has_priority_support = models.BooleanField(default=False)
    has_custom_branding = models.BooleanField(default=False)
    features_json = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "plans"
        verbose_name = "Subscription Plan"
        verbose_name_plural = "Subscription Plans"

    def __str__(self) -> str:
        return f"{self.name} Plan"


class OrganizationSubscription(BaseModel):
    """Active subscription status for an Organization."""

    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
        db_index=True,
    )
    current_period_start = models.DateTimeField(default=timezone.now)
    current_period_end = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)

    class Meta:
        db_table = "organization_subscriptions"
        verbose_name = "Organization Subscription"
        verbose_name_plural = "Organization Subscriptions"


class UsageTracker(BaseModel):
    """Real-time tracking of resource usage per Organization."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="usage_records",
        db_index=True,
    )
    metric = models.CharField(
        max_length=50,
        choices=[
            ("loans", "Loans"),
            ("reports", "Reports Generated"),
            ("uploads", "Receipt Uploads"),
            ("ai_requests", "AI Requests"),
            ("storage_bytes", "Storage Bytes Used"),
            ("marketplace_listings", "Marketplace Listings"),
            ("blockchain_proofs", "Blockchain Proofs Anchored"),
        ],
        db_index=True,
    )
    current_value = models.BigIntegerField(default=0)
    reset_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "usage_trackers"
        unique_together = ("organization", "metric")


# ── 6. BILLING ARCHITECTURE ────────────────────────────────────
class Invoice(BaseModel):
    """Billing Invoice record."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    subscription = models.ForeignKey(
        OrganizationSubscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    invoice_number = models.CharField(max_length=100, unique=True, db_index=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.PAID,
        db_index=True,
    )
    billing_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField()
    items_json = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "invoices"
        ordering = ["-billing_date"]


class BillingTransaction(BaseModel):
    """Financial ledger for billing activities."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=[("payment", "Payment"), ("refund", "Refund"), ("credit", "Credit")],
        default="payment",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default="card")
    reference_id = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, default="succeeded")
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "billing_transactions"
        ordering = ["-timestamp"]


# ── 7. TENANT SETTINGS ──────────────────────────────────────────
class OrganizationSetting(BaseModel):
    """Organization-level key-value settings."""

    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name="settings",
    )
    require_2fa = models.BooleanField(default=False)
    allowed_email_domains = models.CharField(max_length=500, blank=True, help_text="Comma-separated domains for auto-join")
    notify_on_new_member = models.BooleanField(default=True)
    notify_on_payment = models.BooleanField(default=True)
    custom_branding_json = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "organization_settings"
