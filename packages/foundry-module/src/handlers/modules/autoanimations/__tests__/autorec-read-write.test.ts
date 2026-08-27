// BUG-812 — Autorec duplicate recovery cannot inspect the existing entry.
//
// Leg (a): get-autorec grows optional category/label/limit/offset filters — a parameterless
// call MUST keep returning the EXACT pre-fix counts-only shape (D7 / CCR-7 response-shape
// guard); any of the four params supplied switches to a bounded, filtered per-entry page
// (boundList(), item-directory.ts:60-134 recipe).
//
// Leg (b): merge-autorec-entry's duplicate-label branch now surfaces the MATCHED entry's
// id/label/menu/animation summary instead of discarding it.
//
// Leg (c) — update-autorec-entry / remove-autorec-entry — is task 2.2's scope; this file will
// be EXTENDED (not replaced) by that task's unit cases.
//
// Deterministic — no live Foundry. AutomatedAnimations.AutorecManager is mocked directly
// (getAutorecEntries/mergeMenus), matching the real API surface confirmed by the second
// research pass (qa.md).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleAutoAnimations } from '../autoanimations.js';

// A stored Autorec entry (expandToV5 shape, dossier §3a) — only the fields the projection /
// duplicate-error path actually touch are populated; the rest of the v5 tree is irrelevant here.
function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'entry-id-0001',
    label: 'Hand Weapon',
    version: 5,
    isEnabled: true,
    isCustomized: true,
    fromAmmo: false,
    menu: 'melee',
    primary: {
      video: { dbSection: 'melee', menuType: 'weapon', animation: 'sword', variant: '01', color: 'white' },
    },
    ...overrides,
  };
}

// Fresh copy per call — merge-autorec-entry's mock mutates the returned object (mirroring the
// real add-only mergeMenus), and tests must not leak entries into each other.
function makeFakeAutorecEntries() {
  return {
    version: 5,
    melee: [
      makeEntry({ id: 'melee-0001', label: 'Hand Weapon' }),
      makeEntry({ id: 'melee-0002', label: 'Great Weapon' }),
    ],
    range: [
      makeEntry({ id: 'range-0001', label: 'Bow', menu: 'range' }),
    ],
    ontoken: [],
    templatefx: [],
    aura: [],
    preset: [],
    aefx: [],
  };
}

const AUTOREC_CATEGORIES_TEST = ['melee', 'range', 'ontoken', 'templatefx', 'aura', 'preset', 'aefx'] as const;

// BUG-812(c): task 2.2's update/remove handlers read/write DIRECTLY via game.settings.get/.set
// against "aaAutorec-<category>" (qa.md second research pass LAW — bypasses AutorecManager
// entirely). settingsStore is seeded from the same `entries` object AutorecManager's mock reads,
// so get-autorec / merge-autorec-entry (AutorecManager-backed) and update/remove
// (game.settings-backed) tests observe a consistent world. settingsSet is returned so tests can
// assert its call COUNT (2026-08-23 defanged-stub lesson — never just check the return value).
function mockGlobalsActive(entries: any = makeFakeAutorecEntries()) {
  const settingsStore: Record<string, any> = { aaAutorec: { version: entries.version } };
  for (const cat of AUTOREC_CATEGORIES_TEST) settingsStore[`aaAutorec-${cat}`] = entries[cat];

  const settingsGet = vi.fn((_namespace: string, key: string) => settingsStore[key]);
  const settingsSet = vi.fn(async (_namespace: string, key: string, value: any) => {
    settingsStore[key] = value;
  });

  (globalThis as any).game = {
    user: { isGM: true },
    modules: {
      get: (id: string) =>
        ['autoanimations', 'sequencer', 'socketlib'].includes(id) ? { active: true } : null,
    },
    settings: { get: settingsGet, set: settingsSet },
  };
  (globalThis as any).AutomatedAnimations = {
    AutorecManager: {
      getAutorecEntries: vi.fn(() => entries),
      // Real mergeMenus is add-only (qa.md second research pass) — mimic that here so the
      // handler's own DP-16 post-write re-read (getAutorecEntries again) sees the addition.
      mergeMenus: vi.fn(async (menu: Record<string, any[]>) => {
        for (const [cat, added] of Object.entries(menu)) {
          if (cat === 'version' || !Array.isArray(added)) continue;
          entries[cat] = [...(entries[cat] ?? []), ...added];
        }
      }),
    },
  };
  (globalThis as any).foundry = { utils: { randomID: () => 'newid00000000001' } };

  return { settingsGet, settingsSet, settingsStore, entries };
}

