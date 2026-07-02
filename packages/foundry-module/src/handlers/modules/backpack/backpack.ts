// Module Integration v2 Phase 12 — module-backpack handler (Backpack v1.2.5, lobowarewolf).
//
// Always-registered umbrella. requireModuleActive('backpack') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// DIALOG-PATH: DIALOG_INVESTIGATED — every wrapped `storage.*` method is a headless world-settings
// read/write (capability_audit/backpack.md §Capability Inventory 5-23); the only dialog-opening surfaces
// (BackpackViewer open/close, organize, sort, the manager panel, withdraw/delete context-menu handlers)
// are EXCLUDED_UI_ONLY and are never called from this handler.
//
// 10 actions, per-actor item storage lives ENTIRELY in world settings (phase12_pre_plan.md
// §Confirmed facts 1/2/3/9, gap-fill 1-5). SETTING_KEYS below are LIVE-VERIFIED 2026-07-02 via
// `warhammer-mcp.setting list namespacePrefix:backpack` (6 keys matched the audit's decoded
// transcription byte-for-byte — unlike macro-trigger's F-KEY trap, backpack's audit decoded the real
// values, not minified labels; re-verify at smoke probe #0 regardless, per the F-KEY generalization).
// We never write `useActorSlotCount` (visible UI toggle setting, out of scope).
//
// Global accessor: bare `game.backpacks` (set at Hooks.once('init')); `game.backpacks.storage.*`
// directly throughout — NEVER `game.backpacks.socket.*` (MCP is GM-equivalent; slot-locks/per-user have
// no socket wrapper anyway — gap-fill 4).
//
// ATOMIC ROUND-TRIP (add-item / remove-item, PRD R12.2): the handler owns BOTH the storage write AND
// the actor embedded-item create/delete, additive-step-first (deposit: add-to-backpack THEN delete-from-
// actor; withdraw: create-on-actor THEN remove-from-backpack — phase12_pre_plan.md §Confirmed facts 7,
// CORRECTS the source module's own risky delete-first deposit order). Each side is independently
// DP-16 re-read verified; a 2nd-side failure ROLLS BACK the 1st side before throwing, so a failure
// duplicates (recoverable) rather than loses the item.
//
// OCCUPIED-SLOT GUARD + FRESH _id (gap-fill 1): `addItemToBackpack`/`moveItemInBackpack` silently
// OVERWRITE an occupied slot with no storage-layer guard of their own (the guard + a freshly generated
// `_id` are UI-layer only in the source module) — this handler replicates both.
//
// NO SETTLE-POLL for the storage side: this handler is the SOLE writer of its own settings — an
// awaited `storage.*` call (or a direct `game.settings.set`) followed by a single synchronous re-read
// verify is immediate-consistent (same pattern as macro-trigger). The ACTOR side of add-item/remove-item
// is a SEPARATE Foundry document write (createEmbeddedDocuments/deleteEmbeddedDocuments) and gets its
// own independent re-read verify — two verifies per round-trip action, not one.
//
// Source of truth: .agents/research/module_integration/phase12_pre_plan.md +
// capability_audit/backpack.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { BackpackInput, type BackpackInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'backpack';

// LIVE-VERIFIED 2026-07-02 via `setting list namespacePrefix:backpack` — 6 registered keys, matching
// the audit's decoded transcription byte-for-byte. `useActorSlotCount` is never written by this handler.
const SETTING_KEYS = {
  items: 'backpackItems',
  actorLimit: 'backpackActorLimit',
  limit: 'backpackLimit',
  users: 'backpacks',
  slotLocks: 'backpackSlotLocks',
} as const;

const WRITE_ACTIONS = new Set([
  'add-item',
  'remove-item',
  'move-item',
  'set-limit',
  'set-user-limit',
  'remove-user',
  'lock-slots',
  'clear-locks',
  'reset',
]);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}
function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}
function getStorage(): any {
  return getGame()?.backpacks?.storage;
}
function duplicatePojo<T>(pojo: T): T {
  const utils = (globalThis as any).foundry?.utils;
  return utils?.duplicate ? utils.duplicate(pojo) : JSON.parse(JSON.stringify(pojo));
}
function randomID(): string {
  return (globalThis as any).foundry?.utils?.randomID?.() ?? String(Date.now());
}

