/**
 * DebtProof — Tenant & Workspace Switcher Component
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTenant } from "@/contexts/TenantContext";

export function TenantSwitcher() {
  const { organizations, activeOrganization, workspaces, activeWorkspace, setActiveOrganization, setActiveWorkspace } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-text-primary)] transition shadow-sm cursor-pointer"
        title="Switch Organization / Workspace"
      >
        <div className="w-5 h-5 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-[10px] uppercase shrink-0">
          {activeOrganization ? activeOrganization.name[0] : "O"}
        </div>
        <div className="flex flex-col text-left truncate max-w-[120px] sm:max-w-[160px]">
          <span className="truncate leading-tight">{activeOrganization?.name || "Personal Org"}</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium truncate">
            {activeWorkspace?.name || "Personal Workspace"}
          </span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-72 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl z-50 p-2 space-y-2 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          {/* Organizations Section */}
          <div>
            <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Organizations ({organizations.length})
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setActiveOrganization(org)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeOrganization?.id === org.id
                      ? "bg-[var(--color-primary-light)]/10 text-[var(--color-primary)]"
                      : "hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {activeOrganization?.id === org.id && (
                    <span className="text-[10px] bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded-full font-black">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Workspaces Section */}
          {workspaces.length > 0 && (
            <div className="border-t border-[var(--color-border-light)] pt-1.5">
              <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Workspaces ({workspaces.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspace(ws)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-semibold transition text-left cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] font-bold"
                        : "hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-500/10 text-slate-400">
                      {ws.workspace_type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SaaS Navigation Quick Links */}
          <div className="border-t border-[var(--color-border-light)] pt-1.5 space-y-0.5 text-xs font-bold">
            <Link
              href="/dashboard/organization"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] transition"
            >
              ⚙️ Organization Settings
            </Link>
            <Link
              href="/dashboard/organization/team"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] transition"
            >
              👥 Team & RBAC Roles
            </Link>
            <Link
              href="/dashboard/organization/billing"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] transition"
            >
              💳 Subscription & Billing
            </Link>
            <Link
              href="/dashboard/organization/feature-flags"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] transition"
            >
              🚩 Feature Flags Studio
            </Link>
            <Link
              href="/dashboard/organization/audit-logs"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] transition"
            >
              📜 Compliance Audit Logs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
