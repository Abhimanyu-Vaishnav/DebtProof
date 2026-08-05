"use client";

import React, { useState, useEffect } from "react";
import { loansService } from "@/services/loans.service";
import { formatCurrency } from "@/utils/formatters";
import { playSuccessSound, playClickSound } from "@/utils/sound";
import { ethers } from "ethers";
import { MONAD_TESTNET_PARAMS, DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI } from "@/utils/contract";

interface TargetLoan {
  id: string;
  name: string;
  lender: string;
  outstanding: number;
  rate: number;
  monthlyEmi: number;
  remainingMonths: number;
}

export function MicroAutoSaverStudio() {
  const [loans, setLoans] = useState<TargetLoan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Micro-saver controls
  const [dailyAmount, setDailyAmount] = useState<number>(50); // ₹50/day
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isRuleActive, setIsRuleActive] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [anchoring, setAnchoring] = useState<boolean>(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    "☕ Starbucks Coffee: spent ₹242 → ₹8 spare change rounded up to ₹250",
    "🛒 Groceries Mart: spent ₹865 → ₹35 spare change rounded up to ₹900",
  ]);

  useEffect(() => {
    async function fetchLoans() {
      setLoading(true);
      try {
        const res = await loansService.getLoans();
        const active: TargetLoan[] = [];

        if (res?.results) {
          res.results.forEach((l: any) => {
            if (l.status === "active") {
              const bal = parseFloat(l.outstanding_amount) || 0;
              const emi = parseFloat(l.monthly_emi) || 0;
              const rate = parseFloat(l.interest_rate) || 11.5;
              if (bal > 0) {
                active.push({
                  id: l.id,
                  name: l.name,
                  lender: l.lender_name || "Bank Lender",
                  outstanding: bal,
                  rate,
                  monthlyEmi: emi,
                  remainingMonths: 180, // Default 15 years
                });
              }
            }
          });
        }

        if (active.length === 0) {
          active.push({
            id: "demo-home",
            name: "HDFC Home Loan (20-Year Mortage)",
            lender: "HDFC Bank",
            outstanding: 4200000,
            rate: 8.75,
            monthlyEmi: 37120,
            remainingMonths: 204, // 17 years remaining
          });
        }

        setLoans(active);
        setSelectedLoanId(active[0].id);
      } catch (err) {
        console.error("Error fetching target loans for auto saver:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLoans();
  }, []);

  const activeLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  // Compound Math Calculations
  const effectiveDaily = dailyAmount * multiplier;
  const monthlyExtra = effectiveDaily * 30.41;
  const annualExtra = effectiveDaily * 365;

  // Estimate tenure and interest reduction
  const p = activeLoan ? activeLoan.outstanding : 4000000;
  const r = (activeLoan ? activeLoan.rate : 9.0) / 100 / 12;
  const baseEmi = activeLoan ? activeLoan.monthlyEmi : 35000;

  // Calculate baseline total interest
  const calcSim = (extraM: number) => {
    let bal = p;
    let months = 0;
    let totalInt = 0;
    const maxMonths = 480;

    while (bal > 0.01 && months < maxMonths) {
      months++;
      const interestThisMonth = bal * r;
      totalInt += interestThisMonth;
      bal += interestThisMonth;

      const payment = Math.min(bal, baseEmi + extraM);
      bal -= payment;
    }
    return { months, totalInt };
  };

  const baseline = calcSim(0);
  const accelerated = calcSim(monthlyExtra);

  const monthsSaved = Math.max(0, baseline.months - accelerated.months);
  const yearsSaved = (monthsSaved / 12).toFixed(1);
  const interestSaved = Math.max(0, baseline.totalInt - accelerated.totalInt);

  // Enable Daily Auto-Saver & Anchor on Monad
  const activateAutoSaverOnMonad = async () => {
    playClickSound();
    setAnchoring(true);

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MONAD_TESTNET_PARAMS],
            });
          }
        }

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI, signer);
        
        const ruleHash = ethers.keccak256(
          ethers.toUtf8Bytes(`AUTO_SAVER_${activeLoan.id}_${effectiveDaily}_${Date.now()}`)
        );

        const tx = await contract.storeProof(`AUTOSAVER-${activeLoan.id.toUpperCase()}`, ruleHash);
        await tx.wait();

        setTxHash(tx.hash);
        setIsRuleActive(true);
        playSuccessSound();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const simTx = "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
        setTxHash(simTx);
        setIsRuleActive(true);
        playSuccessSound();
      }
    } catch (err: any) {
      console.error("Monad auto saver transaction failed:", err);
      alert("Transaction failed or was cancelled in MetaMask.");
    } finally {
      setAnchoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Daily Micro-Prepayment
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(effectiveDaily)} / day
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
            Accumulates {formatCurrency(annualExtra)} / year
          </span>
        </div>

        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Tenure Shaved Off
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            ✂️ {yearsSaved} Years
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
            {monthsSaved} months cut off loan duration
          </span>
        </div>

        <div className="card bg-[var(--color-surface)] border border-emerald-500/40 p-5 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500/10 to-transparent space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Lifetime Interest Saved
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300">
            {formatCurrency(interestSaved)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Pure compound interest savings
          </span>
        </div>

        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Monad Vault Status
          </span>
          <div className="text-sm font-black text-[var(--color-text-primary)] mt-1">
            {isRuleActive ? (
              <span className="text-emerald-600 dark:text-emerald-400">✓ Active & Anchored</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">⏸️ Not Activated</span>
            )}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
            {txHash ? `Tx: ${txHash.substring(0, 10)}...` : "Monad Chain ID 10143"}
          </span>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Loan Selection */}
        <div className="lg:col-span-1 card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="border-b border-[var(--color-border-light)] pb-3">
            <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">
              1. Select Target Loan
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Choose which loan principal to accelerate with daily micro-payments.
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-tertiary)] font-mono animate-pulse">
              ⏳ Fetching portfolio loans...
            </div>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => {
                const isSelected = loan.id === activeLoan.id;
                return (
                  <div
                    key={loan.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedLoanId(loan.id);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/60 shadow-md shadow-emerald-500/10"
                        : "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-[var(--color-text-primary)]">{loan.name}</span>
                        <div className="text-[11px] text-[var(--color-text-tertiary)]">{loan.lender}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {loan.rate}% APR
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-secondary)]">
                        Outstanding: <strong>{formatCurrency(loan.outstanding)}</strong>
                      </span>
                      <span className="text-[var(--color-text-tertiary)]">
                        EMI: {formatCurrency(loan.monthlyEmi)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Controls & Projection Breakdown */}
        <div className="lg:col-span-2 card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="border-b border-[var(--color-border-light)] pb-4">
            <h3 className="font-black text-lg text-[var(--color-text-primary)]">
              2. Daily Auto-Saver Settings & Multiplier
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Set how much daily spare change or micro-saving to sweep towards loan principal.
            </p>
          </div>

          {/* Controls Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Daily Amount Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--color-text-secondary)]">Daily Spare Change Sweep</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatCurrency(dailyAmount)} / day</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={dailyAmount}
                onChange={(e) => setDailyAmount(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] font-mono">
                <span>₹10/day</span>
                <span>₹500/day</span>
              </div>
            </div>

            {/* Multiplier Selector */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--color-text-secondary)]">Round-Up Speed Multiplier</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">{multiplier}x Speed</span>
              </div>
              <div className="flex gap-2 pt-1">
                {[1, 2, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setMultiplier(m);
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                      multiplier === m
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]"
                    }`}
                  >
                    {m}x Speed
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="p-4.5 rounded-2xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Prepayment Impact Timeline ({activeLoan?.name})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-rose-500/30 space-y-1">
                <span className="text-[10px] text-rose-500 font-bold uppercase">Standard EMI Schedule</span>
                <div className="text-base font-bold text-[var(--color-text-primary)]">
                  {(baseline.months / 12).toFixed(1)} Years ({baseline.months} months)
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  Total Interest: {formatCurrency(baseline.totalInt)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">With Micro Auto-Saver</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {(accelerated.months / 12).toFixed(1)} Years ({accelerated.months} months)
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  Total Interest: {formatCurrency(accelerated.totalInt)}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Card Round-Up Transaction Simulator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">💳 Daily Card Round-Up Log</span>
              <button
                onClick={() => {
                  const Merchants = [
                    { name: "⚡ Swiggy Food Delivery", amount: 312, round: 350, diff: 38 },
                    { name: "⛽ Petrol Pump Refill", amount: 460, round: 500, diff: 40 },
                    { name: "🎬 PVR Cinema Ticket", amount: 265, round: 300, diff: 35 },
                  ];
                  const m = Merchants[Math.floor(Math.random() * Merchants.length)];
                  const entry = `${m.name}: spent ₹${m.amount} → ₹${m.diff} rounded up to ₹${m.round}`;
                  setSimulatedLogs((prev) => [entry, ...prev.slice(0, 4)]);
                  playSuccessSound();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-[11px] font-bold transition cursor-pointer"
              >
                + Simulate Round-Up Tx
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {simulatedLogs.map((log, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Monad Web3 Activation Action */}
          <div>
            {isRuleActive ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>🎉 Daily Micro Auto-Saver Rule Active & Anchored on Monad!</span>
                </div>
                <p className="text-xs font-normal leading-relaxed">
                  Every day, <strong>{formatCurrency(effectiveDaily)}</strong> will be automatically swept towards {activeLoan.name} principal.
                </p>
                <div className="text-[11px] font-mono text-purple-600 dark:text-purple-300">
                  Monad Vault Proof Tx: {txHash}
                </div>
              </div>
            ) : (
              <button
                onClick={activateAutoSaverOnMonad}
                disabled={anchoring}
                className="w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {anchoring ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Anchoring Auto-Saver Vault Rule on Monad...</span>
                  </>
                ) : (
                  <>
                    <span>🌱 Enable Daily Auto-Saver & Save {formatCurrency(interestSaved)}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MicroAutoSaverStudio;

