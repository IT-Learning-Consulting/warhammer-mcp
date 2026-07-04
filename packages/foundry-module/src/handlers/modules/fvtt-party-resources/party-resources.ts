// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 11 — module-party-resources handler (Party Resources v1.9.0a).
//
// Always-registered umbrella. requireModuleActive('fvtt-party-resources') is the FIRST executable
// statement — RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase 1 carry-forward).
//
// 8 actions over the verified server-reachable surface (capability-manifest.json):
//   reads:  list, get
//   writes: set-value, increment, decrement, update-meta (GM-gated; notify.* on each)
//   confirm-gated writes: create, delete (CCR-4 z.literal(true); registry mutation)
//
// ADR-9.1 accessor (Phase 9 carry-forward): Party Resources exposes its API as a Class-3 window
// property — `window.pr.api` (a ResourcesApi instance, assigned at the init hook; init.mjs:9-15).
// getPartyApi() resolves it (window.pr.api OR globalThis.pr.api when window===globalThis in the
// bundle) and throws PARTY_RESOURCES_API_UNAVAILABLE on absence; live smoke is mandatory.
//
// Storage model: every resource lives in world game.settings namespace "fvtt-party-resources" — a
// `resource_list` Array<string> + 14 keys per id ({id}, {id}_name, {id}_max, {id}_min, {id}_visible,
// {id}_player_managed, {id}_icon, {id}_use_icon, {id}_notify_chat, {id}_position, ...). Value
// mutations route through window.pr.api.set/increment/decrement (preserves notify-chat + clamping);
// metadata + delete write game.settings directly. ResourcesList.add/remove are module-internal (not
// on window.pr) → create/delete replicate the resource_list splice inline (research A1).
//
// Anchors: DP-15 (typed), DP-16 (post-write verify), CCR-3 (notify on writes), CCR-4 (confirm on
// create/delete). Source: phase11_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { ModulePartyResourcesInput, type ModulePartyResourcesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { PARTY_RESOURCES as MODULE_ID } from '../../../constants/moduleIds.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';


const LIST_KEY = 'resource_list';

// ── Local helpers ──────────────────────────────────────────────────────────────

/** Resolve `window.pr.api` (ADR-9.1 Class-3 accessor), or throw. */
function getPartyApi(): any {
  const g = globalThis as any;
  const api = g.window?.pr?.api ?? g.pr?.api;
  if (!api) {
    throw new Error(
      'PARTY_RESOURCES_API_UNAVAILABLE: window.pr.api is not bound — the module may not have reached its init hook',
    );
  }
  return api;
}

/** Read a setting key under the module namespace, with a default on any error (unregistered key). */
function settingGet<T>(key: string, dflt: T): T {
  try {
    const v = (globalThis as any).game?.settings?.get?.(MODULE_ID, key);
    return v === undefined || v === null ? dflt : (v as T);
  } catch {
    return dflt;
  }
}

async function settingSet(key: string, value: unknown): Promise<void> {
  await (globalThis as any).game.settings.set(MODULE_ID, key, value);
}

interface ResourceSnapshot {
  id: string;
  value: number;
  name: string;
  max: number;
  min: number;
  visible: boolean;
  playerManaged: boolean;
  icon: string;
  useIcon: boolean;
  notifyChat: boolean;
  position: number;
}

/** Read the full snapshot of one resource from its settings keys (storage is the truth). */
function readResource(id: string): ResourceSnapshot {
  return {
    id,
    value: Number(settingGet<number>(id, 0)) || 0,
    name: String(settingGet<string>(`${id}_name`, '')),
    max: Number(settingGet<number>(`${id}_max`, 100)),
    min: Number(settingGet<number>(`${id}_min`, -100)),
    visible: Boolean(settingGet<boolean>(`${id}_visible`, true)),
    playerManaged: Boolean(settingGet<boolean>(`${id}_player_managed`, false)),
    icon: String(settingGet<string>(`${id}_icon`, 'icons/svg/mystery-man.svg')),
    useIcon: Boolean(settingGet<boolean>(`${id}_use_icon`, false)),
    notifyChat: Boolean(settingGet<boolean>(`${id}_notify_chat`, false)),
    position: Number(settingGet<number>(`${id}_position`, 0)),
  };
}

