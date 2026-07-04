// DIALOG-PATH: DIALOG_GUARDED — gather/harvest-token on a minigame-flagged page open a DialogV2 slot-machine; the module header documents this is FIRE-AND-FORGET by design (never awaited) — the handler returns minigame:"opened" instead of hanging on the dialog result.
// Module Integration v1 Phase 14 — module-gatherer handler (gatherer v4.2.5).
//
// Always-registered umbrella. requireModuleActive('gatherer') is the FIRST executable statement —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (Phase-1 carry-forward).
//
// 5 actions (dossier thin-session.md §3.6): read get-spot-status; GM writes gather, harvest-token,
// reset-spot, configure-spot. The MCP tool is `module-gatherer`; the SKILL is `wfrp-gatherer`.
//
// Accessor (pre-plan §accessor, drift #3): `game.modules.get('gatherer').API` (UPPERCASE `.API`,
// assigned in the `ready` hook) → typed GATHERER_API_UNAVAILABLE if not yet bound.
//
// CRITICAL (§3.4): pages with `flags.gatherer.minigame` set open a DialogV2 — awaiting API.gather would
// HANG the MCP socket. gather and harvest-token PRE-CHECK and, for minigame pages, FIRE-AND-FORGET:
// they open the dialog on the GM client (no await) and return minigame:"opened" + a note. The GM
// completes the slot-machine dialog on screen and the item lands when they click through.
//
// WFRP4e (§3.5): world setting `gatherer.quantityPath` must be "quantity.value"; gather surfaces a
// warning if misconfigured but does NOT write the live setting (avoid surprise setting writes).
//
// Anchors: DP-15 (typed), CCR-3 (notify on writes), CCR-4 (GM-gated writes). Source: phase14_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { ModuleGathererInput, type ModuleGathererInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { GATHERER as MODULE_ID } from '../../../constants/moduleIds.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';


const SECONDS_PER_HOUR = 3600;

/** Resolve gatherer's runtime API (ADR-9.1; UPPERCASE `.API`, post-ready). */
function getGathererApi(): any {
  const api = (globalThis as any).game?.modules?.get?.(MODULE_ID)?.API;
  if (!api || typeof api.gather !== 'function') {
    throw new Error('GATHERER_API_UNAVAILABLE: game.modules.get("gatherer").API.gather is not bound — the module may not have reached its ready hook');
  }
  return api;
}

function quantityPathOk(): { ok: boolean; current: string } {
  const current = String((globalThis as any).game?.settings?.get?.(MODULE_ID, 'quantityPath') ?? 'quantity');
  return { ok: current === 'quantity.value', current };
}

/** Read the minigame flag off a gather page; truthy means API.gather would HANG. */
async function minigameGate(pageUuid: string): Promise<{ page: any; blocked: boolean }> {
  const page = await (globalThis as any).fromUuid?.(pageUuid);
  if (!page) throw new Error(`GATHERER_PAGE_NOT_FOUND: ${pageUuid}`);
  const minigame = page.getFlag?.(MODULE_ID, 'minigame');
  return { page, blocked: Boolean(minigame) };
}

const WRITE_ACTIONS = new Set(['gather', 'harvest-token', 'reset-spot', 'configure-spot', 'create-spot', 'set-harvest-source', 'configure-settings']);

