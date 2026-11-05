# The screen around the board: season track, eggs, stocks, the three buttons, and the cards (start, moult, end).
extends CanvasLayer

signal wait_pressed
signal moult_pressed
signal lay_pressed

const D := preload("res://rules/data.gd")
const P := preload("res://view/pal.gd")

@onready var area: Control = $Root/BoardArea
@onready var turn_l: Label = $Root/TopMargin/Top/VBox/Row/Turn
@onready var eggs_l: Label = $Root/TopMargin/Top/VBox/Row/Eggs
@onready var tier_l: Label = $Root/TopMargin/Top/VBox/Row/Tier
@onready var track = $Root/TopMargin/Top/VBox/Track
@onready var info_l: Label = $Root/BottomMargin/Bottom/VBox/Info
@onready var food_bar = $Root/BottomMargin/Bottom/VBox/Stocks/FoodBar
@onready var oxy_bar = $Root/BottomMargin/Bottom/VBox/Stocks/OxygenBar
@onready var hp_bar = $Root/BottomMargin/Bottom/VBox/Stocks/HealthBar
@onready var body_l: Label = $Root/BottomMargin/Bottom/VBox/BodyLine
@onready var wait_b: Button = $Root/BottomMargin/Bottom/VBox/Buttons/Wait
@onready var moult_b: Button = $Root/BottomMargin/Bottom/VBox/Buttons/Moult
@onready var lay_b: Button = $Root/BottomMargin/Bottom/VBox/Buttons/Lay
@onready var banner_l: Label = $Overlay/Banner
@onready var floaters: Control = $Overlay/Floaters
@onready var flash_r: ColorRect = $Overlay/Flash
@onready var card: PanelContainer = $Overlay/Card
@onready var card_title: Label = $Overlay/Card/VBox/Title
@onready var card_text: Label = $Overlay/Card/VBox/Text
@onready var card_buttons: VBoxContainer = $Overlay/Card/VBox/Buttons

var _banner_tw: Tween

func _ready() -> void:
	wait_b.pressed.connect(func(): wait_pressed.emit())
	moult_b.pressed.connect(func(): moult_pressed.emit())
	lay_b.pressed.connect(func(): lay_pressed.emit())
	card.hide()
	banner_l.modulate.a = 0.0
	get_viewport().size_changed.connect(_layout)
	_layout()

## On a wide screen (desktop), keep the phone's column in the middle.
func _layout() -> void:
	var vp := get_viewport().get_visible_rect().size
	var w := minf(vp.x, maxf(540.0, vp.y * 0.62))
	$Root.offset_left = (vp.x - w) / 2.0
	$Root.offset_right = -(vp.x - w) / 2.0

func board_rect() -> Rect2:
	return area.get_global_rect()

func refresh(life, instant: bool = false) -> void:
	turn_l.text = "Turn %d/%d" % [life.turn, D.TURNS]
	set_eggs(life.eggs, life.tier_of(life.eggs))
	track.pred_at = life.hab.predator_at
	track.ev_from = life.hab.event.from
	track.ev_to = life.hab.event.to
	track.set_turn(life.turn)
	food_bar.set_value(life.food, -1, instant)
	oxy_bar.set_value(life.oxygen, life.oxygen_max(), instant)
	hp_bar.set_value(life.health, D.RULE.health, instant)
	var nt: Array = life.next_tier(life.eggs)
	body_l.text = "%s, size %d (%s) · upkeep %d a turn%s" % [D.PLANS[life.plan].name, life.size, life.stage(), life.upkeep(),
		" · lay from size %d" % D.RULE.adult_size if not life.mature() else " · %s at %d eggs" % [nt[0], nt[1]] if nt.size() > 0 else ""]
	var play: bool = life.phase == "play"
	wait_b.disabled = not play
	moult_b.text = "Full grown" if life.size >= D.RULE.max_size else "Moult -%d" % life.moult_cost()
	moult_b.disabled = not life.can_moult()
	lay_b.text = "Lay +%d" % life.clutch() if life.mature() else "Lay (size %d)" % D.RULE.adult_size
	lay_b.disabled = not life.can_lay()

func set_food(v: int) -> void: food_bar.set_value(v)
func set_oxygen(v: int) -> void: oxy_bar.set_value(v)
func set_health(v: int) -> void: hp_bar.set_value(v)

func set_eggs(n: int, tier: String) -> void:
	eggs_l.text = "Eggs %d" % n
	tier_l.text = tier
	tier_l.add_theme_color_override("font_color", {"S": P.GOLD, "A": Color("#6cc644"), "B": Color("#4fc0d0"), "C": Color("#cfd9de")}.get(tier, Color("#ff6a4c")))

func info(text: String) -> void:
	info_l.text = text

func banner(text: String, c: Color = P.GOLD) -> void:
	banner_l.text = text
	banner_l.add_theme_color_override("font_color", c)
	var r := board_rect()
	banner_l.size = Vector2(r.size.x, 40)
	banner_l.position = Vector2(r.position.x, r.position.y + 12)
	if _banner_tw:
		_banner_tw.kill()
	_banner_tw = create_tween()
	banner_l.modulate.a = 0.0
	_banner_tw.tween_property(banner_l, "modulate:a", 1.0, 0.2)
	_banner_tw.tween_interval(1.6)
	_banner_tw.tween_property(banner_l, "modulate:a", 0.0, 0.5)

## Text that rises from a point on the screen and fades.
func floater(at: Vector2, text: String, c: Color) -> void:
	var l := Label.new()
	l.text = text
	l.add_theme_color_override("font_color", c)
	l.add_theme_font_size_override("font_size", 28)
	floaters.add_child(l)
	l.position = at - Vector2(l.get_minimum_size().x / 2.0, 46)
	var tw := l.create_tween().set_parallel(true)
	tw.tween_property(l, "position:y", l.position.y - 44, 0.9).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.tween_property(l, "modulate:a", 0.0, 0.5).set_delay(0.45)
	tw.chain().tween_callback(l.queue_free)

func flash(c: Color) -> void:
	flash_r.color = c
	create_tween().tween_property(flash_r, "color:a", 0.0, 0.4)

## A centred card with a title, some text and a column of buttons: [[label, callable], ...].
func show_card(title: String, text: String, buttons: Array) -> void:
	card_title.text = title
	card_text.text = text
	card_text.visible = text != ""
	for b in card_buttons.get_children():
		b.queue_free()
	for spec in buttons:
		var b := Button.new()
		b.text = spec[0]
		b.custom_minimum_size = Vector2(0, 76)
		b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		if spec.size() > 2 and spec[2] != "":
			b.text += "\n" + spec[2]
			b.add_theme_font_size_override("font_size", 22)
		b.pressed.connect(spec[1])
		card_buttons.add_child(b)
	card.show()
	card.reset_size()
	card.pivot_offset = card.size / 2.0
	card.scale = Vector2(0.92, 0.92)
	card.modulate.a = 0.0
	var tw := create_tween().set_parallel(true)
	tw.tween_property(card, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(card, "modulate:a", 1.0, 0.18)

func hide_card() -> void:
	card.hide()
