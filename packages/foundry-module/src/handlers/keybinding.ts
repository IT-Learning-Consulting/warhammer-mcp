// Phase 10 mcp_coverage_expansion — keybinding handler.
//
// GM-client inspection + mutation of Foundry v13 `game.keybindings`
// (foundry.helpers.interaction.ClientKeybindings).
//
// 6 actions:
//   list           — enumerate game.keybindings.actions + current bindings.
//   get            — one action's config + current bindings.
//   set            — rebind one action; validate modifier values against the live
//                    KeyboardManager.MODIFIER_KEYS; re-read verify (CCR-2a).
//   reset-action   — re-set one action to its registered `editable` defaults (no native single
//                    reset method exists in v13 ClientKeybindings); re-read verify (CCR-2a).
//   reset-all      — resetDefaults() — bulk-irreversible. dryRun previews the impact count;
//                    confirm gate (CCR-4) executes; post-reset diff asserted 0 (CCR-2a).
//   find-conflicts — group every action's current bindings by (key, sorted modifiers);
//                    report combos bound to >1 action (optional precedence filter).
//
// CLIENT-ONLY: keybindings persist to the GM browser's localStorage. This handler runs on the
// GM client and touches only THAT browser; players are unreachable; registration is init-time.
//
// HC1 / CCR-3: thin primitive — no system-config reads, no game-rule logic.
//
// Error tokens: KEYBINDING_ACTION_NOT_FOUND, INVALID_BINDING, KEYBINDING_NOT_PERSISTED,
//               KEYBINDING_RESET_NOT_CONFIRMED, KEYBINDING_UNAVAILABLE.

import {
  ErrorTokens,
  KeybindingToolInput,
  type KeybindingToolInputType,
  type KeybindingGetInputType,
  type KeybindingSetInputType,
  type KeybindingResetActionInputType,
  type KeybindingResetAllInputType,
  type KeybindingListInputType,
  type KeybindingFindConflictsInputType,
  type KeybindingBinding,
  type KeybindingActionView,
} from '@foundry-mcp/shared';
import { notify } from '../notify.js';

// ── GM gate helper (mirrors dice-roll.ts) ───────────────────────────────────────

function validateGMAccess(): void {
  if (!game.user?.isGM) {
    throw new Error('Access denied: GM-only operation');
  }
}

// ── Envelope type ───────────────────────────────────────────────────────────────

type Envelope<T> = { success: true; data: T };

// ── Foundry global accessors (resolved defensively; namespaces vary by load order) ──

function getKeybindings(): any {
  const kb = (game as any)?.keybindings;
  if (!kb || typeof kb.actions === 'undefined') {
    throw new Error('KEYBINDING_UNAVAILABLE: game.keybindings is not ready');
  }
  return kb;
}

// Canonical modifier VALUE strings come from Foundry, not a hard-coded list (avoids drift).
function allowedModifiers(): string[] {
  const KM =
    (foundry as any)?.helpers?.interaction?.KeyboardManager ?? (globalThis as any).KeyboardManager;
  const mods = KM?.MODIFIER_KEYS;
  return mods ? Object.values(mods).map((v) => String(v)) : [];
}

function precedenceMap(): Record<string, number> {
  const p = (CONST as any)?.KEYBINDING_PRECEDENCE;
  return p ?? { PRIORITY: 0, NORMAL: 1, DEFERRED: 2 };
}

function humanize(binding: any): string {
  const CC =
    (foundry as any)?.applications?.sidebar?.apps?.ControlsConfig ??
    (globalThis as any).ControlsConfig;
  try {
    if (CC?.humanizeBinding) return CC.humanizeBinding(binding);
  } catch {
    /* fall through to manual */
  }
  const mods = Array.isArray(binding?.modifiers) ? binding.modifiers : [];
  return [...mods, binding?.key].filter(Boolean).join(' + ');
}

// ── Binding normalization + helpers ─────────────────────────────────────────────

function normBinding(b: any): KeybindingBinding {
  const modifiers = Array.isArray(b?.modifiers) ? b.modifiers.map((m: any) => String(m)) : [];
  return { key: String(b?.key ?? ''), modifiers };
}

function comboKey(b: KeybindingBinding): string {
  return `${b.key}|${[...b.modifiers].sort().join('+')}`;
}

function bindingsEqual(a: KeybindingBinding[], b: KeybindingBinding[]): boolean {
  if (a.length !== b.length) return false;
  const sa = a.map(comboKey).sort();
  const sb = b.map(comboKey).sort();
  return sa.every((v, i) => v === sb[i]);
}

// Split a registered actionId ("namespace.action") using the config's own namespace when present.
function splitActionId(id: string, config: any): { namespace: string; keyAction: string } {
  const namespace = config?.namespace ?? id.split('.')[0] ?? '';
  const keyAction = namespace && id.startsWith(`${namespace}.`) ? id.slice(namespace.length + 1) : id;
  return { namespace, keyAction };
}

