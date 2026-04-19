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

export interface ManageCombatToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ManageCombatTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ManageCombatToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ManageCombatTools' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'get-combat',
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
        description: 'List combatants in the current or specified WFRP 4e combat with initiative, active conditions, and wounds snapshot. Read-only.',
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
        description: 'Advance WFRP 4e combat: start tracker, next/prev turn, next/prev round, roll initiative (all or NPCs only). Use end-combat to end.',
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
        description: 'End (delete) a WFRP 4e combat.',
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
    return await this.foundryClient.query<any>('warhammer-mcp.getCombat', parsed);
  }

  async handleListCombatants(args: any): Promise<any> {
    const parsed = ListCombatantsInput.parse(args);
    this.logger.info('list-combatants', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.listCombatants', parsed);
  }

  async handleAdvanceCombat(args: any): Promise<any> {
    const parsed = AdvanceCombatInput.parse(args);
    this.logger.info('advance-combat', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.advanceCombat', parsed);
  }

  async handleAddCombatants(args: any): Promise<any> {
    const parsed = AddCombatantsInput.parse(args);
    this.logger.info('add-combatants', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.addCombatants', parsed);
  }

  async handleRemoveCombatants(args: any): Promise<any> {
    const parsed = RemoveCombatantsInput.parse(args);
    this.logger.info('remove-combatants', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.removeCombatants', parsed);
  }

  async handleEndCombat(args: any): Promise<any> {
    const parsed = EndCombatInput.parse(args);
    this.logger.info('end-combat', parsed);
    return await this.foundryClient.query<any>('warhammer-mcp.endCombat', parsed);
  }
}
