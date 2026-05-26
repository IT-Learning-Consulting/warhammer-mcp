// Unit tests for the MCP dialog auto-resolve net (mcp-dialog-autoresolve.ts).
//
// WHY these tests exist: the deterministic pick + unlimited-skip protect
// autonomous MCP flows from UI-blocking dialogs without corrupting the actor.
// The gate (activeCheck=false → delegate to original) ensures the GM's manual
// dialogs are never intercepted outside of MCP requests.
// The override channel lets deliberate builds supply a specific specialisation
// without relying on the random-first-pick default.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub modules that reference Foundry globals so the import tree resolves
vi.mock('../constants.js', () => ({ MODULE_ID: 'warhammer-mcp-test' }));
const mockContext = {
  value: { method: 'applyTemplate', actorId: 'abc123', actorName: 'Test Giant' } as
    | { method?: string; actorId?: string; actorName?: string }
    | null,
};
vi.mock('../mcp-activity.js', () => ({
  isMcpActive: vi.fn().mockReturnValue(false),
  onMcpActivityDrained: vi.fn(),
  getMcpRequestContext: () => mockContext.value,
}));
const notifyWarn = vi.fn();
vi.mock('../notify.js', () => ({ notify: { warn: (...a: any[]) => notifyWarn(...a) } }));

import {
  pickItemDialogResult,
  pickValueDialogResult,
  createItemDialogWrapper,
  setDialogChoiceOverrides,
  clearDialogChoiceOverrides,
  recordAutoResolvePick,
  peekPendingPicks,
  correlateCreatedItem,
  consumeAutoResolveResults,
  buildAutoResolveNotice,
  flushAutoResolveNotices,
} from '../mcp-dialog-autoresolve.js';

beforeEach(() => {
  clearDialogChoiceOverrides();
  consumeAutoResolveResults(); // drain any picks/choices buffered by a prior test
  notifyWarn.mockClear();
});

// ── pickItemDialogResult ─────────────────────────────────────────────────────

describe('pickItemDialogResult', () => {
  const items = [
    { id: 'coastal', name: 'Coastal' },
    { id: 'deserts', name: 'Deserts' },
    { id: 'woodlands', name: 'Woodlands' },
  ];
  const noOverrides = new Map<string, string>();

  it('returns the first N items for a numeric count', () => {
    // WHY: deterministic first-N ensures reproducible evals and acceptance tests
    expect(pickItemDialogResult(items, 1, noOverrides)).toEqual([items[0]]);
    expect(pickItemDialogResult(items, 2, noOverrides)).toEqual([items[0], items[1]]);
  });

  it('returns [] for count === "unlimited"', () => {
    // WHY: "unlimited" signals optional additions; picking none never corrupts the
    // actor — picking arbitrary items would add unintended qualities/traits
    expect(pickItemDialogResult(items, 'unlimited', noOverrides)).toEqual([]);
  });

  it('returns [] for an empty items list', () => {
    expect(pickItemDialogResult([], 1, noOverrides)).toEqual([]);
  });

  it('returns the override match when title and id both match', () => {
    // WHY: override channel lets deliberate builds request a specific specialisation
    // (e.g. Strider(Woodlands) for a woodland NPC) ahead of the random default
    const overrides = new Map([['Choose Terrain', 'woodlands']]);
    expect(pickItemDialogResult(items, 1, overrides, 'Choose Terrain')).toEqual([items[2]]);
  });

  it('falls back to first-N when override id does not match any item', () => {
    const overrides = new Map([['Choose Terrain', 'zzz-nonexistent']]);
    expect(pickItemDialogResult(items, 1, overrides, 'Choose Terrain')).toEqual([items[0]]);
  });
});

// ── pickValueDialogResult ────────────────────────────────────────────────────

describe('pickValueDialogResult', () => {
  const noOverrides = new Map<string, string>();

  it('returns defaultValue when provided', () => {
    // WHY: ValueDialog.defaultValue is the caller's explicit "already resolved" signal
    expect(pickValueDialogResult('lore_beast', {}, noOverrides)).toBe('lore_beast');
  });

  it('returns the first key of values when defaultValue is empty', () => {
    expect(pickValueDialogResult('', { lore_fire: 'Fire', lore_ice: 'Ice' }, noOverrides)).toBe('lore_fire');
  });

  it('returns "" when both defaultValue and values are empty', () => {
    expect(pickValueDialogResult('', {}, noOverrides)).toBe('');
  });

  it('returns override value when title matches', () => {
    // WHY: same override-first ordering as ItemDialog, consistent across dialog types
    const overrides = new Map([['Choose Lore', 'lore_shadow']]);
    expect(pickValueDialogResult('lore_fire', {}, overrides, 'Choose Lore')).toBe('lore_shadow');
  });
});

