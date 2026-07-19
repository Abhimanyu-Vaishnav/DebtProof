from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.assets.api.views import AssetViewSet, LiabilityViewSet, NetWorthView

router = DefaultRouter()
router.register("assets", AssetViewSet, basename="asset")
router.register("liabilities", LiabilityViewSet, basename="liability")

urlpatterns = [
    path("assets/net-worth/", NetWorthView.as_view(), name="net-worth"),
    path("", include(router.urls)),
]
