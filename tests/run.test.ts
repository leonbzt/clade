// The headless runner: the bot plays on several seeds, and one compact table says whether the island stays
// alive, mixed and moving. `npm run sim` (SEEDS=5 MIN=60; ASCII=ground,herb,soil adds those text maps, TABLE=1 the species table,
// LIMITS=1 what holds each species back on seed 1).
// A second line per seed measures the variants: shown per species per 10 min, the top share a non-base variant
// reached, sorting (water on Dry + tiles minus the rest of the species), first Rare, combos, Leafy shoot, species made.
// A third line: animals. When each arrived (adopted by the bot), how many live at the end (members, min–max over the
// last 10 minutes, and groups as a share of the cap), moss now vs its peak, agents (share settled), and the tick's cost.
// A fourth line: the land. Median water on the open lava, windward vs lee (all land in brackets).
// A fifth line: habitats and the slot board. Majors over 30–60 min (and whether their names were unique), patches at
// the end, new ids per hour after 30 min, tiles per kind, the
// fewest open animal slots in their loadouts, plant layers locked where that layer lives, the roles open across the
// island at the end, holder changes per loadout slot per hour, renames, headlines and chatter per hour, and the slot
// update's cost per tick.
// A sixth line: grams. Mean grams per tile each plant holds against its full mass (masses.ts), the ledger's flows
// over the last minute (animals included), and its worst gap over the run. Grazer swings: how often the island's
// snails (and slugs) fell to half their peak and came back to 80% of it; "local": the same in 12×12-tile cells (a
// peak of two families or more). SERIES=1 prints the island's snails per minute.
// A measuring tool, not a balance bot. Skipped in `npm run check`.
import { it } from 'vitest';
import { writeSync } from 'node:fs';
import { SPECIES } from '../src/data/species';
import { createState } from '../src/sim/state';
import { botTick } from '../src/sim/bot';
import { changed, dominance, hill1, limitShare, livelyLandmarks, minutes, snapshot, spreadOf, swing } from '../src/sim/metrics';
import { profiles } from '../src/sim/fit';
import { LIMIT_COUNT, STRATA, limitName, type LayerId } from '../src/data/fields';
import { interactionTable, layerMap, strataMap } from '../src/sim/ascii';
import { variantStats, variantSummary, type VariantStats } from './variant-stats';
import { ROLES } from '../src/data/roles';
import { GEAR, HABITAT_KINDS } from '../src/data/habitats';
import { timer } from '../src/sim/slots';
import { PATCH } from '../src/sim/habitats';
import { SEA } from '../src/sim/state';
import { MASS } from '../src/data/masses';
import { NUM } from '../src/data/numbers';
import { grams } from '../src/ui/format';

const env = process.env, SEEDS = Number(env.SEEDS || 5), MIN = Number(env.MIN || 60);
const out = (s: string) => writeSync(1, s + '\n'); // straight to stdout: vitest hides console.log
const UNLOCKS = ['land', 'mosses', 'lichens', 'vascular', 'ferns'];
const ARRIVALS = ['hexapods', 'snails', 'beetles', 'slugs', 'insects'];
const ANIMAL_IDS = SPECIES.filter((d) => d.animal).map((d) => d.id);
const ABBR = ['cy', 'th', 'lv', 'mo', 'li', 'fu', 'cl', 'fe'];

/** Tiles (plants) or animals of every species built on this base. */
const count = (s: ReturnType<typeof createState>, id: string) => s.species.reduce((a, x, sp) => a + (SPECIES[x.base].id === id ? s.count[sp] : 0), 0);
const members = (s: ReturnType<typeof createState>, id: string) => s.species.reduce((a, x, sp) => a + (SPECIES[x.base].id === id ? s.members[sp] : 0), 0);
const capOf = (id: string) => SPECIES.find((d) => d.id === id)!.animal!.cap;
/** Crashes and returns in a series: a fall to half the peak, then back to 80% of that peak. */
function swings(xs: number[], min = 20): number {
  let peak = 0, low = Infinity, n = 0;
  for (const x of xs) {
    if (low === Infinity) { peak = Math.max(peak, x); if (peak >= min && x <= peak / 2) low = x; }
    else if (x >= 0.8 * peak) { n++; peak = x; low = Infinity; }
  }
  return n;
}

