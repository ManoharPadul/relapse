// Generate missing cards without replacing existing artwork.
// Run from the repo root with Playwright and Edge installed.
const fs = require('fs');
const vm = require('vm');
const { chromium } = require('playwright');
(async () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('payloads.js', 'utf8'), context);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    for (const tile of context.window.PAYLOAD_TILES) {
      const file = 'ui/btn-' + tile.key + '-default.png';
      if (fs.existsSync(file)) continue;
      const data = await page.evaluate(t => {
        const c = document.createElement('canvas');
        c.width = 626; c.height = 104;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#202125';
        ctx.beginPath(); ctx.roundRect(0, 0, 626, 104, 20); ctx.fill();
        ctx.textAlign = 'center';
        ctx.font = 'bold 26px Arial'; ctx.fillStyle = '#ffffff';
        ctx.fillText(t.title, 313, 42, 590);
        ctx.font = '18px Arial'; ctx.fillStyle = '#cccccc';
        ctx.fillText(t.description, 313, 64, 590);
        ctx.font = '16px Arial'; ctx.fillStyle = '#999999';
        ctx.fillText(t.name, 313, 87, 590);
        return c.toDataURL('image/png').split(',')[1];
      }, tile);
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      console.log(file);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
