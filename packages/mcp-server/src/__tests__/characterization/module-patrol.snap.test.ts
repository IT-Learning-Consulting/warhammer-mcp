// Characterization snapshot — ModulePatrolTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-token-config (read), list-tokens (read), enable-token (write),
//         apply-undetectable (write), toggle-global (write); MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModulePatrolTool } from '../../tools/modules/patrol/patrol.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModulePatrolTool(makeToolDeps(mockReturn));

describe('ModulePatrolTool — characterization', () => {
  it('get-token-config — token with wander flags', async () => {
    const r = await tool({
      tokenName: 'Goblin Sentry',
      flags: {
        patrolWander: true,
        patrolPath: false,
        enableSpotting: true,
        patrolundetectable: false,
      },
      global: {
        wanderStarted: true,
        pathStarted: false,
      },
    }).execute({ action: 'get-token-config', tokenUuid: 'Scene.abc.Token.xyz' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-tokens — patrol tokens on scene', async () => {
    const r = await tool({
      count: 2,
      sceneId: 'Scene.abc',
      filter: 'all',
      tokens: [
        { tokenName: 'Goblin Sentry', mode: 'wander', tokenUuid: 'Scene.abc.Token.x1' },
        { tokenName: 'Orc Patrol', mode: 'path', tokenUuid: 'Scene.abc.Token.x2' },
      ],
    }).execute({ action: 'list-tokens', filter: 'all' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-tokens — no patrol tokens', async () => {
    const r = await tool({
      count: 0,
      sceneId: 'Scene.abc',
      filter: 'wander',
      tokens: [],
    }).execute({ action: 'list-tokens', filter: 'wander' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('enable-token — wander mode', async () => {
    const r = await tool({
      mode: 'wander',
      results: [
        { ok: true, tokenUuid: 'Scene.abc.Token.x1', tokenName: 'Goblin Sentry', mode: 'wander' },
      ],
    }).execute({ action: 'enable-token', tokenUuids: ['Scene.abc.Token.x1'], mode: 'wander', spotting: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('apply-undetectable — set active', async () => {
    const r = await tool({
      actorName: 'Shadow Thief',
      actorUuid: 'Actor.shadow1',
      active: true,
    }).execute({ action: 'apply-undetectable', actorUuid: 'Actor.shadow1', active: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('toggle-global — started', async () => {
    const r = await tool({
      started: true,
      engines: 'both',
      wanderStarted: true,
      pathStarted: true,
      note: 'Global patrol state is in-memory only — resets on reload.',
    }).execute({ action: 'toggle-global', started: true, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — patrol not active', async () => {
    const r = await new ModulePatrolTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: patrol is not active'),
    ).execute({ action: 'get-token-config', tokenUuid: 'Scene.abc.Token.xyz' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
