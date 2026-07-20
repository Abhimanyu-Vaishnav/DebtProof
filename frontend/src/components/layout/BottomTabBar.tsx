/**
 * DebtProof — Bottom Tab Bar (Mobile Navigation)
 * Shows 4 primary tabs + "More" button that opens the full sidebar drawer.
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { openSidebar } from "./Sidebar";

interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// 4 primary tabs always visible at bottom
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

export function BottomTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Check if current page is one of primary tabs
  const isOnPrimaryTab = primaryTabs.some(
    (tab) => pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href))
  );

  return (
    <nav className="bottom-tab-bar" aria-label="Mobile navigation tab bar">
      <div className="bottom-tab-bar-container">
        {primaryTabs.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
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

        {/* More button — opens full sidebar drawer */}
        <button
          className={cn("bottom-tab-item", !isOnPrimaryTab && "active")}
          onClick={openSidebar}
          aria-label="More options"
        >
          <span className={cn("bottom-tab-icon", !isOnPrimaryTab && "active-icon")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </span>
          <span className="bottom-tab-label">More</span>
          {!isOnPrimaryTab && <span className="bottom-tab-dot" />}
        </button>
      </div>
    </nav>
  );
}
