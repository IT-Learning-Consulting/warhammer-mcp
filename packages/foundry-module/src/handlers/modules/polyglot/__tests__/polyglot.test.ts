// Module Integration v2 Phase 9 — Unit tests for module-polyglot dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules/user/actors/settings/packs), globalThis.fromUuid, and
// globalThis.ChatMessage/CONST. Zero game.polyglot.* calls in production code, so no runtime-import seam
// is needed — every write is a raw Foundry doc/setting write against these mocks.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive polyglot → MODULE_NOT_ACTIVE for read AND write (guard returns, never throws).
//   2. A write fired by a non-GM → POLYGLOT_ACCESS_DENIED.
//   3. Both confirm-gated actions (revoke-language, revoke-literacy) WITHOUT confirm →
//      POLYGLOT_CONFIRM_REQUIRED, BEFORE any delete.
//   4. An unknown action → POLYGLOT_INVALID_INPUT (discriminatedUnion reject).
//   5. IDEMPOTENCY: granting the same language twice creates only ONE item (the compendium-items-ship-
//      advances.value:0 trap this plan exists to guard against).
//   6. ACCENT-INSENSITIVE RESOLUTION: typing "Eltharin" (no diacritic) resolves to the canonical
//      "Elthárin" via the built-in font-map fallback (no compendium pack mocked) and creates the item
//      under the CANONICAL accented name — proving the font-key alignment fix actually fires.
//   7. HOMEBREW fallback: an unrecognized language name still builds a valid int/adv/isSpec skill item.
//   8. revoke-language WITH confirm:true deletes and verifies absence; a target that was never granted
//      → POLYGLOT_TARGET_NOT_FOUND.
//   9. send-in-language DUAL-WRITES flags.polyglot.language AND a top-level `language` field on the same
//      ChatMessage.create call (subagent-3's belt-and-suspenders fix) — verified via the created
//      message's flag re-read, with a NOT_PERSISTED case when the flag silently doesn't land.
//  10. tag-journal-page wraps the requested substring in a polyglot-journal span and verifies via a
//      fresh fromUuid re-read; a missing substring → POLYGLOT_TARGET_NOT_FOUND.
//  11. check-knows-language / check-literacy read actor.items without requiring any write.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModulePolyglot } from '../polyglot.js';

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `item${idCounter}`;
}

function makeActor(id: string, name: string, initialItems: any[] = []) {
  const items: any[] = [...initialItems];
  return {
    id,
    name,
    items,
    createEmbeddedDocuments: vi.fn(async (_type: string, docs: any[]) => {
      const created = docs.map((d) => ({ ...d, id: nextId() }));
      items.push(...created);
      return created;
    }),
    deleteEmbeddedDocuments: vi.fn(async (_type: string, ids: string[]) => {
      for (const rid of ids) {
        const idx = items.findIndex((i) => i.id === rid);
        if (idx !== -1) items.splice(idx, 1);
      }
      return ids;
    }),
  };
}

function makeSettings(store: Record<string, any> = {}) {
  return { get: vi.fn((_scope: string, key: string) => store[key]) };
}

