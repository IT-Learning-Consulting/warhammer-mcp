// Phase 4 mcp_completion_v1 — Setting handler (hand-rolled; game.settings API).
//
// Setting is NOT a Foundry Document: no .create()/.update()/.delete(), no _source,
// no collection lookup. factory does not apply. Pattern from handlers/diagnostic.ts:862-900.
//
// 4 actions: get, set, list, list-world-db.
// `register` and `delete` are intentionally absent (R4.4: un-marshalable / no use case).
//
// set safety gates:
//   1. Blocklist (hard-reject without force): enabled, serverHost, serverPort
//   2. onChange-advisory (soft-reject without force): any other registered setting with onChange
//   3. Round-trip verify: re-read + JSON.stringify compare after await game.settings.set()
//
// NEVER calls ChatMessage.create — all GM feedback routes through notify.* (notify-migration-guard).
//
// Anchors:
//   - DP-15: typed Envelope<T> returns.
//   - CCR-Verify-Persistence HC2: JSON.stringify round-trip verify on set.
//   - Design Decision Q3: force:boolean + static blocklist + onChange-advisory.

import {
  ErrorTokens,
  SettingToolInput,
  type SettingViewModel,
  type SettingListItem,
  type SettingWorldDbItem,
} from '@foundry-mcp/shared';
import { validateGMAccess, type Envelope } from '../utils/flatWorldCRUDFactory.js';

// Keys whose onChange callbacks restart / reconfigure the MCP bridge (K7 class).
// Hard-blocked without force:true.
const SETTING_BLOCKLIST = new Set(['enabled', 'serverHost', 'serverPort']);

// ── Helpers ───────────────────────────────────────────────────────────────

function resolveTypeLabel(type: unknown): string {
  if (type === Boolean) return 'Boolean';
  if (type === Number) return 'Number';
  if (type === String) return 'String';
  if (type === Array) return 'Array';
  if (typeof type === 'function') return type.name || '<Function>';
  return typeof type === 'string' ? type : 'Unknown';
}

function getRegisteredConfig(ns: string, key: string): any {
  const fullKey = `${ns}.${key}`;
  const reg: Map<string, any> | undefined = (globalThis as any).game?.settings?.settings;
  return reg?.get(fullKey) ?? null;
}

// BUG-845: `value`'s JS type checked against the setting's REGISTERED type, before it ever reaches
// game.settings.set(). Foundry coerces a mismatched primitive rather than rejecting it (a string on a
// Boolean setting follows JS Boolean() truthiness — "false" -> true), and the round-trip verify then
// reported the same SETTING_WRITE_NOT_PERSISTED for that silent corruption as for a harmless mismatch
// that happened to coerce to the right value, with no way to tell the two apart from the error text.
// `null` always passes — a caller explicitly clearing a value is a distinct, legitimate intent this
// check has no basis to refuse. An unregistered key (cfg null/type undefined) or a registered
// Object/custom-class type also always passes — this guard targets the four JS primitives Foundry's
// own coercion silently misbehaves on, not a general schema validator.
function describeTypeMismatch(type: unknown, value: unknown): string | null {
  if (value === null) return null;
  if (type === Boolean) return typeof value === 'boolean' ? null : typeof value;
  if (type === Number) return typeof value === 'number' && Number.isFinite(value) ? null : typeof value;
  if (type === String) return typeof value === 'string' ? null : typeof value;
  if (type === Array) return Array.isArray(value) ? null : typeof value;
  return null;
}

function buildViewModel(ns: string, key: string, value: unknown, cfg: any): SettingViewModel {
  return {
    namespace: ns,
    key,
    fullKey: `${ns}.${key}`,
    value,
    scope: String(cfg?.scope ?? 'world'),
    typeLabel: resolveTypeLabel(cfg?.type),
    hasOnChange: typeof cfg?.onChange === 'function',
  };
}

// ── Action handlers ───────────────────────────────────────────────────────

