"""
DebtProof — Automation Engine API Views
Full CRUD for automation rules + execution logs + manual trigger.
"""
import logging
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.automation.models import AutomationRule, AutomationExecutionLog
from apps.automation.api.serializers import AutomationRuleSerializer, AutomationExecutionLogSerializer
from apps.automation.engine import evaluate_and_execute_rule

logger = logging.getLogger(__name__)


class AutomationRuleListCreateView(generics.ListCreateAPIView):
    """GET /api/v1/automation/rules/ | POST /api/v1/automation/rules/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AutomationRuleSerializer

    def get_queryset(self):
        return AutomationRule.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AutomationRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/automation/rules/<id>/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AutomationRuleSerializer

    def get_queryset(self):
        return AutomationRule.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_rule(request, pk):
    """POST /api/v1/automation/rules/<id>/toggle/ — Enable or disable a rule."""
    try:
        rule = AutomationRule.objects.get(pk=pk, user=request.user)
    except AutomationRule.DoesNotExist:
        return Response({"error": "Rule not found."}, status=status.HTTP_404_NOT_FOUND)

    rule.is_enabled = not rule.is_enabled
    rule.save(update_fields=["is_enabled"])
    return Response({"id": str(rule.id), "is_enabled": rule.is_enabled})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_rule(request, pk):
    """POST /api/v1/automation/rules/<id>/trigger/ — Manually trigger a rule for testing."""
    try:
        rule = AutomationRule.objects.get(pk=pk, user=request.user)
    except AutomationRule.DoesNotExist:
        return Response({"error": "Rule not found."}, status=status.HTTP_404_NOT_FOUND)

    result = evaluate_and_execute_rule(rule, force=True)
    return Response(result)


class AutomationExecutionLogListView(generics.ListAPIView):
    """GET /api/v1/automation/logs/ — All execution logs for this user's rules."""
    permission_classes = [IsAuthenticated]
    serializer_class = AutomationExecutionLogSerializer

    def get_queryset(self):
        rule_ids = AutomationRule.objects.filter(user=self.request.user).values_list("id", flat=True)
        return AutomationExecutionLog.objects.filter(rule_id__in=rule_ids)
