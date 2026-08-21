// BUG-799 — set-item-animation's DP-16 post-write verify previously checked ONLY
// version===5 and isCustomized===true (2 fields) — never the requested menu, video, sound, macro,
// or slot contents. A write whose CONTENT silently drifted (e.g. Foundry's own merge semantics
// dropping a field, or a corrupted persist) would still report success. This proves the verifier
// now deep-compares the executable fields (primary/secondary/source/target/soundOnly/macro/
// meleeSwitch — 7 fields, more than the original 2) and fails loud on drift.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleAutoAnimations } from '../autoanimations.js';

function mockGlobalsActive(item: any) {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: { get: (id: string) => (['autoanimations', 'sequencer', 'socketlib'].includes(id) ? { active: true } : null) },
  };
  (globalThis as any).fromUuid = vi.fn(async () => item);
  (globalThis as any).foundry = { utils: { randomID: () => 'testid0000000001' } };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).foundry;
});

const validAnimation = {
  primary: { dbSection: 'melee', menuType: 'weapon', animation: 'sword', variant: '01', color: 'white' },
};

describe('set-item-animation — BUG-799 deep-compare verify', () => {
  it('passes when the persisted content exactly matches what was requested', async () => {
    const item: any = {
      name: 'Sword',
      flags: {},
      update: vi.fn(async (patch: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(patch)) {
          if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
          else if (k === 'flags.autoanimations') item.flags.autoanimations = v;
        }
      }),
    };
    mockGlobalsActive(item);

    const result: any = await dispatchModuleAutoAnimations({
      action: 'set-item-animation', uuid: 'Item.x', animation: validAnimation,
    });
    expect(result.success).toBe(true);
  });

  it('fails loud when the persisted primary video content drifts from what was requested (version+isCustomized alone would have passed)', async () => {
    const item: any = {
      name: 'Sword',
      flags: {},
      update: vi.fn(async (patch: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(patch)) {
          if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
          else if (k === 'flags.autoanimations') {
            // Simulate a corrupted persist: version/isCustomized land correctly, but the
            // animation KEY silently changed (e.g. a merge collision) — the old 2-field
            // verify would have missed this entirely.
            const corrupted = JSON.parse(JSON.stringify(v));
            corrupted.primary.video.animation = 'WRONG_ANIMATION_KEY';
            item.flags.autoanimations = corrupted;
          }
        }
      }),
    };
    mockGlobalsActive(item);

    const result: any = await dispatchModuleAutoAnimations({
      action: 'set-item-animation', uuid: 'Item.x', animation: validAnimation,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_FLAG_CONTENT_NOT_PERSISTED');
    expect(result.error).toContain('primary');
  });

  it('the drift check covers more than the original 2 fields (version/isCustomized) — names primary/secondary/source/target/soundOnly/macro/meleeSwitch', async () => {
    const item: any = {
      name: 'Sword',
      flags: {},
      update: vi.fn(async (patch: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(patch)) {
          if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
          else if (k === 'flags.autoanimations') {
            const corrupted = JSON.parse(JSON.stringify(v));
            // Corrupt the MACRO field specifically — a field the old verify never looked at.
            corrupted.macro.name = 'HijackedMacro';
            item.flags.autoanimations = corrupted;
          }
        }
      }),
    };
    mockGlobalsActive(item);

    const result: any = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Item.x',
      animation: { ...validAnimation, macro: { enable: true, name: 'RealMacro' } },
      confirmedMacro: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_FLAG_CONTENT_NOT_PERSISTED');
    expect(result.error).toContain('macro');
  });
});
