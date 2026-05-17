// Phase 4 mcp_crud_expansion — Scene umbrella tool (9 actions).
// Phase 5: add-tokens / delete-token migrated to the dedicated `token` umbrella.
//
// `get-world-info` is extracted to its own `world` tool (see tools/world.ts) —
// it was mis-bucketed here historically. `switch-scene` is replaced by the pair
// {activate, view} (per Foundry's split: Scene.activate sets world-active + GM
// camera; Scene.view is per-user camera).
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through errorResponse().
//
// **CCR-Schema-Fidelity:** input field paths mirror the shared Zod schemas in
// `@foundry-mcp/shared/scene` 1:1, which mirror Foundry's live BaseScene
// defineSchema 1:1 (verified Phase 0 probe, 2026-05-14).
//
// **DP-19 formatter completeness:** the get/list formatters surface every
// §6.2 PRD field — Basics, Grid, Lighting, Ambience, plus the EXPANDED scope
// (TextureData sub-fields, environment day/night cycle, fog colors).

import { z } from 'zod';
import {
  SceneToolInput,
  type SceneCreateResponse,
  type SceneUpdateResponse,
  type SceneDeleteResponse,
  type SceneCloneResponse,
  type SceneActivateResponse,
  type SceneViewResponse,
  type SceneThumbnailResponse,
  type SceneGetResponse,
  type SceneListResponse,
  type SceneViewModel,
  type SceneTokenView,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type SceneArgs = z.infer<typeof SceneToolInput>;
type ArgsFor<A extends SceneArgs['action']> = Extract<SceneArgs, { action: A }>;

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `❌ **scene/${action} failed**\n\n${message}` }],
    isError: true,
  };
}

function fmtFK(linked: boolean, raw: string | null): string {
  if (!raw) return '_(none)_';
  return linked ? `\`${raw}\`` : `\`${raw}\` ⚠️ _(stale FK — linked doc no longer exists)_`;
}

