// Phase 5 follow-up A — update-item + delete-item destination + itemName extensions.
// Confirms legacy callers (manage-character + 3 skill test suites) continue to
// parse + dispatch correctly, and that the new destination/world paths work.

import { describe, it, expect, vi } from 'vitest';
import { UpdateItemInput, DeleteItemInput } from '@foundry-mcp/shared';
import { UpdateItemTool } from '../tools/update-item.js';
import { DeleteItemTool } from '../tools/delete-item.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeUpdateTool() {
  const calls: any[] = [];
  const foundryClient: any = {
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return { success: true, data: { itemId: args?.itemId ?? 'id', itemName: 'x' } };
    }),
  };
  const tool = new UpdateItemTool({ foundryClient, logger: makeLogger() });
  return { tool, calls };
}

function makeDeleteTool() {
  const calls: any[] = [];
  const foundryClient: any = {
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return { success: true, data: { itemId: args?.itemId ?? 'id' } };
    }),
  };
  const tool = new DeleteItemTool({ foundryClient, logger: makeLogger() });
  return { tool, calls };
}

describe('UpdateItemInput — schema', () => {
  it('accepts legacy {actorId, itemId, updateData}', () => {
    const r = UpdateItemInput.safeParse({
      actorId: 'A1',
      itemId: 'I1',
      updateData: { 'system.advances.value': 2 },
    });
    expect(r.success).toBe(true);
  });

  it('accepts new {destination:{type:"actor", actorName}, itemId, updateData}', () => {
    const r = UpdateItemInput.safeParse({
      destination: { type: 'actor', actorName: 'Test PC' },
      itemId: 'I1',
      updateData: { name: 'Renamed' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts new {destination:{type:"world"}, itemId, updateData}', () => {
    const r = UpdateItemInput.safeParse({
      destination: { type: 'world' },
      itemId: 'W1',
      updateData: { name: 'Renamed' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts new {destination:{type:"world"}, itemName, updateData}', () => {
    const r = UpdateItemInput.safeParse({
      destination: { type: 'world' },
      itemName: 'Fire Sword',
      updateData: { name: 'Flame Sword' },
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown top-level keys (strict)', () => {
    const r = UpdateItemInput.safeParse({
      actorId: 'A1',
      itemId: 'I1',
      updateData: {},
      bogus: true,
    });
    expect(r.success).toBe(false);
  });
});

describe('DeleteItemInput — schema', () => {
  it('accepts legacy {actorId, itemId}', () => {
    const r = DeleteItemInput.safeParse({ actorId: 'A1', itemId: 'I1' });
    expect(r.success).toBe(true);
  });

  it('accepts new {destination:{type:"actor", actorName}, itemName}', () => {
    const r = DeleteItemInput.safeParse({
      destination: { type: 'actor', actorName: 'Test PC' },
      itemName: 'Old Cloak',
    });
    expect(r.success).toBe(true);
  });

  it('accepts new {destination:{type:"world"}, itemId}', () => {
    const r = DeleteItemInput.safeParse({
      destination: { type: 'world' },
      itemId: 'W1',
    });
    expect(r.success).toBe(true);
  });

  it('accepts new {destination:{type:"world"}, itemName}', () => {
    const r = DeleteItemInput.safeParse({
      destination: { type: 'world' },
      itemName: 'Broken Shield',
    });
    expect(r.success).toBe(true);
  });
});

describe('UpdateItemTool — dispatch call-shape', () => {
  it('passes legacy args through to warhammer-mcp.updateItem', async () => {
    const { tool, calls } = makeUpdateTool();
    await tool.handle({ actorId: 'A1', itemId: 'I1', updateData: { foo: 'bar' } });
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.updateItem');
    expect(calls[0].args.actorId).toBe('A1');
    expect(calls[0].args.itemId).toBe('I1');
  });

  it('passes destination + itemName through to warhammer-mcp.updateItem', async () => {
    const { tool, calls } = makeUpdateTool();
    await tool.handle({
      destination: { type: 'world' },
      itemName: 'Fire Sword',
      updateData: { name: 'Flame Sword' },
    });
    expect(calls[0].args.destination).toEqual({ type: 'world' });
    expect(calls[0].args.itemName).toBe('Fire Sword');
  });
});

describe('DeleteItemTool — dispatch call-shape', () => {
  it('passes legacy args through to warhammer-mcp.deleteItem', async () => {
    const { tool, calls } = makeDeleteTool();
    await tool.handle({ actorId: 'A1', itemId: 'I1' });
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.deleteItem');
    expect(calls[0].args).toEqual({ actorId: 'A1', itemId: 'I1' });
  });

  it('passes destination + itemName through to warhammer-mcp.deleteItem', async () => {
    const { tool, calls } = makeDeleteTool();
    await tool.handle({
      destination: { type: 'actor', actorName: 'Test PC' },
      itemName: 'Old Cloak',
    });
    expect(calls[0].args.destination).toEqual({ type: 'actor', actorName: 'Test PC' });
    expect(calls[0].args.itemName).toBe('Old Cloak');
  });
});
