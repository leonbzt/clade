// Known feeding links and non-links: [eater, eaten, true or false]. The real web is the check, never the input:
// `eats` must reproduce at least `LINKS_MOST` of them, and no rule may read this file. All *drafted* from memory;
// W3 gives each a source or drops it.
export const LINKS_MOST = 0.85;
export const LINKS: [eater: string, eaten: string, eats: boolean][] = [
  ['common-starfish', 'blue-mussel', true],
  ['common-starfish', 'acorn-barnacle', true],
  ['common-starfish', 'common-limpet', true],
  ['dog-whelk', 'acorn-barnacle', true],
  ['dog-whelk', 'blue-mussel', true],
  ['green-shore-crab', 'common-periwinkle', true],
  ['green-shore-crab', 'blue-mussel', true],
  ['green-shore-crab', 'common-ragworm', true],
  ['common-octopus', 'green-shore-crab', true],
  ['giant-moray', 'common-octopus', true],
  ['giant-moray', 'stoplight-parrotfish', true],
  ['oystercatcher', 'blue-mussel', true],
  ['oystercatcher', 'common-limpet', true],
  ['herring-gull', 'blue-mussel', true],
  ['ghost-crab', 'sandhopper', true],
  ['yellowfin-tuna', 'european-anchovy', true],
  ['blacktip-reef-shark', 'stoplight-parrotfish', true],
  ['tiger-shark', 'green-turtle', true],
  ['tiger-shark', 'yellowfin-tuna', true],
  ['common-starfish', 'european-anchovy', false], // too slow
  ['dog-whelk', 'green-shore-crab', false], // too big
  ['tiger-shark', 'european-anchovy', false], // too small to be worth it
  ['yellowfin-tuna', 'blue-mussel', false], // a shell it cannot open
  ['giant-moray', 'green-turtle', false], // too big
  ['blacktip-reef-shark', 'green-turtle', false], // too big
  ['common-octopus', 'long-spined-urchin', false], // spines
  ['oystercatcher', 'european-anchovy', false], // they never meet
  ['european-anchovy', 'acorn-barnacle', false], // not a hunter
  ['green-shore-crab', 'black-sea-cucumber', false], // too big, and toxic
];
