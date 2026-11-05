# A Life, the rules (no nodes, no drawing). Ported from toys/life2-sim.ts: move, eat, moult, lay, the predator's
# hunt, mark, strike and rest. One change for the view: every action records `events`, which the board plays back.
extends RefCounted

const D := preload("res://rules/data.gd")
const DX := [0, 1, 0, -1] # north, east, south, west
const DY := [-1, 0, 1, 0]
const SIDES := ["front", "right", "back", "left"]
const DIR_NAMES := ["north", "east", "south", "west"]

var plan: String
var hab: Dictionary
var rng := RandomNumberGenerator.new()
var tiles: Array = [] # {t, node, seen}
var x := 0
var y := 0
var facing := 1
var rivals: Array = [] # {x, y, name, eats}
var turn := 1
var food := 0
var oxygen := 0
var health := 0
var eggs := 0
var xp := 0
var eaten := 0
var size := 1
var slots: Array = [] # {kind, side, seg, part}
var order: Array = [] # slot indices, newest last
var phase := "play" # play | offer | over
var offers: Array = []
var moults := 0
var rare_at := 2
var rare_got := ""
var rare_passed := false
var moulted := false
var soft := false
var moved := false
var pred = null # {x, y, state, rest, marks, dir, lx, ly} or null
var cause := ""
var lines: Array = [] # the last few messages
var events: Array = [] # what the last action did, in order


static func at(cx: int, cy: int) -> int:
	return cy * D.COLS + cx

static func in_b(cx: int, cy: int) -> bool:
	return cx >= 0 and cx < D.COLS and cy >= 0 and cy < D.ROWS

static func xy(i: int) -> Vector2i:
	return Vector2i(i % D.COLS, i / D.COLS)

static func dist(ax: int, ay: int, bx: int, by: int) -> int:
	return absi(ax - bx) + absi(ay - by)


func _init(seed_: int = 1, plan_: String = D.STARTER_PLAN, hab_: Dictionary = D.MUD_FLATS, starters: Array = D.STARTER_PARTS) -> void:
	plan = plan_
	hab = hab_
	rng.seed = seed_
	for row in hab.map:
		for ch in row:
			var cell: Array = D.CELL[ch]
			tiles.append({"t": cell[0], "node": cell[1], "seen": false})
	var P: Dictionary = D.PLANS[plan]
	for k in P.head:
		slots.append({"kind": "head", "side": "front", "seg": -1, "part": ""})
	slots.append({"kind": "tail", "side": "back", "seg": 99, "part": ""})
	for k in P.pairs:
		slots.append({"kind": "side", "side": "left", "seg": k, "part": ""})
		slots.append({"kind": "side", "side": "right", "seg": k, "part": ""})
	x = hab.start.x
	y = hab.start.y
	for v in hab.rivals:
		rivals.append({"x": v.at.x, "y": v.at.y, "name": v.name, "eats": v.eats})
	food = D.RULE.start_food
	health = D.RULE.health
	rare_at = 2 + rng.randi_range(0, 1)
	for part in starters:
		var k := free_slot_for(part)
		if k >= 0:
			slots[k].part = part
			order.append(k)
	oxygen = oxygen_max()
	reveal()
	say("Grow up: you can lay from size %d." % D.RULE.adult_size)


# ---- the body ----
func count(id: String) -> int:
	var n := 0
	for s in slots:
		if s.part == id:
			n += 1
	return n

func has(id: String) -> bool:
	return count(id) > 0

func tile(cx: int = x, cy: int = y) -> Dictionary:
	return tiles[at(cx, cy)]

func on_mud() -> bool:
	return tile().t == "mud"

func buried_at(cx: int, cy: int) -> bool:
	return plan == "worm" and tile(cx, cy).t == "mud"

func parts_on() -> Array:
	var out := []
	for s in slots:
		if s.part != "":
			out.append(s.part)
	return out

func event_on() -> bool:
	return turn >= hab.event.from and turn <= hab.event.to

func upkeep() -> int:
	if has("deep") and on_mud():
		return 0
	var n: int = D.RULE.base_upkeep
	for s in slots:
		if s.part != "":
			n += D.PARTS[s.part].upkeep
	return n

