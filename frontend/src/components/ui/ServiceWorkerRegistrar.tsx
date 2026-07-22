/**
 * DebtProof — Service Worker Registrar
 * Client-side component that registers the SW without blocking SSR.
 */
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[DebtProof SW] Registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[DebtProof SW] Registration failed:", err);
        });
    }
  }, []);

  return null;
}
