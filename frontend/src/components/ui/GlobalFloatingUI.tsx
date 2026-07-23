/**
 * DebtProof — Global Floating UI Manager (Client Component)
 */
"use client";

import React, { useState, useEffect } from "react";
import EMIReminderPopup from "@/components/ui/EMIReminderPopup";
import InstallPWABanner from "@/components/ui/InstallPWABanner";

export function GlobalFloatingUI() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <EMIReminderPopup />
      <InstallPWABanner />
    </>
  );
}

export default GlobalFloatingUI;

