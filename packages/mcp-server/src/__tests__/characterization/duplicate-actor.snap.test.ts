// Characterization snapshot — DuplicateActorTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// DuplicateActorTool.handle() is a thin pass-through: returns the raw query result.

import { describe, it, expect } from 'vitest';
import { DuplicateActorTool } from '../../tools/duplicate-actor.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DuplicateActorTool(makeToolDeps(mockReturn));

describe('DuplicateActorTool — characterization', () => {
  it('duplicate-actor — clone with default name (source name)', async () => {
    const r = await tool({
      id: 'clone00123456789',
      name: 'Human',
      type: 'npc',
    }).handle({
      sourceActorId: 'source0123456789',
    });
    expect(r).toMatchSnapshot();
  });

  it('duplicate-actor — clone with custom newName', async () => {
    const r = await tool({
      id: 'clone00234567890',
      name: 'Ernst the Dockworker',
      type: 'npc',
    }).handle({
      sourceActorId: 'source0123456789',
      newName: 'Ernst the Dockworker',
    });
    expect(r).toMatchSnapshot();
  });
});
