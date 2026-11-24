/* QUMIRAI service worker — lưu app để mở được khi không có mạng */
const CACHE='qumirai-1.27';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
const LIBS=/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(r.mode==='navigate'){ // trang chính: ưu tiên bản mới trên mạng, mất mạng thì dùng bản đã lưu
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
 if(u.origin!==location.origin&&!LIBS.test(u.hostname))return;
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})))});
