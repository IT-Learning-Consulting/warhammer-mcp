// Phase 5 mcp_crud_expansion — Region umbrella tool (8 actions).
//
// Wraps the `region` Foundry-side handler (dispatchRegion).
// Actions: create / update / delete / get / list (base Region CRUD)
//        + createBehavior / updateBehavior / deleteBehavior (RegionBehavior CRUD).
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through this.errorResponse().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.
//
// **DRIFT-1:** Region.shapes has 4 variants (rectangle/circle/ellipse/polygon).
// **DRIFT-2:** RegionBehavior `events` lives inside per-subtype `system`, NOT
//   at the document level. Only executeMacro / displayScrollingText / executeScript
//   include events in their system schemas.

import { z } from 'zod';
import {
  RegionToolInput,
  type RegionViewModel,
  type RegionListItem,
  type RegionBehaviorSummary,
  type SceneId,
  type RegionId,
  type RegionBehaviorId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type RegionArgs = z.infer<typeof RegionToolInput>;
type ArgsFor<A extends RegionArgs['action']> = Extract<RegionArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler exports) ────────

interface RegionCreateResponse {
  region: RegionViewModel;
  requestedChanges: Record<string, unknown>;
}
interface RegionUpdateResponse {
  region: RegionViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface RegionDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  sceneId: SceneId;
  remainingRegions: number;
}
interface RegionGetResponse {
  region: RegionViewModel;
}
interface RegionListResponse {
  regions: RegionListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: boolean;
  filterApplied?: string | null;
}
interface RegionBehaviorCreateResponse {
  regionId: RegionId;
  behavior: RegionBehaviorSummary;
}
interface RegionBehaviorUpdateResponse {
  regionId: RegionId;
  behavior: RegionBehaviorSummary;
  changedFields: string[];
}
interface RegionBehaviorDeleteResponse {
  regionId: RegionId;
  deletedBehaviorId: RegionBehaviorId;
  remainingBehaviors: number;
}
interface RegionAddShapeResponse {
  region: RegionViewModel;
  shapeCount: number;
}

// ── Utilities ────────────────────────────────────────────────────────────────


function formatBehavior(b: RegionBehaviorSummary): string {
  const systemLines = Object.entries(b.system)
    .map(([k, v]) => `  - ${k}: ${JSON.stringify(v)}`)
    .join('\n');
  return [
    `### Behavior \`${b.id}\``,
    `- type: **${b.type}** · name: ${b.name || '_(unnamed)_'} · disabled: ${b.disabled ? 'yes' : 'no'}`,
    systemLines ? `- system:\n${systemLines}` : `- system: _(empty)_`,
  ].join('\n');
}

function formatRegionView(r: RegionViewModel): string {
  const visLabel = ['LAYER', 'GAMEMASTER', 'ALWAYS'][r.visibility] ?? String(r.visibility);
  const shapeSummary = r.shapes
    .map((s: Record<string, unknown>) => `${s['type'] ?? '?'}${s['hole'] ? '(hole)' : ''}`)
    .join(', ') || '_(none)_';
  const elevBottom = r.elevation.bottom ?? 'none';
  const elevTop = r.elevation.top ?? 'none';

  const lines = [
    `## Region \`${r.id}\``,
    `**Scene:** \`${r.sceneId}\`  **Name:** ${r.name}`,
    ``,
    `### Geometry`,
    `- shapes (${r.shapes.length}): ${shapeSummary}`,
    `- elevation: bottom=${elevBottom}, top=${elevTop}`,
    ``,
    `### Properties`,
    `- color: ${r.color} · visibility: ${visLabel} · locked: ${r.locked ? 'yes' : 'no'}`,
    `- behaviors: ${r.behaviorCount}`,
  ];

  if (r.behaviors && r.behaviors.length > 0) {
    lines.push(``, `### Behaviors`);
    r.behaviors.forEach((b) => lines.push(formatBehavior(b)));
  }

  return lines.join('\n');
}

function formatRegionListItem(r: RegionListItem): string {
  const visLabel = ['LAYER', 'GAMEMASTER', 'ALWAYS'][r.visibility] ?? String(r.visibility);
  return (
    `- \`${r.id}\` **${r.name}**` +
    ` · shapes=${r.shapeCount}` +
    ` · behaviors=${r.behaviorCount}` +
    ` · vis=${visLabel}` +
    (r.locked ? ' · 🔒 locked' : '')
  );
}

export interface RegionToolOptions extends BaseToolOptions {}

