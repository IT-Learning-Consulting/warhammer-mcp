// Module Integration v2 Phase 2 — Unit tests for module-simple-quest dispatcher + guards.
//
// Deterministic: mocks globalThis.game.modules / game.user / a minimal JournalEntryPage — no live
// Foundry, no world-churn.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters, not just WHAT):
//   1. Inactive module → MODULE_NOT_ACTIVE (guard returns, never throws). WHY: a tool fired in a world
//      without simple-quest must fail with the typed token, not a generic crash.
//   2. GM write gate: non-GM write → SIMPLE_QUEST_ACCESS_DENIED. WHY: only the GM authors quest state.
//   3. CCR-4: delete-quest without confirm → SIMPLE_QUEST_CONFIRM_REQUIRED; with confirm:true proceeds.
//      WHY: page deletion is irreversible — a no-confirm path would let an LLM destroy quests silently.
//   4. HC-v2-5 rename warning: an objective write whose derived key matches none of the page's actual
//      <li> objectives → SIMPLE_QUEST_RENAME_WARNING; a valid never-ticked <li> must NOT warn;
//      acknowledgeRename:true suppresses. WHY: a write under a key that no rendered objective owns
//      orphans checkbox/secret state — but a real objective that simply hasn't been ticked is legitimate.
//   5. discriminatedUnion rejects a bad action → SIMPLE_QUEST_INVALID_INPUT. WHY: the umbrella's surface
//      is the schema enum; an off-list action must be rejected at parse, not dispatched.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchModuleSimpleQuest } from '../simple-quest.js';

function makePage(opts: { checkboxes?: Record<string, number>; content?: string }) {
  const flags: Record<string, any> = { 'simple-quest': { checkboxes: opts.checkboxes ?? {} } };
  const page: any = {
    id: 'page1',
    uuid: 'JournalEntry.j1.JournalEntryPage.page1',
    name: 'Test Quest',
    text: { content: opts.content ?? '' },
    flags,
    parent: { id: 'j1', name: 'Quests', deleteEmbeddedDocuments: async () => [] },
    getFlag: (scope: string, key: string) => flags?.[scope]?.[key],
    // Minimal dot-path apply so the DP-16 re-read reflects the write (e.g. "flags.simple-quest.checkboxes").
    update: async (delta: Record<string, unknown>) => {
      for (const [path, value] of Object.entries(delta)) {
        if (path.startsWith('flags.simple-quest.')) {
          const key = path.slice('flags.simple-quest.'.length);
          flags['simple-quest'][key] = value;
        }
      }
      return page;
    },
  };
  return page;
}

function makeGame(opts: { active: boolean; isGM?: boolean; page?: any; users?: any[]; socketSink?: any[] }) {
  return {
    modules: {
      get: (id: string) =>
        opts.active && id === 'simple-quest' ? { active: true, title: 'Simple Quest', version: '3.0.19' } : undefined,
    },
    user: { isGM: opts.isGM ?? true },
    settings: { get: () => 'Quests' },
    journal: { get: () => undefined, find: () => undefined, filter: () => [], getName: () => undefined },
    folders: { find: () => null },
    users: opts.users ?? [],
    socket: { emit: (channel: string, payload: any) => opts.socketSink?.push({ channel, payload }) },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  // fromUuid resolves the mock page when set per-test.
  (globalThis as any).fromUuid = async () => (globalThis as any).__sqPage ?? null;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).__sqPage;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive simple-quest → MODULE_NOT_ACTIVE (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleSimpleQuest({ action: 'list-quests' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('simple-quest');
  });
});

// ── 2. GM write gate ─────────────────────────────────────────────────────────────

describe('GM write gate', () => {
  it('non-GM create-quest → SIMPLE_QUEST_ACCESS_DENIED', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false });
    const res: any = await dispatchModuleSimpleQuest({ action: 'create-quest', name: 'X' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SIMPLE_QUEST_ACCESS_DENIED');
  });
});

// ── 3. CCR-4 — delete confirm gate ──────────────────────────────────────────────

describe('CCR-4 delete confirm gate', () => {
  it('delete-quest without confirm → SIMPLE_QUEST_CONFIRM_REQUIRED', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    (globalThis as any).__sqPage = makePage({});
    const res: any = await dispatchModuleSimpleQuest({
      action: 'delete-quest',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SIMPLE_QUEST_CONFIRM_REQUIRED');
  });

  it('delete-quest with confirm:true proceeds past the gate (reaches the document op)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    const page = makePage({});
    (globalThis as any).__sqPage = page;
    // After delete, fromUuid must report the page gone for the DP-16 success path. Flip on first re-read.
    let reads = 0;
    (globalThis as any).fromUuid = async () => {
      reads += 1;
      return reads === 1 ? page : null; // first lookup finds it; post-delete re-read returns null
    };
    const res: any = await dispatchModuleSimpleQuest({
      action: 'delete-quest',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
      confirm: true,
    });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
  });
});

// ── 4. HC-v2-5 — objective rename warning ───────────────────────────────────────

