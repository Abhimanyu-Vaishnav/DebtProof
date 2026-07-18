"""
DebtProof — Root URL Configuration
All API routes are versioned under /api/v1/.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "active",
        "message": "Welcome to the DebtProof API platform",
        "version": "v1"
    })

urlpatterns = [
    # API Root Welcome
    path("", api_root),

    # Django Admin
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/", include("apps.core.api.urls")),
    path("api/v1/auth/", include("apps.users.api.urls")),
    path("api/v1/loans/", include("apps.loans.api.urls")),
    path("api/v1/loans/<uuid:loan_id>/payments/", include("apps.payments.api.loan_payment_urls")),
    path("api/v1/payments/", include("apps.payments.api.urls")),
]

# Serve media files in development only
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

