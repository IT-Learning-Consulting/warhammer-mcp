// systemic_bug_class_prevention v2, Phase 2, task 2.5 — BUG-797.
//
// handleSetItemAnimation()'s two-step write (clear `flags.-=autoanimations` then set
// `flags.autoanimations`) previously had NO rollback: any of three post-delete failure paths
// (post-write version/isCustomized check, BUG-799 content-drift check, or the write itself
// throwing) left the item with no working animation flag at all — strictly worse than the
// pre-call state. The fix snapshots the pre-write flag value and restores it (via
// `runWriteSteps`' undo cascade for a thrown write, or an explicit restore call for the two
// post-write verify failures) on every one of those three branches.
//
// Same mock shape as the sibling set-item-animation*.test.ts files (mocks model the real
// Document API per the Phase 5 lesson) — `getFlag` added here because `restoreSnapshot()`'s
// own verify (`verifyFlagWrite`) reads it.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { dispatchModuleAutoAnimations } from '../autoanimations.js';

function makeItem(name = 'Sword', initialFlags: Record<string, any> = {}) {
  const item: any = {
    name,
    flags: { ...initialFlags } as Record<string, any>,
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
    getFlag: (scope: string, key: string) => (item.flags as any)?.[scope]?.[key],
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

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).foundry;
});

const validAnimation = {
  primary: { dbSection: 'melee', menuType: 'weapon', animation: 'sword', variant: '01', color: 'white' },
};

const existingFlag = {
  version: 5,
  isEnabled: true,
  isCustomized: true,
  id: 'preexisting0001',
  label: 'Sword',
  fromAmmo: false,
  menu: 'melee',
  primary: { video: { dbSection: 'melee', menuType: 'weapon', animation: 'dagger', variant: '01', color: 'red' }, sound: {}, options: {} },
};

describe('set-item-animation — BUG-797 rollback', () => {
  it('branch 1 (post-write version/isCustomized check fails): restores the prior flag rather than leaving the item flagless', async () => {
    const item = makeItem('Sword', { autoanimations: existingFlag });
    mockGlobalsActive(item);
    // Simulate a no-op update on the SECOND write only — the clear lands, the set does not.
    let call = 0;
    item.update = vi.fn(async (patch: Record<string, unknown>) => {
      call += 1;
      if (call === 1) {
        // clear-old-flag lands normally.
        for (const [k] of Object.entries(patch)) {
          if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
        }
        return item;
      }
      if (call === 2) {
        // set-new-flag silently fails to persist (no mutation) — DP-16 will catch this.
        return undefined;
      }
      // any subsequent call is the rollback restore — apply it for real.
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
        else if (k === 'flags.autoanimations') item.flags.autoanimations = v;
      }
      return item;
    });

    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_FLAG_VERIFY_FAILED');
    // The rollback restored the item's PRIOR flag — never left flagless.
    expect(item.flags.autoanimations).toEqual(existingFlag);
  });

  it('branch 2 (BUG-799 content-drift check fails): restores the prior flag rather than leaving a wrong one in place', async () => {
    const item = makeItem('Sword', { autoanimations: existingFlag });
    mockGlobalsActive(item);
    let call = 0;
    item.update = vi.fn(async (patch: Record<string, unknown>) => {
      call += 1;
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
        else if (k === 'flags.autoanimations') {
          if (call === 2) {
            // set-new-flag persists CORRUPTED content — version/isCustomized land, but the
            // requested animation key silently drifted (the exact BUG-799 class).
            const corrupted = JSON.parse(JSON.stringify(v));
            corrupted.primary.video.animation = 'WRONG_ANIMATION_KEY';
            item.flags.autoanimations = corrupted;
          } else {
            item.flags.autoanimations = v;
          }
        }
      }
      return item;
    });

    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_FLAG_CONTENT_NOT_PERSISTED');
    // Rolled back to the item's PRIOR (uncorrupted) flag.
    expect(item.flags.autoanimations).toEqual(existingFlag);
  });

  it('branch 3 (the write itself throws): the clear step\'s undo restores the prior flag via runWriteSteps\' own cascade', async () => {
    const item = makeItem('Sword', { autoanimations: existingFlag });
    mockGlobalsActive(item);
    let call = 0;
    item.update = vi.fn(async (patch: Record<string, unknown>) => {
      call += 1;
      if (call === 1) {
        for (const [k] of Object.entries(patch)) {
          if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
        }
        return item;
      }
      if (call === 2) {
        // set-new-flag throws (e.g. a transient Foundry write failure).
        throw new Error('SIMULATED_WRITE_FAILURE');
      }
      // undo's restore call.
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
        else if (k === 'flags.autoanimations') item.flags.autoanimations = v;
      }
      return item;
    });

    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_SET_ITEM_ERROR');
    expect(result.error).toContain('SIMULATED_WRITE_FAILURE');
    // Rolled back via runWriteSteps' own undo cascade — never left flagless.
    expect(item.flags.autoanimations).toEqual(existingFlag);
  });

  it('an item with NO prior flag (snapshot null): a post-delete failure rolls back to absence (no-op delete), never leaves a stray flag', async () => {
    const item = makeItem('Sword'); // no prior autoanimations flag
    mockGlobalsActive(item);
    let call = 0;
    item.update = vi.fn(async (patch: Record<string, unknown>) => {
      call += 1;
      if (call === 1) {
        for (const [k] of Object.entries(patch)) {
          if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
        }
        return item;
      }
      if (call === 2) {
        return undefined; // set-new-flag silently no-ops
      }
      for (const [k] of Object.entries(patch)) {
        if (k === 'flags.-=autoanimations') delete item.flags.autoanimations;
      }
      return item;
    });

    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('AA_FLAG_VERIFY_FAILED');
    expect(item.flags.autoanimations).toBeUndefined();
  });

  it('success path is unchanged: two update() calls, no rollback call, flag lands as requested', async () => {
    const item = makeItem('Sword', { autoanimations: existingFlag });
    mockGlobalsActive(item);

    const result = await dispatchModuleAutoAnimations({
      action: 'set-item-animation',
      uuid: 'Actor.x.Item.y',
      animation: validAnimation,
    });

    expect(result.success).toBe(true);
    expect(item.update).toHaveBeenCalledTimes(2);
    expect(item.flags.autoanimations.version).toBe(5);
    expect(item.flags.autoanimations.primary.video.animation).toBe('sword');
  });
});
