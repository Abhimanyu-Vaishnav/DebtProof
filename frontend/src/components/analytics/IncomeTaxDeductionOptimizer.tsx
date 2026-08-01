"use client";

import React, { useState } from "react";
import { Landmark, TrendingDown, Percent, ShieldCheck, Sparkles, CheckCircle2, DollarSign } from "lucide-react";

export function IncomeTaxDeductionOptimizer() {
  const [annualSalary, setAnnualSalary] = useState<number>(1400000);
  const [homeLoanPrincipal, setHomeLoanPrincipal] = useState<number>(150000); // Sec 80C max 1.5L
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(200000); // Sec 24b max 2.0L
  const [other80CDeductions, setOther80CDeductions] = useState<number>(50000);

  // IT Act Limits
  const max80C = 150000;
  const max24b = 200000;

  const eligible80C = Math.min(max80C, homeLoanPrincipal + other80CDeductions);
  const eligible24b = Math.min(max24b, homeLoanInterest);

  const totalDeductions = eligible80C + eligible24b;

  // Tax Slab Savings under 30% slab rate (plus 4% cess = 31.2%)
  const taxRate = 0.312;
  const totalTaxSaved = Math.round(totalDeductions * taxRate);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Landmark className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Income Tax Section 80C & 24(b) Loan Deduction Optimizer <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Calculate exact income tax savings on home loan principal & interest repayments under the Indian IT Act
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> IT Act Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Annual Gross Salary Income</span>
              <span className="text-teal-400 font-bold">₹{annualSalary.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="500000"
              max="3000000"
              step="50000"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Home Loan Principal Paid (Section 80C)</span>
              <span className="text-emerald-400 font-bold">₹{homeLoanPrincipal.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="10000"
              value={homeLoanPrincipal}
              onChange={(e) => setHomeLoanPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Section 80C Limit: ₹1,50,000 / year</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Home Loan Interest Paid (Section 24b)</span>
              <span className="text-cyan-400 font-bold">₹{homeLoanInterest.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={homeLoanInterest}
              onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Section 24(b) Limit: ₹2,00,000 / year for self-occupied home</p>
          </div>
        </div>

        {/* Calculation Result */}
        <div className="bg-slate-950/90 border border-teal-500/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Total Annual Income Tax Saved
            </span>
            <div className="text-3xl font-black text-emerald-400">₹{totalTaxSaved.toLocaleString("en-IN")}</div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Effective Tax Slab Rate: <b>30% + 4% Cess</b>
            </p>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Section 80C Deduction</span>
              <span className="font-bold text-emerald-300">₹{eligible80C.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Section 24(b) Deduction</span>
              <span className="font-bold text-cyan-300">₹{eligible24b.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Eligible Deductions</span>
              <span className="font-bold text-slate-100">₹{totalDeductions.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
