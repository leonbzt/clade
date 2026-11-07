import { describe, expect, it } from 'vitest';
import { HABITATS, NO_PREDATOR } from '../src/data/habitats';
import { PARTS, PLAN_IDS, TURNS } from '../src/data/life';
import { lineId } from '../src/data/sea';
import { boardFacts, boardForPatch } from '../src/sim/door';
import { feeding } from '../src/sim/feeding';
import { preyStep, swimMove } from '../src/sim/hunt';
import * as L from '../src/sim/life';
import { release, step } from '../src/sim/sea';
import { canLaunch, completeLife, launchBodies, launchPatches, settlePending, startSeaLife } from '../src/sim/sea-life';
import { freshSeaSave, parseSeaSave, serializeSeaSave, type SeaSave } from '../src/sim/sea-save';
import { importSeaSave, writeSeaSave } from '../src/sim/sea-storage';
import { decode, designProblem, designVerbs, encode } from '../src/sim/share';
import { useVerb } from '../src/sim/verbs';

const reload = (s: SeaSave) => parseSeaSave(serializeSeaSave(s)).save!;
const population = (s: SeaSave) => s.sea.patches.reduce((n, p) => n + p.pop.reduce((a, b) => a + b, 0), 0);
function finish(s: SeaSave, patch: number, eggs = true) {
  const l = startSeaLife(s, 4, patch, 'worm', ['dig', 'sense']);
  l.turn = TURNS; l.food = 100; l.size = 3;
  if (eggs) L.lay(l); else L.stay(l);
  expect(l.phase).toBe('over');
  return { life: l, pending: completeLife(s, l, 9) };
}

