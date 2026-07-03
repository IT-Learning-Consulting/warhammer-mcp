// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v2 Phase 13B — module-puzzle-locks handler (Puzzle Locks v3.1.4, theripper93).
//
// Always-registered umbrella. requireModuleActive('puzzle-locks') is the FIRST executable statement —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// ALL STATE LIVES IN DOCUMENT FLAGS (flags.puzzle-locks.*) — no module-side cache, flags read fresh every
// render (phase13_pre_plan.md §13B.5). Raw awaited flag writes are immediate-consistent → NO SETTLE-POLL.
//
// WALL-DOOR TWO-WRITE (force-unlock only, §13B.7): the module itself writes `ds:CLOSED` then
// `general.unlocked:true` as two separate writes on interactive solve (BasePuzzleLock.js:174-197). A
// `preUpdateWall` hook forward-syncs ds->flag but is registration-timing-fragile — force-unlock does BOTH
// writes explicitly here, never relying on that hook.
//
// FULL-REPLACE TRAP (§13B.8): the per-type config form writes `setFlag(MODULE_ID, lockType, formData)` as a
// FULL REPLACE (LockConfiguration.js:114-121). attach-puzzle on a fresh doc is safe; re-calling on an in-use
// lock wipes runtime progress fields — documented in the tool description, not guarded here (matches the
// module's own behavior).
//
// unlockMacro (§13B.6) fires ONLY through the interactive solve path (onUnlock() -> Socket.runUnlockMacro) —
// force-unlock never fires it; the handler surfaces that as an explicit warning in its response.
//
// Source of truth: .agents/research/module_integration/phase13_pre_plan.md §13B.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import {
  PuzzleLocksInput,
  type PuzzleLocksInputType,
  REQUIRED_SOLUTION_FIELD,
  type LockType,
} from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'puzzle-locks';
const FLAG_SCOPE = 'puzzle-locks';

const WRITE_ACTIONS = new Set(['attach-puzzle', 'set-solve-macro', 'remove-puzzle', 'force-unlock']);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}
function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}
async function resolveDocument(uuid: string): Promise<any | null> {
  const fromUuid = (globalThis as any).fromUuid;
  if (typeof fromUuid !== 'function') return null;
  return (await fromUuid(uuid)) ?? null;
}
function docKind(doc: any): 'wall' | 'tile' | 'token' | 'drawing' | 'template' | 'mcp' {
  const name = doc?.documentName;
  if (name === 'Wall') return 'wall';
  if (name === 'Tile') return 'tile';
  if (name === 'Token') return 'token';
  if (name === 'Drawing') return 'drawing';
  if (name === 'MeasuredTemplate') return 'template';
  return 'mcp';
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_NOT_PERSISTED}: ${detail}` };
}
function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_CONFIRM_REQUIRED}: ${detail}` };
}
function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_TARGET_NOT_FOUND}: ${detail}` };
}
function invalidLockType(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_INVALID_LOCK_TYPE}: ${detail}` };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModulePuzzleLocks(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: PuzzleLocksInputType;
  try {
    input = PuzzleLocksInput.parse(data);
  } catch (e) {
    return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_INVALID_INPUT}: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_ACCESS_DENIED}: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'attach-puzzle':
        return await handleAttachPuzzle(input);
      case 'get-puzzle':
        return await handleGetPuzzle(input);
      case 'check-solve-state':
        return await handleCheckSolveState(input);
      case 'set-solve-macro':
        return await handleSetSolveMacro(input);
      case 'remove-puzzle':
        return await handleRemovePuzzle(input);
      case 'force-unlock':
        return await handleForceUnlock(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_UNKNOWN_ACTION}: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_HANDLER_ERROR}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── attach-puzzle (full-replace on typeConfig; targeted merge on generalConfig) ──

