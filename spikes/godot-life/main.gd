# The mud flats Life: input, the camera, and playing each turn's events back with feel.
# The five feel values below are yours to tune: select Main in the scene tree and drag them in the inspector.
# While the game runs, change them live in the Remote tree (Scene panel > Remote > Main).
extends Node2D

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")
const Life := preload("res://rules/life.gd")
const RivalView := preload("res://view/rival.gd")
const C := D.C
const BOARD := Vector2(D.COLS * C, D.ROWS * C)

@export_group("Feel")
## Seconds per tile when you glide.
@export_range(0.03, 0.6, 0.01) var glide_time := 0.16
## How much you stretch on the move and squash on landing (0 = rigid).
@export_range(0.0, 0.6, 0.01) var squash := 0.3
## Particles when you eat.
@export_range(0, 60, 1) var particle_count := 14
## How hard a strike shakes the camera, in screen pixels.
@export_range(0.0, 40.0, 0.5) var shake := 10.0
## How fast pinch and the mouse wheel zoom.
@export_range(0.2, 3.0, 0.05) var zoom_speed := 1.0

@onready var cam: Camera2D = $Camera2D
@onready var board = $Board
@onready var overlay = $Board/Overlay
@onready var creature = $Board/Creature
@onready var predator = $Board/Predator
@onready var rivals_root: Node2D = $Board/Rivals
@onready var fx = $Board/Fx
@onready var hud = $Hud

var life
var busy := false
var zoom := 1.0
var fit := 0.0
var look := BOARD / 2.0
var shake_t := 0.0
var shake_amt := 0.0
var touches := {}
var drag_from := Vector2.ZERO
var dragging := false
var multi := false
var pinch_d := 0.0
var mouse_down := false
var _area := Rect2()


func _ready() -> void:
	randomize()
	hud.wait_pressed.connect(func(): act(func(): life.stay()))
	hud.lay_pressed.connect(func(): act(func(): life.lay()))
	hud.moult_pressed.connect(_moult)
	new_life()
	_start_card.call_deferred()


func new_life() -> void:
	life = Life.new(randi())
	for n in [board, overlay, creature, predator]:
		n.life = life
	for c in rivals_root.get_children():
		c.queue_free()
	for v in life.rivals:
		var r := Node2D.new()
		r.set_script(RivalView)
		rivals_root.add_child(r)
	board.ghosts = {}
	overlay.clear_marks()
	sync_all(true)
	hud.info("Tap a lit tile to move.")


func _start_card() -> void:
	var h: Dictionary = life.hab
	hud.show_card(h.name, "%s\n\nYou are a worm. In mud you tunnel and strikes miss you. Grow to size %d to lay eggs.\n%s comes on turn %d. %s on turns %d-%d: %s." % [
		h.blurb, D.RULE.adult_size, h.predator, h.predator_at, h.event.name, h.event.from, h.event.to, h.event.text],
		[["Start", func(): hud.hide_card()]])


func sync_all(instant: bool = false) -> void:
	board.refresh()
	creature.sync()
	predator.sync()
	var kids := rivals_root.get_children()
	for k in life.rivals.size():
		kids[k].position = RivalView.corner(Life.at(life.rivals[k].x, life.rivals[k].y))
	if life.pred != null and life.pred.state == "strike":
		if overlay.marks != life.pred.marks:
			overlay.set_marks(life.pred.marks, life.pred.dir, predator.position)
	else:
		overlay.clear_marks()
	overlay.dests = life.dests() if not busy else {}
	hud.refresh(life, instant)


# ---- acting ----
func act(f: Callable) -> void:
	if busy or life.phase != "play" or hud.card.visible:
		return
	busy = true
	overlay.dests = {}
	overlay.hover = -1
	f.call()
	var evs: Array = life.events.duplicate()
	if evs.is_empty():
		busy = false
		sync_all()
		return
	await play(evs)
	busy = false
	sync_all()
	var said: Array = life.lines.slice(-2)
	hud.info(" ".join(said))
	if life.phase == "over":
		await get_tree().create_timer(0.5).timeout
		_end_card()


