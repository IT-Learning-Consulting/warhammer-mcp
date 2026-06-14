// Characterization snapshot — ModulePartyResourcesTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list (read), get (read), set-value (write), create (write), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModulePartyResourcesTool } from '../../tools/modules/fvtt-party-resources/party-resources.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModulePartyResourcesTool(makeToolDeps(mockReturn));

describe('ModulePartyResourcesTool — characterization', () => {
  it('list — resources present', async () => {
    const r = await tool({
      count: 2,
      resources: [
        {
          id: 'doom_track',
          name: 'Doom',
          value: 3,
          min: 0,
          max: 13,
          visible: true,
          playerManaged: false,
          notifyChat: true,
        },
        {
          id: 'corruption',
          name: 'Corruption',
          value: 1,
          min: 0,
          max: 10,
          visible: false,
          playerManaged: false,
          notifyChat: false,
        },
      ],
    }).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — no resources', async () => {
    const r = await tool({ count: 0, resources: [] }).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single resource', async () => {
    const r = await tool({
      id: 'doom_track',
      name: 'Doom',
      value: 3,
      min: 0,
      max: 13,
      visible: true,
      playerManaged: false,
      notifyChat: true,
      useIcon: false,
      icon: '',
      position: 0,
    }).execute({ action: 'get', resourceId: 'doom_track' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-value — value updated', async () => {
    const r = await tool({
      resourceId: 'doom_track',
      previousValue: 3,
      value: 5,
      notifyChat: true,
    }).execute({ action: 'set-value', resourceId: 'doom_track', value: 5 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('increment — value incremented', async () => {
    const r = await tool({
      resourceId: 'doom_track',
      previousValue: 5,
      value: 6,
      jump: 1,
      max: 13,
    }).execute({ action: 'increment', resourceId: 'doom_track' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('create — resource created', async () => {
    const r = await tool({
      snapshot: {
        id: 'new_pool',
        name: 'Power Pool',
        value: 0,
        min: 0,
        max: 20,
        visible: true,
        playerManaged: false,
        notifyChat: false,
        position: 2,
      },
    }).execute({ action: 'create', resourceId: 'new_pool', name: 'Power Pool', max: 20, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — fvtt-party-resources not active', async () => {
    const r = await new ModulePartyResourcesTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: fvtt-party-resources is not active'),
    ).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
