// Slice 20B: the equipment view's drawing. One small Pixi app: the creature large, heading up, walking on the spot,
// and the same build at board size on a tile beside it. Rings mark the chosen place or a part's legal places. The
// screen owns it; `destroy` releases the GPU resources when the view closes.
import { AlphaFilter, Application, Container, Graphics } from 'pixi.js';
import type { PlaceId } from '../data/body';
import type { Build } from '../sim/body';
import { Body } from './body';
import { C, PAL } from './shade';

export interface EquipStage {
  setBuild(b: Build): void;
  mark(on: PlaceId | null, legal: PlaceId[]): void;
  destroy(): void;
}

export async function makeEquipStage(host: HTMLElement, build: Build, pixel: number): Promise<EquipStage> {
  const app = new Application();
  await app.init({ antialias: false, backgroundAlpha: 0, resolution: 1 / pixel, autoDensity: true, resizeTo: host, preference: 'webgl' });
  host.appendChild(app.canvas);
  const big = new Body(build), small = new Body(build), bigC = new Container(), smallC = new Container();
  const shadow = new Graphics(), g = new Graphics(), rings = new Graphics(), tile = new Graphics(), sShadow = new Graphics(), sg = new Graphics();
  const shadows = new Container(); shadows.addChild(shadow); shadows.filters = [new AlphaFilter({ alpha: 0.3 })];
  const sShadows = new Container(); sShadows.addChild(sShadow); sShadows.filters = [new AlphaFilter({ alpha: 0.3 })];
  bigC.addChild(shadows, g, rings); smallC.addChild(tile, sShadows, sg);
  app.stage.addChild(bigC, smallC);
  big.treadmill = 2.2; big.moving.v = 0.6; small.moving.v = 0.6;
  let on: PlaceId | null = null, legal: PlaceId[] = [], k = 1, a = 0;
  const lap = 0.2 * C; // the board-size one walks a slow circle on its tile, so every heading shows
  small.place(lap, 0, Math.PI / 2);

  /** Fit the large creature: its length plus tools ahead and a tail behind, in about 70% of the height. */
  function layout() {
    const w = app.screen.width, h = app.screen.height, L = big.L + big.u() * 4.5, R = big.R * 2 + big.u() * 5;
    k = Math.max(1, Math.min((h * 0.72) / L, (w * 0.62) / R));
    bigC.scale.set(k); bigC.position.set(w / 2, h / 2 - (big.L / 2 - big.u() * 0.6) * k);
    const sk = 2; // about the board's zoom on a phone
    smallC.scale.set(sk); smallC.position.set(w - C * 1.25 * sk - 4, h - C * 1.25 * sk - 4);
    tile.clear().rect(-C * 1.25, -C * 1.25, C * 2.5, C * 2.5).fill(PAL.sand[1]).stroke({ width: 1, color: PAL.ink });
  }
  big.place(0, 0, -Math.PI / 2);
  layout();
  app.renderer.on('resize', layout);

  app.ticker.add((t) => {
    const dt = Math.min(0.05, t.deltaMS / 1000);
    a += dt * 0.7; small.head.x = Math.cos(a) * lap; small.head.y = Math.sin(a) * lap;
    big.update(dt); small.update(dt);
    shadow.clear(); g.clear(); sShadow.clear(); sg.clear(); rings.clear();
    big.draw(g, shadow); small.draw(sg, sShadow);
    const ring = (p: PlaceId, color: number, r: number) => { const [x, y] = big.placeAt(p); rings.circle(x, y, r).stroke({ width: 2 / k, color }); };
    for (const p of legal) ring(p, 0x7fd14e, big.u() * 0.9);
    if (on) ring(on, PAL.gold, big.u() * 1.1);
  });

  return {
    setBuild(b) { big.setBuild(b); small.setBuild(b); big.place(0, 0, -Math.PI / 2); small.place(small.head.x, small.head.y, small.heading); layout(); },
    mark(p, l) { on = p; legal = l; },
    destroy() { app.renderer.off('resize', layout); app.destroy({ removeView: true }, { children: true }); },
  };
}
