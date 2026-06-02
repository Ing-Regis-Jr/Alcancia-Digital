const CACHE_NAME = "alcancia-v1";

const FILES = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/storage.js",
    "./js/auth.js",
    "./js/personas.js",
    "./js/aportes.js",
    "./js/app.js"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache =>
                cache.addAll(FILES)
            )

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => {

                return response || fetch(event.request);

            })

    );

});