func oxygen_max() -> int: return D.RULE.oxygen + count("gill") * D.RULE.gill_oxygen
func range_() -> int: return mini(D.RULE.max_range, D.PLANS[plan].range + count("leg"))
func tunnel() -> int: return D.RULE.tunnel + count("chaetae") * D.RULE.bristle_tunnel
func sense() -> int: return D.PLANS[plan].sense + count("eye") * D.RULE.eye_sense + count("compound") * D.RULE.compound_sense
func clutch() -> int: return (1 + count("pouch")) * size + (1 if has("deep") and on_mud() else 0)
func moult_cost() -> int: return size + D.PLANS[plan].moult_extra
func can_moult() -> bool: return phase == "play" and not moulted and size < D.RULE.max_size and food >= moult_cost()
func mature() -> bool: return size >= D.RULE.adult_size or has("progenesis")
func can_lay() -> bool: return phase == "play" and mature() and food >= D.RULE.lay_cost
func has_reach() -> bool: return has("claw") or has("proboscis") or has("hook")
func stage() -> String: return D.STAGES[size - 1]

static func foraging(xp_: int) -> int:
	return 2 if xp_ >= D.RULE.foraging_at else 1

func tier_of(n: int) -> String:
	for t in hab.tiers:
		if n >= t[1]:
			return t[0]
	return "F"

## The next tier up and the eggs it needs, or [] at the top.
func next_tier(n: int) -> Array:
	var tiers: Array = hab.tiers.duplicate()
	tiers.reverse()
	for t in tiers:
		if n < t[1]:
			return t
	return []

## What stops you eating this node, or "".
func lock_of(node: String) -> String:
	match node:
		"buried":
			return "" if plan == "worm" or has("digger") else "needs a digging limb"
		"shell":
			if has("claw") or has("hook"):
				return ""
			return "needs a hooked proboscis (rare)" if plan == "worm" else "needs a crushing claw"
		"carcass":
			return "" if size >= D.RULE.carcass_size else "needs size %d, you are %d" % [D.RULE.carcass_size, size]
	return ""

static func known(t: Dictionary) -> bool:
	return t.t != "mud" or t.seen

func reveal() -> void:
	var r := sense()
	for i in tiles.size():
		var p := xy(i)
		if maxi(absi(p.x - x), absi(p.y - y)) <= r:
			tiles[i].seen = true

func say(m: String) -> void:
	lines.append(m)
	if lines.size() > 5:
		lines.pop_front()

func emit(k: String, data: Dictionary = {}) -> void:
	var e := data.duplicate()
	e.k = k
	events.append(e)

func fits(part: String, slot: int) -> bool:
	return D.PARTS[part].slots.has(slots[slot].kind)

## The first empty slot this part fits, else the first filled one it fits (it replaces that part), else -1.
func free_slot_for(part: String) -> int:
	var filled := -1
	for k in slots.size():
		if fits(part, k):
			if slots[k].part == "":
				return k
			if filled < 0:
				filled = k
	return filled


# ---- moulting ----
## Pay food, grow a size, get offers. The turn doesn't end; one moult a turn. Size 5 finishes the body.
func moult() -> void:
	events = []
	if not can_moult():
		return
	food -= moult_cost()
	size += 1
	moults += 1
	moulted = true
	soft = D.PLANS[plan].soft
	if size == D.RULE.adult_size:
		say("You are an adult: you can lay eggs now.")
	if size == D.RULE.max_size:
		health = D.RULE.health
		say("Full grown: your body is finished and your wounds close.")
	var pool := []
	for id in D.PARTS:
		if not D.PARTS[id].get("rare", false) and D.PARTS[id].plans.has(plan):
			pool.append(id)
	_shuffle(pool)
	offers = pool.slice(0, 3)
	if moults >= rare_at and rare_got == "":
		for id in hab.rares[plan]:
			if not has(id):
				offers.append(id)
				break
	phase = "offer"
	emit("moult", {"size": size, "food": food})

