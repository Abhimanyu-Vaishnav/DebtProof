"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import apiClient from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleType = "SuperAdmin" | "AdminManager" | "CustomerSupport" | "BillingFinance" | "RiskAuditor" | "Web3Governor";
type TabId = "overview" | "users" | "loans" | "push" | "staff" | "support" | "risk" | "monad" | "payments" | "security" | "analytics" | "settings";

interface StaffMember { id: string; name: string; email: string; roles: RoleType[]; status: "Active" | "Inactive"; queriesResolved: number; avgRating: number; }
interface UserData { id: string; name: string; email: string; plan: string; status: string; loansCount: number; totalDebtVolume: number; joinedDate?: string; lastLogin?: string | null; isSuperuser?: boolean; }
interface LoanData { id: string; name: string; loan_type: string; status: string; user_name: string; user_email: string; lender: string; principal: number; outstanding: number; interest_rate: number; monthly_emi: number; created_at: string; }
interface PaymentData { id: string; amount: number; status: string; payment_method: string; loan_name: string; user_name: string; user_email: string; paid_on: string; }
interface PlatformStats { total_users: number; active_users: number; suspended_users: number; total_loans: number; active_loans: number; closed_loans: number; overdue_loans: number; total_debt_volume: number; total_outstanding: number; total_payments: number; total_paid: number; failed_payments: number; loan_type_breakdown: {loan_type: string; count: number}[]; monthly_signups: {month: string; count: number}[]; recent_users: {name: string; email: string; joined: string}[]; }

// ─── Sample Static Data ───────────────────────────────────────────────────────
const SAMPLE_STAFF: StaffMember[] = [
  { id: "stf-1", name: "Aarav Sharma", email: "aarav.admin@debtproof.io", roles: ["SuperAdmin", "AdminManager"], status: "Active", queriesResolved: 142, avgRating: 4.9 },
  { id: "stf-2", name: "Neha Verma", email: "neha.support@debtproof.io", roles: ["CustomerSupport"], status: "Active", queriesResolved: 89, avgRating: 4.8 },
  { id: "stf-3", name: "Vikram Mehta", email: "vikram.finance@debtproof.io", roles: ["BillingFinance"], status: "Active", queriesResolved: 45, avgRating: 4.7 },
  { id: "stf-4", name: "Riya Sen", email: "riya.risk@debtproof.io", roles: ["RiskAuditor"], status: "Active", queriesResolved: 31, avgRating: 5.0 },
];

const SUPPORT_QUERIES = [
  { id: "q-1", userEmail: "rajesh@example.com", userName: "Rajesh Kumar", userPlan: "Enterprise", priority: "Urgent", subject: "Monad ZK Proof Verification Delayed on Testnet", assignedStaff: "Neha Verma", status: "In_Call" },
  { id: "q-2", userEmail: "sunita@example.com", userName: "Sunita Rao", userPlan: "Pro", priority: "High", subject: "Auto-Pay Prepayment Trigger Optimization Query", assignedStaff: "Neha Verma", status: "Open" },
  { id: "q-3", userEmail: "amit@example.com", userName: "Amit Joshi", userPlan: "Basic", priority: "Normal", subject: "Credit Score Calculation discrepancy", assignedStaff: "Vikram Mehta", status: "Resolved" },
];

