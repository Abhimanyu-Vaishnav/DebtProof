"""
DebtProof — Payments Admin Registration
"""
from django.contrib import admin
from apps.payments.models import Payment, Receipt


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
