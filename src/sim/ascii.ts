// Text views of the island for the terminal: who holds each stratum, a layer as digits, and the species × layer
// table (who makes and needs what). Small on purpose, so a run can be read and compared as text.
import { FIELDS, LAYER_IDS, STRATA, type LayerId } from '../data/fields';
import { SPECIES } from '../data/species';
import { SEA, type State } from './state';

const LETTERS = 'CVMLFKE'; // cyano, liverwort, moss, lichen, fungus, clubmoss, fern (E for fern)

/** One stratum as letters ('.' bare land, ' ' sea). */
export function strataMap(s: State, stratum: (typeof STRATA)[number]): string {
  const n = s.w * s.h, k = STRATA.indexOf(stratum), rows: string[] = [];
  for (let y = 0; y < s.h; y++) {
    let row = '';
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x, sp = s.occ[k * n + i];
      row += s.terrain[i] === SEA ? ' ' : sp < 0 ? '.' : LETTERS[sp];
    }
    rows.push(row);
  }
  return `${stratum} (${SPECIES.map((sp, i) => `${LETTERS[i]}=${sp.id}`).join(' ')})\n${rows.join('\n')}`;
}

/** A layer as digits 0–9. */
export function layerMap(s: State, id: LayerId): string {
  const rows: string[] = [];
  for (let y = 0; y < s.h; y++) {
    let row = '';
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      row += s.terrain[i] === SEA ? ' ' : String(Math.min(9, Math.floor(s.layers[id][i] * 10)));
    }
    rows.push(row);
  }
  return `${id}\n${rows.join('\n')}`;
}

/** Species × layers: + makes, − uses, n needs. Lists layers nobody makes and needs nobody can meet. */
export function interactionTable(): string {
  const head = 'species    ' + LAYER_IDS.map((l) => l.slice(0, 5).padEnd(7)).join('');
  const rows = SPECIES.map((sp) => sp.id.padEnd(11) + LAYER_IDS.map((l) => {
    const m = sp.makes[l], need = sp.needs[l] ? 'n' : '';
    return ((m ? (m > 0 ? '+' : '−') : '') + need).padEnd(7);
  }).join(''));
  const made = new Set(SPECIES.flatMap((sp) => Object.entries(sp.makes).filter(([, v]) => v! > 0).map(([l]) => l)));
  const orphans = LAYER_IDS.filter((l) => FIELDS[l].kind !== 'base' && !made.has(l) && !(FIELDS[l].kind === 'level'));
  return [head, ...rows, `layers nobody makes: ${orphans.join(', ') || 'none'}`].join('\n');
}
