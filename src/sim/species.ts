// Species: a released line (or a native). Stats come from the run's final body; each niche of its layer gets a score.
import { FORMS, STATS, STAT_NAMES, STAT_SCALE, type FormId, type Genes, type Layer, type StatId } from '../data/genes';
import { NATIVES, NICHES, type Niche } from '../data/niches';

export interface Species {
  id: number; name: string; form: FormId; layer: Layer; genes: Genes;
  stats: number[]; // raw, in STATS order
  sn: number[]; // scaled 0..1 by the form
  scores: number[]; // per niche, 0..100; -1 where it isn't its layer
  parent: number; // the species it branched from, or -1
  native: boolean; color: string; born: number; niche: number; // where it was released
}

export const scaled = (form: FormId, raw: number[]) => raw.map((v, k) => Math.min(1, Math.max(0, v) / STAT_SCALE[form][STATS[k]]));

/** Stats × the niche's weights → 0..100. A negative weight rewards the stat's absence. */
export function nicheScore(sn: number[], n: Niche): number {
  let v = 0;
  for (const [k, wt] of Object.entries(n.w) as [StatId, number][]) {
    const s = sn[STATS.indexOf(k)];
    v += wt > 0 ? wt * s : -wt * (1 - s);
  }
  return Math.max(0, Math.min(100, Math.round(v * 100)));
}

export function scoresFor(form: FormId, sn: number[]): number[] {
  return NICHES.map((n) => (n.layer === FORMS[form].layer ? nicheScore(sn, n) : -1));
}

/** The stat a body is best at (its scaled value), for names. */
export function bestStat(sn: number[]): StatId {
  let k = 0;
  for (let i = 1; i < sn.length; i++) if (STATS[i] !== 'upkeep' && sn[i] > sn[k]) k = i;
  return STATS[k];
}

const WORDS: Record<StatId, string[]> = {
  reach: ['Tall', 'Tower', 'Spire'], spread: ['Wide', 'Creeping', 'Sprawl'], roots: ['Deep', 'Grip', 'Delver'],
  toughness: ['Stout', 'Iron', 'Hardy'], growth: ['Quick', 'Lush', 'Rapid'], upkeep: ['Lean', 'Thrifty', 'Spare'],
};
export function autoName(form: FormId, sn: number[], taken: Set<string>): string {
  const st = bestStat(sn);
  for (let round = 0; round < 20; round++) for (const w of WORDS[st]) {
    const name = `${w} ${FORMS[form].name.toLowerCase()}${round ? ` ${['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][round] ?? round + 1}` : ''}`;
    if (!taken.has(name)) return name;
  }
  return `${STAT_NAMES[st]} ${form}`;
}

/** A colour per species: hue walks the golden angle by id; the form sets lightness. */
export function speciesColor(id: number, form: FormId): string {
  const h = ((90 + id * 137.5) % 360) / 360, s = 0.75, l = form === 'moss' ? 0.6 : form === 'herb' ? 0.52 : 0.42;
  const f = (n: number) => {
    const k = (n + h * 12) % 12, c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`; // hex, so the map painter can read it
}

export function makeNatives(): Species[] {
  return NATIVES.map((nv, k) => {
    const n = NICHES[nv.niche], form: FormId = n.layer === 0 ? 'moss' : n.layer === 1 ? 'herb' : 'tree';
    return {
      id: k, name: nv.name, form, layer: n.layer, genes: [], stats: [], sn: STATS.map(() => 0.5),
      scores: NICHES.map((m) => (m.id === n.id ? nv.score : -1)), parent: -1, native: true, color: nv.color, born: 0, niche: n.id,
    };
  });
}
