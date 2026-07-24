/**
 * DebtProof — Activity Log Helper Service
 * Utility for recording user timeline activity both online and in localStorage fallback.
 */
import apiClient from "./api";
import { triggerToast } from "@/components/ui/Toast";

export interface ActivityItem {
  id?: string;
  event_type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  created_at?: string;
}

const LOCAL_ACTIVITIES_KEY = "debtproof_local_activities";

export function getLocalActivities(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalActivity(activity: ActivityItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalActivities();
    const newEntry: ActivityItem = {
      id: activity.id || `act-local-${Date.now()}`,
      event_type: activity.event_type,
      title: activity.title,
      description: activity.description,
      icon: activity.icon,
      color: activity.color,
      created_at: activity.created_at || new Date().toISOString(),
    };
    current.unshift(newEntry);
    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(current));

    // Dispatch visual toast popup for the action
    const toastType = activity.color === "red" ? "error" : activity.color === "amber" || activity.color === "orange" ? "warning" : "success";
    triggerToast(`${activity.icon} ${activity.title}`, toastType);
  } catch {}
}

export async function recordActivity(activity: ActivityItem): Promise<void> {
  // Always save locally first for instant updates & offline support
  saveLocalActivity(activity);

  // Attempt backend write if online
  try {
    await apiClient.post("/ai/activity/", activity);
  } catch {
    // Silent catch if backend endpoint is read-only or offline
  }
}