func _moult() -> void:
	if busy or not life.can_moult() or hud.card.visible:
		return
	life.moult()
	hud.set_food(life.food)
	creature.bounce(squash, 0.4)
	fx.burst(creature.position, P.RARE, particle_count, 0.7)
	var buttons := []
	for id in life.offers:
		var part: Dictionary = D.PARTS[id]
		var k: int = life.free_slot_for(id)
		var note: String = part.does
		if k >= 0 and life.slots[k].part != "":
			note += " Replaces your %s." % D.PARTS[life.slots[k].part].name.to_lower()
		buttons.append([("Rare: " if part.get("rare", false) else "") + part.name, _pick.bind(id), note])
	hud.show_card("Moult: size %d" % life.size, "Pick a part for your new body.", buttons)


func _pick(id: String) -> void:
	hud.hide_card()
	life.pick(id)
	creature.body.queue_redraw()
	creature.bounce(squash)
	fx.burst(creature.position, P.PART_INK.get(id, P.RARE), particle_count, 0.8)
	sync_all()
	hud.info("%s: %s" % [D.PARTS[id].name, D.PARTS[id].does])


func _end_card() -> void:
	var tier: String = life.tier_of(life.eggs)
	var title := "The season ends" if life.cause == "season" else "You died on turn %d" % life.turn
	var nt: Array = life.next_tier(life.eggs)
	var text := "You laid %d eggs: tier %s on the mud flats.%s" % [life.eggs, tier, "\n%s needs %d." % [nt[0], nt[1]] if nt.size() > 0 else ""]
	hud.show_card(title, text, [["Live again", func():
		hud.hide_card()
		new_life()
		_start_card()]])


## Play a turn's events back in order: glide, eat, the world's turn, the hunter.
func play(evs: Array) -> void:
	for e in evs: # food that is eaten this turn stays drawn until its moment comes
		if e.k == "eat":
			board.ghosts[e.i] = e.node
		elif e.k == "rival" and e.ate:
			board.ghosts[e.to] = life.rivals[e.idx].eats
	board.refresh()
	for e in evs:
		match e.k:
			"move":
				if e.grab:
					await creature.lunge(e.dir, glide_time, squash)
				else:
					await creature.glide(e.path, glide_time, squash)
				board.refresh() # fog lifts
			"eat":
				board.ghosts.erase(e.i)
				board.refresh()
				var at := tile_centre(e.i)
				fx.burst(at, P.NODE_INK.get(e.node, P.GOLD), particle_count)
				hud.floater(_to_screen(at), "+%d" % e.gain, P.GOLD)
				hud.set_food(e.food)
			"locked":
				hud.floater(_to_screen(tile_centre(e.i)), "locked", Color("#ff6a4c"))
			"lay":
				await creature.bounce(squash, glide_time * 2.0)
				fx.burst(creature.position, P.GOLD, particle_count, 0.6)
				hud.floater(_to_screen(creature.position), "+%d eggs" % e.n, P.GOLD)
				hud.set_eggs(e.eggs, life.tier_of(e.eggs))
				hud.set_food(e.food)
			"stay":
				await creature.bounce(squash * 0.4, glide_time * 1.5)
			"upkeep":
				hud.set_food(e.food)
			"shed":
				creature.body.queue_redraw()
				hud.floater(_to_screen(creature.position), "-" + D.PARTS[e.part].name.to_lower(), Color("#ff6a4c"))
			"hurt":
				hud.set_health(e.health)
				creature.flash(Color(2, 0.6, 0.5))
				hud.flash(Color(0.8, 0.1, 0.05, 0.25))
			"oxygen":
				hud.set_oxygen(e.oxygen)
			"rival":
				var node: Node2D = rivals_root.get_child(e.idx)
				var to: int = e.to
				var ate: bool = e.ate
				node.move_to(to, glide_time * 1.2)
				if ate:
					get_tree().create_timer(glide_time * 1.2).timeout.connect(func():
						board.ghosts.erase(to)
						board.refresh()
						fx.burst(RivalView.corner(to) + Vector2(8, 8), P.STONE[2], particle_count / 2))
			"pred_arrive":
				hud.banner("%s arrives" % life.hab.predator, Color("#ff6a4c"))
				await predator.appear(e.at)
			"pred_move":
				await predator.move_to(e.to, glide_time * 1.6)
			"marks":
				predator.face((e.dir + 2) % 4)
				overlay.set_marks(e.marks, e.dir, predator.position)
			"strike":
				await predator.lunge(e.at, glide_time * 2.2)
				overlay.clear_marks()
				_strike_feel(e)
			"event":
				hud.banner("%s: %s" % [e.name, e.text], P.WARM[1])
				board.refresh()
	await get_tree().create_timer(0.05).timeout


