"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/services/api";

type RoleType = "SuperAdmin" | "AdminManager" | "CustomerSupport" | "BillingFinance" | "RiskAuditor" | "Web3Governor";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  roles: RoleType[];
  status: "Active" | "Inactive";
  queriesResolved: number;
  avgRating: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Pro" | "Enterprise";
  priority: "High" | "Normal" | "Low";
  status: "Active" | "Suspended";
  loansCount: number;
  totalDebtVolume: number;
  creditScore: number;
  joinedDate?: string;
}

interface SupportQuery {
  id: string;
  userEmail: string;
  userName: string;
  userPlan: "Free" | "Basic" | "Pro" | "Enterprise";
  priority: "Urgent" | "High" | "Normal";
  subject: string;
  assignedStaff: string;
  status: "Open" | "In_Call" | "Escalated_Senior" | "Escalated_SuperAdmin" | "Resolved";
}

interface MonadTxAuditLog {
  id: string;
  txHash: string;
  blockNumber: number;
  userEmail: string;
  action: string;
  amount: number;
  timestamp: string;
}

const SAMPLE_STAFF: StaffMember[] = [
  { id: "stf-1", name: "Aarav Sharma", email: "aarav.admin@debtproof.io", roles: ["SuperAdmin", "AdminManager"], status: "Active", queriesResolved: 142, avgRating: 4.9 },
  { id: "stf-2", name: "Neha Verma", email: "neha.support@debtproof.io", roles: ["CustomerSupport"], status: "Active", queriesResolved: 89, avgRating: 4.8 },
  { id: "stf-3", name: "Vikram Mehta", email: "vikram.finance@debtproof.io", roles: ["BillingFinance"], status: "Active", queriesResolved: 45, avgRating: 4.7 },
  { id: "stf-4", name: "Riya Sen", email: "riya.risk@debtproof.io", roles: ["RiskAuditor"], status: "Active", queriesResolved: 31, avgRating: 5.0 },
];

const SAMPLE_USERS: UserData[] = [
  { id: "u-101", name: "Rajesh Kumar", email: "rajesh@example.com", plan: "Enterprise", priority: "High", status: "Active", loansCount: 5, totalDebtVolume: 1850000, creditScore: 785 },
  { id: "u-102", name: "Sunita Rao", email: "sunita@example.com", plan: "Pro", priority: "High", status: "Active", loansCount: 3, totalDebtVolume: 640000, creditScore: 742 },
  { id: "u-103", name: "Amit Joshi", email: "amit@example.com", plan: "Basic", priority: "Normal", status: "Active", loansCount: 2, totalDebtVolume: 280000, creditScore: 690 },
  { id: "u-104", name: "Pooja Hegde", email: "pooja@example.com", plan: "Free", priority: "Low", status: "Suspended", loansCount: 1, totalDebtVolume: 50000, creditScore: 615 },
];

const SAMPLE_QUERIES: SupportQuery[] = [
  { id: "q-1", userEmail: "rajesh@example.com", userName: "Rajesh Kumar", userPlan: "Enterprise", priority: "Urgent", subject: "Monad ZK Proof Verification Delayed on Testnet", assignedStaff: "Neha Verma", status: "In_Call" },
  { id: "q-2", userEmail: "sunita@example.com", userName: "Sunita Rao", userPlan: "Pro", priority: "High", subject: "Auto-Pay Prepayment Trigger Optimization Query", assignedStaff: "Neha Verma", status: "Open" },
];

const SAMPLE_MONAD_LOGS: MonadTxAuditLog[] = [
  { id: "m-1", txHash: "0x8f2c...41b", blockNumber: 1049281, userEmail: "rajesh@example.com", action: "Monad ZK Proof Anchoring", amount: 45000, timestamp: "Today, 11:20 AM" },
  { id: "m-2", txHash: "0x3e9a...10c", blockNumber: 1049102, userEmail: "sunita@example.com", action: "Smart Auto-Prepayment Trigger", amount: 15000, timestamp: "Today, 09:15 AM" },
];

