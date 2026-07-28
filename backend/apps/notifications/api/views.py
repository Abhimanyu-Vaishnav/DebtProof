"""
DebtProof — Notification API Views
CRUD + mark-as-read + unread count for the notification panel.
"""
import logging
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.models import Notification
from apps.core.pagination import StandardResultsSetPagination
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationListView(ListCreateAPIView):
    """
    GET /api/v1/notifications/
    Returns the authenticated user's notifications, unread first.
    POST /api/v1/notifications/
    Allows creating a new notification for the authenticated user.
    """
    permission_classes = []
    throttle_classes = []
    serializer_class = NotificationSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        from django.db.models import Q
        if self.request.user and self.request.user.is_authenticated:
            qs = Notification.objects.filter(Q(user=self.request.user) | Q(user__isnull=True)).select_related("loan")
        else:
            qs = Notification.objects.all().select_related("loan")

        if self.request.query_params.get("unread_only") == "true":
            qs = qs.filter(is_read=False)
        return qs.order_by("is_read", "-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationUnreadCountView(APIView):
    """
    GET /api/v1/notifications/unread-count/
    Returns { "count": N } — fast endpoint for the Topbar badge.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request) -> Response:
        from django.db.models import Q
        if request.user and request.user.is_authenticated:
            count = Notification.objects.filter(Q(user=request.user) | Q(user__isnull=True), is_read=False).count()
        else:
            count = Notification.objects.filter(is_read=False).count()
        return Response({"count": count})


class NotificationMarkReadView(APIView):
    """
    POST /api/v1/notifications/<id>/read/
    Mark a single notification as read.
    """
    permission_classes = []

    def post(self, request: Request, pk) -> Response:
        try:
            notif = Notification.objects.get(id=pk)
            notif.is_read = True
            notif.save(update_fields=["is_read", "updated_at"])
            return Response({"success": True, "id": str(notif.id)})
        except Notification.DoesNotExist:
            return Response({"success": True, "id": str(pk)})


class NotificationMarkAllReadView(APIView):
    """
    POST /api/v1/notifications/read-all/
    Mark all unread notifications as read.
    """
    permission_classes = []

    def post(self, request: Request) -> Response:
        from django.db.models import Q
        if request.user and request.user.is_authenticated:
            Notification.objects.filter(Q(user=request.user) | Q(user__isnull=True)).update(is_read=True)
        else:
            Notification.objects.all().update(is_read=True)
        return Response({"success": True})


class NotificationDeleteView(DestroyAPIView):
    """
    DELETE /api/v1/notifications/<id>/
    Delete a single notification.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        instance.delete()
        return Response({"success": True}, status=status.HTTP_200_OK)


class NotificationClearAllView(APIView):
    """
    POST /api/v1/notifications/clear-all/
    Delete all notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        deleted_count, _ = Notification.objects.filter(user=request.user).delete()
        return Response({"success": True, "deleted": deleted_count})


class NotificationEvaluateEMIRemindersView(APIView):
    """
    POST /api/v1/notifications/evaluate/
    Evaluates active loans and generates upcoming/overdue EMI notifications.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        from django.core.management import call_command
        try:
            call_command("generate_emi_notifications")
            unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
            return Response({
                "success": True,
                "message": "EMI evaluation completed successfully.",
                "unread_count": unread_count
            })
        except Exception as e:
            logger.error("Failed to evaluate EMI notifications: %s", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SuperAdminBroadcastNotificationView(APIView):
    """
    POST /api/v1/notifications/broadcast/
    Creates broadcast notifications for all registered users in database.
    """
    permission_classes = []

    def post(self, request: Request) -> Response:
        title = request.data.get("title", "SuperAdmin Announcement")
        body = request.data.get("body", "System notification broadcasted.")
        target_audience = request.data.get("target_audience", "All")

        from apps.users.models import User
        users = list(User.objects.all())

        if target_audience == "Enterprise":
            target_users = [u for u in users if u.is_superuser]
        elif target_audience == "Pro":
            target_users = [u for u in users if u.is_staff and not u.is_superuser]
        elif target_audience == "Free":
            target_users = [u for u in users if not u.is_staff and not u.is_superuser]
        else:
            target_users = users

        if not target_users and users:
            target_users = users

        created_notifs = []

        # Create 1 global broadcast notification with user=None (accessible by all accounts across all browsers)
        global_notif = Notification.objects.create(
            user=None,
            title=title,
            body=body,
            notif_type="info",
            is_read=False,
        )
        created_notifs.append(str(global_notif.id))

        for u in target_users:
            notif = Notification.objects.create(
                user=u,
                title=title,
                body=body,
                notif_type="info",
                is_read=False,
            )
            created_notifs.append(str(notif.id))

        return Response({
            "success": True,
            "message": f"Broadcast sent to {len(created_notifs)} users.",
            "count": len(created_notifs)
        })
