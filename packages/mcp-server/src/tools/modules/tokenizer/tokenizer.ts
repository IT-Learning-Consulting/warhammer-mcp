// tokenizer-2-integration plan Phase 2 — module-tokenizer MCP tool.
//
// Umbrella tool exposing 7 actions for Tokenizer 2 (headless token-image compositor).
// Conditional: MODULE_NOT_ACTIVE returned when tokenizer-2 is absent/inactive.
// No readOnlyHint — most actions write actor documents / filesystem images.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response.
//   - Follows the module-tagger tool pattern (registration acceptance checks, error routing).

import { z } from 'zod';
import { ErrorTokens } from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { ModuleTokenizerInput } from '@foundry-mcp/shared';

type ModuleTokenizerArgs = z.infer<typeof ModuleTokenizerInput>;

// ── Response shapes (DP-15 — typed, never <any>) ─────────────────────────────

interface TokenizeResult {
  actorUuid?: string;
  tokenPath?: string | null;
  updatedActor?: boolean;
  prototypeTokenTexture?: string | null;
}

interface TokenizeBatchItem {
  actorUuid: string;
  result?: { tokenPath: string | null };
  error?: string;
}

interface TokenizeBatchResult {
  total?: number;
  succeeded?: number;
  failed?: number;
  results?: TokenizeBatchItem[];
}

interface ExportLayersResult {
  exportPath?: string | null;
}

interface RegisterCustomFrameResult {
  name?: string;
  path?: string;
}

interface CleanupFlagsResult {
  scope?: number | 'world';
}

interface GetSettingsResult {
  settings?: Record<string, unknown>;
}

interface ListRegisteredResult {
  frames?: string[];
  plugins?: string[];
}

type TokenizerResult =
  | TokenizeResult
  | TokenizeBatchResult
  | ExportLayersResult
  | RegisterCustomFrameResult
  | CleanupFlagsResult
  | GetSettingsResult
  | ListRegisteredResult;

// ── Format helpers ────────────────────────────────────────────────────────────

function formatTokenize(r: TokenizeResult): string {
  return `module-tokenizer.tokenize: actor ${r.actorUuid} → ${r.tokenPath ?? '(no path returned)'}. Actor updated: ${r.updatedActor ?? false}. prototypeToken.texture.src: ${r.prototypeTokenTexture ?? '(unchanged)'}`;
}

function formatTokenizeBatch(r: TokenizeBatchResult): string {
  const lines = (r.results ?? []).map((item) =>
    item.error ? `- ${item.actorUuid}: ERROR — ${item.error}` : `- ${item.actorUuid}: ${item.result?.tokenPath ?? '(no path)'}`
  );
  return `module-tokenizer.tokenize-batch: ${r.succeeded ?? 0}/${r.total ?? 0} succeeded, ${r.failed ?? 0} failed.\n\n${lines.join('\n')}`;
}

function formatExportLayers(r: ExportLayersResult): string {
  return `module-tokenizer.export-layers: exported to ${r.exportPath ?? '(no path returned)'}`;
}

function formatRegisterCustomFrame(r: RegisterCustomFrameResult): string {
  return `module-tokenizer.register-custom-frame: registered "${r.name}" → ${r.path}`;
}

function formatCleanupFlags(r: CleanupFlagsResult): string {
  return `module-tokenizer.cleanup-flags: cleaned up ${r.scope === 'world' ? 'world-wide' : `${r.scope} actor(s)`}`;
}