// ── createItemDialogWrapper gate ─────────────────────────────────────────────

describe('createItemDialogWrapper gate', () => {
  const items = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }];

  it('delegates to original and does NOT auto-resolve when activeCheck returns false', async () => {
    // WHY: when isMcpActive()=false no MCP request is in flight; the GM's manual
    // spec-choice dialogs must render normally — intercepting them would be a regression
    const original = vi.fn().mockResolvedValue(['original-result']);
    const wrapper = createItemDialogWrapper(original, () => false);
    const result = await wrapper(items, 1, {});
    expect(original).toHaveBeenCalledOnce();
    expect(result).toEqual(['original-result']);
  });

  it('auto-resolves and does NOT call original when activeCheck returns true', async () => {
    // WHY: active MCP request → the wrapper must return immediately without rendering
    // a blocking dialog that would hang the headless call indefinitely
    const original = vi.fn();
    const wrapper = createItemDialogWrapper(original, () => true);
    const result = await wrapper(items, 1, {});
    expect(original).not.toHaveBeenCalled();
    expect(result).toEqual([items[0]]);
  });

  it('applies module-level overrides set by setDialogChoiceOverrides', async () => {
    // WHY: override channel must be visible to the wrapper so deliberate builds can
    // pass a specific terrain/lore without re-wiring the wrapper factory
    setDialogChoiceOverrides({ 'Choose Terrain': 'b' });
    const original = vi.fn();
    const wrapper = createItemDialogWrapper(original, () => true);
    const result = await wrapper(items, 1, { title: 'Choose Terrain' });
    expect(result).toEqual([items[1]]);
  });

  it('reverts to first-N after clearDialogChoiceOverrides', async () => {
    setDialogChoiceOverrides({ 'Choose Terrain': 'b' });
    clearDialogChoiceOverrides();
    const original = vi.fn();
    const wrapper = createItemDialogWrapper(original, () => true);
    const result = await wrapper(items, 1, { title: 'Choose Terrain' });
    expect(result).toEqual([items[0]]);
  });
});

// ── GM-visibility: pick → created-item correlation ───────────────────────────

describe('correlateCreatedItem', () => {
  it('captures a spec item (type/base/choice/actor) whose name contains a pending pick', () => {
    // WHY: the dialog wrapper only sees the choice; the createItem hook supplies
    // WHAT was modified (the talent) + the actor — this is the join
    recordAutoResolvePick('Coastal');
    const ok = correlateCreatedItem({
      type: 'talent',
      name: 'Strider (Coastal)',
      parent: { uuid: 'Actor.giant1', name: 'River Troll' },
    });
    expect(ok).toBe(true);
    const { resolved } = consumeAutoResolveResults();
    expect(resolved).toEqual([
      { actorUuid: 'Actor.giant1', actorName: 'River Troll', type: 'talent', base: 'Strider', choice: 'Coastal' },
    ]);
  });

  it('ignores items whose type is not talent/skill/trait', () => {
    recordAutoResolvePick('Coastal');
    expect(correlateCreatedItem({ type: 'trapping', name: 'Boots (Coastal)' })).toBe(false);
    expect(consumeAutoResolveResults().resolved).toEqual([]);
  });

  it('ignores items not matching any pending pick (pre-resolved build-skill siblings)', () => {
    recordAutoResolvePick('Coastal');
    // a deliberately pre-resolved skill, never auto-picked → no matching pick
    expect(correlateCreatedItem({ type: 'skill', name: 'Lore (Beasts)' })).toBe(false);
    // the unmatched pick survives for the leftover fallback
    expect(peekPendingPicks()).toEqual(['Coastal']);
  });

  it('consumes the matched pick so it is not reused', () => {
    recordAutoResolvePick('Coastal');
    correlateCreatedItem({ type: 'talent', name: 'Strider (Coastal)', parent: { uuid: 'Actor.x', name: 'X' } });
    expect(peekPendingPicks()).toEqual([]);
  });
});

// ── GM-visibility: notice body shape ─────────────────────────────────────────

