// Phase 5 mcp_crud_expansion — AmbientSound umbrella tool (5 actions).
//
// Wraps the `sound` Foundry-side handler (dispatchSound).
// Actions: create / update / delete / get / list.
// All operate on scene.sounds (EmbeddedCollectionField of AmbientSoundDocument).
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through errorContent().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.

import { z } from 'zod';
import {
  SoundToolInput,
  type SoundViewModel,
  type SoundListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type SoundArgs = z.infer<typeof SoundToolInput>;
type ArgsFor<A extends SoundArgs['action']> = Extract<SoundArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ────

interface SoundCreateResponse {
  sound: SoundViewModel;
  requestedChanges: Record<string, unknown>;
}
interface SoundUpdateResponse {
  sound: SoundViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface SoundDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  remainingSounds: number;
}
interface SoundGetResponse {
  sound: SoundViewModel;
}
interface SoundDuplicateResponse {
  sound: SoundViewModel;
  sourceId: string; // not a branded id (polymorphic / non-document)
}
interface SoundListBareResponse {
  sounds: SoundListItem[];
}
interface SoundListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  sounds: SoundListItem[];
}
interface SoundListCountResponse {
  total: number;
  filterApplied: string | null;
}
type SoundListResponse = SoundListBareResponse | SoundListPaginatedResponse | SoundListCountResponse;

// ── Utilities ─────────────────────────────────────────────────────────────────

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `❌ **sound/${action} failed**\n\n${message}` }],
    isError: true,
  };
}

function formatSoundView(s: SoundViewModel): string {
  return [
    `## AmbientSound \`${s.id}\``,
    `**Scene:** \`${s.sceneId}\``,
    ``,
    `### Position`,
    `- x: ${s.x}, y: ${s.y}, elevation: ${s.elevation}, radius: ${s.radius}`,
    ``,
    `### Audio`,
    `- path: ${s.path ?? '_(none)_'}`,
    `- volume: ${s.volume}, repeat: ${s.repeat ? 'yes' : 'no'}, easing: ${s.easing ? 'yes' : 'no'}`,
    ``,
    `### Flags`,
    `- walls: ${s.walls ? 'on' : 'off'} · hidden: ${s.hidden ? 'yes' : 'no'}`,
    ``,
    `### Darkness Threshold`,
    `- min: ${s.darkness.min}, max: ${s.darkness.max}`,
    ``,
    `### Effects`,
    `- base: type=${s.effects.base.type ?? '_(none)_'}, intensity=${s.effects.base.intensity}`,
    `- muffled: type=${s.effects.muffled.type ?? '_(none)_'}, intensity=${s.effects.muffled.intensity}`,
  ].join('\n');
}

function formatSoundListItem(s: SoundListItem): string {
  // F13: render `hidden=yes/no` explicitly per item so filter verification workflows can
  // read the field unconditionally (was conditional on s.hidden being true).
  return (
    `- \`${s.id}\` @ scene \`${s.sceneId}\`` +
    ` · vol=${s.volume}` +
    ` · hidden=${s.hidden ? 'yes' : 'no'}` +
    (s.path ? ` · ${s.path}` : ' · _(no path)_')
  );
}

export interface SoundToolOptions extends BaseToolOptions {}

