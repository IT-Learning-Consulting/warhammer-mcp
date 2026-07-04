// FACTORY-EXEMPT: B5 FK resolver
//   note.ts owns resolveNoteLinks (cross-collection scan for stale FKs that
//   might be page UUIDs). Outside the factory's clean CRUD contract.
//   F08 _source pattern retrofitted in-place (Phase 6.2.7 B1).
//
// Phase 5 mcp_crud_expansion — Note (map-pin) handlers (umbrella, 5 actions).
//
// CCR-Trust: validateGMAccess() on every write.
// CCR-Transactions: wrappedWrite('note.<name>', ...).
// CCR-Envelope: returns {success, data} | {success, error}.
// CCR-Schema-Fidelity: Phase 0 probe-locked (phase5_probes.md §Note).
// DP-16: re-read via getEmbeddedOrThrow(scene, 'notes', id, 'Note') after every write.
// BUG-075: snapshot requestedChanges BEFORE every mutating call.
//
// FK-orphan recovery (carry-forward §38-39 + B5):
//   - entryId is a ForeignDocumentField; foundry getter returns null when target
//     missing, but _source.entryId retains the stale ID.
//   - B5 (older Foundry data): entryId may point at a JournalEntryPage UUID
//     rather than a JournalEntry. Resolution probes both game.journal.get(entryId)
//     AND scans `j.pages.has(entryId)` across entries before declaring orphan.