## Take one of the offers: it goes in the first slot it fits (replacing a part if all are full).
func pick(part: String) -> void:
	events = []
	if phase != "offer" or not offers.has(part):
		return
	var k := free_slot_for(part)
	if k >= 0:
		order.erase(k)
		var old: String = slots[k].part
		slots[k].part = part
		order.append(k)
		emit("part", {"slot": k, "part": part, "old": old})
	phase = "play"
	offers = []
	if D.PARTS[part].get("rare", false):
		rare_got = part
		rare_passed = false
		say("Rare: %s. Lay an egg to pass it on." % D.PARTS[part].name)
	oxygen = mini(oxygen, oxygen_max())
	reveal()

func _shuffle(a: Array) -> void:
	for k in range(a.size() - 1, 0, -1):
		var j := rng.randi_range(0, k)
		var t = a[k]
		a[k] = a[j]
		a[j] = t


# ---- moving ----
## A worm in mud tunnels through connected mud, around corners.
func _tunnels(out: Dictionary, pred_at: int) -> void:
	var mx := tunnel()
	var seen := {at(x, y): true}
	var open := [[x, y, []]]
	while not open.is_empty():
		var cur: Array = open.pop_front()
		var path: Array = cur[2]
		if path.size() >= mx:
			continue
		for d in 4:
			var nx: int = cur[0] + DX[d]
			var ny: int = cur[1] + DY[d]
			if not in_b(nx, ny):
				continue
			var i := at(nx, ny)
			if seen.has(i) or tiles[i].t != "mud":
				continue
			seen[i] = true
			var p := path.duplicate()
			p.append(i)
			if i != pred_at:
				out[i] = {"i": i, "dir": d, "grab": false, "path": p}
			open.append([nx, ny, p])

## Where you can go this turn: tile index -> {i, dir, grab, path}.
func dests() -> Dictionary:
	var out := {}
	if phase != "play":
		return out
	var worm := plan == "worm"
	var pred_at := at(pred.x, pred.y) if pred else -1
	for d in 4:
		var path := []
		var cx := x
		var cy := y
		for k in range(1, (1 if worm else range_()) + 1):
			cx += DX[d]
			cy += DY[d]
			if not in_b(cx, cy):
				break
			var i := at(cx, cy)
			if tiles[i].t == "rock" or i == pred_at:
				break
			path.append(i)
			out[i] = {"i": i, "dir": d, "grab": false, "path": path.duplicate()}
			if not worm and tiles[i].t == "mud":
				break
	if worm and on_mud():
		_tunnels(out, pred_at)
	if has_reach():
		var ax: int = x + DX[facing]
		var ay: int = y + DY[facing]
		if in_b(ax, ay) and at(ax, ay) != pred_at:
			var t := tile(ax, ay)
			if t.node != "" and known(t) and lock_of(t.node) == "":
				out[at(ax, ay)] = {"i": at(ax, ay), "dir": facing, "grab": true, "path": []}
	return out

func _eat(i: int) -> void:
	var t: Dictionary = tiles[i]
	if t.node == "":
		return
	var lock := lock_of(t.node)
	if lock != "":
		say("%s %s." % [D.NODES[t.node].name, lock])
		emit("locked", {"i": i, "node": t.node, "why": lock})
		return
	var f: int = D.NODES[t.node].food + count("gut") * D.RULE.gut_food
	say("%s: +%d food." % [D.NODES[t.node].name, f])
	food += f
	xp += f
	eaten += f
	emit("eat", {"i": i, "node": t.node, "gain": f, "food": food})
	t.node = ""

func move(i: int) -> void:
	events = []
	var d = dests().get(i)
	if d == null:
		return
	var from := at(x, y)
	if not d.grab:
		var p := xy(i)
		x = p.x
		y = p.y
		facing = d.dir
	moved = not d.grab
	emit("move", {"from": from, "path": d.path, "grab": d.grab, "to": i, "dir": d.dir})
	_eat(i)
	_world()

func lay() -> void:
	events = []
	if not can_lay():
		return
	var n := clutch()
	food -= D.RULE.lay_cost
	eggs += n
	moved = false
	say("Laid %d egg%s." % [n, "s" if n > 1 else ""])
	emit("lay", {"n": n, "eggs": eggs, "food": food})
	if rare_got != "" and not rare_passed:
		rare_passed = true
		say("%s passed on." % D.PARTS[rare_got].name)
	_world()

