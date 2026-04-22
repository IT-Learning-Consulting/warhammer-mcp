// Phase 5 (B.9) — trade-item schema + tool-dispatch tests (server-side).
// Transaction semantics / rollback / encumbrance-recompute are exercised on the
// warhammer-mcp side (see warhammer-mcp/src/__tests__/trade-item.test.ts).

import { describe, it, expect, vi } from 'vitest';
import { TradeItemInput } from '@foundry-mcp/shared';
import { TradeItemTool } from '../tools/trade-item.js';

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

function makeTool() {
  const calls: any[] = [];
  const foundryClient: any = {
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return {
        success: true,
        data: {
          fromActorId: args.fromActorId,
          toActorId: args.toActorId,
          itemId: 'new-item-id',
          itemName: 'Longsword',
          quantities: { from: 0, to: 1 },
        },
      };
    }),
  };
  return { tool: new TradeItemTool({ foundryClient, logger: makeLogger() }), calls };
}

describe('trade-item — schema', () => {
  it('accepts happy-path full-transfer payload', () => {
    expect(() =>
      TradeItemInput.parse({ fromActorId: 'a', toActorId: 'b', itemId: 'i' })
    ).not.toThrow();
  });

  it('accepts partial-quantity transfer', () => {
    const parsed = TradeItemInput.parse({
      fromActorId: 'a',
      toActorId: 'b',
      itemId: 'i',
      quantity: 5,
    });
    expect(parsed.quantity).toBe(5);
  });

  it('rejects negative quantity', () => {
    expect(() =>
      TradeItemInput.parse({ fromActorId: 'a', toActorId: 'b', itemId: 'i', quantity: -1 })
    ).toThrow();
  });

  it('rejects zero quantity', () => {
    expect(() =>
      TradeItemInput.parse({ fromActorId: 'a', toActorId: 'b', itemId: 'i', quantity: 0 })
    ).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => TradeItemInput.parse({ fromActorId: 'a', toActorId: 'b' })).toThrow();
    expect(() => TradeItemInput.parse({ fromActorId: 'a', itemId: 'i' })).toThrow();
  });

  it('rejects unknown extra keys (strict)', () => {
    expect(() =>
      TradeItemInput.parse({
        fromActorId: 'a',
        toActorId: 'b',
        itemId: 'i',
        bogus: true,
      })
    ).toThrow();
  });
});

describe('trade-item — tool dispatch', () => {
  it('passes parsed values through to warhammer-mcp.tradeItem', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      fromActorId: 'actor-a',
      toActorId: 'actor-b',
      itemId: 'item-x',
      quantity: 3,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.tradeItem');
    expect(calls[0].args).toEqual({
      fromActorId: 'actor-a',
      toActorId: 'actor-b',
      itemId: 'item-x',
      quantity: 3,
    });
  });

  it('returns human-readable success string with quantity breakdown', async () => {
    const { tool } = makeTool();
    const out = await tool.handle({
      fromActorId: 'actor-a',
      toActorId: 'actor-b',
      itemId: 'item-x',
    });
    expect(out).toContain('Longsword');
    expect(out).toContain('actor-a');
    expect(out).toContain('actor-b');
  });
});
