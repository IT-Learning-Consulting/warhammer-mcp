// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file.
// Module Integration v1 Phase 2 — module-matt: sequence editing (2B) + variables/history state.
// mcp_code_quality_v2 Phase C3 (19b split): extracted verbatim from matt.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens, validateSequence, makeMattId, type ModuleMattInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope } from '../_shared/handler-utils.js';
import { MATT_FLAG, getTileByUuidOrThrow, readMattFlags, normalizeActionData, normalizeActions, resolveTaggerSelectorsInSequence, buildImpactReport } from './matt-helpers.js';
import { buildOutcomeResponse } from '../../../services/shared/outcome-response.js';

type ReplaceSeqInput = Extract<ModuleMattInputType, { action: 'replace-action-sequence' }>;
type AddActionInput = Extract<ModuleMattInputType, { action: 'add-action' }>;
type InsertActionInput = Extract<ModuleMattInputType, { action: 'insert-action' }>;
type UpdateActionInput = Extract<ModuleMattInputType, { action: 'update-action' }>;
type RemoveActionInput = Extract<ModuleMattInputType, { action: 'remove-action' }>;
type ReorderActionsInput = Extract<ModuleMattInputType, { action: 'reorder-actions' }>;
type DuplicateActionInput = Extract<ModuleMattInputType, { action: 'duplicate-action' }>;
type SetVariablesInput = Extract<ModuleMattInputType, { action: 'set-variables' }>;
type ResetHistoryInput = Extract<ModuleMattInputType, { action: 'reset-history' }>;

export type StoredAction = { id: string; action: string; data: Record<string, unknown> };

export function readActions(tile: any): StoredAction[] {
  const flags = readMattFlags(tile);
  return Array.isArray(flags.actions) ? (flags.actions as StoredAction[]) : [];
}

/**
 * Catalog-validate + confirm-gate + write a full actions array, then DP-16 re-read.
 * Shared by every sequence-edit action (CCR-3/CCR-4/DP-16).
 */
