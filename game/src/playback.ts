// Playing a turn's events back with feel: glides, bursts, floaters, the hunter's strike, the prey's flight. The rules
// already ran; this only shows them in order.
import { PARTS, VERBS, type VerbId } from './data/life';
import { PREY } from './data/prey';
import * as L from './sim/life';
import { CYAN, GOLD, NODE_RAMP, RED, S, centre, dirAngle, screen, turnTo } from './scene';
import { feel } from './ui/feel';
import { C, PAL } from './view/shade';
import { ease, tween, wait } from './view/tween';
import type { Wiwaxia } from './view/swimmer';

export async function bounce(time = 0.3) {
  await tween(S.you.stretch, { v: -1 }, time * 0.35, ease.quadOut);
  await tween(S.you.stretch, { v: 0 }, time * 0.65, ease.backOut);
}

async function glide(path: number[]) {
  const g = feel.glideTime, you = S.you;
  tween(you.moving, { v: 1 }, g * 0.5);
  tween(you.stretch, { v: 1 }, g * 0.45, ease.quadOut);
  for (let k = 0; k < path.length; k++) {
    const c = centre(path[k]), one = path.length === 1, e = one ? ease.sineInOut : k === 0 ? ease.sineIn : k === path.length - 1 ? ease.sineOut : ease.linear;
    await tween(you.head, { x: c.x, y: c.y }, g * (S.life.plan === 'swimmer' ? 0.8 : 1), e);
    S.floor.redrawNodes();
  }
  tween(you.moving, { v: S.life.plan === 'swimmer' ? 0.4 : 0 }, g * 2);
  await tween(you.stretch, { v: -0.65 }, g * 0.35, ease.quadOut);
  tween(you.stretch, { v: 0 }, g * 0.9, ease.backOut);
  await wait(g * 0.3);
}

async function lunge(dir: number) {
  const g = feel.glideTime, you = S.you, home = { ...you.head }, a = dirAngle(dir);
  tween(you.reach, { v: 1 }, g * 0.5, ease.quadOut);
  await tween(you.head, { x: home.x + Math.cos(a) * 5, y: home.y + Math.sin(a) * 5 }, g * 0.5, ease.quadOut);
  tween(you.reach, { v: 0 }, g * 0.6, ease.backOut);
  await tween(you.head, home, g * 0.6, ease.backOut);
}