function currentBindings(kb: any, id: string, namespace: string, keyAction: string): KeybindingBinding[] {
  let raw: any[] | undefined = kb.bindings?.get?.(id);
  if (!Array.isArray(raw)) {
    try {
      raw = kb.get?.(namespace, keyAction);
    } catch {
      raw = undefined;
    }
  }
  return Array.isArray(raw) ? raw.map(normBinding) : [];
}

function editableDefaults(config: any): KeybindingBinding[] {
  return Array.isArray(config?.editable) ? config.editable.map(normBinding) : [];
}

function uneditableDefaults(config: any): KeybindingBinding[] {
  return Array.isArray(config?.uneditable) ? config.uneditable.map(normBinding) : [];
}

// The live bindings game.keybindings exposes = uneditable (locked) bindings + the editable
// override. set()/reset write only the EDITABLE override, so the live read after a write is
// `uneditable + override` — NOT the override alone. Verification + the reset-all diff must
// account for the locked bindings or they spuriously report a mismatch (confirmed live: setting
// core.panUp leaves its locked ArrowUp/Numpad8 bindings present alongside the new override).
function mergeBindings(locked: KeybindingBinding[], editable: KeybindingBinding[]): KeybindingBinding[] {
  return [...locked, ...editable];
}

function buildView(kb: any, id: string, config: any): KeybindingActionView {
  const { namespace, keyAction } = splitActionId(id, config);
  const current = currentBindings(kb, id, namespace, keyAction);
  return {
    id,
    namespace,
    name: typeof config?.name === 'string' ? config.name : id,
    ...(typeof config?.hint === 'string' ? { hint: config.hint } : {}),
    precedence: typeof config?.precedence === 'number' ? config.precedence : precedenceMap().NORMAL,
    restricted: Boolean(config?.restricted),
    editable: editableDefaults(config),
    current,
    humanized: current.map((b) => humanize(b)),
  };
}

// ── Action handlers ─────────────────────────────────────────────────────────────

function listActions(input: KeybindingListInputType): Envelope<unknown> {
  const kb = getKeybindings();
  const views: KeybindingActionView[] = [];
  for (const [id, config] of kb.actions as Map<string, any>) {
    if (input.namespace) {
      const { namespace } = splitActionId(id, config);
      if (namespace !== input.namespace) continue;
    }
    views.push(buildView(kb, id, config));
  }
  views.sort((a, b) => a.id.localeCompare(b.id));
  return { success: true, data: { actions: views, total: views.length } };
}

function getAction(input: KeybindingGetInputType): Envelope<unknown> {
  const kb = getKeybindings();
  const id = `${input.namespace}.${input.keyAction}`;
  const config = (kb.actions as Map<string, any>).get(id);
  if (!config) {
    throw new Error(`KEYBINDING_ACTION_NOT_FOUND: no registered action "${id}"`);
  }
  return { success: true, data: buildView(kb, id, config) };
}

async function setAction(input: KeybindingSetInputType): Promise<Envelope<unknown>> {
  const kb = getKeybindings();
  const id = `${input.namespace}.${input.keyAction}`;
  const config = (kb.actions as Map<string, any>).get(id);
  if (!config) {
    throw new Error(`KEYBINDING_ACTION_NOT_FOUND: no registered action "${id}"`);
  }

  // Validate modifier values against the live MODIFIER_KEYS (Foundry is the source of truth).
  const allowed = allowedModifiers();
  const requested = input.bindings.map(normBinding);
  if (allowed.length) {
    for (const b of requested) {
      for (const m of b.modifiers) {
        if (!allowed.includes(m)) {
          throw new Error(
            `INVALID_BINDING: modifier "${m}" is not a valid keyboard modifier (allowed: ${allowed.join(', ')})`,
          );
        }
      }
    }
  }

  await kb.set(input.namespace, input.keyAction, requested);

  // CCR-2a: re-read and assert the write landed. game.keybindings merges the locked
  // (uneditable) bindings with the editable override set() writes, so the expected live
  // state is `uneditable + requested` — NOT requested alone.
  const persisted = currentBindings(kb, id, input.namespace, input.keyAction);
  const expected = mergeBindings(uneditableDefaults(config), requested);
  if (!bindingsEqual(persisted, expected)) {
    throw new Error(
      `${ErrorTokens.KEYBINDING_NOT_PERSISTED}: post-write read for "${id}" did not match the expected bindings (uneditable + requested)`,
    );
  }

  notify.updated('keybinding', id, { summary: `set ${requested.length} binding(s)` });
  return { success: true, data: { id, bindings: persisted } };
}

