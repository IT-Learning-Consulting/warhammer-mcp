import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wrappedWrite, transactionManager } from '../transaction-manager.js';
import { permissionManager } from '../permissions.js';
import { QueryHandlers } from '../queries.js';

describe('wrappedWrite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws before fn runs when permission is denied', async () => {
    vi.spyOn(permissionManager, 'checkWritePermission').mockReturnValue({
      allowed: false,
      reason: 'test-denied',
    });
    const startSpy = vi.spyOn(transactionManager, 'startTransaction');
    let called = false;
    await expect(
      wrappedWrite('testOp', async () => {
        called = true;
        return 1;
      })
    ).rejects.toThrow('test-denied');
    expect(called).toBe(false);
    expect(startSpy).not.toHaveBeenCalled();
  });

  it('commits and returns result when fn resolves', async () => {
    vi.spyOn(permissionManager, 'checkWritePermission').mockReturnValue({ allowed: true });
    const startSpy = vi.spyOn(transactionManager, 'startTransaction').mockReturnValue('tx-1');
    const commitSpy = vi.spyOn(transactionManager, 'commitTransaction').mockImplementation(() => {});
    const rollbackSpy = vi.spyOn(transactionManager, 'rollbackTransaction');

    const result = await wrappedWrite('testOp', async () => 42);

    expect(result).toBe(42);
    expect(startSpy).toHaveBeenCalledWith('testOp');
    expect(commitSpy).toHaveBeenCalledWith('tx-1');
    expect(rollbackSpy).not.toHaveBeenCalled();
  });

  it('rolls back and rethrows when fn throws', async () => {
    vi.spyOn(permissionManager, 'checkWritePermission').mockReturnValue({ allowed: true });
    vi.spyOn(transactionManager, 'startTransaction').mockReturnValue('tx-2');
    const commitSpy = vi.spyOn(transactionManager, 'commitTransaction');
    const rollbackSpy = vi
      .spyOn(transactionManager, 'rollbackTransaction')
      .mockResolvedValue({ success: true, errors: [] });

    await expect(
      wrappedWrite('testOp', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(rollbackSpy).toHaveBeenCalledWith('tx-2');
    expect(commitSpy).not.toHaveBeenCalled();
  });
});

// Phase 4b — per-handler wrappedWrite engagement for 7 write handlers.
// Reads (getCombat, listCombatants, listConditions, listActiveEffects) skip.

describe('Phase 4b — wrappedWrite engagement per handler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    (globalThis as any).game = {
      ...(globalThis as any).game,
      system: { id: 'wfrp4e' },
      user: { isGM: true, id: 'gm', name: 'GM' },
      tables: new Map(),
      actors: new Map(),
    };
    vi.spyOn(permissionManager, 'checkWritePermission').mockReturnValue({ allowed: true });
    vi.spyOn(transactionManager, 'commitTransaction').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeHandlers(): QueryHandlers {
    const qh = new QueryHandlers();
    (qh.dataAccess as any).validateFoundryState = () => {};
    return qh;
  }

  const writeCases: Array<[string, string, any, string]> = [
    ['handleAdvanceCombat', 'advanceCombat', { action: 'next' }, 'advanceCombat'],
    ['handleAddCombatants', 'addCombatants', { actorIds: ['a1'] }, 'addCombatants'],
    ['handleRemoveCombatants', 'removeCombatants', { combatantIds: ['c1'] }, 'removeCombatants'],
    ['handleEndCombat', 'endCombat', {}, 'endCombat'],
    ['handleApplyDamage', 'applyDamage', { actorId: 'a1', amount: 0 }, 'applyDamage'],
    ['handleApplyCondition', 'applyCondition', { actorId: 'a1', conditionKey: 'prone' }, 'applyCondition'],
    ['handleRemoveCondition', 'removeCondition', { actorId: 'a1', conditionKey: 'prone' }, 'removeCondition'],
  ];

  for (const [method, daMethod, input, expectedOp] of writeCases) {
    it(`${method} engages wrappedWrite (startTransaction called with "${expectedOp}")`, async () => {
      const qh = makeHandlers();
      (qh.dataAccess as any)[daMethod] = async () => ({ ok: true });
      const startSpy = vi.spyOn(transactionManager, 'startTransaction').mockReturnValue('tx');
      await (qh as any)[method](input);
      expect(startSpy).toHaveBeenCalledWith(expectedOp);
    });
  }
});
