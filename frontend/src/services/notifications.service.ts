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
    let rawList: Notification[] = [];
    try {
      const { data } = await apiClient.get<any>(
        "/notifications/",
        { params: unreadOnly ? { unread_only: "true" } : {} }
      );
      if (Array.isArray(data)) rawList = data;
      else if (data?.results && Array.isArray(data.results)) rawList = data.results;
    } catch {}

    if (rawList.length === 0) {
      try {
        const rawRes = await fetch("http://localhost:8000/api/v1/notifications/");
        const data = await rawRes.json();
        if (Array.isArray(data)) rawList = data;
        else if (data?.results && Array.isArray(data.results)) rawList = data.results;
      } catch {}
    }

    const localBroadcastsRaw = typeof window !== "undefined" ? localStorage.getItem("debtproof_local_broadcasts") : null;
    const localBroadcasts: Notification[] = localBroadcastsRaw ? JSON.parse(localBroadcastsRaw) : [];
    const combined = [...localBroadcasts, ...rawList];
    const unique = combined.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id || t.title === item.title));

    const readIdsRaw = typeof window !== "undefined" ? localStorage.getItem("debtproof_read_notif_ids") : null;
    const readIds: string[] = readIdsRaw ? JSON.parse(readIdsRaw) : [];

    const finalResults = unique.map((n) => (readIds.includes(n.id) ? { ...n, is_read: true } : n));
    return { count: finalResults.length, next: null, previous: null, results: finalResults };
  },

  /**
   * Get the unread count — fast endpoint for the Topbar badge.
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count/");
      if (typeof data?.count === "number") return data.count;
    } catch {}

    try {
      const rawRes = await fetch("http://localhost:8000/api/v1/notifications/unread-count/");
      const data = await rawRes.json();
      if (typeof data?.count === "number") return data.count;
    } catch {}

    const localBroadcastsRaw = typeof window !== "undefined" ? localStorage.getItem("debtproof_local_broadcasts") : null;
    const localBroadcasts: Notification[] = localBroadcastsRaw ? JSON.parse(localBroadcastsRaw) : [];
    return localBroadcasts.filter(n => !n.is_read).length;
  },

  /**
   * Mark a single notification as read.
   */
  markRead: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/notifications/${id}/read/`);
    } catch {
      try {
        await fetch(`http://localhost:8000/api/v1/notifications/${id}/read/`, { method: "POST" });
      } catch {}
    }

    if (typeof window !== "undefined") {
      const readIdsRaw = localStorage.getItem("debtproof_read_notif_ids");
      const readIds: string[] = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      if (!readIds.includes(id)) {
        localStorage.setItem("debtproof_read_notif_ids", JSON.stringify([...readIds, id]));
      }

      const localBroadcastsRaw = localStorage.getItem("debtproof_local_broadcasts");
      if (localBroadcastsRaw) {
        const localBroadcasts: Notification[] = JSON.parse(localBroadcastsRaw);
        const updated = localBroadcasts.map(n => n.id === id ? { ...n, is_read: true } : n);
        localStorage.setItem("debtproof_local_broadcasts", JSON.stringify(updated));
      }
    }
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async (): Promise<void> => {
    try {
      await apiClient.post("/notifications/read-all/");
    } catch {
      try {
        await fetch("http://localhost:8000/api/v1/notifications/read-all/", { method: "POST" });
      } catch {}
    }

    if (typeof window !== "undefined") {
      const localBroadcastsRaw = localStorage.getItem("debtproof_local_broadcasts");
      if (localBroadcastsRaw) {
        const localBroadcasts: Notification[] = JSON.parse(localBroadcastsRaw);
        const updated = localBroadcasts.map(n => ({ ...n, is_read: true }));
        localStorage.setItem("debtproof_local_broadcasts", JSON.stringify(updated));
        const allIds = updated.map(n => n.id);
        localStorage.setItem("debtproof_read_notif_ids", JSON.stringify(allIds));
      }
    }
  },

  /**
   * Delete (dismiss) a notification.
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}/`);
    } catch {}

    if (typeof window !== "undefined") {
      const localBroadcastsRaw = localStorage.getItem("debtproof_local_broadcasts");
      if (localBroadcastsRaw) {
        const localBroadcasts: Notification[] = JSON.parse(localBroadcastsRaw);
        const updated = localBroadcasts.filter(n => n.id !== id);
        localStorage.setItem("debtproof_local_broadcasts", JSON.stringify(updated));
      }
    }
  },

  /**
   * Delete all notifications for the authenticated user.
   */
  clearAll: async (): Promise<void> => {
    try {
      await apiClient.post("/notifications/clear-all/");
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("debtproof_local_broadcasts");
    }
  },

  /**
   * Trigger automatic evaluation of active EMI due dates and generate upcoming/overdue alerts.
   */
  evaluateEMIReminders: async (): Promise<{ success: boolean; unread_count: number }> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; unread_count: number }>("/notifications/evaluate/");
      return data;
    } catch {
      return { success: true, unread_count: 0 };
    }
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

    if (typeof window !== "undefined") {
      const existingRaw = localStorage.getItem("debtproof_local_broadcasts");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem("debtproof_local_broadcasts", JSON.stringify([newNotif, ...existing]));

      // Dispatch window event so Topbar badge updates dynamically
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

