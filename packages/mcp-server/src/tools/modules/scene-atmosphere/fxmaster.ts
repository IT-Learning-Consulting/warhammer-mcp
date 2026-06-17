// Phase 8 (R8.4): fxmaster sub-family of module-scene-atmosphere — result interfaces + formatters
// extracted VERBATIM from scene-atmosphere.ts (no logic change; the split is purely to land
// each file <=600 lines). Imported back by the main tool's formatResult trampoline.
import { RegionBehaviorId, RegionId } from '@foundry-mcp/shared';

export interface BundleMemberStatus {
  id: string;
  active: boolean;
  title: string | null;
  version: string | null;
}

export interface GetBundleStatusResult {
  members: BundleMemberStatus[];
}

// ── Phase 2: fxmaster result shapes ──────────────────────────────────────────

export interface PlayPresetResult {
  preset: string;
  options: Record<string, unknown>;
  activePresets: string[];
}

export interface StopPresetResult {
  preset: string;
  stopped: boolean;
  activePresets: string[];
}

export interface TogglePresetResult {
  preset: string;
  toggled: boolean;
  activePresets: string[];
}

export interface SwitchPresetResult {
  preset: string | null;
  switched: boolean;
  activePresets: string[];
}

export interface ListPresetsResult {
  presets: string[];
  count: number;
  hasFxmasterPlus: boolean;
  hasFxmaster: boolean;
  note: string;
}

export interface ListActivePresetsResult {
  presets: string[];
  count: number;
  scene: string | null;
}

export interface ListValidPresetsResult {
  presets: string[];
  count: number;
  topDown: boolean;
  note: string;
}

export interface PlayParticlesResult {
  ids: Record<string, unknown>;
  particleCount: number;
  types: string[];
  verifiedEffectsFlag: unknown;
}

export interface PlayFiltersResult {
  ids: Record<string, unknown>;
  filterCount: number;
  types: string[];
  verifiedFiltersFlag: unknown;
}

export interface StopEffectsResult {
  stopped: boolean;
  particles: string[];
  filters: string[];
  effects: string[];
}

export interface ToggleEffectsResult {
  toggled: boolean;
  toggleKey: string | null;
  particles: string[];
  filters: string[];
  effects: string[];
}

export interface ClearEffectsResult {
  cleared: string[];
  target: string;
  verify: {
    effectsFlag: unknown;
    filtersFlag: unknown;
    stackFlag: unknown;
  };
}

export interface SetEnabledResult {
  disableAll: boolean;
  verifiedDisableAll: boolean;
  note: string;
}

export interface SetRegionParticlesResult {
  regionId: RegionId;
  behaviorId: RegionBehaviorId | null;
  behaviorType: string;
  particleType: string;
  replaced: boolean;
}

export interface SetRegionFiltersResult {
  regionId: RegionId;
  behaviorId: RegionBehaviorId | null;
  behaviorType: string;
  filterType: string;
  replaced: boolean;
}

export interface SuppressSceneParticlesResult {
  regionId: RegionId;
  behaviorId?: RegionBehaviorId | null;
  removed: boolean;
  behaviorType: string;
}

export interface SuppressSceneFiltersResult {
  regionId: RegionId;
  behaviorId?: RegionBehaviorId | null;
  removed: boolean;
  behaviorType: string;
}

// Phase 2 union of all fxmaster results
export type FxmasterResult =
  | PlayPresetResult
  | StopPresetResult
  | TogglePresetResult
  | SwitchPresetResult
  | ListPresetsResult
  | ListActivePresetsResult
  | ListValidPresetsResult
  | PlayParticlesResult
  | PlayFiltersResult
  | StopEffectsResult
  | ToggleEffectsResult
  | ClearEffectsResult
  | SetEnabledResult
  | SetRegionParticlesResult
  | SetRegionFiltersResult
  | SuppressSceneParticlesResult
  | SuppressSceneFiltersResult;


// ── Format helpers (Phase-5 F03 — emit every returned field) ─────────────────

export function formatGetBundleStatus(r: GetBundleStatusResult): string {
  const lines = r.members.map((m) => {
    const status = m.active ? 'ACTIVE' : 'INACTIVE';
    const meta = m.title ? ` (${m.title}${m.version ? ` v${m.version}` : ''})` : '';
    return `- ${m.id}${meta}: ${status}`;
  });
  const activeCount = r.members.filter((m) => m.active).length;
  return `module-scene-atmosphere bundle status: ${activeCount}/${r.members.length} members active.\n\n${lines.join('\n')}`;
}

// ── Phase 2: fxmaster formatters (F03 — emit EVERY returned field) ────────────

export function formatPlayPreset(r: PlayPresetResult): string {
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: play-preset "${r.preset}" OK.\nOptions: ${JSON.stringify(r.options)}\nNow active: ${active}`;
}

export function formatStopPreset(r: StopPresetResult): string {
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: stop-preset "${r.preset}" OK (stopped=${r.stopped}).\nNow active: ${active}`;
}

