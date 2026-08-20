// Phase 3 mcp_coverage_expansion — combatant umbrella tool.
//
// Per-combatant control beside the flat manage-combat tools (get-combat / list-combatants /
// advance-combat / add-combatants / remove-combatants / end-combat — all untouched).
// 7 actions: get-combatant / update-combatant / set-initiative / clear-initiative /
//   reroll-initiative / set-hidden / set-defeated.
//
// CCR-1 / BUG-069: all this.query<T> calls use concrete response interfaces, never <any>.
// CCR-6: write actions trigger notify.updated on the Foundry side.
// Listing combatants is the flat list-combatants tool's job (no umbrella list action — CCR-9).

import { z } from 'zod';
import { CombatantToolInput, CombatId, CombatantId, ActorId, TokenId } from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type CombatantArgs = z.infer<typeof CombatantToolInput>;
type ArgsFor<A extends CombatantArgs['action']> = Extract<CombatantArgs, { action: A }>;

// ── Inline response interfaces ────────────────────────────────────────────────

interface CombatantSnapshot {
  combatId: CombatId;
  id: string;
  name: string;
  img: string | null;
  actorId: ActorId | null;
  tokenId: TokenId | null;
  initiative: number | null;
  hidden: boolean;
  defeated: boolean;
  type: string | null;
}

interface CombatantInitiativeResponse {
  combatId: CombatId;
  combatantId: CombatantId;
  initiative: number;
  currentCombatantId: CombatantId | null;
  turnPointerStable: boolean;
}

interface CombatantClearInitiativeResponse {
  combatId: CombatId;
  combatantId: CombatantId;
  initiative: null;
}

interface CombatantHiddenResponse {
  combatId: CombatId;
  combatantId: CombatantId;
  hidden: boolean;
}

interface CombatantDefeatedResponse {
  combatId: CombatId;
  combatantId: CombatantId;
  defeated: boolean;
}

// ── Utilities ─────────────────────────────────────────────────────────────────


function snapshotLines(d: CombatantSnapshot): string {
  return (
    `- **name:** ${d.name}\n` +
    `- **initiative:** ${d.initiative ?? '_(unrolled)_'}\n` +
    `- **hidden:** ${d.hidden} · **defeated:** ${d.defeated}\n` +
    `- **actorId:** ${d.actorId ?? '_(none)_'} · **tokenId:** ${d.tokenId ?? '_(none)_'}`
  );
}

// ── Tool class ────────────────────────────────────────────────────────────────

export interface CombatantToolOptions extends BaseToolOptions {}

