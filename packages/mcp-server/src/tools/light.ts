// Phase 5 mcp_crud_expansion — AmbientLight umbrella tool (5 actions).
//
// Wraps the `light` Foundry-side handler (dispatchLight).
// Actions: create / update / delete / get / list.
// All operate on scene.lights (EmbeddedCollectionField of AmbientLightDocument).
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through this.errorResponse().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.

import { z } from 'zod';
import {
  LightToolInput,
  type LightViewModel,
  type LightListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type LightArgs = z.infer<typeof LightToolInput>;
type ArgsFor<A extends LightArgs['action']> = Extract<LightArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ───

interface LightCreateResponse {
  light: LightViewModel;
  requestedChanges: Record<string, unknown>;
}
interface LightUpdateResponse {
  light: LightViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface LightDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  remainingLights: number;
}
interface LightGetResponse {
  light: LightViewModel;
}
interface LightListBareResponse {
  lights: LightListItem[];
}
interface LightListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  lights: LightListItem[];
}
interface LightListCountResponse {
  total: number;
  filterApplied: boolean;
}
type LightListResponse = LightListBareResponse | LightListPaginatedResponse | LightListCountResponse;

// ── Utilities ────────────────────────────────────────────────────────────────


function formatLightView(l: LightViewModel): string {
  const cfg = l.config;
  return [
    `## AmbientLight \`${l.id}\``,
    `**Scene:** \`${l.sceneId}\``,
    ``,
    `### Position`,
    `- x: ${l.x}, y: ${l.y}, elevation: ${l.elevation}, rotation: ${l.rotation}°`,
    ``,
    `### Flags`,
    `- walls: ${l.walls ? 'on' : 'off'} · vision: ${l.vision ? 'on' : 'off'} · hidden: ${l.hidden ? 'yes' : 'no'} · isGlobal: ${l.isGlobal ? 'yes' : 'no'}`,
    ``,
    `### Light Config`,
    `- dim: ${cfg.dim}, bright: ${cfg.bright}, angle: ${cfg.angle}°`,
    `- color: ${cfg.color ?? '_(none)_'}, alpha: ${cfg.alpha}, coloration: ${cfg.coloration ?? '_(default)_'}`,
    `- luminosity: ${cfg.luminosity}, saturation: ${cfg.saturation}, contrast: ${cfg.contrast}, shadows: ${cfg.shadows}`,
    `- attenuation: ${cfg.attenuation}, priority: ${cfg.priority}, negative: ${cfg.negative ? 'yes' : 'no'}`,
    `- darkness threshold: min=${cfg.darkness?.min ?? 0}, max=${cfg.darkness?.max ?? 1}`,
    `- animation: type=${cfg.animation?.type ?? '_(none)_'}, speed=${cfg.animation?.speed ?? 5}, intensity=${cfg.animation?.intensity ?? 5}, reverse=${cfg.animation?.reverse ? 'yes' : 'no'}`,
  ].join('\n');
}

export function formatLightListItem(l: LightListItem): string {
  return (
    `- \`${l.id}\` @ scene \`${l.sceneId}\`` +
    ` · dim=${l.dim} bright=${l.bright}` +
    ` · isGlobal=${l.isGlobal ? 'yes' : 'no'}` +
    ` · hidden=${l.hidden ? 'yes' : 'no'}`
  );
}

export interface LightToolOptions extends BaseToolOptions { }

