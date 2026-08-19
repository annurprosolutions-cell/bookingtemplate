/**
 * sw.js — Service worker minimum utk PWA installability.
 * Strategi: NETWORK-FIRST (bukan cache-first) — sengaja dibuat begini supaya app
 * tak "tersangkut" pada versi lama lepas admin update index.html. Cache cuma
 * dipakai sebagai fallback offline, bukan sumber utama.
 */
const CACHE_NAME = 'sfs-shell-v1';

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone)).catch(() => {});
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
