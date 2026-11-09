// The Life's rules: the stack test's checks (both halves ran these).
import { describe, expect, it } from 'vitest';
import { PLACES, type Rows } from '../src/data/body';
import { PLAN_IDS, RULE, TURNS, type PlanId } from '../src/data/life';
import * as L from '../src/sim/life';
import { partsOf, type Build } from '../src/sim/body';
import { MUD_FLATS } from '../src/data/habitats';

/** Coordinates in the toy's 11 x 8 map; the spike's board is that map turned a quarter (x and y swapped). */
const T = (x: number, y: number) => L.at(y, x);
const parts = (l: L.Life) => partsOf(l.build.rows);
const build = (body: PlanId, rows: Rows): Build => ({ body, size: 1, rows, order: PLACES.filter((p) => rows[p]) });
/** The stack test's worm: a gut gland on the sides, sclerites on the tail (tail installed last). */
const WORM = build('worm', { sides: ['gut'], tail: ['sclerite'] });

describe('the starting build', () => {
  it('every body has a legal preset; a Life refuses another body or an illegal build', () => {
    for (const plan of PLAN_IDS) expect(L.newLife(1, plan).build.body).toBe(plan);
    expect(() => L.newLife(1, 'worm', undefined, L.presetBuild('arthropod'))).toThrow();
    expect(() => L.newLife(1, 'worm', undefined, build('worm', { limbs: ['chaetae'] }))).toThrow();
  });
});

describe('the mud flats Life', () => {
  it('starts with the fixed body', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    expect([l.x, l.y, L.size(l), l.food]).toEqual([3, 1, 1, RULE.startFood]);
    expect(parts(l).sort()).toEqual(['gut', 'sclerite']);
    expect(L.upkeep(l)).toBe(2);
    expect(l.rivals.length).toBe(1);
    expect(l.pred).toBeNull();
  });

  it('crawls on sand and tunnels through mud', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    let ds = L.dests(l);
    expect(ds.has(T(2, 3)) && ds.has(T(0, 3)) && ds.has(T(1, 2))).toBe(true);
    expect(ds.has(T(1, 4))).toBe(false); // rock blocks
    expect(ds.has(T(3, 3))).toBe(false); // no 2-tile move on sand
    L.move(l, T(2, 3));
    ds = L.dests(l);
    expect(ds.get(T(4, 2))?.path.length).toBe(3); // around corners
    expect(ds.has(T(5, 2))).toBe(false); // the tunnel stops at rock
  });

  it('eats, and locks what it cannot eat', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    L.move(l, T(2, 3));
    L.move(l, T(3, 3));
    const eats = l.events.filter((e) => e.k === 'eat');
    expect(eats.length === 1 && eats[0].k === 'eat' && eats[0].gain).toBe(8); // 6 + 2 from the gut gland
    expect(l.food).toBe(RULE.startFood - 2 + 8 - 2);
    expect(l.tiles[T(3, 3)].node).toBeNull();
    l.x = 4; l.y = 6; // next to the carcass
    L.move(l, T(7, 4));
    expect(l.events.some((e) => e.k === 'locked')).toBe(true);
  });

  it('moults, picks a part and lays', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    l.food = 40;
    expect(L.canLay(l)).toBe(false);
    expect(L.moultCost(l)).toBe(3);
    L.moult(l);
    expect([L.size(l), l.phase]).toEqual([2, 'offer']);
    expect(l.offers.length).toBeGreaterThanOrEqual(3);
    expect(L.canMoult(l)).toBe(false); // one moult a turn
    const part = l.offers[0];
    L.pick(l, part);
    expect(l.phase).toBe('play');
    expect(L.has(l, part)).toBe(true);
    L.stay(l);
    L.moult(l);
    L.pick(l, l.offers[0]);
    expect(L.size(l) === 3 && L.canLay(l)).toBe(true);
    const before = l.food, n = L.clutch(l);
    L.lay(l);
    expect(l.eggs).toBe(n);
    expect(l.laid).toEqual(l.build); // the lay snapshot
    expect(l.food).toBe(before - RULE.layCost - L.upkeep(l));
  });

  it('starves: sheds the newest row, then loses health', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    l.food = 0; L.stay(l);
    expect(parts(l)).toEqual(['gut']);
    l.food = 0; L.stay(l);
    l.food = 0; L.stay(l);
    expect(l.health).toBe(2);
  });

  it('the hunter arrives, marks, strikes and rests', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    l.food = 99;
    for (let k = 0; k < 5; k++) L.stay(l);
    expect(l.turn).toBe(6);
    expect([l.pred?.x, l.pred?.y]).toEqual([1, 10]);
    l.x = 3; l.y = 0; l.facing = 2;
    Object.assign(l.pred!, { x: 1, y: 1, lx: 3, ly: 0 });
    L.stay(l);
    expect(l.pred!.state).toBe('strike');
    expect(l.pred!.marks).toContain(T(0, 3));
    expect(l.events.some((e) => e.k === 'marks')).toBe(true);
    L.stay(l);
    const st = l.events.filter((e) => e.k === 'strike');
    expect(st.length === 1 && st[0].k === 'strike' && st[0].kind === 'hit' && [st[0].kind, st[0].tear]).toEqual(['hit', 'sides']);
    expect([l.health, parts(l)]).toEqual([2, ['sclerite']]); // the tear takes the gut row and still costs health
    expect(l.pred!.state).toBe('rest');
    L.stay(l);
    expect(l.pred!.state).toBe('hunt');
  });

  it('mud hides you; guards block by side', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    expect(L.hitOn(l, 2, 2, 3, 2).kind).toBe('buried');
    expect(L.hitOn(l, 2, 0, 3, 1).kind).toBe('blocked'); // sclerites on the tail, a strike from behind
    const h = L.hitOn(l, 1, 2, 3, 1); // from the east while facing south: your left side
    expect([h.kind, h.part]).toEqual(['hit', 'gut']);
  });

  it('the mudslide takes oxygen in mud', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    l.food = 99;
    L.move(l, T(2, 3));
    while (l.turn < 12) L.stay(l);
    const ox = l.oxygen;
    L.stay(l);
    expect(l.oxygen).toBe(ox - 1);
  });

  it('a season ends after 20 turns', () => {
    const l = L.newLife(7, 'worm', MUD_FLATS, WORM);
    l.food = 999;
    L.move(l, T(2, 3));
    l.x = 5; l.y = 4; // deep in the mud field
    while (l.phase === 'play' && l.turn < 12) L.stay(l);
    expect(l.phase).toBe('play'); // buried, you outlast the hunter
    while (l.phase === 'play') L.stay(l);
    expect([l.phase, l.turn]).toEqual(['over', TURNS]);
    expect(L.tierOf(l.hab, 26)).toBe('B');
    expect(L.tierOf(l.hab, 0)).toBe('F');
  });
});
