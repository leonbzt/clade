// Toy: the living garden, the model (no DOM). One generation at a time, per habitat: stocks feed roles, roles share by score³, predators
// take prey, the crowded spill across borders. It reads data only: it never imports the Life's rules or knows what a board is.
import { MODEL, NATIVES, ROLES, ROLE_IDS, WORLD, type Role } from './garden-data';
import { PLANS, type PartId, type PlanId } from './life2-data';
import { HABITATS, HAB_ORDER, type HabitatId } from './life2-habitats';

export interface Entry { sp: string; name: string; role: Role; pop: number; score: number; proven: boolean; line?: PlanId }
export interface HabState { mats: number; detritus: number; oxygen: number; entries: Entry[]; flags: Record<string, boolean>; leaders: Partial<Record<Role, string>> }
export interface Normal { mats: number; detritus: number; oxygen: number; pops: Record<Role, number> }
/** Every change has a reason: `why` is required, and a test checks it isn't empty. */
export interface News { gen: number; hab: HabitatId; text: string; why: string; yours?: boolean }
export interface Variant { hab: HabitatId; plan: PlanId; part: PartId }
export interface Garden { gen: number; r: number; habs: Record<HabitatId, HabState>; normal: Record<HabitatId, Normal>; news: News[]; variants: Variant[] }
export interface LifeResult { hab: HabitatId; plan: PlanId; role: Role; eggs: number }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (g: Garden) => {
  g.r = (g.r + 0x6d2b79f5) | 0;
  let t = Math.imul(g.r ^ (g.r >>> 15), 1 | g.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const lineId = (plan: PlanId) => `line:${plan}`;
export const lineName = (plan: PlanId) => `Your ${PLANS[plan].name.toLowerCase()} line`;
export const rowOf = (h: HabState, role: Role) => h.entries.filter((e) => e.role === role).sort((a, b) => b.pop - a.pop);
export const popOf = (h: HabState, role: Role) => h.entries.reduce((n, e) => n + (e.role === role ? e.pop : 0), 0);
const lower = (id: HabitatId) => HABITATS[id].name.toLowerCase();

/** What each role can hold here right now. */
export function capacity(h: HabState, id: HabitatId): Record<Role, number> {
  const oxy = clamp(0.35 + h.oxygen / 60, 0, 1), prey = popOf(h, 'grazer') + popOf(h, 'burrower') + popOf(h, 'filter');
  return {
    grazer: MODEL.perMat * h.mats * oxy, burrower: MODEL.perDetritus * h.detritus * oxy,
    filter: WORLD[id].filterCap * oxy, predator: prey * MODEL.perPrey,
  };
}

function stepHabitat(g: Garden, id: HabitatId, out: News[]) {
  const h = g.habs[id], w = WORLD[id], cap = capacity(h, id);
  const season = 1 + MODEL.season * Math.sin((2 * Math.PI * g.gen) / MODEL.seasonLength + HAB_ORDER.indexOf(id) * 2);
  let deaths = 0;
  for (const role of ROLE_IDS) {
    const row = h.entries.filter((e) => e.role === role).sort((a, b) => b.score - a.score);
    const held = row.slice(0, MODEL.slots), sum = held.reduce((n, e) => n + e.score ** 3, 0) || 1;
    for (const e of row) {
      const target = held.includes(e) ? (cap[role] * e.score ** 3) / sum : 0;
      const d = MODEL.rate * (target * (1 + MODEL.noise * (rnd(g) * 2 - 1)) - e.pop);
      if (d < 0) deaths -= d;
      e.pop += d;
    }
  }
  // predators take prey in proportion
  const G = popOf(h, 'grazer'), B = popOf(h, 'burrower'), prey = G + B + popOf(h, 'filter');
  const kill = Math.min(popOf(h, 'predator') * MODEL.kill, prey * MODEL.maxKill);
  if (prey > 0) for (const e of h.entries) if (e.role !== 'predator') { const loss = (kill * e.pop) / prey; e.pop -= loss; deaths += loss; }
  // the stocks
  h.mats = clamp(h.mats + MODEL.regrow * (w.mats * season - h.mats) - MODEL.graze * G - MODEL.churn * B, 0, 100);
  h.detritus = clamp(h.detritus + w.detritusIn + MODEL.deathToDetritus * deaths - MODEL.burrowEat * B - MODEL.detritusDecay * h.detritus, 0, 100);
  h.oxygen = clamp(h.oxygen + MODEL.oxygenPull * (w.oxygen - h.oxygen) + MODEL.burrowOxygen * B - MODEL.decayOxygen * h.detritus, 0, 100);
  // a shock now and then
  if (rnd(g) < MODEL.shockChance) {
    for (const e of h.entries) { const loss = e.pop * MODEL.shockKill; e.pop -= loss; h.detritus = clamp(h.detritus + loss * MODEL.deathToDetritus, 0, 100); }
    h.oxygen = clamp(h.oxygen - MODEL.shockOxygen, 0, 100);
    out.push({ gen: g.gen, hab: id, text: w.shock, why: `${w.shockWhy}; about a third of everything died` });
  }
  // the outcompeted and the starved die out here
  for (let k = h.entries.length - 1; k >= 0; k--) {
    const e = h.entries[k];
    if (e.pop >= 1) continue;
    h.entries.splice(k, 1);
    const top = rowOf(h, e.role)[0];
    out.push({
      gen: g.gen, hab: id, yours: !!e.line, text: `${e.name} died out in the ${lower(id)}`,
      why: top && top.score > e.score ? `${top.name} outcompeted it, ${Math.round(top.score)} eggs to ${Math.round(e.score)}` : `too little food for ${ROLES[e.role].plural.toLowerCase()} there`,
    });
  }
  // a new leader, once it's clearly ahead: noise alone doesn't make news
  for (const role of ROLE_IDS) {
    const top = rowOf(h, role)[0], last = h.leaders[role];
    if (!top || top.sp === last) continue;
    const old = h.entries.find((e) => e.sp === last && e.role === role);
    if (old && top.pop < old.pop * MODEL.leadBy) continue;
    h.leaders[role] = top.sp;
    if (last && (top.line || old?.line)) out.push({ gen: g.gen, hab: id, yours: true, text: `${top.name} now leads the ${ROLES[role].plural.toLowerCase()} in the ${lower(id)}`, why: old ? `${Math.round(top.pop)} of them to ${Math.round(old.pop)} ${old.name}` : 'the old leader died out' });
  }
  // natives you beat adapt
  for (const role of ROLE_IDS) {
    const row = h.entries.filter((e) => e.role === role);
    const best = row.reduce<Entry | null>((a, e) => (!a || e.score > a.score ? e : a), null);
    if (!best?.line) continue;
    const rival = row.filter((e) => !e.line).sort((a, b) => b.score - a.score)[0];
    if (!rival) continue;
    const S = HABITATS[id].tiers[0][1], before = tierName(id, rival.score);
    rival.score = Math.min(rival.score + MODEL.arms, S * MODEL.armsMax);
    const after = tierName(id, rival.score);
    if (after !== before) out.push({ gen: g.gen, hab: id, yours: true, text: `${rival.name} adapted to ${after} tier in the ${lower(id)}`, why: `the pressure from ${best.name}` });
  }
  // the stocks in the news, once per crossing
  if (g.normal[id]) stockNews(g, id, out);
}

const tierName = (id: HabitatId, score: number) => HABITATS[id].tiers.find(([, n]) => score >= n)![0];

function stockNews(g: Garden, id: HabitatId, out: News[]) {
  const h = g.habs[id], n = g.normal[id], top = (role: Role) => rowOf(h, role)[0];
  const flag = (key: string, on: boolean, text: string, why: () => string) => {
    if (on && !h.flags[key]) out.push({ gen: g.gen, hab: id, text, why: why() });
    h.flags[key] = on;
  };
  // reasons must be true: each names the bigger cause by comparing with normal, and falls back on the season, which is what's left
  const G = popOf(h, 'grazer'), B = popOf(h, 'burrower'), prey = G + B + popOf(h, 'filter'), normalPrey = n.pops.grazer + n.pops.burrower + n.pops.filter;
  const eaten = () => {
    const a = top('grazer'), b = top('burrower'), overG = G / (n.pops.grazer || 1), overB = B / (n.pops.burrower || 1);
    const e = overB > overG ? b : a;
    return e && Math.max(overG, overB) > 1 ? `${Math.round(e.pop)} ${e.name} ${ROLES[e.role].verb} them away` : 'a poor growing season';
  };
  flag('matsLow', h.mats < n.mats * MODEL.low, `Mats are running out in the ${lower(id)}`, eaten);
  flag('matsHigh', h.mats > n.mats * MODEL.high, `Mats are spreading in the ${lower(id)}`, () => (G < n.pops.grazer * 0.8 ? `grazers are down to ${Math.round(G)}` : 'a good growing season'));
  flag('oxygenLow', h.oxygen < n.oxygen * MODEL.low, `Oxygen is falling in the ${lower(id)}`, () => (h.detritus > n.detritus ? 'more dead matter is rotting' : `burrowers are down to ${Math.round(B)}`));
  flag('oxygenHigh', h.oxygen > n.oxygen * MODEL.high, `Oxygen is rising in the ${lower(id)}`, () => (B > n.pops.burrower ? `${Math.round(B)} burrowers are stirring the mud` : 'less dead matter is rotting'));
  flag('predHigh', popOf(h, 'predator') > n.pops.predator * MODEL.high, `Predators are rising in the ${lower(id)}`, () => (prey > normalPrey ? `prey is plentiful, ${Math.round(prey)} of them` : 'the survivors are breeding back'));
  flag('predLow', popOf(h, 'predator') < n.pops.predator * MODEL.low, `Predators are scarce in the ${lower(id)}`, () => (prey < normalPrey ? `prey fell to ${Math.round(prey)}` : 'they took a heavy loss'));
}

/** The crowded cross borders. Yours can arrive anywhere, unproven; natives only return where they belong. */
function spill(g: Garden, id: HabitatId, out: News[]) {
  const h = g.habs[id], cap = capacity(h, id);
  for (const e of [...h.entries]) {
    if (e.pop < MODEL.spillMin || e.pop < MODEL.spillAt * cap[e.role]) continue;
    for (const to of WORLD[id].neighbours) {
      const there = g.habs[to], home = NATIVES.find((n) => n.id === e.sp)?.at[to];
      if (!e.line && home === undefined) continue;
      const amount = (e.pop * MODEL.spill) / WORLD[id].neighbours.length;
      const found = there.entries.find((x) => x.sp === e.sp && x.role === e.role);
      if (found) found.pop += amount;
      else {
        there.entries.push({ sp: e.sp, name: e.name, role: e.role, pop: amount, score: home ?? e.score * MODEL.unproven, proven: !e.line, line: e.line });
        if (e.line) out.push({ gen: g.gen, hab: to, yours: true, text: `${e.name} spilled into the ${lower(to)}`, why: `no room left in the ${lower(id)}. Unproven here: go and prove it` });
      }
      e.pop -= amount;
    }
  }
}

/** Your populations throw up rare parts by themselves, more often the bigger they are. */
function throwVariants(g: Garden, known: PartId[], out: News[]) {
  for (const id of HAB_ORDER) for (const e of g.habs[id].entries) {
    if (!e.line || rnd(g) >= Math.min(MODEL.variantMax, e.pop / MODEL.variantPer)) continue;
    const plan = e.line, part = HABITATS[id].rares[plan].find((p) => !known.includes(p) && !g.variants.some((v) => v.part === p && v.plan === plan));
    if (!part) continue;
    g.variants = [...g.variants, { hab: id, plan, part }].slice(-MODEL.variantsHeld);
    out.push({ gen: g.gen, hab: id, yours: true, text: `${e.name} threw up a variant in the ${lower(id)}`, why: `a population of ${Math.round(e.pop)} carries more mutations. Go live it` });
  }
}

/** One generation everywhere. Returns what's worth telling. */
export function step(g: Garden, known: PartId[] = []): News[] {
  g.gen++;
  const out: News[] = [];
  for (const id of HAB_ORDER) stepHabitat(g, id, out);
  for (const id of HAB_ORDER) spill(g, id, out);
  throwVariants(g, known, out);
  g.news = [...out.reverse(), ...g.news].slice(0, 60);
  return out;
}

/** A Life's eggs join the population; they also prove the line's score here, in the role it lived. */
export function release(g: Garden, r: LifeResult): News {
  const h = g.habs[r.hab], name = lineName(r.plan);
  let e = h.entries.find((x) => x.line === r.plan && x.role === r.role);
  if (!e && r.eggs > 0) { e = { sp: lineId(r.plan), name, role: r.role, pop: 0, score: 0, proven: true, line: r.plan }; h.entries.push(e); }
  if (e) { e.pop += r.eggs; e.proven = true; e.score = Math.max(e.score, r.eggs); }
  const news: News = r.eggs > 0
    ? { gen: g.gen, hab: r.hab, yours: true, text: `${name}: ${r.eggs} eggs in the ${lower(r.hab)}`, why: `what you ate makes you a ${ROLES[r.role].name} here, ranked ${tierName(r.hab, e!.score)}` }
    : { gen: g.gen, hab: r.hab, yours: true, text: `${name} left no eggs in the ${lower(r.hab)}`, why: 'nothing was laid' };
  g.news = [news, ...g.news].slice(0, 60);
  return news;
}

/** A garden that has settled for a while before you first see it. */
export function newGarden(seed: number): Garden {
  const empty = (): Normal => ({ mats: 0, detritus: 0, oxygen: 0, pops: { grazer: 0, burrower: 0, filter: 0, predator: 0 } });
  const g: Garden = { gen: 0, r: seed | 0, news: [], variants: [], habs: {} as Garden['habs'], normal: {} as Garden['normal'] };
  for (const id of HAB_ORDER) {
    const w = WORLD[id];
    g.habs[id] = {
      mats: w.mats, detritus: 40, oxygen: w.oxygen, flags: {}, leaders: {},
      entries: NATIVES.filter((n) => n.at[id] !== undefined).map((n) => ({ sp: n.id, name: n.name, role: n.role, pop: 10, score: n.at[id]!, proven: true })),
    };
  }
  const sums = Object.fromEntries(HAB_ORDER.map((id) => [id, empty()])) as Record<HabitatId, Normal>;
  for (let k = 0; k < MODEL.burnIn; k++) {
    step(g);
    if (k < MODEL.burnIn - MODEL.averageOver) continue;
    for (const id of HAB_ORDER) {
      const h = g.habs[id], s = sums[id];
      s.mats += h.mats; s.detritus += h.detritus; s.oxygen += h.oxygen;
      for (const role of ROLE_IDS) s.pops[role] += popOf(h, role);
    }
  }
  for (const id of HAB_ORDER) {
    const s = sums[id], n = MODEL.averageOver;
    g.normal[id] = { mats: s.mats / n, detritus: s.detritus / n, oxygen: s.oxygen / n, pops: Object.fromEntries(ROLE_IDS.map((role) => [role, s.pops[role] / n])) as Record<Role, number> };
  }
  g.gen = 0; g.news = []; g.variants = [];
  for (const id of HAB_ORDER) { g.habs[id].flags = {}; for (const role of ROLE_IDS) g.habs[id].leaders[role] = rowOf(g.habs[id], role)[0]?.sp; }
  return g;
}

