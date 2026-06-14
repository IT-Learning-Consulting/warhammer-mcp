// Characterization snapshot — JournalTool write actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: write (create-entry, update-entry, delete-entry, add-page, update-page, delete-page,
//   reorder-pages, add-category, update-category, delete-category, assign-page-to-category,
//   show-to-players, duplicate-entry).

import { describe, it, expect } from 'vitest';
import { JournalTool } from '../../tools/journal.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new JournalTool(makeToolDeps(mockReturn));

describe('JournalTool — characterization (write)', () => {
  it('create-entry — id + page counts', async () => {
    const r = await tool({
      id: 'jrn001',
      name: 'Quest: Find the Witch Hunter',
      pageIds: ['page1'],
      categoryIds: [],
    }).execute({ action: 'create-entry', name: 'Quest: Find the Witch Hunter', pages: [{ type: 'text', name: 'Briefing', text: { content: '<p>Go to the docks.</p>' } }] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-entry — changed fields', async () => {
    const r = await tool({
      entryId: 'jrn001',
      changes: { _id: 'jrn001', name: 'Quest: Renamed' },
    }).execute({ action: 'update-entry', entryId: 'jrn001', changes: { name: 'Quest: Renamed' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-entry — permanent removal', async () => {
    const r = await tool({
      entryId: 'jrn001',
      affectedDocs: [],
    }).execute({ action: 'delete-entry', entryId: 'jrn001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-page — page added summary', async () => {
    const r = await tool({
      entryId: 'jrn001',
      pageId: 'page2',
      type: 'image',
    }).execute({ action: 'add-page', entryId: 'jrn001', page: { type: 'image', name: 'Dock Map', src: 'worlds/aitww/maps/dock.webp' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-page — changed fields', async () => {
    const r = await tool({
      entryId: 'jrn001',
      pageId: 'page1',
      changes: { 'text.content': '<p>Updated body.</p>' },
    }).execute({ action: 'update-page', entryId: 'jrn001', pageId: 'page1', changes: { text: { content: '<p>Updated body.</p>' } } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-page — removed', async () => {
    const r = await tool({
      entryId: 'jrn001',
      pageId: 'page2',
      affectedDocs: [],
    }).execute({ action: 'delete-page', entryId: 'jrn001', pageId: 'page2' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('reorder-pages — new order', async () => {
    const r = await tool({
      entryId: 'jrn001',
      pageCount: 2,
      pageIds: ['page2', 'page1'],
    }).execute({ action: 'reorder-pages', entryId: 'jrn001', pageIds: ['page2', 'page1'] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-category — category added', async () => {
    const r = await tool({
      entryId: 'jrn001',
      categoryId: 'cat1',
      name: 'Maps',
    }).execute({ action: 'add-category', entryId: 'jrn001', name: 'Maps' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-category — changed fields', async () => {
    const r = await tool({
      entryId: 'jrn001',
      categoryId: 'cat1',
      changes: { name: 'Handouts' },
    }).execute({ action: 'update-category', entryId: 'jrn001', categoryId: 'cat1', changes: { name: 'Handouts' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-category — pages uncategorised', async () => {
    const r = await tool({
      entryId: 'jrn001',
      categoryId: 'cat1',
      affectedPages: ['page2'],
    }).execute({ action: 'delete-category', entryId: 'jrn001', categoryId: 'cat1' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('assign-page-to-category — assigned', async () => {
    const r = await tool({
      entryId: 'jrn001',
      pageId: 'page1',
      categoryId: 'cat1',
    }).execute({ action: 'assign-page-to-category', entryId: 'jrn001', pageId: 'page1', categoryId: 'cat1' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('assign-page-to-category — unassigned (null)', async () => {
    const r = await tool({
      entryId: 'jrn001',
      pageId: 'page1',
      categoryId: null,
    }).execute({ action: 'assign-page-to-category', entryId: 'jrn001', pageId: 'page1', categoryId: null });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('show-to-players — broadcast confirmed', async () => {
    const r = await tool({
      entryId: 'jrn001',
      name: 'Quest: Find the Witch Hunter',
    }).execute({ action: 'show-to-players', entryId: 'jrn001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate-entry — new entry created', async () => {
    const r = await tool({
      sourceId: 'jrn001',
      newId: 'jrn002',
      name: 'Quest: Find the Witch Hunter (Copy)',
    }).execute({ action: 'duplicate-entry', entryId: 'jrn001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
