// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 5A — module-tagger handler.
//
// 6-action umbrella: tag / untag / query / set-tags / clear-tags / check-tags
// All callable ops on window.Tagger routed through here.
//
// Design constraints (dossier §2, §7; SA1 research corrections):
//   - requireModuleActive('tagger') is the FIRST executable statement — RETURNS failure, never throws.
//   - tags is REQUIRED on tag/untag (Tagger.addTags/removeTags(docs, undefined) throw synchronously).
//   - sceneId must be passed explicitly on query — game.canvas.id may be null server-side.
//   - allScenes and sceneId are mutually exclusive.
//   - ignore/objects arrays must contain Documents (not UUIDs) — Tagger uses === comparison.
//   - returnObjects:true is NEVER passed — canvas PlaceableObjects don't exist server-side.
//   - Post-write: re-read getFlag('tagger','tags') per DP-16.
//   - GM-gated on all writes; reads also require GM for consistency.
//   - CCR-3: notify.updated on every write; no notify on reads.
//   - CCR-4: clear-tags with no tags arg requires confirm:true (bulk destructive).

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleTaggerInput, type ModuleTaggerInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';


// ── Local helpers ──────────────────────────────────────────────────────────────

function getTagger(): any {
  const t = (globalThis as any).Tagger;
  if (!t) throw new Error('TAGGER_API_UNAVAILABLE: window.Tagger is not bound — module may not have reached ready state');
  return t;
}

/** Resolve a UUID string to a Foundry Document object, or throw. */
function resolveUuid(uuid: string): any {
  const sync = (globalThis as any).fromUuidSync;
  if (typeof sync === 'function') {
    const doc = sync(uuid);
    if (doc) return doc;
  }
  throw new Error(`DOCUMENT_NOT_FOUND: cannot resolve UUID "${uuid}" to a Foundry Document`);
}

/** Resolve an array of UUID strings to Document objects. */
function resolveUuids(uuids: string[]): any[] {
  return uuids.map(resolveUuid);
}

/** Normalize the uuids input (string | string[]) to an array of resolved Documents. */
function normalizeDocs(uuids: string | string[]): any[] {
  const ids = Array.isArray(uuids) ? uuids : [uuids];
  return resolveUuids(ids);
}

/** Read the current tags off a document (post-write verify helper). */
function readCurrentTags(doc: any): string[] {
  return (doc.getFlag?.('tagger', 'tags') ?? []) as string[];
}

