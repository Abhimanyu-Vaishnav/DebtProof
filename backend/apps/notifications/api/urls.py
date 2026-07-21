"""
DebtProof — Notification API URLs
"""
from django.urls import path
from .views import (
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationDeleteView,
    NotificationClearAllView,
    NotificationEvaluateEMIRemindersView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", NotificationUnreadCountView.as_view(), name="notification-unread-count"),
    path("read-all/", NotificationMarkAllReadView.as_view(), name="notification-read-all"),
    path("clear-all/", NotificationClearAllView.as_view(), name="notification-clear-all"),
    path("evaluate/", NotificationEvaluateEMIRemindersView.as_view(), name="notification-evaluate"),
    path("<uuid:pk>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("<uuid:pk>/", NotificationDeleteView.as_view(), name="notification-delete"),
]
