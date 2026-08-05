'use client';

import React, { useState } from 'react';

export default function TaxExportStudio() {
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [sec80CPrincipal, setSec80CPrincipal] = useState(150000);
  const [sec24Interest, setSec24Interest] = useState(195000);

  const totalDeductions = sec80CPrincipal + sec24Interest;
  const estimatedTaxSaved = Math.round(totalDeductions * 0.312); // 30% slab + 4% cess

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-light)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              Indian Tax Deduction & ITR Export Studio
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Section 80C (Home Loan Principal) & Section 24(b) (Home Loan Interest) tax certificate generator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] font-bold"
          >
            <option value="2025-2026">FY 2025-26 (AY 2026-27)</option>
            <option value="2024-2025">FY 2024-25 (AY 2025-26)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface-secondary)] p-5 rounded-2xl border border-[var(--color-border-light)] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-light)]">Section 80C Claim (Principal)</span>
          <p className="text-2xl font-black text-[var(--color-text-primary)]">₹{sec80CPrincipal.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">Max limit: ₹1,50,000 / year</p>
        </div>

        <div className="bg-[var(--color-surface-secondary)] p-5 rounded-2xl border border-[var(--color-border-light)] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Section 24(b) Claim (Interest)</span>
          <p className="text-2xl font-black text-[var(--color-text-primary)]">₹{sec24Interest.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">Max limit: ₹2,00,000 / year</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Est. Tax Savings (30% Slab)</span>
          <p className="text-3xl font-black text-emerald-400">₹{estimatedTaxSaved.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-300">Direct savings on Income Tax</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => alert(`ITR Tax Exemption Statement generated for ${financialYear}!`)}
          className="flex-1 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
        >
          📄 Export Form-16 Tax Certificate (PDF)
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-3 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl border border-[var(--color-border)] transition cursor-pointer"
        >
          🖨️ Print Tax Audit Statement
        </button>
      </div>
    </div>
  );
}
