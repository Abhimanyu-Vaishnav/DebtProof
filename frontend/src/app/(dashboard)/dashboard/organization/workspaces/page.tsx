/**
 * DebtProof — Workspaces Management Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants.service";
import { Workspace } from "@/types/saas";

export default function WorkspacesPage() {
  const { activeOrganization, refreshTenants } = useTenant();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", workspace_type: "personal", description: "" });

  useEffect(() => {
    tenantsService.getWorkspaces().then(setWorkspaces);
  }, [activeOrganization]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantsService.createWorkspace(form);
      setModalOpen(false);
      setForm({ name: "", workspace_type: "personal", description: "" });
      const updated = await tenantsService.getWorkspaces();
      setWorkspaces(updated);
      refreshTenants();
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Workspaces</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Organize financial liabilities into Personal, Family, Business, and Startup contexts.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold transition shadow-md cursor-pointer"
        >
          + Create Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <div key={ws.id} className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3 shadow-sm hover:border-[var(--color-primary)]/50 transition">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] truncate">{ws.name}</h2>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                {ws.workspace_type}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] min-h-[32px]">{ws.description || "No description provided."}</p>
            <div className="text-[10px] text-[var(--color-text-tertiary)] pt-2 border-t border-[var(--color-border-light)] flex justify-between">
              <span>Created {new Date(ws.created_at).toLocaleDateString()}</span>
              <span className="font-mono">/ws/{ws.slug}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">New Workspace</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Startup Liabilities, Family Budget"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Category</label>
                <select
                  value={form.workspace_type}
                  onChange={(e) => setForm({ ...form, workspace_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  <option value="personal">Personal</option>
                  <option value="family">Family</option>
                  <option value="business">Business</option>
                  <option value="investment">Investment</option>
                  <option value="rental">Rental Property</option>
                  <option value="startup">Startup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
