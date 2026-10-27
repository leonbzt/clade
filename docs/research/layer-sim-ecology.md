# Layer sim: ecological and mathematical models for Clade

Researched 2026-10-27. Marks: [src] = checked in a source; [mem] = from my own background knowledge, NOT verified in this session; [?] = uncertain or sources disagree.

## Summary (10 lines)
1. No single classic model gives coexistence for free. Pure competitive hierarchy gives monoculture. Coexistence needs a stabilising mechanism (a niche or a negative feedback) on top of equal-ish fitness.
2. Cheapest, best-supported mechanisms for a tile grid: (a) competition-colonization trade-off (Tilman 1994), (b) resource niches along gradients (R*, Liebig minimum), (c) local dispersal and local interaction (Kerr 2002 RPS), (d) recurrent disturbance making gaps (forest-fire, gap models), (e) density-dependent pests [mem].
3. Real primary succession on volcanoes is slow, patchy and N-limited: cyanobacteria / lichens / mosses first, then N-fixers or seabird guano, then herbs and ferns, then shrubs and trees (Surtsey, Krakatau, Mt St Helens, Hawaii).
4. Connell & Slatyer's three pathways (facilitation, tolerance, inhibition) map directly to per-species-pair rules. Facilitation matters most early; inhibition (shading) ends pioneer phases. Real data are mixed, so use all three.
5. Big vegetation models cut "many species" down to few types: LPJ uses plant functional types (PFT) with fractional cover per cell. Gap models use individual cohorts per small patch. State-and-transition models use a few discrete states with thresholds.
6. Beer-Lambert light, `I = I0 * exp(-k * LAI)` with k about 0.5 to 0.9, is the standard cheap shade model. Use it per stratum.
7. Lenia-like continuous CA gives lovely patterns but poor readability, poor mapping to named real taxa, and high cost. Not recommended as the core.
8. Hobbyist predator-prey sims often crash or oscillate wildly. Animals should be abstracted as rates on cover, not agents.
9. Recommended core (section at the end): per tile, 3 strata slots (crust, herb/shrub, canopy), each holding one species and a cover value, plus N, soil depth, litter, moisture. Tile rules are local, lottery-style, with trait trade-offs.
10. 5 pitfalls at the end. Details and sources follow.

---

## 1. Cellular-automaton ecology

