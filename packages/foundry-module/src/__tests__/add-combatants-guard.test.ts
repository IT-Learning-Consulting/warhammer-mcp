import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryDataAccess } from '../data-access.js';

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).ui = {
    notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

describe('addCombatants guard (BUG-084)', () => {
  it('rejects tokenless actors instead of creating null-token combatants', async () => {
    const da = makeDA();
    const createEmbeddedDocuments = vi.fn();
    const combat = {
      id: 'combat-1',
      scene: { id: 'scene-1', name: 'Bridge Ambush', tokens: [] },
      createEmbeddedDocuments,
    };
    (da as any).resolveCombat = () => combat;
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: new Map([['actor-1', { id: 'actor-1', name: 'Tokenless Recruit' }]]),
      scenes: { active: combat.scene, get: () => combat.scene },
    };

    await expect(
      da.addCombatants({ actorIds: ['actor-1'] })
    ).rejects.toThrow(/ADD_COMBATANTS_TOKEN_REQUIRED/);
    expect(createEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('uses the scene token id when present', async () => {
    const da = makeDA();
    const createEmbeddedDocuments = vi.fn(async (_type: string, creates: any[]) =>
      creates.map((c, idx) => ({ id: `co-${idx + 1}`, ...c })),
    );
    const combat = {
      id: 'combat-1',
      scene: {
        id: 'scene-1',
        name: 'Bridge Ambush',
        tokens: [{ id: 'token-1', actorId: 'actor-1', hidden: true }],
      },
      createEmbeddedDocuments,
    };
    (da as any).resolveCombat = () => combat;
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: new Map([['actor-1', { id: 'actor-1', name: 'Placed Recruit' }]]),
      scenes: { active: combat.scene, get: () => combat.scene },
    };

    const result = await da.addCombatants({ actorIds: ['actor-1'] });

    expect(createEmbeddedDocuments).toHaveBeenCalledWith('Combatant', [
      {
        actorId: 'actor-1',
        tokenId: 'token-1',
        sceneId: 'scene-1',
        hidden: true,
      },
    ]);
    expect(result.added).toEqual(['co-1']);
  });
});

describe('removeCombatants — BUG-215 return actual IDs', () => {
  // BUG-215 re-fix 2026-05-24: Foundry's deleteEmbeddedDocuments THROWS on any id not in the
  // EmbeddedCollection — it does NOT silently skip (the original fix + eval + this test's prior
  // mock all wrongly assumed silent-skip; /agent-validate live eval surfaced the throw). The
  // handler must pre-filter requested ids against combat.combatants before deleting. These mocks
  // model the real throw so the test guards the regression: removing the pre-filter makes the
  // mock throw and the test fails.
  function makeCombat(validIds: string[]) {
    const valid = new Set(validIds);
    const combatants = { get: (id: string) => (valid.has(id) ? { id } : undefined) };
    const deleteEmbeddedDocuments = vi.fn(async (_type: string, ids: string[]) => {
      for (const id of ids) {
        if (!valid.has(id)) {
          throw new Error(
            `undefined id [${id}] does not exist in the EmbeddedCollection collection`,
          );
        }
      }
      return ids.map((id) => ({ id }));
    });
    return { id: 'c1', combatants, deleteEmbeddedDocuments };
  }

  it('returns only actually-deleted IDs and pre-filters bogus ids before delete (mixed valid/bogus)', async () => {
    const da = makeDA();
    const combat = makeCombat(['co-valid-1']);
    (da as any).resolveCombat = () => combat;

    const result = await da.removeCombatants({
      combatId: 'c1',
      combatantIds: ['co-valid-1', 'co-bogus-99'],
    });

    // Pre-filter strips the bogus id BEFORE the delete call (else Foundry throws wholesale).
    expect(combat.deleteEmbeddedDocuments).toHaveBeenCalledWith('Combatant', ['co-valid-1']);
    // Only the real combatant appears in removed; bogus ID is absent.
    expect(result.removed).toEqual(['co-valid-1']);
    expect(result.removed).not.toContain('co-bogus-99');
  });

  it('removes nothing and skips the delete call entirely when all ids are bogus', async () => {
    const da = makeDA();
    const combat = makeCombat([]);
    (da as any).resolveCombat = () => combat;

    const result = await da.removeCombatants({
      combatId: 'c1',
      combatantIds: ['co-bogus-1', 'co-bogus-2'],
    });

    expect(combat.deleteEmbeddedDocuments).not.toHaveBeenCalled();
    expect(result.removed).toEqual([]);
  });
});