describe('patch snapshots', () => {
  it('can found empty mud patches on three seeds through ordinary food, moulting and laying', () => {
    const eggs: number[] = [];
    for (const seed of [1, 2, 3]) {
      const s = freshSeaSave(seed, 0), patch = s.sea.patches.find((p) => p.ground === 'mud')!.id;
      const l = startSeaLife(s, seed, patch, 'worm', ['dig', 'sense']);
      for (let turn = 0; turn < TURNS && l.phase !== 'over'; turn++) {
        if (l.size < 3 && L.canMoult(l)) {
          L.moult(l);
          const pick = [...l.offers].sort((a, b) => PARTS[a].upkeep - PARTS[b].upkeep || a.localeCompare(b))[0];
          L.pick(l, pick);
        }
        if (L.canLay(l) && l.food >= 4 + L.upkeep(l) + 2) { L.lay(l); continue; }
        const nearby = l.tiles.reduce((n, t, i) => n + (t.node === 'buried' && L.dist(l.x, l.y, ...L.xy(i)) <= 1 ? 1 : 0), 0);
        if (nearby >= 2 && L.ready(l, 'dig') && !L.airless(l)) { useVerb(l, 'dig'); continue; }
        const score = (i: number) => {
          const t = l.tiles[i], [x, y] = L.xy(i);
          const gain = t.node && !L.lockOf(l, t.node) ? L.foodOf(l, t.node) : 0;
          const nearest = Math.min(...l.tiles.flatMap((q, j) => q.node && !L.lockOf(l, q.node) ? [L.dist(x, y, ...L.xy(j))] : []));
          return gain - nearest * 0.1 - (L.airless(l, x, y) ? 30 : 0);
        };
        const moves = [...L.dests(l).keys()].sort((a, b) => score(b) - score(a) || a - b);
        if (moves.length) L.move(l, moves[0]); else L.stay(l);
      }
      expect(l.eggs, `seed ${seed}, diet ${JSON.stringify(l.ate)}`).toBeGreaterThan(0);
      eggs.push(l.eggs);
    }
    expect(eggs).toHaveLength(3);
  });

  it('starts without invented animals and keeps depleted food honest outside the bounded start refuge', () => {
    const s = freshSeaSave(1, 0);
    for (const ground of ['mud', 'sand', 'rock'] as const) {
      const p = s.sea.patches.find((p) => p.ground === ground)!;
      const full = boardForPatch(s.sea, p.id);
      expect(full.prey).toEqual([]); expect(full.rivals).toEqual([]); expect(full.predatorAt).toBe(NO_PREDATOR);
      p.mats = 0; p.rot = 0; p.oxygen = 0;
      const depleted = boardForPatch(s.sea, p.id);
      expect(boardFacts(depleted).mats).toBeLessThan(boardFacts(full).mats);
      expect(boardFacts(depleted).carcasses).toBe(0);
      expect(depleted.stocks).toEqual({ mats: 0, rot: 0, oxygen: 0 });
      const l = L.newLife(1, 'swimmer', depleted);
      expect(L.airless(l)).toBe(true);
      for (let t = 0; t < 30; t++) { l.turn = t; preyStep(l); }
      expect(l.prey).toEqual([]);
    }
  });

  it('keeps body/species names distinct through prey, rivals, respawns and world changes', () => {
    const s = freshSeaSave(2, 0), p = s.sea.patches[0];
    release(s.sea, p.id, 'arthropod', 'grazer', 18, ['rake']);
    release(s.sea, p.id, 'trilobite', 'grazer', 12, ['rake']);
    const board = boardForPatch(s.sea, p.id), snapshot = JSON.stringify(board);
    expect(new Set(board.prey.map((p) => p.kind))).toEqual(new Set(['arthropod', 'trilobite']));
    expect(board.rivals[0]).toMatchObject({ kind: 'arthropod', species: lineId('arthropod', 'grazer'), name: 'Your arthropods' });
    const l = L.newLife(1, 'swimmer', board);
    l.prey.forEach((p) => { p.alive = false; p.back = 0; });
    preyStep(l);
    expect(l.prey.every((p) => p.alive && p.name === (p.kind === 'arthropod' ? 'Your arthropods' : 'Your trilobites'))).toBe(true);
    for (const p of s.sea.patches) p.pop.fill(0);
    step(s.sea);
    expect(JSON.stringify(board)).toBe(snapshot);
    expect(boardForPatch(s.sea, p.id).prey).toEqual([]);
    board.start[0] = 7;
    expect(HABITATS[p.ground].start[0]).not.toBe(7);
  });

  it('uses inherited tools rather than diet labels for feeding and threats', () => {
    const s = freshSeaSave(3, 0), p = s.sea.patches[0];
    release(s.sea, p.id, 'worm', 'predator', 30, ['proboscis'], { carcass: 42 });
    expect(boardForPatch(s.sea, p.id)).toMatchObject({ predatorAt: NO_PREDATOR, rivals: [{ kind: 'worm', eats: 'carcass' }] });
    const k = s.sea.species.findIndex((sp) => sp.id === lineId('worm', 'predator'));
    expect(s.sea.species[k].diet).toEqual({ carcass: 42 });
    expect(feeding(['proboscis'])).toMatchObject({ rot: 1, hunt: 0, dig: false });
    expect(feeding(['tentacles', 'bulb'])).toMatchObject({ mats: 0.5, rot: 0.5, hunt: 0, dig: true });
    release(s.sea, p.id, 'swimmer', 'grazer', 12, ['arms']);
    expect(boardForPatch(s.sea, p.id).hunter?.species).toBe(lineId('swimmer', 'grazer'));
    expect(boardForPatch(s.sea, p.id).hunter?.parts).toEqual(['arms']);
    const empty = freshSeaSave(3, 0);
    step(empty.sea); step(s.sea);
    expect(p.rot).toBeLessThan(empty.sea.patches[p.id].rot);
    release(s.sea, p.id, 'worm', 'predator', 1, ['tentacles']);
    expect(s.sea.species[k].parts).toEqual(['proboscis']);
    expect(reload(s).sea.species[k]).toEqual(s.sea.species[k]);
  });

  it('requires a capture part to catch live prey', () => {
    for (const parts of [[], ['arms'], ['spikes']] as const) {
      const l = L.newLife(1, 'swimmer', HABITATS.mud, [...parts]);
      const p = l.prey[0], i = L.at(p.x, p.y);
      swimMove(l, { i, dir: 1, grab: false, path: [i] });
      expect(p.alive).toBe(parts.length === 0);
    }
  });
});

