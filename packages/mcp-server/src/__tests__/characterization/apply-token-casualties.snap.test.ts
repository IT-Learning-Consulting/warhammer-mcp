// Characterization snapshot — ApplyTokenCasualtiesTool return-shape lock.
// WFRP Battle Simulator Phase 5 (R13). handle() validates the query result against
// ApplyTokenCasualtiesOutput then wraps it in { content:[text], structuredContent }.

import { describe, it, expect } from 'vitest';
import { ApplyTokenCasualtiesTool } from '../../tools/apply-token-casualties.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ApplyTokenCasualtiesTool(makeToolDeps(mockReturn));

const realApplyReturn = {
  sceneId: 'scene-abc',
  dryRun: false,
  tokenCount: 2,
  appliedCount: 2,
  failedCount: 0,
  results: [
    { tokenId: 'tok-1', applied: true, actorName: 'Orc', woundsBefore: 11, woundsAfter: 0, conditionsApplied: ['unconscious'], critEmbedded: 'crit-xyz', siblingVerified: true },
    { tokenId: 'tok-2', applied: true, actorName: 'Orc', woundsBefore: 11, woundsAfter: 4, conditionsApplied: [], critEmbedded: null, siblingVerified: true },
  ],
  operationId: 'op-123',
  createdDocumentIds: ['crit-xyz'],
  updatedDocumentIds: ['tok-1', 'tok-2'],
  deletedDocumentIds: [],
  warnings: [],
};

const dryRunReturn = {
  sceneId: 'scene-abc',
  dryRun: true,
  tokenCount: 1,
  appliedCount: 1,
  failedCount: 0,
  results: [
    { tokenId: 'tok-1', applied: true, actorName: 'Orc', woundsBefore: 11, woundsAfter: 0, conditionsApplied: ['unconscious'], critEmbedded: '(dry-run)' },
  ],
};

// BUG-409 idempotent retry: a re-send with the same batchId — token already applied → skipped.
const idempotentRetryReturn = {
  sceneId: 'scene-abc',
  dryRun: false,
  tokenCount: 2,
  appliedCount: 2,
  failedCount: 0,
  alreadyAppliedCount: 1,
  results: [
    { tokenId: 'tok-1', applied: true, alreadyApplied: true, actorName: 'Orc' },
    { tokenId: 'tok-2', applied: true, actorName: 'Orc', woundsBefore: 11, woundsAfter: 0, conditionsApplied: ['unconscious'], critEmbedded: null, siblingVerified: true },
  ],
  operationId: 'op-789',
  createdDocumentIds: [],
  updatedDocumentIds: ['tok-2'],
  deletedDocumentIds: [],
  warnings: [],
};

const partialFailureReturn = {
  sceneId: 'scene-abc',
  dryRun: false,
  tokenCount: 2,
  appliedCount: 1,
  failedCount: 1,
  results: [
    { tokenId: 'tok-1', applied: true, actorName: 'Orc', woundsBefore: 11, woundsAfter: 0, conditionsApplied: ['unconscious'], critEmbedded: null, siblingVerified: true },
    { tokenId: 'tok-linked', applied: false, error: 'Token is linked (actorLink=true); a delta write has no effect (HC2).' },
  ],
  operationId: 'op-456',
  createdDocumentIds: [],
  updatedDocumentIds: ['tok-1'],
  deletedDocumentIds: [],
  warnings: [],
};

describe('ApplyTokenCasualtiesTool — characterization', () => {
  it('real apply — wraps validated output in content + structuredContent', async () => {
    const r = await tool(realApplyReturn).handle({
      sceneId: 'scene-abc',
      confirmedApply: true,
      casualties: [
        { tokenId: 'tok-1', wounds: 0, conditions: ['unconscious'], criticalUuid: 'Compendium.artantares-advanced-criticals.items.Item.abc' },
        { tokenId: 'tok-2', wounds: 4 },
      ],
    });
    expect(r).toMatchSnapshot();
  });

  it('dryRun preview — no operation receipt', async () => {
    const r = await tool(dryRunReturn).handle({
      sceneId: 'scene-abc',
      confirmedApply: true,
      dryRun: true,
      casualties: [{ tokenId: 'tok-1', wounds: 0, conditions: ['unconscious'] }],
    });
    expect(r).toMatchSnapshot();
  });

  it('idempotent retry (BUG-409) — batchId re-send skips the already-applied token', async () => {
    const r = await tool(idempotentRetryReturn).handle({
      sceneId: 'scene-abc',
      confirmedApply: true,
      batchId: 'orcs-r2-2026-06-22T00-00-00Z',
      casualties: [
        { tokenId: 'tok-1', wounds: 0, conditions: ['unconscious'] },
        { tokenId: 'tok-2', wounds: 0, conditions: ['unconscious'] },
      ],
    });
    expect(r).toMatchSnapshot();
  });

  it('partial failure — rejected actorLink token surfaced per-item', async () => {
    const r = await tool(partialFailureReturn).handle({
      sceneId: 'scene-abc',
      confirmedApply: true,
      casualties: [
        { tokenId: 'tok-1', wounds: 0, conditions: ['unconscious'] },
        { tokenId: 'tok-linked', wounds: 0 },
      ],
    });
    expect(r).toMatchSnapshot();
  });
});
