// Phase 3 mcp_crud_expansion — Journal handlers (umbrella, 13 actions).
//
// Foundry-side write/read surface for the `journal` MCP umbrella tool.
// Consolidates the 5 legacy handlers previously inlined in queries.ts
// (handleCreateJournalEntry / handleListJournals / handleGetJournalContent /
// handleUpdateJournalContent / handleDeleteJournalEntry) + the 4 data-access.ts
// methods (createJournalEntry / listJournals / getJournalContent /
// updateJournalContent — deleteJournalEntry was already a thin wrapper) into a
// single free-function module exporting 13 actions.
//
// CCR-Trust: every write function starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// BUG-070: every write handler pre-validates inputs + post-verifies the data
//          layer (entry.pages.size / entry.categories.size deltas; per-field
//          read-back on update-entry / update-page / update-category).
// F04 prevention: stripUndefined on every payload before createEmbeddedDocuments /
//                 updateEmbeddedDocuments to avoid present-with-undefined silent drops.
// CCR-Schema-Fidelity: input field paths mirror Foundry defineSchema 1:1.

import {
  ErrorTokens,
  JournalToolInput,
  type JournalToolInputType,
  type JournalCreateEntryInputType,
  type JournalUpdateEntryInputType,
  type JournalDeleteEntryInputType,
  type JournalListEntriesInputType,
  type JournalGetEntryInputType,
  type JournalAddPageInputType,
  type JournalUpdatePageInputType,
  type JournalDeletePageInputType,
  type JournalReorderPagesInputType,
  type JournalAddCategoryInputType,
  type JournalUpdateCategoryInputType,
  type JournalDeleteCategoryInputType,
  type JournalAssignPageToCategoryInputType,
  type JournalShowToPlayersInputType,
  type JournalDuplicateEntryInputType,
  type PageInputType,
  type JournalPagePayload,
  type JournalCategoryPayload,
  type JournalEntryDeepPayload,
  type JournalEntryShallowPayload,
  type JournalListEntryPayload,
  type JournalCreateEntryResponse,
  type JournalUpdateEntryResponse,
  type JournalDeleteEntryResponse,
  type JournalListEntriesResponse,
  type JournalGetEntryResponse,
  type JournalAddPageResponse,
  type JournalUpdatePageResponse,
  type JournalDeletePageResponse,
  type JournalReorderPagesResponse,
  type JournalAddCategoryResponse,
  type JournalUpdateCategoryResponse,
  type JournalDeleteCategoryResponse,
  type JournalAssignPageToCategoryResponse,
  type JournalShowToPlayersResponse,
  type JournalDuplicateEntryResponse,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
// R2.2 dedup: canonical deepStripUndefined (was a local byte-identical copy).
import { deepStripUndefined } from '../utils/embeddedCRUDFactory.js';

// ── Local types ──────────────────────────────────────────────────────────────

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

// ── Access gate ──────────────────────────────────────────────────────────────

function validateGMAccess(): AccessGate {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// F04 mitigation: strip undefined keys so Foundry's `.default()` validators
// apply cleanly rather than silently dropping the embedded doc.
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

// Normalise a PageInputType into the shape Foundry's createEmbeddedDocuments
// expects. Applies text.format default = 1 (HTML) when format omitted. Maps
// subtype-specific fields verbatim — Foundry's defineSchema validators apply
// title/show/level defaults on its side, so we don't override here.
function normalisePageInput(page: PageInputType): Record<string, any> {
  const payload: Record<string, any> = {
    type: page.type,
    name: page.name,
    sort: page.sort,
    title: page.title,
    flags: page.flags,
    ownership: page.ownership,
    category: page.category,
  };

  switch (page.type) {
    case 'text': {
      // Apply text.format default = 1 (HTML) at the handler boundary so the
      // response shape is predictable. Foundry would default to HTML anyway
      // (verified via probe C — text.format default: 1).
      if (page.text) {
        payload.text = {
          content: page.text.content,
          format: page.text.format ?? 1,
          markdown: page.text.markdown,
        };
      } else {
        payload.text = { content: '', format: 1 };
      }
      break;
    }
    case 'image': {
      payload.src = page.src;
      if (page.image) payload.image = page.image;
      break;
    }
    case 'pdf': {
      payload.src = page.src;
      break;
    }
    case 'video': {
      if (page.src !== undefined) payload.src = page.src;
      if (page.video) payload.video = page.video;
      break;
    }
  }

  return deepStripUndefined(payload);
}

function serialisePage(page: any): JournalPagePayload {
  const out: JournalPagePayload = {
    id: page.id as string,
    type: page.type as string,
    name: page.name ?? '',
    sort: typeof page.sort === 'number' ? page.sort : 0,
    title: {
      show: page.title?.show ?? true,
      level: page.title?.level ?? 1,
    },
    category: (page.category as string | null | undefined) ?? null,
    flags: page.flags ?? {},
    ownership: page.ownership ?? {},
  };

  if (page.text) {
    out.text = {
      content: page.text.content ?? '',
      format: typeof page.text.format === 'number' ? page.text.format : 1,
      ...(page.text.markdown !== undefined ? { markdown: page.text.markdown as string } : {}),
    };
  }
  if (page.src !== undefined && page.src !== null) {
    out.src = page.src as string;
  }
  if (page.image && (page.image.caption || page.image.caption === '')) {
    out.image = { caption: page.image.caption };
  }
  if (page.video) {
    out.video = {
      autoplay: page.video.autoplay,
      loop: page.video.loop,
      width: page.video.width,
      height: page.video.height,
      volume: page.video.volume,
      timestamp: page.video.timestamp,
      controls: page.video.controls,
    };
  }
  return out;
}

function serialiseCategory(cat: any): JournalCategoryPayload {
  return {
    id: cat.id as string,
    name: cat.name ?? '',
    sort: typeof cat.sort === 'number' ? cat.sort : 0,
    flags: cat.flags ?? {},
  };
}

function serialiseEntryDeep(entry: any): JournalEntryDeepPayload {
  const pages = (entry.pages?.contents as any[] | undefined) ?? [];
  const categories = (entry.categories?.contents as any[] | undefined) ?? [];
  // Sort pages by sort ascending for predictable response ordering.
  const sortedPages = [...pages].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const sortedCategories = [...categories].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  return {
    id: entry.id as string,
    name: entry.name ?? '',
    folder: (entry.folder?.id as string | undefined) ?? null,
    sort: typeof entry.sort === 'number' ? entry.sort : 0,
    ownership: entry.ownership ?? {},
    flags: entry.flags ?? {},
    pages: sortedPages.map(serialisePage),
    categories: sortedCategories.map(serialiseCategory),
  };
}

function serialiseEntryShallow(entry: any): JournalEntryShallowPayload {
  const pages = (entry.pages?.contents as any[] | undefined) ?? [];
  const categories = (entry.categories?.contents as any[] | undefined) ?? [];
  return {
    id: entry.id as string,
    name: entry.name ?? '',
    pageIds: pages.map((p) => p.id as string),
    pageCount: pages.length,
    categoryCount: categories.length,
  };
}

function getEntryOrThrow(entryId: string): any {
  const entry = (game as any).journal?.get(entryId);
  if (!entry) {
    throw new Error(`JOURNAL_ENTRY_NOT_FOUND: no JournalEntry with id "${entryId}"`);
  }
  return entry;
}

function getPageOrThrow(entry: any, pageId: string): any {
  const page = entry.pages?.get(pageId);
  if (!page) {
    throw new Error(
      `JOURNAL_PAGE_NOT_FOUND: no JournalEntryPage with id "${pageId}" on entry "${entry.id}"`,
    );
  }
  return page;
}

function getCategoryOrThrow(entry: any, categoryId: string): any {
  const cat = entry.categories?.get(categoryId);
  if (!cat) {
    throw new Error(
      `JOURNAL_CATEGORY_NOT_FOUND: no JournalEntryCategory with id "${categoryId}" on entry "${entry.id}"`,
    );
  }
  return cat;
}

// ── 1. createEntry ───────────────────────────────────────────────────────────

export async function createEntry(
  data: unknown,
): Promise<Envelope<JournalCreateEntryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createEntry requires GM' };

  const input: JournalCreateEntryInputType = JournalCreateEntryInput_strict_parse(data);

  // Auto-increment page sort when omitted: [1000, 2000, 3000, ...].
  const pagePayloads: any[] = (input.pages ?? []).map((p, i) => {
    const normalised = normalisePageInput(p);
    if (normalised.sort === undefined) normalised.sort = (i + 1) * 1000;
    return normalised;
  });
  const categoryPayloads: any[] = (input.categories ?? []).map((c, i) =>
    deepStripUndefined({
      name: c.name,
      sort: c.sort ?? (i + 1) * 1000,
      flags: c.flags,
    }),
  );

  return wrappedWrite('journal.createEntry', async () => {
    const entryPayload: Record<string, any> = {
      name: input.name,
      folder: input.folder,
      sort: input.sort,
      ownership: input.ownership,
      flags: input.flags,
    };
    // Inline pages on create (Foundry supports embedded docs on top-level create).
    if (pagePayloads.length > 0) entryPayload.pages = pagePayloads;
    if (categoryPayloads.length > 0) entryPayload.categories = categoryPayloads;
    stripUndefined(entryPayload);

    const JournalEntryCls = (globalThis as any).JournalEntry as any;
    const entry = await JournalEntryCls.create(entryPayload);
    if (!entry) {
      throw new Error(ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED + ': JournalEntry.create returned null unexpectedly');
    }

    // BUG-070 post-verify: confirm embedded counts match input.
    const pagesAfter: number = entry.pages?.size ?? 0;
    if (pagesAfter !== pagePayloads.length) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: createEntry expected ${pagePayloads.length} embedded ` +
        `pages but persisted ${pagesAfter}. Foundry may have silently dropped one or more pages — ` +
        `check F12 console for validation errors.`,
      );
    }
    const categoriesAfter: number = entry.categories?.size ?? 0;
    if (categoriesAfter !== categoryPayloads.length) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: createEntry expected ${categoryPayloads.length} embedded ` +
        `categories but persisted ${categoriesAfter}.`,
      );
    }

    const pageIds = (entry.pages?.contents as any[] | undefined)?.map((p) => p.id as string) ?? [];
    const categoryIds =
      (entry.categories?.contents as any[] | undefined)?.map((c) => c.id as string) ?? [];

    notify.created('journal', entry.name as string, { uuid: (entry as any).uuid });

    return {
      success: true as const,
      data: {
        id: entry.id as string,
        name: entry.name as string,
        pageIds,
        categoryIds,
      },
    };
  });
}

