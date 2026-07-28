"use client";

import React, { useState } from "react";
import Link from "next/link";
import apiClient from "@/services/api";
import { formatCurrency } from "@/utils/formatters";

// Roles definition
type RoleType = "SuperAdmin" | "AdminManager" | "CustomerSupport" | "BillingFinance" | "User";

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
  assignedSupportStaff?: string;
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
  customerRating?: number;
}

interface FeatureTierConfig {
  id: string;
  featureName: string;
  freeAllowed: boolean;
  basicAllowed: boolean;
  proAllowed: boolean;
  enterpriseAllowed: boolean;
  pricePerMonth: { free: 0; basic: 499; pro: 1499; enterprise: 4999 };
}

const SAMPLE_STAFF: StaffMember[] = [
  { id: "stf-1", name: "Aarav Sharma (Admin Manager)", email: "aarav.admin@debtproof.io", roles: ["AdminManager"], status: "Active", queriesResolved: 142, avgRating: 4.9 },
  { id: "stf-2", name: "Neha Verma (Customer Support)", email: "neha.support@debtproof.io", roles: ["CustomerSupport"], status: "Active", queriesResolved: 89, avgRating: 4.8 },
  { id: "stf-3", name: "Vikram Mehta (Billing & Finance)", email: "vikram.finance@debtproof.io", roles: ["BillingFinance"], status: "Active", queriesResolved: 45, avgRating: 4.7 },
];

const SAMPLE_USERS: UserData[] = [
  { id: "u-101", name: "Rajesh Kumar", email: "rajesh@example.com", plan: "Enterprise", priority: "High", status: "Active", loansCount: 5, totalDebtVolume: 1850000 },
  { id: "u-102", name: "Sunita Rao", email: "sunita@example.com", plan: "Pro", priority: "High", status: "Active", loansCount: 3, totalDebtVolume: 640000 },
  { id: "u-103", name: "Amit Joshi", email: "amit@example.com", plan: "Basic", priority: "Normal", status: "Active", loansCount: 2, totalDebtVolume: 280000 },
  { id: "u-104", name: "Pooja Hegde", email: "pooja@example.com", plan: "Free", priority: "Low", status: "Suspended", loansCount: 1, totalDebtVolume: 50000 },
];

const SAMPLE_QUERIES: SupportQuery[] = [
  { id: "q-1", userEmail: "rajesh@example.com", userName: "Rajesh Kumar", userPlan: "Enterprise", priority: "Urgent", subject: "Monad ZK Proof Verification Delayed on Testnet", assignedStaff: "Neha Verma", status: "In_Call" },
  { id: "q-2", userEmail: "sunita@example.com", userName: "Sunita Rao", userPlan: "Pro", priority: "High", subject: "Auto-Pay Prepayment Trigger Optimization Query", assignedStaff: "Neha Verma", status: "Open" },
];

