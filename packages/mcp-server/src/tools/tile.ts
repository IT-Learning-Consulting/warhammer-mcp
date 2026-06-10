// Phase 5 mcp_crud_expansion — Tile umbrella tool (5 actions).
//
// Wraps the `tile` Foundry-side handler (dispatchTile).
// Actions: create / update / delete / get / list.
// All operate on scene.tiles (EmbeddedCollectionField of TileDocument).
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through errorContent().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.
//
// **B3 — video.volume silent-overwrite trap:** Foundry's AlphaField initialises
// volume to 0. The handler guards via deepStripUndefined, but callers updating
// a tile's `video` config MUST include `video.volume` explicitly to preserve the
// existing value — omitting it is safe at the transport layer but signals intent.

import { z } from 'zod';
import {
  TileToolInput,
  type TileViewModel,
  type TileListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type TileArgs = z.infer<typeof TileToolInput>;
type ArgsFor<A extends TileArgs['action']> = Extract<TileArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler data payloads) ──

// BUG-326: removed `success: true` — BaseTool.query<T>() returns bare unwrapped data;
// the success field never exists on the unwrapped object.
interface TileCreateResponse {
  tile: TileViewModel;
  requestedChanges: Record<string, unknown>;
}
interface TileUpdateResponse {
  tile: TileViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface TileDeleteResponse {
  deletedId: string;
  sceneId: string;
}
interface TileGetResponse {
  tile: TileViewModel;
}
interface TileListResponse {
  tiles: TileListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly?: boolean;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `❌ **tile/${action} failed**\n\n${message}` }],
    isError: true,
  };
}

function formatTileView(t: TileViewModel): string {
  return [
    `## Tile \`${t.id}\``,
    `**Scene:** \`${t.sceneId}\``,
    ``,
    `### Geometry`,
    `- x: ${t.x}, y: ${t.y}, width: ${t.width}, height: ${t.height}`,
    `- elevation: ${t.elevation}, sort: ${t.sort}, rotation: ${t.rotation}°, alpha: ${t.alpha}`,
    ``,
    `### Flags`,
    `- hidden: ${t.hidden ? 'yes' : 'no'} · locked: ${t.locked ? 'yes' : 'no'}`,
    ``,
    `### Texture`,
    `- src: ${t.texture.src ? `\`${t.texture.src}\`` : '_(none)_'}`,
    `  - anchor: (${t.texture.anchorX}, ${t.texture.anchorY}), offset: (${t.texture.offsetX}, ${t.texture.offsetY})`,
    `  - scale: (${t.texture.scaleX}, ${t.texture.scaleY}), rotation: ${t.texture.rotation}°, tint: ${t.texture.tint}, fit: ${t.texture.fit}`,
    ``,
    `### Occlusion`,
    `- mode: ${t.occlusion.mode} · alpha: ${t.occlusion.alpha}`,
    `  (modes: 0=NONE, 1=FADE, 3=RADIAL, 4=VISION — gap at 2)`,
    ``,
    `### Video`,
    `- loop: ${t.video.loop ? 'yes' : 'no'} · autoplay: ${t.video.autoplay ? 'yes' : 'no'} · volume: ${t.video.volume}`,
    `  ⚠️ B3: when updating \`video\`, include \`video.volume\` explicitly to preserve its value.`,
    ``,
    `### Restrictions`,
    `- light: ${t.restrictions.light ? 'blocked' : 'pass'} · weather: ${t.restrictions.weather ? 'blocked' : 'pass'}`,
  ].join('\n');
}

function formatTileListItem(t: TileListItem): string {
  return (
    `- \`${t.id}\` @ scene \`${t.sceneId}\`` +
    (t.src ? ` · \`${t.src}\`` : ' · _(no texture)_') +
    (t.overhead ? ' · **overhead**' : '') +
    (t.hidden ? ' · _hidden_' : '')
  );
}

export interface TileToolOptions extends BaseToolOptions {}

