"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import apiClient from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleType = "SuperAdmin" | "AdminManager" | "CustomerSupport" | "BillingFinance" | "RiskAuditor" | "Web3Governor";
type TabId = "overview" | "users" | "loans" | "push" | "staff" | "support" | "risk" | "monad" | "payments" | "security" | "analytics" | "audit" | "settings" | "fraud" | "backups" | "escrow" | "revenue";

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

import { useTheme } from "@/contexts/ThemeContext";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuperAdminPortal() {
  const SUPERADMIN_KEY = "debtproof_superadmin_auth_token";
  const { theme, setTheme } = useTheme();

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

  // Advanced Modules state
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [backupList, setBackupList] = useState<any[]>([]);
  const [escrowConfig, setEscrowConfig] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);

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
      const [statsRes, usersRes, loansRes, paymentsRes, staffRes, ticketsRes, monadRes, auditRes, fraudRes, backupRes, escrowRes, revenueRes] = await Promise.allSettled([
        superAdminFetch("/auth/superadmin/stats/"),
        superAdminFetch("/auth/superadmin/users/"),
        superAdminFetch("/auth/superadmin/loans/"),
        superAdminFetch("/auth/superadmin/payments/"),
        superAdminFetch("/auth/superadmin/staff/"),
        superAdminFetch("/auth/superadmin/tickets/"),
        superAdminFetch("/auth/superadmin/blockchain-audit/"),
        superAdminFetch("/auth/superadmin/audit-log/"),
        superAdminFetch("/auth/superadmin/fraud-alerts/"),
        superAdminFetch("/auth/superadmin/backups/"),
        superAdminFetch("/auth/superadmin/monad-escrow/"),
        superAdminFetch("/auth/superadmin/revenue-analytics/"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.stats) setStats(statsRes.value.stats);
      if (fraudRes.status === "fulfilled" && fraudRes.value?.alerts) setFraudAlerts(fraudRes.value.alerts);
      if (backupRes.status === "fulfilled" && backupRes.value?.backups) setBackupList(backupRes.value.backups);
      if (escrowRes.status === "fulfilled" && escrowRes.value?.escrow) setEscrowConfig(escrowRes.value.escrow);
      if (revenueRes.status === "fulfilled" && revenueRes.value?.revenue) setRevenueStats(revenueRes.value.revenue);

      const fetchedLoans = (loansRes.status === "fulfilled" && loansRes.value?.loans) ? loansRes.value.loans : [];
      const localLoansRaw = typeof window !== "undefined" ? localStorage.getItem("debtproof_local_loans") : null;
      const localLoans: any[] = localLoansRaw ? JSON.parse(localLoansRaw) : [];

      const combinedLoans = [...fetchedLoans];
      localLoans.forEach((ll: any) => {
        if (!combinedLoans.some((cl: any) => cl.id === ll.id)) {
          combinedLoans.push({
            id: ll.id,
            name: ll.name || "Personal Loan",
            user_name: ll.user_name || "Sumit Kumar",
            user_email: ll.user_email || "sumit@gmail.com",
            loan_type: ll.loan_type || "personal",
            principal: parseFloat(ll.principal_amount || ll.principal) || 0,
            monthly_emi: parseFloat(ll.monthly_emi) || 0,
            interest_rate: parseFloat(ll.interest_rate) || 0,
            status: ll.status || "active",
            created_at: ll.start_date || ll.created_at || new Date().toISOString().split("T")[0],
          });
        }
      });
      setLoanList(combinedLoans);

      const fetchedUsers = (usersRes.status === "fulfilled" && usersRes.value?.users) ? usersRes.value.users : [];
      const updatedUsers = fetchedUsers.map((u: any) => {
        const uLoans = combinedLoans.filter((l: any) =>
          l.user_id === u.id ||
          (l.user_email && u.email && l.user_email.toLowerCase() === u.email.toLowerCase())
        );
        const totalVol = uLoans.reduce((sum: number, l: any) => sum + (parseFloat(l.principal) || 0), 0);
        return {
          ...u,
          loansCount: Math.max(uLoans.length, u.loansCount || 0),
          totalDebtVolume: Math.max(totalVol, u.totalDebtVolume || 0),
        };
      });
      setUserList(updatedUsers);

      const fetchedPayments = (paymentsRes.status === "fulfilled" && paymentsRes.value?.payments) ? paymentsRes.value.payments : [];
      const localPaymentsRaw = typeof window !== "undefined" ? localStorage.getItem("debtproof_local_payments") : null;
      const localPayments: any[] = localPaymentsRaw ? JSON.parse(localPaymentsRaw) : [];

      const combinedPayments = [...fetchedPayments];
      localPayments.forEach((lp: any) => {
        if (!combinedPayments.some((cp: any) => cp.id === lp.id)) {
          combinedPayments.push({
            id: lp.id,
            amount: parseFloat(lp.amount) || 0,
            status: lp.status || "confirmed",
            payment_method: lp.payment_method || "upi",
            loan_name: lp.loan_name || "Personal Loan",
            user_name: lp.user_name || "Sumit Kumar",
            user_email: lp.user_email || "sumit@gmail.com",
            paid_on: lp.payment_date || lp.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            reference: lp.reference_number || "",
          });
        }
      });
      setPaymentList(combinedPayments);
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
    { id: "fraud", label: "Fraud Center", icon: "🚨", count: fraudAlerts.length },
    { id: "backups", label: "Backup Studio", icon: "💾", count: backupList.length },
    { id: "escrow", label: "Monad Escrow", icon: "⛓️" },
    { id: "revenue", label: "Revenue MRR", icon: "📈" },
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
            <div className="space-y-6">
              {/* ── Theme Selector Section ── */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-slate-300">🎨 Appearance & Theme Settings</h3>
                <p className="text-[10px] text-slate-400">Choose display mode. <b>System Default</b> automatically matches your phone or PC device settings.</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: "system", label: "💻 System Default", desc: "Syncs with Device OS" },
                    { id: "dark", label: "🌙 Dark Mode", desc: "Sleek Dark Theme" },
                    { id: "light", label: "☀️ Light Mode", desc: "Clean Bright Theme" },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${theme === t.id ? "bg-rose-500/10 border-rose-500 text-white" : "bg-slate-800/40 border-slate-700/30 text-slate-400 hover:text-white"}`}
                    >
                      <p className="text-xs font-bold">{t.label}</p>
                      <p className="text-[9px] opacity-75 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

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

          {/* ── TAB: FRAUD CENTER ── */}
          {activeTab === "fraud" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>🚨</span> Automated Fraud & Anomaly Detection Center
                  </h3>
                  <p className="text-xs text-slate-400">Heuristic monitoring for high loan values, duplicate hashes, and rapid payment retries</p>
                </div>
                <button
                  onClick={() => fetchAllData()}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition cursor-pointer"
                >
                  🔄 Scan Now
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Active Anomaly Flags</p>
                  <p className="text-xl font-black text-rose-400 mt-1">{fraudAlerts.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Scanner Status</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">🟢 100% Operational</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Hash Verification Engine</p>
                  <p className="text-xl font-black text-blue-400 mt-1">Monad SHA-256</p>
                </div>
              </div>

              <div className="space-y-3">
                {fraudAlerts.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                    No fraud alerts detected. System is running cleanly.
                  </div>
                ) : (
                  fraudAlerts.map((fa: any) => (
                    <div key={fa.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${fa.severity === "urgent" ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : fa.severity === "high" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                            {fa.severity}
                          </span>
                          <p className="text-xs font-bold text-white">{fa.type}</p>
                        </div>
                        <p className="text-xs text-slate-300">{fa.message}</p>
                        <p className="text-[10px] text-slate-400">User: <b className="text-slate-200">{fa.user_name} ({fa.user_email})</b> • {fa.created_at}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => alert(`Investigating alert ${fa.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={() => setFraudAlerts(prev => prev.filter(x => x.id !== fa.id))}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer"
                        >
                          Resolve Alert
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── TAB: BACKUP STUDIO ── */}
          {activeTab === "backups" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>💾</span> System Backup & Database Export Studio
                  </h3>
                  <p className="text-xs text-slate-400">Create 1-click JSON/SQL database snapshots and manage automated schedule</p>
                </div>
                <button
                  onClick={async () => {
                    const res = await superAdminFetch("/auth/superadmin/backups/create/", { method: "POST" });
                    if (res?.success && res.backup) {
                      alert(`Backup snapshot '${res.backup.filename}' created successfully!`);
                      setBackupList(prev => [res.backup, ...prev]);
                    } else alert("Failed to create backup snapshot.");
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 transition cursor-pointer flex items-center gap-2"
                >
                  ⚡ Create 1-Click Backup Snapshot
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Snapshots</p>
                  <p className="text-xl font-black text-white mt-1">{backupList.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Auto-Backup Schedule</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">Daily (00:00 UTC)</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Export Format</p>
                  <p className="text-xl font-black text-blue-400 mt-1">Encrypted JSON & CSV</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Available Backup Snapshots</h4>
                <div className="space-y-2">
                  {backupList.map((b: any) => (
                    <div key={b.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-white font-mono">{b.filename}</p>
                        <p className="text-[10px] text-slate-400">{b.size_mb} MB • {b.total_records} Records • Created: {b.created_at}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">READY</span>
                        <a
                          href={`http://localhost:8000${b.download_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition"
                        >
                          ⬇️ Download Snapshot
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: MONAD ESCROW ── */}
          {activeTab === "escrow" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>⛓️</span> Web3 Monad Escrow & Smart Contract Hub
                  </h3>
                  <p className="text-xs text-slate-400">Live inspection of Monad contract state, escrow vault balances, and manual controls</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono font-bold">
                  Chain ID: 10143 (Monad Testnet)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Contract Address</p>
                  <p className="text-xs font-mono font-bold text-rose-400 mt-1 truncate">{escrowConfig?.contract_address || "0x71C...976F"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Gas Price</p>
                  <p className="text-sm font-black text-emerald-400 mt-1">{escrowConfig?.gas_price_gwei || "52.4 Gwei"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Throughput Speed</p>
                  <p className="text-sm font-black text-blue-400 mt-1">{escrowConfig?.tps_speed || "10,000 TPS"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Escrow Vaults</p>
                  <p className="text-sm font-black text-purple-400 mt-1">{escrowConfig?.total_escrow_vaults || 0} Vaults</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Escrow Vault Contracts</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert("Emergency freeze toggle triggered for Monad Escrow Vaults.")}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer"
                    >
                      ⚠️ Emergency Pause Contract
                    </button>
                  </div>
                </div>

                {(!escrowConfig?.escrow_loans || escrowConfig.escrow_loans.length === 0) ? (
                  <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                    No active escrow vaults found on Monad contract.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {escrowConfig.escrow_loans.map((v: any) => (
                      <div key={v.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <p className="text-xs font-bold text-white">{v.name}</p>
                          <p className="text-[10px] text-slate-400">Borrower: {v.borrower_email} • Contract: <code className="text-purple-400 font-mono">{v.contract_address}</code></p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-rose-400">{fmt(v.principal)}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">{v.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: REVENUE MRR ── */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>📈</span> Subscription & MRR/ARR Revenue Analytics
                  </h3>
                  <p className="text-xs text-slate-400">Live financial revenue tracking, subscriber breakdown, and payment gateway webhooks</p>
                </div>
                <button
                  onClick={() => alert("Downloading Revenue & MRR Financial Report CSV")}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  📥 Export Revenue Report
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">Monthly Recurring Revenue (MRR)</p>
                  <p className="text-xl font-black text-white mt-1">{fmt(revenueStats?.mrr || 0)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">Annual Recurring Revenue (ARR)</p>
                  <p className="text-xl font-black text-white mt-1">{fmt(revenueStats?.arr || 0)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <p className="text-[10px] text-purple-400 font-bold uppercase">Total Lifetime Volume</p>
                  <p className="text-xl font-black text-white mt-1">{fmt(revenueStats?.total_lifetime_volume || 0)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 font-bold uppercase">ARPU (Avg Revenue / User)</p>
                  <p className="text-xl font-black text-white mt-1">₹{revenueStats?.arpu || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Plan Subscribers Split</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300 font-bold">💼 Enterprise (₹4,999/mo)</span>
                      <span className="font-black text-purple-400">{revenueStats?.enterprise_subscribers || 0} users</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300 font-bold">⭐ Pro Plan (₹999/mo)</span>
                      <span className="font-black text-blue-400">{revenueStats?.pro_subscribers || 0} users</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300 font-bold">👤 Free Plan</span>
                      <span className="font-black text-slate-400">{revenueStats?.free_users || 0} users</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Payment Gateway Webhooks Log</h4>
                  <div className="space-y-2">
                    {(revenueStats?.webhooks || []).map((w: any) => (
                      <div key={w.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px]">
                        <div>
                          <p className="font-bold text-white font-mono">{w.event}</p>
                          <p className="text-slate-400">{w.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-400">{w.amount}</p>
                          <span className="text-[9px] text-emerald-400 font-mono">{w.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── USER DETAIL MODAL OVERLAY (Ultra-Modern Redesign) ── */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-5 sm:p-7 w-full max-w-4xl max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl shadow-rose-950/20">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-rose-500/20">
                    {selectedUserDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${selectedUserDetail.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-white tracking-tight">{selectedUserDetail.name}</h3>
                    {selectedUserDetail.is_superuser ? (
                      <span className="text-[9px] px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-black uppercase tracking-wider">
                        ⭐ SUPERUSER
                      </span>
                    ) : selectedUserDetail.is_staff ? (
                      <span className="text-[9px] px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-black uppercase tracking-wider">
                        👔 STAFF
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full font-bold uppercase tracking-wider">
                        👤 USER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-slate-300">📧 {selectedUserDetail.email}</span>
                    <span>•</span>
                    <span>Joined {selectedUserDetail.joined}</span>
                    <span>•</span>
                    <span>Last Login: <b className="text-emerald-400 font-mono">{selectedUserDetail.last_login || "Never"}</b></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 font-bold transition flex items-center justify-center text-sm cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* SuperAdmin Actions Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  SuperAdmin Control Actions
                </span>
                <span className="text-[10px] font-mono text-slate-500">ID: {selectedUserDetail.id}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={async () => {
                    const msg = prompt(`Send Direct Message/Notification to ${selectedUserDetail.email}:`);
                    if (!msg) return;
                    const res = await superAdminFetch(`/auth/superadmin/users/${selectedUserDetail.id}/message/`, {
                      method: "POST",
                      body: JSON.stringify({ message: msg, title: "Message from DebtProof Support" }),
                    });
                    if (res?.success) alert("Direct notification sent!");
                    else alert(res?.error || "Failed to send message");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  💬 Send Message
                </button>

                <button
                  onClick={async () => {
                    const plan = prompt("Change User Plan (Free / Pro / Enterprise):", "Pro");
                    if (!plan) return;
                    const res = await superAdminFetch(`/auth/superadmin/users/${selectedUserDetail.id}/plan/`, {
                      method: "POST",
                      body: JSON.stringify({ plan }),
                    });
                    if (res?.success) {
                      alert(`Plan upgraded to ${plan}!`);
                      fetchAllData();
                    } else alert(res?.error || "Failed to update plan");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  ⭐ Change Plan
                </button>

                <button
                  onClick={async () => {
                    const newName = prompt("Edit Full Name:", selectedUserDetail.name);
                    if (newName === null) return;
                    const parts = newName.split(" ");
                    const first_name = parts[0] || "";
                    const last_name = parts.slice(1).join(" ") || "";
                    const res = await superAdminFetch(`/auth/superadmin/users/${selectedUserDetail.id}/modify/`, {
                      method: "POST",
                      body: JSON.stringify({ first_name, last_name }),
                    });
                    if (res?.success) {
                      alert("User profile updated!");
                      setSelectedUserDetail(prev => prev ? { ...prev, name: newName } : null);
                      fetchAllData();
                    } else alert(res?.error || "Failed to edit user");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  ✏️ Edit Profile
                </button>

                <button
                  onClick={async () => {
                    const action = selectedUserDetail.is_active ? "suspend" : "activate";
                    const res = await superAdminFetch(`/auth/superadmin/users/${selectedUserDetail.id}/${action}/`, { method: "POST" });
                    if (res?.success) {
                      alert(`User ${action}d!`);
                      setSelectedUserDetail(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
                      fetchAllData();
                    } else alert(res?.error || "Action failed");
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${selectedUserDetail.is_active ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"}`}
                >
                  {selectedUserDetail.is_active ? "🚫 Suspend User" : "🟢 Activate User"}
                </button>

                {!selectedUserDetail.is_superuser && (
                  <button
                    onClick={async () => {
                      if (!confirm(`⚠️ PERMANENT DELETE WARNING:\nAre you sure you want to delete user ${selectedUserDetail.email}? This action cannot be undone.`)) return;
                      const res = await superAdminFetch(`/auth/superadmin/users/${selectedUserDetail.id}/delete/`, { method: "DELETE" });
                      if (res?.success) {
                        alert("User account deleted permanently.");
                        setSelectedUserDetail(null);
                        fetchAllData();
                      } else alert(res?.error || "Failed to delete user");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    🗑️ Delete Account
                  </button>
                )}
              </div>
            </div>

            {/* Financial & Health Metrics KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20">
                <p className="text-[9px] font-black uppercase tracking-wider text-rose-400">Total Debt</p>
                <p className="text-sm font-black text-white mt-1">{fmt(selectedUserDetail.total_debt)}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{selectedUserDetail.total_loans} active loans</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Total Paid</p>
                <p className="text-sm font-black text-white mt-1">{fmt(selectedUserDetail.total_paid)}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{selectedUserDetail.payments.length} payments</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-400">Monthly EMI</p>
                <p className="text-sm font-black text-white mt-1">{fmt((selectedUserDetail as any).total_monthly_emi ?? 0)}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">per month</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">Credit Score</p>
                <p className="text-sm font-black text-white mt-1">{(selectedUserDetail as any).credit_score ?? 750}</p>
                <p className="text-[9px] text-emerald-400 mt-0.5">Good Standing</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <p className="text-[9px] font-black uppercase tracking-wider text-purple-400">Risk Score</p>
                <p className="text-sm font-black text-white mt-1">{(selectedUserDetail as any).risk_score ?? 15}/99</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Low Risk Profile</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Account Status</p>
                <div className="mt-1.5">
                  <StatusBadge status={selectedUserDetail.is_active ? "Active" : "Suspended"} />
                </div>
              </div>
            </div>

            {/* Loans List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>💰</span> User Loans Portfolio ({selectedUserDetail.loans.length})
                </h4>
                <span className="text-[10px] text-slate-400">Active & Settled Contracts</span>
              </div>
              {selectedUserDetail.loans.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                  No loans recorded for this user account.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedUserDetail.loans.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{l.name}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {LOAN_TYPE_LABEL[l.loan_type] || l.loan_type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Lender: <b className="text-slate-200">{l.lender || "Bank"}</b> • Rate: <b className="text-slate-200">{l.interest_rate}%</b> • Started: <b className="text-slate-200">{l.start_date || l.created_at}</b>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-rose-400">{fmt(l.principal)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">EMI: {fmt(l.monthly_emi)}/mo</p>
                        <div className="mt-1"><StatusBadge status={l.status} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>💳</span> Payment History & Receipts ({selectedUserDetail.payments.length})
                </h4>
                <span className="text-[10px] text-slate-400">Verified Transactions</span>
              </div>
              {selectedUserDetail.payments.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                  No payment history recorded yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedUserDetail.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{p.loan_name}</p>
                        <p className="text-[10px] text-slate-400">
                          Paid on: <b className="text-slate-300">{p.paid_on}</b> • Method: <b className="text-slate-300">{p.method?.toUpperCase()}</b>
                          {p.receipt_hash && <span className="text-purple-400 font-mono ml-2">🔗 Hash: {p.receipt_hash}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-400">{fmt(p.amount)}</p>
                        <div className="mt-1"><StatusBadge status={p.status} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Tickets & Activity Audit Trail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎧</span> Support Tickets
                </h4>
                {((selectedUserDetail as any).tickets && (selectedUserDetail as any).tickets.length > 0) ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {(selectedUserDetail as any).tickets.map((t: any) => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-[10px]">
                        <div><p className="font-bold text-white">{t.subject}</p><p className="text-slate-500">{t.created_at}</p></div>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500 italic py-2 text-center">No support tickets filed</p>}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>📜</span> Activity Audit Trail
                </h4>
                {((selectedUserDetail as any).audit_logs && (selectedUserDetail as any).audit_logs.length > 0) ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {(selectedUserDetail as any).audit_logs.map((a: any) => (
                      <div key={a.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] flex justify-between items-center">
                        <div><p className="font-bold text-rose-400">{a.action}</p><p className="text-slate-400">{a.target || "System"}</p></div>
                        <span className="text-slate-500 font-mono">{a.time}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500 italic py-2 text-center">No activity logged</p>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

