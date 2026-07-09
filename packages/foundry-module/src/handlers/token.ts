// FACTORY-EXEMPT: legacy add/delete-token delegation
//   token.ts owns 2 legacy actions (add + delete-token) that pass through
//   TokenDataAccessFacade — not the embedded-CRUD pattern. Plus token-specific
//   ring/turnMarker/bar1/bar2/occludable nested-field handling that doesn't
//   share the factory's clean shape. F08 _source pattern retrofitted in-place
//   (Phase 6.2.7 B1).
//
// Phase 5 mcp_crud_expansion — Token handlers (umbrella, 9 actions).
//
// Foundry-side write/read for the `token` MCP umbrella tool. 5 base embedded-CRUD
// actions (create / update / delete / get / list) plus 2 migrated from the Phase 4
// scene umbrella (add ← scene.add-tokens; delete-token ← scene.delete-token) plus
// 2 wfrp4e mount-linkage actions (mount / dismount — BUG-190).
//
// CCR-Trust: every write function starts with validateGMAccess().
// CCR-Transactions: every write routes through wrappedWrite('token.<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// CCR-Schema-Fidelity: Phase 0 probe-locked (phase5_probes.md §Token).
// DP-16: post-verify each write by re-reading the embedded token via
//        getEmbeddedOrThrow(scene, 'tokens', id, 'Token').
// BUG-075: snapshot input shape BEFORE every mutating call.
//
// FK-orphan recovery (carry-forward §38-39): Token.actorId may reference a
// deleted Actor. The Foundry getter returns null but _source.actorId retains
// the stale ID. ViewModel surfaces both `actorId` (raw) and `actorLinked` (resolved).
// Write surface EXCLUDES: delta (ActorDeltaField, Phase 8+), _movementHistory,
// _regions (Foundry internals).

