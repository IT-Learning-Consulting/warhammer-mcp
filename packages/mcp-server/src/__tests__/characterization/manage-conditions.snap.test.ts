// Characterization snapshot — ManageConditionsTools return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// All three handlers are thin pass-throughs: return the raw query result directly.

import { describe, it, expect } from 'vitest';
import { ManageConditionsTools } from '../../tools/manage-conditions.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ManageConditionsTools(makeToolDeps(mockReturn));

describe('ManageConditionsTools — characterization', () => {
  it('apply-condition — fatigued applied (raw passthrough)', async () => {
    const r = await tool({
      actorId: 'actor001234567890',
      conditionKey: 'fatigued',
      stackCount: 1,
    }).handleApplyCondition({
      actorId: 'actor001234567890',
      conditionKey: 'fatigued',
      value: 1,
    });
    expect(r).toMatchSnapshot();
  });

  it('apply-condition — stunned with explicit value 2', async () => {
    const r = await tool({
      actorId: 'actor001234567890',
      conditionKey: 'stunned',
      stackCount: 2,
    }).handleApplyCondition({
      actorId: 'actor001234567890',
      conditionKey: 'stunned',
      value: 2,
    });
    expect(r).toMatchSnapshot();
  });

  it('remove-condition — fatigued 1 stack removed', async () => {
    const r = await tool({
      actorId: 'actor001234567890',
      conditionKey: 'fatigued',
      remainingCount: 0,
    }).handleRemoveCondition({
      actorId: 'actor001234567890',
      conditionKey: 'fatigued',
      count: 1,
    });
    expect(r).toMatchSnapshot();
  });

  it('list-conditions — two conditions on actor', async () => {
    const r = await tool([
      { id: 'effect001', name: 'Fatigued', statuses: ['fatigued'], disabled: false },
      { id: 'effect002', name: 'Stunned',  statuses: ['stunned'],  disabled: false },
    ]).handleListConditions({
      actorId: 'actor001234567890',
    });
    expect(r).toMatchSnapshot();
  });

  it('list-conditions — empty (no conditions)', async () => {
    const r = await tool([]).handleListConditions({
      actorId: 'actor001234567890',
    });
    expect(r).toMatchSnapshot();
  });
});
