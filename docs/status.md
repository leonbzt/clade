# Status

Updated 9 Nov 2026 (Codex, slice 22 build). Branch `slice-22-build`, local, not pushed.
**Milestone:** M2, step 6. [Slice 22](slices/22-the-larva.md) **22A and 22B built; Claude review and your play next.**
**Checkpoint:** `e273e4b` (22A), followed by `feat(22B): show larval buds and priced growth choices`.

**Built:** species keep the frozen body plan at laying; each Life starts with defaults and Signature parts grown,
other planned rows as buds. Regrowth/size-only costs half rounded up; new parts pay the balance. Fills update the
source species and its best tier/last Life; swaps branch. Kept cards prefer free places. Laid plan parts join the
pool. Save v6 retains v5 lines/species and migrates pending launch rows. Buds are pale on the body and faded in
slots, offers show prices/replacements/affordability, hatching previews fill or branch, species show occupied places.

**Verified:** `npm run check` passes (148 tests, Svelte/TypeScript); final isolated timing **9.33 s** (earlier 9.41 s; 12.78 s alongside browser checks). `npm run build:game`
passes. `npm run look` at 360 px passes [larva/offers](../scripts/look/22-larva.json) and
[hatching/relaunch](../scripts/look/22-hatching.json), with screenshots inspected. Four inherited picks regrow for
10 food versus 18 for four new picks. [Play notes](playtests/22-the-larva.md). Browser output has only the missing
favicon 404; no page errors. Build keeps its existing bundler/config/size warnings.

**Claude next:** review `82fddd6..HEAD` against the slice 22 build brief, especially frozen plan vs damage,
Signature/default starts, full-plan verb legality, fill/swap and kept-card placement, split payment/disabled offers,
and v5 migration. Then your 21C and 22 play; leave roadmap step 6 unticked until your notes are in.
**Limits:** pacing and the subjective repeat-Life experience await your play. No dependencies or release scope added.
Concurrent design/research document edits were left untouched and out of the build commits.
