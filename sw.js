const CACHE='krsf-v80';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./pragati-logo.png'];
/* Static asset CDNs whose responses we cache so the icon font & web fonts keep working offline / on poor networks */
function isAssetCDN(u){return u.indexOf('cdnjs.cloudflare.com')>-1||u.indexOf('fonts.googleapis.com')>-1||u.indexOf('fonts.gstatic.com')>-1||isSDK(u);}
/* v9.23 - the Firebase library. It was never in this cache, so a phone whose browser had
   dropped its ordinary copy could not open the app offline at all. The files are versioned and
   never change, so once a copy is here it is served from here and not fetched again. It is
   fetched at install as a bonus, never a requirement: if Google cannot be reached right then,
   the install still succeeds and the files are cached the next time the page loads them. */
const SDK=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js'];
function isSDK(u){return u.indexOf('www.gstatic.com/firebasejs/')>-1;}
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE).then(function(){return Promise.all(SDK.map(function(u){return caches.match(u).then(function(hit){return hit?c.put(u,hit):c.add(u);}).catch(function(){});}));});}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var h=req.url;
  if(h.indexOf('firestore.googleapis.com')>-1||h.indexOf('identitytoolkit')>-1||h.indexOf('securetoken')>-1||h.indexOf('firebaseinstallations')>-1){return;}
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){var c=res.clone();caches.open(CACHE).then(function(cc){cc.put('./index.html',c);});return res;}).catch(function(){return caches.match('./index.html');}));
    return;
  }
  /* same-origin OR a known asset CDN (icon font / web fonts) — everything else is left to the network */
  if(req.url.indexOf(self.location.origin)!==0 && !isAssetCDN(h))return;
  if(isSDK(h)){e.respondWith(caches.match(req).then(function(hit){return hit||fetch(req).then(function(res){if(res&&(res.ok||res.type==='opaque')){var c=res.clone();caches.open(CACHE).then(function(cc){cc.put(req,c);});}return res;});}));return;}
  e.respondWith(caches.match(req).then(function(cached){
    var net=fetch(req).then(function(res){if(res&&(res.ok||res.status===0||res.type==='opaque')){var c=res.clone();caches.open(CACHE).then(function(cc){cc.put(req,c);});}return res;}).catch(function(){return cached;});
    return cached||net;
  }));
});
