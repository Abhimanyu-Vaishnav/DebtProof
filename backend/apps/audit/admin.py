"""
DebtProof — Audit Log Admin Registration
"""
from django.contrib import admin
from apps.audit.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "user", "target_resource", "organization_id", "created_at"]
    list_filter = ["action"]
    search_fields = ["action", "user__email", "target_resource"]
    readonly_fields = ["created_at", "updated_at"]
