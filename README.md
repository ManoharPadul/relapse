# relapse

PS5 WebKit + kernel exploit chain (relapse / aio), firmware **7.00 - 13.60**.

Retail and testkit build. Devkits want the relapse-dev build instead.

Open the page on the console and let it run. A successful run draws the payload menu
in place and sends each ELF through the console's own syscalls to `127.0.0.1:9021`,
so no server-side support is needed and this works from any static host.

Supported: 7.00, 7.01, 7.20, 7.40, 7.60, 7.61, 8.00, 8.20, 8.40, 8.60, 9.00, 9.20,
9.40, 9.60, 10.00, 10.01, 10.20, 10.40, 11.00, 11.20, 11.60, 12.00, 12.02, 12.20,
12.40, 12.60, 12.70, 13.00, 13.20, 13.40, 13.42, 13.60.

10.60 and 11.40 are absent: those firmware images are missing the modules the offsets
have to be read out of.

`elf.html` is a standalone payload menu for the already-jailbroken case. It needs a
host that runs code and can reach the console (`api/` ships PHP and node handlers),
so it does not work on GitHub Pages - use the run page's own menu there.

The bundled Game Compressor 1.0.4 payload is rebuilt with the Relapse PS5 SDK for
the 13.60 payload set and opens its local service on port 5910.

CheatRunner v0.17 is included as a PS5 SDK ELF build. It is a post-jailbreak cheat
dashboard, not a jailbreak, and opens its local web UI on port 9999 after the ELF
loader accepts it.

## Offline browser cache

The main page installs `sw.js` on the first successful online visit. After the
page finishes loading once, revisit the same origin to run from the cached
static files and payloads. Clearing the PS5 browser data removes the cache and
requires one more online visit.

The published site is `https://manoharpadul.github.io/relapse/`.

## Network and CheatRunner use

The first cache preparation needs an internet connection. After the page reports
that the offline cache is ready, the internet can be disabled, but keep the PS5
connected to the same local Wi-Fi/LAN as the device used to open its services. A
local network interface is important for the 13.60 chain; disabling Wi-Fi entirely
can produce the observed `kaslr: no configured interface` or routing failure.

To use CheatRunner:

1. Open Relapse once online and let the cache finish.
2. Later, open the cached Relapse page, run the jailbreak, and wait for elfldr on
   console port `9021`.
3. Select `CheatRunner v0.17`. Relapse sends it locally to `127.0.0.1:9021` and
   attempts to open `http://<PS5-IP>:9999/`.
4. Use local cheat files under CheatRunner's documented PS5 paths. Remote cheat
   sources and downloads still need internet; local files and the dashboard can
   work without WAN access.

`127.0.0.1` means the PS5 itself. From another device, use the PS5's LAN IP, not
`127.0.0.1`. CheatRunner must be tested on the target 13.60 console; compiling
with the PS5 SDK does not by itself prove every game, cheat, or firmware path is
compatible.
