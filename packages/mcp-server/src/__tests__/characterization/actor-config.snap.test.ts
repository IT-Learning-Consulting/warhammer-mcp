// Characterization snapshot — ActorConfigTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ActorConfigTool.execute() dispatches to per-action handlers that each return
// { content:[{type:"text",text}] }. Four actions: get-prototype-token, update-prototype-token,
// get-art, set-art.

import { describe, it, expect } from 'vitest';
import { ActorConfigTool } from '../../tools/actor-config.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ActorConfigTool(makeToolDeps(mockReturn));

describe('ActorConfigTool — characterization', () => {
  it('get-prototype-token — formatted prototype token view', async () => {
    const r = await tool({
      actorId: 'actor-abc123',
      actorName: 'Hans Gruber',
      prototypeToken: {
        name: 'Hans Gruber',
        actorLink: true,
        width: 1,
        height: 1,
        disposition: -1,
        displayName: 20,
        displayBars: 20,
        texture: { src: 'icons/svg/mystery-man.svg', scaleX: 1, scaleY: 1 },
      },
    }).execute({ action: 'get-prototype-token', actorId: 'actor-abc123' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-prototype-token — changed fields summary', async () => {
    const r = await tool({
      actorId: 'actor-abc123',
      actorName: 'Hans Gruber',
      requestedChanges: { disposition: -1, displayName: 50 },
      extraFields: null,
      prototypeToken: { disposition: -1, displayName: 50 },
    }).execute({
      action: 'update-prototype-token',
      actorId: 'actor-abc123',
      changes: { disposition: -1, displayName: 50 },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-art (actor target) — actor img + prototype token src', async () => {
    const r = await tool({
      target: { type: 'actor', id: 'actor-abc123' },
      actorImg: 'systems/wfrp4e/tokens/human.png',
      prototypeTokenTextureSrc: 'systems/wfrp4e/tokens/human.png',
    }).execute({ action: 'get-art', target: { type: 'actor', id: 'actor-abc123' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-art (item target) — item img', async () => {
    const r = await tool({
      target: { type: 'item', id: 'item-xyz789' },
      img: 'systems/wfrp4e/icons/weapons/sword.png',
    }).execute({ action: 'get-art', target: { type: 'item', id: 'item-xyz789' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-art (actor, both) — art set confirmation with resolved paths', async () => {
    const r = await tool({
      target: { type: 'actor', id: 'actor-abc123' },
      src: 'systems/wfrp4e/tokens/soldier.png',
      which: 'both',
      written: ['img', 'prototypeToken.texture.src'],
      resolved: {
        img: 'systems/wfrp4e/tokens/soldier.png',
        'prototypeToken.texture.src': 'systems/wfrp4e/tokens/soldier.png',
      },
    }).execute({
      action: 'set-art',
      target: { type: 'actor', id: 'actor-abc123' },
      src: 'systems/wfrp4e/tokens/soldier.png',
      which: 'both',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-art (clear) — art cleared to default', async () => {
    const r = await tool({
      target: { type: 'actor', id: 'actor-abc123' },
      src: '',
      which: 'img',
      written: ['img'],
      resolved: { img: 'icons/svg/mystery-man.svg' },
    }).execute({
      action: 'set-art',
      target: { type: 'actor', id: 'actor-abc123' },
      src: '',
      which: 'img',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
