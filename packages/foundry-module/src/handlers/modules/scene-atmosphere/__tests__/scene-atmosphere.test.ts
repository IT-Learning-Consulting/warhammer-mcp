// Module Integration v1 Phase 6 — Unit tests for scene-atmosphere dispatcher + guards.
//
// Deterministic: mocks globalThis.game.modules — no live Foundry, no world-churn.
//
// Coverage:
//   1. requireCompanionActive — null when active, COMPANION_NOT_ACTIVE when absent/inactive.
//   2. get-bundle-status — all 6 members active → all active:true;
//                          some inactive → correct per-member flags (unguarded action).
//   3. Guard routing — fxmaster inactive → MODULE_NOT_ACTIVE;
//                      wound-* action with companion inactive → COMPANION_NOT_ACTIVE;
//                      play-transition with scene-transitions active but socketlib inactive
//                        → MODULE_NOT_ACTIVE (socketlib).
//   4. ACTION_MEMBER_MAP completeness — every action except get-bundle-status has an entry
//      in ACTION_MEMBER_MAP, so no action can silently pass through unguarded.
//
// Phase-5 lesson: mocks model the real game.modules.get(id).active shape (instance-shaped),
// NOT a fictional shape. Tests that mock the wrong shape are green against a fiction.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { requireCompanionActive } from '../../_shared/require-module-active.js';
import {
  dispatchModuleSceneAtmosphere,
  ACTION_MEMBER_MAP,
} from '../scene-atmosphere.js';
import { BUNDLE_MEMBERS } from '../schemas.js';

// ── Mock helpers ──────────────────────────────────────────────────────────────

/**
 * Build a game.modules mock where the given IDs are active and all others return undefined.
 * The returned object shape mirrors the real Foundry game.modules instance:
 *   game.modules.get(id) → { active, title, version } | undefined
 */
function makeModulesMap(
  activeIds: string[],
  extras: Record<string, { active: boolean; title?: string; version?: string }> = {},
) {
  return {
    get: (id: string) => {
      if (id in extras) {
        const e = extras[id];
        return { active: e.active, title: e.title ?? null, version: e.version ?? null };
      }
      if (activeIds.includes(id)) {
        return { active: true, title: `Module ${id}`, version: '1.0.0' };
      }
      return undefined;
    },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
});

afterEach(() => {
  delete (globalThis as any).game;
});

// ── 1. requireCompanionActive ─────────────────────────────────────────────────

describe('requireCompanionActive', () => {
  it('returns null when companion is active (proceed signal)', () => {
    (globalThis as any).game = {
      modules: makeModulesMap(['tokenmagic-automatic-wounds']),
    };
    const result = requireCompanionActive('tokenmagic-automatic-wounds');
    expect(result).toBeNull();
  });

  it('returns COMPANION_NOT_ACTIVE when companion module is absent', () => {
    (globalThis as any).game = {
      modules: makeModulesMap([]), // companion not present
    };
    const result = requireCompanionActive('tokenmagic-automatic-wounds');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/COMPANION_NOT_ACTIVE/);
    expect(result!.error).toContain('tokenmagic-automatic-wounds');
  });

  it('returns COMPANION_NOT_ACTIVE when companion is installed but inactive', () => {
    (globalThis as any).game = {
      modules: makeModulesMap([], {
        'tokenmagic-automatic-wounds': { active: false },
      }),
    };
    const result = requireCompanionActive('tokenmagic-automatic-wounds');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/COMPANION_NOT_ACTIVE/);
  });

  it('returns COMPANION_NOT_ACTIVE when game is undefined (pre-init)', () => {
    (globalThis as any).game = undefined;
    const result = requireCompanionActive('tokenmagic-automatic-wounds');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/COMPANION_NOT_ACTIVE/);
  });
});

// ── 2. get-bundle-status ──────────────────────────────────────────────────────

