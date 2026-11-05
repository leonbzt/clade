# The hunter: swims over rock, faces you when it marks, lunges when it strikes. Ported shape from toys/life2-view.ts.
extends Node2D

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")
const Life := preload("res://rules/life.gd")
const C := D.C

var life
var resting := false

static func centre(i: int) -> Vector2:
	var p := Life.xy(i)
	return Vector2(p.x * C + 8.5, p.y * C + 8.5)

func sync() -> void:
	visible = life.pred != null
	if not visible:
		return
	position = centre(Life.at(life.pred.x, life.pred.y))
	resting = life.pred.state == "rest"
	if life.pred.state == "strike":
		face((life.pred.dir + 2) % 4)
	queue_redraw()

func face(d: int) -> void:
	rotation = (d - 1) * PI / 2.0

func appear(i: int) -> void:
	visible = true
	position = centre(i)
	face(3)
	scale = Vector2(0.2, 0.2)
	modulate = Color(1, 1, 1, 0)
	var tw := create_tween().set_parallel(true)
	tw.tween_property(self, "scale", Vector2.ONE, 0.45).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(self, "modulate", Color.WHITE, 0.3)
	await tw.finished

func move_to(i: int, time: float) -> void:
	var goal := centre(i)
	var d := goal - position
	if d.length() > 0.1:
		var rot := d.angle()
		var tw := create_tween().set_parallel(true)
		tw.tween_property(self, "rotation", rotation + wrapf(rot - rotation, -PI, PI), time * 0.3)
		tw.tween_property(self, "position", goal, time).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
		await tw.finished

## Dart at the tile and back.
func lunge(i: int, time: float) -> void:
	var home := position
	var goal := home.lerp(centre(i), 0.7)
	var tw := create_tween()
	tw.tween_property(self, "position", home - (goal - home) * 0.15, time * 0.35).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.tween_property(self, "position", goal, time * 0.25).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)
	await tw.finished
	var back := create_tween()
	back.tween_property(self, "position", home, time * 0.6).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

func _px(a: int, b: int, c: Color) -> void:
	draw_rect(Rect2(a - 0.5, b - 0.5, 1, 1), c)

func _draw() -> void:
	for a in range(-8, 9):
		for b in range(-6, 7):
			if absi(b) <= (4 if a > 0 else 3 if a < -4 else 5) + (1 if a >= 3 and a <= 7 else 0):
				_px(a, b, Color(P.INK, 0.5))
	for a in range(-7, 4):
		var w := 3 if a > 0 else 2 if a < -4 else 4
		for b in range(-w, w + 1):
			_px(a, b, P.WARM[0])
	for s in [-1, 1]:
		for a in range(3, 8):
			_px(a, s * 3, P.WARM[1])
		_px(7, s * 2, P.WARM[1])
		_px(2, s * 4, P.INK)
		_px(2, s * 3, P.WARM[2])
	for a in range(-6, 1, 2):
		_px(a, -5, P.WARM[1])
		_px(a, 5, P.WARM[1])
	if resting:
		_px(-2, -1, P.STONE[2])
		_px(-2, 1, P.STONE[2])
