// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v2 Phase 11 — module-macro-trigger handler (Macro Trigger v1.0.1, lobowarewolf).
//
// Always-registered umbrella. requireModuleActive('macro-trigger') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 5 actions, ONE flat settings-array write architecture (phase11_pre_plan.md §Confirmed facts 2/8):
// all binding state lives in the world setting `macro-trigger.macroEvents` (scope:world, type:Array,
// default:[]) as a flat array of `{id,name,macroId,event}` objects. We bypass the module's own
// `macroEvent` class entirely (its methods are thin wrappers over the same game.settings.get/set calls —
// capability_audit/macro-trigger.md §API/Globals) and write the setting directly.
//
// NO SETTLE-POLL: unlike narrator-tools, this handler is the ONLY writer of the setting — the
// `await game.settings.set(...)` call is our own, awaited, immediate-consistent write. A single
// synchronous re-read after the awaited set suffices (identical to narrator's `configure` action).
// settlePoll is only needed when a THIRD PARTY module's own convenience method fires an internal
// fire-and-forget write; N/A here (phase11_pre_plan.md §Confirmed facts 8).
//
// macroId SOFT-WARN (D3): the module's own dispatcher resolves macroId via game.macros.get(macroId) then
// fromUuid(macroId), falling back to a console.warn + no-op execution if neither resolves
// (capability_audit/macro-trigger.md §Note on macroId). We mirror that non-blocking posture: create/
// update still WRITE the binding even when macroId doesn't resolve to a live Macro, but surface a
// `warning` string in the result so the caller can fix it before relying on the binding.
//
// renderJournalSheet (D2): the 38-hook enum is exposed exactly as the module registers it, including
// `renderJournalSheet` — a hook Foundry v13 renamed to `renderJournalEntrySheet` (never registered by the
// module). A binding on it will persist but never fire; documented in the skill, not silently dropped.
//
// Source of truth: .agents/research/module_integration/phase11_pre_plan.md +
// capability_audit/macro-trigger.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { MacroTriggerInput, type MacroTriggerInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';


const MODULE_ID = 'macro-trigger';
// LIVE-VERIFIED 2026-07-02: the module registers its setting under the key `macroEvents` (lowercase),
// NOT `MacroEvents`. The capability audit + research subagents read the minified property LABEL
// `S={'MacroEvents': <decoded>}` whose decoded VALUE is the real key `macroEvents`; the live
// `setting list` for namespace `macro-trigger` returns exactly one key: `macro-trigger.macroEvents`.
// Using the wrong-case key throws "not a registered game setting" on every action (live-smoke-only).
const SETTING_KEY = 'macroEvents';

interface MacroTriggerBinding {
  id: string;
  name: string;
  macroId: string;
  event: string;
}

const WRITE_ACTIONS = new Set(['create', 'update', 'delete', 'clear']);

// ── Local helpers ──────────────────────────────────────────────────────────────

function readBindings(): MacroTriggerBinding[] {
  const raw = getGame()?.settings?.get?.(MODULE_ID, SETTING_KEY);
  return Array.isArray(raw) ? (raw as MacroTriggerBinding[]) : [];
}

async function writeBindings(bindings: MacroTriggerBinding[]): Promise<void> {
  await getGame().settings.set(MODULE_ID, SETTING_KEY, bindings);
}

/** Soft-resolve a macroId (world-macro id OR UUID, incl. compendium) — mirrors the module's own
 * non-blocking dispatch-time resolution. Returns null when resolved, else a warning string. */
async function resolveMacroWarning(macroId: string): Promise<string | null> {
  const worldMacro = getGame()?.macros?.get?.(macroId);
  if (worldMacro) return null;
  const fromUuidFn = (globalThis as any).fromUuid;
  if (typeof fromUuidFn === 'function') {
    try {
      const doc = await fromUuidFn(macroId);
      if (doc && doc.documentName === 'Macro') return null;
    } catch {
      // fromUuid threw (malformed uuid) — falls through to the warning below.
    }
  }
  return `macroId "${macroId}" does not resolve to a Macro (checked game.macros and fromUuid) — the binding was created/updated anyway, but will not fire until a valid Macro id/UUID is set.`;
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_NOT_PERSISTED}: ${detail}` };
}
function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_CONFIRM_REQUIRED}: ${detail}` };
}
function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_TARGET_NOT_FOUND}: ${detail}` };
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleMacroTrigger(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: MacroTriggerInputType;
  try {
    input = MacroTriggerInput.parse(data);
  } catch (e) {
    return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_INVALID_INPUT}: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_ACCESS_DENIED}: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'list':
        return handleList(input);
      case 'create':
        return await handleCreate(input);
      case 'update':
        return await handleUpdate(input);
      case 'delete':
        return await handleDelete(input);
      case 'clear':
        return await handleClear(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_UNKNOWN_ACTION}: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `${ErrorTokens.MACRO_TRIGGER_HANDLER_ERROR}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── list (ungated read) ─────────────────────────────────────────────────────────

