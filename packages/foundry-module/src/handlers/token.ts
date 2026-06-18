// FACTORY-EXEMPT: legacy add/delete-token delegation
//   token.ts owns 2 legacy actions (add + delete-token) that pass through
//   TokenDataAccessFacade — not the embedded-CRUD pattern. Plus token-specific
//   ring/turnMarker/bar1/bar2/occludable nested-field handling that doesn't
//   share the factory's clean shape. F08 _source pattern retrofitted in-place
//   (Phase 6.2.7 B1).
//
// Phase 5 mcp_crud_expansion — Token handlers (umbrella, 7 actions).
//
// Foundry-side write/read for the `token` MCP umbrella tool. 5 base embedded-CRUD
// actions (create / update / delete / get / list) plus 2 migrated from the Phase 4
// scene umbrella (add ← scene.add-tokens; delete-token ← scene.delete-token).
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
  type TokenToolInputType,
  type TokenCreateInputType,
  type TokenUpdateInputType,
  type TokenDeleteInputType,
  type TokenGetInputType,
  type TokenListInputType,
  type TokenAddInputType,
  type TokenDeleteTokenInputType,
  type TokenViewModel,
  type TokenListItem,
  formatFKLink,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';
import { notify } from '../notify.js';
// R2.2 dedup: canonical deepStripUndefined (was a local byte-identical copy).
import { deepStripUndefined } from '../utils/embeddedCRUDFactory.js';

// ── Local types ──────────────────────────────────────────────────────────────

type AccessGate = { allowed: boolean };
type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

export interface TokenCreateResponse {
  success: true;
  token: TokenViewModel;
  requestedChanges: Record<string, unknown>;
}

export interface TokenUpdateResponse {
  success: true;
  token: TokenViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

export interface TokenDeleteResponse {
  success: true;
  deletedId: string;
  deletedName: string;
  sceneId: string;
  remainingTokens: number;
}

export interface TokenGetResponse {
  success: true;
  token: TokenViewModel;
}

export interface TokenListResponse {
  success: true;
  tokens: TokenListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: boolean;
  filterApplied?: string | null;
}

export interface TokenAddResponse {
  success: true;
  sceneId: string;
  added: number;
  tokenIds: string[];
  placement: string;
}

export type TokenResponse =
  | TokenCreateResponse
  | TokenUpdateResponse
  | TokenDeleteResponse
  | TokenGetResponse
  | TokenListResponse
  | TokenAddResponse;

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

function validateGMAccess(): AccessGate {
  if (!game.user?.isGM) return { allowed: false };
  return { allowed: true };
}


function getSceneOrThrow(sceneId: string): any {
  const scene = (game as any).scenes?.get(sceneId);
  if (!scene) throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  return scene;
}

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
        success: true,
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
        success: true,
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
        success: true,
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
      data: { success: true, token: serializeTokenViewModel(scene, token) },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'getToken failed' };
  }
}

// ── 5. listTokens ────────────────────────────────────────────────────────────

export async function listTokens(data: unknown): Promise<Envelope<TokenListResponse>> {
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
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 50;
    const items = input.countOnly ? [] : tokens.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: {
        success: true,
        tokens: items.map((t) => serializeTokenListItem(scene, t)),
        total,
        page,
        pageSize,
        countOnly: input.countOnly ?? false,
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

    return {
      success: true as const,
      data: {
        success: true,
        sceneId,
        // F12: fallback to tokenIds.length when the underlying facade omits `added`.
        added: (result?.added as number) ?? tokenIds.length,
        tokenIds,
        placement: (result?.placement as string) ?? input.placement ?? 'random',
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
        success: true,
        deletedId: input.tokenId,
        deletedName,
        sceneId: input.sceneId,
        remainingTokens: sizeAfter,
      } satisfies TokenDeleteResponse,
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