// ── 2. updateEntry ──────────────────────────────────────────────────────────

export async function updateEntry(
  data: unknown,
): Promise<Envelope<JournalUpdateEntryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateEntry requires GM' };

  const input: JournalUpdateEntryInputType = JournalUpdateEntryInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);

  // BUG-075: Foundry's Document.update() mutates the input object (adding _id
  // and other internal keys). Snapshot the requested-changes shape BEFORE
  // calling update so the response echoes only what the caller asked to write.
  const requestedChanges = { ...input.changes };

  return wrappedWrite('journal.updateEntry', async () => {
    await entry.update(input.changes);

    // BUG-302: re-fetch from world collection after the write so the verify loop
    // reads persisted state, not the in-memory snapshot captured before the call.
    const fresh = (game as any).journal?.get(input.entryId);
    if (!fresh) {
      throw new Error(`${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: entry "${input.entryId}" disappeared after update()`);
    }

    // BUG-070 post-verify: re-read each requested field from fresh.
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      // ownership + flags are deep objects — verify keys exist post-write rather
      // than deep-equal (Foundry merges these).
      if (field === 'ownership' || field === 'flags') {
        const persisted = (fresh as any)[field];
        if (!persisted || typeof persisted !== 'object') {
          throw new Error(
            `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: ${field} expected an object post-update but found ` +
            `${typeof persisted}`,
          );
        }
        continue;
      }
      // BUG-302: folder is a ForeignDocumentField; the getter can lag. Compare
      // _source.folder (raw persisted ID string) instead of the resolved accessor.
      if (field === 'folder') {
        const persistedId = (fresh._source as any)?.folder ?? null;
        if (persistedId !== (requestedValue ?? null)) {
          throw new Error(
            `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: folder expected ${JSON.stringify(requestedValue)} but ` +
            `post-update _source.folder is ${JSON.stringify(persistedId)}`,
          );
        }
        continue;
      }
      const persistedValue = (fresh as any)[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
          `but post-update value is ${JSON.stringify(persistedValue)}.`,
        );
      }
    }

    notify.updated('journal', fresh.name as string, {
      summary: Object.keys(requestedChanges).join(', '),
      uuid: (fresh as any).uuid,
    });

    return {
      success: true as const,
      data: { entryId: input.entryId, changes: requestedChanges },
    };
  });
}