### Forest-fire (Drossel-Schwabl)
- Each cell: empty, tree or burning. Burning becomes empty; a tree ignites if a neighbour burns; trees ignite spontaneously with probability f; empty cells sprout a tree with probability p. [src: https://en.wikipedia.org/wiki/Forest-fire_model]
- The ratio p/f (mean trees grown between two lightning strikes) controls behaviour. Fractal fire sizes need f much smaller than p, and p much smaller than 1/(burn time of the largest cluster). It shows self-organised criticality, but it is a physics toy, not a faithful forest model, and Pruessner et al. found it not critical at very large scales. [src: same page]
- Game takeaway: "grow back slowly, disturb rarely, spread via neighbours" never reaches a fixed state. Fire sizes are heavy-tailed, so there are many small and a few huge events. That is good for non-static dynamics, but a rare huge event can wipe a small grid (a 40x24 grid is only 960 tiles). Cap event size. [proposal]

### Competition-colonization trade-off (Levins / Tilman)
- Two-species version (Levins-Culver). p_i = fraction of patches occupied, c_i = colonization rate, m_i = mortality: [src: https://en.wikipedia.org/wiki/Competition-colonization_trade-off]
  - `dp1/dt = c1*p1*(1 - p1) - m1*p1` (competitor)
  - `dp2/dt = c2*p2*(1 - p1 - p2) - m2*p2 - c1*p1*p2` (colonizer, displaced by species 1)
  - Colonizer persists if `c2 > c1*(c1 + m2 - m1)/m1`.
- Tilman 1994 generalises this to a ranked list; better competitors displace worse ones. In Durrett-Limic notation: `dp_i/dt = b_i*p_i*(1 - sum_{j<=i} p_j) - d_i*p_i - p_i * sum_{j<i} b_j*p_j`. Best competitor equilibrium `p1* = (b1 - d1)/b1`. Claim: unlimited species can coexist if inferior competitors colonize well enough. [src: Durrett & Limic https://sites.math.duke.edu/~rtd/reprints/paper126.pdf, via search summary; I did not open the 1994 paper]
- Criticisms: strict hierarchy makes the best competitors / worst colonizers most abundant, the opposite of nature (Rees & Levine) [src: https://eprints.whiterose.ac.uk/1398/1/reesm7.pdf, via summary]. Levine & Rees 2002 find seed-mass trade-offs alone do not generate coexistence in annual plants. [src: https://collaborate.princeton.edu/en/publications/coexistence-and-relative-abundance-in-annual-plant-assemblages-th/]. Calcagno et al. say preemption (incumbents hold the site) does not impede, and can aid, coexistence. [src: https://integ04-cnspfv.archimed.fr/doc/OAI_1/oai-HAL-halsde-00300572v1]
- Tilman's habitat-destruction extension predicts "extinction debt" (long lag before best competitors vanish). [src: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3050922/]
- Lottery variant: colonization is weighted by the other species' occupancy, `dp1/dt = c1*f/(f+p2)*p1*(h - p1 - p2) - m1*p1`. [src: Wikipedia page above]
- Game takeaway: a single "competitiveness" rank vs "dispersal radius" per species, inversely related, is a one-line rule that preserves fast spreaders (mosses, liverworts, ferns by spores) alongside slow dominant ones (trees). Add preemption (incumbent resists takeover) so displacement takes time. [proposal]

### Cyclic dominance / rock-paper-scissors
- Kerr, Riley, Feldman, Bohannan (Nature 418:171, 2002): three non-transitive E. coli strains (toxin producer, resistant, sensitive-but-fast) coexist when dispersal and interaction are local, and lose diversity when mixed globally. [src: https://www.nature.com/articles/nature00823 ; summary https://evobites.blog/2015/02/25/real-life-rock-paper-scissors/]
- Reichenbach, Mobilia, Frey (Nature 448:1046, 2007): with mobile individuals, there is a threshold mobility. Below it all species coexist as rotating spirals; above it, one species survives. Robust to model details. [src: https://arxiv.org/pdf/0709.0217]
- Game takeaway: cyclic dominance only works with LOCAL dispersal, and on a small grid it is vulnerable to drift extinction [mem on the small-grid part; the Frey result is about mobility]. Do not hard-code a RPS loop. Let it emerge from three traits: tall species beats others for light, shade/N-tolerant species beats tall one on poor soil, fast colonizer beats both in fresh gaps. [proposal]

### Lattice Lotka-Volterra (predator-prey)
- Mobilia, Georgiev, Tauber: spatial stochastic predator-prey lattice models show erratic oscillations from competing activity fronts, and local constraints can wipe out predators; a continuous predator-extinction threshold appears when prey growth is limited. [src: https://arxiv.org/pdf/q-bio/0508043v3, https://ar5iv.labs.arxiv.org/html/q-bio/0508043]
- Wa-Tor (Dewdney, Sci. Am. Dec 1984): fish/shark torus; runs oscillate and can crash depending on breed/starve parameters. [src: https://beltoforion.de/en/wator ; https://scipython.com/blog/wa-tor-world/ ; the sources do not agree on whether runs crash, it is parameter dependent]
- Game takeaway: agent-based animals on the grid are the most fragile layer. Model them as consumers of plant cover with saturating functional response and a refuge fraction. [proposal]

### Resource-ratio theory (R*, Tilman 1982)
- Each species has a zero-net-growth isocline (ZNGI) in resource space. In one limiting resource, the species with the lowest R* (the resource level where growth equals loss) wins. With two essential resources (Liebig minimum), species coexist at the ZNGI intersection if each consumes more of the resource that limits itself. At most as many species coexist as there are limiting resources. [src: https://ceres.ens.psl.eu/IMG/file/DavidPDF/S06/S06-4-interspecific-comp.pdf and other course notes via search; none gives the exact algebra]
- Simple form for a game: `R*_i = m_i*K_i/(mu_i - m_i)` [mem, Monod growth].
- Game takeaway: with N, light, moisture, soil depth as the limiting axes, give each species an optimum band and a "needs" vector. Species win on tiles where their limiting factor is least limiting. Gives spatial niches because tile conditions differ. The "at most N coexist per tile" is useful: 3 strata and about 4 resources fits. [proposal]

### Storage effect and intermediate disturbance
- Storage effect (Chesson): coexistence when (1) species respond differently to environmental fluctuations, (2) buffered population growth (long-lived stages persist through bad times), (3) covariance between environment and competition. Can arise spatially as well as temporally. [src: https://en.wikipedia.org/wiki/Storage_effect ; Chesson 2018 review via https://researchconnect.stonybrook.edu/en/publications/chessons-coexistence-theory/]
- Game takeaway: species with "good years" (wet years vs dry years, volcanic ash years) and a persistent stage (spores / seed bank / dormant crust) can coexist on one tile through time. Cheap to implement as a seeded global weather series that scales per-species growth. [proposal]
- Intermediate disturbance hypothesis (Connell 1978): diversity peaks at intermediate disturbance. But Fox 2013 reviewed over 100 studies and found about 80% did not show the predicted peak. Treat as a game design lever, not a law. [src: https://en.wikipedia.org/wiki/Intermediate_disturbance_hypothesis]

### Landlab CATGRaSS (a working vegetation CA)
- One PFT (tree / shrub / grass) or empty per cell. Establishment in empty cells is probabilistic by water stress; tree/shrub seed to neighbours, grass seed everywhere; mortality from aging and drought. Source: Zhou, Istanbulluoglu & Vivoni 2013, WRR 49(5). [src: https://landlab.readthedocs.io/en/latest/reference/components/plant_competition_ca.html ; tutorial notes it is untested on Landlab 2.0]
- This is the closest published precedent to a "one occupant per cell, probabilistic establishment" design.

---

## 2. Succession on volcanic islands

### Connell & Slatyer 1977
- Facilitation: early species make conditions better for later ones. Tolerance: early species change the environment neutrally; later species succeed through tolerance of low resources. Inhibition: early colonists hold resources and later species enter only when residents die or are damaged. Facilitation is often claimed for primary succession. [src (secondary): https://faculty.weber.edu/jcavitt/ecology/Lectures/CommunitySuccession.pdf ; https://uh.edu/~biolcz/class/eco4468/lect19.htm ; original paper not read]
- Real evidence is mixed: at Glacier Bay, net facilitation of spruce by alder has not been demonstrated even though alder greatly raises soil N. [src: https://agris.fao.org/search/ar/records/65df7c536eef00c2cea2e67b ; https://scholarworks.alaska.edu/uaf_unassigned_theses/365 via search]

### Surtsey (Iceland, erupted 1963-67)
- Vascular plant first found 1965; mosses visible 1968 (near steam vents); first lichens 1970; 53 moss species by 2003; Stereocaulon capitellatum and Racomitrium mosses became dominant on lava. [src: https://anbg.gov.au/lichen/case-studies/surtsey.html ; https://english.surtsey.is/?p=1077]
- 74 vascular species found 1965-2015; fast colonisation 1965-79, stagnation, then a surge peaking 1992-95 after a seagull colony established (1986 per Surtsey Research 2022; another paper says 1984 [?]). [src: https://surtsey.is/wp-content/uploads/2022/11/Surtsey-2022_15_2_Vascular-plant-colonisation_9-29.pdf]
- Nitrogen: gull colony N accumulation about 47 kg/ha/yr inside versus 0.7 kg/ha/yr outside; most of the island still very N-poor after 50 years. Plant biomass tracked N. [src: Leblans et al. 2014 https://bg.copernicus.org/articles/11/6237/2014/bg-11-6237-2014.html]
- Cyanobacteria in moss shoots fix N; gull colony may reduce the importance of that. [src: https://bg.copernicus.org/articles/11/4415/2014/bg-11-4415-2014.pdf]
- Mycorrhiza: first plants are generally non-mycorrhizal; ECM and AM both confirmed on Surtsey; Hebeloma, Laccaria, Inocybe sporocarps. [src: https://english.surtsey.is/wp-content/uploads/2019/08/6-Surtsey-2015_13-Wallander-49_51_HRes_06.pdf]
- Design echo: a "seabird colony" is a local N hotspot that jump-starts a patch. Great as a player-placed or random island event. [proposal]

### Krakatau (Indonesia, 1883)
- Cyanobacterial film first, then ferns, mosses, beach plants; grass-fern savanna by the 1890s; four stages per Bey 2003: bare ash 1883-86, grass/fern savanna 1886-1919, strand forest 1919-33, rainforest 1933 on. [src (secondary, dates vary [?]): https://www.conceptualacademy.com/system/files/student-files/CB1805.pdf ; https://agris.fao.org/search/en/records/65df39510f3e94b9e5d63f5d]
- Whittaker, Bush & Richards 1989, Ecol. Monogr. 59:59-123, is the primary source (not read). Interior forests stayed species-poor and made of early-seral species 50 years after canopy closure. Anak Krakatau (new island) lagged behind older islands, possibly for lack of surviving seeds. [src: Kagoshima report https://ir.kagoshima-u.ac.jp/record/9902/files/2004_002.pdf]
- Game takeaway: ferns and grasses in an early savanna phase before forest, and a long species-poor early-seral forest, is realistic. Not every island needs a diverse climax. [proposal]

### Mount St Helens (1980)
- Not sterile: biological legacies (survivors, debris) shaped recovery. [src: https://en.wikipedia.org/wiki/Mount_St._Helens]
- On the Pumice Plain, primary succession was very slow because habitats were isolated and harsh; establishment concentrated in favourable microsites; Lupinus lepidus (N-fixing legume) was the most abundant herb and boosts community biomass; community colimited by N and P. [src: https://faculty.washington.edu/moral/publications/RDM_Wood1993JVS.pdf ; https://faculty.washington.edu/moral/publications/delMoral-Rozzell2005.pdf ; https://faculty.washington.edu/moral/pdf/2009SurtseyResearch12.pdf ; Marleau et al. 2011 https://era.library.ualberta.ca/items/1bdd3929-6fc3-42a1-bea6-8df279ea29bc]
- The 2011 stoichiometric model suggests the nutrient supply may allow alternative successional trajectories depending on initial plant abundances. [src: same]
- AM fungi were rare on barren pumice, common in lupine patches and dense vegetation. AM can reduce growth of pioneers under very low nutrients (parasitic effect). [src: https://faculty.washington.edu/moral/publications/1998 Titus delMoral Oikos.pdf via search summary]
- Comparison: Surtsey seabirds made fertile patches; at St Helens wind brought sparse nutrients and lupine drove fertility. [src: https://faculty.washington.edu/moral/publications/2014 delMoral Magnusson.pdf]

### Hawaii lava (N-fixing lichen)
- Stereocaulon vulcani on Mauna Loa: accumulation on the youngest flows limited most by precipitation; light limitation from shading by vascular plants is the likely cause of lichen decline later. [src: Kurina & Vitousek 1999 via https://agris.fao.org/search/en/records/65dfadfbb766d82b1802c6b4]
- Biomass of Stereocaulon on Etna / Mauna Loa chronosequences rises over the first ~100 years, then declines slowly with vascular shading. [src: thesis summary https://researchportal.beds.ac.uk/en/studentTheses/early-successional-processes-of-basaltic-lava-ecosystems-on-mtetn-3/ ; weak source]
- USGS: lichens add organic matter and (if N-fixing) nitrogen, setting the stage for plants. [src: https://www.usgs.gov/news/volcano-watch-freddy-fungus-and-annie-alga-versus-volcano]
- Good model of facilitation then inhibition then decline of a pioneer. A pioneer that is a booster early and loses to shade later is exactly the curve to want.

### Roles of early guilds (what to model)
- Cyanobacteria / biocrust: pioneer; mature crusts fix about 2.5-10 times more N than poorly developed crusts; the pioneer Microcoleus vaginatus does not itself fix N and depends on N-fixing partners in its "cyanosphere". Data are from arid lands, not volcanic. [src: https://pmc.ncbi.nlm.nih.gov/articles/PMC6448292 ; https://link.springer.com/doi/10.1186/s40168-019-0661-2 ; https://www.usgs.gov/publications/carbon-and-nitrogen-fixation-differ-between-successional-stages-biological-soil-crusts]
- Lichens: organic matter, N (if cyanolichen), weathering of rock (acid secretion) [mem on weathering].
- Mosses/liverworts: moisture trapping, microsites, hosts for cyanobacteria [src: Surtsey bryophyte paper above].
- Fungi: decomposers and mycorrhiza. Early pioneers are mostly non-mycorrhizal; fungi follow established plant patches (above).

---

## 3. Representing many species in one cell

| Model | Representation | Note |
|---|---|---|
| JABOWA / FORET / ZELIG gap models | Individual trees on small plots, annual step; each tree has species, size; light from layers above | Botkin, Janak, Wallis 1972; Shugart & West 1977 [src: https://emf.creaf.cat/external_models/jabowa ; https://emf.creaf.cat/tags/forest-gap-model/]. Details such as patch area, establishment functions: not verified |
| SORTIE | Individual trees in continuous space; ray-traced light through crowns | [src: https://www.afs-journal.org/articles/forest/pdf/2005/07/f5081.pdf (light component test)]. Overkill here |
| LPJ (DGVM) | Plant functional types with fractional (foliar projective) cover per grid cell; one average individual per PFT; yearly structure update, daily fluxes | [src: https://impacts.ucar.edu/en/publications/a-dynamic-global-vegetation-model-for-use-with-climate-models-con/ ; Smith 2001 https://web.nateko.lu.se/lpj-guess/smith2001_withappendix.pdf] |
| LPJ-GUESS | Individual / cohort competition inside patches; same physiology as LPJ | [src: same] ; replicate patches [mem] |
| State-and-transition (rangeland) | A catalogue of alternative states and transitions; thresholds, hard to reverse without intervention; not an equilibrium-succession view | Westoby, Walker, Noy-Meir 1989 [src: https://archive.jornada.nmsu.edu/files/bibliography/08-025.pdf ; https://ucanr.edu/sites/crric/files/187357.pdf] |
| CATGRaSS | One PFT per cell | see above |

- Lesson: nobody models 100 species per cell. They reduce to (a) a few PFTs, (b) a few strata, or (c) a few discrete states. Clade's per-tile layers (crust / herb / canopy) are a stratum + PFT hybrid, which is the same compromise. [proposal]
- State-and-transition gives a nice game idea: a tile "phase" is a label derived from the occupants (bare rock, crust, moss mat, fern meadow, scrub, forest), and thresholds (soil depth, N) make some transitions one-way unless a disturbance resets them. [proposal]
- Metacommunity: patch dynamics (Levins), species sorting, mass effects, neutral. I only fetched the CC lottery variant. Broader metacommunity theory not researched here [?].

---

## 4. Light and shade
- Beer-Lambert: `I(L) = I0 * exp(-k * L)`, L = cumulative leaf area index above, k about 0.5-0.9. One-layer approximation is within about 1-2% of detailed sunlit/shaded models in the cited notes. Real canopies are clumped, so Beer-Lambert is optimistic. [src: https://greenlab.cirad.fr/GLUVED/html/P2_GLab/Prod/GLprod_physio_005.html ; https://pyrealm.readthedocs.io/en/stable/users/demography/light_capture.html ; https://literatur.thuenen.de/digbib_extern/dn065977.pdf]
- JABOWA-FORET family is 1-D: light from above only, attenuated by cumulative leaf area with Beer's law; ZELIG adds multi-angle light and neighbour-plot shading. [src: summary of https://forschung.boku.ac.at/en/projects/235 and related, via search; the source mis-spelled JABOWA]
- Grid version [proposal]: `shade_s(tile) = exp(-k * (sum of cover*LAI of strata above s on this tile + w * mean canopy LAI of 8 neighbours))` with w about 0.2-0.3 (low sun angle shading from neighbours). One float per tile; costs a few operations.
- Shade tolerance: each species has a minimum light fraction for growth (L_min) and a light level at which it saturates. Tolerant species win when light is low, so shade-casters are inhibitors of pioneers and facilitators of tolerant understory species. That reproduces the Stereocaulon-shaded-by-plants curve.

## 5. Nitrogen and soil pools
No single sourced simple-model reference was found. Real rates seen in the sources:
- Surtsey gull colony 47 kg N/ha/yr (4.7 g/m2/yr) versus 0.7 kg/ha/yr (0.07 g/m2/yr) outside. [src: Leblans 2014 above]
- Glacier Bay soil N pool grew 2.3-3.6 g N/m2/yr with N-fixing alder. [src: https://scholarworks.alaska.edu/uaf_unassigned_theses/365 via search]
- Mount St Helens soil N 1.7-57.4 kg/ha across cover types; vegetation N followed lupine cover. [src: https://eco.confex.com/eco/2012/webprogram/Paper36395.html]
- So N supply varies by about 100x between "bare rock" and "fixer or guano patch". Use that spread directly.

Minimal pool model [proposal, textbook style, not sourced]:
```
dN/dt = F(fixers on tile) + D(deposition, seabird) + kd * Litter * f(moisture)   // mineralisation
        - sum_i uptake_i(N, cover_i) - leach * N
dLitter/dt = sum_i turnover_i * biomass_i - kd * Litter * f(moisture)
dSoilDepth/dt = weathering(strata) + humif * Litter - erosion(slope, 1 - cover)
```
Timescales: tile N changes within tens of ticks; soil depth much slower (100x). Separate fast and slow variables so succession has stages and the player sees a delay. Reasonable ratio guided by the field data: pioneers over decades, soil over centuries.

---

## 6. Reaction-diffusion and Lenia-style continuous CA
- Lenia (Bert Chan, 2019): continuous states, space and time; convolution with radial ring kernels (sums of Gaussians), a Gaussian growth function `G(x) = 2*exp(-((x-mu)/sigma)^2/2) - 1`, update `A += dt * G(K*A)`. Generalised to multiple kernels and channels, "like a recurrent convolutional net". Flow-Lenia adds mass conservation. [src: https://deepai.org/publication/lenia-and-expanded-universe ; https://arxiv.org/pdf/2506.08569 ; https://ar5iv.labs.arxiv.org/html/2212.07906 ; secondary only]
- Pros: smooth, no grid artefacts, rich emergent forms; multi-channel = natural way to hold several species per cell; Flow-Lenia's mass conservation is a good analogue of "conserved N".
- Cons (my assessment [mem/judgement]): parameters (mu, sigma, kernel rings) have no ecological meaning, so a player and a designer cannot read why a species wins; "species" are blob patterns, not named real taxa; wide kernels cost O(R^2) per cell or FFT; patterns tend to drift to dissolution or fixed shapes, hard to tune for "never static, never collapse"; determinism across JS float implementations needs care.
- Middle path [proposal]: use a small diffusion kernel only for resources (seed rain, moisture, N leaching downhill) where continuous fields are natural, and keep discrete species occupancy in cells. Turing / reaction-diffusion vegetation patterning (e.g. Klausmeier banded vegetation) is a known idea for patchiness [mem, not researched]; skip unless needed.

---

## 7. Hobbyist and indie projects (thin evidence)
No substantial devlog with lessons learned was found for grid-succession sims. What was found:
- Equilinox (ThinMatrix / Karl Wimble): weekly devlog videos; plants and animals simulated for eating, reproduction, death; plants raise fertility. A commenter says there is no real evolution. Spread / balance details are in videos I could not read. [src: https://www.gamingonlinux.com/2018/11/relaxing-nature-sim-equilinox-is-out-seems-to-be-a-hit-with-users/page=1/ ; https://www.moddb.com/games/equilinox/presskit]
- Sebastian Lague "Coding Adventure: Simulating an Ecosystem": exists (about 2.3M views per a listing), but I could not read it or its content [?]. [src: https://www.patreon.com/SebastianLague/sitemap]. Fan clones: one is stable but plain, another "incredibly unoptimized". [src: https://west-virgin.itch.io/evolution-sim ; https://deiahri.itch.io/darwin-effect]
- A 2021 Gothenburg thesis on a Unity rabbit-wolf natural selection sim: equilibrium achievable but hard, very sensitive to start values and world size. [src: https://gupea.ub.gu.se/handle/2077/69615]
- Wolfram demo of fox-rabbit agents: depending on parameters, fox extinction, oscillation or travelling waves. [src: https://demonstrations.wolfram.com/PredatorPreyEcosystemARealTimeAgentBasedSimulation/]
- GameDev.net advice: use a CA / statistical model for broad trends, add detail only near the player; start with simple static vegetation. [src: https://www.gamedev.net/forums/topic/512548-nature-ecology-and-agriculture-simulation/4339220/ ; forum opinion]
- Common problem across these: balance depends on tuned start values and world size (so it breaks when scale changes or when offline fast-forward changes the step), and extinction cascades.
- Gap: Ted Lockwood and other named sims were not found; no claims made.

---

## 8. Recommended minimal model for Clade [proposal]

### State per tile (typed arrays, 6000 tiles at most)
Static / slow:
- `elev`/`slope` (static), `moisture` base (static) plus weather modifier, `soilDepth` (slow float), `rock` type (static, optional).
Fast resources:
- `N` (soil nitrogen), `litter`, `shade` (derived each tick), `humidity` (derived from cover and moisture).
Occupancy, 3 strata:
- `crust[]` (cyanobacteria, lichens, liverworts, mosses), `herb[]` (ferns, club mosses, grasses/herbs, shrubs), `canopy[]` (trees).
- Each stratum: `speciesId` (uint8, 0 = empty), `cover` (0..1 float or uint8), `age`.
- Soil fungi: not a slot. Two per-tile scalars: `decomp` (fungal decomposer activity, grows with litter and moisture) and `myco` (mycorrhizal network, boosts herb/canopy nutrient uptake once any host is established). Keeps "fungi" in the model without a fourth competing slot.
- Animals: global pools or per-region rates that act on cover (grazing, seed dispersal, guano), not agents.
So "multiple species per cell" = up to one per stratum + fungal state, with cover for shading, and a visible dominant.

### Update per tick (all local, double-buffered, seeded PRNG)
1. Resources: N, litter, soilDepth per the pool equations above (fixers add F, uptake by cover, decomposition by `decomp`).
2. Light: Beer-Lambert from strata above plus neighbour shade term.
3. Fitness `f_i(tile)` per species per stratum = `min` over its limiting factors (Liebig: N, light, moisture, soil depth) mapped by clamped ramps from its tolerance band. R* spirit: persist if `f_i > loss_i`.
4. Growth: `cover += r_i * f_i * (1 - cover)`; or decline if `f_i < loss`.
5. Colonisation (empty slot or beatable occupant): `P = 1 - exp(-dt * seeds)`, `seeds = sum over neighbours within radius d_i of cover_j * w(distance) * f_i(this tile)` plus a small `rain_i` (island-wide propagule rain, only for species the player has "released"). Dispersal radius d_i and competitiveness rank c_i are inversely linked (competition-colonization).
6. Displacement: occupant with lower c can be replaced by a colonizer with higher c at rate `p_disp = base * (c_new - c_old)` times a preemption factor (incumbent resist, e.g. 0.2 for old established cover). Gives slow, visible takeover.
7. Mortality: `m_i = m0_i + stress(f_i) + pest_i * localSame_i + disturbance`, where `localSame_i` is same-species cover among neighbours (density-dependent pests; Janzen-Connell [mem]).
8. Facilitation / inhibition as per-species effect tags: fixers raise N, mosses raise moisture and soil, tall plants lower light (inhibit pioneers). All three Connell-Slatyer pathways emerge from these effects.
9. Disturbance events (deterministic from seed): lightning fire with Drossel-Schwabl-like regrow (p/f large), storm blow-down creating gaps, lava / ash fall resetting a patch to rock, drought years via weather series, herbivore outbreaks. Cap each event to a fraction of the map. Leave biological legacies (some N and soil kept, seed bank) after disturbance, like St Helens.

### Which mechanism provides which property
| Need | Mechanism | Source/basis |
|---|---|---|
| Coexistence in space | competition-colonization trade-off, local dispersal | Tilman 1994; Kerr 2002 |
| Coexistence in niches | Liebig limits with different bands (R*) | Tilman 1982 |
| Coexistence in time | weather series + dormant stage (storage effect) | Chesson |
| Anti-monoculture | density-dependent pests (neg. frequency dependence), preemption, shade-tolerant understory, patch size cap on disturbances | Janzen-Connell [mem]; Calcagno |
| Anti-extinction | rain_i propagule floor per released species, refuge tiles, bounded loss rate | design hack |
| Non-static | disturbance, weather, slow soil/N drift, facilitation then inhibition of pioneers, cyclic trait loops, new species released by player | forest-fire, Connell-Slatyer |
| Readable | one occupant per stratum, phase labels derived (state-and-transition), 4-5 resource layers | LPJ PFT, STM |
| Cheap + offline | integer/fixed-point where possible, event/probability scaling by `dt` (`1-exp(-dt*rate)`), fast resource fields updated every tick, slow ones every k ticks | design |

### Determinism and offline notes [proposal]
- One PRNG stream seeded by (worldSeed, tickIndex, tileIndex) hashing, so results do not depend on iteration order or chunking.
- Use the same step function for fast-forward, with bigger `dt` and probability scaling only for slow layers; test that 10x(dt=1) is close to 1x(dt=10) for the stats the game shows. Exact equality is not possible, so define offline progress as its own deterministic function.

---

## 9. Five pitfalls
1. Pure hierarchy competition. A single "strength" order yields monoculture, and in the Tilman hierarchy even the best competitors end up most abundant, opposite to nature (Rees & Levine). Give each species at least two orthogonal traits (competition vs dispersal; shade-tolerance vs N-efficiency) and add pest feedback.
2. Small grid + stochasticity = drift extinctions. 960 to 6000 tiles hold few patches per species. RPS spirals need local interaction and low mobility (Reichenbach 2007), and extinction at small N is common in lattice LV (Mobilia et al.). Add propagule rain and refuges, and test at the smallest map size first.
3. Agent animals on top of the CA. Wa-Tor style and Unity predator-prey sims oscillate, crash, or need hand-tuned starts and world sizes (Gothenburg thesis). Use rate-based pools acting on cover.
4. Expecting disturbance to fix everything. IDH is empirically weak (Fox 2013, about 80% of studies without the peak), and fire-size heavy tails (forest-fire model) can wipe a small map. Cap event size and keep legacies. Otherwise tiles all reach the same climax and the game freezes, or reset too often and never progresses.
5. Hidden-state tuning mismatch (readability and fast-forward). Too many interacting layers or continuous Lenia-style parameters make results unreadable and fragile when the timestep changes for offline play. Keep few layers with named effects, and make dt-scaling a tested part of the sim. Also: real succession is slow and patchy (St Helens Pumice Plain, Surtsey after 50 years), so do not let all pioneers progress at the same speed everywhere or the game will feel uniform; include a few fast patches (guano, lupine-like fixers) and slow bare areas.

## Not covered / uncertain
- Original Connell & Slatyer 1977, Tilman 1994, Whittaker 1989 papers not read; relied on secondary summaries.
- Gap-model details (patch size, establishment and growth functions) not verified.
- SORTIE light model internals and metacommunity theory only touched.
- Equilinox and Lague video internals not obtained; no Ted Lockwood sim found.
- All formulas marked [mem] or [proposal] need checking before tuning.
