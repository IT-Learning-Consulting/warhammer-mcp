import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';
// Phase 2 mcp_coverage_expansion — dice-roll tool (roll/validate/simulate over Foundry Roll).
import { DiceRollToolInput, ChatMessageId } from '@foundry-mcp/shared';

// The MCP-side arg parser for request-player-rolls. Distinct from the shared
// RequestPlayerRollsInput, which mirrors the Foundry-side payload and deliberately
// lacks the MCP-only fields (userConfirmedVisibility, awaitResult). Exported so the
// BUG-330 parity test can lock the published inputSchema against the ACTUAL parser.
export const RequestPlayerRollsArgs = z.object({
  rollType: z.enum(['ability', 'characteristic', 'skill', 'save', 'attack', 'initiative', 'custom']),
  rollTarget: z.string(),
  targetPlayer: z.string(),
  isPublic: z.boolean(),
  userConfirmedVisibility: z.literal(true),
  rollModifier: z.string().default(''),
  flavor: z.string().default(''),
  awaitResult: z.boolean().optional().default(false),
});

// ── dice-roll response interfaces (CCR-1: concrete generics on this.query, never <any>) ──

type DiceRollArgs = z.infer<typeof DiceRollToolInput>;
type DiceArgsFor<A extends DiceRollArgs['action']> = Extract<DiceRollArgs, { action: A }>;

interface SerializedRollTerm {
  class: string;
  formula: string;
  total: number | null;
  evaluated: boolean;
  results?: Array<{ result: number; active: boolean; discarded?: boolean }>;
}

interface DiceRollRollResponse {
  total: number;
  formula: string;
  result: string;
  terms: SerializedRollTerm[];
  messageId?: ChatMessageId | null;
}

interface DiceRollValidateResponse {
  valid: boolean;
  formula: string;
}

interface DiceRollSimulateResponse {
  totals: number[];
  n: number;
  min: number;
  max: number;
  mean: number;
}

function diceErrorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `❌ **dice-roll/${action} failed**\n\n${message}` }],
    isError: true,
  };
}

