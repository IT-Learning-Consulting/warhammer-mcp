// Characterization snapshot — OwnershipTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: assign, remove, list, bulk-set, reset

import { describe, it, expect } from 'vitest';
import { OwnershipTool } from '../../tools/ownership.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new OwnershipTool(makeToolDeps(mockReturn));

describe('OwnershipTool — characterization', () => {
  it('assign — per-user observer grant', async () => {
    const r = await tool({
      documentType: 'actor',
      resolvedId: 'actor001',
      ownership: { default: 0, player1: 2 },
    }).execute({ action: 'assign', documentType: 'actor', id: 'actor001', userId: 'player1', level: 'observer' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('assign — default level update', async () => {
    const r = await tool({
      documentType: 'journal',
      resolvedId: 'jrnl001',
      ownership: { default: 1 },
    }).execute({ action: 'assign', documentType: 'journal', id: 'jrnl001', default: true, level: 'limited' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('remove — revoke user access', async () => {
    const r = await tool({
      documentType: 'scene',
      resolvedId: 'scene001',
      ownership: { default: 0 },
    }).execute({ action: 'remove', documentType: 'scene', id: 'scene001', userId: 'player1' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — with per-user permissions', async () => {
    const r = await tool({
      documentType: 'actor',
      resolvedId: 'actor001',
      ownership: { default: 0, player1: 3, player2: 2 },
    }).execute({ action: 'list', documentType: 'actor', id: 'actor001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — no ownership map (folder)', async () => {
    const r = await tool({
      documentType: 'folder',
      resolvedId: 'fld001',
      ownership: null,
      reason: 'Folders do not have per-user ownership',
    }).execute({ action: 'list', documentType: 'folder', id: 'fld001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('bulk-set — partial success', async () => {
    const r = await tool({
      overall_success: false,
      per_class: [
        { documentType: 'actor', succeeded: 2, failed: [] },
        { documentType: 'journal', succeeded: 0, failed: [{ target: { name: 'Missing Journal' }, error: 'NOT_FOUND' }] },
      ],
    }).execute({
      action: 'bulk-set',
      targets: [
        { documentType: 'actor', name: 'Hans' },
        { documentType: 'journal', name: 'Missing Journal' },
      ],
      userId: 'player1',
      level: 'observer',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('reset — ownership cleared', async () => {
    const r = await tool({
      documentType: 'rolltable',
      resolvedId: 'tbl001',
      ownership: { default: 0 },
    }).execute({ action: 'reset', documentType: 'rolltable', id: 'tbl001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
