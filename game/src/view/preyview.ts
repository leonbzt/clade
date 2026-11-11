// The bodies of residents and prey on the board: a line's representative snapshot when the sea knows one, else the
// body's defaults at size 2. Wiwaxia keeps its own drawing.
import type { PreyKind } from '../data/prey';
import { defaultBuild, type Build } from '../sim/body';
import { Body, type Creature } from './body';
import { PAL } from './shade';
import { Wiwaxia } from './wiwaxia';

export function preyBody(kind: PreyKind, build?: Build): Creature {
  if (kind === 'wiwaxia') return new Wiwaxia();
  return new Body(build?.body === kind ? build : { ...defaultBuild(kind), size: 2 }, PAL.rival);
}
