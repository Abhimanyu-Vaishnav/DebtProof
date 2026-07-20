"""
DebtProof — Credit Card API Router Configuration
"""
from rest_framework.routers import SimpleRouter
from .views import CreditCardViewSet, CreditCardPaymentViewSet

router = SimpleRouter()
router.register(r"payments", CreditCardPaymentViewSet, basename="credit-card-payment")
router.register(r"", CreditCardViewSet, basename="credit-card")

urlpatterns = router.urls

