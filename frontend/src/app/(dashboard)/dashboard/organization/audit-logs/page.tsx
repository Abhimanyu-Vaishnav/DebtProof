/**
 * DebtProof — Compliance Audit Logs Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants.service";
import { AuditLog } from "@/types/saas";

export default function AuditLogsPage() {
  const { activeOrganization } = useTenant();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    tenantsService.getAuditLogs().then(setLogs);
  }, [activeOrganization]);

  const filtered = logs.filter((l) => (filterAction ? l.action === filterAction : true));

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Compliance Audit Trail</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Immutable records of all user actions, security events, and configuration changes.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-bold text-[var(--color-text-primary)]"
          >
            <option value="">All Actions</option>
            <option value="login">User Login</option>
            <option value="loan_created">Loan Created</option>
            <option value="payment_recorded">Payment Recorded</option>
            <option value="role_changed">Role Changed</option>
            <option value="plan_changed">Plan Changed</option>
            <option value="feature_flag_toggled">Feature Flag Toggled</option>
            <option value="setting_updated">Setting Updated</option>
          </select>
          <a
            href="http://localhost:8000/api/v1/audit/logs/export/"
            download="debtproof_audit_logs.csv"
            className="px-3.5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold transition shadow cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        {filtered.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium text-center py-6">No audit logs recorded for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Target Resource</th>
                  <th className="py-2">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 text-[var(--color-text-tertiary)] font-mono text-[10px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-[var(--color-text-primary)]">{log.user_email}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--color-text-secondary)] font-semibold">{log.target_resource || "—"}</td>
                    <td className="py-3 text-[var(--color-text-tertiary)] font-mono text-[11px]">{log.ip_address || "127.0.0.1"}</td>
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
