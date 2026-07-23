"""
DebtProof — Audit Logger Service
Helper for recording audit events from views, middleware, and signals.
"""
import logging
from typing import Any
from django.http import HttpRequest
from apps.audit.models import AuditLog, AuditAction
from apps.users.models import User

logger = logging.getLogger(__name__)


class AuditLogger:
    """Centralized service for writing immutable audit logs."""

    @staticmethod
    def log(
        action: str,
        user: User | None = None,
        organization_id: Any = None,
        workspace_id: Any = None,
        target_resource: str = "",
        request: HttpRequest | None = None,
        metadata: dict | None = None,
    ) -> AuditLog | None:
        try:
            ip_address = None
            user_agent = ""

            if request:
                ip_address = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR"))
                if ip_address and "," in ip_address:
                    ip_address = ip_address.split(",")[0].strip()
                user_agent = request.META.get("HTTP_USER_AGENT", "")
                if not user and hasattr(request, "user") and request.user.is_authenticated:
                    user = request.user

            log_entry = AuditLog.objects.create(
                user=user,
                organization_id=organization_id,
                workspace_id=workspace_id,
                action=action,
                target_resource=target_resource,
                ip_address=ip_address,
                user_agent=user_agent[:500] if user_agent else "",
                metadata_json=metadata or {},
            )
            return log_entry
        except Exception as e:
            logger.error("Failed to record audit log: %s", str(e))
            return None
