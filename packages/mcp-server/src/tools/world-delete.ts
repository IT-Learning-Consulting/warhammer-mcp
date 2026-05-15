// Phase 3 mcp_crud_expansion — `delete-journal-entry` slice removed.
// Journal CRUD (including delete) lives under the `journal` umbrella tool
// (action: "delete-entry"). This file retains only delete-actor.

import { DeleteActorInput } from '@foundry-mcp/shared';
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
    ];
  }

  async handleDeleteActor(args: any): Promise<any> {
    const parsed = DeleteActorInput.parse(args);
    this.logger.info('delete-actor', { id: parsed.id });
    return await this.query<any>('deleteActor', parsed);
  }
}
