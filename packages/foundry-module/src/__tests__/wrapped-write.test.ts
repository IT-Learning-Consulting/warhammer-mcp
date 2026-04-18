import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wrappedWrite, transactionManager } from '../transaction-manager.js';
import { permissionManager } from '../permissions.js';

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
