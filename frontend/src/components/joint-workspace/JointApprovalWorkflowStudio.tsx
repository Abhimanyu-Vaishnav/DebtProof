"use client";

import React, { useState } from "react";
import { Users, CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, AlertCircle, Sparkles } from "lucide-react";

interface PendingApproval {
  id: string;
  title: string;
  requestedBy: string;
  amount: number;
  date: string;
  requiredApprovals: number;
  currentApprovals: number;
  status: "pending" | "approved" | "rejected";
  signers: { name: string; status: "approved" | "pending" | "rejected"; date?: string }[];
}

const MOCK_APPROVALS: PendingApproval[] = [
  {
    id: "app-101",
    title: "HDFC Joint Home Loan EMI Payment",
    requestedBy: "Abhimanyu V. (Primary)",
    amount: 42500,
    date: "2026-08-01",
    requiredApprovals: 2,
    currentApprovals: 1,
    status: "pending",
    signers: [
      { name: "Abhimanyu V. (Primary)", status: "approved", date: "Today 10:30 AM" },
      { name: "Priya V. (Co-Borrower)", status: "pending" },
    ],
  },
  {
    id: "app-102",
    title: "Household Emergency Fund Allocation",
    requestedBy: "Priya V. (Co-Borrower)",
    amount: 15000,
    date: "2026-07-28",
    requiredApprovals: 2,
    currentApprovals: 2,
    status: "approved",
    signers: [
      { name: "Priya V. (Co-Borrower)", status: "approved", date: "Jul 28" },
      { name: "Abhimanyu V. (Primary)", status: "approved", date: "Jul 28" },
    ],
  },
];

export function JointApprovalWorkflowStudio() {
  const [approvals, setApprovals] = useState<PendingApproval[]>(MOCK_APPROVALS);

  const handleAction = (id: string, action: "approve" | "reject") => {
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updatedSigners = item.signers.map((s) =>
          s.status === "pending" ? { ...s, status: action === "approve" ? "approved" : "rejected", date: "Just now" } : s
        );
        const approvedCount = updatedSigners.filter((s) => s.status === "approved").length;
        return {
          ...item,
          signers: updatedSigners as any,
          currentApprovals: approvedCount,
          status: action === "reject" ? "rejected" : approvedCount >= item.requiredApprovals ? "approved" : "pending",
        };
      })
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Family & Joint Multi-Signer Approval Studio <Sparkles className="w-4 h-4 text-purple-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Co-borrower 2-step verification & authorization workflow for joint loan repayments
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> 2-of-2 Multisig Protected
        </span>
      </div>

      <div className="space-y-4">
        {approvals.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border transition ${
              item.status === "pending"
                ? "bg-purple-950/20 border-purple-500/40"
                : item.status === "approved"
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-rose-950/20 border-rose-500/30"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100 text-sm">{item.title}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "pending"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : item.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {item.status} ({item.currentApprovals}/{item.requiredApprovals} Signed)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Requested by {item.requestedBy} • {item.date}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Transaction Amount</span>
                <span className="text-lg font-black text-purple-400">₹{item.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Signers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {item.signers.map((signer, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-200">{signer.name}</span>
                  </div>

                  {signer.status === "approved" ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved {signer.date && `(${signer.date})`}
                    </span>
                  ) : signer.status === "rejected" ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Awaiting Signature
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons if Pending */}
            {item.status === "pending" && (
              <div className="flex gap-3 pt-3 mt-1 justify-end">
                <button
                  onClick={() => handleAction(item.id, "reject")}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Request
                </button>
                <button
                  onClick={() => handleAction(item.id, "approve")}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-emerald-900/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Co-Sign & Approve Payment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
