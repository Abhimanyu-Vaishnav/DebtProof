from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.assets.api.views import AssetViewSet, NetWorthView

router = DefaultRouter()
router.register("assets", AssetViewSet, basename="asset")

urlpatterns = [
    path("assets/net-worth/", NetWorthView.as_view(), name="net-worth"),
    path("", include(router.urls)),
]
