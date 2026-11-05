# You: a Node2D at your tile's centre, turned to face the way you last moved. Its Body child draws the pixels
# and carries the squash, so the glide and the squash don't fight.
extends Node2D

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")
const Life := preload("res://rules/life.gd")
const C := D.C

var life
@onready var body: Node2D = $Body

static func centre(i: int) -> Vector2:
	var p := Life.xy(i)
	return Vector2(p.x * C + 8.5, p.y * C + 8.5)

static func dir_rot(d: int) -> float:
	return (d - 1) * PI / 2.0 # east is 0; +y (south) is a quarter turn

func sync() -> void:
	position = centre(Life.at(life.x, life.y))
	rotation = dir_rot(life.facing)
	body.scale = Vector2.ONE
	body.queue_redraw()

func _turn_to(tw: Tween, d: int, time: float) -> void:
	var goal := rotation + wrapf(dir_rot(d) - rotation, -PI, PI)
	tw.tween_property(self, "rotation", goal, time).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

## Glide tile by tile along `path`, stretched along the way and squashed on landing.
func glide(path: Array, glide_time: float, squash: float) -> void:
	var prev := _tile_of(position) # the Life has already moved; animate from where we stand
	for k in path.size():
		var i: int = path[k]
		var a := Life.xy(prev)
		var b := Life.xy(i)
		var d := 1 if b.x > a.x else 3 if b.x < a.x else 2 if b.y > a.y else 0
		var tw := create_tween().set_parallel(true)
		_turn_to(tw, d, glide_time * 0.35)
		var ez := Tween.EASE_IN_OUT if path.size() == 1 else Tween.EASE_IN if k == 0 else Tween.EASE_OUT if k == path.size() - 1 else Tween.EASE_IN_OUT
		var trans := Tween.TRANS_SINE if path.size() == 1 or k == 0 or k == path.size() - 1 else Tween.TRANS_LINEAR
		tw.tween_property(self, "position", centre(i), glide_time).set_trans(trans).set_ease(ez)
		if k == 0:
			tw.tween_property(body, "scale", Vector2(1.0 + squash, 1.0 - squash * 0.7), glide_time * 0.45).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
		await tw.finished
		prev = i
	var land := create_tween()
	land.tween_property(body, "scale", Vector2(1.0 - squash * 0.6, 1.0 + squash * 0.6), glide_time * 0.35).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	land.tween_property(body, "scale", Vector2.ONE, glide_time * 0.9).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	await get_tree().create_timer(glide_time * 0.3).timeout

## Reach for food ahead without moving (a proboscis).
func lunge(d: int, glide_time: float, squash: float) -> void:
	var home := position
	var tw := create_tween()
	_turn_to(tw, d, glide_time * 0.3)
	tw.tween_property(self, "position", home + Vector2(Life.DX[d], Life.DY[d]) * 6.0, glide_time * 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(body, "scale", Vector2(1.0 + squash, 1.0 - squash * 0.5), glide_time * 0.5)
	tw.tween_property(self, "position", home, glide_time * 0.6).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(body, "scale", Vector2.ONE, glide_time * 0.6)
	await tw.finished

## A short bounce in place: laying, moulting.
func bounce(squash: float, time: float = 0.3) -> void:
	var tw := create_tween()
	tw.tween_property(body, "scale", Vector2(1.0 - squash, 1.0 + squash), time * 0.35).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.tween_property(body, "scale", Vector2.ONE, time * 0.65).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	await tw.finished

func flash(c: Color) -> void:
	modulate = c
	create_tween().tween_property(self, "modulate", Color.WHITE, 0.35)

func _tile_of(pos: Vector2) -> int:
	return Life.at(int(pos.x / C), int(pos.y / C))
