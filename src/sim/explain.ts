// "Why is this tile like this?" Breakdowns are recomputed from the state with the same math the sim uses,
// never stored. The tile card shows them.
import { HABITAT_KINDS } from '../data/habitats';
import { FIELDS, LAYER_IDS, STATUS_IDS, STATUSES, STRATA, STRATUM_NAMES, limitName, type LayerId, type LevelDef, type StockDef } from '../data/fields';
import { LANDMARKS } from '../data/landmarks';
import { NUM } from '../data/numbers';
import { LAYER_UNITS } from '../data/units';
import { fellLast, gatherFlows, landMean, levelTerms, stockTerms } from './fields';
import { feltValue, fit, limitOf, score, statusScore, tierOf, type Profile } from './fit';
import { EV, SEA, TERRAIN_NAMES, type State } from './state';
import { geneText, tierName, variantName } from './variants';

export type NeedScore = { name: string; value: number; score: number; limiting: boolean };
export type FitInfo = { fit: number; tier: string | null; limit: number; needs: NeedScore[] };

export function fitInfo(s: State, p: Profile, i: number): FitInfo {
  const f = fit(s, p, i), l = f < 0.999 ? limitOf() : -1;
  const needs: NeedScore[] = p.needs.map((n) => {
    const value = feltValue(s, n.layer, p.stratum, i);
    return { name: LAYER_IDS[n.layer], value, score: score(value, n.band), limiting: n.layer === l };
  });
  for (const t of p.tolerance) {
    const value = s.statuses[STATUS_IDS[t.status]][i];
    if (value > 0) needs.push({ name: STATUSES[STATUS_IDS[t.status]].name.toLowerCase(), value, score: statusScore(value, t.tol), limiting: LAYER_IDS.length + t.status === l });
  }
  return { fit: f, tier: tierOf(f), limit: l, needs };
}

/** A sentence for the limit, in real units: "limited by moisture (16%; ideal from 22%)" or "limited by salt (scores
 * 0.30 here)". Shade reads as light, so its sides swap. */
export function limitText(p: Profile, info: FitInfo): string {
  if (info.limit < 0) return info.fit > 0 ? 'nothing holds it back' : '';
  const verb = info.fit > 0 ? 'limited' : 'ruled out', name = limitName(info.limit).toLowerCase();
  if (info.limit >= LAYER_IDS.length) return `${verb} by ${name} (scores ${r2(info.fit)} here)`;
  const n = p.needs.find((x) => x.layer === info.limit)!, v = info.needs.find((x) => x.limiting)!.value, b = n.band;
  const u = LAYER_UNITS[LAYER_IDS[info.limit]], low = v < b[1], edge = u.value(low ? b[1] : b[2]);
  return `${verb} by ${u.name.toLowerCase()} (${u.value(v)}; ${low !== !!u.inverse ? 'ideal from' : 'ideal up to'} ${edge})`;
}

const CODE_TEXT: Record<number, string> = {
  [EV.settled]: 'settled from a neighbour', [EV.founded]: 'founded by you', [EV.age]: 'started dying of age',
  [EV.stress]: 'started dying of stress', [EV.taken]: 'lost the tile', [EV.flare]: 'killed by a vent flare',
  [EV.rain]: 'arrived as spores from elsewhere', [EV.mutated]: 'gained a gene on the spot',
};

export type VariantInfo = { v: number; name: string; tier: number; tierName: string; genes: string; shown: boolean };

export type SlotInfo = {
  stratum: string;
  species: string | null;
  variant: VariantInfo | null;
  cover: number;
  mass: number; // grams on the tile
  health: number;
  dying: boolean;
  fit: FitInfo | null;
  last: string | null; // "Mosses started dying of stress, limited by shade · 40 s ago"
};

