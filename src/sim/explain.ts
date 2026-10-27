// "Why is this tile like this?" Breakdowns are recomputed from the state with the same math the sim uses,
// never stored. The tile card shows them.
import { FIELDS, LAYER_IDS, STRATA, STRATUM_NAMES, type LayerId, type LevelDef, type StockDef } from '../data/fields';
import { NUM } from '../data/numbers';
import { SPECIES } from '../data/species';
import { gatherFlows, landMean, levelTerms, stockTerms } from './fields';
import { feltValue, fit, limitOf, score, tierOf, type Profile } from './fit';
import { EV, SEA, type State } from './state';

export type NeedScore = { layer: LayerId; value: number; score: number; limiting: boolean };
export type FitInfo = { fit: number; tier: string | null; limit: LayerId | null; needs: NeedScore[] };

export function fitInfo(s: State, p: Profile, i: number): FitInfo {
  const f = fit(s, p, i), l = limitOf();
  const needs = p.needs.map((n) => {
    const value = feltValue(s, n.layer, p.stratum, i);
    return { layer: LAYER_IDS[n.layer], value, score: score(value, n.band), limiting: n.layer === l && f < 0.999 };
  });
  return { fit: f, tier: tierOf(f), limit: l >= 0 && f < 0.999 ? LAYER_IDS[l] : null, needs };
}

/** A sentence for the limit: "limited by water (0.31; ideal from 0.45)". */
export function limitText(p: Profile, info: FitInfo): string {
  if (!info.limit) return info.fit > 0 ? 'nothing holds it back' : '';
  const n = p.needs.find((x) => LAYER_IDS[x.layer] === info.limit)!, v = info.needs.find((x) => x.layer === info.limit)!.value;
  const name = FIELDS[info.limit].name.toLowerCase(), b = n.band;
  const side = v < b[1] ? `ideal from ${r2(b[1])}` : `ideal up to ${r2(b[2])}`;
  return `${info.fit > 0 ? 'limited' : 'ruled out'} by ${name} (${r2(v)}; ${side})`;
}

const CODE_TEXT: Record<number, string> = {
  [EV.settled]: 'settled from a neighbour', [EV.founded]: 'founded by you', [EV.age]: 'died of age',
  [EV.stress]: 'died of stress', [EV.taken]: 'lost the tile', [EV.flare]: 'killed by a vent flare',
  [EV.rain]: 'arrived as spores from elsewhere',
};

export type SlotInfo = {
  stratum: string;
  species: string | null;
  cover: number;
  fit: FitInfo | null;
  last: string | null; // "Mosses died of stress, limited by shade · 40 s ago"
};

export function slotInfo(s: State, P: Profile[], k: number, i: number): SlotInfo {
  const n = s.w * s.h, slot = k * n + i, sp = s.occ[slot];
  let last: string | null = null;
  if (s.lastCode[slot] !== EV.none) {
    const who = s.lastSp[slot] >= 0 ? SPECIES[s.lastSp[slot]].name + ' ' : '';
    const lim = s.lastLimit[slot] >= 0 ? `, limited by ${FIELDS[LAYER_IDS[s.lastLimit[slot]]].name.toLowerCase()}` : '';
    const ago = Math.round((s.tick - s.lastTick[slot]) / NUM.ticksPerSec);
    last = `${who}${CODE_TEXT[s.lastCode[slot]]}${lim} · ${ago < 90 ? `${ago} s` : `${Math.round(ago / 60)} min`} ago`;
  }
  return {
    stratum: STRATUM_NAMES[STRATA[k]],
    species: sp >= 0 ? SPECIES[sp].name : null,
    cover: sp >= 0 ? s.cover[slot] : 0,
    fit: sp >= 0 ? fitInfo(s, P[sp], i) : null,
    last,
  };
}

export type LayerInfo = { id: LayerId; name: string; value: number; parts: { label: string; value: number }[]; perSec: boolean };

/** Each layer's value on a tile, with its parts. Stocks show rates per second; levels show what adds up. */
export function layerInfo(s: State, P: Profile[], i: number): LayerInfo[] {
  if (s.terrain[i] === SEA) return [];
  const F = gatherFlows(s, P), n = s.w * s.h;
  const who = (id: LayerId, sign: 1 | -1) => {
    const out: { label: string; value: number }[] = [];
    for (let k = 0; k < STRATA.length; k++) {
      const sp = s.occ[k * n + i], r = sp >= 0 ? P[sp].makes[id] : undefined;
      if (r === undefined || Math.sign(r) !== sign) continue;
      const cover = s.cover[k * n + i];
      out.push({ label: SPECIES[sp].name, value: FIELDS[id].kind === 'level' ? r * cover : r * cover * fit(s, P[sp], i) });
    }
    return out;
  };
  return LAYER_IDS.map((id) => {
    const def = FIELDS[id], value = s.layers[id][i], name = def.name;
    if (def.kind === 'base') return { id, name, value, parts: [], perSec: false };
    if (def.kind === 'level') {
      const parts = [...levelTerms(s, def as LevelDef, 0, i), ...who(id, 1)];
      return { id, name, value, parts, perSec: false };
    }
    const st = def as StockDef, mean = st.diffuse ? landMean(s, s.layers[id], i) : value;
    const t = stockTerms(st, value, F.plus[id][i], F.minus[id][i], F.cover[i], mean);
    const total = F.plus[id][i] || 1, used = F.minus[id][i] || 1;
    const parts = [
      ...who(id, 1).map((p) => ({ label: p.label, value: (p.value / total) * t.made })),
      ...who(id, -1).map((p) => ({ label: `used by ${p.label}`, value: (-p.value / used) * t.used })),
    ];
    if (Math.abs(t.decay) > 1e-5) parts.push({ label: t.decay < 0 ? (id === 'soil' ? 'erosion' : 'loss') : 'drifts back', value: t.decay });
    if (Math.abs(t.spread) > 1e-5) parts.push({ label: 'from neighbours', value: t.spread });
    if (id === 'litter') parts.push({ label: 'plants that die here add to it', value: 0 });
    return { id, name, value, parts, perSec: true };
  });
}

const r2 = (v: number) => String(+v.toFixed(2));