func stay(dir: int = facing) -> void:
	events = []
	if phase != "play":
		return
	facing = dir
	moved = false
	emit("stay", {"dir": dir})
	_world()


# ---- strikes ----
## What a strike from `dir` would do to you at (cx, cy), facing `fc`.
func hit_on(dir: int, fc: int, mv: bool, cx: int, cy: int) -> Dictionary:
	var side: String = SIDES[(dir - fc + 4) % 4]
	if buried_at(cx, cy):
		return {"side": side, "kind": "buried", "tear": -1, "damage": 0, "part": ""}
	if has("enrol") and not mv:
		return {"side": side, "kind": "enrolled", "tear": -1, "damage": 0, "part": ""}
	for s in slots:
		if s.side == side and s.part != "" and D.PARTS[s.part].get("guard", false):
			return {"side": side, "kind": "blocked", "tear": -1, "damage": 0, "part": s.part}
	var tear := -1
	for k in slots.size():
		if slots[k].side == side and slots[k].part != "":
			tear = k
	return {"side": side, "kind": "hit", "tear": tear, "part": slots[tear].part if tear >= 0 else "",
		"damage": (1 if tear < 0 else 0) + (1 if soft else 0)}

func _strike() -> void:
	var p: Dictionary = pred
	p.state = "rest"
	p.rest = D.RULE.rest_after_strike
	var marks: Array = p.marks
	p.marks = []
	if not marks.has(at(x, y)):
		say("The strike misses.")
		emit("strike", {"kind": "miss", "at": at(x, y), "dir": p.dir, "marks": marks})
		return
	var h := hit_on(p.dir, facing, moved, x, y)
	h.at = at(x, y)
	h.dir = p.dir
	h.marks = marks
	match h.kind:
		"buried":
			say("You are buried: the strike misses.")
		"enrolled":
			say("You roll up: the strike glances off.")
		"blocked":
			say("Your %s blocks a strike on your %s." % [D.PARTS[h.part].name.to_lower(), h.side])
			if h.part == "spine":
				p.rest = D.RULE.rest_after_spine
		"hit":
			if h.tear >= 0:
				say("Hit on your %s: your %s is torn off." % [h.side, D.PARTS[h.part].name.to_lower()])
				slots[h.tear].part = ""
				order.erase(h.tear)
			if h.damage > 0:
				say("Hit on your %s: -%d health%s." % [h.side, h.damage, " (soft from moulting)" if soft else ""])
				health -= h.damage
	h.health = health
	emit("strike", h)

## One step toward (tx, ty), swimming over rock but never into dead water: it heads for the nearest tile it can reach.
func _predator_move(p: Dictionary, tx: int, ty: int) -> void:
	var start := at(p.x, p.y)
	var from := {start: -1}
	var open := [start]
	var goal := start
	var gd := dist(p.x, p.y, tx, ty)
	while not open.is_empty():
		var i: int = open.pop_front()
		var c := xy(i)
		var dd := dist(c.x, c.y, tx, ty)
		if dd < gd:
			gd = dd
			goal = i
		for d in 4:
			var nx: int = c.x + DX[d]
			var ny: int = c.y + DY[d]
			if not in_b(nx, ny):
				continue
			var n := at(nx, ny)
			if from.has(n) or tiles[n].t == "dead":
				continue
			from[n] = i
			open.append(n)
	var step := goal
	while from[step] != -1 and from[step] != start:
		step = from[step]
	if step != start:
		var s := xy(step)
		p.x = s.x
		p.y = s.y

