const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/styles.css",
    "/assets/index.js",
    "/assets/db.js",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            cache.addAll(FILES_TO_CACHE)
            .then(() => self.skipWaiting())
        })
    )
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then((keyList) => {
        return Promise.all(
            keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                return caches.delete(key);
            }
            })
        );
        })
    );

    self.clients.claim();
    });

self.addEventListener("fetch", event => {
    // cache successful GET requests to the API
    if (event.request.url.includes("/api/") && event.request.method === "GET") {
      event.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(event.request, response.clone());
                }
  
                return response;
              })
              .catch(() => {

                return cache.match(event.request);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });