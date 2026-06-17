// Phase 8 (R8.4): scenery sub-family of module-scene-atmosphere — result interfaces + formatters
// extracted VERBATIM from scene-atmosphere.ts (no logic change; the split is purely to land
// each file <=600 lines). Imported back by the main tool's formatResult trampoline.
import { SceneId } from '@foundry-mcp/shared';

// ── Phase 4B: scenery result shapes ──────────────────────────────────────────

export interface SceneryVariation {
  index: number;
  name: string;
  gmBackground: string | null;
  plBackground: string | null;
  hasSceneData: boolean;
}

export interface ListVariationsResult {
  sceneId: SceneId;
  sceneName: string;
  activeVariationIndex: number;
  variations: SceneryVariation[];
  count: number;
  isLegacyMigrated: boolean;
}

export interface GetActiveVariationResult {
  sceneId: SceneId;
  sceneName: string;
  hasScenery: boolean;
  activeVariationIndex: number;
  activeVariation: SceneryVariation | null;
}

export interface SetActiveVariationResult {
  sceneId: SceneId;
  sceneName: string;
  previousIndex: number;
  newActiveIndex: number;
  newVariationName: string;
  verifiedActiveIndex: number | null;
  elementRestoreSkipNote: string;
}

export interface AddVariationResult {
  sceneId: SceneId;
  sceneName: string;
  addedVariationIndex: number;
  addedVariationName: string;
  gmBackground: string | null;
  plBackground: string | null;
  totalVariationsCount: number;
  verifiedTotalCount: number | null;
}

export interface DeleteVariationResult {
  sceneId: SceneId;
  sceneName: string;
  deletedVariationName: string;
  deletedIndex: number;
  newActiveVariationIndex: number;
  remainingVariationsCount: number;
  verifiedTotalCount: number | null;
}

export interface SetVariationBackgroundsResult {
  sceneId: SceneId;
  sceneName: string;
  variationIndex: number;
  variationName: string;
  gmBackground: string | null;
  plBackground: string | null;
  plBackgroundNote?: string;
  verifiedGmBackground: string | null;
  verifiedPlBackground: string | null;
}

export interface ResetVariationSceneDataResult {
  sceneId: SceneId;
  sceneName: string;
  variationIndex: number;
  variationName: string;
  hadSceneData: boolean;
  verifiedHasSceneData: boolean;
}

export interface CheckSceneryModuleActiveResult {
  moduleId: string; // not a branded id (polymorphic / non-document)
  active: boolean;
  title: string | null;
  version: string | null;
}

export interface ReadScenerySettingsResult {
  moduleId: string; // not a branded id (polymorphic / non-document)
  settings: Record<string, unknown>;
  globalElementTypes: Record<string, unknown>;
  note: string;
}

export type SceneryResult =
  | ListVariationsResult
  | GetActiveVariationResult
  | SetActiveVariationResult
  | AddVariationResult
  | DeleteVariationResult
  | SetVariationBackgroundsResult
  | ResetVariationSceneDataResult
  | CheckSceneryModuleActiveResult
  | ReadScenerySettingsResult;


// ── Phase 4B: scenery formatters (F03 — emit EVERY returned field) ────────────

export function formatListVariations(r: ListVariationsResult): string {
  const rows = r.variations.map((v) => {
    const active = v.index === r.activeVariationIndex ? ' [ACTIVE]' : '';
    const sceneData = v.hasSceneData ? ' +sceneData' : '';
    return `  [${v.index}]${active} "${v.name}"${sceneData}`;
  });
  const migratedNote = r.isLegacyMigrated ? ' (legacy v1 migrated in-memory)' : '';
  return [
    `scenery: list-variations — ${r.count} variation(s) on "${r.sceneName}" (${r.sceneId})${migratedNote}.`,
    `Active index: ${r.activeVariationIndex}`,
    rows.join('\n'),
  ].join('\n');
}