// ── 3. deleteEntry ──────────────────────────────────────────────────────────

export async function deleteEntry(
  data: unknown,
): Promise<Envelope<JournalDeleteEntryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteEntry requires GM' };

  const input: JournalDeleteEntryInputType = JournalDeleteEntryInput_strict_parse(data);

  return wrappedWrite('journal.deleteEntry', async () => {
    const entry = getEntryOrThrow(input.entryId);
    const entryName = entry.name as string;

    // Phase 10 cross-doc-fk cascade: clear inbound JournalEntry FKs (Scene.journal,
    // Note.entryId) BEFORE delete. Note: pages inside this entry are deleted by
    // Foundry cascade automatically; their inbound FKs (Note.pageId, Scene.journalEntryPage)
    // need explicit cascade only if cascade:true.
    let affectedDocs: import('@foundry-mcp/shared').FkAffectedDocEntry[] | undefined;
    if (input.cascade === true) {
      // R2.3: helper per sub-walk; compound fan-out (JournalEntry + each contained
      // page) preserved. affectedDocs order is identical to the prior inlined loop
      // (entry refs first, then page refs in page order) — targets are disjoint so
      // the cleared set/order is unchanged.
      const { clearInboundOrphansFor } = await import('./cross-doc-fk.js');
      affectedDocs = await clearInboundOrphansFor('JournalEntry', input.entryId);
      for (const p of (entry.pages?.contents ?? []) as any[]) {
        affectedDocs.push(...(await clearInboundOrphansFor('JournalEntryPage', p.id)));
      }
    }

    await entry.delete();
    // BUG-070 post-verify: confirm entry actually gone.
    if ((game as any).journal?.get(input.entryId)) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: entry "${input.entryId}" still present after delete()`,
      );
    }

    notify.deleted('journal', entryName);

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        ...(affectedDocs !== undefined ? { affectedDocs } : {}),
      },
    };
  });
}

// ── 4. listEntries ──────────────────────────────────────────────────────────

export async function listEntries(
  data: unknown,
): Promise<Envelope<JournalListEntriesResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: listEntries requires GM' };

  try {
  const input: JournalListEntriesInputType = JournalListEntriesInput_strict_parse(data);

  // Resolve filterQuests alias → filterTemplate: "quest".
  const filterTemplate =
    input.filterTemplate ?? (input.filterQuests === true ? 'quest' : undefined);

  const all: any[] = ((game as any).journal as any)?.contents ?? [];
  let filtered = all;
  if (filterTemplate) {
    const escapedTemplate = filterTemplate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${escapedTemplate}:`, 'i');
    filtered = filtered.filter((j) => re.test(j.name ?? ''));
  }
  if (input.folder !== undefined) {
    if (input.folder === null) {
      filtered = filtered.filter((j) => !j.folder);
    } else {
      filtered = filtered.filter((j) => (j.folder?.id ?? j.folder) === input.folder);
    }
  }

  const payload: JournalListEntryPayload[] = filtered.map((entry) => {
    const base: JournalListEntryPayload = {
      id: entry.id as string,
      name: entry.name ?? '',
      type: 'JournalEntry',
      pageCount: entry.pages?.size ?? 0,
    };
    if (input.includeContent === true) {
      const firstText = (entry.pages?.contents as any[] | undefined)?.find(
        (p) => p.type === 'text',
      );
      base.content = firstText?.text?.content ?? '';
    }
    return base;
  });

  return { success: true, data: payload };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'JOURNAL_LIST_ENTRIES_ERROR: unknown error' };
  }
}

