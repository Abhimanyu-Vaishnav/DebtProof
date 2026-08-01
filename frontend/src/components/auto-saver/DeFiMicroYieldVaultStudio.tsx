"use client";

import React, { useState } from "react";
import { Coins, TrendingUp, ShieldCheck, ArrowUpRight, Zap, Calculator, CheckCircle2, Lock } from "lucide-react";

interface VaultStrategy {
  id: string;
  name: string;
  apy: number;
  risk: "Low" | "Minimal" | "Moderate";
  token: string;
  protocol: string;
  desc: string;
}

const VAULT_STRATEGIES: VaultStrategy[] = [
  {
    id: "monad-staking",
    name: "Monad Liquid Staking Vault",
    apy: 7.8,
    risk: "Low",
    token: "MON",
    protocol: "Monad Native Yield",
    desc: "Auto-compounding validator rewards with instant liquidity for EMI payouts.",
  },
  {
    id: "usdc-vault",
    name: "Monad Stablecoin Yield Pool",
    apy: 8.5,
    risk: "Minimal",
    token: "USDC",
    protocol: "DebtProof Escrow Pool",
    desc: "Over-collateralized lending pool generating yield for monthly credit card bills.",
  },
  {
    id: "treasury-vault",
    name: "RWA Short-Term Treasury Vault",
    apy: 6.2,
    risk: "Minimal",
    token: "USDY",
    protocol: "Ondo Finance RWA",
    desc: "Backed by US Treasury bills for 100% principal protection.",
  },
];

export function DeFiMicroYieldVaultStudio() {
  const [selectedVault, setSelectedVault] = useState<string>("monad-staking");
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(3000);
  const [holdingMonths, setHoldingMonths] = useState<number>(12);
  const [isStaked, setIsStaked] = useState(false);

  const activeStrategy = VAULT_STRATEGIES.find((v) => v.id === selectedVault) || VAULT_STRATEGIES[0];

  // Compound interest projection calculation
  const totalPrincipal = monthlyDeposit * holdingMonths;
  const monthlyRate = activeStrategy.apy / 100 / 12;
  const projectedTotal = monthlyDeposit * (((Math.pow(1 + monthlyRate, holdingMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  const yieldEarned = Math.max(0, Math.round(projectedTotal - totalPrincipal));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              DeFi Micro-Yield Auto-Saver Vault Studio <Zap className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Put daily auto-saved EMI funds into yield pools to offset monthly loan interest
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Monad Yield Monitored
        </span>
      </div>

      {/* Strategy Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VAULT_STRATEGIES.map((v) => {
          const isSelected = selectedVault === v.id;
          return (
            <div
              key={v.id}
              onClick={() => setSelectedVault(v.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-emerald-950/30 border-emerald-500 text-slate-100 shadow-lg shadow-emerald-900/20"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{v.protocol}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[11px] font-extrabold">
                  {v.apy}% APY
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-1">{v.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Yield Calculator Sliders */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Monthly Auto-Saver Deposit</span>
              <span className="text-emerald-400 font-bold">₹{monthlyDeposit.toLocaleString("en-IN")}/mo</span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Staking Duration</span>
              <span className="text-cyan-400 font-bold">{holdingMonths} Months</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[3, 6, 12, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setHoldingMonths(m)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    holdingMonths === m
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Yield Box */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Estimated EMI Interest Saved
            </span>
            <div className="text-3xl font-black text-emerald-400">₹{yieldEarned.toLocaleString("en-IN")}</div>
            <p className="text-xs text-slate-400 mt-1">
              Total Maturity: <span className="font-bold text-slate-200">₹{Math.round(projectedTotal).toLocaleString("en-IN")}</span>
            </p>
          </div>

          <button
            onClick={() => setIsStaked(!isStaked)}
            className={`w-full mt-4 py-2.5 px-4 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 ${
              isStaked
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-90"
            }`}
          >
            {isStaked ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Vault Active & Earning {activeStrategy.apy}% APY
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" /> Stake Auto-Saver in {activeStrategy.token} Vault
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
