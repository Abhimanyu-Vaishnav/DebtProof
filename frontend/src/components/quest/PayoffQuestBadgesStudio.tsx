"use client";

import React, { useState } from "react";
import { Trophy, Flame, Star, Award, ShieldCheck, Zap, Lock, CheckCircle2 } from "lucide-react";

interface BadgeItem {
  id: string;
  title: string;
  category: "Streak" | "Payoff" | "Web3" | "Mastery";
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-100
  unlockedDate?: string;
  rewardXP: number;
}

const INITIAL_BADGES: BadgeItem[] = [
  {
    id: "badge-1",
    title: "Debt-Free Apprentice",
    category: "Streak",
    description: "Complete your first on-time EMI payment proof.",
    icon: "🌱",
    unlocked: true,
    progress: 100,
    unlockedDate: "Unlocked 2 weeks ago",
    rewardXP: 100,
  },
  {
    id: "badge-2",
    title: "Card Crusher (Level 3)",
    category: "Payoff",
    description: "Keep overall credit card utilization below 30% for 3 consecutive months.",
    icon: "💳",
    unlocked: true,
    progress: 100,
    unlockedDate: "Unlocked yesterday",
    rewardXP: 250,
  },
  {
    id: "badge-3",
    title: "Monad On-Chain Pioneer",
    category: "Web3",
    description: "Anchor 5 repayment SHA-256 hashes on Monad Testnet.",
    icon: "⛓️",
    unlocked: true,
    progress: 100,
    unlockedDate: "Unlocked 3 days ago",
    rewardXP: 500,
  },
  {
    id: "badge-4",
    title: "Avalanche Speedrunner",
    category: "Mastery",
    description: "Pay off highest interest loan principal 20% faster than schedule.",
    icon: "🏔️",
    unlocked: false,
    progress: 65,
    rewardXP: 750,
  },
  {
    id: "badge-5",
    title: "Soulbound Freedom Titan",
    category: "Web3",
    description: "Mint 1 fully closed loan Soulbound NFT certificate.",
    icon: "🏆",
    unlocked: false,
    progress: 40,
    rewardXP: 1000,
  },
];

export function PayoffQuestBadgesStudio() {
  const [badges, setBadges] = useState<BadgeItem[]>(INITIAL_BADGES);
  const [userLevel, setUserLevel] = useState<number>(4);
  const [totalXP, setTotalXP] = useState<number>(1850);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      {/* Header & User Level Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Trophy className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">Quest Trophy Room & Badges</h3>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black">
                Level {userLevel} Titan
              </span>
            </div>
            <p className="text-xs text-slate-400">Unlock achievements & earn XP by sticking to your repayment plan</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
            <div>
              <span className="text-xs text-slate-400 block leading-none">Streak</span>
              <span className="text-sm font-black text-rose-400">14 Days</span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <span className="text-xs text-slate-400 block leading-none">Total XP</span>
              <span className="text-sm font-black text-amber-300">{totalXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress towards Next Level */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-300">Level {userLevel} Progression</span>
          <span className="text-amber-400">1,850 / 2,500 XP to Level {userLevel + 1}</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 rounded-full transition-all duration-500 w-[74%]" />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-4 rounded-xl border transition-all ${
              badge.unlocked
                ? "bg-amber-950/20 border-amber-500/40 text-slate-100 shadow-lg shadow-amber-950/20"
                : "bg-slate-950/50 border-slate-800 text-slate-400 opacity-80"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                {badge.icon}
              </div>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  badge.unlocked
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {badge.unlocked ? "UNLOCKED ✅" : `${badge.progress}% COMPLETE`}
              </span>
            </div>

            <h4 className="font-bold text-sm text-slate-100 mb-1 flex items-center gap-1.5">
              {badge.title} {!badge.unlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
            </h4>
            <p className="text-xs text-slate-400 mb-3">{badge.description}</p>

            <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-800/80">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> +{badge.rewardXP} XP
              </span>
              <span className="text-slate-500">{badge.unlockedDate || `${badge.progress}% progress`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
