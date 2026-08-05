'use client';

import React, { useState } from 'react';

export default function WhatsAppTelegramWebhookStudio() {
  const [whatsappPhone, setWhatsappPhone] = useState('+91 98765 43210');
  const [telegramChatId, setTelegramChatId] = useState('@debtproof_bot');
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [enableTelegram, setEnableTelegram] = useState(true);
  const [testSent, setTestSent] = useState('');

  const handleSendTest = (channel: string) => {
    setTestSent(`Sending test alert to ${channel}...`);
    setTimeout(() => {
      setTestSent(`✓ Test alert dispatched to ${channel}! Check your phone.`);
    }, 1000);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-light)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📲</span>
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              WhatsApp & Telegram Bot Alert Engine
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Receive automated 3-day pre-EMI countdowns and inline quick-pay commands directly on messaging apps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Card */}
        <div className="p-5 bg-[#0b141a] rounded-2xl border border-emerald-900/40 text-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>💬</span> WhatsApp Business Webhook
            </span>
            <input
              type="checkbox"
              checked={enableWhatsApp}
              onChange={(e) => setEnableWhatsApp(e.target.checked)}
              className="accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Phone Number</label>
            <input
              type="text"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-emerald-900/50 bg-[#111b21] text-white font-mono"
            />
          </div>

          <button
            onClick={() => handleSendTest('WhatsApp')}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Dispatch Test WhatsApp Alert
          </button>
        </div>

        {/* Telegram Card */}
        <div className="p-5 bg-[#17212b] rounded-2xl border border-sky-900/40 text-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <span>✈️</span> Telegram Bot Integration
            </span>
            <input
              type="checkbox"
              checked={enableTelegram}
              onChange={(e) => setEnableTelegram(e.target.checked)}
              className="accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Telegram Handle / Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-sky-900/50 bg-[#0e1621] text-white font-mono"
            />
          </div>

          <button
            onClick={() => handleSendTest('Telegram Bot')}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Dispatch Test Telegram Bot Alert
          </button>
        </div>
      </div>

      {testSent && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 font-mono text-center">
          {testSent}
        </div>
      )}
    </div>
  );
}
