// Module Integration v2 Phase 10 — Unit tests for module-narrator dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user/settings/messages) and globalThis.NarratorTools —
// no live Foundry. NarratorTools is mocked as a BARE lexical global (matching the `declare const
// NarratorTools: any;` production pattern — see module-robak.test.ts precedent for `SocketHandlers`).
//
// The mock NarratorTools deliberately schedules its internal settings/ChatMessage writes on a LATER
// tick (setTimeout) — mirroring narrator.js's own fire-and-forget writes (createChatMessage/scenery
// never await game.settings.set/ChatMessage.create). This proves the handler's settle-poll verify
// actually waits for the later-tick write rather than false-failing on an immediate re-read.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive narrator-tools → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//   2. A write fired by a non-GM → NARRATOR_ACCESS_DENIED.
//   3. scenery/configure by a GM lacking SETTINGS_MODIFY → NARRATOR_ACCESS_DENIED (before any write).
//   4. An unknown action → NARRATOR_INVALID_INPUT (discriminatedUnion reject).
//   5. get-state reads the persisted sharedState (default shape when never set).
//   6. narrate: settle-poll verifies sharedState.narration lands + locates the created ChatMessage;
//      D3 — startPaused defaults to false and OVERRIDES a world NarrationStartPaused=true seed (the
//      hang-forever trap this design decision exists to prevent); a silently-dropped write →
//      NARRATOR_NOT_PERSISTED.
//   7. describe/notify: settle-poll locates the created ChatMessage by flag+content; notify's whisper
//      is non-empty (GM-only); a silently-dropped write → NARRATOR_NOT_PERSISTED.
//   8. scenery: toggle (omitted state) and explicit state both round-trip via settle-poll.
//   9. configure: direct awaited settings.set + round-trip verify; a mismatched round-trip →
//      NARRATOR_NOT_PERSISTED.
//  10. NarratorTools unreachable (bare identifier unresolved) → NARRATOR_HANDLER_ERROR.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleNarrator } from '../narrator.js';

const MODULE_ID = 'narrator-tools';

function makeWorld(opts: { isGM?: boolean; settingsModify?: boolean; narrationStartPaused?: boolean } = {}) {
  const settingsStore: Record<string, any> = {
    sharedState: { narration: { id: 0, display: false, message: '', paused: false }, scenery: false },
    NarrationStartPaused: opts.narrationStartPaused ?? false,
  };
  const messages: any[] = [];
  let nextMsgId = 1;

  const settings = {
    get: vi.fn((_scope: string, key: string) => settingsStore[key]),
    set: vi.fn(async (_scope: string, key: string, value: any) => {
      settingsStore[key] = value;
      return value;
    }),
  };

  function createMessage(chatData: any) {
    const id = `msg${nextMsgId++}`;
    const msg = {
      id,
      content: chatData.content,
      whisper: chatData.whisper ?? [],
      getFlag: (scope: string, k: string) => (scope === MODULE_ID ? chatData.flags?.[MODULE_ID]?.[k] : undefined),
    };
    messages.push(msg);
    return msg;
  }

  // Mirrors narrator.js's createChatMessage(): fire-and-forget, writes land on a LATER tick.
  function narratorCreateChatMessage(type: string, message: string, options: Record<string, any> = {}) {
    const content = message.replace(/\\n/g, '<br>');
    const chatData = {
      content,
      flags: { [MODULE_ID]: { type } },
      whisper: type === 'notification' ? ['gm1'] : [],
      ...options,
    };
    if (type === 'narration') {
      const state = {
        id: (settingsStore.sharedState?.narration?.id ?? 0) + 1,
        display: true,
        message: content,
        paused: settingsStore.NarrationStartPaused,
      };
      setTimeout(() => {
        settingsStore.sharedState = { ...settingsStore.sharedState, narration: state };
      }, 5);
      setTimeout(() => createMessage(chatData), 5);
      return;
    }
    setTimeout(() => createMessage(chatData), 5);
  }

  const NarratorTools = {
    chatMessage: {
      narrate: vi.fn((message: string | string[], options: Record<string, any> = {}) => {
        const arr = Array.isArray(message) ? message : [message];
        narratorCreateChatMessage('narration', arr[0], options);
        return arr.slice(1);
      }),
      describe: vi.fn((message: string, options: Record<string, any> = {}) => {
        narratorCreateChatMessage('description', message, options);
      }),
      notify: vi.fn((message: string, options: Record<string, any> = {}) => {
        narratorCreateChatMessage('notification', message, options);
      }),
    },
    scenery: vi.fn((state?: boolean) => {
      const before = settingsStore.sharedState.scenery;
      const next = state ?? !before;
      setTimeout(() => {
        settingsStore.sharedState = { ...settingsStore.sharedState, scenery: next };
      }, 5);
    }),
  };

  const game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: true } : undefined) },
    user: {
      isGM: opts.isGM ?? true,
      hasPermission: (perm: string) => (perm === 'SETTINGS_MODIFY' ? (opts.settingsModify ?? true) : false),
    },
    settings,
    messages: { contents: messages },
  };

  return { game, NarratorTools, settingsStore, messages };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).NarratorTools = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).NarratorTools;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive narrator-tools → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'The mist parts.' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('narrator-tools');
  });

  it('inactive narrator-tools → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = { modules: { get: () => undefined } };
    const res: any = await dispatchModuleNarrator({ action: 'get-state' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM → NARRATOR_ACCESS_DENIED', async () => {
    const world = makeWorld({ isGM: false });
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'hello' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_ACCESS_DENIED');
    expect(world.NarratorTools.chatMessage.narrate).not.toHaveBeenCalled();
  });
});

// ── 3. SETTINGS_MODIFY gate ──────────────────────────────────────────────────────

