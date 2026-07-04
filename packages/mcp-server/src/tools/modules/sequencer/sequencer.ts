// Module Integration v1 Phase 5B — module-sequencer MCP tool.
//
// Umbrella tool exposing ~16 actions for the Sequencer animation/sound engine.
// Conditional: MODULE_NOT_ACTIVE returned when sequencer is absent/inactive.
// Macro-node ALLOWLIST guard runs in the foundry-module handler (SA2).
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any>.
//   - R2.4: errors route through the shared BaseTool.errorResponse.
//   - Phase 5 module_integration_v1 acceptance criteria #2.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import {
  ErrorTokens, SceneId } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleSequencerInput } from '@foundry-mcp/shared';

type ModuleSequencerArgs = z.infer<typeof ModuleSequencerInput>;

// ── Response shapes (DP-15) ───────────────────────────────────────────────────

interface SequencerPlayResult {
  played?: boolean;
  sectionCount?: number;
  note?: string;
  file?: string;
  preloaded?: number;
  target?: string;
}

interface EffectData {
  id: string | null;
  name: string | null;
  origin: string | null;
  source: string | null;
  target: string | null;
  sceneId: SceneId | null;
  persist: boolean;
  file: string | null;
  temporary: unknown;
}

interface SequencerEffectsResult {
  effects?: EffectData[];
  sounds?: EffectData[];
  count?: number;
  updatedCount?: number;
  ended?: boolean;
  filter?: Record<string, unknown>;
  sceneId?: SceneId | null;
}

interface DatabaseResult {
  path?: string;
  results?: string[];
  paths?: string[];
  files?: string[];
  count?: number;
  exists?: boolean;
}

interface PermissionWriteResult {
  key?: string;
  value?: number;
  verified?: number;
}

type SequencerResult = SequencerPlayResult | SequencerEffectsResult | DatabaseResult | PermissionWriteResult;

// ── Error helper ──────────────────────────────────────────────────────────────


// ── Format helpers ────────────────────────────────────────────────────────────

function formatPlay(r: SequencerPlayResult, action: string): string {
  if (action === 'play-sound') return `module-sequencer.play-sound: played ${r.file ?? 'sound'}`;
  if (action === 'preload') return `module-sequencer.preload: preloaded ${r.preloaded ?? 0} file(s) on GM client`;
  if (action === 'preload-for-clients') return `module-sequencer.preload-for-clients: preloaded ${r.preloaded ?? 0} file(s) for all clients`;
  return `module-sequencer.play-sequence-json: played ${r.sectionCount ?? 0} section(s). ${r.note ?? ''}`;
}

function formatEffects(r: SequencerEffectsResult, action: string): string {
  if (action === 'get-effects') {
    const effs = r.effects ?? [];
    if (effs.length === 0) return 'module-sequencer.get-effects: no effects running.';
    const lines = effs.map((e) => `- ${e.name ?? '(unnamed)'} [${e.file ?? '?'}] persist=${e.persist}`);
    return `module-sequencer.get-effects: ${effs.length} effect(s) running.\n\n${lines.join('\n')}`;
  }
  if (action === 'get-sounds') {
    const snds = r.sounds ?? [];
    if (snds.length === 0) return 'module-sequencer.get-sounds: no sounds running.';
    return `module-sequencer.get-sounds: ${snds.length} sound(s) running.`;
  }
  if (action === 'update-effects') return `module-sequencer.update-effects: updated ${r.updatedCount ?? 0} effect(s).`;
  if (action === 'end-all-effects') return `module-sequencer.end-all-effects: ended all effects (scene: ${r.sceneId ?? 'current'}).`;
  if (action === 'end-all-sounds') return `module-sequencer.end-all-sounds: ended all running sounds (all scenes).`;
  return `module-sequencer.${action}: done. Filter: ${JSON.stringify(r.filter ?? {})}`;
}

function formatDatabase(r: DatabaseResult, action: string): string {
  if (action === 'database-entry-exists') return `module-sequencer.database-entry-exists: "${r.path}" → ${r.exists ? 'EXISTS' : 'NOT FOUND'}`;
  if (action === 'database-get-entry') return `module-sequencer.database-get-entry: "${r.path}" → ${r.count ?? 0} file path(s).\n${(r.files ?? []).join('\n')}`;
  const items = r.results ?? r.paths ?? [];
  if (items.length === 0) return `module-sequencer.${action}: no results for "${r.path}".`;
  return `module-sequencer.${action}: ${items.length} result(s) for "${r.path}".\n\n${items.join('\n')}`;
}

export interface ModuleSequencerToolOptions extends BaseToolOptions {}

