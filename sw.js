const CACHE_NAME = "agenda-v5";

const SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./style.css",
  "./app.js",
  "./db.js",
  "./sync.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => {
      return Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome)),
      );
    }),
  );
});

function cacheFirst(request) {
  return caches.match(request).then((resposta) => {
    if (resposta) {
      return resposta;
    }
    return fetch(request).then((respostaRede) => {
      const copia = respostaRede.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
      return respostaRede;
    });
  });
}

function networkFirst(request) {
  return fetch(request)
    .then((respostaRede) => {
      const copia = respostaRede.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
      return respostaRede;
    })
    .catch(() => caches.match(request));
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.match(request).then((respostaCache) => {
      const buscaRede = fetch(request)
        .then((respostaRede) => {
          cache.put(request, respostaRede.clone());
          return respostaRede;
        })
        .catch(() => respostaCache);

      return respostaCache || buscaRede;
    });
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes("/img/")) {
    event.respondWith(staleWhileRevalidate(req));
  } else if (req.mode === "navigate") {
    event.respondWith(
      cacheFirst(req).catch(() => caches.match("./offline.html")),
    );
  } else {
    event.respondWith(cacheFirst(req));
  }
});
