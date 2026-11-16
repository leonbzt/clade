// The roster: 43 real species, a mix chosen for recognisability (*decided 15 Nov*), not one real place.
// A named species is a point in its clade's dial space. Every row is *drafted* from memory: nothing ships at that
// grade (direction §6). Dials are points on top of the clade's base; mass is grams of one adult.
import type { DialId, Named } from '../../model/types';

type Points = Partial<Record<Exclude<DialId, 'size'>, number>>;
const sp = (id: string, name: string, common: string, clade: string, grams: number, dials: Points, home: string, mutations: string[] = []): Named => ({
  id, ott: 0, name, common, home, build: { clade, dials: { size: Math.log10(grams), ...dials }, mutations },
  src: { mass: 'drafted', diet: 'drafted', realm: 'drafted', guard: 'drafted', dials: 'drafted' },
});

export const SPECIES: Named[] = [
  // The first line's leaves.
  sp('common-ragworm', 'Hediste diversicolor', 'Common ragworm', 'ragworms', 0.5, { guard: 1, brood: 1 }, 'Estuary mud of the north-east Atlantic'),
  sp('king-ragworm', 'Alitta virens', 'King ragworm', 'ragworms', 25, { guard: 2, brood: 0 }, 'Muddy sand of the North Atlantic'),
  // Sea movers.
  sp('lugworm', 'Arenicola marina', 'Lugworm', 'lugworms', 5, { guard: 1 }, 'Tidal sand flats of Europe'),
  sp('common-limpet', 'Patella vulgata', 'Common limpet', 'limpets', 10, { guard: 1 }, 'Rocky shores of western Europe'),
  sp('common-periwinkle', 'Littorina littorea', 'Common periwinkle', 'periwinkles', 4, { guard: 1, brood: 2 }, 'Rocky shores of the North Atlantic'),
  sp('purple-urchin', 'Strongylocentrotus purpuratus', 'Purple sea urchin', 'urchins', 80, { guard: 1 }, 'Kelp forests of the north-east Pacific'),
  sp('long-spined-urchin', 'Diadema antillarum', 'Long-spined sea urchin', 'urchins', 150, { guard: 3 }, 'Caribbean reefs'),
  sp('black-sea-cucumber', 'Holothuria atra', 'Black sea cucumber', 'sea-cucumbers', 500, { guard: 1 }, 'Indo-Pacific reef flats'),
  sp('green-shore-crab', 'Carcinus maenas', 'Green shore crab', 'shore-crabs', 60, { bite: 0, guard: 1 }, 'North-east Atlantic shores, invasive elsewhere'),
  sp('dog-whelk', 'Nucella lapillus', 'Dog whelk', 'dog-whelks', 8, { bite: 1 }, 'Rocky shores of the North Atlantic'),
  sp('common-starfish', 'Asterias rubens', 'Common starfish', 'sea-stars', 150, { bite: 0 }, 'North-east Atlantic'),
  sp('common-octopus', 'Octopus vulgaris', 'Common octopus', 'octopuses', 3000, { bite: 0, speed: 1 }, 'Mediterranean and eastern Atlantic'),
  sp('european-anchovy', 'Engraulis encrasicolus', 'European anchovy', 'anchovies', 20, { speed: 0, brood: 1 }, 'Eastern Atlantic and Mediterranean'),
  sp('clown-anemonefish', 'Amphiprion ocellaris', 'Clown anemonefish', 'damselfishes', 15, { guard: 1 }, 'Indo-Pacific reefs'),
  sp('stoplight-parrotfish', 'Sparisoma viride', 'Stoplight parrotfish', 'parrotfishes', 1000, { bite: 0 }, 'Caribbean reefs'),
  sp('bumphead-parrotfish', 'Bolbometopon muricatum', 'Bumphead parrotfish', 'parrotfishes', 45000, { bite: 1 }, 'Indo-Pacific reefs'),
  sp('giant-moray', 'Gymnothorax javanicus', 'Giant moray', 'morays', 20000, { bite: 0 }, 'Indo-Pacific reefs'),
  sp('yellowfin-tuna', 'Thunnus albacares', 'Yellowfin tuna', 'tunas', 60000, { speed: 0 }, 'Tropical open ocean'),
  sp('blacktip-reef-shark', 'Carcharhinus melanopterus', 'Blacktip reef shark', 'ground-sharks', 13000, { bite: 0, speed: 0 }, 'Indo-Pacific reef shallows'),
  sp('tiger-shark', 'Galeocerdo cuvier', 'Tiger shark', 'ground-sharks', 400000, { bite: 1, speed: 0 }, 'Tropical and warm seas'),
  sp('green-turtle', 'Chelonia mydas', 'Green sea turtle', 'sea-turtles', 130000, { guard: 1 }, 'Tropical seagrass beds worldwide'),
  // Shore movers.
  sp('rough-periwinkle', 'Littorina saxatilis', 'Rough periwinkle', 'periwinkles', 0.3, { guard: 0, brood: 0 }, 'Splash zone of North Atlantic shores', ['air-breathing']),
  sp('sally-lightfoot', 'Grapsus grapsus', 'Sally Lightfoot crab', 'rock-crabs', 40, { speed: 1 }, 'Rocky shores of the tropical Americas and the Galápagos'),
  sp('ghost-crab', 'Ocypode quadrata', 'Atlantic ghost crab', 'ghost-crabs', 50, { speed: 1 }, 'Sandy beaches of the western Atlantic'),
  sp('sandhopper', 'Talitrus saltator', 'Sandhopper', 'sandhoppers', 0.1, { brood: 1 }, 'Sandy beaches of Europe'),
  sp('marine-iguana', 'Amblyrhynchus cristatus', 'Marine iguana', 'iguanas', 3000, { bite: 0 }, 'The Galápagos'),
  sp('oystercatcher', 'Haematopus ostralegus', 'Eurasian oystercatcher', 'oystercatchers', 500, { bite: 0 }, 'Coasts of Europe and Asia'),
  sp('herring-gull', 'Larus argentatus', 'Herring gull', 'gulls', 1000, { bite: 0 }, 'North Atlantic coasts'),
  sp('coconut-crab', 'Birgus latro', 'Coconut crab', 'land-hermit-crabs', 2500, { bite: 1 }, 'Islands of the Indian and Pacific Oceans'),
  // Sessile life.
  sp('blue-mussel', 'Mytilus edulis', 'Blue mussel', 'mussels', 6, { guard: 1 }, 'North Atlantic shores'),
  sp('common-cockle', 'Cerastoderma edule', 'Common cockle', 'cockles', 8, { guard: 0 }, 'Tidal sand flats of Europe'),
  sp('acorn-barnacle', 'Semibalanus balanoides', 'Acorn barnacle', 'barnacles', 1, {}, 'North Atlantic and North Pacific shores'),
  sp('giant-clam', 'Tridacna gigas', 'Giant clam', 'giant-clams', 100000, {}, 'Indo-Pacific reefs'),
  // Producers.
  sp('giant-kelp', 'Macrocystis pyrifera', 'Giant kelp', 'kelps', 5000, {}, 'Cold coasts of the Pacific and the Southern Ocean'),
  sp('turtle-grass', 'Thalassia testudinum', 'Turtle grass', 'seagrasses', 20, {}, 'Caribbean and Gulf of Mexico'),
  sp('staghorn-coral', 'Acropora cervicornis', 'Staghorn coral', 'stony-corals', 3000, {}, 'Caribbean reefs'),
  sp('bladderwrack', 'Fucus vesiculosus', 'Bladderwrack', 'wracks', 300, {}, 'North Atlantic shores'),
  sp('red-mangrove', 'Rhizophora mangle', 'Red mangrove', 'mangroves', 50000, {}, 'Tropical Atlantic and eastern Pacific coasts'),
  sp('coconut-palm', 'Cocos nucifera', 'Coconut palm', 'palms', 400000, {}, 'Tropical coasts worldwide'),
  sp('lava-lichen', 'Stereocaulon vulcani', 'Lava lichen', 'lava-lichens', 1, {}, 'Young lava flows of Hawaii'),
  sp('sword-fern', 'Nephrolepis exaltata', 'Sword fern', 'sword-ferns', 200, {}, 'Tropical Americas, a pioneer on lava'),
  sp('beach-morning-glory', 'Ipomoea pes-caprae', 'Beach morning glory', 'morning-glories', 500, {}, 'Tropical beaches worldwide'),
  sp('ohia-lehua', 'Metrosideros polymorpha', 'ʻŌhiʻa lehua', 'myrtles', 300000, {}, 'Hawaii, the first tree on new lava'),
];
export const NAMED: Record<string, Named> = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
