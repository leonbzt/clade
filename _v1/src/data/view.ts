// View tuning: how many tiles show a plant sprite (the rest show only ground cover), and when to show detail.

/** Share of a species' grown tiles that try for a sprite. Zoomed out stays calm, and there a tile next to one that
 * already has a sprite doesn't get one, so sprites spread out. Zoomed in shows more. */
export const SPRITE_DENSITY: Record<'calm' | 'detail', Record<string, number>> = {
  calm: { cyano: 0, thallus: 0.14, liverwort: 0.14, moss: 0.16, lichen: 0.08, fungus: 0.03, clubmoss: 0.15, fern: 0.2 },
  detail: { cyano: 0.18, thallus: 0.4, liverwort: 0.4, moss: 0.45, lichen: 0.3, fungus: 0.12, clubmoss: 0.5, fern: 0.5 },
};

/** Screen pixels per art pixel from which the map shows detail. */
export const DETAIL_FROM = 3;

/** Tiles below this cover show only ground cover when calm. */
export const CALM_MIN_GROWTH = 0.5;

/** Zoom steps, relative to "the whole island fits". */
export const ZOOM_STEPS = [1, 1.5, 2, 3, 4];

/** How densely each ground species dyes its tile (lichens are patchy, so the lava shows through). */
export const COVER_STRENGTH: Record<string, number> = { cyano: 1, thallus: 1, liverwort: 1, moss: 1, lichen: 0.6, fungus: 0, clubmoss: 1, fern: 1 };

/** How a species' base axis genes tint its sprites and ground cover, per step (hue in turns). Dry goes yellower,
 * Shade darker, Lean greyer. A species you made adds its own hue shift. */
export const VARIANT_TINT = { dryHue: -0.012, shadeLight: -0.035, leanSat: -0.1 };

/** Colours for the Variants view, given to a species' variants in order of birth. */
export const VARIANT_COLORS = ['#e6dcc0', '#5aa8f0', '#f07850', '#7cd05a', '#c070f0', '#f0d040', '#40d0c0', '#f080b0'];
