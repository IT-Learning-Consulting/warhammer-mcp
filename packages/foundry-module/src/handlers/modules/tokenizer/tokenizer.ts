// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm;
// no matches in this file. All wired actions call game.modules.get("tokenizer-2").api.* headless
// members (tokenize/tokenizeBatch is not called — see handleTokenizeBatch note — exportLayers/
// registerCustomFrame/cleanupActorFlags/settings-get) plus a settle-poll re-read; none of these open
// a Foundry dialog/Application. openEditor/openEditorStandalone/TokenizerConfigDialog.prompt are
// intentionally NOT wired — see EXCLUDED_UI_ONLY rows in kb/modules-docs/tokenizer-2/capability-manifest.json.
//
// tokenizer-2-integration plan Phase 2 — module-tokenizer handler.
//
// 7-action umbrella: tokenize / tokenize-batch / export-layers / register-custom-frame
// / cleanup-flags / get-settings / list-registered.
//
// Design constraints (plan Design Decisions + kb/modules-docs/tokenizer-2/audit.md §6):
//   - requireModuleActive('tokenizer-2') is the FIRST executable statement — RETURNS failure, never throws.
//   - getTokenizerApi() throws TOKENIZER_API_UNAVAILABLE when game.modules.get('tokenizer-2').api is
//     unbound (module active but the tokenizer-2.ready hook hasn't fired yet) — distinct from
//     MODULE_NOT_ACTIVE, which requireModuleActive already covers.
//   - Actor resolution by UUID string (fromUuidSync / game.actors.get), never an object — MCP inputs are JSON.
//   - tokenize-batch / cleanup-flags require confirm:true (CCR-4 — bulk write across many actors/files).
//   - tokenize-batch loops api.tokenize() per actor rather than calling the module's native
//     tokenizeBatch() directly — the native method's partial-failure semantics are unconfirmed from the
//     minified bundle (no source map), and the plan requires a guaranteed
//     [{actorUuid,result}|{actorUuid,error}, ...] shape that never hard-throws on one actor's failure.
//     Looping over the confirmed single-actor primitive gives full control over that contract.
//   - Post-write settle-poll re-read of actor.prototypeToken.texture.src (DP-16) — the module's own
//     actor.update() may land on a later tick than tokenize()'s resolution.
//   - GM-gated on all actions; reads also require GM for consistency (matches module-tagger).
//   - notify.updated on every write; no notify on reads.
//   - createImageLayer/createRingLayer are NOT called directly — internal to tokenize/exportLayers,
//     no cross-call object persistence across an MCP round-trip (plan Design Decisions).

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleTokenizerInput, type ModuleTokenizerInputType, ErrorTokens } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';
import { settlePoll } from '../_shared/settle-poll.js';
import { buildOutcomeResponse } from '../../../services/shared/outcome-response.js';

// ── Local helpers ──────────────────────────────────────────────────────────────

function getTokenizerApi(): any {
  const mod = (globalThis as any).game?.modules?.get?.('tokenizer-2');
  const api = mod?.api;
  if (!api) {
    throw new Error(`${ErrorTokens.TOKENIZER_API_UNAVAILABLE}: tokenizer-2 module is active but its api is not yet bound — the tokenizer-2.ready hook may not have fired`);
  }
  return api;
}

/** Resolve a UUID string to an Actor Document, or throw. */
function resolveActor(uuid: string): any {
  const sync = (globalThis as any).fromUuidSync;
  const doc = typeof sync === 'function' ? sync(uuid) : null;
  const actor = doc ?? (globalThis as any).game?.actors?.get?.(uuid);
  if (!actor) throw new Error(`DOCUMENT_NOT_FOUND: cannot resolve UUID "${uuid}" to an Actor`);
  return actor;
}

