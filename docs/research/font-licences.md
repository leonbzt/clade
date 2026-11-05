# Font licences: RuneStar RuneScape fonts and GNF

Not a lawyer; this is research, not legal advice. "Stated" = in a source; "inference" = mine.

## Summary
- **RuneStar/fonts (RuneScape Plain 12 etc.): can ship with risk.** The repo is CC0, but CC0 only covers what RuneStar owns. Nothing says Jagex agreed. Likely outcome: nothing. Worst realistic case: a polite takedown request, then swap the font.
- Jagex's Fan Content Policy does not cover this either way: it never mentions fonts, and it bans "video game content using Jagex Property". Do not cite it as permission.
- Law (inference): a bitmap typeface is weakly protected. US: no copyright in typeface shapes. UK: s.54 makes ordinary use free. Germany: a plain pixel font rarely reaches the originality bar. The main exposure is a claim on the font file as a work or database, which is untested.
- "RuneScape" in a file or family name is a small trademark risk, and it is free to avoid. Rename it.
- **GNF: can ship embedded, but must stay out of the public repo.** Befonts says "Commercial Use Allowed" and forbids redistribution. Its author and exact licence are unverified.

## 1. RuneStar/fonts
- Licence: CC0 1.0 Universal. The LICENSE file is the standard CC0 text and includes "No trademark or patent rights held by Affirmer are waived." https://github.com/RuneStar/fonts/blob/master/LICENSE
- README (title "Old School RuneScape Fonts"): "Every font with all characters exactly as appears in-game." It lists Plain 11, Plain 12, Bold 12, Quill 8, Quill, Quill Caps, Fairy, Fairy Large, Barbarian Assault and Surok. https://github.com/RuneStar/fonts
- The README and releases say nothing about Jagex, copyright or the glyphs' origin. Releases are by hunterwb (a RuneStar maintainer). https://github.com/RuneStar/fonts/releases
- Inference: RuneStar dedicated its own rights (the extraction, packaging and any database right). It cannot waive Jagex's rights, if any exist. "Exactly as appears in-game" means these are Jagex's glyphs, extracted.
- Origin of the OSRS glyphs is not established. The OSRS wiki Font page is a stub and names no designer. https://oldschool.runescape.wiki/w/Font A fan wiki says the RuneScape Classic fonts were "existing freely available fonts converted" to Jagex's format. That is Classic only, secondary and not about OSRS. https://classic.runescape.wiki/w/Fonts

## 2. Jagex's rules
- Fan Content Policy, v1.4 (29 Sep 2026), https://legal.jagex.com/docs/policies/fan-content-policy:
  - It covers only "in-game content" of OSRS, RuneScape and Dragonwilds that Jagex owns ("Jagex Property"). Examples listed: footage, avatars, screenshots, music. Fonts are not mentioned.
  - It excludes source code and trademarks (2.2, 2.4).
  - "You can't make any form of video game content using Jagex Property" (6.1.3), except approved mods and plugins.
  - Licence is personal and non-commercial (3.1.4). Anything commercial needs a separate Jagex agreement (14.1).
  - Required credit line: "Created using intellectual property belonging to Jagex Limited under the terms of Jagex's Fan Content Policy", plus a not-affiliated notice.
  - Inference: a free game using the font sits outside the policy. It is neither granted nor forbidden, just unlicensed. Claiming the policy as cover would invite the "no games" clause.
- Takedowns: I found none aimed at a RuneScape font. Searches turned up nothing. Absence of evidence only.
- Jagex's known enforcement is against bots, RS3 clones and HD clients. Jagex v. Impulse Software (bots) mentions copyright registrations in "two-dimensional icons". Nothing on fonts. https://blog.ericgoldman.org/archives/2010/09/runescape_publi_1.htm
- Fan font uploads on FontStruct carry Jagex "(c)" notices with downloads disabled, so the community treats the font as Jagex's. They are fan pages, not legal findings. https://fontstruct.com/fontstructions/show/268969
- RuneLite ships `runescape.ttf`, `runescape_bold.ttf` and `runescape_small.ttf` in its client resources. https://github.com/runelite/runelite/tree/master/runelite-client/src/main/resources/net/runelite/client/ui
  - I did not verify that these are the RuneStar fonts.
  - Jagex approves the RuneLite client (an approved list of RuneLite and HDOS), https://oldschool.runescape.wiki/w/Update:Third_Party_Client_Guidelines
  - No source ties that approval to the fonts. Inference: years of unchallenged distribution is weak evidence of tolerance. RuneLite is a RuneScape tool, so it is a different case from a non-RuneScape game.

