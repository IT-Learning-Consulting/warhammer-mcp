// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file.
// Module Integration v1 Phase 2 — module-matt: reads (2A.4) + create-trigger-tile + update-trigger-config (2A.6).
// mcp_code_quality_v2 Phase C3 (19b split): extracted verbatim from matt.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, TRIGGER_MODES, ACTION_CATALOG, ACTION_KEYS, isDangerousAction, validateSequence, type ModuleMattInputType, type MattActionObjType, type MattActionInput } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { verifyDocWrite } from '../../../utils/verifyWrite.js';
import { deepStripUndefined } from '../../../utils/embeddedCRUDFactory.js';
import { MONKS_ACTIVE_TILES as MATT_MODULE_ID } from '../../../constants/moduleIds.js';
import { Envelope } from '../_shared/handler-utils.js';
import { MATT_FLAG, getSceneOrThrow, getActiveSceneOrThrow, getTileByUuidOrThrow, readMattFlags, normalizeActions, resolveTaggerSelectorsInSequence } from './matt-helpers.js';

// ── Read handlers (2A.4) ───────────────────────────────────────────────────────

export function handleGetCapabilities(): Envelope<unknown> {
  const matt = (globalThis as any).game?.MonksActiveTiles;
  const registeredActions = matt?.triggerActions ? Object.keys(matt.triggerActions) : [];
  const groups = matt?.triggerGroups ? Object.keys(matt.triggerGroups) : ['actions', 'logic', 'filters'];

  const modules = (globalThis as any).game?.modules;
  const depActive = (id: string): boolean => Boolean(modules?.get?.(id)?.active);
  const optionalDeps = {
    tagger: depActive('tagger'),
    levels: depActive('levels'),
    sequencer: depActive('sequencer'),
    jb2a: depActive('jb2a') || depActive('jb2a_patreon'),
    'forien-quest-log': depActive('forien-quest-log'),
    'monks-enhanced-journal': depActive('monks-enhanced-journal'),
    'lib-wrapper': depActive('lib-wrapper'),
    'party-inventory': depActive('party-inventory'),
  };

  // MATT world settings (best-effort read; absent → omitted).
  const settingKeys = ['default-trigger', 'default-restricted', 'default-controlled', 'allow-player',
    'allow-door', 'teleport-wash', 'prevent-when-paused', 'use-core-macro'];
  const settings: Record<string, unknown> = {};
  for (const k of settingKeys) {
    try {
      settings[k] = (globalThis as any).game?.settings?.get?.(MATT_MODULE_ID, k);
    } catch {
      // setting not registered — skip
    }
  }

  return {
    success: true,
    data: {
      triggers: [...TRIGGER_MODES],
      actions: ACTION_KEYS.map((key) => ({ key, ...ACTION_CATALOG[key] })),
      dangerousActions: ACTION_KEYS.filter((k) => isDangerousAction(k)),
      groups,
      registeredActions,
      optionalDeps,
      settings,
      counts: { triggers: TRIGGER_MODES.length, builtinActions: ACTION_KEYS.length },
    },
  };
}

/**
 * BUG-254 — collect Region behaviors on the scene that link back to this tile (MATT
 * triggerTile bridges). system.uuid may be a string or array per single:false.
 */
function findRegionLinks(scene: any, tileUuid: string): Array<{ regionId: string; behaviorId: string; events: unknown }> {
  const links: Array<{ regionId: string; behaviorId: string; events: unknown }> = [];
  for (const region of scene.regions?.values?.() ?? []) {
    for (const behavior of region.behaviors?.values?.() ?? []) {
      if (behavior.type !== 'monks-active-tiles.triggerTile') continue;
      const sysUuid = behavior._source?.system?.uuid ?? behavior.system?.uuid;
      const linked = Array.isArray(sysUuid) ? sysUuid.includes(tileUuid) : sysUuid === tileUuid;
      if (linked) {
        links.push({ regionId: region.id, behaviorId: behavior.id, events: behavior._source?.system?.events ?? behavior.system?.events ?? null });
      }
    }
  }
  return links;
}

