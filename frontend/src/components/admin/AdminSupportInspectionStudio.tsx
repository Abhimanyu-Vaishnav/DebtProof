/**
 * DebtProof — Admin Multi-Tier Support & Ticket Live Chat Inspection Studio
 * Allows SuperAdmin and Admin Managers to view all staff ticket chats, inspect client conversation history, escalate tickets, and configure agent permissions.
 */
"use client";

import React, { useState, useEffect } from "react";
import { supportService, type SupportTicketItem, type SupportStaffConfig } from "@/services/support.service";
import { 
  Eye, 
  MessageSquare, 
  ShieldAlert, 
  UserCheck, 
  Send, 
  Sliders, 
  CheckCircle2, 
  X,
  Lock,
  Unlock,
  CornerDownRight,
  Sparkles
} from "lucide-react";

export function AdminSupportInspectionStudio() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [inspectorRole, setInspectorRole] = useState<"SuperAdmin" | "AdminManager" | "CustomerSupport">("SuperAdmin");
  
  // Live Chat Inspection Input
  const [adminReply, setAdminReply] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Staff Agent Config State
  const [agentConfig, setAgentConfig] = useState<SupportStaffConfig>({
    id: "cfg-1",
    staff_id: "staff-1",
    staff_name: "Rohan Verma",
    staff_email: "rohan.support@debtproof.io",
    role: "CustomerSupport",
    department: "Level 1 Support",
    queries_resolved: 42,
    avg_rating: 4.8,
    total_ratings_received: 38,
    calculated_monthly_salary_inr: 45000,
    can_view_user_loans: true,
    can_view_user_payments: true,
    can_view_user_credit_cards: true,
    can_edit_user_account: false,
    can_escalate_to_manager: true,
    can_escalate_to_admin: false,
    can_refund_or_settle: false,
    allowed_modules: ["loans", "payments", "tickets"],
  });

  const loadData = async () => {
    const list = await supportService.getTickets();
    setTickets(list);
    if (!selectedTicket && list.length > 0) setSelectedTicket(list[0]);
    else if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminSendReply = async () => {
    if (!adminReply.trim() || !selectedTicket) return;
    const roleKey = inspectorRole === "SuperAdmin" ? "admin" : inspectorRole === "AdminManager" ? "manager" : "customer_support";
    const roleName = inspectorRole === "SuperAdmin" ? "SuperAdmin (Platform Director)" : "Neha Gupta (Support Manager)";

    await supportService.sendTicketMessage(selectedTicket.id, adminReply, roleKey as any, roleName);
    setAdminReply("");
    await loadData();
  };

  const handleExecuteEscalation = async (targetTier: "AdminManager" | "SuperAdmin") => {
    if (!selectedTicket) return;
    await supportService.escalateTicket(selectedTicket.id, targetTier, escalateReason || "Escalated by Admin Manager for higher level review", inspectorRole.toLowerCase());
    setShowEscalateModal(false);
    setEscalateReason("");
    await loadData();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Header & Role Switcher Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              🛡️ Live Chat Monitor & Escalation Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">Viewing Mode: {inspectorRole}</span>
          </div>
          <h2 className="text-xl font-black text-white">Customer Support Staff & Ticket Live Inspection</h2>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Inspect As:</span>
          {(["SuperAdmin", "AdminManager", "CustomerSupport"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setInspectorRole(r)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                inspectorRole === r
                  ? "bg-rose-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Tickets Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" /> Active Tickets ({tickets.length})
            </h3>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-1 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-[10px] flex items-center gap-1.5 hover:bg-purple-600 hover:text-white transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" /> Staff Dashboard Config
            </button>
          </div>

          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                  selectedTicket?.id === t.id
                    ? "bg-rose-950/40 border-rose-500/40 text-white shadow-lg"
                    : "bg-slate-950 border-slate-800 hover:bg-slate-800/50 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-rose-400 font-bold">#{t.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      t.status === "escalated"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                        : t.status === "resolved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 truncate">{t.subject}</h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800 font-mono">
                  <span>Client: <strong>{t.user_name}</strong></span>
                  <span className="text-purple-400 font-bold">Tier: {t.tier_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Chat Monitor & Intervention Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[620px]">
          {selectedTicket ? (
            <>
              {/* Header Info Bar */}
              <div className="pb-4 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-rose-400 font-bold">
                      #{selectedTicket.id}
                    </span>
                    <h3 className="text-base font-black text-white">{selectedTicket.subject}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const notes = prompt("Enter resolution notes:");
                        if (notes) {
                          await supportService.resolveTicket(selectedTicket.id, notes, inspectorRole.toLowerCase() as any, inspectorRole);
                          loadData();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                    </button>

                    {(inspectorRole === "SuperAdmin" || inspectorRole === "AdminManager") && (
                      <button
                        onClick={() => setShowEscalateModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs hover:bg-amber-500 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-4 h-4" /> Escalate Ticket Tier
                      </button>
                    )}
                  </div>
                </div>

                {/* Client Profile Details & Rating Inspection */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
                  <div>
                    <span className="text-slate-400">Client:</span> <strong>{selectedTicket.user_name}</strong> ({selectedTicket.user_email})
                  </div>
                  <div>
                    <span className="text-slate-400">Assigned Agent:</span> <strong>{selectedTicket.assigned_staff_name || "Support Rep Level 1"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Client Rating:</span>{" "}
                    {selectedTicket.user_rating ? (
                      <span className="text-amber-400 font-bold font-mono">
                        ★ {selectedTicket.user_rating}/5 ({selectedTicket.user_feedback || "Satisfied"})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Not rated yet</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400">Tier:</span> <strong className="text-purple-400">{selectedTicket.tier_level}</strong>
                  </div>
                </div>
              </div>

              {/* Chat Message Logs */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {selectedTicket.chat_messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender_role === "user" ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 font-mono">
                      <strong>{msg.sender_name}</strong>
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 uppercase text-[9px]">
                        {msg.sender_role}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                        msg.sender_role === "user"
                          ? "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                          : msg.is_internal_note
                          ? "bg-amber-950/40 border border-amber-500/40 text-amber-200 rounded-tr-none font-mono"
                          : "bg-rose-600 text-white font-medium rounded-tr-none shadow-md"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin/Manager Chat Intervention Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-rose-500 focus:outline-none"
                  placeholder={`Intervene in live ticket chat as ${inspectorRole}...`}
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminSendReply()}
                />

                <button
                  onClick={handleAdminSendReply}
                  disabled={!adminReply.trim()}
                  className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  <span>Send Intervention</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Select a ticket to inspect live staff-client chat history
            </div>
          )}
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalateModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-100">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Escalate Ticket Level
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              If Customer Support cannot resolve this ticket or if backend account adjustments are required, escalate to Support Manager or SuperAdmin.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Escalation Reason / Notes</label>
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                placeholder="Reason for escalation e.g. Customer requested interest recalculation..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleExecuteEscalation("AdminManager")}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Escalate to Manager
              </button>

              <button
                onClick={() => handleExecuteEscalation("SuperAdmin")}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Escalate to SuperAdmin
              </button>
            </div>

            <button
              onClick={() => setShowEscalateModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Staff Dashboard Permissions Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" /> Admin Control: Support Staff Permissions
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span>View User Loans & Payment Records</span>
                <input
                  type="checkbox"
                  checked={agentConfig.can_view_user_loans}
                  onChange={(e) => setAgentConfig({ ...agentConfig, can_view_user_loans: e.target.checked })}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span>View Credit Cards & Utilizations</span>
                <input
                  type="checkbox"
                  checked={agentConfig.can_view_user_credit_cards}
                  onChange={(e) => setAgentConfig({ ...agentConfig, can_view_user_credit_cards: e.target.checked })}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span>Directly Edit/Modify User Account Data</span>
                <input
                  type="checkbox"
                  checked={agentConfig.can_edit_user_account}
                  onChange={(e) => setAgentConfig({ ...agentConfig, can_edit_user_account: e.target.checked })}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span>Escalate Tickets to Manager / Admin</span>
                <input
                  type="checkbox"
                  checked={agentConfig.can_escalate_to_manager}
                  onChange={(e) => setAgentConfig({ ...agentConfig, can_escalate_to_manager: e.target.checked })}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>
            </div>

            <button
              onClick={() => {
                supportService.updateStaffConfig(agentConfig);
                setShowConfigModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg transition"
            >
              Save Staff Dashboard Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
