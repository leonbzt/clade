// Folds dist/index.html's script and stylesheet into one page: dist/clade-mud-flats.html (a whole document).
// With a path argument it also writes the page's inside (no doctype, html, head or body tags) for hosts that wrap
// pages in their own skeleton, such as a claude.ai artifact.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');
html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_, f) =>
  `<script type="module">${readFileSync(join(dist, f), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_, f) => `<style>${readFileSync(join(dist, f), 'utf8')}</style>`);
if (/src="\.\/assets|href="\.\/assets/.test(html)) throw new Error('an asset was left out');
writeFileSync(join(dist, 'clade-mud-flats.html'), html);
console.log(`dist/clade-mud-flats.html: ${(html.length / 1024).toFixed(0)} KB`);
if (process.argv[2]) {
  const inner = html
    .replace(/<!doctype html>\s*/i, '').replace(/<\/?html[^>]*>\s*/gi, '').replace(/<\/?head>\s*/gi, '').replace(/<\/?body>\s*/gi, '')
    .replace(/<meta charset[^>]*>\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '')
    .replace(/<style>:root\s*\{\s*padding-top[^<]*<\/style>\s*/, ''); // the host pads :root itself
  writeFileSync(process.argv[2], inner);
  console.log(`${process.argv[2]}: ${(inner.length / 1024).toFixed(0)} KB`);
}
