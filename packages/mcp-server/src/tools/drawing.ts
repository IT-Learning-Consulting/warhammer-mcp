// Phase 5 mcp_coverage_expansion — Drawing umbrella tool (6 actions).
//
// Wraps the `drawing` Foundry-side handler (dispatchDrawing).
// Actions: create / update / delete / get / list / duplicate.
// All operate on scene.drawings (EmbeddedCollectionField of DrawingDocument).
//
// **CCR-Envelope-Consumer / BUG-069:** every handler uses a concrete typed generic on
// `this.query<...>` — never `<any>`. The query returns BARE unwrapped data; never re-check
// a success field on the return value. Each handler wraps its call in try/catch → errorContent.
//
// shape is Foundry v13 flat ShapeData {type, width, height, radius, points}. type ∈
// {rectangle, circle, ellipse, polygon}. "Freehand" = polygon + bezierFactor>0; "text" is an
// overlay field on any drawing, not a shape type.

import { z } from 'zod';
import {
  DrawingToolInput,
  type DrawingViewModel,
  type DrawingListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type DrawingArgs = z.infer<typeof DrawingToolInput>;
type ArgsFor<A extends DrawingArgs['action']> = Extract<DrawingArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler data payloads) ──

interface DrawingCreateResponse {
  success: true;
  drawing: DrawingViewModel;
  requestedChanges: Record<string, unknown>;
}
interface DrawingUpdateResponse {
  success: true;
  drawing: DrawingViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface DrawingDeleteResponse {
  success: true;
  deletedId: string;
  sceneId: string;
  remainingDrawings: number;
}
interface DrawingGetResponse {
  success: true;
  drawing: DrawingViewModel;
}
interface DrawingListResponse {
  success: true;
  drawings?: DrawingListItem[];
  total?: number;
  page?: number;
  pageSize?: number;
  pageCount?: number;
  filterApplied?: boolean | string | null;
}
interface DrawingDuplicateResponse {
  success: true;
  drawing: DrawingViewModel;
  sourceId: string;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `**drawing/${action} failed**\n\n${message}` }],
    isError: true,
  };
}

function formatDrawingView(d: DrawingViewModel): string {
  return [
    `## Drawing \`${d.id}\``,
    `**Scene:** \`${d.sceneId}\``,
    ``,
    `### Shape`,
    `- type: ${d.shape.type}`,
    `- width: ${d.shape.width}, height: ${d.shape.height}, radius: ${d.shape.radius}` +
      (d.shape.points.length ? `, points: [${d.shape.points.join(', ')}]` : ''),
    `- bezierFactor: ${d.bezierFactor} (freehand smoothing for polygon shapes)`,
    ``,
    `### Position`,
    `- x: ${d.x}, y: ${d.y}, rotation: ${d.rotation}°, elevation: ${d.elevation}, sort: ${d.sort}`,
    ``,
    `### Style`,
    `- fill: type ${d.fillType} · ${d.fillColor} @ alpha ${d.fillAlpha}`,
    `- stroke: ${d.strokeColor} @ alpha ${d.strokeAlpha} · width ${d.strokeWidth}`,
    `- texture: ${d.texture ? `\`${d.texture}\`` : '_(none)_'}`,
    ``,
    `### Text`,
    `- text: ${d.text ? `"${d.text}"` : '_(none)_'}`,
    `- font: ${d.fontFamily} ${d.fontSize}px · ${d.textColor} @ alpha ${d.textAlpha}`,
    ``,
    `### State`,
    `- hidden: ${d.hidden ? 'yes' : 'no'} · locked: ${d.locked ? 'yes' : 'no'} · interface-layer: ${d.interface ? 'yes' : 'no'}`,
    // BUG-361: render the flag bag (incl. flags['advanced-drawing-tools']) so ADT fields
    // (invisible, lineStyle.dash, textStyle.arc, fontWeight, …) are verifiable on readback,
    // not write-only. The structured ViewModel already carries them; this surfaces them in text.
    ...(d.flags && Object.keys(d.flags).length > 0
      ? [``, `### Flags`, '```json', JSON.stringify(d.flags, null, 2), '```']
      : []),
  ].join('\n');
}

function formatDrawingListItem(d: DrawingListItem): string {
  return (
    `- \`${d.id}\` @ scene \`${d.sceneId}\` · ${d.shapeType}` +
    (d.text ? ` · "${d.text}"` : '') +
    (d.hidden ? ' · _hidden_' : '') +
    (d.locked ? ' · _locked_' : '')
  );
}

