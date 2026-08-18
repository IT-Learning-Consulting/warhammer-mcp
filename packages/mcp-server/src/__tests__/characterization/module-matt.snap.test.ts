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

  // BUG-766 — get-capabilities text previously omitted triggers, the action catalog, and
  // settings entirely; a text-only consumer couldn't see what the tool tells callers to inspect.
  it('BUG-766 — get-capabilities text surfaces triggers, action catalog, and settings', async () => {
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
      settings: { 'use-core-macro': false, 'allow-player': true },
      counts: { triggers: 3, builtinActions: 78 },
    }).execute({ action: 'get-capabilities' });
    const text = (r as any).content[0].text;
    expect(text).toContain('Triggers: enter, exit, click');
    expect(text).toContain('system (2): chatmessage, pause');
    expect(text).toContain('use-core-macro=false');
    expect(text).toContain('allow-player=true');
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

  // BUG-766 — taggerWarnings is a distinct field from taggerResolution: on a genuine Tagger
  // resolution FAILURE (not just ZERO_MATCH), the handler pushes only to taggerWarnings, leaving
  // taggerResolution empty. The formatter must still print the warning, not silently drop it —
  // otherwise an unresolved Tagger selector looks like a verified write.
  it('BUG-766 — create-trigger-tile prints taggerWarnings even when taggerResolution is empty (resolution failure)', async () => {
    const r = await tool({
      tileId: 'tile004',
      uuid: 'Scene.abc123.Tile.tile004',
      sceneId: 'abc123',
      trigger: ['enter'],
      actionCount: 1,
      name: 'Flaky Tagger Tile',
      // No taggerResolution field — mirrors the catch-branch path in
      // resolveTaggerSelectorsInSequence (matt-helpers.ts), which pushes only to warnings.
      taggerWarnings: ['action[0].entity: tagger:"boss" resolution failed — tagger may be loading.'],
    }).execute({
      action: 'create-trigger-tile',
      sceneId: 'abc123',
      x: 500,
      y: 500,
      trigger: ['enter'],
      actions: [{ action: 'chatmessage', data: { entity: 'tagger:boss' } }],
    });
    const text = (r as any).content[0].text;
    expect(text).toContain('Tagger warnings:');
    expect(text).toContain('resolution failed — tagger may be loading');
  });

  // BUG-766 — fire-trigger-as: complete fire (all requested tokens eligible and used).
  it('BUG-766 — fire-trigger-as complete fire shows requested=used, skipped=0', async () => {
    const r = await tool({
      uuid: 'Scene.abc123.Tile.tile001',
      fired: true,
      method: 'enter',
      tokenIds: ['token1', 'token2'],
      tokensUsed: 2,
      skipped: 0,
    }).execute({
      action: 'fire-trigger-as',
      tileUuid: 'Scene.abc123.Tile.tile001',
      tokenIds: ['token1', 'token2'],
      confirm: true,
    });
    const text = (r as any).content[0].text;
    expect(text).toContain('requested=2, used=2, skipped=0');
    expect(text).toContain('fired=true');
  });

  // BUG-766 — fire-trigger-as: partial fire (one of two requested tokens ineligible per
  // pertoken history) must be visibly distinguishable from a complete fire.
  it('BUG-766 — fire-trigger-as partial fire shows used < requested and skipped > 0', async () => {
    const r = await tool({
      uuid: 'Scene.abc123.Tile.tile001',
      fired: true,
      method: 'enter',
      tokenIds: ['token1', 'token2'],
      tokensUsed: 1,
      skipped: 1,
    }).execute({
      action: 'fire-trigger-as',
      tileUuid: 'Scene.abc123.Tile.tile001',
      tokenIds: ['token1', 'token2'],
      confirm: true,
    });
    const text = (r as any).content[0].text;
    expect(text).toContain('requested=2, used=1, skipped=1');
  });

  // BUG-766 — fire-trigger-as: zero-eligible-tokens must surface fired=false, used=0, and the
  // typed MATT_NO_ELIGIBLE_TOKENS message (previously dropped entirely from text).
  it('BUG-766 — fire-trigger-as zero-eligible fire shows fired=false and the typed message', async () => {
    const r = await tool({
      uuid: 'Scene.abc123.Tile.tile001',
      fired: false,
      method: 'manual',
      tokenIds: ['token1', 'token2'],
      tokensUsed: 0,
      skipped: 2,
      message: 'MATT_NO_ELIGIBLE_TOKENS: all 2 requested token(s) already triggered this pertoken tile',
    }).execute({
      action: 'fire-trigger-as',
      tileUuid: 'Scene.abc123.Tile.tile001',
      tokenIds: ['token1', 'token2'],
      confirm: true,
    });
    const text = (r as any).content[0].text;
    expect(text).toContain('fired=false');
    expect(text).toContain('requested=2, used=0, skipped=2');
    expect(text).toContain('MATT_NO_ELIGIBLE_TOKENS');
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
