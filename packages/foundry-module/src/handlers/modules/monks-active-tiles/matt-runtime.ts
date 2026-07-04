// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file.
// MOD-04 (deferral note, mcp_code_quality_v2 Phase C3): the audit flagged fire-trigger's
// dialog-risk classification as a candidate for reclassification (a fired MATT sequence can
// itself run third-party actions that open a dialog on the GM client). That reclassification
// is NOT in scope for this split (verbatim move only) — surfaced here for a future phase.
//
// Module Integration v1 Phase 2 — module-matt: runtime firing + region link + tile lookup (2C).
// mcp_code_quality_v2 Phase C3 (19b split): extracted verbatim from matt.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, type ModuleMattInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { deepStripUndefined } from '../../../utils/embeddedCRUDFactory.js';
import { Envelope } from '../_shared/handler-utils.js';
import { getSceneOrThrow, getTileByUuidOrThrow, readMattFlags, buildImpactReport } from './matt-helpers.js';
import { readActions } from './matt-sequence.js';

type FireTriggerInput = Extract<ModuleMattInputType, { action: 'fire-trigger' }>;
type LinkRegionInput = Extract<ModuleMattInputType, { action: 'link-region-trigger' }>;
type FireTriggerAsInput = Extract<ModuleMattInputType, { action: 'fire-trigger-as' }>;
type FindTriggerTileInput = Extract<ModuleMattInputType, { action: 'find-trigger-tile' }>;

type TileSummary = {
  uuid: string;
  sceneId: string;
  sceneName: string;
  tileId: string;
  name: string | null;
  active: boolean | null;
  trigger: string[] | null;
  actionCount: number;
  tags: string[];
  libraryId: string | null;
};

export async function handleFireTrigger(input: FireTriggerInput): Promise<Envelope<unknown>> {
  // typeof-guard the static API (source-confirmed signature: triggerTile(uuid: string) => Promise<void>,
  // monks-active-tiles.js:180 — fires with canvas.tokens.controlled, respects active/pertoken).
  const matt = (globalThis as any).game?.MonksActiveTiles;
  if (typeof matt?.triggerTile !== 'function') {
    return { success: false, error: 'MATT_API_NOT_AVAILABLE: game.MonksActiveTiles.triggerTile is not callable' };
  }

  const { tile } = getTileByUuidOrThrow(input.tileUuid);
  const actions = readActions(tile);
  const impact = buildImpactReport(actions);

  // CCR-4 — firing ALWAYS requires confirm:true; surface the full impact (ordered actions + dangerous bodies).
  if (input.confirm !== true) {
    const seq = actions.map((a) => a.action).join(' → ') || '(no actions)';
    const danger = impact.dangerous.length ? ` DANGEROUS: ${JSON.stringify(impact.dangerous)}.` : '';
    return {
      success: false,
      error: `MATT_CONFIRM_REQUIRED: firing tile ${input.tileUuid} will run ${actions.length} action(s): ${seq}.${danger} Re-send with confirm:true.`,
    };
  }

  const tokensUsed = (globalThis as any).canvas?.tokens?.controlled?.length ?? 0;
  await matt.triggerTile(input.tileUuid);

  notify.info(`MATT trigger fired: ${input.tileUuid} (${actions.length} action(s), ${tokensUsed} controlled token(s))`);
  return { success: true, data: { uuid: input.tileUuid, fired: true, tokensUsed } };
}

export async function handleLinkRegionTrigger(input: LinkRegionInput): Promise<Envelope<unknown>> {
  const scene = getSceneOrThrow(input.sceneId);
  const region = scene.regions?.get(input.regionId);
  if (!region) {
    return { success: false, error: `MATT_REGION_NOT_FOUND: no Region "${input.regionId}" on scene "${input.sceneId}"` };
  }

  // Create the monks-active-tiles.triggerTile behavior directly. region.createBehavior's typed union
  // covers only the 7 core subtypes, so the MATT subtype must be authored here (audit §10 schema:
  // events (SetField) + uuid (ActiveTileDocumentUUIDField) + usetiletrigger; source line 2120).
  const events = input.events ?? ['tokenEnter', 'tokenExit'];
  const payload = deepStripUndefined({
    type: 'monks-active-tiles.triggerTile',
    name: input.name ?? 'MATT trigger',
    system: {
      uuid: input.tileUuid,
      usetiletrigger: input.usetiletrigger ?? true,
      events,
    },
    disabled: false,
  });

  const created = await region.createEmbeddedDocuments('RegionBehavior', [payload]);
  if (!created || created.length === 0) {
    return { success: false, error: ErrorTokens.MATT_REGION_LINK_NOT_PERSISTED + ': createEmbeddedDocuments returned no doc' };
  }
  const behavior = region.behaviors?.get(created[0].id);

  // DP-16 — re-read system.uuid (string or array per single:false) and confirm it references the tile.
  const sysUuid = behavior?._source?.system?.uuid ?? behavior?.system?.uuid;
  const linked = Array.isArray(sysUuid) ? sysUuid.includes(input.tileUuid) : sysUuid === input.tileUuid;
  if (!linked) {
    return { success: false, error: `${ErrorTokens.MATT_REGION_LINK_NOT_PERSISTED}: behavior system.uuid did not persist (got ${JSON.stringify(sysUuid)})` };
  }

  notify.created('region', 'monks-active-tiles.triggerTile', { summary: `→ tile ${input.tileUuid} on region ${region.name ?? input.regionId}` });
  return {
    success: true,
    data: { regionId: region.id, behaviorId: behavior.id, tileUuid: input.tileUuid, sceneId: scene.id },
  };
}

