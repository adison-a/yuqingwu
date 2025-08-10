// 雨青屋 v0.1 — 极简离线缓存
const CACHE = 'rqw-v0.1';
const ASSETS = ['/', 'index.html','style.css','app.js','manifest.webmanifest'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return resp;
    }))
  );
});