import {
  ErrorTokens,
  NoteToolInput,
  NoteCreateInput,
  NoteUpdateInput,
  NoteDeleteInput,
  NoteGetInput,
  NoteListInput,
  type NoteToolInputType,
  type NoteCreateInputType,
  type NoteUpdateInputType,
  type NoteDeleteInputType,
  type NoteGetInputType,
  type NoteListInputType,
  type NoteViewModel,
  type NoteListItem,
  formatFKLink,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';
import { notify } from '../notify.js';
// R2.2 dedup: canonical deepStripUndefined (was a local byte-identical copy).
import { deepStripUndefined, validateGMAccess, getSceneOrThrow } from '../utils/embeddedCRUDFactory.js';

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

export interface NoteCreateResponse {
  note: NoteViewModel;
  requestedChanges: Record<string, unknown>;
  // Phase 6.4 — populated when the auto-link branch ({journalContent}) is used.
  journalEntry?: { id: string; firstPageId: string | null };
}

export interface NoteUpdateResponse {
  note: NoteViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

export interface NoteDeleteResponse {
  deletedId: string;
  sceneId: string;
  remainingNotes: number;
}

export interface NoteGetResponse {
  note: NoteViewModel;
}

export interface NoteListResponse {
  notes: NoteListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: false;
  filterApplied?: string | null;
}
// BUG-435: canonical LEAN countOnly shape.
export interface NoteListCountResponse {
  total: number;
  filterApplied: string | null;
  countOnly: true;
}

export type NoteResponse =
  | NoteCreateResponse
  | NoteUpdateResponse
  | NoteDeleteResponse
  | NoteGetResponse
  | NoteListResponse
  | NoteListCountResponse;

function getActiveSceneOrThrow(): any {
  const scene = (game as any).scenes?.active;
  if (!scene) throw new Error('NO_ACTIVE_SCENE: no scene is currently active');
  return scene;
}

// ── FK-resolution helpers (B5-aware) ────────────────────────────────────────

interface JournalLinkResolution {
  entryId: string | null;
  entryLinked: boolean;
  pageId: string | null;
  pageLinked: boolean;
}

function resolveNoteLinks(entryIdRaw: string | null, pageIdRaw: string | null): JournalLinkResolution {
  const journals = (game as any).journal;
  const entryLink = formatFKLink(entryIdRaw, journals);

  // B5: if entryId resolves AND pageId is set, check the page exists on the entry.
  // If entryId is set but does NOT resolve, also check whether it points at a Page
  // (older Foundry data class). If so, surface pageId from that.
  let pageId: string | null = pageIdRaw ?? null;
  let pageLinked = false;

  if (entryLink.linked && pageId) {
    const entry = journals?.get?.(entryLink.id) as any;
    pageLinked = Boolean(entry?.pages?.get?.(pageId));
  } else if (!entryLink.linked && entryIdRaw) {
    // B5: scan entries for a page with this id (entryIdRaw might actually be a page UUID).
    const entries = journals ? (Array.from(journals.values?.() ?? []) as any[]) : [];
    for (const entry of entries) {
      if (entry?.pages?.get?.(entryIdRaw)) {
        // The entryId field is actually pointing at a page; the host journal is the real entry.
        return {
          entryId: entry.id as string,
          entryLinked: true,
          pageId: entryIdRaw,
          pageLinked: true,
        };
      }
    }
  }

  return {
    entryId: entryLink.id,
    entryLinked: entryLink.linked,
    pageId,
    pageLinked,
  };
}

// ── Serializers ──────────────────────────────────────────────────────────────

function serializeNoteViewModel(scene: any, note: any): NoteViewModel {
  const src = note._source ?? {};
  const links = resolveNoteLinks(
    (src.entryId ?? note.entryId) as string | null,
    (src.pageId ?? note.pageId) as string | null,
  );

  return {
    id: note.id as string,
    sceneId: scene.id as string,
    entryId: links.entryId,
    pageId: links.pageId,
    entryLinked: links.entryLinked,
    pageLinked: links.pageLinked,
    x: (note.x as number) ?? 0,
    y: (note.y as number) ?? 0,
    elevation: (note.elevation as number) ?? 0,
    sort: (note.sort as number) ?? 0,
    texture: {
      src: (note.texture?.src as string | null) ?? null,
      anchorX: (note.texture?.anchorX as number) ?? 0.5,
      anchorY: (note.texture?.anchorY as number) ?? 0.5,
      offsetX: (note.texture?.offsetX as number) ?? 0,
      offsetY: (note.texture?.offsetY as number) ?? 0,
      fit: (note.texture?.fit as string) ?? 'contain',
      scaleX: (note.texture?.scaleX as number) ?? 1,
      scaleY: (note.texture?.scaleY as number) ?? 1,
      rotation: (note.texture?.rotation as number) ?? 0,
      tint: (note.texture?.tint as string) ?? '#ffffff',
      alphaThreshold: (note.texture?.alphaThreshold as number) ?? 0,
    },
    iconSize: (note.iconSize as number) ?? 40,
    text: (note.text as string | null) ?? null,
    fontFamily: (note.fontFamily as string) ?? '',
    fontSize: (note.fontSize as number) ?? 32,
    textAnchor: (note.textAnchor as number) ?? 1,
    textColor: (note.textColor as string) ?? '#ffffff',
    global: Boolean(note.global),
    flags: (note.flags as Record<string, unknown>) ?? {},
  };
}

function serializeNoteListItem(scene: any, note: any): NoteListItem {
  const src = note._source ?? {};
  const links = resolveNoteLinks(
    (src.entryId ?? note.entryId) as string | null,
    (src.pageId ?? note.pageId) as string | null,
  );
  return {
    id: note.id as string,
    sceneId: scene.id as string,
    entryId: links.entryId,
    entryLinked: links.entryLinked,
    pageLinked: links.pageLinked,
    text: (note.text as string | null) ?? null,
  };
}

// ── 1. createNote ────────────────────────────────────────────────────────────

export async function createNote(data: unknown): Promise<Envelope<NoteCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createNote requires GM' };

  const input: NoteCreateInputType = NoteCreateInput_strict_parse(data);

  // Phase 6.4 branch-ambiguity check: schema can't refine because the union is
  // discriminated; runtime guard here.
  if (input.entryId && input.journalContent) {
    return {
      success: false,
      error: 'NOTE_BRANCH_AMBIGUOUS: pass either {entryId, pageId?} OR {journalContent}, never both',
    };
  }

  const scene = getSceneOrThrow(input.sceneId);

  const { action: _action, sceneId: _sceneId, journalContent, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest, ...(journalContent ? { journalContent } : {}) };

  return wrappedWrite('note.create', async () => {
    // Phase 6.4 auto-link branch: create JournalEntry first, then note with new IDs.
    let autoCreatedEntry: { id: string; firstPageId: string | null } | undefined;
    // Widened to plain string: these start as the branded input ids (JournalEntryId /
    // JournalEntryPageId — branded ⊂ string) but may be reassigned with a freshly-created
    // entry's raw Foundry id below; the value only flows into the untyped Note payload.
    let resolvedEntryId: string | null | undefined = rest.entryId;
    let resolvedPageId: string | null | undefined = rest.pageId;

    if (journalContent) {
      const JournalEntry: any = (globalThis as any).JournalEntry;
      if (!JournalEntry?.create) {
        throw new Error('JOURNAL_API_UNAVAILABLE: globalThis.JournalEntry.create missing');
      }
      const newEntry = await JournalEntry.create({
        name: journalContent.name,
        pages: journalContent.pages,
      });
      if (!newEntry?.id) {
        throw new Error('JOURNAL_CREATE_FAILED: JournalEntry.create returned no document');
      }
      const firstPageId =
        (newEntry.pages?.contents?.[0]?.id as string | undefined) ??
        (newEntry.pages?.values?.()?.next?.()?.value?.id as string | undefined) ??
        null;
      resolvedEntryId = newEntry.id as string;
      resolvedPageId = firstPageId ?? null;
      autoCreatedEntry = { id: newEntry.id as string, firstPageId };
    }

    // Build the note payload using resolved (or caller-supplied) IDs.
    const notePayload = {
      ...rest,
      entryId: resolvedEntryId,
      pageId: resolvedPageId,
    };
    const payload = deepStripUndefined(notePayload);
    const created = await scene.createEmbeddedDocuments('Note', [payload]);
    if (!created || created.length === 0) {
      throw new Error(ErrorTokens.NOTE_WRITE_NOT_PERSISTED + ': createEmbeddedDocuments returned no doc');
    }
    const persisted = getEmbeddedOrThrow<any>(scene, 'notes', created[0].id, 'Note');

    notify.created(
      'note',
      persisted.text ?? `Note @(${persisted.x},${persisted.y})`,
      { summary: `on scene ${input.sceneId}` },
    );

    return {
      success: true as const,
      data: {
        note: serializeNoteViewModel(scene, persisted),
        requestedChanges,
        ...(autoCreatedEntry ? { journalEntry: autoCreatedEntry } : {}),
      } satisfies NoteCreateResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 2. updateNote ────────────────────────────────────────────────────────────

export async function updateNote(data: unknown): Promise<Envelope<NoteUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateNote requires GM' };

  const input: NoteUpdateInputType = NoteUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const note = getEmbeddedOrThrow<any>(scene, 'notes', input.noteId, 'Note');

  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('note.update', async () => {
    const payload = deepStripUndefined({ ...input.changes });
    await note.update(payload);

    // BUG-303 (DP-16): re-fetch the note via getEmbeddedOrThrow so the verify loop
    // reads the freshly-persisted _source instead of the in-memory pre-update object.
    const fresh = getEmbeddedOrThrow<any>(scene, 'notes', input.noteId, 'Note');

    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      if (field === 'entryId' || field === 'pageId') {
        const persistedId = fresh._source?.[field] ?? null;
        if (persistedId !== (requestedValue ?? null)) {
          throw new Error(
            `${ErrorTokens.NOTE_WRITE_NOT_PERSISTED}: ${field} expected ${JSON.stringify(requestedValue)} ` +
              `but post-update is ${JSON.stringify(persistedId)}`,
          );
        }
        continue;
      }
      if (field === 'texture' || field === 'flags') {
        const persisted = (fresh._source as any)?.[field];
        if (persisted === undefined || persisted === null) {
          throw new Error(`${ErrorTokens.NOTE_WRITE_NOT_PERSISTED}: nested field "${field}" missing after update`);
        }
        continue;
      }
      // F08 fix (Phase 6.2.7 B1): compare against `_source` (raw stored data).
      const persistedValue = (fresh._source as any)?.[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `${ErrorTokens.NOTE_WRITE_NOT_PERSISTED}: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update _source value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    notify.updated(
      'note',
      (fresh.text as string | null) ?? `Note ${input.noteId}`,
      { summary: changedFields.join(', ') },
    );

    return {
      success: true as const,
      data: {
        note: serializeNoteViewModel(scene, fresh),
        requestedChanges,
        changedFields,
      } satisfies NoteUpdateResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 3. deleteNote ────────────────────────────────────────────────────────────

export async function deleteNote(data: unknown): Promise<Envelope<NoteDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteNote requires GM' };

  const input: NoteDeleteInputType = NoteDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const note = getEmbeddedOrThrow<any>(scene, 'notes', input.noteId, 'Note');
  const sizeBefore = scene.notes?.size ?? 0;
  const noteText = (note.text as string | null) ?? null;

  return wrappedWrite('note.delete', async () => {
    await note.delete();

    const post = scene.notes?.get(input.noteId);
    if (post) {
      throw new Error(`${ErrorTokens.NOTE_WRITE_NOT_PERSISTED}: note "${input.noteId}" still present after delete()`);
    }
    const sizeAfter = scene.notes?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `${ErrorTokens.NOTE_WRITE_NOT_PERSISTED}: scene.notes.size expected ${sizeBefore - 1} ` +
          `but found ${sizeAfter}`,
      );
    }

    notify.deleted('note', noteText ?? `Note ${input.noteId}`);

    return {
      success: true as const,
      data: {
        deletedId: input.noteId,
        sceneId: input.sceneId,
        remainingNotes: sizeAfter,
      } satisfies NoteDeleteResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 4. getNote ───────────────────────────────────────────────────────────────

export async function getNote(data: unknown): Promise<Envelope<NoteGetResponse>> {
  const input: NoteGetInputType = NoteGetInput_strict_parse(data);
  try {
    const scene = getSceneOrThrow(input.sceneId);
    const note = getEmbeddedOrThrow<any>(scene, 'notes', input.noteId, 'Note');
    return { success: true, data: { note: serializeNoteViewModel(scene, note) } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'getNote failed' };
  }
}

// ── 5. listNotes ─────────────────────────────────────────────────────────────

export async function listNotes(data: unknown): Promise<Envelope<NoteListResponse | NoteListCountResponse>> {
  const input: NoteListInputType = NoteListInput_strict_parse(data);
  try {
    const scene = input.sceneId ? getSceneOrThrow(input.sceneId) : getActiveSceneOrThrow();
    let notes: any[] = Array.from(scene.notes?.values?.() ?? []);

    const filterApplied = input.filter ?? null;
    if (filterApplied) {
      const needle = filterApplied.toLowerCase();
      notes = notes.filter((n) => ((n.text as string) ?? '').toLowerCase().includes(needle));
    }
    if (input.entryId) {
      notes = notes.filter((n) => (n._source?.entryId ?? n.entryId) === input.entryId);
    }
    if (input.onlyOrphaned === true) {
      const journals = (game as any).journal;
      notes = notes.filter((n) => {
        const rawEntryId = n._source?.entryId ?? n.entryId;
        if (!rawEntryId) return false;
        return !formatFKLink(rawEntryId as string, journals).linked;
      });
    }

    const total = notes.length;

    // BUG-435: countOnly returns the canonical LEAN {total, filterApplied, countOnly:true} shape.
    if (input.countOnly) {
      return {
        success: true,
        data: { total, filterApplied, countOnly: true } satisfies NoteListCountResponse,
      };
    }

    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 50;
    const items = notes.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: {
        notes: items.map((n) => serializeNoteListItem(scene, n)),
        total,
        page,
        pageSize,
        countOnly: false,
        filterApplied,
      } satisfies NoteListResponse,
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'listNotes failed' };
  }
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

export async function dispatchNote(data: unknown): Promise<Envelope<NoteResponse>> {
  let input: NoteToolInputType;
  try {
    input = NoteToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }
  switch (input.action) {
    case 'create':
      return createNote(input);
    case 'update':
      return updateNote(input);
    case 'delete':
      return deleteNote(input);
    case 'get':
      return getNote(input);
    case 'list':
      return listNotes(input);
    default: {
      const _exhaustive: never = input;
      throw new Error(`Unknown note action: ${(_exhaustive as any)?.action}`);
    }
  }
}

// ── Per-handler strict-parse wrappers ───────────────────────────────────────

function NoteCreateInput_strict_parse(data: unknown): NoteCreateInputType {
  return NoteCreateInput.parse(data ?? {});
}
function NoteUpdateInput_strict_parse(data: unknown): NoteUpdateInputType {
  return NoteUpdateInput.parse(data ?? {});
}
function NoteDeleteInput_strict_parse(data: unknown): NoteDeleteInputType {
  return NoteDeleteInput.parse(data ?? {});
}
function NoteGetInput_strict_parse(data: unknown): NoteGetInputType {
  return NoteGetInput.parse(data ?? {});
}
function NoteListInput_strict_parse(data: unknown): NoteListInputType {
  return NoteListInput.parse(data ?? {});
}
