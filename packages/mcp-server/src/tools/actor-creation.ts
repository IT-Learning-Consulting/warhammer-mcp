import { z } from 'zod';
import { FolderId, PackId, ItemId } from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface ActorCreationToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

const CreateActorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['character', 'npc', 'creature']),
  systemData: z.record(z.unknown()).optional(),
  folderId: FolderId.optional(),
  options: z.object({
    skipItems: z.boolean().optional(),
  }).strict().optional(),
});

interface CreateActorResult {
  id: string;
  name: string;
  type: string;
}

export class ActorCreationTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  /**
   * Tool definitions for actor creation operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'create-actor-from-compendium',
        title: 'Create Actor From Compendium',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: 'Create one or more actors from a specific compendium entry with custom names. Use search-compendium first to find the exact creature you want, then use this tool with the packId and itemId from the search results.',
        inputSchema: {
          type: 'object',
          properties: {
            packId: {
              type: 'string',
              description: 'ID of the compendium pack containing the creature (e.g., "wfrp4e.bestiary", "wfrp4e-core.bestiary")',
            },
            itemId: {
              type: 'string',
              description: 'ID of the specific creature entry within the pack (get this from search-compendium results)',
            },
            names: {
              type: 'array',
              items: { type: 'string' },
              description: 'Custom names for the created actors (e.g., ["Flameheart", "Sneak", "Peek"])',
              minItems: 1,
            },
            quantity: {
              type: 'number',
              description: 'Number of actors to create (default: based on names array length)',
              minimum: 1,
              maximum: 10,
            },
            addToScene: {
              type: 'boolean',
              description: 'Whether to add created actors to the current scene as tokens',
              default: false,
            },
            placement: {
              type: 'object',
              description: 'Token placement options (only used when addToScene is true)',
              properties: {
                type: {
                  type: 'string',
                  enum: ['random', 'grid', 'center', 'coordinates'],
                  description: 'Placement strategy',
                  default: 'grid',
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      x: { type: 'number', description: 'X coordinate in pixels' },
                      y: { type: 'number', description: 'Y coordinate in pixels' },
                    },
                    required: ['x', 'y'],
                  },
                  description: 'Specific coordinates for each token (required when type is "coordinates")',
                },
              },
              required: ['type'],
            },
          },
          required: ['packId', 'itemId', 'names'],
        },
      },
      {
        name: 'create-actor',
        title: 'Create Actor',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: `Create a world actor of type 'character', 'npc', or 'creature' with optional system data and folder placement. Unlike create-actor-from-compendium, this creates a blank actor whose shape is fully caller-controlled. Wraps the Foundry-side createActor query (GM-gated, transaction-wrapped).

**\`_preCreate\` auto-embed behavior (wfrp4e system hook):**
- **type='character'**: NO PROMPT. The wfrp4e system silently auto-embeds basic skills + 3 coin items (Gold Crowns / Silver Shillings / Brass Pennies, quantity 0). Use this for /wfrp-build-pc flows where the PC sheet should land pre-populated.
- **type='npc'**: TRIGGERS A BLOCKING DialogV2.confirm asking whether to add basic skills + money. Since MCP calls are headless, the dialog will block the response — typical resolution is to dismiss it via the Foundry UI, or pre-populate \`systemData\` to satisfy the system check. Avoid calling for 'npc' from autonomous flows unless you have a strategy for the dialog.
- **type='creature'**: same blocking dialog as 'npc'. Same caveat applies.

**Post-write verification (CCR-5 / DP-16):** the handler asserts the returned actor has a non-empty id and the name matches the request, throwing CREATE_ACTOR_NOT_PERSISTED on mismatch.

**Suppress \`_preCreate\` dialog (HC9):** pass \`options.skipItems: true\` to bypass the wfrp4e basic-skills DialogV2.confirm on npc/creature creation. Use this for autonomous flows like /wfrp-build-npc --with-details; the skill body then composes skills/coins explicitly via add-item-from-compendium.`,
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Actor name (required, non-empty).',
            },
            type: {
              type: 'string',
              enum: ['character', 'npc', 'creature'],
              description: 'Actor type. See description for _preCreate dialog warnings on npc/creature.',
            },
            systemData: {
              type: 'object',
              description: 'Optional system-tree fields to set at creation time (e.g., { details: { species: { value: "human" } } }). Merged as actorData.system.',
            },
            folderId: {
              type: 'string',
              description: 'Optional Folder ID for placement in the world actor sidebar.',
            },
            options: {
              type: 'object',
              additionalProperties: false,
              properties: {
                skipItems: {
                  type: 'boolean',
                  description:
                    'Pass-through to Foundry Actor.create(data, options). When true, suppresses the wfrp4e ActorWFRP4e._preCreate basic-skills DialogV2.confirm on npc/creature creation. Required for /wfrp-build-npc --with-details autonomous flow (HC9). Mirror of BUG-089 skipExperienceChecks on update-item.',
                },
              },
              description:
                'Optional Foundry creation-options bag passed through to Actor.create(data, options). Currently supports skipItems.',
            },
          },
          required: ['name', 'type'],
        },
      },
      {
        name: 'get-compendium-entry-full',
        title: 'Get Compendium Entry Full',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        description: 'Retrieve complete stat block data including items, spells, and abilities for actor creation. TOOL-IDEA-009 (2026-05-14): pass `summary_only: true` to drop the verbose `fullData` and `system` tree from the response, returning only name-only `items[]`/`effects[]` summaries plus the `summary` line. Use this for "does creature X have trait Y?"-style queries when you don\'t need the full payload.',
        inputSchema: {
          type: 'object',
          properties: {
            packId: {
              type: 'string',
              description: 'Compendium pack identifier',
            },
            entryId: {
              type: 'string',
              description: 'Entry identifier within the pack',
            },
            summary_only: {
              type: 'boolean',
              description: 'TOOL-IDEA-009 (2026-05-14): when true, drop fullData + system tree, return name-only item/effect summaries.',
              default: false,
            },
          },
          required: ['packId', 'entryId'],
        },
      },
    ];
  }

  /**
   * Handle actor creation from specific compendium entry
   */
  async handleCreateActorFromCompendium(args: any): Promise<any> {
    const schema = z.object({
      packId: PackId,
      itemId: ItemId,
      names: z.array(z.string().min(1)).min(1, 'At least one name is required'),
      quantity: z.number().min(1).max(10).optional(),
      addToScene: z.boolean().default(false),
      placement: z.object({
        type: z.enum(['random', 'grid', 'center', 'coordinates']).default('grid'),
        coordinates: z.array(z.object({
          x: z.number(),
          y: z.number(),
        })).optional(),
      }).optional(),
    });

    const { packId, itemId, names, quantity, addToScene, placement } = schema.parse(args);
    const finalQuantity = quantity || names.length;

    this.logger.info('Creating actors from specific compendium entry', {
      packId,
      itemId,
      names,
      quantity: finalQuantity,
      addToScene,
    });

    try {
      // Ensure we have enough names for the quantity
      const customNames = [...names];
      while (customNames.length < finalQuantity) {
        const baseName = names[0] || 'Unnamed';
        customNames.push(`${baseName} ${customNames.length + 1}`);
      }

      // Create the actors via Foundry module using exact pack/item IDs
      const result = await this.query<any>('createActorFromCompendium', {
        packId,
        itemId,
        customNames: customNames.slice(0, finalQuantity),
        quantity: finalQuantity,
        addToScene,
        placement: placement ? {
          type: placement.type,
          coordinates: placement.coordinates,
        } : undefined,
      });

      this.logger.info('Actor creation completed', {
        totalCreated: result.totalCreated,
        totalRequested: result.totalRequested,
        tokensPlaced: result.tokensPlaced || 0,
        hasErrors: !!result.errors,
      });

      // Format response for Claude
      return this.formatSimpleActorCreationResponse(result, packId, itemId, customNames.slice(0, finalQuantity));

    } catch (error) {
      this.logger.error('create-actor-from-compendium failed', error);
      throw new Error(`Failed to create actor from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a blank actor (character / npc / creature) with optional system data and folder placement.
   * Wraps the Foundry-side createActor query. DP-16 post-write verification asserts the persisted
   * actor matches the request before returning.
   */
  async handleCreateActor(args: any): Promise<any> {
    const { name, type, systemData, folderId, options } = CreateActorSchema.parse(args);

    this.logger.info('Creating actor', { name, type, hasSystemData: !!systemData, hasFolderId: !!folderId, skipItems: !!options?.skipItems });

    try {
      const result = await this.query<CreateActorResult>('createActor', {
        actorData: {
          name,
          type,
          ...(systemData ? { system: systemData } : {}),
        },
        ...(folderId ? { folderId } : {}),
        ...(options ? { options } : {}),
      });

      // DP-16 post-write verification (CCR-5 / BUG-070).
      if (!result?.id) {
        throw new Error(`CREATE_ACTOR_NOT_PERSISTED: createActor returned no id for "${name}"`);
      }
      if (result.name !== name) {
        throw new Error(
          `CREATE_ACTOR_NOT_PERSISTED: persisted name "${result.name}" does not match requested "${name}"`,
        );
      }

      return {
        summary: `✅ Created ${type} actor "${result.name}" (ID: ${result.id})`,
        actor: result,
      };
    } catch (error) {
      this.logger.error('create-actor failed', error);
      throw new Error(`Failed to create actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle getting full compendium entry data
   */
  async handleGetCompendiumEntryFull(args: any): Promise<any> {
    const schema = z.object({
      packId: PackId,
      entryId: z.string().min(1, 'Entry ID cannot be empty'), // not a branded id (polymorphic / non-document)
      summary_only: z.boolean().default(false),
    });

    const { packId, entryId, summary_only } = schema.parse(args);

    this.logger.info('Getting full compendium entry', { packId, entryId, summary_only });

    try {
      const fullEntry = await this.query<any>('getCompendiumDocumentFull', {
        packId,
        documentId: entryId,
      });

      this.logger.debug('Successfully retrieved full compendium entry', {
        packId,
        entryId,
        name: fullEntry.name,
        hasItems: !!fullEntry.items?.length,
        hasEffects: !!fullEntry.effects?.length,
      });

      return this.formatCompendiumEntryResponse(fullEntry, summary_only);

    } catch (error) {
      this.logger.error('get-compendium-entry-full failed', error);
      throw new Error(`Failed to retrieve compendium entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }




  /**
   * Format compendium entry response.
   * TOOL-IDEA-009 (2026-05-14): when summaryOnly is true, drop fullData + system tree
   * (huge — prototypeToken, full system, embedded AE script payloads) and project
   * items[]/effects[] down to names-only summaries.
   */
  private formatCompendiumEntryResponse(entry: any, summaryOnly: boolean = false): any {
    const itemsInfo = entry.items?.length > 0
      ? `\n📦 Items: ${entry.items.map((item: any) => item.name).join(', ')}`
      : '';

    const effectsInfo = entry.effects?.length > 0
      ? `\n✨ Effects: ${entry.effects.map((effect: any) => effect.name).join(', ')}`
      : '';

    if (summaryOnly) {
      return {
        name: entry.name,
        type: entry.type,
        pack: entry.packLabel,
        items: (entry.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.type,
        })),
        effects: (entry.effects || []).map((effect: any) => ({
          id: effect.id,
          name: effect.name,
          disabled: !!effect.disabled,
        })),
        summary: `📊 **${entry.name}** (${entry.type} from ${entry.packLabel})${itemsInfo}${effectsInfo}`,
        mode: 'summary_only',
      };
    }

    return {
      name: entry.name,
      type: entry.type,
      pack: entry.packLabel,
      system: entry.system,
      fullData: entry.fullData,
      items: entry.items || [],
      effects: entry.effects || [],
      summary: `📊 **${entry.name}** (${entry.type} from ${entry.packLabel})${itemsInfo}${effectsInfo}`,
    };
  }

  /**
   * Format simplified actor creation response
   */
  private formatSimpleActorCreationResponse(result: any, packId: PackId, itemId: ItemId, customNames: string[]): any {
    const summary = `✅ Created ${result.totalCreated} of ${result.totalRequested} requested actors`;

    const details = result.actors.map((actor: any) =>
      `• **${actor.name}** (from ${packId})`
    ).join('\n');

    const sceneInfo = result.tokensPlaced > 0
      ? `\n🎯 Added ${result.tokensPlaced} tokens to the current scene`
      : '';

    const errorInfo = result.errors?.length > 0
      ? `\n⚠️ Issues: ${result.errors.join(', ')}`
      : '';

    return {
      summary,
      success: result.success,
      details: {
        actors: result.actors,
        sourceEntry: {
          packId,
          itemId,
        },
        tokensPlaced: result.tokensPlaced || 0,
        errors: result.errors,
      },
      message: summary + '\n\n' + details + sceneInfo + errorInfo,
    };
  }
}
