# Where `npm run check` spends its time (17 Nov)

Measured on `main` at b7c5a12, in a cloud container (4 cores, Node 22.23). No code was changed. Seconds are wall
time; each line is two or three runs. This machine is a little faster than the user's (15 s there, 11–14 s here),
so read the shares, not the absolute numbers.

## The two steps

`scripts/check.mjs` runs svelte-check and vitest **in parallel**, so the check lasts as long as the slower one, plus
what they steal from each other.

| What | Alone | In the check |
|---|---|---|
| `npm run check` (both) | — | **11.3 · 12.0 · 14.3 s** |
| vitest, `--maxWorkers=1 --no-isolate` | 10.5 · 10.5 · 11.0 s | 11.8 · 12.0 s |
| svelte-check (1095 files, 1 warning) | 5.7 · 6.0 · 6.9 s | finishes well before vitest |
| for scale: `tsc --noEmit` on the same tsconfig | 3.9 · 4.2 · 4.3 s | not in the check |
| for scale: `npm run check:game` (frozen game) | — | 8.1 · 9.3 s |

**The tests are the whole problem.** svelte-check finishes in about 6 s and is hidden behind them; making it faster
would save nothing. Of vitest's 10.5 s, about 1 s is startup (one tiny file alone takes 1.1 s), about 1 s is
import/transform, and **8.0 s is the tests themselves**, run one after another in one worker.

The one svelte-check warning: `clade/src/ui/Hatch.svelte:20` (`state_referenced_locally`, `clutch`). It costs no
time but would fail `--threshold warning` if it ever became an error.

## Which tests

30 files, 232 tests passed, 12 skipped, 1 todo. Test time per file (sum 8.06 s):

| File | Tests | Time |
|---|---|---|
| `model/board-lines.test.ts` (W1 part D) | 5 | **2.09 s** |
| `model/board.test.ts` (W1 part C) | 19 | **1.68 s** |
| `ground.test.ts` | 9 | **1.16 s** |
| `hatch.test.ts` | 12 | 0.53 s |
| `sea.test.ts` | 14 | 0.42 s |
| `living.test.ts` | 3 | 0.37 s |
| `quiet.test.ts` | 5 | 0.30 s |
| `hunt.test.ts` | 9 | 0.28 s |
| `colonise.test.ts` | 4 | 0.23 s |
| `line.test.ts` | 7 | 0.22 s |
| the other 20 files | 158 (13 skipped) | 0.77 s together |

**The three top files are 4.9 s of 8.0 s (61 %).** The two board files were added on 16 Nov (W1); they are most of
the climb since the 7.4 s of 8 Nov (that figure was the old game, `game/`).

The ten slowest tests are 4.6 s, more than half of all test time:

| Test | Time |
|---|---|
| board-lines › following the goal wins a card and opens a line you play; no goal comes back for ever | 1.03 s |
| board-lines › hold (D2): the first goal when a cell of yours is challenged … | 0.54 s |
| ground › habitats puts every shelf tile in one habitat … | 0.54 s |
| board-lines › rivals (D1): who comes for a held cell … | 0.50 s |
| board › the next goal (C7): one sentence that names its place … | 0.46 s |
| board › the invariants hold through 60 goals followed … | 0.43 s |
| board › the same seed and the same taps give the same board | 0.28 s |
| board › the land stays shut, with air or without | 0.28 s |
| hunt › law 6: 160 generations of 20 species … take under 100 ms | 0.27 s |
| living › capsules keep moving on a real map … (N4 fix A) | 0.27 s |

Why they are slow, from reading them (not profiled): the board tests follow 40–100 goals on a fresh board, and
call `invariants` and `rivalOf`/`candidates` over every cell after each goal; the ground tests build the island
from several seeds (one test says "on each of 20 seeds").

**Coming next:** the 12 skipped tests in `tree.test.ts` (B0 part A) will start to run when B0 is built. They are not
in these numbers.

## Worker count (measured, not changed)

`check.mjs` keeps vitest to one worker on purpose (its comment: "avoids competing timed laws"; several tests assert
"under 100 ms"). Running the same suite next to svelte-check, as the check does:

| vitest workers | Both done | Tests |
|---|---|---|
| 1 (today) | 11.8 · 12.0 s | all pass |
| 2 | 8.5 · 8.8 s | all pass |
| 3 | 9.0 · 9.6 s | all pass |
| default (isolated, all cores), vitest alone | 7.7 · 7.8 s | all pass |

Two workers got under 10 s here with every timed law passing in these runs, but this machine is faster than the
user's, and two runs are not proof the timed laws stay stable. That is W2's call.

## Levers for W2 (data, not a decision)

1. The three slow files (4.9 s): fewer goals or seeds per test, or share one followed board between tests.
2. Two vitest workers (about −3.5 s here), if the timed laws hold on the user's machine.
3. svelte-check: no gain while the tests are slower than it.

How these were taken: `npm run check` three times; each step alone with the same flags as `check.mjs`; per file
and per test from `vitest run --maxWorkers=1 --no-isolate --reporter=json`.
