// Characterization snapshot — ApplyDamageTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// ApplyDamageTool.handle() passes the query result through verbatim (no content wrapper).
// The backend JSON.stringifies the raw result if content[] is absent.

import { describe, it, expect } from 'vitest';
import { ApplyDamageTool } from '../../tools/apply-damage.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ApplyDamageTool(makeToolDeps(mockReturn));

const makeSnap = (beforeWounds: number, afterWounds: number) => ({
  actorId: 'actor-abc123',
  damage: {
    amount: 5,
    damageType: 'NORMAL',
    hitLocation: 'body',
  },
  before: {
    wounds: { value: beforeWounds, max: 15 },
    criticalWounds: { value: 0, max: 0 },
    fate: { value: 2 },
    fortune: { value: 2 },
    resilience: { value: 1 },
    resolve: { value: 1 },
    advantage: { value: 0 },
    conditions: [],
  },
  after: {
    wounds: { value: afterWounds, max: 15 },
    criticalWounds: { value: 0, max: 0 },
    fate: { value: 2 },
    fortune: { value: 2 },
    resilience: { value: 1 },
    resolve: { value: 1 },
    advantage: { value: 0 },
    conditions: [],
  },
});

describe('ApplyDamageTool — characterization', () => {
  it('NORMAL damage — raw passthrough', async () => {
    const r = await tool(makeSnap(15, 10)).handle({
      actorId: 'actor-abc123',
      amount: 5,
      damageType: 'NORMAL',
      hitLocation: 'body',
    });
    expect(r).toMatchSnapshot();
  });

  it('IGNORE_ALL damage with head location — raw passthrough', async () => {
    const r = await tool({
      ...makeSnap(10, 3),
      damage: { amount: 7, damageType: 'IGNORE_ALL', hitLocation: 'head' },
    }).handle({
      actorId: 'actor-abc123',
      amount: 7,
      damageType: 'IGNORE_ALL',
      hitLocation: 'head',
    });
    expect(r).toMatchSnapshot();
  });

  it('zero-amount dry-run — raw passthrough', async () => {
    const r = await tool(makeSnap(10, 10)).handle({
      actorId: 'actor-abc123',
      amount: 0,
    });
    expect(r).toMatchSnapshot();
  });
});