async function writeActions(
  scene: any,
  tile: any,
  newActions: StoredAction[],
  confirm: boolean | undefined,
  opSummary: string,
  extra?: Record<string, unknown>,
): Promise<Envelope<unknown>> {
  const v = validateSequence(newActions);
  if (!v.valid) {
    return { success: false, error: `MATT_SEQUENCE_INVALID: ${v.errors.join('; ')}` };
  }
  if (v.dangerous.length > 0 && confirm !== true) {
    const impact = buildImpactReport(newActions);
    return {
      success: false,
      error: `MATT_CONFIRM_REQUIRED: sequence contains dangerous action(s) [${v.dangerous.join(', ')}]. Review impact and re-send with confirm:true. impact=${JSON.stringify(impact.dangerous)}`,
    };
  }

  // Phase 5C.1 — author-time tagger selector resolution on sequence writes
  const taggerActive = Boolean((globalThis as any).game?.modules?.get?.('tagger')?.active);
  const { taggerResolution, warnings: taggerWarnings } = await resolveTaggerSelectorsInSequence(
    newActions,
    taggerActive,
    scene.id as string | undefined,
  );

  await tile.update({ [`flags.${MATT_FLAG}.actions`]: newActions });

  // DP-16 — re-read _source and confirm the count persisted.
  const persisted = readActions(tile);
  if (persisted.length !== newActions.length) {
    return { success: false, error: `${ErrorTokens.MATT_ACTIONS_NOT_PERSISTED}: expected ${newActions.length} action(s), found ${persisted.length}` };
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  const flags = readMattFlags(tile);
  notify.updated('tile', (flags.name as string) ?? `MATT tile ${tile.id}`, { summary: opSummary, uuid });

  return {
    success: true,
    data: buildOutcomeResponse('applied', {
      uuid,
      tileId: tile.id,
      actionCount: persisted.length,
      actions: persisted.map((a) => ({ id: a.id, action: a.action })),
      ...(taggerResolution.length > 0 ? { taggerResolution } : {}),
      ...(taggerWarnings.length > 0 ? { taggerWarnings } : {}),
      ...(extra ?? {}),
    }),
  };
}

export async function handleReplaceActionSequence(input: ReplaceSeqInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const newActions = normalizeActions(input.actions, scene.id);
  return writeActions(scene, tile, newActions, input.confirm, `replaced sequence (${newActions.length} action(s))`);
}

export async function handleAddAction(input: AddActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const added = normalizeActions([input.mattAction], scene.id)[0]!;
  return writeActions(scene, tile, [...current, added], input.confirm, `added action "${added.action}"`, { actionId: added.id });
}

export async function handleInsertAction(input: InsertActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  if (input.index > current.length) {
    return { success: false, error: `MATT_INDEX_OUT_OF_RANGE: index ${input.index} > length ${current.length}` };
  }
  const inserted = normalizeActions([input.mattAction], scene.id)[0]!;
  const next = [...current];
  next.splice(input.index, 0, inserted);
  return writeActions(scene, tile, next, input.confirm, `inserted action "${inserted.action}" at ${input.index}`, { actionId: inserted.id });
}

export async function handleUpdateAction(input: UpdateActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const idx = current.findIndex((a) => a.id === input.actionId);
  if (idx === -1) {
    return { success: false, error: `MATT_ACTION_NOT_FOUND: no action with id "${input.actionId}"` };
  }
  const next = [...current];
  const mergedKey = input.newActionKey ?? current[idx]!.action;
  next[idx] = {
    id: input.actionId,
    action: mergedKey,
    // BUG-310: merge so unspecified keys (entity refs, delays, etc.) are preserved
    data: normalizeActionData(mergedKey, { ...current[idx]!.data, ...input.data }, scene.id),
  };
  return writeActions(scene, tile, next, input.confirm, `updated action ${input.actionId}`, { actionId: input.actionId });
}

export async function handleRemoveAction(input: RemoveActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const next = current.filter((a) => a.id !== input.actionId);
  if (next.length === current.length) {
    return { success: false, error: `MATT_ACTION_NOT_FOUND: no action with id "${input.actionId}"` };
  }
  return writeActions(scene, tile, next, input.confirm, `removed action ${input.actionId}`, { actionId: input.actionId });
}

export async function handleReorderActions(input: ReorderActionsInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const byId = new Map(current.map((a) => [a.id, a]));
  if (input.order.length !== current.length || !input.order.every((id) => byId.has(id))) {
    return {
      success: false,
      error: `MATT_REORDER_MISMATCH: order must be a permutation of the ${current.length} existing action id(s)`,
    };
  }
  const next = input.order.map((id) => byId.get(id) as StoredAction);
  return writeActions(scene, tile, next, input.confirm, 'reordered actions');
}

export async function handleDuplicateAction(input: DuplicateActionInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const current = readActions(tile);
  const idx = current.findIndex((a) => a.id === input.actionId);
  if (idx === -1) {
    return { success: false, error: `MATT_ACTION_NOT_FOUND: no action with id "${input.actionId}"` };
  }
  const clone: StoredAction = {
    id: makeMattId(),
    action: current[idx]!.action,
    data: JSON.parse(JSON.stringify(current[idx]!.data ?? {})),
  };
  const next = [...current];
  next.splice(idx + 1, 0, clone);
  return writeActions(scene, tile, next, input.confirm, `duplicated action ${input.actionId}`, { actionId: clone.id });
}

export async function handleSetVariables(input: SetVariablesInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const flags = readMattFlags(tile);
  const merged = { ...(flags.variables ?? {}), ...input.variables };

  await tile.update({ [`flags.${MATT_FLAG}.variables`]: merged });

  // DP-16 — re-read and confirm every requested key persisted.
  const persisted = (readMattFlags(tile).variables ?? {}) as Record<string, unknown>;
  for (const [k, val] of Object.entries(input.variables)) {
    if (JSON.stringify(persisted[k]) !== JSON.stringify(val)) {
      return { success: false, error: `${ErrorTokens.MATT_VARIABLE_NOT_PERSISTED}: "${k}" did not persist` };
    }
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  notify.updated('tile', (flags.name as string) ?? `MATT tile ${tile.id}`, {
    summary: `variables: ${Object.keys(input.variables).join(', ')}`,
    uuid,
  });
  return { success: true, data: { uuid, tileId: tile.id, variables: persisted } };
}

export async function handleResetHistory(input: ResetHistoryInput): Promise<Envelope<unknown>> {
  const { scene, tile } = getTileByUuidOrThrow(input.tileUuid);
  const flags = readMattFlags(tile);

  // BUG-452: Document.update() MERGES plain objects — writing `history: {}` contributes zero
  // keys (no-op on non-empty history) and writing a filtered copy re-asserts the remaining
  // keys without DELETING the removed one. Use Foundry's `-=` deletion-marker syntax instead,
  // mirroring upstream MATT's own resetHistory idiom (monks-active-tiles.js:5263-5276).
  let cleared: string;
  if (input.tokenId) {
    await tile.update({ [`flags.${MATT_FLAG}.history.-=${input.tokenId}`]: null });
    cleared = `token ${input.tokenId}`;
  } else {
    await tile.update({ [`flags.${MATT_FLAG}.-=history`]: null });
    cleared = 'all tokens';
  }

  // DP-16 — re-read.
  const persisted = (readMattFlags(tile).history ?? {}) as Record<string, unknown>;
  if (input.tokenId && persisted[input.tokenId] !== undefined) {
    return { success: false, error: `MATT_HISTORY_NOT_CLEARED: token ${input.tokenId} still present` };
  }
  if (!input.tokenId && Object.keys(persisted).length !== 0) {
    return { success: false, error: 'MATT_HISTORY_NOT_CLEARED: history not empty after reset' };
  }

  const uuid = tile.uuid ?? `Scene.${scene.id}.Tile.${tile.id}`;
  notify.updated('tile', (flags.name as string) ?? `MATT tile ${tile.id}`, { summary: `reset history (${cleared})`, uuid });
  return { success: true, data: { uuid, tileId: tile.id, cleared } };
}
