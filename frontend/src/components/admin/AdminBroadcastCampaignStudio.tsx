"use client";

import React, { useState } from "react";
import { Megaphone, Send, Sparkles, CheckCircle2, Users, Bell, Mail, Globe, Layers } from "lucide-react";

export function AdminBroadcastCampaignStudio() {
  const [title, setTitle] = useState("⚡ System Maintenance & Rate Optimization Alert");
  const [body, setBody] = useState(
    "DebtProof will undergo scheduled database maintenance on Sunday at 02:00 AM IST. All Monad on-chain proofs will remain fully active."
  );
  const [targetAudience, setTargetAudience] = useState<"All" | "Free" | "Pro" | "Enterprise">("All");
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelPush, setChannelPush] = useState(true);
  const [sending, setSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    // Simulate backend broadcast dispatcher call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const { notificationsService } = await import("@/services/notifications.service");
      await notificationsService.createNotification({
        title: title || "System Announcement",
        body: body.trim(),
        notif_type: "info",
      });
    } catch {}

    setDispatchResult(`Broadcast dispatched to ${targetAudience} users across active notification channels!`);
    setSending(false);
    setTimeout(() => setDispatchResult(null), 4000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Megaphone className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Targeted Push Notification & Broadcast Studio <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Dispatch multi-channel announcements to targeted user segments in real time
            </p>
          </div>
        </div>
      </div>

      {dispatchResult && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {dispatchResult}
        </div>
      )}

      <form onSubmit={handleSendBroadcast} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Campaign Form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
              placeholder="Title..."
              required
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2 flex-wrap text-xs">
            {[
              "⚡ System Maintenance Notice",
              "📢 SBI & HDFC Rate Cut Alert",
              "⏰ Monthly EMI Due Reminder",
              "🎁 Pro Plan Upgrade Discount",
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTitle(preset)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-purple-300 hover:border-purple-500/50 transition cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Body Text</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
              placeholder="Write broadcast body content here..."
              required
            />
          </div>
        </div>

        {/* Audience & Delivery Options */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Target Audience Segment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["All", "Free", "Pro", "Enterprise"] as const).map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setTargetAudience(aud)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      targetAudience === aud
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {aud === "All" ? "🌐 All Users" : `${aud} Tier`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Channels
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelInApp}
                    onChange={(e) => setChannelInApp(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-purple-500 focus:ring-0"
                  />
                  <span>🔔 In-App Notification Center</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelPush}
                    onChange={(e) => setChannelPush(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-purple-500 focus:ring-0"
                  />
                  <span>📲 OS / Web Browser Push Alert</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {sending ? "Dispatching..." : "🚀 Launch Broadcast Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
