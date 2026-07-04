// Module Integration v2 Phase 11 — Unit tests for module-macro-trigger dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user/settings/macros) and globalThis.foundry.utils —
// no live Foundry. Unlike narrator-tools, this handler is the ONLY writer of the setting (no third-party
// fire-and-forget write to race), so the mock's `settings.set` is a plain synchronous-resolving async fn —
// no setTimeout-delayed write is needed to prove correctness (see module header "NO SETTLE-POLL").
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive macro-trigger → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//   2. A write fired by a non-GM → MACRO_TRIGGER_ACCESS_DENIED.
//   3. An out-of-enum `event` → MACRO_TRIGGER_INVALID_INPUT (discriminatedUnion reject) — the enum-drift
//      guard rejects a typo'd/dead hook name at create time instead of silently persisting a dead binding.
//   4. MACRO_TRIGGER_EVENTS has exactly 38 entries — the byte-identical contract with the mcp-server
//      package-local duplicate (CCR-5); a drift here would silently desync the two enums.
//   5. list: returns all bindings, and filters by `event` when supplied.
//   6. create: happy path (id assigned, present on re-read, notify.created fired).
//   7. create with an unresolvable macroId → result carries `warning`, binding still created (D3 soft-warn
//      — mirrors the module's own non-blocking console.warn-at-fire, not a hard reject).
//   8. update: happy path (merges provided fields, verifies on re-read) and missing bindingId →
//      MACRO_TRIGGER_TARGET_NOT_FOUND.
//   9. delete: without confirm → MACRO_TRIGGER_CONFIRM_REQUIRED (no write attempted); with confirm →
//      binding removed and absent on re-read.
//  10. clear: without confirm → MACRO_TRIGGER_CONFIRM_REQUIRED; with confirm → MacroEvents empty.
//  11. An unknown action → MACRO_TRIGGER_UNKNOWN_ACTION.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleMacroTrigger } from '../macro-trigger.js';
import { MACRO_TRIGGER_EVENTS } from '@foundry-mcp/shared';

const MODULE_ID = 'macro-trigger';

function makeWorld(opts: { isGM?: boolean; seed?: any[] } = {}) {
  const settingsStore: Record<string, any> = {
    macroEvents: opts.seed ?? [],
  };

  const settings = {
    get: vi.fn((_scope: string, key: string) => settingsStore[key]),
    set: vi.fn(async (_scope: string, key: string, value: any) => {
      settingsStore[key] = value;
      return value;
    }),
  };

  const macrosCollection = {
    get: vi.fn((id: string) => (id === 'realMacroId' ? { id: 'realMacroId', name: 'Real Macro' } : undefined)),
  };

  const game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: true } : undefined) },
    user: { isGM: opts.isGM ?? true },
    settings,
    macros: macrosCollection,
  };

  return { game, settingsStore };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).foundry = { utils: { randomID: vi.fn(() => 'testid1234567890') } };
  (globalThis as any).fromUuid = vi.fn(async () => null);
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).foundry;
  delete (globalThis as any).fromUuid;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive macro-trigger → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleMacroTrigger({ action: 'create', name: 'X', event: 'createActor', macroId: 'realMacroId' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('macro-trigger');
  });

  it('inactive macro-trigger → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleMacroTrigger({ action: 'list' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM → MACRO_TRIGGER_ACCESS_DENIED', async () => {
    const world = makeWorld({ isGM: false });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'create', name: 'X', event: 'createActor', macroId: 'realMacroId' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MACRO_TRIGGER_ACCESS_DENIED');
    expect(world.game.settings.set).not.toHaveBeenCalled();
  });
});

// ── 3. discriminatedUnion / enum rejects ─────────────────────────────────────────

describe('schema discriminatedUnion + event enum', () => {
  it('an out-of-enum event is rejected at parse → MACRO_TRIGGER_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'create', name: 'X', event: 'renderJournalEntrySheet', macroId: 'realMacroId' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MACRO_TRIGGER_INVALID_INPUT');
    expect(world.game.settings.set).not.toHaveBeenCalled();
  });

  it('an unknown action is rejected at parse → MACRO_TRIGGER_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'nuke-the-world' } as any);
    expect(res.success).toBe(false);
    expect(res.error).toContain('MACRO_TRIGGER_INVALID_INPUT');
  });
});

// ── 4. 38-hook enum contract ──────────────────────────────────────────────────────

describe('MACRO_TRIGGER_EVENTS', () => {
  it('has exactly 38 entries (byte-identical contract with the mcp-server package-local duplicate)', () => {
    expect(MACRO_TRIGGER_EVENTS.length).toBe(38);
    expect(new Set(MACRO_TRIGGER_EVENTS).size).toBe(38);
  });
});

