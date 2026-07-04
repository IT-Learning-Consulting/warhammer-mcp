// DIALOG-PATH: DIALOG_GUARDED — module header documents the EXCLUDED_UI_ONLY export/import ops (Dialog.prompt, token-attacher.js:2125) are never exposed as MCP actions; every action this handler DOES implement is a direct document/flag write.
// Module Integration v2 Phase 3A — module-token-attacher handler (Token Attacher v4.6.12, KayelGee).
//
// Always-registered umbrella. requireModuleActive('token-attacher', ['lib-wrapper']) is the FIRST
// executable statement — RETURNS the MODULE_NOT_ACTIVE / MODULE_DEPENDENCY_NOT_ACTIVE envelope, never
// throws (v1 Phase 1 contract). lib-wrapper is a declared hard dep (module.json).
//
// 5 actions (capability_audit/token-attacher.md + live source of token-attacher.js):
//   attach / detach / detach-all  — CANVAS-MANDATORY. The TA api reads PlaceableObject props
//     (_AttachToToken token-attacher.js:953-998: token.center/x/y/rotation/layer), so we resolve
//     baseTokenId + element ids → LIVE placeables (canvas.tokens.get / canvas.getLayerByEmbeddedName)
//     before calling window.tokenAttacher.* with suppress=true. Guarded by `canvas?.ready`
//     (TOKEN_ATTACHER_CANVAS_NOT_READY). After the write we RE-READ the base TokenDocument's
//     flags.token-attacher.attached and verify the element landed — `layerGetElement` silently drops
//     non-canvas ids (token-attacher.js:963), so the api can no-op without throwing → DP-16
//     (TOKEN_ATTACHER_NOT_PERSISTED).
//   query-attached / query-by-type — HEADLESS flag reads (canvas.scene.tokens.get(id).getFlag) —
//     no canvas render, no write, no verify (token-attacher.js:1449-1455).
//
// Surface accessor is `window.tokenAttacher.*` (set in initMacroAPI token-attacher.js:155-203,
// re-set on canvasReady :258) — NOT game.modules.get(id).api (carry-forward §1: handlers run in the
// GM browser, live globals are directly callable). We NEVER import a bundled-module internal by path
// (carry-forward §2). The EXCLUDED_UI_ONLY export/import ops (Dialog.prompt — token-attacher.js:2125/
// 2190) are never wrapped (HC-v2-6).
//
// Source of truth: .agents/research/module_integration/phase3_pre_plan.md §3A.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { TokenAttacherInput, type TokenAttacherInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM, getCanvas } from '../_shared/handler-utils.js';
import { settlePoll } from '../_shared/settle-poll.js';


const MODULE_ID = 'token-attacher';
const FLAG_SCOPE = 'token-attacher';

// ── Local helpers ──────────────────────────────────────────────────────────────

function tokenAttacherApi(): any {
  return (globalThis as any).window?.tokenAttacher ?? (globalThis as any).tokenAttacher;
}

/** Resolve the target scene (explicit sceneId else the active canvas scene). */
function resolveScene(sceneId: string | undefined): any | null {
  const canvas = getCanvas();
  if (sceneId) {
    const scene = (globalThis as any).game?.scenes?.get?.(sceneId);
    return scene ?? null;
  }
  return canvas?.scene ?? null;
}

/** Read flags.token-attacher.attached off a TokenDocument (headless — embedded collection getFlag). */
function readAttached(scene: any, baseTokenId: string): Record<string, string[]> {
  const tokenDoc = scene?.tokens?.get?.(baseTokenId);
  const attached = tokenDoc?.getFlag?.(FLAG_SCOPE, 'attached');
  return (attached ?? {}) as Record<string, string[]>;
}

function countAttached(map: Record<string, string[]>): number {
  return Object.values(map).reduce((n, ids) => n + (Array.isArray(ids) ? ids.length : 0), 0);
}

