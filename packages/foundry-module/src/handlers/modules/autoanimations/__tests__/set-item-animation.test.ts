// Module Integration v1 Phase 8 — vitest: set/clear-item-animation invariants.
//
// Why these matter (dossier §3a):
//   - isCustomized MUST be forced true — false silently falls back to Autorec (the
//     #1 silent-failure mode). version MUST be 5.
//   - The write is TWO-STEP (clear then set) — a stale v4 key must not bleed through.
//   - macro.enable:true without confirmedMacro must be REJECTED (arbitrary code on
//     every roll, SUPPORTED_WITH_CONFIRMATION §5).
//   - DP-16: the handler re-reads the flag and fails loud if the write didn't land.
//
// Deterministic — no live Foundry. The module guard is mocked active. The mock Item's
// update() applies the flag patch so the DP-16 re-read sees the real written object
// (mocks model the real API per the Phase 5 lesson).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleAutoAnimations } from '../autoanimations.js';

// A mock Item whose update() honours the two-step flag write + delete (`-=` key).
function makeItem(name = 'Sword') {
  const item: any = {
    name,
    flags: {} as Record<string, any>,
    update: vi.fn(async (patch: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'flags.-=autoanimations') {
          delete item.flags.autoanimations;
        } else if (k === 'flags.autoanimations') {
          item.flags.autoanimations = v;
        }
      }
      return item;
    }),
  };
  return item;
}

function mockGlobalsActive(item: any) {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: {
      get: (id: string) =>
        ['autoanimations', 'sequencer', 'socketlib'].includes(id) ? { active: true } : null,
    },
  };
  (globalThis as any).fromUuid = vi.fn(async () => item);
  (globalThis as any).foundry = { utils: { randomID: () => 'testid0000000001' } };
}

const validAnimation = {
  primary: { dbSection: 'melee', menuType: 'weapon', animation: 'sword', variant: '01', color: 'white' },
};

let item: any;

beforeEach(() => {
  item = makeItem();
  mockGlobalsActive(item);
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).foundry;
});

describe('set-item-animation — v5 write invariants', () => {
  it('writes version:5 + isCustomized:true via a two-step clear-then-set', async () => {
    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });
    expect(result.success).toBe(true);
    // Two writes: clear, then set.
    expect(item.update).toHaveBeenCalledTimes(2);
    expect(item.update.mock.calls[0][0]).toHaveProperty('flags.-=autoanimations');
    expect(item.flags.autoanimations.version).toBe(5);
    expect(item.flags.autoanimations.isCustomized).toBe(true);
    expect(item.flags.autoanimations.primary.video.animation).toBe('sword');
  });

  it('FORCES isCustomized:true even when the payload tries to disable it', async () => {
    // The payload schema does not accept isCustomized, but prove the expansion forces it.
    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: { ...validAnimation, isEnabled: false },
    });
    expect(result.success).toBe(true);
    expect(item.flags.autoanimations.isCustomized).toBe(true);
    expect(item.flags.autoanimations.isEnabled).toBe(false); // isEnabled IS caller-controllable
  });

  it('rejects macro.enable:true without confirmedMacro (AA_MACRO_NOT_CONFIRMED)', async () => {
    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: { ...validAnimation, macro: { enable: true, name: 'EvilMacro' } },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_MACRO_NOT_CONFIRMED');
    expect(item.update).not.toHaveBeenCalled();
  });

  it('allows macro.enable:true WITH confirmedMacro:true', async () => {
    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: { ...validAnimation, macro: { enable: true, name: 'GoodMacro' } },
      confirmedMacro: true,
    });
    expect(result.success).toBe(true);
    expect(item.flags.autoanimations.macro.enable).toBe(true);
  });

  it('fails loud (AA_FLAG_VERIFY_FAILED) when the write does not land', async () => {
    // Simulate a silent no-op update (Document.update returns undefined for no-ops too).
    item.update = vi.fn(async () => undefined); // does NOT mutate item.flags
    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_FLAG_VERIFY_FAILED');
  });
});

describe('clear-item-animation', () => {
  it('clears flags and verifies absence', async () => {
    item.flags.autoanimations = { version: 5, isCustomized: true };
    const result = await dispatchModuleAutoAnimations({ action: 'clear-item-animation', uuid: 'Actor.x.Item.y' });
    expect(result.success).toBe(true);
    expect(item.flags.autoanimations).toBeUndefined();
  });
});

describe('module guards', () => {
  it('returns MODULE_NOT_ACTIVE when autoanimations is inactive', async () => {
    (globalThis as any).game.modules.get = (id: string) => (id === 'autoanimations' ? null : { active: true });
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('MODULE_NOT_ACTIVE');
  });

  it('returns MODULE_DEPENDENCY_NOT_ACTIVE when sequencer dep is inactive', async () => {
    (globalThis as any).game.modules.get = (id: string) =>
      id === 'autoanimations' ? { active: true } : id === 'sequencer' ? { active: false } : { active: true };
    const result = await dispatchModuleAutoAnimations({ action: 'get-autorec' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('MODULE_DEPENDENCY_NOT_ACTIVE');
  });
});
