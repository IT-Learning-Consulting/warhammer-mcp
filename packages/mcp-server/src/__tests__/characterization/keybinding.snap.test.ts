// Characterization snapshot — KeybindingTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// KeybindingTools.handleKeybinding() dispatches to 6 actions.
// Each returns { content:[{type:"text",text}] }.

import { describe, it, expect } from 'vitest';
import { KeybindingTools } from '../../tools/keybinding.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new KeybindingTools(makeToolDeps(mockReturn));

describe('KeybindingTools — characterization', () => {
  it('keybinding/list — all actions in namespace', async () => {
    const r = await tool({
      total: 2,
      actions: [
        { id: 'core.panUp', namespace: 'core', name: 'Pan Up', precedence: 0, restricted: false, editable: [{ key: 'KeyW', modifiers: [] }], current: [{ key: 'KeyW', modifiers: [] }], humanized: ['W'] },
        { id: 'core.panDown', namespace: 'core', name: 'Pan Down', precedence: 0, restricted: false, editable: [{ key: 'KeyS', modifiers: [] }], current: [{ key: 'KeyS', modifiers: [] }], humanized: ['S'] },
      ],
    }).handleKeybinding({ action: 'list', namespace: 'core' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('keybinding/get — single action detail', async () => {
    const r = await tool({
      id: 'core.panUp',
      namespace: 'core',
      name: 'Pan Up',
      hint: 'Move the canvas viewport upward',
      precedence: 0,
      restricted: false,
      editable: [{ key: 'KeyW', modifiers: [] }],
      current: [{ key: 'KeyW', modifiers: [] }],
      humanized: ['W'],
    }).handleKeybinding({ action: 'get', namespace: 'core', keyAction: 'panUp' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('keybinding/set — rebind confirmation', async () => {
    const r = await tool({
      id: 'core.panUp',
      bindings: [{ key: 'ArrowUp', modifiers: [] }],
    }).handleKeybinding({ action: 'set', namespace: 'core', keyAction: 'panUp', bindings: [{ key: 'ArrowUp', modifiers: [] }] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('keybinding/reset-action — defaults restored', async () => {
    const r = await tool({
      id: 'core.panUp',
      bindings: [{ key: 'KeyW', modifiers: [] }],
    }).handleKeybinding({ action: 'reset-action', namespace: 'core', keyAction: 'panUp' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('keybinding/reset-all — dry run preview', async () => {
    const r = await tool({
      dryRun: true,
      count: 2,
      items: [
        { id: 'core.panUp', name: 'Pan Up' },
        { id: 'core.panDown', name: 'Pan Down' },
      ],
    }).handleKeybinding({ action: 'reset-all', dryRun: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('keybinding/find-conflicts — conflicts detected', async () => {
    const r = await tool({
      total: 1,
      conflicts: [
        {
          key: 'KeyF',
          modifiers: ['Control'],
          actions: [
            { id: 'core.searchAll', name: 'Search All', precedence: 0, restricted: false },
            { id: 'wfrp4e.rollFormula', name: 'Roll Formula', precedence: 0, restricted: true },
          ],
        },
      ],
    }).handleKeybinding({ action: 'find-conflicts' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
