// Phase 1 module_integration_v1 — Unit test for requireModuleActive guard.
//
// Deterministic: mocks globalThis.game.modules — no live Foundry, no world-churn.
// Zero risk of disabling the heavily-used monks-active-tiles module.
//
// Four branches per design spec (P1.1.7):
//   - absent id               → MODULE_NOT_ACTIVE
//   - installed-but-inactive  → MODULE_NOT_ACTIVE
//   - active                  → null (proceed)
//   - active primary + missing dep → MODULE_DEPENDENCY_NOT_ACTIVE
//
// Mirrors system-guard.test.ts vitest pattern.

import { describe, it, expect, beforeEach } from 'vitest';
import { requireModuleActive } from '../handlers/modules/_shared/require-module-active.js';

// ── Mock game.modules ────────────────────────────────────────────────────────

function makeModulesMap(entries: Record<string, { active: boolean }>) {
  return {
    get: (id: string) => {
      const e = entries[id];
      if (!e) return undefined;
      return { active: e.active };
    },
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('requireModuleActive', () => {
  beforeEach(() => {
    // Reset game stub between tests.
    (globalThis as any).game = undefined;
  });

  it('returns MODULE_NOT_ACTIVE for an absent module id', () => {
    (globalThis as any).game = {
      modules: makeModulesMap({
        'some-other-module': { active: true },
      }),
    };
    const result = requireModuleActive('monks-active-tiles');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/^MODULE_NOT_ACTIVE:/);
    expect(result!.error).toContain('monks-active-tiles');
  });

  it('returns MODULE_NOT_ACTIVE for an installed-but-inactive module', () => {
    (globalThis as any).game = {
      modules: makeModulesMap({
        'monks-active-tiles': { active: false },
      }),
    };
    const result = requireModuleActive('monks-active-tiles');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/^MODULE_NOT_ACTIVE:/);
    expect(result!.error).toContain('monks-active-tiles');
  });

  it('returns null when module is active (proceed signal)', () => {
    (globalThis as any).game = {
      modules: makeModulesMap({
        'monks-active-tiles': { active: true },
      }),
    };
    const result = requireModuleActive('monks-active-tiles');
    expect(result).toBeNull();
  });

  it('returns MODULE_DEPENDENCY_NOT_ACTIVE when primary is active but a required dep is absent', () => {
    (globalThis as any).game = {
      modules: makeModulesMap({
        'monks-active-tiles': { active: true },
        // 'tagger' is absent
      }),
    };
    const result = requireModuleActive('monks-active-tiles', ['tagger']);
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/^MODULE_DEPENDENCY_NOT_ACTIVE:/);
    expect(result!.error).toContain('tagger');
  });

  it('returns null when primary + all required deps are active', () => {
    (globalThis as any).game = {
      modules: makeModulesMap({
        'monks-active-tiles': { active: true },
        'tagger': { active: true },
      }),
    };
    const result = requireModuleActive('monks-active-tiles', ['tagger']);
    expect(result).toBeNull();
  });

  it('returns MODULE_NOT_ACTIVE when game is undefined (pre-init)', () => {
    (globalThis as any).game = undefined;
    const result = requireModuleActive('monks-active-tiles');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(false);
    expect(result!.error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });
});
