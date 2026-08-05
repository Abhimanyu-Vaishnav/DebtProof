'use client';

import React, { useState } from 'react';

export default function EscrowVaultStudio() {
  const [lenderAddress, setLenderAddress] = useState('0x38B2...901A');
  const [amountMon, setAmountMon] = useState('250');
  const [delayDays, setDelayDays] = useState('30');
  const [loanRef, setLoanRef] = useState('P2P-MONAD-HOME-801');
  const [isLocking, setIsLocking] = useState(false);
  const [activeEscrows, setActiveEscrows] = useState([
    { id: 1, lender: '0x38B2...901A', amount: '250 MON', unlocks: 'In 30 days', status: 'Locked in Monad Vault' }
  ]);

  const handleLockFunds = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocking(true);
    setTimeout(() => {
      setActiveEscrows(prev => [
        {
          id: prev.length + 1,
          lender: lenderAddress,
          amount: `${amountMon} MON`,
          unlocks: `In ${delayDays} days`,
          status: 'Locked in Monad Vault'
        },
        ...prev
      ]);
      setIsLocking(false);
    }, 1200);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-light)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              Monad Automated EMI Escrow Vault
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Lock MON tokens in smart contract escrow for automated scheduled lender disbursal
          </p>
        </div>
      </div>

      <form onSubmit={handleLockFunds} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border-light)]">
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Lender Address</label>
          <input
            type="text"
            value={lenderAddress}
            onChange={(e) => setLenderAddress(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Escrow Amount (MON)</label>
          <input
            type="number"
            value={amountMon}
            onChange={(e) => setAmountMon(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Lock Duration (Days)</label>
          <input
            type="number"
            value={delayDays}
            onChange={(e) => setDelayDays(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLocking}
            className="w-full py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isLocking ? 'Locking...' : 'Lock Funds in Vault'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Active Vault Escrows</h3>
        <div className="space-y-2">
          {activeEscrows.map((dep) => (
            <div key={dep.id} className="p-3.5 bg-[var(--color-surface-tertiary)] rounded-2xl border border-[var(--color-border-light)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 font-bold">#Vault-{dep.id}</span>
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">{dep.amount}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">Lender: {dep.lender}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 rounded-full">
                  {dep.status} ({dep.unlocks})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
