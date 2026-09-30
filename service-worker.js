const CACHE_NAME = "pm-offline-v8";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];


// ==========================================
// ติดตั้ง Service Worker
// ==========================================
self.addEventListener("install", function(event) {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(function(cache) {

        return cache.addAll(
          FILES_TO_CACHE
        );

      })

  );

  self.skipWaiting();

});


// ==========================================
// เปิดใช้งาน Service Worker
// ==========================================
self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches
      .keys()
      .then(function(cacheNames) {

        return Promise.all(

          cacheNames.map(
            function(cacheName) {

              if (
                cacheName !== CACHE_NAME
              ) {

                return caches.delete(
                  cacheName
                );

              }

            }
          )

        );

      })

  );

  self.clients.claim();

});


// ==========================================
// Offline Fetch
// ==========================================
self.addEventListener("fetch", function(event) {

  // ใช้เฉพาะ GET
  if (
    event.request.method !== "GET"
  ) {
    return;
  }


  event.respondWith(

    caches
      .match(event.request)
      .then(function(cachedResponse) {

        // ถ้ามีใน Cache ใช้ได้ทันที
        if (cachedResponse) {
          return cachedResponse;
        }


        // ถ้าไม่มี ลอง Internet
        return fetch(event.request)
          .then(function(networkResponse) {

            return networkResponse;

          })
          .catch(function() {

            // ถ้าไม่มี Internet
            // ให้กลับหน้า Offline App
            if (
              event.request.mode ===
              "navigate"
            ) {

              return caches.match(
                "./index.html"
              );

            }

          });

      })

  );

});