function formatGetSettings(r: GetSettingsResult): string {
  const lines = Object.entries(r.settings ?? {}).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`);
  return `module-tokenizer.get-settings:\n\n${lines.join('\n')}`;
}

function formatListRegistered(r: ListRegisteredResult): string {
  return `module-tokenizer.list-registered:\nFrames: [${(r.frames ?? []).join(', ')}]\nPlugins: [${(r.plugins ?? []).join(', ')}]`;
}

// ── Tool-definition constants (kept out of getToolDefinitions to stay under the lint line cap) ──

const TOOL_DESCRIPTION = `Non-destructive layered token-image compositing via the Tokenizer 2 module's headless (dialog-free) API.
Conditional: returns MODULE_NOT_ACTIVE when tokenizer-2 module is absent/inactive.
Pre-flight: module-probe.is-active tokenizer-2 before using this tool.

Use this when:
- Compositing a new token image for an actor from a portrait + frame/mask/background, writing it to prototypeToken.texture.src.
- Batch-tokenizing many actors at once (e.g. after a bulk NPC import) with a shared frame/style.
- Exporting a declarative or captured layer stack to disk without writing to any actor.
- Registering a custom frame asset for reuse across future tokenize calls.
- Reading Tokenizer's world settings or the registered frame/plugin catalog, or sweeping stale per-actor Tokenizer flags.

7 actions:
- tokenize              { actorUuid, frameSrc?, maskSrc?, backgroundSrc?, skipRing?, skipBackground?, disposition?, exportSize?, exportFormat?, saveFolder?, filename?, updateActor?, useActorImg?, forceDynamicRing?, forceBakedRing?, wildcardMode? } — composite one actor's token image; writes prototypeToken.texture.src + avatar + FS image unless updateActor:false.
- tokenize-batch        { actorUuids, confirm, ...same opts as tokenize }        — batch-tokenize many actors; requires confirm:true (CCR-4). Partial-failure safe: never hard-throws on one actor.
- export-layers         { layers? | layerStack?, exportSize?, exportFormat?, saveFolder?, filename? } — export a declarative layer stack (or an opaque captured layerStack) to disk; no actor write.
- register-custom-frame { name, path, config? }                                  — persist a custom frame into the custom-frames world setting.
- cleanup-flags         { actorUuids?, confirm }                                 — sweep stale Tokenizer actor flags; requires confirm:true (CCR-4). Omit actorUuids to sweep world-wide.
- get-settings          { keys? }                                                — read Tokenizer world settings (default: export-format, export-size, save-location, custom-frames).
- list-registered       {}                                                       — snapshot the frame/plugin registries.

POPOUT / BORDERLESS TOKENS: pass skipBackground:true + skipRing:true (or a maskSrc) to tokenize for a transparent-background subject that breaks the ring. For full control, capture a layerStack from one interactive editor session and replay it across actors via export-layers.

EXCLUDED: openEditor, openEditorStandalone, TokenizerConfigDialog.prompt, and the interactive TokenImageEditor class are intentionally NOT wired — they open a blocking Foundry UI/dialog that would deadlock the MCP socket.

GM required for all actions.

Examples:
- { action: "tokenize", actorUuid: "Actor.abc123", updateActor: true }
- { action: "tokenize", actorUuid: "Actor.abc123", skipBackground: true, skipRing: true }
- { action: "tokenize-batch", actorUuids: ["Actor.abc","Actor.def"], confirm: true }
- { action: "get-settings" }

Do NOT use this tool for a manual one-off texture path swap — use the \`token\` (core) tool's texture field update for that. module-tokenizer is for compositing a NEW layered image from frame/mask/background sources; it is not a plain texture-path setter.

Performance Notes:
- tokenize/register-custom-frame/cleanup-flags: small fixed-shape confirmation (a written path, a registered frame, or a cleanup scope) — no response modes, no pagination.
- tokenize-batch: response size scales with actorUuids count (one result line per actor) — no built-in cap; keep batches to a reasonable size for a readable response.
- export-layers/get-settings/list-registered: small fixed-shape response — no pagination.`;

const TOOL_INPUT_PROPERTIES = {
  action: {
    type: 'string',
    enum: ['tokenize', 'tokenize-batch', 'export-layers', 'register-custom-frame', 'cleanup-flags', 'get-settings', 'list-registered'],
    description: 'Tokenizer 2 action to perform.',
  },
  actorUuid: { type: 'string', description: '[tokenize] Target actor UUID.' },
  actorUuids: { type: 'array', items: { type: 'string' }, description: '[tokenize-batch/cleanup-flags] Target actor UUIDs. Omit on cleanup-flags to sweep world-wide.' },
  frameSrc: { type: 'string', description: '[tokenize] Path to a frame image, or a registered frame name.' },
  maskSrc: { type: 'string', description: '[tokenize] Path to a mask image; combine with skipRing/skipBackground for popout composition.' },
  backgroundSrc: { type: 'string', description: '[tokenize] Path to a background image.' },
  skipRing: { type: 'boolean', description: '[tokenize] Omit the ring/frame layer entirely (popout idiom).' },
  skipBackground: { type: 'boolean', description: '[tokenize] Omit the background layer, leaving transparency (popout idiom).' },
  disposition: { type: 'string', description: '[tokenize] Token disposition to bake into ring color selection.' },
  exportSize: { type: 'number', description: '[tokenize/export-layers] Output image size in px (module caps at 4096).' },
  exportFormat: { type: 'string', enum: ['webp', 'png'], description: '[tokenize/export-layers] Output image format.' },
  saveFolder: { type: 'string', description: '[tokenize/export-layers] Override the configured save-location for this call.' },
  filename: { type: 'string', description: '[tokenize/export-layers] Override the generated filename.' },
  updateActor: { type: 'boolean', description: '[tokenize] Write the result to actor.prototypeToken.texture.src + avatar (default true).' },
  useActorImg: { type: 'boolean', description: '[tokenize] Source the portrait from the actor\'s current image instead of a supplied path.' },
  forceDynamicRing: { type: 'boolean', description: '[tokenize] Force Foundry\'s dynamic-token-ring path.' },
  forceBakedRing: { type: 'boolean', description: '[tokenize] Force a baked (non-dynamic) ring composited into the export.' },
  wildcardMode: { type: 'boolean', description: '[tokenize] Treat the source path as a wildcard token image set.' },
  layers: {
    type: 'array',
    items: { type: 'object' },
    description: '[export-layers] Declarative layer stack (paths + transforms). Use this OR layerStack, not both.',
  },
  layerStack: {
    oneOf: [{ type: 'object' }, { type: 'array' }],
    description: '[export-layers] Opaque layerStack blob captured from one interactive editor session, replayed as-is. Use this OR layers, not both.',
  },
  name: { type: 'string', description: '[register-custom-frame] Frame name to register.' },
  path: { type: 'string', description: '[register-custom-frame] Path to the frame image.' },
  config: { type: 'object', description: '[register-custom-frame] Optional frame config (border insets, etc).' },
  keys: { type: 'array', items: { type: 'string' }, description: '[get-settings] Setting keys to read (default: export-format, export-size, save-location, custom-frames).' },
  confirm: { type: 'boolean', description: '[tokenize-batch/cleanup-flags] Required true — bulk write across many actors/files.' },
};

// per-branch required sets generated from ModuleTokenizerInput's own Zod discriminated union.
const TOOL_INPUT_ALLOF = [
  { if: { properties: { action: { const: 'tokenize' } } }, then: { required: ['actorUuid'] } },
  { if: { properties: { action: { const: 'tokenize-batch' } } }, then: { required: ['actorUuids'] } },
  { if: { properties: { action: { const: 'register-custom-frame' } } }, then: { required: ['name', 'path'] } },
];

const RESULT_FORMATTERS: Record<string, (data: TokenizerResult) => string> = {
  'tokenize': (d) => formatTokenize(d as TokenizeResult),
  'tokenize-batch': (d) => formatTokenizeBatch(d as TokenizeBatchResult),
  'export-layers': (d) => formatExportLayers(d as ExportLayersResult),
  'register-custom-frame': (d) => formatRegisterCustomFrame(d as RegisterCustomFrameResult),
  'cleanup-flags': (d) => formatCleanupFlags(d as CleanupFlagsResult),
  'get-settings': (d) => formatGetSettings(d as GetSettingsResult),
  'list-registered': (d) => formatListRegistered(d as ListRegisteredResult),
};

export interface ModuleTokenizerToolOptions extends BaseToolOptions {}

export class ModuleTokenizerTool extends BaseTool {
  constructor(options: ModuleTokenizerToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'module-tokenizer', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-tokenizer',
        title: 'Tokenizer 2 — headless token-image compositor',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: TOOL_DESCRIPTION,
        inputSchema: {
          type: 'object',
          properties: TOOL_INPUT_PROPERTIES,
          required: ['action'],
          allOf: TOOL_INPUT_ALLOF,
        },
      },
    ];
  }

  async execute(args: ModuleTokenizerArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-tokenizer action', { action });
    try {
      const data = await this.query<TokenizerResult>('module-tokenizer', args);
      const format = RESULT_FORMATTERS[action];
      const text = format ? format(data) : JSON.stringify(data);
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-tokenizer', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