export default function DedicatedDebtProofAdminPortal() {
  const SUPERADMIN_ID = "SUPERADMIN-DEBTPROOF-9901";
  const SUPERADMIN_KEY = "debtproof_superadmin_auth_token";

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SUPERADMIN_KEY) === "granted";
  });
  const [adminUserIdInput, setAdminUserIdInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "staff" | "support" | "pricing" | "push_notifications">("overview");
  const [staffList, setStaffList] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [userList, setUserList] = useState<UserData[]>(SAMPLE_USERS);
  const [queryList, setQueryList] = useState<SupportQuery[]>(SAMPLE_QUERIES);
  const [loadingRealUsers, setLoadingRealUsers] = useState(false);

  // New Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRoles, setNewStaffRoles] = useState<RoleType[]>(["CustomerSupport"]);

  // Push Notification Broadcast State
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [targetAudience, setTargetAudience] = useState<"All" | "Enterprise" | "Pro" | "Free">("All");

  // Fetch real users from backend Django API
  React.useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchRealUsers() {
      setLoadingRealUsers(true);
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
          }));
          const merged = [...fetchedUsers, ...SAMPLE_USERS];
          const unique = merged.filter((item, index, self) => index === self.findIndex((t) => t.email === item.email));
          setUserList(unique);
        }
      } catch (err) {
        console.error("Failed to load real users for SuperAdmin:", err);
      } finally {
        setLoadingRealUsers(false);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 bg-slate-900 border-2 border-rose-500/40 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
              👑
            </div>
            <h2 className="text-xl font-black text-white">DebtProof Corporate Admin Authentication</h2>
            <p className="text-xs text-slate-400">Strictly restricted to SuperAdmin Root Authority</p>
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
                placeholder="e.g. SUPERADMIN-DEBTPROOF-9901"
                value={adminUserIdInput}
                onChange={(e) => setAdminUserIdInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 text-white border border-slate-700 font-bold text-xs mt-1 focus:border-rose-500 focus:outline-none"
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
                className="w-full p-3 rounded-xl bg-slate-950 text-white border border-slate-700 font-bold text-xs mt-1 focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-rose-500/25 cursor-pointer transition-all"
            >
              Verify SuperAdmin Credentials & Unlock Portal →
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link href="/dashboard" className="text-[11px] font-mono text-slate-400 hover:text-white transition">
              ← Return to User Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    alert(`👑 New Staff Account Created! Role assigned: ${newStaffRoles.join(", ")}`);
  };

  const handleEscalateQuery = (queryId: string, level: "Senior" | "SuperAdmin") => {
    setQueryList((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? { ...q, status: level === "Senior" ? "Escalated_Senior" : "Escalated_SuperAdmin" }
          : q
      )
    );
    alert(`⚠️ Query Escalated to ${level}! Priority set to Urgent.`);
  };

  const handleSendPushNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim()) return;
    alert(`📢 Push Notification Broadcasted to ${targetAudience} Users!\nTitle: ${pushTitle}`);
    setPushTitle("");
    setPushBody("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans">
      {/* Top Admin Navbar */}
      <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            👑
          </div>
          <div>
            <span className="font-black text-base text-[var(--color-text-primary)] tracking-tight">DebtProof SaaS Admin Portal</span>
            <span className="text-[10px] font-mono text-purple-400 font-bold block">Standalone Corporate Operating System</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            SuperAdmin: SUPERADMIN-DEBTPROOF-9901
          </span>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
          >
            🔒 Lock & Logout
          </button>
          <Link href="/dashboard" className="text-xs font-bold text-[var(--color-text-tertiary)] hover:text-white transition">
            Exit to App →
          </Link>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 card p-4 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-2xl shadow-sm">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {(["overview", "users", "staff", "support", "pricing", "push_notifications"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer capitalize ${
                  activeTab === tab
                    ? "bg-purple-600 text-white shadow-md font-black"
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
            <span>+ Add New Staff / Admin Role</span>
          </button>
        </div>

        {/* Tab 1: System Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Total Registered Users</span>
                <span className="text-2xl font-black text-[var(--color-text-primary)] mt-1 block">1,480 Users</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">42 Enterprise · 180 Pro</span>
              </div>
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Active Staff & Roles</span>
                <span className="text-2xl font-black text-purple-400 mt-1 block">{staffList.length} Active Staff</span>
                <span className="text-[10px] text-purple-300 font-bold block mt-1">Support & Admin Managers</span>
              </div>
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Support Resolution Rate</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">98.4%</span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">Avg Rating: 4.8 / 5.0 ⭐</span>
              </div>
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] text-center shadow-md">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold block">Total Debt Volume Managed</span>
                <span className="text-2xl font-black text-indigo-400 mt-1 block">₹2.84 Cr</span>
                <span className="text-[10px] text-indigo-300 font-bold block mt-1">Monad ZK Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Management & Subscription Priority */}
        {activeTab === "users" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-3">
              User Portfolio & SaaS Plan Priority Directory
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)] text-[10px] text-[var(--color-text-tertiary)] uppercase font-black">
                    <th className="py-2.5 px-3">User Details</th>
                    <th className="py-2.5 px-3">Subscription Tier</th>
                    <th className="py-2.5 px-3">Support Priority</th>
                    <th className="py-2.5 px-3">Debt Volume</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--color-surface-secondary)]">
                      <td className="py-3 px-3">
                        <p className="font-bold text-[var(--color-text-primary)]">{u.name}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">{u.email}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-purple-400">{u.plan} Plan</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{u.priority} Priority</td>
                      <td className="py-3 px-3 font-bold text-[var(--color-text-primary)]">₹{u.totalDebtVolume.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          u.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Staff Management & Multi-Role Assignment */}
        {activeTab === "staff" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Staff Roster & Multi-Role Permissions</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">Assign single or multiple roles (Customer Support, Admin Manager, Billing)</p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="btn bg-purple-600 text-white font-bold text-xs px-3 py-1.5"
              >
                + Create Staff Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {staffList.map((stf) => (
                <div key={stf.id} className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3">
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
                    <span className="text-[var(--color-text-tertiary)]">Queries Resolved: {stf.queriesResolved}</span>
                    <span className="text-emerald-400 font-bold">Status: {stf.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Customer Support Desk & Senior Escalation */}
        {activeTab === "support" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-3">
              Customer Support Call & Chat Escalation Desk
            </h3>

            <div className="space-y-3">
              {queryList.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-text-primary)]">{q.subject}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 uppercase">{q.priority}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">User: {q.userName} ({q.userPlan} User) · Staff: {q.assignedStaff}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`📞 Call/Chat Initiated with ${q.userName}!`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      📞 Call User
                    </button>
                    <button
                      onClick={() => handleEscalateQuery(q.id, "Senior")}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 cursor-pointer"
                    >
                      ⬆️ Escalate Senior
                    </button>
                    <button
                      onClick={() => handleEscalateQuery(q.id, "SuperAdmin")}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 cursor-pointer"
                    >
                      👑 Escalate SuperAdmin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Plan Pricing & Feature Access Manager */}
        {activeTab === "pricing" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-3">
              SaaS Plan Pricing & Feature Access Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <p className="font-bold text-[var(--color-text-primary)]">Free Plan</p>
                <p className="text-lg font-black text-emerald-400 my-1">₹0 / mo</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">Basic Debt Tracking</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <p className="font-bold text-indigo-400">Basic Plan</p>
                <p className="text-lg font-black text-indigo-400 my-1">₹499 / mo</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">Snowball & Auto-Saver</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-purple-500/40 ring-1 ring-purple-500/30">
                <p className="font-bold text-purple-400">Pro Plan</p>
                <p className="text-lg font-black text-purple-400 my-1">₹1,499 / mo</p>
                <p className="text-[10px] text-purple-300 font-bold">AI Agent & Refinance</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/40">
                <p className="font-bold text-rose-400">Enterprise SaaS</p>
                <p className="text-lg font-black text-rose-400 my-1">₹4,999 / mo</p>
                <p className="text-[10px] text-rose-300 font-bold">Monad Web3 & Multi-User</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Push Notifications Broadcast */}
        {activeTab === "push_notifications" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-3">
              Broadcast System Push Notifications
            </h3>

            <form onSubmit={handleSendPushNotification} className="space-y-4 max-w-md font-mono text-xs">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Target User Tier</label>
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
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. System Update v2.7.0 Released!"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Notification Body Message</label>
                <textarea
                  placeholder="Enter message text..."
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  rows={4}
                  className="form-input text-xs w-full mt-1"
                />
              </div>

              <button type="submit" className="btn bg-purple-600 text-white font-bold text-xs py-2 px-4">
                📢 Broadcast Push Notification
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Add New Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--color-surface)] border border-purple-500/40 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Create DebtProof Staff Account</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 font-mono text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-secondary)]">Staff Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
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
                  placeholder="rahul@debtproof.io"
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
                  className="form-select text-xs w-full mt-1 h-24"
                >
                  <option value="CustomerSupport">Customer Support Staff</option>
                  <option value="AdminManager">Admin Manager</option>
                  <option value="BillingFinance">Billing & Finance Officer</option>
                  <option value="SuperAdmin">SuperAdmin</option>
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
