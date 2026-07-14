"""
DebtProof — Production Settings
Extends base settings with hardened production overrides.
"""
from .base import *  # noqa: F401, F403
from decouple import config

DEBUG = False

# ── Security Hardening ───────────────────────────────────────
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"

# ── Stricter Throttle in Production ─────────────────────────
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {  # type: ignore[name-defined] # noqa: F405
    "anon": "20/minute",
    "user": "100/minute",
    "auth": "5/minute",
}

# ── File Logging in Production ───────────────────────────────
LOGGING["handlers"]["file"]["level"] = "WARNING"  # type: ignore[name-defined] # noqa: F405
LOGGING["root"]["level"] = "WARNING"  # type: ignore[name-defined] # noqa: F405
