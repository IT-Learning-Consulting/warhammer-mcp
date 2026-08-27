// Phase 5 (B.9) — modify-item-qualities schema + tool-dispatch tests.
// Carved out of the broken create-item.ts; supports the unified `destination`
// discriminator so callers can target actor-embedded or world-scope items.

import { describe, it, expect, vi } from 'vitest';
import { ModifyItemQualitiesV2Input } from '@foundry-mcp/shared';
import { ModifyItemQualitiesTool } from '../tools/modify-item-qualities.js';

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
      // BUG-869: this.query() returns the ALREADY-UNWRAPPED payload (BaseTool.query() contract) —
      // { itemName, owner, outcome }, matching ItemService.modifyItemQualities' single success
      // path (services/item.ts:693, buildOutcomeResponse('applied', { itemName, owner })).
      return {
        itemName: args.itemName ?? 'unknown-item',
        owner: 'Hans',
        outcome: 'applied',
      };
    }),
  };
  return {
    tool: new ModifyItemQualitiesTool({ foundryClient, logger: makeLogger() }),
    calls,
  };
}

describe('modify-item-qualities — schema', () => {
  it('accepts actor destination + add quality', () => {
    expect(() =>
      ModifyItemQualitiesV2Input.parse({
        destination: { type: 'actor', actorName: 'Hans' },
        itemName: 'Longsword',
        addQualities: [{ name: 'damaging' }],
      })
    ).not.toThrow();
  });

  it('accepts world destination + remove flaw', () => {
    expect(() =>
      ModifyItemQualitiesV2Input.parse({
        destination: { type: 'world' },
        itemId: 'item-abc',
        removeFlaws: ['dangerous'],
      })
    ).not.toThrow();
  });

  it('accepts combined add + remove round-trip', () => {
    const parsed = ModifyItemQualitiesV2Input.parse({
      destination: { type: 'actor', actorName: 'Maria' },
      itemName: 'Plate',
      addQualities: [{ name: 'impenetrable' }],
      removeQualities: ['heavy'],
      addFlaws: [{ name: 'noisy' }],
      removeFlaws: ['weakpoints'],
    });
    expect(parsed.addQualities).toHaveLength(1);
    expect(parsed.removeQualities).toEqual(['heavy']);
    expect(parsed.addFlaws).toHaveLength(1);
    expect(parsed.removeFlaws).toEqual(['weakpoints']);
  });

  it('rejects payload with no itemName AND no itemId', () => {
    expect(() =>
      ModifyItemQualitiesV2Input.parse({
        destination: { type: 'world' },
        addQualities: [{ name: 'accurate' }],
      })
    ).toThrow(/itemName or itemId/);
  });

  it('defaults empty arrays for add/remove when omitted', () => {
    const parsed = ModifyItemQualitiesV2Input.parse({
      destination: { type: 'actor', actorName: 'X' },
      itemName: 'Sword',
    });
    expect(parsed.addQualities).toEqual([]);
    expect(parsed.removeFlaws).toEqual([]);
  });

  it('publishes the item selector and nested quality/flaw requirements (BUG-661)', () => {
    const { tool } = makeTool();
    const schema: any = tool.getToolDefinitions()[0].inputSchema;
    expect(schema.allOf[0].anyOf).toEqual([
      {
        properties: { itemName: { type: 'string' } },
        required: ['itemName'],
      },
      {
        properties: { itemId: { type: 'string' } },
        required: ['itemId'],
      },
    ]);
    expect(schema.properties.addQualities.items.required).toEqual(['name']);
    expect(schema.properties.addFlaws.items.required).toEqual(['name']);
  });
});

describe('modify-item-qualities — tool dispatch', () => {
  it('passes parsed input to warhammer-mcp.modifyItemQualities', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      destination: { type: 'actor', actorName: 'Hans' },
      itemName: 'Longsword',
      addQualities: [{ name: 'damaging' }],
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.modifyItemQualities');
    expect(calls[0].args.destination).toEqual({ type: 'actor', actorName: 'Hans' });
    expect(calls[0].args.itemName).toBe('Longsword');
    expect(calls[0].args.addQualities).toEqual([{ name: 'damaging' }]);
  });
});

// BUG-869 — structuredContent + outputSchema envelope (D5: additive; the existing text summary
// survives byte-unchanged, structuredContent is new).
describe('modify-item-qualities — output envelope (BUG-869)', () => {
  it('declares an outputSchema whose outcome enum is exactly the 5-value success-semantics set', () => {
    const { tool } = makeTool();
    const def: any = tool.getToolDefinitions()[0];
    expect(def.outputSchema).toBeTruthy();
    const outcomeEnum = def.outputSchema.properties?.outcome?.enum;
    expect(outcomeEnum).toEqual(['applied', 'alreadyApplied', 'noop', 'partial', 'failed']);
  });

  it('returns a content+structuredContent envelope, text summary byte-identical to the pre-BUG-869 shape', async () => {
    const { tool } = makeTool();
    const result: any = await tool.handle({
      destination: { type: 'actor', actorName: 'Hans' },
      itemName: 'Longsword',
      addQualities: [{ name: 'damaging' }],
    });
    // CCR-7 additive-envelope proof — the human-readable text callers already parse is unchanged.
    expect(result.content).toEqual([{ type: 'text', text: 'Modified **Longsword**.\nAdded qualities: damaging' }]);
    expect(result.structuredContent).toEqual({ itemName: 'Longsword', owner: 'Hans', outcome: 'applied' });
  });
});
