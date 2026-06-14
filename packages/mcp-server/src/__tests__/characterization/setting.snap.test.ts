// Characterization snapshot — SettingTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1). EXEMPLAR pattern for the per-tool suite:
//   build the tool with a canned query response -> execute(args) -> snapshot content[0].text.
// A change to the tool's output format produces a clear snapshot diff (the regression net for Phases 1-14).

import { describe, it, expect } from 'vitest';
import { SettingTool } from '../../tools/setting.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new SettingTool(makeToolDeps(mockReturn));

describe('SettingTool — characterization', () => {
  it('get — formatted setting view', async () => {
    const r = await tool({
      setting: {
        namespace: 'warhammer-mcp',
        key: 'mcpVerboseConsole',
        fullKey: 'warhammer-mcp.mcpVerboseConsole',
        value: false,
        scope: 'world',
        typeLabel: 'Boolean',
        hasOnChange: false,
      },
    }).execute({ action: 'get', namespace: 'warhammer-mcp', key: 'mcpVerboseConsole' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set — round-trip verified view', async () => {
    const r = await tool({
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
    }).execute({ action: 'set', namespace: 'warhammer-mcp', key: 'auditWritesToChat', value: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — namespace-filtered settings', async () => {
    const r = await tool({
      total: 2,
      items: [
        { namespace: 'warhammer-mcp', key: 'enabled', fullKey: 'warhammer-mcp.enabled', scope: 'world', typeLabel: 'Boolean', hasOnChange: true },
        { namespace: 'warhammer-mcp', key: 'auditWritesToChat', fullKey: 'warhammer-mcp.auditWritesToChat', scope: 'world', typeLabel: 'Boolean', hasOnChange: false },
      ],
    }).execute({ action: 'list', namespacePrefix: 'warhammer-mcp' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-world-db — persisted settings with doc ids', async () => {
    const r = await tool({
      total: 2,
      items: [
        { key: 'warhammer-mcp.enabled', value: true, id: 'doc-id-1' },
        { key: 'warhammer-mcp.serverPort', value: 31415, id: 'doc-id-2' },
      ],
    }).execute({ action: 'list-world-db' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
