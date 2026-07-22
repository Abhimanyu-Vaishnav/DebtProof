/**
 * DebtProof — PWA Install Banner
 * "Add to Home Screen" prompt for mobile users.
 * Only shows on mobile, only if not already installed, dismissible for 7 days.
 */
"use client";

import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "debtproof-pwa-dismiss";
const DISMISS_DAYS = 7;

export function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const ts = parseInt(dismissed);
        if (Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch { /* ignore */ }

    // Check if already in standalone mode (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((navigator as { standalone?: boolean }).standalone === true) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after small delay for graceful appearance
      setTimeout(() => setShowBanner(true), 3000);
    };

    const handleShowTrigger = () => {
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("debtproof_pwa_show", handleShowTrigger);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("debtproof_pwa_show", handleShowTrigger);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShowBanner(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()); } catch { /* ignore */ }
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto sm:w-80 z-30 animate-fade-in-up">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 flex items-center justify-between border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-black text-xs shadow-sm">
              💳
            </div>
            <div>
              <p className="text-xs font-black text-[var(--color-text-primary)]">Install DebtProof</p>
              <p className="text-[9px] font-bold text-[var(--color-text-secondary)]">Add to home screen</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-[var(--color-surface-tertiary)] transition cursor-pointer text-[var(--color-text-secondary)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-3.5 py-2">
          <p className="text-[11px] font-medium text-[var(--color-text-secondary)] leading-tight">
            Install DebtProof for fast offline access and app performance.
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {["⚡ Fast", "📴 Offline", "🔔 Alerts"].map(f => (
              <span key={f} className="text-[9px] font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-md">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-3.5 pb-3 flex gap-2 pt-1">
          <button onClick={handleInstall} disabled={installing}
            className="flex-1 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-60 transition cursor-pointer">
            {installing ? "Installing..." : "📱 Install App"}
          </button>
          <button onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPWABanner;
