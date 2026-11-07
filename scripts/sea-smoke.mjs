// Packaged Part B smoke check, using installed Chrome and a disposable profile. No browser dependencies or user saves.
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
  await click('Mud flats', '.habBtn');
  const first = await evaluate('document.querySelector(".metaWrap .liveBtn").textContent.trim()');
  await click(first);
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
  await send('Page.reload'); await until(booted);
  const loaded = await state(); assert.equal(loaded.lives, 1); assert.equal(loaded.total, settled.total);
  await click(`Continue from patch ${loaded.continuation.patch + 1}`);
  assert.equal(await evaluate('[...document.querySelectorAll(".metaWrap .liveBtn")].filter(b => b.textContent.startsWith("Live as")).length'), 4);

  // A failed next run leaves continuation intact and creates no additional population.
  await click('Live as trilobite'); await click('Start the Life'); await click('Start', '#cardButtons button');
  assert.equal(await evaluate('__game.life.plan'), 'trilobite');
  await evaluate('__game.life.health = 0; document.querySelector("#wait").click();');
  await until('!__game.busy && !document.querySelector("#cardWrap").hidden');
  await click('Back to the sea', '#cardButtons button');
  settled = await state(); assert.equal(settled.lives, 2); assert.deepEqual(settled.continuation, loaded.continuation);

  // Copy/import a design through Menu; neither operation grants population or a new launch point.
  await click('Patches'); await click('Map'); await click('Menu');
  const copyName = await evaluate('[...document.querySelectorAll("button")].find(b => b.textContent.startsWith("Copy: ")).textContent.trim()');
  await click(copyName);
  const before = await state();
  await click('Load design'); assert.deepEqual(await state(), before);
  assert.match(await evaluate('document.querySelector(".metaWrap:last-child").textContent'), /ready as a starting design/);
  await click('Close'); await click(`Continue from patch ${before.continuation.patch + 1}`);
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
  console.log('✓ packaged smoke: empty founding, terminal/clutch reload, once-only settlement, all bodies, failed-run continuation, design import and storage retry (390×844).');
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
