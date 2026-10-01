// Atin HealthCare service worker: makes the site installable and shows an offline page when there is
// no connection. Deliberately conservative — pages are always fetched fresh from the network; only
// fingerprinted build assets and icons are cached. Bump VERSION to drop old caches.
const VERSION = "v1";
const STATIC_CACHE = `atin-static-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/brand/atin-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("atin-") && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never intercept the admin panel, APIs, uploads or Next's data requests.
  if (/^\/(admin|api|uploads)(\/|$)/.test(url.pathname) || url.searchParams.has("_rsc")) return;

  // Pages: network first, offline page when the network is unavailable.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Fingerprinted build assets never change: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) caches.open(STATIC_CACHE).then((cache) => cache.put(request, res.clone()));
            return res;
          }),
      ),
    );
  }
});
