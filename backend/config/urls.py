"""
DebtProof — Root URL Configuration
All API routes are versioned under /api/v1/.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/", include("apps.core.api.urls")),
    path("api/v1/auth/", include("apps.users.api.urls")),
]

# Serve media files in development only
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