function makeGame(opts: {
  active: boolean;
  isGM?: boolean;
  actors?: Record<string, any>;
  settings?: any;
  packs?: any;
}) {
  const actors = opts.actors ?? {};
  return {
    modules: {
      get: (id: string) => (id === 'polyglot' ? (opts.active ? { active: true, title: 'Polyglot', version: '2.8.2' } : undefined) : undefined),
    },
    user: { isGM: opts.isGM ?? true },
    actors: { get: (aid: string) => actors[aid] },
    settings: opts.settings ?? makeSettings(),
    packs: opts.packs ?? { get: () => undefined },
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).fromUuid = vi.fn(async () => null);
  (globalThis as any).ChatMessage = {
    create: vi.fn(async (data: any) => ({ id: 'msg1', ...data })),
    get: vi.fn(() => undefined),
    getSpeaker: vi.fn(() => ({ alias: 'Speaker' })),
  };
  (globalThis as any).CONST = { CHAT_MESSAGE_STYLES: { OTHER: 0, IC: 1, OOC: 2, EMOTE: 3 } };
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).ChatMessage;
  delete (globalThis as any).CONST;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive polyglot → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Reikspiel' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('polyglot');
  });

  it('inactive polyglot → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModulePolyglot({ action: 'list-world-languages' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2. GM gate ──────────────────────────────────────────────────────────────────

describe('GM gate', () => {
  it('a write action fired by a non-GM → POLYGLOT_ACCESS_DENIED', async () => {
    const a1 = makeActor('a1', 'Grenz');
    (globalThis as any).game = makeGame({ active: true, isGM: false, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Reikspiel' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_ACCESS_DENIED');
    expect(a1.createEmbeddedDocuments).not.toHaveBeenCalled();
  });
});

// ── 3. Confirm gates (CCR-4) ─────────────────────────────────────────────────────

describe('confirm gates (CCR-4)', () => {
  it('revoke-language WITHOUT confirm → POLYGLOT_CONFIRM_REQUIRED, no delete called', async () => {
    const a1 = makeActor('a1', 'Grenz', [{ id: 'i1', type: 'skill', name: 'Language (Reikspiel)' }]);
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'revoke-language', entityId: 'a1', language: 'Reikspiel' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_CONFIRM_REQUIRED');
    expect(a1.deleteEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('revoke-literacy WITHOUT confirm → POLYGLOT_CONFIRM_REQUIRED, no delete called', async () => {
    const a1 = makeActor('a1', 'Grenz', [{ id: 'i1', type: 'talent', name: 'Read/Write' }]);
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'revoke-literacy', entityId: 'a1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_CONFIRM_REQUIRED');
    expect(a1.deleteEmbeddedDocuments).not.toHaveBeenCalled();
  });
});

// ── 4. discriminatedUnion rejects an off-list action ────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → POLYGLOT_INVALID_INPUT', async () => {
    (globalThis as any).game = makeGame({ active: true, actors: {} });
    const res: any = await dispatchModulePolyglot({ action: 'nuke-the-world', entityId: 'a1' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_INVALID_INPUT');
  });
});

// ── 5. Idempotency — double-grant creates only ONE item ─────────────────────────

describe('grant-language idempotency', () => {
  it('granting the same language twice creates exactly one item', async () => {
    const a1 = makeActor('a1', 'Grenz');
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });

    const first: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Reikspiel' });
    expect(first.success).toBe(true);
    expect(first.data.alreadyKnown).toBe(false);

    const second: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Reikspiel' });
    expect(second.success).toBe(true);
    expect(second.data.alreadyKnown).toBe(true);

    expect(a1.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    expect(a1.items.filter((i: any) => i.name === 'Language (Reikspiel)')).toHaveLength(1);
  });

  it('a create that silently does not land on actor.items → POLYGLOT_NOT_PERSISTED (item-scan verify shape)', async () => {
    const a1 = makeActor('a1', 'Grenz');
    a1.createEmbeddedDocuments = vi.fn(async () => []); // silently no-ops — items array never gets the new entry
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Reikspiel' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_NOT_PERSISTED');
  });
});

// ── 6. Accent-insensitive resolution (built-in map fallback) ────────────────────

describe('accent-insensitive resolution', () => {
  it('typing "Eltharin" (no diacritic) resolves to the canonical "Elthárin" via the built-in map', async () => {
    const a1 = makeActor('a1', 'Grenz');
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } }); // no packs mocked → built-in map fallback
    const res: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Eltharin' });
    expect(res.success).toBe(true);
    expect(res.data.language).toBe('Elthárin');
    expect(res.data.source).toBe('builtin');
    expect(a1.items.some((i: any) => i.name === 'Language (Elthárin)')).toBe(true);
  });
});

