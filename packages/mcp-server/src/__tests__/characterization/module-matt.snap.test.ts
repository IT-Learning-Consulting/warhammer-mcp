// Characterization snapshot — ModuleMattTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers ~4 read + ~4 write actions + one MODULE_NOT_ACTIVE (error path via errorContent).

import { describe, it, expect } from 'vitest';
import { ModuleMattTool } from '../../tools/modules/monks-active-tiles/matt.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleMattTool(makeToolDeps(mockReturn, mockThrow));

describe('ModuleMattTool — characterization', () => {
  // ── MODULE_NOT_ACTIVE (errorContent path — matt.run catches all throws) ──────
  it('MODULE_NOT_ACTIVE — get-capabilities throws → errorContent format', async () => {
    const r = await tool(null, 'MODULE_NOT_ACTIVE: monks-active-tiles is not active').execute({
      action: 'get-capabilities',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Reads ────────────────────────────────────────────────────────────────────

  it('get-capabilities — formats trigger counts, groups, deps', async () => {
    const r = await tool({
      triggers: ['enter', 'exit', 'click'],
      actions: [
        { key: 'chatmessage', group: 'system', danger: false },
        { key: 'pause', group: 'system', danger: true },
      ],
      dangerousActions: ['pause', 'resetfog'],
      groups: ['system', 'token', 'scene'],
      registeredActions: [],
      optionalDeps: { 'sequencer': false, 'tagger': true },
      settings: { 'use-core-macro': false },
      counts: { triggers: 3, builtinActions: 78 },
    }).execute({ action: 'get-capabilities' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-trigger-tile — prose summary with actions and variables', async () => {
    const r = await tool({
      uuid: 'Scene.abc123.Tile.tile001',
      tileId: 'tile001',
      sceneId: 'abc123',
      name: 'Main Gate Trap',
      active: true,
      trigger: ['enter'],
      restriction: 'all',
      controlled: 'all',
      chance: 100,
      pertoken: false,
      cooldown: 0,
      actions: [
        { id: 'act001aaaaaaaaaa', action: 'chatmessage', data: { text: 'A trap springs!' } },
        { id: 'act002aaaaaaaaaa', action: 'pause', data: {} },
      ],
      variables: { triggered: true },
      history: { token001: { count: 1 } },
      config: { active: true },
    }).execute({ action: 'get-trigger-tile', tileUuid: 'Scene.abc123.Tile.tile001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-trigger-tiles — multi-tile scene list', async () => {
    const r = await tool({
      sceneId: 'abc123',
      count: 2,
      tiles: [
        { uuid: 'Scene.abc123.Tile.tile001', tileId: 'tile001', name: 'Main Gate Trap', active: true, trigger: ['enter'], actionCount: 2 },
        { uuid: 'Scene.abc123.Tile.tile002', tileId: 'tile002', name: null, active: false, trigger: ['click'], actionCount: 1 },
      ],
    }).execute({ action: 'list-trigger-tiles', sceneId: 'abc123' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('validate-sequence — invalid sequence with errors and warnings', async () => {
    const r = await tool({
      valid: false,
      errors: ['Unknown action key: deleteme'],
      warnings: ['action[0] has no data fields'],
      dangerous: ['pause'],
      anchors: [],
    }).execute({
      action: 'validate-sequence',
      actions: [{ action: 'deleteme', data: {} }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Writes ───────────────────────────────────────────────────────────────────

  it('create-trigger-tile — formats uuid, scene, trigger, actionCount', async () => {
    const r = await tool({
      tileId: 'tile003',
      uuid: 'Scene.abc123.Tile.tile003',
      sceneId: 'abc123',
      trigger: ['enter'],
      actionCount: 1,
      name: 'Ambush Tile',
    }).execute({
      action: 'create-trigger-tile',
      sceneId: 'abc123',
      x: 500,
      y: 500,
      trigger: ['enter'],
      actions: [{ action: 'chatmessage', data: { text: 'Ambush!' } }],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('replace-action-sequence — formats sequence with action list', async () => {
    const r = await tool({
      uuid: 'Scene.abc123.Tile.tile001',
      tileId: 'tile001',
      actionCount: 2,
      actions: [
        { id: 'act001aaaaaaaaaa', action: 'chatmessage' },
        { id: 'act002aaaaaaaaaa', action: 'pause' },
      ],
    }).execute({
      action: 'replace-action-sequence',
      tileUuid: 'Scene.abc123.Tile.tile001',
      actions: [
        { action: 'chatmessage', data: { text: 'Replaced!' } },
        { action: 'pause', data: {} },
      ],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('fire-trigger — formats uuid and fired status', async () => {
    const r = await tool({
      uuid: 'Scene.abc123.Tile.tile001',
      fired: true,
      tokensUsed: 1,
    }).execute({
      action: 'fire-trigger',
      tileUuid: 'Scene.abc123.Tile.tile001',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('find-trigger-tile — single match result', async () => {
    const r = await tool({
      count: 1,
      match: {
        uuid: 'Scene.abc123.Tile.tile001',
        sceneId: 'abc123',
        sceneName: 'Dungeon Level 1',
        tileId: 'tile001',
        name: 'Main Gate Trap',
        active: true,
        trigger: ['enter'],
        actionCount: 2,
        tags: ['trap'],
        libraryId: null,
      },
      matches: [
        {
          uuid: 'Scene.abc123.Tile.tile001',
          sceneId: 'abc123',
          sceneName: 'Dungeon Level 1',
          tileId: 'tile001',
          name: 'Main Gate Trap',
          active: true,
          trigger: ['enter'],
          actionCount: 2,
          tags: ['trap'],
          libraryId: null,
        },
      ],
    }).execute({ action: 'find-trigger-tile', name: 'Main Gate Trap' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
