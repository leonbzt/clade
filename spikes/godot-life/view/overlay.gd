# What changes every frame on the board: the lit destinations, the hunter's entry, and its pulsing strike marks.
extends Node2D

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")
const Life := preload("res://rules/life.gd")
const C := D.C

var life
var dests := {} # shown while you can act
var hover := -1 # desktop: the path under the mouse
var marks: Array = []
var mark_dir := 0
var mark_pop := 0.0 # 0 -> 1 when marks appear
var mark_from := Vector2.ZERO # the hunter's tile centre, for the arrow
var t := 0.0
var pulse_speed := 1.6 # pulses a second

func r(x: float, y: float, w: float, h: float, c: Color) -> void:
	draw_rect(Rect2(x, y, w, h), c)

func set_marks(m: Array, dir: int, from: Vector2) -> void:
	marks = m
	mark_dir = dir
	mark_from = from
	mark_pop = 0.0
	create_tween().tween_property(self, "mark_pop", 1.0, 0.22).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func clear_marks() -> void:
	marks = []

func _process(dt: float) -> void:
	t += dt
	queue_redraw()

func _draw() -> void:
	if life == null:
		return
	var glow := 0.5 + 0.5 * sin(t * TAU * 0.9)
	# the hunter's way in, before it arrives
	if life.pred == null and life.phase != "over" and life.turn < life.hab.predator_at:
		var e: Vector2i = life.hab.entry
		var c := Color(P.WARM[0], 0.6 + 0.4 * glow)
		for k in range(0, C - 2, 4):
			r(e.x * C + 1 + k, e.y * C + 1, 2, 1, c)
			r(e.x * C + 1 + k, e.y * C + C - 2, 2, 1, c)
			r(e.x * C + 1, e.y * C + 1 + k, 1, 2, c)
			r(e.x * C + C - 2, e.y * C + 1 + k, 1, 2, c)
	# lit destinations: corner brackets that breathe
	var gold := Color(P.GOLD, 0.65 + 0.35 * glow)
	for i in dests:
		var p := Life.xy(i)
		var x0 := p.x * C
		var y0 := p.y * C
		var o := 1 if glow > 0.5 else 0
		for q in [[1, 1, 3, 1], [1, 1, 1, 3], [C - 4, 1, 3, 1], [C - 2, 1, 1, 3], [1, C - 2, 3, 1], [1, C - 4, 1, 3], [C - 4, C - 2, 3, 1], [C - 2, C - 4, 1, 3]]:
			var dx := -o if q[0] < 8 else o
			var dy := -o if q[1] < 8 else o
			r(x0 + q[0] + dx, y0 + q[1] + dy, q[2], q[3], gold)
		if dests[i].grab:
			r(x0 + 6, y0 + 6, 4, 4, Color(P.GOLD, 0.5))
	if dests.has(hover):
		for i in dests[hover].path:
			var p := Life.xy(i)
			r(p.x * C + 7, p.y * C + 7, 2, 2, P.GOLD)
		var h := Life.xy(hover)
		r(h.x * C, h.y * C, C, C, Color(1, 0.88, 0.29, 0.22))
	# the strike marks: a red pulse, growing in when they appear
	if marks.is_empty():
		return
	var beat := 0.5 + 0.5 * sin(t * TAU * pulse_speed)
	for i in marks:
		var p := Life.xy(i)
		var s := C * mark_pop
		var x0 := p.x * C + (C - s) / 2.0
		var y0 := p.y * C + (C - s) / 2.0
		r(x0, y0, s, s, Color(0.8, 0.19, 0.12, 0.22 + 0.3 * beat))
		var edge := Color(P.WARM[0].lerp(P.WARM[1], beat), 0.95)
		r(x0, y0, s, 1, edge)
		r(x0, y0 + s - 1, s, 1, edge)
		r(x0, y0, 1, s, edge)
		r(x0 + s - 1, y0, 1, s, edge)
	# an arrow from the hunter toward you
	var dir := (mark_dir + 2) % 4
	var fx := Vector2(Life.DX[dir], Life.DY[dir])
	var rx := Vector2(Life.DX[(dir + 1) % 4], Life.DY[(dir + 1) % 4])
	var base := mark_from + fx * (10 + 2 * beat)
	for a in range(-3, 4):
		_px(base, fx, rx, a, 0, P.GOLD)
	for k in range(1, 4):
		_px(base, fx, rx, 3 - k, -k, P.GOLD)
		_px(base, fx, rx, 3 - k, k, P.GOLD)

func _px(base: Vector2, fx: Vector2, rx: Vector2, a: int, b: int, c: Color) -> void:
	var q := base + fx * a + rx * b
	r(floorf(q.x), floorf(q.y), 1, 1, c)