const MONAD_LOGS = [
  { id: "m-1", txHash: "0x8f2c...41b", blockNumber: 1049281, userEmail: "rajesh@example.com", action: "Monad ZK Proof Anchoring", amount: 45000, timestamp: "Today, 11:20 AM", status: "Confirmed" },
  { id: "m-2", txHash: "0x3e9a...10c", blockNumber: 1049102, userEmail: "sunita@example.com", action: "Smart Auto-Prepayment Trigger", amount: 15000, timestamp: "Today, 09:15 AM", status: "Confirmed" },
  { id: "m-3", txHash: "0x7d1f...88a", blockNumber: 1048901, userEmail: "amit@example.com", action: "Debt Proof Generation", amount: 280000, timestamp: "Yesterday, 4:32 PM", status: "Pending" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n.toLocaleString()}`;
const LOAN_TYPE_LABEL: Record<string, string> = { home: "🏠 Home", personal: "👤 Personal", vehicle: "🚗 Vehicle", education: "🎓 Education", business: "💼 Business", credit_card: "💳 Credit Card", other: "📦 Other" };
const STATUS_BADGE: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", closed: "bg-slate-500/15 text-slate-400 border-slate-500/30", defaulted: "bg-red-500/15 text-red-400 border-red-500/30", on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/30", confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", pending: "bg-amber-500/15 text-amber-400 border-amber-500/30", failed: "bg-red-500/15 text-red-400 border-red-500/30", Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", Suspended: "bg-red-500/15 text-red-400 border-red-500/30" };

async function superAdminFetch(path: string) {
  try { const { data } = await apiClient.get(path); return data; } catch {
    try { const r = await fetch(`http://localhost:8000/api/v1${path}`); return await r.json(); } catch { return null; }
  }
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data, color = "#f43f5e" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-sm transition-all duration-500" style={{ height: `${(d.value / max) * 64}px`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
          {data.length <= 7 && <span className="text-[8px] text-slate-500 font-medium truncate w-full text-center">{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color = "rose" }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = { rose: "from-rose-500/20 to-rose-600/5 border-rose-500/20", emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20", blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20", amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20", purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20" };
  return (
    <div className={`p-4 rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-2xl font-black text-white mt-1">{value}</p>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub, action }: { icon: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="text-base font-black text-white">{title}</h2>
          {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────
function DataTable({ columns, rows }: { columns: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-900 border-b border-slate-800">
            {columns.map((c, i) => <th key={i} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 text-xs">No data available</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              {row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-300">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>{status}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuperAdminPortal() {
  const SUPERADMIN_KEY = "debtproof_superadmin_auth_token";

  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUserIdInput, setAdminUserIdInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [userList, setUserList] = useState<UserData[]>([]);
  const [loanList, setLoanList] = useState<LoanData[]>([]);
  const [paymentList, setPaymentList] = useState<PaymentData[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [loanFilter, setLoanFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Push notification state
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushImageUrl, setPushImageUrl] = useState("");
  const [pushActionText, setPushActionText] = useState("");
  const [pushActionUrl, setPushActionUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState<"All" | "Enterprise" | "Pro" | "Free">("All");

  // Staff state
  const [staffList, setStaffList] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRoles, setNewStaffRoles] = useState<RoleType[]>(["CustomerSupport"]);

  // Settings state
  const [featureFlags, setFeatureFlags] = useState({ emiAlerts: true, blockchainAudit: true, aiInsights: true, creditScore: true, darkMode: true, maintenanceMode: false });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem(SUPERADMIN_KEY) === "granted") {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsData, usersData, loansData, paymentsData] = await Promise.allSettled([
        superAdminFetch("/auth/superadmin/stats/"),
        superAdminFetch("/auth/superadmin/users/"),
        superAdminFetch("/auth/superadmin/loans/"),
        superAdminFetch("/auth/superadmin/payments/"),
      ]);
      if (statsData.status === "fulfilled" && statsData.value) setStats(statsData.value);
      if (usersData.status === "fulfilled" && usersData.value?.users) setUserList(usersData.value.users);
      if (loansData.status === "fulfilled" && loansData.value?.loans) setLoanList(loansData.value.loans);
      if (paymentsData.status === "fulfilled" && paymentsData.value?.payments) setPaymentList(paymentsData.value.payments);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated, fetchAllData]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUserIdInput.trim() === "SUPERADMIN-DEBTPROOF-9901" && adminPasswordInput === "admin12345") {
      localStorage.setItem(SUPERADMIN_KEY, "granted");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid SuperAdmin Credentials! Access Denied.");
    }
  };

  const handleSendPushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim()) return;
    const formattedTitle = pushTitle.startsWith("📢") ? pushTitle : `📢 ${pushTitle}`;
    let richBodyHtml = pushBody || "System announcement broadcasted from SuperAdmin Portal.";
    if (pushImageUrl.trim()) richBodyHtml += `<br/><img src="${pushImageUrl.trim()}" alt="Announcement Image" class="my-2 rounded-lg max-h-48 object-cover w-full border border-slate-700" />`;
    if (pushActionText.trim() && pushActionUrl.trim()) richBodyHtml += `<br/><a href="${pushActionUrl.trim()}" target="_blank" rel="noopener noreferrer" class="inline-block mt-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs no-underline shadow-md">${pushActionText.trim()} →</a>`;
    const newNotifObj = { id: `notif-superadmin-${Date.now()}`, title: formattedTitle, body: richBodyHtml, notif_type: "info", is_read: false, created_at: new Date().toISOString() };
    try { await apiClient.post("/notifications/broadcast/", { title: formattedTitle, body: richBodyHtml, target_audience: targetAudience }); } catch {
      try { await fetch("http://localhost:8000/api/v1/notifications/broadcast/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: formattedTitle, body: richBodyHtml, target_audience: targetAudience }) }); } catch {}
    }
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("debtproof_local_broadcasts") || "[]");
      localStorage.setItem("debtproof_local_broadcasts", JSON.stringify([newNotifObj, ...existing]));
      try { const bc = new BroadcastChannel("debtproof_notifications_channel"); bc.postMessage({ type: "ADD_NOTIFICATION", notif: newNotifObj }); bc.close(); } catch {}
    }
    window.dispatchEvent(new CustomEvent("debtproof_add_notification", { detail: newNotifObj }));
    window.dispatchEvent(new CustomEvent("debtproof_refresh_notifications"));
    window.dispatchEvent(new CustomEvent("debtproof-toast", { detail: { message: `📢 Broadcast Sent: ${pushTitle}`, type: "success" } }));
    setPushTitle(""); setPushBody(""); setPushImageUrl(""); setPushActionText(""); setPushActionUrl("");
  };

  if (!isMounted) return null;

  // ── Login Gate ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center p-4" style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.08) 0%, transparent 60%)" }}>
        <div className="max-w-sm w-full p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-700/10 border border-rose-500/20 flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(244,63,94,0.15)]">👑</div>
            <h1 className="text-xl font-black text-white">SuperAdmin Control Center</h1>
            <p className="text-xs text-slate-400">DebtProof Enterprise Security Gate</p>
          </div>
          {authError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">{authError}</div>}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SuperAdmin User ID</label>
              <input type="text" placeholder="SUPERADMIN-DEBTPROOF-9901" value={adminUserIdInput} onChange={(e) => setAdminUserIdInput(e.target.value)} className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs font-mono focus:border-rose-500 focus:outline-none transition" required />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Passcode</label>
              <input type="password" placeholder="••••••••••••" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs font-mono focus:border-rose-500 focus:outline-none transition" required />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-black text-xs shadow-lg hover:from-rose-500 hover:to-rose-400 transition cursor-pointer">
              Verify & Unlock Portal →
            </button>
          </form>
          <div className="text-center pt-2 border-t border-slate-800">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-white transition">← Return to Application</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Nav Items ───────────────────────────────────────────────────────────────
  const NAV: { id: TabId; icon: string; label: string }[] = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "loans", icon: "💰", label: "Loans" },
    { id: "push", icon: "📣", label: "Broadcast" },
    { id: "staff", icon: "👔", label: "Staff" },
    { id: "support", icon: "🎧", label: "Support SLA" },
    { id: "risk", icon: "⚠️", label: "Risk Engine" },
    { id: "monad", icon: "🔗", label: "Monad Audit" },
    { id: "payments", icon: "💳", label: "Payments" },
    { id: "security", icon: "🔐", label: "Security" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  // ── Filtered Data ───────────────────────────────────────────────────────────
  const filteredUsers = userList.filter(u => {
    const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter = userFilter === "all" || u.status === userFilter || u.plan === userFilter;
    return matchSearch && matchFilter;
  });
  const filteredLoans = loanFilter === "all" ? loanList : loanList.filter(l => l.status === loanFilter || l.loan_type === loanFilter);
  const filteredPayments = paymentFilter === "all" ? paymentList : paymentList.filter(p => p.status === paymentFilter);

  // High risk users (multiple loans or high outstanding)
  const riskUsers = userList.filter(u => u.loansCount >= 2 || u.totalDebtVolume > 1000000);
  const overdueLoans = loanList.filter(l => l.status === "defaulted");

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-white flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative lg:block`}>
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-sm font-black">👑</div>
            <div>
              <p className="text-xs font-black text-white">SuperAdmin</p>
              <p className="text-[9px] text-rose-400 font-bold">CONTROL CENTER</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setActiveTab(n.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === n.id ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
              <span className="text-base w-5 text-center">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition">
            <span>←</span><span>Back to App</span>
          </Link>
          <button onClick={() => { localStorage.removeItem(SUPERADMIN_KEY); setIsAuthenticated(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition cursor-pointer">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h1 className="text-sm font-black text-white">{NAV.find(n => n.id === activeTab)?.icon} {NAV.find(n => n.id === activeTab)?.label}</h1>
              <p className="text-[10px] text-slate-500">DebtProof SuperAdmin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loadingStats && <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />}
            <button onClick={fetchAllData} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer">⟳ Refresh</button>
            <div className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black">SUPERADMIN</div>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">

          {/* ══════════ TAB 1: OVERVIEW ══════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard icon="👥" label="Total Users" value={stats?.total_users ?? userList.length} sub={`${stats?.active_users ?? "—"} active`} color="blue" />
                <KpiCard icon="💰" label="Active Loans" value={stats?.active_loans ?? "—"} sub={`${stats?.overdue_loans ?? 0} overdue`} color="rose" />
                <KpiCard icon="📉" label="Total Debt" value={stats ? fmt(stats.total_debt_volume) : "—"} sub={`${stats ? fmt(stats.total_outstanding) : "—"} outstanding`} color="amber" />
                <KpiCard icon="✅" label="Total Paid" value={stats ? fmt(stats.total_paid) : "—"} sub={`${stats?.total_payments ?? "—"} payments`} color="emerald" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Signups Chart */}
                <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-300 mb-3">📈 Monthly Signups (12 months)</h3>
                  {stats?.monthly_signups ? (
                    <MiniBarChart data={stats.monthly_signups.map(m => ({ label: m.month.split(" ")[0], value: m.count }))} color="#3b82f6" />
                  ) : <div className="h-20 flex items-center justify-center text-slate-600 text-xs">Loading chart...</div>}
                </div>

                {/* Loan Type Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-300 mb-3">🗂️ Loan Types</h3>
                  <div className="space-y-2">
                    {(stats?.loan_type_breakdown && stats.loan_type_breakdown.length > 0) ? stats.loan_type_breakdown.slice(0, 5).map(lt => {
                      const total = stats.loan_type_breakdown.reduce((s, x) => s + x.count, 0);
                      const pct = total > 0 ? Math.round((lt.count / total) * 100) : 0;
                      return (
                        <div key={lt.loan_type}>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[10px] text-slate-400">{LOAN_TYPE_LABEL[lt.loan_type] || lt.loan_type}</span>
                            <span className="text-[10px] font-bold text-white">{lt.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    }) : <p className="text-xs text-slate-500">No loan data yet</p>}
                  </div>
                </div>
              </div>

              {/* Platform Health */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Suspended Users", value: stats?.suspended_users ?? 0, icon: "🚫", c: "rose" },
                  { label: "Closed Loans", value: stats?.closed_loans ?? 0, icon: "✅", c: "emerald" },
                  { label: "Failed Payments", value: stats?.failed_payments ?? 0, icon: "❌", c: "amber" },
                  { label: "Staff Members", value: staffList.length, icon: "👔", c: "purple" },
                ].map((k, i) => <KpiCard key={i} icon={k.icon} label={k.label} value={k.value} color={k.c as any} />)}
              </div>

              {/* Recent Signups */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-black text-slate-300 mb-3">🆕 Recent Signups</h3>
                <div className="space-y-2">
                  {(stats?.recent_users ?? userList.slice(0, 5)).map((u, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-black">
                          {(u as any).name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{(u as any).name}</p>
                          <p className="text-[10px] text-slate-400">{(u as any).email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{(u as any).joined ?? (u as any).joinedDate ?? "—"}</span>
                    </div>
                  ))}
                  {(stats?.recent_users ?? userList).length === 0 && <p className="text-xs text-slate-500 text-center py-4">No users yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 2: USER DIRECTORY ══════════ */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <SectionHeader icon="👥" title="User Directory" sub={`${userList.length} registered users`} />
              <div className="flex flex-wrap gap-2">
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search name or email..." className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none" />
                {["all", "Active", "Suspended", "Free", "Pro", "Enterprise"].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${userFilter === f ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{f === "all" ? "All" : f}</button>
                ))}
              </div>
              <DataTable
                columns={["User", "Email", "Plan", "Loans", "Total Debt", "Joined", "Status", "Actions"]}
                rows={filteredUsers.map(u => [
                  <div key={u.id} className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-black shrink-0">{u.name?.charAt(0)?.toUpperCase()}</div><span className="font-bold text-white text-xs">{u.name}</span>{u.isSuperuser && <span className="text-[8px] px-1 py-0.5 bg-rose-500/20 text-rose-400 rounded-full font-bold">SUPER</span>}</div>,
                  <span key="e" className="text-slate-400">{u.email}</span>,
                  <span key="p" className="font-bold">{u.plan || "Free"}</span>,
                  <span key="l">{u.loansCount}</span>,
                  <span key="d" className="font-bold text-rose-400">{fmt(u.totalDebtVolume)}</span>,
                  <span key="j" className="text-slate-400">{u.joinedDate || "—"}</span>,
                  <StatusBadge key="s" status={u.status} />,
                  <div key="a" className="flex gap-1">
                    <button className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 transition cursor-pointer">Suspend</button>
                    <button className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 transition cursor-pointer">View</button>
                  </div>
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 3: LOAN MANAGEMENT ══════════ */}
          {activeTab === "loans" && (
            <div className="space-y-4">
              <SectionHeader icon="💰" title="Loan Management" sub={`${loanList.length} total loans across all users`} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                <KpiCard icon="📋" label="Total Loans" value={loanList.length} color="blue" />
                <KpiCard icon="✅" label="Active" value={loanList.filter(l => l.status === "active").length} color="emerald" />
                <KpiCard icon="🔴" label="Overdue" value={loanList.filter(l => l.status === "defaulted").length} color="rose" />
                <KpiCard icon="🏁" label="Closed" value={loanList.filter(l => l.status === "closed").length} color="purple" />
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "active", "defaulted", "closed", "on_hold", "home", "personal", "vehicle", "education", "business"].map(f => (
                  <button key={f} onClick={() => setLoanFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${loanFilter === f ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{LOAN_TYPE_LABEL[f]?.split(" ")[1] || f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <DataTable
                columns={["Loan Name", "User", "Type", "Principal", "EMI/mo", "Interest", "Status", "Date"]}
                rows={filteredLoans.map(l => [
                  <span key="n" className="font-bold text-white">{l.name}</span>,
                  <div key="u"><p className="font-bold text-xs">{l.user_name}</p><p className="text-[10px] text-slate-400">{l.user_email}</p></div>,
                  <span key="t">{LOAN_TYPE_LABEL[l.loan_type] || l.loan_type}</span>,
                  <span key="p" className="font-bold text-rose-400">{fmt(l.principal)}</span>,
                  <span key="e">{fmt(l.monthly_emi)}</span>,
                  <span key="i">{l.interest_rate}%</span>,
                  <StatusBadge key="s" status={l.status} />,
                  <span key="d" className="text-slate-400">{l.created_at}</span>,
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 4: PUSH NOTIFICATIONS ══════════ */}
          {activeTab === "push" && (
            <div className="max-w-2xl space-y-6">
              <SectionHeader icon="📣" title="Broadcast Notifications" sub="Send announcements to all or targeted users" />
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <form onSubmit={handleSendPushNotification} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notification Title *</label>
                      <input value={pushTitle} onChange={e => setPushTitle(e.target.value)} placeholder="e.g. EMI Reminder: July" required className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Body (HTML supported)</label>
                      <textarea value={pushBody} onChange={e => setPushBody(e.target.value)} rows={4} placeholder="Type your message here... <b>Bold</b>, <i>italic</i> supported" className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none resize-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image URL (optional)</label>
                      <input value={pushImageUrl} onChange={e => setPushImageUrl(e.target.value)} placeholder="https://..." className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CTA Button Text</label>
                      <input value={pushActionText} onChange={e => setPushActionText(e.target.value)} placeholder="Learn More" className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CTA URL</label>
                      <input value={pushActionUrl} onChange={e => setPushActionUrl(e.target.value)} placeholder="https://..." className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Audience</label>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {(["All", "Enterprise", "Pro", "Free"] as const).map(a => (
                        <button key={a} type="button" onClick={() => setTargetAudience(a)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${targetAudience === a ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{a === "All" ? "🌍 All Users" : a === "Enterprise" ? "⭐ Enterprise" : a === "Pro" ? "💎 Pro" : "🆓 Free"}</button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={!pushTitle.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-black text-xs shadow-lg hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">
                    📢 Broadcast Notification
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══════════ TAB 5: STAFF & TEAM ══════════ */}
          {activeTab === "staff" && (
            <div className="space-y-4">
              <SectionHeader icon="👔" title="Staff & Team Roles" sub={`${staffList.length} team members`}
                action={<button onClick={() => setShowAddStaffModal(true)} className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition cursor-pointer">+ Add Member</button>} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {staffList.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-black shrink-0">{s.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-white">{s.name}</p>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.roles.map(r => <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">{r}</span>)}
                      </div>
                      <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                        <span>✅ {s.queriesResolved} resolved</span>
                        <span>⭐ {s.avgRating.toFixed(1)} rating</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {showAddStaffModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
                    <h3 className="text-sm font-black text-white">Add Staff Member</h3>
                    <input placeholder="Full Name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    <input placeholder="Email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    <div className="flex gap-2 flex-wrap">
                      {(["SuperAdmin", "AdminManager", "CustomerSupport", "BillingFinance", "RiskAuditor", "Web3Governor"] as RoleType[]).map(r => (
                        <button key={r} type="button" onClick={() => setNewStaffRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${newStaffRoles.includes(r) ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"}`}>{r}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { if (!newStaffName.trim()) return; setStaffList(p => [...p, { id: `stf-${Date.now()}`, name: newStaffName, email: newStaffEmail, roles: newStaffRoles, status: "Active", queriesResolved: 0, avgRating: 5.0 }]); setShowAddStaffModal(false); setNewStaffName(""); setNewStaffEmail(""); }} className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-black hover:bg-rose-400 transition cursor-pointer">Add</button>
                      <button onClick={() => setShowAddStaffModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB 6: SUPPORT SLA ══════════ */}
          {activeTab === "support" && (
            <div className="space-y-4">
              <SectionHeader icon="🎧" title="Customer Support SLA" sub={`${SUPPORT_QUERIES.filter(q => q.status !== "Resolved").length} open tickets`} />
              <div className="grid grid-cols-3 gap-3 mb-2">
                <KpiCard icon="🔴" label="Urgent" value={SUPPORT_QUERIES.filter(q => q.priority === "Urgent").length} color="rose" />
                <KpiCard icon="🟡" label="High" value={SUPPORT_QUERIES.filter(q => q.priority === "High").length} color="amber" />
                <KpiCard icon="✅" label="Resolved" value={SUPPORT_QUERIES.filter(q => q.status === "Resolved").length} color="emerald" />
              </div>
              <DataTable
                columns={["User", "Plan", "Priority", "Subject", "Assigned To", "Status"]}
                rows={SUPPORT_QUERIES.map(q => [
                  <div key="u"><p className="font-bold text-xs text-white">{q.userName}</p><p className="text-[10px] text-slate-400">{q.userEmail}</p></div>,
                  <span key="p" className="text-[10px] font-bold">{q.userPlan}</span>,
                  <span key="pr" className={`text-[10px] font-black ${q.priority === "Urgent" ? "text-red-400" : q.priority === "High" ? "text-amber-400" : "text-slate-400"}`}>{q.priority}</span>,
                  <span key="s" className="text-xs">{q.subject}</span>,
                  <span key="a" className="text-[10px] text-blue-400">{q.assignedStaff}</span>,
                  <StatusBadge key="st" status={q.status} />,
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 7: RISK ENGINE ══════════ */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <SectionHeader icon="⚠️" title="Risk Engine" sub="High-risk users and defaulted loans flagged by the system" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                <KpiCard icon="🚨" label="High Risk Users" value={riskUsers.length} color="rose" />
                <KpiCard icon="💀" label="Defaulted Loans" value={overdueLoans.length} color="amber" />
                <KpiCard icon="📊" label="Avg Risk Score" value={riskUsers.length > 0 ? Math.round(riskUsers.reduce((s, u) => s + u.loansCount * 10 + (u.totalDebtVolume > 1000000 ? 30 : 0), 0) / riskUsers.length) : 0} color="purple" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/20">
                <h3 className="text-xs font-black text-red-400 mb-3">🚨 High Risk Users</h3>
                {riskUsers.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No high-risk users detected</p> : (
                  <div className="space-y-2">
                    {riskUsers.map(u => {
                      const riskScore = u.loansCount * 15 + (u.totalDebtVolume > 5000000 ? 40 : u.totalDebtVolume > 1000000 ? 20 : 0);
                      return (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xs font-black text-red-400">{u.name.charAt(0)}</div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email} • {u.loansCount} loans • {fmt(u.totalDebtVolume)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-red-400">{Math.min(riskScore, 99)}/99</p>
                            <p className="text-[9px] text-slate-500">Risk Score</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20">
                <h3 className="text-xs font-black text-amber-400 mb-3">⚡ Defaulted/Overdue Loans</h3>
                {overdueLoans.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No defaulted loans 🎉</p> : (
                  <DataTable
                    columns={["Loan", "User", "Principal", "EMI", "Status"]}
                    rows={overdueLoans.map(l => [
                      <span key="n" className="font-bold text-white">{l.name}</span>,
                      <div key="u"><p className="text-xs font-bold">{l.user_name}</p><p className="text-[10px] text-slate-400">{l.user_email}</p></div>,
                      <span key="p" className="text-rose-400 font-bold">{fmt(l.principal)}</span>,
                      <span key="e">{fmt(l.monthly_emi)}</span>,
                      <StatusBadge key="s" status={l.status} />,
                    ])}
                  />
                )}
              </div>
            </div>
          )}

          {/* ══════════ TAB 8: MONAD AUDIT ══════════ */}
          {activeTab === "monad" && (
            <div className="space-y-4">
              <SectionHeader icon="🔗" title="Monad On-Chain Audit" sub="Blockchain proof anchoring and ZK verification logs" />
              <div className="grid grid-cols-3 gap-3">
                <KpiCard icon="⛓️" label="Anchored Proofs" value={MONAD_LOGS.filter(l => l.status === "Confirmed").length} color="purple" />
                <KpiCard icon="⏳" label="Pending" value={MONAD_LOGS.filter(l => l.status === "Pending").length} color="amber" />
                <KpiCard icon="🛡️" label="Network" value="Monad Testnet" color="blue" />
              </div>
              <DataTable
                columns={["Tx Hash", "Block", "User", "Action", "Amount", "Time", "Status"]}
                rows={MONAD_LOGS.map(l => [
                  <span key="h" className="font-mono text-[10px] text-purple-400">{l.txHash}</span>,
                  <span key="b" className="font-mono text-[10px]">#{l.blockNumber.toLocaleString()}</span>,
                  <span key="u" className="text-[10px] text-slate-400">{l.userEmail}</span>,
                  <span key="a" className="text-[10px]">{l.action}</span>,
                  <span key="am" className="text-rose-400 font-bold">{fmt(l.amount)}</span>,
                  <span key="t" className="text-[10px] text-slate-400">{l.timestamp}</span>,
                  <StatusBadge key="s" status={l.status} />,
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 9: PAYMENT GATEWAY ══════════ */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <SectionHeader icon="💳" title="Payment Gateway Monitor" sub={`${paymentList.length} total transactions`} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard icon="✅" label="Confirmed" value={paymentList.filter(p => p.status === "confirmed").length} color="emerald" />
                <KpiCard icon="⏳" label="Pending" value={paymentList.filter(p => p.status === "pending").length} color="amber" />
                <KpiCard icon="❌" label="Failed" value={paymentList.filter(p => p.status === "failed").length} color="rose" />
                <KpiCard icon="💰" label="Total Paid" value={paymentList.filter(p => p.status === "confirmed").length > 0 ? fmt(paymentList.filter(p => p.status === "confirmed").reduce((s, p) => s + p.amount, 0)) : "₹0"} color="blue" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "confirmed", "pending", "failed", "refunded"].map(f => (
                  <button key={f} onClick={() => setPaymentFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${paymentFilter === f ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <DataTable
                columns={["User", "Loan", "Amount", "Method", "Date", "Status"]}
                rows={filteredPayments.map(p => [
                  <div key="u"><p className="font-bold text-xs text-white">{p.user_name}</p><p className="text-[10px] text-slate-400">{p.user_email}</p></div>,
                  <span key="l" className="text-[10px]">{p.loan_name}</span>,
                  <span key="a" className="font-black text-emerald-400">{fmt(p.amount)}</span>,
                  <span key="m" className="text-[10px] text-slate-400">{p.payment_method}</span>,
                  <span key="d" className="text-[10px] text-slate-400">{p.paid_on}</span>,
                  <StatusBadge key="s" status={p.status} />,
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 10: SECURITY AUDIT ══════════ */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <SectionHeader icon="🔐" title="Security Audit" sub="User account security status and login activity" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard icon="🟢" label="Active Accounts" value={userList.filter(u => u.status === "Active").length} color="emerald" />
                <KpiCard icon="🚫" label="Suspended" value={userList.filter(u => u.status === "Suspended").length} color="rose" />
                <KpiCard icon="👑" label="Superusers" value={userList.filter(u => u.isSuperuser).length} color="purple" />
                <KpiCard icon="🔑" label="Staff Members" value={staffList.length} color="blue" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-black text-slate-300 mb-3">📋 User Login Activity</h3>
                <DataTable
                  columns={["User", "Email", "Last Login", "Account Type", "Status"]}
                  rows={userList.map(u => [
                    <div key="n" className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-black">{u.name.charAt(0)}</div><span className="font-bold text-xs">{u.name}</span></div>,
                    <span key="e" className="text-[10px] text-slate-400">{u.email}</span>,
                    <span key="l" className={`text-[10px] ${u.lastLogin ? "text-emerald-400" : "text-slate-500"}`}>{u.lastLogin || "Never logged in"}</span>,
                    <span key="t" className="text-[10px]">{u.isSuperuser ? "👑 Superuser" : "👤 Regular"}</span>,
                    <StatusBadge key="s" status={u.status} />,
                  ])}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <h3 className="text-xs font-black text-emerald-400 mb-2">🛡️ Security Recommendations</h3>
                  <ul className="space-y-1.5">
                    {["Enable 2FA for all staff accounts", "Rotate SuperAdmin credentials quarterly", "Review suspended accounts monthly", "Audit superuser access permissions"].map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] text-slate-300"><span className="text-emerald-400">✓</span>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-300 mb-2">📊 Account Distribution</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Active Users", value: userList.filter(u => u.status === "Active").length, total: userList.length, color: "#10b981" },
                      { label: "Suspended Users", value: userList.filter(u => u.status === "Suspended").length, total: userList.length, color: "#f43f5e" },
                      { label: "Superusers", value: userList.filter(u => u.isSuperuser).length, total: userList.length, color: "#a855f7" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] mb-0.5"><span className="text-slate-400">{item.label}</span><span className="font-bold text-white">{item.value}/{item.total}</span></div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`, backgroundColor: item.color }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 11: ANALYTICS ══════════ */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <SectionHeader icon="📈" title="Analytics & Reports" sub="Platform growth and financial trends" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard icon="📅" label="Total Signups" value={stats?.total_users ?? userList.length} color="blue" />
                <KpiCard icon="💰" label="Total Debt Volume" value={stats ? fmt(stats.total_debt_volume) : "—"} color="rose" />
                <KpiCard icon="✅" label="Total Paid Out" value={stats ? fmt(stats.total_paid) : "—"} color="emerald" />
                <KpiCard icon="📉" label="Outstanding" value={stats ? fmt(stats.total_outstanding) : "—"} color="amber" />
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-black text-slate-300 mb-4">📊 Monthly User Signups (12 months)</h3>
                {stats?.monthly_signups && stats.monthly_signups.length > 0 ? (
                  <>
                    <MiniBarChart data={stats.monthly_signups.map(m => ({ label: m.month.split(" ")[0], value: m.count }))} color="#3b82f6" />
                    <div className="flex justify-between mt-2 overflow-x-auto">
                      {stats.monthly_signups.map((m, i) => <span key={i} className="text-[8px] text-slate-500 shrink-0 px-1">{m.month.split(" ")[0]}</span>)}
                    </div>
                  </>
                ) : <div className="h-20 flex items-center justify-center text-slate-600 text-xs">No signup data available</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-300 mb-4">🗂️ Loan Portfolio Breakdown</h3>
                  {stats?.loan_type_breakdown && stats.loan_type_breakdown.length > 0 ? (
                    <div className="space-y-2.5">
                      {stats.loan_type_breakdown.map(lt => {
                        const total = stats.loan_type_breakdown.reduce((s, x) => s + x.count, 0);
                        const pct = total > 0 ? Math.round((lt.count / total) * 100) : 0;
                        const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
                        const ci = stats.loan_type_breakdown.indexOf(lt);
                        return (
                          <div key={lt.loan_type}>
                            <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-300">{LOAN_TYPE_LABEL[lt.loan_type] || lt.loan_type}</span><span className="font-black text-white">{lt.count} ({pct}%)</span></div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[ci % colors.length] }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-xs text-slate-500 text-center py-4">No loans in database yet</p>}
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-300 mb-4">💳 Payment Success Rate</h3>
                  {paymentList.length > 0 ? (() => {
                    const confirmed = paymentList.filter(p => p.status === "confirmed").length;
                    const failed = paymentList.filter(p => p.status === "failed").length;
                    const pending = paymentList.filter(p => p.status === "pending").length;
                    const total = paymentList.length;
                    return (
                      <div className="space-y-2.5">
                        {[{ label: "Confirmed", value: confirmed, color: "#10b981" }, { label: "Pending", value: pending, color: "#f59e0b" }, { label: "Failed", value: failed, color: "#f43f5e" }].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-300">{item.label}</span><span className="font-black text-white">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span></div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, backgroundColor: item.color }} /></div>
                          </div>
                        ))}
                      </div>
                    );
                  })() : <p className="text-xs text-slate-500 text-center py-4">No payment data yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 12: SETTINGS ══════════ */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <SectionHeader icon="⚙️" title="Platform Settings" sub="Feature flags, maintenance mode and admin credentials" />

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-slate-300">🚦 Feature Flags</h3>
                {Object.entries(featureFlags).map(([key, val]) => {
                  const labels: Record<string, { label: string; desc: string; icon: string }> = {
                    emiAlerts: { label: "EMI Alerts", desc: "Automated EMI reminder notifications", icon: "📅" },
                    blockchainAudit: { label: "Blockchain Audit", desc: "Monad on-chain proof anchoring", icon: "🔗" },
                    aiInsights: { label: "AI Insights", desc: "AI-powered loan recommendations", icon: "🤖" },
                    creditScore: { label: "Credit Score", desc: "User credit score calculations", icon: "📊" },
                    darkMode: { label: "Dark Mode", desc: "Dark theme for all users by default", icon: "🌙" },
                    maintenanceMode: { label: "Maintenance Mode", desc: "⚠️ Disables app for all users", icon: "🔧" },
                  };
                  const meta = labels[key];
                  return (
                    <div key={key} className={`flex items-center justify-between gap-3 p-3 rounded-xl ${key === "maintenanceMode" && val ? "bg-red-500/10 border border-red-500/30" : "bg-slate-800/40 border border-slate-700/30"}`}>
                      <div className="flex items-center gap-2.5">
                        <span>{meta.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{meta.label}</p>
                          <p className="text-[10px] text-slate-400">{meta.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => setFeatureFlags(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${val ? (key === "maintenanceMode" ? "bg-red-500" : "bg-rose-500") : "bg-slate-700"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${val ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-slate-300">🔑 SuperAdmin Credentials</h3>
                <div className="space-y-2">
                  {[{ label: "SuperAdmin ID", value: "SUPERADMIN-DEBTPROOF-9901" }, { label: "Access Level", value: "FULL — All Permissions" }, { label: "Session Storage", value: "Browser LocalStorage" }].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                      <span className="text-[10px] text-slate-400">{item.label}</span>
                      <span className="text-[10px] font-mono font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { localStorage.removeItem(SUPERADMIN_KEY); setIsAuthenticated(false); }} className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition cursor-pointer">
                  🚪 Logout SuperAdmin Session
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-black text-slate-300 mb-3">🔗 Quick API Endpoints</h3>
                <div className="space-y-1.5">
                  {["/auth/superadmin/stats/", "/auth/superadmin/users/", "/auth/superadmin/loans/", "/auth/superadmin/payments/", "/notifications/broadcast/"].map(ep => (
                    <div key={ep} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0">GET</span>
                      <code className="text-[10px] text-slate-300 font-mono">{ep}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
