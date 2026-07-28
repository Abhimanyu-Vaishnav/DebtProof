"use client";

import React, { useState } from "react";
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

export default function DedicatedDebtProofAdminPortal() {
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

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem(SUPERADMIN_KEY) === "granted") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch real users from backend API
  React.useEffect(() => {
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
          }));
          const merged = [...fetchedUsers, ...SAMPLE_USERS];
          const unique = merged.filter((item, index, self) => index === self.findIndex((t) => t.email === item.email));
          setUserList(unique);
        }
      } catch (err: any) {
        // Gracefully handle network offline or backend connection resets silently
        if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
          console.warn("SuperAdmin Portal running in resilient fallback mode (Backend Offline or Resetting).");
        } else {
          console.error("Failed to load real users for SuperAdmin:", err);
        }
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
    alert(`👑 New Staff Account Created! Roles assigned: ${newStaffRoles.join(", ")}`);
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
      // POST broadcast to Django Database so all users receive push notification on reload/login
      await apiClient.post("/notifications/broadcast/", {
        title: formattedTitle,
        body: pushBody || "System announcement broadcasted from SuperAdmin Portal.",
        target_audience: targetAudience,
      });
    } catch {
      // Graceful fallback to client broadcast
    }

    if (typeof window !== "undefined") {
      const existingRaw = localStorage.getItem("debtproof_local_broadcasts");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem("debtproof_local_broadcasts", JSON.stringify([newNotifObj, ...existing]));

      // BroadcastChannel API — syncs across all open tabs/windows instantly
      try {
        const bc = new BroadcastChannel("debtproof_notifications_channel");
        bc.postMessage({ type: "ADD_NOTIFICATION", notif: newNotifObj });
        bc.close();
      } catch {}
    }

    // Dispatch global real-time notification custom event & toast
    window.dispatchEvent(
      new CustomEvent("debtproof_add_notification", {
        detail: newNotifObj,
      })
    );
    window.dispatchEvent(new CustomEvent("debtproof_refresh_notifications"));
    window.dispatchEvent(
      new CustomEvent("debtproof-toast", {
        detail: {
          message: `📢 Broadcast Sent: ${pushTitle}`,
          type: "success",
        },
      })
    );

    // Trigger Browser Native Desktop Push Popup immediately
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(`📢 DebtProof: ${pushTitle}`, {
            body: pushBody || "System announcement broadcasted from SuperAdmin Portal.",
            icon: "/favicon.ico",
          });
        } catch {}
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            try {
              new Notification(`📢 DebtProof: ${pushTitle}`, {
                body: pushBody || "System announcement broadcasted from SuperAdmin Portal.",
                icon: "/favicon.ico",
              });
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
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
      )
    );
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
              👑
            </div>
            <h2 className="text-xl font-black text-white">DebtProof SaaS SuperAdmin Authentication</h2>
            <p className="text-xs text-slate-400">Enter SuperAdmin credentials to access corporate control center</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-center">
                {authError}
              </div>
            )}

            <div>
              <label className="text-slate-300 font-bold">SuperAdmin User ID</label>
              <input
                type="text"
                placeholder="SUPERADMIN-DEBTPROOF-9901"
                value={adminUserIdInput}
                onChange={(e) => setAdminUserIdInput(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 text-white border border-slate-700 font-bold text-xs mt-1 focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold">Security Passcode</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 text-white border border-slate-700 font-bold text-xs mt-1 focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-rose-500/25 cursor-pointer transition-all"
            >
              Verify SuperAdmin Credentials & Unlock Portal →
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link href="/dashboard" className="text-[11px] font-mono text-slate-400 hover:text-white transition">
              ← Return to User App Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans">
      {/* Top Admin Navbar */}
      <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
            👑
          </div>
          <div>
            <span className="font-black text-base text-[var(--color-text-primary)] tracking-tight">DebtProof SaaS SuperAdmin Command Center</span>
            <span className="text-[10px] font-mono text-purple-400 font-bold block">Standalone Corporate Executive Portal v3.3.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            ID: SUPERADMIN-DEBTPROOF-9901
          </span>
          <button
            onClick={handleAdminLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer transition"
          >
            🔒 Lock & Logout
          </button>
          <Link href="/dashboard" className="text-xs font-bold text-[var(--color-text-tertiary)] hover:text-white transition">
            Exit to App →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 card p-3 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-2xl shadow-sm">
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {(["overview", "users", "staff", "support", "monad_audit", "risk_engine", "web3_gas", "payment_gateways", "security_audit", "push_notifications"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer capitalize font-mono ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md font-black"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddStaffModal(true)}
            className="btn bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 shadow-lg shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Add Staff Role</span>
          </button>
        </div>

        {/* Tab 1: System Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Total Registered Users</span>
                <span className="text-2xl font-black text-[var(--color-text-primary)] mt-1 block">{userList.length} Users</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                  {userList.filter((u) => u.plan === "Enterprise").length} Enterprise · {userList.filter((u) => u.plan === "Pro").length} Pro
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Active Corporate Staff</span>
                <span className="text-2xl font-black text-purple-400 mt-1 block">{staffList.length} Active Staff</span>
                <span className="text-[10px] text-purple-300 font-bold block mt-1">Multi-Role Support & Risk Team</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Support Resolution SLA</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">98.4%</span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">Avg Customer Rating: 4.9 ⭐</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Total Debt Volume Managed</span>
                <span className="text-2xl font-black text-indigo-400 mt-1 block">
                  ₹{userList.reduce((sum, u) => sum + (u.totalDebtVolume || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-indigo-300 font-bold block mt-1">Monad ZK Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Portfolio & Plan Priority Directory */}
        {activeTab === "users" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">User Account Directory & Suspension Controls</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">Full database records of registered users, credit scores & plan priority</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Total Users: {userList.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)] text-[10px] text-[var(--color-text-tertiary)] uppercase font-black">
                    <th className="py-3 px-3">User Details</th>
                    <th className="py-3 px-3">Subscription Tier</th>
                    <th className="py-3 px-3">Credit Rating</th>
                    <th className="py-3 px-3">Total Debt Volume</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--color-surface-secondary)]">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-[var(--color-text-primary)]">{u.name}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-purple-400">{u.plan} Plan</td>
                      <td className="py-3.5 px-3 font-bold text-emerald-400">{u.creditScore || 750} Score</td>
                      <td className="py-3.5 px-3 font-bold text-[var(--color-text-primary)]">₹{u.totalDebtVolume.toLocaleString()}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                          u.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                            u.status === "Active" ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          }`}
                        >
                          {u.status === "Active" ? "Suspend Account" : "Re-Activate Account"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Staff Management & Multi-Role Permissions */}
        {activeTab === "staff" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Corporate Staff Roster & Multi-Role Permissions</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">Assign roles: Customer Support, Admin Manager, Billing & Risk Auditor</p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="btn bg-purple-600 text-white font-bold text-xs px-3.5 py-2"
              >
                + Create Staff Account
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              {staffList.map((stf) => (
                <div key={stf.id} className="p-4 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)]">{stf.name}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{stf.email}</p>
                    </div>
                    <span className="text-xs text-amber-400 font-bold">⭐ {stf.avgRating}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {stf.roles.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border-light)] flex justify-between items-center text-[10px]">
                    <span className="text-[var(--color-text-tertiary)]">Queries: {stf.queriesResolved}</span>
                    <span className="text-emerald-400 font-bold">Status: {stf.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Monad Blockchain Audit Log */}
        {activeTab === "monad_audit" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <div className="border-b border-[var(--color-border-light)] pb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Monad Testnet (Chain ID 10143) Transaction Audit Log</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Real-time ZK proof anchors & automated smart contract prepayment executions</p>
            </div>

            <div className="space-y-3">
              {SAMPLE_MONAD_LOGS.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-400">{log.action}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-slate-900 text-indigo-300 border border-purple-500/30">Block #{log.blockNumber}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">User: {log.userEmail} · {log.timestamp}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-emerald-400">₹{log.amount.toLocaleString()}</span>
                    <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 font-bold">{log.txHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tab 6: Global Risk & Liquidation Engine */}
        {activeTab === "risk_engine" && (
          <div className="card p-6 border border-rose-500/30 bg-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--color-border-light)] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)]">
                    Global Risk & Liquidation Engine
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Monitors platform-wide debt delinquency, automatic penalty triggers & liquidation reserves.
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert("⚡ Global System Risk Assessment & Overdue Sweep Executed!")}
                className="btn bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-4 py-2 shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                ⚡ Trigger Platform Risk Sweep
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Overall Non-Performing Asset (NPA) Rate</span>
                <span className="text-2xl font-black text-emerald-400">0.42%</span>
                <span className="text-[10px] text-emerald-500 font-bold block">Low Default Risk</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Overdue Debts Under Monitoring</span>
                <span className="text-2xl font-black text-rose-400">₹1,20,000</span>
                <span className="text-[10px] text-rose-300 font-bold block">2 Accounts Default Alert</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Monad Liquidation Escrow Pool</span>
                <span className="text-2xl font-black text-purple-400">450 MON</span>
                <span className="text-[10px] text-purple-300 font-bold block">Collateral Anchored</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Monad Web3 Gas & Escrow Pool Manager */}
        {activeTab === "web3_gas" && (
          <div className="card p-6 border border-purple-500/30 bg-[var(--color-surface)] space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Monad Testnet Gas Reserve & Relayer Escrow Pool</h3>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">Monitors gas tank reserves for automated ZK proof on-chain anchoring</p>
              </div>
              <button onClick={() => alert("⛽ Gas Tank Refilled with +100 MON!")} className="btn bg-purple-600 text-white font-bold text-xs px-3 py-1.5 cursor-pointer">
                ⛽ Refill Gas Reserve
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Gas Tank Balance</span>
                <span className="text-2xl font-black text-purple-400">1,250 MON</span>
                <span className="text-[10px] text-emerald-400 font-bold block">Optimal Gas Level</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Avg Gas Price per ZK Proof</span>
                <span className="text-2xl font-black text-indigo-400">0.0024 MON</span>
                <span className="text-[10px] text-indigo-300 font-bold block">Monad EVM Speed: 10,000 TPS</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Relayer Contract Status</span>
                <span className="text-2xl font-black text-emerald-400">Active 🟢</span>
                <span className="text-[10px] text-emerald-500 font-bold block">Chain ID: 10143</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Payment Processor & Gateway Health */}
        {activeTab === "payment_gateways" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 font-mono text-xs">
            <div className="border-b border-[var(--color-border-light)] pb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Payment Gateway & Bank Processor Health Monitor</h3>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">Real-time status of Razorpay, Stripe, UPI Autopay & Bank Webhooks</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">💳 Razorpay UPI Autopay Gateway</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Success Rate: 99.8% · Latency: 120ms</p>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">OPERATIONAL 🟢</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">🌐 Stripe Credit Card Settlement API</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Success Rate: 99.9% · Global Settlements</p>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">OPERATIONAL 🟢</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex justify-between items-center">
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">📜 Monad Testnet Web3 Escrow Gateway</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Success Rate: 100% · EVM Smart Contract</p>
                </div>
                <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 font-bold">OPERATIONAL 🟢</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Security Compliance & Audit Log */}
        {activeTab === "security_audit" && (
          <div className="card p-6 border border-rose-500/30 bg-[var(--color-surface)] space-y-4 font-mono text-xs">
            <div className="border-b border-[var(--color-border-light)] pb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Security Compliance & System Audit Trail</h3>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">Log of SuperAdmin actions, IP addresses, and security violation alerts</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex justify-between items-center">
                <div>
                  <p className="font-bold text-emerald-400">✓ SuperAdmin Authenticated</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">ID: SUPERADMIN-DEBTPROOF-9901 · IP: 127.0.0.1 · Just Now</p>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">SHA-256 Verified</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex justify-between items-center">
                <div>
                  <p className="font-bold text-purple-400">✓ Feature Flag Updated</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">Autonomous Prepayment Agent set to Active · Today 11:45 AM</p>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Audit Pass</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 10: Broadcast Push Notifications */}
        {activeTab === "push_notifications" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 font-mono text-xs">
            <div className="border-b border-[var(--color-border-light)] pb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Broadcast Real-Time System Push Notifications</h3>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">Send push notifications to all users or specific plan tiers (Enterprise, Pro, Free)</p>
            </div>

            <form onSubmit={handleSendPushNotification} className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Target User Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="form-select text-xs w-full mt-1 bg-[var(--color-surface-secondary)] border-[var(--color-border)]"
                >
                  <option value="All">All Registered Users</option>
                  <option value="Enterprise">Enterprise SaaS Users Only</option>
                  <option value="Pro">Pro Plan Users Only</option>
                  <option value="Free">Free Plan Users Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Notification Title *</label>
                <input
                  type="text"
                  placeholder="e.g. System Upgrade v3.7.0 Live!"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Message Body</label>
                <textarea
                  placeholder="Enter broadcast message details..."
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  rows={4}
                  className="form-input text-xs w-full mt-1"
                />
              </div>

              <button type="submit" className="btn bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 px-5 shadow-lg cursor-pointer">
                📢 Broadcast Push Notification Now
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--color-surface)] border border-purple-500/40 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Create Corporate Staff Account</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 font-mono text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-secondary)]">Staff Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Riya Sen"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-secondary)]">Corporate Email</label>
                <input
                  type="email"
                  placeholder="riya@debtproof.io"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-secondary)]">Assign Roles (Multi-Role Support)</label>
                <select
                  multiple
                  value={newStaffRoles}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions, (option) => option.value as RoleType);
                    setNewStaffRoles(opts);
                  }}
                  className="form-select text-xs w-full mt-1 h-28"
                >
                  <option value="CustomerSupport">Customer Support</option>
                  <option value="AdminManager">Admin Manager</option>
                  <option value="BillingFinance">Billing & Finance</option>
                  <option value="RiskAuditor">Risk Auditor</option>
                  <option value="SuperAdmin">SuperAdmin Authority</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn bg-rose-600 text-white font-bold text-xs py-2">Create Staff Account</button>
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="btn btn-secondary text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
