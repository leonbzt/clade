# How we work: sessions, tokens, delegation

## Sessions: one topic each

| Type        | What it's for                                    | Model / effort                         | Starts with                                     | Ends with   |
| ----------- | ------------------------------------------------ | -------------------------------------- | ----------------------------------------------- | ----------- |
| **Design**  | Decide things, write specs                       | Strongest model, high effort           | `/kickoff` + the topic                          | `/handoff`  |
| **Build**   | Implement one written slice spec                 | Sonnet is usually enough (`/model`)    | `/kickoff` + "build slice NN"                   | `/handoff`  |
| **Research** | Facts, reference games, libraries               | Delegated to the `researcher` agent    | A question from a design session                | A file in `docs/research/` |

### Restarting when context gets big

- Check `/context` now and then.
- At about half full, or after a big decision: run `/handoff`, then `/clear`, then `/kickoff`.
- `/handoff` writes `docs/status.md` (done, decided, next, open). That replaces the conversation, so nothing is lost.
- Mid-task with no time to hand off: `/compact focus on <current task>`.

## Saving tokens

1. **A short CLAUDE.md.** It's loaded on every turn. Rules and pointers only.
2. **Small, focused docs** plus an index ([README.md](README.md)). Read the index, open only what you need.
3. **Reference files by path.** Never paste them into the chat.
4. **The old prototype is blocked** in `.claude/settings.json`. No accidental reads, no drift.
5. **Small source files** (under ~400 lines), with data separate from logic, so reads stay small.
6. **Text over screenshots.** A dev panel and a state dump (`window.dev.dump()`) for debugging. Screenshots only for
   visual questions, and scaled down.
7. **Quiet scripts.** Test and typecheck print only failures.
8. **Decisions are written once,** in brief.md, and not re-discussed.
9. **Batch questions** at the end of a turn, instead of many round trips.
10. **The cheaper model for mechanical work:** data entry, renames, boilerplate.

## Delegation: when it pays off and when it doesn't

**Delegate:**
- broad web research
- searches across many files
- self-contained mechanical tasks with a clear spec, such as "fill `data/clades.json` with 30 real clades and
  sourced facts"

The agent's reading stays out of the main context; only a summary comes back.

**Don't delegate:**
- anything that needs the current conversation
- small tasks

An agent starts cold and has to re-read everything, which can cost *more* in total.

| Agent        | Defined in                      | What it does                                                    |
| ------------ | ------------------------------- | --------------------------------------------------------------- |
| `researcher` | `.claude/agents/researcher.md`  | Web research; writes a sourced summary to `docs/research/`; replies in under 10 lines |
| `Explore`    | built in                        | Read-only search across the codebase                            |

## The slice

- One slice = one question. Write a spec before code: `docs/slices/NN-name.md`, one page at most, with the
  question, what's in and out of scope, and "done when".
- One or two sessions each. If it's bigger, split it.
- **Play it before calling it done.** Write playtest notes to `docs/playtests/`.