describe('HC-v2-5 objective rename warning', () => {
  it('objective write with a new key on a page that already has checkboxes → SIMPLE_QUEST_RENAME_WARNING', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    // Page already has a checkbox under a DIFFERENT key — the new derived key won't match.
    (globalThis as any).__sqPage = makePage({ checkboxes: { Findthebody: 1 } });
    const res: any = await dispatchModuleSimpleQuest({
      action: 'set-objective-state',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
      objectiveText: 'Recover the ledger', // derives to a key NOT in {Findthebody}
      state: 1,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SIMPLE_QUEST_RENAME_WARNING');
  });

  it('acknowledgeRename:true suppresses the warning and proceeds (silent orphaning is the GM\'s choice)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    (globalThis as any).__sqPage = makePage({ checkboxes: { Findthebody: 1 } });
    const res: any = await dispatchModuleSimpleQuest({
      action: 'set-objective-state',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
      objectiveText: 'Recover the ledger',
      state: 1,
      acknowledgeRename: true,
    });
    // Proceeds past the rename guard; succeeds (DP-16 verify passes on the mock).
    expect(res.success).toBe(true);
    expect(res.data.state).toBe(1);
  });

  // Regression guard for the live-smoke MAJOR (2026-06-25): the warning must key off the page's actual
  // <li> objectives, NOT prior checkboxes. Ticking a VALID objective that simply hasn't been ticked yet
  // must NOT warn — the prior checkbox-based heuristic false-positived on every objective after the first.
  it('a valid never-ticked objective (present as an <li>) does NOT warn even when other checkboxes exist', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    (globalThis as any).__sqPage = makePage({
      checkboxes: { Findthebody: 1 }, // objective 1 already ticked
      content: '<ul><li>Find the body</li><li>Question the witness</li><li>Recover the ledger</li></ul>',
    });
    const res: any = await dispatchModuleSimpleQuest({
      action: 'set-objective-state',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
      objectiveText: 'Question the witness', // a real <li>, never ticked → must be allowed
      state: 2,
    });
    expect(res.success).toBe(true);
    expect(res.data.state).toBe(2);
  });

  it('objective text matching no <li> on the page → SIMPLE_QUEST_RENAME_WARNING (genuine rename/typo)', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    (globalThis as any).__sqPage = makePage({
      checkboxes: { Findthebody: 1 },
      content: '<ul><li>Find the body</li><li>Question the witness</li></ul>',
    });
    const res: any = await dispatchModuleSimpleQuest({
      action: 'set-objective-state',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
      objectiveText: 'Find the corpse', // not an <li> on this page → likely a rename/typo
      state: 1,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SIMPLE_QUEST_RENAME_WARNING');
  });
});

// ── 4b. show-quest-to-players socket envelope (live-smoke MAJOR fix, 2026-06-25) ──
// WHY: the original impl dynamic-imported the module's bundled socket.js (404 at runtime). The fix emits
// the openToPage envelope directly on the `module.simple-quest` channel the module listens on. Guard the
// envelope shape (channel, __$eventName, resolved non-GM user ids) so it can't silently regress to a no-op.

describe('show-quest-to-players socket emit', () => {
  it('emits openToPage on module.simple-quest to resolved active non-GM players', async () => {
    const sink: any[] = [];
    (globalThis as any).game = makeGame({
      active: true,
      isGM: true,
      users: [
        { id: 'gm1', active: true, isGM: true },
        { id: 'p1', active: true, isGM: false },
        { id: 'p2', active: false, isGM: false }, // inactive — excluded
      ],
      socketSink: sink,
    });
    (globalThis as any).__sqPage = makePage({ content: '<ul><li>Find the body</li></ul>' });
    const res: any = await dispatchModuleSimpleQuest({
      action: 'show-quest-to-players',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
    });
    expect(res.success).toBe(true);
    expect(res.data.delivered).toBe(true);
    expect(res.data.userIds).toEqual(['p1']); // active non-GM only
    expect(sink).toHaveLength(1);
    expect(sink[0].channel).toBe('module.simple-quest');
    expect(sink[0].payload.uuid).toBe('JournalEntry.j1.JournalEntryPage.page1');
    expect(sink[0].payload.__$socketOptions.__$eventName).toBe('openToPage');
    expect(sink[0].payload.__$socketOptions.users).toEqual(['p1']);
  });

  it('no active non-GM players → delivered:false, no throw (graceful)', async () => {
    const sink: any[] = [];
    (globalThis as any).game = makeGame({ active: true, isGM: true, users: [{ id: 'gm1', active: true, isGM: true }], socketSink: sink });
    (globalThis as any).__sqPage = makePage({ content: '<ul><li>Find the body</li></ul>' });
    const res: any = await dispatchModuleSimpleQuest({
      action: 'show-quest-to-players',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.page1',
    });
    expect(res.success).toBe(true);
    expect(res.data.delivered).toBe(false);
  });
});

// ── 5. discriminatedUnion rejects an off-list action ────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → SIMPLE_QUEST_INVALID_INPUT', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: true });
    const res: any = await dispatchModuleSimpleQuest({ action: 'frobnicate-quest' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SIMPLE_QUEST_INVALID_INPUT');
  });
});
