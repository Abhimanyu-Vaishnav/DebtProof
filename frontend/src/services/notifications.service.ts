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
    const { data } = await apiClient.get<any>(
      "/notifications/",
      { params: unreadOnly ? { unread_only: "true" } : {} }
    );
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    if (data?.results && Array.isArray(data.results)) {
      return data;
    }
    return { count: 0, next: null, previous: null, results: [] };
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

  /**
   * Trigger automatic evaluation of active EMI due dates and generate upcoming/overdue alerts.
   */
  evaluateEMIReminders: async (): Promise<{ success: boolean; unread_count: number }> => {
    const { data } = await apiClient.post<{ success: boolean; unread_count: number }>("/notifications/evaluate/");
    return data;
  },

  /**
   * Create & dispatch a notification (for payments, settlements, etc.)
   */
  createNotification: async (notif: {
    title: string;
    body: string;
    notif_type: string;
    loan_id?: string;
  }): Promise<void> => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: notif.title,
      body: notif.body,
      notif_type: notif.notif_type as any,
      loan: notif.loan_id || null,
      loan_name: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    // Try posting to backend
    try {
      await apiClient.post("/notifications/", notif);
    } catch {
      // Offline / fallback catch
    }

    // Dispatch window event so Topbar badge updates dynamically
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("debtproof_add_notification", { detail: newNotif }));

      // Trigger OS/Browser push notification if allowed
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(notif.title, {
            body: notif.body,
            icon: "/icons/icon-192.png",
          });
        } catch {}
      }
    }
  },
};

