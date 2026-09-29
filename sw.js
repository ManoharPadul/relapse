const CACHE_NAME = "ps5-offline-v24";
const OFFLINE_MARKER = "./__offline_ready_v24";

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
  "./ui/btn-pldmgr-v052-default.png",
  "./ui/btn-pldmgr-v052-failed.png",
  "./ui/btn-pldmgr-v052-sending.png",
  "./ui/btn-pldmgr-v052-sent.png",
  "./ui/btn-nanodns-default.png",
  "./ui/btn-nanodns-failed.png",
  "./ui/btn-nanodns-sending.png",
  "./ui/btn-nanodns-sent.png",
  "./ui/btn-shadowmountplus-default.png",
  "./ui/btn-shadowmountplus-failed.png",
  "./ui/btn-shadowmountplus-sending.png",
  "./ui/btn-shadowmountplus-sent.png",
  "./ui/btn-game-compressor-default.png",
  "./ui/btn-game-compressor-failed.png",
  "./ui/btn-game-compressor-sending.png",
  "./ui/btn-game-compressor-sent.png",
  "./ui/hdr-payloads.png"
];

// These are deliberately listed instead of being cached only after a tile is
// clicked. The jailbreak is allowed to start only after this complete bundle
// has been stored, so the first later offline launch cannot miss a payload.
const OFFLINE_PAYLOADS = [
  "./payloads/elfldr-ps5-1360.elf",
  "./payloads/etaHEN.elf",
  "./payloads/ftpsrv-ps5.elf",
  "./payloads/kexp_2026_05_25.bin",
  "./payloads/kstuff.elf",
  "./payloads/nanodns.elf",
  "./payloads/pldmgr_v0.5.2.elf",
  "./payloads/shadowmountplus.elf",
  "./payloads/websrv-ps5.elf"
];

const OFFLINE_ASSETS = STATIC_ASSETS.concat(OFFLINE_PAYLOADS);

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

self.addEventListener("message", function (event) {
  if (!event.data || event.data.type !== "prepare-offline") return;

  const port = event.ports && event.ports[0];
  const reply = function (message) {
    if (port) port.postMessage(message);
  };

  event.waitUntil((async function () {
    const cache = await caches.open(CACHE_NAME);
    const marker = await cache.match(OFFLINE_MARKER);
    const present = await Promise.all(OFFLINE_ASSETS.map(function (asset) {
      return cache.match(asset);
    }));
    if (marker && present.every(function (response) { return !!response; })) {
      reply({ type: "offline-ready", cached: true });
      return;
    }

    let done = 0;
    for (let i = 0; i < OFFLINE_ASSETS.length; i++) {
      const asset = OFFLINE_ASSETS[i];
      if (present[i]) {
        done++;
        continue;
      }
      await cache.add(asset);
      done++;
      reply({ type: "offline-progress", asset: asset, done: done, total: OFFLINE_ASSETS.length });
    }

    await cache.put(OFFLINE_MARKER, new Response("ready", {
      headers: { "Content-Type": "text/plain" }
    }));
    reply({ type: "offline-ready", cached: false });
  })().catch(function (error) {
    reply({ type: "offline-error", error: String((error && error.message) || error) });
  }));
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
