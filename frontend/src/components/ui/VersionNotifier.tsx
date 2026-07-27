"use client";

import React, { useEffect, useState } from "react";
import { triggerToast } from "./Toast";

const SYSTEM_VERSION = "v2.1.0"; // Current system build revision
const VERSION_KEY = "debtproof_system_version";

export function VersionNotifier() {
  const [updateBannerVisible, setUpdateBannerVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (!storedVersion) {
      localStorage.setItem(VERSION_KEY, SYSTEM_VERSION);
    } else if (storedVersion !== SYSTEM_VERSION) {
      // System update detected!
      localStorage.setItem(VERSION_KEY, SYSTEM_VERSION);
      setUpdateBannerVisible(true);
      
      triggerToast(`🚀 System Updated to ${SYSTEM_VERSION}! AI Debt Consolidation & New Features Active.`, "info");

      // Dispatch event to refresh topbar notifications
      window.dispatchEvent(new CustomEvent("debtproof_refresh_notifications"));
      window.dispatchEvent(new CustomEvent("debtproof_activity_added", {
        detail: {
          id: `update-${Date.now()}`,
          event_type: "feature_enabled",
          title: `System Updated to ${SYSTEM_VERSION}`,
          description: "New features activated: AI Debt Consolidation, Bank Proposal Generator & PDF Export.",
          icon: "🚀",
          color: "purple",
          created_at: new Date().toISOString(),
        }
      }));
    }
  }, []);

  if (!updateBannerVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in z-[90] relative">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-black uppercase tracking-wider">
          🔔 System Update ({SYSTEM_VERSION})
        </span>
        <span>🎉 System update completed successfully! AI Debt Consolidation, Negotiation Letter Engine, & 27 Features are now live.</span>
      </div>

      <button
        onClick={() => setUpdateBannerVisible(false)}
        className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-black transition cursor-pointer shrink-0 ml-2"
      >
        Got it ✓
      </button>
    </div>
  );
}