// DP-19: every §6.2 field surfaced. ~30 fields → ~35 lines markdown.
function formatSceneView(s: SceneViewModel): string {
  return [
    `## ${s.name}${s.active ? ' _(active)_' : ''}`,
    `**ID:** \`${s.id}\``,
    ``,
    `### Basics`,
    `- Navigation: ${s.navigation ? 'on' : 'off'}${s.navName ? ` (label: "${s.navName}")` : ''}`,
    `- Background: ${s.background.src ? `\`${s.background.src}\`` : '_(none)_'}`,
    `  - anchor: (${s.background.anchorX}, ${s.background.anchorY}), offset: (${s.background.offsetX}, ${s.background.offsetY})`,
    `  - fit: ${s.background.fit}, scale: (${s.background.scaleX}, ${s.background.scaleY}), rotation: ${s.background.rotation}°`,
    `  - tint: ${s.background.tint}, alphaThreshold: ${s.background.alphaThreshold}`,
    `- Foreground: ${s.foreground ? `\`${s.foreground}\`` : '_(none)_'}, foregroundElevation: ${s.foregroundElevation ?? '_(default)_'}`,
    `- Thumbnail: ${s.thumb ? `\`${s.thumb}\`` : '_(auto-generated)_'}`,
    `- Background color: ${s.backgroundColor}`,
    `- Dimensions: ${s.width ?? '_(auto)_'} × ${s.height ?? '_(auto)_'} (padding: ${s.padding})`,
    `- Initial view: x=${s.initial.x ?? '_(unset)_'}, y=${s.initial.y ?? '_(unset)_'}, scale=${s.initial.scale ?? '_(unset)_'}`,
    ``,
    `### Grid`,
    `- Type: ${s.grid.type} (${s.grid.typeName}), size: ${s.grid.size}px`,
    `- Distance: ${s.grid.distance} ${s.grid.units} per square`,
    `- Style: ${s.grid.style}, thickness: ${s.grid.thickness}`,
    `- Color: ${s.grid.color}, alpha: ${s.grid.alpha}`,
    ``,
    `### Lighting / Vision`,
    `- Token vision: ${s.tokenVision ? 'on' : 'off'}`,
    `- Fog: exploration=${s.fog.exploration ? 'on' : 'off'}, reset=${s.fog.reset ?? '_(unset)_'}, overlay=${s.fog.overlay ? `\`${s.fog.overlay}\`` : '_(none)_'}`,
    `  - Fog colors: explored=${s.fog.colors.explored ?? '_(default)_'}, unexplored=${s.fog.colors.unexplored ?? '_(default)_'}`,
    `- Darkness: level=${s.environment.darknessLevel}, lock=${s.environment.darknessLock ? 'on' : 'off'}, cycle=${s.environment.cycle ? 'on' : 'off'}`,
    `- Global light: enabled=${s.environment.globalLight.enabled ? 'on' : 'off'}, alpha=${s.environment.globalLight.alpha}, bright=${s.environment.globalLight.bright ? 'on' : 'off'}`,
    `  - color=${s.environment.globalLight.color ?? '_(default)_'}, coloration=${s.environment.globalLight.coloration ?? '_(default)_'}, luminosity=${s.environment.globalLight.luminosity}`,
    `  - saturation=${s.environment.globalLight.saturation}, contrast=${s.environment.globalLight.contrast}, shadows=${s.environment.globalLight.shadows}`,
    `  - darkness threshold: min=${s.environment.globalLight.darkness.min}, max=${s.environment.globalLight.darkness.max}`,
    ``,
    `### Ambience`,
    `- Journal: ${fmtFK(s.journalLinked, s.journal)}`,
    `- Journal page: ${fmtFK(s.journalEntryPageLinked, s.journalEntryPage)}`,
    `- Playlist: ${fmtFK(s.playlistLinked, s.playlist)}`,
    `- Playlist sound: ${fmtFK(s.playlistSoundLinked, s.playlistSound)}`,
    `- Weather: ${s.weather ? `"${s.weather}"` : '_(none)_'}`,
    ``,
    `### Organization`,
    `- Folder: ${fmtFK(s.folderLinked, s.folder)}, sort: ${s.sort}`,
    `- Ownership default: ${s.ownership.default}`,
    ``,
    `### Embedded collections (counts)`,
    `- Tokens: ${s.counts.tokens} · Walls: ${s.counts.walls} · Lights: ${s.counts.lights} · Sounds: ${s.counts.sounds}`,
    `- Notes: ${s.counts.notes} · Drawings: ${s.counts.drawings} · Regions: ${s.counts.regions} · Templates: ${s.counts.templates} · Tiles: ${s.counts.tiles}`,
  ].join('\n');
}

function formatTokensSummary(tokens: SceneTokenView[]): string {
  if (tokens.length === 0) return '_(no tokens placed)_';
  const lines = tokens.map(
    (t) =>
      `- **${t.name || '(unnamed)'}** \`${t.id}\` @ (${t.position.x}, ${t.position.y}) ` +
      `[${t.size.width}×${t.size.height}, ${t.disposition}${t.hidden ? ', hidden' : ''}]` +
      (t.actorId ? ` → actor \`${t.actorId}\`` : ' _(unlinked)_'),
  );
  return lines.join('\n');
}

export interface SceneToolOptions extends BaseToolOptions {}

