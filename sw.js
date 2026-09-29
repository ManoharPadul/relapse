const CACHE_NAME = "ps5-offline-v8";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./payloads.js",
  "./firmware.js",
  "./main.js",
  "./core.js",
  "./mem.js",
  "./exploit.js",
  "./kexp.js",
  "./int64.js",
  "./rop.js",
  "./rop_slave.js",
  "./syscalls.js",
  "./offsets/7.00.js",
  "./offsets/7.01.js",
  "./offsets/7.20.js",
  "./offsets/7.40.js",
  "./offsets/7.60.js",
  "./offsets/7.61.js",
  "./offsets/8.00.js",
  "./offsets/8.20.js",
  "./offsets/8.40.js",
  "./offsets/8.60.js",
  "./offsets/9.00.js",
  "./offsets/9.20.js",
  "./offsets/9.40.js",
  "./offsets/9.60.js",
  "./offsets/10.00.js",
  "./offsets/10.01.js",
  "./offsets/10.20.js",
  "./offsets/10.40.js",
  "./offsets/11.00.js",
  "./offsets/11.20.js",
  "./offsets/11.60.js",
  "./offsets/12.00.js",
  "./offsets/12.02.js",
  "./offsets/12.20.js",
  "./offsets/12.40.js",
  "./offsets/12.60.js",
  "./offsets/12.70.js",
  "./offsets/13.00.js",
  "./offsets/13.20.js",
  "./offsets/13.40.js",
  "./offsets/13.42.js",
  "./offsets/13.60.js",
  "./payloads/elfldr-ps5-1360.elf",
  "./payloads/etaHEN.elf",
  "./payloads/ftpsrv-ps5.elf",
  "./payloads/game-compressor.elf",
  "./payloads/elf-arsenal.elf",
  "./payloads/kexp_2026_05_25.bin",
  "./payloads/klogsrv-ps5.elf",
  "./payloads/kstuff.elf",
  "./payloads/nanodns.elf",
  "./payloads/pldmgr_v0.5.1.elf",
  "./payloads/shadowmountplus.elf",
  "./payloads/websrv-ps5.elf",
  "./ui/btn-etahen-default.png",
  "./ui/btn-etahen-failed.png",
  "./ui/btn-etahen-sending.png",
  "./ui/btn-etahen-sent.png",
  "./ui/btn-ftp-default.png",
  "./ui/btn-ftp-failed.png",
  "./ui/btn-ftp-sending.png",
  "./ui/btn-ftp-sent.png",
  "./ui/btn-klog-default.png",
  "./ui/btn-klog-failed.png",
  "./ui/btn-klog-sending.png",
  "./ui/btn-klog-sent.png",
  "./ui/btn-kstuff-default.png",
  "./ui/btn-kstuff-failed.png",
  "./ui/btn-kstuff-sending.png",
  "./ui/btn-kstuff-sent.png",
  "./ui/btn-web-default.png",
  "./ui/btn-web-failed.png",
  "./ui/btn-web-sending.png",
  "./ui/btn-web-sent.png",
  "./ui/hdr-payloads.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(STATIC_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) { return key !== CACHE_NAME; })
        .map(function (key) { return caches.delete(key); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/api/") !== -1 || url.pathname.indexOf("/log/") !== -1) return;

  var refreshOnline = request.mode === "navigate"
    || /\/(?:payloads|sw)\.js$/.test(url.pathname);
  var fromNetwork = function () {
    return fetch(request, { cache: "no-store" }).then(function (response) {
      if (response.ok && response.type === "basic") {
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, response.clone());
        });
      }
      return response;
    });
  };
  var fromCache = function () {
    return caches.match(request, { ignoreSearch: true });
  };

  event.respondWith(
    (refreshOnline ? fromNetwork().catch(fromCache) : fromCache().then(function (cached) {
      return cached || fromNetwork();
    })).catch(function () {
      if (request.mode === "navigate") {
        return caches.match("./index.html", { ignoreSearch: true });
      }
      return Response.error();
    })
  );
});