export async function handleFireTriggerAs(input: FireTriggerAsInput): Promise<Envelope<unknown>> {
  // typeof-guard the prototype method (TileDocument.prototype.trigger is the direct invocation path;
  // it accepts { tokens, method, pt, options } and bypasses the controlled-token resolution of
  // game.MonksActiveTiles.triggerTile). Source: monks-active-tiles.js:180.
  const { tile, scene } = getTileByUuidOrThrow(input.tileUuid);
  if (typeof tile.trigger !== 'function') {
    return { success: false, error: 'MATT_API_NOT_AVAILABLE: TileDocument.prototype.trigger is not callable' };
  }
  const flags = readMattFlags(tile);
  if (flags.active === false) {
    return { success: false, error: `MATT_TILE_INACTIVE: tile ${input.tileUuid} has active:false` };
  }

  // Resolve every tokenId to a TokenDocument on the tile's scene.
  const tokenDocs: any[] = [];
  for (const tokenId of input.tokenIds) {
    const tokenDoc = scene.tokens?.get(tokenId);
    if (!tokenDoc) {
      return { success: false, error: `MATT_TOKEN_NOT_FOUND: no Token with id "${tokenId}" on scene "${scene.id}"` };
    }
    tokenDocs.push(tokenDoc);
  }

  // BUG-250 — mirror upstream MATT's per-token history guard. game.MonksActiveTiles.triggerTile
  // filters out already-triggered tokens when flags.pertoken is true BEFORE calling trigger();
  // the prototype trigger() this handler uses records history but does not reject a recorded
  // token, so without this filter fire-trigger-as re-runs one-shot (pertoken+record) tiles.
  const pertoken = flags.pertoken === true;
  const eligibleTokenDocs =
    pertoken && typeof tile.hasTriggered === 'function'
      ? tokenDocs.filter((t) => !tile.hasTriggered(t.id))
      : tokenDocs;
  const skippedCount = tokenDocs.length - eligibleTokenDocs.length;

  const actions = readActions(tile);
  const method = input.method ?? 'manual';
  const impact = buildImpactReport(actions);

  // CCR-4 — explicit-token firing ALWAYS requires confirm:true; surface the full impact first.
  if (input.confirm !== true) {
    const seq = actions.map((a) => a.action).join(' → ') || '(no actions)';
    const danger = impact.dangerous.length ? ` DANGEROUS: ${JSON.stringify(impact.dangerous)}.` : '';
    const guard = pertoken
      ? ` pertoken:true — ${eligibleTokenDocs.length} of ${tokenDocs.length} token(s) eligible (${skippedCount} already recorded).`
      : '';
    return {
      success: false,
      error:
        `MATT_CONFIRM_REQUIRED: fire-trigger-as tile ${input.tileUuid} with method="${method}" ` +
        `and token(s) [${input.tokenIds.join(', ')}] will run ${actions.length} action(s): ${seq}.${danger}${guard} ` +
        'Re-send with confirm:true.',
    };
  }

  // BUG-250 — pertoken tiles whose requested tokens have all already triggered must not re-fire.
  if (pertoken && eligibleTokenDocs.length === 0) {
    notify.info(`MATT fire-trigger-as: ${input.tileUuid} — all ${tokenDocs.length} requested token(s) already triggered this pertoken tile, nothing fired`);
    return {
      success: true,
      data: {
        uuid: input.tileUuid,
        fired: false,
        method,
        tokenIds: input.tokenIds,
        tokensUsed: 0,
        skipped: skippedCount,
        message: `MATT_NO_ELIGIBLE_TOKENS: all ${tokenDocs.length} requested token(s) already triggered this pertoken tile`,
      },
    };
  }

  // BUG-258: `stop {continue:true}` coroutine resume does not exist in MATT v13.06 (the
  // upstream resume checkbox is commented out; savestate is only reachable via delay/dialog
  // pauses). The supported resume-from-bookmark idiom is a named anchor + options.landing —
  // trigger() starts at the action AFTER the matching anchor (monks-active-tiles.js:4945).
  const triggerArgs: Record<string, unknown> = { tokens: eligibleTokenDocs, method };
  if (input.landing) triggerArgs.options = { landing: input.landing };
  await tile.trigger(triggerArgs);

  notify.info(
    `MATT fire-trigger-as: ${input.tileUuid} (${actions.length} action(s), method="${method}", tokens=[${eligibleTokenDocs.map((t) => t.id).join(', ')}]${skippedCount ? `, ${skippedCount} skipped (pertoken)` : ''})`,
  );
  return {
    success: true,
    data: {
      uuid: input.tileUuid,
      fired: true,
      method,
      tokenIds: input.tokenIds,
      tokensUsed: eligibleTokenDocs.length,
      skipped: skippedCount,
    },
  };
}