export function slotInfo(s: State, P: Profile[], k: number, i: number): SlotInfo {
  const n = s.w * s.h, slot = k * n + i, v = s.occ[slot], x = v >= 0 ? s.variants[v] : null;
  let last: string | null = null;
  if (s.lastCode[slot] !== EV.none) {
    const who = s.lastSp[slot] >= 0 ? s.species[s.lastSp[slot]].name + ' ' : '';
    const lim = s.lastLimit[slot] >= 0 ? `, limited by ${limitName(s.lastLimit[slot]).toLowerCase()}` : '';
    const ago = Math.round((s.tick - s.lastTick[slot]) / NUM.ticksPerSec);
    last = `${who}${CODE_TEXT[s.lastCode[slot]]}${lim} · ${ago < 90 ? `${ago} s` : `${Math.round(ago / 60)} min`} ago`;
  }
  return {
    stratum: STRATUM_NAMES[STRATA[k]],
    species: x ? s.species[x.sp].name : null,
    variant: x ? { v, name: variantName(s, v), tier: x.tier, tierName: tierName(x.tier), genes: geneText(s, v), shown: x.shown } : null,
    cover: x ? s.cover[slot] : 0,
    mass: x ? s.mass[slot] : 0,
    health: x ? s.health[slot] : 0,
    dying: !!x && s.dying[slot] === 1,
    fit: x ? fitInfo(s, P[v], i) : null,
    last,
  };
}

/** fall: what falls in per second (litter), for its years of fall. */
export type LayerInfo = { id: LayerId; name: string; value: number; parts: { label: string; value: number }[]; perSec: boolean; hidden: boolean; fall: number };

/** Each layer's value on a tile, with its parts. Stocks show rates per second; levels show what adds up. */
export function layerInfo(s: State, P: Profile[], i: number): LayerInfo[] {
  if (s.terrain[i] === SEA) return [];
  const F = gatherFlows(s, P), n = s.w * s.h;
  const who = (id: LayerId, sign: 1 | -1) => {
    const out: { label: string; value: number }[] = [];
    for (let k = 0; k < STRATA.length; k++) {
      const slot = k * n + i, v = s.occ[slot], r = v >= 0 ? P[v].makes[id] : undefined;
      if (r === undefined || Math.sign(r) !== sign) continue;
      const cover = s.cover[slot];
      out.push({ label: s.species[P[v].sp].name, value: FIELDS[id].kind === 'level' ? r * cover : r * cover * s.health[slot] });
    }
    return out;
  };
  return LAYER_IDS.map((id) => {
    const def = FIELDS[id], value = s.layers[id][i], name = def.name, hidden = !!def.hidden;
    if (def.kind === 'level') {
      const parts = [...levelTerms(s, id, def as LevelDef, 0, i), ...who(id, 1)];
      return { id, name, value, parts, perSec: false, hidden, fall: 0 };
    }
    const st = def as StockDef, mean = st.diffuse ? landMean(s, s.layers[id], i) : value;
    const t = stockTerms(st, value, F.plus[id][i], F.minus[id][i], F.cover[i], mean, st.fall ? fellLast[i] ?? 0 : 0);
    const total = F.plus[id][i] || 1, used = F.minus[id][i] || 1;
    // Every row is always listed, so the card keeps its shape while the numbers move.
    const parts = [
      ...who(id, 1).map((p) => ({ label: p.label, value: (p.value / total) * t.made })),
      ...who(id, -1).map((p) => ({ label: `used by ${p.label}`, value: (-p.value / used) * t.used })),
      { label: id === 'soil' ? 'erosion' : 'loss', value: t.decay },
    ];
    if (st.diffuse) parts.push({ label: 'from neighbours', value: t.spread });
    if (st.fall) parts.push({ label: 'dead plants, here and next door', value: t.fell });
    return { id, name, value, parts, perSec: true, hidden, fall: st.fall ? t.made + t.fell : 0 };
  });
}

export type PlaceInfo = {
  terrain: string; landmark: string | null; blurb: string | null; statuses: { name: string; value: number }[];
  named: string | null; side: 'windward' | 'lee'; habitat: string; // named: its major habitat; habitat: its kind ("Wet seep")
};

/** What the ground is: terrain, the landmark it belongs to, its statuses, its habitat and its side of the wind. */
export function placeInfo(s: State, i: number): PlaceInfo {
  const m = s.landmarks[s.mark[i]];
  const statuses = STATUS_IDS.filter((id) => s.statuses[id][i] > 0).map((id) => ({ name: STATUSES[id].name, value: s.statuses[id][i] }));
  return { terrain: TERRAIN_NAMES[s.terrain[i]], landmark: m ? m.name : null, blurb: m ? LANDMARKS[m.kind].blurb : null, statuses,
    named: s.habitats[s.place[i]]?.shown ? s.habitats[s.place[i]].name : null, side: s.windward[i] >= 0.5 ? 'windward' : 'lee', habitat: HABITAT_KINDS[s.hab[i]].name };
}

const r2 = (v: number) => String(+v.toFixed(2));
