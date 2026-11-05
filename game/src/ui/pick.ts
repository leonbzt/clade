// The plain pick screen (slice 09, until the island exists in slice 13): a board and a body, then Start. Each board
// card shows a small map and your best tier there this visit, per body.
import { HUNT, MAX_VERBS, PARTS, PLANS, PLAN_IDS, RULE, STYLES, STYLE_VERBS, VERBS, VERB_IDS, VERB_PART, type PlanId, type StyleId, type VerbId } from '../data/life';
import { newLife, partsFor } from '../sim/life';
import { CELL, HABITATS, HAB_ORDER, type HabitatId } from '../data/habitats';

const $ = (id: string) => document.getElementById(id)!;
const INK: Record<string, string> = { sand: '#c9b884', mud: '#524233', rock: '#3f434a', dead: '#7a5e36', mat: '#6f8f37', buried: '#d9861f', shell: '#ede4cb', carcass: '#d99a82', bloom: '#ded38e' };
const ASH = '#4c483d';

function thumb(id: HabitatId) {
  const h = HABITATS[id], k = 6, cv = document.createElement('canvas');
  cv.width = h.map[0].length * k; cv.height = h.map.length * k; cv.className = 'thumb';
  const g = cv.getContext('2d')!;
  h.map.forEach((row, y) => [...row].forEach((c, x) => {
    const [t, node] = CELL[c];
    g.fillStyle = t === 'sand' && h.ground === 'basalt' ? ASH : INK[t]; g.fillRect(x * k, y * k, k, k);
    if (node) { g.fillStyle = INK[node]; g.fillRect(x * k + 1, y * k + 1, k - 2, k - 2); }
  }));
  return cv;
}

export class Pick {
  hab: HabitatId = 'mud';
  plan: PlanId = 'worm';
  verbs: VerbId[] = [...STYLE_VERBS.digger];
  private note = '';
  best = new Map<string, string>(); // `${hab}:${plan}` → tier, this visit
  private onStart: (hab: HabitatId, plan: PlanId) => void = () => {};

  constructor() { $('pickGo').onclick = () => { this.hide(); this.onStart(this.hab, this.plan); }; }

  get open() { return !$('pick').hidden; }
  hide() { $('pick').hidden = true; }

  show(onStart: (hab: HabitatId, plan: PlanId) => void) {
    this.onStart = onStart;
    this.render();
    $('pick').hidden = false;
  }

  record(hab: HabitatId, plan: PlanId, tier: string) {
    const order = HABITATS[hab].tiers.map(([t]) => t), key = `${hab}:${plan}`, old = this.best.get(key);
    if (!old || order.indexOf(tier) < order.indexOf(old)) this.best.set(key, tier);
  }

  /** Whether this loadout fits the body plan's slots (two head parts don't). */
  private fits(vs: VerbId[]) {
    const l = newLife(1, this.plan, HABITATS[this.hab], partsFor(this.plan, vs));
    return l.order.length === vs.length;
  }

  private toggle(v: VerbId) {
    this.note = '';
    if (this.verbs.includes(v)) { if (this.verbs.length > 1) this.verbs = this.verbs.filter((q) => q !== v); else this.note = 'Keep at least one verb.'; return; }
    const next = [...this.verbs, v];
    if (next.length > MAX_VERBS) { this.note = `Three verbs at most: drop one first.`; return; }
    if (!this.fits(next)) { this.note = `No room: ${PARTS[partsFor(this.plan, [v])[0]].name} needs a slot another verb's part already takes.`; return; }
    this.verbs = next;
  }

  private render() {
    const habs = $('pickHabs'), plans = $('pickPlans'), verbs = $('pickVerbs'), styles = $('pickStyles');
    habs.innerHTML = ''; plans.innerHTML = ''; verbs.innerHTML = ''; styles.innerHTML = '';
    for (const id of HAB_ORDER) {
      const h = HABITATS[id], b = document.createElement('button');
      b.className = 'pickCard' + (id === this.hab ? ' on' : '');
      const best = PLAN_IDS.map((p) => `${PLANS[p].name} ${this.best.get(`${id}:${p}`) ?? '–'}`).join(' · ');
      b.innerHTML = `<span class="txt"><b>${h.name}</b><small>${h.pitch}</small><em>Best: ${best}</em></span>`;
      b.prepend(thumb(id));
      b.onclick = () => { this.hab = id; this.render(); };
      habs.appendChild(b);
    }
    for (const id of PLAN_IDS) {
      const p = PLANS[id], b = document.createElement('button');
      b.className = 'pickCard plan' + (id === this.plan ? ' on' : '');
      b.innerHTML = `<span class="txt"><b>${p.name}</b><small>${p.pitch}</small></span>`;
      b.onclick = () => { this.plan = id; if (!this.fits(this.verbs)) this.verbs = [...STYLE_VERBS.digger]; this.render(); };
      plans.appendChild(b);
    }
    const hunter = this.plan === 'swimmer';
    $('pickVerbsHead').hidden = hunter; styles.hidden = hunter;
    if (hunter) {
      verbs.innerHTML = `<div class="rules"><b>The hunter's rules</b><small><b>Lurk</b> a turn: prey don't notice you, and your next swim goes ${HUNT.ambush}× as far.</small>` +
        `<small><b>Frenzy</b>: +1 speed for each catch in a row.</small><small>Prey flee by their own rule, and the ground decides who gets away.</small></div>`;
      $('pickNote').textContent = `Grasping arms · upkeep ${RULE.baseUpkeep} food a turn at the start.`;
      return;
    }
    for (const id of Object.keys(STYLES) as StyleId[]) {
      const b = document.createElement('button'), on = STYLE_VERBS[id].every((v) => this.verbs.includes(v)) && this.verbs.length === 2;
      b.className = 'chip' + (on ? ' on' : ''); b.textContent = STYLES[id].name; b.title = STYLES[id].blurb;
      b.onclick = () => { this.verbs = [...STYLE_VERBS[id]]; this.note = STYLES[id].blurb; this.render(); };
      styles.appendChild(b);
    }
    for (const v of VERB_IDS) {
      const V = VERBS[v], part = PARTS[VERB_PART[this.plan as 'worm'][v]], b = document.createElement('button');
      b.className = 'verbCard' + (this.verbs.includes(v) ? ' on' : '');
      b.innerHTML = `<b>${V.name}</b><small>${V.does}</small><em>${part.name} · upkeep ${part.upkeep} · ${V.free ? 'free' : 'your turn'}, every ${V.recharge}</em>`;
      b.onclick = () => { this.toggle(v); this.render(); };
      verbs.appendChild(b);
    }
    const up = RULE.baseUpkeep + partsFor(this.plan, this.verbs).reduce((n, p) => n + PARTS[p].upkeep, 0);
    $('pickNote').textContent = this.note || `${this.verbs.length} of ${MAX_VERBS} verbs · upkeep ${up} food a turn at the start.`;
  }
}