type AttachInput = Extract<PuzzleLocksInputType, { action: 'attach-puzzle' }>;
async function handleAttachPuzzle(input: AttachInput): Promise<Envelope<unknown>> {
  const doc = await resolveDocument(input.documentUuid);
  if (!doc) return targetNotFound(`document "${input.documentUuid}" could not be resolved via fromUuid.`);

  const requiredField = REQUIRED_SOLUTION_FIELD[input.lockType as LockType];
  if (requiredField) {
    const value = input.typeConfig[requiredField];
    if (value === undefined || value === null || String(value).trim() === '') {
      return invalidLockType(
        `lockType "${input.lockType}" requires a non-empty "${requiredField}" field in typeConfig — the module performs no validation of its own, so an empty solution silently makes the puzzle unsolvable.`,
      );
    }
  }

  const generalPayload = { lockType: input.lockType, ...(input.generalConfig ?? {}) };
  await doc.setFlag(FLAG_SCOPE, 'general', generalPayload);
  await doc.setFlag(FLAG_SCOPE, input.lockType, input.typeConfig);

  const afterGeneral = doc.getFlag(FLAG_SCOPE, 'general');
  const afterType = doc.getFlag(FLAG_SCOPE, input.lockType);
  if (!afterGeneral || afterGeneral.lockType !== input.lockType || !afterType) {
    return notPersisted(`general/${input.lockType} flags not present on "${input.documentUuid}" after attach-puzzle.`);
  }

  notify.updated(docKind(doc), doc.name ?? input.documentUuid, { summary: `puzzle-lock attached (${input.lockType})` });
  return {
    success: true,
    data: { action: 'attach-puzzle', documentUuid: input.documentUuid, lockType: input.lockType, general: afterGeneral, typeConfig: afterType },
  };
}

// ── get-puzzle (ungated read... actually GM-only per WRITE_ACTIONS exclusion; kept read-style) ──

type GetInput = Extract<PuzzleLocksInputType, { action: 'get-puzzle' }>;
async function handleGetPuzzle(input: GetInput): Promise<Envelope<unknown>> {
  const doc = await resolveDocument(input.documentUuid);
  if (!doc) return targetNotFound(`document "${input.documentUuid}" could not be resolved via fromUuid.`);

  const general = doc.getFlag(FLAG_SCOPE, 'general') ?? null;
  const lockType = general?.lockType as LockType | undefined;
  const typeConfig = lockType ? (doc.getFlag(FLAG_SCOPE, lockType) ?? null) : null;

  return { success: true, data: { action: 'get-puzzle', documentUuid: input.documentUuid, general, lockType: lockType ?? null, typeConfig } };
}

// ── check-solve-state ────────────────────────────────────────────────────────────

type CheckInput = Extract<PuzzleLocksInputType, { action: 'check-solve-state' }>;
async function handleCheckSolveState(input: CheckInput): Promise<Envelope<unknown>> {
  const doc = await resolveDocument(input.documentUuid);
  if (!doc) return targetNotFound(`document "${input.documentUuid}" could not be resolved via fromUuid.`);

  const general = doc.getFlag(FLAG_SCOPE, 'general') ?? null;
  if (!general || !general.lockType || general.lockType === 'none') {
    return targetNotFound(`document "${input.documentUuid}" has no puzzle-lock attached.`);
  }

  return {
    success: true,
    data: {
      action: 'check-solve-state',
      documentUuid: input.documentUuid,
      lockType: general.lockType,
      unlocked: Boolean(general.unlocked),
      attempts: typeof general.attempts === 'number' ? general.attempts : -1,
    },
  };
}

// ── set-solve-macro (targeted dotted-path write — safe vs the full-replace trap) ──

type SetMacroInput = Extract<PuzzleLocksInputType, { action: 'set-solve-macro' }>;
async function handleSetSolveMacro(input: SetMacroInput): Promise<Envelope<unknown>> {
  const hasJs = input.jsCode !== undefined;
  const hasMacroName = input.macroName !== undefined;
  if (hasJs === hasMacroName) {
    return { success: false, error: `${ErrorTokens.PUZZLE_LOCKS_INVALID_INPUT}: set-solve-macro requires exactly one of "jsCode" or "macroName".` };
  }

  const doc = await resolveDocument(input.documentUuid);
  if (!doc) return targetNotFound(`document "${input.documentUuid}" could not be resolved via fromUuid.`);

  const code = hasMacroName ? `game.macros.getName("${input.macroName}").execute();` : (input.jsCode as string);
  await doc.setFlag(FLAG_SCOPE, 'general.unlockMacro', code);

  const after = doc.getFlag(FLAG_SCOPE, 'general.unlockMacro');
  if (after !== code) {
    return notPersisted(`general.unlockMacro on "${input.documentUuid}" is not the expected script after set-solve-macro.`);
  }

  notify.updated(docKind(doc), doc.name ?? input.documentUuid, { summary: 'unlock macro set' });
  return { success: true, data: { action: 'set-solve-macro', documentUuid: input.documentUuid, unlockMacro: after } };
}

