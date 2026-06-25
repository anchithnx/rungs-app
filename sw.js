const CACHE = 'rungs-v3';
const ASSETS = ['./index.html', './app.js', './manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>{
      return cached || fetch(e.request).then(res=>{
        return caches.open(CACHE).then(cache=>{
          if(e.request.method==='GET' && res.status===200){
            cache.put(e.request, res.clone());
          }
          return res;
        });
      }).catch(()=>cached);
    })
  );
});
