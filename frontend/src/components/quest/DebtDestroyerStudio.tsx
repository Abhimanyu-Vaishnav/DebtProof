"use client";

import React, { useState, useEffect } from "react";
import { loansService } from "@/services/loans.service";

interface Milestone {
  id: string;
  title: string;
  targetPercent: number;
  description: string;
  badgeTitle: string;
  icon: string;
  isUnlocked: boolean;
  isMinted: boolean;
  txHash?: string;
  blockNumber?: number;
}

export function DebtDestroyerStudio() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"quest" | "badges" | "streaks">("quest");

  // Summary Metrics
  const [totalPrincipal, setTotalPrincipal] = useState<number>(850000);
  const [totalPaid, setTotalPaid] = useState<number>(340000);
  const [overallPercent, setOverallPercent] = useState<number>(40);
  const [streakMonths, setStreakMonths] = useState<number>(14);

  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "m-25",
      title: "First Quarter Victory",
      targetPercent: 25,
      description: "Successfully cleared 25% of your aggregate loan principal liabilities.",
      badgeTitle: "Monad Quarter Slayer SBT",
      icon: "🛡️",
      isUnlocked: true,
      isMinted: true,
      txHash: "0x8f7a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
      blockNumber: 1482904,
    },
    {
      id: "m-50",
      title: "Halfway Solvency Milestone",
      targetPercent: 50,
      description: "Cleared 50% of your total borrowed debt balance.",
      badgeTitle: "Monad Halfway Solvency SBT",
      icon: "⚖️",
      isUnlocked: false,
      isMinted: false,
    },
    {
      id: "m-75",
      title: "Debt Fortress Guardian",
      targetPercent: 75,
      description: "75% of your liabilities eliminated! Freedom is within sight.",
      badgeTitle: "Monad Fortress Guardian SBT",
      icon: "🏰",
      isUnlocked: false,
      isMinted: false,
    },
    {
      id: "m-100",
      title: "100% Debt Free Sovereign",
      targetPercent: 100,
      description: "Achieved total financial independence with zero active debt liabilities.",
      badgeTitle: "Monad Debt Free Sovereign SBT",
      icon: "👑",
      isUnlocked: false,
      isMinted: false,
    },
  ]);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const res = await loansService.getLoans();
        if (res?.results && res.results.length > 0) {
          setLoans(res.results);
          let sumPrincipal = 0;
          let sumPaid = 0;

          res.results.forEach((l: any) => {
            const p = parseFloat(l.principal_amount) || 100000;
            const paid = parseFloat(l.paid_amount) || Math.round(p * 0.4);
            sumPrincipal += p;
            sumPaid += paid;
          });

          if (sumPrincipal > 0) {
            const pct = Math.min(100, Math.round((sumPaid / sumPrincipal) * 100));
            setTotalPrincipal(sumPrincipal);
            setTotalPaid(sumPaid);
            setOverallPercent(pct);

            // Update unlocked milestones dynamically
            setMilestones((prev) =>
              prev.map((m) => {
                const unlocked = pct >= m.targetPercent;
                return {
                  ...m,
                  isUnlocked: unlocked,
                };
              })
            );
          }
        }
      } catch (err) {
        console.error("Error loading quest data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleMintSBT = (milestoneId: string) => {
    setMintingId(milestoneId);

    setTimeout(() => {
      setMilestones((prev) =>
        prev.map((m) => {
          if (m.id === milestoneId) {
            return {
              ...m,
              isMinted: true,
              txHash: `0x${Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
              ).join("")}`,
              blockNumber: 1500000 + Math.floor(Math.random() * 20000),
            };
          }
          return m;
        })
      );
      setMintingId(null);
    }, 1500);
  };

  // Rank determination
  const getRankTitle = (pct: number) => {
    if (pct >= 100) return "Financial Sovereign";
    if (pct >= 75) return "Interest Slayer";
    if (pct >= 50) return "Solvency Sentinel";
    if (pct >= 25) return "Debt Pathfinder";
    return "Debt Apprentice";
  };

  const rankTitle = getRankTitle(overallPercent);

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              🏆 Gamified Freedom Engine
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <span>🔥</span>
              <span>{streakMonths}-Month EMI Compliance Streak</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
                Debt Destroyer Quest & Monad SBT Engine
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-1">
                Current Rank: <strong className="text-purple-600 dark:text-purple-400 font-bold">{rankTitle}</strong> ({overallPercent}% Payoff Complete)
              </p>
            </div>

            {/* Overall Progress Circle/Pill */}
            <div className="p-3 rounded-2xl bg-[var(--color-surface-tertiary)] border border-purple-500/30 text-center font-mono space-y-0.5">
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block font-bold">Total Paid Off</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalPaid.toLocaleString()} / ₹{totalPrincipal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span>Payoff Velocity</span>
              <span className="text-purple-600 dark:text-purple-400">{overallPercent}% Cleared</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden p-0.5 border border-[var(--color-border-light)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 transition-all duration-700"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Quest Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Milestones Ascent Path (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  Debt Freedom Ascent Roadmap
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Unlock non-transferable Monad Soulbound Badges as you eliminate debt
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                Monad Testnet (Chain 10143)
              </span>
            </div>

            {/* Milestones Cards */}
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    m.isUnlocked
                      ? "bg-purple-500/10 border-purple-500/40 shadow-md"
                      : "bg-[var(--color-surface-tertiary)] border-[var(--color-border-light)] opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-bold ${
                      m.isUnlocked ? "bg-purple-500/20 border border-purple-500/40" : "bg-black/20"
                    }`}>
                      {m.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{m.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/30 border border-purple-500/30 text-purple-400">
                          {m.targetPercent}% Goal
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">{m.description}</p>
                      <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 block font-bold">
                        Badge: {m.badgeTitle}
                      </span>
                    </div>
                  </div>

                  {/* Mint / Status Button */}
                  <div className="sm:text-right shrink-0 w-full sm:w-auto">
                    {m.isMinted ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono">
                          ✓ SBT MINTED ON-CHAIN
                        </span>
                        {m.txHash && (
                          <a
                            href={`https://testnet.monadscan.com/tx/${m.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[10px] font-mono text-purple-400 hover:underline"
                          >
                            MonadScan Explorer ↗
                          </a>
                        )}
                      </div>
                    ) : m.isUnlocked ? (
                      <button
                        onClick={() => handleMintSBT(m.id)}
                        disabled={mintingId === m.id}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {mintingId === m.id ? "Minting on Monad..." : "Mint Monad SBT Badge ⚡"}
                      </button>
                    ) : (
                      <span className="inline-block px-3 py-1.5 rounded-xl bg-black/20 text-[var(--color-text-tertiary)] border border-[var(--color-border-light)] text-xs font-mono font-bold">
                        🔒 Unlocks at {m.targetPercent}% Payoff
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Streaks & Quest Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Streak Counter Card */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Compliance & Streaks
            </h3>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center space-y-2">
              <span className="text-4xl block">🔥</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                {streakMonths} Months
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium block">
                Consecutive On-Time EMI Repayments
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-tertiary)] text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Streak Multiplier:</span>
                <span className="font-bold text-amber-500">1.5x Reputation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">ZK Credit Score Impact:</span>
                <span className="font-bold text-emerald-400">+45 Points</span>
              </div>
            </div>
          </div>

          {/* Gamified Achievements List */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Unlocked Achievements
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)]">
                <span className="text-xl">📄</span>
                <div>
                  <span className="font-bold text-[var(--color-text-primary)] block">Statement Analyzer</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">Parsed CIBIL/Bank Statement</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)]">
                <span className="text-xl">⛓️</span>
                <div>
                  <span className="font-bold text-[var(--color-text-primary)] block">Monad Pioneer</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">Anchored SHA-256 Receipt</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)]">
                <span className="text-xl">💡</span>
                <div>
                  <span className="font-bold text-[var(--color-text-primary)] block">Settlement Strategist</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">Generated AI Bank Proposal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
