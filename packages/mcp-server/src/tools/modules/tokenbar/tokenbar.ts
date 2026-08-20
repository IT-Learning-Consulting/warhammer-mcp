// Module Integration v1 Phase 9 — module-tokenbar MCP tool.
//
// Single-action thin tool exposing monks-tokenbar's combat movement lock/unlock.
// Conditional: MODULE_NOT_ACTIVE returned when monks-tokenbar is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - Phase 9 module_integration_v1 — dossier §4 + §5.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type { TokenbarMovementResult } from './schemas.js';
import { z } from 'zod';
import { ModuleTokenbarInput } from '@foundry-mcp/shared';

type ModuleTokenbarArgs = z.infer<typeof ModuleTokenbarInput>;

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


function formatMovement(r: TokenbarMovementResult): string {
  if (r.scope === 'per-token') {
    return `module-tokenbar.change-movement: set movement "${r.movement}" on ${r.tokenCount ?? 0} token(s).`;
  }
  if (!r.applied) {
    return `module-tokenbar.change-movement: no change — ${r.note ?? 'not applied'}.`;
  }
  return `module-tokenbar.change-movement: global movement → "${r.movement}".`;
}

export interface ModuleTokenbarToolOptions extends BaseToolOptions {}

export class ModuleTokenbarTool extends BaseTool {
  constructor(options: ModuleTokenbarToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-tokenbar', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-tokenbar',
        title: "Monk's TokenBar — movement lock",
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        description: `Global or per-token combat movement lock/unlock via Monk's TokenBar (MonksTokenBarAPI.changeMovement).
Conditional: returns MODULE_NOT_ACTIVE when monks-tokenbar is absent/inactive.
Pre-flight: module-probe.is-active monks-tokenbar before using this tool.

Use this when:
- Locking down all token movement globally during a cutscene, puzzle, or GM-narrated moment.
- Restricting movement to only the current combatant during combat turns.
- Freeing movement globally again once the lockdown/turn restriction should end.
- Overriding movement for specific tokens only, independent of the global setting.

1 action:
- change-movement { movement, tokens? }
  - movement: "free" (all move) | "none" (all blocked) | "combat" (only current combatant)
  - tokens: optional array of token UUIDs — absent = global change; present = per-token override.

NOTES:
- "combat" global mode silently no-ops without an active combat — the response reports applied:false.
- "ignore" is NOT a valid movement value (it is only a monks-tokenbar movement-after-combat setting sentinel).
- monks-tokenbar auto-locks on combat start when its "change-to-combat" setting is true — check that
  setting before issuing a redundant "combat" lock (the /wfrp-combat delegate handles this).

GM required. No confirm (easily reversed world/token write).

Example:
- { action: "change-movement", movement: "none" }                              // full global lockdown
- { action: "change-movement", movement: "free", tokens: ["Scene.a.Token.b"] } // free one token

Do NOT use this tool for combat turn/round control — use \`advance-combat\` for that. module-tokenbar only locks/unlocks token movement; it never advances turns, rounds, or the combat tracker itself.

Performance Notes:
- change-movement returns a single small fixed-shape confirmation (the applied movement mode and affected token count) — no response modes, no pagination.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['change-movement'],
              description: 'TokenBar action to perform.',
            },
            movement: {
              type: 'string',
              enum: ['free', 'none', 'combat'],
              description: 'Movement mode. free=all move, none=all blocked, combat=only current combatant.',
            },
            tokens: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional token UUID(s) for a per-token override. Absent = global change.',
            },
          },
          required: ['action', 'movement'],
        },
      },
    ];
  }

  async execute(args: ModuleTokenbarArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-tokenbar action', { action });
    try {
      const data = await this.query<TokenbarMovementResult>('module-tokenbar', args);
      return { content: [{ type: 'text' as const, text: formatMovement(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-tokenbar', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
