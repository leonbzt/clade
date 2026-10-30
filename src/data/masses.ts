// Rough real masses, to show slot sizes in grams (docs/research/masses.md; one order of magnitude is the aim).
// Read-only for now: nothing in the sim uses them, only what the board shows. A tile is NUM.mass.tile m².

/** Plants: dry grams per m² at full cover. Animals: live grams per member. */
export const MASS: Record<string, number> = {
  cyano: 50, thallus: 50, liverwort: 100, moss: 150, lichen: 100, fungus: 20, clubmoss: 200, fern: 200,
  springtail: 0.0001, bristletail: 0.005, snail: 2, slug: 5, beetle: 0.1,
};

/** Litter: grams per m² for one unit of the litter layer (1 = "thick litter"; real forest floors are 500–5000). */
export const LITTER_MASS = 1000;