export async function play(evs: L.Ev[]) {
  const { floor, fx, hud, marks, hunter, cam, life } = S, you = S.you;
  for (const e of evs) { // food eaten this turn stays drawn until its moment comes
    if (e.k === 'eat') floor.ghosts.set(e.i, e.node);
    if (e.k === 'rival' && e.ate) floor.ghosts.set(e.to, life.rivals[e.idx].eats);
    if (e.k === 'prey_ate') floor.ghosts.set(e.i, e.node);
  }
  floor.redrawNodes();
  const g = feel.glideTime;
  for (const e of evs) {
    switch (e.k) {
      case 'move': if (e.grab) await lunge(e.dir); else await glide(e.path); break;
      case 'eat': {
        floor.ghosts.delete(e.i); floor.redrawNodes();
        const c = centre(e.i), s = screen(c);
        fx.burst(c.x, c.y, NODE_RAMP[e.node], feel.particles);
        hud.floater(s.x, s.y, `+${e.gain}`, GOLD);
        hud.food.set(e.food);
        break;
      }
      case 'locked': { const s = screen(centre(e.i)); hud.floater(s.x, s.y, 'locked', RED); break; }
      case 'lay': {
        await bounce(g * 2);
        fx.clutch(you.head.x, you.head.y + 1, e.n);
        fx.burst(you.head.x, you.head.y, PAL.amber, feel.particles, 0.6);
        const s = screen(you.head); hud.floater(s.x, s.y, `+${e.n} eggs`, GOLD);
        hud.setEggs(e.eggs, L.tierOf(life.hab, e.eggs)); hud.food.set(e.food);
        break;
      }
      case 'stay': await bounce(g * 1.5); break;
      case 'upkeep': hud.food.set(e.food); break;
      case 'shed': {
        you.setBody(life.size, life.slots, life.soft);
        const s = screen(you.head); hud.floater(s.x, s.y, `−${PARTS[e.part].name.toLowerCase()}`, RED);
        break;
      }
      case 'hurt': hud.hp.set(e.health); you.flash.v = 1; tween(you.flash, { v: 0 }, 0.35); hud.flash(0.25); break;
      case 'oxygen': hud.oxy.set(e.oxygen); break;
      case 'rival': {
        const c = centre(e.to), rival = S.rival;
        tween(rival.moving, { v: 1 }, 0.1);
        tween(rival.head, { x: c.x, y: c.y }, g * 1.2, ease.sineInOut).then(() => {
          tween(rival.moving, { v: 0 }, 0.3);
          if (e.ate) { floor.ghosts.delete(e.to); floor.redrawNodes(); fx.burst(c.x, c.y, PAL.amber, Math.floor(feel.particles / 2)); }
        });
        break;
      }
      case 'pred_arrive': {
        const c = centre(e.at);
        hud.banner(`${life.hab.predator} arrives`, RED);
        Object.assign(hunter.pos, c); hunter.look.a = turnTo(0, Math.atan2(life.y * C - c.y, life.x * C - c.x));
        hunter.show.v = 0; hunter.lift.v = 40; marks.entry = -1;
        tween(hunter.show, { v: 1 }, 0.4);
        await tween(hunter.lift, { v: 12 }, 0.7, ease.backOut);
        break;
      }
      case 'pred_move': {
        const c = centre(e.to);
        tween(hunter.look, { a: turnTo(hunter.look.a, Math.atan2(c.y - hunter.pos.y, c.x - hunter.pos.x)) }, g * 0.5);
        tween(hunter.swim, { v: 1 }, 0.15);
        await tween(hunter.pos, { x: c.x, y: c.y }, g * 1.6, ease.sineInOut);
        tween(hunter.swim, { v: 0.4 }, 0.4);
        break;
      }
      case 'marks': {
        const d = (e.dir + 2) % 4;
        tween(hunter.look, { a: turnTo(hunter.look.a, dirAngle(d)) }, 0.2);
        marks.marks = e.marks; marks.markDir = e.dir; marks.from = { ...hunter.pos }; marks.pop.v = 0;
        tween(marks.pop, { v: 1 }, 0.22, ease.backOut);
        break;
      }
      case 'strike': await strike(e); break;
      case 'event': hud.banner(`${e.name}: ${e.text}`, '#ff8a3a'); floor.refresh(); break;
      case 'verb': await verbFx(e.verb, e.tiles); break;
      case 'grow': { const c = centre(e.i); floor.redrawNodes(); fx.burst(c.x, c.y, NODE_RAMP[e.node], 3, 0.3); break; }
      case 'catch': {
        const v = S.prey[e.idx], c = centre(e.i), s = screen(c);
        v.visible = false;
        fx.burst(c.x, c.y, PAL.flesh, feel.particles + 6, 1.3); cam.shake(0.35);
        hud.floater(s.x, s.y, `+${e.gain}`, GOLD); hud.food.set(e.food);
        if (life.frenzy > 1) hud.banner(`Frenzy ${life.frenzy}: +${life.frenzy} speed`, '#ff8a3a');
        break;
      }
      case 'prey': {
        const v = S.prey[e.idx], c = centre(e.to), p = life.prey[e.idx];
        if (e.hide) { v.visible = false; marks.burrows.add(e.to); fx.burst(c.x, c.y, PAL.mudSeen, 8, 0.7); break; }
        if (e.from === e.to) { v.visible = true; marks.burrows.delete(e.to); fx.burst(c.x, c.y, PAL.mudSeen, 6, 0.5); break; }
        if (p.alarmed) { const s = screen(v.body.head); hud.floater(s.x, s.y, '!', '#ffe033'); if (p.kind === 'wiwaxia') tween((v.body as Wiwaxia).spines, { v: 1 }, 0.2); }
        tween(v.body.moving, { v: 1 }, 0.1);
        tween(v.body.head, { x: c.x, y: c.y }, g * (p.alarmed ? 1 : 1.4), ease.sineInOut).then(() => tween(v.body.moving, { v: 0 }, 0.3));
        break;
      }
      case 'prey_ate': { const c = centre(e.i); floor.ghosts.delete(e.i); floor.redrawNodes(); fx.burst(c.x, c.y, NODE_RAMP[e.node], 4, 0.5); break; }
      case 'prey_back': {
        const v = S.prey[e.idx], c = centre(e.at);
        v.body.place(c.x, c.y, Math.PI / 2); v.visible = true; fx.burst(c.x, c.y, PAL.pale, 6, 0.6);
        const s = screen(c); hud.floater(s.x, s.y, PREY[life.prey[e.idx].kind].name, CYAN);
        break;
      }
      case 'over': break;
    }
  }
  await wait(0.05 + (evs.some((e) => e.k === 'prey') ? g : 0));
}

