/**
 * DebtProof — Service Worker Registrar
 * Client-side component that registers the SW without blocking SSR.
 */
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Auto update service worker on build changes
        reg.update();

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Clear stale caches to prevent chunk load failure
              if ("caches" in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
            }
          };
        };
      })
      .catch((err) => {
        console.warn("[DebtProof SW] Registration failed:", err);
      });
  }, []);

  return null;
}
