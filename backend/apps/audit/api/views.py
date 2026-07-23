"""
DebtProof — Audit Log API Views & CSV Export
"""
import csv
from django.http import HttpResponse
from rest_framework import generics, views
from rest_framework.permissions import IsAuthenticated
from apps.audit.models import AuditLog
from apps.audit.api.serializers import AuditLogSerializer


class AuditLogListAPIView(generics.ListAPIView):
    """GET /api/v1/audit/logs/ — List audit logs for current active organization"""
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        org = getattr(self.request, "organization", None)
        if not org:
            return AuditLog.objects.filter(user=self.request.user)
        return AuditLog.objects.filter(organization_id=org.id)


class AuditLogExportCSVAPIView(views.APIView):
    """GET /api/v1/audit/logs/export/ — Export organization audit logs as CSV"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = getattr(request, "organization", None)
        if org:
            logs = AuditLog.objects.filter(organization_id=org.id)
        else:
            logs = AuditLog.objects.filter(user=request.user)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="debtproof_audit_logs.csv"'

        writer = csv.writer(response)
        writer.writerow(["Timestamp", "Action", "Actor Email", "IP Address", "Target Resource", "Metadata"])

        for l in logs:
            writer.writerow([
                l.timestamp.isoformat(),
                l.action,
                l.user.email if l.user else "System",
                l.ip_address or "N/A",
                l.target_resource or "N/A",
                str(l.metadata),
            ])

        return response
