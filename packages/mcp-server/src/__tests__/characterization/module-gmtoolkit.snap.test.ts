// Characterization snapshot — ModuleGmtoolkitTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-session-info (read), get-group (read), check-conditions (read),
// update-advantage (write), add-xp (write), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleGmtoolkitTool } from '../../tools/modules/wfrp4e-gm-toolkit/gmtoolkit.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleGmtoolkitTool(makeToolDeps(mockReturn));

describe('ModuleGmtoolkitTool — characterization', () => {
  it('get-session-info — session data', async () => {
    const r = await tool({
      sessionID: 'session-42',
      date: '2025-10-15',
      time: '19:30',
    }).execute({ action: 'get-session-info' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-group — party members', async () => {
    const r = await tool({
      groupType: 'party',
      count: 3,
      members: [
        { id: 'Actor.a', name: 'Elspeth' },
        { id: 'Actor.b', name: 'Karl' },
        { id: 'Actor.c', name: 'Gregor' },
      ],
    }).execute({ action: 'get-group', groupType: 'party' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-group — empty group', async () => {
    const r = await tool({
      groupType: 'company',
      count: 0,
      members: [],
    }).execute({ action: 'get-group', groupType: 'company' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-conditions — conditions active', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Karl',
      count: 2,
      conditions: [
        { id: 'bleeding', name: 'Bleeding', value: 2 },
        { id: 'stunned', name: 'Stunned', value: null },
      ],
    }).execute({ action: 'check-conditions', actorId: 'Actor.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('check-conditions — no conditions', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Karl',
      count: 0,
      conditions: [],
    }).execute({ action: 'check-conditions', actorId: 'Actor.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-advantage — increase (player-owned socket-routed)', async () => {
    const r = await tool({
      mode: 'increase',
      tokenId: 'Scene.s.Token.t',
      actorName: 'Karl',
      previousValue: 1,
      value: 2,
      playerOwned: true,
      note: null,
    }).execute({ action: 'update-advantage', mode: 'increase', tokenId: 'Scene.s.Token.t' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-xp — XP awarded', async () => {
    const r = await tool({
      actorId: 'Actor.abc',
      actorName: 'Elspeth',
      amount: 50,
      reason: 'Session end',
      total: 1050,
      current: 150,
    }).execute({ action: 'add-xp', actorId: 'Actor.abc', amount: 50, reason: 'Session end', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleGmtoolkitTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: wfrp4e-gm-toolkit is not active'),
    ).execute({ action: 'get-session-info' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
