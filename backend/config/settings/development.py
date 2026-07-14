"""
DebtProof — Development Settings
Extends base settings with development-specific overrides.
"""
from .base import *  # noqa: F401, F403

DEBUG = True

# Allow all hosts in development
ALLOWED_HOSTS = ["*"]

# Disable HTTPS redirects in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Use SQLite for local development if PostgreSQL isn't configured
# To use PostgreSQL, update your .env with proper DB_* values.

# Django Debug Toolbar (optional — install separately if needed)
# INSTALLED_APPS += ["debug_toolbar"]
# MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

# More verbose logging in development
LOGGING["root"]["level"] = "DEBUG"  # type: ignore[name-defined] # noqa: F405