export interface DrawingToolOptions extends BaseToolOptions {}

export class DrawingTool extends BaseTool {
  constructor(options: DrawingToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'drawing',
        title: 'Manage Drawings',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT DrawingDocument objects via 6 actions (embedded-doc CRUD + list + duplicate). Drawings live on scenes (scene.drawings collection) — rectangles, ellipses, polygons, and text annotations a GM marks on the canvas.

**Actions:**
- **create**: Place a new drawing on a scene. Required: sceneId, x, y, shape. Optional: bezierFactor, text, font fields, fill/stroke/text colours + alphas, fillType, strokeWidth, texture, rotation, elevation, sort, hidden, locked, interface, flags. Returns full DrawingViewModel.
- **update**: Partial-diff update. sceneId + drawingId + changes (≥1 field). Same writable surface as create (x/y/shape optional here).
- **delete**: Permanently remove a single drawing from the scene. ⚠️ Irreversible.
- **get**: Fetch a single drawing by sceneId + drawingId. Returns full DrawingViewModel.
- **list**: List drawings on a scene. sceneId optional (defaults to active scene). Filters: hidden, locked, shapeType. Pagination: page/pageSize (1-100). countOnly=true for a cheap inventory probe.
- **duplicate**: Clone a drawing within the same scene (id re-keyed, author reset to caller). Returns the new DrawingViewModel + sourceId.

**shape (flat ShapeData):** {type, width?, height?, radius?, points?}. type ∈ rectangle | circle | ellipse | polygon. rectangle/ellipse use width+height; circle uses width/radius; polygon uses points (flat [x1,y1,x2,y2,...], ≥3 points). "Freehand" is type:"polygon" with bezierFactor>0 — there is no freehand/text shape type.

**Colours** (fillColor, strokeColor, textColor) must be 6-digit hex like #ff0000. **texture** is a file path — pass null to clear (never "").

**advancedDrawing (advanced-drawing-tools delegate, optional):** when the advanced-drawing-tools module is active, pass an \`advancedDrawing\` block on create (top-level) or update (inside \`changes\`) to set its 34 server-authorable flags: \`invisible\`; \`lineStyle.dash\` ([dashLen,gapLen] to enable, null for solid — NEVER pass dashEnabled); \`fillStyle.texture.{width,height}\` + \`fillStyle.transform.*\` (only render when fillType=2 PATTERN + a texture is set); \`textStyle.*\` (arc -360..360, gradient fill[] — note fill[0] is the SECOND gradient stop, textColor is first — stroke, dropShadow*, fontWeight/Style/Variant, spacing, align). FAIL-OPEN: if advanced-drawing-tools is inactive the block is silently ignored and the core drawing still writes (no error).

**Examples:**
- create: {action:"create", sceneId:"abc", x:100, y:100, shape:{type:"rectangle", width:200, height:120}, strokeColor:"#ff0000", text:"Hazard"}
- create polygon: {action:"create", sceneId:"abc", x:0, y:0, shape:{type:"polygon", points:[0,0,100,0,50,80]}}
- update: {action:"update", sceneId:"abc", drawingId:"xyz", changes:{hidden:true, fillColor:"#00ff00", fillType:1}}
- delete: {action:"delete", sceneId:"abc", drawingId:"xyz"}
- get:    {action:"get", sceneId:"abc", drawingId:"xyz"}
- list:   {action:"list", sceneId:"abc", shapeType:"polygon"}
- duplicate: {action:"duplicate", sceneId:"abc", drawingId:"xyz"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list', 'duplicate'],
              description: 'The drawing action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get/duplicate] Required scene document ID. [list] Optional — defaults to active scene.',
            },
            drawingId: {
              type: 'string',
              description: '[update/delete/get/duplicate] DrawingDocument ID.',
            },
            // create required fields
            x: { type: 'number', description: '[create] Required x-coordinate. [update.changes] optional.' },
            y: { type: 'number', description: '[create] Required y-coordinate. [update.changes] optional.' },
            shape: {
              type: 'object',
              description:
                '[create] Required flat ShapeData {type: rectangle|circle|ellipse|polygon, width?, height?, radius?, points?}. [update.changes] optional.',
            },
            // create/update writable fields
            bezierFactor: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Freehand smoothing 0-1 for polygon shapes.' },
            text: { type: 'string', description: '[create/update.changes] Overlay text (independent of shape type).' },
            fontFamily: { type: 'string', description: '[create/update.changes] Font family for text.' },
            fontSize: { type: 'number', description: '[create/update.changes] Font size (positive).' },
            textColor: { type: 'string', description: '[create/update.changes] 6-digit hex like #ffffff.' },
            textAlpha: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Text opacity 0-1.' },
            fillType: { type: 'integer', minimum: 0, maximum: 2, description: '[create/update.changes] 0=NONE, 1=SOLID, 2=PATTERN.' },
            fillColor: { type: 'string', description: '[create/update.changes] 6-digit hex fill colour.' },
            fillAlpha: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Fill opacity 0-1.' },
            strokeWidth: { type: 'number', minimum: 0, description: '[create/update.changes] Stroke width in pixels.' },
            strokeColor: { type: 'string', description: '[create/update.changes] 6-digit hex stroke colour.' },
            strokeAlpha: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Stroke opacity 0-1.' },
            texture: { type: ['string', 'null'], description: '[create/update.changes] Pattern-fill texture file path; null clears.' },
            rotation: { type: 'number', minimum: 0, maximum: 360, description: '[create/update.changes] Rotation 0-360°.' },
            elevation: { type: 'number', description: '[create/update.changes] Canvas elevation.' },
            sort: { type: 'integer', description: '[create/update.changes] z-index sort order.' },
            hidden: { type: 'boolean', description: '[create/update.changes] Hide from players. [list] Filter by hidden state.' },
            locked: { type: 'boolean', description: '[create/update.changes] Lock against interaction. [list] Filter by locked state.' },
            interface: { type: 'boolean', description: '[create/update.changes] Render on the interface layer (above the scene).' },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            advancedDrawing: {
              type: 'object',
              description:
                '[create/update.changes] advanced-drawing-tools delegate (optional). Sets flags.advanced-drawing-tools.* — {invisible?, lineStyle:{dash:[n,n]|null}, fillStyle:{texture, transform}, textStyle:{arc, fill[], stroke, dropShadow*, fontWeight, align, ...}}. Fail-open: ignored if the module is inactive. Never write lineStyle.dashEnabled.',
            },
            // update
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable DrawingDocument fields. Must contain ≥1 field.',
            },
            // list filters
            shapeType: {
              type: 'string',
              enum: ['rectangle', 'circle', 'ellipse', 'polygon'],
              description: '[list] Filter by shape type.',
            },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 50, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total} count only.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: DrawingArgs) {
    this.logger.info('Executing drawing action', { action: args.action });
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
      case 'duplicate':
        return this.handleDuplicate(args);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule) ──────────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<DrawingCreateResponse>('drawing', args);
      const text = `**Drawing Created**\n\n${formatDrawingView(data.drawing)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<DrawingUpdateResponse>('drawing', args);
      const text =
        `**Drawing Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatDrawingView(data.drawing)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<DrawingDeleteResponse>('drawing', args);
      const text =
        `**Drawing Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Scene:** \`${data.sceneId}\`\n**Remaining drawings:** ${data.remainingDrawings}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<DrawingGetResponse>('drawing', args);
      return { content: [{ type: 'text' as const, text: formatDrawingView(data.drawing) }] };
    } catch (e) {
      return errorContent('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<DrawingListResponse>('drawing', args);

      // countOnly path: factory returns {total, filterApplied} with no drawings array.
      if (data.drawings === undefined) {
        const text = `**Drawing count**\n\n**Total:** ${data.total ?? 0}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if (data.drawings.length === 0) {
        return { content: [{ type: 'text' as const, text: '**No Drawings Found**' }] };
      }

      const lines = data.drawings.map(formatDrawingListItem);
      const total = data.total ?? data.drawings.length;
      const pageInfo = data.page !== undefined ? ` (page ${data.page}, ${total} total)` : ` (${total})`;
      const text = `**Drawings**${pageInfo}\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDuplicate(args: ArgsFor<'duplicate'>) {
    try {
      const data = await this.query<DrawingDuplicateResponse>('drawing', args);
      const text =
        `**Drawing Duplicated**\n\n**Source:** \`${data.sourceId}\` → **New:** \`${data.drawing.id}\`\n\n${formatDrawingView(data.drawing)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('duplicate', e instanceof Error ? e.message : String(e));
    }
  }
}
