from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from apps.assets.models import Asset, AssetType
from apps.assets.api.serializers import AssetSerializer
from apps.loans.models import Loan, LoanStatus

class AssetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AssetSerializer

    def get_queryset(self):
        return Asset.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NetWorthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Total Assets
        assets = Asset.objects.filter(user=user)
        assets_agg = assets.aggregate(total=Sum("value"))
        total_assets = float(assets_agg["total"] or 0)

        # 2. Total Liabilities (outstanding amount of active loans)
        liabilities_agg = Loan.objects.filter(user=user, status=LoanStatus.ACTIVE).aggregate(total=Sum("outstanding_amount"))
        total_liabilities = float(liabilities_agg["total"] or 0)

        # 3. Net Worth
        net_worth = total_assets - total_liabilities

        # 4. Asset Type Distribution
        type_distribution = []
        for type_code, type_label in AssetType.choices:
            type_assets = assets.filter(asset_type=type_code)
            type_agg = type_assets.aggregate(total=Sum("value"))
            type_value = float(type_agg["total"] or 0)
            if type_value > 0:
                type_distribution.append({
                    "asset_type": type_code,
                    "label": type_label,
                    "value": type_value,
                    "count": type_assets.count()
                })

        return Response({
            "success": True,
            "net_worth_summary": {
                "total_assets": total_assets,
                "total_liabilities": total_liabilities,
                "net_worth": net_worth,
                "type_distribution": type_distribution
            }
        }, status=status.HTTP_200_OK)