const TOKENIZE_OPT_KEYS = [
  'frameSrc', 'maskSrc', 'backgroundSrc', 'skipRing', 'skipBackground', 'disposition',
  'exportSize', 'exportFormat', 'saveFolder', 'filename', 'updateActor', 'useActorImg',
  'forceDynamicRing', 'forceBakedRing', 'wildcardMode',
] as const;

function buildTokenizeOpts(input: Record<string, unknown>): Record<string, any> {
  const opts: Record<string, any> = {};
  for (const key of TOKENIZE_OPT_KEYS) {
    if (input[key] !== undefined) opts[key] = input[key];
  }
  return opts;
}

/** Extract the exported image path from a tokenize()/exportLayers() return value, whatever its exact shape. */
function extractResultPath(result: unknown): string | null {
  if (typeof result === 'string') return result;
  const r = result as any;
  return r?.path ?? r?.tokenPath ?? r?.src ?? null;
}

/**
 * BUG-850 — for a wildcard-baseline prototype-token actor (`.src` is a glob like `path/*`),
 * Tokenizer 2's default `wildcardMode:"keep"` behavior genuinely writes a NEW numbered
 * set-member file (confirmed live-API read, see
 * .agents/research/systemic_bug_class_prevention/phase3_tokenizer_api.md §d) and deliberately
 * NEVER touches `prototypeToken.texture.src` — the glob is left unchanged BY DESIGN, not as a
 * failed repoint. So an unchanged `.src` alongside a non-null `resultPath` is the CORRECT,
 * expected outcome for a wildcard baseline, and must not be treated as `TOKENIZE_NOT_PERSISTED`.
 */
function isWildcardTexture(baselineTexture: string | null): boolean {
  return typeof baselineTexture === 'string' && baselineTexture.includes('*');
}

/**
 * DP-16 — settle-poll re-read of prototypeToken.texture.src after api.tokenize(), then verify
 * it actually reflects the exported path. The module's own actor.update() may land on a later
 * tick than tokenize()'s resolution, so an instant read-back is not trustworthy.
 */
