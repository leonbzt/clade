# Playtest 06: a Life, v1 (4 Nov)

The slice: [slices/05-life.md](../slices/05-life.md). The toy: `toys/life.html`.

## First rounds
- **Overall:** "this is going into a great direction." "A really cool core where you can actually see the effects of your body plan." "Still
  really basic but the concept is proven."
- **The minigame:** "having budgets and beeing able to move which gives rewards is a great little minigame to solve." "The decisions are simple
  and impactful and the environment actually feels nice and responsive." "I like to be the little creature and chase things around."
- **Pull:** "I started new rounds without deciding."
- **Growing and laying:** "growing and laying felt like a decision but there were too many upgrades and slots so growing didn't really have a
  point in the short runs." "Growing vs laying vs surving was a real decision and its pretty nice."
- **Lineage:** "i also didn't see any of the smal lineages."
- **Body plans:** "felt a little different to play but still pretty similar."
- **UI:** "no good overview since the ui was to small to see all possible parts." **Sides:** "side didn't matter too much."
- **Wishes:** "i would love this if it had good feel and different set scenarios. so you feel like youre really a part of that habitat and the best
  playstyle matters for that map."
- **Threats and parts:** "the predator also felt nice so far." "You wouldn't really fill a whole body in the playthrough."
- **Plants:** it "would also fit in plants later on".

## After more rounds
- **Rare mutations:** "I played some more and discovered the rare mutations and i like it a lot this way, and felt really compelled to go on."
- **Adaptations:** "the different adaptations already felt different and no upkeep in mud was a gamechanger for the worm and brought it to s tier. i
  think this is exactly the way someone should talk about the game."
- **The call:** "i think i want to go on with this as a core."

## AI notes from the code (4 Nov)
- Each moult added 2 slots and 1 part: an arthropod went from 2 of 9 filled to 6 of 17. The body got emptier as it grew.
- A lay gave 2, 3, 3, 4, 4 eggs at sizes 3–7, so every second moult added no eggs.
- Only the strike read sides, and one guard covered a whole side.
- Both plans moved along the same straight lines, so apart from mud the worm was a shorter arthropod.
- Rare parts only showed at the second or third moult, which you had little reason to reach at first. That fits finding them later.
