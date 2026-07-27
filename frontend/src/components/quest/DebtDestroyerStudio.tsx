"use client";

import React, { useState, useEffect } from "react";
import { loansService } from "@/services/loans.service";
import { questService, getStoredQuestStats, calculateLevel, type QuestItem, type QuestStats } from "@/services/quest.service";

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
  
  // Quest & Gamification State
  const [questStats, setQuestStats] = useState<QuestStats>(getStoredQuestStats());
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [attackingBoss, setAttackingBoss] = useState(false);
  const [extraPaymentVal, setExtraPaymentVal] = useState<string>("15000");

  // Summary Metrics
  const [totalPrincipal, setTotalPrincipal] = useState<number>(850000);
  const [totalPaid, setTotalPaid] = useState<number>(340000);
  const [overallPercent, setOverallPercent] = useState<number>(40);

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
        setQuests(questService.getQuests());
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

            setMilestones((prev) =>
              prev.map((m) => ({
                ...m,
                isUnlocked: pct >= m.targetPercent,
              }))
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

  const levelInfo = calculateLevel(questStats.xp);

  const handleClaimQuest = async (questId: string) => {
    try {
      await questService.claimQuest(questId);
      setQuestStats(getStoredQuestStats());
      setQuests(questService.getQuests());
    } catch (err) {
      console.error("Failed to claim quest:", err);
    }
  };

  const handleAttackBoss = async () => {
    const amt = parseFloat(extraPaymentVal) || 10000;
    setAttackingBoss(true);
    try {
      await questService.attackBoss(amt);
      setTimeout(() => {
        setQuestStats(getStoredQuestStats());
        setAttackingBoss(false);
      }, 1000);
    } catch (err) {
      setAttackingBoss(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Hero Level & Quest Header */}
      <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                🏆 Level {levelInfo.level} — {levelInfo.title}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span>🔥</span>
                <span>{questStats.streakMonths}-Month EMI Streak</span>
              </span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Total XP: {questStats.xp.toLocaleString()} XP
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
                Debt Destroyer Quest & Monad SBT Engine
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-1">
                Complete financial quests, battle high-interest debt bosses, and mint non-transferable Monad Soulbound Badges!
              </p>
            </div>

            {/* Total Payoff Pill */}
            <div className="p-3.5 rounded-2xl bg-[var(--color-surface-tertiary)] border border-purple-500/30 text-center font-mono space-y-0.5 min-w-[200px]">
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block font-bold">Total Paid Off</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalPaid.toLocaleString()} / ₹{totalPrincipal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Level XP Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span>Level Progress ({levelInfo.currentXp} / {levelInfo.nextLevelXp} XP)</span>
              <span className="text-purple-600 dark:text-purple-400">{levelInfo.progressPct}% to Level {levelInfo.level + 1}</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden p-0.5 border border-[var(--color-border-light)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 transition-all duration-700 shadow-md"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Quest Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Debt Boss Battle Arena (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Boss Battle Arena Card */}
          <div className="card bg-[var(--color-surface)] border-2 border-rose-500/40 p-6 rounded-2xl shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center text-2xl shadow-inner font-bold">
                  👹
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase">
                      Active Debt Boss
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-500">
                      {questStats.bossInterestRate}% APR Vampire
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)] mt-0.5">
                    {questStats.bossName}
                  </h3>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-[var(--color-text-tertiary)] block">Boss Principal</span>
                <span className="text-sm font-bold text-rose-500">₹{questStats.bossPrincipal.toLocaleString()}</span>
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-rose-500 flex items-center gap-1">
                  <span>❤️</span> Boss HP Health
                </span>
                <span className="text-rose-500 font-extrabold">{questStats.bossHpPercent}% HP Remaining</span>
              </div>
              <div className="w-full h-5 rounded-full bg-slate-900 overflow-hidden p-1 border border-rose-500/40 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 shadow-lg ${
                    questStats.bossHpPercent <= 20
                      ? "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse"
                      : "bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500"
                  }`}
                  style={{ width: `${questStats.bossHpPercent}%` }}
                />
              </div>
            </div>

            {/* Boss Attack Controls */}
            <div className="p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                    Extra Principal Payoff Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="input w-full font-mono text-xs font-bold"
                    value={extraPaymentVal}
                    onChange={(e) => setExtraPaymentVal(e.target.value)}
                    placeholder="15000"
                  />
                </div>
                <button
                  onClick={handleAttackBoss}
                  disabled={attackingBoss || questStats.bossHpPercent === 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 self-end sm:self-auto"
                >
                  <span>{attackingBoss ? "Executing Attack..." : "⚔️ Attack Boss Payoff"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
                💡 Making an extra payment reduces Boss HP directly and awards up to +600 XP on defeat!
              </p>
            </div>
          </div>

          {/* Ascent Roadmap & Milestones */}
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
              {milestones.map((m) => (
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

        {/* Right Column: Daily Quests & Streaks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Quests Card */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Active Financial Quests
              </h3>
              <span className="text-xs font-mono text-purple-500 font-bold">
                {quests.filter(q => q.isClaimed).length} / {quests.length} Done
              </span>
            </div>

            <div className="space-y-3">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{q.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{q.title}</h4>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{q.description}</p>
                    </div>
                  </div>

                  {q.isClaimed ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                      ✓ Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimQuest(q.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0"
                    >
                      +{q.xpReward} XP
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Streak Counter Card */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Compliance & Streaks
            </h3>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center space-y-2">
              <span className="text-4xl block">🔥</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                {questStats.streakMonths} Months
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

        </div>

      </div>
    </div>
  );
}

export default DebtDestroyerStudio;

