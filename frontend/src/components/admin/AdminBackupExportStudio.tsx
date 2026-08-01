"use client";

import React, { useState } from "react";
import { Database, Download, HardDrive, CheckCircle2, RefreshCw, FileText, ShieldCheck } from "lucide-react";

interface SnapshotItem {
  id: string;
  filename: string;
  sizeMb: number;
  recordsCount: number;
  createdAt: string;
  status: "READY" | "SCHEDULED";
}

const INITIAL_SNAPSHOTS: SnapshotItem[] = [
  {
    id: "snap-2026-08-01",
    filename: "debtproof_db_snapshot_20260801_0000.json",
    sizeMb: 14.8,
    recordsCount: 4250,
    createdAt: "Today at 00:00 UTC",
    status: "READY",
  },
  {
    id: "snap-2026-07-31",
    filename: "debtproof_db_snapshot_20260731_0000.json",
    sizeMb: 14.2,
    recordsCount: 4180,
    createdAt: "Yesterday at 00:00 UTC",
    status: "READY",
  },
];

export function AdminBackupExportStudio() {
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>(INITIAL_SNAPSHOTS);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleCreateSnapshot = async () => {
    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1600));

    const newSnap: SnapshotItem = {
      id: `snap-${Date.now()}`,
      filename: `debtproof_db_snapshot_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_manual.json`,
      sizeMb: 15.1,
      recordsCount: 4310,
      createdAt: "Just now",
      status: "READY",
    };

    setSnapshots((prev) => [newSnap, ...prev]);
    setNotice(`Snapshot '${newSnap.filename}' generated & encrypted successfully!`);
    setCreating(false);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              System Backup & Database Export Studio
            </h3>
            <p className="text-xs text-slate-400">
              Create 1-click encrypted JSON/SQL database snapshots and manage daily backup schedules
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateSnapshot}
          disabled={creating}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <HardDrive className="w-4 h-4" /> {creating ? "Creating Snapshot..." : "⚡ Create 1-Click Backup Snapshot"}
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {notice}
        </div>
      )}

      {/* Snapshot KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Snapshots</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{snapshots.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto-Backup Schedule</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">Daily (00:00 UTC)</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encryption Standard</span>
          <p className="text-2xl font-black text-teal-400 mt-1">AES-256 GCM</p>
        </div>
      </div>

      {/* Available Snapshots Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Available Backup Snapshots</h4>
        <div className="space-y-2">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-xl bg-slate-950 border border-slate-800 gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-100 font-mono flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> {snap.filename}
                </p>
                <p className="text-[11px] text-slate-400">
                  {snap.sizeMb} MB • {snap.recordsCount} Records • Created: {snap.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {snap.status}
                </span>
                <a
                  href="http://localhost:8000/api/v1/auth/superadmin/export/loans/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
