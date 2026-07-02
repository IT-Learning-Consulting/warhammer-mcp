// Module Integration v2 Phase 13B — Unit tests for module-puzzle-locks dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user) and globalThis.fromUuid (document resolution) with
// document flags stored in a plain map — no live Foundry. All flag writes are raw awaited (sole writer of
// its own flags) → single-re-read verify, no settle-poll.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive puzzle-locks -> MODULE_NOT_ACTIVE (returns, never throws).
//   2. A write fired by a non-GM -> PUZZLE_LOCKS_ACCESS_DENIED.
//   3. attach-puzzle with an empty required solution field (password-lock, empty password) -> Zod parse OK but
//      handler-level PUZZLE_LOCKS_INVALID_LOCK_TYPE — the module itself does no validation of its own, so a
//      blank solution silently makes the puzzle permanently unsolvable if we didn't catch it here.
//   4. remove-puzzle without confirm -> PUZZLE_LOCKS_CONFIRM_REQUIRED, no unset attempted.
//   5. force-unlock without confirm -> PUZZLE_LOCKS_CONFIRM_REQUIRED.
//   6. Wall two-write: force-unlock on a Wall document sets BOTH ds:CLOSED AND general.unlocked:true —
//      the preUpdateWall forward-sync hook is registration-timing-fragile so both writes must be explicit.
//   7. force-unlock does NOT invoke/write anything resembling unlockMacro execution — only the interactive
//      solve path fires it (documented trap, not a silent gap).
//   8. Full-replace trap is exercised (not "guarded"): re-attaching a lock with a new typeConfig replaces the
//      old typeConfig wholesale — documents the module's own destructive-form-submit behavior.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModulePuzzleLocks } from '../puzzle-locks.js';

const MODULE_ID = 'puzzle-locks';
const FLAG_SCOPE = 'puzzle-locks';

function makeDoc(opts: { documentName?: string; ds?: number; flags?: Record<string, any> } = {}) {
  const flags: Record<string, any> = opts.flags ? JSON.parse(JSON.stringify(opts.flags)) : {};
  const doc: any = {
    documentName: opts.documentName ?? 'Drawing',
    ds: opts.ds,
    name: 'Test Doc',
    getFlag: vi.fn((scope: string, key: string) => {
      // support dotted paths like 'general.unlockMacro' / 'general.unlocked'
      const parts = key.split('.');
      let cursor = flags[scope];
      for (const part of parts) {
        if (cursor === undefined || cursor === null) return undefined;
        cursor = cursor[part];
      }
      return cursor;
    }),
    setFlag: vi.fn(async (scope: string, key: string, value: any) => {
      flags[scope] ??= {};
      const parts = key.split('.');
      let cursor = flags[scope];
      for (let i = 0; i < parts.length - 1; i++) {
        cursor[parts[i]] ??= {};
        cursor = cursor[parts[i]];
      }
      cursor[parts[parts.length - 1]] = value;
    }),
    unsetFlag: vi.fn(async (scope: string, key: string) => {
      if (flags[scope]) delete flags[scope][key];
    }),
    update: vi.fn(async (data: any) => {
      if ('ds' in data) doc.ds = data.ds;
    }),
  };
  return { doc, flags };
}

beforeEach(() => {
  (globalThis as any).CONST = { WALL_DOOR_STATES: { LOCKED: 2, CLOSED: 0 } };
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).CONST;
});

function setActive(isGM = true) {
  (globalThis as any).game = { modules: { get: (id: string) => (id === MODULE_ID ? { active: true } : undefined) }, user: { isGM } };
}

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive puzzle-locks -> MODULE_NOT_ACTIVE (returns, never throws)', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModulePuzzleLocks({ action: 'get-puzzle', documentUuid: 'Scene.x.Drawing.y' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM -> PUZZLE_LOCKS_ACCESS_DENIED', async () => {
    setActive(false);
    const res: any = await dispatchModulePuzzleLocks({
      action: 'attach-puzzle',
      documentUuid: 'Scene.x.Drawing.y',
      lockType: 'password-lock',
      typeConfig: { password: 'open sesame' },
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PUZZLE_LOCKS_ACCESS_DENIED');
  });
});

// ── 3. Per-type required-solution-field enforcement ──────────────────────────────