/**
 * Re-read flags.token-attacher.attached with a bounded retry until `predicate(map)` holds, then
 * return the final map (the caller asserts on it). Token Attacher's attach/detach api can RETURN
 * before its internal updateEmbeddedDocuments write propagates to the in-memory TokenDocument, so an
 * immediate single re-read races the write and can read the PRE-write map. This surfaced live as a
 * detach-all false-positive (2026-06-25 eval: handler threw NOT_PERSISTED while an independent
 * query-attached moments later showed total:0) — the classic fire-and-forget read-back trap
 * (feedback_module_method_wrap_gotchas). The race is latent in attach/detach too (they won it); this
 * settles all three. yields a macrotask between tries.
 */
async function readAttachedSettled(
  scene: any,
  baseTokenId: string,
  predicate: (map: Record<string, string[]>) => boolean,
  attempts = 5,
): Promise<Record<string, string[]>> {
  return settlePoll<Record<string, string[]>>(
    () => readAttached(scene, baseTokenId),
    predicate,
    attempts,
    20,
  );
}

/**
 * Resolve a placeable by document type + embedded id to its LIVE canvas PlaceableObject.
 * Token Attacher's attach path needs the placeable object (not the document) because _AttachToToken
 * reads canvas geometry. Returns null when the id is not on the active canvas layer.
 */
function getPlaceable(type: string, id: string): any | null {
  const canvas = getCanvas();
  // canvas.getLayerByEmbeddedName('Tile'|'AmbientLight'|...) → layer; .get(id) → PlaceableObject.
  const layer = canvas?.getLayerByEmbeddedName?.(type);
  return layer?.get?.(id) ?? null;
}