export class TileTool extends BaseTool {
  constructor(options: TileToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'tile',
        title: 'Manage Tiles',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT TileDocument objects via 5 actions (embedded-doc CRUD + list). Tiles live on scenes (scene.tiles collection).

**Actions:**
- **create**: Place a new tile on a scene. Required: sceneId, width, height. Optional: x, y, elevation, sort, rotation, alpha, hidden, locked, texture (TextureData), restrictions, occlusion, video, flags. Returns full TileViewModel.
- **update**: Partial-diff update. sceneId + tileId + changes (≥1 field). Same writable surface as create.
- **delete**: Permanently remove a single tile from the scene. ⚠️ Irreversible.
- **get**: Fetch a single tile by sceneId + tileId. Returns full TileViewModel.
- **list**: List tiles on a scene. sceneId optional (defaults to active scene). Filters: hidden, locked, overheadOnly (elevation>0 or occlusion.mode=4), filter (substring on texture src). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.

**B3 — video.volume silent-overwrite trap:** Foundry's AlphaField initialises video.volume to 0. When passing a partial \`video\` object in create or update, always include \`video.volume\` explicitly; omitting it from a partial update is safe (the handler strips undefined via deepStripUndefined) but including it makes intent unambiguous.

**occlusion.mode values:** 0=NONE, 1=FADE, 3=RADIAL, 4=VISION (gap at 2). Tiles with elevation>0 or mode=4 are treated as overhead tiles.

**texture fields (TextureData):** src, anchorX, anchorY, offsetX, offsetY, fit, scaleX, scaleY, rotation, tint, alphaThreshold.

**Examples:**
- create: {action:"create", sceneId:"abc", width:200, height:200, texture:{src:"modules/foo/tile.webp"}}
- update: {action:"update", sceneId:"abc", tileId:"xyz", changes:{hidden:true, video:{loop:false, volume:0.5}}}
- delete: {action:"delete", sceneId:"abc", tileId:"xyz"}
- get:    {action:"get", sceneId:"abc", tileId:"xyz"}
- list:   {action:"list", sceneId:"abc", overheadOnly:true}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list'],
              description: 'The tile action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get] Required scene document ID. [list] Optional — defaults to active scene.',
            },
            tileId: {
              type: 'string',
              description: '[update/delete/get] TileDocument ID.',
            },
            // create required fields
            width: { type: 'number', description: '[create] Required tile width in pixels (positive).' },
            height: { type: 'number', description: '[create] Required tile height in pixels (positive).' },
            // create/update writable fields
            x: { type: 'number', description: '[create/update.changes] x-coordinate.' },
            y: { type: 'number', description: '[create/update.changes] y-coordinate.' },
            elevation: { type: 'number', description: '[create/update.changes] Elevation value.' },
            sort: { type: 'integer', description: '[create/update.changes] Sort order integer.' },
            rotation: { type: 'number', minimum: 0, maximum: 360, description: '[create/update.changes] Rotation 0-360°.' },
            alpha: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Opacity 0-1.' },
            hidden: { type: 'boolean', description: '[create/update.changes] Hide the tile from players.' },
            locked: { type: 'boolean', description: '[create/update.changes] Lock the tile against player interaction. [list] Filter by locked state.' },
            texture: {
              type: 'object',
              description:
                '[create/update.changes] TextureData sub-object. {src?, anchorX?, anchorY?, offsetX?, offsetY?, fit?, scaleX?, scaleY?, rotation?, tint?, alphaThreshold?}',
            },
            restrictions: {
              type: 'object',
              description: '[create/update.changes] {light?: boolean, weather?: boolean} — block light/weather penetration.',
            },
            occlusion: {
              type: 'object',
              description:
                '[create/update.changes] {mode?: 0|1|3|4, alpha?: 0-1} — mode: 0=NONE, 1=FADE, 3=RADIAL, 4=VISION.',
            },
            video: {
              type: 'object',
              description:
                '[create/update.changes] {loop?: boolean, autoplay?: boolean, volume?: 0-1}. ⚠️ B3: include volume explicitly when updating video to avoid ambiguity.',
            },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable TileDocument fields. Must contain ≥1 field.',
            },
            // list filters
            filter: { type: 'string', description: '[list] Substring match on texture src path.' },
            overheadOnly: { type: 'boolean', description: '[list] Return only overhead tiles (elevation>0 or occlusion.mode=4).' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 50, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total} count only.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: TileArgs) {
    this.logger.info('Executing tile action', { action: args.action });
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
      const data = await this.query<TileCreateResponse>('tile', args);
      const changedKeys = Object.keys(data.requestedChanges)
        .filter((k) => k !== 'action' && k !== 'sceneId')
        .join(', ') || '(width/height only)';
      const text =
        `🟩 **Tile Created**\n\n${formatTileView(data.tile)}\n\n` +
        `_Requested fields: ${changedKeys}_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<TileUpdateResponse>('tile', args);
      const text =
        `✏️ **Tile Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatTileView(data.tile)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<TileDeleteResponse>('tile', args);
      const text =
        `🗑️ **Tile Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Scene:** \`${data.sceneId}\`\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<TileGetResponse>('tile', args);
      return { content: [{ type: 'text' as const, text: formatTileView(data.tile) }] };
    } catch (e) {
      return errorContent('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<TileListResponse>('tile', args);

      if (data.countOnly) {
        const text = `🟩 **Tile count**\n\n**Total:** ${data.total}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if (data.tiles.length === 0) {
        return { content: [{ type: 'text' as const, text: '🟩 **No Tiles Found**' }] };
      }

      const lines = data.tiles.map(formatTileListItem);
      const pageInfo = data.total > data.pageSize
        ? ` (page ${data.page}, ${data.total} total)`
        : ` (${data.total})`;
      const text = `🟩 **Tiles**${pageInfo}\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('list', e instanceof Error ? e.message : String(e));
    }
  }
}