describe('buildAutoResolveNotice', () => {
  it('returns null when nothing was auto-resolved', () => {
    expect(buildAutoResolveNotice([], [])).toBeNull();
  });

  it('formats "[type] base → choice" with a clickable @UUID link in chat HTML', () => {
    const resolved = [
      { actorUuid: 'Actor.giant1', actorName: 'River Troll', type: 'talent', base: 'Strider', choice: 'Coastal' },
    ];
    const notice = buildAutoResolveNotice(resolved, [], 'applyTemplate')!;
    // plain (toast/console): readable name, no link markup
    expect(notice.plain).toContain('[talent] Strider → Coastal');
    expect(notice.plain).toContain('"River Troll"');
    expect(notice.plain).toContain('via applyTemplate');
    expect(notice.plain).not.toContain('@UUID');
    // chat: clickable actor link + emphasised base/choice
    expect(notice.chatHtml).toContain('@UUID[Actor.giant1]');
    expect(notice.chatHtml).toContain('<strong>Strider</strong>');
    expect(notice.chatHtml).toContain('<strong>Coastal</strong>');
  });

  it('aggregates several choices and pluralises the head', () => {
    const resolved = [
      { actorUuid: 'Actor.g', actorName: 'Giant', type: 'talent', base: 'Strider', choice: 'Coastal' },
      { actorUuid: 'Actor.g', actorName: 'Giant', type: 'trait', base: 'Size', choice: 'Minimal' },
    ];
    const notice = buildAutoResolveNotice(resolved, [], 'applyTemplate')!;
    expect(notice.plain).toContain('Auto-resolved 2 dialog choices');
    expect(notice.plain).toContain('[talent] Strider → Coastal');
    expect(notice.plain).toContain('[trait] Size → Minimal');
  });

  it('falls back to a raw pick line for dialogs that did not rename an item', () => {
    // WHY: e.g. "Choose Lores to Add" adds spell items, renames nothing — the
    // pick must still surface so the GM is not left unaware
    const notice = buildAutoResolveNotice([], ['Lore of Fire'], 'addItemFromCompendium')!;
    expect(notice.plain).toContain('auto-picked "Lore of Fire"');
    expect(notice.plain).toContain('Auto-resolved 1 dialog choice ');
  });

  it('uses a generic actor phrase when no actor is known', () => {
    const notice = buildAutoResolveNotice([], ['Something'])!;
    expect(notice.plain).toContain('on an actor');
    expect(notice.chatHtml).toContain('on an actor');
  });
});

// ── GM-visibility: end-to-end record → correlate → flush ─────────────────────

describe('auto-resolve flush (wrapper → createItem → notice)', () => {
  const terrains = [{ id: 'coastal', name: 'Coastal' }, { id: 'deserts', name: 'Deserts' }];

  it('the wrapper records the pick; correlation + flush name the talent + actor on ONE warning', async () => {
    // mirrors the live apply-template Scout flow: net picks the terrain, the
    // renamed talent + its actor are correlated, one GM notice is emitted
    const wrapper = createItemDialogWrapper(vi.fn(), () => true);
    await wrapper(terrains, 1, {}); // Strider's untitled terrain dialog
    expect(peekPendingPicks()).toEqual(['Coastal']);

    correlateCreatedItem({
      type: 'talent',
      name: 'Strider (Coastal)',
      parent: { uuid: 'Actor.scout1', name: 'Scout NPC' },
    });

    flushAutoResolveNotices();
    expect(notifyWarn).toHaveBeenCalledOnce();
    const [message, opts] = notifyWarn.mock.calls[0];
    expect(message).toContain('[talent] Strider → Coastal');
    expect(message).toContain('"Scout NPC"');
    expect(message).toContain('via applyTemplate'); // method from mocked context
    expect(opts).toMatchObject({ sticky: true, chat: true });
    expect(opts.chatHtml).toContain('@UUID[Actor.scout1]');
    // buffers cleared after flush
    expect(consumeAutoResolveResults()).toEqual({ resolved: [], leftover: [] });
  });

  it('records nothing when the wrapper delegates (manual play, activeCheck false)', async () => {
    const wrapper = createItemDialogWrapper(vi.fn().mockResolvedValue(['x']), () => false);
    await wrapper(terrains, 1, {});
    expect(peekPendingPicks()).toEqual([]);
  });

  it('flush is a no-op when nothing was auto-resolved', () => {
    flushAutoResolveNotices();
    expect(notifyWarn).not.toHaveBeenCalled();
  });
});
