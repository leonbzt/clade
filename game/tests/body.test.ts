// Slice 20A fixtures (docs/design/20a-body-part-contract.md "Fixtures"): the pure body model, before any runtime switch.
// Sea save version and the part following to a neighbour patch are 20C (the runtime save and sea).
import { describe, expect, it } from 'vitest';
import { BODIES, HOMES, PLACES, PRESETS, type PlaceId, type Rows } from '../src/data/body';
import { PARTS, PART_IDS, PLAN_IDS, type PartId, type PlanId } from '../src/data/life';
import { PREY } from '../src/data/prey';
import * as B from '../src/sim/body';
import * as H from '../src/sim/body-hurt';

const build = (body: PlanId, rows: Rows, size = 1): B.Build => ({ body, size, rows, order: PLACES.filter((p) => rows[p]) });
const preset = (body: PlanId, id: string) => B.startBuild(body, PRESETS[body][id as never]!);
const common = (body: PlanId) => PART_IDS.filter((p) => !PARTS[p].rare && PARTS[p].plans.includes(body));

describe('20A definitions', () => {
  it('27 parts, four bodies, six places, a home for every part on every listed body', () => {
    expect(Object.keys(HOMES).sort()).toEqual([...PART_IDS].sort());
    expect(PART_IDS.length).toBe(27);
    expect(new Set(PLACES).size).toBe(6);
    for (const body of PLAN_IDS) for (const p of PART_IDS) expect(B.homesOf(body, p).length > 0, `${p} on ${body}`).toBe(PARTS[p].plans.includes(body));
  });
  it('defaults are legal and cost 1; at least three open places; worm Limbs unsupported', () => {
    for (const body of PLAN_IDS) {
      const d = B.defaultBuild(body), D = BODIES[body];
      expect(B.buildProblems(d)).toEqual([]);
      expect(B.upkeep(d)).toBe(1);
      expect(PLACES.filter((p) => !D.locks[p] && !D.unsupported.includes(p)).length).toBeGreaterThanOrEqual(3);
    }
    expect(B.rowsAt('worm', 'limbs')).toEqual([]);
  });
});

