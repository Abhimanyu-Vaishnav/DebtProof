/**
 * DebtProof — Subscriptions & Billing Architecture Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants.service";
import { Plan, OrganizationSubscription, Invoice, BillingTransaction } from "@/types/saas";

export default function BillingPage() {
  const { activeOrganization } = useTenant();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscribing, setSubscribing] = useState("");
  const [msg, setMsg] = useState("");

  const loadBillingData = async () => {
    const [pData, iData] = await Promise.all([
      tenantsService.getBillingPlans(),
      tenantsService.getInvoices(),
    ]);
    setPlans(pData.plans);
    setSubscription(pData.current_subscription);
    setInvoices(iData.invoices);
    setTransactions(iData.transactions);
  };

  useEffect(() => {
    loadBillingData();
  }, [activeOrganization]);

  const handleSubscribe = async (planCode: string) => {
    try {
      setSubscribing(planCode);
      const sub = await tenantsService.subscribePlan(planCode);
      setSubscription(sub);
      setMsg(`Successfully subscribed to ${planCode.toUpperCase()} Plan!`);
      loadBillingData();
    } catch {
      setMsg("Subscription update failed.");
    } finally {
      setSubscribing("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Subscription & Billing Architecture</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Manage tenant pricing tiers, usage limits, invoices, and payment ledgers.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Current Subscription Status Banner */}
      {subscription && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Active Tier
            </span>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] mt-1">{subscription.plan.name}</h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Status: <span className="font-bold text-emerald-400 uppercase">{subscription.status}</span> · Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[var(--color-text-primary)]">
              ₹{subscription.plan.price_monthly}<span className="text-xs font-medium text-[var(--color-text-tertiary)]">/mo</span>
            </p>
          </div>
        </div>
      )}

      {/* Subscription Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-black text-[var(--color-text-primary)]">Available Subscription Plans</h2>
          <div className="flex items-center gap-2 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly" ? "bg-[var(--color-primary)] text-white shadow" : "text-[var(--color-text-secondary)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                billingCycle === "yearly" ? "bg-[var(--color-primary)] text-white shadow" : "text-[var(--color-text-secondary)]"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = subscription?.plan?.code === p.code;
            const displayPrice = billingCycle === "yearly" ? (p.price_yearly > 0 ? (p.price_yearly / 12).toFixed(0) : 0) : p.price_monthly;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm transition relative ${
                  isCurrent
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/5 ring-1 ring-[var(--color-primary)]"
                    : p.is_recommended || p.is_popular
                    ? "border-amber-500/50 bg-[var(--color-surface)] shadow-md"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40"
                }`}
              >
                {p.is_recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow">
                    Recommended
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[var(--color-text-primary)]">{p.name}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--color-primary)] text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-[var(--color-text-primary)]">
                    ₹{displayPrice}<span className="text-xs font-semibold text-[var(--color-text-tertiary)]">/mo</span>
                    {billingCycle === "yearly" && p.price_yearly > 0 && (
                      <span className="block text-[10px] text-emerald-400 font-bold">billed ₹{p.price_yearly}/yr</span>
                    )}
                  </p>
                  <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)] font-medium pt-2 border-t border-[var(--color-border-light)]">
                    <li>• Loans: {p.max_loans === -1 ? "Unlimited" : p.max_loans}</li>
                    <li>• Storage: {(p.max_storage_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB</li>
                    <li>• Reports: {p.max_reports === -1 ? "Unlimited" : p.max_reports}</li>
                    <li>• AI Requests: {p.max_ai_requests === -1 ? "Unlimited" : p.max_ai_requests}</li>
                    <li>• Team Members: {p.max_team_members}</li>
                    <li>• Workspaces: {p.workspace_limit || 1}</li>
                    <li>• API Access: {p.allow_api_access ? "Included ✅" : "No ❌"}</li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(p.code)}
                  disabled={isCurrent || subscribing === p.code}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                    isCurrent
                      ? "bg-slate-500/20 text-slate-400 cursor-not-allowed"
                      : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
                  }`}
                >
                  {subscribing === p.code ? "Processing..." : isCurrent ? "Active Tier" : "Upgrade Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-black text-[var(--color-text-primary)]">Billing Invoices & History</h2>
        {invoices.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium py-4 text-center">No invoice history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-bold font-mono text-[var(--color-text-primary)]">{inv.invoice_number}</td>
                    <td className="py-3 font-bold text-[var(--color-text-primary)]">₹{inv.amount_paid}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--color-text-tertiary)]">{new Date(inv.billing_date).toLocaleDateString()}</td>
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