beforeEach(() => {
  mockGlobalsActive();
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).AutomatedAnimations;
  delete (globalThis as any).foundry;
});

describe('get-autorec — BUG-812(a) filtered/paginated read', () => {
  it('parameterless call returns the EXACT pre-fix counts-only shape (D7 / CCR-7 guard)', async () => {
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec' });
    expect(result.success).toBe(true);
    // Exact key set — {counts, version} and nothing else (no entries/totalAvailable/etc leaking in).
    expect(Object.keys(result.data).sort()).toEqual(['counts', 'version']);
    expect(result.data).toEqual({
      counts: { melee: 2, range: 1, ontoken: 0, templatefx: 0, aura: 0, preset: 0, aefx: 0 },
      version: 5,
    });
  });

  it('a filtered call (category supplied) returns a per-entry page with id present', async () => {
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec', category: 'melee' });
    expect(result.success).toBe(true);
    expect(result.data.entries).toHaveLength(2);
    for (const e of result.data.entries) {
      expect(typeof e.id).toBe('string');
      expect(e.id).not.toBe('');
    }
    expect(result.data.entries.map((e: any) => e.id).sort()).toEqual(['melee-0001', 'melee-0002']);
    expect(result.data.totalAvailable).toBe(2);
    expect(result.data.truncated).toBe(false);
    expect(result.data.offset).toBe(0);
  });

  it('a filtered call (label substring only, no category) scopes across ALL categories', async () => {
    // "weapon" matches neither label directly — use a label substring that is genuinely present.
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec', label: 'weapon' });
    expect(result.success).toBe(true);
    // normalizeLabel("Hand Weapon") = "handweapon", normalizeLabel("Great Weapon") = "greatweapon" —
    // both contain "weapon"; "Bow" does not.
    expect(result.data.entries.map((e: any) => e.label).sort()).toEqual(['Great Weapon', 'Hand Weapon']);
  });

  it('limit/offset page and set truncated honestly', async () => {
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec', category: 'melee', limit: 1 });
    expect(result.success).toBe(true);
    expect(result.data.entries).toHaveLength(1);
    expect(result.data.limit).toBe(1);
    expect(result.data.totalAvailable).toBe(2);
    expect(result.data.truncated).toBe(true);
  });

  it('each projected entry carries the compact field set (id/label/isEnabled/isCustomized/fromAmmo/menu/version/animation)', async () => {
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec', category: 'melee', limit: 1 });
    const [entry] = result.data.entries;
    expect(entry).toEqual({
      id: 'melee-0001',
      label: 'Hand Weapon',
      isEnabled: true,
      isCustomized: true,
      fromAmmo: false,
      menu: 'melee',
      version: 5,
      animation: 'melee/weapon/sword',
    });
  });
});

