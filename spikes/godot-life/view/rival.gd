# A rival worm: crawls to the nearest food it eats. Lilac, so it never reads as a rock.
extends Node2D

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")
const Life := preload("res://rules/life.gd")
const C := D.C
const BODY := Color("#b8a6cc")
const RING := Color("#7d6b93")

static func corner(i: int) -> Vector2:
	var p := Life.xy(i)
	return Vector2(p.x * C, p.y * C)

func move_to(i: int, time: float) -> void:
	var tw := create_tween()
	tw.tween_property(self, "position", corner(i), time).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

func r(x: float, y: float, w: float, h: float, c: Color) -> void:
	draw_rect(Rect2(x, y, w, h), c)

func _draw() -> void:
	r(5, 2, 6, 13, Color(P.INK, 0.55))
	r(4, 4, 8, 10, Color(P.INK, 0.55))
	r(6, 3, 4, 11, BODY)
	r(5, 5, 6, 8, BODY)
	for y in [6, 9, 12]:
		r(5, y, 6, 1, RING)
	for q in [Vector2(5, 2), Vector2(7, 1), Vector2(10, 2)]: # the spiny proboscis
		r(q.x, q.y, 1, 1, P.STONE[2])
	r(7, 4, 2, 1, P.INK)
