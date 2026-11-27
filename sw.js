const C='rawatib-v64';
const FILES=['./','./index.html','./favicon.ico','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||req.headers.has('range')||/\.(mp4|webm)(\?|$)/i.test(req.url))return;
  let url;try{url=new URL(req.url)}catch(_){return}
  const sameOrigin=url.origin===self.location.origin;
  // app shell + same-origin assets: serve from cache instantly, refresh in background (stale-while-revalidate)
  if(sameOrigin){
    e.respondWith(caches.open(C).then(c=>c.match(req).then(hit=>{
      const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);
      if(hit){net;return hit;}                       // cached → return now, update later
      return net.then(r=>r||(req.mode==='navigate'?c.match('./index.html'):undefined));
    })));
    return;
  }
  // cross-origin (Supabase data, fonts): network-first, fall back to cache
  e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(req,cp)).catch(()=>{});return r}).catch(()=>caches.match(req)));
});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'موظف الصحة',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'موظف الصحة',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',dir:'rtl',lang:'ar',tag:'rw-'+Date.now(),data:{url:d.url||''},vibrate:[80,40,80]}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const base=self.registration.scope;let u=(e.notification.data&&e.notification.data.url)||'';u=!u?base:/^https?:/.test(u)?u:base+(u.startsWith('#')?u:'#'+u);
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.startsWith(base)){w.focus();if(u!==base)w.navigate(u).catch(()=>{});return}}return clients.openWindow(u)}))});
