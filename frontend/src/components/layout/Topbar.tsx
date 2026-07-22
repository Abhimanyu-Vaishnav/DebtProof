"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { notificationsService } from "@/services/notifications.service";
import type { Notification } from "@/types";

import { THEME_PRESETS, applyGlobalTheme } from "@/utils/theme";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

// ── Helpers ─────────────────────────────────────────────────────
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

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState("dark");

  const handleApplyTheme = (themeName: string) => {
    setTheme(themeName);
    applyGlobalTheme(themeName);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("debtproof_theme") || "dark";
    setTheme(savedTheme);
    applyGlobalTheme(savedTheme);

    const onThemeChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("debtproof_theme_changed", onThemeChanged);
    return () => window.removeEventListener("debtproof_theme_changed", onThemeChanged);
  }, []);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout } = useAuth();

  // ── Fetch notifications ────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const [listResp, count] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount(),
      ]);
      setNotifications(listResp.results ?? []);
      setUnreadCount(count);
    } catch {
      // Silent fail — don't break UI if notification API is unavailable
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60s for new notifications
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Actions ────────────────────────────────────────────────────
  const handleMarkRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await notificationsService.markRead(id); } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try { await notificationsService.markAllRead(); } catch { /* silent */ }
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notif = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notif && !notif.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    try { await notificationsService.deleteNotification(id); } catch { /* silent */ }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/login");
  };

  // Close panels when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar gap-4" role="banner">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("sidebar:open"));
          }
        }}
        className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Preset Switcher */}
        <div className="relative hidden sm:block">
          <select
            value={theme}
            onChange={(e) => handleApplyTheme(e.target.value)}
            className="input text-[11px] h-8 px-2 py-0 bg-[var(--color-surface-secondary)] border-[var(--color-border-light)] rounded-xl font-bold text-[var(--color-text-secondary)] cursor-pointer"
          >
            <option value="dark">🌙 Dark Titanium</option>
            <option value="midnight">🔷 Midnight Blue</option>
            <option value="emerald">🌿 Deep Emerald</option>
            <option value="cyberpunk">⚡ Cyber Neon</option>
          </select>
        </div>

        {/* Notification Bell (Hidden on Mobile) */}
        <div className="relative hidden lg:block" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors relative cursor-pointer"
            aria-label="Notifications"
            id="topbar-notifications-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-88 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-2xl z-50 animate-fade-in-up overflow-hidden" style={{ width: "22rem" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-light)] bg-[var(--color-surface-secondary)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[var(--color-primary-light)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border-light)]">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const icon = notifIcon(n.notif_type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
                        className={`px-4 py-3 flex gap-3 items-start hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer ${
                          !n.is_read ? "bg-[var(--color-primary)]/5" : ""
                        }`}
                      >
                        {/* Icon */}
                        <div className="relative shrink-0 mt-0.5">
                          <span className="text-base">{icon.emoji}</span>
                          {!n.is_read && (
                            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${icon.dot}`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug text-[var(--color-text-primary)] ${!n.is_read ? "font-bold" : "font-medium"}`}>
                            {n.title}
                          </p>
                          {n.loan_name && (
                            <p className="text-[10px] text-[var(--color-primary-light)] font-semibold mt-0.5">{n.loan_name}</p>
                          )}
                          <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: n.body }}
                          />
                          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-1 inline-block">{timeAgo(n.created_at)}</span>
                        </div>
                        {/* Dismiss */}
                        <button
                          onClick={(e) => handleDismiss(n.id, e)}
                          className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors p-0.5 cursor-pointer mt-0.5"
                          title="Dismiss"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer - View All Link */}
              <div className="bg-[var(--color-surface-secondary)] border-t border-[var(--color-border-light)] p-2 text-center shrink-0">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-bold text-[var(--color-primary-light)] hover:text-[var(--color-primary)] hover:underline block py-1 cursor-pointer"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>


        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)]" />

        {/* User Account Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            id="user-menu-button"
          >
            <Avatar name="User" size="sm" />
            <div className="hidden sm:block">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)] leading-none flex items-center gap-1">
                My Account
                <svg className={`w-3.5 h-3.5 text-[var(--color-text-tertiary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">Free Plan</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-md)] shadow-2xl py-1.5 z-50 animate-fade-in-up">
              <div className="px-4 py-2 border-b border-[var(--color-border-light)] sm:hidden">
                <p className="text-[13px] font-medium text-[var(--color-text-primary)]">My Account</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">Free Plan</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                View Profile
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  const dismissKey = "debtproof-pwa-dismiss";
                  localStorage.removeItem(dismissKey);
                  window.dispatchEvent(new Event("debtproof_pwa_show"));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-primary-light)] font-bold hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer text-left"
              >
                <span>📲</span>
                Install Mobile App
              </button>
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </Link>
              <Link
                href="/dashboard/help"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Help & About
              </Link>
              <div className="border-t border-[var(--color-border-light)] my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-error)] hover:bg-red-50 transition-colors cursor-pointer text-left font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