// ── 5. getEntry ─────────────────────────────────────────────────────────────

export async function getEntry(data: unknown): Promise<Envelope<JournalGetEntryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: getEntry requires GM' };

  try {
  const input: JournalGetEntryInputType = JournalGetEntryInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);

  const payload: JournalGetEntryResponse =
    input.shallow === true ? serialiseEntryShallow(entry) : serialiseEntryDeep(entry);

  return { success: true, data: payload };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'JOURNAL_GET_ENTRY_ERROR: unknown error' };
  }
}

// ── 6. addPage ──────────────────────────────────────────────────────────────

export async function addPage(data: unknown): Promise<Envelope<JournalAddPageResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: addPage requires GM' };

  const input: JournalAddPageInputType = JournalAddPageInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);

  // Auto-increment sort when caller omits: maxExistingSort + 1000.
  const existing = (entry.pages?.contents as any[] | undefined) ?? [];
  const maxSort = existing.reduce(
    (acc: number, p: any) => Math.max(acc, typeof p.sort === 'number' ? p.sort : 0),
    0,
  );
  const payload = normalisePageInput(input.page);
  if (payload.sort === undefined) payload.sort = maxSort + 1000;

  const sizeBefore: number = entry.pages?.size ?? 0;

  return wrappedWrite('journal.addPage', async () => {
    const created = await entry.createEmbeddedDocuments('JournalEntryPage', [payload]);

    const sizeAfter: number = entry.pages?.size ?? 0;
    if (sizeAfter !== sizeBefore + 1) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: expected ${sizeBefore + 1} pages after addPage but ` +
        `found ${sizeAfter}. Foundry may have silently dropped the page — check F12 console.`,
      );
    }
    if (!created || created.length !== 1) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: addPage createEmbeddedDocuments returned ${created?.length ?? 0} ` +
        `pages (expected 1)`,
      );
    }

    notify.created('journal', created[0].name as string, {
      summary: `on ${entry.name}`,
      uuid: (created[0] as any).uuid,
    });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        pageId: created[0].id as string,
        type: created[0].type as string,
      },
    };
  });
}

// ── 7. updatePage ───────────────────────────────────────────────────────────

