// opportunity_scan_2026-08-21 F11 — Wall umbrella tool (5 actions).
//
// Wraps the `wall` Foundry-side handler (dispatchWall).
// Actions: create / update / delete / get / list.
// All operate on scene.walls (EmbeddedCollectionField of WallDocument).
// Doors ARE walls in Foundry v13 (WallDocument.door/.ds fields) — no separate door tool.
//
// **CCR-Envelope-Consumer:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. Each handler wraps its query call in
// try/catch and routes errors through this.errorResponse().
//
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// the success field on the return value; never use this.query<any>.

import { z } from 'zod';
import {
  WallToolInput,
  type WallViewModel,
  type WallListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type WallArgs = z.infer<typeof WallToolInput>;
type ArgsFor<A extends WallArgs['action']> = Extract<WallArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ───

interface WallCreateResponse {
  wall: WallViewModel;
  requestedChanges: Record<string, unknown>;
}
interface WallUpdateResponse {
  wall: WallViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface WallDeleteResponse {
  deletedId: string;
  remainingWalls: number;
}
interface WallGetResponse {
  wall: WallViewModel;
}
interface WallListBareResponse {
  walls: WallListItem[];
}
interface WallListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  walls: WallListItem[];
}
interface WallListCountResponse {
  total: number;
  filterApplied: boolean;
}
type WallListResponse = WallListBareResponse | WallListPaginatedResponse | WallListCountResponse;

// ── Utilities ────────────────────────────────────────────────────────────────

const DOOR_TYPE_LABEL: Record<number, string> = { 0: 'NONE', 1: 'DOOR', 2: 'SECRET' };
const DOOR_STATE_LABEL: Record<number, string> = { 0: 'CLOSED', 1: 'OPEN', 2: 'LOCKED' };

function formatWallView(w: WallViewModel): string {
  return [
    `## Wall \`${w.id}\``,
    `**Scene:** \`${w.sceneId}\``,
    ``,
    `### Coordinates`,
    `- c: [${w.c.join(', ')}] · dir: ${w.dir}`,
    ``,
    `### Door`,
    `- type: ${DOOR_TYPE_LABEL[w.door] ?? w.door} · state: ${DOOR_STATE_LABEL[w.ds] ?? w.ds}${w.doorSound ? ` · sound: ${w.doorSound}` : ''}`,
    ``,
    `### Restrictions`,
    `- light: ${w.light} · sight: ${w.sight} · sound: ${w.sound} · move: ${w.move}`,
    `- threshold: attenuation=${w.threshold.attenuation ? 'yes' : 'no'}, light=${w.threshold.light}, sight=${w.threshold.sight}, sound=${w.threshold.sound}`,
  ].join('\n');
}

export function formatWallListItem(w: WallListItem): string {
  return (
    `- \`${w.id}\` @ scene \`${w.sceneId}\`` +
    ` · c=[${w.c.join(', ')}]` +
    ` · door=${DOOR_TYPE_LABEL[w.door] ?? w.door}` +
    ` · ds=${DOOR_STATE_LABEL[w.ds] ?? w.ds}`
  );
}

// Extracted to module scope (not inlined in getToolDefinitions()) to keep the
// method under the lint-ratchet max-lines-per-function cap for new files.
const WALL_DESCRIPTION =
  `Manage Foundry VTT Wall documents via 5 actions (embedded-doc CRUD + list). Walls live on scenes (scene.walls collection). Doors ARE walls — door state is a field on this tool, not a separate tool.

Use this when:
- Sealing off a room, corridor, or area with a line-of-sight/movement blocker (action:"create" with c:[x0,y0,x1,y1]).
- Placing a door (action:"create" or "update" with door:1 for a normal door, door:2 for a secret door) and opening/closing/locking it (ds: 0=CLOSED, 1=OPEN, 2=LOCKED).
- Adjusting a wall's movement/sight/sound/light restriction level (action:"update" with move/sight/sound/light).
- Removing a wall segment that's no longer needed (action:"delete").
- Auditing every wall on a scene, optionally filtered to just doors (action:"list"/"get").

Do NOT use this for a scene-wide lighting/darkness transition — use the \`scene\` umbrella's lighting-transition action instead; this tool places individual wall/door segments, not scene-level ambient effects. Do NOT use this for placing a light source — use the \`light\` tool.

**Actions:**
- **create**: Place a new Wall on a scene. Required: sceneId, c (length-4 array [x0,y0,x1,y1]). Optional: dir, door, doorSound, ds, light, move, sight, sound, threshold, flags. Returns full WallViewModel.
- **update**: Partial-diff update. sceneId + wallId + changes (≥1 field). Same writable surface as create.
- **delete**: Permanently remove a single Wall from the scene. ⚠️ Irreversible.
- **get**: Fetch a single wall by sceneId + wallId. Returns full WallViewModel including threshold and door state.
- **list**: List walls on a scene. sceneId optional (defaults to active scene). Filter: doorOnly (boolean — true for door>NONE walls only). Pagination: page/pageSize (1-100). countOnly=true for cheap inventory probe.

**door / ds enums (CONST.WALL_DOOR_TYPES / WALL_DOOR_STATES):** door — 0=NONE (plain wall), 1=DOOR, 2=SECRET. ds — 0=CLOSED, 1=OPEN, 2=LOCKED.

**Restriction enums (CONST.WALL_SENSE_TYPES for light/sight/sound; CONST.WALL_MOVEMENT_TYPES for move):** light/sight/sound — 0=NONE, 10=LIMITED, 20=NORMAL, 30=PROXIMITY, 40=DISTANCE. move — 0=NONE, 20=NORMAL (movement has only 2 states, unlike the other 3 senses).

**threshold fields:** {attenuation?: boolean, light?: number, sight?: number, sound?: number} — minimum distance from a source for PROXIMITY/DISTANCE-classed walls to still block.

Performance Notes:
- create/update/delete/get return a single wall record — no pagination. list without pagination params returns ALL matching walls in one response (bare array); pass page/pageSize (max 100, default 20) to paginate, or countOnly:true for a cheap total.

**Examples:**
- create (plain wall): {action:"create", sceneId:"abc", c:[100,100,300,100]}
- create (door): {action:"create", sceneId:"abc", c:[100,100,300,100], door:1, ds:0}
- update (open a door): {action:"update", sceneId:"abc", wallId:"xyz", changes:{ds:1}}
- delete: {action:"delete", sceneId:"abc", wallId:"xyz"}
- get: {action:"get", sceneId:"abc", wallId:"xyz"}
- list (doors only): {action:"list", sceneId:"abc", doorOnly:true}`;

const WALL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['create', 'update', 'delete', 'get', 'list'],
      description: 'The wall action to perform.',
    },
    sceneId: {
      type: 'string',
      description:
        '[create/update/delete/get] Required scene document ID. [list] Optional — defaults to active scene.',
    },
    wallId: {
      type: 'string',
      description: '[update/delete/get] Wall document ID.',
    },
    // create writable fields (flat)
    c: {
      type: 'array',
      items: { type: 'number' },
      minItems: 4,
      maxItems: 4,
      description: '[create] Required length-4 array [x0, y0, x1, y1] — the wall\'s two endpoints.',
    },
    dir: { type: 'number', enum: [0, 1, 2], description: '[create/update.changes] Direction of effect: 0=BOTH, 1=LEFT, 2=RIGHT.' },
    door: { type: 'number', enum: [0, 1, 2], description: '[create/update.changes] Door type: 0=NONE, 1=DOOR, 2=SECRET.' },
    doorSound: { type: 'string', description: '[create/update.changes] Door sound cue key.' },
    ds: { type: 'number', enum: [0, 1, 2], description: '[create/update.changes] Door state: 0=CLOSED, 1=OPEN, 2=LOCKED.' },
    light: { type: 'number', enum: [0, 10, 20, 30, 40], description: '[create/update.changes] Light restriction: 0=NONE, 10=LIMITED, 20=NORMAL, 30=PROXIMITY, 40=DISTANCE.' },
    move: { type: 'number', enum: [0, 20], description: '[create/update.changes] Movement restriction: 0=NONE, 20=NORMAL.' },
    sight: { type: 'number', enum: [0, 10, 20, 30, 40], description: '[create/update.changes] Sight restriction (same scale as light).' },
    sound: { type: 'number', enum: [0, 10, 20, 30, 40], description: '[create/update.changes] Sound restriction (same scale as light).' },
    threshold: {
      type: 'object',
      description: '[create/update.changes] {attenuation?: boolean, light?: number, sight?: number, sound?: number} — proximity-sense minimum distances.',
    },
    flags: { type: 'object', description: '[create/update.changes] Foundry flag bag.' },
    // update
    changes: {
      type: 'object',
      description:
        '[update] Partial-diff of writable Wall fields. Must contain ≥1 field. Shape: c, dir, door, doorSound, ds, light, move, sight, sound, threshold.*, flags.',
    },
    // list
    doorOnly: { type: 'boolean', description: '[list] Filter to walls with door > NONE only. Distinct from the numeric `door` enum above.' },
    page: { type: 'integer', minimum: 1, description: '[list] 1-based page number.' },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list] Items per page (default 20, max 100).' },
    countOnly: { type: 'boolean', description: '[list] Return {total, filterApplied} only.' },
  },
  required: ['action'],
};