// ── 7. Homebrew fallback ─────────────────────────────────────────────────────────

describe('homebrew language fallback', () => {
  it('an unrecognized language name still builds a valid int/adv/isSpec skill item', async () => {
    const a1 = makeActor('a1', 'Grenz');
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'grant-language', entityId: 'a1', language: 'Klingon' });
    expect(res.success).toBe(true);
    expect(res.data.source).toBe('homebrew');
    const created = a1.items.find((i: any) => i.name === 'Language (Klingon)');
    expect(created).toBeTruthy();
    expect(created.system.characteristic.value).toBe('int');
    expect(created.system.advanced.value).toBe('adv');
    expect(created.system.grouped.value).toBe('isSpec');
  });
});

// ── 8. revoke-language confirmed + target-not-found ─────────────────────────────

describe('revoke-language', () => {
  it('WITH confirm:true deletes the item and verifies absence', async () => {
    const a1 = makeActor('a1', 'Grenz', [{ id: 'i1', type: 'skill', name: 'Language (Reikspiel)' }]);
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'revoke-language', entityId: 'a1', language: 'Reikspiel', confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(a1.items.some((i: any) => i.name === 'Language (Reikspiel)')).toBe(false);
  });

  it('a language never granted → POLYGLOT_TARGET_NOT_FOUND', async () => {
    const a1 = makeActor('a1', 'Grenz');
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'revoke-language', entityId: 'a1', language: 'Reikspiel', confirm: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_TARGET_NOT_FOUND');
  });
});

// ── 9. send-in-language dual-write + verify ─────────────────────────────────────

