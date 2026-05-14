import { DeleteActorInput, DeleteJournalEntryInput } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface WorldDeleteToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class WorldDeleteTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [
      {
        name: 'delete-actor',
        title: 'Delete Actor',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Delete a world-level Actor by ID. Use after `/wfrp-encounter-builder`, `/wfrp-build-npc`, or any clone-then-cleanup flow. GM-only. Irreversible — removes the actor and all embedded items.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'World Actor document ID (Foundry _id).',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete-journal-entry',
        title: 'Delete Journal Entry',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          'Delete a world-level JournalEntry by ID. Use after a quest journal is no longer needed (one-shot recap, completed-and-archived quest). GM-only. Irreversible — removes all pages on the entry.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'World JournalEntry document ID (Foundry _id).',
            },
          },
          required: ['id'],
        },
      },
    ];
  }

  async handleDeleteActor(args: any): Promise<any> {
    const parsed = DeleteActorInput.parse(args);
    this.logger.info('delete-actor', { id: parsed.id });
    return await this.query<any>('deleteActor', parsed);
  }

  async handleDeleteJournalEntry(args: any): Promise<any> {
    const parsed = DeleteJournalEntryInput.parse(args);
    this.logger.info('delete-journal-entry', { id: parsed.id });
    return await this.query<any>('deleteJournalEntry', parsed);
  }
}