function resourceList(): string[] {
  const list = settingGet<unknown>(LIST_KEY, []);
  return Array.isArray(list) ? list.map((x) => String(x)) : [];
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set(['set-value', 'increment', 'decrement', 'update-meta', 'create', 'delete']);

export async function dispatchModulePartyResources(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModulePartyResourcesInputType;
  try {
    input = ModulePartyResourcesInput.parse(data);
  } catch (e) {
    return { success: false, error: `PARTY_RESOURCES_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `PARTY_RESOURCES_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    // await each handler so async throws (e.g. api unbound) are caught here and returned as the
    // typed HANDLER_ERROR envelope — the dispatcher never leaks a rejection.
    switch (input.action) {
      case 'list':
        return handleList(input);
      case 'get':
        return handleGet(input);
      case 'set-value':
        return await handleSetValue(input);
      case 'increment':
        return await handleIncrement(input);
      case 'decrement':
        return await handleDecrement(input);
      case 'update-meta':
        return await handleUpdateMeta(input);
      case 'create':
        return await handleCreate(input);
      case 'delete':
        return await handleDelete(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `PARTY_RESOURCES_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `PARTY_RESOURCES_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Reads ───────────────────────────────────────────────────────────────────────

type ListInput = Extract<ModulePartyResourcesInputType, { action: 'list' }>;
function handleList(_input: ListInput): Envelope<unknown> {
  const ids = resourceList();
  const resources = ids.map(readResource).sort((a, b) => a.position - b.position);
  return { success: true, data: { count: resources.length, resources } };
}

type GetInput = Extract<ModulePartyResourcesInputType, { action: 'get' }>;
function handleGet(input: GetInput): Envelope<unknown> {
  if (!resourceList().includes(input.resourceId)) {
    return { success: false, error: `RESOURCE_NOT_FOUND: no resource "${input.resourceId}" in the party tracker` };
  }
  return { success: true, data: readResource(input.resourceId) };
}

// ── Value mutations (route through window.pr.api) ─────────────────────────────────

// NOTE on persistence: the module's api.set/increment/decrement (resources_api.mjs:160-166) are
// FIRE-AND-FORGET — they call game.settings.set WITHOUT await/return, so `await api.increment(...)`
// resolves before the write commits and an immediate read-back races it (live-smoke: reported the
// stale pre-write value). So we replicate the module's clamp math and write DIRECTLY via awaited
// game.settings.set (guaranteed persistence + reliable read-back); api.set is fired only as a
// best-effort side-channel for the notify-chat broadcast on set-value.

type SetValueInput = Extract<ModulePartyResourcesInputType, { action: 'set-value' }>;
async function handleSetValue(input: SetValueInput): Promise<Envelope<unknown>> {
  if (!resourceList().includes(input.resourceId)) {
    return { success: false, error: `RESOURCE_NOT_FOUND: no resource "${input.resourceId}" in the party tracker` };
  }
  const previousValue = readResource(input.resourceId).value;
  // Best-effort chat broadcast (the module's set posts chat when {notify:true}); fire-and-forget.
  if (input.notifyChat === true) {
    try { getPartyApi().set?.(input.resourceId, input.value, { notify: true }); } catch { /* chat is best-effort */ }
  }
  await settingSet(input.resourceId, input.value); // awaited → guaranteed persistence
  const value = readResource(input.resourceId).value; // DP-16 read-back (reliable now)
  notify.updated('party-resources', readResource(input.resourceId).name || input.resourceId, {
    summary: `value ${previousValue} → ${value}`,
  });
  return { success: true, data: { resourceId: input.resourceId, previousValue, value, notifyChat: input.notifyChat === true } };
}

type IncrementInput = Extract<ModulePartyResourcesInputType, { action: 'increment' }>;
async function handleIncrement(input: IncrementInput): Promise<Envelope<unknown>> {
  if (!resourceList().includes(input.resourceId)) {
    return { success: false, error: `RESOURCE_NOT_FOUND: no resource "${input.resourceId}" in the party tracker` };
  }
  const snap = readResource(input.resourceId);
  const previousValue = snap.value;
  const value = Math.min(snap.max, previousValue + input.jump); // module clamp math (resources_api.mjs increment)
  await settingSet(input.resourceId, value);
  notify.updated('party-resources', snap.name || input.resourceId, { summary: `value ${previousValue} → ${value} (+${input.jump})` });
  return { success: true, data: { resourceId: input.resourceId, previousValue, value, jump: input.jump, max: snap.max } };
}

type DecrementInput = Extract<ModulePartyResourcesInputType, { action: 'decrement' }>;
async function handleDecrement(input: DecrementInput): Promise<Envelope<unknown>> {
  if (!resourceList().includes(input.resourceId)) {
    return { success: false, error: `RESOURCE_NOT_FOUND: no resource "${input.resourceId}" in the party tracker` };
  }
  const snap = readResource(input.resourceId);
  const previousValue = snap.value;
  const value = Math.max(snap.min, previousValue - input.jump); // module clamp math (resources_api.mjs decrement)
  await settingSet(input.resourceId, value);
  notify.updated('party-resources', snap.name || input.resourceId, { summary: `value ${previousValue} → ${value} (-${input.jump})` });
  return { success: true, data: { resourceId: input.resourceId, previousValue, value, jump: input.jump, min: snap.min } };
}

// ── Metadata configuration (per-field settings writes) ────────────────────────────

const META_FIELD_KEYS: Array<[keyof MetaInput, string]> = [
  ['name', '_name'],
  ['max', '_max'],
  ['min', '_min'],
  ['visible', '_visible'],
  ['playerManaged', '_player_managed'],
  ['icon', '_icon'],
  ['useIcon', '_use_icon'],
  ['notifyChat', '_notify_chat'],
  ['incMessage', '_notify_chat_increment_message'],
  ['decMessage', '_notify_chat_decrement_message'],
];

type MetaInput = Extract<ModulePartyResourcesInputType, { action: 'update-meta' }>;
async function handleUpdateMeta(input: MetaInput): Promise<Envelope<unknown>> {
  if (!resourceList().includes(input.resourceId)) {
    return { success: false, error: `RESOURCE_NOT_FOUND: no resource "${input.resourceId}" in the party tracker` };
  }
  const updated: string[] = [];
  for (const [field, suffix] of META_FIELD_KEYS) {
    const v = (input as any)[field];
    if (v !== undefined) {
      await settingSet(`${input.resourceId}${suffix}`, v);
      updated.push(String(field));
    }
  }
  if (updated.length === 0) {
    return { success: false, error: 'PARTY_RESOURCES_NO_FIELDS: update-meta requires at least one metadata field' };
  }
  const snapshot = readResource(input.resourceId); // DP-16 read-back of the merged state
  notify.updated('party-resources', snapshot.name || input.resourceId, { summary: `meta updated: ${updated.join(', ')}` });
  return { success: true, data: { resourceId: input.resourceId, updatedFields: updated, snapshot } };
}

// ── Registry mutations (confirm-gated) ────────────────────────────────────────────

type CreateInput = Extract<ModulePartyResourcesInputType, { action: 'create' }>;
async function handleCreate(input: CreateInput): Promise<Envelope<unknown>> {
  if (resourceList().includes(input.resourceId)) {
    return { success: false, error: `PARTY_RESOURCES_EXISTS: resource "${input.resourceId}" already exists` };
  }
  const api = getPartyApi();
  if (typeof api.register_resource !== 'function') {
    throw new Error('PARTY_RESOURCES_API_UNAVAILABLE: window.pr.api.register_resource is not bound');
  }
  // register_resource(id) registers the 14 settings keys so game.settings.set won't throw "not
  // registered". It does NOT append to resource_list (ResourcesList.add is module-internal), so we
  // append the id ourselves (research A1).
  await api.register_resource(input.resourceId);

  // Seed value + provided metadata (game.settings.set directly — no chat on create).
  await settingSet(input.resourceId, input.value);
  await settingSet(`${input.resourceId}_name`, input.name ?? input.resourceId);
  await settingSet(`${input.resourceId}_max`, input.max);
  await settingSet(`${input.resourceId}_min`, input.min);
  if (input.visible !== undefined) await settingSet(`${input.resourceId}_visible`, input.visible);
  if (input.playerManaged !== undefined) await settingSet(`${input.resourceId}_player_managed`, input.playerManaged);
  if (input.icon !== undefined) await settingSet(`${input.resourceId}_icon`, input.icon);
  if (input.notifyChat !== undefined) await settingSet(`${input.resourceId}_notify_chat`, input.notifyChat);

  // Append to resource_list (persists the registry across reloads); position = end of list.
  const list = resourceList();
  await settingSet(`${input.resourceId}_position`, list.length + 1);
  list.push(input.resourceId);
  await settingSet(LIST_KEY, list);

  // DP-16 — confirm the id is now registered + readable.
  if (!resourceList().includes(input.resourceId)) {
    return { success: false, error: `${ErrorTokens.PARTY_RESOURCES_CREATE_NOT_PERSISTED}: "${input.resourceId}" did not appear in resource_list` };
  }
  const snapshot = readResource(input.resourceId);
  notify.created('party-resources', snapshot.name || input.resourceId, { summary: `track created (value ${snapshot.value}, ${snapshot.min}..${snapshot.max})` });
  return { success: true, data: { resourceId: input.resourceId, snapshot } };
}

type DeleteInput = Extract<ModulePartyResourcesInputType, { action: 'delete' }>;
async function handleDelete(input: DeleteInput): Promise<Envelope<unknown>> {
  const list = resourceList();
  if (!list.includes(input.resourceId)) {
    return { success: false, error: `RESOURCE_NOT_FOUND: no resource "${input.resourceId}" in the party tracker` };
  }
  const name = readResource(input.resourceId).name || input.resourceId;
  // ResourcesList.remove is module-internal; replicate the splice (research A1). Per-resource
  // settings keys are orphaned (harmless — they re-default if the id is recreated).
  const next = list.filter((id) => id !== input.resourceId);
  await settingSet(LIST_KEY, next);

  // DP-16 — confirm the id is gone.
  if (resourceList().includes(input.resourceId)) {
    return { success: false, error: `${ErrorTokens.PARTY_RESOURCES_DELETE_NOT_PERSISTED}: "${input.resourceId}" still present in resource_list` };
  }
  notify.deleted('party-resources', name, { summary: `track removed (settings keys orphaned)` });
  return { success: true, data: { resourceId: input.resourceId, removed: true, remaining: next.length } };
}
