/* QUMIRAI service worker — lưu app để mở được khi không có mạng */
const CACHE='qumirai-1.69';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
const LIBS=/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const NAV_WAIT=4000; // mạng chậm quá 4 giây thì mở bản đã lưu, bản mới vẫn tải ngầm cho lần sau
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(r.mode==='navigate'){ // trang chính: ưu tiên bản mới trên mạng; lỗi/mất mạng/quá chậm thì dùng bản đã lưu
  const net=fetch(r).then(res=>{if(res&&res.ok&&res.type==='basic'){const cp=res.clone();return caches.open(CACHE).then(c=>c.put('./index.html',cp)).then(()=>res,()=>res)}return res});
  e.waitUntil(net.catch(()=>{}));
  e.respondWith((async()=>{const cached=await caches.match('./index.html');
   if(!cached)return net;
   try{const res=await Promise.race([net,new Promise(ok=>setTimeout(()=>ok(null),NAV_WAIT))]);return res&&res.ok?res:cached}catch(x){return cached}})());
  return}
 if(u.origin!==location.origin&&!LIBS.test(u.hostname))return;
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})))});
