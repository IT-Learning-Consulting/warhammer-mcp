import {
  GetCombatInput,
  ListCombatantsInput,
  AdvanceCombatInput,
  AddCombatantsInput,
  RemoveCombatantsInput,
  EndCombatInput,
  type GetCombatOutputType,
  type ListCombatantsOutputType,
  type AdvanceCombatOutputType,
  type AddCombatantsOutputType,
  type RemoveCombatantsOutputType,
  type EndCombatOutputType,
  AdvanceCombatOutput,
  AddCombatantsOutput,
  RemoveCombatantsOutput,
  EndCombatOutput,
  ADVANCE_COMBAT_OUTPUT_JSON_SCHEMA,
  ADD_COMBATANTS_OUTPUT_JSON_SCHEMA,
  REMOVE_COMBATANTS_OUTPUT_JSON_SCHEMA,
  END_COMBAT_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ManageCombatToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ManageCombatTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'get-combat', handler: (args: any) => this.handleGetCombat(args) },
        { name: 'list-combatants', handler: (args: any) => this.handleListCombatants(args) },
        { name: 'advance-combat', handler: (args: any) => this.handleAdvanceCombat(args) },
        { name: 'add-combatants', handler: (args: any) => this.handleAddCombatants(args) },
        { name: 'remove-combatants', handler: (args: any) => this.handleRemoveCombatants(args) },
        { name: 'end-combat', handler: (args: any) => this.handleEndCombat(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'get-combat',
        title: 'Get Combat',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: `Get the current WFRP 4e combat state (id, round, turn, active combatant summary). Returns null if no active combat. Read-only.

Use this when:
- Checking whether combat is currently active on the scene before advancing it.
- Reading the current round/turn/active-combatant summary for narration or decision-making.
- Confirming a specific combat's state by id, when combatId is known.

Do NOT use this to enumerate every combatant with initiative/defeated/hidden state — use list-combatants instead, which returns the full per-combatant array this tool's summary omits.

Performance Notes:
- Single small response: id/round/turn/active-combatant summary, no full combatant array. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            combatId: {
              type: 'string',
              description: 'Specific combat ID. Omit to use the active combat on the current scene.',
            },
          },
        },
      },
      {
        name: 'list-combatants',
        title: 'List Combatants',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: `List combatants in the current or specified WFRP 4e combat. Returns {combatId, combatants:[]} envelope: combatId=null means no active combat on the scene; combatId="<id>" with combatants=[] means active combat with zero combatants. Each combatant entry has id, actorId, tokenId, name, initiative (null if not yet rolled), defeated, and hidden. Read-only.

Use this when:
- Enumerating every combatant currently in the tracker with their initiative/defeated/hidden state.
- Resolving a combatant's id before a follow-up combatant read/write call.
- Checking whether a specific actor is already in the current combat.
- Distinguishing "no active combat" (combatId=null) from "active combat with zero combatants" (combatId set, combatants=[]).

Do NOT use this for per-combatant field reads/writes — use combatant instead. Do NOT use this for a compact round/turn summary — use get-combat.

Performance Notes:
- Response scales with the number of combatants in the tracker — flat array, no pagination.`,
        inputSchema: {
          type: 'object',
          properties: {
            combatId: {
              type: 'string',
              description: 'Specific combat ID. Omit to use the active combat on the current scene.',
            },
          },
        },
      },
      {
        name: 'advance-combat',
        title: 'Advance Combat',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: `Advance WFRP 4e combat state. action="rollNPC" and "next/prev/nextRound/prevRound" are dialog-free and fire-and-forget. action="rollAll" and "start" open the Foundry initiative dialog and BLOCK the MCP call until the GM dismisses it — use these only when an interactive GM is at the keyboard. For autonomous flows (no GM at keyboard), use rollNPC to roll initiative for all NPCs, then next to advance turns — this is the dialog-free pattern and is what eval probes use. Use end-combat to clear the tracker.

Use this when:
- Rolling initiative for all NPCs autonomously via action:"rollNPC" (dialog-free).
- Advancing to the next/previous turn or round via action:"next"/"prev"/"nextRound"/"prevRound" (dialog-free, fire-and-forget).
- Starting combat or rolling initiative for everyone (action:"start"/"rollAll") ONLY when an interactive GM is present to dismiss the resulting Foundry dialog.

Do NOT use action:"start"/"rollAll" from an autonomous flow with no GM at the keyboard — the call will block on the initiative dialog. Do NOT use this to permanently clear the combat tracker — use end-combat instead.

Performance Notes:
- Single small response: the resulting combat state (round/turn), no full combatant array. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            combatId: {
              type: 'string',
              description: 'Specific combat ID. Omit to use the active combat on the current scene.',
            },
            action: {
              type: 'string',
              enum: ['start', 'next', 'prev', 'nextRound', 'prevRound', 'rollAll', 'rollNPC'],
              description: 'Action to take on combat state.',
            },
          },
          required: ['action'],
        },
        outputSchema: ADVANCE_COMBAT_OUTPUT_JSON_SCHEMA,
      },
      {
        name: 'add-combatants',
        title: 'Add Combatants',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: `Add actors to a WFRP 4e combat as combatants. Requires at least one actor ID.

Use this when:
- Bringing new actors (PCs, NPCs, creatures) into an ongoing or newly started combat.
- Adding multiple actors to the tracker in one call via actorIds.
- Placing added combatants' tokens on a specific scene via the optional sceneId.

Do NOT use this to remove combatants — use remove-combatants (the inverse operation) instead.

Performance Notes:
- Single small response: the added combatant ids, no full combatant array. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            combatId: {
              type: 'string',
              description: 'Specific combat ID. Omit to use the active combat on the current scene.',
            },
            actorIds: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description: 'Actor IDs to add as combatants.',
            },
            sceneId: {
              type: 'string',
              description: 'Optional scene ID (for token placement).',
            },
          },
          required: ['actorIds'],
        },
        outputSchema: ADD_COMBATANTS_OUTPUT_JSON_SCHEMA,
      },
      {
        name: 'remove-combatants',
        title: 'Remove Combatants',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: `Remove combatants from a WFRP 4e combat by combatant ID.

Use this when:
- Pulling a defeated or fled actor out of the tracker without ending combat entirely.
- Removing multiple combatants in one call via combatantIds.
- Correcting an erroneous add-combatants call.

Do NOT use this to add combatants — use add-combatants (the inverse operation) instead.

Performance Notes:
- Single small response: the removed combatant ids, no full combatant array. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            combatId: {
              type: 'string',
              description: 'Specific combat ID. Omit to use the active combat on the current scene.',
            },
            combatantIds: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description: 'Combatant IDs to remove.',
            },
          },
          required: ['combatantIds'],
        },
        outputSchema: REMOVE_COMBATANTS_OUTPUT_JSON_SCHEMA,
      },
      {
        name: 'end-combat',
        title: 'End Combat',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: `End (delete) a WFRP 4e combat encounter, clearing the tracker and releasing all combatants.

Use this when:
- The encounter is fully resolved and the combat tracker should be cleared.
- Cleaning up a stray/test combat that should never have persisted.
- Releasing all combatants from the tracker in one call, without deleting the underlying actors.

Do NOT use this to pause or temporarily step away from combat — this permanently deletes the tracker. Use advance-combat (action:"next"/"prev"/etc.) to pause between turns instead.

Args:
  - combatId (string, optional): Specific combat UUID. Omit to target the active combat on the current scene.

Returns:
  - On success: confirmation that the combat was deleted.
  - On error: throws with an actionable message (e.g. no active combat found).

Performance Notes:
- Single small response: deletion confirmation, no combatant array. Mode-less — no response-mode variance.`,
        inputSchema: {
          type: 'object',
          properties: {
            combatId: {
              type: 'string',
              description: 'Specific combat ID. Omit to use the active combat on the current scene.',
            },
          },
        },
        outputSchema: END_COMBAT_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handleGetCombat(args: any): Promise<any> {
    const parsed = GetCombatInput.parse(args);
    this.logger.info('get-combat', parsed);
    return await this.query<GetCombatOutputType>('getCombat', parsed);
  }

  async handleListCombatants(args: any): Promise<any> {
    const parsed = ListCombatantsInput.parse(args);
    this.logger.info('list-combatants', parsed);
    const result = await this.query<ListCombatantsOutputType | unknown[]>('listCombatants', parsed);
    if (Array.isArray(result)) {
      const combat = await this.query<GetCombatOutputType>('getCombat', { combatId: parsed.combatId }).catch(() => null);
      return { combatId: combat?.id ?? null, combatants: result };
    }
    return result;
  }

  async handleAdvanceCombat(args: any): Promise<any> {
    const parsed = AdvanceCombatInput.parse(args);
    this.logger.info('advance-combat', parsed);
    // Phase 11 (R11.1): envelope wrap; text === JSON.stringify(data) preserves the
    // prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<AdvanceCombatOutputType>('advanceCombat', parsed);
    AdvanceCombatOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }

  async handleAddCombatants(args: any): Promise<any> {
    const parsed = AddCombatantsInput.parse(args);
    this.logger.info('add-combatants', parsed);
    // Phase 11 (R11.1): envelope wrap; text === JSON.stringify(data) preserves the
    // prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<AddCombatantsOutputType>('addCombatants', parsed);
    AddCombatantsOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }

  async handleRemoveCombatants(args: any): Promise<any> {
    const parsed = RemoveCombatantsInput.parse(args);
    this.logger.info('remove-combatants', parsed);
    // Phase 11 (R11.1): envelope wrap; text === JSON.stringify(data) preserves the
    // prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<RemoveCombatantsOutputType>('removeCombatants', parsed);
    RemoveCombatantsOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }

  async handleEndCombat(args: any): Promise<any> {
    const parsed = EndCombatInput.parse(args);
    this.logger.info('end-combat', parsed);
    // Phase 11 (R11.1): envelope wrap; text === JSON.stringify(data) preserves the
    // prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<EndCombatOutputType>('endCombat', parsed);
    EndCombatOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }
}
