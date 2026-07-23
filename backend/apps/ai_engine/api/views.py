"""
DebtProof — AI Engine API Views
Chat, Insights, Activity Timeline, and Settings endpoints.
"""
import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.ai_engine.models import UserAISettings, AIConversation, AIMessage, ActivityTimelineEntry
from apps.ai_engine.api.serializers import (
    UserAISettingsSerializer, AIConversationSerializer,
    AIMessageSerializer, ActivityTimelineEntrySerializer,
)
from apps.ai_engine.calculator import AIFinancialEngine

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """
    POST /api/v1/ai/chat/
    Body: {"message": "Which loan should I close first?", "conversation_id": "<uuid>|null"}
    Returns computed real-data financial answer.
    """
    message_text = request.data.get("message", "").strip()
    conversation_id = request.data.get("conversation_id")

    if not message_text:
        return Response({"error": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    # Check AI settings
    settings_obj, _ = UserAISettings.objects.get_or_create(user=request.user)
    if not settings_obj.is_enabled:
        return Response({"error": "AI assistant is disabled in your settings."}, status=status.HTTP_403_FORBIDDEN)
    if settings_obj.queries_used_this_month >= settings_obj.monthly_query_limit:
        return Response({"error": "Monthly AI query limit reached. Please upgrade your plan."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    # Get or create conversation
    if conversation_id:
        conversation = AIConversation.objects.filter(id=conversation_id, user=request.user).first()
        if not conversation:
            conversation = AIConversation.objects.create(user=request.user, title=message_text[:60])
    else:
        conversation = AIConversation.objects.create(user=request.user, title=message_text[:60])

    # Save user message
    AIMessage.objects.create(conversation=conversation, role="user", content=message_text)

    # Process with real-data engine
    engine = AIFinancialEngine(request.user)
    result = engine.process_query(message_text)

    # Save assistant response
    assistant_msg = AIMessage.objects.create(
        conversation=conversation,
        role="assistant",
        content=result["answer"],
        calculation_context=result.get("data", {}),
    )

    # Increment usage counter
    UserAISettings.objects.filter(user=request.user).update(
        queries_used_this_month=settings_obj.queries_used_this_month + 1
    )

    # Log to activity timeline
    ActivityTimelineEntry.objects.create(
        user=request.user,
        event_type="ai_insight",
        title=f"AI Query: {message_text[:60]}",
        description=result["answer"][:200],
        icon="🤖",
        color="purple",
    )

    return Response({
        "conversation_id": str(conversation.id),
        "answer": result["answer"],
        "intent": result.get("intent"),
        "data": result.get("data", {}),
        "message_id": str(assistant_msg.id),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insights(request):
    """GET /api/v1/ai/insights/ — Real-time dashboard insight cards."""
    engine = AIFinancialEngine(request.user)
    insights = engine.get_dashboard_insights()
    return Response({"insights": insights})


class ConversationListView(generics.ListAPIView):
    """GET /api/v1/ai/conversations/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AIConversationSerializer

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE /api/v1/ai/conversations/<id>/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AIConversationSerializer

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)


class UserAISettingsView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/ai/settings/"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserAISettingsSerializer

    def get_object(self):
        obj, _ = UserAISettings.objects.get_or_create(user=self.request.user)
        return obj


class ActivityTimelineView(generics.ListAPIView):
    """GET /api/v1/ai/activity/ — Unified user activity timeline."""
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityTimelineEntrySerializer

    def get_queryset(self):
        qs = ActivityTimelineEntry.objects.filter(user=self.request.user)
        event_type = self.request.query_params.get("event_type")
        if event_type:
            qs = qs.filter(event_type=event_type)
        return qs[:100]
