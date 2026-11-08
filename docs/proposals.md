# Proposals (open)

AI proposals waiting for your call or a spec. **At most three open at a time.** Each names the milestone it serves,
gives options with an AI lean, and asks at most three questions. When you decide, your call goes to
[decisions.md](decisions.md) (and [full-version.md](design/full-version.md)), and the proposal leaves this file. Anything without a
milestone goes to [ideas.md](ideas.md) as one line.

Numbers continue from P35. P1–P33 in full are archived (`_archive/2026-11-01/systems.md`, reads blocked). Only the
open parts needed for M1 are kept here; the rest is parked in ideas.md.

(P36–P40 were decided 3 Nov, except P38's garden question: see decisions.md. P41 went to the toy: see decisions.md. P42 closed 5 Nov: the stack is picked by playing (slice 08, the stack test). P43 was decided 3 Nov.)
P44 (the run's core play) and P45 (next step, apex slot, world) were decided 4 Nov: see decisions.md.
P38's garden question closed 5 Nov: M1 built the self-limit, and the living sea replaces that model (see decisions.md).

## P46: Six places instead of free slots (M2, step 5; from step 3) *proposal, 6 Nov*
Full reasoning and numbers: [design/body-approach.md](design/body-approach.md).

**Your reactions (6 Nov, logged in decisions.md):** one place, one thing and locked places by lineage: yes. A locked place keeps its kind and can improve or reopen later. Front is the weapon slot. Rows for now, exact placement maybe later. Power from locked parts, authored numbers or both: still open.
**Your call on looks (7 Nov):** recipes for a code painter; don't spend more time on the final style now. It waits for the art pass, step 9.
**AI lean:** build six places as part of step 5, not as a separate toy, with the painter behind one draw call so the style stays swappable.
The requested [slice 20 draft](slices/20-join-the-bodies.md) makes the equipment view, part mapping and checks
concrete. The 8 Nov inheritance choice is one selected clutch part following continuation, explicitly a
bridge to later species/lineage integration; that settled choice is in [decisions](decisions.md).

**Power question closed for step 5 (8 Nov):** start with built-in parts, keeping current base/movement rules.
Extra lineage stats remain a later possibility; [decision](decisions.md#8-nov-part-c-navigation-and-the-next-body-phase).

**Remaining proposal:** body shape visible only at first, or small effects? The step-5 spec uses visible
only as its bounded scope; further shape effects remain open for later review, rather than adding a shape stat now.

## P47: The TierZoo frame for builds and levelling (M2, steps 5–6) *proposal, 8 Nov*
Full mapping: [design/tierzoo-concepts.md](design/tierzoo-concepts.md); first-hand terms: [research/tier-zoo.md](research/tier-zoo.md).
**Your reactions (8 Nov, in decisions.md):** you like patch notes with a cause, a tier letter per niche, strong vs/weak vs
or a triangle, and trade-off tooltips; a dex and stat sheets later; it fits "pick a build and level it" with EP, the skill
tree and body parts.
**At the handoff (8 Nov):** "i really liked the table and the proposed comparisons and want to really keep going into
that direction." The direction stands; the three questions below stay open.
**AI lean:**
- Step 5: builds, moves and signature moves (naming only), plus six derived stat bars with trade-off tooltips on the
  equipment screen.
- Step 6: evolution points from the main quest, spent on trait chains per place, with fixation into signature parts; a
  derived tier letter per niche; patch notes; the triangle once the sea model confirms it.
- Keep the Cambrian start as the open beta.

**Questions:**
1. Start era: keep the Cambrian (lean), a later sea (Devonian), or modern?
2. Use build / moves / signature move / evolution points as the game's words?
3. Should the derived stat bars and trade-off tooltips join slice 20's equipment screen, or wait for step 6?
