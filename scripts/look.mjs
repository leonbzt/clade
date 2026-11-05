// The AI's eyes (cloud sessions; uses the pre-installed Playwright): starts the dev server, opens a page in headless
// Chromium at phone size, runs steps, saves screenshots to .shots/ and prints page errors and eval results.
//   npm run look -- [page] [steps-json]          page defaults to /game/
// Steps: {"click":"#sel"} {"tap":tile} {"key":"w"} {"wait":ms} {"shot":"name"} {"eval":"expr"} {"play":turns}
// "tap" taps a board tile by index; "play" plays turns with real taps (greedy for food), both via window.__game.
// Env: W and H (viewport, default 390 x 844), DSF (pixel ratio, default 1; use 2 for shots a person will see).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const page = process.argv[2] || '/game/';
const steps = JSON.parse(process.argv[3] || '[{"click":"#cardButtons button"},{"wait":400},{"shot":"game"}]');
mkdirSync('.shots', { recursive: true });

const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0].replace(/\/$/, '') + page;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await browser.newPage({ viewport: { width: +(process.env.W || 390), height: +(process.env.H || 844) }, deviceScaleFactor: +(process.env.DSF || 1) });
const out = [];
p.on('pageerror', (e) => out.push(`page error: ${e.message}`));
p.on('console', (m) => { if (m.type() === 'error') out.push(`console error: ${m.text()}`); });

async function tapTile(i) {
  const s = await p.evaluate((i) => window.__game.tile(i), i);
  const box = await p.$eval('#stage', (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top]; });
  await p.mouse.click(box[0] + s.x, box[1] + s.y);
}
const idle = () => p.waitForFunction(() => !window.__game.busy, null, { timeout: 10000 });

async function play(turns) {
  for (let k = 0; k < turns; k++) {
    const st = await p.evaluate(() => { const l = window.__game.life; return { phase: l.phase, food: l.food, size: l.size }; });
    if (st.phase === 'over') break;
    if (await p.$eval('#cardWrap', (e) => !e.hidden)) { await p.click('#cardButtons button'); await p.waitForTimeout(250); continue; }
    if (await p.$eval('#lay', (e) => !e.disabled) && st.food >= 8) await p.click('#lay');
    else {
      const order = await p.evaluate(() => {
        const l = window.__game.life, cols = l.hab.map[0].length, out = [];
        l.tiles.forEach((t, i) => {
          const d = Math.abs((i % cols) - l.x) + Math.abs(Math.floor(i / cols) - l.y);
          if (d > 0 && d <= 3) out.push([(t.node && (t.t !== 'mud' || t.seen) ? 10 : 0) - d * 0.1 + Math.random(), i]);
        });
        return out.sort((a, b) => b[0] - a[0]).map((a) => a[1]);
      });
      let moved = false;
      for (const i of order) { await tapTile(i); await p.waitForTimeout(40); if (await p.evaluate(() => window.__game.busy)) { moved = true; break; } }
      if (!moved) await p.click('#wait');
    }
    await idle();
    out.push(await p.evaluate(() => { const l = window.__game.life; return `turn ${l.turn} food ${l.food} size ${l.size} eggs ${l.eggs} health ${l.health} | ${l.lines.at(-1)}`; }));
  }
}

try {
  await p.goto(url);
  await p.waitForTimeout(1200);
  for (const s of steps) {
    if (s.click) await p.click(s.click);
    if (s.key) await p.keyboard.press(s.key);
    if (s.tap !== undefined) { await tapTile(s.tap); await idle(); }
    if (s.play) await play(s.play);
    if (s.eval) out.push(`eval: ${JSON.stringify(await p.evaluate(s.eval))}`);
    if (s.wait) await p.waitForTimeout(s.wait);
    if (s.shot) { await p.screenshot({ path: `.shots/${s.shot}.png` }); out.push(`shot: .shots/${s.shot}.png`); }
  }
} catch (e) {
  out.push(`step failed: ${e.message.split('\n')[0]}`);
}
console.log(out.join('\n') || 'ok, no errors');
await browser.close();
await server.close();