export function handleGetTriggerTile(tileUuid: string, returnFullPayload = false): Envelope<unknown> {
  const { scene, tile } = getTileByUuidOrThrow(tileUuid);
  const flags = readMattFlags(tile);
  const src = tile._source ?? tile;
  return {
    success: true,
    data: {
      uuid: tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`,
      tileId: tile.id,
      sceneId: scene.id,
      name: flags.name ?? tile.name ?? null,
      active: flags.active ?? null,
      trigger: flags.trigger ?? null,
      restriction: flags.restriction ?? null,
      controlled: flags.controlled ?? null,
      chance: flags.chance ?? null,
      pertoken: flags.pertoken ?? null,
      cooldown: flags.cooldown ?? null,
      actions: flags.actions ?? [],
      variables: flags.variables ?? {},
      history: flags.history ?? {},
      config: flags,
      // BUG-254 — geometry + texture + region-link metadata so tilepack export can rebuild
      // the placement and bridge without F12/source inspection. Strictly additive.
      geometry: {
        x: src.x ?? null,
        y: src.y ?? null,
        width: src.width ?? null,
        height: src.height ?? null,
        rotation: src.rotation ?? 0,
        elevation: src.elevation ?? 0,
        sort: src.sort ?? 0,
        hidden: src.hidden ?? false,
      },
      texture: { src: src.texture?.src ?? tile.texture?.src ?? null },
      regionLinks: findRegionLinks(scene, tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`),
      returnFullPayload,
    },
  };
}

export function handleListTriggerTiles(sceneId?: string): Envelope<unknown> {
  const scene = sceneId ? getSceneOrThrow(sceneId) : getActiveSceneOrThrow();
  const tiles = Array.from(scene.tiles?.values?.() ?? []) as any[];
  const mattTiles = tiles
    .filter((t) => (t._source?.flags?.[MATT_FLAG] ?? t.flags?.[MATT_FLAG]) != null)
    .map((t) => {
      const flags = readMattFlags(t);
      return {
        uuid: t.uuid ?? `Scene.${scene.id}.Tile.${t.id}`,
        tileId: t.id,
        name: flags.name ?? null,
        active: flags.active ?? null,
        trigger: flags.trigger ?? null,
        actionCount: Array.isArray(flags.actions) ? flags.actions.length : 0,
      };
    });
  return { success: true, data: { sceneId: scene.id, count: mattTiles.length, tiles: mattTiles } };
}

export function handleValidateSequence(actions: MattActionObjType[]): Envelope<unknown> {
  const result = validateSequence(actions as MattActionInput[]);
  return { success: true, data: result };
}

// ── Create + config (2A.6) ─────────────────────────────────────────────────────

type CreateInput = Extract<ModuleMattInputType, { action: 'create-trigger-tile' }>;
type UpdateConfigInput = Extract<ModuleMattInputType, { action: 'update-trigger-config' }>;