describe('SETTINGS_MODIFY gate', () => {
  it('scenery by a GM lacking SETTINGS_MODIFY → NARRATOR_ACCESS_DENIED, no write', async () => {
    const world = makeWorld({ isGM: true, settingsModify: false });
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'scenery' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_ACCESS_DENIED');
    expect(world.NarratorTools.scenery).not.toHaveBeenCalled();
  });

  it('configure by a GM lacking SETTINGS_MODIFY → NARRATOR_ACCESS_DENIED, no write', async () => {
    const world = makeWorld({ isGM: true, settingsModify: false });
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'configure', key: 'FontSize', value: '20px' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_ACCESS_DENIED');
    expect(world.game.settings.set).not.toHaveBeenCalled();
  });
});

// ── 4. discriminatedUnion rejects an off-list action ────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → NARRATOR_INVALID_INPUT', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'nuke-the-world' } as any);
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_INVALID_INPUT');
  });
});

// ── 5. get-state ─────────────────────────────────────────────────────────────────

describe('get-state', () => {
  it('reads the persisted sharedState (default shape when narrator-tools has never written it)', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'get-state' });
    expect(res.success).toBe(true);
    expect(res.data.sharedState).toEqual({ narration: { id: 0, display: false, message: '', paused: false }, scenery: false });
  });
});

// ── 6. narrate ────────────────────────────────────────────────────────────────────

describe('narrate', () => {
  it('settle-polls sharedState.narration to land + locates the created ChatMessage', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'The mist parts over Ubersreik.' });
    expect(res.success).toBe(true);
    expect(res.data.narrationId).toBe(1);
    expect(res.data.paused).toBe(false);
    expect(typeof res.data.messageId).toBe('string');
    expect(world.settingsStore.sharedState.narration.message).toBe('The mist parts over Ubersreik.');
    const msg = world.messages.find((m: any) => m.id === res.data.messageId);
    expect(msg.getFlag(MODULE_ID, 'type')).toBe('narration');
  });

  it('D3 — startPaused default false FORCES auto-play even when NarrationStartPaused=true world-wide', async () => {
    const world = makeWorld({ narrationStartPaused: true });
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'Held for effect...' });
    expect(res.success).toBe(true);
    expect(res.data.paused).toBe(false);
    expect(world.settingsStore.sharedState.narration.paused).toBe(false);
  });

  it('startPaused:true is honored (opt-in dramatic hold)', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'Wait for it...', startPaused: true });
    expect(res.success).toBe(true);
    expect(res.data.paused).toBe(true);
    expect(world.settingsStore.sharedState.narration.paused).toBe(true);
  });

  it('a sharedState write that never lands → NARRATOR_NOT_PERSISTED', async () => {
    const world = makeWorld();
    world.NarratorTools.chatMessage.narrate = vi.fn(() => []); // silently no-ops — never schedules the write
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'Never arrives.' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_NOT_PERSISTED');
  }, 10000);
});

// ── 7. describe / notify ─────────────────────────────────────────────────────────

describe('describe', () => {
  it('locates the created ChatMessage by flag+content', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'describe', message: 'A dusty tavern, half-lit.' });
    expect(res.success).toBe(true);
    const msg = world.messages.find((m: any) => m.id === res.data.messageId);
    expect(msg.getFlag(MODULE_ID, 'type')).toBe('description');
  });

  it('a ChatMessage that never lands → NARRATOR_NOT_PERSISTED', async () => {
    const world = makeWorld();
    world.NarratorTools.chatMessage.describe = vi.fn(() => undefined); // silently no-ops
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'describe', message: 'Never arrives.' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_NOT_PERSISTED');
  }, 10000);
});

describe('notify', () => {
  it('creates a GM-only whispered ChatMessage', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'notify', message: 'A player just DMed you.' });
    expect(res.success).toBe(true);
    expect(res.data.whisper.length).toBeGreaterThan(0);
  });
});

// ── 8. scenery ────────────────────────────────────────────────────────────────────

describe('scenery', () => {
  it('toggles (omitted state) then round-trips an explicit state', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;

    const toggled: any = await dispatchModuleNarrator({ action: 'scenery' });
    expect(toggled.success).toBe(true);
    expect(toggled.data.scenery).toBe(true); // false → true

    const explicit: any = await dispatchModuleNarrator({ action: 'scenery', state: false });
    expect(explicit.success).toBe(true);
    expect(explicit.data.scenery).toBe(false);
  });
});

// ── 9. configure ──────────────────────────────────────────────────────────────────

describe('configure', () => {
  it('writes a typed setting and round-trip verifies', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'configure', key: 'DurationMultiplier', value: 2 });
    expect(res.success).toBe(true);
    expect(res.data.value).toBe(2);
    expect(world.settingsStore.DurationMultiplier).toBe(2);
  });

  it('a round-trip mismatch → NARRATOR_NOT_PERSISTED', async () => {
    const world = makeWorld();
    world.game.settings.get = vi.fn((_scope: string, key: string) =>
      key === 'FontSize' ? 'STALE' : world.settingsStore[key],
    );
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = world.NarratorTools;
    const res: any = await dispatchModuleNarrator({ action: 'configure', key: 'FontSize', value: '24px' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_NOT_PERSISTED');
  });
});

// ── 10. NarratorTools unreachable ────────────────────────────────────────────────

describe('NarratorTools unreachable', () => {
  it('bare identifier unresolved → NARRATOR_HANDLER_ERROR', async () => {
    const world = makeWorld();
    (globalThis as any).game = world.game;
    (globalThis as any).NarratorTools = undefined; // simulate an unresolved binding
    const res: any = await dispatchModuleNarrator({ action: 'narrate', message: 'hello' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('NARRATOR_HANDLER_ERROR');
  });
});
