# The Life's numbers and nouns, ported from toys/life2-data.ts and life2-habitats.ts (mud flats only),
# with R2's corrections (docs/research/cambrian-world.md). No logic here.
extends RefCounted

const COLS := 8 # portrait: the toy's board turned a quarter
const ROWS := 11
const TURNS := 20
const C := 16 # world pixels per tile

const RULE := {
	"start_food": 4, "base_upkeep": 1, "oxygen": 3, "health": 3,
	"lay_cost": 4, "gut_food": 2, "gill_oxygen": 2, "eye_sense": 2, "compound_sense": 20, "max_range": 5,
	"adult_size": 3, "max_size": 5, # lay from size 3; every moult adds a size, a part and eggs per lay
	"tunnel": 3, "bristle_tunnel": 1, # tiles a worm tunnels through connected mud in one move
	"carcass_size": 4, "foraging_at": 25,
	"predator_steps": 2, "rest_after_strike": 1, "rest_after_spine": 3,
}
const STAGES := ["Hatchling", "Juvenile", "Adult", "Adult", "Full grown"]

const PLANS := {
	"worm": {
		"name": "Worm", "head": 1, "pairs": 2, "range": 1, "sense": 2, "moult_extra": 2, "soft": false,
		"blurb": "Crawls 1 tile. In mud it tunnels 3 tiles around corners, and strikes miss it.",
		"real": "Like Ottoia, a burrowing Burgess Shale worm.",
	},
	"arthropod": {
		"name": "Arthropod", "head": 1, "pairs": 2, "range": 2, "sense": 1, "moult_extra": 3, "soft": true,
		"blurb": "Moves 2 tiles in a line, more with legs. Mud stops it. Soft for the turn it moults.",
		"real": "Like Sidneyia, a Cambrian arthropod that ate shelled prey.",
	},
}

# The one fixed starter body for this spike (no parts screen).
const STARTER_PLAN := "worm"
const STARTER_PARTS := ["gut", "sclerite"]

const PARTS := {
	"claw": {"name": "Crushing claw", "upkeep": 1, "slots": ["head"], "plans": ["arthropod"], "does": "Opens shell beds. Grabs food ahead without moving."},
	"shield": {"name": "Head shield", "upkeep": 0, "slots": ["head"], "plans": ["arthropod"], "guard": true, "does": "Blocks strikes from the front."},
	"eye": {"name": "Eye", "upkeep": 1, "slots": ["head"], "plans": ["worm", "arthropod"], "does": "See hidden food 2 tiles further."},
	"spine": {"name": "Spine", "upkeep": 1, "slots": ["side", "tail"], "plans": ["arthropod"], "guard": true, "does": "Blocks strikes on this side; the hunter backs off 3 turns."},
	"leg": {"name": "Walking leg", "upkeep": 1, "slots": ["side"], "plans": ["arthropod"], "does": "+1 tile of movement."},
	"digger": {"name": "Digging limb", "upkeep": 0, "slots": ["side"], "plans": ["arthropod"], "does": "Eat buried food in mud."},
	"gill": {"name": "Gill", "upkeep": 0, "slots": ["side"], "plans": ["worm", "arthropod"], "does": "+2 maximum oxygen."},
	"gut": {"name": "Gut gland", "upkeep": 1, "slots": ["side"], "plans": ["worm", "arthropod"], "does": "+2 food from every meal."},
	"pouch": {"name": "Brood pouch", "upkeep": 1, "slots": ["side", "tail"], "plans": ["worm", "arthropod"], "does": "Bigger clutches: +1x per pouch."},
	"proboscis": {"name": "Proboscis", "upkeep": 1, "slots": ["head"], "plans": ["worm"], "does": "Grabs food ahead without moving."},
	"chaetae": {"name": "Bristles", "upkeep": 0, "slots": ["side"], "plans": ["worm"], "does": "Tunnel 1 tile further through mud."},
	"sclerite": {"name": "Sclerites", "upkeep": 0, "slots": ["side", "tail"], "plans": ["worm"], "guard": true, "does": "Blocks strikes on this side."},
	"compound": {"name": "Compound eye", "upkeep": 1, "slots": ["head"], "plans": ["arthropod"], "rare": true, "does": "See all hidden food."},
	"deep": {"name": "Deep burrow", "upkeep": 0, "slots": ["tail"], "plans": ["worm"], "rare": true, "does": "In mud: no upkeep, +1 egg per lay."},
	"progenesis": {"name": "Progenesis", "upkeep": 0, "slots": ["side", "tail"], "plans": ["worm", "arthropod"], "rare": true, "does": "Lay at any size."},
}

const NODES := {
	"mat": {"name": "Microbial mat", "food": 5},
	"buried": {"name": "Buried food", "food": 6},
	"shell": {"name": "Shell bed", "food": 9},
	"carcass": {"name": "Carcass", "food": 14},
}

const TERRAIN := {"sand": "Open sand", "mud": "Mud", "rock": "Rock", "dead": "Dead water"}

#   . sand   ~ mud   # rock   m microbial mat   s shell bed   c carcass (on sand)   b buried food (in mud)
const CELL := {
	".": ["sand", ""], "~": ["mud", ""], "#": ["rock", ""],
	"m": ["sand", "mat"], "s": ["sand", "shell"], "c": ["sand", "carcass"], "b": ["mud", "buried"],
}

const MUD_FLATS := {
	"id": "mud", "name": "Mud flats",
	"blurb": "Soft mud full of hidden food. Burrowers rule until the mudslide, when the mud has no oxygen.",
	"real": "Mud slumps swept animals from banks beside a reef cliff into deeper water and buried them.",
	"map": [ # the toy's 11 x 8 map turned a quarter (x and y swapped) to fill a phone held upright
		"m.m.sm.s",
		".m..#.m.",
		"~~~~~~~m",
		"~b~b~~b~",
		"b~~~bb~b",
		"~~#~~~~~",
		".~~..~~~",
		"m~~mc~bb",
		"~~b~~#~~",
		"~b~b~~b.",
		"b~~~b~mm",
	],
	"start": Vector2i(3, 1), "entry": Vector2i(1, 10), "predator_at": 6,
	"predator": "Anomalocaris",
	"rivals": [{"at": Vector2i(4, 9), "name": "a rival priapulid worm", "eats": "buried"}],
	"event": {"from": 12, "to": 15, "where": "mud", "name": "Mudslide", "text": "no oxygen in the mud"},
	"rares": {"arthropod": ["compound", "progenesis"], "worm": ["deep", "progenesis"]},
	"tiers": [["S", 56], ["A", 40], ["B", 26], ["C", 14], ["D", 5], ["F", 0]],
}
