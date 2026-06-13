// Phase 10 mcp_coverage_expansion — keybinding tool schema + behavior tests (CCR-13).
//
// Tests: action enum (6 values), missing required fields → throw, unknown key → throw (strict),
// reset-all confirm-literal guard, bad precedenceFilter enum, invalid discriminant → safeParse false,
// plus tool-behavior formatting + typed-error surfacing.

import { describe, it, expect, vi } from 'vitest';
import { KeybindingToolInput } from '@foundry-mcp/shared';
import { KeybindingTools } from '../tools/keybinding.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn;
    }),
  };
  return new KeybindingTools({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('KeybindingToolInput schema', () => {
  it('action enum contains exactly 6 values', () => {
    const actions = KeybindingToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(
      ['find-conflicts', 'get', 'list', 'reset-action', 'reset-all', 'set'].sort(),
    );
  });

  it('list parses with and without namespace', () => {
    expect(() => KeybindingToolInput.parse({ action: 'list' })).not.toThrow();
    expect(() => KeybindingToolInput.parse({ action: 'list', namespace: 'core' })).not.toThrow();
  });

  it('get requires namespace and keyAction', () => {
    expect(() => KeybindingToolInput.parse({ action: 'get' })).toThrow();
    expect(() => KeybindingToolInput.parse({ action: 'get', namespace: 'core' })).toThrow();
  });

  it('get parses with namespace + keyAction', () => {
    expect(() =>
      KeybindingToolInput.parse({ action: 'get', namespace: 'core', keyAction: 'panUp' }),
    ).not.toThrow();
  });

  it('set requires namespace, keyAction and bindings', () => {
    expect(() => KeybindingToolInput.parse({ action: 'set', namespace: 'core', keyAction: 'panUp' })).toThrow();
    expect(() => KeybindingToolInput.parse({ action: 'set', namespace: 'core', bindings: [] })).toThrow();
  });

  it('set parses with valid bindings', () => {
    expect(() =>
      KeybindingToolInput.parse({
        action: 'set',
        namespace: 'core',
        keyAction: 'panUp',
        bindings: [{ key: 'KeyW', modifiers: ['Control'] }],
      }),
    ).not.toThrow();
  });

  it('set binding requires a key', () => {
    expect(() =>
      KeybindingToolInput.parse({
        action: 'set',
        namespace: 'core',
        keyAction: 'panUp',
        bindings: [{ modifiers: ['Control'] }],
      }),
    ).toThrow();
  });

  it('reset-action requires namespace + keyAction', () => {
    expect(() => KeybindingToolInput.parse({ action: 'reset-action', namespace: 'core' })).toThrow();
    expect(() =>
      KeybindingToolInput.parse({ action: 'reset-action', namespace: 'core', keyAction: 'panUp' }),
    ).not.toThrow();
  });

  it('reset-all parses with dryRun, with confirm:true, and bare', () => {
    expect(() => KeybindingToolInput.parse({ action: 'reset-all' })).not.toThrow();
    expect(() => KeybindingToolInput.parse({ action: 'reset-all', dryRun: true })).not.toThrow();
    expect(() => KeybindingToolInput.parse({ action: 'reset-all', confirm: true })).not.toThrow();
  });

  it('reset-all rejects confirm:false (z.literal(true) guard)', () => {
    expect(() => KeybindingToolInput.parse({ action: 'reset-all', confirm: false })).toThrow();
  });

  it('find-conflicts parses bare and with a valid precedenceFilter', () => {
    expect(() => KeybindingToolInput.parse({ action: 'find-conflicts' })).not.toThrow();
    expect(() =>
      KeybindingToolInput.parse({ action: 'find-conflicts', precedenceFilter: 'PRIORITY' }),
    ).not.toThrow();
  });

  it('find-conflicts rejects a bad precedenceFilter', () => {
    expect(() =>
      KeybindingToolInput.parse({ action: 'find-conflicts', precedenceFilter: 'URGENT' }),
    ).toThrow();
  });

  it('invalid action discriminant → safeParse false', () => {
    const result = KeybindingToolInput.safeParse({ action: 'rebind', namespace: 'core' });
    expect(result.success).toBe(false);
  });

  it('unknown key → throw (strict mode)', () => {
    expect(() =>
      KeybindingToolInput.parse({ action: 'list', unknownKey: 'should-fail' }),
    ).toThrow();
  });

  it('missing action → throw', () => {
    expect(() => KeybindingToolInput.parse({})).toThrow();
    expect(() => KeybindingToolInput.parse({ namespace: 'core' })).toThrow();
  });
});

// ── Tool behavior tests ───────────────────────────────────────────────────────

describe('KeybindingTools.handleKeybinding', () => {
  it('exposes the keybinding tool definition with 6 actions', () => {
    const tool = makeTool();
    const def = tool.getToolDefinitions().find((d: any) => d.name === 'keybinding');
    expect(def).toBeDefined();
    expect((def as any).inputSchema.properties.action.enum.sort()).toEqual(
      ['find-conflicts', 'get', 'list', 'reset-action', 'reset-all', 'set'].sort(),
    );
  });

  it('description states the client-only limitation', () => {
    const tool = makeTool();
    const def = tool.getToolDefinitions().find((d: any) => d.name === 'keybinding') as any;
    expect(def.description.toLowerCase()).toContain('client');
  });

  it('list formats the action count', async () => {
    const tool = makeTool({
      actions: [
        { id: 'core.panUp', namespace: 'core', name: 'Pan Up', precedence: 1, restricted: false, editable: [], current: [{ key: 'ArrowUp', modifiers: [] }], humanized: ['ArrowUp'] },
      ],
      total: 1,
    });
    const result = await tool.handleKeybinding({ action: 'list' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('core.panUp');
  });

  it('get formats bound + default', async () => {
    const tool = makeTool({
      id: 'core.panUp', namespace: 'core', name: 'Pan Up', precedence: 1, restricted: false,
      editable: [{ key: 'ArrowUp', modifiers: [] }], current: [{ key: 'KeyW', modifiers: [] }], humanized: ['KeyW'],
    });
    const result = await tool.handleKeybinding({ action: 'get', namespace: 'core', keyAction: 'panUp' });
    expect(result.content[0].text).toContain('KeyW');
  });

  it('reset-all dryRun formats the preview count', async () => {
    const tool = makeTool({ dryRun: true, reset: false, count: 2, items: [{ id: 'core.panUp', name: 'Pan Up' }, { id: 'core.panDown', name: 'Pan Down' }] });
    const result = await tool.handleKeybinding({ action: 'reset-all', dryRun: true });
    expect(result.content[0].text).toContain('2');
    expect(result.content[0].text.toLowerCase()).toContain('confirm');
  });

  it('find-conflicts formats collisions', async () => {
    const tool = makeTool({ conflicts: [{ key: 'KeyW', modifiers: [], actions: [{ id: 'core.panUp', name: 'Pan Up', precedence: 1, restricted: false }, { id: 'mod.foo', name: 'Foo', precedence: 1, restricted: false }] }], total: 1 });
    const result = await tool.handleKeybinding({ action: 'find-conflicts' });
    expect(result.content[0].text).toContain('core.panUp');
  });

  it('returns isError on tool throw (typed token surfaced)', async () => {
    const tool = makeTool(null, 'KEYBINDING_ACTION_NOT_FOUND: no registered action "core.bogus"');
    const result = await tool.handleKeybinding({ action: 'get', namespace: 'core', keyAction: 'bogus' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('KEYBINDING_ACTION_NOT_FOUND');
  });

  it('returns isError on invalid input (schema reject before query)', async () => {
    const tool = makeTool();
    const result = await tool.handleKeybinding({ action: 'set', namespace: 'core', keyAction: 'panUp' });
    expect(result.isError).toBe(true);
  });
});