export class LightTool extends BaseTool {
  constructor(options: LightToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'light',
        title: 'Manage AmbientLights',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT AmbientLight documents via 5 actions (embedded-doc CRUD + list). Lights live on scenes (scene.lights collection).

**Actions:**
- **create**: Place a new AmbientLight on a scene. Required: sceneId, x, y. Optional: elevation, rotation, walls, vision, hidden, config (full LightData surface — dim/bright/color/angle/animation/darkness/etc), flags. Returns full LightViewModel.
- **update**: Partial-diff update. sceneId + lightId + changes (≥1 field). Same writable surface as create (config is nested SchemaField).
- **delete**: Permanently remove a single AmbientLight from the scene. ⚠️ Irreversible.
- **get**: Fetch a single light by sceneId + lightId. Returns full LightViewModel including config and isGlobal flag.
- **list**: List lights on a scene. sceneId optional (defaults to active scene). Filters: hidden (boolean), isGlobal (boolean), filter (substring on id/position). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.

**isGlobal:** AmbientLightDocument.isGlobal is a Foundry-computed boolean; true means the light illuminates the entire canvas regardless of radius.

**config fields (LightData):** dim, bright, angle, color, alpha, coloration, luminosity, saturation, contrast, shadows, attenuation, priority, negative, animation.{type,speed,intensity,reverse}, darkness.{min,max}.

**Examples:**
- create: {action:"create", sceneId:"abc", x:500, y:300, config:{bright:10, dim:20, color:"#ffaa00"}}
- update: {action:"update", sceneId:"abc", lightId:"xyz", changes:{hidden:true, config:{bright:5}}}
- delete: {action:"delete", sceneId:"abc", lightId:"xyz"}
- get: {action:"get", sceneId:"abc", lightId:"xyz"}
- list: {action:"list", sceneId:"abc", isGlobal:false, hidden:false}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list'],
              description: 'The light action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get] Required scene document ID. [list] Optional — defaults to active scene.',
            },
            lightId: {
              type: 'string',
              description: '[update/delete/get] AmbientLight document ID.',
            },
            // create writable fields (flat)
            x: { type: 'number', description: '[create] Required x-coordinate.' },
            y: { type: 'number', description: '[create] Required y-coordinate.' },
            elevation: { type: 'number', description: '[create/update.changes] Elevation value.' },
            rotation: { type: 'number', minimum: 0, maximum: 360, description: '[create/update.changes] Rotation 0-360°.' },
            walls: { type: 'boolean', description: '[create/update.changes] Whether light is blocked by walls.' },
            vision: { type: 'boolean', description: '[create/update.changes] Whether light grants vision.' },
            hidden: { type: 'boolean', description: '[create/update.changes] Hide the light from players.' },
            config: {
              type: 'object',
              description:
                '[create/update.changes] LightData sub-object. {dim?, bright?, angle?, color?, alpha?, coloration?, luminosity?, saturation?, contrast?, shadows?, attenuation?, priority?, negative?, animation?:{type?,speed?,intensity?,reverse?}, darkness?:{min?,max?}}',
            },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable AmbientLight fields. Must contain ≥1 field. Shape: elevation, rotation, walls, vision, hidden, config.*, flags.',
            },
            // list
            filter: { type: 'string', description: '[list] Substring match on id or x,y position string.' },
            isGlobal: { type: 'boolean', description: '[list] Filter by isGlobal flag.' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 20, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total, filterApplied} only.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: LightArgs) {
    this.logger.info('Executing light action', { action: args.action });
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
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<LightCreateResponse>('light', args);
      const text =
        `💡 **AmbientLight Created**\n\n${formatLightView(data.light)}\n\n` +
        `_Requested fields: ${Object.keys(data.requestedChanges).filter((k) => k !== 'action' && k !== 'sceneId').join(', ') || '(x/y only)'}_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<LightUpdateResponse>('light', args);
      const text =
        `✏️ **AmbientLight Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatLightView(data.light)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<LightDeleteResponse>('light', args);
      const text =
        `🗑️ **AmbientLight Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Remaining lights on scene:** ${data.remainingLights}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<LightGetResponse>('light', args);
      return { content: [{ type: 'text' as const, text: formatLightView(data.light) }] };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<LightListResponse>('light', args);

      if ('pageCount' in data) {
        const p = data as LightListPaginatedResponse;
        const lines = p.lights.map(formatLightListItem);
        const text = `💡 **AmbientLights** (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(none)_'}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if ('filterApplied' in data) {
        const c = data as LightListCountResponse;
        const text = `💡 **AmbientLight count**\n\n**Total:** ${c.total}${c.filterApplied ? '\n**Filter applied**' : ''}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      const bare = data as LightListBareResponse;
      if (bare.lights.length === 0) {
        return { content: [{ type: 'text' as const, text: '💡 **No AmbientLights Found**' }] };
      }
      const lines = bare.lights.map(formatLightListItem);
      const text = `💡 **AmbientLights** (${bare.lights.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }
}