describe('get-bundle-status', () => {
  it('reports all 6 members active when all are active', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap([...BUNDLE_MEMBERS]),
    };
    const result = await dispatchModuleSceneAtmosphere({ action: 'get-bundle-status' });
    expect(result.success).toBe(true);
    const members: Array<{ id: string; active: boolean; title: string | null; version: string | null }> =
      result.data.members;
    expect(members).toHaveLength(BUNDLE_MEMBERS.length);
    for (const m of members) {
      expect(m.active).toBe(true);
      expect(m.title).not.toBeNull();
      expect(m.version).not.toBeNull();
    }
  });

  it('reports correct per-member active flags when some are inactive', async () => {
    // Only fxmaster and tokenmagic active; rest absent or inactive.
    (globalThis as any).game = {
      modules: makeModulesMap(['fxmaster', 'tokenmagic'], {
        'scenery':             { active: false },
        'scene-transitions':   { active: false },
        // multiface-tiles and dynamic-soundscapes: absent (returns undefined)
      }),
    };
    const result = await dispatchModuleSceneAtmosphere({ action: 'get-bundle-status' });
    expect(result.success).toBe(true);
    const members: Array<{ id: string; active: boolean }> = result.data.members;
    const byId = Object.fromEntries(members.map((m) => [m.id, m.active]));
    expect(byId['fxmaster']).toBe(true);
    expect(byId['tokenmagic']).toBe(true);
    expect(byId['scenery']).toBe(false);
    expect(byId['scene-transitions']).toBe(false);
    expect(byId['multiface-tiles']).toBe(false);
    expect(byId['dynamic-soundscapes']).toBe(false);
  });

  it('succeeds even when all bundle members are inactive (unguarded action)', async () => {
    // Why: get-bundle-status must be callable to diagnose which modules are missing.
    // It is explicitly excluded from the ACTION_MEMBER_MAP guard block.
    (globalThis as any).game = {
      modules: makeModulesMap([]),
    };
    const result = await dispatchModuleSceneAtmosphere({ action: 'get-bundle-status' });
    expect(result.success).toBe(true);
    const members: Array<{ id: string; active: boolean }> = result.data.members;
    for (const m of members) {
      expect(m.active).toBe(false);
    }
  });
});

// ── 3. Guard routing ──────────────────────────────────────────────────────────

