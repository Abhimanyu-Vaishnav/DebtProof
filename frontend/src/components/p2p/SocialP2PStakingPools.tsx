"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";

interface StakingPool {
  id: string;
  name: string;
  creator: string;
  totalStakedMon: number;
  membersCount: number;
  targetReductionPercent: number;
  rewardPoolMon: number;
  daysRemaining: number;
  userProgressPercent: number;
  isUserStaked: boolean;
}

const SAMPLE_POOLS: StakingPool[] = [
  {
    id: "pool-1",
    name: "🚀 August Debt Destroyer Sprint",
    creator: "Sanatan Labs Community",
    totalStakedMon: 450,
    membersCount: 28,
    targetReductionPercent: 15,
    rewardPoolMon: 22.5,
    daysRemaining: 14,
    userProgressPercent: 18.2,
    isUserStaked: true,
  },
  {
    id: "pool-2",
    name: "💳 Credit Card Zero-Balance Challenge",
    creator: "FinTech Hackathon Guild",
    totalStakedMon: 200,
    membersCount: 12,
    targetReductionPercent: 25,
    rewardPoolMon: 10,
    daysRemaining: 22,
    userProgressPercent: 12.0,
    isUserStaked: false,
  },
];

export function SocialP2PStakingPools() {
  const [pools, setPools] = useState<StakingPool[]>(SAMPLE_POOLS);
  const [stakeAmount, setStakeAmount] = useState("10");
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [newTargetPercent, setNewTargetPercent] = useState("20");

  const { walletAddress, connectWallet } = useWallet();

  const handleJoinPool = (poolId: string) => {
    if (!walletAddress) {
      connectWallet();
      return;
    }

    setPools((prev) =>
      prev.map((p) =>
        p.id === poolId
          ? { ...p, totalStakedMon: p.totalStakedMon + parseFloat(stakeAmount || "10"), membersCount: p.membersCount + 1, isUserStaked: true }
          : p
      )
    );
    alert(`Successfully staked ${stakeAmount} MON into Community Debt Pool! You are now competing for rewards.`);
  };

  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;

    const newPool: StakingPool = {
      id: `pool-${Date.now()}`,
      name: newPoolName,
      creator: walletAddress ? `${walletAddress.substring(0, 6)}...` : "Community Member",
      totalStakedMon: 25,
      membersCount: 1,
      targetReductionPercent: parseFloat(newTargetPercent) || 20,
      rewardPoolMon: 1.25,
      daysRemaining: 30,
      userProgressPercent: 0,
      isUserStaked: true,
    };

    setPools([newPool, ...pools]);
    setShowCreatePoolModal(false);
    setNewPoolName("");
    alert("New Social P2P Debt Payoff Pool created & initialized on Monad Testnet!");
  };

  return (
    <div className="card p-6 border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="text-base font-black text-[var(--color-text-primary)]">
                Social P2P Staking & Community Debt Payoff Pools
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Stake MON tokens into community pools. Highest % debt reducers win the staked MON reward vault!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreatePoolModal(true)}
          className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
        >
          + Create Payoff Pool
        </button>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className={`p-5 rounded-2xl border transition-all space-y-4 ${
              pool.isUserStaked
                ? "bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/30"
                : "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)] hover:border-emerald-500/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-[var(--color-text-primary)]">{pool.name}</h4>
                <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">By {pool.creator} · {pool.daysRemaining} days left</p>
              </div>
              {pool.isUserStaked && (
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ✓ Joined & Staked
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)]">
                <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase block">Total Staked</span>
                <span className="font-bold text-emerald-400">{pool.totalStakedMon} MON</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)]">
                <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase block">Members</span>
                <span className="font-bold text-[var(--color-text-primary)]">{pool.membersCount} Users</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)]">
                <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase block">Reward Vault</span>
                <span className="font-bold text-purple-400">+{pool.rewardPoolMon} MON</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[var(--color-text-secondary)]">Your Debt Reduction: {pool.userProgressPercent}%</span>
                <span className="text-emerald-400">Target: {pool.targetReductionPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (pool.userProgressPercent / pool.targetReductionPercent) * 100)}%` }}
                />
              </div>
            </div>

            {!pool.isUserStaked ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="form-input text-xs py-1.5 px-3 rounded-xl w-24 text-right font-mono"
                  placeholder="MON"
                />
                <button
                  onClick={() => handleJoinPool(pool.id)}
                  className="flex-1 btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 cursor-pointer shadow-md"
                >
                  Stake MON & Join Challenge 🏆
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-400 text-center font-mono font-bold">
                🎉 Active Contender! Log repayments to increase your win probability.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Create Pool Modal */}
      {showCreatePoolModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Create Social Debt Staking Pool</h3>
              <button onClick={() => setShowCreatePoolModal(false)} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Pool Name / Challenge Title</label>
                <input
                  type="text"
                  placeholder="e.g. September Debt Free Sprint"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Target Debt Reduction (%)</label>
                <input
                  type="number"
                  value={newTargetPercent}
                  onChange={(e) => setNewTargetPercent(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn bg-emerald-600 text-white font-bold text-xs py-2">Initialize Pool</button>
                <button type="button" onClick={() => setShowCreatePoolModal(false)} className="btn btn-secondary text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialP2PStakingPools;
