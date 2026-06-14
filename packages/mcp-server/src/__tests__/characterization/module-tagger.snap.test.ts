// Characterization snapshot — ModuleTaggerTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers all 6 actions + one MODULE_NOT_ACTIVE.

import { describe, it, expect } from 'vitest';
import { ModuleTaggerTool } from '../../tools/modules/tagger/tagger.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleTaggerTool(makeToolDeps(mockReturn, mockThrow));

describe('ModuleTaggerTool — characterization', () => {
  // ── MODULE_NOT_ACTIVE ────────────────────────────────────────────────────────
  it('MODULE_NOT_ACTIVE — tag throws → moduleNotActiveContent format', async () => {
    const r = await tool(null, 'MODULE_NOT_ACTIVE: tagger is not active').execute({
      action: 'tag',
      uuids: 'Scene.abc.Token.xyz',
      tags: ['enemy'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Write actions ────────────────────────────────────────────────────────────
  it('tag — documents tagged with tag list', async () => {
    const r = await tool({
      documentsTagged: 2,
      tags: ['enemy', 'elite'],
      currentTags: ['enemy', 'elite'],
    }).execute({
      action: 'tag',
      uuids: ['Scene.abc.Token.xyz', 'Scene.abc.Token.abc'],
      tags: ['enemy', 'elite'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('untag — documents untagged', async () => {
    const r = await tool({
      documentsUntagged: 1,
      removedTags: ['elite'],
      currentTags: ['enemy'],
    }).execute({
      action: 'untag',
      uuids: 'Scene.abc.Token.xyz',
      tags: ['elite'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-tags — atomic tag overwrite', async () => {
    const r = await tool({
      documentsUpdated: 1,
      tags: ['boss', 'named'],
      applyRules: false,
    }).execute({
      action: 'set-tags',
      uuids: 'Scene.abc.Token.xyz',
      tags: ['boss', 'named'],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('clear-tags — tags cleared from documents', async () => {
    const r = await tool({
      documentsCleared: 1,
      clearedTags: 'all',
    }).execute({
      action: 'clear-tags',
      uuids: 'Scene.abc.Token.xyz',
      confirm: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  // ── Read actions ─────────────────────────────────────────────────────────────
  it('query — documents found in scene', async () => {
    const r = await tool({
      sceneId: 'abc123',
      documents: [
        { uuid: 'Scene.abc123.Token.token001', name: 'Goblin Archer', type: 'Token' },
        { uuid: 'Scene.abc123.Token.token002', name: 'Goblin Boss', type: 'Token' },
      ],
      count: 2,
      allScenes: false,
    }).execute({
      action: 'query',
      tags: ['enemy'],
      sceneId: 'abc123',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('query — no documents found in scene', async () => {
    const r = await tool({
      sceneId: 'abc123',
      documents: [],
      count: 0,
      allScenes: false,
    }).execute({
      action: 'query',
      tags: ['npc-merchant'],
      sceneId: 'abc123',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-tags — getTags read (check:false)', async () => {
    const r = await tool({
      documents: [
        { uuid: 'Scene.abc.Token.xyz', name: 'Goblin Boss', tags: ['enemy', 'boss', 'named'] },
      ],
    }).execute({
      action: 'check-tags',
      uuids: 'Scene.abc.Token.xyz',
      check: false,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-tags — hasTags boolean (check:true)', async () => {
    const r = await tool({
      hasTags: true,
      documentCount: 1,
    }).execute({
      action: 'check-tags',
      uuids: 'Scene.abc.Token.xyz',
      tags: ['enemy'],
      check: true,
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
