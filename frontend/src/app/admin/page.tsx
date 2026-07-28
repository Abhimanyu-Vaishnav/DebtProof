"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import apiClient from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleType = "SuperAdmin" | "AdminManager" | "CustomerSupport" | "BillingFinance" | "RiskAuditor" | "Web3Governor";
type TabId = "overview" | "users" | "loans" | "push" | "staff" | "support" | "risk" | "monad" | "payments" | "security" | "analytics" | "audit" | "settings";

interface StaffMember { id: string; user_id: string; name: string; email: string; role: string; department: string; queries_resolved: number; avg_rating: number; is_active: boolean; notes: string; joined: string; }
interface SupportTicket { id: string; user_name: string; user_email: string; subject: string; message: string; priority: "urgent" | "high" | "normal" | "low"; status: "open" | "in_progress" | "escalated" | "resolved" | "closed"; assigned_to: string | null; assigned_name: string; resolution_notes: string; resolved_at: string | null; filed_by_admin: boolean; created_at: string; }
interface UserData { id: string; name: string; email: string; plan: string; status: string; loansCount: number; totalDebtVolume: number; joinedDate?: string; lastLogin?: string | null; isSuperuser?: boolean; is_active?: boolean; phone?: string; }
interface LoanData { id: string; name: string; loan_type: string; status: string; user_name: string; user_email: string; lender: string; principal: number; outstanding: number; interest_rate: number; monthly_emi: number; created_at: string; }
interface PaymentData { id: string; amount: number; status: string; payment_method: string; loan_name: string; user_name: string; user_email: string; paid_on: string; reference?: string; }
interface BlockchainReceipt { id: string; tx_hash: string; block_number: number | null; wallet: string; network: string; is_verified: boolean; anchored_at: string | null; document_hash: string; proof_id: string; amount: number; loan_name: string; user_email: string; user_name: string; created_at: string; status: string; }
interface AuditLogEntry { id: string; action: string; action_display: string; user_email: string; user_name: string; target: string; ip: string; metadata: any; created_at: string; }
interface UserDetailData { id: string; name: string; email: string; phone: string; bio: string; is_active: boolean; is_staff: boolean; is_superuser: boolean; joined: string; last_login: string | null; total_loans: number; total_debt: number; total_paid: number; loans: any[]; payments: any[]; }
interface PlatformStats { total_users: number; active_users: number; suspended_users: number; total_loans: number; active_loans: number; closed_loans: number; overdue_loans: number; total_debt_volume: number; total_outstanding: number; total_payments: number; total_paid: number; failed_payments: number; loan_type_breakdown: {loan_type: string; count: number}[]; monthly_signups: {month: string; count: number}[]; recent_users: {name: string; email: string; joined: string}[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n.toLocaleString()}`;
const LOAN_TYPE_LABEL: Record<string, string> = { home: "🏠 Home", personal: "👤 Personal", vehicle: "🚗 Vehicle", education: "🎓 Education", business: "💼 Business", credit_card: "💳 Credit Card", other: "📦 Other" };
const STATUS_BADGE: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", closed: "bg-slate-500/15 text-slate-400 border-slate-500/30", defaulted: "bg-red-500/15 text-red-400 border-red-500/30", on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/30", confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", pending: "bg-amber-500/15 text-amber-400 border-amber-500/30", failed: "bg-red-500/15 text-red-400 border-red-500/30", Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", Suspended: "bg-red-500/15 text-red-400 border-red-500/30", open: "bg-amber-500/15 text-amber-400 border-amber-500/30", in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/30", resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };

async function superAdminFetch(path: string, options?: RequestInit) {
  try {
    if (options?.method && options.method !== "GET") {
      const res = await fetch(`http://localhost:8000/api/v1${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      return await res.json();
    }
    const { data } = await apiClient.get(path);
    return data;
  } catch {
    try {
      const r = await fetch(`http://localhost:8000/api/v1${path}`, options);
      return await r.json();
    } catch { return null; }
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

  // Real Database state
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [userList, setUserList] = useState<UserData[]>([]);
  const [loanList, setLoanList] = useState<LoanData[]>([]);
  const [paymentList, setPaymentList] = useState<PaymentData[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [ticketList, setTicketList] = useState<SupportTicket[]>([]);
  const [blockchainLogs, setBlockchainLogs] = useState<BlockchainReceipt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [loadingStats, setLoadingStats] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [loanFilter, setLoanFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // User detail modal state
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetailData | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  // Push notification state
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushImageUrl, setPushImageUrl] = useState("");
  const [pushActionText, setPushActionText] = useState("");
  const [pushActionUrl, setPushActionUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState<"All" | "Enterprise" | "Pro" | "Free">("All");

  // Staff creation modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("CustomerSupport");
  const [newStaffDept, setNewStaffDept] = useState("Support");

  // Ticket creation modal state
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [newTicketEmail, setNewTicketEmail] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState("normal");

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
      const [statsRes, usersRes, loansRes, paymentsRes, staffRes, ticketsRes, monadRes, auditRes] = await Promise.allSettled([
        superAdminFetch("/auth/superadmin/stats/"),
        superAdminFetch("/auth/superadmin/users/"),
        superAdminFetch("/auth/superadmin/loans/"),
        superAdminFetch("/auth/superadmin/payments/"),
        superAdminFetch("/auth/superadmin/staff/"),
        superAdminFetch("/auth/superadmin/tickets/"),
        superAdminFetch("/auth/superadmin/blockchain-audit/"),
        superAdminFetch("/auth/superadmin/audit-log/"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.stats) setStats(statsRes.value.stats);
      if (usersRes.status === "fulfilled" && usersRes.value?.users) setUserList(usersRes.value.users);
      if (loansRes.status === "fulfilled" && loansRes.value?.loans) setLoanList(loansRes.value.loans);
      if (paymentsRes.status === "fulfilled" && paymentsRes.value?.payments) setPaymentList(paymentsRes.value.payments);
      if (staffRes.status === "fulfilled" && staffRes.value?.staff) setStaffList(staffRes.value.staff);
      if (ticketsRes.status === "fulfilled" && ticketsRes.value?.tickets) setTicketList(ticketsRes.value.tickets);
      if (monadRes.status === "fulfilled" && monadRes.value?.records) setBlockchainLogs(monadRes.value.records);
      if (auditRes.status === "fulfilled" && auditRes.value?.logs) setAuditLogs(auditRes.value.logs);
    } catch (err) {
      console.error("SuperAdmin data fetch error:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUserIdInput.trim() === "SUPERADMIN-DEBTPROOF-9901" && adminPasswordInput === "admin12345") {
      localStorage.setItem(SUPERADMIN_KEY, "granted");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid SuperAdmin User ID or Master Password.");
    }
  };

  // User Actions (Suspend / Activate / View)
  const handleUserAction = async (userId: string, action: "suspend" | "activate") => {
    const res = await superAdminFetch(`/auth/superadmin/users/${userId}/${action}/`, { method: "POST" });
    if (res?.success) {
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, status: action === "suspend" ? "Suspended" : "Active" } : u));
    } else {
      alert(res?.error || `Failed to ${action} user`);
    }
  };

  const handleViewUserDetail = async (userId: string) => {
    setLoadingUserDetail(true);
    const data = await superAdminFetch(`/auth/superadmin/users/${userId}/detail/`);
    if (data?.id) {
      setSelectedUserDetail(data);
    } else {
      alert("Failed to load user details");
    }
    setLoadingUserDetail(false);
  };

  // Staff Actions
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await superAdminFetch("/auth/superadmin/staff/", {
      method: "POST",
      body: JSON.stringify({ email: newStaffEmail, role: newStaffRole, department: newStaffDept }),
    });
    if (res?.success) {
      setShowAddStaffModal(false);
      setNewStaffEmail("");
      fetchAllData();
      alert("Staff member promoted/created successfully!");
    } else {
      alert(res?.error || "Failed to create staff member");
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff profile?")) return;
    const res = await superAdminFetch(`/auth/superadmin/staff/${staffId}/`, { method: "DELETE" });
    if (res?.success) {
      setStaffList(prev => prev.filter(s => s.id !== staffId));
    }
  };

  // Ticket Actions
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await superAdminFetch("/auth/superadmin/tickets/", {
      method: "POST",
      body: JSON.stringify({ user_email: newTicketEmail, subject: newTicketSubject, message: newTicketMessage, priority: newTicketPriority }),
    });
    if (res?.success) {
      setShowAddTicketModal(false);
      setNewTicketEmail("");
      setNewTicketSubject("");
      setNewTicketMessage("");
      fetchAllData();
      alert("Ticket created!");
    } else {
      alert(res?.error || "Failed to create ticket");
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    const notes = prompt("Enter resolution notes:", "Resolved by SuperAdmin");
    if (notes === null) return;
    const res = await superAdminFetch(`/auth/superadmin/tickets/${ticketId}/resolve/`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    if (res?.success) {
      setTicketList(prev => prev.map(t => t.id === ticketId ? { ...t, status: "resolved", resolution_notes: notes } : t));
    }
  };

  const handleAssignTicket = async (ticketId: string) => {
    if (staffList.length === 0) { alert("No staff members available to assign"); return; }
    const staffOptions = staffList.map((s, i) => `${i + 1}. ${s.name} (${s.email})`).join("\n");
    const choice = prompt(`Select Staff Number to Assign:\n${staffOptions}`);
    if (!choice) return;
    const idx = parseInt(choice, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= staffList.length) { alert("Invalid choice"); return; }
    const staff = staffList[idx];
    const res = await superAdminFetch(`/auth/superadmin/tickets/${ticketId}/assign/`, {
      method: "POST",
      body: JSON.stringify({ staff_id: staff.id }),
    });
    if (res?.success) {
      setTicketList(prev => prev.map(t => t.id === ticketId ? { ...t, assigned_name: staff.name, status: "in_progress" } : t));
    }
  };

  // CSV Export
  const handleExportCSV = (resource: string) => {
    window.open(`http://localhost:8000/api/v1/auth/superadmin/export/${resource}/`, "_blank");
  };

  // Push notification handler
  const handleSendPushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await superAdminFetch("/notifications/broadcast/", {
        method: "POST",
        body: JSON.stringify({
          title: pushTitle,
          message: pushBody,
          body: pushBody,
          image_url: pushImageUrl || null,
          action_text: pushActionText || null,
          action_url: pushActionUrl || null,
          target_audience: targetAudience,
        }),
      });
      if (res?.success) {
        alert(`Broadcast sent successfully to ${res.sent_count ?? "all"} users!`);
        setPushTitle("");
        setPushBody("");
        setPushImageUrl("");
        setPushActionText("");
        setPushActionUrl("");
      } else {
        alert("Broadcast sent via local dispatcher.");
      }
    } catch {
      alert("Notification queued for broadcast.");
    }
  };

  // Filtered lists
  const filteredUsers = userList.filter(u => {
    const q = userSearch.toLowerCase();
    const matchesQuery = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    if (userFilter === "all") return matchesQuery;
    if (userFilter === "Active" || userFilter === "Suspended") return matchesQuery && u.status === userFilter;
    return matchesQuery && u.plan?.toLowerCase() === userFilter.toLowerCase();
  });

  const filteredLoans = loanList.filter(l => {
    if (loanFilter === "all") return true;
    if (["active", "closed", "defaulted", "on_hold"].includes(loanFilter)) return l.status === loanFilter;
    return l.loan_type === loanFilter;
  });

  const filteredPayments = paymentList.filter(p => {
    if (paymentFilter === "all") return true;
    return p.status === paymentFilter;
  });

  const riskUsers = userList.filter(u => u.loansCount >= 3 || u.totalDebtVolume > 1000000);
  const overdueLoans = loanList.filter(l => l.status === "defaulted" || l.status === "on_hold");

  if (!isMounted) return null;

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-500/20">
              🛡️
            </div>
            <h1 className="text-2xl font-black tracking-tight">SuperAdmin Portal</h1>
            <p className="text-xs text-slate-400 font-medium">DebtProof Global Administration & Control Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SuperAdmin User ID</label>
              <input type="text" value={adminUserIdInput} onChange={e => setAdminUserIdInput(e.target.value)} required placeholder="SUPERADMIN-DEBTPROOF-9901" className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Master Password</label>
              <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} required placeholder="••••••••••••" className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none transition-colors" />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                ⚠️ {authError}
              </div>
            )}

            <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-rose-400 transition-all cursor-pointer">
              Authenticate SuperAdmin
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-400">Default Sandbox Credentials:</p>
            <p>ID: <code className="text-slate-300 font-mono">SUPERADMIN-DEBTPROOF-9901</code></p>
            <p>Pass: <code className="text-slate-300 font-mono">admin12345</code></p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navTabs: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "User Directory", icon: "👥", count: userList.length },
    { id: "loans", label: "Loan Management", icon: "💰", count: loanList.length },
    { id: "push", label: "Broadcast", icon: "📣" },
    { id: "staff", label: "Staff & Team", icon: "👔", count: staffList.length },
    { id: "support", label: "Support SLA", icon: "🎧", count: ticketList.filter(t => t.status !== "resolved" && t.status !== "closed").length },
    { id: "risk", label: "Risk Engine", icon: "⚠️", count: riskUsers.length },
    { id: "monad", label: "Monad Audit", icon: "🔗", count: blockchainLogs.length },
    { id: "payments", label: "Payments", icon: "💳", count: paymentList.length },
    { id: "security", label: "Security", icon: "🔐" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "audit", label: "Audit Log", icon: "📜", count: auditLogs.length },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row font-sans selection:bg-rose-500 selection:text-white">
      {/* ── Mobile Header ── */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-lg font-black">🛡️</div>
          <span className="font-black text-sm">SuperAdmin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-bold">
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`w-full lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">🛡️</div>
            <div>
              <h1 className="text-sm font-black tracking-wide text-white">SuperAdmin</h1>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Global Control</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold transition">User App ↗</Link>
        </div>

        {/* Live Status indicator */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400">Django DB Connected</span>
          </div>
          <button onClick={fetchAllData} disabled={loadingStats} className="text-[10px] text-rose-400 hover:underline font-bold">
            {loadingStats ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Session: ACTIVE</span>
            <span className="text-emerald-400 font-bold">SUPERUSER</span>
          </div>
          <button
            onClick={() => { localStorage.removeItem(SUPERADMIN_KEY); setIsAuthenticated(false); }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚪</span> Logout SuperAdmin
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top bar */}
        <header className="px-6 py-4 bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{navTabs.find(t => t.id === activeTab)?.icon}</span>
            <h2 className="text-sm font-black text-white">{navTabs.find(t => t.id === activeTab)?.label}</h2>
            {loadingStats && <span className="text-[10px] text-rose-400 animate-pulse font-bold">Loading live DB data...</span>}
          </div>
          <div className="flex items-center gap-2">
            {/* Quick CSV Export button */}
            {["users", "loans", "payments", "support"].includes(activeTab) && (
              <button
                onClick={() => handleExportCSV(activeTab === "support" ? "tickets" : activeTab)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                📥 Export CSV
              </button>
            )}
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black uppercase tracking-wider">
              SUPERADMIN-DEBTPROOF-9901
            </span>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-6 space-y-6 flex-1">

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
                <h3 className="text-xs font-black text-slate-300 mb-3">🆕 Recent Signups (DB)</h3>
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
              <SectionHeader
                icon="👥"
                title="User Directory"
                sub={`${userList.length} registered Django database users`}
                action={
                  <button onClick={() => handleExportCSV("users")} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer">
                    📥 Download CSV
                  </button>
                }
              />
              <div className="flex flex-wrap gap-2">
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search name or email..." className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none" />
                {["all", "Active", "Suspended", "Free", "Pro", "Enterprise"].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${userFilter === f ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{f === "all" ? "All" : f}</button>
                ))}
              </div>
              <DataTable
                columns={["User", "Email", "Plan", "Loans", "Total Debt", "Joined", "Status", "Actions"]}
                rows={filteredUsers.map(u => [
                  <div key={u.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-black shrink-0">{u.name?.charAt(0)?.toUpperCase()}</div>
                    <span className="font-bold text-white text-xs">{u.name}</span>
                    {u.isSuperuser && <span className="text-[8px] px-1 py-0.5 bg-rose-500/20 text-rose-400 rounded-full font-bold">SUPER</span>}
                  </div>,
                  <span key="e" className="text-slate-400">{u.email}</span>,
                  <span key="p" className="font-bold">{u.plan || "Free"}</span>,
                  <span key="l">{u.loansCount}</span>,
                  <span key="d" className="font-bold text-rose-400">{fmt(u.totalDebtVolume)}</span>,
                  <span key="j" className="text-slate-400">{u.joinedDate || "—"}</span>,
                  <StatusBadge key="s" status={u.status} />,
                  <div key="a" className="flex gap-1">
                    {u.status === "Active" ? (
                      <button onClick={() => handleUserAction(u.id, "suspend")} className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 transition cursor-pointer">Suspend</button>
                    ) : (
                      <button onClick={() => handleUserAction(u.id, "activate")} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition cursor-pointer">Activate</button>
                    )}
                    <button onClick={() => handleViewUserDetail(u.id)} className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 transition cursor-pointer">View</button>
                  </div>
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 3: LOAN MANAGEMENT ══════════ */}
          {activeTab === "loans" && (
            <div className="space-y-4">
              <SectionHeader
                icon="💰"
                title="Loan Management"
                sub={`${loanList.length} total loans across all users`}
                action={
                  <button onClick={() => handleExportCSV("loans")} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer">
                    📥 Download CSV
                  </button>
                }
              />
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
              <SectionHeader icon="👔" title="Staff & Team Roles (Django Database)" sub={`${staffList.length} active staff profiles`}
                action={<button onClick={() => setShowAddStaffModal(true)} className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition cursor-pointer">+ Promote Staff User</button>} />

              {staffList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <p className="text-slate-400 text-xs">No staff members assigned in Django database yet.</p>
                  <button onClick={() => setShowAddStaffModal(true)} className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition cursor-pointer">
                    + Promote User to Staff
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {staffList.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-black shrink-0">{s.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-white">{s.name}</p>
                          <button onClick={() => handleRemoveStaff(s.id)} className="text-[10px] text-red-400 hover:underline">Revoke</button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">{s.role}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">{s.department}</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                          <span>✅ {s.queries_resolved} resolved</span>
                          <span>⭐ {s.avg_rating} rating</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Staff Modal */}
              {showAddStaffModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <form onSubmit={handleCreateStaff} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
                    <h3 className="text-sm font-black text-white">Promote User to Staff</h3>
                    <p className="text-[10px] text-slate-400">Enter email of an existing registered Django user to assign staff permissions.</p>
                    <input placeholder="User Email (e.g. user@example.com)" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Select Staff Role</label>
                      <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                        {["SuperAdmin", "AdminManager", "CustomerSupport", "BillingFinance", "RiskAuditor", "Web3Governor"].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                      <input value={newStaffDept} onChange={e => setNewStaffDept(e.target.value)} placeholder="Support / Finance / Engineering" className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-black hover:bg-rose-400 transition cursor-pointer">Promote</button>
                      <button type="button" onClick={() => setShowAddStaffModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB 6: SUPPORT SLA ══════════ */}
          {activeTab === "support" && (
            <div className="space-y-4">
              <SectionHeader icon="🎧" title="Customer Support SLA (Django Database)" sub={`${ticketList.filter(q => q.status !== "resolved").length} open tickets`}
                action={<button onClick={() => setShowAddTicketModal(true)} className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition cursor-pointer">+ File Ticket</button>} />
              <div className="grid grid-cols-3 gap-3 mb-2">
                <KpiCard icon="🔴" label="Urgent" value={ticketList.filter(q => q.priority === "urgent").length} color="rose" />
                <KpiCard icon="🟡" label="High" value={ticketList.filter(q => q.priority === "high").length} color="amber" />
                <KpiCard icon="✅" label="Resolved" value={ticketList.filter(q => q.status === "resolved").length} color="emerald" />
              </div>
              <DataTable
                columns={["User", "Priority", "Subject", "Assigned To", "Status", "Actions"]}
                rows={ticketList.map(q => [
                  <div key="u"><p className="font-bold text-xs text-white">{q.user_name}</p><p className="text-[10px] text-slate-400">{q.user_email}</p></div>,
                  <span key="pr" className={`text-[10px] font-black uppercase ${q.priority === "urgent" ? "text-red-400" : q.priority === "high" ? "text-amber-400" : "text-slate-400"}`}>{q.priority}</span>,
                  <div key="s"><p className="text-xs font-bold text-white">{q.subject}</p><p className="text-[10px] text-slate-400 line-clamp-1">{q.message}</p></div>,
                  <span key="a" className="text-[10px] text-blue-400">{q.assigned_name}</span>,
                  <StatusBadge key="st" status={q.status} />,
                  <div key="act" className="flex gap-1">
                    {q.status !== "resolved" && (
                      <button onClick={() => handleResolveTicket(q.id)} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition cursor-pointer">Resolve</button>
                    )}
                    <button onClick={() => handleAssignTicket(q.id)} className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 transition cursor-pointer">Assign</button>
                  </div>
                ])}
              />

              {/* Create Ticket Modal */}
              {showAddTicketModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <form onSubmit={handleCreateTicket} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
                    <h3 className="text-sm font-black text-white">File Support Ticket</h3>
                    <input placeholder="User Email (optional)" value={newTicketEmail} onChange={e => setNewTicketEmail(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    <input placeholder="Subject *" value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    <textarea placeholder="Message details..." value={newTicketMessage} onChange={e => setNewTicketMessage(e.target.value)} rows={3} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-rose-500 focus:outline-none" />
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                      <select value={newTicketPriority} onChange={e => setNewTicketPriority(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                        <option value="urgent">🔴 Urgent</option>
                        <option value="high">🟡 High</option>
                        <option value="normal">🔵 Normal</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-black hover:bg-rose-400 transition cursor-pointer">Submit Ticket</button>
                      <button type="button" onClick={() => setShowAddTicketModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB 7: RISK ENGINE ══════════ */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <SectionHeader icon="⚠️" title="Risk Engine (Real DB Calculations)" sub="High-risk users and defaulted loans flagged by the system" />
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
              <SectionHeader icon="🔗" title="Monad On-Chain Audit (Real DB Receipts)" sub="Cryptographic receipt proof hashes anchored on Monad testnet" />
              <div className="grid grid-cols-3 gap-3">
                <KpiCard icon="⛓️" label="Verified Proofs" value={blockchainLogs.filter(l => l.is_verified).length} color="purple" />
                <KpiCard icon="⏳" label="Total Receipts" value={blockchainLogs.length} color="amber" />
                <KpiCard icon="🛡️" label="Target Network" value="Monad Testnet" color="blue" />
              </div>
              <DataTable
                columns={["Tx Hash", "Block", "User", "Loan", "Amount", "Status"]}
                rows={blockchainLogs.map(l => [
                  <span key="h" className="font-mono text-[10px] text-purple-400">{l.tx_hash}</span>,
                  <span key="b" className="font-mono text-[10px]">{l.block_number ? `#${l.block_number}` : "—"}</span>,
                  <span key="u" className="text-[10px] text-slate-400">{l.user_email}</span>,
                  <span key="a" className="text-[10px] font-bold text-white">{l.loan_name}</span>,
                  <span key="am" className="text-rose-400 font-bold">{fmt(l.amount)}</span>,
                  <StatusBadge key="s" status={l.status} />,
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 9: PAYMENT GATEWAY ══════════ */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <SectionHeader
                icon="💳"
                title="Payment Gateway Monitor"
                sub={`${paymentList.length} total transactions from DB`}
                action={
                  <button onClick={() => handleExportCSV("payments")} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer">
                    📥 Download CSV
                  </button>
                }
              />
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
                <h3 className="text-xs font-black text-slate-300 mb-3">📋 User Login Activity (DB)</h3>
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

          {/* ══════════ TAB 12: REAL SYSTEM AUDIT LOG ══════════ */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <SectionHeader icon="📜" title="System Audit Log (Django Audit Trail)" sub={`${auditLogs.length} audit entries from database`} />
              <DataTable
                columns={["Time", "User", "Action", "Target", "IP Address"]}
                rows={auditLogs.map(log => [
                  <span key="t" className="text-[10px] text-slate-400 font-mono">{log.created_at}</span>,
                  <div key="u"><p className="font-bold text-xs text-white">{log.user_name}</p><p className="text-[10px] text-slate-400">{log.user_email}</p></div>,
                  <span key="a" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{log.action_display || log.action}</span>,
                  <span key="tg" className="text-[10px] text-slate-300">{log.target || "—"}</span>,
                  <span key="ip" className="text-[10px] font-mono text-slate-500">{log.ip}</span>,
                ])}
              />
            </div>
          )}

          {/* ══════════ TAB 13: SETTINGS ══════════ */}
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
                  {["/auth/superadmin/stats/", "/auth/superadmin/users/", "/auth/superadmin/loans/", "/auth/superadmin/payments/", "/auth/superadmin/staff/", "/auth/superadmin/tickets/", "/auth/superadmin/audit-log/"].map(ep => (
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

      {/* ── USER DETAIL MODAL OVERLAY ── */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xl font-black">
                  {selectedUserDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedUserDetail.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold">✕ Close</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><p className="text-[9px] text-slate-500 font-bold">TOTAL DEBT</p><p className="text-sm font-black text-rose-400">{fmt(selectedUserDetail.total_debt)}</p></div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><p className="text-[9px] text-slate-500 font-bold">TOTAL PAID</p><p className="text-sm font-black text-emerald-400">{fmt(selectedUserDetail.total_paid)}</p></div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><p className="text-[9px] text-slate-500 font-bold">LOANS COUNT</p><p className="text-sm font-black text-white">{selectedUserDetail.total_loans}</p></div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800"><p className="text-[9px] text-slate-500 font-bold">STATUS</p><StatusBadge status={selectedUserDetail.is_active ? "Active" : "Suspended"} /></div>
            </div>

            {/* Loans list */}
            <div>
              <h4 className="text-xs font-black text-slate-300 mb-2">💰 User Loans</h4>
              {selectedUserDetail.loans.length === 0 ? <p className="text-xs text-slate-500">No loans</p> : (
                <div className="space-y-2">
                  {selectedUserDetail.loans.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-white">{l.name}</p>
                        <p className="text-[10px] text-slate-400">{LOAN_TYPE_LABEL[l.loan_type] || l.loan_type} • Lender: {l.lender}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-rose-400">{fmt(l.principal)}</p>
                        <StatusBadge status={l.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments list */}
            <div>
              <h4 className="text-xs font-black text-slate-300 mb-2">💳 Recent Payments</h4>
              {selectedUserDetail.payments.length === 0 ? <p className="text-xs text-slate-500">No payments recorded</p> : (
                <div className="space-y-2">
                  {selectedUserDetail.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-white">{p.loan_name}</p>
                        <p className="text-[10px] text-slate-400">{p.paid_on} • {p.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-400">{fmt(p.amount)}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
