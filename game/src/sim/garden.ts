// The living garden (slice 13), ported from toys/garden-sim.ts. One generation at a time, per habitat: stocks feed the
// roles, species share a role by score² but none holds more than MODEL.selfMax of it (the self-limit: no one winner),
// hunters take prey, the crowded spill across borders, natives you beat adapt. Reads data only; knows no board.
import { MODEL, NATIVES, ROLES, ROLE_IDS, WORLD, type Role } from '../data/garden';
import { HABITATS, HAB_ORDER, type HabitatId } from '../data/habitats';
import { PLANS, type PlanId } from '../data/life';
import { tierOf } from './life';

export interface Entry { sp: string; name: string; role: Role; pop: number; score: number; proven: boolean; line?: PlanId }
export interface HabState { mats: number; rot: number; oxygen: number; entries: Entry[]; flags: Record<string, boolean>; leaders: Partial<Record<Role, string>> }
export interface Normal { mats: number; rot: number; oxygen: number; pops: Record<Role, number> }
/** Every change has a reason: `why` is never empty. */
export interface News { gen: number; hab: HabitatId; text: string; why: string; yours?: boolean }
export interface Garden { gen: number; r: number; habs: Record<HabitatId, HabState>; normal: Record<HabitatId, Normal>; news: News[] }
export interface LifeResult { hab: HabitatId; plan: PlanId; role: Role; eggs: number }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (g: Garden) => {
  g.r = (g.r + 0x6d2b79f5) | 0;
  let t = Math.imul(g.r ^ (g.r >>> 15), 1 | g.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const lineId = (plan: PlanId) => `line:${plan}`;
export const lineName = (plan: PlanId) => `Your ${PLANS[plan].name.toLowerCase()}s`;
export const rowOf = (h: HabState, role: Role) => h.entries.filter((e) => e.role === role).sort((a, b) => b.score - a.score || b.pop - a.pop);
export const popOf = (h: HabState, role: Role) => h.entries.reduce((n, e) => n + (e.role === role ? e.pop : 0), 0);
const lower = (id: HabitatId) => HABITATS[id].name.toLowerCase();
export const tierName = (id: HabitatId, score: number) => tierOf(HABITATS[id], score);

/** What each role can hold here right now. */
export function capacity(h: HabState): Record<Role, number> {
  const oxy = clamp(0.35 + h.oxygen / 60, 0, 1), prey = popOf(h, 'grazer') + popOf(h, 'burrower');
  return { grazer: MODEL.perMat * h.mats * oxy, burrower: MODEL.perRot * h.rot * oxy, predator: prey * MODEL.perPrey };
}

/** Each species' share of its role: by score², none above the self-limit (the excess goes to the others). */
export function shares(row: Entry[]): number[] {
  const w = row.map((e) => Math.max(0.01, e.score) ** MODEL.power), sum = w.reduce((n, x) => n + x, 0) || 1;
  let s = w.map((x) => x / sum);
  for (let pass = 0; pass < 3; pass++) {
    const over = s.reduce((n, x) => n + Math.max(0, x - MODEL.selfMax), 0);
    if (over < 1e-9) break;
    const free = s.map((x, k) => (x < MODEL.selfMax ? w[k] : 0)), fs = free.reduce((n, x) => n + x, 0);
    s = s.map((x, k) => Math.min(MODEL.selfMax, x + (fs ? (over * free[k]) / fs : 0)));
  }
  return s;
}

function stepHabitat(g: Garden, id: HabitatId, out: News[]) {
  const h = g.habs[id], w = WORLD[id], cap = capacity(h);
  const season = 1 + MODEL.season * Math.sin((2 * Math.PI * g.gen) / MODEL.seasonLength + HAB_ORDER.indexOf(id) * 2);
  let deaths = 0;
  for (const role of ROLE_IDS) {
    const row = h.entries.filter((e) => e.role === role), sh = shares(row);
    row.forEach((e, k) => {
      const d = MODEL.rate * (cap[role] * sh[k] * (1 + MODEL.noise * (rnd(g) * 2 - 1)) - e.pop);
      if (d < 0) deaths -= d;
      e.pop += d;
    });
  }
  const G = popOf(h, 'grazer'), B = popOf(h, 'burrower'), prey = G + B; // hunters take prey in proportion
  const kill = Math.min(popOf(h, 'predator') * MODEL.kill, prey * MODEL.maxKill);
  if (prey > 0) for (const e of h.entries) if (e.role !== 'predator') { const loss = (kill * e.pop) / prey; e.pop -= loss; deaths += loss; }
  h.mats = clamp(h.mats + MODEL.regrow * (w.mats * season - h.mats) - MODEL.graze * G - MODEL.churn * B, 0, 100);
  h.rot = clamp(h.rot + w.rotIn + MODEL.deathToRot * deaths - MODEL.burrowEat * B - MODEL.rotDecay * h.rot, 0, 100);
  h.oxygen = clamp(h.oxygen + MODEL.oxygenPull * (w.oxygen - h.oxygen) + MODEL.burrowOxygen * B - MODEL.decayOxygen * h.rot, 0, 100);
  if (rnd(g) < MODEL.shockChance) {
    for (const e of h.entries) { const loss = e.pop * MODEL.shockKill; e.pop -= loss; h.rot = clamp(h.rot + loss * MODEL.deathToRot, 0, 100); }
    h.oxygen = clamp(h.oxygen - MODEL.shockOxygen, 0, 100);
    out.push({ gen: g.gen, hab: id, text: w.shock, why: `${w.shockWhy}; about a third of everything died` });
  }
  for (let k = h.entries.length - 1; k >= 0; k--) { // the outcompeted and the starved die out
    const e = h.entries[k];
    if (e.pop >= 1) continue;
    h.entries.splice(k, 1);
    const top = rowOf(h, e.role)[0];
    out.push({
      gen: g.gen, hab: id, yours: !!e.line, text: `${e.name} died out in the ${lower(id)}`,
      why: top && top.score > e.score ? `${top.name} outcompeted it, ${Math.round(top.score)} eggs to ${Math.round(e.score)}` : `too little food for ${ROLES[e.role].plural.toLowerCase()} there`,
    });
  }
  for (const role of ROLE_IDS) { // a new leader, once it's clearly ahead
    const top = [...h.entries].filter((e) => e.role === role).sort((a, b) => b.pop - a.pop)[0], last = h.leaders[role];
    if (!top || top.sp === last) continue;
    const old = h.entries.find((e) => e.sp === last && e.role === role);
    if (old && top.pop < old.pop * MODEL.leadBy) continue;
    h.leaders[role] = top.sp;
    if (last && (top.line || old?.line)) out.push({ gen: g.gen, hab: id, yours: true, text: `${top.name} now lead the ${ROLES[role].plural.toLowerCase()} in the ${lower(id)}`, why: old ? `${Math.round(top.pop)} of them to ${Math.round(old.pop)} ${old.name}` : 'the old leader died out' });
  }
  for (const role of ROLE_IDS) { // natives you beat adapt
    const row = h.entries.filter((e) => e.role === role), best = row.reduce<Entry | null>((a, e) => (!a || e.score > a.score ? e : a), null);
    if (!best?.line) continue;
    const rival = row.filter((e) => !e.line).sort((a, b) => b.score - a.score)[0];
    if (!rival) continue;
    const S = HABITATS[id].tiers[0][1], before = tierName(id, rival.score);
    rival.score = Math.min(rival.score + MODEL.arms, S * MODEL.armsMax);
    const after = tierName(id, rival.score);
    if (after !== before) out.push({ gen: g.gen, hab: id, yours: true, text: `${rival.name} adapted to ${after} tier in the ${lower(id)}`, why: `the pressure from ${best.name}` });
  }
  if (g.normal[id]) stockNews(g, id, out);
}

function stockNews(g: Garden, id: HabitatId, out: News[]) {
  const h = g.habs[id], n = g.normal[id];
  const flag = (key: string, on: boolean, text: string, why: () => string) => { if (on && !h.flags[key]) out.push({ gen: g.gen, hab: id, text, why: why() }); h.flags[key] = on; };
  const G = popOf(h, 'grazer'), B = popOf(h, 'burrower'), prey = G + B, normalPrey = n.pops.grazer + n.pops.burrower;
  const topBy = (role: Role) => [...h.entries].filter((e) => e.role === role).sort((a, b) => b.pop - a.pop)[0];
  const eaten = () => { const e = topBy('grazer'); return e && G > n.pops.grazer ? `${Math.round(e.pop)} ${e.name} graze them away` : 'a poor growing season'; };
  flag('matsLow', h.mats < n.mats * MODEL.low, `Mats are running out in the ${lower(id)}`, eaten);
  flag('matsHigh', h.mats > n.mats * MODEL.high, `Mats are spreading in the ${lower(id)}`, () => (G < n.pops.grazer * 0.8 ? `grazers are down to ${Math.round(G)}` : 'a good growing season'));
  flag('oxygenLow', h.oxygen < n.oxygen * MODEL.low, `Oxygen is falling in the ${lower(id)}`, () => (h.rot > n.rot ? 'more dead matter is rotting' : `burrowers are down to ${Math.round(B)}`));
  flag('predHigh', popOf(h, 'predator') > n.pops.predator * MODEL.high, `Hunters are rising in the ${lower(id)}`, () => (prey > normalPrey ? `prey is plentiful, ${Math.round(prey)} of them` : 'the survivors are breeding back'));
  flag('predLow', popOf(h, 'predator') < n.pops.predator * MODEL.low, `Hunters are scarce in the ${lower(id)}`, () => (prey < normalPrey ? `prey fell to ${Math.round(prey)}` : 'they took a heavy loss'));
}

/** The crowded cross borders. Yours can arrive anywhere, unproven; natives only return where they belong. */
function spill(g: Garden, id: HabitatId, out: News[]) {
  const h = g.habs[id], cap = capacity(h);
  for (const e of [...h.entries]) {
    if (e.pop < MODEL.spillMin || e.pop < MODEL.spillAt * MODEL.selfMax * cap[e.role]) continue;
    for (const to of WORLD[id].neighbours) {
      const there = g.habs[to], home = NATIVES.find((n) => n.id === e.sp)?.at[to];
      if (!e.line && home === undefined) continue;
      const amount = (e.pop * MODEL.spill) / WORLD[id].neighbours.length, found = there.entries.find((x) => x.sp === e.sp && x.role === e.role);
      if (found) found.pop += amount;
      else {
        there.entries.push({ sp: e.sp, name: e.name, role: e.role, pop: amount, score: home ?? e.score * MODEL.unproven, proven: !e.line, line: e.line });
        if (e.line) out.push({ gen: g.gen, hab: to, yours: true, text: `${e.name} spilled into the ${lower(to)}`, why: `no room left in the ${lower(id)}. Unproven here: go and prove it` });
      }
      e.pop -= amount;
    }
  }
}

/** One generation everywhere. Returns what's worth telling. */
export function step(g: Garden): News[] {
  g.gen++;
  const out: News[] = [];
  for (const id of HAB_ORDER) stepHabitat(g, id, out);
  for (const id of HAB_ORDER) spill(g, id, out);
  g.news = [...out.reverse(), ...g.news].slice(0, 80);
  return out;
}

/** A Life's eggs join the population, and prove your line's score here in the role it lived. */
export function release(g: Garden, r: LifeResult): News {
  const h = g.habs[r.hab], name = lineName(r.plan);
  let e = h.entries.find((x) => x.line === r.plan && x.role === r.role);
  if (!e && r.eggs > 0) { e = { sp: lineId(r.plan), name, role: r.role, pop: 0, score: 0, proven: true, line: r.plan }; h.entries.push(e); }
  if (e) { e.pop += r.eggs; e.proven = true; e.score = Math.max(e.score, r.eggs); }
  const news: News = r.eggs > 0
    ? { gen: g.gen, hab: r.hab, yours: true, text: `${name}: ${r.eggs} eggs in the ${lower(r.hab)}`, why: `what you ate makes you a ${ROLES[r.role].name} here, ranked ${tierName(r.hab, e!.score)}` }
    : { gen: g.gen, hab: r.hab, yours: true, text: `${name} left no eggs in the ${lower(r.hab)}`, why: 'nothing was laid' };
  g.news = [news, ...g.news].slice(0, 80);
  return news;
}

/** A garden that has settled for a while before you first see it. */
export function newGarden(seed: number): Garden {
  const empty = (): Normal => ({ mats: 0, rot: 0, oxygen: 0, pops: { grazer: 0, burrower: 0, predator: 0 } });
  const g: Garden = { gen: 0, r: seed | 0, news: [], habs: {} as Garden['habs'], normal: {} as Garden['normal'] };
  for (const id of HAB_ORDER) {
    const w = WORLD[id];
    g.habs[id] = { mats: w.mats, rot: 40, oxygen: w.oxygen, flags: {}, leaders: {}, entries: NATIVES.filter((n) => n.at[id] !== undefined).map((n) => ({ sp: n.id, name: n.name, role: n.role, pop: 10, score: n.at[id]!, proven: true })) };
  }
  const sums = Object.fromEntries(HAB_ORDER.map((id) => [id, empty()])) as Record<HabitatId, Normal>;
  for (let k = 0; k < MODEL.burnIn; k++) {
    step(g);
    if (k < MODEL.burnIn - MODEL.averageOver) continue;
    for (const id of HAB_ORDER) {
      const h = g.habs[id], s = sums[id];
      s.mats += h.mats; s.rot += h.rot; s.oxygen += h.oxygen;
      for (const role of ROLE_IDS) s.pops[role] += popOf(h, role);
    }
  }
  for (const id of HAB_ORDER) {
    const s = sums[id], n = MODEL.averageOver;
    g.normal[id] = { mats: s.mats / n, rot: s.rot / n, oxygen: s.oxygen / n, pops: Object.fromEntries(ROLE_IDS.map((role) => [role, s.pops[role] / n])) as Record<Role, number> };
  }
  g.gen = 0; g.news = [];
  for (const id of HAB_ORDER) { g.habs[id].flags = {}; for (const role of ROLE_IDS) g.habs[id].leaders[role] = [...g.habs[id].entries].filter((e) => e.role === role).sort((a, b) => b.pop - a.pop)[0]?.sp; }
  return g;
}

/** Run the generations you missed (capped at 8 h), and gather what happened. */
export function catchUp(g: Garden, ms: number): { gens: number; news: News[] } {
  const gens = Math.max(0, Math.min(MODEL.awayCap, Math.floor(ms / MODEL.genMs))), news: News[] = [];
  for (let k = 0; k < gens; k++) news.push(...step(g));
  return { gens, news: news.reverse() };
}
