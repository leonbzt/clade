// Packaged Part C/D smoke check, using installed Chrome and a disposable profile. No browser dependencies or user saves.
// npm run build:game && node scripts/sea-smoke.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const profile = mkdtempSync(`${tmpdir()}/clade-sea-smoke-`);
const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--remote-debugging-pipe',
  `--user-data-dir=${profile}`], { detached: true, stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
let id = 0, buffer = '', stderr = '', session;
const pending = new Map(), errors = [];
function disconnected(error) {
  for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error(`${error.message}\n${stderr}`)); }
  pending.clear();
}
chrome.on('error', disconnected);
chrome.on('exit', (code, signal) => disconnected(new Error(`Chrome exited: ${code ?? signal}`)));
chrome.stdio[3].on('error', disconnected); chrome.stdio[4].on('error', disconnected);
chrome.stderr.on('data', (data) => { stderr = (stderr + data).slice(-3000); });
chrome.stdio[4].on('data', (data) => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const msg = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    const request = pending.get(msg.id);
    if (request) { pending.delete(msg.id); clearTimeout(request.timer); msg.error ? request.reject(new Error(JSON.stringify(msg.error))) : request.resolve(msg.result); }
  }
});
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const key = ++id, timer = setTimeout(() => { pending.delete(key); reject(new Error(`CDP timeout: ${method}\n${stderr}`)); }, 15000);
    pending.set(key, { resolve, reject, timer });
    chrome.stdio[3].write(`${JSON.stringify({ id: key, method, params, ...(target ? { sessionId: target } : {}) })}\0`);
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(expression) {
  const end = Date.now() + 10000;
  while (Date.now() < end) { if (await evaluate(expression)) return; await sleep(80); }
  throw new Error(`Timed out: ${expression}; page errors: ${errors.join('\n')}`);
}
async function click(text, selector = 'button') {
  await evaluate(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(selector)})].find(b => !b.disabled && (b.textContent.trim() === ${JSON.stringify(text)} || b.querySelector("b")?.textContent.trim() === ${JSON.stringify(text)})); if (!b) throw Error('Missing button: ' + ${JSON.stringify(text)}); b.click(); })()`);
  await sleep(40);
}
const state = () => evaluate(`(() => { const s = __game.save; return { lives: s.lives, pending: s.pending, continuation: s.continuation, total: s.sea.patches.reduce((n,p) => n + p.pop.reduce((a,b) => a+b,0),0) }; })()`);
const booted = '!!window.__game && !!document.querySelector("#meta")';
// Check the real rendered controls against saved access, including labels and opening every card.
async function checkPlayNext() {
  const before = await state();
  const choices = await evaluate(`(() => {
    const s = __game.save, p = s.sea.patches[s.continuation.patch];
    return [p.id, ...p.nb];
  })()`);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.playNext .habBtn')].map(b => b.querySelector('b').textContent.trim())`),
    await evaluate(`${JSON.stringify(choices)}.map(id => { const p = __game.save.sea.patches[id]; return 'Patch ' + (id + 1) + ' · ' + ({mud:'Mud flats',sand:'Sand shallows',rock:'Volcanic rock'}[p.ground]); })`));
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.playNext small')].map(b => b.textContent.trim())`), choices.map((_, i) => i === 0 ? 'Last clutch' : 'Neighbour'));
  assert.equal(await evaluate(`(() => {
    const group = document.querySelector('.playNext'), meta = document.querySelector('#meta');
    return document.querySelector('.isle').nextElementSibling === group && meta.scrollWidth <= meta.clientWidth &&
      [...group.querySelectorAll('button')].every(b => b.scrollWidth <= b.clientWidth);
  })()`), true);
  for (const id of choices) {
    await evaluate(`document.querySelectorAll('.playNext .habBtn')[${choices.indexOf(id)}].click()`);
    assert.match(await evaluate('document.querySelector(".patchWrap h2").textContent'), new RegExp(`Patch ${id + 1}\\b`, 'i'));
    assert.equal(await evaluate('[...document.querySelectorAll(".patchWrap .liveBtn")].every(b => !b.disabled)'), true);
    await click('Map');
  }
  assert.deepEqual(await state(), before);
  return choices;
}
async function openNext(index = 0) {
  await evaluate(`document.querySelectorAll('.playNext .habBtn')[${index}].click()`);
  await sleep(40);
}

