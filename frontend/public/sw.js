/**
 * DebtProof — Service Worker
 * Caches key assets for offline support and fast repeat loads.
 */

const CACHE_NAME = "debtproof-v1";
const OFFLINE_URL = "/dashboard";

// Core assets to pre-cache
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/manifest.json",
];

// ── Install ─────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore failures for optional assets
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch Strategy: Network First, Cache Fallback ───────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin API calls
  if (request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // For navigation requests: try network, fall back to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL) || caches.match("/"))
    );
    return;
  }

  // For static assets: try cache first, then network
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        });
      })
    );
  }
});

// ── Push Notifications ───────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || "DebtProof", {
        body: data.body || "",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: data.tag || "debtproof",
        data: { url: data.url || "/dashboard/loans" },
        vibrate: [200, 100, 200],
        requireInteraction: data.requireInteraction || false,
      })
    );
  } catch {
    // Ignore parse errors
  }
});

// ── Notification Click ───────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
