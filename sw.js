const CACHE='krsf-v4';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var h=req.url;
  if(h.indexOf('firestore.googleapis.com')>-1||h.indexOf('identitytoolkit')>-1||h.indexOf('securetoken')>-1||h.indexOf('firebaseinstallations')>-1){return;}
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){var c=res.clone();caches.open(CACHE).then(function(cc){cc.put('./index.html',c);});return res;}).catch(function(){return caches.match('./index.html');}));
    return;
  }
  if(req.url.indexOf(self.location.origin)!==0)return;
  e.respondWith(caches.match(req).then(function(cached){
    var net=fetch(req).then(function(res){if(res&&res.status===200&&res.type==='basic'){var c=res.clone();caches.open(CACHE).then(function(cc){cc.put(req,c);});}return res;}).catch(function(){return cached;});
    return cached||net;
  }));
});
