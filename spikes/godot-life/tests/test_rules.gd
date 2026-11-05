# Headless tests of the ported rules. Run: godot --headless --path spikes/godot-life -s res://tests/test_rules.gd
extends SceneTree

const D := preload("res://rules/data.gd")
const Life := preload("res://rules/life.gd")

var fails := 0
var ran := 0

func check(ok: bool, what: String) -> void:
	ran += 1
	if not ok:
		fails += 1
		printerr("FAIL: ", what)

## Coordinates in the toy's 11 x 8 map; the spike's board is that map turned a quarter (x and y swapped).
func at(x: int, y: int) -> int:
	return Life.at(y, x)

func _init() -> void:
	var t0 := Time.get_ticks_usec()
	start()
	worm_tunnels()
	eating()
	moult_and_lay()
	starving()
	predator()
	buried_and_sides()
	mudslide()
	season()
	print("%d checks, %d failed (%.1f ms)" % [ran, fails, (Time.get_ticks_usec() - t0) / 1000.0])
	quit(1 if fails > 0 else 0)

func start() -> void:
	var l := Life.new(7)
	check(l.x == 3 and l.y == 1 and l.size == 1 and l.food == 4, "starts at the habitat's start, size 1, 4 food")
	check(l.parts_on() == ["sclerite", "gut"], "fixed starter body: sclerites on the tail, gut gland on a side")
	check(l.upkeep() == 2, "upkeep is 1 + the gut gland")
	check(l.rivals.size() == 1 and l.pred == null, "one rival, no predator yet")

func worm_tunnels() -> void:
	var l := Life.new(7)
	var ds := l.dests()
	# on sand at (1,3): a worm crawls 1 tile; (2,3) is mud
	check(ds.has(at(2, 3)) and ds.has(at(0, 3)) and ds.has(at(1, 2)), "crawls 1 tile each way on sand")
	check(not ds.has(at(1, 4)), "rock blocks")
	check(not ds.has(at(3, 3)), "no 2-tile move on sand")
	l.move(at(2, 3))
	ds = l.dests()
	check(ds.has(at(4, 2)) and ds[at(4, 2)].path.size() == 3, "in mud it tunnels 3 tiles around corners")
	check(not ds.has(at(5, 2)), "the tunnel stops at rock")

func eating() -> void:
	var l := Life.new(7)
	l.move(at(2, 3))
	l.move(at(3, 3)) # buried food
	var ev := l.events.filter(func(e): return e.k == "eat")
	check(ev.size() == 1 and ev[0].gain == 8, "buried food gives 6 + 2 from the gut gland")
	check(l.food == 4 - 2 + 8 - 2, "food after two upkeeps and a meal")
	check(l.tiles[at(3, 3)].node == "", "the node is gone once eaten")
	l.x = 4; l.y = 6 # next to the carcass
	l.move(at(7, 4))
	check(l.events.any(func(e): return e.k == "locked"), "a carcass is locked at size 1")

func moult_and_lay() -> void:
	var l := Life.new(7)
	l.food = 40
	check(not l.can_lay(), "a hatchling can't lay")
	check(l.moult_cost() == 3, "moult costs size + 2 for a worm")
	l.moult()
	check(l.size == 2 and l.phase == "offer" and l.offers.size() >= 3, "a moult grows a size and offers parts")
	check(not l.can_moult(), "one moult a turn")
	var part: String = l.offers[0]
	l.pick(part)
	check(l.phase == "play" and l.has(part), "picking an offer puts it on the body")
	l.stay()
	l.moult()
	l.pick(l.offers[0])
	check(l.size == 3 and l.can_lay(), "an adult at size 3 can lay")
	var before := l.food
	l.lay()
	check(l.eggs == 3, "a lay gives size x eggs")
	check(l.food == before - 4 - l.upkeep(), "a lay costs 4 food plus the turn's upkeep")

func starving() -> void:
	var l := Life.new(7)
	l.food = 0
	l.stay()
	check(l.parts_on() == ["gut"], "starving sheds the newest part first")
	l.food = 0
	l.stay()
	l.food = 0
	l.stay()
	check(l.health == 2, "with no parts left, starving costs health")

func predator() -> void:
	var l := Life.new(7)
	l.food = 99
	for k in 5:
		l.stay()
	check(l.pred != null and l.turn == 6, "the hunter arrives on turn 6")
	check(l.pred.x == 1 and l.pred.y == 10, "it enters at the habitat's entry")
	# put the hunter next to you on sand and let it mark
	l.x = 3; l.y = 0; l.facing = 2
	l.pred.x = 1; l.pred.y = 1; l.pred.lx = 3; l.pred.ly = 0
	l.stay()
	var marks: Array = l.pred.marks
	check(l.pred.state == "strike" and marks.has(at(0, 3)), "it marks your tile from next door")
	check(l.events.any(func(e): return e.k == "marks"), "the marks are an event")
	# the strike comes from ahead of you: no front guard, no head part -> 1 damage
	l.stay()
	var st := l.events.filter(func(e): return e.k == "strike")
	check(st.size() == 1 and st[0].kind == "hit" and l.health == 2, "a strike on a bare side costs 1 health")
	check(l.pred.state == "rest", "the hunter rests after a strike")
	l.stay()
	check(l.pred.state == "hunt", "and hunts again a turn later")

func buried_and_sides() -> void:
	var l := Life.new(7)
	check(l.hit_on(2, 2, false, 3, 2).kind == "buried", "a worm in mud is buried: strikes miss")
	check(l.hit_on(2, 0, false, 3, 1).kind == "blocked", "sclerites on the tail block a strike from behind")
	var h := l.hit_on(1, 2, false, 3, 1) # from the east while facing south: your left side
	check(h.kind == "hit" and h.part == "gut", "a strike on the left side tears the gut gland off")

func mudslide() -> void:
	var l := Life.new(7)
	l.food = 99
	l.move(at(2, 3))
	while l.turn < 12:
		l.stay()
	var ox := l.oxygen
	l.stay()
	check(l.oxygen == ox - 1, "in the mudslide, mud costs oxygen")

func season() -> void:
	var l := Life.new(7)
	l.food = 999
	l.move(at(2, 3)) # buried in mud, the hunter can't strike
	l.x = 5; l.y = 4 # deep in the mud field, away from sand
	while l.phase == "play" and l.turn < 12:
		l.stay()
	check(l.phase == "play", "buried in mud you outlast the hunter")
	while l.phase == "play":
		l.stay()
	check(l.phase == "over" and l.turn == D.TURNS, "the Life ends after 20 turns or with death")
	check(l.tier_of(26) == "B" and l.tier_of(0) == "F", "mud-flat tiers")