export async function settleAndVerifyTexture(
  actorUuid: string,
  baselineTexture: string | null,
  resultPath: string | null,
): Promise<{ texture: string | null; error?: string }> {
  const wildcardBaseline = isWildcardTexture(baselineTexture);
  const fresh = await settlePoll(
    () => resolveActor(actorUuid),
    (a: any) => {
      const src: string | null = a?.prototypeToken?.texture?.src ?? null;
      if (wildcardBaseline) {
        // BUG-850: a wildcard baseline never gets `.src` repointed on the module's default
        // wildcardMode:"keep" — the settle condition is just a non-null resultPath, since
        // `.src` legitimately never changes.
        return resultPath != null || src !== baselineTexture;
      }
      return src !== baselineTexture || (resultPath != null && src === resultPath);
    },
  );
  const texture: string | null = fresh?.prototypeToken?.texture?.src ?? null;

  if (wildcardBaseline) {
    // Unchanged glob `.src` + a non-null resultPath is SUCCESS for a wildcard baseline — the
    // module added a new set-member file, it never intended to repoint `.src`. Only a genuinely
    // null resultPath (the export itself never produced a path) is a real failure here.
    if (texture === baselineTexture && resultPath == null) {
      return {
        texture,
        error: `${ErrorTokens.TOKENIZE_NOT_PERSISTED}: wildcard tokenize produced no exported path for baseline "${baselineTexture}" after settle-poll`,
      };
    }
    return { texture };
  }

  if (texture === baselineTexture && resultPath != null && resultPath !== baselineTexture) {
    return {
      texture,
      error: `${ErrorTokens.TOKENIZE_NOT_PERSISTED}: prototypeToken.texture.src did not update to the exported image "${resultPath}" after settle-poll`,
    };
  }
  return { texture };
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleTokenizer(data: unknown): Promise<any> {
  const g = requireModuleActive('tokenizer-2');
  if (g) return g;

  const parsed = ModuleTokenizerInput.parse(data);

  switch (parsed.action) {
    case 'tokenize':              return handleTokenize(parsed);
    case 'tokenize-batch':        return handleTokenizeBatch(parsed);
    case 'export-layers':         return handleExportLayers(parsed);
    case 'register-custom-frame': return handleRegisterCustomFrame(parsed);
    case 'cleanup-flags':         return handleCleanupFlags(parsed);
    case 'get-settings':          return handleGetSettings(parsed);
    case 'list-registered':       return handleListRegistered(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-tokenizer action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── Write handlers ────────────────────────────────────────────────────────────

type TokenizeInput = Extract<ModuleTokenizerInputType, { action: 'tokenize' }>;

async function handleTokenize(input: TokenizeInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can tokenize an actor' };
  try {
    const api = getTokenizerApi();
    const actor = resolveActor(input.actorUuid);
    const opts = buildTokenizeOpts(input);
    const baselineTexture: string | null = actor.prototypeToken?.texture?.src ?? null;

    const rawResult = await api.tokenize(actor, opts);
    const resultPath = extractResultPath(rawResult);

    const wantsActorUpdate = opts.updateActor !== false; // module writes the actor by default
    let prototypeTokenTexture: string | null = baselineTexture;

    if (wantsActorUpdate) {
      const verify = await settleAndVerifyTexture(input.actorUuid, baselineTexture, resultPath);
      if (verify.error) return { success: false, error: verify.error };
      prototypeTokenTexture = verify.texture;
    }

    notify.updated('tokenizer', `Tokenized actor "${actor.name ?? input.actorUuid}"`, {});
    return {
      success: true,
      data: {
        actorUuid: input.actorUuid,
        tokenPath: resultPath,
        updatedActor: wantsActorUpdate,
        prototypeTokenTexture,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENIZER_TOKENIZE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type TokenizeBatchInput = Extract<ModuleTokenizerInputType, { action: 'tokenize-batch' }>;

async function handleTokenizeBatch(input: TokenizeBatchInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can batch-tokenize actors' };

  // CCR-4: bulk write across many actors + many filesystem images — require confirm.
  if (input.confirm !== true) {
    return {
      success: false,
      error: `${ErrorTokens.TOKENIZER_CONFIRM_REQUIRED}: tokenize-batch writes ${input.actorUuids.length} actor(s) + filesystem image(s). Re-send with confirm:true.`,
    };
  }

  const api = getTokenizerApi();
  const opts = buildTokenizeOpts(input);
  const wantsActorUpdate = opts.updateActor !== false; // module writes the actor by default

  const results: Array<{ actorUuid: string; result?: { tokenPath: string | null }; error?: string }> = [];
  let succeeded = 0;

  for (const actorUuid of input.actorUuids) {
    try {
      const actor = resolveActor(actorUuid);
      const baselineTexture: string | null = actor.prototypeToken?.texture?.src ?? null;
      const rawResult = await api.tokenize(actor, opts);
      const tokenPath = extractResultPath(rawResult);

      if (wantsActorUpdate) {
        // BUG-850: align with handleTokenize's settle-and-verify — a failure here becomes
        // THIS item's `error` entry, never a thrown exception that aborts the whole batch.
        const verify = await settleAndVerifyTexture(actorUuid, baselineTexture, tokenPath);
        if (verify.error) {
          results.push({ actorUuid, error: verify.error });
          continue;
        }
      }

      results.push({ actorUuid, result: { tokenPath } });
      succeeded++;
    } catch (e) {
      results.push({ actorUuid, error: e instanceof Error ? e.message : String(e) });
    }
  }

  const failed = input.actorUuids.length - succeeded;
  const outcome = failed === 0 ? 'applied' : succeeded === 0 ? 'failed' : 'partial';
  notify.updated('tokenizer', `Batch-tokenized ${succeeded}/${input.actorUuids.length} actor(s)${failed > 0 ? ` (${failed} failed)` : ''}`, {});
  return {
    success: true,
    data: buildOutcomeResponse(outcome, { total: input.actorUuids.length, succeeded, failed, results }),
  };
}

type ExportLayersInput = Extract<ModuleTokenizerInputType, { action: 'export-layers' }>;

const EXPORT_LAYERS_OPT_KEYS = ['exportSize', 'exportFormat', 'saveFolder', 'filename'] as const;

function buildExportLayersOpts(input: ExportLayersInput): Record<string, any> {
  const opts: Record<string, any> = {};
  for (const key of EXPORT_LAYERS_OPT_KEYS) {
    if (input[key] !== undefined) opts[key] = input[key];
  }
  return opts;
}

function describeLayerCount(input: ExportLayersInput): string {
  const layerCount = Array.isArray(input.layers) ? input.layers.length : null;
  return layerCount != null ? ` (${layerCount} layer(s))` : ' (opaque layerStack)';
}

async function handleExportLayers(input: ExportLayersInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can export a layer stack' };

  const hasLayers = Array.isArray(input.layers) && input.layers.length > 0;
  if (!hasLayers && input.layerStack === undefined) {
    return {
      success: false,
      error: 'INVALID_PARAMS: export-layers requires either a non-empty layers[] array or an opaque layerStack blob',
    };
  }

  try {
    const api = getTokenizerApi();
    const layers = input.layerStack ?? input.layers;
    const rawResult = await api.exportLayers(layers, buildExportLayersOpts(input));
    const resultPath = extractResultPath(rawResult);

    // BUG-852 — confirmed live-API read (phase3_tokenizer_api.md §c): Tokenizer 2's
    // exportLayers() ALWAYS resolves to {blob, dataURL} only — it never returns a
    // path/tokenPath/src, for a well-formed layers[]/layerStack OR a bogus one. There is
    // no reachable success path through this extraction logic today; fail loud instead
    // of silently reporting success:true on a no-op.
    if (resultPath == null) {
      return {
        success: false,
        error: 'TOKENIZER_EXPORT_LAYERS_ERROR: export produced no path — the module returns {blob, dataURL} only, never a file path, for any input (1.1\'s finding: no input shape yields a path)',
      };
    }

    notify.updated('tokenizer', `Exported layer stack${describeLayerCount(input)}`, {});
    return { success: true, data: { exportPath: resultPath } };
  } catch (e) {
    return { success: false, error: `TOKENIZER_EXPORT_LAYERS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type RegisterCustomFrameInput = Extract<ModuleTokenizerInputType, { action: 'register-custom-frame' }>;

/**
 * BUG-848 — registerCustomFrame's real signature is a SINGLE descriptor object
 * `{src, label?, group?}` (confirmed by static read of the v1.2.6 bundle, see
 * .agents/research/systemic_bug_class_prevention/phase3_tokenizer_api.md §a), not
 * `(name, path, config)`. It persists to a `game.settings` world setting rather than
 * throwing — `custom-frame-groups` when `group` is supplied, else the flat `custom-frames`
 * array — and resolves to `false` (never rejects) on a missing/non-string `src` OR a
 * duplicate entry already present in the target array. The old 3-positional-arg call bound
 * `input.name` (a bare string) to the sole parameter, so `n.src` was always `undefined` and
 * the function returned `false` on its very first line, before ever touching a setting —
 * a guaranteed no-op that the old handler never checked (it reported success:true
 * unconditionally). Fixed here: correct call shape + DP-16 settle-poll re-read of the
 * actual target setting before reporting success.
 */
async function handleRegisterCustomFrame(input: RegisterCustomFrameInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can register a custom frame' };
  try {
    const api = getTokenizerApi();
    const group = typeof input.config?.group === 'string' ? (input.config.group as string) : undefined;

    // Real return value: `true` on a genuine new-entry write, `false` on a duplicate
    // `src` already present in the target array (not an error — an idempotent no-op).
    const wasNewlyRegistered: boolean = await api.registerCustomFrame({ src: input.path, label: input.name, group });

    const settingKey = group ? 'custom-frame-groups' : 'custom-frames';
    const isRegistered = (): boolean => {
      const list = (globalThis as any).game?.settings?.get?.('tokenizer-2', settingKey);
      if (!Array.isArray(list)) return false;
      if (group) {
        // custom-frame-groups shape: [{ label: <group>, frames: [{src, label}, ...] }, ...]
        const entry = list.find((g: any) => g?.label === group);
        return Boolean(entry?.frames?.some((f: any) => f?.src === input.path));
      }
      // custom-frames shape: [{ src, label }, ...]
      return list.some((f: any) => f?.src === input.path);
    };

    const persisted = await settlePoll(isRegistered);
    if (!persisted) {
      return {
        success: false,
        error: `TOKENIZER_REGISTER_NOT_PERSISTED: frame "${input.name}" (${input.path}) was not found in world setting "${settingKey}" after settle-poll`,
      };
    }

    notify.updated('tokenizer', `Registered custom frame "${input.name}"`, {});
    return {
      success: true,
      data: buildOutcomeResponse(wasNewlyRegistered ? 'applied' : 'alreadyApplied', {
        name: input.name,
        path: input.path,
        group: group ?? null,
      }),
    };
  } catch (e) {
    return { success: false, error: `TOKENIZER_REGISTER_FRAME_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type CleanupFlagsInput = Extract<ModuleTokenizerInputType, { action: 'cleanup-flags' }>;

async function handleCleanupFlags(input: CleanupFlagsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can clean up Tokenizer flags' };

  // CCR-4: sweeps flags across (potentially) every actor in the world — require confirm.
  if (input.confirm !== true) {
    return {
      success: false,
      error: `${ErrorTokens.TOKENIZER_CONFIRM_REQUIRED}: cleanup-flags is a bulk maintenance write. Re-send with confirm:true.`,
    };
  }

  try {
    const api = getTokenizerApi();
    const actors = input.actorUuids && input.actorUuids.length > 0 ? input.actorUuids.map(resolveActor) : undefined;
    await api.cleanupActorFlags(actors);
    notify.updated('tokenizer', actors ? `Cleaned up Tokenizer flags on ${actors.length} actor(s)` : 'Cleaned up Tokenizer flags world-wide', {});
    return { success: true, data: { scope: actors ? actors.length : 'world' } };
  } catch (e) {
    return { success: false, error: `TOKENIZER_CLEANUP_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Read handlers ─────────────────────────────────────────────────────────────

const KNOWN_SETTINGS = ['export-format', 'export-size', 'save-location', 'custom-frames'] as const;

type GetSettingsInput = Extract<ModuleTokenizerInputType, { action: 'get-settings' }>;

/** Read one setting key, returning null (not throwing) if the key isn't registered under this module. */
function readSetting(game: any, key: string): unknown {
  try {
    return game?.settings?.get?.('tokenizer-2', key);
  } catch {
    return null;
  }
}

async function handleGetSettings(input: GetSettingsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: reading Tokenizer settings requires GM access' };
  try {
    const game = (globalThis as any).game;
    const keys = input.keys && input.keys.length > 0 ? input.keys : KNOWN_SETTINGS;
    const settings: Record<string, unknown> = {};
    for (const key of keys) {
      settings[key] = readSetting(game, key);
    }
    return { success: true, data: { settings } };
  } catch (e) {
    return { success: false, error: `TOKENIZER_GET_SETTINGS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type ListRegisteredInput = Extract<ModuleTokenizerInputType, { action: 'list-registered' }>;

/**
 * BUG-849 — the old `registryNames()` did `Object.keys()` on `frameRegistry`/`pluginRegistry`,
 * both class instances, surfacing their private field names (`_static`, `_loaders`,
 * `_loaderCache`, `_activeKind`, `_plugins`, `_toolIds`, `_animationPresets`, `_encoders`)
 * instead of real registered entries. Real enumeration surface confirmed by static bundle read
 * (see .agents/research/systemic_bug_class_prevention/phase3_tokenizer_api.md §(b), LAW for
 * this fix): `pluginRegistry.getAll()` → `[...this._plugins.values()]` (real plugin objects),
 * `async frameRegistry.getSections('frame' | 'mask')` → hydrated `{id, label, subsections}`
 * section objects merging the registry's `_static` + lazily-loaded `_loaders` entries. Neither
 * accessor by itself covers user-registered custom frames, which BUG-848 confirmed persist to
 * the separate `custom-frames` (flat `{src, label}`) and `custom-frame-groups` (per-group
 * `{label, frames:[{src,label},...]}`) world settings (`tokenizer.ts:335` region) rather than
 * into the frameRegistry itself — so those settings are merged in and dedup'd against the
 * registry sections (dedup key: `id` for registry entries, `src` for setting entries — the two
 * identity domains a single entry can arrive under), each entry source-tagged `registry` vs
 * `setting` per D8.
 */
type FrameEntry = { id: string; label: string; kind: 'frame' | 'mask'; source: 'registry' | 'setting'; group?: string };
type PluginEntry = { id: string; name: string };

function addRegistrySections(out: FrameEntry[], seen: Set<string>, kind: 'frame' | 'mask', sections: any[]): void {
  for (const s of sections) {
    const id = typeof s?.id === 'string' ? s.id : s?.id != null ? String(s.id) : undefined;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label: typeof s?.label === 'string' ? s.label : id, kind, source: 'registry' });
  }
}

async function collectFrames(api: any): Promise<FrameEntry[]> {
  const seen = new Set<string>();
  const out: FrameEntry[] = [];

  const frameRegistry = api?.frameRegistry;
  const frameSections: any[] = frameRegistry ? ((await frameRegistry.getSections('frame')) ?? []) : [];
  addRegistrySections(out, seen, 'frame', frameSections);
  const maskSections: any[] = frameRegistry ? ((await frameRegistry.getSections('mask')) ?? []) : [];
  addRegistrySections(out, seen, 'mask', maskSections);

  const game = (globalThis as any).game;
  const customFrames = game?.settings?.get?.('tokenizer-2', 'custom-frames');
  if (Array.isArray(customFrames)) {
    for (const f of customFrames) {
      const id = typeof f?.src === 'string' ? f.src : undefined;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, label: typeof f?.label === 'string' ? f.label : id, kind: 'frame', source: 'setting' });
    }
  }

  const customFrameGroups = game?.settings?.get?.('tokenizer-2', 'custom-frame-groups');
  if (Array.isArray(customFrameGroups)) {
    for (const g of customFrameGroups) {
      const groupLabel = typeof g?.label === 'string' ? g.label : undefined;
      for (const f of g?.frames ?? []) {
        const id = typeof f?.src === 'string' ? f.src : undefined;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push({ id, label: typeof f?.label === 'string' ? f.label : id, kind: 'frame', source: 'setting', group: groupLabel });
      }
    }
  }

  return out;
}

function collectPlugins(api: any): PluginEntry[] {
  const list: any[] = typeof api?.pluginRegistry?.getAll === 'function' ? api.pluginRegistry.getAll() : [];
  return list.map((p: any, i: number) => {
    const id = typeof p?.id === 'string' ? p.id : p?.id != null ? String(p.id) : `plugin-${i}`;
    const name = typeof p?.name === 'string' ? p.name : id;
    return { id, name };
  });
}

async function handleListRegistered(_input: ListRegisteredInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: reading registered frames/plugins requires GM access' };
  try {
    const api = getTokenizerApi();
    const frames = await collectFrames(api);
    const plugins = collectPlugins(api);
    return {
      success: true,
      data: { frames, plugins },
    };
  } catch (e) {
    return { success: false, error: `TOKENIZER_LIST_REGISTERED_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
