# Your body's pixels, in your own frame: +x is forward, +y your right side. Size 1 is a small hatchling;
# size 5 nearly fills its tile. Ported from toys/life2-view.ts.
extends Node2D

const P := preload("res://view/pal.gd")
const K := 1.5 # world pixels per body pixel: a hatchling is easy to miss on a phone at 1

var _cells := {} # Vector2i -> Color, gathered first so the outline hugs the shape

func _px(a: int, b: int, c: Color) -> void:
	_cells[Vector2i(a, b)] = c

func _flush() -> void:
	for q in _cells: # a 1-pixel ink outline, so the body reads on sand and mud alike
		for o in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			if not _cells.has(q + o):
				draw_rect(Rect2((q.x + o.x - 0.5) * K, (q.y + o.y - 0.5) * K, K, K), P.INK)
	for q in _cells:
		draw_rect(Rect2((q.x - 0.5) * K, (q.y - 0.5) * K, K, K), _cells[q])
	_cells.clear()

func _draw() -> void:
	var life = get_parent().life
	if life == null:
		return
	var worm: bool = life.plan == "worm"
	var size: int = life.size
	var half := 1 if worm else 3 if size >= 3 else 2
	var hi: Color = P.STONE[2] if life.soft else P.RARE if worm else P.WARM[2]
	var lo: Color = P.STONE[1] if life.soft else P.WARM[1]
	var length := size * 2 + 3
	var nose := length / 2
	for a in 3:
		for b in range(-half + 1 + (0 if 2 - a > 0 else 1), half - (0 if 2 - a > 0 else 1)):
			_px(nose - a, b, hi)
	for k in size:
		for d in 2:
			for b in range(-half, half + 1):
				_px(nose - 3 - k * 2 - d, b, hi if k % 2 else lo)
	_px(nose, -1 if half > 1 else 0, P.INK) # an eye spot
	for s in life.slots:
		if s.part == "":
			continue
		var ink: Color = P.PART_INK.get(s.part, P.RARE)
		if s.kind == "head":
			_px(nose + 1, -1, ink); _px(nose + 2, -1, ink); _px(nose + 1, 1, ink); _px(nose + 2, 1, ink)
		elif s.kind == "tail":
			_px(nose - length, 0, ink); _px(nose - length - 1, 0, ink)
		else:
			var sg := -1 if s.side == "left" else 1
			var along: int = nose - 3 - mini(s.seg * 2, size - 1) * 2
			_px(along, sg * (half + 1), ink); _px(along, sg * (half + 2), ink)
	_flush()
