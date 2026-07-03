// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 7A/7B — LocknKey (Lock & Key) action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys (CCR-5 package-local).
// Imported by access-control/schemas.ts and spread into the discriminated union.
//
// Action names match modules-docs/LocknKey/capability-manifest.json mcp_action values
// (the parity source of truth) — NOT the dossier §4 informal names.
//
// Module: LocknKey v5.0.7. API: game.modules.get('LocknKey').api + LnKFlags + LockManager.
// Lock model: flags.LocknKey.* on Wall/Token/Tile/Item docs + core wall.ds (0/1/2) for doors.
//
// Confirm gates (CCR-4): circumvent-lock + transfer-items require confirm:true
// (apply a roll result that can jam a lock / move items bypassing pickpocket DCs).
// configure-lock + assign-key accept an OPTIONAL confirm (some sub-capabilities are
// SUPPORTED_WITH_CONFIRMATION: locked-state via ToggleLock, identity-key grants).

import { z } from 'zod';

const docType = z.enum(['wall', 'token', 'tile']);

// ── get-lock-state (shared action — LnK branch when documentId present) ─────────
// Read lock metadata from a wall/token/tile. Dispatcher routes to LockView when
// documentId is absent (LockView reads view-lock state instead). sceneId is the
// LockView discriminator and is accepted here so the .strict() union admits it.
export const getLockStateInput = z.object({
  action: z.literal('get-lock-state'),
  /** Wall/Token/Tile document ID. Present → LocknKey lock read. Absent → LockView view-lock read. */
  documentId: z.string().optional(),
  /** Document kind for the LocknKey read. Defaults to 'wall'. */
  documentType: docType.optional(),
  /** LockView discriminator (when documentId absent). Scene ID/UUID; defaults to active scene. */
  sceneId: z.string().optional(),
}).strict();

// ── configure-lock ─────────────────────────────────────────────────────────────
// Batch-configure a lock: lockability, locked state, the three DCs, jam, lock-on-close.
// Door walls route locked-state writes through LockManager.ToggleDoorLock (writes wall.ds).
// Gate on LnKFlags.isLockable before any locked-state write (EXCLUDED_UNSAFE guard).
export const configureLockInput = z.object({
  action: z.literal('configure-lock'),
  documentId: z.string().min(1),
  documentType: docType,
  /** Make the object a lock (LnKFlags.makeLockable) or disable it (LnKFlags.disableLock). */
  lockable: z.boolean().optional(),
  /** Locked state. Door walls → ToggleDoorLock (wall.ds=2/0); others → LnKFlags.setLockedstate. */
  locked: z.boolean().optional(),
  /** When making lockable, start in the locked state (LnKFlags.makeLockable second arg). */
  startLocked: z.boolean().optional(),
  /** Pick-lock DC (LockDCFlag). -1 / below InfinityThreshold = impassable (∞). */
  pickDC: z.number().int().optional(),
  /** Break-lock DC (LockBreakDCFlag). -1 = impassable. */
  breakDC: z.number().int().optional(),
  /** Custom-check DC (LockCCDCFlag). Requires the CustomCircumventName world setting non-empty. */
  ccDC: z.number().int().optional(),
  /** Jam the lock (LnKFlags.JamLock) — refuses pick AND key until unjammed. */
  jammed: z.boolean().optional(),
  /** Auto-lock door on close (LockonCloseFlag). */
  lockOnClose: z.boolean().optional(),
  /**
   * Optional confirm. Locked-state changes via ToggleLock are SUPPORTED_WITH_CONFIRMATION;
   * callers may pass confirm:true. Optional so simple DC/flag writes need no confirm.
   */
  confirm: z.literal(true).optional(),
}).strict();

// ── configure-lp-attempts ──────────────────────────────────────────────────────
// Set lockpick attempts / max / required-successes, or reset attempts to max.
export const configureLpAttemptsInput = z.object({
  action: z.literal('configure-lp-attempts'),
  documentId: z.string().min(1),
  documentType: docType,
  /** Current LP attempts left (LPAttemptsFlag). -1 = unlimited. */
  attempts: z.number().int().optional(),
  /** Maximum LP attempts (LPAttemptsMaxFlag). */
  attemptsMax: z.number().int().optional(),
  /** Successes needed to open (requiredLPsuccessFlag) — multi-success/puzzle locks. */
  requiredSuccesses: z.number().int().min(1).optional(),
  /** Reset current attempts to max via LnKFlags.resetLPAttempts. */
  reset: z.boolean().optional(),
}).strict();

// ── create-key ─────────────────────────────────────────────────────────────────
// Create a key Item and link it to a lock via api.createNewcustomKey.
export const createKeyInput = z.object({
  action: z.literal('create-key'),
  /** Lock document ID to link the new key to. Optional — omit to create an unlinked key. */
  lockDocumentId: z.string().optional(),
  /** Lock document kind. Required when lockDocumentId is supplied. */
  lockDocumentType: docType.optional(),
  /** Name for the new key Item. */
  keyName: z.string().min(1),
  /** Icon path for the key Item. */
  keyImage: z.string().optional(),
  /** Folder name/ID to place the key Item in. */
  keyFolder: z.string().optional(),
  /** Consume (decrement qty) on successful use (RemoveKeyonUseFlag). */
  removeOnUse: z.boolean().optional(),
}).strict();

