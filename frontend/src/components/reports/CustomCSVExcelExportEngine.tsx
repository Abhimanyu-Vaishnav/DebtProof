"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function CustomCSVExcelExportEngine() {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "json">("csv");
  const [includeReceipts, setIncludeReceipts] = useState(true);

  const handleExportData = () => {
    const sampleData = [
      { date: "2026-07-01", type: "EMI Payment", loan: "HDFC Home Loan", amount: 28500, hash: "0x8f2a...91a" },
      { date: "2026-07-05", type: "Credit Card Bill", loan: "ICICI Credit Card", amount: 6000, hash: "0x3e1b...44c" },
      { date: "2026-07-15", type: "P2P Settlement", loan: "Rohan Promissory Note", amount: 15000, hash: "0x9c4f...21b" },
    ];

    if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DebtProof_Financial_Audit_${Date.now()}.json`;
      a.click();
    } else {
      const headers = "Date,Type,Loan Name,Amount (INR),Monad Proof Hash\n";
      const rows = sampleData.map((d) => `${d.date},${d.type},"${d.loan}",${d.amount},${d.hash}`).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DebtProof_Financial_Audit_${Date.now()}.${exportFormat === "excel" ? "xlsx" : "csv"}`;
      a.click();
    }
  };

  return (
    <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4 rounded-2xl shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Custom Financial CSV & Excel Export Engine</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">Export audit-ready payment histories, ZK hashes, and loan ledgers for CAs and tax filing.</p>
          </div>
        </div>

        <button
          onClick={handleExportData}
          className="btn btn-primary btn-sm px-4 py-2 font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>📥</span> <span>Export {exportFormat.toUpperCase()} File</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-text-secondary)] font-bold">Format:</span>
          <div className="flex rounded-xl bg-[var(--color-surface-tertiary)] p-1 border border-[var(--color-border-light)]">
            <button
              onClick={() => setExportFormat("csv")}
              className={`px-3 py-1 rounded-lg ${exportFormat === "csv" ? "bg-purple-600 text-white font-bold" : "text-[var(--color-text-tertiary)]"}`}
            >
              CSV
            </button>
            <button
              onClick={() => setExportFormat("excel")}
              className={`px-3 py-1 rounded-lg ${exportFormat === "excel" ? "bg-purple-600 text-white font-bold" : "text-[var(--color-text-tertiary)]"}`}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => setExportFormat("json")}
              className={`px-3 py-1 rounded-lg ${exportFormat === "json" ? "bg-purple-600 text-white font-bold" : "text-[var(--color-text-tertiary)]"}`}
            >
              JSON
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text-secondary)] font-bold">
          <input
            type="checkbox"
            checked={includeReceipts}
            onChange={(e) => setIncludeReceipts(e.target.checked)}
            className="rounded border-[var(--color-border)] text-purple-600"
          />
          <span>Include Monad ZK Checksum Hashes</span>
        </label>
      </div>
    </div>
  );
}

export default CustomCSVExcelExportEngine;
