// Module Integration v1 Phase 2 — module-matt MCP tool (Monk's Active Tiles).
//
// Always-registered umbrella. The foundry-module handler guards on monks-active-tiles being
// active; when inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// this.errorResponse(). Use module-probe.is-active to pre-flight.
//
// 19 actions: reads (get-capabilities/get-trigger-tile/list-trigger-tiles/validate-sequence),
// authoring (create-trigger-tile/update-trigger-config), sequence editing (replace/add/insert/
// update/remove/reorder/duplicate-action), state (set-variables/reset-history), runtime
// (fire-trigger/fire-trigger-as/find-trigger-tile), region bridge (link-region-trigger).
//
// Anchors:
//   - DP-15: concrete this.query<T> per action — never <any>.
//   - R2.4 (mcp-builder): errors route through the shared BaseTool.errorResponse.
//   - CCR-G9: tool name = 'module-matt'; description documents conditionality + pre-flight.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import {
  RegionBehaviorId,
  RegionId,
  SceneId,
  TileId,
  TokenId,
  MattMutationOutput,
  MATT_MUTATION_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { z } from 'zod';
import { ModuleMattInput } from '@foundry-mcp/shared';

type ModuleMattArgs = z.infer<typeof ModuleMattInput>;

// Phase 11 (R11.1): mutation actions get structuredContent attached (the 14 write
// actions); the 5 read actions (get-capabilities/get-trigger-tile/list-trigger-tiles/
// validate-sequence/find-trigger-tile) keep their content-only return unchanged.
const MATT_MUTATION_ACTIONS = new Set<string>([
  'create-trigger-tile', 'update-trigger-config', 'replace-action-sequence', 'add-action',
  'insert-action', 'update-action', 'remove-action', 'reorder-actions', 'duplicate-action',
  'set-variables', 'reset-history', 'fire-trigger', 'fire-trigger-as', 'link-region-trigger',
]);

// ── Response shapes (DP-15) ────────────────────────────────────────────────────

interface CapabilitiesResponse {
  triggers: string[];
  actions: Array<{ key: string; group: string; danger: boolean; repairGated?: boolean; required?: string[] }>;
  dangerousActions: string[];
  groups: string[];
  registeredActions: string[];
  optionalDeps: Record<string, boolean>;
  settings: Record<string, unknown>;
  counts: { triggers: number; builtinActions: number };
}

interface TriggerTileResponse {
  uuid: string;
  tileId: TileId;
  sceneId: SceneId;
  name: string | null;
  active: boolean | null;
  trigger: string[] | null;
  restriction: string | null;
  controlled: string | null;
  chance: number | null;
  pertoken: boolean | null;
  cooldown: number | null;
  actions: Array<{ id: string; action: string; data: Record<string, unknown> }>;
  variables: Record<string, unknown>;
  history: Record<string, unknown>;
  config: Record<string, unknown>;
  // BUG-254 — present on every get-trigger-tile response; tilepack export consumes these.
  geometry?: {
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
    rotation: number;
    elevation: number;
    sort: number;
    hidden: boolean;
  };
  texture?: { src: string | null };
  regionLinks?: Array<{ regionId: RegionId; behaviorId: RegionBehaviorId; events: unknown }>;
  returnFullPayload?: boolean;
}

interface ListTilesResponse {
  sceneId: SceneId;
  count: number;
  tiles: Array<{ uuid: string; tileId: TileId; name: string | null; active: boolean | null; trigger: string[] | null; actionCount: number }>;
}

interface ValidateSequenceResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
  dangerous: string[];
  anchors: string[];
}

// Phase 5C — author-time tagger selector resolution (foundry-module matt.ts:159-165).
// Surfaced on create-trigger-tile + replace-action-sequence so the GM sees match counts +
// ZERO_MATCH warnings at author time (DP-19 — handler computed these but the formatter dropped them).
interface TaggerResolutionEntry {
  actionIndex: number;
  field: string;
  tag: string;
  matchedCount: number;
  warn?: 'ZERO_MATCH';
}

interface CreateTileResponse {
  tileId: TileId;
  uuid: string;
  sceneId: SceneId;
  trigger: string[];
  actionCount: number;
  name: string | null;
  taggerResolution?: TaggerResolutionEntry[];
  taggerWarnings?: string[];
}

