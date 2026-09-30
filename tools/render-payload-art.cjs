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
    const heading = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 1252; c.height = 144;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0c0c0f'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8df0ad'; ctx.font = 'bold 14px Arial';
      ctx.fillText('PS5 RELAPSE / PAYLOAD CENTER', 626, 23);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 36px Arial';
      ctx.fillText('Payloads', 626, 66);
      ctx.fillStyle = '#cccccc'; ctx.font = '16px Arial';
      ctx.fillText('By Manohar Padul', 626, 94);
      ctx.fillStyle = '#aaaaaa'; ctx.font = '16px Arial';
      ctx.fillText('Select a payload to send it to the local ELF loader.', 626, 124);
      return c.toDataURL('image/png').split(',')[1];
    });
    fs.writeFileSync('ui/hdr-payload-center.png', Buffer.from(heading, 'base64'));
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