export interface WallToolOptions extends BaseToolOptions { }

export class WallTool extends BaseTool {
  constructor(options: WallToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'wall', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'wall',
        title: 'Manage Walls',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: WALL_DESCRIPTION,
        inputSchema: WALL_INPUT_SCHEMA,
      },
    ];
  }

  async execute(args: WallArgs) {
    this.logger.info('Executing wall action', { action: args.action });
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
      default:
        // BUG-439-class: an unknown action must throw (clean isError envelope via the
        // dispatch catch) instead of falling through to an undefined result.
        throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: create, update, delete, get, list`);
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ───────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<WallCreateResponse>('wall', args);
      const text =
        `🧱 **Wall Created**\n\n${formatWallView(data.wall)}\n\n` +
        `_Requested fields: ${Object.keys(data.requestedChanges).filter((k) => k !== 'action' && k !== 'sceneId').join(', ') || '(c only)'}_`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<WallUpdateResponse>('wall', args);
      const text =
        `✏️ **Wall Updated**\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatWallView(data.wall)}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    try {
      const data = await this.query<WallDeleteResponse>('wall', args);
      const text =
        `🗑️ **Wall Deleted**\n\n**ID:** \`${data.deletedId}\`\n**Remaining walls on scene:** ${data.remainingWalls}\n\n⚠️ Permanent.`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<WallGetResponse>('wall', args);
      return { content: [{ type: 'text' as const, text: formatWallView(data.wall) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<WallListResponse>('wall', args);

      if ('pageCount' in data) {
        const p = data as WallListPaginatedResponse;
        const lines = p.walls.map(formatWallListItem);
        const text = `🧱 **Walls** (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(none)_'}`;
        return { content: [{ type: 'text' as const, text }], structuredContent: p as unknown as Record<string, unknown> };
      }

      if ('filterApplied' in data) {
        const c = data as WallListCountResponse;
        const text = `🧱 **Wall count**\n\n**Total:** ${c.total}${c.filterApplied ? '\n**Filter applied**' : ''}`;
        return { content: [{ type: 'text' as const, text }], structuredContent: c as unknown as Record<string, unknown> };
      }

      const bare = data as WallListBareResponse;
      if (bare.walls.length === 0) {
        return { content: [{ type: 'text' as const, text: '🧱 **No Walls Found**' }], structuredContent: bare as unknown as Record<string, unknown> };
      }
      const lines = bare.walls.map(formatWallListItem);
      const text = `🧱 **Walls** (${bare.walls.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: bare as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }
}
