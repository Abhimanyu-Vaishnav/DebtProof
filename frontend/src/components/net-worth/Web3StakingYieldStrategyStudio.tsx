"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function Web3StakingYieldStrategyStudio() {
  const [stakedMon, setStakedMon] = useState<number>(500);
  const [yieldApy, setYieldApy] = useState<number>(11.5);
  const [autoDeductToEmi, setAutoDeductToEmi] = useState<boolean>(true);

  // Yield Math
  const annualYieldMon = (stakedMon * (yieldApy / 100));
  const monthlyYieldMon = annualYieldMon / 12;
  const monPriceInInr = 145; // Simulated MON price in INR
  const monthlyYieldInr = Math.round(monthlyYieldMon * monPriceInInr);
  const annualYieldInr = Math.round(annualYieldMon * monPriceInInr);

  return (
    <div className="card p-6 border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              Monad Web3 Staking Yield Auto-Payoff Strategy
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Earn Monad Testnet liquid staking yields & route 100% of yield interest directly into monthly EMI payments!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-emerald-400">Auto-Payoff Yield Router</span>
          <button
            onClick={() => setAutoDeductToEmi(!autoDeductToEmi)}
            className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${
              autoDeductToEmi ? "bg-emerald-500" : "bg-gray-600"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all ${autoDeductToEmi ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Yield Calculator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Staked MON Token Volume</label>
          <input
            type="number"
            value={stakedMon}
            onChange={(e) => setStakedMon(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={50}
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] pt-1">
            <span>Staking Vault APY: {yieldApy}% p.a.</span>
            <span>1 MON = ₹{monPriceInInr}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">Monthly Yield Generated for EMI</span>
          <span className="text-2xl font-black text-emerald-400">₹{monthlyYieldInr.toLocaleString()} / mo</span>
          <span className="text-[10px] text-emerald-500/80 font-mono block">({monthlyYieldMon.toFixed(2)} MON/month)</span>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-2">
        <span className="text-[var(--color-text-secondary)] font-bold">
          ⚡ Annual Staking Payoff Contribution: <strong className="text-emerald-400">₹{annualYieldInr.toLocaleString()} ({annualYieldMon.toFixed(1)} MON)</strong>
        </span>
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Status: {autoDeductToEmi ? "Active Staking Pipeline 🟢" : "Paused 🔴"}
        </span>
      </div>
    </div>
  );
}

export default Web3StakingYieldStrategyStudio;
