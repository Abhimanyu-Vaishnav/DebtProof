"use client";

import React, { useEffect, useState } from "react";
import { triggerToast } from "./Toast";

const CURRENT_BUILD_ID = "v3.6.0-release"; // Updated build version stamp
const VERSION_KEY = "debtproof_system_build_version";
const DISMISSED_KEY = "debtproof_dismissed_version";

export function VersionNotifier() {
  const [updateBannerVisible, setUpdateBannerVisible] = useState(false);
  const [buildInfo, setBuildInfo] = useState({ version: CURRENT_BUILD_ID, isNew: false });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedVersion = localStorage.getItem(VERSION_KEY);
    const dismissedVersion = localStorage.getItem(DISMISSED_KEY);

    // If version changed OR not dismissed for current version
    if (storedVersion !== CURRENT_BUILD_ID) {
      localStorage.setItem(VERSION_KEY, CURRENT_BUILD_ID);
      localStorage.removeItem(DISMISSED_KEY); // Reset dismissal on new update!
      setUpdateBannerVisible(true);
      setBuildInfo({ version: CURRENT_BUILD_ID, isNew: true });
      
      triggerToast(`🚀 System Updated to ${CURRENT_BUILD_ID}! 4 New Features Live.`, "info");
    } else if (dismissedVersion !== CURRENT_BUILD_ID) {
      setUpdateBannerVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, CURRENT_BUILD_ID);
    setUpdateBannerVisible(false);
  };

  if (!updateBannerVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in z-[100] relative">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-black uppercase tracking-wider animate-pulse">
          🔔 System Update ({CURRENT_BUILD_ID})
        </span>
        <span>🎉 New Features Active: Monte Carlo Predictor, Auto-Pay Splitter, Credit Booster & Monad Yield Router!</span>
      </div>

      <button
        onClick={handleDismiss}
        className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-black transition cursor-pointer shrink-0 ml-2"
      >
        Dismiss ✓
      </button>
    </div>
  );
}
