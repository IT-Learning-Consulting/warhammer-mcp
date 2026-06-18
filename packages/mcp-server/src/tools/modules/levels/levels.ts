// Module Integration v1 Phase 4 — module-levels MCP tool.
//
// 11-action umbrella for the Levels family (elevation across the document model + scene bands +
// region stairs + volumetric depth + bulk grid rescale). Conditional: MODULE_NOT_ACTIVE when
// levels (or its hard dep wall-height) is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response.
//   - R2.4: errors route through the shared BaseTool.errorResponse.
//   - F03: the formatter emits every field the handler returns.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import {
  ErrorTokens, RegionId } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';

// ── Response shapes (DP-15 — typed, never <any>) ─────────────────────────────

interface FamilyMember { id: string; installed: boolean; active: boolean; version: string | null; }
interface LevelsCapabilities {
  family: FamilyMember[];
  volumetricActive: boolean;
  layerEffectsActive: boolean;
  betterRoofsActive: boolean;
  migration: { migrateOnStartup: boolean | null; pending: boolean; residualRangeBottomOnActiveScene: boolean; warning: string | null };
  settings: Record<string, unknown>;
}
interface LevelsElevationData {
  uuid: string;
  documentName: string | null;
  name: string | null;
  elevation: unknown;
  flagsLevels: Record<string, unknown> | null;
  flagsWallHeight: Record<string, unknown> | null;
}
interface RegionElevationResult {
  regionId: RegionId;
  elevation: { bottom: number | null; top: number | null };
  behavior: { id: string; name: string; source: string } | null;
}
interface RescaleResult {
  dryRun: boolean;
  prevDistance: number;
  currDistance: number;
  factor: number;
  affected: Record<string, number>;
  sceneLevelsBands: number;
  totalAffected: number;
  note?: string;
}
// Generic write result for the per-document setters (token/tile/placeable/wall/volumetric/scene-flags/scene-levels).
type LevelsWriteResult = Record<string, unknown>;
type LevelsResult = LevelsCapabilities | LevelsElevationData | RegionElevationResult | RescaleResult | LevelsWriteResult;

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


// ── Format helpers (F03 — emit every returned field) ──────────────────────────

function formatCapabilities(r: LevelsCapabilities): string {
  const fam = r.family.map((m) => `  - ${m.id}: ${m.active ? 'ACTIVE' : m.installed ? 'inactive' : 'not installed'}${m.version ? ` (v${m.version})` : ''}`).join('\n');
  const mig = r.migration;
  const migLine = `Migration: migrateOnStartup=${mig.migrateOnStartup}, pending=${mig.pending}, residualRangeBottom=${mig.residualRangeBottomOnActiveScene}${mig.warning ? `\n  ⚠ ${mig.warning}` : ''}`;
  const settings = Object.entries(r.settings).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  return `module-levels.get-capabilities:\nFamily:\n${fam}\nvolumetric=${r.volumetricActive} layerEffects=${r.layerEffectsActive} betterRoofs=${r.betterRoofsActive}\n${migLine}\nSettings (read-only-inform):\n${settings}`;
}

function formatElevationData(r: LevelsElevationData): string {
  return `module-levels.get-elevation-data: ${r.documentName ?? '?'} "${r.name ?? r.uuid}"\n  elevation: ${JSON.stringify(r.elevation)}\n  flags.levels: ${JSON.stringify(r.flagsLevels)}\n  flags.wall-height: ${JSON.stringify(r.flagsWallHeight)}`;
}

function formatRegion(r: RegionElevationResult): string {
  const beh = r.behavior ? `\n  behavior: ${r.behavior.name} (id=${r.behavior.id})\n    source: ${r.behavior.source}` : '';
  return `module-levels.set-region-elevation: region ${r.regionId} → bottom=${r.elevation.bottom}, top=${r.elevation.top}${beh}`;
}

function formatRescale(r: RescaleResult): string {
  const counts = Object.entries(r.affected).map(([k, n]) => `${k}=${n}`).join(', ');
  const head = r.dryRun ? 'DRY-RUN (no docs mutated)' : 'EXECUTED';
  return `module-levels.rescale-grid-distance [${head}]: ${r.prevDistance} → ${r.currDistance} (×${r.factor.toFixed(3)})\n  affected: ${counts}; sceneLevelBands=${r.sceneLevelsBands}; total=${r.totalAffected}${r.note ? `\n  ${r.note}` : ''}`;
}

