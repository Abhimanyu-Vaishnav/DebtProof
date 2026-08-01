"use client";

import React, { useState } from "react";
import { Calculator, TrendingDown, Clock, ShieldCheck, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";

export function ForeclosureSavingsCalculator() {
  const [outstandingPrincipal, setOutstandingPrincipal] = useState<number>(450000);
  const [interestRate, setInterestRate] = useState<number>(8.9);
  const [remainingMonths, setRemainingMonths] = useState<number>(60);
  const [partPrepayment, setPartPrepayment] = useState<number>(75000);

  // EMI calculation: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / 100 / 12;
  const currentEmi = Math.round(
    (outstandingPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
      (Math.pow(1 + monthlyRate, remainingMonths) - 1)
  );

  const currentTotalInterest = currentEmi * remainingMonths - outstandingPrincipal;

  // After part prepayment:
  const newPrincipal = Math.max(0, outstandingPrincipal - partPrepayment);
  const newTotalInterest = currentEmi * remainingMonths - newPrincipal;

  // Reduced tenure if EMI kept constant
  const newMonths =
    newPrincipal > 0
      ? Math.max(
          1,
          Math.round(
            Math.log(currentEmi / (currentEmi - newPrincipal * monthlyRate)) / Math.log(1 + monthlyRate)
          )
        )
      : 0;

  const monthsSaved = Math.max(0, remainingMonths - newMonths);
  const totalInterestSaved = Math.max(0, Math.round(currentTotalInterest - (currentEmi * newMonths - newPrincipal)));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Calculator className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Foreclosure & Part-Prepayment Savings Calculator <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Calculate exact interest saved and tenure reduction when making lump-sum part-payments
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setPartPrepayment(100000);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> High Savings Preset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Sliders */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Outstanding Loan Principal</span>
              <span className="text-indigo-400 font-bold">₹{outstandingPrincipal.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="25000"
              value={outstandingPrincipal}
              onChange={(e) => setOutstandingPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Interest Rate (p.a.)</span>
              <span className="text-teal-400 font-bold">{interestRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="5"
              max="18"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Lump-Sum Part-Prepayment Amount</span>
              <span className="text-emerald-400 font-bold">₹{partPrepayment.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="10000"
              max={outstandingPrincipal}
              step="5000"
              value={partPrepayment}
              onChange={(e) => setPartPrepayment(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Forecast Output Card */}
        <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Guaranteed Interest Savings
            </span>
            <div className="text-3xl font-black text-emerald-400">₹{totalInterestSaved.toLocaleString("en-IN")}</div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Tenure Reduced by <b className="text-cyan-400">{monthsSaved} Months ({ (monthsSaved/12).toFixed(1) } yrs)</b>
            </p>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Current Monthly EMI</span>
              <span className="font-bold text-slate-200">₹{currentEmi.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>New Loan Tenure</span>
              <span className="font-bold text-cyan-300">{newMonths} Months left</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>New Principal Balance</span>
              <span className="font-bold text-indigo-300">₹{newPrincipal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
