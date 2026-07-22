// BUG-822 — handledBy text-visibility guard.
//
// The foundry-module handler already projects `handledBy` into `data` for create-venture,
// get-venture, and list-ventures (commit 23d1e7c). But per this file's own F03 convention, a
// data field the formatter never mentions is invisible to any real MCP client or eval grader —
// content[].text is all a caller can see (PF-013). Pin that handledBy actually appears in the
// rendered text for all three actions, and that its absence renders no dangling artifact.

import { describe, expect, it } from 'vitest';
import { ModuleWfrpEconomyTool } from '../tools/modules/wfrp-economy/wfrp-economy.js';
import { makeToolDeps } from './test-utils.js';

const tool = (mockReturn: any, mockThrow?: string) =>
  new ModuleWfrpEconomyTool(makeToolDeps(mockReturn, mockThrow));

describe('BUG-822: venture handledBy is surfaced in rendered text, not just structuredContent', () => {
  it('create-venture — handled-by Registry appears in the text', async () => {
    const r = await tool({
      action: 'create-venture',
      ventureId: 'v1',
      name: 'Reikland Grain Run',
      type: 'expedition',
      status: 'open',
      standing: 'stable',
      escrowBp: 0,
      handledBy: [{ role: 'registry', name: 'Bank of Reikland', bankId: 'b1', economyId: 'e1' }],
    }).execute({
      action: 'create-venture',
      name: 'Reikland Grain Run',
      type: 'expedition',
      parts: { total: 4, priceBp: 100 },
      confirm: true,
    } as any);
    expect((r as any).content[0].text).toContain('handled by: registry (Bank of Reikland)');
  });

  it('create-venture — no handledBy renders no dangling ", handled by:" fragment', async () => {
    const r = await tool({
      action: 'create-venture',
      ventureId: 'v2',
      name: 'Unassigned Deed',
      type: 'expedition',
      status: 'open',
      standing: 'stable',
      escrowBp: 0,
      handledBy: [],
    }).execute({
      action: 'create-venture',
      name: 'Unassigned Deed',
      type: 'expedition',
      parts: { total: 4, priceBp: 100 },
      confirm: true,
    } as any);
    expect((r as any).content[0].text).not.toContain('handled by');
  });

  it('get-venture — handled-by Registry appears in the text', async () => {
    const r = await tool({
      action: 'get-venture',
      ventureId: 'v1',
      name: 'Reikland Grain Run',
      type: 'expedition',
      status: 'open',
      standing: 'stable',
      partsTotal: 4,
      partsSubscribed: 1,
      priceBp: 100,
      escrowBp: 100,
      capitalBp: 100,
      quietCycles: 0,
      readyToLaunch: false,
      holders: [],
      queuedTransfers: [],
      badges: [],
      handledBy: [{ role: 'registry', name: 'Bank of Reikland', bankId: 'b1', economyId: 'e1' }],
      notices: [],
      deedDateText: null,
    }).execute({ action: 'get-venture', ventureId: 'v1' } as any);
    expect((r as any).content[0].text).toContain('handled by: registry (Bank of Reikland)');
  });

  it('BUG-839: get-venture — notices and deedDateText appear in the text', async () => {
    const r = await tool({
      action: 'get-venture',
      ventureId: 'v1',
      name: 'Reikland Grain Run',
      type: 'expedition',
      status: 'underway',
      standing: 'stable',
      partsTotal: 4,
      partsSubscribed: 4,
      priceBp: 100,
      escrowBp: 400,
      capitalBp: 400,
      quietCycles: 0,
      readyToLaunch: false,
      holders: [],
      queuedTransfers: [],
      badges: [],
      handledBy: [],
      notices: ['A backer is threatening to withdraw from the venture.'],
      deedDateText: '32 Jahrdrung 2519',
    }).execute({ action: 'get-venture', ventureId: 'v1' } as any);
    const text = (r as any).content[0].text as string;
    expect(text).toContain('dated 32 Jahrdrung 2519');
    expect(text).toContain('notices: A backer is threatening to withdraw from the venture.');
  });

  it('BUG-839: get-venture — no notices/deedDateText renders no dangling fragments', async () => {
    const r = await tool({
      action: 'get-venture',
      ventureId: 'v1',
      name: 'Reikland Grain Run',
      type: 'expedition',
      status: 'open',
      standing: 'stable',
      partsTotal: 4,
      partsSubscribed: 1,
      priceBp: 100,
      escrowBp: 100,
      capitalBp: 100,
      quietCycles: 0,
      readyToLaunch: false,
      holders: [],
      queuedTransfers: [],
      badges: [],
      handledBy: [],
      notices: [],
      deedDateText: null,
    }).execute({ action: 'get-venture', ventureId: 'v1' } as any);
    const text = (r as any).content[0].text as string;
    expect(text).not.toContain('dated');
    expect(text).not.toContain('notices:');
  });

  it('list-ventures — each venture entry surfaces its own handled-by Registry', async () => {
    const r = await tool({
      action: 'list-ventures',
      count: 2,
      ventures: [
        // quietCycles/readyToLaunch are REQUIRED on WfrpEconomyVentureSummary since BUG-841 M7 and are
        // rendered into content[].text (the only surface an MCP client observes) — the fixtures predate
        // that projection, so they supply them here.
        { ventureId: 'v1', name: 'Handled Deed', type: 'expedition', status: 'open', quietCycles: 0, readyToLaunch: false, handledBy: [{ role: 'registry', name: 'Bank of Reikland' }] },
        { ventureId: 'v2', name: 'Unassigned Deed', type: 'expedition', status: 'open', quietCycles: 2, readyToLaunch: true, handledBy: [] },
      ],
    }).execute({ action: 'list-ventures', economyId: 'e1' } as any);
    const text = (r as any).content[0].text as string;
    expect(text).toContain('Handled Deed (expedition, open, quiet cycles 0, handled by: registry (Bank of Reikland))');
    expect(text).toContain('Unassigned Deed (expedition, open, ready to launch, quiet cycles 2)');
  });
});
