"""
DebtProof — Automation Engine Serializers
"""
from rest_framework import serializers
from apps.automation.models import AutomationRule, AutomationExecutionLog


class AutomationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationRule
        fields = [
            "id", "name", "description",
            "condition_type", "condition_value",
            "action_type", "action_config",
            "priority", "is_enabled",
            "last_triggered_at", "trigger_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "last_triggered_at", "trigger_count", "created_at", "updated_at"]

    def validate_condition_value(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("condition_value must be a JSON object.")
        return value


class AutomationExecutionLogSerializer(serializers.ModelSerializer):
    rule_name = serializers.CharField(source="rule.name", read_only=True)

    class Meta:
        model = AutomationExecutionLog
        fields = ["id", "rule", "rule_name", "status", "triggered_at", "details", "context_data"]