export async function updatePage(
  data: unknown,
): Promise<Envelope<JournalUpdatePageResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updatePage requires GM' };

  const input: JournalUpdatePageInputType = JournalUpdatePageInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);
  const page = getPageOrThrow(entry, input.pageId);

  // Validate subtype-specific fields against the page's actual type.
  if (input.changes.text && page.type !== 'text') {
    throw new Error(
      `JOURNAL_INVALID_PAGE_FIELD: page "${input.pageId}" type is "${page.type}"; "text" body ` +
      `only valid on text pages`,
    );
  }
  if (input.changes.image && page.type !== 'image') {
    throw new Error(
      `JOURNAL_INVALID_PAGE_FIELD: page "${input.pageId}" type is "${page.type}"; "image" body ` +
      `only valid on image pages`,
    );
  }
  if (input.changes.video && page.type !== 'video') {
    throw new Error(
      `JOURNAL_INVALID_PAGE_FIELD: page "${input.pageId}" type is "${page.type}"; "video" body ` +
      `only valid on video pages`,
    );
  }

  const changesPayload = deepStripUndefined({ ...input.changes });

  return wrappedWrite('journal.updatePage', async () => {
    await entry.updateEmbeddedDocuments('JournalEntryPage', [
      { _id: input.pageId, ...changesPayload },
    ]);

    // BUG-070 post-verify: re-fetch page and compare top-level fields.
    const updated = entry.pages?.get(input.pageId);
    if (!updated) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page "${input.pageId}" disappeared after updateEmbeddedDocuments`,
      );
    }
    if (input.changes.name !== undefined && updated.name !== input.changes.name) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page name expected ${JSON.stringify(input.changes.name)} but ` +
        `post-update value is ${JSON.stringify(updated.name)}`,
      );
    }
    if (input.changes.sort !== undefined && updated.sort !== input.changes.sort) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page sort expected ${input.changes.sort} but post-update ` +
        `value is ${updated.sort}`,
      );
    }
    if (input.changes.category !== undefined) {
      const persistedCat = (updated as any).category;
      const persistedCatId = persistedCat?.id ?? persistedCat ?? null;
      if (persistedCatId !== input.changes.category) {
        throw new Error(
          `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page category expected ${JSON.stringify(input.changes.category)} ` +
          `but post-update value is ${JSON.stringify(persistedCatId)}`,
        );
      }
    }
    // BUG-209: text.content — CN-1: read from _source (F08-safe); do NOT strict-compare
    // against raw input (Foundry sanitiseHtml strips <script>/on*/javascript: on ingest —
    // strict-equals would false-positive JOURNAL_WRITE_NOT_PERSISTED on legitimate sanitisation).
    if (input.changes.text?.content !== undefined) {
      const persistedContent = (updated as any)._source?.text?.content;
      if (persistedContent === null || persistedContent === undefined || persistedContent === '') {
        throw new Error(
          `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page text.content was cleared after updateEmbeddedDocuments ` +
          `(expected non-empty, got ${JSON.stringify(persistedContent)})`,
        );
      }
    }
    // PARITY-029 (updatePage half): flags + ownership — mirror updateEntry:356-367
    // (presence/object-type check; Foundry merges these maps, deep-equal is over-strict).
    for (const field of ['flags', 'ownership'] as const) {
      if ((input.changes as any)[field] !== undefined) {
        const persisted = (updated as any)[field];
        if (!persisted || typeof persisted !== 'object') {
          throw new Error(
            `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: ${field} expected an object post-update but found ${typeof persisted}`,
          );
        }
      }
    }

    notify.updated('journal', updated.name as string, {
      summary: `on ${entry.name}`,
      uuid: (updated as any).uuid,
    });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        pageId: input.pageId,
        changes: input.changes,
      },
    };
  });
}

// ── 8. deletePage ───────────────────────────────────────────────────────────

export async function deletePage(
  data: unknown,
): Promise<Envelope<JournalDeletePageResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deletePage requires GM' };

  const input: JournalDeletePageInputType = JournalDeletePageInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);
  const page = getPageOrThrow(entry, input.pageId); // throws if not found
  const pageName = (page as any).name as string;

  const sizeBefore: number = entry.pages?.size ?? 0;

  return wrappedWrite('journal.deletePage', async () => {
    // Phase 10 cross-doc-fk cascade: clear inbound JournalEntryPage FKs before delete.
    let affectedDocs: import('@foundry-mcp/shared').FkAffectedDocEntry[] | undefined;
    if (input.cascade === true) {
      // R2.3: extracted byte-identical walkInboundFor→clearOrphanRef→affectedDocs loop.
      const { clearInboundOrphansFor } = await import('./cross-doc-fk.js');
      affectedDocs = await clearInboundOrphansFor('JournalEntryPage', input.pageId);
    }

    await entry.deleteEmbeddedDocuments('JournalEntryPage', [input.pageId]);

    const sizeAfter: number = entry.pages?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: expected ${sizeBefore - 1} pages after deletePage but ` +
        `found ${sizeAfter}.`,
      );
    }
    if (entry.pages?.get(input.pageId)) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page "${input.pageId}" still present after deleteEmbeddedDocuments`,
      );
    }

    notify.deleted('journal', pageName, { summary: `from ${entry.name}` });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        pageId: input.pageId,
        ...(affectedDocs !== undefined ? { affectedDocs } : {}),
      },
    };
  });
}

// ── 9. reorderPages ─────────────────────────────────────────────────────────

export async function reorderPages(
  data: unknown,
): Promise<Envelope<JournalReorderPagesResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: reorderPages requires GM' };

  const input: JournalReorderPagesInputType = JournalReorderPagesInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);

  // Reject partial reorder (Q&A R3 lock).
  const currentSize: number = entry.pages?.size ?? 0;
  if (input.pageIds.length !== currentSize) {
    throw new Error(
      `JOURNAL_REORDER_INCOMPLETE: pageIds length (${input.pageIds.length}) must equal ` +
      `entry.pages.size (${currentSize}). Partial reorder rejected — pass the full ordered page list.`,
    );
  }
  // Reject duplicates.
  const seen = new Set<string>();
  for (const pid of input.pageIds) {
    if (seen.has(pid)) {
      throw new Error(`JOURNAL_REORDER_DUPLICATE: pageId "${pid}" appears twice in pageIds`);
    }
    seen.add(pid);
  }
  // Reject unknown pageIds.
  for (const pid of input.pageIds) {
    if (!entry.pages?.get(pid)) {
      throw new Error(
        `JOURNAL_PAGE_NOT_FOUND: no JournalEntryPage with id "${pid}" on entry "${input.entryId}"`,
      );
    }
  }

  // Auto-assign sort = (i+1) * 1000 to give consistent gaps for future inserts.
  const updates = input.pageIds.map((pid, i) => ({
    _id: pid,
    sort: (i + 1) * 1000,
  }));

  return wrappedWrite('journal.reorderPages', async () => {
    await entry.updateEmbeddedDocuments('JournalEntryPage', updates);

    // BUG-070 post-verify: assert each page's sort matches the requested value.
    for (const u of updates) {
      const page = entry.pages?.get(u._id);
      if (!page) {
        throw new Error(
          `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page "${u._id}" disappeared after reorderPages`,
        );
      }
      if (page.sort !== u.sort) {
        throw new Error(
          `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page "${u._id}" sort expected ${u.sort} but post-update ` +
          `value is ${page.sort}`,
        );
      }
    }

    notify.updated('journal', entry.name as string, {
      summary: `reordered ${input.pageIds.length} pages`,
    });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        pageCount: input.pageIds.length,
        pageIds: input.pageIds,
      },
    };
  });
}

// ── 10. addCategory ─────────────────────────────────────────────────────────

export async function addCategory(
  data: unknown,
): Promise<Envelope<JournalAddCategoryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: addCategory requires GM' };

  const input: JournalAddCategoryInputType = JournalAddCategoryInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);

  const existing = (entry.categories?.contents as any[] | undefined) ?? [];
  const maxSort = existing.reduce(
    (acc: number, c: any) => Math.max(acc, typeof c.sort === 'number' ? c.sort : 0),
    0,
  );
  const payload = deepStripUndefined({
    name: input.name,
    sort: input.sort ?? maxSort + 1000,
    flags: input.flags,
  });
  const sizeBefore: number = entry.categories?.size ?? 0;

  return wrappedWrite('journal.addCategory', async () => {
    const created = await entry.createEmbeddedDocuments('JournalEntryCategory', [payload]);

    const sizeAfter: number = entry.categories?.size ?? 0;
    if (sizeAfter !== sizeBefore + 1) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: expected ${sizeBefore + 1} categories after addCategory ` +
        `but found ${sizeAfter}.`,
      );
    }
    if (!created || created.length !== 1) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: addCategory createEmbeddedDocuments returned ` +
        `${created?.length ?? 0} categories (expected 1)`,
      );
    }

    notify.created('journal', created[0].name as string, {
      summary: `category on ${entry.name}`,
      uuid: (created[0] as any).uuid,
    });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        categoryId: created[0].id as string,
        name: created[0].name as string,
      },
    };
  });
}

// ── 11. updateCategory ──────────────────────────────────────────────────────

export async function updateCategory(
  data: unknown,
): Promise<Envelope<JournalUpdateCategoryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed)
    return { success: false, error: 'Access denied: updateCategory requires GM' };

  const input: JournalUpdateCategoryInputType = JournalUpdateCategoryInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);
  getCategoryOrThrow(entry, input.categoryId);

  const changesPayload = deepStripUndefined({ ...input.changes });

  return wrappedWrite('journal.updateCategory', async () => {
    await entry.updateEmbeddedDocuments('JournalEntryCategory', [
      { _id: input.categoryId, ...changesPayload },
    ]);

    const updated = entry.categories?.get(input.categoryId);
    if (!updated) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: category "${input.categoryId}" disappeared after ` +
        `updateEmbeddedDocuments`,
      );
    }
    if (input.changes.name !== undefined && updated.name !== input.changes.name) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: category name expected ${JSON.stringify(input.changes.name)} ` +
        `but post-update value is ${JSON.stringify(updated.name)}`,
      );
    }
    if (input.changes.sort !== undefined && updated.sort !== input.changes.sort) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: category sort expected ${input.changes.sort} but ` +
        `post-update value is ${updated.sort}`,
      );
    }
    // BUG-211 + PARITY-029 (updateCategory half): flags presence/object-type check
    // mirrors updateEntry:356-367. Note: derived flags defaults to {} so this is
    // primarily parity-restoration; a stronger per-key _source check is a future follow-up.
    if (input.changes.flags !== undefined) {
      const persisted = (updated as any).flags;
      if (!persisted || typeof persisted !== 'object') {
        throw new Error(
          `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: flags expected an object post-update but found ${typeof persisted}`,
        );
      }
    }

    notify.updated('journal', updated.name as string, {
      summary: `category on ${entry.name}`,
    });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        categoryId: input.categoryId,
        changes: input.changes,
      },
    };
  });
}

