// Module Integration v1 Phase 7 — Unit tests for access-control dispatcher + guards.
//
// Deterministic: mocks globalThis.game.modules — no live Foundry, no world-churn.
//
// Coverage:
//   1. get-bundle-status — unguarded; reports per-member + lib-wrapper active state.
//   2. Guard routing — LocknKey action with LocknKey inactive → MODULE_NOT_ACTIVE;
//                      LockView action with LockView inactive → MODULE_NOT_ACTIVE.
//   3. Shared get-lock-state routing — documentId present guards LocknKey;
//                                      documentId absent guards LockView.
//   4. ACTION_MEMBER_MAP completeness — every non-shared, non-status action has an entry.
//   5. Guard returns (never throws) — the inactive case returns {success:false,...}.
//
// Phase-5 lesson: mocks model the real game.modules.get(id).active shape (instance-shaped).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchModuleAccessControl, ACTION_MEMBER_MAP } from '../access-control.js';
import { ACCESS_CONTROL_BUNDLE_MEMBERS as BUNDLE_MEMBERS } from '@foundry-mcp/shared';

function makeModulesMap(activeIds: string[]) {
  return {
    get: (id: string) =>
      activeIds.includes(id)
        ? { active: true, title: `Module ${id}`, version: '1.0.0' }
        : undefined,
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
});

// ── 1. get-bundle-status (unguarded) ────────────────────────────────────────────

describe('get-bundle-status', () => {
  it('reports per-member + lib-wrapper active state without guarding', async () => {
    (globalThis as any).game = { modules: makeModulesMap(['LocknKey', 'lib-wrapper']) };
    const res: any = await dispatchModuleAccessControl({ action: 'get-bundle-status' });
    expect(res.success).toBe(true);
    const byId = Object.fromEntries(res.data.members.map((m: any) => [m.id, m.active]));
    expect(byId.LocknKey).toBe(true);
    expect(byId.LockView).toBe(false);
    expect(res.data.libWrapper.active).toBe(true);
  });

  it('succeeds even when NO members are active (unguarded)', async () => {
    (globalThis as any).game = { modules: makeModulesMap([]) };
    const res: any = await dispatchModuleAccessControl({ action: 'get-bundle-status' });
    expect(res.success).toBe(true);
    expect(res.data.members.every((m: any) => m.active === false)).toBe(true);
  });
});

// ── 2. Guard routing (returns, never throws) ────────────────────────────────────

describe('member guard routing', () => {
  // BUG-424: writes are GM-gated BEFORE the member guard — run these as GM so the
  // member-guard behavior under test is still reachable (gate coverage lives in
  // access-control-gm-gate.test.ts).
  it('LocknKey action → MODULE_NOT_ACTIVE when LocknKey inactive', async () => {
    (globalThis as any).game = { modules: makeModulesMap(['LockView']), user: { isGM: true } };
    const res: any = await dispatchModuleAccessControl({
      action: 'configure-lock', documentId: 'w1', documentType: 'wall', locked: true,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('LocknKey');
  });

  it('LockView action → MODULE_NOT_ACTIVE when LockView inactive', async () => {
    (globalThis as any).game = { modules: makeModulesMap(['LocknKey']), user: { isGM: true } };
    const res: any = await dispatchModuleAccessControl({
      action: 'set-pan-lock', locked: true,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('LockView');
  });
});

// ── 3. Shared get-lock-state routing ────────────────────────────────────────────

describe('get-lock-state dual-member routing', () => {
  it('documentId present → guards LocknKey', async () => {
    (globalThis as any).game = { modules: makeModulesMap(['LockView']) }; // LocknKey inactive
    const res: any = await dispatchModuleAccessControl({
      action: 'get-lock-state', documentId: 'w1', documentType: 'wall',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('LocknKey');
  });

  it('documentId absent → guards LockView', async () => {
    (globalThis as any).game = { modules: makeModulesMap(['LocknKey']) }; // LockView inactive
    const res: any = await dispatchModuleAccessControl({ action: 'get-lock-state' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('LockView');
  });
});

// ── 4. ACTION_MEMBER_MAP completeness ───────────────────────────────────────────

describe('ACTION_MEMBER_MAP', () => {
  it('maps every member action to a valid bundle member id', () => {
    for (const member of Object.values(ACTION_MEMBER_MAP)) {
      expect(BUNDLE_MEMBERS).toContain(member as any);
    }
  });

  it('has exactly 26 mapped actions (get-bundle-status + get-lock-state handled specially)', () => {
    // 9 LnK (excl. get-lock-state) + 17 LockView (excl. get-lock-state) = 26
    expect(Object.keys(ACTION_MEMBER_MAP).length).toBe(26);
  });
});
