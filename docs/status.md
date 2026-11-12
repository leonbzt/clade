# Status

- **Milestone:** M2. N4 (step 11) is played and ticked; next is step 12, **N4 fix and the quiet sea**, on branch
  `n4-who-eats-whom` (not merged). No spec for it yet.
- **Done (12 Nov, this session): the maths pass** from `docs/design/fable-brief-3.md`. No code in `clade/` changed.
  - `docs/design/maths-pass.md` (480 lines): a summary with a table of leans, then Q0–Q8. Q0 holds the next steps, each
    with what it changes in `clade/`.
  - `toys/sea-board.html`: the slot board with the quiet-sea rules and an "Old sea" box. 8 h of catch-up in 34–42 ms;
    a midgame sea runs 1 000 generations with swings and no collapse.
  - `toys/body-grammar.html`: seven lines from one grammar at three sizes, with the two checks as tables.
  - Logs: `decisions.md` (12 Nov, the maths pass), `proposals.md` (P51 closed; P52, P53 open), `ideas.md` (8 lines),
    `ROADMAP.md` "Now" (steps 12–21), `docs/README.md`, pointers in `whole-game-build.md` (§6 letter line, §8).
- **Verified:** `npm run check` passes in 7.5 s. Each toy was looked at once on a phone viewport. Nothing is committed.
- **Decided (12 Nov):** the slot board; you first, the sea later; one active line, the rest live on, a line finishes at
  its named species and still goes on; letters against the meta (replaces "at full food"); a ladder, then a small
  tree; the order "fix board line look, also the other planned species would be nice to add soon"; Adopt stays.
- **Next:** (1) `/spec` the N4 fix and the quiet sea from maths-pass Q0's step table: stuck capsules, the crush hint,
  no hunter build without prey, claimed-cell spread, wild cousins on a bar and a leash, a refuge per tile. (2) Build
  it, play it, merge the branch. (3) Then N5 The board.
- **Open:**
  1. P52: the waste loop in N5 (AI lean) or fixed detritus ceilings until R7?
  2. P53: retune Eye, Gill, Sclerites and Gut gland under the sign-change rule in N6 (AI lean) or in R5?
  3. N7 (the other lines) before L1 (the look) is the AI's reading of "soon"; swap on your word.
  4. Every rule inside the steps (bar lengths, the leash, the refuge numbers, the tree's nodes) is a proposal from the
     toy, not tuned in the real game.
  5. From the toy: only one of four deep cells opens with the waste loop; your own hunters push your diggers to F in
     the sandy shallows; two line pairs overlap 0.76–0.78 on the board, so the silhouette check needs two sides.
  6. Retro Diffusion's sizes and prices are from `docs/research/ai-sprite-workflows.md`, not tested this session.
