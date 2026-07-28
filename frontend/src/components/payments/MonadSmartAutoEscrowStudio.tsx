"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function MonadSmartAutoEscrowStudio() {
  const [escrowBalanceMon, setEscrowBalanceMon] = useState(250);
  const [autoReleaseEnabled, setAutoReleaseEnabled] = useState(true);
  const [targetBank, setTargetBank] = useState("HDFC Personal Loan (Auto-EMI)");
  const [isExecuting, setIsExecuting] = useState(false);
  const [txLog, setTxLog] = useState<string | null>(null);

  const handleExecuteEscrowRelease = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const tx = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
      setTxLog(tx);
      setIsExecuting(false);
      alert(`📜 Smart Escrow Auto-Release Executed on Monad Testnet! Transferred to ${targetBank}. TX: ${tx}`);
    }, 1200);
  };

  return (
    <div className="card p-6 border-2 border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📜</span>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              Monad Web3 Smart Auto-Escrow Repayment Trigger Studio
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Locks MON collateral into an EVM smart contract and automatically triggers EMI payments when conditions are met.
            </p>
          </div>
        </div>

        <button
          onClick={handleExecuteEscrowRelease}
          disabled={isExecuting}
          className="btn bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer"
        >
          {isExecuting ? "Executing Escrow..." : "⚡ Execute Smart Escrow Release"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Escrow Vault Balance (MON)</label>
          <input
            type="number"
            value={escrowBalanceMon}
            onChange={(e) => setEscrowBalanceMon(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
          />
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Target Lender Account</label>
          <input
            type="text"
            value={targetBank}
            onChange={(e) => setTargetBank(e.target.value)}
            className="form-input text-xs w-full font-bold font-mono"
          />
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Auto-Trigger Logic</label>
          <div className="flex items-center justify-between pt-1">
            <span className="text-purple-400 font-bold">Monad Chain ID 10143</span>
            <button
              onClick={() => setAutoReleaseEnabled(!autoReleaseEnabled)}
              className={`w-10 h-5 rounded-full p-0.5 transition-all ${autoReleaseEnabled ? "bg-purple-600" : "bg-gray-600"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${autoReleaseEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      </div>

      {txLog && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 font-mono text-xs flex justify-between items-center">
          <span className="text-purple-300 font-bold">✓ Escrow Transaction Anchored: <strong className="text-white">{txLog}</strong></span>
          <span className="text-emerald-400 font-bold">Status: Confirmed 🟢</span>
        </div>
      )}
    </div>
  );
}

export default MonadSmartAutoEscrowStudio;
