// BUG-498 rider (Wave 2, D5) — region behavior `events` names are now enum-enforced.
// Live-verified pre-fix behavior: a bad event name ("tokenMove") persisted verbatim as
// permanently-inert dead data (Foundry's executeMacro/executeScript validators only
// warn). Post-fix the Zod boundary rejects unknown names; the real v13 names
// (tokenMoveIn/Out/Within, tokenAnimateIn/Out, …) still pass. displayScrollingText
// keeps its .max(0) constraint (BUG-078 — pinned here so this rider can't regress it).
import { describe, expect, it } from 'vitest';
import { RegionCreateBehaviorInput } from '@foundry-mcp/shared';

const BASE = {
  action: 'createBehavior' as const,
  sceneId: 'sceneAAAAAAAAAA1',
  regionId: 'regionAAAAAAAAA1',
};

describe('BUG-498: region behavior event-name enum', () => {
  it('rejects the doc-taught phantom names tokenMove / tokenAnimate', () => {
    for (const bad of ['tokenMove', 'tokenAnimate']) {
      const r = RegionCreateBehaviorInput.safeParse({
        ...BASE,
        behavior: { type: 'executeMacro', system: { events: [bad], uuid: null } },
      });
      expect(r.success).toBe(false);
    }
  });

  it('accepts the real v13 event names on executeMacro and executeScript', () => {
    const macro = RegionCreateBehaviorInput.safeParse({
      ...BASE,
      behavior: { type: 'executeMacro', system: { events: ['tokenMoveIn', 'tokenMoveOut', 'tokenMoveWithin'], uuid: null } },
    });
    expect(macro.success).toBe(true);
    const script = RegionCreateBehaviorInput.safeParse({
      ...BASE,
      behavior: { type: 'executeScript', system: { events: ['tokenAnimateIn', 'tokenAnimateOut'], source: 'console.log(1)' } },
    });
    expect(script.success).toBe(true);
  });

  it('displayScrollingText events stay empty-only (BUG-078 not regressed)', () => {
    const nonEmpty = RegionCreateBehaviorInput.safeParse({
      ...BASE,
      behavior: { type: 'displayScrollingText', system: { events: ['tokenEnter'], text: 'Hi', color: '#ff0000' } },
    });
    expect(nonEmpty.success).toBe(false);
    const empty = RegionCreateBehaviorInput.safeParse({
      ...BASE,
      behavior: { type: 'displayScrollingText', system: { events: [], text: 'Hi', color: '#ff0000' } },
    });
    expect(empty.success).toBe(true);
  });
});