func _predator_step() -> void:
	var p = pred
	if p == null:
		return
	if p.state == "strike":
		_strike()
		return
	if p.state == "rest":
		p.rest -= 1
		if p.rest <= 0:
			p.state = "hunt"
		return
	var hidden := buried_at(x, y)
	if not hidden:
		p.lx = x
		p.ly = y
	var from := at(p.x, p.y)
	var k := 0
	while k < D.RULE.predator_steps and dist(p.x, p.y, p.lx, p.ly) > 1:
		_predator_move(p, p.lx, p.ly)
		k += 1
	if at(p.x, p.y) != from:
		emit("pred_move", {"from": from, "to": at(p.x, p.y)})
	if hidden or dist(p.x, p.y, x, y) != 1:
		return
	p.dir = 0 if p.y < y else 1 if p.x > x else 2 if p.y > y else 3
	var across := 1 if p.dir % 2 == 0 else 0 # the strike sweeps sideways: step away along its line, or get clear of it
	var marks := []
	for o in [Vector2i(0, 0), Vector2i(DX[across], DY[across]), Vector2i(-DX[across], -DY[across])]:
		var mx: int = x + o.x
		var my: int = y + o.y
		if in_b(mx, my) and tile(mx, my).t != "rock":
			marks.append(at(mx, my))
	p.marks = marks
	p.state = "strike"
	say("%s marks a strike from the %s." % [hab.predator, DIR_NAMES[p.dir]])
	emit("marks", {"marks": marks, "dir": p.dir})

func _rival_step(idx: int) -> void:
	var v: Dictionary = rivals[idx]
	var best := -1
	var bd := 1 << 30
	for i in tiles.size():
		if tiles[i].node == v.eats:
			var c := xy(i)
			var d := dist(v.x, v.y, c.x, c.y)
			if d < bd:
				bd = d
				best = i
	if best < 0:
		return
	var from := at(v.x, v.y)
	var tgt := xy(best)
	var dx := signi(tgt.x - v.x)
	var dy := signi(tgt.y - v.y)
	var tries := [[dx, 0], [0, dy]] if absi(tgt.x - v.x) >= absi(tgt.y - v.y) else [[0, dy], [dx, 0]]
	for o in tries:
		if (o[0] != 0 or o[1] != 0) and in_b(v.x + o[0], v.y + o[1]) and tile(v.x + o[0], v.y + o[1]).t != "rock":
			v.x += o[0]
			v.y += o[1]
			break
	var t := tile(v.x, v.y)
	var ate: bool = t.node == v.eats
	if ate:
		t.node = ""
	emit("rival", {"idx": idx, "from": from, "to": at(v.x, v.y), "ate": ate})


# ---- the world's turn ----
func _hurt_or_shed(why: String) -> void:
	var k = order.pop_back()
	if k != null and slots[k].part != "":
		say("%s: your body absorbs its %s." % [why, D.PARTS[slots[k].part].name.to_lower()])
		emit("shed", {"slot": k, "part": slots[k].part})
		slots[k].part = ""
		return
	say("%s: -1 health." % why)
	health -= 1
	emit("hurt", {"why": why, "health": health})

func _world() -> void:
	food -= upkeep()
	if food < 0:
		food = 0
		_hurt_or_shed("Starving")
	emit("upkeep", {"food": food})
	var t: String = tile().t
	var ev: Dictionary = hab.event
	if not has("blood") and (t == "dead" or (event_on() and (ev.where == "all" or ev.where == t))):
		oxygen -= 1
		if oxygen < 0:
			oxygen = 0
			say("No oxygen: -1 health.")
			health -= 1
			emit("hurt", {"why": "No oxygen", "health": health})
	else:
		oxygen = mini(oxygen_max(), oxygen + 1)
	emit("oxygen", {"oxygen": oxygen})
	for k in rivals.size():
		_rival_step(k)
	_predator_step()
	soft = false
	moulted = false
	reveal()
	if health <= 0:
		health = 0
		phase = "over"
		cause = "died"
		say("You died on turn %d." % turn)
		emit("over", {"cause": cause})
		return
	turn += 1
	if turn == hab.predator_at:
		pred = {"x": hab.entry.x, "y": hab.entry.y, "state": "hunt", "rest": 0, "marks": [], "dir": 1, "lx": x, "ly": y}
		say("%s arrives." % hab.predator)
		emit("pred_arrive", {"at": at(pred.x, pred.y)})
	if ev.name != "" and turn == ev.from:
		say("%s: %s." % [ev.name, ev.text])
		emit("event", {"name": ev.name, "text": ev.text})
	if turn > D.TURNS:
		turn = D.TURNS
		phase = "over"
		cause = "season"
		say("The season ends.")
		emit("over", {"cause": cause})
