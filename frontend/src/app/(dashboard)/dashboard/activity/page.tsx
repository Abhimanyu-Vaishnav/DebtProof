/**
 * DebtProof — Activity Timeline Page
 * Unified chronological feed of all significant user events.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import apiClient from "@/services/api";
import { Topbar } from "@/components/layout/Topbar";

interface TimelineEntry {
  id: string;
  event_type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const EVENT_LABELS: Record<string, string> = {
  loan_created: "Loan",
  loan_updated: "Loan",
  loan_closed: "Loan",
  payment_added: "Payment",
  receipt_uploaded: "Receipt",
  invitation_sent: "Team",
  invitation_accepted: "Team",
  plan_changed: "Billing",
  feature_enabled: "Feature",
  feature_disabled: "Feature",
  ai_insight: "AI",
  automation_triggered: "Automation",
  report_generated: "Report",
  profile_updated: "Profile",
  login: "Security",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function groupByDate(entries: TimelineEntry[]) {
  const groups: Record<string, TimelineEntry[]> = {};
  entries.forEach((e) => {
    const date = new Date(e.created_at).toLocaleDateString("en-IN", { dateStyle: "long" });
    if (!groups[date]) groups[date] = [];
    groups[date].push(e);
  });
  return groups;
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    const getLocalActivities = (): TimelineEntry[] => {
      try {
        const raw = localStorage.getItem("debtproof_local_activities");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const initialDefaults: TimelineEntry[] = [
      {
        id: "act-init-1",
        event_type: "ai_insight",
        title: "AI Strategy Coach Activated",
        description: "Financial engine ready to analyze loan balances and payoff strategies.",
        icon: "🤖",
        color: "purple",
        created_at: new Date().toISOString(),
      },
      {
        id: "act-init-2",
        event_type: "login",
        title: "User Session Initialized",
        description: "Logged into DebtProof Financial Workspace.",
        icon: "🔐",
        color: "blue",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    try {
      const res = await apiClient.get("/ai/activity/");
      const data: TimelineEntry[] = Array.isArray(res.data) ? res.data : res.data.results || [];
      const localData = getLocalActivities();
      
      const mergedMap = new Map<string, TimelineEntry>();
      [...data, ...localData].forEach(item => {
        if (item.id && !mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });
      const combined = Array.from(mergedMap.values());
      
      if (combined.length === 0) {
        setEntries(initialDefaults);
      } else {
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setEntries(combined);
      }
    } catch {
      const localData = getLocalActivities();
      if (localData.length > 0) {
        const mergedMap = new Map<string, TimelineEntry>();
        [...localData, ...initialDefaults].forEach(item => {
          if (item.id && !mergedMap.has(item.id)) {
            mergedMap.set(item.id, item);
          }
        });
        const combined = Array.from(mergedMap.values());
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setEntries(combined);
      } else {
        setEntries(initialDefaults);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const [searchQuery, setSearchQuery] = useState("");

  const exportActivityCSV = () => {
    if (entries.length === 0) return;
    const headers = ["ID", "Event Type", "Title", "Description", "Date"];
    const rows = filtered.map(e => [
      `"${e.id}"`,
      `"${EVENT_LABELS[e.event_type] || e.event_type}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${(e.description || "").replace(/"/g, '""')}"`,
      `"${formatDate(e.created_at)}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DebtProof_Activity_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearActivityFeed = () => {
    if (confirm("Are you sure you want to clear local activity history?")) {
      localStorage.removeItem("debtproof_local_activities");
      fetchActivity();
    }
  };

  const filtered = entries.filter((e) => {
    const matchesFilter = filter ? e.event_type === filter : true;
    const matchesSearch = searchQuery
      ? e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  const grouped = groupByDate(filtered);
  const uniqueTypes = [...new Set(entries.map((e) => e.event_type))];

  return (
    <>
      <Topbar title="Activity Timeline" subtitle="Complete chronological record of your financial activity" />
      <main className="page-content">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header Controls: Search & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">🔍</span>
              <input
                type="text"
                placeholder="Search activity records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportActivityCSV}
                disabled={filtered.length === 0}
                className="px-3.5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                📥 Export CSV
              </button>
              <button
                onClick={clearActivityFeed}
                title="Clear local activity history"
                className="px-3 py-2 bg-[var(--color-surface-secondary)] hover:bg-red-500/10 text-[var(--color-text-secondary)] hover:text-red-500 font-bold rounded-xl text-xs transition cursor-pointer border border-[var(--color-border)]"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                !filter
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
              }`}
            >
              All
            </button>
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === type
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
              >
                {EVENT_LABELS[type] || type}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-secondary)] animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-4 w-48 bg-[var(--color-surface-secondary)] animate-pulse rounded" />
                    <div className="h-3 w-64 bg-[var(--color-surface-secondary)] animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center space-y-4">
              <div className="text-4xl">⏳</div>
              <h3 className="text-sm font-black text-[var(--color-text-primary)]">No activity filter matches</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Click "All" above or record new financial events to populate the timeline.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="text-xs font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-3 px-1">
                  {date}
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--color-border-light)]" />
                  <div className="space-y-1">
                    {items.map((entry) => (
                      <div key={entry.id} className="flex gap-3 group">
                        {/* Icon */}
                        <div className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center text-sm flex-shrink-0 ${COLOR_MAP[entry.color] || COLOR_MAP.blue}`}>
                          {entry.icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 mb-2 hover:border-[var(--color-primary)]/30 transition">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-[var(--color-text-primary)]">{entry.title}</p>
                              {entry.description && (
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{entry.description}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${COLOR_MAP[entry.color] || COLOR_MAP.blue}`}>
                                {EVENT_LABELS[entry.event_type] || entry.event_type}
                              </span>
                              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1 font-mono">
                                {formatDate(entry.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