export class ModuleSequencerTool extends BaseTool {
  constructor(options: ModuleSequencerToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-sequencer', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-sequencer',
        title: 'Sequencer — animation, sound, and canvas effects',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Animation, positioned-sound, and canvas-effect engine via Sequencer module.
Conditional: returns MODULE_NOT_ACTIVE when sequencer is absent/inactive.
Pre-flight: module-probe.is-active sequencer before using this tool.

SAFETY — macro-node guard (SA2):
play-sequence-json inspects each section type against an ALLOWLIST before fromJSON().
Allowed types: ["effect","sound","scrollingText","canvasPan","wait"].
Any other type (macro, animation, crosshair, thenDo, unknown) → UNSAFE_SECTION_EXCLUDED.
This is an ALLOWLIST, not a denylist — unknown future types are denied by default.

~16 actions:
EFFECTS:
- play-sequence-json  { sequence }                    — Sequence.fromJSON(arr).play()
- end-effects         { filter? }                     — EffectManager.endEffects(filter)
- end-all-effects     { sceneId?, confirm:true }      — clears all effects (scene-level, confirm required)
- get-effects         { filter? }                     — returns serialized effect .data
- update-effects      { filter?, updates? }           — EffectManager.updateEffects
SOUNDS:
- play-sound          { file, options? }              — new Sequence().sound(file).play()
- end-sounds          { filter? }                     — SoundManager.endSounds
- end-all-sounds      { confirm:true }                — ends ALL running sounds (all scenes; Sequencer 4.2.x dropped per-scene scoping)
- get-sounds          { filter? }                     — returns serialized sound state
DATABASE (read-only):
- database-search     { path }                        — Database.searchFor(path)
- database-get-paths  { path }                        — Database.getPathsUnder(path)
- database-entry-exists { path }                      — Database.entryExists(path)
- database-get-entry  { path, softFail? }             — Database.getEntry(path)
  Returns DATABASE_NOT_POPULATED if autoanimations module is not active.
PRELOAD:
- preload             { files, showProgressBar? }     — Preloader.preload (GM client)
- preload-for-clients { files, showProgressBar?, confirm:true } — broadcasts to ALL clients
PERMISSIONS:
- permission-write    { key, value }                  — set Sequencer world permission (0-3)
  keys: permissions-effect-create|delete, permissions-sound-create, permissions-preload, permissions-sidebar-tools

GM required for all actions.

Examples:
- { action: "database-search", path: "autoanimations.melee" }
- { action: "play-sequence-json", sequence: [{"type":"effect","file":"jb2a.flames.orange"}] }
- { action: "end-all-effects", sceneId: "abc123", confirm: true }
- { action: "get-effects", filter: { name: "firebolt" } }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'play-sequence-json',
                'end-effects', 'end-all-effects', 'get-effects', 'update-effects',
                'play-sound', 'end-sounds', 'end-all-sounds', 'get-sounds',
                'database-search', 'database-get-paths', 'database-entry-exists', 'database-get-entry',
                'preload', 'preload-for-clients',
                'permission-write',
              ],
            },
            sequence: {
              type: 'array',
              items: { type: 'object' },
              description: '[play-sequence-json] Array of section objects. type must be in [effect,sound,scrollingText,canvasPan,wait].',
            },
            options: { type: 'object', description: '[play-sequence-json/play-sound] Play options passed to .play().' },
            filter: { type: 'object', description: '[end-effects/get-effects/update-effects/end-sounds/get-sounds] EffectManager InFilters: {name?,sceneId?,source?,target?,origin?,effects?}.' },
            updates: { type: 'object', description: '[update-effects] Property updates to apply to matched effects.' },
            sceneId: { type: 'string', description: '[end-all-effects] Limit to this scene ID. (end-all-sounds no longer accepts a scene — Sequencer 4.2.x ends all sounds globally.)' },
            confirm: { type: 'boolean', description: '[end-all-effects/end-all-sounds/preload-for-clients] Required true for destructive/broadcast actions.' },
            file: { type: 'string', description: '[play-sound] Sound file path.' },
            files: { type: 'array', items: { type: 'string' }, description: '[preload/preload-for-clients] File paths to preload.' },
            showProgressBar: { type: 'boolean', description: '[preload/preload-for-clients] Show loading progress bar.' },
            path: { type: 'string', description: '[database-*] Dot-notation database path (e.g. "autoanimations.melee.weapon").' },
            softFail: { type: 'boolean', description: '[database-get-entry] Return false instead of throwing on missing entry.' },
            key: {
              type: 'string',
              enum: ['permissions-effect-create', 'permissions-effect-delete', 'permissions-sound-create', 'permissions-preload', 'permissions-sidebar-tools'],
              description: '[permission-write] Sequencer world setting key.',
            },
            value: { type: 'number', minimum: 0, maximum: 3, description: '[permission-write] Permission role threshold (0=None, 1=Player, 2=Trusted, 3=Assistant/GM).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: ModuleSequencerArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-sequencer action', { action });
    try {
      const data = await this.query<SequencerResult>('module-sequencer', args);
      let text: string;
      if (['play-sequence-json', 'play-sound', 'preload', 'preload-for-clients'].includes(action)) {
        text = formatPlay(data as SequencerPlayResult, action);
      } else if (['database-search', 'database-get-paths', 'database-entry-exists', 'database-get-entry'].includes(action)) {
        text = formatDatabase(data as DatabaseResult, action);
      } else if (action === 'permission-write') {
        const r = data as PermissionWriteResult;
        text = `module-sequencer.permission-write: ${r.key} = ${r.value} (verified: ${r.verified})`;
      } else {
        text = formatEffects(data as SequencerEffectsResult, action);
      }
      return { content: [{ type: 'text' as const, text }], structuredContent: data as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-sequencer', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
