// Phase 5 follow-up B — add/update/delete-active-effect schema + tool-dispatch tests.

import { describe, it, expect, vi } from 'vitest';
import {
  AddActiveEffectInput,
  UpdateActiveEffectInput,
  DeleteActiveEffectInput,
  ItemTarget,
} from '@foundry-mcp/shared';
import { AddActiveEffectTool } from '../tools/add-active-effect.js';
import { UpdateActiveEffectTool } from '../tools/update-active-effect.js';
import { DeleteActiveEffectTool } from '../tools/delete-active-effect.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool<T extends new (opts: any) => any>(Tool: T) {
  const calls: any[] = [];
  const foundryClient: any = {
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return { success: true, data: { ok: true } };
    }),
  };
  const tool: any = new Tool({ foundryClient, logger: makeLogger() });
  return { tool, calls };
}

const baseEffect = { name: 'Burning', trigger: 'applyDamage', script: '' } as const;
const actorTarget = { scope: 'actor', actorName: 'Test PC', itemName: 'Fire Sword' } as const;
const worldTarget = { scope: 'world', itemName: 'Fire Sword' } as const;

describe('ItemTarget schema', () => {
  it('accepts actor scope with actorId + itemId', () => {
    const r = ItemTarget.safeParse({ scope: 'actor', actorId: 'A1', itemId: 'I1' });
    expect(r.success).toBe(true);
  });
  it('accepts actor scope with actorName + itemName', () => {
    const r = ItemTarget.safeParse({ scope: 'actor', actorName: 'PC', itemName: 'Sword' });
    expect(r.success).toBe(true);
  });
  it('accepts world scope with itemId', () => {
    const r = ItemTarget.safeParse({ scope: 'world', itemId: 'W1' });
    expect(r.success).toBe(true);
  });
  it('accepts world scope with itemName', () => {
    const r = ItemTarget.safeParse({ scope: 'world', itemName: 'Fire Sword' });
    expect(r.success).toBe(true);
  });
  it('rejects empty / missing scope', () => {
    const r = ItemTarget.safeParse({});
    expect(r.success).toBe(false);
  });
  it('rejects unknown scope', () => {
    const r = ItemTarget.safeParse({ scope: 'compendium', itemId: 'X' });
    expect(r.success).toBe(false);
  });
  it('rejects unknown keys (strict)', () => {
    const r = ItemTarget.safeParse({ scope: 'world', itemId: 'W1', bogus: true });
    expect(r.success).toBe(false);
  });
});

describe('AddActiveEffectInput — schema', () => {
  it('accepts actor target + effect', () => {
    const r = AddActiveEffectInput.safeParse({ target: actorTarget, effect: baseEffect });
    expect(r.success).toBe(true);
  });
  it('accepts world target + effect', () => {
    const r = AddActiveEffectInput.safeParse({ target: worldTarget, effect: baseEffect });
    expect(r.success).toBe(true);
  });
  it('accepts returnFullPayload', () => {
    const r = AddActiveEffectInput.safeParse({
      target: worldTarget,
      effect: baseEffect,
      returnFullPayload: true,
    });
    expect(r.success).toBe(true);
  });
  it('rejects missing target', () => {
    const r = AddActiveEffectInput.safeParse({ effect: baseEffect });
    expect(r.success).toBe(false);
  });
  it('rejects missing effect', () => {
    const r = AddActiveEffectInput.safeParse({ target: actorTarget });
    expect(r.success).toBe(false);
  });
  it('rejects effect with empty name', () => {
    const r = AddActiveEffectInput.safeParse({
      target: actorTarget,
      effect: { name: '', trigger: 'manual', script: '' },
    });
    expect(r.success).toBe(false);
  });
  it('rejects effect with unknown trigger', () => {
    const r = AddActiveEffectInput.safeParse({
      target: actorTarget,
      effect: { name: 'x', trigger: 'notAHook', script: '' },
    });
    expect(r.success).toBe(false);
  });
});

