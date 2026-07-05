// DIALOG-PATH: DIALOG_GUARDED — 6 of the 7 tokenmagic-preset subActions (add/delete/import-from-
// path/import-from-url/import-template-settings/list/get) confirmed DIALOG_INVESTIGATED (research
// agent live-read every sibling preset method; zero Dialog/DialogV2/FilePicker/Hooks.once risk).
// `reset-library` is the sole exception (BUG-432): `TM.resetPresetLibrary()` internally awaits a
// native `window.confirm()` — guarded by a temporary monkey-patch for the call's duration. See the
// per-subaction inline comments below for the full citations.
//
// Module Integration v1 Phase 6A-ii — tokenmagic + automatic-wounds action handlers.
//
// All handlers call globalThis.TokenMagic.* and globalThis.TokenMagicAutomaticWounds.*
// directly (handlers run inside Foundry via CONFIG.queries — no macro-execute bridge needed).
//
// Placeable resolution:
//   - Token, Tile, MeasuredTemplate, Drawing, Region looked up on canvas.*s.get(id)
//     or canvas.*.placeables.find() per placeable type.
//   - Handlers call the DOCUMENT (.document) not the PlaceableObject itself where the
//     TokenMagic API accepts either; getPlaceableById covers both paths.
//
// FLAG INVERSION (CRITICAL — companion:toggleDisableWounds):
//   The companion stores per-actor disable state as:
//     actor.flags['tokenmagic-automatic-wounds']['enabled-for-token']
//   where flag value true  = wounds are DISABLED (counterintuitive naming).
//         flag value false = wounds are ENABLED.
//   Variable in companion source: FLAG_DISABLE_WOUNDS = 'enabled-for-token'
//   The wound-toggle-disable handler exposes `disabled: boolean` (clear intent)
//   and maps it to the inverted flag through toggleDisableWounds() which handles
//   the inversion internally. Callers always work with intended semantics.
//
// Notify contract:
//   - Write operations: notify.updated('token', tokenName, { summary }) after success.
//   - Read operations (tokenmagic-query): silent — no notify.
//   - Preset add/delete: notify.updated('setting', 'tokenmagic presets', { summary }).
//   - Preset import/reset: notify.updated('setting', ...) after confirm gate passes.
//
// Post-write verify:
//   - After filter writes, re-read document.getFlag('tokenmagic','filters') and include
//     presence/count in the response payload.
//
// Anchors:
//   - tokenmagic/audit.md §API Surface + §FilterType Catalog + §Token Magic Automatic Wounds
//   - tokenmagic/capability-manifest.json (action → method mappings)
//   - CCR-4 confirm gate on tokenmagic-preset import/reset sub-actions

import { notify } from '../../../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import type { ModuleSceneAtmosphereInputType } from '@foundry-mcp/shared';
import { Envelope, getGame, getCanvas } from '../_shared/handler-utils.js';

function getCanvasOrThrow(): any {
  const c = getCanvas();
  if (!c?.scene) {
    throw new Error('CANVAS_UNAVAILABLE: canvas.scene not available');
  }
  return c;
}


// ── API accessors ─────────────────────────────────────────────────────────────

function getTokenMagic(): any {
  const tm = (globalThis as any).TokenMagic;
  if (!tm) {
    throw new Error('TOKENMAGIC_API_UNAVAILABLE: globalThis.TokenMagic not bound (module may not be fully initialised)');
  }
  return tm;
}

function getAutomaticWounds(): any {
  const aw = (globalThis as any).TokenMagicAutomaticWounds;
  if (!aw) {
    throw new Error('TOKENMAGIC_WOUNDS_API_UNAVAILABLE: globalThis.TokenMagicAutomaticWounds not bound (companion module may not be fully initialised)');
  }
  return aw;
}

// ── Placeable resolution ──────────────────────────────────────────────────────

type PlaceableType = 'Token' | 'Tile' | 'MeasuredTemplate' | 'Drawing' | 'Region';

/**
 * Resolve a Foundry PlaceableObject from the current canvas by ID and type.
 * TokenMagic API accepts both PlaceableObject and CanvasDocument — we return
 * the PlaceableObject (the canvas object, not the document) since the companion
 * API (createWoundOnToken etc.) specifically needs the Token canvas object.
 */
