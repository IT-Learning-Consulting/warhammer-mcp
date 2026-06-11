// Phase 8 mcp_coverage_expansion — document-io schema tests (CCR-13).
//
// Tests: 3-action enum, documentType enum (8 values), confirm:z.literal(true) gate on
// import-as-new, strict unknown-key reject, missing required fields, happy-path parses
// per action, and tool-behavior round-trip for each action.

import { describe, it, expect, vi } from 'vitest';
import { DocumentIoToolInput } from '@foundry-mcp/shared';
import { DocumentIoTool } from '../tools/document-io.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn;
    }),
  };
  return new DocumentIoTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('DocumentIoToolInput schema', () => {
  it('action enum contains exactly the 3 document-io actions', () => {
    const actions = DocumentIoToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(['export', 'import-as-new', 'preview'].sort());
  });

  it('documentType enum contains exactly 8 types', () => {
    // All 3 variants share the same documentType enum — collect from union members.
    const typeValues = new Set<string>();
    for (const opt of DocumentIoToolInput.options) {
      const dtField = opt.shape.documentType;
      for (const v of dtField._def.values) {
        typeValues.add(v as string);
      }
    }
    expect([...typeValues].sort()).toEqual(
      ['Actor', 'Cards', 'Item', 'JournalEntry', 'Macro', 'Playlist', 'RollTable', 'Scene'].sort(),
    );
  });

  // ── export ──────────────────────────────────────────────────────────────────

  it('export requires documentType and id', () => {
    expect(() => DocumentIoToolInput.parse({ action: 'export' })).toThrow();
    expect(() => DocumentIoToolInput.parse({ action: 'export', documentType: 'Actor' })).toThrow();
    expect(() => DocumentIoToolInput.parse({ action: 'export', id: 'abc' })).toThrow();
  });

  it('export parses with documentType + id', () => {
    expect(() =>
      DocumentIoToolInput.parse({ action: 'export', documentType: 'Actor', id: 'abc123' }),
    ).not.toThrow();
  });

  it('export rejects an unknown documentType value', () => {
    expect(() =>
      DocumentIoToolInput.parse({ action: 'export', documentType: 'Adventure', id: 'abc' }),
    ).toThrow();
  });

  it('export rejects an unknown top-level key (strict)', () => {
    expect(() =>
      DocumentIoToolInput.parse({ action: 'export', documentType: 'Actor', id: 'abc', bogus: 1 }),
    ).toThrow();
  });

  // ── import-as-new ────────────────────────────────────────────────────────────

  it('import-as-new requires confirm:true (CCR-4)', () => {
    expect(() =>
      DocumentIoToolInput.parse({ action: 'import-as-new', documentType: 'Actor', data: {} }),
    ).toThrow();
    expect(() =>
      DocumentIoToolInput.parse({ action: 'import-as-new', documentType: 'Actor', data: {}, confirm: false }),
    ).toThrow();
    expect(() =>
      DocumentIoToolInput.parse({ action: 'import-as-new', documentType: 'Actor', data: {}, confirm: true }),
    ).not.toThrow();
  });

  it('import-as-new defaults preserveOwnership to false', () => {
    const parsed = DocumentIoToolInput.parse({
      action: 'import-as-new',
      documentType: 'Macro',
      data: { name: 'Test' },
      confirm: true,
    }) as any;
    expect(parsed.preserveOwnership).toBe(false);
  });

  it('import-as-new accepts optional preserveOwnership and targetFolderId', () => {
    expect(() =>
      DocumentIoToolInput.parse({
        action: 'import-as-new',
        documentType: 'Item',
        data: { name: 'Sword' },
        preserveOwnership: true,
        targetFolderId: 'folderabc',
        confirm: true,
      }),
    ).not.toThrow();
  });

  it('import-as-new rejects an unknown documentType', () => {
    expect(() =>
      DocumentIoToolInput.parse({
        action: 'import-as-new',
        documentType: 'Folder',
        data: {},
        confirm: true,
      }),
    ).toThrow();
  });

  it('import-as-new rejects an unknown top-level key (strict)', () => {
    expect(() =>
      DocumentIoToolInput.parse({
        action: 'import-as-new',
        documentType: 'Actor',
        data: {},
        confirm: true,
        bogusKey: 'x',
      }),
    ).toThrow();
  });

  // ── preview ──────────────────────────────────────────────────────────────────

  it('preview requires documentType and data', () => {
    expect(() => DocumentIoToolInput.parse({ action: 'preview' })).toThrow();
    expect(() => DocumentIoToolInput.parse({ action: 'preview', documentType: 'Actor' })).toThrow();
    expect(() =>
      DocumentIoToolInput.parse({ action: 'preview', documentType: 'Actor', data: {} }),
    ).not.toThrow();
  });

  it('preview does NOT require confirm (no CCR-4 on preview)', () => {
    // preview has no confirm field at all — the schema is strict, so passing confirm:true should fail.
    expect(() =>
      DocumentIoToolInput.parse({ action: 'preview', documentType: 'Scene', data: {}, confirm: true }),
    ).toThrow();
  });

  it('missing action is rejected', () => {
    expect(() => DocumentIoToolInput.parse({ documentType: 'Actor' })).toThrow();
  });
});

// ── Tool-behavior tests ─────────────────────────────────────────────────────

describe('DocumentIoTool behavior', () => {
  it('export formats the returned document JSON', async () => {
    const tool = makeTool({
      success: true,
      documentType: 'Actor',
      id: 'abc123',
      data: { _id: 'abc123', name: 'Lupus', type: 'character', system: {} },
    });
    const res: any = await tool.execute({
      action: 'export',
      documentType: 'Actor',
      id: 'abc123',
    } as any);
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toContain('abc123');
    expect(res.content[0].text).toContain('Lupus');
  });

  it('import-as-new formats the newId and idMap', async () => {
    const tool = makeTool({
      success: true,
      documentType: 'Macro',
      newId: 'newmacroid',
      oldId: 'oldmacroid',
      idMap: { oldmacroid: 'newmacroid' },
      warnings: ['@UUID links may break'],
    });
    const res: any = await tool.execute({
      action: 'import-as-new',
      documentType: 'Macro',
      data: { name: 'Test Macro', command: '// hello', type: 'script' },
      confirm: true,
    } as any);
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toContain('newmacroid');
    expect(res.content[0].text).toContain('oldmacroid');
  });

  it('preview formats embeddedCounts and uuidLinkCount', async () => {
    const tool = makeTool({
      success: true,
      documentType: 'Actor',
      name: 'Preview Actor',
      embeddedCounts: { items: 7, effects: 2 },
      hasFolder: false,
      hasOwnership: false,
      uuidLinkCount: 0,
      warnings: [],
    });
    const res: any = await tool.execute({
      action: 'preview',
      documentType: 'Actor',
      data: { name: 'Preview Actor', type: 'character', items: [] },
    } as any);
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toContain('Preview Actor');
    expect(res.content[0].text).toContain('items: 7');
  });

  it('surfaces a handler error as isError content', async () => {
    const tool = makeTool(null, 'DOCUMENT_IO_NOT_FOUND: Actor "badid" not found');
    const res: any = await tool.execute({
      action: 'export',
      documentType: 'Actor',
      id: 'badid',
    } as any);
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('DOCUMENT_IO_NOT_FOUND');
  });
});
