// Characterization snapshot — NoteTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create (plain, auto-link branch) / update / delete / get / list (normal, countOnly).

import { describe, it, expect } from 'vitest';
import { NoteTool } from '../../tools/note.js';
import { makeToolDeps } from '../test-utils.js';

const NOTE_VM = {
  id: 'note-id-001',
  sceneId: 'scene-id-001',
  entryId: 'journal-id-001',
  pageId: 'page-id-001',
  entryLinked: true,
  pageLinked: true,
  x: 500,
  y: 300,
  elevation: 0,
  sort: 0,
  iconSize: 40,
  text: 'Tavern',
  fontFamily: 'Signika',
  fontSize: 32,
  textAnchor: 2,
  textColor: '#ffffff',
  global: false,
  texture: {
    src: 'icons/svg/book.svg',
    anchorX: 0.5,
    anchorY: 0.5,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    tint: '#ffffff',
    fit: 'fill',
  },
  flags: {},
};

const NOTE_LIST_ITEM = {
  id: 'note-id-001',
  sceneId: 'scene-id-001',
  text: 'Tavern',
  entryId: 'journal-id-001',
  entryLinked: true,
  pageLinked: true,
};

const tool = (mockReturn: any) => new NoteTool(makeToolDeps(mockReturn));

describe('NoteTool — characterization', () => {
  it('create — note created with journal link', async () => {
    const r = await tool({
      note: NOTE_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, entryId: 'journal-id-001', pageId: 'page-id-001', text: 'Tavern' },
    }).execute({ action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, entryId: 'journal-id-001', pageId: 'page-id-001', text: 'Tavern' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('create — auto-link branch with journalEntry in response', async () => {
    const r = await tool({
      note: { ...NOTE_VM, entryId: 'auto-journal-id', pageId: 'auto-page-id' },
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', x: 300, y: 400 },
      journalEntry: { id: 'auto-journal-id', firstPageId: 'auto-page-id' },
    }).execute({ action: 'create', sceneId: 'scene-id-001', x: 300, y: 400, journalContent: { name: 'Tavern Lore', pages: [{ type: 'text', name: 'Intro', text: { content: 'A cozy tavern.' } }] } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated note view', async () => {
    const r = await tool({
      note: { ...NOTE_VM, text: 'Updated Tavern', global: true },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', noteId: 'note-id-001', changes: { text: 'Updated Tavern', global: true } },
      changedFields: ['text', 'global'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', noteId: 'note-id-001', changes: { text: 'Updated Tavern', global: true } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation with remaining count', async () => {
    const r = await tool({
      deletedId: 'note-id-001',
      sceneId: 'scene-id-001',
      remainingNotes: 2,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', noteId: 'note-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single note view (B5-aware FK display)', async () => {
    const r = await tool({
      note: NOTE_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', noteId: 'note-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — stale FK note (entryLinked=false)', async () => {
    const r = await tool({
      note: { ...NOTE_VM, entryLinked: false, pageLinked: false },
    }).execute({ action: 'get', sceneId: 'scene-id-001', noteId: 'note-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated notes', async () => {
    const r = await tool({
      notes: [NOTE_LIST_ITEM],
      total: 1,
      page: 1,
      pageSize: 50,
      countOnly: false,
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    const r = await tool({
      notes: [],
      total: 4,
      page: 1,
      pageSize: 50,
      countOnly: true,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