function resolvePlaceable(placeableId: string, placeableType: PlaceableType): any {
  const c = getCanvasOrThrow();
  let collection: any;
  switch (placeableType) {
    case 'Token':            collection = c.tokens; break;
    case 'Tile':             collection = c.tiles; break;
    case 'MeasuredTemplate': collection = c.templates; break;
    case 'Drawing':          collection = c.drawings; break;
    case 'Region':           collection = c.regions; break;
    default: {
      // Exhaustiveness guard — TypeScript will catch missing cases at compile time.
      const _never: never = placeableType;
      throw new Error(`UNKNOWN_PLACEABLE_TYPE: ${String(_never)}`);
    }
  }

  if (!collection) {
    throw new Error(`CANVAS_LAYER_UNAVAILABLE: canvas.${placeableType.toLowerCase()}s layer not available`);
  }

  // Prefer direct map lookup (O(1)); fall back to linear search by .document.id
  const byGet = collection.get?.(placeableId);
  if (byGet) return byGet;

  const byFind = collection.placeables?.find?.(
    (p: any) => p.id === placeableId || p.document?.id === placeableId,
  );
  if (byFind) return byFind;

  throw new Error(
    `PLACEABLE_NOT_FOUND: No ${placeableType} with id "${placeableId}" on the current scene "${c.scene?.name ?? c.scene?.id}"`,
  );
}

/**
 * Resolve a Token canvas object by document ID for companion wound API.
 */
function resolveToken(tokenId: string): any {
  return resolvePlaceable(tokenId, 'Token');
}

/**
 * Resolve an Actor document by ID.
 */
function resolveActor(actorId: string): any {
  const game = getGame();
  const actor = game?.actors?.get?.(actorId);
  if (!actor) {
    throw new Error(`ACTOR_NOT_FOUND: No actor with id "${actorId}"`);
  }
  return actor;
}

/**
 * Get the display name for a token (for notify labels).
 */
function getTokenName(tokenId: string): string {
  try {
    const token = resolveToken(tokenId);
    return token.document?.name ?? token.name ?? tokenId;
  } catch {
    return tokenId;
  }
}

// ── Post-write verification helper ────────────────────────────────────────────

function readFilterFlag(placeableId: string, placeableType: PlaceableType): unknown {
  try {
    const placeable = resolvePlaceable(placeableId, placeableType);
    return placeable.document?.getFlag?.('tokenmagic', 'filters') ?? null;
  } catch {
    return null;
  }
}

// ── Type aliases (extracted from the discriminated union) ─────────────────────

type TokenmagicApplyInput      = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-apply' }>;
type TokenmagicUpsertInput     = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-upsert' }>;
type TokenmagicRemoveInput     = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-remove' }>;
type TokenmagicQueryInput      = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-query' }>;
type TokenmagicPresetInput     = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-preset' }>;
type TokenmagicWoundCreateInput  = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-wound-create' }>;
type TokenmagicWoundHealInput    = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-wound-heal' }>;
type TokenmagicWoundRemoveInput  = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-wound-remove' }>;
type TokenmagicWoundReapplyInput = Extract<ModuleSceneAtmosphereInputType, { action: 'tokenmagic-wound-reapply' }>;
type WoundToggleDisableInput   = Extract<ModuleSceneAtmosphereInputType, { action: 'wound-toggle-disable' }>;
type WoundSetBloodColorInput   = Extract<ModuleSceneAtmosphereInputType, { action: 'wound-set-blood-color' }>;

// ── tokenmagic-apply ──────────────────────────────────────────────────────────