export function handleFindTriggerTile(input: FindTriggerTileInput): Envelope<unknown> {
  const criteria = [input.name, input.tileUuid, input.tag, input.libraryId].filter((v) => v != null && v !== '');
  if (criteria.length !== 1) {
    return { success: false, error: 'MATT_FIND_INVALID: provide exactly one of name, tileUuid, tag, or libraryId' };
  }

  const scenes: any[] = input.sceneId
    ? [getSceneOrThrow(input.sceneId)]
    : Array.from((globalThis as any).game?.scenes?.values?.() ?? []);

  if (input.tileUuid) {
    const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
    if (input.sceneId && scene.id !== input.sceneId) {
      return {
        success: false,
        error: `MATT_TILE_WRONG_SCENE: tile ${input.tileUuid} is on scene "${scene.id}", not "${input.sceneId}"`,
      };
    }
    const flags = readMattFlags(tile);
    if (!flags || Object.keys(flags).length === 0) {
      return { success: false, error: `MATT_TILE_NOT_ARMED: tile ${input.tileUuid} has no monks-active-tiles flags` };
    }
    return { success: true, data: { count: 1, match: summarizeTile(scene, tile), matches: [summarizeTile(scene, tile)] } };
  }

  const matches: TileSummary[] = [];

  for (const scene of scenes) {
    const tiles = Array.from(scene.tiles?.values?.() ?? []) as any[];
    for (const t of tiles) {
      const flags = readMattFlags(t);
      if (!flags || Object.keys(flags).length === 0) continue;
      const summary = summarizeTile(scene, t);
      if (input.name && summary.name === input.name) matches.push(summary);
      if (input.tag && summary.tags.includes(input.tag)) matches.push(summary);
      if (input.libraryId && summary.libraryId === input.libraryId) matches.push(summary);
    }
  }

  const deduped = Array.from(new Map(matches.map((m) => [m.uuid, m])).values());
  if (deduped.length === 0) {
    return { success: false, error: 'MATT_TILE_NOT_FOUND: no MATT tile matched the requested criterion' };
  }
  if (deduped.length > 1) {
    return {
      success: false,
      error: `MATT_TILE_AMBIGUOUS: ${deduped.length} tiles matched; narrow by sceneId or tileUuid. matches=${JSON.stringify(deduped)}`,
    };
  }

  return { success: true, data: { count: 1, match: deduped[0], matches: deduped } };
}

function readTaggerTags(tile: any): string[] {
  const raw = tile._source?.flags?.tagger?.tags ?? tile.flags?.tagger?.tags ?? tile._source?.flags?.tagger?.tag ?? tile.flags?.tagger?.tag;
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === 'string');
  if (typeof raw === 'string') return [raw];
  return [];
}

function readLibraryId(flags: Record<string, any>, tile: any): string | null {
  const wmcp = tile._source?.flags?.['warhammer-mcp'] ?? tile.flags?.['warhammer-mcp'] ?? {};
  return (
    flags.libraryId ??
    flags.library_id ??
    wmcp.moduleMatt?.libraryId ??
    wmcp['module-matt']?.libraryId ??
    null
  ) as string | null;
}

function summarizeTile(scene: any, tile: any): TileSummary {
  const flags = readMattFlags(tile);
  return {
    uuid: tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`,
    sceneId: scene.id,
    sceneName: scene.name ?? scene.id,
    tileId: tile.id,
    name: (flags.name as string | undefined) ?? tile.name ?? null,
    active: (flags.active as boolean | undefined) ?? null,
    trigger: Array.isArray(flags.trigger) ? (flags.trigger as string[]) : null,
    actionCount: Array.isArray(flags.actions) ? flags.actions.length : 0,
    tags: readTaggerTags(tile),
    libraryId: readLibraryId(flags, tile),
  };
}
