// Characterization snapshot — ModuleGathererTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-spot-status (read), list-spots (read), gather (write), configure-spot (write),
// MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleGathererTool } from '../../tools/modules/gatherer/gatherer.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleGathererTool(makeToolDeps(mockReturn));

describe('ModuleGathererTool — characterization', () => {
  it('get-spot-status — available spot', async () => {
    const r = await tool({
      name: 'Mushroom Patch',
      drawsUsed: 1,
      maxDraws: 3,
      drawsRemaining: 2,
      tableUuid: 'RollTable.abc',
      timeHours: 24,
      resetInSeconds: 86400,
      minigameWarning: null,
    }).execute({ action: 'get-spot-status', pageUuid: 'JournalEntry.x.JournalEntryPage.y' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-spot-status — exhausted spot with minigame warning', async () => {
    const r = await tool({
      name: 'Herb Garden',
      drawsUsed: 5,
      maxDraws: 5,
      drawsRemaining: 0,
      tableUuid: 'RollTable.def',
      timeHours: 0,
      resetInSeconds: null,
      minigameWarning: 'This spot uses a minigame; gather returns minigame:"opened" (fire-and-forget).',
    }).execute({ action: 'get-spot-status', pageUuid: 'JournalEntry.x.JournalEntryPage.z' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-spots — spots returned', async () => {
    const r = await tool({
      count: 2,
      spots: [
        { name: 'Mushroom Patch', drawsRemaining: 2, journalName: 'Herbalism Guide', exhausted: false, minigame: false, pageUuid: 'JournalEntry.x.JournalEntryPage.y' },
        { name: 'Herb Garden', drawsRemaining: 0, journalName: 'Herbalism Guide', exhausted: true, minigame: true, pageUuid: 'JournalEntry.x.JournalEntryPage.z' },
      ],
    }).execute({ action: 'list-spots' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-spots — no spots', async () => {
    const r = await tool({
      count: 0,
      spots: [],
    }).execute({ action: 'list-spots' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('gather — direct draw', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.x.JournalEntryPage.y',
      actorUuid: 'Actor.z',
      minigame: 'skipped',
    }).execute({ action: 'gather', pageUuid: 'JournalEntry.x.JournalEntryPage.y', actorUuid: 'Actor.z' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('gather — minigame opened', async () => {
    const r = await tool({
      pageUuid: 'JournalEntry.x.JournalEntryPage.y',
      actorUuid: 'Actor.z',
      minigame: 'opened',
      note: 'Minigame dialog opened on GM client. Complete the minigame to receive items.',
    }).execute({ action: 'gather', pageUuid: 'JournalEntry.x.JournalEntryPage.y', actorUuid: 'Actor.z' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('configure-spot — fields written', async () => {
    const r = await tool({
      name: 'Mushroom Patch',
      written: { tableUuid: 'RollTable.abc', draws: 3 },
      minigameWarning: null,
    }).execute({ action: 'configure-spot', pageUuid: 'JournalEntry.x.JournalEntryPage.y', draws: 3, tableUuid: 'RollTable.abc' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleGathererTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: gatherer is not active'),
    ).execute({ action: 'get-spot-status', pageUuid: 'JournalEntry.x.JournalEntryPage.y' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
