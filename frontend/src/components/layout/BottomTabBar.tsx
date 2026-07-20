/**
 * DebtProof — Bottom Tab Bar (Mobile Navigation with Notifications Drawer)
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { notificationsService } from "@/services/notifications.service";
import type { Notification } from "@/types";

interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const primaryTabs: TabItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Loans",
    href: "/dashboard/loans",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function notifIcon(type: string) {
  if (type === "emi_overdue") return { dot: "bg-rose-500", emoji: "⚠️" };
  if (type === "emi_upcoming") return { dot: "bg-amber-400", emoji: "📅" };
  if (type === "payment_received") return { dot: "bg-emerald-500", emoji: "✅" };
  if (type === "loan_closed") return { dot: "bg-purple-500", emoji: "🎉" };
  return { dot: "bg-blue-500", emoji: "ℹ️" };
}

export function BottomTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const [listResp, count] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount(),
      ]);
      setNotifications(listResp.results ?? []);
      setUnreadCount(count);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listen to global events for real-time notification updates
  useEffect(() => {
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("notifications:refresh", handleRefresh);
    return () => window.removeEventListener("notifications:refresh", handleRefresh);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationsService.markRead(id);
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationsService.markAllRead();
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    } catch {
      // silent
    }
  };

  if (!mounted) return null;

  return (
    <>
      <nav className="bottom-tab-bar" aria-label="Mobile navigation tab bar">
        <div className="bottom-tab-bar-container">
          {primaryTabs.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("bottom-tab-item", isActive && "active")}
              >
                <span className={cn("bottom-tab-icon", isActive && "active-icon")}>
                  {item.icon}
                </span>
                <span className="bottom-tab-label">{item.label}</span>
                {isActive && <span className="bottom-tab-dot" />}
              </Link>
            );
          })}

          {/* Notifications Button instead of More */}
          <button
            className={cn("bottom-tab-item", notifOpen && "active")}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
          >
            <span className="bottom-tab-icon relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className="bottom-tab-label">Alerts</span>
            {notifOpen && <span className="bottom-tab-dot" />}
          </button>
        </div>
      </nav>

      {/* Full Screen Mobile Notification Overlay */}
      {notifOpen && (
        <div className="fixed inset-0 bg-[var(--color-surface)] z-55 lg:hidden flex flex-col animate-fade-in-up">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-surface)]">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-extrabold text-[var(--color-text-primary)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-[var(--color-primary-light)] hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                className="p-1.5 rounded-full hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]"
                onClick={() => setNotifOpen(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* List area with big readable fonts and spacing */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border-light)] pb-20 bg-[var(--color-surface-secondary)]">
              {notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-4xl mb-3">🔔</p>
                  <p className="text-sm font-semibold text-[var(--color-text-tertiary)]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const icon = notifIcon(n.notif_type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
                      className={cn(
                        "px-5 py-4 flex gap-3.5 items-start hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer",
                        !n.is_read && "bg-[var(--color-primary)]/[0.04]"
                      )}
                    >
                      <div className="relative shrink-0 mt-1">
                        <span className="text-xl">{icon.emoji}</span>
                        {!n.is_read && (
                          <span className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full", icon.dot)} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-[13px] leading-normal text-[var(--color-text-primary)]",
                          !n.is_read ? "font-bold" : "font-medium"
                        )}>
                          {n.title}
                        </p>
                        {n.loan_name && (
                          <p className="text-[11px] text-[var(--color-primary-light)] font-bold mt-1">{n.loan_name}</p>
                        )}
                        <div
                          className="text-[12px] text-[var(--color-text-secondary)] mt-1.5 leading-relaxed font-normal break-words"
                          dangerouslySetInnerHTML={{ __html: n.body }}
                        />
                        <span className="text-[10px] text-[var(--color-text-tertiary)] mt-2 inline-block font-medium">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
