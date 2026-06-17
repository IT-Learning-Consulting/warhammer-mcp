import {
  GetCombatInput,
  ListCombatantsInput,
  AdvanceCombatInput,
  AddCombatantsInput,
  RemoveCombatantsInput,
  EndCombatInput,
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
        description: 'Get the current WFRP 4e combat state (id, round, turn, active combatant summary). Returns null if no active combat. Read-only.',
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
        description: 'List combatants in the current or specified WFRP 4e combat. Returns {combatId, combatants:[]} envelope: combatId=null means no active combat on the scene; combatId="<id>" with combatants=[] means active combat with zero combatants. Each combatant entry has id, actorId, tokenId, name, initiative (null if not yet rolled), defeated, and hidden. Read-only.',
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
        description: 'Advance WFRP 4e combat state. action="rollNPC" and "next/prev/nextRound/prevRound" are dialog-free and fire-and-forget. action="rollAll" and "start" open the Foundry initiative dialog and BLOCK the MCP call until the GM dismisses it — use these only when an interactive GM is at the keyboard. For autonomous flows (no GM at keyboard), use rollNPC to roll initiative for all NPCs, then next to advance turns — this is the dialog-free pattern and is what eval probes use. Use end-combat to clear the tracker.',
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
        description: 'Add actors to a WFRP 4e combat as combatants. Requires at least one actor ID.',
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
        description: 'Remove combatants from a WFRP 4e combat by combatant ID.',
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
        description: 'End (delete) a WFRP 4e combat encounter, clearing the tracker and releasing all combatants.\n\nArgs:\n  - combatId (string, optional): Specific combat UUID. Omit to target the active combat on the current scene.\n\nReturns:\n  - On success: confirmation that the combat was deleted.\n  - On error: throws with an actionable message (e.g. no active combat found).\n\nUse when: the encounter is resolved and you need to clear the combat tracker. Don\'t use when: you only want to pause combat — this permanently deletes the tracker.',
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
    ];
  }

  async handleGetCombat(args: any): Promise<any> {
    const parsed = GetCombatInput.parse(args);
    this.logger.info('get-combat', parsed);
    return await this.query<any>('getCombat', parsed);
  }

  async handleListCombatants(args: any): Promise<any> {
    const parsed = ListCombatantsInput.parse(args);
    this.logger.info('list-combatants', parsed);
    const result = await this.query<any>('listCombatants', parsed);
    if (Array.isArray(result)) {
      const combat = await this.query<any>('getCombat', { combatId: parsed.combatId }).catch(() => null);
      return { combatId: combat?.id ?? null, combatants: result };
    }
    return result;
  }

  async handleAdvanceCombat(args: any): Promise<any> {
    const parsed = AdvanceCombatInput.parse(args);
    this.logger.info('advance-combat', parsed);
    return await this.query<any>('advanceCombat', parsed);
  }

  async handleAddCombatants(args: any): Promise<any> {
    const parsed = AddCombatantsInput.parse(args);
    this.logger.info('add-combatants', parsed);
    return await this.query<any>('addCombatants', parsed);
  }

  async handleRemoveCombatants(args: any): Promise<any> {
    const parsed = RemoveCombatantsInput.parse(args);
    this.logger.info('remove-combatants', parsed);
    return await this.query<any>('removeCombatants', parsed);
  }

  async handleEndCombat(args: any): Promise<any> {
    const parsed = EndCombatInput.parse(args);
    this.logger.info('end-combat', parsed);
    return await this.query<any>('endCombat', parsed);
  }
}