func _strike_feel(e: Dictionary) -> void:
	var at: Vector2 = creature.position
	match e.kind:
		"hit":
			shake_cam(1.0)
			creature.flash(Color(2.2, 0.5, 0.4))
			hud.flash(Color(0.8, 0.1, 0.05, 0.35))
			fx.burst(at, P.WARM[0], particle_count, 1.3)
			hud.set_health(e.health)
			if e.part != "":
				creature.body.queue_redraw()
				hud.floater(_to_screen(at), "-" + D.PARTS[e.part].name.to_lower(), Color("#ff6a4c"))
			else:
				hud.floater(_to_screen(at), "-%d health" % e.damage, Color("#ff6a4c"))
		"blocked":
			shake_cam(0.55)
			fx.burst(at, P.STONE[2], particle_count, 1.1)
			hud.floater(_to_screen(at), "blocked", P.STONE[2])
		"buried":
			shake_cam(0.3)
			hud.floater(_to_screen(at), "buried", P.EARTH[4])
		_:
			shake_cam(0.3)
			hud.floater(_to_screen(at), "miss", P.STEEL)


static func tile_centre(i: int) -> Vector2:
	var p := Life.xy(i)
	return Vector2(p.x * C + 8.5, p.y * C + 8.5)


# ---- the camera: fit, pan, pinch-zoom, shake ----
func shake_cam(strength: float) -> void:
	shake_amt = shake * strength
	shake_t = 1.0

func _refit() -> void:
	var area: Rect2 = hud.board_rect()
	if area.size.x < 10 or area.size.y < 10:
		return
	var old := fit
	fit = minf(area.size.x / (BOARD.x + 14), area.size.y / (BOARD.y + 14))
	zoom = fit if old <= 0.0 else zoom / old * fit
	_clamp()
	print("board area ", area, " fit ", fit) # read by the spike's browser check

func _clamp() -> void:
	zoom = clampf(zoom, fit * 0.8, fit * 3.0)
	look = look.clamp(Vector2.ZERO, BOARD)

func _process(dt: float) -> void:
	shake_t = maxf(0.0, shake_t - dt / 0.45)
	var area: Rect2 = hud.board_rect()
	if area != _area: # first layout, a resize or a phone turned around
		_area = area
		_refit()
	var vp := get_viewport_rect().size
	var off := Vector2.ZERO
	if shake_t > 0.0:
		off = Vector2(randf_range(-1, 1), randf_range(-1, 1)) * shake_amt * shake_t * shake_t
	cam.zoom = Vector2(zoom, zoom)
	cam.position = look - (area.get_center() - vp / 2.0) / zoom + off / zoom

func _to_world(s: Vector2) -> Vector2:
	return look + (s - hud.board_rect().get_center()) / zoom

func _to_screen(w: Vector2) -> Vector2:
	return hud.board_rect().get_center() + (w - look) * zoom

func _zoom_at(s: Vector2, factor: float) -> void:
	var before := _to_world(s)
	zoom *= factor
	_clamp()
	look += before - _to_world(s)
	_clamp()

func _pinch() -> Array: # [distance, midpoint] of the first two fingers
	var ps: Array = touches.values()
	return [ps[0].distance_to(ps[1]), (ps[0] + ps[1]) / 2.0]


