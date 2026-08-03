"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { notificationsService } from "@/services/notifications.service";
import type { Notification } from "@/types";
import { TenantSwitcher } from "@/components/tenant/TenantSwitcher";
import { THEME_PRESETS, applyGlobalTheme } from "@/utils/theme";
import { Web3WalletConnect } from "@/components/layout/Web3WalletConnect";
import { useSubscription } from "@/context/SubscriptionContext";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function notifIcon(type: string) {
  if (type === "emi_overdue")       return { dot: "bg-rose-500",    emoji: "⚠️" };
  if (type === "emi_upcoming")      return { dot: "bg-amber-400",   emoji: "📅" };
  if (type === "payment_received")  return { dot: "bg-emerald-500", emoji: "✅" };
  if (type === "loan_closed")       return { dot: "bg-purple-500",  emoji: "🎉" };
  return { dot: "bg-blue-500", emoji: "ℹ️" };
}

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications]       = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]           = useState(0);
  const [theme, setTheme]                       = useState("system");
  const [soundMuted, setSoundMuted]             = useState(false);
  const [activePlan, setActivePlan]             = useState<string>("Free Plan");

  const { user } = useAuth();
  const sub = useSubscription();
  const currentPlan = sub?.currentPlan;

  useEffect(() => {
    const refreshPlan = async () => {
      if (currentPlan?.name && currentPlan.name.toLowerCase() !== "free" && currentPlan.name.toLowerCase() !== "free plan") {
        let name = currentPlan.name.trim();
        if (!name.toLowerCase().includes("plan")) name = `${name} Plan`;
        setActivePlan(name);
        return;
      }

      const u = user as any;
      if (u?.plan && u.plan.toLowerCase() !== "free" && u.plan.toLowerCase() !== "free plan") {
        let p = u.plan.trim();
        if (!p.toLowerCase().includes("plan")) p = `${p} Plan`;
        const formatted = p.charAt(0).toUpperCase() + p.slice(1);
        setActivePlan(formatted);
        return;
      }

      const { getUserPlan } = await import("@/services/plan.service");
      const planTag = getUserPlan();
      setActivePlan(`${planTag} Plan`);
    };

    refreshPlan();
    window.addEventListener("debtproof_plan_changed", refreshPlan);
    window.addEventListener("storage", refreshPlan);
    return () => {
      window.removeEventListener("debtproof_plan_changed", refreshPlan);
      window.removeEventListener("storage", refreshPlan);
    };
  }, [user, currentPlan]);

  const handleApplyTheme = (themeName: string) => {
    setTheme(themeName);
    applyGlobalTheme(themeName);
  };

  useEffect(() => {
    const saved = localStorage.getItem("debtproof_theme") || "system";
    setTheme(saved);
    applyGlobalTheme(saved);
    const onThemeChanged = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail) setTheme(ev.detail);
    };
    window.addEventListener("debtproof_theme_changed", onThemeChanged);
    return () => window.removeEventListener("debtproof_theme_changed", onThemeChanged);
  }, []);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRef      = useRef<HTMLDivElement>(null);
  const router           = useRouter();
  const { logout }       = useAuth();
  const seenNotifIdsRef  = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const [listResp] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount(),
      ]);
      const notifArray = Array.isArray(listResp) ? listResp : listResp.results ?? [];
      const localRaw = typeof window !== "undefined" ? localStorage.getItem("debtproof_local_broadcasts") : null;
      const localBroadcasts: Notification[] = localRaw ? JSON.parse(localRaw) : [];
      const combined = [...localBroadcasts, ...notifArray];
      const unique = combined.filter((item, i, self) => i === self.findIndex((t) => t.id === item.id || t.title === item.title));
      setNotifications(unique);
      setUnreadCount(unique.filter((n) => !n.is_read).length);
      if (seenNotifIdsRef.current.size > 0) {
        const brandNew = unique.filter((n) => !n.is_read && !seenNotifIdsRef.current.has(n.id));
        if (brandNew.length > 0) {
          window.dispatchEvent(new CustomEvent("debtproof-toast", {
            detail: { message: brandNew[0].title || "New notification received!", type: "info" },
          }));
        }
      }
      unique.forEach((n) => seenNotifIdsRef.current.add(n.id));
    } catch { /* silent fail */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handleRefresh = () => fetchNotifications();
    const handleStorage = (e: StorageEvent) => { if (e.key === "debtproof_local_broadcasts") fetchNotifications(); };
    const handleAddNotif = (e: Event) => {
      const custom = e as CustomEvent<Notification>;
      if (custom.detail) {
        setNotifications((prev) => {
          if (prev.find((n) => n.id === custom.detail.id)) return prev;
          return [custom.detail, ...prev];
        });
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try { new Notification(custom.detail.title || "DebtProof Alert", { body: custom.detail.body || "", icon: "/favicon.ico" }); } catch {}
        }
      }
    };
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      try { Notification.requestPermission(); } catch {}
    }
    window.addEventListener("debtproof_refresh_notifications", handleRefresh);
    window.addEventListener("debtproof_add_notification", handleAddNotif);
    window.addEventListener("storage", handleStorage);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("debtproof_notifications_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "ADD_NOTIFICATION" && event.data?.notif) {
          const newNotif = event.data.notif as Notification;
          setNotifications((prev) => {
            if (prev.find((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        }
      };
    } catch {}
    const interval = setInterval(fetchNotifications, 4_000);
    return () => {
      window.removeEventListener("debtproof_refresh_notifications", handleRefresh);
      window.removeEventListener("debtproof_add_notification", handleAddNotif);
      window.removeEventListener("storage", handleStorage);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try { await notificationsService.markRead(id); } catch {}
  };
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try { await notificationsService.markAllRead(); } catch {}
  };
  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notif = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));
    try { await notificationsService.deleteNotification(id); } catch {}
  };
  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar gap-3" role="banner">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent("sidebar:open"))}
        className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate leading-none tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="hidden sm:block">
          <TenantSwitcher />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sound Toggle */}
        <button
          onClick={() => {
            const { sounds } = require("@/utils/sound");
            const next = !soundMuted;
            sounds.toggleSound(!next);
            setSoundMuted(next);
            if (!next) sounds.playPaymentSuccess();
          }}
          className={`topbar-icon-btn ${!soundMuted ? "text-indigo-400 bg-indigo-500/10" : "text-[var(--color-text-tertiary)]"}`}
          title={!soundMuted ? "Mute sound effects" : "Unmute sound effects"}
        >
          {!soundMuted ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          )}
        </button>

        {/* Web3 Wallet */}
        <Web3WalletConnect />

        {/* Theme Preset */}
        <div className="hidden sm:block">
          <select
            value={theme}
            onChange={(e) => handleApplyTheme(e.target.value)}
            className="h-8 px-2 text-[11px] font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] cursor-pointer outline-none hover:border-[var(--color-brand)] transition-colors"
          >
            {THEME_PRESETS.map((t) => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)] mx-0.5" />

        {/* Notification Bell */}
        <div className="relative hidden lg:block" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="topbar-icon-btn relative"
            aria-label="Notifications"
            id="topbar-notifications-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 animate-fade-in-up overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[var(--color-text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-border)]">
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
                        className={`px-4 py-2.5 flex gap-3 items-start hover:bg-[var(--color-surface-tertiary)] transition-colors cursor-pointer ${!n.is_read ? "bg-indigo-500/5" : ""}`}
                      >
                        <div className="relative shrink-0 mt-0.5">
                          <span className="text-base">{icon.emoji}</span>
                          {!n.is_read && (
                            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${icon.dot}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[12px] leading-snug text-[var(--color-text-primary)] ${!n.is_read ? "font-semibold" : "font-medium"}`}>
                            {n.title}
                          </p>
                          {n.loan_name && (
                            <p className="text-[10px] text-[var(--color-brand)] font-semibold mt-0.5">{n.loan_name}</p>
                          )}
                          <p
                            className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: n.body }}
                          />
                          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-1 inline-block">{timeAgo(n.created_at)}</span>
                        </div>
                        <button
                          onClick={(e) => handleDismiss(n.id, e)}
                          className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors p-0.5 mt-0.5"
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

              <div className="border-t border-[var(--color-border)] p-2 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] py-1 block transition"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)] mx-0.5" />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer rounded-lg px-1.5 py-1"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            id="user-menu-button"
          >
            <Avatar name="User" size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-[var(--color-text-primary)] leading-none flex items-center gap-1 tracking-tight">
                My Account
                <svg className={`w-3 h-3 text-[var(--color-text-tertiary)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </p>
              <p className="text-[10px] text-indigo-400 font-bold mt-0.5 truncate max-w-[130px]">{activePlan}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in-up">
              <div className="px-3 py-2 border-b border-[var(--color-border)] sm:hidden">
                <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">My Account</p>
                <p className="text-[10px] text-indigo-400 font-bold mt-0.5">{activePlan}</p>
              </div>
              {[
                { href: "/profile", icon: "👤", label: "View Profile" },
                { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
                { href: "/dashboard/help", icon: "❓", label: "Help & About" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  const dismissKey = "debtproof-pwa-dismiss";
                  localStorage.removeItem(dismissKey);
                  window.dispatchEvent(new Event("debtproof_pwa_show"));
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-indigo-400 font-semibold hover:bg-[var(--color-surface-tertiary)] transition-colors cursor-pointer text-left"
              >
                <span className="text-sm">📲</span>
                Install Mobile App
              </button>
              <div className="border-t border-[var(--color-border)] my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[var(--color-error)] hover:bg-red-500/8 transition-colors cursor-pointer text-left font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
