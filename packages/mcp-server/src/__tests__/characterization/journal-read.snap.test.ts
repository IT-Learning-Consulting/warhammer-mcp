// Characterization snapshot — JournalTool read actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: read (list-entries, get-entry shallow, get-entry deep).

import { describe, it, expect } from 'vitest';
import { JournalTool } from '../../tools/journal.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new JournalTool(makeToolDeps(mockReturn));

describe('JournalTool — characterization (read)', () => {
  it('list-entries — bare list', async () => {
    const r = await tool([
      { id: 'jrn001', name: 'Quest: Find the Witch Hunter', pageCount: 2, content: undefined },
      { id: 'jrn002', name: 'Session Log 1', pageCount: 1, content: undefined },
    ]).execute({ action: 'list-entries' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-entries — with includeContent', async () => {
    const r = await tool([
      { id: 'jrn001', name: 'Quest: Find the Witch Hunter', pageCount: 2, content: '<p>Find the Witch Hunter in Bögenhafen before the Schaffenfest.</p>' },
    ]).execute({ action: 'list-entries', includeContent: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-entries — empty result', async () => {
    const r = await tool([]).execute({ action: 'list-entries', filterTemplate: 'quest' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-entry — shallow shape', async () => {
    const r = await tool({
      id: 'jrn001',
      name: 'Quest: Find the Witch Hunter',
      pageIds: ['page1', 'page2'],
      pageCount: 2,
      categoryCount: 1,
    }).execute({ action: 'get-entry', entryId: 'jrn001', shallow: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-entry — deep shape with text pages', async () => {
    const r = await tool({
      id: 'jrn001',
      name: 'Quest: Find the Witch Hunter',
      pages: [
        {
          id: 'page1',
          name: 'Briefing',
          type: 'text',
          sort: 100000,
          category: null,
          src: null,
          text: { content: '<p>The Witch Hunter was last seen in the docks district.</p>', format: 1 },
        },
        {
          id: 'page2',
          name: 'Map',
          type: 'image',
          sort: 200000,
          category: 'cat1',
          src: 'worlds/aitww/images/dock-map.webp',
          text: null,
        },
      ],
      categories: [{ id: 'cat1', name: 'Maps' }],
    }).execute({ action: 'get-entry', entryId: 'jrn001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
