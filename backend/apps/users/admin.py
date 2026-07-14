"""
DebtProof — User Admin Configuration
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin panel configuration for the custom User model."""

    ordering = ["-created_at"]
    list_display = ["email", "first_name", "last_name", "is_active", "is_staff", "created_at"]
    list_filter = ["is_active", "is_staff", "is_superuser", "is_email_verified"]
    search_fields = ["email", "first_name", "last_name"]
    readonly_fields = ["id", "created_at", "updated_at", "last_login"]

    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        (_("Personal Info"), {"fields": ("first_name", "last_name", "phone_number", "avatar", "bio")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "is_email_verified", "groups", "user_permissions")}),
        (_("Metadata"), {"fields": ("last_login", "last_login_ip", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "password1", "password2"),
        }),
    )
