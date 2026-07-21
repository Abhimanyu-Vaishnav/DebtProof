/**
 * DebtProof — Notifications Page (Responsive Swipe Gestures)
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { notificationsService } from "@/services/notifications.service";
import type { Notification } from "@/types";
import { cn } from "@/utils/cn";

function notifIcon(type: string) {
  if (type === "emi_overdue") return { bg: "bg-red-50 text-red-500 border-red-100", emoji: "⚠️", label: "Overdue" };
  if (type === "emi_upcoming") return { bg: "bg-amber-50 text-amber-500 border-amber-100", emoji: "📅", label: "Upcoming" };
  if (type === "payment_received") return { bg: "bg-emerald-50 text-emerald-500 border-emerald-100", emoji: "✅", label: "Paid" };
  if (type === "loan_closed") return { bg: "bg-purple-50 text-purple-500 border-purple-100", emoji: "🎉", label: "Completed" };
  return { bg: "bg-blue-50 text-blue-500 border-blue-100", emoji: "ℹ️", label: "Info" };
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Redirect mapping based on notification parameters
function getRedirectPath(n: Notification): string {
  const type = n.notif_type;
  if (type === "emi_overdue" || type === "emi_upcoming") {
    return "/dashboard/loans";
  }
  if (type === "payment_received") {
    return "/dashboard/payments";
  }
  if (n.title.toLowerCase().includes("credit") || n.body.toLowerCase().includes("credit")) {
    return "/dashboard/credit-cards";
  }
  return "/dashboard";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const router = useRouter();

  // Swipe gesture touch refs
  const touchStart = useRef<{ id: string; x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});
  const [swipingDir, setSwipingDir] = useState<Record<string, "left" | "right" | null>>({});

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await notificationsService.getNotifications();
      setNotifications(resp.results ?? []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    try {
      await notificationsService.markRead(id);
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await notificationsService.deleteNotification(id);
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await notificationsService.markAllRead();
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    }
  };

  const [evaluating, setEvaluating] = useState(false);

  const handleEvaluateReminders = async () => {
    setEvaluating(true);
    try {
      await notificationsService.evaluateEMIReminders();
      await loadNotifications();
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    } finally {
      setEvaluating(false);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);
    try {
      await notificationsService.clearAll();
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    }
  };

  // ── Swipe Touch Handlers ─────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent, id: string) => {
    const touch = e.touches[0];
    touchStart.current = { id, x: touch.clientX, y: touch.clientY };
  };

  const onTouchMove = (e: React.TouchEvent, id: string) => {
    if (!touchStart.current || touchStart.current.id !== id) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStart.current.x;
    const diffY = touch.clientY - touchStart.current.y;

    // Horizontal swipe threshold
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (e.cancelable) e.preventDefault();
      const offset = Math.min(120, Math.max(-120, diffX));
      setSwipeOffset(prev => ({ ...prev, [id]: offset }));
      setSwipingDir(prev => ({ ...prev, [id]: offset > 0 ? "right" : "left" }));
    }
  };

  const onTouchEnd = async (e: React.TouchEvent, id: string, isAlreadyRead: boolean) => {
    if (!touchStart.current || touchStart.current.id !== id) return;
    const offset = swipeOffset[id] || 0;
    
    if (offset < -80) {
      handleDelete(id);
    } else if (offset > 80 && !isAlreadyRead) {
      handleMarkRead(id);
    }

    setSwipeOffset(prev => ({ ...prev, [id]: 0 }));
    setSwipingDir(prev => ({ ...prev, [id]: null }));
    touchStart.current = null;
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-24">
      {/* Active Channels Banner */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-secondary)]">
          <span>Active Channels:</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px]">In-App 🔔</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">Email 📧</span>
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px]">WhatsApp 💬</span>
        </div>
        <button
          onClick={handleEvaluateReminders}
          disabled={evaluating}
          className="btn btn-primary btn-xs px-3 py-1 font-bold text-[11px] flex items-center gap-1"
        >
          {evaluating ? "Evaluating..." : "⚡ Run EMI Auto-Check"}
        </button>
      </div>

      {/* Header bar with controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">Notifications</h2>
          <p className="text-[11px] text-[var(--color-text-tertiary)]">Swipe right to read, left to delete</p>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-extrabold text-[var(--color-primary-light)] hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[11px] font-extrabold text-rose-500 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-3.5 px-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-24 w-full skeleton rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-10 text-center flex flex-col items-center justify-center border border-[var(--color-border-light)]">
            <span className="text-5xl mb-4 animate-bounce">🔔</span>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">All Clear!</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">No notifications pending at this moment.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const icon = notifIcon(n.notif_type);
            const offset = swipeOffset[n.id] || 0;
            const dir = swipingDir[n.id];

            return (
              <div key={n.id} className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--color-border-light)] min-h-[90px] touch-pan-y">
                {/* Swipe Left Action BG (Delete - Red) */}
                {dir === "left" && (
                  <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 text-white text-xs font-bold transition-opacity">
                    <span>Delete 🗑️</span>
                  </div>
                )}
                
                {/* Swipe Right Action BG (Mark Read - Blue/Green) */}
                {dir === "right" && (
                  <div className="absolute inset-0 bg-emerald-500 flex items-center justify-start pl-6 text-white text-xs font-bold transition-opacity">
                    <span>{n.is_read ? "Already Read" : "Read ✓"}</span>
                  </div>
                )}

                {/* Sliding Front Panel Card */}
                <div
                  onTouchStart={(e) => onTouchStart(e, n.id)}
                  onTouchMove={(e) => onTouchMove(e, n.id)}
                  onTouchEnd={(e) => onTouchEnd(e, n.id, n.is_read)}
                  onClick={() => {
                    setSelectedNotif(n);
                    if (!n.is_read) handleMarkRead(n.id);
                  }}
                  className={cn(
                    "relative bg-[var(--color-surface)] p-4 flex gap-3.5 items-start transition-transform duration-100 ease-out select-none active:scale-[0.99] cursor-pointer",
                    !n.is_read && "border-l-4 border-l-[var(--color-primary-light)]"
                  )}
                  style={{
                    transform: `translateX(${offset}px)`,
                  }}
                >
                  {/* Indicator Icon */}
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", icon.bg)}>
                    <span className="text-lg leading-none">{icon.emoji}</span>
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn("text-[13px] leading-tight truncate text-[var(--color-text-primary)]", !n.is_read ? "font-bold" : "font-medium")}>
                        {n.title}
                      </p>
                      <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] shrink-0 mt-0.5">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.loan_name && (
                      <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-primary-light)]">
                        {n.loan_name}
                      </span>
                    )}
                    <p
                      className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 leading-normal break-words"
                      dangerouslySetInnerHTML={{ __html: n.body }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Detail View Overlay Dialog */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-[var(--color-border)] animate-fade-in-up">
            {/* Header */}
            <div className="p-5 border-b border-[var(--color-border-light)] flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{notifIcon(selectedNotif.notif_type).emoji}</span>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Notification Details</h4>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">{timeAgo(selectedNotif.created_at)}</p>
                </div>
              </div>
              <button
                className="p-1 rounded-full hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]"
                onClick={() => setSelectedNotif(null)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">
                  {selectedNotif.title}
                </h3>
                {selectedNotif.loan_name && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-light)]">
                    Associated Loan: {selectedNotif.loan_name}
                  </p>
                )}
              </div>

              <div
                className="text-xs text-[var(--color-text-secondary)] leading-relaxed break-words bg-[var(--color-surface-secondary)] p-3 rounded-lg border border-[var(--color-border-light)] font-normal"
                dangerouslySetInnerHTML={{ __html: selectedNotif.body }}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const redirect = getRedirectPath(selectedNotif);
                    setSelectedNotif(null);
                    router.push(redirect);
                  }}
                  className="flex-1 btn-primary text-xs py-2 px-3 rounded-lg text-center font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all cursor-pointer"
                >
                  Go to Feature
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedNotif.id);
                    setSelectedNotif(null);
                  }}
                  className="btn-secondary text-xs py-2 px-3 rounded-lg text-center font-bold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