async function verbFx(v: VerbId, tiles: number[]) {
  const { fx, hud, cam, floor } = S, h = S.you.head, s = screen(h), g = feel.glideTime;
  hud.floater(s.x, s.y - 10, VERBS[v].name, CYAN);
  if (v === 'graze') { await bounce(g * 1.5); for (const i of tiles) { const c = centre(i); fx.burst((c.x + h.x) / 2, (c.y + h.y) / 2, PAL.leaf, 3, 0.4); } }
  else if (v === 'dash') { fx.burst(h.x, h.y, PAL.pale, feel.particles, 1.4); await bounce(g); }
  else if (v === 'dig') { fx.burst(h.x, h.y, PAL.mudSeen, feel.particles, 0.9); floor.refresh(); await tween(S.you.stretch, { v: -1 }, g, ease.quadOut); tween(S.you.stretch, { v: 0 }, g * 2, ease.backOut); }
  else if (v === 'sense') { fx.ring(h.x, h.y, 5 * C, PAL.gill[4]); floor.refresh(); await wait(g * 2); }
  else if (v === 'brace') { fx.ring(h.x, h.y, C * 0.8, PAL.pale[4]); await bounce(g * 2); }
  else if (v === 'crush' && tiles.length) { const c = centre(tiles[0]); await lunge(Math.abs(c.x - h.x) > Math.abs(c.y - h.y) ? (c.x > h.x ? 1 : 3) : c.y > h.y ? 2 : 0); fx.burst(c.x, c.y, PAL.shell, feel.particles, 1.2); cam.shake(0.25); }
}

async function strike(e: Extract<L.Ev, { k: 'strike' }>) {
  const { hunter, marks, cam, fx, hud, life } = S, you = S.you;
  const g = feel.glideTime, home = { ...hunter.pos }, c = centre(e.at), goal = { x: home.x + (c.x - home.x) * 0.7, y: home.y + (c.y - home.y) * 0.7 };
  tween(hunter.grab, { v: 1 }, g * 0.6);
  await tween(hunter.pos, { x: home.x - (goal.x - home.x) * 0.15, y: home.y - (goal.y - home.y) * 0.15 }, g * 0.8, ease.quadOut);
  tween(hunter.lift, { v: 2 }, g * 0.5);
  await tween(hunter.pos, goal, g * 0.55, ease.expoIn);
  marks.marks = [];
  tween(hunter.pos, home, g * 1.4, ease.quadOut);
  tween(hunter.lift, { v: 12 }, g * 1.6, ease.quadOut);
  tween(hunter.grab, { v: 0 }, g * 1.6);
  const s = screen(you.head), h = you.head;
  if (e.kind === 'hit') {
    cam.shake(1); you.flash.v = 1; tween(you.flash, { v: 0 }, 0.4); hud.flash(0.35);
    fx.burst(h.x, h.y, PAL.hunter, feel.particles, 1.3);
    hud.hp.set(e.health);
    you.setBody(life.size, life.slots, life.soft);
    hud.floater(s.x, s.y, e.part ? `−${PARTS[e.part].name.toLowerCase()}` : `−${e.damage} health`, RED);
  } else if (e.kind === 'blocked') {
    cam.shake(0.55); fx.burst(h.x, h.y, PAL.pale, feel.particles, 1.1); hud.floater(s.x, s.y, 'blocked', '#d2dccf');
  } else if (e.kind === 'enrolled') {
    cam.shake(0.4); fx.burst(h.x, h.y, PAL.amber, feel.particles, 0.9); hud.floater(s.x, s.y, 'rolled up', '#ffd34a');
  } else if (e.kind === 'buried') {
    cam.shake(0.3); fx.burst(c.x, c.y, PAL.mudSeen, Math.ceil(feel.particles / 2), 0.8); hud.floater(s.x, s.y, 'buried', '#c9a26a');
  } else { cam.shake(0.3); hud.floater(s.x, s.y, 'miss', '#9fb2bd'); }
  await wait(g * 1.2);
}
