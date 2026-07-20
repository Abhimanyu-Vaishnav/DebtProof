from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from apps.assets.models import Asset, AssetType, AssetClass, Liability, LiabilityType, LiabilityClass
from apps.assets.api.serializers import AssetSerializer, LiabilitySerializer
from apps.loans.models import Loan, LoanStatus
from apps.credit_cards.models import CreditCard, CreditCardStatus


class AssetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AssetSerializer

    def get_queryset(self):
        return Asset.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LiabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LiabilitySerializer

    def get_queryset(self):
        return Liability.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NetWorthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Assets calculations
        assets = Asset.objects.filter(user=user)
        total_assets = float(assets.aggregate(total=Sum("value"))["total"] or 0)
        current_assets = float(assets.filter(asset_class=AssetClass.CURRENT).aggregate(total=Sum("value"))["total"] or 0)
        fixed_assets = float(assets.filter(asset_class=AssetClass.FIXED).aggregate(total=Sum("value"))["total"] or 0)

        # 2. Liabilities calculations
        # 2a. Custom liabilities
        custom_liabs = Liability.objects.filter(user=user)
        custom_total = float(custom_liabs.aggregate(total=Sum("value"))["total"] or 0)
        short_term_liabs = float(custom_liabs.filter(liability_class=LiabilityClass.SHORT_TERM).aggregate(total=Sum("value"))["total"] or 0)
        long_term_custom_liabs = float(custom_liabs.filter(liability_class=LiabilityClass.LONG_TERM).aggregate(total=Sum("value"))["total"] or 0)

        # 2b. Loans (treated as Long-term liabilities)
        loans_agg = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).aggregate(total=Sum("outstanding_amount"))
        total_loans_debt = float(loans_agg["total"] or 0)

        # 2c. Credit Cards (treated as Short-term liabilities — active cards only)
        cc_agg = CreditCard.objects.filter(user=user, status=CreditCardStatus.ACTIVE).aggregate(total=Sum("current_outstanding"))
        total_cc_debt = float(cc_agg["total"] or 0)

        # 2d. Combined liabilities
        total_liabilities = custom_total + total_loans_debt + total_cc_debt
        short_term_liabs_combined = short_term_liabs + total_cc_debt
        long_term_liabilities = long_term_custom_liabs + total_loans_debt

        # 3. Net Worth
        net_worth = total_assets - total_liabilities

        # 4. Asset Type Distribution
        asset_distribution = []
        for type_code, type_label in AssetType.choices:
            type_assets = assets.filter(asset_type=type_code)
            type_value = float(type_assets.aggregate(total=Sum("value"))["total"] or 0)
            if type_value > 0:
                asset_distribution.append({
                    "asset_type": type_code,
                    "label": type_label,
                    "value": type_value,
                    "count": type_assets.count()
                })

        liability_distribution = []
        if total_loans_debt > 0:
            liability_distribution.append({
                "liability_type": "active_loans",
                "label": "Active Loans",
                "value": total_loans_debt,
                "count": Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).count()
            })
        if total_cc_debt > 0:
            liability_distribution.append({
                "liability_type": "credit_cards",
                "label": "Credit Cards",
                "value": total_cc_debt,
                "count": CreditCard.objects.filter(user=user, status=CreditCardStatus.ACTIVE).count()
            })
        for type_code, type_label in LiabilityType.choices:
            type_liabs = custom_liabs.filter(liability_type=type_code)
            type_value = float(type_liabs.aggregate(total=Sum("value"))["total"] or 0)
            if type_value > 0:
                liability_distribution.append({
                    "liability_type": type_code,
                    "label": type_label,
                    "value": type_value,
                    "count": type_liabs.count()
                })

        return Response({
            "success": True,
            "net_worth_summary": {
                "total_assets": total_assets,
                "current_assets": current_assets,
                "fixed_assets": fixed_assets,
                "total_liabilities": total_liabilities,
                "short_term_liabilities": short_term_liabs_combined,
                "long_term_liabilities": long_term_liabilities,
                "net_worth": net_worth,
                "asset_distribution": asset_distribution,
                "liability_distribution": liability_distribution
            }
        }, status=status.HTTP_200_OK)
