# The Teal palette from src/data/palette.ts, as ramps dark -> light.
extends RefCounted

const SKY := [Color("#0d2830"), Color("#174752"), Color("#276b75"), Color("#4f9e9b")]
const LEAF := [Color("#10301f"), Color("#1d5631"), Color("#358a3a"), Color("#6cc644"), Color("#c4ef6a")]
const EARTH := [Color("#100d12"), Color("#221a20"), Color("#3a2b2b"), Color("#5f4636"), Color("#937154")]
const STONE := [Color("#283540"), Color("#53636d"), Color("#94a3a8")]
const WATER := [Color("#176a96"), Color("#5ccbe8")]
const WARM := [Color("#cc311f"), Color("#ff8a1e"), Color("#ffe14a")]
const RARE := Color("#f59be0")
const INK := Color("#05090b")
const GOLD := Color("#ffe14a")
const STEEL := Color("#9fb2bd")

const PART_INK := {
	"claw": WARM[0], "shield": STONE[2], "eye": Color("#eef2ee"), "compound": RARE, "spine": STONE[2], "sclerite": STONE[2],
	"leg": EARTH[4], "digger": EARTH[4], "chaetae": STONE[2], "gill": WATER[0], "gut": WARM[1], "pouch": WARM[2],
	"proboscis": WARM[1], "deep": RARE, "progenesis": RARE,
}
const NODE_INK := {"mat": LEAF[3], "buried": EARTH[4], "shell": STONE[2], "carcass": WARM[0]}

## A stable 0..1 hash for speckles.
static func hash3(x: int, y: int, s: int) -> float:
	var h := (x * 374761393 + y * 668265263 + s * 2147483647) & 0x7fffffff
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return float(h ^ (h >> 16)) / float(0x7fffffff)
