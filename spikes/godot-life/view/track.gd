# The season as 20 cells: done, now, ahead. A red notch where the hunter comes, an orange edge on the mudslide turns.
extends Control

const P := preload("res://view/pal.gd")

var turns := 20
var turn := 1
var pred_at := 6
var ev_from := 12
var ev_to := 15

func set_turn(t: int) -> void:
	turn = t
	queue_redraw()

func _draw() -> void:
	var gap := 3.0
	var w := (size.x - gap * (turns - 1)) / turns
	var h := size.y
	for k in turns:
		var t := k + 1
		var x := k * (w + gap)
		var r := Rect2(x, 0, w, h)
		draw_rect(r, P.INK)
		var fill: Color = P.GOLD if t == turn else Color("#3c5560") if t < turn else Color("#1b2a30")
		draw_rect(r.grow(-2), fill)
		if t >= ev_from and t <= ev_to:
			draw_rect(r.grow(-1), P.WARM[1], false, 2.0)
		if t == pred_at:
			draw_rect(Rect2(x + w * 0.5 - 3, 2, 6, h - 4), P.WARM[0])
