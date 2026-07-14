/**
 * DebtProof — Dashboard Topbar
 * Sticky header with page title, search placeholder, and user actions.
 */
"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
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
        {/* Notification Bell */}
        <button
          className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors relative"
          aria-label="Notifications"
          id="topbar-notifications-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent)] rounded-full" aria-label="3 unread notifications" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)]" />

        {/* User Avatar */}
        <Link href="/dashboard/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="View profile">
          <Avatar name="User" size="sm" />
          <div className="hidden sm:block">
            <p className="text-[13px] font-medium text-[var(--color-text-primary)] leading-none">My Account</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">Free Plan</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