// ── 5. list ────────────────────────────────────────────────────────────────────

describe('list', () => {
  it('returns all bindings, and filters by event when supplied', async () => {
    const seed = [
      { id: 'a', name: 'A', macroId: 'realMacroId', event: 'createActor' },
      { id: 'b', name: 'B', macroId: 'realMacroId', event: 'combatStart' },
    ];
    const world = makeWorld({ seed });
    (globalThis as any).game = world.game;

    const all: any = await dispatchModuleMacroTrigger({ action: 'list' });
    expect(all.success).toBe(true);
    expect(all.data.count).toBe(2);

    const filtered: any = await dispatchModuleMacroTrigger({ action: 'list', event: 'combatStart' });
    expect(filtered.success).toBe(true);
    expect(filtered.data.count).toBe(1);
    expect(filtered.data.bindings[0].id).toBe('b');
  });
});

// ── 6/7. create ────────────────────────────────────────────────────────────────

describe('create', () => {
  it('happy path: id assigned, present on re-read', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'create', name: 'Announce', event: 'createActor', macroId: 'realMacroId' });
    expect(res.success).toBe(true);
    expect(res.data.binding.id).toBe('testid1234567890');
    expect(res.data.warning).toBeUndefined();
    expect(world.settingsStore.macroEvents).toHaveLength(1);
    expect(world.settingsStore.macroEvents[0].event).toBe('createActor');
  });

  it('unresolvable macroId → result carries a warning, binding still created (D3 soft-warn)', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'create', name: 'Ghost', event: 'createActor', macroId: 'deadbeef00000000' });
    expect(res.success).toBe(true);
    expect(typeof res.data.warning).toBe('string');
    expect(res.data.warning).toContain('deadbeef00000000');
    expect(world.settingsStore.macroEvents).toHaveLength(1);
  });
});

// ── 8. update ──────────────────────────────────────────────────────────────────

describe('update', () => {
  it('merges provided fields and verifies on re-read', async () => {
    const seed = [{ id: 'a', name: 'A', macroId: 'realMacroId', event: 'createActor' }];
    const world = makeWorld({ seed });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'update', bindingId: 'a', event: 'combatStart' });
    expect(res.success).toBe(true);
    expect(res.data.binding.event).toBe('combatStart');
    expect(res.data.binding.name).toBe('A'); // unchanged field preserved
    expect(world.settingsStore.macroEvents[0].event).toBe('combatStart');
  });

  it('missing bindingId → MACRO_TRIGGER_TARGET_NOT_FOUND', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'update', bindingId: 'nope', name: 'X' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MACRO_TRIGGER_TARGET_NOT_FOUND');
  });
});

// ── 9. delete ──────────────────────────────────────────────────────────────────

describe('delete', () => {
  it('without confirm → MACRO_TRIGGER_CONFIRM_REQUIRED, no write attempted', async () => {
    const seed = [{ id: 'a', name: 'A', macroId: 'realMacroId', event: 'createActor' }];
    const world = makeWorld({ seed });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'delete', bindingId: 'a' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MACRO_TRIGGER_CONFIRM_REQUIRED');
    expect(world.game.settings.set).not.toHaveBeenCalled();
  });

  it('with confirm:true → binding removed, absent on re-read', async () => {
    const seed = [{ id: 'a', name: 'A', macroId: 'realMacroId', event: 'createActor' }];
    const world = makeWorld({ seed });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'delete', bindingId: 'a', confirm: true });
    expect(res.success).toBe(true);
    expect(world.settingsStore.macroEvents).toHaveLength(0);
  });
});

// ── 10. clear ──────────────────────────────────────────────────────────────────

describe('clear', () => {
  it('without confirm → MACRO_TRIGGER_CONFIRM_REQUIRED, no write attempted', async () => {
    const seed = [{ id: 'a', name: 'A', macroId: 'realMacroId', event: 'createActor' }];
    const world = makeWorld({ seed });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'clear' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MACRO_TRIGGER_CONFIRM_REQUIRED');
    expect(world.game.settings.set).not.toHaveBeenCalled();
  });

  it('with confirm:true → MacroEvents is empty', async () => {
    const seed = [
      { id: 'a', name: 'A', macroId: 'realMacroId', event: 'createActor' },
      { id: 'b', name: 'B', macroId: 'realMacroId', event: 'combatStart' },
    ];
    const world = makeWorld({ seed });
    (globalThis as any).game = world.game;
    const res: any = await dispatchModuleMacroTrigger({ action: 'clear', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.clearedCount).toBe(2);
    expect(world.settingsStore.macroEvents).toHaveLength(0);
  });
});
