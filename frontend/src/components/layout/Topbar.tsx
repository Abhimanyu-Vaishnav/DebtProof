"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Anchor Pending",
      description: "You have recorded payments with unanchored receipts. Secure them on Monad Testnet.",
      time: "Just now",
      read: false,
      type: "warning"
    },
    {
      id: "notif-2",
      title: "Wallet Connected",
      description: "Successfully connected MetaMask with Monad Testnet provider.",
      time: "5m ago",
      read: false,
      type: "success"
    },
    {
      id: "notif-3",
      title: "System Update",
      description: "DebtProof v1.0.0 is production-ready for Monad Blockchain Hackathon.",
      time: "1h ago",
      read: true,
      type: "info"
    }
  ]);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/login");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
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
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationsRef}>
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
            {/* Unread dot */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" aria-label={`${unreadCount} unread notifications`} />
            )}
          </button>

          {/* Notifications Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg py-2.5 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-[var(--color-border-light)]">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto mt-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)]">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        setNotificationsOpen(false);
                      }}
                      className={`px-4 py-3 flex gap-2.5 items-start hover:bg-[var(--color-surface-secondary)] cursor-pointer transition-colors border-b border-[var(--color-border-light)] last:border-0 ${
                        !n.read ? "bg-[var(--color-surface-secondary)]/50" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === "success" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                        {n.type === "warning" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]" />
                        )}
                        {n.type === "info" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs text-[var(--color-text-primary)] leading-tight ${!n.read ? "font-bold" : "font-semibold"}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                          {n.description}
                        </p>
                        <span className="text-[9px] text-[var(--color-text-tertiary)] mt-1 inline-block">{n.time}</span>
                      </div>
                      <button
                        onClick={(e) => handleDismissNotification(n.id, e)}
                        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors p-0.5 cursor-pointer"
                        title="Dismiss"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
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
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg py-1.5 z-50 animate-fade-in-up">
              <div className="px-4 py-2 border-b border-[var(--color-border-light)] sm:hidden">
                <p className="text-[13px] font-medium text-[var(--color-text-primary)]">My Account</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">Free Plan</p>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                View Profile
              </Link>
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
