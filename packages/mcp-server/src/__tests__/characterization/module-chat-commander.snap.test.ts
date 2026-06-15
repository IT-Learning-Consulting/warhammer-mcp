// Characterization snapshot — ModuleChatCommanderTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list-commands (read), get-command (read), unregister-command (write),
// MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleChatCommanderTool } from '../../tools/modules/_chatcommands/chat-commander.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) =>
  new ModuleChatCommanderTool(makeToolDeps(mockReturn));

describe('ModuleChatCommanderTool — characterization', () => {
  it('list-commands — commands registered', async () => {
    const r = await tool({
      count: 2,
      commands: [
        { name: '/roll', aliases: ['/r'], module: 'wfrp4e', requiredRole: 'NONE', description: 'Roll dice' },
        { name: '/effect', aliases: [], module: 'chat-commander-wfrp4e', requiredRole: 'GAMEMASTER', description: 'Apply an effect' },
      ],
    }).execute({ action: 'list-commands' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-commands — empty registry', async () => {
    const r = await tool({
      count: 0,
      commands: [],
    }).execute({ action: 'list-commands' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-commands — with builtin WFRP advisory (BUG-383)', async () => {
    const r = await tool({
      count: 1,
      commands: [
        { name: '/effect', aliases: [], module: 'chat-commander-wfrp4e', requiredRole: 'GAMEMASTER', description: 'Apply an effect' },
      ],
      builtinWfrpWarning:
        'Result includes chat-commander-wfrp4e built-in commands (registered under module id "wfrp4e"). These re-register on every world reload; unregister-command is session-only for them.',
    }).execute({ action: 'list-commands' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-command — found', async () => {
    const r = await tool({
      name: '/roll',
      module: 'wfrp4e',
      moduleName: 'Warhammer Fantasy Roleplay 4e',
      aliases: ['/r'],
      requiredRole: 'NONE',
      canInvoke: true,
      closeOnComplete: true,
      description: 'Roll dice',
      hasCallback: true,
      hasAutocompleteCallback: false,
    }).execute({ action: 'get-command', name: '/roll' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('unregister-command — success', async () => {
    const r = await tool({
      unregistered: true,
      macroDeleted: true,
      macroId: 'Macro.abc123',
      builtinWfrpWarning: null,
    }).execute({ action: 'unregister-command', name: '/mycommand', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('unregister-command — builtin WFRP warning', async () => {
    const r = await tool({
      unregistered: true,
      macroDeleted: false,
      macroId: null,
      builtinWfrpWarning: 'This is a built-in chat-commander-wfrp4e command and will re-register on reload.',
    }).execute({ action: 'unregister-command', name: '/roll', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleChatCommanderTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: _chatcommands is not active'),
    ).execute({ action: 'list-commands' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