export class RegionTool extends BaseTool {
  constructor(options: RegionToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'region', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'region',
        title: 'Manage Regions & RegionBehaviors',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry v13 Region documents and their embedded RegionBehaviors via 9 actions.

**Base Region (5 actions):**
- **create**: New Region on a scene. Required: sceneId, name. Optional: color, shapes (4 variants — rectangle/circle/ellipse/polygon, all share hole:boolean), elevation:{bottom,top} (nested SchemaField — NOT flat), visibility (0=LAYER 1=GAMEMASTER 2=ALWAYS), locked, flags. Returns RegionViewModel.
- **update**: Partial-diff. Required: sceneId, regionId, changes (≥1 field). Same writable surface as create.
- **delete**: Permanently remove Region. Required: sceneId, regionId. ⚠️ Also deletes all embedded behaviors.
- **get**: Fetch single region. Required: sceneId, regionId. Optional: includeBehaviors (bool) to embed full behavior list.
- **list**: List regions on a scene. sceneId optional (defaults to active). Filters: locked, filter (name substring). Pagination: page/pageSize. countOnly=true for cheap count.
- **add-shape** (Phase 9A): Append ONE shape to a region without clobbering existing shapes. Required: sceneId, regionId, shape ({type, ...} — see Shapes below). Returns the updated region + new shapeCount.

**RegionBehavior (3 actions — embedded on RegionDocument, NOT on Scene):**
- **createBehavior**: Add a behavior to a region. Required: sceneId, regionId, behavior:{type, system}. Optional: name, disabled. Type must be one of 7 v13-core subtypes (see below).
- **updateBehavior**: Patch an existing behavior. Required: sceneId, regionId, behaviorId. Optional: name, disabled, behavior:{type, system}. Type MUST match existing (cross-subtype migration unsupported — delete+recreate).
- **deleteBehavior**: Remove a behavior. Required: sceneId, regionId, behaviorId. ⚠️ Irreversible.

**RegionBehavior subtypes (behavior.type + system fields):**
- teleportToken: {destination?: string|null, choice?: bool} — destination MUST be a full Region UUID ("Scene.<sceneId>.Region.<regionId>"), NOT a bare id or "Scene.<id>"; Foundry silently nulls a non-Region-UUID value at write time
- executeMacro: {uuid?: string|null, everyone?: bool, events?: regionEvent[]}
- adjustDarknessLevel: {mode?: 0|1|2, modifier?: 0–1}
- suppressWeather: {} (no system fields)
- displayScrollingText: {text: string (req), color: string (req, 6-char hex), visibility?, once?, events: [] — must be EMPTY per BUG-078 (Foundry rejects non-empty events for this subtype)}
- executeScript: {source: string (req), events?: regionEvent[]}
- pauseGame: {once?: bool}

**events** (for executeMacro/displayScrollingText/executeScript) — CONST.REGION_EVENTS: tokenEnter, tokenExit, tokenMoveIn, tokenMoveOut, tokenMoveWithin, tokenTurnStart, tokenTurnEnd, tokenRoundStart, tokenRoundEnd, regionBoundary, behaviorActivated, behaviorDeactivated, behaviorViewed, behaviorUnviewed, tokenAnimateIn, tokenAnimateOut.

**Shapes:** rectangle:{x,y,width,height,rotation?} · circle:{x,y,radius} · ellipse:{x,y,radiusX,radiusY,rotation?} · polygon:{points:[x1,y1,...] ≥6}. All accept hole:bool.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list', 'createBehavior', 'updateBehavior', 'deleteBehavior', 'add-shape'],
              description: 'The region action to perform.',
            },
            sceneId: {
              type: 'string',
              description: '[create/update/delete/get/createBehavior/updateBehavior/deleteBehavior] Required scene ID. [list] Optional — defaults to active scene.',
            },
            regionId: {
              type: 'string',
              description: '[update/delete/get/createBehavior/updateBehavior/deleteBehavior] Region document ID.',
            },
            behaviorId: {
              type: 'string',
              description: '[updateBehavior/deleteBehavior] RegionBehavior document ID.',
            },
            // create-only required
            name: {
              type: 'string',
              description: '[create] Required region name. [createBehavior/updateBehavior] Optional behavior name.',
            },
            // region writable fields
            color: { type: 'string', description: '[create/update.changes] Hex color string.' },
            shapes: {
              type: 'array',
              description: '[create/update.changes] Array of shape objects. Each shape has type (rectangle/circle/ellipse/polygon) + hole:bool + type-specific fields.',
              items: { type: 'object' },
            },
            shape: {
              type: 'object',
              description: '[add-shape] A single shape object {type:rectangle|circle|ellipse|polygon, hole?, ...type-specific fields} appended to the region without clobbering existing shapes.',
            },
            elevation: {
              type: 'object',
              description: '[create/update.changes] Nested elevation SchemaField: {bottom?: number|null, top?: number|null}.',
            },
            visibility: {
              type: 'integer',
              minimum: 0,
              maximum: 2,
              description: '[create/update.changes] CONST.REGION_VISIBILITY: 0=LAYER, 1=GAMEMASTER, 2=ALWAYS.',
            },
            locked: { type: 'boolean', description: '[create/update.changes] Lock the region.' },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description: '[update] Partial-diff of writable Region fields (≥1 required): name, color, shapes, elevation, visibility, locked, flags.',
            },
            includeBehaviors: {
              type: 'boolean',
              description: '[get] If true, embed full behavior list in response.',
            },
            // list
            filter: { type: 'string', description: '[list] Substring filter on region name.' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 50, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total} only.' },
            // behavior actions
            disabled: { type: 'boolean', description: '[createBehavior/updateBehavior] Whether behavior starts disabled.' },
            behavior: {
              type: 'object',
              description: '[createBehavior] Required. [updateBehavior] Optional — must include {type, system}. type must match existing. See subtype system fields in tool description.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: RegionArgs) {
    this.logger.info('Executing region action', { action: args.action });
    switch (args.action) {
      case 'create':
        return this.handleCreate(args);
      case 'update':
        return this.handleUpdate(args);
      case 'delete':
        return this.handleDelete(args);
      case 'get':
        return this.handleGet(args);
      case 'list':
        return this.handleList(args);
      case 'createBehavior':
        return this.handleCreateBehavior(args);
      case 'updateBehavior':
        return this.handleUpdateBehavior(args);
      case 'deleteBehavior':
        return this.handleDeleteBehavior(args);
      case 'add-shape':
        return this.handleAddShape(args);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<RegionCreateResponse>('region', args);
      const text =
        `🗺️ **Region Created**\n\n${formatRegionView(data.region)}\n\n` +
        `_Requested fields: ${Object.keys(data.requestedChanges).filter((k) => k !== 'action' && k !== 'sceneId').join(', ') || '(name only)'}_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<RegionUpdateResponse>('region', args);
      const text =
        `✏️ **Region Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatRegionView(data.region)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<RegionDeleteResponse>('region', args);
      const text =
        `🗑️ **Region Deleted**\n\n**ID:** \`${data.deletedId}\`  **Scene:** \`${data.sceneId}\`\n**Remaining regions:** ${data.remainingRegions}\n\n⚠️ All embedded behaviors were also deleted.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<RegionGetResponse>('region', args);
      return { content: [{ type: 'text' as const, text: formatRegionView(data.region) }] };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<RegionListResponse>('region', args);

      if (data.countOnly) {
        const text = `🗺️ **Region count**\n\n**Total:** ${data.total}${data.filterApplied ? `\n**Filter:** \`${data.filterApplied}\`` : ''}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if (data.regions.length === 0) {
        return { content: [{ type: 'text' as const, text: '🗺️ **No Regions Found**' }] };
      }

      const pageInfo = `page ${data.page} · ${data.total} total`;
      const lines = data.regions.map(formatRegionListItem);
      const text = `🗺️ **Regions** (${pageInfo})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleCreateBehavior(args: ArgsFor<'createBehavior'>) {
    try {
      const data = await this.query<RegionBehaviorCreateResponse>('region', args);
      const text =
        `✅ **RegionBehavior Created**\n\n**Region:** \`${data.regionId}\`\n\n${formatBehavior(data.behavior)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('createBehavior', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateBehavior(args: ArgsFor<'updateBehavior'>) {
    try {
      const data = await this.query<RegionBehaviorUpdateResponse>('region', args);
      const text =
        `✏️ **RegionBehavior Updated**\n\n**Region:** \`${data.regionId}\`\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatBehavior(data.behavior)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('updateBehavior', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDeleteBehavior(args: ArgsFor<'deleteBehavior'>) {
    try {
      const data = await this.query<RegionBehaviorDeleteResponse>('region', args);
      const text =
        `🗑️ **RegionBehavior Deleted**\n\n**Region:** \`${data.regionId}\`\n**Deleted ID:** \`${data.deletedBehaviorId}\`\n**Remaining behaviors:** ${data.remainingBehaviors}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('deleteBehavior', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleAddShape(args: ArgsFor<'add-shape'>) {
    try {
      const data = await this.query<RegionAddShapeResponse>('region', args);
      const text =
        `➕ **Shape Added**\n\n**Shapes now:** ${data.shapeCount}\n\n${formatRegionView(data.region)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('add-shape', e instanceof Error ? e.message : String(e));
    }
  }
}
