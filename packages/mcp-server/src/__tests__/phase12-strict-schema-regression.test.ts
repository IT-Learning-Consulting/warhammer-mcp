// Phase 12 R12.3 — regression guard: update-token / update-combatant ALREADY satisfy the field-allow-list
// requirement via their existing .strict() schemas, so Phase 12 added NO second runtime layer for them (only
// update-actor, the sole tool with a generic z.record patch, needed one). If a future edit loosens either
// schema off .strict(), these fail — that's the intent (Rule 9): the allow-list guarantee is the test subject.

import { describe, it, expect } from 'vitest';
import { CombatantUpdateInput, TokenUpdateInput } from '@foundry-mcp/shared';

describe('update-combatant already allow-lists writable fields (R12.3)', () => {
  it('accepts an allow-listed field (name) but REJECTS a non-listed field (initiative)', () => {
    expect(() =>
      CombatantUpdateInput.parse({ action: 'update-combatant', combatantId: 'cmbt000000000001', changes: { name: 'Brute' } }),
    ).not.toThrow();
    // `initiative` is deliberately routed to set/clear/reroll-initiative — the .strict() change set rejects it.
    expect(() =>
      CombatantUpdateInput.parse({ action: 'update-combatant', combatantId: 'cmbt000000000001', changes: { initiative: 17 } }),
    ).toThrow();
  });
});

describe('update-token already allow-lists writable fields (R12.3)', () => {
  it('accepts an allow-listed field (name) but REJECTS a non-listed field', () => {
    expect(() =>
      TokenUpdateInput.parse({ action: 'update', sceneId: 'scn0000000000001', tokenId: 'tkn0000000000001', changes: { name: 'Guard' } }),
    ).not.toThrow();
    expect(() =>
      TokenUpdateInput.parse({ action: 'update', sceneId: 'scn0000000000001', tokenId: 'tkn0000000000001', changes: { definitelyNotAField: true } }),
    ).toThrow();
  });
});
