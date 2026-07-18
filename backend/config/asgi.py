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

