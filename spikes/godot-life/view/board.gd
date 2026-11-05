# The habitat board: terrain, fog, food nodes. Redrawn only when the Life changes (refresh).
extends Node2D

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")
const Life := preload("res://rules/life.gd")
const C := D.C

var life
var ghosts := {} # tile -> node: food still drawn until its eat plays back

func refresh() -> void:
	queue_redraw()

func r(x: float, y: float, w: float, h: float, c: Color) -> void:
	draw_rect(Rect2(x, y, w, h), c)

func _draw() -> void:
	if life == null:
		return
	# a dark frame around the board
	r(-4, -4, D.COLS * C + 8, D.ROWS * C + 8, P.INK)
	for i in life.tiles.size():
		_terrain(i)
	for i in life.tiles.size():
		var t: Dictionary = life.tiles[i]
		var node: String = ghosts.get(i, t.node)
		if node == "" or not Life.known(t):
			continue
		var p := Life.xy(i)
		var lock: String = life.lock_of(node)
		_node_art(node, p.x * C, p.y * C, 0.45 if lock != "" else 1.0)
		if lock != "":
			r(p.x * C + 10, p.y * C + 1, 5, 5, P.INK)
			r(p.x * C + 11, p.y * C + 2, 3, 3, P.WARM[0])

func _terrain(i: int) -> void:
	var p := Life.xy(i)
	var x0 := p.x * C
	var y0 := p.y * C
	var t: Dictionary = life.tiles[i]
	var slide: bool = life.event_on() and life.hab.event.where == t.t and life.phase != "over"
	match t.t:
		"sand":
			r(x0, y0, C, C, P.SKY[2])
			_speck(p, 6, P.SKY[3], 0)
			_speck(p, 3, P.SKY[1], 1)
		"mud":
			var lit := 3 if t.seen else 2
			r(x0, y0, C, C, P.EARTH[lit - 1] if slide else P.EARTH[lit])
			_speck(p, 7, P.EARTH[mini(4, lit + 1)], 2)
		"rock":
			r(x0, y0, C, C, P.SKY[1])
			r(x0 + 2, y0 + 3, 12, 11, P.STONE[0])
			r(x0 + 3, y0 + 2, 10, 10, P.STONE[1])
			r(x0 + 4, y0 + 3, 5, 3, P.STONE[2])
	r(x0 + C - 1, y0, 1, C, Color(0.02, 0.035, 0.043, 0.18))
	r(x0, y0 + C - 1, C, 1, Color(0.02, 0.035, 0.043, 0.18))

func _speck(p: Vector2i, n: int, c: Color, s: int) -> void:
	for k in n:
		var sx := int(P.hash3(p.x, p.y * 7 + k, 3 + s * 11) * C)
		var sy := int(P.hash3(p.x * 5 + k, p.y, 4 + s * 13) * C)
		r(p.x * C + sx, p.y * C + sy, 1, 1, c)

func _node_art(id: String, x: int, y: int, a: float) -> void:
	var m := Color(1, 1, 1, a)
	match id:
		"mat":
			r(x + 3, y + 5, 10, 7, P.LEAF[2] * m)
			r(x + 5, y + 4, 6, 9, P.LEAF[2] * m)
			r(x + 5, y + 6, 3, 2, P.LEAF[3] * m)
			r(x + 9, y + 9, 2, 2, P.LEAF[3] * m)
		"buried":
			r(x + 3, y + 8, 10, 5, P.EARTH[4] * m)
			r(x + 5, y + 6, 6, 3, P.EARTH[4] * m)
			r(x + 6, y + 8, 2, 2, P.WARM[1] * m)
			r(x + 10, y + 10, 1, 1, P.WARM[1] * m)
		"shell":
			for o in [Vector2i(3, 4), Vector2i(8, 7), Vector2i(3, 10)]:
				r(x + o.x, y + o.y, 5, 3, P.STONE[2] * m)
				r(x + o.x + 1, y + o.y - 1, 3, 1, P.STONE[2] * m)
				r(x + o.x + 2, y + o.y, 1, 3, P.STONE[1] * m)
		"carcass":
			r(x + 2, y + 6, 12, 5, P.WARM[0] * m)
			r(x + 3, y + 5, 3, 7, P.RARE * m)
			for k in range(7, 13, 2):
				r(x + k, y + 5, 1, 7, P.STONE[2] * m)
