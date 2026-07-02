// Module Integration v2 Phase 13B — package-local Zod schema for module-puzzle-locks (Puzzle Locks v3.1.4, theripper93).
//
// CCR-5: module-specific schemas stay package-local. `.strict()` on every top-level action variant per the
// discriminatedUnion convention (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion).
// Per-lock-type solution-field requirements are NOT enforced here (a `.refine()` on a variant would break the
// union) — they are enforced in the handler via REQUIRED_SOLUTION_FIELD (phase13_pre_plan.md §13B Q2).
//
// 6 actions (phase13_pre_plan.md §13B, Q2 — PRD's literal 5 + force-unlock):
//   attach-puzzle (GM-only): attach/reconfigure a lock on a document. FULL-REPLACE semantics on typeConfig
//     (LockConfiguration.js:114-121) — re-calling on an in-use lock wipes runtime progress fields (documented,
//     not guarded — attach-puzzle on a fresh doc is safe).
//   get-puzzle (GM-only): read general + per-type flags.
//   check-solve-state (GM-only): read { lockType, unlocked, attempts }.
//   set-solve-macro (GM-only): write flags.puzzle-locks.general.unlockMacro via a TARGETED dotted-path setFlag
//     (safe vs the full-replace trap). jsCode XOR macroName.
//   remove-puzzle (GM-only, CONFIRM-GATED): unsetFlag('general') + unsetFlag(lockType).
//   force-unlock (GM-only, CONFIRM-GATED): sets general.unlocked=true; if the doc is a Wall ALSO writes
//     ds:CLOSED (BasePuzzleLock.js:174-197 two-write pattern) — does NOT fire unlockMacro (only the
//     interactive onUnlock() path does, main.js).
//
// 14 lock types (config.js `LOCKS` registry; APP_ID = ClassName kebab-cased, e.g. NumberLock -> "number-lock").
// Live-reverified 2026-07-02 (all 14, not just the 10 the audit covered — the 4 MEDIUM-confidence ones per
// §13B.3 are switches-lock/mastermind-lock/sudoku-lock/sound-lock, confirmed against the live *.js source):
//   number-lock (code), password-lock (password), cryptex-lock (solution), item-lock (item-N-name, no single
//   field), image-wheel (image, no "solution" — solved = all wheel rotations %360===0), mosaic-lock (mosaicImage,
//   no "solution" — solved = all tile rotations===0), fifteen-lock (image, no "solution" — solved = sorted
//   sliding-tile order), fill-blanks-lock (solution), four-by-four-lock (puzzleGrid — the encoded solved grid),
//   match-lock (matchTable required; secretWord optional override), switches-lock (switchesSolution),
//   mastermind-lock (solution, comma-joined color list), sudoku-lock (sudoku, comma/newline-encoded grid),
//   sound-lock (sequence, comma-joined note list).
//
// Source of truth: .agents/research/module_integration/phase13_pre_plan.md §13B +
// live re-read of E:/foundry_v13/data/Data/modules/puzzle-locks/scripts/app/*.js 2026-07-02.

import { z } from 'zod';

export const PUZZLE_LOCKS_ACTIONS = [
  'attach-puzzle',
  'get-puzzle',
  'check-solve-state',
  'set-solve-macro',
  'remove-puzzle',
  'force-unlock',
] as const;

export type PuzzleLocksAction = (typeof PUZZLE_LOCKS_ACTIONS)[number];

export const LOCK_TYPES = [
  'number-lock',
  'password-lock',
  'cryptex-lock',
  'item-lock',
  'image-wheel',
  'mosaic-lock',
  'fifteen-lock',
  'fill-blanks-lock',
  'four-by-four-lock',
  'match-lock',
  'switches-lock',
  'mastermind-lock',
  'sudoku-lock',
  'sound-lock',
] as const;

export type LockType = (typeof LOCK_TYPES)[number];

// Per-type "does this puzzle even have a solution to guess" field — used by the HANDLER (not the schema, per
// the no-`.refine()`-on-a-variant rule) to reject an attach-puzzle whose typeConfig omits/empties it.
// image-wheel/mosaic-lock/fifteen-lock have no discrete "solution" field (solved state is purely geometric —
// rotations at 0 / sorted order) so they are intentionally absent from this map (no enforcement for them).
export const REQUIRED_SOLUTION_FIELD: Partial<Record<LockType, string>> = {
  'number-lock': 'code',
  'password-lock': 'password',
  'cryptex-lock': 'solution',
  'fill-blanks-lock': 'solution',
  'four-by-four-lock': 'puzzleGrid',
  'match-lock': 'matchTable',
  'switches-lock': 'switchesSolution',
  'mastermind-lock': 'solution',
  'sudoku-lock': 'sudoku',
  'sound-lock': 'sequence',
};

// The 17-field `flags.puzzle-locks.general` shape (config.js `defaultConfig` 11 fields + the 6 hbs-template-only
// fields the audit's ~16 missed — phase13_pre_plan.md §13B.2). Partial: attach-puzzle merges this over the
// module's own defaults; set-solve-macro/force-unlock write single dotted paths, not this whole object.
const GeneralConfigPartial = z
  .object({
    label: z.string().optional(),
    description: z.string().optional(),
    unlocked: z.boolean().optional(),
    attempts: z.number().int().optional(),
    unlockSound: z.string().optional(),
    interactionSound: z.string().optional(),
    backgroundImage: z.string().optional(),
    glow: z.boolean().optional(),
    textColor: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    primaryFont: z.string().optional(),
    secondaryFont: z.string().optional(),
    unlockMacro: z.string().optional(),
    permission: z.number().int().optional(), // CONST.DOCUMENT_OWNERSHIP_LEVELS: 0 none / 2 observer / 3 owner
    userPermissions: z.number().int().min(0).max(1).optional(), // 0 all players / 1 solver-only
  })
  .strict();

// typeConfig is intentionally a loose record — the module itself performs NO validation of per-type fields
// (phase13_pre_plan.md §13B.3 "the module does no validation of its own"), and the 14 shapes vary widely
// (see the per-type field notes above). The handler enforces REQUIRED_SOLUTION_FIELD non-emptiness.
const TypeConfigRecord = z.record(z.string(), z.unknown());

export const PuzzleLocksInput = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('attach-puzzle'),
      documentUuid: z.string().min(1),
      lockType: z.enum(LOCK_TYPES),
      generalConfig: GeneralConfigPartial.optional(),
      typeConfig: TypeConfigRecord,
    })
    .strict(),
  z
    .object({
      action: z.literal('get-puzzle'),
      documentUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('check-solve-state'),
      documentUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-solve-macro'),
      documentUuid: z.string().min(1),
      jsCode: z.string().optional(), // XOR macroName (handler check) — raw JS, new Function("object","user",code)
      macroName: z.string().optional(), // resolved to `game.macros.getName("<name>").execute()` string
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-puzzle'),
      documentUuid: z.string().min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('force-unlock'),
      documentUuid: z.string().min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
]);

export type PuzzleLocksInputType = z.infer<typeof PuzzleLocksInput>;
