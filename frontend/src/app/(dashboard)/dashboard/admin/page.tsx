/**
 * DebtProof — Super Admin SaaS Command Center & Plan Configurator
 */
"use client";

import React, { useEffect, useState } from "react";
import { tenantsService } from "@/services/tenants.service";
import { Plan } from "@/types/saas";

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    code: "",
    name: "",
    price_monthly: 0,
    price_yearly: 0,
    is_recommended: false,
    is_popular: false,
    max_loans: 10,
    max_storage_bytes: 1073741824,
    max_reports: 50,
    max_ai_requests: 100,
    max_team_members: 5,
  });

  const loadAdminData = async () => {
    const [adminRes, billingRes] = await Promise.all([
      tenantsService.getAdminDashboard(),
      tenantsService.getBillingPlans(),
    ]);
    setData(adminRes);
    setPlans(billingRes.plans);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await tenantsService.updateAdminPlan(editingPlan.id, planForm);
      } else {
        await tenantsService.createAdminPlan(planForm);
      }
      setPlanModal(false);
      setEditingPlan(null);
      loadAdminData();
    } catch {}
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanForm({
      code: "custom",
      name: "Custom Plan",
      price_monthly: 1999,
      price_yearly: 19990,
      is_recommended: false,
      is_popular: false,
      max_loans: 100,
      max_storage_bytes: 10737418240,
      max_reports: 200,
      max_ai_requests: 500,
      max_team_members: 20,
    });
    setPlanModal(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setPlanForm({
      code: p.code,
      name: p.name,
      price_monthly: p.price_monthly,
      price_yearly: p.price_yearly,
      is_recommended: Boolean(p.is_recommended),
      is_popular: Boolean(p.is_popular),
      max_loans: p.max_loans,
      max_storage_bytes: p.max_storage_bytes,
      max_reports: p.max_reports,
      max_ai_requests: p.max_ai_requests,
      max_team_members: p.max_team_members,
    });
    setPlanModal(true);
  };

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

  const arr = (stats.mrr * 12).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Super Admin SaaS Command Center</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Platform-wide metrics, MRR, ARR, subscriber distribution, and dynamic plan management.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-md cursor-pointer"
        >
          + Create Subscription Plan
        </button>
      </div>

      {/* Global SaaS Financial & Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Monthly Recurring Revenue (MRR)</p>
          <p className="text-3xl font-black text-emerald-400">₹{stats.mrr}</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Annual Run Rate (ARR)</p>
          <p className="text-3xl font-black text-[var(--color-primary)]">₹{arr}</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Total Organizations</p>
          <p className="text-3xl font-black text-[var(--color-text-primary)]">{stats.total_organizations}</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">Active Subscribers</p>
          <p className="text-3xl font-black text-emerald-400">{stats.active_subscriptions}</p>
        </div>
      </div>

      {/* Dynamic Subscription Plans Configurator */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-black text-[var(--color-text-primary)]">Subscription Plans Configurator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[var(--color-text-primary)]">{p.name}</h3>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400">{p.code}</span>
              </div>
              <p className="text-lg font-black text-[var(--color-text-primary)]">
                ₹{p.price_monthly}<span className="text-xs font-normal text-[var(--color-text-tertiary)]">/mo</span>
              </p>
              <button
                onClick={() => openEditModal(p)}
                className="w-full py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition cursor-pointer"
              >
                Edit Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Plan Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              {editingPlan ? `Edit ${editingPlan.name}` : "Create Subscription Plan"}
            </h2>
            <form onSubmit={handleSavePlan} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Plan Code</label>
                  <input
                    type="text"
                    value={planForm.code}
                    onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Yearly Price (₹)</label>
                  <input
                    type="number"
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Max Loans (-1 unlimited)</label>
                  <input
                    type="number"
                    value={planForm.max_loans}
                    onChange={(e) => setPlanForm({ ...planForm, max_loans: parseInt(e.target.value) || -1 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-secondary)] mb-1">Max Team Members</label>
                  <input
                    type="number"
                    value={planForm.max_team_members}
                    onChange={(e) => setPlanForm({ ...planForm, max_team_members: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPlanModal(false)}
                  className="px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white font-bold"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
