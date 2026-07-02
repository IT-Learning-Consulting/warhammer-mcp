// Module Integration v2 Phase 1 — Unit tests for module-conversation-hud dispatcher + guards.
//
// Deterministic: mocks globalThis.game.modules / game.user — no live Foundry, no world-churn.
//
// Coverage:
//   1. Inactive module → MODULE_NOT_ACTIVE (guard returns, never throws).
//   2. CCR-v2-A — create-conversation conversationType:"collective" → CONVERSATION_HUD_COLLECTIVE_REJECTED.
//   3. CCR-4 — delete-conversation without confirm:true → CONVERSATION_HUD_CONFIRM_REQUIRED.
//   4. HC-v2-6 regression guard — the dialog-opening executeFunction types are NOT in the schema enum
//      (parsing one returns CONVERSATION_HUD_INVALID_INPUT, proving they are not exposed).
//   5. Non-GM write → CONVERSATION_HUD_ACCESS_DENIED.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchModuleConversationHud } from '../conversation-hud.js';

function makeGame(opts: { active: boolean; isGM?: boolean }) {
  return {
    modules: {
      get: (id: string) =>
        opts.active && id === 'conversation-hud'
          ? { active: true, title: 'ConversationHUD', version: '6.0.0' }
          : undefined,
    },
    user: { isGM: opts.isGM ?? true },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive conversation-hud → MODULE_NOT_ACTIVE (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleConversationHud({ action: 'list-conversations' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('conversation-hud');
  });
});

// ── 2. CCR-v2-A — collective rejection ──────────────────────────────────────────

describe('CCR-v2-A collective rejection', () => {
  it('create-conversation conversationType:"collective" → CONVERSATION_HUD_COLLECTIVE_REJECTED', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    const res: any = await dispatchModuleConversationHud({
      action: 'create-conversation',
      name: 'Bad',
      conversationType: 'collective',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('CONVERSATION_HUD_COLLECTIVE_REJECTED');
  });
});

// ── 3. CCR-4 — delete confirm gate ──────────────────────────────────────────────

describe('CCR-4 delete confirm gate', () => {
  it('delete-conversation without confirm → CONVERSATION_HUD_CONFIRM_REQUIRED', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    const res: any = await dispatchModuleConversationHud({
      action: 'delete-conversation',
      journalId: 'JournalEntry.abc123',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('CONVERSATION_HUD_CONFIRM_REQUIRED');
  });
});

// ── 4. HC-v2-6 — dialog-opening types are not exposed ───────────────────────────

describe('HC-v2-6 dialog-path routing', () => {
  it.each(['add-participant', 'edit-participant', 'remove-participant', 'change-background', 'pull-participants-from-scene'])(
    'dialog type "%s" is rejected at schema parse (not a valid action)',
    async (badType) => {
      (globalThis as any).game = makeGame({ active: true, isGM: true });
      const res: any = await dispatchModuleConversationHud({ action: badType });
      expect(res.success).toBe(false);
      expect(res.error).toContain('CONVERSATION_HUD_INVALID_INPUT');
    },
  );
});

// ── 5. Non-GM write gate ────────────────────────────────────────────────────────

describe('GM write gate', () => {
  it('non-GM create-conversation → CONVERSATION_HUD_ACCESS_DENIED', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false });
    const res: any = await dispatchModuleConversationHud({ action: 'create-conversation', name: 'X' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('CONVERSATION_HUD_ACCESS_DENIED');
  });
});
