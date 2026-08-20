// Module Integration v1 Phase 9 — module-robak MCP tool.
//
// Single-action thin tool exposing wfrp4e-macros-and-more's headless skill roll.
// Conditional: MODULE_NOT_ACTIVE returned when wfrp4e-macros-and-more is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - Phase 9 module_integration_v1 — dossier §3 (CAP-01) + §5.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import type { RobakRollResult } from './schemas.js';
import { z } from 'zod';
import { ModuleRobakInput } from '@foundry-mcp/shared';

type ModuleRobakArgs = z.infer<typeof ModuleRobakInput>;

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


function formatRoll(r: RobakRollResult): string {
  const sl = r.sl ?? '?';
  const outcome = r.outcome ?? '(outcome unavailable)';
  const roll = r.roll ?? '?';
  const who = r.actorName ?? r.actorId;
  return `module-robak.roll-skill-silent: ${who} rolled ${r.skill} — roll ${roll}, SL ${sl}, ${outcome} (silent; posted in rollMode).`;
}

export interface ModuleRobakToolOptions extends BaseToolOptions {}

export class ModuleRobakTool extends BaseTool {
  constructor(options: ModuleRobakToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-robak', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-robak',
        title: "Robak's Macros — headless skill roll",
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Headless GM-controlled WFRP4e SKILL test via the wfrp4e-macros-and-more (Robak) module's SocketHandlers.rollSkill.
Conditional: returns MODULE_NOT_ACTIVE when wfrp4e-macros-and-more is absent/inactive.
Pre-flight: module-probe.is-active wfrp4e-macros-and-more before using this tool.

Unlike request-player-rolls (which opens a player dialog and waits), this fires IMMEDIATELY and is
INVISIBLE to the player — it posts a chat message in rollMode. Use for GM secret rolls: Perception to
notice an ambush, Cool under fire, passive-talent triggers (Sixth Sense, Trapper, Nose for Trouble).

SKILL NAMES ONLY (BUG-359): robak's rollSkill calls actor.setupSkill(skill) directly — it does NOT
resolve characteristic names or keys ("Agility", "ag"). Pass the exact skill name as it appears on the
actor's sheet ("Perception", "Cool", "Stealth (Rural)"). A characteristic name/key returns
ROBAK_ROLL_FAILED (no skill by that name). For a pure characteristic test, use a wfrp4e system macro
or the dice-roll tool instead.

Use this when:
- Resolving a GM-secret skill test the player should never see the dialog for (an ambush Perception check, a passive Cool test under fire).
- Triggering a passive-talent check silently (Sixth Sense, Trapper, Nose for Trouble) without interrupting play with a dialog.
- Applying a difficulty band or flat modifier to a skill roll while keeping the result hidden or GM-only via rollMode.
- Resolving any skill test where waiting on a player-facing dialog (request-player-rolls) would be the wrong UX.

1 action:
- roll-skill-silent { actorId, skill, options? } — rolls a named skill immediately, no dialog.
  - skill: exact skill name as it appears on the actor ("Perception", "Cool", "Dodge"). Characteristic names/keys are NOT supported.
  - options.difficulty: easy | average | challenging | hard | veryHard | daunting | impossible
  - options.modifier: flat numeric bonus/penalty
  - options.rollMode: gmroll | blindroll | publicroll | selfroll

GM required. No confirm needed (no destructive state change beyond the chat record).

Example:
- { action: "roll-skill-silent", actorId: "Actor.abc123", skill: "Perception", options: { difficulty: "average" } }

Do NOT use this tool for a pure characteristic test — use \`dice-roll\` for that. module-robak resolves SKILL names only (via actor.setupSkill); a characteristic name/key ("Agility", "ag") returns ROBAK_ROLL_FAILED (BUG-359).

Performance Notes:
- roll-skill-silent returns a single small fixed-shape result (roll, SL, outcome) — no response modes, no pagination.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['roll-skill-silent'],
              description: 'Robak action to perform.',
            },
            actorId: {
              type: 'string',
              description: 'Target actor UUID (e.g. "Actor.abc123") or world-document id.',
            },
            skill: {
              type: 'string',
              description: 'Exact skill name as it appears on the actor sheet ("Perception", "Cool", "Dodge"). Characteristic names/keys ("Agility", "ag") are NOT supported — robak calls setupSkill() directly (BUG-359).',
            },
            options: {
              type: 'object',
              description: 'Optional roll modifiers.',
              properties: {
                difficulty: {
                  type: 'string',
                  enum: ['easy', 'average', 'challenging', 'hard', 'veryHard', 'daunting', 'impossible'],
                  description: 'WFRP4e difficulty band.',
                },
                modifier: { type: 'number', description: 'Flat bonus/penalty applied to the test target.' },
                rollMode: {
                  type: 'string',
                  enum: ['gmroll', 'blindroll', 'publicroll', 'selfroll'],
                  description: 'Chat visibility of the posted roll.',
                },
              },
            },
          },
          required: ['action', 'actorId', 'skill'],
        },
      },
    ];
  }

  async execute(args: ModuleRobakArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-robak action', { action });
    try {
      const data = await this.query<RobakRollResult>('module-robak', args);
      return { content: [{ type: 'text' as const, text: formatRoll(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-robak', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
