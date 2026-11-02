# Playtest 10: the first animals (28 Oct)

Your notes from chat, condensed, plus what the code shows.

**Liked**
- Arrivals work. The animal card works and is cute; nothing to do there yet.
- High numbers feel good (a broad base of litter eaters is fine, and realistic), but only a few should be shown.

**Problems**
- **Snails get stuck on the beach** and don't move on; only after a long time did a variant evolve that left.
  Cause: `lookAround` wanders only when nothing in sight has any food, so a poor beach pins them; young are born on
  the parent's tile and never disperse; snails see 3 tiles and walk 0.15 tiles/s.
- **Springtails and bristletails spread everywhere** and overwhelm the screen. Cause: litter never limits them
  (springtails gain ~1.6× their upkeep on any tile with a little litter and eat too little to run it out), so the
  caps decide.
- **The map changed a lot: nitrogen flowed outward**, and mosses and plants colonised the whole island. Cause:
  litter normally decays into nothing, but eaten litter becomes nitrogen (0.4 per unit), so litter eaters make new
  nitrogen wherever they go. Breaks the pillar "nitrogen mustn't be high everywhere" and kills contrast.
- **No bitter mosses seen.** Follows from the above: grazing stays at the beach, and fast regrowth on rich
  nitrogen makes Bitter's growth cost lose.

**Your calls**
- **Animals as groups** (P21 a): one agent stands for a family, troop or swarm; big, rare animals stay close to 1:1.
- Look at predation as a control. Established populations may move behind the scenes to save compute and visuals.
- **Contrast between regions is really important.** Regions, chunks or biomes could give bigger differences
  automatically: a strategic view of the island, click "sunny slope" for the detailed view.
- **Focus on the player's part very soon.** The watchable ecosystem "screensaver" is good, but it needs an active
  part. The solid sim was meant to ground that and suggest fitting ideas; now is a good point to start.

**Next:** slice 10b (groups and a balance pass), then plan the player's part. See P21 in `systems.md`.
