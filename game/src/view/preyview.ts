// The prey's bodies on the board (slice 11): worms and trilobites reuse the grazers' drawings in their own colours.
import type { PreyKind } from '../data/prey';
import { Arthropod } from './arthropod';
import { PAL } from './shade';
import { Wiwaxia } from './swimmer';
import { Worm, type BodySlot, type Creature } from './worm';

const TRILO = [0x3a3326, 0x5c4e36, 0x86734f, 0xb09a6c, 0xd8c493];
const SHIELD: BodySlot[] = [{ kind: 'head', side: 'front', seg: -1, part: 'shield' }, { kind: 'head', side: 'front', seg: -1, part: 'eye' }];

export function preyBody(kind: PreyKind): Creature {
  if (kind === 'worm') { const w = new Worm(PAL.rival, true, 0.85); w.setBody(2, [], false); return w; }
  if (kind === 'trilobite') { const a = new Arthropod(TRILO, 0.9); a.setBody(2, SHIELD, false); return a; }
  return new Wiwaxia();
}