## 3. Law in short
- **US:** Typeface shapes are not copyrightable (37 CFR 202.1(e); Eltra v. Ringer, 4th Cir. 1978). Scalable font software can be a copyrighted program if human-written. One secondary source says bitmap fonts are treated as mere representations of a typeface and are not copyrightable. I could not find the primary Copyright Office text. https://en.wikipedia.org/wiki/Intellectual_property_protection_of_typefaces ; https://www.monotype.com/resources/update-application-copyright-law-typeface-design-and-font-software
- **UK:**
  - s.54: using a typeface for ordinary typing, typesetting or printing does not infringe the typeface design copyright. https://www.legislation.gov.uk/ukpga/1988/48/section/54
  - s.55: once articles for producing a typeface have been marketed, anyone may make such articles 25 years after the end of that calendar year. https://www.legislation.gov.uk/ukpga/1988/48/section/55
  - Inference: ordinary use in a UI is the s.54 case. Copying and redistributing the font file is the more exposed act. The 25-year clock may already have run for the old fonts, but when "marketing" counts as started for a game's bitmap font is unclear.
- **Germany/EU:** A typeface can be protected by registered design (Designgesetz, 10 years initially, up to 25), or by copyright as applied art. The BGH refused copyright for a typeface ("Candida") on the originality bar. Font software may count as a program under §69a UrhG, but that is disputed and thin on case law. https://lausen.com/computerschriftarten-und-schriftartlizenzen-rechtliche-hintergruende-und-praktische-hinweise-teil-1-3/ ; https://en.wikipedia.org/wiki/Intellectual_property_protection_of_typefaces
  - Inference: a pixel UI font is a Gebrauchsschrift (a utility typeface). The realistic route would be a database or compilation claim, not typeface copyright. Untested.
- **Trademark:** "RuneScape" and its wordmark are Jagex trademarks (secondary source: https://madegooddesigns.com/runescape-font/). CC0 explicitly leaves trademarks alone.
  - Inference: a file name like `RuneScape-Plain-12.woff2` is not use as a brand and is unlikely to confuse anyone. It still draws attention and is trivial to change.
  - Suggest renaming the file, and the CSS family and font name table, to something neutral. Do not put "RuneScape" in the itch page, the credits or the font picker UI.

## 4. GNF
- Local copy `toys/fonts-local/GNF.ttf` is gitignored: ".gitignore: GNF may not be published". `toys/fonts.html` names no source, only: "free to embed, not to publish". I could not read the binary to get its name table.
- Best match found: Befonts "GNF Font", designer **Nytrock**, listed 1 Jun 2025, category pixel, label "Commercial Use Allowed". https://befonts.com/gnf-font.html
  - Cufonfonts has a "GNF" v1.000 (uploader "howe", May 2025) with no licence text. I could not fetch it (HTTP 403). https://www.cufonfonts.com/font/gnf
  - Not verified that the local file is that exact font. The listing blurb looks like generic site copy, not the author's own words.
- Befonts terms, https://befonts.com/licenses and https://befonts.com/font-for-commercial-use:
  - "Commercial Use Allowed": "you may not resell, redistribute, rename, or claim the font as your own."
  - The site says the label is only an indication. Check the licence file in the download.
  - Embedding in apps or games and public repositories are not addressed.
- Verdict (inference): embedding it in the itch build is likely fine under "commercial use". Committing the TTF to a public GitHub repo is redistribution and is not allowed. The itch build with the font embedded is a grey zone, but it is the normal case "use in a product". Keep the TTF out of the repo (already ignored) and check the licence file in the original download.

## Ideas for Clade
- **idea**: Ship the RuneStar font under a neutral name (`pixel-plain-12`) and keep the font swappable by a single CSS variable. If Jagex objects, the swap is one commit.
- **idea**: Add a second CC0 or OFL fallback (Henry Software pixel fonts are CC0; FS Pixel Sans is OFL) and pick it for any release the user wants fully clean.
- **idea**: Skip GNF for the public build. It gives a licence question for little gain over the OFL and CC0 options.
