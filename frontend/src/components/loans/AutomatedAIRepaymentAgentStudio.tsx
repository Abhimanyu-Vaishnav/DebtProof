"use client";

import React, { useState } from "react";

export function AutomatedAIRepaymentAgentStudio() {
  const [autoPrepayEnabled, setAutoPrepayEnabled] = useState<boolean>(true);
  const [thresholdAmount, setThresholdAmount] = useState<number>(50000);
  const [targetLoan, setTargetLoan] = useState<string>("ICICI Credit Card (36% APR)");
  const [executionFrequency, setExecutionFrequency] = useState<"salary_day" | "weekly" | "month_end">("salary_day");

  return (
    <div className="card p-6 border-2 border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              Automated AI Repayment & Prepayment Autonomous Agent
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Automatically triggers principal prepayments whenever bank balance exceeds safe threshold.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-purple-400">Autonomous Execution</span>
          <button
            onClick={() => setAutoPrepayEnabled(!autoPrepayEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${
              autoPrepayEnabled ? "bg-purple-600" : "bg-gray-600"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all ${autoPrepayEnabled ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Agent Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Bank Balance Threshold (₹)</label>
          <input
            type="number"
            value={thresholdAmount}
            onChange={(e) => setThresholdAmount(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={5000}
          />
          <span className="text-[10px] text-[var(--color-text-tertiary)] block">Prepay when balance &gt; ₹{thresholdAmount.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">High-Priority Prepayment Target</label>
          <select
            value={targetLoan}
            onChange={(e) => setTargetLoan(e.target.value)}
            className="form-select text-xs w-full font-bold font-mono bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]"
          >
            <option value="ICICI Credit Card (36% APR)">ICICI Credit Card (36% APR)</option>
            <option value="HDFC Personal Loan (14.5% APR)">HDFC Personal Loan (14.5% APR)</option>
            <option value="SBI Auto Loan (9.2% APR)">SBI Auto Loan (9.2% APR)</option>
          </select>
          <span className="text-[10px] text-emerald-400 font-bold block">AI Avalanche Recommendation</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Execution Trigger Schedule</label>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => setExecutionFrequency("salary_day")}
              className={`py-2 rounded-lg border font-bold ${executionFrequency === "salary_day" ? "bg-purple-500/20 border-purple-500 text-purple-300" : "border-[var(--color-border)]"}`}
            >
              Salary Day
            </button>
            <button
              onClick={() => setExecutionFrequency("weekly")}
              className={`py-2 rounded-lg border font-bold ${executionFrequency === "weekly" ? "bg-purple-500/20 border-purple-500 text-purple-300" : "border-[var(--color-border)]"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setExecutionFrequency("month_end")}
              className={`py-2 rounded-lg border font-bold ${executionFrequency === "month_end" ? "bg-purple-500/20 border-purple-500 text-purple-300" : "border-[var(--color-border)]"}`}
            >
              Month End
            </button>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex justify-between items-center text-xs font-mono">
        <span className="text-[var(--color-text-primary)] font-bold">🤖 Agent Status: <strong className="text-purple-400">{autoPrepayEnabled ? "Active & Monitoring Account 🟢" : "Standby Mode 🔴"}</strong></span>
        <span className="text-[10px] text-purple-300 font-bold">Next Run: 1st of Next Month</span>
      </div>
    </div>
  );
}

export default AutomatedAIRepaymentAgentStudio;