// ── 12. deleteCategory ──────────────────────────────────────────────────────

export async function deleteCategory(
  data: unknown,
): Promise<Envelope<JournalDeleteCategoryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed)
    return { success: false, error: 'Access denied: deleteCategory requires GM' };

  const input: JournalDeleteCategoryInputType = JournalDeleteCategoryInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);
  const cat = getCategoryOrThrow(entry, input.categoryId);
  const catName = (cat as any).name as string;

  const sizeBefore: number = entry.categories?.size ?? 0;

  // BUG-072 cascade: collect pages whose `category` FK references the doomed
  // category. JournalEntryPage.category is a DocumentIdField (string FK); we
  // clear it to null before deleting the category so post-state never carries
  // orphan FKs.
  const affectedPageIds: string[] = entry.pages
    ? Array.from(entry.pages.values())
        .filter((p: any) => {
          const cat = p?.category;
          const catId = cat?.id ?? cat ?? null;
          return catId === input.categoryId;
        })
        .map((p: any) => p.id as string)
    : [];

  return wrappedWrite('journal.deleteCategory', async () => {
    if (affectedPageIds.length > 0) {
      await entry.updateEmbeddedDocuments(
        'JournalEntryPage',
        affectedPageIds.map((id) => ({ _id: id, category: null })),
      );
      // Post-verify each affected page's FK is cleared BEFORE we delete the
      // category — keeps the error message diagnostic.
      for (const id of affectedPageIds) {
        const p: any = entry.pages?.get(id);
        const cat = p?.category;
        const catId = cat?.id ?? cat ?? null;
        if (catId !== null) {
          throw new Error(
            `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page "${id}" still references category ` +
            `${JSON.stringify(input.categoryId)} after cascade-clear ` +
            `(post-update value: ${JSON.stringify(catId)})`,
          );
        }
      }
    }

    await entry.deleteEmbeddedDocuments('JournalEntryCategory', [input.categoryId]);

    const sizeAfter: number = entry.categories?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: expected ${sizeBefore - 1} categories after deleteCategory ` +
        `but found ${sizeAfter}.`,
      );
    }
    if (entry.categories?.get(input.categoryId)) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: category "${input.categoryId}" still present after delete`,
      );
    }

    notify.deleted('journal', catName, { summary: `category from ${entry.name}` });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        categoryId: input.categoryId,
        affectedPages: affectedPageIds,
      },
    };
  });
}

