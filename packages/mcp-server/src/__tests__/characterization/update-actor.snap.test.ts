// Characterization snapshot — UpdateActorTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// UpdateActorTool.handle() passes the query result through verbatim (no content wrapper).

import { describe, it, expect } from 'vitest';
import { UpdateActorTool } from '../../tools/update-actor.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new UpdateActorTool(makeToolDeps(mockReturn));

describe('UpdateActorTool — characterization', () => {
  it('update characteristics advance — raw passthrough', async () => {
    const r = await tool({
      success: true,
      actorId: 'actor-001',
      actorName: 'Aldric',
      updated: ['system.characteristics.ws.advances'],
    }).handle({
      actorId: 'actor-001',
      updateData: { 'system.characteristics.ws.advances': 5 },
    });
    expect(r).toMatchSnapshot();
  });

  it('update experience spent — raw passthrough', async () => {
    const r = await tool({
      success: true,
      actorId: 'actor-002',
      actorName: 'Brenna',
      updated: ['system.details.experience.spent'],
    }).handle({
      actorId: 'actor-002',
      updateData: { 'system.details.experience.spent': 75 },
    });
    expect(r).toMatchSnapshot();
  });

  it('update with verifyPersistence false — raw passthrough', async () => {
    const r = await tool({
      success: true,
      actorId: 'actor-003',
      actorName: 'Cormac',
      updated: ['system.status.encumbrance.value'],
    }).handle({
      actorId: 'actor-003',
      updateData: { 'system.status.encumbrance.value': 3 },
      verifyPersistence: false,
    });
    expect(r).toMatchSnapshot();
  });
});