describe('send-in-language', () => {
  it('dual-writes flags.polyglot.language AND a top-level language field, verified via the created flag', async () => {
    (globalThis as any).game = makeGame({ active: true, actors: {} });
    let createdData: any;
    (globalThis as any).ChatMessage.create = vi.fn(async (data: any) => {
      createdData = data;
      return { id: 'msg1' };
    });
    (globalThis as any).ChatMessage.get = vi.fn(() => ({ getFlag: (scope: string, key: string) => (scope === 'polyglot' && key === 'language' ? 'reikspiel' : undefined) }));

    const res: any = await dispatchModulePolyglot({ action: 'send-in-language', content: 'Guten tag', language: 'Reikspiel' });
    expect(res.success).toBe(true);
    expect(createdData.flags.polyglot.language).toBe('reikspiel');
    expect(createdData.language).toBe('reikspiel');
    expect(createdData.style).toBe(0); // CONST.CHAT_MESSAGE_STYLES.OTHER
  });

  it('a flag that silently does not land → POLYGLOT_NOT_PERSISTED', async () => {
    (globalThis as any).game = makeGame({ active: true, actors: {} });
    (globalThis as any).ChatMessage.create = vi.fn(async () => ({ id: 'msg1' }));
    (globalThis as any).ChatMessage.get = vi.fn(() => ({ getFlag: () => undefined })); // flag never landed
    const res: any = await dispatchModulePolyglot({ action: 'send-in-language', content: 'Guten tag', language: 'Reikspiel' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_NOT_PERSISTED');
  });
});

// ── 10. tag-journal-page ─────────────────────────────────────────────────────────

describe('tag-journal-page', () => {
  it('wraps the requested substring and verifies the span via a fresh fromUuid re-read', async () => {
    let content = 'The old runes say: ancient words of power. The end.';
    const page = {
      name: 'Lore Page',
      text: { content },
      update: vi.fn(async (changes: any) => {
        content = changes['text.content'];
        page.text.content = content;
      }),
    };
    (globalThis as any).fromUuid = vi.fn(async () => ({ ...page, text: { content } }));
    // Re-point fromUuid so the post-update re-read reflects the mutation.
    (globalThis as any).fromUuid = vi.fn(async () => ({ name: page.name, text: { content }, update: page.update }));
    (globalThis as any).game = makeGame({ active: true, actors: {} });

    const res: any = await dispatchModulePolyglot({
      action: 'tag-journal-page',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.p1',
      language: 'Reikspiel',
      text: 'ancient words of power',
    });
    expect(res.success).toBe(true);
    expect(content).toContain('<span class="polyglot-journal" data-language="reikspiel">ancient words of power</span>');
  });

  it('a missing substring → POLYGLOT_TARGET_NOT_FOUND', async () => {
    (globalThis as any).fromUuid = vi.fn(async () => ({ name: 'Lore Page', text: { content: 'Nothing special here.' }, update: vi.fn() }));
    (globalThis as any).game = makeGame({ active: true, actors: {} });
    const res: any = await dispatchModulePolyglot({
      action: 'tag-journal-page',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.p1',
      language: 'Reikspiel',
      text: 'does not exist',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_TARGET_NOT_FOUND');
  });

  it('an update that silently does not persist the span → POLYGLOT_NOT_PERSISTED (journal-span verify shape)', async () => {
    // The post-update re-read via fromUuid returns the ORIGINAL (untagged) content — simulating a
    // page.update that silently no-ops (e.g. a permission issue Foundry swallows).
    (globalThis as any).fromUuid = vi.fn(async () => ({
      name: 'Lore Page',
      text: { content: 'ancient words of power, unchanged' },
      update: vi.fn(async () => undefined), // no-ops — never mutates the backing content
    }));
    (globalThis as any).game = makeGame({ active: true, actors: {} });
    const res: any = await dispatchModulePolyglot({
      action: 'tag-journal-page',
      pageUuid: 'JournalEntry.j1.JournalEntryPage.p1',
      language: 'Reikspiel',
      text: 'ancient words of power',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('POLYGLOT_NOT_PERSISTED');
  });
});

// ── 11. Reads ────────────────────────────────────────────────────────────────────

describe('reads', () => {
  it('check-knows-language scans actor.items accent-insensitively', async () => {
    const a1 = makeActor('a1', 'Grenz', [{ id: 'i1', type: 'skill', name: 'Language (Elthárin)' }]);
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const res: any = await dispatchModulePolyglot({ action: 'check-knows-language', entityId: 'a1', language: 'Eltharin' });
    expect(res.success).toBe(true);
    expect(res.data.knows).toBe(true);
    expect(res.data.known).toContain('Elthárin');
  });

  it('check-literacy is false without the Read/Write talent, true with it', async () => {
    const a1 = makeActor('a1', 'Grenz', [{ id: 'i1', type: 'skill', name: 'Language (Reikspiel)' }]);
    (globalThis as any).game = makeGame({ active: true, actors: { a1 } });
    const before: any = await dispatchModulePolyglot({ action: 'check-literacy', entityId: 'a1' });
    expect(before.data.literate).toBe(false);
    expect(before.data.literateLanguages).toEqual([]);

    a1.items.push({ id: 'i2', type: 'talent', name: 'Read/Write' });
    const after: any = await dispatchModulePolyglot({ action: 'check-literacy', entityId: 'a1' });
    expect(after.data.literate).toBe(true);
    expect(after.data.literateLanguages).toContain('Reikspiel');
  });

  it('list-world-languages reads the persisted setting, not an in-memory provider', async () => {
    const settings = makeSettings({ Languages: { reikspiel: { label: 'Reikspiel', font: 'Infernal' } } });
    (globalThis as any).game = makeGame({ active: true, actors: {}, settings });
    const res: any = await dispatchModulePolyglot({ action: 'list-world-languages' });
    expect(res.success).toBe(true);
    expect(res.data.count).toBe(1);
    expect(res.data.languages[0]).toEqual({ key: 'reikspiel', label: 'Reikspiel', font: 'Infernal' });
  });
});