export async function handleCreateTriggerTile(input: CreateInput): Promise<Envelope<unknown>> {
  const scene = getSceneOrThrow(input.sceneId);

  const actions = normalizeActions(input.actions ?? [], scene.id);

  // Phase 5C.1 — author-time tagger selector resolution (replaces soft boolean)
  const taggerActive = Boolean((globalThis as any).game?.modules?.get?.('tagger')?.active);
  const { taggerResolution, warnings: taggerWarnings } = await resolveTaggerSelectorsInSequence(
    actions,
    taggerActive,
    input.sceneId,
  );

  if (actions.length > 0) {
    const v = validateSequence(actions);
    if (!v.valid) {
      return { success: false, error: `MATT_SEQUENCE_INVALID: ${v.errors.join('; ')}` };
    }
    // Dangerous initial actions require confirm:true (CCR-4).
    if (v.dangerous.length > 0 && input.confirm !== true) {
      return {
        success: false,
        error: `MATT_CONFIRM_REQUIRED: initial actions include dangerous action(s) [${v.dangerous.join(', ')}]. Re-send with confirm:true.`,
      };
    }
  }

  // BUG-257: nested config is accepted alongside flattened fields (the skill docs
  // author the nested shape); an explicitly-passed flattened field wins per key.
  const cfg = input.config ?? {};
  const tileName = input.name ?? cfg.name;
  const flagConfig: Record<string, unknown> = deepStripUndefined({
    active: input.active ?? cfg.active ?? true,
    record: input.record ?? cfg.record,
    restriction: input.restriction ?? cfg.restriction,
    controlled: input.controlled ?? cfg.controlled,
    allowpaused: input.allowpaused ?? cfg.allowpaused,
    usealpha: input.usealpha ?? cfg.usealpha,
    pointer: input.pointer ?? cfg.pointer,
    vision: input.vision ?? cfg.vision,
    pertoken: input.pertoken ?? cfg.pertoken,
    minrequired: input.minrequired ?? cfg.minrequired,
    cooldown: input.cooldown ?? cfg.cooldown,
    chance: input.chance ?? cfg.chance,
    name: tileName,
    files: input.files ?? cfg.files,
    fileindex: input.fileindex ?? cfg.fileindex,
    trigger: input.trigger,
    actions,
    variables: {},
  });

  const tilePayload: Record<string, unknown> = {
    x: input.x,
    y: input.y,
    width: input.width ?? 100,
    height: input.height ?? 100,
    hidden: false,
    flags: { [MATT_FLAG]: flagConfig },
  };
  if (input.img) tilePayload.texture = { src: input.img };

  const created = await scene.createEmbeddedDocuments('Tile', [tilePayload]);
  if (!created || created.length === 0) {
    return { success: false, error: ErrorTokens.MATT_TILE_NOT_PERSISTED + ': createEmbeddedDocuments returned no doc' };
  }
  const persisted = scene.tiles.get(created[0].id);
  // DP-16 — re-read _source flags and confirm trigger persisted (BUG-329: shared helper;
  // throws MATT_TILE_NOT_PERSISTED on drift, surfaced via the dispatcher catch).
  verifyDocWrite(persisted, { [`flags.${MATT_FLAG}.trigger`]: input.trigger }, ErrorTokens.MATT_TILE_NOT_PERSISTED);
  const persistedFlags = (persisted?._source?.flags?.[MATT_FLAG] ?? {}) as Record<string, any>;

  const uuid = persisted.uuid ?? `Scene.${scene.id}.Tile.${persisted.id}`;
  notify.created('tile', (tileName as string) ?? `MATT tile ${persisted.id}`, { uuid });

  return {
    success: true,
    data: {
      tileId: persisted.id,
      uuid,
      sceneId: scene.id,
      trigger: persistedFlags.trigger,
      actionCount: Array.isArray(persistedFlags.actions) ? persistedFlags.actions.length : 0,
      name: tileName ?? null,
      ...(taggerResolution.length > 0 ? { taggerResolution } : {}),
      ...(taggerWarnings.length > 0 ? { taggerWarnings } : {}),
    },
  };
}

export async function handleUpdateTriggerConfig(input: UpdateConfigInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);

  const patch: Record<string, unknown> = {};
  if (input.trigger) patch[`flags.${MATT_FLAG}.trigger`] = input.trigger;
  for (const [k, v] of Object.entries(input.config ?? {})) {
    if (v !== undefined) patch[`flags.${MATT_FLAG}.${k}`] = v;
  }
  if (Object.keys(patch).length === 0) {
    return { success: false, error: 'MATT_EMPTY_PAYLOAD: update-trigger-config requires trigger or at least one config field' };
  }

  await tile.update(patch);

  // DP-16 — re-read _source and verify each patched key (BUG-329: shared helper;
  // throws MATT_CONFIG_NOT_PERSISTED on drift, surfaced via the dispatcher catch).
  const expectedFields: Record<string, unknown> = {};
  if (input.trigger) expectedFields[`flags.${MATT_FLAG}.trigger`] = input.trigger;
  for (const [k, v] of Object.entries(input.config ?? {})) {
    if (v !== undefined) expectedFields[`flags.${MATT_FLAG}.${k}`] = v;
  }
  verifyDocWrite(tile, expectedFields, ErrorTokens.MATT_CONFIG_NOT_PERSISTED);
  const verified = Object.keys(expectedFields).map((p) => p.split('.').pop() as string);
  const persistedFlags = (tile._source?.flags?.[MATT_FLAG] ?? {}) as Record<string, any>;

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  notify.updated('tile', (persistedFlags.name as string) ?? `MATT tile ${tile.id}`, {
    summary: `config: ${verified.join(', ')}`,
    uuid,
  });

  return { success: true, data: { uuid, tileId: tile.id, sceneId: scene.id, updated: verified } };
}