// ── 13. assignPageToCategory ────────────────────────────────────────────────

export async function assignPageToCategory(
  data: unknown,
): Promise<Envelope<JournalAssignPageToCategoryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed)
    return { success: false, error: 'Access denied: assignPageToCategory requires GM' };

  const input: JournalAssignPageToCategoryInputType =
    JournalAssignPageToCategoryInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);
  getPageOrThrow(entry, input.pageId);
  // Validate categoryId references a real category on this entry (null = UNASSIGN).
  if (input.categoryId !== null) {
    getCategoryOrThrow(entry, input.categoryId);
  }

  return wrappedWrite('journal.assignPageToCategory', async () => {
    await entry.updateEmbeddedDocuments('JournalEntryPage', [
      { _id: input.pageId, category: input.categoryId },
    ]);

    const updated = entry.pages?.get(input.pageId);
    if (!updated) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page "${input.pageId}" disappeared after assignPageToCategory`,
      );
    }
    const persistedCat = (updated as any).category;
    const persistedCatId = persistedCat?.id ?? persistedCat ?? null;
    if (persistedCatId !== input.categoryId) {
      throw new Error(
        `${ErrorTokens.JOURNAL_WRITE_NOT_PERSISTED}: page category expected ${JSON.stringify(input.categoryId)} ` +
        `but post-update value is ${JSON.stringify(persistedCatId)}`,
      );
    }

    notify.updated('journal', updated.name as string, { summary: 'reassigned' });

    return {
      success: true as const,
      data: {
        entryId: input.entryId,
        pageId: input.pageId,
        categoryId: input.categoryId,
      },
    };
  });
}

// ── Phase 9B — show-to-players (transient) + duplicate-entry (persisted) ──────

// R9B.1 — JournalEntry#show(true): socket broadcast to players. CCR-2b transient.
export async function showToPlayers(
  data: unknown,
): Promise<Envelope<JournalShowToPlayersResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: showToPlayers requires GM' };

  const input: JournalShowToPlayersInputType = JournalShowToPlayersInput_strict_parse(data);
  const entry = getEntryOrThrow(input.entryId);

  // CCR-2b transient: force=true shows to every connected player; no DB write.
  await entry.show(true);

  notify.info(`Showed journal "${entry.name}" to players`);

  return {
    success: true as const,
    data: {
      entryId: entry.id as string,
      name: entry.name as string,
      shown: true,
    },
  };
}

// R9B.2 — duplicate-entry: clone the JournalEntry (entry.clone({}, {save:true})). CCR-2a.
export async function duplicateEntry(
  data: unknown,
): Promise<Envelope<JournalDuplicateEntryResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: duplicateEntry requires GM' };

  const input: JournalDuplicateEntryInputType = JournalDuplicateEntryInput_strict_parse(data);
  const source = getEntryOrThrow(input.entryId);
  const sourceId = source.id as string;

  return wrappedWrite('journal.duplicateEntry', async () => {
    const clone = await source.clone({ name: `${source.name} (Copy)` }, { save: true });
    if (!clone) {
      throw new Error('JOURNAL_DUPLICATE_FAILED: JournalEntry.clone returned null');
    }

    // CCR-2a: re-read the new entry from game.journal.
    const persisted = (game as any).journal?.get(clone.id);
    if (!persisted || persisted.id === sourceId) {
      throw new Error(
        `JOURNAL_DUPLICATE_FAILED: cloned entry "${clone.id}" missing or equals source id`,
      );
    }

    notify.created('journal', persisted.name as string, {
      summary: `duplicated from ${source.name}`,
    });

    return {
      success: true as const,
      data: {
        sourceId,
        newId: persisted.id as string,
        name: persisted.name as string,
      },
    };
  });
}

// ── Dispatch entry point (single registration in queries.ts) ────────────────

/**
 * Dispatch a `journal` umbrella request to the appropriate handler.
 *
 * queries.ts registers a single `CONFIG.queries[`${MODULE_ID}.journal`]` key
 * that forwards here. The discriminated-union schema enforces shape; this
 * function routes on `action`.
 */
export async function dispatchJournal(data: unknown): Promise<Envelope<unknown>> {
  // Parse-and-dispatch. The strict parse here is the boundary that turns
  // unknown wire data into the typed JournalToolInputType.
  let input: JournalToolInputType;
  try {
    input = JournalToolInput.parse(data ?? {});
  } catch (err) {
    return {
      success: false,
      error: `JOURNAL_INVALID_INPUT: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  switch (input.action) {
    case 'create-entry':
      return createEntry(input);
    case 'update-entry':
      return updateEntry(input);
    case 'delete-entry':
      return deleteEntry(input);
    case 'list-entries':
      return listEntries(input);
    case 'get-entry':
      return getEntry(input);
    case 'add-page':
      return addPage(input);
    case 'update-page':
      return updatePage(input);
    case 'delete-page':
      return deletePage(input);
    case 'reorder-pages':
      return reorderPages(input);
    case 'add-category':
      return addCategory(input);
    case 'update-category':
      return updateCategory(input);
    case 'delete-category':
      return deleteCategory(input);
    case 'assign-page-to-category':
      return assignPageToCategory(input);
    case 'show-to-players':
      return showToPlayers(input);
    case 'duplicate-entry':
      return duplicateEntry(input);
  }
}

// ── Per-handler strict-parse wrappers ───────────────────────────────────────
//
// Each handler accepts `data: unknown` so the foundry-module call boundary
// stays untyped. The dispatch path above already validates input via
// JournalToolInput.parse, but each handler is also callable directly (tests,
// internal composition) so it re-parses against its specific schema.

import {
  JournalCreateEntryInput,
  JournalUpdateEntryInput,
  JournalDeleteEntryInput,
  JournalListEntriesInput,
  JournalGetEntryInput,
  JournalAddPageInput,
  JournalUpdatePageInput,
  JournalDeletePageInput,
  JournalReorderPagesInput,
  JournalAddCategoryInput,
  JournalUpdateCategoryInput,
  JournalDeleteCategoryInput,
  JournalAssignPageToCategoryInput,
  JournalShowToPlayersInput,
  JournalDuplicateEntryInput,
} from '@foundry-mcp/shared';

function JournalCreateEntryInput_strict_parse(data: unknown): JournalCreateEntryInputType {
  return JournalCreateEntryInput.strict().parse(data ?? {});
}
function JournalUpdateEntryInput_strict_parse(data: unknown): JournalUpdateEntryInputType {
  return JournalUpdateEntryInput.strict().parse(data ?? {});
}
function JournalDeleteEntryInput_strict_parse(data: unknown): JournalDeleteEntryInputType {
  return JournalDeleteEntryInput.strict().parse(data ?? {});
}
function JournalListEntriesInput_strict_parse(data: unknown): JournalListEntriesInputType {
  return JournalListEntriesInput.strict().parse(data ?? {});
}
function JournalGetEntryInput_strict_parse(data: unknown): JournalGetEntryInputType {
  return JournalGetEntryInput.strict().parse(data ?? {});
}
function JournalAddPageInput_strict_parse(data: unknown): JournalAddPageInputType {
  return JournalAddPageInput.strict().parse(data ?? {});
}
function JournalUpdatePageInput_strict_parse(data: unknown): JournalUpdatePageInputType {
  return JournalUpdatePageInput.strict().parse(data ?? {});
}
function JournalDeletePageInput_strict_parse(data: unknown): JournalDeletePageInputType {
  return JournalDeletePageInput.strict().parse(data ?? {});
}
function JournalReorderPagesInput_strict_parse(data: unknown): JournalReorderPagesInputType {
  return JournalReorderPagesInput.strict().parse(data ?? {});
}
function JournalAddCategoryInput_strict_parse(data: unknown): JournalAddCategoryInputType {
  return JournalAddCategoryInput.strict().parse(data ?? {});
}
function JournalUpdateCategoryInput_strict_parse(data: unknown): JournalUpdateCategoryInputType {
  return JournalUpdateCategoryInput.strict().parse(data ?? {});
}
function JournalDeleteCategoryInput_strict_parse(data: unknown): JournalDeleteCategoryInputType {
  return JournalDeleteCategoryInput.strict().parse(data ?? {});
}
function JournalAssignPageToCategoryInput_strict_parse(
  data: unknown,
): JournalAssignPageToCategoryInputType {
  return JournalAssignPageToCategoryInput.strict().parse(data ?? {});
}
function JournalShowToPlayersInput_strict_parse(data: unknown): JournalShowToPlayersInputType {
  return JournalShowToPlayersInput.strict().parse(data ?? {});
}
function JournalDuplicateEntryInput_strict_parse(data: unknown): JournalDuplicateEntryInputType {
  return JournalDuplicateEntryInput.strict().parse(data ?? {});
}