function serializeDoc(doc: any): { uuid: string; name: string | null; type: string | null } {
  return {
    uuid: doc.uuid ?? doc.id ?? '',
    name: doc.name ?? null,
    type: doc.documentName ?? null,
  };
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleTagger(data: unknown): Promise<any> {
  const g = requireModuleActive('tagger');
  if (g) return g;

  const parsed = ModuleTaggerInput.parse(data);

  switch (parsed.action) {
    case 'tag':        return handleTag(parsed);
    case 'untag':      return handleUntag(parsed);
    case 'query':      return handleQuery(parsed);
    case 'set-tags':   return handleSetTags(parsed);
    case 'clear-tags': return handleClearTags(parsed);
    case 'check-tags': return handleCheckTags(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-tagger action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── Write handlers ────────────────────────────────────────────────────────────

type TagInput = Extract<ModuleTaggerInputType, { action: 'tag' }>;

async function handleTag(input: TagInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can modify tags' };
  try {
    const Tagger = getTagger();
    const docs = normalizeDocs(input.uuids);
    if (input.toggle) {
      await Tagger.toggleTags(docs, input.tags);
    } else {
      await Tagger.addTags(docs, input.tags);
    }
    // BUG-308: verify every doc in the batch, not just docs[0]
    const allCurrentTags = docs.map((d) => ({ uuid: d.uuid as string, tags: readCurrentTags(d) }));
    const failures = allCurrentTags.filter((r) => input.tags.some((t) => !r.tags.includes(t)));
    if (failures.length > 0) {
      return { success: false, error: `TAGGER_VERIFY_FAILED: tag write not reflected on: ${failures.map((f) => f.uuid).join(', ')}` };
    }
    const currentTags = allCurrentTags[0]!.tags; // backward compat: first doc's tags
    notify.updated('tagger', `Tagged ${docs.length} doc(s): [${input.tags.join(', ')}]`, {});
    return {
      success: true,
      data: { documentsTagged: docs.length, tags: input.tags, toggled: Boolean(input.toggle), currentTags, allCurrentTags },
    };
  } catch (e) {
    return { success: false, error: `TAGGER_TAG_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type UntagInput = Extract<ModuleTaggerInputType, { action: 'untag' }>;

async function handleUntag(input: UntagInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can modify tags' };
  try {
    const Tagger = getTagger();
    const docs = normalizeDocs(input.uuids);
    await Tagger.removeTags(docs, input.tags);
    // BUG-308: verify every doc in the batch, not just docs[0]
    const allCurrentTags = docs.map((d) => ({ uuid: d.uuid as string, tags: readCurrentTags(d) }));
    const failures = allCurrentTags.filter((r) => input.tags.some((t) => r.tags.includes(t)));
    if (failures.length > 0) {
      return { success: false, error: `TAGGER_VERIFY_FAILED: untag write not reflected on: ${failures.map((f) => f.uuid).join(', ')}` };
    }
    const currentTags = allCurrentTags[0]!.tags; // backward compat: first doc's tags
    notify.updated('tagger', `Removed tags [${input.tags.join(', ')}] from ${docs.length} doc(s)`, {});
    return {
      success: true,
      data: { documentsUntagged: docs.length, removedTags: input.tags, currentTags, allCurrentTags },
    };
  } catch (e) {
    return { success: false, error: `TAGGER_UNTAG_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type SetTagsInput = Extract<ModuleTaggerInputType, { action: 'set-tags' }>;

async function handleSetTags(input: SetTagsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can set tags' };
  try {
    const Tagger = getTagger();
    const docs = normalizeDocs(input.uuids);
    await Tagger.setTags(docs, input.tags);
    if (input.applyRules) {
      await Tagger.applyTagRules(docs);
    }
    // BUG-308: verify every doc in the batch, not just docs[0]
    const allCurrentTags = docs.map((d) => ({ uuid: d.uuid as string, tags: readCurrentTags(d) }));
    const failures = allCurrentTags.filter((r) => !input.tags.every((t) => r.tags.includes(t)) || r.tags.some((t) => !input.tags.includes(t)));
    if (failures.length > 0) {
      return { success: false, error: `TAGGER_VERIFY_FAILED: set-tags write not reflected on: ${failures.map((f) => f.uuid).join(', ')}` };
    }
    const currentTags = allCurrentTags[0]!.tags; // backward compat: first doc's tags
    notify.updated('tagger', `Set tags on ${docs.length} doc(s): [${input.tags.join(', ')}]`, {});
    return {
      success: true,
      data: { documentsUpdated: docs.length, tags: input.tags, applyRules: Boolean(input.applyRules), currentTags, allCurrentTags },
    };
  } catch (e) {
    return { success: false, error: `TAGGER_SET_TAGS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type ClearTagsInput = Extract<ModuleTaggerInputType, { action: 'clear-tags' }>;

async function handleClearTags(input: ClearTagsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can clear tags' };

  // CCR-4: clearing ALL tags (no tags arg) is bulk-destructive — require confirm
  if (!input.tags && input.confirm !== true) {
    return {
      success: false,
      error: 'CONFIRM_REQUIRED: clear-tags with no tags arg removes ALL tags from all targeted documents. Re-send with confirm:true.',
    };
  }

  try {
    const Tagger = getTagger();
    const docs = normalizeDocs(input.uuids);

    if (input.tags && input.tags.length > 0) {
      await Tagger.removeTags(docs, input.tags);
    } else {
      await Tagger.clearAllTags(docs);
    }

    // BUG-308: verify every doc in the batch, not just docs[0]
    const allCurrentTags = docs.map((d) => ({ uuid: d.uuid as string, tags: readCurrentTags(d) }));
    const expectedEmpty = !input.tags || input.tags.length === 0;
    const failures = expectedEmpty
      ? allCurrentTags.filter((r) => r.tags.length > 0)
      : allCurrentTags.filter((r) => (input.tags as string[]).some((t) => r.tags.includes(t)));
    if (failures.length > 0) {
      return { success: false, error: `TAGGER_VERIFY_FAILED: clear-tags write not reflected on: ${failures.map((f) => f.uuid).join(', ')}` };
    }
    const currentTags = allCurrentTags[0]!.tags; // backward compat: first doc's tags
    const clearedDesc = input.tags ? `[${input.tags.join(', ')}]` : 'all tags';
    notify.updated('tagger', `Cleared ${clearedDesc} from ${docs.length} doc(s)`, {});
    return {
      success: true,
      data: { documentsCleared: docs.length, clearedTags: input.tags ?? 'all', currentTags, allCurrentTags },
    };
  } catch (e) {
    return { success: false, error: `TAGGER_CLEAR_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Read handlers ─────────────────────────────────────────────────────────────

type QueryInput = Extract<ModuleTaggerInputType, { action: 'query' }>;

async function handleQuery(input: QueryInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: tagger query requires GM access' };

  // SA1: allScenes and sceneId are mutually exclusive
  if (input.allScenes && input.sceneId) {
    return { success: false, error: 'INVALID_PARAMS: allScenes and sceneId are mutually exclusive — pass one or the other, not both' };
  }
  // SA1: sceneId required when not using allScenes (game.canvas.id may be null)
  if (!input.allScenes && !input.sceneId) {
    return { success: false, error: 'MISSING_SCENE_ID: sceneId is required when allScenes is not set — game.canvas.id may be null server-side' };
  }

  try {
    const Tagger = getTagger();

    const opts: Record<string, any> = {};
    if (input.matchAny !== undefined) opts.matchAny = input.matchAny;
    if (input.matchExactly !== undefined) opts.matchExactly = input.matchExactly;
    if (input.caseInsensitive !== undefined) opts.caseInsensitive = input.caseInsensitive;
    if (input.allScenes) {
      opts.allScenes = true;
    } else {
      opts.sceneId = input.sceneId;
    }
    // Resolve UUID strings to Documents for ignore/objects (Tagger uses === comparison)
    if (input.ignore && input.ignore.length > 0) opts.ignore = resolveUuids(input.ignore);
    if (input.objects && input.objects.length > 0) opts.objects = resolveUuids(input.objects);
    // returnObjects intentionally NOT set — never passed to Tagger from MCP

    const result = await Tagger.getByTag(input.tags, opts);

    if (input.allScenes) {
      const byScene: Record<string, ReturnType<typeof serializeDoc>[]> = {};
      for (const [sceneId, docs] of Object.entries(result as Record<string, any[]>)) {
        byScene[sceneId] = (docs as any[]).map(serializeDoc);
      }
      const totalCount = Object.values(byScene).reduce((s, d) => s + d.length, 0);
      return { success: true, data: { allScenes: true, byScene, totalCount } };
    } else {
      const docs = (result as any[]).map(serializeDoc);
      return { success: true, data: { sceneId: input.sceneId, documents: docs, count: docs.length } };
    }
  } catch (e) {
    return { success: false, error: `TAGGER_QUERY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type CheckTagsInput = Extract<ModuleTaggerInputType, { action: 'check-tags' }>;

async function handleCheckTags(input: CheckTagsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: tag checks require GM access' };

  try {
    const Tagger = getTagger();
    const docs = normalizeDocs(input.uuids);

    if (input.check) {
      // hasTags — boolean check
      const opts: Record<string, any> = {};
      if (input.matchAny !== undefined) opts.matchAny = input.matchAny;
      if (input.matchExactly !== undefined) opts.matchExactly = input.matchExactly;
      if (input.caseInsensitive !== undefined) opts.caseInsensitive = input.caseInsensitive;
      const hasTags = await Tagger.hasTags(docs, input.tags ?? [], opts);
      return { success: true, data: { hasTags: Boolean(hasTags), documentCount: docs.length } };
    } else {
      // getTags — returns full tag array per document
      const results = docs.map((doc: any) => ({
        uuid: doc.uuid ?? doc.id ?? '',
        name: doc.name ?? null,
        tags: readCurrentTags(doc),
      }));
      return { success: true, data: { documents: results } };
    }
  } catch (e) {
    return { success: false, error: `TAGGER_CHECK_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