describe('Guard routing', () => {
  // 3a. fxmaster action when fxmaster is inactive → MODULE_NOT_ACTIVE
  it('returns MODULE_NOT_ACTIVE for a fxmaster action when fxmaster is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap([]), // no active modules
    };
    const result = await dispatchModuleSceneAtmosphere({ action: 'list-presets' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    expect(result.error).toContain('fxmaster');
  });

  // 3b. wound-* action: tokenmagic primary active, companion inactive → COMPANION_NOT_ACTIVE
  it('returns COMPANION_NOT_ACTIVE for a wound action when companion is inactive', async () => {
    // tokenmagic active, but tokenmagic-automatic-wounds absent.
    (globalThis as any).game = {
      modules: makeModulesMap(['tokenmagic']),
    };
    // tokenmagic-wound-create requires tokenId (string) + damageFraction (number 0–1)
    const result = await dispatchModuleSceneAtmosphere({
      action: 'tokenmagic-wound-create',
      tokenId: 'tok123',
      damageFraction: 0.5,
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/COMPANION_NOT_ACTIVE/);
    expect(result.error).toContain('tokenmagic-automatic-wounds');
  });

  // 3c. wound-* action: tokenmagic primary inactive → MODULE_NOT_ACTIVE (primary guard first)
  it('returns MODULE_NOT_ACTIVE (not COMPANION) for a wound action when tokenmagic itself is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap([]), // neither tokenmagic nor companion active
    };
    // tokenmagic-wound-heal requires tokenId (string) + healingFraction (number 0–1)
    const result = await dispatchModuleSceneAtmosphere({
      action: 'tokenmagic-wound-heal',
      tokenId: 'tok123',
      healingFraction: 0.5,
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    // Must NOT be COMPANION_NOT_ACTIVE — primary guard fires first
    expect(result.error).not.toMatch(/COMPANION_NOT_ACTIVE/);
  });

  // 3d. play-transition: scene-transitions active, socketlib inactive → MODULE_NOT_ACTIVE (socketlib)
  it('returns MODULE_NOT_ACTIVE for play-transition when socketlib is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap(['scene-transitions']), // socketlib absent
    };
    // play-transition requires `options` (all fields optional in transitionOptionsSchema)
    const result = await dispatchModuleSceneAtmosphere({
      action: 'play-transition',
      options: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    // Error must mention socketlib — this is the secondary socketlib guard
    expect(result.error).toContain('socketlib');
  });

  // 3e. play-transition: scene-transitions inactive (primary guard fires before socketlib check)
  it('returns MODULE_NOT_ACTIVE (scene-transitions) for play-transition when scene-transitions is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap(['socketlib']), // socketlib active but scene-transitions not
    };
    const result = await dispatchModuleSceneAtmosphere({
      action: 'play-transition',
      options: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    expect(result.error).toContain('scene-transitions');
  });

  // 3f. A scenery action with scenery inactive → MODULE_NOT_ACTIVE
  it('returns MODULE_NOT_ACTIVE for a scenery action when scenery is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap([]),
    };
    const result = await dispatchModuleSceneAtmosphere({ action: 'list-variations' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    expect(result.error).toContain('scenery');
  });

  // 3g. A multiface-tiles action with multiface-tiles inactive → MODULE_NOT_ACTIVE
  it('returns MODULE_NOT_ACTIVE for a multiface-tiles action when multiface-tiles is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap([]),
    };
    const result = await dispatchModuleSceneAtmosphere({
      action: 'list-tile-faces',
      tileId: 'tile001',
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    expect(result.error).toContain('multiface-tiles');
  });

  // 3h. A dynamic-soundscapes action with dynamic-soundscapes inactive → MODULE_NOT_ACTIVE
  it('returns MODULE_NOT_ACTIVE for a dynamic-soundscapes action when dynamic-soundscapes is inactive', async () => {
    (globalThis as any).game = {
      modules: makeModulesMap([]),
    };
    const result = await dispatchModuleSceneAtmosphere({ action: 'list-soundscapes' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/MODULE_NOT_ACTIVE/);
    expect(result.error).toContain('dynamic-soundscapes');
  });
});

// ── 4. ACTION_MEMBER_MAP completeness ─────────────────────────────────────────
//
// Why this test matters: every action that is NOT in ACTION_MEMBER_MAP will fall
// through the guard block and reach the switch dispatcher unguarded. That means the
// handler fires even when the required Foundry module is absent, which can produce
// JS exceptions in the live world instead of a clean NOT_ACTIVE envelope.
//
// Export status: ACTION_MEMBER_MAP is exported from scene-atmosphere.ts (added in Phase 6
// test authoring). This allows a static map check that is cheaper, faster, and more
// comprehensible than a behavioral round-trip for every action.
//
// The expected actions list is derived from the discriminated union schema's option objects
// minus get-bundle-status (which is intentionally unguarded).

describe('ACTION_MEMBER_MAP completeness', () => {
  // Derive the full set of guarded actions from the schema discriminants.
  // These are the action literals extracted from the fxmaster / tokenmagic / scenery /
  // scene-transitions / multiface-tiles / dynamic-soundscapes schemas.
  const ALL_GUARDED_ACTIONS = [
    // fxmaster (17 actions)
    'play-preset', 'stop-preset', 'toggle-preset', 'switch-preset',
    'list-presets', 'list-active-presets', 'list-valid-presets',
    'play-particles', 'play-filters', 'stop-effects', 'toggle-effects',
    'clear-effects', 'set-enabled', 'set-region-particles', 'set-region-filters',
    'suppress-scene-particles', 'suppress-scene-filters',
    // tokenmagic (11 actions)
    'tokenmagic-apply', 'tokenmagic-upsert', 'tokenmagic-remove',
    'tokenmagic-query', 'tokenmagic-preset',
    'tokenmagic-wound-create', 'tokenmagic-wound-heal', 'tokenmagic-wound-remove',
    'tokenmagic-wound-reapply', 'wound-toggle-disable', 'wound-set-blood-color',
    // scenery (9 actions)
    'list-variations', 'get-active-variation', 'set-active-variation',
    'add-variation', 'delete-variation', 'set-variation-backgrounds',
    'reset-variation-scene-data', 'check-scenery-module-active', 'read-scenery-settings',
    // scene-transitions (5 actions)
    'play-transition', 'end-transition', 'set-scene-transition',
    'get-scene-transition', 'delete-scene-transition',
    // multiface-tiles (9 actions)
    'switch-tile-face', 'list-tile-faces', 'get-tile-original-face',
    'get-tile-active-face', 'reset-to-original-face',
    'add-tile-face', 'remove-tile-face', 'cycle-tile-face', 'clear-tile-faces',
    // dynamic-soundscapes (15 actions)
    'set-soundscape', 'stop-soundscape', 'set-mood', 'get-mood',
    'set-layer-enabled', 'set-layer-volume', 'list-soundscapes', 'list-blocks',
    'get-selected', 'set-selected', 'create-soundscape', 'delete-soundscape',
    'add-sound', 'remove-sound', 'update-blocks',
  ] as const;

  it('ACTION_MEMBER_MAP contains an entry for every non-bundle-status action', () => {
    // Why: any action absent from the map silently bypasses the module guard.
    const missingFromMap = ALL_GUARDED_ACTIONS.filter(
      (action) => !(action in ACTION_MEMBER_MAP),
    );
    expect(missingFromMap).toEqual([]);
  });

  it('ACTION_MEMBER_MAP maps every fxmaster action to "fxmaster"', () => {
    const fxmasterActions = [
      'play-preset', 'stop-preset', 'toggle-preset', 'switch-preset',
      'list-presets', 'list-active-presets', 'list-valid-presets',
      'play-particles', 'play-filters', 'stop-effects', 'toggle-effects',
      'clear-effects', 'set-enabled', 'set-region-particles', 'set-region-filters',
      'suppress-scene-particles', 'suppress-scene-filters',
    ] as const;
    for (const action of fxmasterActions) {
      expect(ACTION_MEMBER_MAP[action]).toBe('fxmaster');
    }
  });

  it('ACTION_MEMBER_MAP maps all tokenmagic actions (including wound-*) to "tokenmagic"', () => {
    const tokenmagicActions = [
      'tokenmagic-apply', 'tokenmagic-upsert', 'tokenmagic-remove',
      'tokenmagic-query', 'tokenmagic-preset',
      'tokenmagic-wound-create', 'tokenmagic-wound-heal', 'tokenmagic-wound-remove',
      'tokenmagic-wound-reapply', 'wound-toggle-disable', 'wound-set-blood-color',
    ] as const;
    for (const action of tokenmagicActions) {
      expect(ACTION_MEMBER_MAP[action]).toBe('tokenmagic');
    }
  });

  it('ACTION_MEMBER_MAP maps scene-transitions actions to "scene-transitions"', () => {
    const stActions = [
      'play-transition', 'end-transition', 'set-scene-transition',
      'get-scene-transition', 'delete-scene-transition',
    ] as const;
    for (const action of stActions) {
      expect(ACTION_MEMBER_MAP[action]).toBe('scene-transitions');
    }
  });

  it('get-bundle-status is NOT in ACTION_MEMBER_MAP (it is intentionally unguarded)', () => {
    // Why: the test above asserts everything in ALL_GUARDED_ACTIONS is in the map;
    // this test asserts the inverse for the one action that must NOT be guarded.
    expect('get-bundle-status' in ACTION_MEMBER_MAP).toBe(false);
  });
});
