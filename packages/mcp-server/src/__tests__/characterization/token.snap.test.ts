// Characterization snapshot — TokenTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (normal, countOnly) / add / delete-token.

import { describe, it, expect } from 'vitest';
import { TokenTool } from '../../tools/token.js';
import { makeToolDeps } from '../test-utils.js';

const TOKEN_VM = {
  id: 'token-id-001',
  sceneId: 'scene-id-001',
  name: 'Goblin',
  actorId: 'actor-id-001',
  actorLinked: true,
  actorLink: true,
  disposition: -1,
  x: 200,
  y: 300,
  elevation: 0,
  sort: 0,
  width: 1,
  height: 1,
  shape: 4,
  rotation: 0,
  alpha: 1,
  hidden: false,
  locked: false,
  lockRotation: false,
  displayName: 0,
  displayBars: 0,
  bar1: { attribute: 'wounds' },
  bar2: { attribute: null },
  sight: {
    enabled: false,
    range: null,
    angle: 360,
    visionMode: 'basic',
    color: null,
    attenuation: 0.1,
    brightness: 0,
    saturation: 0,
    contrast: 0,
  },
  texture: {
    src: 'systems/wfrp4e/tokens/goblin.webp',
    anchorX: 0.5,
    anchorY: 0.5,
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    tint: '#ffffff',
  },
  delta: { hasOverrides: false },
  movementAction: null,
  flags: {},
};

const TOKEN_LIST_ITEM = {
  id: 'token-id-001',
  sceneId: 'scene-id-001',
  name: 'Goblin',
  actorId: 'actor-id-001',
  actorLinked: true,
  disposition: -1,
  hidden: false,
};

const tool = (mockReturn: any) => new TokenTool(makeToolDeps(mockReturn));

describe('TokenTool — characterization', () => {
  it('create — token created view', async () => {
    const r = await tool({
      token: TOKEN_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', name: 'Goblin', x: 200, y: 300, actorId: 'actor-id-001', disposition: -1 },
    }).execute({ action: 'create', sceneId: 'scene-id-001', name: 'Goblin', x: 200, y: 300, actorId: 'actor-id-001', disposition: -1 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated token view', async () => {
    const r = await tool({
      token: { ...TOKEN_VM, hidden: true, disposition: 0 },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', tokenId: 'token-id-001', changes: { hidden: true, disposition: 0 } },
      changedFields: ['hidden', 'disposition'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', tokenId: 'token-id-001', changes: { hidden: true, disposition: 0 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation', async () => {
    const r = await tool({
      deletedId: 'token-id-001',
      deletedName: 'Goblin',
      sceneId: 'scene-id-001',
      remainingTokens: 3,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', tokenId: 'token-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single token view (linked actor)', async () => {
    const r = await tool({
      token: TOKEN_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', tokenId: 'token-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — stale FK token (actorLinked=false)', async () => {
    const r = await tool({
      token: { ...TOKEN_VM, actorLinked: false, actorLink: false },
    }).execute({ action: 'get', sceneId: 'scene-id-001', tokenId: 'token-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated tokens', async () => {
    const r = await tool({
      tokens: [TOKEN_LIST_ITEM],
      total: 1,
      page: 1,
      pageSize: 50,
      countOnly: false,
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    const r = await tool({
      tokens: [],
      total: 5,
      page: 1,
      pageSize: 50,
      countOnly: true,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add — bulk tokens placed', async () => {
    const r = await tool({
      sceneId: 'scene-id-001',
      added: 2,
      tokenIds: ['token-id-002', 'token-id-003'],
      placement: 'random',
    }).execute({ action: 'add', actorIds: ['actor-id-001', 'actor-id-002'], placement: 'random' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-token — token removed confirmation', async () => {
    const r = await tool({
      deletedId: 'token-id-001',
      deletedName: 'Goblin',
      sceneId: 'scene-id-001',
      remainingTokens: 2,
    }).execute({ action: 'delete-token', sceneId: 'scene-id-001', tokenId: 'token-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
