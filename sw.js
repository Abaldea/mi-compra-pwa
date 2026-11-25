/* =========================================================
   «Mi compra» — service worker
   ---------------------------------------------------------
   Guarda los ficheros de la app en una caché para que funcione
   sin conexión. Si cambias algún fichero, sube el número de
   VERSION_CACHE para que los navegadores descarguen el nuevo.
   ========================================================= */

const VERSION_CACHE = "mi-compra-v1";

// Ficheros que forman la aplicación (rutas relativas, válidas en GitHub Pages)
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon-180.png",
];

/* ---------- Instalación: descargar y guardar los ficheros ---------- */

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSION_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activación: borrar cachés de versiones anteriores ---------- */

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave !== VERSION_CACHE)
            .map((clave) => caches.delete(clave))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- Peticiones ---------- */

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;

  // Solo gestionamos descargas GET del mismo origen
  if (peticion.method !== "GET") {
    return;
  }
  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navegación (abrir la app): primero la red, y si no hay, la copia guardada
  if (peticion.mode === "navigate") {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(VERSION_CACHE).then((cache) => cache.put("./index.html", copia));
          return respuesta;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Resto de ficheros: primero la caché y, si no está, la red
  evento.respondWith(
    caches.match(peticion).then((enCache) => {
      if (enCache) {
        return enCache;
      }
      return fetch(peticion).then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(VERSION_CACHE).then((cache) => cache.put(peticion, copia));
        }
        return respuesta;
      });
    })
  );
});
