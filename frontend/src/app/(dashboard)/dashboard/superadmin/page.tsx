"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { formatCurrency } from "@/utils/formatters";

interface SaaSUser {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro Plan" | "Enterprise SaaS";
  status: "Active" | "Suspended" | "Pending";
  joinedDate: string;
  activeDebtsCount: number;
  totalVolume: number;
}

interface FeatureToggle {
  id: string;
  name: string;
  category: string;
  isEnabled: boolean;
  userTier: "All Users" | "Pro Only" | "Enterprise Only";
}

const INITIAL_USERS: SaaSUser[] = [
  {
    id: "usr-1",
    name: "Abhimanyu Vaishnav",
    email: "abhimanyu@sanatanlabs.com",
    plan: "Enterprise SaaS",
    status: "Active",
    joinedDate: "2026-01-15",
    activeDebtsCount: 4,
    totalVolume: 1200000,
  },
  {
    id: "usr-2",
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    plan: "Pro Plan",
    status: "Active",
    joinedDate: "2026-03-10",
    activeDebtsCount: 2,
    totalVolume: 450000,
  },
  {
    id: "usr-3",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    plan: "Free",
    status: "Suspended",
    joinedDate: "2026-05-22",
    activeDebtsCount: 1,
    totalVolume: 120000,
  },
];

const INITIAL_FEATURES: FeatureToggle[] = [
  { id: "feat-1", name: "🤖 AI Debt Consolidation & Negotiation", category: "AI Studio", isEnabled: true, userTier: "All Users" },
  { id: "feat-2", name: "⚡ Autonomous Prepayment Agent 2.0", category: "Automation", isEnabled: true, userTier: "Pro Only" },
  { id: "feat-3", name: "📜 Monad Web3 ZK Smart Contract Engine", category: "Web3", isEnabled: true, userTier: "Enterprise Only" },
  { id: "feat-4", name: "🎙️ Hands-Free Speech Assistant", category: "AI Studio", isEnabled: true, userTier: "All Users" },
  { id: "feat-5", name: "📱 Biometric Face ID / Fingerprint Lock", category: "Security", isEnabled: true, userTier: "All Users" },
];

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "features" | "tenants" | "logs">("overview");
  const [users, setUsers] = useState<SaaSUser[]>(INITIAL_USERS);
  const [features, setFeatures] = useState<FeatureToggle[]>(INITIAL_FEATURES);
  const [searchQuery, setSearchQuery] = useState("");

  const totalSaaSARR = 485000; // Simulated ARR in INR
  const activeTenantsCount = 142;

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  };

  const toggleFeature = (featId: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === featId ? { ...f, isEnabled: !f.isEnabled } : f))
    );
  };

  return (
    <>
      <Topbar title="SaaS SuperAdmin Command Center" subtitle="Global multi-tenant platform administration, user controls & feature flag manager" />
      <main className="page-content space-y-6">
        
        {/* Header Hero Banner */}
        <div className="card p-6 border-2 border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-[var(--color-surface)] to-[var(--color-surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl font-black shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Global Root Authority
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">DebtProof SaaS v2.6.0</span>
              </div>
              <h1 className="text-xl font-black text-[var(--color-text-primary)] mt-0.5">
                SuperAdmin Platform Control Panel
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-[var(--color-surface-tertiary)] p-1 border border-[var(--color-border-light)] text-xs font-bold">
            {(["overview", "users", "features", "tenants"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                  activeTab === tab
                    ? "bg-rose-600 text-white shadow-md"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: System Overview KPI Cards */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-md text-center">
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase block">Total SaaS ARR</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{totalSaaSARR.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-500 font-bold mt-1 block">+18.4% this month</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-md text-center">
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase block">Active Registered Users</span>
                <span className="text-2xl font-black text-[var(--color-text-primary)] mt-1 block">{users.length * 48}</span>
                <span className="text-[10px] text-[var(--color-text-tertiary)] mt-1 block">Across 14 Tenants</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-md text-center">
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase block">Total Monad ZK Hashes</span>
                <span className="text-2xl font-black text-purple-400 mt-1 block">12,840</span>
                <span className="text-[10px] text-purple-300 font-bold mt-1 block">100% Chain Anchored</span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-md text-center">
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase block">System Health Score</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">99.98%</span>
                <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Zero Outages</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-2">
                ⚡ Global SuperAdmin Operations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => alert("Global System Cache Cleared across all multi-tenant nodes!")}
                  className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:border-rose-500 text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">🧹 Purge Global Cache</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Flush Redis & static CDN assets</p>
                </button>

                <button
                  onClick={() => alert("Monad Blockchain Indexer Sync Triggered!")}
                  className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:border-purple-500 text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">⛓️ Sync Monad Indexer</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Re-verify all ZK proofs on-chain</p>
                </button>

                <button
                  onClick={() => alert("Global System Announcement broadcasted to all active user dashboards!")}
                  className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:border-emerald-500 text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">📢 Broadcast Announcement</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Send alert to all active users</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Account & Security Controls */}
        {activeTab === "users" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">User Account Management</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">Manage user permissions, SaaS plan tiers, and account suspension</p>
              </div>

              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)] text-[10px] text-[var(--color-text-tertiary)] uppercase font-black">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Plan Tier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Active Debts</th>
                    <th className="py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--color-surface-secondary)]">
                      <td className="py-3 px-3">
                        <p className="font-bold text-[var(--color-text-primary)]">{u.name}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">{u.email}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-purple-400">{u.plan}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          u.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[var(--color-text-primary)]">{u.activeDebtsCount} Debts (₹{u.totalVolume.toLocaleString()})</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            u.status === "Active"
                              ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
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

        {/* Tab 3: Global Feature Flag Manager */}
        {activeTab === "features" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
            <div className="border-b border-[var(--color-border-light)] pb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Global Feature Flags & Access Control</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Enable or disable specific features globally or restrict them to Pro/Enterprise plan tiers</p>
            </div>

            <div className="space-y-3">
              {features.map((feat) => (
                <div
                  key={feat.id}
                  className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs"
                >
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)]">{feat.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">Category: {feat.category} · Allowed Tier: <span className="text-purple-400 font-bold">{feat.userTier}</span></p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold ${feat.isEnabled ? "text-emerald-400" : "text-rose-400"}`}>
                      {feat.isEnabled ? "ENABLED GLOBALLY 🟢" : "DISABLED 🔴"}
                    </span>
                    <button
                      onClick={() => toggleFeature(feat.id)}
                      className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${
                        feat.isEnabled ? "bg-emerald-500" : "bg-gray-600"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all ${feat.isEnabled ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Multi-Tenant Organizations */}
        {activeTab === "tenants" && (
          <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 text-center py-12">
            <div className="text-4xl">🏢</div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Multi-Tenant Organization Hub</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] max-w-md mx-auto">
              Manage enterprise organizational workspaces, white-label custom domains, and corporate debt pooling policies.
            </p>
          </div>
        )}

      </main>
    </>
  );
}
