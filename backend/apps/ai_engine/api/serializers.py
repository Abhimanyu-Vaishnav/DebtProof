"""
DebtProof — AI Engine Serializers
"""
from rest_framework import serializers
from apps.ai_engine.models import UserAISettings, AIConversation, AIMessage, ActivityTimelineEntry


class UserAISettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAISettings
        fields = [
            "id", "is_enabled", "monthly_query_limit", "queries_used_this_month",
            "preferred_language", "response_style", "privacy_mode",
        ]
        read_only_fields = ["id", "queries_used_this_month"]


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ["id", "role", "content", "tokens_used", "calculation_context", "created_at"]
        read_only_fields = ["id", "role", "tokens_used", "calculation_context", "created_at"]


class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ["id", "title", "is_active", "messages", "created_at"]
        read_only_fields = ["id", "created_at"]


class ActivityTimelineEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityTimelineEntry
        fields = ["id", "event_type", "title", "description", "metadata", "icon", "color", "created_at"]
        read_only_fields = ["id", "created_at"]
