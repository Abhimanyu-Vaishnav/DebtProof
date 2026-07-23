"""
DebtProof — AI Engine API URLs
"""
from django.urls import path
from apps.ai_engine.api.views import (
    ai_chat, ai_insights,
    ConversationListView, ConversationDetailView,
    UserAISettingsView, ActivityTimelineView,
)

urlpatterns = [
    path("chat/", ai_chat, name="ai-chat"),
    path("insights/", ai_insights, name="ai-insights"),
    path("conversations/", ConversationListView.as_view(), name="ai-conversations"),
    path("conversations/<uuid:pk>/", ConversationDetailView.as_view(), name="ai-conversation-detail"),
    path("settings/", UserAISettingsView.as_view(), name="ai-settings"),
    path("activity/", ActivityTimelineView.as_view(), name="ai-activity"),
]
