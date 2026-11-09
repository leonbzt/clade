# Playtest 20: Join the bodies

## Reported 20C feedback (9 Nov)

User report from chat after playing 20C; device, seed and run count not supplied. Overall: "i think for now its mainly fine."

**Works**
- The body picker (Equip launcher) works. The body viewer "looks cool".
- Grazing is "very nice".
- Parts actually used: Deep Burrow, the food buff (gut), Brood Pouch, Compound Eyes, Bristles. "A lot of effects I never use."

**Rules**
- A hit should cost a life (health) even when a part is torn off. Today a tear absorbs the damage (20A contract).
- The upkeep calculation "doesn't seem correct". AI reading, unconfirmed: with Deep Burrow on mud the HUD and the
  moult cards' "upkeep 0 → N" use the mud value (0) but the next build's number ignores mud; the Body panel's sum
  ignores mud; the Equip card shows a row's own upkeep, not the change to the total.
- Clutch size and the number of parts received: maybe fewer, or scale more with brood size.

**Equipment and moult views**
- Wanted layout: like the lifev2 toy or OSRS, clear and compact slots, with an icon on each part in its slot.
- The starting-size picker isn't needed.
- In a Life, the moult view shows only the options, not the slots, so you don't see what gets replaced.

**Looks**
- Doesn't like the high-res creature with the thick black outline; the new looks are "a little weird still".
- The proboscis starts in the middle of the head.
- Unsure idea: draw only some grown parts (e.g. only the front) to keep the graphics simpler.

**Later**
- More icons and symbols to show information instead of reading text.
- Island: more sea patches next to each other, a reef area, a larger area instead of only a ring (asked before, 8 Nov).

## Fixed (9 Nov)
- A hit costs 1 health and still tears the row (one log line). Upkeep: the moult cards and Body panel use the
  off-mud number; the sum says "0 while on mud (Deep Burrow)"; the HUD says "(on mud)"; launcher cards show only
  the change to the total. Size picker removed (the preview stays at size 1). Proboscis grows from the head's tip,
  slightly longer, without the pale dots that read as eyes. The moult view shows six slots under the creature,
  the replaced one outlined as "old → new".
- Open: 20D (compact slots with icons). The rest is parked in `ideas.md`.
