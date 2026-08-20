// Module Integration v1 Phase 15 — module-lighting MCP tool (CommunityLighting).
//
// Single read-only action: list-animations. Surfaces CONFIG.Canvas.lightAnimations (the
// CommunityLighting animation registry) as a clean list for GM scene-dressing selection.
// Conditional: MODULE_NOT_ACTIVE returned when CommunityLighting is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on the response.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - dossier CommunityLighting.md §5.1 (return shape).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleLightingInput } from '@foundry-mcp/shared';

type ModuleLightingArgs = z.infer<typeof ModuleLightingInput>;

// ── Response shape (DP-15 — typed, never <any>) ──────────────────────────────

interface AnimationEntry {
  key: string;
  label: string;
  author: string | null;
  hasCustomProperties: boolean;
  customPropertyKeys: string[];
}

interface ListAnimationsResult {
  animations: AnimationEntry[];
  count: number;
}

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


// ── Format helper ─────────────────────────────────────────────────────────────

function formatList(r: ListAnimationsResult): string {
  if (r.count === 0) {
    return 'module-lighting.list-animations: no CommunityLighting animations registered (CONFIG.Canvas.lightAnimations is empty of CL entries).';
  }
  const lines = r.animations.map((a) => {
    const cp = a.hasCustomProperties ? ` — custom props: [${a.customPropertyKeys.join(', ')}]` : '';
    return `  • ${a.key}  (author: ${a.author ?? 'unknown'})${cp}`;
  });
  return `module-lighting.list-animations: ${r.count} CommunityLighting animation(s):\n${lines.join('\n')}`;
}

export interface ModuleLightingToolOptions extends BaseToolOptions {}

export class ModuleLightingTool extends BaseTool {
  constructor(options: ModuleLightingToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-lighting', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-lighting',
        title: 'CommunityLighting — animation registry',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        description: `Read the CommunityLighting custom light-animation registry (CONFIG.Canvas.lightAnimations).
These animation-type keys are written to a light's animation.type to make it flicker/pulse/etc — apply them
via the core \`light\` umbrella's update action (changes.config.animation.type), or via the /foundry-light
atmosphere idioms. Per-animation flavor params (e.g. secondaryColor) are written as
flags.CommunityLighting.customProperties.
Conditional: returns MODULE_NOT_ACTIVE when CommunityLighting is absent/inactive.
Pre-flight: module-probe.is-active CommunityLighting before using this tool.

Use this when:
- Discovering which flicker/pulse/etc animation-type keys CommunityLighting has registered before configuring a light.
- Checking whether a candidate animation key takes custom flavor parameters (customPropertyKeys) before writing them via the core \`light\` tool.
- Building a scene-dressing menu of available light animations for the GM to pick from.
- Auditing the CommunityLighting registry after installing/updating the module or a light-animation-providing add-on.

1 action:
- list-animations { } — enumerate the effective CommunityLighting animations (separator + disabled
  entries filtered out). Each entry: { key, label, author, hasCustomProperties, customPropertyKeys }.
  customPropertyKeys are the per-animation param identifiers (varNames); the universal speed/intensity
  hint props are NOT counted. Apply a key with: light.update { changes: { config: { animation:
  { type: "<key>", speed: 5, intensity: 5 } } } }.

Examples:
- { action: "list-animations" }

Do NOT use this tool to actually APPLY an animation key to a light — use the core \`light\` tool's update action (changes.config.animation.type) for that. module-lighting only DISCOVERS/READS the registry of available animation keys; it never writes to a Light document itself.

Performance Notes:
- list-animations returns the full effective registry in one response — no response modes, no pagination. Size scales with how many CommunityLighting-providing modules/animations are installed, typically a short list (tens of entries).`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list-animations'],
              description: 'CommunityLighting action to perform.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: ModuleLightingArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-lighting action', { action });
    try {
      const data = await this.query<ListAnimationsResult>('module-lighting', args);
      return {
        content: [{ type: 'text' as const, text: formatList(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-lighting', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