export class SoundTool extends BaseTool {
  constructor(options: SoundToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'sound',
        title: 'Manage AmbientSounds',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT AmbientSound documents via 6 actions (embedded-doc CRUD + list + Phase 9C duplicate). Sounds live on scenes (scene.sounds collection).

**Actions:**
- **create**: Place a new AmbientSound on a scene. Required: sceneId, x, y. Optional: elevation, radius, path, repeat, volume, walls, easing, hidden, darkness.{min,max}, effects.{base,muffled}.{type,intensity}, flags. Returns full SoundViewModel.
- **update**: Partial-diff update. sceneId + soundId + changes (≥1 field). Same writable surface as create.
- **delete**: Permanently remove a single AmbientSound from the scene. ⚠️ Irreversible.
- **get**: Fetch a single sound by sceneId + soundId. Returns full SoundViewModel.
- **list**: List sounds on a scene. sceneId optional (defaults to active scene). Filters: hidden (boolean), filter (substring on path). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.
- **duplicate** (Phase 9C): Copy an AmbientSound (toObject minus _id → create). Required: sceneId, soundId. Returns the new sound + sourceId.

**effects:** Each AmbientSound has base and muffled effect variants: {type: string|null, intensity: 0-10}. Controls reverb/muffling through walls.

**darkness:** {min, max} — sound only plays when scene darkness level is within [min, max] (0-1).

**Examples:**
- create: {action:"create", sceneId:"abc", x:500, y:300, path:"sounds/ambient/tavern.ogg", volume:0.4, radius:30}
- update: {action:"update", sceneId:"abc", soundId:"xyz", changes:{hidden:true, volume:0.6}}
- delete: {action:"delete", sceneId:"abc", soundId:"xyz"}
- get: {action:"get", sceneId:"abc", soundId:"xyz"}
- list: {action:"list", sceneId:"abc", hidden:false}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list', 'duplicate'],
              description: 'The sound action to perform.',
            },
            sceneId: {
              type: 'string',
              description:
                '[create/update/delete/get/duplicate] Required scene document ID. [list] Optional — defaults to active scene.',
            },
            soundId: {
              type: 'string',
              description: '[update/delete/get/duplicate] AmbientSound document ID.',
            },
            // create writable fields (flat)
            x: { type: 'number', description: '[create] Required x-coordinate.' },
            y: { type: 'number', description: '[create] Required y-coordinate.' },
            elevation: { type: 'number', description: '[create/update.changes] Elevation value.' },
            radius: { type: 'number', minimum: 0, description: '[create/update.changes] Sound emission radius.' },
            path: { type: ['string', 'null'], description: '[create/update.changes] Audio file path (null to clear).' },
            repeat: { type: 'boolean', description: '[create/update.changes] Loop the sound.' },
            volume: { type: 'number', minimum: 0, maximum: 1, description: '[create/update.changes] Playback volume 0-1.' },
            walls: { type: 'boolean', description: '[create/update.changes] Whether sound is blocked by walls.' },
            easing: { type: 'boolean', description: '[create/update.changes] Apply distance easing to volume.' },
            hidden: { type: 'boolean', description: '[create/update.changes] Hide the sound from players.' },
            darkness: {
              type: 'object',
              description: '[create/update.changes] Darkness threshold: {min?: 0-1, max?: 0-1}.',
            },
            effects: {
              type: 'object',
              description:
                '[create/update.changes] Sound effects: {base?:{type?,intensity?}, muffled?:{type?,intensity?}}.',
            },
            flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
            // update
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable AmbientSound fields. Must contain ≥1 field. Shape: elevation, radius, path, repeat, volume, walls, easing, hidden, darkness.*, effects.*, flags.',
            },
            // list
            filter: { type: 'string', description: '[list] Substring match on sound path.' },
            page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default all, max 100).' },
            countOnly: { type: 'boolean', description: '[list] Return {total, filterApplied} only.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: SoundArgs) {
    this.logger.info('Executing sound action', { action: args.action });
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

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ────────────

  private async handleDuplicate(args: ArgsFor<'duplicate'>) {
    try {
      const data = await this.query<SoundDuplicateResponse>('sound', args);
      const text = `🧬 **AmbientSound Duplicated**\n\n_From \`${data.sourceId}\`_\n\n${formatSoundView(data.sound)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('duplicate', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<SoundCreateResponse>('sound', args);
      const text =
        `🔊 **AmbientSound Created**\n\n${formatSoundView(data.sound)}\n\n` +
        `_Requested fields: ${Object.keys(data.requestedChanges).filter((k) => k !== 'action' && k !== 'sceneId').join(', ') || '(x/y only)'}_`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<SoundUpdateResponse>('sound', args);
      const text =
        `✏️ **AmbientSound Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatSoundView(data.sound)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<SoundDeleteResponse>('sound', args);
      const text =
        `🗑️ **AmbientSound Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Remaining sounds on scene:** ${data.remainingSounds}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<SoundGetResponse>('sound', args);
      return { content: [{ type: 'text' as const, text: formatSoundView(data.sound) }] };
    } catch (e) {
      return errorContent('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<SoundListResponse>('sound', args);

      if ('pageCount' in data) {
        const p = data as SoundListPaginatedResponse;
        const lines = p.sounds.map(formatSoundListItem);
        const text = `🔊 **AmbientSounds** (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(none)_'}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if ('filterApplied' in data) {
        const c = data as SoundListCountResponse;
        const text = `🔊 **AmbientSound count**\n\n**Total:** ${c.total}${c.filterApplied ? `\n**Filter applied:** ${c.filterApplied}` : ''}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      const bare = data as SoundListBareResponse;
      if (bare.sounds.length === 0) {
        return { content: [{ type: 'text' as const, text: '🔊 **No AmbientSounds Found**' }] };
      }
      const lines = bare.sounds.map(formatSoundListItem);
      const text = `🔊 **AmbientSounds** (${bare.sounds.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('list', e instanceof Error ? e.message : String(e));
    }
  }
}