export function formatGetActiveVariation(r: GetActiveVariationResult): string {
  if (!r.hasScenery || !r.activeVariation) {
    return `scenery: get-active-variation — "${r.sceneName}" (${r.sceneId}): no scenery data configured.`;
  }
  const v = r.activeVariation;
  return [
    `scenery: get-active-variation — "${r.sceneName}" (${r.sceneId}) active index=${r.activeVariationIndex}.`,
    `Name: "${v.name}"`,
    `GM background: ${v.gmBackground ?? '(none)'}`,
    `Player background: ${v.plBackground ?? '(none)'}`,
    `Has sceneData: ${v.hasSceneData}`,
  ].join('\n');
}

export function formatSetActiveVariation(r: SetActiveVariationResult): string {
  return [
    `scenery: set-active-variation OK — "${r.sceneName}" (${r.sceneId}).`,
    `Previous: ${r.previousIndex} → Active: ${r.newActiveIndex} ("${r.newVariationName}")`,
    `Verified activeVariationIndex: ${r.verifiedActiveIndex ?? 'unknown'}`,
    `Note: ${r.elementRestoreSkipNote}`,
  ].join('\n');
}

export function formatAddVariation(r: AddVariationResult): string {
  return [
    `scenery: add-variation OK — "${r.sceneName}" (${r.sceneId}).`,
    `New index: ${r.addedVariationIndex} | Name: "${r.addedVariationName}"`,
    `GM background: ${r.gmBackground ?? '(none)'} | Player background: ${r.plBackground ?? '(none)'}`,
    `Total count: ${r.totalVariationsCount} | Verified count: ${r.verifiedTotalCount ?? 'unknown'}`,
  ].join('\n');
}

export function formatDeleteVariation(r: DeleteVariationResult): string {
  return [
    `scenery: delete-variation OK — "${r.sceneName}" (${r.sceneId}).`,
    `Deleted index ${r.deletedIndex} ("${r.deletedVariationName}")`,
    `Active variation now: ${r.newActiveVariationIndex} | Remaining: ${r.remainingVariationsCount} (verified: ${r.verifiedTotalCount ?? 'unknown'})`,
  ].join('\n');
}

export function formatSetVariationBackgrounds(r: SetVariationBackgroundsResult): string {
  const plNote = r.plBackgroundNote ? `\nNote: ${r.plBackgroundNote}` : '';
  return [
    `scenery: set-variation-backgrounds OK — "${r.sceneName}" (${r.sceneId}) index=${r.variationIndex} ("${r.variationName}").`,
    `GM bg: ${r.gmBackground ?? '(none)'} | Player bg: ${r.plBackground ?? '(none)'}${plNote}`,
    `Verified — GM bg: ${r.verifiedGmBackground ?? '(none)'} | Player bg: ${r.verifiedPlBackground ?? '(none)'}`,
  ].join('\n');
}

export function formatResetVariationSceneData(r: ResetVariationSceneDataResult): string {
  return [
    `scenery: reset-variation-scene-data OK — "${r.sceneName}" (${r.sceneId}) index=${r.variationIndex} ("${r.variationName}").`,
    `Had sceneData: ${r.hadSceneData} | Verified hasSceneData: ${r.verifiedHasSceneData}`,
  ].join('\n');
}

export function formatCheckSceneryModuleActive(r: CheckSceneryModuleActiveResult): string {
  const meta = r.title ? ` (${r.title}${r.version ? ` v${r.version}` : ''})` : '';
  return `scenery: check-module-active — "${r.moduleId}"${meta}: ${r.active ? 'ACTIVE' : 'INACTIVE'}`;
}

export function formatReadScenerySettings(r: ReadScenerySettingsResult): string {
  const count = Object.keys(r.settings).length;
  const rows = Object.entries(r.settings).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`).join('\n');
  return [`scenery: read-settings — ${count} setting(s).`, rows, `Note: ${r.note}`].join('\n');
}

