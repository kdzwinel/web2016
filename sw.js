'use strict';

var VERSION = 1;
var CACHE_NAME = 'cache-v' + VERSION;
var urlsToCache = ['/web2016/js/firebase.js', '/web2016/js/client.js', '/web2016/js/modernizr-custom.js', '/web2016/offline.html', '/web2016/js/offline.js', '/web2016/css/styles.css'];

self.addEventListener('install', function (event) {
    console.log('install ' + VERSION);

    // Perform install steps
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
    }));
});

self.addEventListener('activate', function (event) {
    console.log('activate ' + VERSION);

    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
                console.log('cache cleared ' + cacheName);
                return caches.delete(cacheName);
            }
        }));
    }));
});

self.addEventListener('fetch', function (event) {
    var requestURL = new URL(event.request.url);

    if (event.request.headers.get('Accept').indexOf('/html') > -1) {
        event.respondWith(caches.match(event.request).then(function (response) {
            if (response) {
                console.log('returning cached', requestURL.pathname);
            }

            return response || fetch(event.request);
        }).catch(function () {
            return caches.match('/web2016/offline.html');
        }));
    } else {
        event.respondWith(caches.match(event.request).then(function (response) {
            // Cache hit - return response
            if (response) {
                console.log('returning cached', requestURL.pathname);
                return response;
            }

            return fetch(event.request);
        }));
    }
});