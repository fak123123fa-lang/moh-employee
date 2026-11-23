const C='rawatib-v43';
const FILES=['./','./index.html','./favicon.ico','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'موظف الصحة',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'موظف الصحة',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',dir:'rtl',lang:'ar',tag:'rw-'+Date.now(),data:{url:d.url||''},vibrate:[80,40,80]}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const base=self.registration.scope;let u=(e.notification.data&&e.notification.data.url)||'';u=!u?base:/^https?:/.test(u)?u:base+(u.startsWith('#')?u:'#'+u);
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.startsWith(base)){w.focus();if(u!==base)w.navigate(u).catch(()=>{});return}}return clients.openWindow(u)}))});
