import { beforeEach, describe, expect, it } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

describe('FoundryDataAccess.getWorldInfo — characterization', () => {
  beforeEach(() => {
    // Pin randomID to avoid non-determinism in any snapshot
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('returns full world info with users', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      world: { id: 'test-world', title: 'Adventures in the Warhammer World' },
      system: { id: 'wfrp4e', version: '6.6.2' },
      version: '13.341',
      users: [
        { id: 'gm-1', name: 'Game Master', active: true, isGM: true },
        { id: 'player-1', name: 'Alice', active: true, isGM: false },
        { id: 'player-2', name: 'Bob', active: false, isGM: false },
      ],
    };

    const da = makeDA();
    const result = await da.getWorldInfo();
    expect(result).toMatchSnapshot();
  });

  it('returns world info with empty users list', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      world: { id: 'empty-world', title: 'Empty World' },
      system: { id: 'wfrp4e', version: '6.6.2' },
      version: '13.341',
      users: [],
    };

    const da = makeDA();
    const result = await da.getWorldInfo();
    expect(result).toMatchSnapshot();
  });
});
