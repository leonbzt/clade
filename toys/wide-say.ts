// The wide toy's words: names, dials as words, stat bars, a build's block. Display only: every number and judgement
// comes from clade/src/model (board.ts, laws.ts) and the roster rows.
import type { Build, FoodId, Named, Site } from '../clade/src/model/types';
import { CLADE } from '../clade/src/data/roster/clades';
import { MUTATION } from '../clade/src/data/roster/mutations';
import { FOODS } from '../clade/src/data/roster/laws';
import { nameOf } from '../clade/src/model/board';
import { dialOf, eats, massOf, stats } from '../clade/src/model/laws';

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const generations = (n: number) => `${n} generation${n === 1 ? '' : 's'}`;

/** "Ragworms" → "ragworm", "Anchovies" → "anchovy", "Parrotfishes" → "parrotfish". */
export function singular(name: string): string {
  const n = name.toLowerCase().replace(/-/g, ' ');
  return n.endsWith('ies') ? n.slice(0, -3) + 'y' : /(sh|ch|ss|x|us)es$/.test(n) ? n.slice(0, -2) : n.replace(/s$/, '');
}
/** A build's common name, or "an unnamed ragworm". */
export const callName = (b: Build) => nameOf(b)?.common ?? `an unnamed ${singular(CLADE[b.clade].name)}`;

export function grams(g: number): string {
  if (g >= 1e6) return `${+(g / 1e6).toPrecision(2)} t`;
  if (g >= 1000) return `${+(g / 1000).toPrecision(2)} kg`;
  return `${+g.toPrecision(2)} g`;
}
/** The clade's dials in its own words: "3 g · burrow 0 · spawn 1". */
export function dialWords(b: Build): string[] {
  return CLADE[b.clade].dials.map((d) => (d.id === 'size' ? grams(massOf(b)) : `${d.word} ${dialOf(b, d.id)}`));
}
export function guardWords(b: Build): string {
  const c = CLADE[b.clade], s = stats(b);
  if (!c.guard) return 'no guard';
  return c.guard === 'fleeing' ? `flees (speed ${s.speed})` : `defence ${s.defence} (${c.guard})`;
}
export const beatsWords = (b: Build) => (CLADE[b.clade].beats.length ? CLADE[b.clade].beats.join(', ') : '—');
export const dietWords = (b: Build) => CLADE[b.clade].diet.map((d) => (d in FOODS ? FOODS[d as FoodId].name.toLowerCase() : d)).join(', ');
export const mutationWords = (b: Build) => (b.mutations.length ? b.mutations.map((m) => MUTATION[m].name).join(', ') : 'none');

/** The six stats as bars (0–6 points across). */
export function statBars(b: Build): string {
  const s = stats(b);
  const rows: [string, number][] = [['bite', s.bite], ['thrift (from size)', s.thrift], ['defence', s.defence], ['speed', s.speed], ['senses', s.senses], ['brood', s.brood]];
  return `<div class="bars">${rows.map(([k, v]) => `<span>${k}</span><div class="bar"><i style="width:${Math.min(100, Math.max(0, v / 6) * 100).toFixed(0)}%"></i></div><small>${+v.toFixed(1)}</small>`).join('')}</div>`;
}

/** Name, scientific name, where it really lives, the build in words, the stat bars. */
export function buildBlock(b: Build, named: Named | null = nameOf(b)): string {
  const c = CLADE[b.clade];
  return `<h2>${esc(named?.common ?? callName(b))}</h2>
    ${named ? `<div><i>${esc(named.name)}</i> · ${esc(c.name)}</div><div class="dim">${esc(named.home)}</div>` : `<div class="dim">${esc(c.name)}: no named species yet</div>`}
    <div>${dialWords(b).map(esc).join(' · ')}</div>
    <div class="dim">eats ${esc(dietWords(b))} · ${esc(guardWords(b))} · beats ${esc(beatsWords(b))} · mutations ${esc(mutationWords(b))}</div>
    ${statBars(b)}`;
}

/** Who this build eats and who eats it among the populations of a site (law 3 via `eats`). */
export function webHere(b: Build, site: Site): string {
  const others = site.pops.filter((p) => p.build !== b);
  const prey = others.filter((p) => eats(b, p.build, site.kind)).map((p) => callName(p.build));
  const by = others.filter((p) => eats(p.build, b, site.kind)).map((p) => callName(p.build));
  return `<div><b>Eats here:</b> ${esc(prey.join(', ') || 'no one')}</div><div><b>Eaten by here:</b> ${esc(by.join(', ') || 'no one')}</div>`;
}
