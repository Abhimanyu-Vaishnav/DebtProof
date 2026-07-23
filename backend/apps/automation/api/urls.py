"""
DebtProof — Automation Engine API URLs
"""
from django.urls import path
from apps.automation.api.views import (
    AutomationRuleListCreateView,
    AutomationRuleDetailView,
    AutomationExecutionLogListView,
    toggle_rule,
    trigger_rule,
)

urlpatterns = [
    path("rules/", AutomationRuleListCreateView.as_view(), name="automation-rule-list"),
    path("rules/<uuid:pk>/", AutomationRuleDetailView.as_view(), name="automation-rule-detail"),
    path("rules/<uuid:pk>/toggle/", toggle_rule, name="automation-rule-toggle"),
    path("rules/<uuid:pk>/trigger/", trigger_rule, name="automation-rule-trigger"),
    path("logs/", AutomationExecutionLogListView.as_view(), name="automation-log-list"),
]
