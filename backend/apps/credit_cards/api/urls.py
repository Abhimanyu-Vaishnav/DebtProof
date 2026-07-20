"""
DebtProof — Credit Card API Router Configuration
"""
from rest_framework.routers import SimpleRouter
from .views import CreditCardViewSet

router = SimpleRouter()
router.register(r"", CreditCardViewSet, basename="credit-card")

urlpatterns = router.urls