// ── remove-puzzle (confirm-gated; reads lockType FIRST) ──────────────────────────

type RemoveInput = Extract<PuzzleLocksInputType, { action: 'remove-puzzle' }>;
async function handleRemovePuzzle(input: RemoveInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`remove-puzzle deletes the puzzle-lock's general + per-type flags entirely — re-call with confirm:true.`);
  }

  const doc = await resolveDocument(input.documentUuid);
  if (!doc) return targetNotFound(`document "${input.documentUuid}" could not be resolved via fromUuid.`);

  const general = doc.getFlag(FLAG_SCOPE, 'general');
  const lockType = general?.lockType as string | undefined;
  if (!lockType || lockType === 'none') {
    return targetNotFound(`document "${input.documentUuid}" has no puzzle-lock attached to remove.`);
  }

  await doc.unsetFlag(FLAG_SCOPE, 'general');
  await doc.unsetFlag(FLAG_SCOPE, lockType);

  const afterGeneral = doc.getFlag(FLAG_SCOPE, 'general');
  if (afterGeneral !== undefined) {
    return notPersisted(`general flag on "${input.documentUuid}" still present after remove-puzzle.`);
  }

  notify.deleted(docKind(doc), doc.name ?? input.documentUuid, { summary: `puzzle-lock removed (${lockType})` });
  return { success: true, data: { action: 'remove-puzzle', documentUuid: input.documentUuid, removedLockType: lockType } };
}

// ── force-unlock (confirm-gated GM override; wall two-write; unlockMacro NOT fired) ──

type ForceUnlockInput = Extract<PuzzleLocksInputType, { action: 'force-unlock' }>;
async function handleForceUnlock(input: ForceUnlockInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`force-unlock bypasses the interactive solve — the document's unlockMacro will NOT fire (only the player-facing solve path runs it). Re-call with confirm:true.`);
  }

  const doc = await resolveDocument(input.documentUuid);
  if (!doc) return targetNotFound(`document "${input.documentUuid}" could not be resolved via fromUuid.`);

  const general = doc.getFlag(FLAG_SCOPE, 'general');
  if (!general || !general.lockType || general.lockType === 'none') {
    return targetNotFound(`document "${input.documentUuid}" has no puzzle-lock attached to force-unlock.`);
  }

  // Two-write: if this is a Wall, write ds:CLOSED explicitly — do NOT rely on the preUpdateWall forward-sync
  // hook (registration-timing-fragile, §13B.7).
  const WALL_DOOR_STATES = (globalThis as any).CONST?.WALL_DOOR_STATES;
  if (doc.documentName === 'Wall' && WALL_DOOR_STATES) {
    await doc.update({ ds: WALL_DOOR_STATES.CLOSED });
  }
  await doc.setFlag(FLAG_SCOPE, 'general.unlocked', true);

  const afterUnlocked = doc.getFlag(FLAG_SCOPE, 'general.unlocked');
  if (afterUnlocked !== true) {
    return notPersisted(`general.unlocked on "${input.documentUuid}" is not true after force-unlock.`);
  }
  if (doc.documentName === 'Wall' && WALL_DOOR_STATES && doc.ds !== WALL_DOOR_STATES.CLOSED) {
    return notPersisted(`Wall "${input.documentUuid}" ds is not CLOSED after force-unlock (two-write did not land).`);
  }

  notify.updated(docKind(doc), doc.name ?? input.documentUuid, { summary: 'puzzle-lock force-unlocked (unlockMacro NOT fired)' });
  return {
    success: true,
    data: {
      action: 'force-unlock',
      documentUuid: input.documentUuid,
      lockType: general.lockType,
      wallDoorClosed: doc.documentName === 'Wall',
      warning: 'unlockMacro does NOT fire on force-unlock — only the interactive solve path runs it.',
    },
  };
}