describe('merge-autorec-entry — BUG-812(b) duplicate error surfaces the matched entry', () => {
  it('duplicate-label error contains the matched entry id + label (+ menu + animation summary)', async () => {
    const result = await dispatchModuleAutoAnimations({
      action: 'merge-autorec-entry',
      category: 'melee',
      label: 'Hand Weapon', // duplicates fakeAutorecEntries.melee[0]
      animation: { primary: { dbSection: 'melee', menuType: 'weapon', animation: 'axe' } },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_AUTOREC_DUPLICATE_LABEL');
    expect(result.error).toContain('melee-0001'); // matched entry's id
    expect(result.error).toContain('Hand Weapon'); // matched entry's label
    expect(result.error).toContain('menu="melee"');
    expect(result.error).toContain('melee/weapon/sword'); // matched entry's animation summary
    // Recovery pointer.
    expect(result.error).toContain('get-autorec');
    // mergeMenus must NOT have been called — the duplicate branch is a pure read + refusal.
    expect((globalThis as any).AutomatedAnimations.AutorecManager.mergeMenus).not.toHaveBeenCalled();
  });

  it('a non-duplicate label still merges successfully (duplicate-branch fix does not break the happy path)', async () => {
    const result = await dispatchModuleAutoAnimations({
      action: 'merge-autorec-entry',
      category: 'melee',
      label: 'Brand New Weapon',
      animation: { primary: { dbSection: 'melee', menuType: 'weapon', animation: 'axe' } },
    });
    expect(result.success).toBe(true);
    expect((globalThis as any).AutomatedAnimations.AutorecManager.mergeMenus).toHaveBeenCalledTimes(1);
  });
});

// Task 2.2 — BUG-812(c): update-autorec-entry / remove-autorec-entry, confirm-gated + rollback.
// Mechanism under test is DIRECTLY game.settings.get/.set("autoanimations", "aaAutorec-<category>")
// (qa.md second research pass LAW) — NOT AutorecManager/mergeMenus.

describe('remove-autorec-entry — BUG-812(c) confirm-gated removal with rollback', () => {
  it('(i) unconfirmed remove refuses, names the blast radius, and writes ZERO times', async () => {
    const { settingsSet } = mockGlobalsActive();
    const result = await dispatchModuleAutoAnimations({
      action: 'remove-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      // confirm omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(result.error).toContain('remove-autorec-entry');
    // Blast radius names the matched entry, not just the bare id.
    expect(result.error).toContain('Hand Weapon');
    expect(result.error).toContain('melee-0001');
    expect(result.error).toContain('melee/weapon/sword');
    expect(settingsSet).not.toHaveBeenCalled();
  });

  it('(ii) confirmed remove deletes the entry from the written array AND the verify-re-read passes', async () => {
    const { settingsSet, settingsStore } = mockGlobalsActive();
    const result = await dispatchModuleAutoAnimations({
      action: 'remove-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      confirm: true,
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ category: 'melee', id: 'melee-0001', removed: true });
    // Written array (settingsStore, mirroring a real game.settings.set landing) no longer has it.
    expect(settingsStore['aaAutorec-melee'].some((e: any) => e.id === 'melee-0001')).toBe(false);
    // Sibling entry survives untouched.
    expect(settingsStore['aaAutorec-melee'].some((e: any) => e.id === 'melee-0002')).toBe(true);
    expect(settingsSet).toHaveBeenCalledTimes(1);
  });

  it('(iii) verify-fail path restores the pre-write snapshot and returns a typed *_NOT_PERSISTED token', async () => {
    const { settingsSet } = mockGlobalsActive();
    const preWriteMelee = (globalThis as any).game.settings.get('autoanimations', 'aaAutorec-melee');
    // Simulate the write not actually landing in the world (settingsStore untouched) — the
    // handler's fresh DP-16 re-read must still see the target id present.
    settingsSet.mockImplementation(async () => {
      /* no-op: simulates a write that silently does not persist */
    });

    const result = await dispatchModuleAutoAnimations({
      action: 'remove-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      confirm: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_AUTOREC_REMOVE_NOT_PERSISTED');
    expect(result.error).toContain('rolledBack: true');
    // set() called twice: the (no-op'd) removal write, then the (no-op'd) restore-with-snapshot.
    expect(settingsSet).toHaveBeenCalledTimes(2);
    const restoreCallArgs = settingsSet.mock.calls[1];
    expect(restoreCallArgs[0]).toBe('autoanimations');
    expect(restoreCallArgs[1]).toBe('aaAutorec-melee');
    expect(restoreCallArgs[2]).toEqual(preWriteMelee); // exact pre-write snapshot array
  });

  it('(v) unknown id refuses AA_AUTOREC_ENTRY_NOT_FOUND with zero writes', async () => {
    const { settingsSet } = mockGlobalsActive();
    const result = await dispatchModuleAutoAnimations({
      action: 'remove-autorec-entry',
      category: 'melee',
      id: 'does-not-exist',
      confirm: true,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_AUTOREC_ENTRY_NOT_FOUND');
    expect(result.error).toContain('melee');
    expect(result.error).toContain('get-autorec');
    expect(settingsSet).not.toHaveBeenCalled();
  });
});

describe('update-autorec-entry — BUG-812(c) confirm-gated patch with rollback', () => {
  it('unconfirmed update refuses, names the blast radius, and writes ZERO times', async () => {
    const { settingsSet } = mockGlobalsActive();
    const result = await dispatchModuleAutoAnimations({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      label: 'Hand Weapon (Renamed)',
      // confirm omitted
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(result.error).toContain('update-autorec-entry');
    expect(result.error).toContain('Hand Weapon');
    expect(settingsSet).not.toHaveBeenCalled();
  });

  it('(iv) confirmed update patches ONLY the targeted entry — sibling entries stay byte-equal', async () => {
    const { settingsSet, settingsStore, entries } = mockGlobalsActive();
    const siblingBefore = entries.melee[1]; // melee-0002, untouched
    const result = await dispatchModuleAutoAnimations({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      label: 'Hand Weapon (Renamed)',
      confirm: true,
    });
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ category: 'melee', id: 'melee-0001', label: 'Hand Weapon (Renamed)', updated: true });

    const written: any[] = settingsStore['aaAutorec-melee'];
    const targetAfter = written.find((e) => e.id === 'melee-0001');
    expect(targetAfter.label).toBe('Hand Weapon (Renamed)');
    // Every other field on the targeted entry is untouched (label-only patch).
    expect(targetAfter.menu).toBe('melee');
    expect(targetAfter.primary.video.animation).toBe('sword');

    const siblingAfter = written.find((e) => e.id === 'melee-0002');
    expect(siblingAfter).toBe(siblingBefore); // same object reference — byte-equal, untouched
    expect(settingsSet).toHaveBeenCalledTimes(1);
  });

  it('a supplied animation fully replaces the entry\'s animation payload while preserving id', async () => {
    const { settingsStore } = mockGlobalsActive();
    const result = await dispatchModuleAutoAnimations({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      animation: { primary: { dbSection: 'melee', menuType: 'weapon', animation: 'axe' } },
      confirm: true,
    });
    expect(result.success).toBe(true);
    const written: any[] = settingsStore['aaAutorec-melee'];
    const targetAfter = written.find((e) => e.id === 'melee-0001');
    expect(targetAfter.primary.video.animation).toBe('axe');
    expect(targetAfter.id).toBe('melee-0001'); // id preserved despite full expandToV5 rebuild
    expect(targetAfter.label).toBe('Hand Weapon'); // label unchanged (not supplied)
  });

  it('verify-fail path restores the pre-write snapshot and returns a typed *_NOT_PERSISTED token', async () => {
    const { settingsSet } = mockGlobalsActive();
    const preWriteMelee = (globalThis as any).game.settings.get('autoanimations', 'aaAutorec-melee');
    settingsSet.mockImplementation(async () => {
      /* no-op: simulates a write that silently does not persist */
    });

    const result = await dispatchModuleAutoAnimations({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      label: 'Hand Weapon (Renamed)',
      confirm: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_AUTOREC_UPDATE_NOT_PERSISTED');
    expect(result.error).toContain('rolledBack: true');
    expect(settingsSet).toHaveBeenCalledTimes(2);
    const restoreCallArgs = settingsSet.mock.calls[1];
    expect(restoreCallArgs[1]).toBe('aaAutorec-melee');
    expect(restoreCallArgs[2]).toEqual(preWriteMelee);
  });

  it('(v) unknown id refuses AA_AUTOREC_ENTRY_NOT_FOUND with zero writes', async () => {
    const { settingsSet } = mockGlobalsActive();
    const result = await dispatchModuleAutoAnimations({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'does-not-exist',
      label: 'X',
      confirm: true,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_AUTOREC_ENTRY_NOT_FOUND');
    expect(settingsSet).not.toHaveBeenCalled();
  });

  it('rejects an empty patch (neither label nor animation supplied) — handler-side check, not a schema .refine()', async () => {
    const result = await dispatchModuleAutoAnimations({
      action: 'update-autorec-entry',
      category: 'melee',
      id: 'melee-0001',
      confirm: true,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_AUTOREC_UPDATE_EMPTY');
  });
});