# ---- input ----
func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventScreenTouch:
		if e.pressed:
			if touches.is_empty() and not hud.board_rect().has_point(e.position):
				return
			touches[e.index] = e.position
			if touches.size() == 1:
				drag_from = e.position
				dragging = false
				multi = false
			else:
				multi = true
				pinch_d = _pinch()[0]
		elif touches.has(e.index):
			touches.erase(e.index)
			if touches.is_empty() and not dragging and not multi:
				_tap(e.position)
			elif touches.size() == 1:
				dragging = true # one finger left after a pinch: keep panning, never tap
	elif e is InputEventScreenDrag:
		if not touches.has(e.index):
			return
		var prev: Vector2 = touches[e.index]
		touches[e.index] = e.position
		if touches.size() == 1:
			if not dragging and e.position.distance_to(drag_from) > 12.0:
				dragging = true
			if dragging:
				look -= (e.position - prev) / zoom
				_clamp()
		else:
			var pm: Array = _pinch()
			if pinch_d > 0.0:
				_zoom_at(pm[1], pow(pm[0] / pinch_d, zoom_speed))
			pinch_d = pm[0]
			look -= (e.position - prev) / zoom / touches.size()
			_clamp()
	elif e is InputEventMouseButton and e.device != InputEvent.DEVICE_ID_EMULATION:
		if not hud.board_rect().has_point(e.position) and not mouse_down:
			return
		if e.pressed and (e.button_index == MOUSE_BUTTON_WHEEL_UP or e.button_index == MOUSE_BUTTON_WHEEL_DOWN):
			var f := pow(1.12, zoom_speed)
			_zoom_at(e.position, f if e.button_index == MOUSE_BUTTON_WHEEL_UP else 1.0 / f)
		elif e.button_index == MOUSE_BUTTON_LEFT:
			if e.pressed:
				mouse_down = true
				dragging = false
				drag_from = e.position
			elif mouse_down:
				mouse_down = false
				if not dragging:
					_tap(e.position)
	elif e is InputEventMouseMotion and e.device != InputEvent.DEVICE_ID_EMULATION:
		if mouse_down:
			if not dragging and e.position.distance_to(drag_from) > 6.0:
				dragging = true
			if dragging:
				look -= e.relative / zoom
				_clamp()
		elif not busy:
			var w := _to_world(e.position)
			overlay.hover = Life.at(floori(w.x / C), floori(w.y / C)) if Life.in_b(floori(w.x / C), floori(w.y / C)) else -1
	elif e is InputEventMagnifyGesture:
		_zoom_at(e.position, pow(e.factor, zoom_speed))
	elif e is InputEventPanGesture:
		look += e.delta * 6.0 / zoom
		_clamp()
	elif e is InputEventKey and e.pressed and not e.echo:
		match e.keycode:
			KEY_W, KEY_SPACE: act(func(): life.stay())
			KEY_L: act(func(): life.lay())
			KEY_M: _moult()
			KEY_0: zoom = fit; look = BOARD / 2.0


func _tap(s: Vector2) -> void:
	var w := _to_world(s)
	var tx := floori(w.x / C)
	var ty := floori(w.y / C)
	if busy or not Life.in_b(tx, ty) or hud.card.visible:
		return
	var i := Life.at(tx, ty)
	if life.phase == "play" and life.dests().has(i):
		act(func(): life.move(i))
	else:
		hud.info(_tile_text(i))


func _tile_text(i: int) -> String:
	var t: Dictionary = life.tiles[i]
	if life.pred != null and Life.at(life.pred.x, life.pred.y) == i:
		return "%s, the hunter. It swims over rock and strikes the tiles it marks; mud hides you." % life.hab.predator
	for v in life.rivals:
		if Life.at(v.x, v.y) == i:
			return "%s. It eats %s." % [v.name.capitalize(), D.NODES[v.eats].name.to_lower()]
	if Life.at(life.x, life.y) == i:
		return "You: %s, size %d. Wait to stay put." % [D.PLANS[life.plan].name.to_lower(), life.size]
	if t.t == "mud" and not t.seen:
		return "Mud. You can't see what's buried here yet."
	var s: String = D.TERRAIN[t.t]
	if t.node != "":
		s = "%s, %d food" % [D.NODES[t.node].name, D.NODES[t.node].food + life.count("gut") * D.RULE.gut_food]
		var lock: String = life.lock_of(t.node)
		if lock != "":
			s += ": " + lock
	elif t.t == "mud":
		s += ": you tunnel through it, and strikes miss you here."
	elif t.t == "rock":
		s += ": only the hunter crosses it."
	if life.phase == "play":
		s += ". Out of reach this turn." if not s.ends_with(".") else " Out of reach this turn."
	return s