async function handleGet(input: any): Promise<Envelope<any>> {
  const { namespace: ns, key } = input;
  try {
    const value = (globalThis as any).game.settings.get(ns, key);
    const cfg = getRegisteredConfig(ns, key);
    return {
      success: true,
      data: { setting: buildViewModel(ns, key, value, cfg) },
    };
  } catch (e) {
    return {
      success: false,
      error: `SETTING_GET_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

async function handleSet(input: any): Promise<Envelope<any>> {
  const { namespace: ns, key, value, force } = input;
  const cfg = getRegisteredConfig(ns, key);

  const typeMismatch = describeTypeMismatch(cfg?.type, value);
  if (typeMismatch) {
    return {
      success: false,
      error: `SETTING_VALUE_TYPE_MISMATCH: "${ns}.${key}" is registered as ${resolveTypeLabel(cfg?.type)}, but value ${JSON.stringify(value)} is a ${typeMismatch}. Pass a real ${resolveTypeLabel(cfg?.type)} value.`,
    };
  }

  // Hard blocklist check (enabled / serverHost / serverPort within warhammer-mcp namespace)
  if (ns === 'warhammer-mcp' && SETTING_BLOCKLIST.has(key) && !force) {
    return {
      success: false,
      error: `SETTING_SIDE_EFFECT_BLOCKED: "${ns}.${key}" is a K7-class key that can restart or reconfigure the MCP bridge. Pass force:true to override.`,
    };
  }

  // onChange-advisory gate for any other setting
  if (cfg?.onChange != null && typeof cfg.onChange === 'function' && !force) {
    return {
      success: false,
      error: `SETTING_ONCHANGE_BLOCKED: "${ns}.${key}" has a registered onChange callback that may produce side effects. Pass force:true to override.`,
    };
  }

  try {
    await (globalThis as any).game.settings.set(ns, key, value);
  } catch (e) {
    return {
      success: false,
      error: `SETTING_SET_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  // CCR-Verify-Persistence HC2: round-trip read-back + JSON.stringify compare
  let persistedValue: unknown;
  try {
    persistedValue = (globalThis as any).game.settings.get(ns, key);
  } catch (e) {
    return {
      success: false,
      error: `${ErrorTokens.SETTING_WRITE_NOT_PERSISTED}: could not read back "${ns}.${key}" after set — ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (JSON.stringify(persistedValue) !== JSON.stringify(value)) {
    return {
      success: false,
      error: `${ErrorTokens.SETTING_WRITE_NOT_PERSISTED}: "${ns}.${key}" was written but round-trip verify failed (wrote ${JSON.stringify(value)}, read back ${JSON.stringify(persistedValue)})`,
    };
  }

  const updatedCfg = getRegisteredConfig(ns, key);
  return {
    success: true,
    data: {
      setting: buildViewModel(ns, key, persistedValue, updatedCfg),
      verified: true,
    },
  };
}

async function handleList(input: any): Promise<Envelope<any>> {
  const { namespacePrefix, scopeFilter, countOnly } = input;
  const reg: Map<string, any> | undefined = (globalThis as any).game?.settings?.settings;
  if (!reg || typeof reg.entries !== 'function') {
    return { success: false, error: 'SETTING_REGISTRY_UNAVAILABLE: game.settings.settings is not accessible' };
  }

  const items: SettingListItem[] = [];
  for (const [, cfg] of reg.entries()) {
    if (!cfg) continue;
    const ns = String(cfg.namespace ?? '');
    if (namespacePrefix && !ns.startsWith(namespacePrefix)) continue;
    const scope = String(cfg.scope ?? '');
    if (scopeFilter && scope !== scopeFilter) continue;
    const key = String(cfg.key ?? '');
    items.push({
      namespace: ns,
      key,
      fullKey: `${ns}.${key}`,
      scope,
      typeLabel: resolveTypeLabel(cfg.type),
      hasOnChange: typeof cfg.onChange === 'function',
    });
  }

  if (countOnly) {
    return { success: true, data: { total: items.length } };
  }

  return { success: true, data: { total: items.length, items } };
}

async function handleListWorldDb(input: any): Promise<Envelope<any>> {
  const { namespacePrefix, countOnly } = input;
  try {
    const storage = (globalThis as any).game?.settings?.storage?.get('world');
    if (!storage) {
      return { success: false, error: 'SETTING_WORLD_DB_UNAVAILABLE: game.settings.storage.get("world") is not accessible' };
    }

    const contents: any[] = storage.contents ?? [];
    let items: SettingWorldDbItem[] = contents.map((s: any) => ({
      key: String(s.key ?? ''),
      value: s.value,
      id: String(s.id ?? ''),
    }));

    if (namespacePrefix) {
      items = items.filter((s) => s.key.startsWith(namespacePrefix));
    }

    if (countOnly) {
      return { success: true, data: { total: items.length } };
    }

    return { success: true, data: { total: items.length, items } };
  } catch (e) {
    return {
      success: false,
      error: `SETTING_LIST_WORLD_DB_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ── Umbrella dispatcher ────────────────────────────────────────────────────

export async function dispatchSetting(data: unknown): Promise<any> {
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return { success: false, error: 'Access denied: setting actions require GM' };
  }

  let input: any;
  try {
    input = SettingToolInput.parse(data ?? {});
  } catch (e) {
    // BUG-366: clean typed token instead of a raw Zod dump for an invalid action/shape.
    const message = e instanceof Error ? e.message : 'Invalid input';
    return { success: false, error: `SETTING_INVALID_INPUT: ${message}` };
  }

  switch (input.action) {
    case 'get':
      return handleGet(input);
    case 'set':
      return handleSet(input);
    case 'list':
      return handleList(input);
    case 'list-world-db':
      return handleListWorldDb(input);
    default:
      throw new Error(`Unknown setting action: ${(input as any).action}`);
  }
}
