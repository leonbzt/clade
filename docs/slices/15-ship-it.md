# Slice 15: ship it

**Milestone:** M1, step 8 (ROADMAP)
**Question:** will strangers play a second Life?
**Builds on:** plan.md and decisions.md, 5 Nov: the first release to itch and a small Discord after the first milestone;
saves, a copy-species code, an itch build (one HTML file you upload), a short itch page text. Discord is yours.

## In
- **Versioned saves:** each save carries its version; older ones are migrated step by step; a save that can't be read is
  kept as a backup (never silently lost) and the game starts fresh with a note. A Save panel: copy your save as text, paste
  one back, or start a new island.
- **A copy-species code:** each of your lines gets a short code (body, niche, habitat, form, verbs, eggs). Pasting a
  friend's code brings their species into your garden as a visitor in that niche, to beat. Made for the Discord.
- **The itch build:** `npm run build:game` → `game/dist/clade.html`, one file, checked to load and play.
- **The itch page text:** `docs/itch.md`.

## Out
- Accounts, a server, leaderboards (cut in plan.md). Discord setup (yours).

## Done when
- [ ] A save survives a reload; an old save migrates; a broken save is kept as a backup.
- [ ] A code copied from one browser adds a visitor in another.
- [ ] `clade.html` loads and plays; `npm run check` passes.

## AI choices to judge
- The code's format (`CLADE-…`, base64 with a checksum) and that a visitor only competes, it never spreads.
