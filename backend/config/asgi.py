"""
DebtProof — ASGI entry point (for async support / WebSocket future).
"""
import os
import sys
from pathlib import Path
from django.core.asgi import get_asgi_application

# Add the backend directory to Python path for Vercel
sys.path.append(str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
application = get_asgi_application()
app = application

# Run migrations programmatically on Vercel startup
if os.environ.get("VERCEL") == "1":
    try:
        from django.core.management import call_command
        call_command("migrate", interactive=False)
    except Exception as e:
        import logging
        logging.error(f"Failed to run programmatic migrations: {e}")