import {
  ErrorTokens,
  TokenToolInput,
  TokenCreateInput,
  TokenUpdateInput,
  TokenDeleteInput,
  TokenGetInput,
  TokenListInput,
  TokenAddInput,
  TokenDeleteTokenInput,
  TokenMountInput,
  TokenDismountInput,
  type TokenToolInputType,
  type TokenCreateInputType,
  type TokenUpdateInputType,
  type TokenDeleteInputType,
  type TokenGetInputType,
  type TokenListInputType,
  type TokenAddInputType,
  type TokenDeleteTokenInputType,
  type TokenMountInputType,
  type TokenDismountInputType,
  type TokenViewModel,
  type TokenListItem,
  formatFKLink,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { buildOperationReceipt } from '../services/shared/operation-receipt.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';
import { notify } from '../notify.js';
import { DEFAULT_PAGE_SIZE } from '../constants/toolLimits.js';
// R2.2 dedup: canonical deepStripUndefined (was a local byte-identical copy).
import { deepStripUndefined, validateGMAccess, getSceneOrThrow } from '../utils/embeddedCRUDFactory.js';

// ── Local types ──────────────────────────────────────────────────────────────

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

export interface TokenCreateResponse {
  token: TokenViewModel;
  requestedChanges: Record<string, unknown>;
}

export interface TokenUpdateResponse {
  token: TokenViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

export interface TokenDeleteResponse {
  deletedId: string;
  deletedName: string;
  sceneId: string;
  remainingTokens: number;
}

export interface TokenGetResponse {
  token: TokenViewModel;
}

export interface TokenListResponse {
  tokens: TokenListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: false;
  filterApplied?: string | null;
}
// BUG-435: canonical LEAN countOnly shape — uniform across list handlers (scene/light/token/region/note/…).
export interface TokenListCountResponse {
  total: number;
  filterApplied: string | null;
  countOnly: true;
}

export interface TokenAddResponse {
  sceneId: string;
  added: number;
  tokenIds: string[];
  placement: string;
  // Phase 12 R12.2: operation receipt fields (optional so the satisfies-check stays additive).
  operationId?: string;
  createdDocumentIds?: string[];
  updatedDocumentIds?: string[];
  deletedDocumentIds?: string[];
  warnings?: string[];
  // RC1.2 (mcp_code_quality_v2 Phase C1) — forwarded from ScenePlacementService.addActorsToScene's
  // own receipt (undeclared-file fix; see execution report Friction Notes: without this forward,
  // scene-placement.ts's failedItems computation never reaches the token.add response).
  failedItems?: Array<{ id: string; reason: string }>;
}

// BUG-190 — mount/dismount (wfrp4e native mount linkage).
export interface TokenMountResponse {
  sceneId: string;
  riderTokenId: string;
  mountTokenId: string;
  riderName: string;
  mountName: string;
  /** The system.status.mount payload written to the rider actor. */
  mountData: Record<string, unknown>;
  dryRun: boolean;
  warnings: string[];
  operationId?: string;
  createdDocumentIds?: string[];
  updatedDocumentIds?: string[];
  deletedDocumentIds?: string[];
}

export interface TokenDismountResponse {
  sceneId: string;
  riderTokenId: string;
  riderName: string;
  /** Mount token id the rider was linked to before the clear (from flags.wfrp4e.mount). */
  previousMountTokenId: string | null;
  dryRun: boolean;
  warnings: string[];
  operationId?: string;
  createdDocumentIds?: string[];
  updatedDocumentIds?: string[];
  deletedDocumentIds?: string[];
}

export type TokenResponse =
  | TokenCreateResponse
  | TokenUpdateResponse
  | TokenDeleteResponse
  | TokenGetResponse
  | TokenListResponse
  | TokenListCountResponse
  | TokenAddResponse
  | TokenMountResponse
  | TokenDismountResponse;

// Minimal scene-placement surface the dispatcher needs for the add-tokens / delete-token actions.
// Phase 6 (R5.2): scene-placement was promoted off FoundryDataAccess to QueryHandlers, which now
// passes its own ScenePlacementService instance in; we type just the two methods we touch.
export interface TokenDataAccessFacade {
  addActorsToScene(input: {
    actorIds: string[];
    quantities?: number[];
    placement: string;
    hidden: boolean;
    sceneId?: string;
  }): Promise<any>;
  deleteToken(input: { sceneId: string; tokenId: string }): Promise<any>;
}

// ── Access gate + helpers ────────────────────────────────────────────────────

function getActiveSceneOrThrow(): any {
  const scene = (game as any).scenes?.active;
  if (!scene) throw new Error('NO_ACTIVE_SCENE: no scene is currently active');
  return scene;
}

// ── Serializers ──────────────────────────────────────────────────────────────

function serializeTokenViewModel(scene: any, token: any): TokenViewModel {
  const src = token._source ?? {};
  const actorIdRaw = (src.actorId ?? token.actorId) as string | null;
  const link = formatFKLink(actorIdRaw, (game as any).actors);
  const delta = token.delta as any;

  return {
    id: token.id as string,
    sceneId: scene.id as string,
    name: (token.name as string) ?? '',
    displayName: (token.displayName as number) ?? 0,
    actorId: link.id,
    actorLinked: link.linked,
    actorLink: Boolean(token.actorLink),
    delta: delta ? { hasOverrides: Object.keys(delta._source?.system ?? {}).length > 0 } : null,
    width: (token.width as number) ?? 1,
    height: (token.height as number) ?? 1,
    texture: {
      src: (token.texture?.src as string | null) ?? null,
      anchorX: (token.texture?.anchorX as number) ?? 0.5,
      anchorY: (token.texture?.anchorY as number) ?? 0.5,
      offsetX: (token.texture?.offsetX as number) ?? 0,
      offsetY: (token.texture?.offsetY as number) ?? 0,
      fit: (token.texture?.fit as string) ?? 'contain',
      scaleX: (token.texture?.scaleX as number) ?? 1,
      scaleY: (token.texture?.scaleY as number) ?? 1,
      rotation: (token.texture?.rotation as number) ?? 0,
      tint: (token.texture?.tint as string) ?? '#ffffff',
      alphaThreshold: (token.texture?.alphaThreshold as number) ?? 0.75,
    },
    shape: (token.shape as number) ?? 4,
    // BUG-253 — read placement scalars from _source (authoritative stored value), not the
    // derived getters: immediately after token.update() the rendered/animated token.x/.y can
    // still report the pre-update position even though _source (and the DB) hold the new value,
    // producing a false-positive "changed fields: x,y" response showing the OLD coordinates.
    // Matches the F08 _source convention used by the update post-verify below.
    x: ((src.x ?? token.x) as number) ?? 0,
    y: ((src.y ?? token.y) as number) ?? 0,
    elevation: ((src.elevation ?? token.elevation) as number) ?? 0,
    sort: ((src.sort ?? token.sort) as number) ?? 0,
    locked: Boolean(token.locked),
    lockRotation: Boolean(token.lockRotation),
    rotation: ((src.rotation ?? token.rotation) as number) ?? 0,
    alpha: (token.alpha as number) ?? 1,
    hidden: Boolean(token.hidden),
    disposition: (token.disposition as number) ?? -1,
    displayBars: (token.displayBars as number) ?? 0,
    bar1: { attribute: (token.bar1?.attribute as string | null) ?? null },
    bar2: { attribute: (token.bar2?.attribute as string | null) ?? null },
    light: token.light?._source ?? token.light ?? {},
    sight: {
      enabled: Boolean(token.sight?.enabled),
      range: (token.sight?.range as number | null) ?? null,
      angle: (token.sight?.angle as number) ?? 360,
      visionMode: (token.sight?.visionMode as string) ?? 'basic',
      color: (token.sight?.color as string | null) ?? null,
      attenuation: (token.sight?.attenuation as number) ?? 0.1,
      brightness: (token.sight?.brightness as number) ?? 0,
      saturation: (token.sight?.saturation as number) ?? 0,
      contrast: (token.sight?.contrast as number) ?? 0,
    },
    movementAction: (token.movementAction as string | null) ?? null,
    flags: (token.flags as Record<string, unknown>) ?? {},
  };
}

function serializeTokenListItem(scene: any, token: any): TokenListItem {
  const src = token._source ?? {};
  const link = formatFKLink((src.actorId ?? token.actorId) as string | null, (game as any).actors);
  return {
    id: token.id as string,
    sceneId: scene.id as string,
    name: (token.name as string) ?? '',
    actorId: link.id,
    actorLinked: link.linked,
    hidden: Boolean(token.hidden),
    disposition: (token.disposition as number) ?? -1,
  };
}

// ── 1. createToken ───────────────────────────────────────────────────────────

export async function createToken(data: unknown): Promise<Envelope<TokenCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: createToken requires GM' };

  const input: TokenCreateInputType = TokenCreateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  const { action: _action, sceneId: _sceneId, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('token.create', async () => {
    const payload = deepStripUndefined({ ...rest });
    const created = await scene.createEmbeddedDocuments('Token', [payload]);
    if (!created || created.length === 0) {
      throw new Error(ErrorTokens.TOKEN_WRITE_NOT_PERSISTED + ': createEmbeddedDocuments returned no doc');
    }
    const persisted = getEmbeddedOrThrow<any>(scene, 'tokens', created[0].id, 'Token');

    notify.created('token', (persisted.name as string) ?? `Token ${persisted.id}`, {
      summary: `on ${scene.name}`,
    });

    return {
      success: true as const,
      data: {
        token: serializeTokenViewModel(scene, persisted),
        requestedChanges,
      } satisfies TokenCreateResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 2. updateToken ───────────────────────────────────────────────────────────

export async function updateToken(data: unknown): Promise<Envelope<TokenUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: updateToken requires GM' };

  const input: TokenUpdateInputType = TokenUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const token = getEmbeddedOrThrow<any>(scene, 'tokens', input.tokenId, 'Token');

  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('token.update', async () => {
    const payload = deepStripUndefined({ ...input.changes });
    await token.update(payload);

    // BUG-303 (DP-16): re-fetch the token via getEmbeddedOrThrow so the verify loop
    // reads the freshly-persisted _source instead of the in-memory pre-update object.
    const fresh = getEmbeddedOrThrow<any>(scene, 'tokens', input.tokenId, 'Token');

    // DP-16: confirm scalar top-level fields persisted; nested fields and FK skip deep verify.
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      if (field === 'actorId') {
        const persistedId = fresh._source?.actorId ?? null;
        if (persistedId !== (requestedValue ?? null)) {
          throw new Error(
            `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: actorId expected ${JSON.stringify(requestedValue)} ` +
              `but post-update is ${JSON.stringify(persistedId)}`,
          );
        }
        continue;
      }
      if (
        field === 'texture' ||
        field === 'light' ||
        field === 'sight' ||
        field === 'bar1' ||
        field === 'bar2' ||
        field === 'occludable' ||
        field === 'ring' ||
        field === 'turnMarker' ||
        field === 'flags'
      ) {
        const persisted = (fresh._source as any)?.[field];
        if (persisted === undefined || persisted === null) {
          throw new Error(`${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: nested field "${field}" missing after update`);
        }
        continue;
      }
      // F08 fix (Phase 6.2.7 B1): compare against `_source` (raw stored data).
      const persistedValue = (fresh._source as any)?.[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update _source value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    notify.updated('token', (fresh.name as string) ?? `Token ${input.tokenId}`, {
      summary: changedFields.join(', '),
    });

    return {
      success: true as const,
      data: {
        token: serializeTokenViewModel(scene, fresh),
        requestedChanges,
        changedFields,
      } satisfies TokenUpdateResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 3. deleteToken (embedded-CRUD style) ─────────────────────────────────────

export async function deleteToken(data: unknown): Promise<Envelope<TokenDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: deleteToken requires GM' };

  const input: TokenDeleteInputType = TokenDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const token = getEmbeddedOrThrow<any>(scene, 'tokens', input.tokenId, 'Token');
  const deletedName = (token.name as string) ?? '';
  const sizeBefore = scene.tokens?.size ?? 0;

  return wrappedWrite('token.delete', async () => {
    await token.delete();

    // DP-18: post-state assertion.
    const post = scene.tokens?.get(input.tokenId);
    if (post) {
      throw new Error(`${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: token "${input.tokenId}" still present after delete()`);
    }
    const sizeAfter = scene.tokens?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: scene.tokens.size expected ${sizeBefore - 1} ` +
          `but found ${sizeAfter}`,
      );
    }

    notify.deleted('token', deletedName || `Token ${input.tokenId}`, {
      summary: `from ${scene.name}`,
    });

    return {
      success: true as const,
      data: {
        deletedId: input.tokenId,
        deletedName,
        sceneId: input.sceneId,
        remainingTokens: sizeAfter,
      } satisfies TokenDeleteResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 4. getToken ──────────────────────────────────────────────────────────────

export async function getToken(data: unknown): Promise<Envelope<TokenGetResponse>> {
  const input: TokenGetInputType = TokenGetInput_strict_parse(data);
  try {
    const scene = getSceneOrThrow(input.sceneId);
    const token = getEmbeddedOrThrow<any>(scene, 'tokens', input.tokenId, 'Token');
    return {
      success: true,
      data: { token: serializeTokenViewModel(scene, token) },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'getToken failed' };
  }
}

// ── 5. listTokens ────────────────────────────────────────────────────────────

export async function listTokens(data: unknown): Promise<Envelope<TokenListResponse | TokenListCountResponse>> {
  const input: TokenListInputType = TokenListInput_strict_parse(data);
  try {
    const scene = input.sceneId ? getSceneOrThrow(input.sceneId) : getActiveSceneOrThrow();
    let tokens: any[] = Array.from(scene.tokens?.values?.() ?? []);

    const filterApplied = input.filter ?? null;
    if (filterApplied) {
      const needle = filterApplied.toLowerCase();
      tokens = tokens.filter((t) => ((t.name as string) ?? '').toLowerCase().includes(needle));
    }
    if (typeof input.hidden === 'boolean') {
      tokens = tokens.filter((t) => Boolean(t.hidden) === input.hidden);
    }
    if (input.onlyLinked === true) {
      tokens = tokens.filter((t) => Boolean(t.actorLink));
    }

    const total = tokens.length;

    // BUG-435: countOnly returns the canonical LEAN {total, filterApplied, countOnly:true} shape
    // (no empty tokens[] + pagination echo on a cheap count probe — uniform with scene/light/…).
    if (input.countOnly) {
      return {
        success: true,
        data: { total, filterApplied, countOnly: true } satisfies TokenListCountResponse,
      };
    }

    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const items = tokens.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: {
        tokens: items.map((t) => serializeTokenListItem(scene, t)),
        total,
        page,
        pageSize,
        countOnly: false,
        filterApplied,
      } satisfies TokenListResponse,
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'listTokens failed' };
  }
}

// ── 6. addTokens (migrated from scene.add-tokens) ────────────────────────────

export async function addTokens(
  data: unknown,
  dataAccess: TokenDataAccessFacade,
): Promise<Envelope<TokenAddResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: token.add requires GM' };

  const input: TokenAddInputType = TokenAddInput_strict_parse(data);

  if (input.quantities && input.quantities.length !== input.actorIds.length) {
    return {
      success: false,
      error: `TOKEN_ADD_LENGTH_MISMATCH: quantities length ${input.quantities.length} ` +
        `must equal actorIds length ${input.actorIds.length}`,
    };
  }

  return wrappedWrite('token.add', async () => {
    const result = await dataAccess.addActorsToScene({
      actorIds: input.actorIds,
      ...(input.quantities ? { quantities: input.quantities } : {}),
      placement: input.placement ?? 'random',
      hidden: Boolean(input.hidden),
      ...(input.sceneId ? { sceneId: input.sceneId } : {}),
    });

    const sceneId = (result?.sceneId ?? input.sceneId) as string | undefined;
    if (!sceneId) {
      throw new Error('TOKEN_ADD_NO_SCENE: addActorsToScene returned no sceneId and none was supplied');
    }
    const tokenIds = (result?.tokenIds as string[]) ?? [];

    // PARITY-019 + BUG-204: scene-presence verify for each returned tokenId (mirrors createToken:256).
    // Empty tokenIds is a safe no-op (no actors → no verify).
    const verifyScene = getSceneOrThrow(sceneId);
    for (const id of tokenIds) {
      if (!verifyScene.tokens?.get(id)) {
        throw new Error(`${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: token "${id}" not found in scene.tokens after addActorsToScene`);
      }
    }

    // RC1.2 — forward the underlying service's own failedItems/warnings (scene-placement.ts now
    // computes them per RC1.2 task 4.3); rebuilding the receipt from scratch here previously
    // discarded them, so a mixed valid+invalid actorId batch silently dropped the failure detail.
    const upstreamFailedItems = (result?.failedItems as Array<{ id: string; reason: string }> | undefined) ?? [];
    const upstreamWarnings = (result?.warnings as string[] | undefined) ?? [];
    return {
      success: true as const,
      data: {
        sceneId,
        // F12: fallback to tokenIds.length when the underlying facade omits `added`.
        added: (result?.added as number) ?? tokenIds.length,
        tokenIds,
        placement: (result?.placement as string) ?? input.placement ?? 'random',
        // Phase 12 R12.2: operation receipt — created = the placed token ids.
        ...buildOperationReceipt({ created: tokenIds, warnings: upstreamWarnings, failed: upstreamFailedItems }),
      } satisfies TokenAddResponse,
    };
  }, input.sceneId ? { sceneId: input.sceneId } : undefined);
}

// ── 7. deleteTokenAction (migrated from scene.delete-token) ──────────────────
//
// Legacy alias for callers used to scene.delete-token. Routes through the same
// dataAccess.deleteToken path used pre-Phase-5, preserving any envelope shape
// downstream consumers (wfrp-encounter-builder pre-migration) depend on.

export async function deleteTokenAction(
  data: unknown,
  dataAccess: TokenDataAccessFacade,
): Promise<Envelope<TokenDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: token.delete-token requires GM' };

  const input: TokenDeleteTokenInputType = TokenDeleteTokenInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const token = getEmbeddedOrThrow<any>(scene, 'tokens', input.tokenId, 'Token');
  const deletedName = (token.name as string) ?? '';

  const sizeBefore = scene.tokens?.size ?? 0;
  return wrappedWrite('token.delete-token', async () => {
    await dataAccess.deleteToken({ sceneId: input.sceneId, tokenId: input.tokenId });

    // PARITY-018: mirror deleteToken's two-part DP-18 assert (presence + size-delta).
    if (scene.tokens?.get(input.tokenId)) {
      throw new Error(`${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: token "${input.tokenId}" still present after delete-token`);
    }
    const sizeAfter = scene.tokens?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: scene.tokens.size expected ${sizeBefore - 1} but found ${sizeAfter}`,
      );
    }

    notify.deleted('token', deletedName || `Token ${input.tokenId}`, {
      summary: `from ${scene.name}`,
    });

    return {
      success: true as const,
      data: {
        deletedId: input.tokenId,
        deletedName,
        sceneId: input.sceneId,
        remainingTokens: sizeAfter,
      } satisfies TokenDeleteResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 8. mountToken (BUG-190 — wfrp4e native mount linkage) ────────────────────
//
// Replicates the wfrp4e token-HUD mount button's write contract (wfrp4e.js
// token() hooks, live-verified 2026-07-08):
//   1. rider ACTOR:  system.status.mount = { id, mounted:true, isToken, tokenData? }
//   2. rider TOKEN:  flags.wfrp4e.mount = <mountTokenId>, x/y = mount's x/y
// Everything downstream is native system behavior: the updateToken hook makes the
// mount token follow the rider, computeMount() gives the rider the mount's
// Move/Walk/Run, charging math uses mount speed, auto-dismount at mount 0 wounds.
//
// Deliberate deviation from the HUD: explicit riderTokenId/mountTokenId roles are
// HONORED, never size-auto-swapped (the HUD swaps only because two SELECTED tokens
// are role-ambiguous). A rider larger than its mount produces a warning instead.
//
// ADR-10.1: DIALOG_FREE — plain actor.update()/token.update(); no dialog paths.
// DP-16 caveat: computeMount() zeroes PREPARED status.mount.mounted when the mount
// is at 0 wounds, so the post-write verify reads _source, never prepared data.

export async function mountToken(data: unknown): Promise<Envelope<TokenMountResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: token.mount requires GM' };

  const input: TokenMountInputType = TokenMountInput.parse(data ?? {});
  const scene = getSceneOrThrow(input.sceneId);

  if (input.riderTokenId === input.mountTokenId) {
    return { success: false, error: 'TOKEN_MOUNT_SELF: riderTokenId and mountTokenId must differ' };
  }

  const riderToken = getEmbeddedOrThrow<any>(scene, 'tokens', input.riderTokenId, 'Token');
  const mountToken = getEmbeddedOrThrow<any>(scene, 'tokens', input.mountTokenId, 'Token');

  const riderActor = riderToken.actor;
  const mountActor = mountToken.actor;
  if (!riderActor) {
    return { success: false, error: `TOKEN_MOUNT_NO_ACTOR: rider token "${input.riderTokenId}" has no actor (actorless tokens cannot mount)` };
  }
  if (!mountActor) {
    return { success: false, error: `TOKEN_MOUNT_NO_ACTOR: mount token "${input.mountTokenId}" has no actor (actorless tokens cannot be mounted)` };
  }
  const mountActorId = (mountToken._source?.actorId ?? mountToken.actorId) as string | null;
  if (!mountActorId) {
    return { success: false, error: `TOKEN_MOUNT_NO_ACTOR: mount token "${input.mountTokenId}" has no actorId to link` };
  }

  const warnings: string[] = [];

  // Size sanity (native HUD would have swapped roles here; we warn instead).
  const sizeNums = (game as any).wfrp4e?.config?.actorSizeNums;
  if (sizeNums && typeof sizeNums === 'object') {
    const riderSize = sizeNums[riderActor.details?.size?.value] ?? null;
    const mountSize = sizeNums[mountActor.details?.size?.value] ?? null;
    if (riderSize !== null && mountSize !== null && riderSize > mountSize) {
      warnings.push(
        `SIZE_INVERSION: rider "${riderActor.name}" (${riderActor.details.size.value}) is larger than mount "${mountActor.name}" (${mountActor.details.size.value}) — the native HUD would have swapped roles; roles were honored as passed.`,
      );
    }
  }
  // Native WarnUnlinkedMount parity.
  if (!mountToken.actorLink && riderToken.actorLink) {
    warnings.push('UNLINKED_MOUNT: mount token is unlinked while rider is linked — the mount linkage is scoped to this scene\'s token (wfrp4e WarnUnlinkedMount).');
  }
  if (riderActor.isMounted) {
    warnings.push(`ALREADY_MOUNTED: rider was already mounted (mount id "${riderActor.system?.status?.mount?.id ?? '?'}") — linkage overwritten.`);
  }
  if ((mountActor.system?.status?.wounds?.value ?? 1) === 0) {
    warnings.push('MOUNT_AT_ZERO_WOUNDS: mount is at 0 wounds — wfrp4e computeMount() will treat the rider as dismounted until the mount is healed.');
  }

  const isToken = !mountToken.actorLink;
  const tokenData = isToken ? { scene: scene.id as string, token: mountToken.id as string } : undefined;
  const mountData: Record<string, unknown> = {
    'system.status.mount.id': mountActorId,
    'system.status.mount.mounted': true,
    'system.status.mount.isToken': isToken,
    ...(tokenData ? { 'system.status.mount.tokenData': tokenData } : {}),
  };
  const mountX = (mountToken._source?.x ?? mountToken.x) as number;
  const mountY = (mountToken._source?.y ?? mountToken.y) as number;

  const baseResponse = {
    sceneId: input.sceneId,
    riderTokenId: input.riderTokenId,
    mountTokenId: input.mountTokenId,
    riderName: (riderToken.name as string) ?? '',
    mountName: (mountToken.name as string) ?? '',
    mountData,
    warnings,
  };

  // dryRun gate — plan only, ZERO writes.
  if (input.dryRun) {
    return {
      success: true,
      data: { ...baseResponse, dryRun: true } satisfies TokenMountResponse,
    };
  }

  return wrappedWrite('token.mount', async () => {
    // Pass a copy — Foundry's update() expands dot-paths IN PLACE and injects _id/type,
    // which would corrupt the mountData echo in the response (observed live 2026-07-08).
    await riderActor.update({ ...mountData });
    await riderToken.update({ 'flags.wfrp4e.mount': mountToken.id, x: mountX, y: mountY });

    // DP-16 — verify BOTH documents from _source (prepared data is unreliable here:
    // computeMount() flips mounted:false when the mount is at 0 wounds).
    const freshToken = getEmbeddedOrThrow<any>(scene, 'tokens', input.riderTokenId, 'Token');
    const flagPersisted = (freshToken._source?.flags as any)?.wfrp4e?.mount ?? null;
    if (flagPersisted !== mountToken.id) {
      throw new Error(
        `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: flags.wfrp4e.mount expected "${mountToken.id}" but post-update _source value is ${JSON.stringify(flagPersisted)}`,
      );
    }
    const freshActorSource = freshToken.actor?._source;
    const persistedMount = (freshActorSource as any)?.system?.status?.mount;
    if (!persistedMount || persistedMount.id !== mountActorId || persistedMount.mounted !== true) {
      throw new Error(
        `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: system.status.mount expected {id:"${mountActorId}", mounted:true} ` +
          `but post-update _source value is ${JSON.stringify(persistedMount ?? null)}`,
      );
    }

    notify.updated('token', (riderToken.name as string) ?? `Token ${input.riderTokenId}`, {
      summary: `mounted on ${(mountToken.name as string) ?? input.mountTokenId}`,
    });

    return {
      success: true as const,
      data: {
        ...baseResponse,
        dryRun: false,
        ...buildOperationReceipt({
          updated: [riderActor.id as string, input.riderTokenId],
          warnings,
        }),
      } satisfies TokenMountResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── 9. dismountToken (BUG-190) ───────────────────────────────────────────────
//
// Full mount-data clear (the sheet's remove-mount contract, wfrp4e.js:4269) plus
// flags.wfrp4e.mount removal on the rider token. ADR-10.1: DIALOG_FREE.

export async function dismountToken(data: unknown): Promise<Envelope<TokenDismountResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: 'Access denied: token.dismount requires GM' };

  const input: TokenDismountInputType = TokenDismountInput.parse(data ?? {});
  const scene = getSceneOrThrow(input.sceneId);
  const riderToken = getEmbeddedOrThrow<any>(scene, 'tokens', input.riderTokenId, 'Token');

  const riderActor = riderToken.actor;
  if (!riderActor) {
    return { success: false, error: `TOKEN_MOUNT_NO_ACTOR: rider token "${input.riderTokenId}" has no actor` };
  }

  const previousMountTokenId = ((riderToken._source?.flags as any)?.wfrp4e?.mount ?? null) as string | null;
  const sourceMounted = Boolean((riderActor._source as any)?.system?.status?.mount?.mounted);
  if (!sourceMounted && !previousMountTokenId) {
    return { success: false, error: `TOKEN_DISMOUNT_NOT_MOUNTED: rider token "${input.riderTokenId}" has no mount linkage (system.status.mount.mounted is false and flags.wfrp4e.mount is unset)` };
  }

  const warnings: string[] = [];
  const baseResponse = {
    sceneId: input.sceneId,
    riderTokenId: input.riderTokenId,
    riderName: (riderToken.name as string) ?? '',
    previousMountTokenId,
    warnings,
  };

  if (input.dryRun) {
    return {
      success: true,
      data: { ...baseResponse, dryRun: true } satisfies TokenDismountResponse,
    };
  }

  return wrappedWrite('token.dismount', async () => {
    await riderActor.update({
      'system.status.mount.id': '',
      'system.status.mount.mounted': false,
      'system.status.mount.isToken': false,
      'system.status.mount.tokenData': { scene: '', token: '' },
    });
    if (previousMountTokenId !== null) {
      await riderToken.update({ 'flags.wfrp4e.-=mount': null });
    }

    // DP-16 — verify from _source.
    const freshToken = getEmbeddedOrThrow<any>(scene, 'tokens', input.riderTokenId, 'Token');
    const flagAfter = (freshToken._source?.flags as any)?.wfrp4e?.mount;
    if (flagAfter !== undefined) {
      throw new Error(
        `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: flags.wfrp4e.mount still present after dismount (${JSON.stringify(flagAfter)})`,
      );
    }
    const persistedMount = (freshToken.actor?._source as any)?.system?.status?.mount;
    if (persistedMount?.mounted !== false) {
      throw new Error(
        `${ErrorTokens.TOKEN_WRITE_NOT_PERSISTED}: system.status.mount.mounted expected false but post-update _source value is ${JSON.stringify(persistedMount?.mounted)}`,
      );
    }

    notify.updated('token', (riderToken.name as string) ?? `Token ${input.riderTokenId}`, {
      summary: 'dismounted',
    });

    return {
      success: true as const,
      data: {
        ...baseResponse,
        dryRun: false,
        ...buildOperationReceipt({
          updated: [riderActor.id as string, input.riderTokenId],
          warnings,
        }),
      } satisfies TokenDismountResponse,
    };
  }, { sceneId: input.sceneId });
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

export async function dispatchToken(
  data: unknown,
  dataAccess: TokenDataAccessFacade,
): Promise<Envelope<TokenResponse>> {
  let input: TokenToolInputType;
  try {
    input = TokenToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createToken(input);
    case 'update':
      return updateToken(input);
    case 'delete':
      return deleteToken(input);
    case 'get':
      return getToken(input);
    case 'list':
      return listTokens(input);
    case 'add':
      return addTokens(input, dataAccess);
    case 'delete-token':
      return deleteTokenAction(input, dataAccess);
    case 'mount':
      return mountToken(input);
    case 'dismount':
      return dismountToken(input);
  }
}

// ── Per-handler strict-parse wrappers ───────────────────────────────────────

function TokenCreateInput_strict_parse(data: unknown): TokenCreateInputType {
  return TokenCreateInput.parse(data ?? {});
}
function TokenUpdateInput_strict_parse(data: unknown): TokenUpdateInputType {
  return TokenUpdateInput.parse(data ?? {});
}
function TokenDeleteInput_strict_parse(data: unknown): TokenDeleteInputType {
  return TokenDeleteInput.parse(data ?? {});
}
function TokenGetInput_strict_parse(data: unknown): TokenGetInputType {
  return TokenGetInput.parse(data ?? {});
}
function TokenListInput_strict_parse(data: unknown): TokenListInputType {
  return TokenListInput.parse(data ?? {});
}
function TokenAddInput_strict_parse(data: unknown): TokenAddInputType {
  return TokenAddInput.parse(data ?? {});
}
function TokenDeleteTokenInput_strict_parse(data: unknown): TokenDeleteTokenInputType {
  return TokenDeleteTokenInput.parse(data ?? {});
}
