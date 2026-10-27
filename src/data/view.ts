// View tuning: how many tiles show a plant sprite (the rest show only ground cover), and when to show detail.

/** Share of a species' grown tiles that get a sprite. Zoomed out stays calm; zoomed in shows more. */
export const SPRITE_DENSITY: Record<'calm' | 'detail', Record<string, number>> = {
  calm: { cyano: 0, liverwort: 0.25, moss: 0.3, lichen: 0.12, fungus: 0.05, clubmoss: 0.55, fern: 0.75 },
  detail: { cyano: 0.35, liverwort: 0.8, moss: 0.9, lichen: 0.6, fungus: 0.25, clubmoss: 1, fern: 1 },
};

/** Screen pixels per art pixel from which the map shows detail. */
export const DETAIL_FROM = 3;

/** Tiles below this cover show only ground cover when calm. */
export const CALM_MIN_GROWTH = 0.5;

/** Zoom steps, relative to "the whole island fits". */
export const ZOOM_STEPS = [1, 1.5, 2, 3, 4];

/** How densely each ground species dyes its tile (lichens are patchy, so the lava shows through). */
export const COVER_STRENGTH: Record<string, number> = { cyano: 1, liverwort: 1, moss: 1, lichen: 0.6, fungus: 0, clubmoss: 1, fern: 1 };
