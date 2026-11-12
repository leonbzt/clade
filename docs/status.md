# Status

- **Milestone:** M2, step 11, **N4 Who eats whom**, on branch `n4-who-eats-whom`. All parts A–G built; only your
  four-Life play is left. [Spec](slices/n4-who-eats-whom.md).
- **Done (12 Nov, this session):**
  - No shadow: `BOARD.shadow` false in `clade/src/data/boards.ts`; a board has a predator only when a sea hunter that
    can eat you lives there (`sim/board.ts`). Brace yields to a hunter that beats armour (`sim/life-body.ts`; the
    verb note says "won't hold"). Tests in `tests/sea-hunter.test.ts`, `tests/board.test.ts`.
  - F: `clade/src/view/living.ts`, capsules per population (`LIVING` in `data/sea.ts`), drawn by `view/map.ts`, synced
    in `ui/App.svelte`; hunters chase, prey flee, yours carry a gold pixel.
  - G: `clade/src/ui/replay.ts` plays the run's `frames` (now in `ui/sea-run.ts`) over 4 s (`REPLAY`): arrivals enter at
    the shared border, buds flash and shout their name, the lost fade; tap to skip. Then `ui/Notes.svelte`; a notes
    button on the bar reopens it. Look script `scripts/look/n4-g.json` (phone) plus one desktop shot; `tests/living.test.ts`.
- **Verified:** `npm run check` passes in 7.6 s. Commits: `0f14f96`, `4397c19` (F), `8b78d8b` (G).
- **Decided (12 Nov):** no shadow, only the habitat's hunters ("hunters only"); Brace doesn't block a hunter that gets
  past armour; Adopt stays until the play test.
- **N4 play (12 Nov, short):** "core there but no game". Notes in `docs/playtests/n4-who-eats-whom.md`; P51 (one
  line, one ladder) open for Fable; nothing fixed until then (user's call).
- **Next:** (1) the Fable pass from `docs/design/fable-brief-3.md` (now with Q0, the game around the sea). (2) Then the
  N4 fix pass (stuck capsules, bud rate, no hunter build without prey, crush hint), merge, and the order Fable and you
  settle.
- **Open:**
  1. Early boards now have no predator at all (first worm: no hunters in the sea yet), and the first-worm map shows only
     about 4 capsules. Does that feel too quiet in play?
  2. A holder at F still makes the slot a Challenge.
  3. Adopt shows for any wild species in a habitat you can see, even one with no slot (a hunter with no prey).
  4. The spec's two leans stand (12 generations per Life; prey as big as its hunter).
  5. A wild hunter can be named after a non-hunting change ("Wild brood pouch worm"); parked in `ideas.md`.
