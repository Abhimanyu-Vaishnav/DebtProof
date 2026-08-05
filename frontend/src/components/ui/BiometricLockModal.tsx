'use client';

import React, { useState } from 'react';

export default function BiometricLockModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Please enter 4-digit PIN');
      return;
    }
    setIsVerifying(true);
    setError('');
    setTimeout(() => {
      setIsVerifying(false);
      onClose();
    }, 600);
  };

  const handleBiometricAuth = () => {
    setIsVerifying(true);
    setError('');
    setTimeout(() => {
      setIsVerifying(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-6 text-slate-100 shadow-2xl text-center">
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-3xl">
            🛡️
          </div>
          <h3 className="text-lg font-black text-white">DebtProof Vault Lock</h3>
          <p className="text-xs text-slate-400">Enter Security PIN or use TouchID / FaceID to access sensitive records</p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />

          {error && <p className="text-xs text-rose-400 font-bold">{error}</p>}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isVerifying ? 'Verifying...' : 'Unlock Vault'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleBiometricAuth}
            disabled={isVerifying}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>👆 TouchID / FaceID WebAuthn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