async function resetActionBinding(input: KeybindingResetActionInputType): Promise<Envelope<unknown>> {
  const kb = getKeybindings();
  const id = `${input.namespace}.${input.keyAction}`;
  const config = (kb.actions as Map<string, any>).get(id);
  if (!config) {
    throw new Error(`KEYBINDING_ACTION_NOT_FOUND: no registered action "${id}"`);
  }

  // No native single-action reset — re-set to the registered editable defaults.
  const defaults = editableDefaults(config);
  await kb.set(input.namespace, input.keyAction, defaults);

  // CCR-2a: re-read; the restored live state is uneditable (locked) + editable defaults.
  const persisted = currentBindings(kb, id, input.namespace, input.keyAction);
  const expected = mergeBindings(uneditableDefaults(config), defaults);
  if (!bindingsEqual(persisted, expected)) {
    throw new Error(`${ErrorTokens.KEYBINDING_NOT_PERSISTED}: reset for "${id}" did not restore defaults`);
  }

  notify.updated('keybinding', id, { summary: 'reset to defaults' });
  return { success: true, data: { id, bindings: persisted } };
}

// Count + list actions whose current bindings differ from their editable defaults.
function customizedActions(kb: any): Array<{ id: string; name: string }> {
  const out: Array<{ id: string; name: string }> = [];
  for (const [id, config] of kb.actions as Map<string, any>) {
    const { namespace, keyAction } = splitActionId(id, config);
    const current = currentBindings(kb, id, namespace, keyAction);
    // Default live state = uneditable (locked) + editable defaults. An action is "customized"
    // only when its current live bindings differ from that — resetDefaults() would change it.
    const defaultLive = mergeBindings(uneditableDefaults(config), editableDefaults(config));
    if (!bindingsEqual(current, defaultLive)) {
      out.push({ id, name: typeof config?.name === 'string' ? config.name : id });
    }
  }
  return out;
}

async function resetAll(input: KeybindingResetAllInputType): Promise<Envelope<unknown>> {
  const kb = getKeybindings();
  const customized = customizedActions(kb);
  const count = customized.length;

  // CCR-4 dryRun: preview the impact, no mutation.
  if (input.dryRun) {
    return { success: true, data: { dryRun: true, reset: false, count, items: customized } };
  }

  // CCR-4 confirm gate: a plain literal true is sufficient (GM-only, no CSRF surface).
  if (input.confirm !== true) {
    throw new Error(
      `KEYBINDING_RESET_NOT_CONFIRMED: reset-all wipes ALL ${count} customized binding(s); pass dryRun:true to preview or confirm:true to execute`,
    );
  }

  await kb.resetDefaults();

  // CCR-2a: re-compute the diff; everything should now match defaults.
  const remaining = customizedActions(kb).length;
  if (remaining !== 0) {
    throw new Error(
      `${ErrorTokens.KEYBINDING_NOT_PERSISTED}: resetDefaults left ${remaining} action(s) still differing from default`,
    );
  }

  notify.updated('keybinding', 'all', { summary: `reset ${count} action(s) to defaults` });
  return { success: true, data: { dryRun: false, reset: true, count } };
}

function findConflicts(input: KeybindingFindConflictsInputType): Envelope<unknown> {
  const kb = getKeybindings();
  const prec = precedenceMap();
  const filterTier = input.precedenceFilter ? prec[input.precedenceFilter] : undefined;

  // Group every action's current bindings by (key + sorted modifiers).
  const groups = new Map<
    string,
    { key: string; modifiers: string[]; actions: Array<{ id: string; name: string; precedence: number; restricted: boolean }> }
  >();

  for (const [id, config] of kb.actions as Map<string, any>) {
    const actionPrecedence = typeof config?.precedence === 'number' ? config.precedence : prec.NORMAL;
    if (filterTier !== undefined && actionPrecedence !== filterTier) continue;
    const { namespace, keyAction } = splitActionId(id, config);
    const bindings = currentBindings(kb, id, namespace, keyAction);
    for (const b of bindings) {
      const ck = comboKey(b);
      if (!groups.has(ck)) groups.set(ck, { key: b.key, modifiers: b.modifiers, actions: [] });
      groups.get(ck)!.actions.push({
        id,
        name: typeof config?.name === 'string' ? config.name : id,
        precedence: actionPrecedence,
        restricted: Boolean(config?.restricted),
      });
    }
  }

  const conflicts = [...groups.values()].filter((g) => g.actions.length > 1);
  return { success: true, data: { conflicts, total: conflicts.length } };
}

// ── Dispatcher ──────────────────────────────────────────────────────────────────

export async function dispatchKeybinding(data: unknown): Promise<Envelope<unknown>> {
  let input: KeybindingToolInputType;
  try {
    input = KeybindingToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  validateGMAccess();

  switch (input.action) {
    case 'list':
      return listActions(input);
    case 'get':
      return getAction(input);
    case 'set':
      return setAction(input);
    case 'reset-action':
      return resetActionBinding(input);
    case 'reset-all':
      return resetAll(input);
    case 'find-conflicts':
      return findConflicts(input);
  }
}