interface UpdateConfigResponse {
  uuid: string;
  tileId: TileId;
  sceneId: SceneId;
  updated: string[];
}

interface SequenceResponse {
  uuid: string;
  tileId: TileId;
  actionCount: number;
  actionId?: string; // not a branded id (polymorphic / non-document) — MATT internal 16-char sequence action id
  actions?: Array<{ id: string; action: string }>;
  taggerResolution?: TaggerResolutionEntry[];
  taggerWarnings?: string[];
}

interface SetVariablesResponse {
  uuid: string;
  tileId: TileId;
  variables: Record<string, unknown>;
}

interface ResetHistoryResponse {
  uuid: string;
  tileId: TileId;
  cleared: string;
}

interface FireTriggerResponse {
  uuid: string;
  fired: boolean;
  tokensUsed?: number;
}

interface FireTriggerAsResponse {
  uuid: string;
  fired: boolean;
  method: string;
  tokenIds: TokenId[];
  tokensUsed: number;
}

interface FindTriggerTileResponse {
  count: number;
  match?: {
    uuid: string;
    sceneId: SceneId;
    sceneName: string;
    tileId: TileId;
    name: string | null;
    active: boolean | null;
    trigger: string[] | null;
    actionCount: number;
    tags: string[];
    libraryId: string | null; // not a branded id (polymorphic / non-document)
  };
  matches: Array<{
    uuid: string;
    sceneId: SceneId;
    sceneName: string;
    tileId: TileId;
    name: string | null;
    active: boolean | null;
    trigger: string[] | null;
    actionCount: number;
    tags: string[];
    libraryId: string | null; // not a branded id (polymorphic / non-document)
  }>;
}

interface LinkRegionResponse {
  regionId: RegionId;
  behaviorId: RegionBehaviorId;
  tileUuid: string;
  sceneId: SceneId;
}

// ── Inline error helper (CCR-G2 — NOT on BaseTool) ───────────────────────────


const text = (s: string) => ({ content: [{ type: 'text' as const, text: s }] });

// ── Formatters (emit real return fields — DP-19) ──────────────────────────────

function formatCapabilities(d: CapabilitiesResponse): string {
  const deps = Object.entries(d.optionalDeps).map(([k, v]) => `${k}:${v ? 'on' : 'off'}`).join(', ');
  const reg = d.registeredActions.length ? `\nRegistered (third-party) actions: ${d.registeredActions.join(', ')}` : '';
  return `MATT capabilities — ${d.counts.triggers} trigger modes, ${d.counts.builtinActions} built-in actions (groups: ${d.groups.join('/')}).
Dangerous (need confirm): ${d.dangerousActions.join(', ')}.
Optional deps: ${deps}.${reg}`;
}

function formatTriggerTile(d: TriggerTileResponse): string {
  // BUG-254 — full machine-readable bundle for tilepack export round-trips. Emits the entire
  // envelope (geometry + texture + full actions[] with data + variables + regionLinks) as JSON
  // so the export call plan can build a complete .tilepack.json without F12/source inspection.
  if (d.returnFullPayload) {
    return `MATT tile "${d.name ?? d.tileId}" (${d.uuid}) — full payload:\n\`\`\`json\n${JSON.stringify(d, null, 2)}\n\`\`\``;
  }
  const actionsStr = d.actions.length
    ? d.actions.map((a, i) => `${i}: ${a.action} (${a.id})`).join('\n  ')
    : '(none)';
  const historyCount = Object.keys(d.history ?? {}).length;
  return `MATT tile "${d.name ?? d.tileId}" (${d.uuid})
  scene=${d.sceneId} tile=${d.tileId}
  active=${d.active} trigger=[${(d.trigger ?? []).join(', ')}] restriction=${d.restriction} chance=${d.chance}
  pertoken=${d.pertoken} cooldown=${d.cooldown}
  ${d.actions.length} action(s):
  ${actionsStr}
  variables=${JSON.stringify(d.variables)} history=${historyCount} entries`;
}

function formatListTiles(d: ListTilesResponse): string {
  if (d.count === 0) return `No MATT tiles on scene ${d.sceneId}.`;
  const lines = d.tiles.map((t) => `- ${t.name ?? t.tileId} (${t.uuid}) active=${t.active} trigger=[${(t.trigger ?? []).join(', ')}] actions=${t.actionCount}`);
  return `MATT tiles on scene ${d.sceneId} (${d.count}):\n${lines.join('\n')}`;
}

