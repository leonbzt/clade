# One-shot particle bursts on the board.
extends Node2D

func burst(pos: Vector2, c: Color, n: int, speed: float = 1.0) -> void:
	if n <= 0:
		return
	var p := CPUParticles2D.new()
	p.one_shot = true
	p.amount = n
	p.lifetime = 0.6
	p.explosiveness = 1.0
	p.local_coords = false
	p.direction = Vector2(0, -1)
	p.spread = 180.0
	p.initial_velocity_min = 18.0 * speed
	p.initial_velocity_max = 52.0 * speed
	p.damping_min = 30.0
	p.damping_max = 60.0
	p.gravity = Vector2(0, 40)
	p.scale_amount_min = 1.0
	p.scale_amount_max = 2.2
	var ramp := Gradient.new()
	ramp.set_color(0, c.lightened(0.35))
	ramp.set_color(1, Color(c, 0.0))
	p.color_ramp = ramp
	p.position = pos
	add_child(p)
	p.emitting = true
	p.finished.connect(p.queue_free)
