// Characterization snapshot — CrossDocFkTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: audit-orphans, audit-document, repair-orphans

import { describe, it, expect } from 'vitest';
import { CrossDocFkTool } from '../../tools/cross-doc-fk.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new CrossDocFkTool(makeToolDeps(mockReturn));

describe('CrossDocFkTool — characterization', () => {
  it('audit-orphans — no orphans', async () => {
    const r = await tool({
      page: 1,
      pageSize: 100,
      pageCount: 1,
      totalOrphans: 0,
      orphanCount: 0,
      orphans: [],
      includeCompendiums: false,
    }).execute({ action: 'audit-orphans' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('audit-orphans — with orphans grouped by type', async () => {
    const r = await tool({
      page: 1,
      pageSize: 100,
      pageCount: 1,
      totalOrphans: 2,
      orphanCount: 2,
      orphans: [
        {
          sourceDocType: 'Scene',
          sourceDocId: 'scene001',
          sourceDocName: 'Market Square',
          sourceField: 'journal',
          refDocType: 'JournalEntry',
          refId: 'jrnl999',
          isHotbarSlot: false,
          isCompendiumRef: false,
        },
        {
          sourceDocType: 'Actor',
          sourceDocId: 'actor001',
          sourceDocName: null,
          sourceField: 'token.actorId',
          refDocType: 'Actor',
          refId: 'actor999',
          isHotbarSlot: false,
          isCompendiumRef: false,
        },
      ],
      includeCompendiums: false,
    }).execute({ action: 'audit-orphans' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('audit-document — outbound and inbound refs', async () => {
    const r = await tool({
      documentType: 'Scene',
      documentId: 'scene001',
      documentName: 'Market Square',
      outboundCount: 1,
      inboundCount: 1,
      outbound: [
        {
          sourceDocType: 'Scene',
          sourceDocId: 'scene001',
          sourceDocName: 'Market Square',
          sourceField: 'journal',
          refDocType: 'JournalEntry',
          refId: 'jrnl999',
          isHotbarSlot: false,
          isCompendiumRef: false,
        },
      ],
      inbound: [
        {
          sourceDocType: 'User',
          sourceDocId: 'user001',
          sourceDocName: 'GM',
          sourceField: 'viewedScene',
          refDocType: 'Scene',
          refId: 'scene001',
          isHotbarSlot: false,
          isCompendiumRef: false,
        },
      ],
    }).execute({ action: 'audit-document', documentType: 'Scene', documentId: 'scene001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('repair-orphans — dry run', async () => {
    const r = await tool({
      dryRun: true,
      requestedCount: 1,
      clearedCount: 0,
      skippedCount: 0,
      results: [
        {
          sourceDocType: 'Scene',
          sourceDocId: 'scene001',
          sourceField: 'journal',
          refDocType: 'JournalEntry',
          refId: 'jrnl999',
          status: 'would-clear',
          skipReason: null,
        },
      ],
    }).execute({
      action: 'repair-orphans',
      confirm: true,
      dryRun: true,
      orphans: [
        { sourceDocType: 'Scene', sourceDocId: 'scene001', sourceField: 'journal', refDocType: 'JournalEntry', refId: 'jrnl999' },
      ],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('repair-orphans — real mutation', async () => {
    const r = await tool({
      dryRun: false,
      requestedCount: 1,
      clearedCount: 1,
      skippedCount: 0,
      results: [
        {
          sourceDocType: 'Scene',
          sourceDocId: 'scene001',
          sourceField: 'journal',
          refDocType: 'JournalEntry',
          refId: 'jrnl999',
          status: 'cleared',
          skipReason: null,
        },
      ],
    }).execute({
      action: 'repair-orphans',
      confirm: true,
      dryRun: false,
      orphans: [
        { sourceDocType: 'Scene', sourceDocId: 'scene001', sourceField: 'journal', refDocType: 'JournalEntry', refId: 'jrnl999' },
      ],
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
