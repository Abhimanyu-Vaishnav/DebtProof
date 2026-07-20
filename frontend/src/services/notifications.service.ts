/**
 * DebtProof — Notification Service
 * API calls for the notification system.
 */
import apiClient from "./api";
import type { Notification, PaginatedResponse } from "@/types";

export const notificationsService = {
  /**
   * Get paginated list of notifications for the current user.
   * Pass unread_only=true to fetch only unread.
   */
  getNotifications: async (unreadOnly = false): Promise<PaginatedResponse<Notification>> => {
    const { data } = await apiClient.get<PaginatedResponse<Notification>>(
      "/notifications/",
      { params: unreadOnly ? { unread_only: "true" } : {} }
    );
    return data;
  },

  /**
   * Get the unread count — fast endpoint for the Topbar badge.
   */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count/");
    return data.count;
  },

  /**
   * Mark a single notification as read.
   */
  markRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read/`);
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async (): Promise<void> => {
    await apiClient.post("/notifications/read-all/");
  },

  /**
   * Delete (dismiss) a notification.
   */
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}/`);
  },

  /**
   * Delete all notifications for the authenticated user.
   */
  clearAll: async (): Promise<void> => {
    await apiClient.post("/notifications/clear-all/");
  },
};