try {
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  // Fixed seed; use real gameplay RNG thereafter. The temporary profile has no pre-existing storage.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'Math.random = () => 0.0000000005;' });
  await send('Page.navigate', { url: pathToFileURL(resolve('game/dist/clade.html')).href });
  await until(booted);
  assert.equal((await state()).total, 0);
  assert.equal(await evaluate('document.querySelectorAll(".playNext .habBtn").length'), 0);
  await click('Choose a founding patch');
  assert.equal(await evaluate('document.querySelector(".patchList").open'), true);
  assert.equal(await evaluate('document.querySelectorAll(".patchList .habBtn").length === __game.save.sea.patches.length'), true);
  assert.equal(await evaluate('document.activeElement === document.querySelector(".patchList .habBtn")'), true);
  // Hit the real canvas with a touch at a saved patch tile, using CSS bounds at phone width.
  const hit = await evaluate(`(() => {
    const s = __game.save.sea, p = s.patches.find(p => p.ground === 'mud'), t = p.tiles[Math.floor(p.tiles.length / 2)];
    const cv = document.querySelector('.isle'); cv.scrollIntoView({block:'center'});
    const r = cv.getBoundingClientRect();
    return { patch: p.id, x: r.left + cv.clientLeft + (t % s.isl.w + .5) / s.isl.w * (r.width - 2 * cv.clientLeft),
      y: r.top + cv.clientTop + (Math.floor(t / s.isl.w) + .5) / s.isl.h * (r.height - 2 * cv.clientTop) };
  })()`);
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const hitShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${tmpdir()}/clade-sea-map-phone.png`, Buffer.from(hitShot.data, 'base64'));
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hit.x, y: hit.y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await until('!!document.querySelector(".patchWrap")');
  assert.match(await evaluate('document.querySelector(".patchWrap h2").textContent'), new RegExp(`Patch ${hit.patch + 1}\\b`, 'i'));
  const patchShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${tmpdir()}/clade-sea-patch-phone.png`, Buffer.from(patchShot.data, 'base64'));
  assert.deepEqual(await evaluate('[...document.querySelectorAll(".metaWrap .liveBtn")].map(b => b.textContent.trim())'), ['Live as worm']);
  await click('Live as worm'); await click('Start the Life'); await click('Start', '#cardButtons button');
  assert.equal(await evaluate('__game.life.hab.prey.length + __game.life.hab.rivals.length'), 0);
  assert.equal(await evaluate('__game.life.hab.predatorAt'), 99);

  // Controlled terminal fixture, through the real Lay handler: prove persistence while playback is still busy.
  await evaluate('__game.life.turn = 20; __game.life.size = 3; __game.life.food = 100; document.querySelector("#lay").disabled = false; document.querySelector("#lay").click();');
  assert.equal(await evaluate('__game.busy'), true);
  const terminal = await state();
  assert.equal(terminal.pending.eggs, 3); assert.equal(terminal.total, 0);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("clade.m1.save")).pending.eggs'), 3);
  await send('Page.reload'); await until(booted); await until('!!document.querySelector(".clutch")');
  assert.equal((await state()).pending.eggs, 3);
  await send('Page.reload'); await until(booted); await until('!!document.querySelector(".clutch")');
  await click('Keep no form');
  let settled = await state(); assert.equal(settled.lives, 1); assert.equal(settled.pending, undefined); assert(settled.total > 0);
  assert.match(await evaluate('document.querySelector(".returnFeedback").textContent'), /3 eggs released/);
  assert.equal(await evaluate('!!document.querySelector(".patchWrap")'), false);
  const returnShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${tmpdir()}/clade-sea-return-phone.png`, Buffer.from(returnShot.data, 'base64'));
  await click('Dismiss'); assert.deepEqual(await state(), settled);
  // Successful feedback is dismissed; zero-egg feedback below is reloaded while visible.
  await send('Page.reload'); await until(booted);
  assert.equal(await evaluate('!!document.querySelector(".returnFeedback")'), false);
  const loaded = await state(); assert.equal(loaded.lives, 1); assert.equal(loaded.total, settled.total);
  const choices = await checkPlayNext();
  await openNext();
  assert.equal(await evaluate('[...document.querySelectorAll(".metaWrap .liveBtn")].filter(b => b.textContent.startsWith("Live as")).length'), 4);

  await click('Map');
  await evaluate('document.querySelector(".patchList").open = true');
  const distant = await evaluate(`(() => { const s = __game.save, p = s.sea.patches[s.continuation.patch]; return s.sea.patches.find(q => q.id !== p.id && !p.nb.includes(q.id)).id; })()`);
  await evaluate(`document.querySelectorAll('.patchList .habBtn').forEach(b => { if (b.querySelector('b').textContent.startsWith('Patch ${distant + 1} ·')) b.click(); })`);
  assert.equal(await evaluate('[...document.querySelectorAll(".patchWrap .liveBtn")].every(b => b.disabled)'), true);
  await click('Map'); await openNext(1);

  // A failed next run leaves continuation intact and creates no additional population.
  await click('Live as trilobite'); await click('Start the Life'); await click('Start', '#cardButtons button');
  assert.equal(await evaluate('__game.life.plan'), 'trilobite');
  assert.equal(await evaluate('__game.life.hab.patch'), choices[1]);
  await evaluate('__game.life.health = 0; document.querySelector("#wait").click();');
  await until('!__game.busy && !document.querySelector("#cardWrap").hidden');
  await click('Back to the sea', '#cardButtons button');
  settled = await state(); assert.equal(settled.lives, 2); assert.deepEqual(settled.continuation, loaded.continuation);

  assert.match(await evaluate('document.querySelector(".returnFeedback").textContent'), /No new eggs released/);
  assert.deepEqual(await checkPlayNext(), choices);
  await send('Page.reload'); await until(booted);
  assert.equal((await state()).lives, 2);
  assert.deepEqual(await checkPlayNext(), choices);
  assert.equal(await evaluate('!!document.querySelector(".returnFeedback")'), false);

  // Copy/import a design through Menu; neither operation grants population or a new launch point.
  await click('Menu');
  const copyName = await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent.startsWith("Copy: ")).textContent.trim()');
  await click(copyName);
  const before = await state();
  await click('Load design'); assert.deepEqual(await state(), before);
  assert.match(await evaluate('document.querySelector(".metaWrap:last-child").textContent'), /ready as a starting design/);
  await click('Close'); await openNext();
  const designButton = await evaluate('[...document.querySelectorAll(".liveBtn")].find(b => b.textContent.startsWith("Use ")).textContent.trim()');
  await click(designButton); await click('Start the Life');
  assert.equal(await evaluate('__game.life.eggs'), 0); assert.deepEqual(await state(), before);

  // Force storage denial only inside the disposable profile, then prove the visible retry clears it.
  await click('Start', '#cardButtons button');
  await evaluate('window.restoreWrite = Storage.prototype.setItem; Storage.prototype.setItem = function(){ throw Error("test quota"); }; __game.life.health = 0; document.querySelector("#wait").click();');
  await until('!!document.querySelector("[role=alert]")');
  assert.match(await evaluate('document.querySelector("[role=alert]").textContent'), /could not be saved/);
  await evaluate('Storage.prototype.setItem = window.restoreWrite'); await click('Retry saving');
  assert.equal(await evaluate('!!document.querySelector("[role=alert]")'), false);
  await send('Page.reload'); await until(booted);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${tmpdir()}/clade-sea-smoke.png`, Buffer.from(shot.data, 'base64'));
  assert.deepEqual(errors, []);
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
  for (const mode of ['Mats', 'Oxygen', 'Hunters', 'Population']) await click(mode);
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${tmpdir()}/clade-sea-map-desktop.png`, Buffer.from(desktopShot.data, 'base64'));
  await checkPlayNext();
  await openNext();
  const desktopPatchShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${tmpdir()}/clade-sea-patch-desktop.png`, Buffer.from(desktopPatchShot.data, 'base64'));
  assert.deepEqual(errors, []);
  console.log('✓ packaged smoke: canvas touch, patch card, return/dismiss/reload, empty founding, terminal/clutch reload, once-only settlement, Play next/card matching, neighbour launch, all bodies, zero-egg choices/reload, design import, storage retry and overlays (390×844 / 1200×900).');
  console.log(`Screenshot: ${tmpdir()}/clade-sea-smoke.png. Controlled terminal fixtures; no balance/phone playtest claim.`);
} finally {
  if (chrome.exitCode === null && chrome.signalCode === null) {
    await send('Browser.close', {}, null).catch(() => {});
    if (chrome.exitCode === null && chrome.signalCode === null) await new Promise((resolve) => chrome.once('exit', resolve));
  }
  // The launcher can exit before its children. This process group belongs only to our disposable browser.
  try { process.kill(-chrome.pid, 'SIGTERM'); } catch { /* already closed */ }
  await sleep(200);
  rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
