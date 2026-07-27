"use client";

import React, { useState } from "react";

interface ExecutionLog {
  id: string;
  timestamp: string;
  trigger: string;
  targetDebt: string;
  prepaymentAmount: number;
  monadTxHash: string;
  status: "success" | "pending";
}

export function AutomatedAIRepaymentAgentStudio() {
  const [autoPrepayEnabled, setAutoPrepayEnabled] = useState<boolean>(true);
  const [thresholdAmount, setThresholdAmount] = useState<number>(50000);
  const [targetLoan, setTargetLoan] = useState<string>("ICICI Credit Card (36% APR)");
  const [executionFrequency, setExecutionFrequency] = useState<"salary_day" | "weekly" | "month_end" | "smart_trigger">("smart_trigger");
  const [maxMonthlyCap, setMaxMonthlyCap] = useState<number>(15000);
  const [emergencyBufferPct, setEmergencyBufferPct] = useState<number>(20);
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);

  // Execution Activity Logs
  const [logs, setLogs] = useState<ExecutionLog[]>([
    {
      id: "log-1",
      timestamp: "Today, 09:30 AM",
      trigger: "Salary Deposit Detected (+₹85,000)",
      targetDebt: "ICICI Credit Card (36% APR)",
      prepaymentAmount: 8500,
      monadTxHash: "0x8f2c...41b",
      status: "success",
    },
    {
      id: "log-2",
      timestamp: "15 July, 06:15 PM",
      trigger: "Balance Threshold &gt; ₹50,000",
      targetDebt: "HDFC Personal Loan",
      prepaymentAmount: 5000,
      monadTxHash: "0x3e9a...10c",
      status: "success",
    },
  ]);

  const handleManualTriggerAgent = () => {
    setIsSimulatingRun(true);
    setTimeout(() => {
      const newLog: ExecutionLog = {
        id: `log-${Date.now()}`,
        timestamp: "Just Now",
        trigger: "Manual Smart Auto-Trigger",
        targetDebt: targetLoan,
        prepaymentAmount: Math.round(maxMonthlyCap * 0.6),
        monadTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        status: "success",
      };

      setLogs([newLog, ...logs]);
      setIsSimulatingRun(false);
      alert(`🤖 AI Autonomous Agent Executed Prepayment of ₹${newLog.prepaymentAmount.toLocaleString()} to ${targetLoan}! Monad TX Anchored.`);
    }, 1200);
  };

  return (
    <div className="card p-6 border-2 border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-6 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🤖</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[var(--color-text-primary)]">
                Autonomous AI Debt Repayment Agent 2.0
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Web3 Monad Anchored
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              Continuously monitors salary deposits, balance surpluses & automatically executes smart EMI prepayments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleManualTriggerAgent}
            disabled={isSimulatingRun || !autoPrepayEnabled}
            className="btn bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2 shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSimulatingRun ? "Executing Agent..." : "⚡ Run Autonomous Agent Now"}
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--color-border-light)]">
            <span className="text-xs font-bold text-purple-400">Autonomous</span>
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
      </div>

      {/* Advanced Control Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Min Reserve Balance (₹)</label>
          <input
            type="number"
            value={thresholdAmount}
            onChange={(e) => setThresholdAmount(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={5000}
          />
          <span className="text-[10px] text-[var(--color-text-tertiary)] block">Prepay when bank balance &gt; ₹{thresholdAmount.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Max Monthly Prepay Cap (₹)</label>
          <input
            type="number"
            value={maxMonthlyCap}
            onChange={(e) => setMaxMonthlyCap(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={2000}
          />
          <span className="text-[10px] text-purple-400 font-bold block">Safety limit per month</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">High-Priority Target Loan</label>
          <select
            value={targetLoan}
            onChange={(e) => setTargetLoan(e.target.value)}
            className="form-select text-xs w-full font-bold font-mono bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]"
          >
            <option value="ICICI Credit Card (36% APR)">ICICI Credit Card (36% APR)</option>
            <option value="HDFC Personal Loan (14.5% APR)">HDFC Personal Loan (14.5% APR)</option>
            <option value="SBI Auto Loan (9.2% APR)">SBI Auto Loan (9.2% APR)</option>
          </select>
          <span className="text-[10px] text-emerald-400 font-bold block">AI Avalanche Priority</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Trigger Logic</label>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              onClick={() => setExecutionFrequency("smart_trigger")}
              className={`py-1.5 rounded-lg border font-bold ${executionFrequency === "smart_trigger" ? "bg-purple-500/20 border-purple-500 text-purple-300" : "border-[var(--color-border)]"}`}
            >
              Smart Deposit
            </button>
            <button
              onClick={() => setExecutionFrequency("salary_day")}
              className={`py-1.5 rounded-lg border font-bold ${executionFrequency === "salary_day" ? "bg-purple-500/20 border-purple-500 text-purple-300" : "border-[var(--color-border)]"}`}
            >
              Salary Day
            </button>
          </div>
        </div>
      </div>

      {/* Agent Live Activity Logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            🤖 AI Agent Autonomous Execution Audit Trail
          </h4>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Monad Testnet Anchored</span>
        </div>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓ Executed</span>
                  <span className="font-bold text-[var(--color-text-primary)]">{log.targetDebt}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">{log.trigger} · {log.timestamp}</p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase block">Prepaid Amount</span>
                  <span className="text-sm font-black text-purple-400">₹{log.prepaymentAmount.toLocaleString()}</span>
                </div>
                <span className="px-2 py-1 rounded text-[9px] bg-slate-950 text-indigo-300 border border-purple-500/30">
                  {log.monadTxHash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AutomatedAIRepaymentAgentStudio;