function formatValidate(d: ValidateSequenceResponse): string {
  const head = d.valid ? 'VALID' : 'INVALID';
  const parts = [`Sequence ${head}.`];
  if (d.errors.length) parts.push(`Errors:\n  - ${d.errors.join('\n  - ')}`);
  if (d.warnings.length) parts.push(`Warnings:\n  - ${d.warnings.join('\n  - ')}`);
  if (d.dangerous.length) parts.push(`Dangerous actions (need confirm): ${d.dangerous.join(', ')}`);
  if (d.anchors.length) parts.push(`Anchors: ${d.anchors.join(', ')}`);
  return parts.join('\n');
}

// Phase 5C — render author-time tagger resolution (DP-19: handler returns these; surface them).
function formatTaggerResolution(d: { taggerResolution?: TaggerResolutionEntry[]; taggerWarnings?: string[] }): string {
  if (!d.taggerResolution?.length) return '';
  const lines = d.taggerResolution.map((r) => {
    const flag = r.warn === 'ZERO_MATCH' ? ' — ZERO_MATCH (tag may not exist yet; WARN only)' : '';
    return `  - action[${r.actionIndex}].${r.field} tagger:"${r.tag}" → ${r.matchedCount} match${r.matchedCount === 1 ? '' : 'es'}${flag}`;
  });
  return `\nTagger resolution:\n${lines.join('\n')}`;
}

function formatCreate(d: CreateTileResponse): string {
  return `Created MATT tile "${d.name ?? d.tileId}" (${d.uuid}) on scene ${d.sceneId} — trigger=[${d.trigger.join(', ')}], ${d.actionCount} action(s).${formatTaggerResolution(d)}`;
}

function formatUpdateConfig(d: UpdateConfigResponse): string {
  return `Updated MATT config on ${d.uuid}: ${d.updated.join(', ')}.`;
}

function formatSequence(d: SequenceResponse): string {
  const head = `MATT tile ${d.uuid} — ${d.actionCount} action(s)`;
  const seq = d.actions ? `\n  ${d.actions.map((a, i) => `${i}: ${a.action} (${a.id})`).join('\n  ')}` : '';
  const focus = d.actionId ? ` [action ${d.actionId}]` : '';
  return `${head}${focus}.${seq}${formatTaggerResolution(d)}`;
}

function formatSetVariables(d: SetVariablesResponse): string {
  return `Set variables on ${d.uuid}: ${JSON.stringify(d.variables)}.`;
}

function formatResetHistory(d: ResetHistoryResponse): string {
  return `Reset MATT history on ${d.uuid} (${d.cleared}).`;
}

function formatFire(d: FireTriggerResponse): string {
  return `Fired MATT tile ${d.uuid} (fired=${d.fired}${d.tokensUsed != null ? `, tokens=${d.tokensUsed}` : ''}).`;
}

function formatFireAs(d: FireTriggerAsResponse): string {
  return `Fired MATT tile ${d.uuid} as tokens [${d.tokenIds.join(', ')}] (method="${d.method}", fired=${d.fired}).`;
}

function formatFindTriggerTile(d: FindTriggerTileResponse): string {
  if (d.count === 0) return 'No MATT tiles found matching that criterion.';
  const lines = d.matches.map(
    (m) => `- "${m.name ?? m.tileId}" (${m.uuid}) scene=${m.sceneName} active=${m.active} trigger=[${(m.trigger ?? []).join(', ')}] actions=${m.actionCount}`,
  );
  return `Found ${d.count} MATT tile(s):\n${lines.join('\n')}`;
}

function formatLinkRegion(d: LinkRegionResponse): string {
  return `Linked region ${d.regionId} → tile ${d.tileUuid} (behavior ${d.behaviorId}) on scene ${d.sceneId}.`;
}

export interface ModuleMattToolOptions extends BaseToolOptions {}

