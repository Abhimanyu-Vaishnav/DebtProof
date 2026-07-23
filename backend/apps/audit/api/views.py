"""
DebtProof — Audit Log API Views
"""
from rest_framework import generics
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
