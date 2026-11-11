// Slice 20D: the part icons, 6×6 pixels, ported from the lifev2 toy (`toys/life2-view.ts`) plus the eight newer parts.
// One letter per pixel, '.' is empty; rows split by '|'. Final art is step 9.
import type { PartId } from './life';

const INK: Record<string, string> = {
  r: '#cc311f', o: '#ff8a1e', y: '#ffe14a', g: '#6cc644', b: '#5ccbe8', s: '#94a3a8', e: '#937154', p: '#f59be0',
  w: '#eef2ee', k: '#05090b',
};

export const ICONS: Record<PartId | 'lock', string> = {
  claw: 'r..r..|rr.rr.|.rrr..|..r...|..r...|......',
  shield: '.ssss.|ssssss|ssssss|.ssss.|..ss..|......',
  eye: '.wwww.|wwkkww|wwkkww|.wwww.|......|......',
  compound: 'p.p.p.|.p.p.p|p.p.p.|.p.p.p|p.p.p.|......',
  spine: '..s...|..s...|.sss..|.sss..|sssss.|......',
  sclerite: 'ss.ss.|ss.ss.|......|ss.ss.|ss.ss.|......',
  leg: '..ee..|.ee...|ee....|.ee...|..ee..|...e..',
  digger: 'ee....|.ee...|..ee..|.eeee.|.eeee.|..ee..',
  rake: 'eeeeee|.e.e.e|.e.e.e|.e.e.e|......|......',
  chaetae: 's.s.s.|s.s.s.|.s.s.s|.s.s.s|s.s.s.|......',
  gill: 'b.b.b.|bbbbb.|b.b.b.|bbbbb.|b.b.b.|......',
  gut: '.oooo.|oooooo|oooooo|oooooo|.oooo.|......',
  pouch: 'yy.yy.|yy.yy.|......|.yy...|.yy...|......',
  arms: 'o...o.|oo.oo.|.o.o..|.o.o..|..o...|......',
  spikes: '.r.r..|rrrrr.|....r.|.r.rr.|..rr..|......',
  lenses: 'pp.pp.|pp.pp.|.s..s.|.s..s.|..ss..|......',
  flap: 'bb....|bbbb..|bbbbbb|bbbb..|bb....|......',
  fan: 'b...b.|bb.bb.|.bbb..|..b...|..b...|......',
  proboscis: '....o.|...oo.|..oo..|.oo...|oo....|......',
  tentacles: 'g..g..|.g..g.|.g..g.|g..g..|g..g..|.g..g.',
  bulb: '.eee..|eeeee.|eeeee.|.eee..|..e...|..e...',
  hook: 'p...p.|.o.o..|..o...|.o....|o.....|......',
  enrol: '.pppp.|p....p|p.pp.p|p....p|.pppp.|......',
  deep: '..p...|..p...|..p...|ppppp.|.ppp..|..p...',
  blood: '..p...|.ppp..|.ppp..|ppppp.|ppppp.|.ppp..',
  symbiont: 'p...p.|..y...|.p.p..|...y..|p...p.|..y...',
  progenesis: '......|..p...|.ppp..|..p...|.p.p..|......',
  lock: '.sss..|.s.s..|sssss.|ss.ss.|sssss.|......',
};

/** An icon's pixels as [x, y, colour]. */
export const pixels = (id: PartId | 'lock'): [number, number, string][] =>
  ICONS[id].split('|').flatMap((row, y) => [...row].flatMap((c, x) => (c === '.' ? [] : [[x, y, INK[c]] as [number, number, string]])));
