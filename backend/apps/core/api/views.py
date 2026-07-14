"""
DebtProof — Health Check View
Returns service health status for uptime monitoring and CI/CD checks.
"""
import time
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request: Request) -> Response:
    """
    GET /api/v1/health/
    Returns the health status of all critical services.
    Used by load balancers, Kubernetes probes, and monitoring systems.
    """
    start_time = time.monotonic()
    checks: dict[str, dict] = {}

    # ── Database Check ───────────────────────────────────────
    try:
        connection.ensure_connection()
        db_latency_ms = round((time.monotonic() - start_time) * 1000, 2)
        checks["database"] = {"status": "healthy", "latency_ms": db_latency_ms}
    except Exception as exc:
        checks["database"] = {"status": "unhealthy", "error": str(exc)}

    # Determine overall status
    overall_healthy = all(
        check.get("status") == "healthy" for check in checks.values()
    )
    http_status = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return Response(
        {
            "success": overall_healthy,
            "service": "DebtProof API",
            "version": "1.0.0",
            "status": "healthy" if overall_healthy else "degraded",
            "checks": checks,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
        status=http_status,
    )