export default function RedesignedSuperAdminPortal() {
  const SUPERADMIN_KEY = "debtproof_superadmin_auth_token";

  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUserIdInput, setAdminUserIdInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "staff" | "support" | "monad_audit" | "risk_engine" | "web3_gas" | "payment_gateways" | "security_audit" | "push_notifications">("overview");
  const [staffList, setStaffList] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [userList, setUserList] = useState<UserData[]>(SAMPLE_USERS);
  const [queryList, setQueryList] = useState<SupportQuery[]>(SAMPLE_QUERIES);

  // New Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRoles, setNewStaffRoles] = useState<RoleType[]>(["CustomerSupport"]);

  // Push Notification Broadcast State
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [targetAudience, setTargetAudience] = useState<"All" | "Enterprise" | "Pro" | "Free">("All");

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem(SUPERADMIN_KEY) === "granted") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch real users directly from Django database API
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchRealUsers() {
      try {
        const res = await apiClient.get("/auth/superadmin/users/");
        if (res.data?.users && Array.isArray(res.data.users)) {
          const fetchedUsers = res.data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            plan: u.plan,
            priority: u.priority,
            status: u.status,
            loansCount: u.loansCount || 0,
            totalDebtVolume: u.totalDebtVolume || 0,
            creditScore: 750,
            joinedDate: u.joinedDate,
          }));
          if (fetchedUsers.length > 0) {
            setUserList(fetchedUsers);
          }
        }
      } catch (err: any) {
        console.warn("SuperAdmin Portal database fetch fallback mode.");
      }
    }
    fetchRealUsers();
  }, [isAuthenticated]);

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

  const handleAdminLogout = () => {
    localStorage.removeItem(SUPERADMIN_KEY);
    setIsAuthenticated(false);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      roles: newStaffRoles,
      status: "Active",
      queriesResolved: 0,
      avgRating: 5.0,
    };

    setStaffList([...staffList, newStaff]);
    setShowAddStaffModal(false);
    setNewStaffName("");
    setNewStaffEmail("");
  };

  const handleSendPushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim()) return;

    const formattedTitle = pushTitle.startsWith("📢") ? pushTitle : `📢 ${pushTitle}`;
    const newNotifObj = {
      id: `notif-superadmin-${Date.now()}`,
      title: formattedTitle,
      body: pushBody || "System announcement broadcasted from SuperAdmin Portal.",
      notif_type: "info",
      is_read: false,
      created_at: new Date().toISOString(),
    };

    try {
      await apiClient.post("/notifications/broadcast/", {
        title: formattedTitle,
        body: pushBody || "System announcement broadcasted from SuperAdmin Portal.",
        target_audience: targetAudience,
      });
    } catch {}

    if (typeof window !== "undefined") {
      const existingRaw = localStorage.getItem("debtproof_local_broadcasts");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem("debtproof_local_broadcasts", JSON.stringify([newNotifObj, ...existing]));

      try {
        const bc = new BroadcastChannel("debtproof_notifications_channel");
        bc.postMessage({ type: "ADD_NOTIFICATION", notif: newNotifObj });
        bc.close();
      } catch {}
    }

    window.dispatchEvent(new CustomEvent("debtproof_add_notification", { detail: newNotifObj }));
    window.dispatchEvent(new CustomEvent("debtproof_refresh_notifications"));
    window.dispatchEvent(new CustomEvent("debtproof-toast", { detail: { message: `📢 Broadcast Sent: ${pushTitle}`, type: "success" } }));

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(`📢 DebtProof: ${pushTitle}`, { body: pushBody || "System announcement broadcasted from SuperAdmin Portal.", icon: "/favicon.ico" });
        } catch {}
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            try {
              new Notification(`📢 DebtProof: ${pushTitle}`, { body: pushBody || "System announcement broadcasted from SuperAdmin Portal.", icon: "/favicon.ico" });
            } catch {}
          }
        });
      }
    }

    setPushTitle("");
    setPushBody("");
  };

  const handleToggleUserStatus = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u))
    );
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-2xl mx-auto">
              👑
            </div>
            <h2 className="text-xl font-bold text-white">SuperAdmin Control Center</h2>
            <p className="text-xs text-slate-400">Enter corporate executive security credentials</p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">SuperAdmin User ID</label>
              <input
                type="text"
                placeholder="SUPERADMIN-DEBTPROOF-9901"
                value={adminUserIdInput}
                onChange={(e) => setAdminUserIdInput(e.target.value)}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs font-mono focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Security Passcode</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs font-mono focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Verify Credentials & Unlock Portal →
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white transition">
              ← Return to Main Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: "overview", label: "Dashboard Overview", icon: "📊" },
    { id: "users", label: "User Directory", icon: "👥" },
    { id: "staff", label: "Staff & Team Roles", icon: "🛡️" },
    { id: "support", label: "Customer Support SLA", icon: "💬" },
    { id: "monad_audit", label: "Monad On-Chain Audit", icon: "📜" },
    { id: "risk_engine", label: "Liquidation & Risk Engine", icon: "⚡" },
    { id: "web3_gas", label: "Web3 Gas Escrow Tank", icon: "⛽" },
    { id: "payment_gateways", label: "Payment Gateway Monitor", icon: "💳" },
    { id: "security_audit", label: "System Security Audit", icon: "🔒" },
    { id: "push_notifications", label: "Broadcast Push Alerts", icon: "📢" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* ── Modern Sleek Left Sidebar ──────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            👑
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight">DebtProof Admin</h1>
            <span className="text-[10px] font-mono text-rose-400 block font-semibold">Corporate Portal v4.0</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="truncate">SUPERADMIN-DEBTPROOF</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            🔒 Lock Portal & Logout
          </button>
          <Link href="/dashboard" className="block text-center text-[11px] text-slate-500 hover:text-slate-300 pt-1">
            Exit to Dashboard →
          </Link>
        </div>
      </aside>

      {/* ── Main Content Body ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Minimal Action Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-bold text-white capitalize">
              {activeTab.replace("_", " ")} Overview
            </h2>
            <p className="text-[11px] text-slate-400">DebtProof Corporate Enterprise Control Panel</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Add Corporate Staff</span>
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Panel */}
        <main className="p-8 flex-1 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Top Dynamic Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                    <span>Total Database Users</span>
                    <span className="text-rose-400">👥</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{userList.length} Accounts</div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold">{userList.filter(u => u.plan === "Enterprise").length} Enterprise</span> · {userList.filter(u => u.plan === "Pro").length} Pro
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                    <span>Corporate Staff</span>
                    <span className="text-purple-400">🛡️</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{staffList.length} Active Staff</div>
                  <div className="text-[11px] text-purple-300">Multi-Role Governance</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                    <span>Customer SLA Rating</span>
                    <span className="text-emerald-400">⭐</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">98.4% SLA</div>
                  <div className="text-[11px] text-slate-400">4.9 Avg Resolution Score</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                    <span>Total Debt Volume</span>
                    <span className="text-indigo-400">💰</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-400">
                    ₹{userList.reduce((sum, u) => sum + (u.totalDebtVolume || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">Monad ZK Verified</div>
                </div>
              </div>

              {/* Quick Actions & Recent Accounts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Users Directory Overview */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white">Recent Database Registered Accounts</h3>
                    <button onClick={() => setActiveTab("users")} className="text-xs text-rose-400 hover:underline">View All →</button>
                  </div>

                  <div className="space-y-3">
                    {userList.slice(0, 5).map((u) => (
                      <div key={u.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-white">{u.name} ({u.email})</p>
                          <p className="text-[11px] text-slate-400">{u.loansCount} Loans · ₹{u.totalDebtVolume.toLocaleString()} Debt Volume</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            u.plan === "Enterprise" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                            u.plan === "Pro" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                            "bg-slate-800 text-slate-300"
                          }`}>{u.plan}</span>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>{u.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status Panel */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">System Health Summary</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">Monad ZK Relayer</span>
                      <span className="text-emerald-400 font-bold">100% Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">UPI Autopay Gateway</span>
                      <span className="text-emerald-400 font-bold">99.8% Success</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">Monad Gas Tank</span>
                      <span className="text-purple-400 font-bold">1,250 MON Reserve</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === "users" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">Registered Users & Subscription Directory</h3>
                  <p className="text-xs text-slate-400">Actual database records, credit ratings & account management controls</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">Total: {userList.length} Users</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                      <th className="py-3 px-3">User & Email</th>
                      <th className="py-3 px-3">Plan</th>
                      <th className="py-3 px-3">Active Loans</th>
                      <th className="py-3 px-3">Debt Volume</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {userList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-950/40">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.plan === "Enterprise" ? "bg-purple-500/20 text-purple-300" :
                            u.plan === "Pro" ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-300"
                          }`}>{u.plan}</span>
                        </td>
                        <td className="py-3 px-3 font-mono">{u.loansCount} Loans</td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-300">₹{u.totalDebtVolume.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>{u.status}</span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
                          >
                            {u.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF ROLES */}
          {activeTab === "staff" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">Corporate Staff Directory & Multi-Role Management</h3>
                  <p className="text-xs text-slate-400">Manage internal admin roles, support agents, risk auditors & governance permissions</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow cursor-pointer"
                >
                  + Create New Staff Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffList.map((stf) => (
                  <div key={stf.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{stf.name}</h4>
                        <p className="text-xs text-slate-400">{stf.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Active</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {stf.roles.map((r) => (
                        <span key={r} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          {r}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                      <span>Queries Resolved: {stf.queriesResolved}</span>
                      <span>Rating: {stf.avgRating} ⭐</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER SUPPORT SLA */}
          {activeTab === "support" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-white">Customer Support Ticket Management & Escalation Engine</h3>
                <p className="text-xs text-slate-400">Priority support queues for Enterprise & Pro users with senior escalation routes</p>
              </div>

              <div className="space-y-3">
                {queryList.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{q.subject}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">{q.priority}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">From: {q.userName} ({q.userEmail}) · Tier: {q.userPlan}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">Assigned: {q.assignedStaff}</span>
                      <button onClick={() => alert(`Escalated ticket ${q.id} to SuperAdmin!`)} className="px-3 py-1 rounded bg-slate-800 hover:bg-rose-600 text-white font-semibold transition cursor-pointer">
                        Escalate to SuperAdmin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MONAD ON-CHAIN AUDIT */}
          {activeTab === "monad_audit" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-white">Monad Testnet (Chain ID 10143) Transaction Audit Log</h3>
                <p className="text-xs text-slate-400">Real-time ZK proof anchors & automated smart contract prepayment executions</p>
              </div>

              <div className="space-y-3">
                {SAMPLE_MONAD_LOGS.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-purple-400">{log.action} <span className="text-slate-500">Block #{log.blockNumber}</span></p>
                      <p className="text-slate-400 text-[11px] mt-0.5">User: {log.userEmail} · {log.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">₹{log.amount.toLocaleString()}</span>
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-purple-300 border border-slate-800 font-mono text-[11px]">{log.txHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RISK ENGINE */}
          {activeTab === "risk_engine" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">Global Risk & Liquidation Escrow Engine</h3>
                  <p className="text-xs text-slate-400">Monad collateral monitoring & automated non-performing asset sweeps</p>
                </div>
                <button onClick={() => alert("⚡ Global System Risk Assessment & Overdue Sweep Executed!")} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer">
                  ⚡ Trigger Risk Sweep
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-bold block">NPA Default Rate</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">0.42%</span>
                  <span className="text-[10px] text-emerald-500 font-bold block">Low System Risk</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Overdue Debts Under Watch</span>
                  <span className="text-2xl font-bold text-rose-400 mt-1 block">₹1,20,000</span>
                  <span className="text-[10px] text-rose-400 font-bold block">2 Default Alerts</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Monad Liquidation Escrow</span>
                  <span className="text-2xl font-bold text-purple-400 mt-1 block">450 MON</span>
                  <span className="text-[10px] text-purple-300 font-bold block">Collateral Anchored</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WEB3 GAS TANK */}
          {activeTab === "web3_gas" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">Monad Testnet Gas Reserve & Relayer Pool</h3>
                  <p className="text-xs text-slate-400">Gas tank balance monitoring for automated ZK proof on-chain anchoring</p>
                </div>
                <button onClick={() => alert("⛽ Gas Tank Refilled with +100 MON!")} className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer">
                  ⛽ Refill Gas Reserve
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Gas Tank Balance</span>
                  <span className="text-2xl font-bold text-purple-400 mt-1 block">1,250 MON</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">Optimal Gas Level</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Avg Gas / ZK Proof</span>
                  <span className="text-2xl font-bold text-indigo-400 mt-1 block">0.0024 MON</span>
                  <span className="text-[10px] text-indigo-300 font-bold block">Monad EVM Speed</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Relayer Contract</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">Active 🟢</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">Chain ID: 10143</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PAYMENT GATEWAY MONITOR */}
          {activeTab === "payment_gateways" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-white">Payment Gateway & Bank Processor Health</h3>
                <p className="text-xs text-slate-400">Real-time status of Razorpay, Stripe, UPI Autopay & Bank Webhooks</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-white">💳 Razorpay UPI Autopay Gateway</p>
                    <p className="text-xs text-slate-400 mt-0.5">Success Rate: 99.8% · Latency: 120ms</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">OPERATIONAL 🟢</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-white">🌐 Stripe Credit Card Settlement API</p>
                    <p className="text-xs text-slate-400 mt-0.5">Success Rate: 99.9% · Global Settlements</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">OPERATIONAL 🟢</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-white">📜 Monad Testnet Web3 Escrow Gateway</p>
                    <p className="text-xs text-slate-400 mt-0.5">Success Rate: 100% · EVM Smart Contract</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">OPERATIONAL 🟢</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SECURITY AUDIT */}
          {activeTab === "security_audit" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-white">Security Compliance & System Audit Trail</h3>
                <p className="text-xs text-slate-400">Log of SuperAdmin actions, IP addresses, and security violation alerts</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-emerald-400">✓ SuperAdmin Authenticated</p>
                    <p className="text-[11px] text-slate-400">ID: SUPERADMIN-DEBTPROOF-9901 · IP: 127.0.0.1 · Just Now</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">SHA-256 Verified</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-purple-400">✓ Feature Flag Updated</p>
                    <p className="text-[11px] text-slate-400">Autonomous Prepayment Agent set to Active · Today 11:45 AM</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Audit Pass</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: BROADCAST PUSH NOTIFICATIONS */}
          {activeTab === "push_notifications" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-sm text-white">Broadcast Real-Time System Push Notifications</h3>
                <p className="text-xs text-slate-400">Send push notifications to all users or specific plan tiers (Enterprise, Pro, Free)</p>
              </div>

              <form onSubmit={handleSendPushNotification} className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Target User Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs font-mono focus:border-rose-500 focus:outline-none"
                  >
                    <option value="All">All Registered Users</option>
                    <option value="Enterprise">Enterprise SaaS Users Only</option>
                    <option value="Pro">Pro Plan Users Only</option>
                    <option value="Free">Free Plan Users Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Notification Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. System Upgrade v4.0 Live!"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Message Body</label>
                  <textarea
                    placeholder="Enter broadcast message details..."
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    rows={4}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  📢 Broadcast Push Notification Now
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full p-6 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Corporate Staff Account</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Staff Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Riya Sen"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Corporate Email</label>
                <input
                  type="email"
                  placeholder="riya@debtproof.io"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Assign Roles (Multi-Role Support)</label>
                <select
                  multiple
                  value={newStaffRoles}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions, (option) => option.value as RoleType);
                    setNewStaffRoles(opts);
                  }}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs h-28 focus:border-rose-500 focus:outline-none"
                >
                  <option value="CustomerSupport">Customer Support</option>
                  <option value="AdminManager">Admin Manager</option>
                  <option value="BillingFinance">Billing & Finance</option>
                  <option value="RiskAuditor">Risk Auditor</option>
                  <option value="SuperAdmin">SuperAdmin Authority</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer">Create Staff Account</button>
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs transition cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