describe('attach-puzzle solution-field enforcement', () => {
  it('an empty password on password-lock -> PUZZLE_LOCKS_INVALID_LOCK_TYPE, nothing written', async () => {
    setActive(true);
    const { doc } = makeDoc();
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({
      action: 'attach-puzzle',
      documentUuid: 'Scene.x.Drawing.y',
      lockType: 'password-lock',
      typeConfig: { password: '' },
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PUZZLE_LOCKS_INVALID_LOCK_TYPE');
    expect(doc.setFlag).not.toHaveBeenCalled();
  });

  it('a non-empty password -> attach-puzzle succeeds', async () => {
    setActive(true);
    const { doc } = makeDoc();
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({
      action: 'attach-puzzle',
      documentUuid: 'Scene.x.Drawing.y',
      lockType: 'password-lock',
      typeConfig: { password: 'open sesame' },
    });
    expect(res.success).toBe(true);
    expect(doc.getFlag(FLAG_SCOPE, 'password-lock').password).toBe('open sesame');
  });
});

// ── 4. remove-puzzle confirm-gate ────────────────────────────────────────────────

describe('remove-puzzle', () => {
  it('without confirm -> PUZZLE_LOCKS_CONFIRM_REQUIRED, no unset attempted', async () => {
    setActive(true);
    const { doc } = makeDoc({ flags: { [FLAG_SCOPE]: { general: { lockType: 'password-lock' }, 'password-lock': { password: 'x' } } } });
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({ action: 'remove-puzzle', documentUuid: 'Scene.x.Drawing.y' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PUZZLE_LOCKS_CONFIRM_REQUIRED');
    expect(doc.unsetFlag).not.toHaveBeenCalled();
  });
});

// ── 5/6/7. force-unlock confirm-gate + wall two-write + unlockMacro NOT fired ────

describe('force-unlock', () => {
  it('without confirm -> PUZZLE_LOCKS_CONFIRM_REQUIRED', async () => {
    setActive(true);
    const { doc } = makeDoc({ flags: { [FLAG_SCOPE]: { general: { lockType: 'password-lock', unlocked: false } } } });
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({ action: 'force-unlock', documentUuid: 'Scene.x.Drawing.y' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('PUZZLE_LOCKS_CONFIRM_REQUIRED');
  });

  it('on a Wall document, writes BOTH ds:CLOSED AND general.unlocked:true (two-write, no reliance on preUpdateWall)', async () => {
    setActive(true);
    const { doc } = makeDoc({
      documentName: 'Wall',
      ds: 2, // LOCKED
      flags: { [FLAG_SCOPE]: { general: { lockType: 'number-lock', unlocked: false, unlockMacro: 'ui.notifications.info("should not fire")' } } },
    });
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({ action: 'force-unlock', documentUuid: 'Scene.x.Wall.y', confirm: true });
    expect(res.success).toBe(true);
    expect(doc.update).toHaveBeenCalledWith({ ds: 0 }); // CLOSED
    expect(doc.getFlag(FLAG_SCOPE, 'general.unlocked')).toBe(true);
    expect(doc.ds).toBe(0);
  });

  it('never invokes/executes the unlockMacro script — only the interactive solve path does', async () => {
    setActive(true);
    const { doc } = makeDoc({
      flags: { [FLAG_SCOPE]: { general: { lockType: 'password-lock', unlocked: false, unlockMacro: 'ui.notifications.info("boom")' } } },
    });
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({ action: 'force-unlock', documentUuid: 'Scene.x.Drawing.y', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.warning).toContain('unlockMacro does NOT fire');
    // unlockMacro flag value is untouched (still the raw string, never eval'd by the handler)
    expect(doc.getFlag(FLAG_SCOPE, 'general.unlockMacro')).toBe('ui.notifications.info("boom")');
  });
});

// ── 8. Full-replace trap (documented, not guarded) ───────────────────────────────

describe('attach-puzzle full-replace trap', () => {
  it('re-attaching the same lockType with a new typeConfig replaces the old typeConfig wholesale', async () => {
    setActive(true);
    const { doc } = makeDoc({
      flags: { [FLAG_SCOPE]: { general: { lockType: 'number-lock' }, 'number-lock': { code: '1234', 'keypad-0': 'old.webp' } } },
    });
    (globalThis as any).fromUuid = vi.fn(async () => doc);
    const res: any = await dispatchModulePuzzleLocks({
      action: 'attach-puzzle',
      documentUuid: 'Scene.x.Drawing.y',
      lockType: 'number-lock',
      typeConfig: { code: '5678' }, // omits keypad-0 entirely
    });
    expect(res.success).toBe(true);
    const after = doc.getFlag(FLAG_SCOPE, 'number-lock');
    expect(after.code).toBe('5678');
    expect(after['keypad-0']).toBeUndefined(); // wiped, not merged — matches LockConfiguration.js:114-121
  });
});
