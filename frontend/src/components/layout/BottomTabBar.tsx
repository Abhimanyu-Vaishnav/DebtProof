/**
 * DebtProof — Bottom Tab Bar (Mobile Navigation with Centered Notifications Link)
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { notificationsService } from "@/services/notifications.service";

interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const leftTabs: TabItem[] = [
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
];

const rightTabs: TabItem[] = [
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

export function BottomTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener("notifications:refresh", handleRefresh);
    return () => window.removeEventListener("notifications:refresh", handleRefresh);
  }, [fetchUnreadCount]);

  if (!mounted) return null;

  const renderTabLink = (item: TabItem) => {
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
  };

  const isAlertsActive = pathname === "/dashboard/notifications";

  return (
    <nav className="bottom-tab-bar" aria-label="Mobile navigation tab bar">
      <div className="bottom-tab-bar-container">
        {/* Left Tabs */}
        {leftTabs.map(renderTabLink)}

        {/* Center Alerts Tab - Now a Direct Link */}
        <Link
          href="/dashboard/notifications"
          className={cn("bottom-tab-item", isAlertsActive && "active")}
        >
          <span className={cn("bottom-tab-icon relative", isAlertsActive && "active-icon")}>
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
          {isAlertsActive && <span className="bottom-tab-dot" />}
        </Link>

        {/* Right Tabs */}
        {rightTabs.map(renderTabLink)}
      </div>
    </nav>
  );
}

export default BottomTabBar;