export class CombatantTool extends BaseTool {
  constructor(options: CombatantToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'combatant', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'combatant',
        title: 'Combatant (per-combatant control)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Per-combatant control over a single Combatant inside a Combat encounter — beside the flat combat-level tools (advance-combat for turn/round flow, add-combatants / remove-combatants / list-combatants for the roster). GM-only. 7 actions.

Use this when:
- Reading or writing fields on ONE known combatant (name, img, flags, hidden, defeated) via get-combatant / update-combatant.
- Setting, clearing, or rerolling a single combatant's initiative safely (set-initiative / clear-initiative / reroll-initiative) without corrupting the turn-order pointer.
- Toggling one combatant's hidden or defeated flag (set-hidden / set-defeated).

Do NOT use this for combat-level turn/round flow (start/next/prev) or bulk add/remove/list of combatants — use advance-combat (turn/round flow) or add-combatants / remove-combatants instead. Do NOT enumerate all combatants with this tool — use list-combatants for the flat per-combat listing.

**Actions:**
- **get-combatant**: Read one combatant's fields. Required: combatantId. Optional: combatId (defaults to the active combat).
- **update-combatant**: Write the allow-list fields {name, img, flags, hidden, defeated} (≥1). Required: combatantId, changes. **Rejects \`initiative\`** in changes — use set-initiative / clear-initiative / reroll-initiative (a raw initiative write corrupts the turn-order pointer).
- **set-initiative**: Set a literal initiative value via Combat.setInitiative (maintains turn-order sort + keeps the current-turn pointer stable). Required: combatantId, value (number).
- **clear-initiative**: Reset a combatant's initiative to null (unrolled). Required: combatantId.
- **reroll-initiative**: Reroll via Combat#rollInitiative (turn-pointer stable; posts a roll message to chat). Required: combatantId. Optional: formula (override; omit for the system default).
- **set-hidden**: Toggle the combatant's hidden flag. Required: combatantId, hidden (boolean).
- **set-defeated**: Toggle the combatant's defeated flag (core auto-applies the token "defeated" skull overlay). Required: combatantId, defeated (boolean).

**Notes:**
- combatId is optional everywhere; omit it to target the active combat.
- Listing all combatants is the flat \`list-combatants\` tool's job — this umbrella owns per-combatant ops only.

**Examples:**
- get-combatant: {action:"get-combatant", combatantId:"abc"}
- update-combatant: {action:"update-combatant", combatantId:"abc", changes:{name:"Slain Ogre"}}
- set-initiative: {action:"set-initiative", combatantId:"abc", value:15}
- reroll-initiative: {action:"reroll-initiative", combatantId:"abc"}
- set-defeated: {action:"set-defeated", combatantId:"abc", defeated:true}

Performance Notes:
- Action-based umbrella, no response-mode variance: each action returns a small structured result scoped to one combatant — never the full combat/combatant array.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-combatant',
                'update-combatant',
                'set-initiative',
                'clear-initiative',
                'reroll-initiative',
                'set-hidden',
                'set-defeated',
              ],
              description: 'The combatant action to perform.',
            },
            combatantId: {
              type: 'string',
              description: '[all actions] The Combatant document id to target.',
            },
            combatId: {
              type: 'string',
              description: '[all actions, optional] Combat id; omit to target the active combat.',
            },
            changes: {
              type: 'object',
              description:
                '[update-combatant] Allow-list fields to write (≥1): name, img, flags, hidden, defeated. ' +
                'initiative is rejected here — use set-initiative / clear-initiative / reroll-initiative.',
            },
            value: {
              type: 'number',
              description: '[set-initiative] The literal initiative value to assign.',
            },
            formula: {
              type: 'string',
              description: '[reroll-initiative, optional] Initiative formula override; omit for the system default.',
            },
            hidden: {
              type: 'boolean',
              description: '[set-hidden] Whether the combatant is hidden from players.',
            },
            defeated: {
              type: 'boolean',
              description: '[set-defeated] Whether the combatant is marked defeated.',
            },
          },
          required: ['action', 'combatantId'],
        },
      },
    ];
  }

  async execute(args: CombatantArgs) {
    this.logger.info('Executing combatant action', { action: args.action });
    switch (args.action) {
      case 'get-combatant':
        return this.handleGetCombatant(args);
      case 'update-combatant':
        return this.handleUpdateCombatant(args);
      case 'set-initiative':
        return this.handleSetInitiative(args);
      case 'clear-initiative':
        return this.handleClearInitiative(args);
      case 'reroll-initiative':
        return this.handleRerollInitiative(args);
      case 'set-hidden':
        return this.handleSetHidden(args);
      case 'set-defeated':
        return this.handleSetDefeated(args);
      default:
        // BUG-439: an unknown action must throw (clean isError envelope via the
        // dispatch catch) instead of falling through to an undefined result.
        throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: get-combatant, update-combatant, set-initiative, clear-initiative, reroll-initiative, set-hidden, set-defeated`);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  private async handleGetCombatant(args: ArgsFor<'get-combatant'>) {
    try {
      const d = await this.query<CombatantSnapshot>('combatant', args);
      const text = `🎯 **Combatant** — \`${d.id}\` (combat \`${d.combatId}\`)\n\n${snapshotLines(d)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('get-combatant', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdateCombatant(args: ArgsFor<'update-combatant'>) {
    try {
      const d = await this.query<CombatantSnapshot>('combatant', args);
      const changed = Object.keys(args.changes).join(', ');
      const text =
        `✅ **Combatant Updated** — \`${d.id}\` (combat \`${d.combatId}\`)\n\n` +
        `**Changed:** ${changed}\n\n${snapshotLines(d)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('update-combatant', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSetInitiative(args: ArgsFor<'set-initiative'>) {
    try {
      const d = await this.query<CombatantInitiativeResponse>('combatant', args);
      const text =
        `✅ **Initiative Set** — \`${d.combatantId}\` → **${d.initiative}**\n\n` +
        `- **turn pointer stable:** ${d.turnPointerStable}\n` +
        `- **current combatant:** ${d.currentCombatantId ?? '_(none)_'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('set-initiative', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleClearInitiative(args: ArgsFor<'clear-initiative'>) {
    try {
      const d = await this.query<CombatantClearInitiativeResponse>('combatant', args);
      const text = `✅ **Initiative Cleared** — \`${d.combatantId}\` (combat \`${d.combatId}\`) → null (unrolled)`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('clear-initiative', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleRerollInitiative(args: ArgsFor<'reroll-initiative'>) {
    try {
      const d = await this.query<CombatantInitiativeResponse>('combatant', args);
      const text =
        `🎲 **Initiative Rerolled** — \`${d.combatantId}\` → **${d.initiative}**\n\n` +
        `- **turn pointer stable:** ${d.turnPointerStable}\n` +
        `- **current combatant:** ${d.currentCombatantId ?? '_(none)_'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('reroll-initiative', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSetHidden(args: ArgsFor<'set-hidden'>) {
    try {
      const d = await this.query<CombatantHiddenResponse>('combatant', args);
      const text = `✅ **Hidden ${d.hidden ? 'Set' : 'Cleared'}** — \`${d.combatantId}\` → hidden:${d.hidden}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('set-hidden', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSetDefeated(args: ArgsFor<'set-defeated'>) {
    try {
      const d = await this.query<CombatantDefeatedResponse>('combatant', args);
      const text =
        `✅ **Defeated ${d.defeated ? 'Set' : 'Cleared'}** — \`${d.combatantId}\` → defeated:${d.defeated}` +
        (d.defeated ? ' (token skull overlay applied)' : '');
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse('set-defeated', e instanceof Error ? e.message : String(e));
    }
  }
}
