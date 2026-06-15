// Phase 5 mcp_crud_expansion — MeasuredTemplate umbrella tool (5 actions).
//
// Wraps the `template` Foundry-side handler (dispatchTemplate).
// Actions: create / update / delete / get / list.
// All operate on scene.templates (EmbeddedCollectionField of MeasuredTemplateDocument).
//
// **GM-only scope:** MeasuredTemplate has NO author-or-GM exemption in Phase 5.
// All write actions (create/update/delete) require GM access. Non-GM callers will
// receive a clear refusal from the Foundry-side handler. This is documented in the
// tool description below so callers know in advance.
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through this.errorResponse().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.

import { z } from 'zod';
import {
  TemplateToolInput,
  type TemplateViewModel,
  type TemplateListItem,
  SceneId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type TemplateArgs = z.infer<typeof TemplateToolInput>;
type ArgsFor<A extends TemplateArgs['action']> = Extract<TemplateArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ───

interface TemplateCreateResponse {
  template: TemplateViewModel;
  requestedChanges: Record<string, unknown>;
}
interface TemplateUpdateResponse {
  template: TemplateViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface TemplateDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  sceneId: SceneId;
  remainingTemplates: number;
}
interface TemplateGetResponse {
  template: TemplateViewModel;
}
interface TemplateDuplicateResponse {
  template: TemplateViewModel;
  sourceId: string; // not a branded id (polymorphic / non-document)
}
interface TemplateListResponse {
  templates: TemplateListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly: boolean;
}

// ── Utilities ────────────────────────────────────────────────────────────────


function formatTemplateView(t: TemplateViewModel): string {
  return [
    `## MeasuredTemplate \`${t.id}\``,
    `**Scene:** \`${t.sceneId}\``,
    ``,
    `### Shape`,
    `- type: ${t.t} · distance: ${t.distance} · direction: ${t.direction}° · angle: ${t.angle}° · width: ${t.width}`,
    ``,
    `### Position`,
    `- x: ${t.x}, y: ${t.y}, elevation: ${t.elevation}, sort: ${t.sort}`,
    ``,
    `### Display`,
    `- borderColor: ${t.borderColor} · fillColor: ${t.fillColor} · texture: ${t.texture ?? '_(none)_'}`,
    `- hidden: ${t.hidden ? 'yes' : 'no'}`,
    ``,
    `### Author`,
    `- userId: \`${t.author}\``,
  ].join('\n');
}

function formatTemplateListItem(t: TemplateListItem): string {
  return (
    `- \`${t.id}\` @ scene \`${t.sceneId}\`` +
    ` · type=${t.t} dist=${t.distance}` +
    ` · author=\`${t.author}\`` +
    (t.hidden ? ' · _hidden_' : '')
  );
}

export interface TemplateToolOptions extends BaseToolOptions {}

export class TemplateTool extends BaseTool {
  constructor(options: TemplateToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'template',
        title: 'Manage MeasuredTemplates',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT MeasuredTemplate documents via 6 actions (embedded-doc CRUD + list + Phase 9C duplicate). Templates live on scenes (scene.templates collection).

**GM-only:** All write actions (create/update/delete) require GM access. Non-GM callers are refused by the Foundry-side handler. Read actions (get/list) are unrestricted.

**Actions:**
- **create**: Place a new MeasuredTemplate on a scene. Required: sceneId, x, y. Optional: t (circle/cone/rect/ray), distance, direction, angle, width, borderColor, fillColor, texture, hidden, elevation, sort, flags. Returns full TemplateViewModel.
- **update**: Partial-diff update. sceneId + templateId + changes (≥1 field). Same writable surface as create.
- **delete**: Permanently remove a single MeasuredTemplate from the scene. ⚠️ Irreversible.
- **get**: Fetch a single template by sceneId + templateId. Returns full TemplateViewModel including author (read-only user id).
- **list**: List templates on a scene. sceneId optional (defaults to active scene). Filters: hidden (boolean), filter (substring on type). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.
- **duplicate** (Phase 9C): Copy a MeasuredTemplate (toObject minus _id → create). Required: sceneId, templateId. Returns the new template + sourceId.

**Template types (t):** circle | cone | rect | ray — note "rect" not "rectangle".

**author:** Auto-set by Foundry; read-only in all responses; excluded from write surface.

**texture:** Bare FilePathField (string or null) — not a TextureData sub-object.

**Examples:**
- create: {action:"create", sceneId:"abc", x:500, y:300, t:"circle", distance:10, fillColor:"#ff0000"}
- update: {action:"update", sceneId:"abc", templateId:"xyz", changes:{hidden:true, distance:20}}
- delete: {action:"delete", sceneId:"abc", templateId:"xyz"}
- get: {action:"get", sceneId:"abc", templateId:"xyz"}
- list: {action:"list", sceneId:"abc", hidden:false}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list', 'duplicate'],
              description: 'The template action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get/duplicate] Required scene document ID. [list] Optional — defaults to active scene.',
            },
            templateId: {
              type: 'string',
              description: '[update/delete/get/duplicate] MeasuredTemplate document ID.',
            },
            // create writable fields
            x: { type: 'number', description: '[create] Required x-coordinate.' },
            y: { type: 'number', description: '[create] Required y-coordinate.' },
            t: {
              type: 'string',
              enum: ['circle', 'cone', 'rect', 'ray'],
              description: '[create/update.changes] Template shape type (CONST.MEASURED_TEMPLATE_TYPES).',
            },
            distance: { type: 'number', description: '[create/update.changes] Template radius / length.' },
            direction: { type: 'number', minimum: 0, maximum: 360, description: '[create/update.changes] Direction angle 0-360°.' },
            angle: { type: 'number', minimum: 0, maximum: 360, description: '[create/update.changes] Cone/ray angle 0-360°.' },
            width: { type: 'number', description: '[create/update.changes] Width (ray templates).' },
            borderColor: { type: 'string', description: '[create/update.changes] Border color hex string.' },
            fillColor: { type: 'string', description: '[create/update.changes] Fill color hex string — 6-char hex only, e.g. "#ff0000" (alpha not supported by F09 schema constraint).' },
            texture: { type: ['string', 'null'], description: '[create/update.changes] Texture file path or null.' },
            hidden: { type: 'boolean', description: '[create/update.changes] Hide the template from players.' },
            elevation: { type: 'number', description: '[create/update.changes] Elevation value.' },
            sort: { type: 'integer', description: '[create/update.changes] Render sort order.' },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable MeasuredTemplate fields. Must contain ≥1 field. Shape: t, x, y, elevation, sort, distance, direction, angle, width, borderColor, fillColor, texture, hidden, flags.',
            },
            // list
            filter: { type: 'string', description: '[list] Substring match on template type (t).' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 20, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total} only.' }, // BUG-327: was incorrectly {total, countOnly}
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: TemplateArgs) {
    this.logger.info('Executing template action', { action: args.action });
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

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleDuplicate(args: ArgsFor<'duplicate'>) {
    try {
      const data = await this.query<TemplateDuplicateResponse>('template', args);
      const text = `🧬 **MeasuredTemplate Duplicated**\n\n_From \`${data.sourceId}\`_\n\n${formatTemplateView(data.template)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('duplicate', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<TemplateCreateResponse>('template', args);
      const text =
        `📐 **MeasuredTemplate Created**\n\n${formatTemplateView(data.template)}\n\n` +
        `_Requested fields: ${Object.keys(data.requestedChanges).filter((k) => k !== 'action' && k !== 'sceneId').join(', ') || '(x/y only)'}_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<TemplateUpdateResponse>('template', args);
      const text =
        `✏️ **MeasuredTemplate Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatTemplateView(data.template)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<TemplateDeleteResponse>('template', args);
      const text =
        `🗑️ **MeasuredTemplate Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Scene:** \`${data.sceneId}\`\n**Remaining templates on scene:** ${data.remainingTemplates}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<TemplateGetResponse>('template', args);
      return { content: [{ type: 'text' as const, text: formatTemplateView(data.template) }] };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<TemplateListResponse>('template', args);

      if (data.countOnly) {
        const text = `📐 **MeasuredTemplate count**\n\n**Total:** ${data.total}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if (data.templates.length === 0) {
        return { content: [{ type: 'text' as const, text: '📐 **No MeasuredTemplates Found**' }] };
      }

      const pageCount = Math.ceil(data.total / data.pageSize);
      const lines = data.templates.map(formatTemplateListItem);
      const text = `📐 **MeasuredTemplates** (page ${data.page} of ${pageCount}, ${data.total} total)\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }
}