type ListInput = Extract<MacroTriggerInputType, { action: 'list' }>;
function handleList(input: ListInput): Envelope<unknown> {
  const bindings = readBindings();
  const filtered = input.event ? bindings.filter((b) => b.event === input.event) : bindings;
  return { success: true, data: { action: 'list', count: filtered.length, bindings: filtered } };
}

// ── create (verify: id present on re-read) ──────────────────────────────────────

type CreateInput = Extract<MacroTriggerInputType, { action: 'create' }>;
async function handleCreate(input: CreateInput): Promise<Envelope<unknown>> {
  const id: string = (globalThis as any).foundry?.utils?.randomID?.(16) ?? String(Date.now());
  const binding: MacroTriggerBinding = { id, name: input.name, macroId: input.macroId, event: input.event };
  const bindings = readBindings();
  bindings.push(binding);
  await writeBindings(bindings);

  const after = readBindings();
  const created = after.find((b) => b.id === id);
  if (!created) {
    return notPersisted(`binding "${input.name}" (id ${id}) not present in MacroEvents after create.`);
  }

  const warning = await resolveMacroWarning(input.macroId);
  notify.created('macro-trigger', input.name, { summary: `bound to ${input.event}` });
  return {
    success: true,
    data: { action: 'create', binding: created, ...(warning ? { warning } : {}) },
  };
}

// ── update (verify: fields present on re-read) ───────────────────────────────────

type UpdateInput = Extract<MacroTriggerInputType, { action: 'update' }>;
async function handleUpdate(input: UpdateInput): Promise<Envelope<unknown>> {
  const bindings = readBindings();
  const idx = bindings.findIndex((b) => b.id === input.bindingId);
  if (idx === -1) return targetNotFound(`no binding with id "${input.bindingId}" found in MacroEvents.`);

  const existing = bindings[idx]!;
  const merged: MacroTriggerBinding = {
    id: existing.id,
    name: input.name ?? existing.name,
    macroId: input.macroId ?? existing.macroId,
    event: input.event ?? existing.event,
  };
  bindings[idx] = merged;
  await writeBindings(bindings);

  const after = readBindings();
  const updated = after.find((b) => b.id === input.bindingId);
  if (
    !updated ||
    updated.name !== merged.name ||
    updated.macroId !== merged.macroId ||
    updated.event !== merged.event
  ) {
    return notPersisted(`binding "${input.bindingId}" did not match expected fields after update.`);
  }

  const warning = input.macroId ? await resolveMacroWarning(input.macroId) : null;
  notify.updated('macro-trigger', updated.name, { summary: `now bound to ${updated.event}` });
  return {
    success: true,
    data: { action: 'update', binding: updated, ...(warning ? { warning } : {}) },
  };
}

// ── delete (confirm-gated; verify: absent on re-read) ────────────────────────────

type DeleteInput = Extract<MacroTriggerInputType, { action: 'delete' }>;
async function handleDelete(input: DeleteInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`delete removes binding "${input.bindingId}" from MacroEvents. Re-call with confirm:true.`);
  }
  const bindings = readBindings();
  const existing = bindings.find((b) => b.id === input.bindingId);
  if (!existing) return targetNotFound(`no binding with id "${input.bindingId}" found in MacroEvents.`);

  const remaining = bindings.filter((b) => b.id !== input.bindingId);
  await writeBindings(remaining);

  const after = readBindings();
  const stillPresent = after.some((b) => b.id === input.bindingId);
  if (stillPresent) {
    return notPersisted(`binding "${input.bindingId}" still present in MacroEvents after delete.`);
  }

  notify.deleted('macro-trigger', existing.name, { summary: `unbound from ${existing.event}` });
  return { success: true, data: { action: 'delete', bindingId: input.bindingId, deleted: true } };
}

// ── clear (confirm-gated; verify: empty on re-read) ──────────────────────────────

type ClearInput = Extract<MacroTriggerInputType, { action: 'clear' }>;
async function handleClear(input: ClearInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`clear removes ALL bindings from MacroEvents. Re-call with confirm:true.`);
  }
  const before = readBindings();
  const clearedCount = before.length;
  await writeBindings([]);

  const after = readBindings();
  if (after.length !== 0) {
    return notPersisted(`MacroEvents still has ${after.length} binding(s) after clear.`);
  }

  notify.deleted('macro-trigger', 'all bindings', { summary: `cleared ${clearedCount} binding(s)` });
  return { success: true, data: { action: 'clear', clearedCount } };
}