function getBasePlaceable(baseTokenId: string): any | null {
  return getCanvas()?.tokens?.get?.(baseTokenId) ?? null;
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

const WRITE_ACTIONS = new Set(['attach', 'detach', 'detach-all']);
const CANVAS_ACTIONS = new Set(['attach', 'detach', 'detach-all']);

export async function dispatchModuleTokenAttacher(data: unknown): Promise<Envelope<unknown>> {
  // Guard FIRST — RETURNS {success:false,error}; never throws. lib-wrapper is a hard dep.
  const guard = requireModuleActive(MODULE_ID, ['lib-wrapper']);
  if (guard) return guard;

  let input: TokenAttacherInputType;
  try {
    input = TokenAttacherInput.parse(data);
  } catch (e) {
    return { success: false, error: `TOKEN_ATTACHER_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `TOKEN_ATTACHER_ACCESS_DENIED: ${input.action} requires GM` };
  }

  // Canvas guard for the mutating + placeable-resolving actions (the TA api reads canvas geometry).
  if (CANVAS_ACTIONS.has(input.action) && !getCanvas()?.ready) {
    return {
      success: false,
      error: `${ErrorTokens.TOKEN_ATTACHER_CANVAS_NOT_READY}: ${input.action} requires an active, ready canvas — Token Attacher reads live placeable geometry. Open the scene and retry.`,
    };
  }

  try {
    switch (input.action) {
      case 'attach':
        return await handleAttach(input);
      case 'detach':
        return await handleDetach(input);
      case 'detach-all':
        return await handleDetachAll(input);
      case 'query-attached':
        return handleQueryAttached(input);
      case 'query-by-type':
        return handleQueryByType(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `TOKEN_ATTACHER_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `TOKEN_ATTACHER_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── attach ───────────────────────────────────────────────────────────────────

type AttachInput = Extract<TokenAttacherInputType, { action: 'attach' }>;
async function handleAttach(input: AttachInput): Promise<Envelope<unknown>> {
  const api = tokenAttacherApi();
  if (typeof api?.attachElementsToToken !== 'function' && typeof api?.attachElementToToken !== 'function') {
    return { success: false, error: 'TOKEN_ATTACHER_API_UNAVAILABLE: window.tokenAttacher attach api not found (module loaded?)' };
  }
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: no scene (sceneId=${input.sceneId ?? 'active'})` };

  const baseToken = getBasePlaceable(input.baseTokenId);
  if (!baseToken) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: base token "${input.baseTokenId}" not on the active canvas` };

  // Resolve each element id → live PlaceableObject. Drop unresolved (warn) — they would silently no-op.
  const resolved: Array<{ type: string; id: string; obj: any }> = [];
  const missing: Array<{ type: string; id: string }> = [];
  for (const el of input.elements) {
    const obj = getPlaceable(el.type, el.id);
    if (obj) resolved.push({ type: el.type, id: el.id, obj });
    else missing.push({ type: el.type, id: el.id });
  }
  if (resolved.length === 0) {
    return {
      success: false,
      error: `TOKEN_ATTACHER_NOT_FOUND: none of the ${input.elements.length} element(s) resolve to a live placeable on this canvas (${missing.map((m) => `${m.type}:${m.id}`).join(', ')})`,
    };
  }

  // attachElementsToToken accepts an array of PlaceableObjects; pass suppress=true (no UI toast).
  if (typeof api.attachElementsToToken === 'function') {
    await api.attachElementsToToken(resolved.map((r) => r.obj), baseToken, true);
  } else {
    for (const r of resolved) await api.attachElementToToken(r.obj, baseToken, true);
  }

  // DP-16 — re-read the base flag and verify EACH resolved element landed under its type
  // (layerGetElement silently drops non-canvas ids — token-attacher.js:963). Settle the async write
  // before asserting (the api can return before the flag commits — see readAttachedSettled).
  const after = await readAttachedSettled(scene, input.baseTokenId, (m) =>
    resolved.every((r) => (m[r.type] ?? []).includes(r.id)),
  );
  const dropped = resolved.filter((r) => !(after[r.type] ?? []).includes(r.id));
  if (dropped.length > 0) {
    return {
      success: false,
      error: `${ErrorTokens.TOKEN_ATTACHER_NOT_PERSISTED}: ${dropped.length} element(s) did not land in flags.token-attacher.attached (${dropped.map((d) => `${d.type}:${d.id}`).join(', ')}) — Token Attacher dropped them (not on canvas?).`,
    };
  }

  notify.created('token-attacher', input.baseTokenId, {
    summary: `attached ${resolved.length} element(s)${missing.length ? ` (${missing.length} unresolved skipped)` : ''}`,
  });
  return {
    success: true,
    data: {
      baseTokenId: input.baseTokenId,
      sceneId: scene.id,
      attached: after,
      affected: resolved.map((r) => ({ type: r.type, id: r.id })),
    },
  };
}

// ── detach ───────────────────────────────────────────────────────────────────

type DetachInput = Extract<TokenAttacherInputType, { action: 'detach' }>;
async function handleDetach(input: DetachInput): Promise<Envelope<unknown>> {
  const api = tokenAttacherApi();
  if (typeof api?.detachElementsFromToken !== 'function' && typeof api?.detachElementFromToken !== 'function') {
    return { success: false, error: 'TOKEN_ATTACHER_API_UNAVAILABLE: window.tokenAttacher detach api not found' };
  }
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: no scene (sceneId=${input.sceneId ?? 'active'})` };
  const baseToken = getBasePlaceable(input.baseTokenId);
  if (!baseToken) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: base token "${input.baseTokenId}" not on the active canvas` };

  const resolved: Array<{ type: string; id: string; obj: any }> = [];
  for (const el of input.elements) {
    const obj = getPlaceable(el.type, el.id);
    if (obj) resolved.push({ type: el.type, id: el.id, obj });
  }
  if (resolved.length === 0) {
    return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: none of the ${input.elements.length} element(s) resolve to a live placeable on this canvas` };
  }

  if (typeof api.detachElementsFromToken === 'function') {
    await api.detachElementsFromToken(resolved.map((r) => r.obj), baseToken, true);
  } else {
    for (const r of resolved) await api.detachElementFromToken(r.obj, baseToken, true);
  }

  // DP-16 — re-read and verify each requested element is GONE from the attached map (settle the
  // async detach write before asserting — see readAttachedSettled).
  const after = await readAttachedSettled(scene, input.baseTokenId, (m) =>
    resolved.every((r) => !(m[r.type] ?? []).includes(r.id)),
  );
  const stillAttached = resolved.filter((r) => (after[r.type] ?? []).includes(r.id));
  if (stillAttached.length > 0) {
    return {
      success: false,
      error: `${ErrorTokens.TOKEN_ATTACHER_NOT_PERSISTED}: ${stillAttached.length} element(s) still attached after detach (${stillAttached.map((d) => `${d.type}:${d.id}`).join(', ')}).`,
    };
  }

  notify.deleted('token-attacher', input.baseTokenId, { summary: `detached ${resolved.length} element(s)` });
  return {
    success: true,
    data: {
      baseTokenId: input.baseTokenId,
      sceneId: scene.id,
      attached: after,
      affected: resolved.map((r) => ({ type: r.type, id: r.id })),
    },
  };
}

