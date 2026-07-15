"""
DebtProof — Loan Admin Registration
"""
from django.contrib import admin
from apps.loans.models import Loan


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "loan_type", "status", "principal_amount", "outstanding_amount", "next_emi_date", "created_at"]
    list_filter = ["status", "loan_type"]
    search_fields = ["name", "lender_name", "user__email"]
    raw_id_fields = ["user"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]