export function formatTogglePreset(r: TogglePresetResult): string {
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: toggle-preset "${r.preset}" OK (toggled=${r.toggled}).\nNow active: ${active}`;
}

export function formatSwitchPreset(r: SwitchPresetResult): string {
  const to = r.preset ?? 'null (all stopped)';
  const active = r.activePresets.length > 0 ? r.activePresets.join(', ') : '(none)';
  return `fxmaster: switch-preset → "${to}" OK (switched=${r.switched}).\nNow active: ${active}`;
}

export function formatListPresets(r: ListPresetsResult): string {
  return [
    `fxmaster: list-presets — ${r.count} presets registered.`,
    `hasFxmasterPlus: ${r.hasFxmasterPlus} | hasFxmaster: ${r.hasFxmaster}`,
    `Presets: ${r.presets.join(', ')}`,
    `Note: ${r.note}`,
  ].join('\n');
}

export function formatListActivePresets(r: ListActivePresetsResult): string {
  const active = r.presets.length > 0 ? r.presets.join(', ') : '(none)';
  return `fxmaster: list-active-presets — ${r.count} active on ${r.scene ?? 'current scene'}.\nActive: ${active}`;
}

export function formatListValidPresets(r: ListValidPresetsResult): string {
  const presets = r.presets.length > 0 ? r.presets.join(', ') : '(none)';
  return [
    `fxmaster: list-valid-presets — ${r.count} valid (topDown=${r.topDown}).`,
    `Valid: ${presets}`,
    `Note: ${r.note}`,
  ].join('\n');
}

export function formatPlayParticles(r: PlayParticlesResult): string {
  const idSummary = JSON.stringify(r.ids);
  return [
    `fxmaster: play-particles OK — ${r.particleCount} effect(s): ${r.types.join(', ')}.`,
    `IDs: ${idSummary}`,
    `Verified effects flag: ${r.verifiedEffectsFlag !== null && r.verifiedEffectsFlag !== undefined ? 'set' : 'null'}`,
  ].join('\n');
}

export function formatPlayFilters(r: PlayFiltersResult): string {
  const idSummary = JSON.stringify(r.ids);
  return [
    `fxmaster: play-filters OK — ${r.filterCount} filter(s): ${r.types.join(', ')}.`,
    `IDs: ${idSummary}`,
    `Verified filters flag: ${r.verifiedFiltersFlag !== null && r.verifiedFiltersFlag !== undefined ? 'set' : 'null'}`,
  ].join('\n');
}

export function formatStopEffects(r: StopEffectsResult): string {
  return [
    `fxmaster: stop-effects OK (stopped=${r.stopped}).`,
    `Particles stopped: ${r.particles.length > 0 ? r.particles.join(', ') : '(none)'}`,
    `Filters stopped: ${r.filters.length > 0 ? r.filters.join(', ') : '(none)'}`,
    `Effects stopped: ${r.effects.length > 0 ? r.effects.join(', ') : '(none)'}`,
  ].join('\n');
}

export function formatToggleEffects(r: ToggleEffectsResult): string {
  return [
    `fxmaster: toggle-effects OK (toggled=${r.toggled}).`,
    `Toggle key: ${r.toggleKey ?? '(none)'}`,
    `Particles: ${r.particles.join(', ') || '(none)'}`,
    `Filters: ${r.filters.join(', ') || '(none)'}`,
    `Effects: ${r.effects.join(', ') || '(none)'}`,
  ].join('\n');
}

export function formatClearEffects(r: ClearEffectsResult): string {
  const v = r.verify;
  return [
    `fxmaster: clear-effects OK — cleared: ${r.cleared.join(', ')} (target=${r.target}).`,
    `Verify — effectsFlag: ${v.effectsFlag != null ? 'still set (unexpected)' : 'null OK'}`,
    `Verify — filtersFlag: ${v.filtersFlag != null ? 'still set (unexpected)' : 'null OK'}`,
    `Verify — stackFlag: ${v.stackFlag != null ? 'still set (unexpected)' : 'null OK'}`,
  ].join('\n');
}

export function formatSetEnabled(r: SetEnabledResult): string {
  return [
    `fxmaster: set-enabled OK — disableAll=${r.disableAll} (verified=${r.verifiedDisableAll}).`,
    r.note,
  ].join('\n');
}

export function formatSetRegionParticles(r: SetRegionParticlesResult): string {
  return [
    `fxmaster: set-region-particles OK.`,
    `Region: ${r.regionId} | Behavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`,
    `Particle type: ${r.particleType} | Replaced existing: ${r.replaced}`,
  ].join('\n');
}

export function formatSetRegionFilters(r: SetRegionFiltersResult): string {
  return [
    `fxmaster: set-region-filters OK.`,
    `Region: ${r.regionId} | Behavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`,
    `Filter type: ${r.filterType} | Replaced existing: ${r.replaced}`,
  ].join('\n');
}

export function formatSuppressSceneParticles(r: SuppressSceneParticlesResult): string {
  if (r.removed) {
    return `fxmaster: suppress-scene-particles removed from region ${r.regionId} (type=${r.behaviorType}).`;
  }
  return `fxmaster: suppress-scene-particles added to region ${r.regionId}.\nBehavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`;
}

export function formatSuppressSceneFilters(r: SuppressSceneFiltersResult): string {
  if (r.removed) {
    return `fxmaster: suppress-scene-filters removed from region ${r.regionId} (type=${r.behaviorType}).`;
  }
  return `fxmaster: suppress-scene-filters added to region ${r.regionId}.\nBehavior: ${r.behaviorId ?? '(unknown)'} | Type: ${r.behaviorType}`;
}

