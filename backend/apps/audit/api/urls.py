"""
DebtProof — Audit Log API URLs
"""
from django.urls import path
from apps.audit.api.views import AuditLogListAPIView, AuditLogExportCSVAPIView

urlpatterns = [
    path("logs/", AuditLogListAPIView.as_view(), name="audit-log-list"),
    path("logs/export/", AuditLogExportCSVAPIView.as_view(), name="audit-log-export"),
]
