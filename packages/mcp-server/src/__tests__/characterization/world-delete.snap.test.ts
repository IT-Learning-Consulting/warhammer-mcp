// Characterization snapshot — WorldDeleteTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// WorldDeleteTools.handleDeleteActor() returns the raw query result (no content wrapper).
// Registered as: registry.register('delete-actor', (args) => worldDeleteTools.handleDeleteActor(args)).
// The backend JSON.stringifies the raw result when content[] is absent.

import { describe, it, expect } from 'vitest';
import { WorldDeleteTools } from '../../tools/world-delete.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new WorldDeleteTools(makeToolDeps(mockReturn));

describe('WorldDeleteTools — characterization', () => {
  it('delete-actor — successful deletion raw passthrough', async () => {
    const r = await tool({
      deleted: true,
      id: 'actor-abc123',
      name: 'Hans Gruber',
    }).handleDeleteActor({ id: 'actor-abc123' });
    expect(r).toMatchSnapshot();
  });
});
