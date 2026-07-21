"""
DebtProof — Notification API Views
CRUD + mark-as-read + unread count for the notification panel.
"""
import logging
from rest_framework import status
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.models import Notification
from apps.core.pagination import StandardResultsSetPagination
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationListView(ListAPIView):
    """
    GET /api/v1/notifications/
    Returns the authenticated user's notifications, unread first.
    Accepts optional ?unread_only=true query param.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user).select_related("loan")
        if self.request.query_params.get("unread_only") == "true":
            qs = qs.filter(is_read=False)
        return qs.order_by("is_read", "-created_at")


class NotificationUnreadCountView(APIView):
    """
    GET /api/v1/notifications/unread-count/
    Returns { "count": N } — fast endpoint for the Topbar badge.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})


class NotificationMarkReadView(APIView):
    """
    POST /api/v1/notifications/<id>/read/
    Mark a single notification as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, pk) -> Response:
        try:
            notif = Notification.objects.get(id=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save(update_fields=["is_read", "updated_at"])
        return Response({"success": True, "id": str(notif.id)})


class NotificationMarkAllReadView(APIView):
    """
    POST /api/v1/notifications/read-all/
    Mark all unread notifications as read for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        updated = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({"success": True, "updated": updated})


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
