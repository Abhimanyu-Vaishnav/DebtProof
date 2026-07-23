/**
 * DebtProof — Super Admin SaaS Command Center
 */
"use client";

import React, { useEffect, useState } from "react";
import { tenantsService } from "@/services/tenants.service";

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantsService.getAdminDashboard().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-xs font-bold text-[var(--color-text-tertiary)] animate-pulse">
        Loading SaaS Admin Command Center...
      </div>
    );
  }

  const stats = data?.stats || {
    total_organizations: 1,
    total_users: 1,
    active_subscriptions: 1,
    mrr: 0,
    total_workspaces: 1,
    total_invoices: 1,
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Super Admin SaaS Command Center</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Platform-wide metrics, multi-tenant monitoring, MRR, and global log streams.</p>
      </div>

      {/* Global SaaS KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Total Organizations</p>
          <p className="text-3xl font-black text-[var(--color-text-primary)]">{stats.total_organizations}</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Active Users</p>
          <p className="text-3xl font-black text-emerald-400">{stats.total_users}</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Active Subscriptions</p>
          <p className="text-3xl font-black text-[var(--color-primary)]">{stats.active_subscriptions}</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Monthly Recurring Revenue (MRR)</p>
          <p className="text-3xl font-black text-emerald-400">₹{stats.mrr}</p>
        </div>
      </div>

      {/* Recent Registered Tenants Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-black text-[var(--color-text-primary)]">Platform Tenants Overview</h2>
        {(!data?.recent_organizations || data.recent_organizations.length === 0) ? (
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium text-center py-4">No active organizations registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                  <th className="py-2">Organization Name</th>
                  <th className="py-2">Owner Email</th>
                  <th className="py-2">Currency</th>
                  <th className="py-2">Members</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
                {data.recent_organizations.map((org: any) => (
                  <tr key={org.id}>
                    <td className="py-3 font-bold text-[var(--color-text-primary)]">{org.name}</td>
                    <td className="py-3 text-[var(--color-text-secondary)]">{org.owner?.email || "—"}</td>
                    <td className="py-3 font-bold font-mono">{org.currency}</td>
                    <td className="py-3 font-bold">{org.members_count || 1}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400">
                        {org.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
