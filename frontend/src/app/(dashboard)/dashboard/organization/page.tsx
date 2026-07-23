/**
 * DebtProof — Organization Profile & General Settings
 */
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants.service";

export default function OrganizationSettingsPage() {
  const { activeOrganization, refreshTenants } = useTenant();
  const [form, setForm] = useState({
    name: "",
    currency: "INR",
    timezone: "UTC",
    require_2fa: false,
    allowed_email_domains: "",
    notify_on_new_member: true,
    notify_on_payment: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (activeOrganization) {
      setForm((prev) => ({
        ...prev,
        name: activeOrganization.name || "",
        currency: activeOrganization.currency || "INR",
        timezone: activeOrganization.timezone || "UTC",
      }));

      tenantsService.getSettings().then((res) => {
        if (res.settings) {
          setForm((prev) => ({
            ...prev,
            require_2fa: res.settings.require_2fa,
            allowed_email_domains: res.settings.allowed_email_domains || "",
            notify_on_new_member: res.settings.notify_on_new_member,
            notify_on_payment: res.settings.notify_on_payment,
          }));
        }
      }).catch(() => {});
    }
  }, [activeOrganization]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await tenantsService.updateSettings(form);
      setMsg("Organization settings updated successfully!");
      refreshTenants();
    } catch {
      setMsg("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Organization Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Manage tenant identity, default currency, timezones, and security policies.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-2">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Organization Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Default Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Timezone</label>
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Allowed Email Domains (Auto-Join)</label>
              <input
                type="text"
                placeholder="acme.com, tech.org"
                value={form.allowed_email_domains}
                onChange={(e) => setForm({ ...form, allowed_email_domains: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-2">
            Security & Notification Controls
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.require_2fa}
                onChange={(e) => setForm({ ...form, require_2fa: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Require 2FA for all team members</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notify_on_new_member}
                onChange={(e) => setForm({ ...form, notify_on_new_member: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Send email notification when new members join</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notify_on_payment}
                onChange={(e) => setForm({ ...form, notify_on_payment: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Send confirmation email on payment records</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
