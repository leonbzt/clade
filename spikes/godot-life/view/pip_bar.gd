# A stock as a row of pips that ticks one pip at a time toward its value, with the number on the right.
extends Control

@export var color := Color.WHITE
@export var fixed_max := 0 # 0: no maximum (food)
@export var tick := 0.045 # seconds per pip

var target := 0
var shown := 0
var maxv := 0
var _acc := 0.0
var _flash := {} # pip index -> 0..1
var _bump := 0.0

func set_value(v: int, mx: int = -1, instant: bool = false) -> void:
	target = v
	if mx >= 0:
		maxv = mx
	if instant:
		shown = v
		_flash.clear()
	queue_redraw()

func _process(dt: float) -> void:
	var busy := shown != target or not _flash.is_empty() or _bump > 0.0
	if shown != target:
		_acc += dt
		var step := tick if absi(target - shown) < 10 else tick * 0.5
		while _acc >= step and shown != target:
			_acc -= step
			var up := target > shown
			shown += 1 if up else -1
			_flash[shown - 1 if up else shown] = 1.0
			_bump = 1.0
	else:
		_acc = 0.0
	for k in _flash.keys():
		_flash[k] -= dt * 4.0
		if _flash[k] <= 0.0:
			_flash.erase(k)
	_bump = maxf(0.0, _bump - dt * 6.0)
	if busy:
		queue_redraw()

func _draw() -> void:
	var font := get_theme_default_font()
	var fs := 24
	var num_w := 64.0
	var h := size.y
	var pw := 12.0
	var gap := 3.0
	var cap := int((size.x - num_w) / (pw + gap))
	var n := maxv if fixed_max > 0 or maxv > 0 else cap
	n = mini(n, cap)
	draw_rect(Rect2(0, 0, size.x - num_w + gap, h), Color(0.02, 0.035, 0.043, 0.85))
	for k in n:
		var x := 3.0 + k * (pw + gap)
		var r := Rect2(x, 4, pw, h - 8)
		if k < shown:
			draw_rect(r, color)
			draw_rect(Rect2(x, 4, pw, 3), color.lightened(0.35))
			draw_rect(Rect2(x, h - 7, pw, 3), color.darkened(0.35))
		elif maxv > 0:
			draw_rect(r, Color(color, 0.18))
		if _flash.has(k):
			draw_rect(r.grow(_flash[k] * 2.0), Color(1, 1, 1, _flash[k] * 0.9))
	if shown > cap:
		draw_string(font, Vector2(size.x - num_w - 22, h - 8), "+", HORIZONTAL_ALIGNMENT_LEFT, -1, 22, Color.WHITE)
	var txt := "%d" % shown if maxv == 0 else "%d/%d" % [shown, maxv]
	var s := fs + int(_bump * 4.0)
	draw_string(font, Vector2(size.x - num_w + 10 + 2, h - 7 + 2), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, s, Color(0.02, 0.035, 0.043))
	draw_string(font, Vector2(size.x - num_w + 10, h - 7), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, s, Color.WHITE)