describe('20A starters and variants', () => {
  it('every preset is a legal starter, at the contract table numbers', () => {
    for (const body of PLAN_IDS) for (const id of Object.keys(PRESETS[body])) expect(preset(body, id).problems, `${body} ${id}`).toEqual([]);
    const row = (body: PlanId, id: string) => { const b = preset(body, id).build; return [B.upkeep(b), B.countedVerbs(b)]; };
    expect(row('worm', 'digger')).toEqual([2, ['dig', 'sense']]);
    expect(row('worm', 'sweeper')).toEqual([2, ['dig', 'graze', 'dash']]);
    expect(row('arthropod', 'sweeper')).toEqual([2, ['graze']]);
    expect(row('arthropod', 'digger')).toEqual([2, ['dig', 'sense']]);
    expect(row('trilobite', 'tank')).toEqual([3, ['brace', 'crush']]);
    expect(B.verbs(preset('arthropod', 'sweeper').build)).toContain('dash');
    const s = preset('swimmer', 'hunter').build;
    expect([B.upkeep(s), B.swimSpeed(s)]).toEqual([1, 3]);
  });
  it('carried part × body × preset: never an illegal build, never a free passive, conflicts listed', () => {
    for (const body of PLAN_IDS) for (const id of Object.keys(PRESETS[body])) for (const part of PART_IDS) for (const place of B.homesOf(body, part)) {
      const { build, problems } = B.startBuild(body, PRESETS[body][id as never]!, { part, place });
      expect(B.anatomyProblems(body, build.rows)).toEqual([]);
      const defaults = BODIES[body].defaults.flatMap(([, r]) => r);
      for (const p of B.partsOf(build.rows)) expect(B.isStarterPart(p) || defaults.includes(p) || p === part, `${p} free`).toBe(true);
      if (!problems.length) expect(B.countedVerbs(build).length).toBeLessThanOrEqual(3);
    }
  });
  it('merges once, keeps Dash outside the ceiling, rejects a fourth verb and passives', () => {
    const leg = B.startBuild('arthropod', PRESETS.arthropod.sweeper!, { part: 'leg', place: 'limbs' }).build;
    expect([B.range(leg), B.upkeep(leg), leg.rows.limbs]).toEqual([3, 2, ['leg', 'rake']]);
    const three = B.startBuild('arthropod', { front: ['claw'], eyes: ['eye'], limbs: ['leg', 'digger'] });
    expect([three.problems, B.verbs(three.build).length]).toEqual([[], 4]);
    expect(B.startBuild('trilobite', PRESETS.trilobite.tank!, { part: 'compound', place: 'eyes' }).problems).toEqual([]);
    expect(B.startBuild('worm', PRESETS.worm.tank!, { part: 'eye', place: 'eyes' }).problems.join()).toMatch(/4 verbs/);
    expect(B.startBuild('arthropod', { limbs: ['leg'], sides: ['gill'] }).problems.join()).toMatch(/passive/);
    expect(B.startBuild('arthropod', {}).problems.join()).toMatch(/Limbs must hold walking/);
    expect(B.startBuild('worm', { eyes: ['eye'] }).build.rows.tail).toBeUndefined(); // dropping the bulb is a choice
    const hook = B.startBuild('worm', PRESETS.worm.tank!, { part: 'hook', place: 'front' }); // the upgrade keeps Crush
    expect([hook.problems, hook.build.rows.front, B.opensShells(hook.build)]).toEqual([[], ['hook'], true]);
    expect(B.startBuild('worm', PRESETS.worm.digger!, { part: 'pouch', place: 'tail' }).problems.join()).toMatch(/can't go in Tail/);
  });
});

describe('20A bonuses', () => {
  it('one copy per place, at the contract examples', () => {
    expect(B.range(B.defaultBuild('arthropod'))).toBe(3);
    expect(B.tunnel(build('worm', { sides: ['chaetae'] }))).toBe(4);
    expect(B.oxygenMax(build('worm', { sides: ['gill'] }))).toBe(5);
    expect(B.sense(build('arthropod', { eyes: ['compound'], limbs: ['leg'] }))).toBe(21);
    expect(B.verbs(build('arthropod', { eyes: ['compound'] }))).toEqual(['sense']);
    const gut = build('worm', { back: ['symbiont'], sides: ['gut'] });
    expect([B.foodOf(gut, 'mat'), B.foodOf(gut, 'bloom'), PREY.arthropod.food + B.mealBonus(gut)]).toEqual([7, 16, 12]);
    const pouch = build('worm', { sides: ['pouch'], tail: ['bulb'] }, 3);
    expect([B.clutch(pouch), B.upkeep(pouch)]).toEqual([6, 2]);
  });
  it('size never multiplies; the allowance goes with its row; deep overrides in mud', () => {
    const a = preset('arthropod', 'sweeper').build, big = { ...a, size: 5 };
    expect([B.upkeep(big), B.range(big)]).toEqual([B.upkeep(a), B.range(a)]);
    const torn = H.loseRow(a, 'limbs');
    expect([B.allowance(torn), B.upkeep(torn), B.range(torn), B.verbs(torn)]).toEqual([0, 1, 2, []]);
    const deep = build('worm', { eyes: ['eye'], tail: ['deep'] }, 3);
    expect([B.upkeep(deep, true), B.upkeep(deep), B.clutch(deep, true), B.verbs(deep)]).toEqual([0, 2, 4, ['sense', 'dig']]);
  });
});

describe('20A injury', () => {
  it('a strike lands on the side relative to facing, for four directions and four facings', () => {
    for (let f = 0; f < 4; f++) for (let d = 0; d < 4; d++) expect(H.sideOf(d, f)).toBe(['front', 'right', 'back', 'left'][(d - f + 4) % 4]);
  });
  it('guards cover their directions; bypass tears the guard; no row costs health', () => {
    const tank = preset('arthropod', 'tank').build; // claw, walking, spines on the sides
    for (const s of ['left', 'right'] as const) expect(H.strikeOn(tank, s)).toMatchObject({ kind: 'blocked', guard: 'spine', rest: 3 });
    expect(H.strikeOn(tank, 'front')).toMatchObject({ kind: 'hit', tear: 'front', damage: 0 });
    expect(H.strikeOn(tank, 'back')).toMatchObject({ kind: 'hit', tear: null, damage: 1 });
    expect(H.strikeOn(tank, 'back', { soft: true }).damage).toBe(2);
    expect(H.strikeOn(tank, 'left', { bypass: true })).toMatchObject({ kind: 'hit', tear: 'sides', damage: 0 });
    expect(H.strikeOn(B.defaultBuild('trilobite'), 'front')).toMatchObject({ kind: 'blocked', guard: 'shield', rest: 1 });
    expect(H.strikeOn(preset('trilobite', 'tank').build, 'front')).toMatchObject({ kind: 'blocked', rest: 3 });
    expect(H.strikeOn(build('worm', { tail: ['sclerite'] }), 'back')).toMatchObject({ kind: 'blocked', guard: 'sclerite' });
    expect(H.strikeOn(tank, 'front', { stayed: true }).kind).toBe('hit');
    expect(H.strikeOn(B.defaultBuild('trilobite'), 'left', { stayed: true }).kind).toBe('enrolled');
    expect(H.strikeOn(tank, 'front', { braced: true })).toMatchObject({ kind: 'blocked', rest: 3 });
    expect(H.strikeOn(tank, 'front', { dug: true }).kind).toBe('buried');
  });
  it('a tear takes the whole row, and every row can be lost', () => {
    let b = build('arthropod', { front: ['claw'], eyes: ['eye'], limbs: ['leg', 'rake'], sides: ['gill'], back: ['gut'], tail: ['enrol'] });
    const seen = new Set<PlaceId>();
    for (let k = 0; k < 12; k++) for (const s of ['front', 'left', 'back'] as const) {
      const h = H.strikeOn(b, s);
      if (h.tear) { seen.add(h.tear); b = H.loseRow(b, h.tear); }
    }
    expect([...seen].sort()).toEqual([...PLACES].sort());
    expect([B.partsOf(b.rows), b.lost?.length]).toEqual([[], 6]);
  });
  it('starvation sheds the newest row; nothing comes back; oxygen max drops with the gill', () => {
    let b = B.startBuild('arthropod', PRESETS.arthropod.digger!, { part: 'gill', place: 'sides' }).build;
    expect(b.order).toEqual(['limbs', 'sides', 'eyes']);
    const shed: PlaceId[] = [];
    for (let r = H.shed(b); r; r = H.shed(b)) { shed.push(r.place); b = r.build; if (r.place === 'sides') expect(B.oxygenMax(b)).toBe(3); }
    expect(shed).toEqual(['eyes', 'sides', 'limbs']);
    expect(B.partsOf(b.rows)).toEqual([]);
  });
});

describe('20A growth', () => {
  it('offers need a legal change; previews show losses; the ceiling holds', () => {
    const a = preset('arthropod', 'sweeper').build;
    const dig = B.changesFor(a, 'digger');
    expect(dig.map((c) => [c.place, c.row, c.lost, c.gained])).toEqual([['limbs', ['leg', 'digger'], ['graze'], ['dig']]]);
    expect(B.changesFor(a, 'leg')).toEqual([]); // a copy is never more power
    expect(B.changesFor(a, 'rake')).toEqual([]);
    const claw = build('arthropod', { front: ['claw'], limbs: ['leg'] });
    expect(B.changesFor(claw, 'rake').map((c) => [c.place, c.lost])).toEqual([['front', ['crush']], ['limbs', []]]);
    const tank = preset('worm', 'tank').build;
    expect(B.changesFor(tank, 'eye')).toEqual([]);
    expect(B.changesFor(tank, 'tentacles').map((c) => c.lost)).toEqual([['crush']]);
    expect(B.legalOffers(tank, common('worm'))).not.toContain('eye');
    expect(B.changesFor(B.defaultBuild('trilobite'), 'shield')).toEqual([]);
    expect(B.changesFor(build('swimmer', { front: ['spikes'], limbs: ['flap'] }), 'arms')).toEqual([]);
  });
  it('a torn row is repaired by its part at a moult, never for free', () => {
    const torn = H.loseRow(B.defaultBuild('arthropod'), 'limbs');
    expect(B.changesFor(torn, 'rake').map((c) => c.place)).toEqual(['front']);
    const fix = B.changesFor(torn, 'leg')[0];
    expect([fix.place, fix.build.lost, B.range(fix.build)]).toEqual(['limbs', undefined, 3]);
  });
  it('finish without a part; a rare counts only when it goes in', () => {
    const a = preset('arthropod', 'digger').build;
    expect(B.moultBuild(a, null)).toEqual({ build: { ...a, size: 2 }, rare: null });
    const up = B.moultBuild(a, B.changesFor(a, 'compound')[0]);
    expect([up.rare, up.build.rows.eyes, up.build.order.at(-1), B.verbs(up.build)]).toEqual(['compound', ['compound'], 'eyes', ['dash', 'dig', 'sense']]);
    expect(B.rareOffer(up.build, ['compound', 'progenesis'])).toBe('progenesis');
    expect(B.moultBuild({ ...a, size: 5 }, null).build.size).toBe(5);
  });
});

describe('20A saves and codes', () => {
  it('a lay snapshot keeps its size and torn rows through later injury, growth and a reload', () => {
    const b = H.loseRow({ ...preset('trilobite', 'tank').build, size: 3 }, 'limbs'), snap = H.snapshot(b), json = JSON.stringify(snap);
    H.loseRow(b, 'back'); B.moultBuild(b, null);
    expect(JSON.stringify(snap)).toBe(json);
    expect(Object.isFrozen(snap)).toBe(true);
    const back = H.parseBuild(JSON.parse(json))!;
    expect(back).toEqual(b);
    expect([back.rows.limbs, back.lost, back.size]).toEqual([undefined, ['limbs'], 3]);
  });
  it('malformed builds are rejected', () => {
    for (const x of [null, 'x', { body: 'worm', size: 1, rows: { front: ['claw'] }, order: ['front'] }, { body: 'worm', size: 1, rows: { tail: ['bulb'] }, order: [] },
      { body: 'fish', size: 1, rows: {}, order: [] }, { body: 'worm', size: 9, rows: {}, order: [] }]) expect(H.parseBuild(x)).toBeNull();
  });
  it('CLADE2- codes round-trip a starting design and reject anything else', () => {
    for (const body of PLAN_IDS) for (const rows of Object.values(PRESETS[body])) expect(H.decodeDesign(H.encodeDesign({ body, rows: rows! }))).toEqual({ body, rows });
    expect(H.decodeDesign(H.encodeDesign({ body: 'arthropod', rows: { limbs: ['leg'], sides: ['gill'] } }))).toBeNull(); // an adult build
    const code = H.encodeDesign({ body: 'worm', rows: PRESETS.worm.digger! });
    expect(H.decodeDesign(code.slice(0, -1) + (code.endsWith('a') ? 'b' : 'a'))).toBeNull();
    expect(H.decodeDesign('CLADE-abc-0000')).toBeNull();
  });
});

describe('20A continuation', () => {
  const t: H.Trait = { part: 'claw', patch: 3, line: 'arthropod/grazer', life: 1 };
  it('a positive result records the card or none; zero eggs keep it; a body change keeps it stored', () => {
    expect(H.nextTrait(t, 0, null)).toBe(t);
    expect(H.nextTrait(t, 5, null)).toBeNull();
    const gill: H.Trait = { ...t, part: 'gill' as PartId, life: 2 };
    expect(H.nextTrait(t, 5, gill)).toBe(gill);
    expect([H.traitFits(t, 'worm'), H.traitFits(t, 'trilobite')]).toEqual([false, true]);
  });
});
