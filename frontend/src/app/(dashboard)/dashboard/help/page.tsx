/**
 * DebtProof — Help & Customer Support Hub with Multi-Tier Ticket Chat
 * Features direct user ticket submission, live chat, multi-tier escalation tracking, and direct contact.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { supportService, type SupportTicketItem, type TicketMessageItem } from "@/services/support.service";
import { useToast } from "@/components/ui/Toast";
import { 
  Headphones, 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Plus, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  LifeBuoy,
  FileText,
  HelpCircle,
  ArrowUpRight
} from "lucide-react";

export default function SupportHelpPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "new_ticket" | "faq">("tickets");
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);

  // Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);

  // Live Chat Reply State
  const [replyText, setReplyText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const { showToast } = useToast();

  const loadTickets = async () => {
    const list = await supportService.getTickets();
    setTickets(list);
    if (!selectedTicket && list.length > 0) {
      setSelectedTicket(list[0]);
    } else if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const created = await supportService.createTicket({ subject, message, priority });
      showToast("Support ticket created successfully! Representative assigned.", "success");
      setSubject("");
      setMessage("");
      setActiveTab("tickets");
      await loadTickets();
      setSelectedTicket(created);
    } catch {
      showToast("Failed to create ticket. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket || chatLoading) return;

    setChatLoading(true);
    try {
      await supportService.sendTicketMessage(selectedTicket.id, replyText, "user", "You (Client)");
      setReplyText("");
      showToast("Message sent to support team.", "success");
      await loadTickets();
    } catch {
      showToast("Failed to send message.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Help & Customer Support Desk" subtitle="24/7 Multi-Tier Customer Support, Direct Ticket Chat & Escalate System" />

      <main className="page-content space-y-6 pb-16 font-sans">
        {/* Support Hero Header */}
        <div className="card bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-amber-400" /> Multi-Tier Support Resolution Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">Support Level: Support → Manager → Admin</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black">Customer Support & Assistance Hub</h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                Connect directly with our dedicated customer support representatives. If your issue requires account adjustments, it automatically escalates to Support Managers and SuperAdmin!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("new_ticket")}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Support Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === "tickets"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> My Active Support Tickets ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab("new_ticket")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === "new_ticket"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" /> File New Complaint / Request
          </button>
        </div>

        {/* TAB 1: ACTIVE TICKETS & LIVE CHAT INTERFACE */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets Sidebar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-purple-400" /> Your Support Tickets
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">{tickets.length} Records</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {tickets.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-xs text-slate-500">No active support tickets found.</p>
                    <button
                      onClick={() => setActiveTab("new_ticket")}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                    >
                      Create First Ticket
                    </button>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                        selectedTicket?.id === t.id
                          ? "bg-purple-950/40 border-purple-500/40 text-white shadow-lg"
                          : "bg-slate-950 border-slate-800 hover:bg-slate-800/50 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-400 font-bold">#{t.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            t.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : t.status === "escalated"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold truncate text-slate-100">{t.subject}</h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                        <span>Assigned: <strong>{t.tier_level}</strong></span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ticket Chat & Escalation Status Details */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[600px]">
              {selectedTicket ? (
                <>
                  {/* Ticket Header & Multi-Tier Badge */}
                  <div className="pb-4 border-b border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-purple-400">
                          #{selectedTicket.id}
                        </span>
                        <h2 className="text-base font-black text-white">{selectedTicket.subject}</h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Tier: {selectedTicket.tier_level}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Assigned Rep: <strong className="text-slate-200">{selectedTicket.assigned_staff_name || "Support Staff Level 1"}</strong></span>
                      </div>

                      {selectedTicket.escalation_reason && (
                        <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Escalated Reason: {selectedTicket.escalation_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                    {selectedTicket.chat_messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender_role === "user" ? "items-end" : "items-start"
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
                              ? "bg-purple-600 text-white font-medium rounded-tr-none shadow-md"
                              : msg.is_internal_note
                              ? "bg-amber-950/40 border border-amber-500/40 text-amber-200 rounded-tl-none font-mono"
                              : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Box */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                      placeholder="Type your response to support agent..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={chatLoading || !replyText.trim()}
                      className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                    >
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-500">
                  <LifeBuoy className="w-12 h-12 stroke-1" />
                  <p className="text-xs">Select a ticket from the left sidebar to view live chat</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE NEW TICKET FORM */}
        {activeTab === "new_ticket" && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 font-sans">
            <div className="space-y-1 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Submit New Support Ticket</h3>
              <p className="text-xs text-slate-400">
                Our Level-1 Support team responds within 15 minutes. Escalated tickets are reviewed by Support Managers.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Issue Subject / Category</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none font-bold"
                  placeholder="e.g. Loan foreclosure status mismatch / Tax PDF export inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Priority Level</label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none font-bold"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="normal">Normal Priority (Standard Response)</option>
                  <option value="high">High Priority (Within 1 Hour)</option>
                  <option value="urgent">Urgent Priority (Immediate Escalation)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Detailed Message / Account Problem Description</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none font-sans"
                  placeholder="Provide your loan ID, transaction reference numbers, or exact details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tickets")}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-xl disabled:opacity-50"
                >
                  {submitting ? "Submitting Ticket..." : "Submit Ticket & Start Chat"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
