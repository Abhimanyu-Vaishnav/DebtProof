/**
 * DebtProof — Production Team Management Page
 * Invitations, RBAC Roles, Member Removal, Suspension, Transfer Ownership & Search.
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
  const [searchMember, setSearchMember] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [transferModal, setTransferModal] = useState(false);
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
    } catch (err: any) {
      setMsg(err.response?.data?.message || err.message || "Failed to send invitation.");
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      await tenantsService.resendInvitation(inviteId);
      setMsg("Invitation resent successfully!");
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to resend invitation.");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await tenantsService.cancelInvitation(inviteId);
      setMsg("Invitation canceled.");
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to cancel invitation.");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TenantRole) => {
    try {
      await tenantsService.updateMemberRole(memberId, newRole);
      setMsg(`Member role updated to ${newRole}.`);
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      await tenantsService.updateMemberStatus(memberId, nextStatus);
      setMsg(`Member status set to ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await tenantsService.removeMember(memberId);
      setMsg("Member removed.");
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantsService.transferOwnership(transferEmail);
      setTransferModal(false);
      setMsg(`Organization ownership transferred to ${transferEmail}.`);
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Transfer failed. Ensure email belongs to an existing member.");
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.user.email.toLowerCase().includes(searchMember.toLowerCase()) || m.user.full_name.toLowerCase().includes(searchMember.toLowerCase());
    const matchesRole = filterRole ? m.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Team & RBAC Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Manage team access, RBAC roles, invitations, and workspace assignments.</p>
        </div>

        <button
          onClick={() => setTransferModal(true)}
          className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] text-xs font-bold text-[var(--color-text-primary)] transition cursor-pointer"
        >
          👑 Transfer Ownership
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Invite Member Box */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">Invite Team Member</h2>
        <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
            required
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TenantRole)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
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

      {/* Active Members Table & Controls */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">Organization Members ({members.length})</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search members..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-semibold text-[var(--color-text-primary)]"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-semibold text-[var(--color-text-primary)]"
            >
              <option value="">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                <th className="py-2">User</th>
                <th className="py-2">Role</th>
                <th className="py-2">Status</th>
                <th className="py-2">Joined</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
              {filteredMembers.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 font-bold text-[var(--color-text-primary)]">
                    {m.user.full_name || m.user.email}
                    <div className="text-[10px] text-[var(--color-text-tertiary)] font-normal">{m.user.email}</div>
                  </td>
                  <td className="py-3">
                    <select
                      value={m.role}
                      disabled={m.role === "owner"}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as TenantRole)}
                      className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-bold text-[var(--color-text-primary)] disabled:opacity-50"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      m.status === "suspended" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {m.status || "active"}
                    </span>
                  </td>
                  <td className="py-3 text-[var(--color-text-tertiary)]">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="py-3 text-right space-x-2">
                    {m.role !== "owner" && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(m.id, m.status)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border border-[var(--color-border)] hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] transition cursor-pointer"
                        >
                          {m.status === "suspended" ? "Activate" : "Suspend"}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations Ledger */}
      {invitations.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">Invitations Ledger ({invitations.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Expires</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-bold text-[var(--color-text-primary)]">{inv.email}</td>
                    <td className="py-3 uppercase font-bold text-[10px] text-[var(--color-primary)]">{inv.role}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        inv.status === "accepted" ? "bg-emerald-500/10 text-emerald-400" :
                        inv.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--color-text-tertiary)]">{new Date(inv.expires_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right space-x-2">
                      {inv.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleResendInvite(inv.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition cursor-pointer"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleCancelInvite(inv.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">Transfer Organization Ownership</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Enter the email address of the team member who will become the new Organization Owner.</p>
            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <input
                type="email"
                placeholder="newowner@company.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm font-semibold text-[var(--color-text-primary)]"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
