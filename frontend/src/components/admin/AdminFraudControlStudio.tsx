"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, UserX, Lock, CheckCircle2, RefreshCw, Eye, ShieldCheck } from "lucide-react";

interface FraudAlertItem {
  id: string;
  type: string;
  severity: "urgent" | "high" | "medium";
  message: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  resolved: boolean;
}

const INITIAL_ALERTS: FraudAlertItem[] = [
  {
    id: "fa-101",
    type: "Duplicate SHA-256 Receipt Hash Detected",
    severity: "urgent",
    message: "Same bank payment receipt SHA-256 hash was uploaded by 2 different user accounts.",
    userName: "Rahul Sharma",
    userEmail: "rahul.s@example.com",
    createdAt: "10 mins ago",
    resolved: false,
  },
  {
    id: "fa-102",
    type: "Unusual Loan Volume Spike",
    severity: "high",
    message: "User created ₹50,00,000 personal loan entry without valid OCR bank statement verification.",
    userName: "Vikram Malhotra",
    userEmail: "vikram.m@example.com",
    createdAt: "45 mins ago",
    resolved: false,
  },
  {
    id: "fa-103",
    type: "Repeated Payment Webhook Failures",
    severity: "medium",
    message: "5 consecutive failed Razorpay webhook callback attempts from IP 103.44.12.98.",
    userName: "Ananya Patel",
    userEmail: "ananya.p@example.com",
    createdAt: "2 hours ago",
    resolved: false,
  },
];

export function AdminFraudControlStudio() {
  const [alerts, setAlerts] = useState<FraudAlertItem[]>(INITIAL_ALERTS);
  const [suspendedUsers, setSuspendedUsers] = useState<string[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    setActionSuccess(`Alert ${id} resolved successfully.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleFreezeUser = (email: string) => {
    setSuspendedUsers((prev) => [...prev, email]);
    setActionSuccess(`User ${email} suspended & Monad access key revoked.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Live AI Fraud Radar & Anomaly Detection Studio
            </h3>
            <p className="text-xs text-slate-400">
              Real-time heuristic scanner for duplicate receipt hashes, high-risk loans, and bad IP callbacks
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> AI Heuristics Active
        </span>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {actionSuccess}
        </div>
      )}

      {/* Alert Feed List */}
      <div className="space-y-3">
        {alerts.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all ${
              item.resolved
                ? "bg-slate-950/40 border-slate-800 opacity-60"
                : item.severity === "urgent"
                ? "bg-rose-950/30 border-rose-500/40"
                : item.severity === "high"
                ? "bg-amber-950/20 border-amber-500/30"
                : "bg-slate-950 border-slate-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      item.severity === "urgent"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                        : item.severity === "high"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    }`}
                  >
                    {item.severity}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100">{item.type}</h4>
                </div>
                <p className="text-xs text-slate-300">{item.message}</p>
                <p className="text-[11px] text-slate-400">
                  Target Account: <b className="text-slate-200">{item.userName} ({item.userEmail})</b> • {item.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!suspendedUsers.includes(item.userEmail) ? (
                  <button
                    onClick={() => handleFreezeUser(item.userEmail)}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" /> Freeze Account
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/40">
                    FROZEN 🚫
                  </span>
                )}

                {!item.resolved ? (
                  <button
                    onClick={() => handleResolveAlert(item.id)}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400">Resolved ✅</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
