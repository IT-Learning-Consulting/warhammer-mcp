import {
  ListActorItemsInput,
  type ListActorItemsOutputType,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ListActorItemsToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ListActorItemsTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'list-actor-items', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'list-actor-items',
        title: 'List Actor Items',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description:
          `List all embedded items on an actor with their IDs, optionally filtered by type. Thin pass-through to the Foundry-module listActorItems query. Surfaces the raw {id, name, type, advances} shape that get-character hides under its formatted projection. Needed by /wfrp-build-npc Branch 3 to look up skill/talent item IDs for update-item advances writes.

Use this when:
- Resolving an item's raw id before a follow-up update-item call (e.g. writing skill/talent advances).
- Filtering an actor's embedded items down to one type (typeFilter:"skill", "talent", "career", "trait", etc.).
- Enumerating every embedded item on an actor with their ids, when get-character's formatted projection doesn't expose the raw id you need.

Do NOT use this for a formatted, human-readable summary of a character's inventory/stats — use get-character instead; this tool's raw {id, name, type, advances} shape exists specifically to feed update-item follow-ups, not for display.

Performance Notes:
- Response scales with the actor's embedded item count; \`typeFilter\` narrows it to one item type. No pagination — flat list.`,
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            typeFilter: {
              type: 'string',
              description: 'Optional item type filter (e.g. "skill", "talent", "career", "trait"). Omit to list all embedded items.',
            },
          },
          required: ['actorId'],
        },
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = ListActorItemsInput.parse(args);
    this.logger.info('list-actor-items', {
      actorId: parsed.actorId,
      typeFilter: parsed.typeFilter,
    });
    return await this.query<ListActorItemsOutputType>('listActorItems', parsed);
  }
}