it.skipIf(!env.SIM)('sim', () => {
  timer.now = () => performance.now();
  if (env.TABLE) out(interactionTable());
  out(`seed | ${UNLOCKS.map((u) => u.slice(0, 4)).join(' ')} | ${ABBR.map((a) => a.padStart(5)).join('')} | hill  dom  turn%/min litter/min N med/top lively | ok`);
  let pass = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const s = createState(seed), when: Record<string, string> = {}, vs: VariantStats = variantStats();
    let ms = 0, msN = 0, mossPeak = 0, landed = -1, landTick = 0, reach = -1, fewestOpen = Infinity, slotMs = 0, windows = 0;
    let fewHab = Infinity, mostHab = 0, unique = true, lockedLive = 0, heads30 = 0, born30 = 0, gapMax = 0;
    const lo: Record<string, number> = {}, hi: Record<string, number> = {}, grazers: Record<string, number[]> = { snail: [], slug: [] }, cells: number[][] = [];
    let snap = snapshot(s), turn = 0, lit = Float32Array.from(s.layers.litter), litSwing = 0;
    for (let k = 0; k < MIN * 600; k++) {
      const t0 = performance.now(), waiting = s.visitors.snails;
      botTick(s, (l) => { const m = l.match(/^([\d.]+)m (?:evolve|door) (\w+)/); if (m && [...UNLOCKS, ...ARRIVALS].includes(m[2])) when[m[2]] = m[1]; });
      if (s.agents.length > 20) { ms += performance.now() - t0; msN++; }
      // Snail reach: how far the farthest snail is from where they landed, 15 minutes after adoption.
      if (landed < 0 && waiting !== undefined && s.visitors.snails === undefined) { landed = waiting; landTick = s.tick; }
      if (landed >= 0 && reach < 0 && s.tick === landTick + 15 * 600)
        reach = Math.max(0, ...s.agents.filter((a) => SPECIES[s.species[a.sp].base].id === 'snail').map((a) => Math.hypot(a.x - (landed % s.w), a.y - ((landed / s.w) | 0))));
      const moss = count(s, 'moss');
      mossPeak = Math.max(mossPeak, moss);
      if (minutes(s) > MIN - 10 && s.tick % 100 === 0) for (const id of ANIMAL_IDS) { const c = members(s, id); lo[id] = Math.min(lo[id] ?? c, c); hi[id] = Math.max(hi[id] ?? 0, c); }
      if (s.tick % 10 === 0) vs.sample(s);
      if (s.tick % 300 === 0) {
        slotMs += s.board.ms; windows++;
        if (s.tick === 30 * 600) { heads30 = s.board.heads; born30 = s.board.born; }
        if (minutes(s) >= 30) {
          const shown = s.habitats.filter((h) => h.alive && h.shown), gear = (h: { id: number }, k: number) => s.board.gear[h.id * GEAR.length + k];
          fewHab = Math.min(fewHab, shown.length); mostHab = Math.max(mostHab, shown.length);
          unique &&= new Set(shown.map((h) => h.name)).size === shown.length;
          fewestOpen = Math.min(fewestOpen, shown.reduce((a, h) => a + GEAR.filter((g, k) => !g.plant && gear(h, k) >= 0 && s.board.slots[h.id * ROLES.length + gear(h, k)].open).length, 0));
          for (const h of shown) GEAR.forEach((g, k) => { if (g.plant && gear(h, k) < 0 && s.board.slots[h.id * ROLES.length + ROLES.findIndex((r) => r.id === `lead:${g.stratum}`)].takes.some((c) => c > 0)) lockedLive++; });
        }
      }
      if (s.tick % 600 === 0) {
        for (const id in grazers) grazers[id].push(members(s, id));
        const c = new Array(Math.ceil(s.w / 12) * Math.ceil(s.h / 12)).fill(0);
        for (const a of s.agents) if (['snail', 'slug'].includes(SPECIES[s.species[a.sp].base].id)) c[((a.y / 12) | 0) * Math.ceil(s.w / 12) + ((a.x / 12) | 0)] += a.n;
        c.forEach((x, k) => (cells[k] ??= []).push(x));
      }
      if (s.tick % 600 === 0 && s.ledger.last.stock) gapMax = Math.max(gapMax, Math.abs(s.ledger.last.gap) / s.ledger.last.stock);
      if (s.tick % 6000 === 0) { if (minutes(s) === MIN) turn = changed(s, snap, snapshot(s)) / 10; snap = snapshot(s); }
      // Litter swing: the mean change per tile per minute, over the last 10 minutes.
      if (s.tick % 600 === 0) { if (minutes(s) > MIN - 10) litSwing += swing(s, lit, s.layers.litter) / 10; lit = Float32Array.from(s.layers.litter); }
    }
    const N = spreadOf(s, s.layers.nitrogen);
    const byBase = SPECIES.map((_, b) => s.species.reduce((a, x, sp) => a + (x.base === b ? s.count[sp] : 0), 0));
    const plants = SPECIES.map((sp, i) => (sp.id === 'fungus' || sp.animal ? -1 : byBase[i])).filter((c) => c >= 0);
    const alive = plants.filter((c) => c > 0).length, dom = dominance(s);
    const lively = livelyLandmarks(s), ok = alive >= 5 && dom.share <= 0.6 && turn > 0.0005 && lively >= 4;
    if (ok) pass++;
    out(`${String(seed).padStart(4)} | ${UNLOCKS.map((u) => (when[u] ?? '-').padStart(4)).join(' ')} | ` +
      `${byBase.slice(0, ABBR.length).map((c) => String(c).padStart(5)).join('')} | ${hill1(s).toFixed(2)} ` +
      `${ABBR[s.species[dom.sp]?.base] ?? '--'}${Math.round(dom.share * 100)}% ${(turn * 100).toFixed(2).padStart(5)}     ${litSwing.toFixed(4)}  ` +
      `${N.median.toFixed(2)}/${N.top.toFixed(2)}  ${lively}/${s.landmarks.length} | ${ok ? 'PASS' : 'FAIL'}`);
    out(vs.line(s, MIN));
    out(`     animals: ${ARRIVALS.map((a) => `${a.slice(0, 4)} ${when[a] ?? '-'}`).join(' · ')} | ` +
      ANIMAL_IDS.map((id) => `${id.slice(0, 5)} ${members(s, id)} (${lo[id] ?? 0}–${hi[id] ?? 0}) ${Math.round((100 * count(s, id)) / capOf(id))}%`).join(' ') +
      ` | swings ${Object.keys(grazers).map((id) => `${id} ${swings(grazers[id])}`).join(' ')} local ${cells.reduce((q, xs) => q + swings(xs, 24), 0)} | snail reach ${reach < 0 ? '-' : reach.toFixed(0)} | moss ${count(s, 'moss')}/${mossPeak} | ${s.agents.length} agents ${Math.round((100 * s.agents.filter((a) => a.slow).length) / (s.agents.length || 1))}% slow` +
      ` | ${msN ? (ms / msN).toFixed(2) : '-'} ms/tick`);
    const med = (ww: boolean, lava: boolean) => {
      const v = [...s.layers.water].filter((_, i) => s.terrain[i] !== SEA && (s.windward[i] >= 0.5) === ww && (!lava || s.mark[i] < 0)).sort((a, b) => a - b);
      return v[v.length >> 1];
    };
    const wet = med(true, true) - med(false, true);
    if (env.SERIES) out(`     snails/min: ${grazers.snail.join(' ')}`);
    out(`     land: water on lava windward ${med(true, true).toFixed(2)} lee ${med(false, true).toFixed(2)} (all land ${med(true, false).toFixed(2)}/${med(false, false).toFixed(2)})` +
      ` ${wet >= 0.08 ? 'ok' : 'LOW'}`);
    const B = s.board, open = ROLES.filter((r, k) => r.row !== 'lead' && B.best[k].exists && B.best[k].holder < 0).map((r) => r.name);
    const perTick = slotMs / windows / 300, hours = MIN / 60, shownNow = s.habitats.filter((h) => h.alive && h.shown);
    const patches = s.habitats.filter((h) => h.alive && h.tier === PATCH).length;
    out(`     habitats (30–${MIN}m): ${fewHab}–${mostHab} majors ${fewHab >= 5 && mostHab <= 10 ? 'ok' : 'OFF'}, names ${unique ? 'unique' : 'TWINS'}, ${patches} patches, ${Math.round((s.board.born - born30) / (hours - 0.5))} new ids/h |` +
      ` ${HABITAT_KINDS.map((d, k) => `${d.id} ${s.habitats.filter((h) => h.kind === k).reduce((a, h) => a + h.tiles, 0)}`).join(' ')} |` +
      ` open animal slots ≥ ${fewestOpen} ${fewestOpen >= 1 ? 'ok' : 'NONE'} | plant layers locked where alive: ${lockedLive}`);
    out(`     slots: open on the island: ${open.join(', ') || '-'} | ${(B.changes / (shownNow.length || 1) / GEAR.length / hours).toFixed(2)} changes/slot/h,` +
      ` ${Math.round(B.renames / hours)} renames/h, ${Math.round(B.heads / hours)} headlines/h (${Math.round((B.heads - heads30) / (hours - 0.5))} after 30m) ${B.heads / hours <= 10 ? 'ok' : 'MANY'}, ${Math.round(B.lines / hours)} chatter/h |` +
      ` ${perTick.toFixed(3)} ms/tick ${perTick < 0.3 ? 'ok' : 'SLOW'}`);
    const held = SPECIES.map(() => ({ g: 0, c: 0 })), L = s.ledger.last;
    for (let slot = 0; slot < s.occ.length; slot++) if (s.occ[slot] >= 0) { const b = s.species[s.variants[s.occ[slot]].sp].base; held[b].g += s.mass[slot]; held[b].c++; }
    out(`     grams: ${SPECIES.flatMap((d, b) => (d.animal || !held[b].c ? [] : [`${ABBR[b]} ${Math.round(held[b].g / held[b].c)}/${Math.round(MASS[d.id] * NUM.mass.tile)}`])).join(' ')} g per tile |` +
      ` per min: made ${grams(L.prod)}, came ${grams(L.came)}, burnt ${grams(L.burn)}, decay ${grams(L.decay)}, eaten ${grams(L.eaten)}, dropped ${grams(L.dropped)}, standing ${grams(L.stock)} (animals ${grams(L.animals)}) |` +
      ` biomass ${grams(s.biomass)} | worst gap ${(gapMax * 100).toFixed(4)}% ${gapMax < 0.001 ? 'ok' : 'OFF'}`);
    if (env.LIMITS && seed === 1) {
      const P = profiles(s);
      for (let sp = 0; sp < s.species.length; sp++) {
        const sh = limitShare(s, P, sp), all = sh.reduce((a, b) => a + b, 0) || 1;
        out(`  ${s.species[sp].id} ` + sh.map((c, j) => c ? `${j < LIMIT_COUNT ? limitName(j).toLowerCase() : 'none'} ${Math.round((100 * c) / all)}%` : '').filter(Boolean).join(' · '));
      }
    }
    if (env.ASCII && seed === 1) for (const m of env.ASCII.split(',')) {
      out(STRATA.includes(m as never) ? strataMap(s, m as (typeof STRATA)[number]) : layerMap(s, m as LayerId));
    }
  }
  out(`${pass}/${SEEDS} seeds pass (≥5 of 7 plants alive, none over 60% of its stratum, still changing, ≥4 lively landmarks)`);
  out(variantSummary());
}, 900_000);