/** Raw fallback read of the `backpacks` per-user array — used when `storage.getBackpacks` (an
 * unconfirmed convenience accessor) isn't present; reads the world setting directly instead. */
async function readBackpacksArray(): Promise<any[]> {
  const storage = getStorage();
  const viaStorage = typeof storage?.getBackpacks === 'function' ? await storage.getBackpacks() : undefined;
  if (Array.isArray(viaStorage)) return viaStorage;
  const raw = getGame()?.settings?.get?.(MODULE_ID, SETTING_KEYS.users);
  return Array.isArray(raw) ? raw : [];
}

function notPersisted(side: 'storage' | 'actor', detail: string): { success: false; error: string } {
  const token = side === 'storage' ? ErrorTokens.BACKPACK_STORAGE_NOT_PERSISTED : ErrorTokens.BACKPACK_ACTOR_NOT_PERSISTED;
  return { success: false, error: `${token}: ${detail}` };
}
function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.BACKPACK_CONFIRM_REQUIRED}: ${detail}` };
}
function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.BACKPACK_TARGET_NOT_FOUND}: ${detail}` };
}
function slotOccupied(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.BACKPACK_SLOT_OCCUPIED}: ${detail}` };
}
function invalidInput(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.BACKPACK_INVALID_INPUT}: ${detail}` };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleBackpack(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: BackpackInputType;
  try {
    input = BackpackInput.parse(data);
  } catch (e) {
    return { success: false, error: `${ErrorTokens.BACKPACK_INVALID_INPUT}: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `${ErrorTokens.BACKPACK_ACCESS_DENIED}: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'read':
        return await handleRead(input);
      case 'add-item':
        return await handleAddItem(input);
      case 'remove-item':
        return await handleRemoveItem(input);
      case 'move-item':
        return await handleMoveItem(input);
      case 'set-limit':
        return await handleSetLimit(input);
      case 'set-user-limit':
        return await handleSetUserLimit(input);
      case 'remove-user':
        return await handleRemoveUser(input);
      case 'lock-slots':
        return await handleLockSlots(input);
      case 'clear-locks':
        return await handleClearLocks(input);
      case 'reset':
        return await handleReset(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `${ErrorTokens.BACKPACK_UNKNOWN_ACTION}: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `${ErrorTokens.BACKPACK_HANDLER_ERROR}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── read (ungated dual view) ─────────────────────────────────────────────────────

type ReadInput = Extract<BackpackInputType, { action: 'read' }>;
async function handleRead(input: ReadInput): Promise<Envelope<unknown>> {
  const storage = getStorage();
  if (input.actorId) {
    const items = await storage.getActorBackpackItems(input.actorId);
    const limit = await storage.getActorBackpackLimit(input.actorId);
    const locks = await storage.getActorSlotLocks(input.actorId);
    return {
      success: true,
      data: { action: 'read', actorId: input.actorId, items: items ?? [], limit, locks: locks ?? {} },
    };
  }
  const defaultLimit = await storage.getDefaultBackpackLimit();
  const players = typeof storage.getPlayersData === 'function' ? await storage.getPlayersData() : [];
  const userRecords = await readBackpacksArray();
  return { success: true, data: { action: 'read', defaultLimit, players: players ?? [], userRecords } };
}

// ── add-item (atomic round-trip, additive-first: storage add → actor delete) ────

type AddItemInput = Extract<BackpackInputType, { action: 'add-item' }>;
async function handleAddItem(input: AddItemInput): Promise<Envelope<unknown>> {
  const game = getGame();
  const actor = game?.actors?.get?.(input.actorId);
  if (!actor) return targetNotFound(`actor "${input.actorId}" not found.`);
  const item = actor.items?.get?.(input.itemId);
  if (!item) return targetNotFound(`item "${input.itemId}" not found on actor "${input.actorId}".`);

  const storage = getStorage();
  const existing = (await storage.getActorBackpackItems(input.actorId)) ?? [];

  let slot: number;
  if (input.slotIndex !== undefined) {
    if (existing[input.slotIndex] && !input.overwrite) {
      return slotOccupied(`slot ${input.slotIndex} is occupied on actor "${input.actorId}" backpack; pass overwrite:true to replace it.`);
    }
    slot = input.slotIndex;
  } else {
    const firstFree = existing.findIndex((s: unknown) => !s);
    slot = firstFree === -1 ? existing.length : firstFree;
  }

  const pojo = item.toObject();
  pojo._id = randomID();

  await storage.addItemToBackpack(input.actorId, pojo, slot);

  const afterAdd = (await storage.getActorBackpackItems(input.actorId)) ?? [];
  const stored = afterAdd[slot];
  if (!stored || stored._id !== pojo._id) {
    return notPersisted('storage', `item "${item.name}" (id ${pojo._id}) not present at slot ${slot} in backpackItems after add.`);
  }

  await actor.deleteEmbeddedDocuments('Item', [input.itemId]);
  const stillOnActor = actor.items?.get?.(input.itemId);
  if (stillOnActor) {
    // ROLLBACK: undo the storage add before reporting the actor-side failure — additive-first ordering
    // means a failure here duplicates the item (recoverable), never loses it.
    await storage.removeItemFromBackpack(input.actorId, slot);
    return notPersisted('actor', `item "${item.name}" (id ${input.itemId}) still present on actor "${input.actorId}" after deposit — rolled back the backpack storage write.`);
  }

  notify.created('backpack', item.name, { summary: 'deposited' });
  return { success: true, data: { action: 'add-item', actorId: input.actorId, slotIndex: slot, item: stored } };
}

// ── remove-item (atomic round-trip, additive-first: actor create → storage remove) ──

type RemoveItemInput = Extract<BackpackInputType, { action: 'remove-item' }>;
async function handleRemoveItem(input: RemoveItemInput): Promise<Envelope<unknown>> {
  const game = getGame();
  const actor = game?.actors?.get?.(input.actorId);
  if (!actor) return targetNotFound(`actor "${input.actorId}" not found.`);

  const storage = getStorage();
  const items = (await storage.getActorBackpackItems(input.actorId)) ?? [];
  const pojo = items[input.slotIndex];
  if (!pojo) return targetNotFound(`slot ${input.slotIndex} is empty on actor "${input.actorId}" backpack.`);

  const itemData = duplicatePojo(pojo);
  delete itemData._id;

  const created = await actor.createEmbeddedDocuments('Item', [itemData]);
  const createdItem = created?.[0];
  if (!createdItem || !actor.items?.get?.(createdItem.id)) {
    return notPersisted('actor', `item "${pojo.name}" from slot ${input.slotIndex} did not appear on actor "${input.actorId}" after withdraw.`);
  }

  await storage.removeItemFromBackpack(input.actorId, input.slotIndex);
  const afterRemove = (await storage.getActorBackpackItems(input.actorId)) ?? [];
  if (afterRemove[input.slotIndex]) {
    // ROLLBACK: undo the actor-side create before reporting the storage-side failure.
    await actor.deleteEmbeddedDocuments('Item', [createdItem.id]);
    return notPersisted('storage', `slot ${input.slotIndex} still occupied in backpackItems after withdraw — rolled back the actor-side create.`);
  }

  notify.updated('backpack', pojo.name, { summary: 'withdrawn to actor' });
  return { success: true, data: { action: 'remove-item', actorId: input.actorId, slotIndex: input.slotIndex, itemId: createdItem.id } };
}

// ── move-item (storage-only; occupied-toSlot guard replicated) ──────────────────

type MoveItemInput = Extract<BackpackInputType, { action: 'move-item' }>;
async function handleMoveItem(input: MoveItemInput): Promise<Envelope<unknown>> {
  const storage = getStorage();
  const items = (await storage.getActorBackpackItems(input.actorId)) ?? [];
  if (!items[input.fromSlot]) return targetNotFound(`fromSlot ${input.fromSlot} is empty on actor "${input.actorId}" backpack.`);
  if (items[input.toSlot] && !input.overwrite) {
    return slotOccupied(`toSlot ${input.toSlot} is occupied on actor "${input.actorId}" backpack; pass overwrite:true to replace it.`);
  }

  await storage.moveItemInBackpack(input.actorId, input.fromSlot, input.toSlot);
  const after = (await storage.getActorBackpackItems(input.actorId)) ?? [];
  if (!after[input.toSlot] || after[input.fromSlot]) {
    return notPersisted('storage', `move from slot ${input.fromSlot} to ${input.toSlot} did not verify on actor "${input.actorId}" backpack.`);
  }

  notify.updated('backpack', after[input.toSlot]?.name ?? 'item', { summary: `moved slot ${input.fromSlot}→${input.toSlot}` });
  return { success: true, data: { action: 'move-item', actorId: input.actorId, fromSlot: input.fromSlot, toSlot: input.toSlot } };
}

// ── set-limit (actor | default; 5..100 clamp self-imposed) ──────────────────────

type SetLimitInput = Extract<BackpackInputType, { action: 'set-limit' }>;
async function handleSetLimit(input: SetLimitInput): Promise<Envelope<unknown>> {
  if (input.limit < 5 || input.limit > 100) {
    return invalidInput(`limit must be between 5 and 100 (got ${input.limit}).`);
  }
  const storage = getStorage();
  if (input.target === 'actor') {
    if (!input.actorId) return invalidInput(`target:"actor" requires actorId.`);
    await storage.saveActorBackpackLimit(input.actorId, input.limit);
    const after = await storage.getActorBackpackLimit(input.actorId);
    if (after !== input.limit) {
      return notPersisted('storage', `actor "${input.actorId}" backpack limit is ${after}, expected ${input.limit}.`);
    }
    notify.updated('backpack', `actor ${input.actorId}`, { summary: `slot limit set to ${input.limit}` });
    return { success: true, data: { action: 'set-limit', target: 'actor', actorId: input.actorId, limit: after } };
  }

  await storage.saveDefaultLimit(input.limit);
  const after = await storage.getDefaultBackpackLimit();
  if (after !== input.limit) {
    return notPersisted('storage', `default backpack limit is ${after}, expected ${input.limit}.`);
  }
  notify.updated('backpack', 'default limit', { summary: `set to ${input.limit}` });
  return { success: true, data: { action: 'set-limit', target: 'default', limit: after } };
}

// ── set-user-limit (5..100 clamp self-imposed) ───────────────────────────────────

type SetUserLimitInput = Extract<BackpackInputType, { action: 'set-user-limit' }>;
async function handleSetUserLimit(input: SetUserLimitInput): Promise<Envelope<unknown>> {
  if (input.limit < 5 || input.limit > 100) {
    return invalidInput(`limit must be between 5 and 100 (got ${input.limit}).`);
  }
  const storage = getStorage();
  await storage.updateUserBackpack(input.userId, input.limit);
  const after = await storage.getUserBackpack(input.userId);
  if (!after || after.limit !== input.limit) {
    return notPersisted('storage', `user "${input.userId}" backpack limit is ${after?.limit}, expected ${input.limit}.`);
  }
  notify.updated('backpack', `user ${input.userId}`, { summary: `slot limit set to ${input.limit}` });
  return { success: true, data: { action: 'set-user-limit', userId: input.userId, limit: after.limit } };
}

// ── remove-user ──────────────────────────────────────────────────────────────────

type RemoveUserInput = Extract<BackpackInputType, { action: 'remove-user' }>;
async function handleRemoveUser(input: RemoveUserInput): Promise<Envelope<unknown>> {
  const storage = getStorage();
  await storage.removeUserBackpack(input.userId);
  const after = await storage.getUserBackpack(input.userId);
  if (after !== undefined) {
    return notPersisted('storage', `user "${input.userId}" backpack record still present after remove.`);
  }
  notify.deleted('backpack', `user ${input.userId} limit record`);
  return { success: true, data: { action: 'remove-user', userId: input.userId } };
}

// ── lock-slots (length XOR indices) ──────────────────────────────────────────────

type LockSlotsInput = Extract<BackpackInputType, { action: 'lock-slots' }>;
async function handleLockSlots(input: LockSlotsInput): Promise<Envelope<unknown>> {
  const hasLength = input.length !== undefined;
  const hasIndices = input.indices !== undefined;
  if (hasLength === hasIndices) {
    return invalidInput(`lock-slots requires exactly one of "length" or "indices".`);
  }

  const storage = getStorage();
  if (hasIndices) {
    await storage.lockSlotsForItemCustomSlots(input.actorId, input.leaderSlot, input.itemId, input.indices);
  } else {
    await storage.lockSlotsForItem(input.actorId, input.leaderSlot, input.itemId, input.length);
  }

  const after = (await storage.getActorSlotLocks(input.actorId)) ?? {};
  const entry = after[input.leaderSlot];
  if (!entry || entry.itemId !== input.itemId) {
    return notPersisted('storage', `slot lock for item "${input.itemId}" at leaderSlot ${input.leaderSlot} not present on actor "${input.actorId}" after lock-slots.`);
  }

  notify.updated('backpack', `actor ${input.actorId}`, { summary: `locked slots for item ${input.itemId}` });
  return { success: true, data: { action: 'lock-slots', actorId: input.actorId, leaderSlot: input.leaderSlot, lock: entry } };
}

// ── clear-locks (itemId XOR leaderSlot) ──────────────────────────────────────────

type ClearLocksInput = Extract<BackpackInputType, { action: 'clear-locks' }>;
async function handleClearLocks(input: ClearLocksInput): Promise<Envelope<unknown>> {
  const hasItemId = input.itemId !== undefined;
  const hasLeaderSlot = input.leaderSlot !== undefined;
  if (hasItemId === hasLeaderSlot) {
    return invalidInput(`clear-locks requires exactly one of "itemId" or "leaderSlot".`);
  }

  const storage = getStorage();
  if (hasItemId) {
    await storage.clearLocksForItemId(input.actorId, input.itemId);
  } else {
    await storage.clearLocksForLeaderSlot(input.actorId, input.leaderSlot);
  }

  const after = (await storage.getActorSlotLocks(input.actorId)) ?? {};
  if (hasItemId) {
    const stillLocked = Object.values(after).some((v: any) => v?.itemId === input.itemId);
    if (stillLocked) {
      return notPersisted('storage', `locks for item "${input.itemId}" still present on actor "${input.actorId}" after clear-locks.`);
    }
  } else if (after[input.leaderSlot as number]) {
    return notPersisted('storage', `lock at leaderSlot ${input.leaderSlot} still present on actor "${input.actorId}" after clear-locks.`);
  }

  notify.updated('backpack', `actor ${input.actorId}`, { summary: 'cleared slot lock(s)' });
  return { success: true, data: { action: 'clear-locks', actorId: input.actorId } };
}

// ── reset (confirm-gated; honest blast-radius — wipes ONLY backpacks + backpackLimit) ──

type ResetInput = Extract<BackpackInputType, { action: 'reset' }>;
async function handleReset(input: ResetInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `reset wipes ONLY the per-user backpack limit records ("backpacks") and resets the global default slot limit ("backpackLimit") to 5 — it does NOT touch stored items, per-actor limits, or slot locks. Re-call with confirm:true.`,
    );
  }
  const storage = getStorage();
  await storage.resetAllSettings();
  const after = await readBackpacksArray();
  if (after.length !== 0) {
    return notPersisted('storage', `backpacks still has ${after.length} record(s) after reset.`);
  }
  notify.deleted('backpack', 'all user limit records');
  return { success: true, data: { action: 'reset', cleared: true } };
}
