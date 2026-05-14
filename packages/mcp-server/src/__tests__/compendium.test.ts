// BUG-067 + WFRP-ization regression guard for list-creatures-by-criteria.
//
// foundry-client.ts:54-84 is the single envelope unwrap site — its line 83
// returns `envelope.data as T`. So mocks here return the POST-unwrap shape
// (the data-access return value directly: `{creatures, searchSummary}`),
// NOT the wrapped `{success, data:...}` envelope. Mocking the envelope wrapper
// re-encodes the original BUG-067 (first REVISE pass 2026-05-13 caught it).

import { describe, it, expect, vi } from 'vitest';
import { CompendiumTools } from '../tools/compendium.js';

function makeLogger(): any {
  const noop = () => undefined;
  return {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    child: () => makeLogger(),
  };
}

function makeTool(queryImpl: (key: string, args: any) => Promise<any>) {
  const calls: Array<{ key: string; args: any }> = [];
  const foundryClient: any = {
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return queryImpl(key, args);
    }),
  };
  return {
    tool: new CompendiumTools({ foundryClient, logger: makeLogger() }),
    calls,
  };
}

describe('list-creatures-by-criteria — post-unwrap success shape', () => {
  it('returns creatures array when query returns {creatures, searchSummary}', async () => {
    const fixture = [
      { id: 'a', name: 'Goblin', challengeRating: 31, size: 'sml', creatureType: 'Greenskin', hasSpells: false, hasSpecialAbilities: false },
      { id: 'b', name: 'Skeleton', challengeRating: 31, size: 'avg', creatureType: 'Undead', hasSpells: false, hasSpecialAbilities: false },
    ];
    const { tool } = makeTool(async () => ({
      creatures: fixture,
      searchSummary: { packsSearched: 1, topPacks: [], totalCreaturesFound: 2 },
    }));

    const result = await (tool as any).handleListCreaturesByCriteria({});

    expect(Array.isArray(result.creatures)).toBe(true);
    expect(result.creatures).toHaveLength(2);
    expect(result.totalCount).toBe(2);
    expect(result.searchSummary.packsSearched).toBe(1);
  });
});

describe('list-creatures-by-criteria — defensive empty/malformed shape', () => {
  it('returns creatures:[] when query returns object missing creatures field', async () => {
    const { tool } = makeTool(async () => ({
      searchSummary: { packsSearched: 0, topPacks: [], totalCreaturesFound: 0 },
    }));

    const result = await (tool as any).handleListCreaturesByCriteria({});

    expect(result.creatures).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('returns creatures:[] when query returns {creatures: []}', async () => {
    const { tool } = makeTool(async () => ({ creatures: [], searchSummary: {} }));

    const result = await (tool as any).handleListCreaturesByCriteria({});

    expect(result.creatures).toEqual([]);
    expect(result.totalCount).toBe(0);
  });
});

describe('list-creatures-by-criteria — renamed parameter round-trip', () => {
  it('accepts threatLevel + freeform creatureType + short-form size, passes them to the query', async () => {
    const { tool, calls } = makeTool(async () => ({ creatures: [], searchSummary: {} }));

    await (tool as any).handleListCreaturesByCriteria({
      threatLevel: { min: 20, max: 50 },
      creatureType: 'beastman',
      size: 'avg',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.listCreaturesByCriteria');
    expect(calls[0].args).toMatchObject({
      threatLevel: { min: 20, max: 50 },
      creatureType: 'beastman',
      size: 'avg',
    });
    expect(calls[0].args).not.toHaveProperty('challengeRating');
  });

  it('rejects long-form size aliases that no longer exist in the enum', async () => {
    const { tool } = makeTool(async () => ({ creatures: [], searchSummary: {} }));

    await expect(
      (tool as any).handleListCreaturesByCriteria({ size: 'average' })
    ).rejects.toThrow();
  });
});