export class DiceRollTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'request-player-rolls',
        title: 'Request Player Rolls',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: 'Request dice rolls from players with interactive buttons. Creates roll buttons in Foundry chat that players can click. Supports both D&D 5e (d20 system) and WFRP 4e (d100 system). Examples: "Roll Weapon Skill for Hans" (WFRP), "Test Willpower against fear" (WFRP), "Roll stealth for Clark" (D&D), "Make a perception check" (D&D). VISIBILITY WORKFLOW: Before calling this function, ensure the user has specified whether they want a public or private roll. If they have already specified "public" or "private" in their request (e.g., "public performance check", "private stealth roll"), you can proceed directly. If the visibility is ambiguous or unspecified, ask: "Do you want this to be a PUBLIC roll (visible to all players) or PRIVATE roll (visible to player and GM only)?" and wait for their answer. Supports character-to-player resolution and GM fallback.',
        inputSchema: {
          type: 'object',
          properties: {
            rollType: {
              type: 'string',
              description: 'Type of roll to request. D&D: ability, skill, save, attack, initiative. WFRP: characteristic (for WS/BS/S/T/I/Ag/Dex/Int/WP/Fel tests), skill (for WFRP skills like Melee/Ranged/Channelling), custom',
              enum: ['ability', 'characteristic', 'skill', 'save', 'attack', 'initiative', 'custom']
            },
            rollTarget: {
              type: 'string',
              description: 'Target for the roll. D&D: ability name (str, dex, con, int, wis, cha), skill name (perception, insight, stealth, etc.). WFRP: characteristic code (ws, bs, s, t, i, ag, dex, int, wp, fel) or skill name (melee, ranged, channelling, charm, etc.), or custom roll formula (e.g., "1d100<=50")'
            },
            targetPlayer: {
              type: 'string',
              description: 'Player name or character name to request the roll from'
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether the roll should be public (true = visible to all players) or private (false = visible only to target player and GM).'
            },
            userConfirmedVisibility: {
              type: 'boolean',
              const: true,
              description: 'REQUIRED: Must be set to true to confirm the roll visibility has been determined. This can happen in two ways: 1) User explicitly specified "public" or "private" in their original request (e.g., "public stealth check"), or 2) You asked the clarifying question and received their answer. Only set this to true when you are confident about the visibility preference, either from their original request or from a direct answer to your question.'
            },
            rollModifier: {
              type: 'string',
              description: 'Optional modifier to add to the roll. D&D: "+2", "-1", "+1d4". WFRP: "+10", "-20" (modifies target number for d100 rolls)',
              default: ''
            },
            flavor: {
              type: 'string',
              description: 'Optional flavor text to describe the roll context (e.g., "Testing fear against the approaching beastmen", "Sneaking past the guard")',
              default: ''
            },
            awaitResult: {
              type: 'boolean',
              description: 'Optional. When true, the tool awaits the player completing the roll and returns a structured result envelope with outcome/total/SL/success (WFRP roll-under: SL = tens(target) - tens(roll); SL/success are null for formulas without a <=target clause). When false or omitted (default), returns immediately with fire-and-forget acknowledgement.',
              default: false
            }
          },
          required: ['rollType', 'rollTarget', 'targetPlayer', 'isPublic', 'userConfirmedVisibility']
        }
      },
      // Phase 2 mcp_coverage_expansion — GM-side immediate formula evaluation.
      {
        name: 'dice-roll',
        title: 'Dice Roll (immediate)',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Immediately evaluate a dice formula GM-side and return the result. For INTERACTIVE player roll buttons (a player clicks to roll), use request-player-rolls instead — this tool rolls now and hands back the numbers.

**Actions:**
- **roll**: Evaluate a formula. Required: formula (e.g. "4d6kh3+2", "1d100", "2d10+@characteristics.ws.value"). Optional: actorId (resolves @-paths via the actor's roll data), createMessage (post the result to chat), rollMode (publicroll/gmroll/blindroll/selfroll), flavor (chat label), speaker ({alias?, actor?, token?, scene?} ids). Returns {total, formula, result, terms[], messageId?}.
- **validate**: Check whether a formula is parseable WITHOUT rolling it. Required: formula. Returns {valid:boolean, formula}. A bad formula returns valid:false (it does not error).
- **simulate**: Monte-Carlo a formula's distribution. Required: formula, n (1–1000). Returns {totals[], n, min, max, mean}.

**Notes:**
- Thin primitive: no WFRP rules. Actor formulas read the actor's roll data only.
- @-path formulas need an actorId; without it, @refs resolve to 0.
- n is capped at 1000 (larger samples are rejected — use mean/min/max for the shape).

**Examples:**
- roll: {action:"roll", formula:"4d6kh3+2"}
- roll with actor: {action:"roll", formula:"1d100", actorId:"abc123", flavor:"Weapon Skill test", createMessage:true}
- validate: {action:"validate", formula:"1d20+"}
- simulate: {action:"simulate", formula:"1d6", n:1000}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['roll', 'validate', 'simulate'],
              description: 'The dice-roll action to perform.',
            },
            formula: {
              type: 'string',
              description: 'Dice formula to evaluate (all actions). E.g. "4d6kh3+2", "1d100", "2d10+@characteristics.ws.value".',
            },
            actorId: {
              type: 'string',
              description: '[roll] Actor id whose roll data resolves @-path references in the formula.',
            },
            createMessage: {
              type: 'boolean',
              description: '[roll] If true, post the roll as a ChatMessage and return its messageId.',
            },
            rollMode: {
              type: 'string',
              enum: ['publicroll', 'gmroll', 'blindroll', 'selfroll'],
              description: '[roll] Visibility mode for the posted message (only with createMessage).',
            },
            flavor: {
              type: 'string',
              description: '[roll] Flavor/label text for the posted message (only with createMessage).',
            },
            speaker: {
              type: 'object',
              description: '[roll] Optional speaker override for the posted message.',
              properties: {
                alias: { type: 'string', description: 'Display name for the speaker.' },
                actor: { type: 'string', description: 'Actor id.' },
                token: { type: 'string', description: 'Token id (requires scene).' },
                scene: { type: 'string', description: 'Scene id.' },
              },
            },
            n: {
              type: 'integer',
              minimum: 1,
              maximum: 1000,
              description: '[simulate] Number of simulations (1–1000).',
            },
          },
          required: ['action', 'formula'],
        },
      },
    ];
  }

  async handleRequestPlayerRolls(args: any) {
    try {
      const params = RequestPlayerRollsArgs.parse(args);

      // Validation should be handled by schema, but add extra safety checks
      if (typeof params.isPublic !== 'boolean') {
        return 'Please specify whether you want this to be a PUBLIC roll (visible to all players) or PRIVATE roll (visible only to the target player and GM). You must provide either "true" for public or "false" for private.';
      }

      if (params.userConfirmedVisibility !== true) {
        return 'You must determine the roll visibility before calling this function. Either: 1) The user already specified "public" or "private" in their request, or 2) You need to ask: "Do you want this to be a PUBLIC roll or PRIVATE roll?" Set userConfirmedVisibility to true only when you are confident about the visibility preference.';
      }

      // Strip MCP-tool-only + awaitResult fields; Foundry handler's strict schema rejects unknown keys.
      const { userConfirmedVisibility: _uc, awaitResult, ...foundryPayload } = params;

      interface RollRequestResponse { requestId?: string; message?: string } // requestId: not a branded id (polymorphic / non-document)
      const response = await this.query<RollRequestResponse>('request-player-rolls', foundryPayload);

      if (awaitResult && response?.requestId) {
        try {
          const result = await this.foundryClient.pendingEvents.register(response.requestId);
          return `Roll completed. ${JSON.stringify(result)}`;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return `Roll request sent but await timed out or failed: ${msg}`;
        }
      }

      return `Roll request sent successfully! ${response?.message ?? ''}`;
    } catch (error) {
      this.logger.error('Error requesting player rolls', error);
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => {
          if (e.path.includes('isPublic')) {
            return 'You must specify whether the roll should be PUBLIC (visible to all players) or PRIVATE (visible only to target player and GM). Check if the user already specified this in their request, or ask them to clarify.';
          }
          return e.message;
        });
        return `Parameter error: ${messages.join(', ')}`;
      }
      throw error;
    }
  }

  // ── Phase 2 mcp_coverage_expansion — dice-roll (immediate evaluation) ──────────

  async handleDiceRoll(args: unknown) {
    let params: DiceRollArgs;
    try {
      params = DiceRollToolInput.parse(args);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`);
        return diceErrorContent('dice-roll', messages.join('; '));
      }
      return diceErrorContent('dice-roll', error instanceof Error ? error.message : String(error));
    }

    switch (params.action) {
      case 'roll':
        return this.handleRoll(params);
      case 'validate':
        return this.handleValidate(params);
      case 'simulate':
        return this.handleSimulate(params);
    }
  }

  private async handleRoll(args: DiceArgsFor<'roll'>) {
    try {
      const data = await this.query<DiceRollRollResponse>('dice-roll', args);
      const termLines = data.terms
        .map((t) => `  - ${t.class} \`${t.formula}\`${t.total !== null ? ` = ${t.total}` : ''}`)
        .join('\n');
      let text =
        `🎲 **Roll** \`${data.formula}\`\n\n` +
        `- **Total:** ${data.total}\n` +
        `- **Result:** ${data.result}`;
      if (data.terms.length) text += `\n- **Terms:**\n${termLines}`;
      if (data.messageId) text += `\n- **Message:** \`${data.messageId}\``;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return diceErrorContent('roll', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleValidate(args: DiceArgsFor<'validate'>) {
    try {
      const data = await this.query<DiceRollValidateResponse>('dice-roll', args);
      const text = `🎲 **Validate** \`${data.formula}\`\n\n- **Valid:** ${data.valid ? '✅ yes' : '❌ no'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return diceErrorContent('validate', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSimulate(args: DiceArgsFor<'simulate'>) {
    try {
      const data = await this.query<DiceRollSimulateResponse>('dice-roll', args);
      const text =
        `🎲 **Simulate** \`${args.formula}\` (n=${data.n})\n\n` +
        `- **Mean:** ${data.mean.toFixed(2)}\n` +
        `- **Min:** ${data.min}\n` +
        `- **Max:** ${data.max}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return diceErrorContent('simulate', e instanceof Error ? e.message : String(e));
    }
  }
}
