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

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'delete-actor', handler: (args: any) => this.handleDeleteActor(args) },
    ];
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
          `Permanently delete a world-level Actor by id, including all its embedded Items. GM-only, irreversible.

Use this when:
- Cleaning up throwaway/disposable actors created for a smoke test (never a real PC).
- Removing a cloned or scratch encounter actor left over after \`/wfrp-encounter-builder\` or \`/wfrp-build-npc\` finishes.
- Discarding a duplicate produced by \`duplicate-actor\` that turned out unneeded.
- Retiring an NPC actor that will never be reused (e.g. a one-scene bandit that has been fully resolved in play).

Do NOT use this for a non-destructive edit — use \`update-actor\` instead; this tool has no undo and removes the actor's embedded items with it.

Performance Notes:
- Single small confirmation response, no response modes, no pagination.`,
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