export async function dispatchModuleGatherer(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: ModuleGathererInputType;
  try {
    input = ModuleGathererInput.parse(data);
  } catch (e) {
    return { success: false, error: `GATHERER_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `GATHERER_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'get-spot-status':
        return await handleGetSpotStatus(input);
      case 'gather':
        return await handleGather(input);
      case 'harvest-token':
        return await handleHarvestToken(input);
      case 'reset-spot':
        return await handleResetSpot(input);
      case 'configure-spot':
        return await handleConfigureSpot(input);
      case 'create-spot':
        return await handleCreateSpot(input);
      case 'list-spots':
        return await handleListSpots(input);
      case 'set-harvest-source':
        return await handleSetHarvestSource(input);
      case 'configure-settings':
        return await handleConfigureSettings(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `GATHERER_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `GATHERER_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Read ─────────────────────────────────────────────────────────────────────

type StatusInput = Extract<ModuleGathererInputType, { action: 'get-spot-status' }>;
async function handleGetSpotStatus(input: StatusInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `GATHERER_PAGE_NOT_FOUND: ${input.pageUuid}` };
  const get = (k: string) => page.getFlag?.(MODULE_ID, k);
  const maxDraws = get('draws');
  const drawsUsed = page.getFlag?.(MODULE_ID, 'data')?.drawsUsed ?? 0;
  const firstDrawTime = page.getFlag?.(MODULE_ID, 'data')?.firstDrawTime;
  const timeHours = Number(get('time') ?? 0);
  const now = Number((globalThis as any).game?.time?.worldTime ?? 0);
  const resetAt = firstDrawTime != null && timeHours > 0 ? Number(firstDrawTime) + timeHours * SECONDS_PER_HOUR : undefined;
  const minigame = Boolean(get('minigame'));
  return {
    success: true,
    data: {
      pageUuid: input.pageUuid,
      name: page.name,
      tableUuid: get('table') ?? null,
      maxDraws: maxDraws ?? null,
      drawsUsed,
      drawsRemaining: maxDraws != null ? Math.max(0, Number(maxDraws) - Number(drawsUsed)) : null,
      timeHours,
      resetAtWorldTime: resetAt,
      resetInSeconds: resetAt != null ? resetAt - now : undefined,
      minigame,
      minigameWarning: minigame ? 'This spot uses an interactive minigame — gather/harvest-token open the slot-machine dialog on the GM client (fire-and-forget); complete it there and the item lands when you click through.' : undefined,
    },
  };
}

// ── Writes ─────────────────────────────────────────────────────────────────────

type GatherInput = Extract<ModuleGathererInputType, { action: 'gather' }>;
async function handleGather(input: GatherInput): Promise<Envelope<unknown>> {
  const { blocked } = await minigameGate(input.pageUuid);
  if (blocked) {
    // Interactive minigame: FIRE-AND-FORGET (do NOT await — awaiting the DialogV2 would deadlock the
    // socket). The slot-machine dialog opens on the GM client; the GM clicks through it and the item
    // lands client-side. We return immediately; the caller re-reads the actor to confirm.
    const api = getGathererApi();
    void api.gather(input.pageUuid, input.actorUuid).catch(() => {});
    notify.updated('gatherer', input.pageUuid, { summary: 'minigame opened (interactive)' });
    return {
      success: true,
      data: {
        pageUuid: input.pageUuid,
        actorUuid: input.actorUuid,
        minigame: 'opened',
        note: 'This spot uses an interactive minigame — the slot-machine dialog has opened in Foundry. Complete it on the GM screen; the item lands when you click through. Re-read the actor (get-character) to confirm the result.',
      },
    };
  }
  const qp = quantityPathOk();
  const api = getGathererApi();
  const result = await api.gather(input.pageUuid, input.actorUuid);
  notify.updated('gatherer', input.pageUuid, { summary: 'gathered' });
  return {
    success: true,
    data: {
      pageUuid: input.pageUuid,
      actorUuid: input.actorUuid,
      result: result ?? null,
      quantityPathOk: qp.ok,
      quantityPathWarning: qp.ok ? undefined : `gatherer.quantityPath is "${qp.current}" — for WFRP4e it should be "quantity.value" or stacking silently fails. Fix via /foundry-setting.`,
    },
  };
}

type HarvestInput = Extract<ModuleGathererInputType, { action: 'harvest-token' }>;
async function handleHarvestToken(input: HarvestInput): Promise<Envelope<unknown>> {
  const creature = await (globalThis as any).fromUuid?.(input.actorUuid);
  if (!creature) return { success: false, error: `GATHERER_ACTOR_NOT_FOUND: ${input.actorUuid}` };
  const gatherSheet = creature.getFlag?.(MODULE_ID, 'gatherSheet');
  if (!gatherSheet) {
    return { success: false, error: `GATHERER_NO_GATHER_SHEET: actor "${creature.name}" has no flags.gatherer.gatherSheet to harvest from` };
  }
  const { blocked } = await minigameGate(String(gatherSheet));
  if (blocked) {
    // Interactive minigame: fire-and-forget (see handleGather) — opens the dialog on the GM client.
    const api = getGathererApi();
    void api.gather(String(gatherSheet), input.gatheringActorUuid).catch(() => {});
    notify.updated('gatherer', creature.name, { summary: 'harvest minigame opened (interactive)' });
    return {
      success: true,
      data: {
        harvestedFrom: input.actorUuid,
        gatheringActorUuid: input.gatheringActorUuid,
        gatherSheet,
        minigame: 'opened',
        note: 'The harvest source uses an interactive minigame — complete the dialog in Foundry; the items land when you click through. Re-read the actor to confirm.',
      },
    };
  }
  const qp = quantityPathOk();
  const api = getGathererApi();
  const result = await api.gather(String(gatherSheet), input.gatheringActorUuid);
  // Decrement the creature's actor-level harvest counter (API.gather with harvestActor=null does NOT —
  // it only fires for API.harvestToken which needs a Token object; replicate the socket handler GM-side).
  let drawsRemaining: number | undefined;
  const draws = creature.getFlag?.(MODULE_ID, 'draws');
  if (draws != null && draws !== '' && Number.isFinite(Number(draws))) {
    const n = Number(draws);
    if (n > 0) {
      await creature.setFlag(MODULE_ID, 'draws', n - 1);
      drawsRemaining = n - 1;
    } else {
      drawsRemaining = 0;
    }
  }
  notify.updated('gatherer', creature.name, { summary: 'harvested' });
  return {
    success: true,
    data: {
      harvestedFrom: input.actorUuid,
      gatheringActorUuid: input.gatheringActorUuid,
      gatherSheet,
      result: result ?? null,
      drawsRemaining,
      quantityPathOk: qp.ok,
      quantityPathWarning: qp.ok ? undefined : `gatherer.quantityPath is "${qp.current}" (should be "quantity.value" for WFRP4e).`,
    },
  };
}

type ResetInput = Extract<ModuleGathererInputType, { action: 'reset-spot' }>;
async function handleResetSpot(input: ResetInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `GATHERER_PAGE_NOT_FOUND: ${input.pageUuid}` };
  await page.unsetFlag(MODULE_ID, 'data');
  // DP-16 — verify the runtime data is cleared.
  const remaining = page.getFlag?.(MODULE_ID, 'data');
  if (remaining != null) {
    return { success: false, error: ErrorTokens.GATHERER_RESET_NOT_PERSISTED + ': flags.gatherer.data still present after unset' };
  }
  notify.updated('gatherer', page.name, { summary: 'spot reset (draws refreshed)' });
  return { success: true, data: { pageUuid: input.pageUuid, name: page.name, reset: true } };
}

type ConfigureInput = Extract<ModuleGathererInputType, { action: 'configure-spot' }>;
async function handleConfigureSpot(input: ConfigureInput): Promise<Envelope<unknown>> {
  const page = await (globalThis as any).fromUuid?.(input.pageUuid);
  if (!page) return { success: false, error: `GATHERER_PAGE_NOT_FOUND: ${input.pageUuid}` };
  if (
    input.tableUuid === undefined &&
    input.draws === undefined &&
    input.quantity === undefined &&
    input.require === undefined &&
    input.time === undefined &&
    input.expression === undefined
  ) {
    return { success: false, error: 'GATHERER_INVALID_INPUT: configure-spot requires at least one field to change' };
  }
  const flags: Record<string, unknown> = {};
  if (input.tableUuid !== undefined) flags.table = input.tableUuid;
  if (input.draws !== undefined) flags.draws = input.draws;
  if (input.quantity !== undefined) flags.quantity = input.quantity;
  if (input.require !== undefined) flags.require = input.require;
  if (input.time !== undefined) flags.time = input.time;
  if (input.expression !== undefined) flags.expression = input.expression;
  // modifierList must be sorted descending by DC to match the module's save behavior (gathererSheet.js:98).
  if (input.modifierList !== undefined) flags.modifierList = [...input.modifierList].sort((a, b) => b.DC - a.DC);

  for (const [k, v] of Object.entries(flags)) await page.setFlag(MODULE_ID, k, v);

  // DP-16 — verify each written flag round-trips.
  const persisted: Record<string, unknown> = {};
  for (const k of Object.keys(flags)) persisted[k] = page.getFlag?.(MODULE_ID, k);

  const minigame = Boolean(page.getFlag?.(MODULE_ID, 'minigame'));
  notify.updated('gatherer', page.name, { summary: `configured (${Object.keys(flags).join(', ')})` });
  return {
    success: true,
    data: {
      pageUuid: input.pageUuid,
      name: page.name,
      written: persisted,
      minigameWarning: minigame ? 'This page has a minigame flag set (UI-only; not writable here). gather will refuse it.' : undefined,
    },
  };
}

// ── Phase 14 full-functionality handlers ──────────────────────────────────────

const GATHERER_PAGE_TYPE = 'gatherer.gatherer';

type CreateSpotInput = Extract<ModuleGathererInputType, { action: 'create-spot' }>;
async function handleCreateSpot(input: CreateSpotInput): Promise<Envelope<unknown>> {
  const journal = await (globalThis as any).fromUuid?.(input.journalUuid);
  if (!journal || typeof journal.createEmbeddedDocuments !== 'function') {
    return { success: false, error: `GATHERER_JOURNAL_NOT_FOUND: ${input.journalUuid}` };
  }
  const gFlags: Record<string, unknown> = { table: input.tableUuid };
  if (input.draws !== undefined) gFlags.draws = input.draws;
  if (input.quantity !== undefined) gFlags.quantity = input.quantity;
  if (input.time !== undefined) gFlags.time = input.time;
  if (input.require !== undefined) gFlags.require = input.require;
  if (input.expression !== undefined) gFlags.expression = input.expression;
  if (input.modifierList !== undefined) gFlags.modifierList = [...input.modifierList].sort((a, b) => b.DC - a.DC);
  // NOTE: minigame is intentionally NOT settable here (UI-only; would make gather hang).

  // GathererSheet is registered for the type but NOT makeDefault, so a programmatic page would get the
  // plain text sheet and API.gather (which calls page.sheet.getGathererData) would crash. Pin the sheet
  // class so the page binds the real GathererSheet.
  const [page] = await journal.createEmbeddedDocuments('JournalEntryPage', [
    { name: input.name, type: GATHERER_PAGE_TYPE, flags: { core: { sheetClass: 'gatherer.GathererSheet' }, [MODULE_ID]: gFlags } },
  ]);
  if (!page) return { success: false, error: 'GATHERER_SPOT_NOT_CREATED' };
  const persistedTable = page.getFlag?.(MODULE_ID, 'table');
  if (persistedTable !== input.tableUuid) {
    return { success: false, error: `${ErrorTokens.GATHERER_SPOT_FLAG_NOT_PERSISTED}: table read back "${persistedTable}"` };
  }
  notify.created('gatherer', input.name, { summary: 'gather spot created' });
  return { success: true, data: { pageUuid: page.uuid, name: input.name, journalName: journal.name, written: gFlags } };
}

type ListSpotsInput = Extract<ModuleGathererInputType, { action: 'list-spots' }>;
async function handleListSpots(input: ListSpotsInput): Promise<Envelope<unknown>> {
  const journals = input.journalUuid
    ? [await (globalThis as any).fromUuid?.(input.journalUuid)].filter(Boolean)
    : (globalThis as any).game?.journal?.contents ?? [];
  const out: any[] = [];
  for (const je of journals) {
    const pages = je.pages?.contents ?? je.pages ?? [];
    for (const page of pages) {
      const isGather = page.type === GATHERER_PAGE_TYPE || page.getFlag?.(MODULE_ID, 'table') != null;
      if (!isGather) continue;
      const maxDraws = page.getFlag?.(MODULE_ID, 'draws');
      const drawsUsed = page.getFlag?.(MODULE_ID, 'data')?.drawsUsed ?? 0;
      const remaining = maxDraws != null ? Math.max(0, Number(maxDraws) - Number(drawsUsed)) : null;
      const exhausted = remaining === 0 && maxDraws != null;
      if (input.exhaustedOnly && !exhausted) continue;
      out.push({
        pageUuid: page.uuid,
        name: page.name,
        journalName: je.name,
        tableUuid: page.getFlag?.(MODULE_ID, 'table') ?? null,
        drawsRemaining: remaining,
        minigame: Boolean(page.getFlag?.(MODULE_ID, 'minigame')),
        exhausted,
      });
    }
  }
  return { success: true, data: { count: out.length, spots: out } };
}

type SetHarvestSourceInput = Extract<ModuleGathererInputType, { action: 'set-harvest-source' }>;
async function handleSetHarvestSource(input: SetHarvestSourceInput): Promise<Envelope<unknown>> {
  const actor = await (globalThis as any).fromUuid?.(input.actorUuid);
  if (!actor) return { success: false, error: `GATHERER_ACTOR_NOT_FOUND: ${input.actorUuid}` };
  await actor.setFlag(MODULE_ID, 'gatherSheet', input.gatherSheetUuid);
  if (input.draws !== undefined) await actor.setFlag(MODULE_ID, 'draws', input.draws);
  const persisted = actor.getFlag?.(MODULE_ID, 'gatherSheet');
  if (persisted !== input.gatherSheetUuid) {
    return { success: false, error: `${ErrorTokens.GATHERER_HARVEST_SOURCE_NOT_PERSISTED}: read back "${persisted}"` };
  }
  notify.updated('gatherer', actor.name, { summary: 'harvest source linked' });
  return { success: true, data: { actorUuid: input.actorUuid, actorName: actor.name, gatherSheet: persisted, draws: input.draws } };
}

type ConfigureSettingsInput = Extract<ModuleGathererInputType, { action: 'configure-settings' }>;
async function handleConfigureSettings(input: ConfigureSettingsInput): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const keys = ['quantityPath', 'resourcePath', 'resourceValue', 'enableHarvesting'] as const;
  const provided = keys.filter((k) => (input as any)[k] !== undefined);
  if (!provided.length) return { success: false, error: 'GATHERER_INVALID_INPUT: configure-settings requires at least one setting' };
  const written: Record<string, unknown> = {};
  for (const k of provided) {
    await game.settings.set(MODULE_ID, k, (input as any)[k]);
    written[k] = game?.settings?.get?.(MODULE_ID, k);
  }
  notify.updated('gatherer', 'world settings', { summary: `configured ${provided.join(', ')}` });
  return { success: true, data: { written } };
}