describe('completed results and continuation', () => {
  it('round-trips a real terminal lay before playback and settles once after reload', () => {
    const s = freshSeaSave(1, 0), { life, pending } = finish(s, 0);
    expect(pending.eggs).toBe(life.eggs); expect(pending.eggs).toBeGreaterThan(0);
    expect(population(s)).toBe(0); expect(s.continuation?.patch).toBe(0);
    expect(canLaunch(s, 0, 'worm')).toBe(false);
    expect(completeLife(s, life, 999)).toBe(pending); // don't reroll recovered cards
    const recovered = reload(s), oldPending = recovered.pending!;
    expect(oldPending).toEqual(pending);
    expect(settlePending(recovered, oldPending, 0)).toBe(true);
    expect(population(recovered)).toBeGreaterThan(0);
    expect(recovered.lives).toBe(1);
    const once = serializeSeaSave(recovered);
    expect(settlePending(recovered, oldPending, 0)).toBe(false);
    expect(serializeSeaSave(recovered)).toBe(once);
    expect(reload(recovered).pending).toBeUndefined();
    const next = reload(recovered), before = serializeSeaSave(next);
    startSeaLife(next, 5, 0, 'worm', ['dig']);
    expect(serializeSeaSave(next)).toBe(before); // starting never spends or releases eggs
  });

  it('keeps the last successful clutch through failure, extinction and reload; adjacent success moves it', () => {
    const s = freshSeaSave(2, 0);
    expect(launchBodies(s)).toEqual(['worm']);
    expect(() => startSeaLife(s, 1, 0, 'swimmer', [])).toThrow();
    settlePending(s, finish(s, 0, false).pending);
    expect(s.continuation).toBeUndefined(); expect(canLaunch(s, 0, 'worm')).toBe(true);
    settlePending(s, finish(s, 0).pending);
    expect(launchBodies(s)).toEqual(PLAN_IDS);
    const previous = { ...s.continuation! }, adjacent = s.sea.patches[0].nb[0];
    expect(launchPatches(s)).toEqual([0, ...s.sea.patches[0].nb]);
    const distant = s.sea.patches.find((p) => !launchPatches(s).includes(p.id))!.id;
    release(s.sea, distant, 'worm', 'burrower', 40);
    expect(canLaunch(s, distant, 'worm')).toBe(false);
    settlePending(s, finish(s, adjacent, false).pending);
    expect(s.continuation).toEqual(previous);
    for (const p of s.sea.patches) p.pop.fill(0);
    const loaded = reload(s);
    expect(canLaunch(loaded, 0, 'swimmer')).toBe(true);
    settlePending(loaded, finish(loaded, adjacent).pending);
    expect(loaded.continuation?.patch).toBe(adjacent);
    expect(launchPatches(loaded)).toEqual([adjacent, ...loaded.sea.patches[adjacent].nb]);
  });

  it('inherits the laid build even after the parent loses parts', () => {
    const s = freshSeaSave(1, 0), l = startSeaLife(s, 3, 0, 'worm', ['dig', 'crush']);
    l.food = 100; l.size = 3; L.lay(l);
    const parts = [...l.eggParts!];
    l.slots.forEach((slot) => { slot.part = null; }); l.order = []; l.phase = 'over'; l.cause = 'died';
    const p = completeLife(s, l, 1);
    expect(p.parts).toEqual(parts); expect(p.eggs).toBeGreaterThan(0);
    settlePending(s, p);
    expect(s.sea.species.find((sp) => sp.id === p.species)?.parts).toEqual(parts);
  });
});

describe('storage and design sharing', () => {
  it('recovers an unsaved settlement from the stored pending snapshot without duplicating eggs', () => {
    const s = freshSeaSave(1, 0); finish(s, 0);
    let stored = ''; expect(writeSeaSave(s, (json) => { stored = json; })).toBeNull();
    settlePending(s, s.pending!);
    expect(writeSeaSave(s, () => { throw new Error('quota'); })).toContain('could not be saved');
    const restored = parseSeaSave(stored).save!;
    settlePending(restored, restored.pending!);
    expect(JSON.parse(serializeSeaSave(restored))).toEqual(JSON.parse(serializeSeaSave(s)));
    expect(writeSeaSave(s, (json) => { stored = json; })).toBeNull();
    expect(parseSeaSave(stored).save!.lives).toBe(1);
  });

  it('does not write invalid/newer imports or accept imports whose write fails', () => {
    const s = freshSeaSave(1, 0); let stored = serializeSeaSave(s), writes = 0;
    const write = (json: string) => { writes++; stored = json; };
    for (const text of ['bad', '{"v":4}', '{"v":3}', '{"v":2}']) expect(importSeaSave(text, write).save).toBeNull();
    expect(writes).toBe(0); expect(stored).toBe(serializeSeaSave(s));
    expect(importSeaSave(serializeSeaSave(freshSeaSave(2, 0)), () => { throw new Error('quota'); }).save).toBeNull();
    expect(importSeaSave(stored, write).save?.v).toBe(3);
    const raw = JSON.parse(stored); raw.sea.species[0].parts = ['arms']; raw.sea.species[0].plan = 'worm';
    expect(parseSeaSave(JSON.stringify(raw)).problem).toBe('broken');
  });

  it('uses old codes as fitting creature designs without granting their score or location', () => {
    const s = freshSeaSave(1, 0), before = serializeSeaSave(s);
    const design = decode(encode({ plan: 'swimmer', role: 'predator', hab: 'sand', eggs: 200, verbs: [], name: 'Kim' }))!;
    expect(designProblem(design)).toBeNull();
    expect(canLaunch(s, 0, design.plan)).toBe(false);
    expect(serializeSeaSave(s)).toBe(before);
    settlePending(s, finish(s, 0).pending);
    const after = serializeSeaSave(s);
    const l = startSeaLife(s, 1, 0, design.plan, design.verbs, design.form);
    expect(l.eggs).toBe(0); expect(l.prey.every((p) => p.kind === 'worm')).toBe(true);
    expect(serializeSeaSave(s)).toBe(after);
    expect(designProblem({ ...design, form: 'deep' })).not.toBeNull();
    const verbs = designVerbs('worm', ['bulb', 'eye', 'proboscis'], 'tentacles');
    expect(designProblem({ ...design, plan: 'worm', form: 'tentacles', verbs })).toBeNull();
  });
});
