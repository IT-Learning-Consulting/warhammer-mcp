# _staging — orphan handlers awaiting Phase 4 consumption

These handlers have no callers today but are expected to be consumed by Phase 4
`/wfrp-*` skills. They remain registered in `CONFIG.queries` so the skill layer
can compose against them without a second round-trip.

**If this folder still exists after Phase 4 of the PRD closes, that is a bug.**

| Handler | Destined skill (per PRD §4) | Source line (pre-move, in queries.ts) |
| --- | --- | --- |
| `findActor` | `/wfrp-session-prep`, `/wfrp-encounter-builder` | queries.ts:79 |
| `findPlayers` | `/wfrp-session-prep`, `/wfrp-request-player-rolls` | queries.ts:78 |
| `getPartyCharacters` | `/wfrp-session-prep`, `/wfrp-encounter-builder` | queries.ts:76 |

**Cross-reference**: BUG-009 in `bugs.md` tracks the broader set of orphan handlers.
Phase 2 addressed the subset named above; the remaining entries in BUG-009 await
deletion/retention decisions in later phases.

**Not part of the live primitive surface**: anything landing here is on its way
out of `src/` or into a skill's backing primitive. Treat `_staging/` as
scaffolding, not a tier.
