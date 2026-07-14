"""
DebtProof — Custom DRF Exception Handler
Returns consistent JSON error responses across the entire API.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """
    Wraps DRF's default exception handler to return a standardized
    error envelope:
        {
            "success": false,
            "error": { "code": "...", "message": "...", "details": {...} }
        }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "success": False,
            "error": {
                "code": _resolve_error_code(response.status_code),
                "message": _extract_message(response.data),
                "details": response.data,
            },
        }
        response.data = error_data
    else:
        # Unhandled exceptions — log and return 500
        logger.exception("Unhandled exception in view: %s", exc)
        response = Response(
            {
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred. Please try again later.",
                    "details": {},
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _resolve_error_code(status_code: int) -> str:
    """Map HTTP status codes to human-readable error codes."""
    mapping = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "UNPROCESSABLE_ENTITY",
        429: "TOO_MANY_REQUESTS",
        500: "INTERNAL_SERVER_ERROR",
    }
    return mapping.get(status_code, "ERROR")


def _extract_message(data: dict | list | str) -> str:
    """Extract a user-facing message from DRF's error data."""
    if isinstance(data, dict):
        # Prioritize common keys
        for key in ("detail", "message", "non_field_errors"):
            if key in data:
                value = data[key]
                if isinstance(value, list):
                    return str(value[0])
                return str(value)
        # Fall back to first value
        first_value = next(iter(data.values()), "An error occurred")
        if isinstance(first_value, list):
            return str(first_value[0])
        return str(first_value)
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data) if data else "An error occurred"
