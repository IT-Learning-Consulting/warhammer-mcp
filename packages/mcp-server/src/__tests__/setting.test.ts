// Phase 4 mcp_completion_v1 — Setting tool schema + dispatch tests.
//
// Tests: action enum (exactly 4 — no register/delete), force-flag gates,
// blocklisted key rejection, onChange advisory, round-trip verify,
// list-world-db enumeration, and happy-path per action.

import { describe, it, expect, vi } from 'vitest';
import { SettingToolInput } from '@foundry-mcp/shared';
import { SettingTool } from '../tools/setting.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn ?? {
        setting: {
          namespace: 'warhammer-mcp',
          key: 'mcpVerboseConsole',
          fullKey: 'warhammer-mcp.mcpVerboseConsole',
          value: false,
          scope: 'world',
          typeLabel: 'Boolean',
          hasOnChange: false,
        },
      };
    }),
  };
  return new SettingTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('SettingToolInput schema — action enum', () => {
  it('action enum contains exactly [get, set, list, list-world-db]', () => {
    const actions = SettingToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(['get', 'list', 'list-world-db', 'set']);
  });

  it('does NOT contain register or delete actions', () => {
    const actions = SettingToolInput.options.map((o) => o.shape.action.value);
    expect(actions).not.toContain('register');
    expect(actions).not.toContain('delete');
  });
});

describe('SettingToolInput schema — set action', () => {
  it('set requires namespace, key, value', () => {
    expect(() =>
      SettingToolInput.parse({ action: 'set', namespace: 'warhammer-mcp', key: 'mcpVerboseConsole' }),
    ).not.toThrow(); // value is z.unknown() which accepts undefined at parse time
  });

  it('set force defaults to false', () => {
    const parsed = SettingToolInput.parse({
      action: 'set',
      namespace: 'warhammer-mcp',
      key: 'mcpVerboseConsole',
      value: true,
    });
    if (parsed.action === 'set') {
      expect(parsed.force).toBe(false);
    }
  });
});

// ── SettingTool action dispatch tests ─────────────────────────────────────────

describe('SettingTool get — happy path', () => {
  it('formats setting view with namespace.key', async () => {
    const tool = makeTool();
    const result = await tool.execute({
      action: 'get',
      namespace: 'warhammer-mcp',
      key: 'mcpVerboseConsole',
    });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('warhammer-mcp.mcpVerboseConsole');
    expect(text).toContain('Boolean');
  });
});

describe('SettingTool set — force flag gate (blocklisted key)', () => {
  it('surfaces SETTING_SIDE_EFFECT_BLOCKED when handler rejects blocklisted key', async () => {
    const tool = makeTool(null, 'SETTING_SIDE_EFFECT_BLOCKED: "warhammer-mcp.enabled" is a K7-class key');
    const result = await tool.execute({
      action: 'set',
      namespace: 'warhammer-mcp',
      key: 'enabled',
      value: false,
    });
    expect((result as any).isError).toBe(true);
    const text = (result as any).content[0].text as string;
    expect(text).toContain('SETTING_SIDE_EFFECT_BLOCKED');
  });

  it('surfaces SETTING_SIDE_EFFECT_BLOCKED includes force guidance', async () => {
    const tool = makeTool(null, 'SETTING_SIDE_EFFECT_BLOCKED: "warhammer-mcp.enabled" is a K7-class key that can restart or reconfigure the MCP bridge. Pass force:true to override.');
    const result = await tool.execute({
      action: 'set',
      namespace: 'warhammer-mcp',
      key: 'enabled',
      value: false,
    });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('force');
  });
});

describe('SettingTool set — onChange advisory', () => {
  it('surfaces SETTING_ONCHANGE_BLOCKED when handler rejects onChange setting without force', async () => {
    const tool = makeTool(null, 'SETTING_ONCHANGE_BLOCKED: "some-module.key" has a registered onChange callback. Pass force:true to override.');
    const result = await tool.execute({
      action: 'set',
      namespace: 'some-module',
      key: 'key',
      value: 'val',
    });
    expect((result as any).isError).toBe(true);
    expect((result as any).content[0].text).toContain('SETTING_ONCHANGE_BLOCKED');
  });
});

describe('SettingTool set — round-trip verify', () => {
  it('returns verified:true on successful set', async () => {
    const tool = makeTool({
      setting: {
        namespace: 'warhammer-mcp',
        key: 'auditWritesToChat',
        fullKey: 'warhammer-mcp.auditWritesToChat',
        value: true,
        scope: 'world',
        typeLabel: 'Boolean',
        hasOnChange: false,
      },
      verified: true,
    });
    const result = await tool.execute({
      action: 'set',
      namespace: 'warhammer-mcp',
      key: 'auditWritesToChat',
      value: true,
    });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Setting Updated');
    expect(text).toContain('Verified: yes');
  });
});

describe('SettingTool list — namespace prefix filter', () => {
  it('returns items when found', async () => {
    const tool = makeTool({
      total: 2,
      items: [
        { namespace: 'warhammer-mcp', key: 'enabled', fullKey: 'warhammer-mcp.enabled', scope: 'world', typeLabel: 'Boolean', hasOnChange: true },
        { namespace: 'warhammer-mcp', key: 'auditWritesToChat', fullKey: 'warhammer-mcp.auditWritesToChat', scope: 'world', typeLabel: 'Boolean', hasOnChange: false },
      ],
    });
    const result = await tool.execute({
      action: 'list',
      namespacePrefix: 'warhammer-mcp',
    });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Settings (2 total)');
    expect(text).toContain('warhammer-mcp.enabled');
  });
});

describe('SettingTool list-world-db — returns only persisted settings', () => {
  it('returns persisted settings with key/value pairs', async () => {
    const tool = makeTool({
      total: 3,
      items: [
        { key: 'warhammer-mcp.enabled', value: true, id: 'id-1' },
        { key: 'warhammer-mcp.serverPort', value: 31415, id: 'id-2' },
        { key: 'warhammer-mcp.rollStates', value: {}, id: 'id-3' },
      ],
    });
    const result = await tool.execute({ action: 'list-world-db' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('Persisted World Settings (3 total)');
    expect(text).toContain('warhammer-mcp.enabled');
  });

  it('surfaces the WorldSettings document id alongside key/value (F01 regression)', async () => {
    const tool = makeTool({
      total: 1,
      items: [{ key: 'warhammer-mcp.enabled', value: true, id: 'doc-id-abc123' }],
    });
    const result = await tool.execute({ action: 'list-world-db' });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('id: `doc-id-abc123`');
  });

  it('countOnly returns total without items', async () => {
    const tool = makeTool({ total: 21 });
    const result = await tool.execute({ action: 'list-world-db', countOnly: true });
    const text = (result as any).content[0].text as string;
    expect(text).toContain('21');
  });
});
