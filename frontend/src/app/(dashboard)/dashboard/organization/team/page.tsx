/**
 * DebtProof — Team & RBAC Management Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants.service";
import { OrganizationMember, OrganizationInvitation, TenantRole } from "@/types/saas";

export default function TeamManagementPage() {
  const { activeOrganization } = useTenant();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantRole>("member");
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    const [mList, iList] = await Promise.all([
      tenantsService.getMembers(),
      tenantsService.getInvitations(),
    ]);
    setMembers(mList);
    setInvitations(iList);
  };

  useEffect(() => {
    loadData();
  }, [activeOrganization]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantsService.sendInvitation(inviteEmail, inviteRole);
      setInviteEmail("");
      setMsg(`Invitation sent to ${inviteEmail}!`);
      loadData();
    } catch {
      setMsg("Failed to send invitation.");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TenantRole) => {
    try {
      await tenantsService.updateMemberRole(memberId, newRole);
      loadData();
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Team Members & RBAC Roles</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Manage team access across Owner, Admin, Manager, Member, and Viewer permissions.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Invite Member Box */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">Invite New Member</h2>
        <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
            required
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TenantRole)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Active Members Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">Active Members ({members.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                <th className="py-2">User</th>
                <th className="py-2">Role</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 font-bold text-[var(--color-text-primary)]">
                    {m.user.full_name || m.user.email}
                    <div className="text-[10px] text-[var(--color-text-tertiary)] font-normal">{m.user.email}</div>
                  </td>
                  <td className="py-3">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as TenantRole)}
                      className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-bold text-[var(--color-text-primary)]"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3 text-[var(--color-text-tertiary)]">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Table */}
      {invitations.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">Pending Invitations ({invitations.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                  <th className="py-2">Email</th>
                  <th className="py-2">Assigned Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-bold text-[var(--color-text-primary)]">{inv.email}</td>
                    <td className="py-3 uppercase font-bold text-[10px] text-[var(--color-primary)]">{inv.role}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--color-text-tertiary)]">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