function formatWrite(action: string, r: LevelsWriteResult): string {
  const fields = Object.entries(r).map(([k, v]) => `  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
  return `module-levels.${action}:\n${fields}`;
}

export interface ModuleLevelsToolOptions extends BaseToolOptions {}

export class ModuleLevelsTool extends BaseTool {
  constructor(options: ModuleLevelsToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-levels', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-levels',
        title: 'Levels — multi-floor elevation read/write',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Multi-floor elevation for the Levels family (levels + wall-height + levelsvolumetrictemplates + levels-layer-effects).
Conditional: returns MODULE_NOT_ACTIVE when levels is absent/inactive, or MODULE_DEPENDENCY_NOT_ACTIVE when its hard dep wall-height is off.
Pre-flight: module-probe.is-active levels before using this tool.

Always writes core \`elevation\` (NEVER the deprecated flags.levels.rangeBottom). GM required for all actions.

11 actions:
- get-capabilities      {}                                                  — family/active state + migration status + settings (read)
- get-elevation-data    { uuid }                                            — elevation + flags.levels/wall-height for one doc (read)
- set-token-elevation   { sceneId, tokenId, elevation, tokenHeight? }       — token floor + optional LOS eye-height
- set-tile-range        { sceneId, tileId, elevation?, rangeTop?, showIfAbove?, showAboveRange?, noCollision?, noFogHide?, isBasement?, allWallBlockSight? }
- set-placeable-range   { sceneId, placeableType:light|sound|note, placeableId, elevation?, rangeTop?, advancedLighting? }
- set-wall-height       { sceneId, wallId, top?, bottom? }                   — flags.wall-height.top/.bottom
- set-volumetric-template { sceneId, templateId, elevation?, special? }      — depth; needs levelsvolumetrictemplates; targeting only recomputes on CREATE
- define-scene-levels   { sceneId?, levels:[[bottom,top,label],...] }        — named floor bands
- set-scene-flags       { sceneId?, backgroundElevation?, weatherElevation?, lightMasking?, advancedVision?, enableEffects?, blurMulti? }
- set-region-elevation  { sceneId, regionId, bottom?, top?, stairMode?:stair|stairDown|stairUp|elevator, elevatorData?, behaviorName? }
- rescale-grid-distance { sceneId?, prevDistance, currDistance, confirm? }   — bulk; DRY-RUN unless confirm:true

SAFETY:
- rescale-grid-distance returns a dry-run (affected-doc counts) unless confirm:true — bulk write across all elevation docs + sceneLevels.
- set-volumetric-template depth persists but 3D targeting only recomputes on template CREATE, not update.
- set-region-elevation stairMode:'elevator' requires elevatorData.

Examples:
- { action: "set-token-elevation", sceneId: "abc", tokenId: "xyz", elevation: 10 }
- { action: "set-tile-range", sceneId: "abc", tileId: "t1", elevation: 10, rangeTop: 19, showIfAbove: true, allWallBlockSight: true }
- { action: "set-region-elevation", sceneId: "abc", regionId: "r1", bottom: 0, top: 10, stairMode: "stair" }
- { action: "rescale-grid-distance", sceneId: "abc", prevDistance: 5, currDistance: 2 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-capabilities', 'get-elevation-data', 'set-token-elevation', 'set-tile-range',
                'set-placeable-range', 'set-wall-height', 'set-volumetric-template', 'define-scene-levels',
                'set-scene-flags', 'set-region-elevation', 'rescale-grid-distance',
              ],
              description: 'Levels action to perform.',
            },
            uuid: { type: 'string', description: '[get-elevation-data] Full document UUID (e.g. Scene.abc.Token.xyz).' },
            sceneId: { type: 'string', description: 'Scene id. Required for embedded-doc actions; optional (defaults to active scene) for scene-level actions.' },
            tokenId: { type: 'string', description: '[set-token-elevation] Token id on the scene.' },
            tileId: { type: 'string', description: '[set-tile-range] Tile id on the scene.' },
            placeableType: { type: 'string', enum: ['light', 'sound', 'note'], description: '[set-placeable-range] Placeable kind.' },
            placeableId: { type: 'string', description: '[set-placeable-range] Placeable id on the scene.' },
            wallId: { type: 'string', description: '[set-wall-height] Wall id on the scene.' },
            templateId: { type: 'string', description: '[set-volumetric-template] MeasuredTemplate id on the scene.' },
            regionId: { type: 'string', description: '[set-region-elevation] Region id on the scene.' },
            elevation: { type: 'number', description: 'Core elevation (bottom/floor). token=floor; tile/light/sound/note/template=bottom of band.' },
            tokenHeight: { type: ['number', 'null'], description: '[set-token-elevation] flags.wall-height.tokenHeight — LOS eye height above floor. null clears.' },
            rangeTop: { type: 'number', description: '[set-tile-range/set-placeable-range] flags.levels.rangeTop — top of visible elevation band.' },
            showIfAbove: { type: 'boolean', description: '[set-tile-range] Show tile when token is above its range (roof effect).' },
            showAboveRange: { type: 'number', description: '[set-tile-range] Max elevation delta above for showIfAbove.' },
            noCollision: { type: 'boolean', description: '[set-tile-range] Exclude tile from 3D Z-plane collision.' },
            noFogHide: { type: 'boolean', description: '[set-tile-range] Do not use tile for fog-of-war masking.' },
            isBasement: { type: 'boolean', description: '[set-tile-range] Hide tile entirely when token is outside range.' },
            allWallBlockSight: { type: 'boolean', description: '[set-tile-range] All walls in tile bounds block sight when overhead (roof mode).' },
            advancedLighting: { type: 'boolean', description: '[set-placeable-range] flags.wall-height.advancedLighting (light/sound only).' },
            special: { type: 'number', description: '[set-volumetric-template] flags.levels.special — vertical depth of the 3D volume.' },
            top: { type: ['number', 'null'], description: '[set-wall-height] flags.wall-height.top. [set-region-elevation] elevation.top.' },
            bottom: { type: ['number', 'null'], description: '[set-wall-height] flags.wall-height.bottom. [set-region-elevation] elevation.bottom.' },
            levels: {
              type: 'array',
              items: { type: 'array', items: {}, minItems: 3, maxItems: 3 },
              description: '[define-scene-levels] Array of [bottom, top, label] tuples.',
            },
            backgroundElevation: { type: 'number', description: '[set-scene-flags] flags.levels.backgroundElevation — ground-plane elevation.' },
            weatherElevation: { type: 'number', description: '[set-scene-flags] flags.levels.weatherElevation — elevation above which weather renders.' },
            lightMasking: { type: 'boolean', description: '[set-scene-flags] flags.levels.lightMasking.' },
            advancedVision: { type: ['boolean', 'null'], description: '[set-scene-flags] flags.wall-height.advancedVision — per-scene elevation awareness.' },
            enableEffects: { type: 'boolean', description: '[set-scene-flags] flags.levels-layer-effects.enableEffects — depth-blur.' },
            blurMulti: { type: 'number', description: '[set-scene-flags] flags.levels-layer-effects.blurMulti (0.1–100).' },
            stairMode: { type: 'string', enum: ['stair', 'stairDown', 'stairUp', 'elevator'], description: '[set-region-elevation] Create a RegionHandler stair/elevator behavior.' },
            elevatorData: { type: 'string', description: '[set-region-elevation] Required for stairMode:elevator — the floor-definition string.' },
            behaviorName: { type: 'string', description: '[set-region-elevation] Name for the created behavior (default "Levels v6 <mode>").' },
            prevDistance: { type: 'number', description: '[rescale-grid-distance] Previous grid distance.' },
            currDistance: { type: 'number', description: '[rescale-grid-distance] New grid distance.' },
            confirm: { type: 'boolean', description: '[rescale-grid-distance] Required true to execute; omit/false for a dry-run count.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: Record<string, unknown>) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-levels action', { action });
    try {
      const data = await this.query<LevelsResult>('module-levels', args);
      let text: string;
      switch (action) {
        case 'get-capabilities':
          text = formatCapabilities(data as LevelsCapabilities);
          break;
        case 'get-elevation-data':
          text = formatElevationData(data as LevelsElevationData);
          break;
        case 'set-region-elevation':
          text = formatRegion(data as RegionElevationResult);
          break;
        case 'rescale-grid-distance':
          text = formatRescale(data as RescaleResult);
          break;
        default:
          text = formatWrite(action, data as LevelsWriteResult);
      }
      return { content: [{ type: 'text' as const, text }], structuredContent: data as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE) || msg.includes(ErrorTokens.MODULE_DEPENDENCY_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-levels', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