// ── detach-all ─────────────────────────────────────────────────────────────────

type DetachAllInput = Extract<TokenAttacherInputType, { action: 'detach-all' }>;
async function handleDetachAll(input: DetachAllInput): Promise<Envelope<unknown>> {
  const api = tokenAttacherApi();
  if (typeof api?.detachAllElementsFromToken !== 'function') {
    return { success: false, error: 'TOKEN_ATTACHER_API_UNAVAILABLE: window.tokenAttacher.detachAllElementsFromToken not found' };
  }
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: no scene (sceneId=${input.sceneId ?? 'active'})` };
  const baseToken = getBasePlaceable(input.baseTokenId);
  if (!baseToken) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: base token "${input.baseTokenId}" not on the active canvas` };

  await api.detachAllElementsFromToken(baseToken, true);

  // DP-16 — re-read; the attached map should be empty. Settle the async detach-all write first — the
  // api returns before updateEmbeddedDocuments propagates, so an immediate read sees the stale map
  // (live-eval false-positive 2026-06-25 — see readAttachedSettled).
  const after = await readAttachedSettled(scene, input.baseTokenId, (m) => countAttached(m) === 0);
  const remaining = countAttached(after);
  if (remaining > 0) {
    return { success: false, error: `${ErrorTokens.TOKEN_ATTACHER_NOT_PERSISTED}: ${remaining} element(s) still attached after detach-all.` };
  }

  notify.deleted('token-attacher', input.baseTokenId, { summary: 'detached all elements' });
  return { success: true, data: { baseTokenId: input.baseTokenId, sceneId: scene.id, attached: after, cleared: true } };
}

// ── query-attached (headless) ────────────────────────────────────────────────

type QueryAttachedInput = Extract<TokenAttacherInputType, { action: 'query-attached' }>;
function handleQueryAttached(input: QueryAttachedInput): Envelope<unknown> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: no scene (sceneId=${input.sceneId ?? 'active'})` };
  const tokenDoc = scene.tokens?.get?.(input.baseTokenId);
  if (!tokenDoc) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: token "${input.baseTokenId}" not on scene "${scene.id}"` };
  const attached = readAttached(scene, input.baseTokenId);
  return { success: true, data: { baseTokenId: input.baseTokenId, sceneId: scene.id, attached, total: countAttached(attached) } };
}

// ── query-by-type (headless) ─────────────────────────────────────────────────

type QueryByTypeInput = Extract<TokenAttacherInputType, { action: 'query-by-type' }>;
function handleQueryByType(input: QueryByTypeInput): Envelope<unknown> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: no scene (sceneId=${input.sceneId ?? 'active'})` };
  const tokenDoc = scene.tokens?.get?.(input.baseTokenId);
  if (!tokenDoc) return { success: false, error: `TOKEN_ATTACHER_NOT_FOUND: token "${input.baseTokenId}" not on scene "${scene.id}"` };
  const attached = readAttached(scene, input.baseTokenId);
  const ids = attached[input.type] ?? [];
  return { success: true, data: { baseTokenId: input.baseTokenId, sceneId: scene.id, type: input.type, ids } };
}
