from rest_framework import serializers
from apps.assets.models import Asset, Liability

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            "id",
            "name",
            "asset_type",
            "asset_class",
            "value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "asset_class", "created_at", "updated_at"]

    def validate_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Asset value must be greater than zero.")
        return value


class LiabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Liability
        fields = [
            "id",
            "name",
            "liability_type",
            "liability_class",
            "value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "liability_class", "created_at", "updated_at"]

    def validate_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Liability value must be greater than zero.")
        return value