export async function handleTokenmagicApply(input: TokenmagicApplyInput): Promise<Envelope<unknown>> {
  try {
    const TM = getTokenMagic();
    const placeable = resolvePlaceable(input.placeableId, input.placeableType);

    await TM.addFilters(placeable, input.params, input.replace ?? false);

    const tokenName = placeable.document?.name ?? input.placeableId;
    notify.updated('token', tokenName, {
      summary: `tokenmagic apply: ${input.params.length} filter(s) [${input.params.map((p: any) => p.filterType).join(', ')}]${input.replace ? ' (replace=true)' : ''}`,
    });

    // Post-write verify
    const verifiedFilters = readFilterFlag(input.placeableId, input.placeableType);
    const verifiedCount = Array.isArray(verifiedFilters) ? verifiedFilters.length : null;

    return {
      success: true,
      data: {
        placeableId: input.placeableId,
        placeableType: input.placeableType,
        appliedCount: input.params.length,
        filterTypes: input.params.map((p: any) => p.filterType),
        filterIds: input.params.map((p: any) => p.filterId ?? null),
        replace: input.replace ?? false,
        verifiedFilterCount: verifiedCount,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_APPLY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-upsert ─────────────────────────────────────────────────────────

export async function handleTokenmagicUpsert(input: TokenmagicUpsertInput): Promise<Envelope<unknown>> {
  try {
    const TM = getTokenMagic();
    const placeable = resolvePlaceable(input.placeableId, input.placeableType);

    await TM.addUpdateFilters(placeable, input.params);

    const tokenName = placeable.document?.name ?? input.placeableId;
    notify.updated('token', tokenName, {
      summary: `tokenmagic upsert: ${input.params.length} filter(s) [${input.params.map((p: any) => p.filterType).join(', ')}]`,
    });

    const verifiedFilters = readFilterFlag(input.placeableId, input.placeableType);
    const verifiedCount = Array.isArray(verifiedFilters) ? verifiedFilters.length : null;

    return {
      success: true,
      data: {
        placeableId: input.placeableId,
        placeableType: input.placeableType,
        upsertedCount: input.params.length,
        filterTypes: input.params.map((p: any) => p.filterType),
        filterIds: input.params.map((p: any) => p.filterId ?? null),
        verifiedFilterCount: verifiedCount,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_UPSERT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-remove ─────────────────────────────────────────────────────────

export async function handleTokenmagicRemove(input: TokenmagicRemoveInput): Promise<Envelope<unknown>> {
  try {
    const TM = getTokenMagic();
    const placeable = resolvePlaceable(input.placeableId, input.placeableType);

    // deleteFilters(placeable, filterId?, filterType?, filterInternalId?)
    // All-null = delete all. Selective by supplied args.
    await TM.deleteFilters(
      placeable,
      input.filterId ?? null,
      input.filterType ?? null,
      input.filterInternalId ?? null,
    );

    const tokenName = placeable.document?.name ?? input.placeableId;
    const targetDesc =
      input.filterId && input.filterType ? `filterId=${input.filterId} + filterType=${input.filterType}`
      : input.filterId ? `filterId=${input.filterId}`
      : input.filterType ? `filterType=${input.filterType}`
      : 'ALL filters';
    notify.updated('token', tokenName, {
      summary: `tokenmagic remove: ${targetDesc}`,
    });

    const verifiedFilters = readFilterFlag(input.placeableId, input.placeableType);
    const verifiedCount = Array.isArray(verifiedFilters) ? verifiedFilters.length : 0;

    return {
      success: true,
      data: {
        placeableId: input.placeableId,
        placeableType: input.placeableType,
        filterId: input.filterId ?? null,
        filterType: input.filterType ?? null,
        filterInternalId: input.filterInternalId ?? null,
        targetDesc,
        verifiedRemainingFilterCount: verifiedCount,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_REMOVE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-query ──────────────────────────────────────────────────────────

export async function handleTokenmagicQuery(input: TokenmagicQueryInput): Promise<Envelope<unknown>> {
  try {
    const TM = getTokenMagic();
    const game = getGame();

    switch (input.subAction) {
      case 'has-filter-type': {
        if (!input.placeableId || !input.placeableType || !input.filterType) {
          return { success: false, error: 'TOKENMAGIC_QUERY_ERROR: has-filter-type requires placeableId, placeableType, filterType' };
        }
        const placeable = resolvePlaceable(input.placeableId, input.placeableType);
        const result = TM.hasFilterType(placeable, input.filterType);
        return {
          success: true,
          data: {
            subAction: 'has-filter-type',
            placeableId: input.placeableId,
            placeableType: input.placeableType,
            filterType: input.filterType,
            hasFilter: result,
          },
        };
      }

      case 'has-filter-id': {
        if (!input.placeableId || !input.placeableType || !input.filterId) {
          return { success: false, error: 'TOKENMAGIC_QUERY_ERROR: has-filter-id requires placeableId, placeableType, filterId' };
        }
        const placeable = resolvePlaceable(input.placeableId, input.placeableType);
        const result = TM.hasFilterId(placeable, input.filterId);
        return {
          success: true,
          data: {
            subAction: 'has-filter-id',
            placeableId: input.placeableId,
            placeableType: input.placeableType,
            filterId: input.filterId,
            hasFilter: result,
          },
        };
      }

      case 'get-filters': {
        if (!input.placeableId || !input.placeableType) {
          return { success: false, error: 'TOKENMAGIC_QUERY_ERROR: get-filters requires placeableId and placeableType' };
        }
        const placeable = resolvePlaceable(input.placeableId, input.placeableType);
        const filters = placeable.document?.getFlag?.('tokenmagic', 'filters') ?? null;
        const filterArray = Array.isArray(filters) ? filters : null;
        return {
          success: true,
          data: {
            subAction: 'get-filters',
            placeableId: input.placeableId,
            placeableType: input.placeableType,
            filters: filterArray,
            count: filterArray?.length ?? 0,
            filterIds: filterArray?.map((f: any) => f?.tmFilters?.tmFilterId ?? null) ?? [],
            filterTypes: filterArray?.map((f: any) => f?.tmFilters?.tmFilterType ?? null) ?? [],
          },
        };
      }

      case 'get-anime-info': {
        if (!input.placeableId || !input.placeableType) {
          return { success: false, error: 'TOKENMAGIC_QUERY_ERROR: get-anime-info requires placeableId and placeableType' };
        }
        const placeable = resolvePlaceable(input.placeableId, input.placeableType);
        const animeInfo = placeable.document?.getFlag?.('tokenmagic', 'animeInfo') ?? null;
        return {
          success: true,
          data: {
            subAction: 'get-anime-info',
            placeableId: input.placeableId,
            placeableType: input.placeableType,
            animeInfo: Array.isArray(animeInfo) ? animeInfo : null,
            count: Array.isArray(animeInfo) ? animeInfo.length : 0,
          },
        };
      }

      case 'get-filter-types': {
        // Returns the 43-key FilterType registry object.
        const filterTypes = TM.filterTypes ?? {};
        const keys = Object.keys(filterTypes);
        return {
          success: true,
          data: {
            subAction: 'get-filter-types',
            filterTypes: filterTypes,
            count: keys.length,
            keys,
          },
        };
      }

      case 'get-min-padding': {
        const minPadding = TM.getMinPadding?.() ?? game?.settings?.get?.('tokenmagic', 'minPadding') ?? null;
        return {
          success: true,
          data: {
            subAction: 'get-min-padding',
            minPadding,
          },
        };
      }

      case 'get-settings': {
        // tokenmagic world settings
        const tmSettings: Record<string, unknown> = {};
        const tmKeys = [
          'minPadding', 'fxPlayerPermission', 'importOverwrite', 'useZOrder',
          'disableVideo', 'autohideTemplateElements', 'useAdditivePadding',
          'alwaysDisplayEditorControl',
        ];
        for (const key of tmKeys) {
          try {
            tmSettings[key] = game?.settings?.get?.('tokenmagic', key);
          } catch {
            tmSettings[key] = null;
          }
        }
        // tokenmagic-automatic-wounds world settings
        const awSettings: Record<string, unknown> = {};
        const awKeys = ['clear-wounds-on-full-heal', 'token-images-are-circular'];
        for (const key of awKeys) {
          try {
            awSettings[key] = game?.settings?.get?.('tokenmagic-automatic-wounds', key);
          } catch {
            awSettings[key] = null;
          }
        }
        return {
          success: true,
          data: {
            subAction: 'get-settings',
            tokenmagic: tmSettings,
            'tokenmagic-automatic-wounds': awSettings,
          },
        };
      }

      default: {
        const _never: never = input.subAction;
        return { success: false, error: `TOKENMAGIC_QUERY_ERROR: Unknown subAction "${String(_never)}"` };
      }
    }
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_QUERY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-preset ─────────────────────────────────────────────────────────

export async function handleTokenmagicPreset(input: TokenmagicPresetInput): Promise<Envelope<unknown>> {
  const CONFIRM_REQUIRED_ACTIONS = new Set([
    'import-from-path', 'import-from-url', 'import-template-settings', 'reset-library',
  ]);

  // CCR-4 confirm gate for destructive preset operations
  if (CONFIRM_REQUIRED_ACTIONS.has(input.subAction) && input.confirm !== true) {
    return {
      success: false,
      error: `CONFIRM_REQUIRED: tokenmagic-preset/${input.subAction} overwrites world preset settings — irreversible without re-import. Re-send with confirm:true.`,
    };
  }

  try {
    const TM = getTokenMagic();

    switch (input.subAction) {
      case 'get': {
        if (!input.presetName) {
          return { success: false, error: 'TOKENMAGIC_PRESET_ERROR: get requires presetName' };
        }
        const preset = TM.getPreset(input.presetName);
        return {
          success: true,
          data: {
            subAction: 'get',
            presetName: input.presetName,
            found: preset !== undefined,
            params: preset ?? null,
            count: Array.isArray(preset) ? preset.length : 0,
          },
        };
      }

      case 'list': {
        const library = input.library ?? 'tmfx-main';
        const presets = TM.getPresets(library) ?? [];
        const asArray = Array.isArray(presets) ? presets : [...(presets as any)];
        // Return a COMPACT summary (name + library + filter count) — NOT the full
        // params of every preset. The full library is ~76 presets × deep param trees
        // (>160 KB) which overflows the MCP response. Use subAction:'get' on a single
        // preset name to retrieve its full params.
        return {
          success: true,
          data: {
            subAction: 'list',
            library,
            count: asArray.length,
            names: asArray.map((p: any) => p?.name ?? null),
            presets: asArray.map((p: any) => ({
              name: p?.name ?? null,
              library: p?.library ?? library,
              filterCount: Array.isArray(p?.params) ? p.params.length : 0,
            })),
          },
        };
      }

      case 'add': {
        if (!input.presetName || !input.params) {
          return { success: false, error: 'TOKENMAGIC_PRESET_ERROR: add requires presetName and params' };
        }
        const result = await TM.addPreset(input.presetName, input.params, input.silent ?? false);
        // RC1.1b closure-diff — a truthy result should mean the preset is now readable back.
        if (result !== false && TM.getPreset(input.presetName) === undefined) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: preset "${String(input.presetName)}" absent from TM.getPreset() after addPreset` };
        }
        notify.updated('setting', 'tokenmagic presets', {
          summary: `added preset "${typeof input.presetName === 'string' ? input.presetName : JSON.stringify(input.presetName)}"`,
        });
        return {
          success: true,
          data: {
            subAction: 'add',
            presetName: input.presetName,
            added: Boolean(result),
            note: result === false ? 'false: preset already exists (duplicate name)' : 'OK',
          },
        };
      }

      case 'delete': {
        if (!input.presetName) {
          return { success: false, error: 'TOKENMAGIC_PRESET_ERROR: delete requires presetName' };
        }
        const result = await TM.deletePreset(input.presetName, input.silent ?? false);
        // RC1.1b closure-diff — a truthy result should mean the preset is now gone.
        if (result !== false && TM.getPreset(input.presetName) !== undefined) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: preset "${String(input.presetName)}" still present in TM.getPreset() after deletePreset` };
        }
        notify.updated('setting', 'tokenmagic presets', {
          summary: `deleted preset "${typeof input.presetName === 'string' ? input.presetName : JSON.stringify(input.presetName)}"`,
        });
        return {
          success: true,
          data: {
            subAction: 'delete',
            presetName: input.presetName,
            deleted: Boolean(result),
            note: result === false ? 'false: preset not found or not GM' : 'OK',
          },
        };
      }

      case 'import-from-path': {
        if (!input.path) {
          return { success: false, error: 'TOKENMAGIC_PRESET_ERROR: import-from-path requires path' };
        }
        const opts = input.importOptions ?? {};
        // DIALOG_INVESTIGATED (ADR-10.1, BUG-432 investigation): importPresetLibraryFromPath is a
        // plain fetch(path)→json()→settings.set async function (tokenmagic.js:1192) — confirmed
        // zero Dialog/DialogV2/FilePicker.browse/Hooks.once risk (only resetPresetLibrary's native
        // confirm() carries that risk among the 7 preset methods). Safe to await directly.
        const result = await TM.importPresetLibraryFromPath(input.path, opts);
        if (result === false) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: importPresetLibraryFromPath("${input.path}") returned false` };
        }
        notify.updated('setting', 'tokenmagic presets', {
          summary: `imported preset library; path=${input.path}`,
        });
        return {
          success: true,
          data: {
            subAction: 'import-from-path',
            path: input.path,
            importOptions: opts,
            imported: Boolean(result),
          },
        };
      }

      case 'import-from-url': {
        if (!input.path) {
          return { success: false, error: 'TOKENMAGIC_PRESET_ERROR: import-from-url requires path (as URL string)' };
        }
        const opts = input.importOptions ?? {};
        // DIALOG_INVESTIGATED (ADR-10.1, BUG-432 investigation): importPresetLibraryFromURL is a
        // plain $.getJSON(url)→_importPresetContent() async function (tokenmagic.js:1180) —
        // confirmed zero Dialog/DialogV2/FilePicker.browse/Hooks.once risk. Safe to await directly.
        const result = await TM.importPresetLibraryFromURL(input.path, opts);
        if (result === false) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: importPresetLibraryFromURL("${input.path}") returned false` };
        }
        notify.updated('setting', 'tokenmagic presets', {
          summary: `imported preset library; url=${input.path}`,
        });
        return {
          success: true,
          data: {
            subAction: 'import-from-url',
            url: input.path,
            importOptions: opts,
            imported: Boolean(result),
          },
        };
      }

      case 'import-template-settings': {
        if (!input.path) {
          return { success: false, error: 'TOKENMAGIC_PRESET_ERROR: import-template-settings requires path' };
        }
        const result = await TM.importTemplateSettingsFromPath(input.path);
        if (result === false) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: importTemplateSettingsFromPath("${input.path}") returned false` };
        }
        notify.updated('setting', 'tokenmagic autoTemplateSettings', {
          summary: `imported template settings; path=${input.path}`,
        });
        return {
          success: true,
          data: {
            subAction: 'import-template-settings',
            path: input.path,
            imported: Boolean(result),
          },
        };
      }

      case 'reset-library': {
        // RC1.1b — Q&A decision 3 (2026-07-03), reworked for BUG-440 (2026-07-05): the old
        // guard compared the MAIN-library-only read (52 installed) against a hardcoded 76 —
        // the COMBINED default (52 MAIN + 24 TEMPLATE) — so an already-default library
        // false-failed TOKENMAGIC_PRESET_NOT_PERSISTED. "Default-shaped" is now derived at
        // runtime from TokenMagic's own settings registration (settings.js:137-144 registers
        // the shipped defaults as the setting default), filtered to tmfx-main — version-proof,
        // no magic counts. Snapshot pre-call; drift = pre-call names differ from the shipped
        // defaults AND the post-reset snapshot is unchanged (an already-default library
        // legitimately resets to an identical snapshot — that's still success, not drift).
        const before = TM.getPresets('tmfx-main') ?? [];
        const beforeArr = Array.isArray(before) ? before : [...(before as any)];
        const beforeSnapshot = JSON.stringify(beforeArr.map((p: any) => p?.name).sort());

        const settingDefault = (globalThis as any).game?.settings?.settings?.get?.('tokenmagic.presets')?.default;
        // null → defaults unavailable (registration shape changed): skip the drift check
        // rather than false-fail — the non-empty post-reset assert below still holds.
        const defaultMainNames: string[] | null = Array.isArray(settingDefault)
          ? settingDefault.filter((p: any) => p?.library === 'tmfx-main').map((p: any) => String(p?.name)).sort()
          : null;
        const defaultMainSnapshot = defaultMainNames ? JSON.stringify(defaultMainNames) : null;

        // DIALOG_GUARDED (ADR-10.1 extension — BUG-432, discovered mcp_code_quality_v2 C1):
        // TM.resetPresetLibrary() internally `await`s a native `window.confirm()` before
        // proceeding (tokenmagic.js:1167-1170) — a headless MCP call has no live tab to click
        // it, so an unguarded await here hangs FOREVER (same deadlock class as an unguarded
        // Foundry Dialog). Our own CCR-4 gate above (input.confirm !== true) already collected
        // the equivalent confirmation from the caller, so auto-answering the module's redundant
        // native confirm is a safe, contained branch-around — never a way to skip a REAL
        // unconfirmed destructive action.
        const originalConfirm = (globalThis as any).window?.confirm;
        if (typeof originalConfirm === 'function') (globalThis as any).window.confirm = () => true;
        try {
          await TM.resetPresetLibrary();
        } finally {
          if (typeof originalConfirm === 'function') (globalThis as any).window.confirm = originalConfirm;
        }

        const after = TM.getPresets('tmfx-main') ?? [];
        const afterArr = Array.isArray(after) ? after : [...(after as any)];
        if (afterArr.length === 0) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: preset library is empty after resetPresetLibrary` };
        }
        const afterSnapshot = JSON.stringify(afterArr.map((p: any) => p?.name).sort());
        // Only flag drift when we KNOW the pre-call MAIN library was non-default-shaped
        // (names differ from the shipped defaults) — an already-default library resetting
        // to itself is fine. With defaults unavailable, skip rather than false-fail.
        if (defaultMainSnapshot !== null && beforeSnapshot !== defaultMainSnapshot && afterSnapshot === beforeSnapshot) {
          return { success: false, error: `${ErrorTokens.TOKENMAGIC_PRESET_NOT_PERSISTED}: preset library unchanged after resetPresetLibrary despite a non-default pre-call state (${beforeArr.length} presets)` };
        }

        notify.updated('setting', 'tokenmagic presets', {
          summary: `preset library reset to built-in defaults (${afterArr.length} MAIN presets)`,
        });
        return {
          success: true,
          data: {
            subAction: 'reset-library',
            reset: true,
            note: `Preset library restored to built-in defaults (${afterArr.length} MAIN-library presets${defaultMainNames ? ` of ${defaultMainNames.length} shipped` : ''}).`,
          },
        };
      }

      default: {
        const _never: never = input.subAction;
        return { success: false, error: `TOKENMAGIC_PRESET_ERROR: Unknown subAction "${String(_never)}"` };
      }
    }
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_PRESET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-wound-create ───────────────────────────────────────────────────

export async function handleTokenmagicWoundCreate(input: TokenmagicWoundCreateInput): Promise<Envelope<unknown>> {
  try {
    const AW = getAutomaticWounds();
    const token = resolveToken(input.tokenId);
    const tokenName = getTokenName(input.tokenId);

    await AW.createWoundOnToken(token, input.damageFraction);

    notify.updated('token', tokenName, {
      summary: `wound-create: damageFraction=${input.damageFraction.toFixed(2)}`,
    });

    // Post-write verify
    const verifiedFilters = readFilterFlag(input.tokenId, 'Token');
    const woundFilters = Array.isArray(verifiedFilters)
      ? verifiedFilters.filter((f: any) => f?.tmFilters?.tmFilterId === 'automaticWoundEffect')
      : [];

    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        tokenName,
        damageFraction: input.damageFraction,
        verifiedWoundFilterCount: woundFilters.length,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_WOUND_CREATE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-wound-heal ─────────────────────────────────────────────────────

export async function handleTokenmagicWoundHeal(input: TokenmagicWoundHealInput): Promise<Envelope<unknown>> {
  try {
    const AW = getAutomaticWounds();
    const token = resolveToken(input.tokenId);
    const tokenName = getTokenName(input.tokenId);

    await AW.healWoundsOnToken(token, input.healingFraction);

    notify.updated('token', tokenName, {
      summary: `wound-heal: healingFraction=${input.healingFraction.toFixed(2)}`,
    });

    const verifiedFilters = readFilterFlag(input.tokenId, 'Token');
    const woundFilters = Array.isArray(verifiedFilters)
      ? verifiedFilters.filter((f: any) => f?.tmFilters?.tmFilterId === 'automaticWoundEffect')
      : [];

    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        tokenName,
        healingFraction: input.healingFraction,
        verifiedRemainingWoundFilterCount: woundFilters.length,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_WOUND_HEAL_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-wound-remove ───────────────────────────────────────────────────

export async function handleTokenmagicWoundRemove(input: TokenmagicWoundRemoveInput): Promise<Envelope<unknown>> {
  try {
    const AW = getAutomaticWounds();
    const token = resolveToken(input.tokenId);
    const tokenName = getTokenName(input.tokenId);

    await AW.removeWoundsOnToken(token);

    notify.updated('token', tokenName, {
      summary: 'wound-remove: all automaticWoundEffect filters cleared',
    });

    // Post-write verify: wound filters should be gone
    const verifiedFilters = readFilterFlag(input.tokenId, 'Token');
    const remainingWounds = Array.isArray(verifiedFilters)
      ? verifiedFilters.filter((f: any) => f?.tmFilters?.tmFilterId === 'automaticWoundEffect').length
      : 0;

    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        tokenName,
        removed: true,
        verifiedRemainingWoundFilterCount: remainingWounds,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_WOUND_REMOVE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── tokenmagic-wound-reapply ──────────────────────────────────────────────────

export async function handleTokenmagicWoundReapply(input: TokenmagicWoundReapplyInput): Promise<Envelope<unknown>> {
  try {
    const AW = getAutomaticWounds();
    const token = resolveToken(input.tokenId);
    const tokenName = getTokenName(input.tokenId);

    await AW.reapplyWoundsBasedOnCurrentHp(token);

    notify.updated('token', tokenName, {
      summary: 'wound-reapply: wound filters recalculated from current HP',
    });

    const verifiedFilters = readFilterFlag(input.tokenId, 'Token');
    const woundFilters = Array.isArray(verifiedFilters)
      ? verifiedFilters.filter((f: any) => f?.tmFilters?.tmFilterId === 'automaticWoundEffect')
      : [];

    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        tokenName,
        reapplied: true,
        verifiedWoundFilterCount: woundFilters.length,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENMAGIC_WOUND_REAPPLY_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── wound-toggle-disable ──────────────────────────────────────────────────────
//
// FLAG INVERSION DOCUMENTED:
//   The companion stores: actor.flags['tokenmagic-automatic-wounds']['enabled-for-token']
//   where true  = wounds DISABLED (counterintuitive — the flag VARIABLE is named FLAG_DISABLE_WOUNDS).
//         false = wounds ENABLED.
//
//   toggleDisableWounds(actor) toggles the internal flag and returns the new disabled state
//   as a boolean (true = now disabled). The `disabled` input param here is the CALLER'S INTENT
//   (clear naming). If `disabled` is provided, we read the current state and call toggle only
//   if the current state differs from the requested state. If omitted, always toggle.

export async function handleWoundToggleDisable(input: WoundToggleDisableInput): Promise<Envelope<unknown>> {
  try {
    const AW = getAutomaticWounds();
    const actor = resolveActor(input.actorId);

    // Read current disabled state from the inverted flag.
    // FLAG: 'enabled-for-token' value true  = DISABLED
    //       'enabled-for-token' value false = ENABLED
    const currentFlagValue = actor.getFlag?.('tokenmagic-automatic-wounds', 'enabled-for-token') ?? false;
    // currentDisabled = true when flag is true (i.e., wounds are currently disabled)
    const currentDisabled = Boolean(currentFlagValue);

    let newDisabledState: boolean;

    if (input.disabled !== undefined) {
      // Explicit target state requested.
      if (currentDisabled === input.disabled) {
        // Already in the desired state — no toggle needed.
        newDisabledState = currentDisabled;
        notify.info(`token: ${actor.name ?? input.actorId} — wound-toggle-disable: already disabled=${newDisabledState}, no change`);
        return {
          success: true,
          data: {
            actorId: input.actorId,
            actorName: actor.name ?? input.actorId,
            disabled: newDisabledState,
            enabled: !newDisabledState,
            toggled: false,
            note: `Already in desired state (disabled=${newDisabledState}). No change made.`,
            flagInversionNote: 'Internal flag \'enabled-for-token\' = true means DISABLED (companion source naming inversion).',
          },
        };
      }
      // Need to toggle to reach desired state.
      newDisabledState = await AW.toggleDisableWounds(actor);
    } else {
      // No target specified — unconditional toggle.
      newDisabledState = await AW.toggleDisableWounds(actor);
    }

    notify.updated('token', actor.name ?? input.actorId, {
      summary: `wound-toggle-disable: wounds now ${newDisabledState ? 'DISABLED' : 'ENABLED'} for actor`,
    });

    return {
      success: true,
      data: {
        actorId: input.actorId,
        actorName: actor.name ?? input.actorId,
        disabled: newDisabledState,
        enabled: !newDisabledState,
        toggled: true,
        flagInversionNote: 'Internal flag \'enabled-for-token\' = true means DISABLED (companion source naming inversion).',
      },
    };
  } catch (e) {
    return { success: false, error: `WOUND_TOGGLE_DISABLE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── wound-set-blood-color ─────────────────────────────────────────────────────

export async function handleWoundSetBloodColor(input: WoundSetBloodColorInput): Promise<Envelope<unknown>> {
  try {
    const AW = getAutomaticWounds();
    const token = resolveToken(input.tokenId);
    const tokenName = getTokenName(input.tokenId);

    await AW.setBloodColor(token, input.color);

    notify.updated('token', tokenName, {
      summary: `wound-set-blood-color: color=${input.color}`,
    });

    // Post-write verify: read flag on the actor
    const actor = token.actor ?? token.document?.actor;
    const verifiedColor = actor?.getFlag?.('tokenmagic-automatic-wounds', 'blood-color') ?? null;

    return {
      success: true,
      data: {
        tokenId: input.tokenId,
        tokenName,
        color: input.color,
        verifiedColor,
        colorMatchesInput: verifiedColor === input.color,
      },
    };
  } catch (e) {
    return { success: false, error: `WOUND_SET_BLOOD_COLOR_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