export class ModuleMattTool extends BaseTool {
  constructor(options: ModuleMattToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-matt', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-matt',
        title: "Monk's Active Tiles integration",
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Author, inspect, edit, and fire Monk's Active Tile (MATT) automations (module ID: monks-active-tiles).
REQUIRES monks-active-tiles installed + active — returns MODULE_NOT_ACTIVE otherwise. Pre-flight with module-probe.is-active.
GM required for all writes. Destructive/elevated-risk MATT actions (delete/permissions/resetfog/scene/gametime/runmacro/runcode/url + attack)
must be confirmed: send confirm:true after reviewing the impact report. fire-trigger also requires confirm:true.
fire-trigger-as also requires confirm:true after reviewing the explicit-token impact preview.

19 actions:
- get-capabilities                       — 24 trigger modes + source-audited native 78-action catalog + registered/3rd-party actions + optional deps + MATT settings (including use-core-macro).
- get-trigger-tile { tileUuid, returnFullPayload? } — full MATT config + ordered actions + variables + history for one tile. returnFullPayload:true emits a machine-readable JSON bundle (geometry + texture + full actions[] + regionLinks) for tilepack export.
- list-trigger-tiles { sceneId? }        — MATT-armed tiles on a scene (defaults to active scene).
- validate-sequence { actions }          — catalog-validate an ordered action array before write/fire.
- create-trigger-tile { sceneId, x, y, trigger[], config?, ... } — create a Tile + full MATT flag block + optional initial actions. Config flags may be passed nested (config:{pertoken:true}) or flattened (pertoken:true); flattened wins per key.
- update-trigger-config { tileUuid, trigger?, config? }  — patch config fields (never touches actions[]).
- replace-action-sequence { tileUuid, actions[] }        — write a complete validated ordered sequence.
- add-action / insert-action             — append / insert one action (insert needs index).
- update-action / remove-action          — edit / remove one action by actionId.
- reorder-actions { order[] } / duplicate-action { actionId }.
- set-variables { tileUuid, variables }  — write tile variable store.
- reset-history { tileUuid, tokenId? }   — clear trigger history (all or per-token).
- fire-trigger { tileUuid, confirm }     — fire a tile via game.MonksActiveTiles.triggerTile() (uses controlled tokens).
- fire-trigger-as { tileUuid, tokenIds[], method?, landing?, confirm } — fire a tile via TileDocument.prototype.trigger() with an explicit token array (bypasses controlled-token resolution — use for NPC-as-trigger, patrol sim, automated test). landing:"<anchorTag>" starts at the action AFTER that named anchor (the supported resume-from-bookmark idiom; stop{continue:true} has NO upstream resume in MATT v13.06).
- find-trigger-tile { name|tileUuid|tag|libraryId, sceneId? }  — read-only exact lookup. Errors on no match or ambiguous multiple matches.
- link-region-trigger { sceneId, regionId, tileUuid } — create the monks-active-tiles.triggerTile RegionBehavior bridge.

Examples:
- { action: "get-capabilities" }
- { action: "create-trigger-tile", sceneId: "abc", x: 1000, y: 1000, trigger: ["enter"], actions: [{ action: "chatmessage", data: { text: "A trap!" } }] }
- { action: "fire-trigger", tileUuid: "Scene.abc.Tile.xyz", confirm: true }
- { action: "fire-trigger-as", tileUuid: "Scene.abc.Tile.xyz", tokenIds: ["tokenId1"], method: "enter", confirm: true }
- { action: "find-trigger-tile", name: "Main Gate Trap" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-capabilities', 'get-trigger-tile', 'list-trigger-tiles', 'validate-sequence',
                'create-trigger-tile', 'update-trigger-config', 'replace-action-sequence', 'add-action',
                'insert-action', 'update-action', 'remove-action', 'reorder-actions', 'duplicate-action',
                'set-variables', 'reset-history', 'fire-trigger', 'fire-trigger-as', 'find-trigger-tile',
                'link-region-trigger',
              ],
              description: 'The module-matt action to run.',
            },
            tileUuid: { type: 'string', description: '[get-trigger-tile/update-trigger-config/*-action/set-variables/reset-history/fire-trigger/fire-trigger-as/link-region-trigger] Tile UUID (Scene.<id>.Tile.<id>).' },
            sceneId: { type: 'string', description: '[create-trigger-tile/link-region-trigger required · list-trigger-tiles/find-trigger-tile optional] Scene id.' },
            x: { type: 'number', description: '[create-trigger-tile] Tile top-left X (canvas px).' },
            y: { type: 'number', description: '[create-trigger-tile] Tile top-left Y (canvas px).' },
            width: { type: 'number', description: '[create-trigger-tile] Tile width px (default 100).' },
            height: { type: 'number', description: '[create-trigger-tile] Tile height px (default 100).' },
            img: { type: 'string', description: '[create-trigger-tile] Optional tile texture path (imageless if omitted).' },
            trigger: { type: 'array', items: { type: 'string' }, description: '[create-trigger-tile required · update-trigger-config optional] Trigger mode(s), e.g. ["enter"], ["click"], ["turn"].' },
            actions: { type: 'array', items: { type: 'object' }, description: '[create-trigger-tile/replace-action-sequence/validate-sequence] Ordered MATT action objects { action, data } (ids minted server-side).' },
            mattAction: { type: 'object', description: '[add-action/insert-action] A single MATT action object { action, data }.' },
            index: { type: 'number', description: '[insert-action] Zero-based insertion index.' },
            actionId: { type: 'string', description: '[update-action/remove-action/duplicate-action] The 16-char MATT action id.' },
            data: { type: 'object', description: '[update-action] New data object for the action.' },
            newActionKey: { type: 'string', description: '[update-action] Optionally change the action key.' },
            order: { type: 'array', items: { type: 'string' }, description: '[reorder-actions] Full list of action ids in the new order.' },
            config: { type: 'object', description: '[create-trigger-tile/update-trigger-config] Config fields (active, restriction, controlled, chance, pertoken, cooldown, vision, allowpaused, minrequired, name, files, fileindex, usealpha, pointer, record). At create-time, flattened top-level fields win over the same key in config.' },
            // BUG-330 parity: the flattened create-time config fields (same keys as `config`).
            active: { type: 'boolean', description: '[create-trigger-tile] MATT active flag (default true).' },
            record: { type: 'boolean', description: '[create-trigger-tile] Record trigger history.' },
            restriction: { type: 'string', enum: ['all', 'player', 'gm'], description: '[create-trigger-tile] Token-type restriction.' },
            controlled: { type: 'string', enum: ['all', 'player', 'gm'], description: '[create-trigger-tile] Controlling-user restriction.' },
            allowpaused: { type: 'boolean', description: '[create-trigger-tile] Fire while game is paused.' },
            usealpha: { type: 'boolean', description: '[create-trigger-tile] Use texture alpha for collision.' },
            pointer: { type: 'boolean', description: '[create-trigger-tile] Show pointer cursor on hover.' },
            vision: { type: 'boolean', description: '[create-trigger-tile] Token must see the tile to trigger.' },
            pertoken: { type: 'boolean', description: '[create-trigger-tile] Each token may only trigger once (pre-fire dedupe; incompatible with in-sequence repeat branches).' },
            minrequired: { type: 'integer', minimum: 0, description: '[create-trigger-tile] Minimum tokens required to trigger.' },
            cooldown: { type: 'number', minimum: 0, description: '[create-trigger-tile] Seconds between fires.' },
            chance: { type: 'number', minimum: 0, maximum: 100, description: '[create-trigger-tile] Percentage chance the tile fires.' },
            files: { type: 'array', items: { type: 'string' }, description: '[create-trigger-tile] Tile image file rotation list.' },
            fileindex: { type: 'integer', minimum: 0, description: '[create-trigger-tile] Index into files[].' },
            variables: { type: 'object', description: '[set-variables] Key/value variable store to write.' },
            tokenId: { type: 'string', description: '[reset-history] Limit history clear to one token id (omit for all).' },
            events: { type: 'array', items: { type: 'string' }, description: '[link-region-trigger] Region event names (optional; defaults to standard token-enter/exit).' },
            usetiletrigger: { type: 'boolean', description: '[link-region-trigger] Map region events to tile trigger methods (default true).' },
            regionId: { type: 'string', description: '[link-region-trigger] Region document id on the scene.' },
            name: { type: 'string', description: '[create-trigger-tile/update-trigger-config/link-region-trigger] Display name. [find-trigger-tile] Exact MATT tile name to search for.' },
            confirm: { type: 'boolean', description: 'Required (true) for dangerous action authoring, fire-trigger, and fire-trigger-as. Review the impact report first.' },
            tokenIds: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10, description: '[fire-trigger-as] Canvas token ids (1–10) to use as the triggering token(s). Use scene.tokens ids, not actor ids.' },
            method: { type: 'string', description: '[fire-trigger-as] Trigger method string passed to TileDocument.prototype.trigger (default "manual"; e.g. "enter", "click").' },
            landing: { type: 'string', description: '[fire-trigger-as] Optional anchor tag — execution starts at the action AFTER the anchor action whose data.tag matches (MATT options.landing). The supported resume-from-bookmark idiom.' },
            tag: { type: 'string', description: '[find-trigger-tile] Exact Tagger tag to search for on MATT tiles.' },
            libraryId: { type: 'string', description: '[find-trigger-tile] Stable library identifier stored on MATT/warhammer-mcp tile flags.' },
            returnFullPayload: { type: 'boolean', description: '[get-trigger-tile] When true, return the full machine-readable bundle (geometry + texture + full actions[] with data + variables + region-link metadata) as JSON for tilepack export round-trips, instead of the prose summary.' },
          },
          required: ['action'],
        },
        // Phase 11 (R11.1): permissive passthrough outputSchema (user Q&A 2026-06-17).
        // structuredContent is attached on the 14 mutation actions only (see run()).
        outputSchema: MATT_MUTATION_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async execute(rawArgs: ModuleMattArgs) {
    const args = rawArgs;
    this.logger.info('Executing module-matt action', { action: args.action });

    switch (args.action) {
      case 'get-capabilities':
        return this.run<CapabilitiesResponse>('get-capabilities', args, formatCapabilities);
      case 'get-trigger-tile':
        return this.run<TriggerTileResponse>('get-trigger-tile', args, formatTriggerTile);
      case 'list-trigger-tiles':
        return this.run<ListTilesResponse>('list-trigger-tiles', args, formatListTiles);
      case 'validate-sequence':
        return this.run<ValidateSequenceResponse>('validate-sequence', args, formatValidate);
      case 'create-trigger-tile':
        return this.run<CreateTileResponse>('create-trigger-tile', args, formatCreate);
      case 'update-trigger-config':
        return this.run<UpdateConfigResponse>('update-trigger-config', args, formatUpdateConfig);
      case 'replace-action-sequence':
        return this.run<SequenceResponse>('replace-action-sequence', args, formatSequence);
      case 'add-action':
        return this.run<SequenceResponse>('add-action', args, formatSequence);
      case 'insert-action':
        return this.run<SequenceResponse>('insert-action', args, formatSequence);
      case 'update-action':
        return this.run<SequenceResponse>('update-action', args, formatSequence);
      case 'remove-action':
        return this.run<SequenceResponse>('remove-action', args, formatSequence);
      case 'reorder-actions':
        return this.run<SequenceResponse>('reorder-actions', args, formatSequence);
      case 'duplicate-action':
        return this.run<SequenceResponse>('duplicate-action', args, formatSequence);
      case 'set-variables':
        return this.run<SetVariablesResponse>('set-variables', args, formatSetVariables);
      case 'reset-history':
        return this.run<ResetHistoryResponse>('reset-history', args, formatResetHistory);
      case 'fire-trigger':
        return this.run<FireTriggerResponse>('fire-trigger', args, formatFire);
      case 'fire-trigger-as':
        return this.run<FireTriggerAsResponse>('fire-trigger-as', args, formatFireAs);
      case 'find-trigger-tile':
        return this.run<FindTriggerTileResponse>('find-trigger-tile', args, formatFindTriggerTile);
      case 'link-region-trigger':
        return this.run<LinkRegionResponse>('link-region-trigger', args, formatLinkRegion);
      default: {
        const _exhaustive: never = args;
        return this.errorResponse('unknown', `unknown action: ${String((_exhaustive as any)?.action)}`);
      }
    }
  }

  /** Run one action: typed query + format, or BaseTool.errorResponse on throw. */
  private async run<T>(
    action: string,
    args: Record<string, unknown>,
    fmt: (d: T) => string,
  ) {
    try {
      const data = await this.query<T>('module-matt', args);
      // Phase 11 (R11.1): mutation actions attach structuredContent (the raw data);
      // content[0].text === fmt(data) is unchanged from before.
      // BUG-395 round 2: read actions now also attach structuredContent so structured-field
      // probes don't false-FAIL. Text content is unchanged; errors/MODULE_NOT_ACTIVE stay text-only.
      if (MATT_MUTATION_ACTIONS.has(action)) {
        MattMutationOutput.parse(data as Record<string, unknown>);
        return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data };
      }
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse(action, e instanceof Error ? e.message : String(e));
    }
  }
}