describe('UpdateActiveEffectInput — schema', () => {
  it('accepts partial updates shape', () => {
    const r = UpdateActiveEffectInput.safeParse({
      target: actorTarget,
      effectId: 'E1',
      updates: { disabled: true },
    });
    expect(r.success).toBe(true);
  });
  it('accepts effectName instead of effectId', () => {
    const r = UpdateActiveEffectInput.safeParse({
      target: actorTarget,
      effectName: 'Burning',
      updates: { name: 'Smouldering' },
    });
    expect(r.success).toBe(true);
  });
  it('accepts empty updates object (handler rejects later)', () => {
    const r = UpdateActiveEffectInput.safeParse({
      target: actorTarget,
      effectId: 'E1',
      updates: {},
    });
    expect(r.success).toBe(true);
  });
  it('rejects missing updates', () => {
    const r = UpdateActiveEffectInput.safeParse({ target: actorTarget, effectId: 'E1' });
    expect(r.success).toBe(false);
  });
});

describe('DeleteActiveEffectInput — schema', () => {
  it('accepts effectId', () => {
    const r = DeleteActiveEffectInput.safeParse({ target: actorTarget, effectId: 'E1' });
    expect(r.success).toBe(true);
  });
  it('accepts effectName', () => {
    const r = DeleteActiveEffectInput.safeParse({ target: actorTarget, effectName: 'Burning' });
    expect(r.success).toBe(true);
  });
  it('accepts world scope', () => {
    const r = DeleteActiveEffectInput.safeParse({ target: worldTarget, effectId: 'E1' });
    expect(r.success).toBe(true);
  });
});

describe('AddActiveEffectTool — dispatch', () => {
  it('calls warhammer-mcp.addActiveEffect with parsed args', async () => {
    const { tool, calls } = makeTool(AddActiveEffectTool);
    await tool.handle({ target: actorTarget, effect: baseEffect });
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.addActiveEffect');
    expect(calls[0].args.target.scope).toBe('actor');
    expect(calls[0].args.effect.name).toBe('Burning');
  });
});

describe('UpdateActiveEffectTool — dispatch', () => {
  it('calls warhammer-mcp.updateActiveEffect with parsed args', async () => {
    const { tool, calls } = makeTool(UpdateActiveEffectTool);
    await tool.handle({ target: worldTarget, effectName: 'Burning', updates: { disabled: true } });
    expect(calls[0].key).toBe('warhammer-mcp.updateActiveEffect');
    expect(calls[0].args.effectName).toBe('Burning');
    expect(calls[0].args.updates).toEqual({ disabled: true });
  });

  it('throws when both effectId and effectName are missing', async () => {
    const { tool } = makeTool(UpdateActiveEffectTool);
    await expect(
      tool.handle({ target: worldTarget, updates: { disabled: true } })
    ).rejects.toThrow(/effectId or effectName/);
  });
});

describe('DeleteActiveEffectTool — dispatch', () => {
  it('calls warhammer-mcp.deleteActiveEffect by id', async () => {
    const { tool, calls } = makeTool(DeleteActiveEffectTool);
    await tool.handle({ target: worldTarget, effectId: 'E1' });
    expect(calls[0].key).toBe('warhammer-mcp.deleteActiveEffect');
    expect(calls[0].args.effectId).toBe('E1');
  });
  it('calls warhammer-mcp.deleteActiveEffect by name', async () => {
    const { tool, calls } = makeTool(DeleteActiveEffectTool);
    await tool.handle({ target: actorTarget, effectName: 'Burning' });
    expect(calls[0].args.effectName).toBe('Burning');
  });
  it('throws when both effectId and effectName are missing', async () => {
    const { tool } = makeTool(DeleteActiveEffectTool);
    await expect(tool.handle({ target: worldTarget })).rejects.toThrow(/effectId or effectName/);
  });
});
