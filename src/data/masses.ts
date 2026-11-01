// Rough real masses (docs/research/masses.md; one order of magnitude is the aim). Plants are grams in the sim: a
// slot's mass is its state, and its cover is mass ÷ (MASS × tile area). Litter is grams too, stored as units of
// LITTER_MASS g/m² so the layers that read it stay near 0–1. A tile is NUM.mass.tile m².

/** Plants: dry grams per m² at full cover. Animals: live grams per member. */
export const MASS: Record<string, number> = {
  cyano: 50, thallus: 50, liverwort: 100, moss: 150, lichen: 100, fungus: 20, clubmoss: 200, fern: 200,
  springtail: 0.0001, bristletail: 0.005, snail: 2, slug: 5, beetle: 0.1,
};

/** Litter: grams per m² for one unit of the litter layer (1 = "thick litter"; real forest floors are 500–5000). */
export const LITTER_MASS = 1000;
/** Nitrogen and soil: grams per m² for one unit of their layer. Game-paced, not real: litter turns over in a couple of
 * minutes here, so a unit of nitrogen stands for many grams. */
export const NITROGEN_MASS = 5000;
export const SOIL_MASS = 20_000;