export class SceneTool extends BaseTool {
  constructor(options: SceneToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'scene',
        title: 'Manage Scenes',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT Scenes via 9 actions (entity-level CRUD + activation + view + thumbnail + list). Token placement lives on the dedicated \`token\` umbrella.

**Actions:**
- **create**: Create a Scene. Required: name. Optional: full SceneConfig surface (background, grid, fog, environment, foreground, dimensions, padding, FK fields journal/playlist/folder, ownership, flags, navigation). Returns full SceneView. **Dimension auto-fit (BUG-080 fix):** when \`background.src\` is set and both \`width\` and \`height\` are omitted (or null), the handler probes the texture and sets scene dimensions to the image's natural width/height. Pass explicit \`width\`/\`height\` to override.
- **update**: Partial-diff update. sceneId + changes (≥1 field). Same writable surface as create; name optional.
- **delete**: Permanently delete a Scene + all embedded tokens/walls/lights/notes/regions/sounds/drawings/templates/tiles. ⚠️ Irreversible.
- **clone**: Duplicate a Scene with newName + optional overrides. Single-step persist.
- **activate**: Make the scene world-active (Scene.activate). Sets active=true + switches GM camera. Use **view** for per-user camera only. Phase 6.3 BUG-081 full fix: handler now awaits any in-flight \`<embedded>.create\` writes on the same scene (via transaction-manager.awaitPendingWritesForScene) before triggering activation — parallel create+activate batches are safe.
- **view**: Switch the LOCAL user's canvas to the scene. Does NOT change world-active state.
- **thumbnail**: Regenerate scene thumbnail via createThumbnail({width, height, format, quality}). All four optional (defaults: 300×100 webp @ 0.8).
- **get**: Fetch a single scene (defaults to active when sceneId omitted). includeTokens=true adds token list; includeHidden=true includes hidden tokens.
- **list**: List world scenes. filter=substring (case-insensitive), include_active_only=true, page/pageSize (1-100), countOnly=true for cheap inventory probe.

**FK fields:** journal, journalEntryPage, playlist, playlistSound, folder are ForeignDocumentFields that Foundry does NOT auto-NULL on referent delete. get's formatter flags stale FKs via \`journalLinked: false\`.

**Grid type enum** (CONST.GRID_TYPES): 0=GRIDLESS, 1=SQUARE, 2=HEXODDR, 3=HEXEVENR, 4=HEXODDQ, 5=HEXEVENQ.

**Examples:**
- create: {action:"create", name:"Red Moon Inn", background:{src:"worlds/aitww/maps/tavern.webp"}, grid:{type:1, size:100, distance:5, units:"yds"}, journal:"abc123"}
- update: {action:"update", sceneId:"xyz", changes:{name:"Renamed", environment:{darknessLevel:0.8}}}
- clone: {action:"clone", sceneId:"xyz", newName:"Variation B"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create',
                'update',
                'delete',
                'clone',
                'activate',
                'view',
                'thumbnail',
                'get',
                'list',
              ],
              description: 'The scene action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[update/delete/clone/activate/view/thumbnail/get] Scene document ID. Optional on get (defaults to active).',
            },
            name: {
              type: 'string',
              description: '[create] Required scene name. [update.changes] Optional rename target.',
            },
            newName: {
              type: 'string',
              description: '[clone] Required new name for the cloned scene.',
            },
            overrides: {
              type: 'object',
              description:
                '[clone] Optional partial-diff applied to the clone on top of the source. Same shape as update.changes.',
            },
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable Scene fields. Must contain at least one field. Whitelisted shape: name, active, navigation, navOrder, navName, background.*, foreground, foregroundElevation, thumb, width, height, padding, initial.*, backgroundColor, grid.*, tokenVision, fog.*, environment.*, journal, journalEntryPage, playlist, playlistSound, weather, folder, sort, ownership, flags.',
            },
            // Direct create fields — flat for convenience (matches Zod create schema).
            active: { type: 'boolean', description: '[create] Initial active state (defaults false).' },
            navigation: { type: 'boolean', description: '[create/update.changes] Show in navigation bar.' },
            navOrder: { type: 'number', description: '[create/update.changes] Navigation sort order.' },
            navName: { type: 'string', description: '[create/update.changes] Display name in navigation.' },
            background: {
              type: 'object',
              description:
                '[create/update.changes] TextureData. {src?:string|null, anchorX?, anchorY?, offsetX?, offsetY?, fit?, scaleX?, scaleY?, rotation?, tint?, alphaThreshold?}',
            },
            foreground: { type: ['string', 'null'], description: '[create/update.changes] Foreground image path. null clears.' },
            foregroundElevation: { type: ['number', 'null'], description: '[create/update.changes] Elevation of foreground layer.' },
            thumb: { type: ['string', 'null'], description: '[create/update.changes] Thumbnail path. null clears.' },
            width: { type: ['number', 'null'], description: '[create/update.changes] Scene width in pixels (null = auto from background).' },
            height: { type: ['number', 'null'], description: '[create/update.changes] Scene height in pixels (null = auto from background).' },
            padding: { type: 'number', description: '[create/update.changes] Padding fraction 0.0-0.5.' },
            initial: { type: 'object', description: '[create/update.changes] Initial view-position {x?:number|null, y?:number|null, scale?:number|null}.' },
            backgroundColor: { type: 'string', description: '[create/update.changes] Background color hex (#RRGGBB).' },
            grid: { type: 'object', description: '[create/update.changes] {type?: 0-5, size?: int>0, color?, alpha?: 0-1, distance?, units?}' },
            tokenVision: { type: 'boolean', description: '[create/update.changes] Whether tokens require line-of-sight.' },
            fog: { type: 'object', description: '[create/update.changes] {exploration?, reset?, overlay?, colors?:{explored?, unexplored?}}' },
            environment: {
              type: 'object',
              description:
                '[create/update.changes] {darknessLevel?: 0-1, darknessLock?, cycle?, globalLight?:{enabled?, alpha?, bright?, color?, coloration?, luminosity?, saturation?, contrast?, shadows?, darkness?:{min?,max?}}, base?:{hue,intensity,...}, dark?:{...}}',
            },
            journal: { type: ['string', 'null'], description: '[create/update.changes] FK → JournalEntry._id. null clears.' },
            journalEntryPage: { type: ['string', 'null'], description: '[create/update.changes] FK → JournalEntryPage._id. null clears.' },
            playlist: { type: ['string', 'null'], description: '[create/update.changes] FK → Playlist._id. null clears.' },
            playlistSound: { type: ['string', 'null'], description: '[create/update.changes] FK → PlaylistSound._id. null clears.' },
            weather: { type: 'string', description: '[create/update.changes] Weather effect ID. Use "" for none (non-nullable per live schema).' },
            folder: { type: ['string', 'null'], description: '[create/update.changes] FK → Folder._id. null clears.' },
            sort: { type: 'number', description: '[create/update.changes] Sort order within folder.' },
            ownership: {
              type: 'object',
              description:
                '[create/update.changes] Foundry DocumentOwnershipField: { default?: 0|1|2|3, "<userId>": 0|1|2|3 }. 0=NONE 1=LIMITED 2=OBSERVER 3=OWNER.',
            },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // get/list-specific
            includeTokens: { type: 'boolean', description: '[get] If true, include placed token list + summary.' },
            includeHidden: { type: 'boolean', description: '[get] If true, includeTokens also surfaces hidden tokens.' },
            filter: { type: 'string', description: '[list] Case-insensitive substring match on scene name.' },
            include_active_only: { type: 'boolean', description: '[list] Return only the world-active scene.' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number. Triggers paginated response shape.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 50, max 100).' },
            countOnly: { type: 'boolean', description: '[list] If true, return {total, filterApplied} only.' },
            // thumbnail
            quality: { type: 'number', minimum: 0, maximum: 1, description: '[thumbnail] JPEG/WebP quality 0-1 (default 0.8).' },
            format: { type: 'string', description: '[thumbnail] Image format (default "webp").' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: SceneArgs) {
    this.logger.info('Executing scene action', { action: args.action });
    switch (args.action) {
      case 'create':
        return this.handleCreate(args);
      case 'update':
        return this.handleUpdate(args);
      case 'delete':
        return this.handleDelete(args);
      case 'clone':
        return this.handleClone(args);
      case 'activate':
        return this.handleActivate(args);
      case 'view':
        return this.handleView(args);
      case 'thumbnail':
        return this.handleThumbnail(args);
      case 'get':
        return this.handleGet(args);
      case 'list':
        return this.handleList(args);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<SceneCreateResponse>('scene', args);
      const text = `🎬 **Scene Created**\n\n${formatSceneView(data.scene)}\n\n_Requested fields: ${
        Object.keys(data.requestedChanges).filter((k) => k !== 'action').join(', ') || '(name only)'
      }_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<SceneUpdateResponse>('scene', args);
      const text = `✏️ **Scene Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatSceneView(data.scene)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<SceneDeleteResponse>('scene', args);
      const text = `🗑️ **Scene Deleted**\n\n**Name:** ${data.deletedName}\n**ID:** \`${data.deletedId}\`\n**Remaining scenes:** ${data.remainingScenes}\n\n⚠️ Permanent. All embedded tokens/walls/lights/notes/regions/sounds/drawings/templates/tiles removed.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleClone(args: ArgsFor<'clone'>) {
    try {
      const data = await this.query<SceneCloneResponse>('scene', args);
      const text = `🪞 **Scene Cloned**\n\n**Source:** ${data.source.name} (\`${data.source.id}\`)\n\n${formatSceneView(data.clone)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('clone', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleActivate(args: ArgsFor<'activate'>) {
    try {
      const data = await this.query<SceneActivateResponse>('scene', args);
      const text = `▶️ **Scene Activated**\n\n**Name:** ${data.activatedName}\n**ID:** \`${data.activatedId}\`\n${
        data.previousActiveId ? `**Previous active:** \`${data.previousActiveId}\`` : '_(no previous active scene)_'
      }`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('activate', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleView(args: ArgsFor<'view'>) {
    try {
      const data = await this.query<SceneViewResponse>('scene', args);
      const text = `👁️ **Scene Viewed (local user)**\n\n**Name:** ${data.viewedName}\n**ID:** \`${data.viewedId}\`\n\n_(World-active state unchanged. Use 'activate' to set the game-wide active scene.)_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('view', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleThumbnail(args: ArgsFor<'thumbnail'>) {
    try {
      const data = await this.query<SceneThumbnailResponse>('scene', args);
      const text = `🖼️ **Thumbnail Regenerated**\n\n**Scene:** ${data.sceneName} (\`${data.sceneId}\`)\n**Dimensions:** ${data.width} × ${data.height}\n**Format:** ${data.format}\n**Data URL (truncated):** \`${data.thumbDataUrl.slice(0, 60)}...\` (${data.thumbDataUrl.length} chars total)`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('thumbnail', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<SceneGetResponse>('scene', args);
      let text = formatSceneView(data.scene);
      if (data.tokens && data.tokenSummary) {
        text +=
          `\n\n### Tokens (${data.tokenSummary.total})\n` +
          `- Hostile: ${data.tokenSummary.byDisposition.hostile}, ` +
          `Neutral: ${data.tokenSummary.byDisposition.neutral}, ` +
          `Friendly: ${data.tokenSummary.byDisposition.friendly}, ` +
          `Unknown: ${data.tokenSummary.byDisposition.unknown}\n` +
          `- Linked: ${data.tokenSummary.hasActors}, Unlinked: ${data.tokenSummary.withoutActors}\n\n` +
          formatTokensSummary(data.tokens);
      }
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<SceneListResponse>('scene', args);
      // Discriminate response shapes (bare | paginated | countOnly) — TS's
      // structural narrowing on `in` is weak across optional-field overlap;
      // narrow via tagged casts on the unique fields per shape.
      if ('pageCount' in data) {
        const p = data as Extract<SceneListResponse, { page: number }>;
        const lines = p.scenes.map(
          (s) =>
            `- **${s.name}**${s.active ? ' _(active)_' : ''} · \`${s.id}\` · ${s.width ?? '?'}×${s.height ?? '?'}`,
        );
        const text = `📋 **Scenes** (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(no scenes)_'}`;
        return { content: [{ type: 'text' as const, text }] };
      }
      if ('filterApplied' in data) {
        const c = data as Extract<SceneListResponse, { filterApplied: string | null }>;
        const text = `📋 **Scene count**\n\n**Total:** ${c.total}${c.filterApplied ? `\n**Filter:** "${c.filterApplied}"` : ''}`;
        return { content: [{ type: 'text' as const, text }] };
      }
      const bare = data as Extract<SceneListResponse, { scenes: unknown[] }> & {
        scenes: Array<{ id: string; name: string; active: boolean; navigation: boolean; width: number | null; height: number | null; folder: string | null }>;
      };
      if (bare.scenes.length === 0) {
        return { content: [{ type: 'text' as const, text: '📋 **No Scenes Found**' }] };
      }
      const lines = bare.scenes.map(
        (s) =>
          `- **${s.name}**${s.active ? ' _(active)_' : ''} · \`${s.id}\` · ${s.width ?? '?'}×${s.height ?? '?'}`,
      );
      const text = `📋 **Scenes** (${bare.scenes.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('list', e instanceof Error ? e.message : String(e));
    }
  }

}
