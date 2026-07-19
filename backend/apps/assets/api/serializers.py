from rest_framework import serializers
from apps.assets.models import Asset

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            "id",
            "name",
            "asset_type",
            "value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Asset value must be greater than zero.")
        return value
