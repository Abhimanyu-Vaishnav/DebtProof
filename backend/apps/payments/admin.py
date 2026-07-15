"""
DebtProof — Payments Admin Registration
"""
from django.contrib import admin
from apps.payments.models import Payment, Receipt, AuditLog


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["loan", "amount", "payment_date", "payment_method", "status", "created_at"]
    list_filter = ["status", "payment_method"]
    search_fields = ["loan__name", "reference_number", "loan__user__email"]
    raw_id_fields = ["loan"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-payment_date"]


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ["payment", "original_filename", "file_size_bytes", "document_hash", "created_at"]
    search_fields = ["document_hash", "original_filename"]
    readonly_fields = ["document_hash", "hash_algorithm", "created_at", "updated_at"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "user", "resource_type", "resource_id", "created_at"]
    list_filter = ["action", "resource_type"]
    search_fields = ["action", "user__email"]
    readonly_fields = ["created_at", "updated_at"]
