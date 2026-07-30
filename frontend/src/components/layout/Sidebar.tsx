/**
 * DebtProof — Premium Sidebar v2
 * Minimal · Clean · Grouped · Fast
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/context/SubscriptionContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const routeToFeatureKey: Record<string, string> = {
  "/dashboard/payoff-quest":    "payoff_quest",
  "/dashboard/joint-workspace": "joint_workspace",
  "/dashboard/refinance":       "refinance_studio",
  "/dashboard/auto-saver":      "auto_saver",
  "/dashboard/statement-import":"statement_parser",
  "/dashboard/activity":        "activity_log",
  "/dashboard/zk-proofs":       "zk_proofs",
  "/dashboard/p2p-market":      "p2p_market",
  "/dashboard/investments":     "investments",
  "/dashboard/reports":         "reports_export",
};

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Core",
    items: [
      { label: "Overview",   href: "/dashboard",        icon: <IconGrid /> },
      { label: "My Loans",   href: "/dashboard/loans",  icon: <IconLoans /> },
      { label: "Payments",   href: "/dashboard/payments", icon: <IconPayments /> },
      { label: "Credit Cards", href: "/dashboard/credit-cards", icon: <IconCard /> },
    ],
  },
  {
    title: "Payoff",
    items: [
      { label: "Payoff Quest",    href: "/dashboard/payoff-quest",    badge: "NEW", icon: <IconTrophy /> },
      { label: "Refinance",       href: "/dashboard/refinance",       badge: "NEW", icon: <IconRefresh /> },
      { label: "Auto-Saver",      href: "/dashboard/auto-saver",      badge: "NEW", icon: <IconSave /> },
      { label: "AI Assistant",    href: "/dashboard/assistant",        icon: <IconAI /> },
      { label: "Automation",      href: "/dashboard/automation",       icon: <IconBolt /> },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Joint Workspace",   href: "/dashboard/joint-workspace",  icon: <IconUsers /> },
      { label: "Statement Import",  href: "/dashboard/statement-import", icon: <IconDoc /> },
    ],
  },
  {
    title: "Analytics & Web3",
    items: [
      { label: "Analytics",     href: "/dashboard/analytics",      icon: <IconChart /> },
      { label: "Net Worth",     href: "/dashboard/net-worth",      icon: <IconTable /> },
      { label: "Investments",   href: "/dashboard/investments",    icon: <IconTrend /> },
      { label: "Budget",        href: "/dashboard/budget",         icon: <IconBudget /> },
      { label: "Calendar",      href: "/dashboard/calendar",       icon: <IconCalendar /> },
      { label: "Simulator",     href: "/dashboard/repayment-simulator", icon: <IconClock /> },
      { label: "ZK & Badges",   href: "/dashboard/zk-proofs",      icon: <IconShield /> },
      { label: "P2P Market",    href: "/dashboard/p2p-market",     icon: <IconP2P /> },
      { label: "Verify Proof",  href: "/verify-proof",             icon: <IconVerify /> },
      { label: "AI Settlement", href: "/dashboard/settlement",     icon: <IconChat /> },
      { label: "Activity Log",  href: "/dashboard/activity",       badge: "NEW", icon: <IconActivity /> },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Reports",   href: "/dashboard/reports",   icon: <IconPie /> },
      { label: "Receipts",  href: "/dashboard/receipts",  icon: <IconReceipt /> },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: <IconSettings /> },
  { label: "Profile",  href: "/profile",             icon: <IconProfile /> },
];

export function openSidebar() {
  window.dispatchEvent(new CustomEvent("sidebar:open"));
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasAccess, openPaywall } = useSubscription();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener("sidebar:open", handler);
    return () => window.removeEventListener("sidebar:open", handler);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* ── Logo ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 h-[60px] border-b border-[var(--color-border)] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[var(--color-text-primary)] font-bold text-[13px] tracking-tight block leading-none">
            DebtProof
          </span>
          <p className="text-[10px] text-[var(--color-text-tertiary)] leading-none mt-0.5 font-medium">
            by Sanatan Labs
          </p>
        </div>
        <button
          className="lg:hidden p-1 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Main Navigation ───────────────────────────────── */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-text-secondary)] opacity-80 px-2.5 mb-1">
              {section.title}
            </p>
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const featureKey = routeToFeatureKey[item.href];
                const isLocked = featureKey ? !hasAccess(featureKey) : false;
                const storageKey = `visited_feature_${item.href.replace(/\//g, "_")}`;
                const [isVisited, setIsVisited] = React.useState(false);

                React.useEffect(() => {
                  if (typeof window !== "undefined" && localStorage.getItem(storageKey)) setIsVisited(true);
                  if (isActive && item.badge) {
                    localStorage.setItem(storageKey, "true");
                    setIsVisited(true);
                  }
                }, [isActive, item.href, item.badge, storageKey]);

                const showBadge = item.badge && !isVisited && !isLocked;

                return (
                  <li key={item.href}>
                    {isLocked ? (
                      <button
                        onClick={() => openPaywall({ featureKey, featureName: item.label })}
                        className={cn("nav-item w-full flex items-center justify-between group opacity-70 hover:opacity-100", isActive && "active")}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="nav-icon shrink-0 text-amber-500 opacity-70">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20 transition shrink-0 ml-1">
                          PRO
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (item.badge) {
                            localStorage.setItem(storageKey, "true");
                            setIsVisited(true);
                          }
                        }}
                        className={cn("nav-item flex items-center justify-between", isActive && "active")}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="nav-icon shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {showBadge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 ml-1">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Monad Status Widget */}
        <div className="mx-1 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/15">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">Monad Testnet</span>
          </div>
          <p className="text-[9.5px] text-[var(--color-text-tertiary)] leading-relaxed">
            Tamper-proof anchoring active · 10,000 TPS
          </p>
        </div>
      </nav>

      {/* ── Bottom Navigation ─────────────────────────────── */}
      <div className="border-t border-[var(--color-border)] px-2.5 py-2.5 space-y-0.5 shrink-0">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-item", pathname === item.href && "active")}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <span className="nav-icon shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {user && (
          <button
            onClick={logout}
            className="nav-item w-full text-left text-[var(--color-error)] hover:bg-red-500/8 hover:text-red-400 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden lg:flex" aria-label="Main navigation">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "sidebar lg:hidden fixed top-0 left-0 z-50 flex transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

/* ── Icon Components ─────────────────────────────────────────── */
function I({ d, ...p }: { d: string; [k: string]: unknown }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d={d} />
    </svg>
  );
}

function IconGrid() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
}
function IconLoans() { return <I d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />; }
function IconPayments() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2.5"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function IconCard() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function IconTrophy() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
}
function IconRefresh() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>; }
function IconSave() { return <I d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />; }
function IconAI() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function IconBolt() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function IconUsers() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconDoc() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconChart() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function IconTable() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>; }
function IconTrend() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function IconBudget() { return <I d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />; }
function IconCalendar() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconClock() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconShield() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="M12 14v4"/></svg>; }
function IconP2P() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="11" x2="12" y2="15"/></svg>; }
function IconVerify() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>; }
function IconChat() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconActivity() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function IconPie() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>; }
function IconReceipt() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>; }
function IconSettings() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconProfile() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