// ── assign-key ─────────────────────────────────────────────────────────────────
// Link an existing key Item to a lock (LnKFlags.linkKeyLock — NEVER raw setFlag on
// IDKeysFlag) and/or grant identity-key access (LnKFlags.addIdentityKeys — SWC).
export const assignKeyInput = z.object({
  action: z.literal('assign-key'),
  lockDocumentId: z.string().min(1),
  lockDocumentType: docType,
  /** Existing key Item ID to link to the lock (both get a shared IDKeysFlag). */
  keyItemId: z.string().optional(),
  /** Optional explicit shared key ID; auto-generated when omitted. */
  keyId: z.string().optional(),
  /** Token/actor/player IDs granted keyless access (LnKFlags.addIdentityKeys). SWC. */
  identityIds: z.array(z.string()).optional(),
  /** Optional confirm — identity-key grants are SUPPORTED_WITH_CONFIRMATION. */
  confirm: z.literal(true).optional(),
}).strict();

// ── set-passkey ─────────────────────────────────────────────────────────────────
export const setPasskeyInput = z.object({
  action: z.literal('set-passkey'),
  documentId: z.string().min(1),
  documentType: docType,
  /** Password/PIN string the lock accepts (PasskeysFlag). */
  passkey: z.string().min(1),
  /** Allow players to change the passkey (PasskeyChangeableFlag). */
  changeable: z.boolean().optional(),
}).strict();

// ── set-custom-popup ─────────────────────────────────────────────────────────────
// Set per-popup custom messages. Keys are the 6-slot indices '0'..'5'
// (0=LockLocked, 1=LocknotPickable, 2=LocknotBreakable, 3=LockPasskeyTitle,
//  4=LocknotCustom, 5=CharacternotPickpocketable).
export const setCustomPopupInput = z.object({
  action: z.literal('set-custom-popup'),
  documentId: z.string().min(1),
  documentType: docType,
  /** Map of slot index ('0'..'5') → message string. */
  popups: z.record(z.string(), z.string()),
}).strict();

// ── grant-free-circumvent ────────────────────────────────────────────────────────
// Grant/remove free-circumvent charges on a token (e.g. Knock spell outcome).
export const grantFreeCircumventInput = z.object({
  action: z.literal('grant-free-circumvent'),
  /** Token document ID. */
  tokenId: z.string().min(1),
  /**
   * Number of charges to grant. 0 removes all free-circumvent charges
   * (LnKFlags.removeFreeLockCircumvent); >=1 grants that many
   * (LnKFlags.giveFreeLockCircumvent). Defaults to 1.
   */
  charges: z.number().int().min(0).optional(),
}).strict();

// ── circumvent-lock (SUPPORTED_WITH_CONFIRMATION) ────────────────────────────────
// Apply a circumvention OUTCOME to a lock via public LnKFlags (the LnK circumvention
// pipeline itself runs through bundle-internal LockManager/KeyManager — not server-
// reachable; this re-implements the OUTCOMES, not LnK's chat/crit/sound side-effects).
//   pick/break/custom : caller supplies a GM-resolved `outcome`
//     - success          → unlock (LnKFlags.setLockedstate false)
//     - failure          → reduce LP attempts (LnKFlags.ReduceLPAttempts)
//     - critical-failure → jam the lock (LockjammedFlag true)
//   key     : check a key Item against the lock (LnKFlags.matchingIDKeys) → unlock on match
//   passkey : check a passkey string against the lock (LnKFlags.MatchingPasskey) → unlock on match
// The pick/break roll itself is rolled elsewhere (wfrp4e sheet / dice); this is a thin
// mechanical state-application primitive (HC3 — no WFRP rules computed here).
export const circumventLockInput = z.object({
  action: z.literal('circumvent-lock'),
  documentId: z.string().min(1),
  documentType: docType,
  /** Circumvention method. */
  method: z.enum(['pick', 'break', 'custom', 'key', 'passkey']),
  /** GM-resolved outcome. REQUIRED for pick/break/custom (handler validates). */
  outcome: z.enum(['success', 'failure', 'critical-failure']).optional(),
  /** [method:key] Key Item ID to check against the lock (matchingIDKeys). */
  keyItemId: z.string().optional(),
  /** [method:key] Also accept the key Item's name as an ID (LnK considerName). */
  considerKeyName: z.boolean().optional(),
  /** [method:passkey] Passkey string to check (MatchingPasskey). */
  passkey: z.string().optional(),
  /** Acting character/actor ID (informational). */
  characterId: z.string().optional(),
  /** Pre-computed roll total (informational for pick/break/custom). */
  rollResult: z.number().optional(),
  /** Raw dice result (informational). */
  diceResult: z.number().optional(),
  /** CCR-4: required — applies a result that can unlock/jam the lock. */
  confirm: z.literal(true),
}).strict();

// ── transfer-items (SUPPORTED_WITH_CONFIRMATION / GM-auth) ────────────────────────
// GM-authoritative item transfer (api.TransferItems) — bypasses pickpocket flow.
// EXCLUDED_UNSAFE for player-facing pickpocket; GM-only.
export const transferItemsInput = z.object({
  action: z.literal('transfer-items'),
  /** Source actor/token ID. */
  sourceId: z.string().min(1),
  /** Target actor/token ID. */
  targetId: z.string().min(1),
  /** Items to transfer: [{ id, quantity? }, ...]. */
  itemInfos: z.array(z.object({ id: z.string(), quantity: z.number().int().positive().optional() }).strict()).min(1),
  /** CCR-4: required — moves items bypassing all pickpocket DCs. */
  confirm: z.literal(true),
}).strict();

// ── Exported variant array (spread into the discriminated union by schemas.ts) ──
// NOTE: getLockStateInput is exported here but spread by the root schema only ONCE
// (LockView re-uses the same action literal; the dispatcher routes by input shape).
export const locknkeyVariants = [
  getLockStateInput,
  configureLockInput,
  configureLpAttemptsInput,
  createKeyInput,
  assignKeyInput,
  setPasskeyInput,
  setCustomPopupInput,
  grantFreeCircumventInput,
  circumventLockInput,
  transferItemsInput,
] as const;
