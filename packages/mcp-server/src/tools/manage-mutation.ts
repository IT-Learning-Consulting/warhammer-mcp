import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ManageMutationOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

const ManageMutationSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('add'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        mutationName: z.string().min(1, 'Mutation name cannot be empty'),
        mutationType: z.enum(['physical', 'mental']).optional(),
        description: z.string().optional(),
    }),
    z.object({
        action: z.literal('remove'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        mutationName: z.string().min(1, 'Mutation name cannot be empty'),
    }),
    z.object({
        action: z.literal('list'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
    }),
]);

export class ManageMutationTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: ManageMutationOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'ManageMutation' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'manage-mutation',
                description: 'Manage mutations for WFRP 4e characters. Mutations are permanent physical/mental changes from Corruption. Searches compendiums first for official mutations, falls back to custom creation. Actions: add, remove, list. Example: "Add Animalistic Legs mutation to Hans" or "List all of Gustav\'s mutations"',
                inputSchema: {
                    type: 'object',
                    oneOf: [
                        {
                            properties: {
                                action: { type: 'string', const: 'add' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                mutationName: { type: 'string', description: 'Name of the mutation to add (searches compendiums first)' },
                                mutationType: { type: 'string', enum: ['physical', 'mental'], description: 'Type of mutation (for custom mutations only)' },
                                description: { type: 'string', description: 'Description of the mutation (for custom mutations only)' },
                            },
                            required: ['action', 'characterName', 'mutationName'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'remove' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                mutationName: { type: 'string', description: 'Name of the mutation to remove' },
                            },
                            required: ['action', 'characterName', 'mutationName'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'list' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                            },
                            required: ['action', 'characterName'],
                        },
                    ],
                },
            },
        ];
    }

    async handle(args: any): Promise<any> {
        const parsed = ManageMutationSchema.parse(args);

        switch (parsed.action) {
            case 'add':
                return this.handleAddMutation(parsed);
            case 'remove':
                return this.handleRemoveMutation(parsed);
            case 'list':
                return this.handleListMutations(parsed);
        }
    }

    private async handleAddMutation(args: { characterName: string; mutationName: string; mutationType?: string | undefined; description?: string | undefined }): Promise<string> {
        this.logger.info('Adding mutation', { characterName: args.characterName, mutationName: args.mutationName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const existingMutation = character.items?.find(
                (item: any) => item.type === 'mutation' && item.name.toLowerCase() === args.mutationName.toLowerCase()
            );

            if (existingMutation) {
                return `⚠️ ${character.name} already has the mutation "${args.mutationName}". Mutations do not stack.`;
            }

            let compendiumMutation = null;
            let compendiumUuid = null;

            try {
                const searchResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
                    query: args.mutationName,
                    packType: 'Item',
                });

                if (searchResults && searchResults.length > 0) {
                    const mutationResults = searchResults.filter((item: any) => item.type === 'mutation');

                    if (mutationResults.length > 0) {
                        compendiumMutation = mutationResults.find((item: any) =>
                            item.name.toLowerCase() === args.mutationName.toLowerCase()
                        ) || mutationResults[0];

                        if (compendiumMutation.pack && (compendiumMutation.id || compendiumMutation._id)) {
                            compendiumUuid = `Compendium.${compendiumMutation.pack}.${compendiumMutation.id || compendiumMutation._id}`;
                        }
                    }
                }
            } catch (compendiumError) {
                this.logger.warn('Compendium search failed, will create custom mutation', compendiumError);
            }

            let response = '';

            if (compendiumMutation && compendiumUuid) {
                await this.foundryClient.query('warhammer-mcp.addItemFromCompendium', {
                    actorId: character.id,
                    compendiumId: compendiumUuid,
                });

                const mutType = compendiumMutation.type || 'unknown';
                const icon = mutType === 'physical' ? '💪' : mutType === 'mental' ? '🧠' : '🧬';

                response = `✅ Added official ${icon} mutation from compendium to ${character.name}\n\n`;
                response += `**Mutation**: ${compendiumMutation.name}\n`;
                response += `**Type**: ${mutType.charAt(0).toUpperCase() + mutType.slice(1)}\n`;
                response += `**Source**: WFRP 4e Compendium\n`;
                response += `\n✅ All official game effects, modifiers, and mechanics have been applied.\n`;
                response += `⚠️ This mutation is permanent unless removed through divine intervention or powerful magic.`;
            } else {
                if (!args.mutationType || !args.description) {
                    throw new Error(
                        `Mutation "${args.mutationName}" not found in compendiums. ` +
                        `To create a custom mutation, provide both "mutationType" (physical/mental) and "description" parameters.`
                    );
                }

                const mutationData = {
                    name: args.mutationName,
                    type: 'mutation',
                    system: {
                        mutationType: { value: args.mutationType },
                        description: { value: args.description },
                    },
                };

                await this.foundryClient.query('warhammer-mcp.createItem', {
                    actorId: character.id,
                    itemData: mutationData,
                });

                const icon = args.mutationType === 'physical' ? '💪' : '🧠';
                response = `✅ Created custom ${icon} ${args.mutationType} mutation for ${character.name}\n\n`;
                response += `**Mutation**: ${args.mutationName}\n`;
                response += `**Type**: ${args.mutationType.charAt(0).toUpperCase() + args.mutationType.slice(1)}\n`;
                response += `**Description**: ${args.description}\n`;
                response += `**Source**: Custom (not from compendium)\n\n`;
                response += `⚠️ This mutation is permanent unless removed through divine intervention or powerful magic.`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to add mutation', error);
            throw new Error(`Failed to add mutation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleRemoveMutation(args: { characterName: string; mutationName: string }): Promise<string> {
        this.logger.info('Removing mutation', { characterName: args.characterName, mutationName: args.mutationName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const mutation = character.items?.find(
                (item: any) => item.type === 'mutation' && item.name.toLowerCase().includes(args.mutationName.toLowerCase())
            );

            if (!mutation) {
                throw new Error(`Mutation "${args.mutationName}" not found on ${character.name}`);
            }

            await this.foundryClient.query('warhammer-mcp.deleteItem', {
                actorId: character.id,
                itemId: mutation.id,
            });

            return `✅ Removed mutation "${mutation.name}" from ${character.name}\n\n` +
                `This is an extremely rare occurrence in WFRP 4e. Document the divine miracle or magical ritual that made this possible!`;
        } catch (error) {
            this.logger.error('Failed to remove mutation', error);
            throw new Error(`Failed to remove mutation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleListMutations(args: { characterName: string }): Promise<string> {
        this.logger.info('Listing mutations', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.corruption !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Mutation tracking is only available for WFRP characters.`;
            }

            const mutations: any[] = [];
            if (character.items && Array.isArray(character.items)) {
                character.items
                    .filter((item: any) => item.type === 'mutation')
                    .forEach((mutation: any) => {
                        mutations.push({
                            name: mutation.name,
                            type: mutation.system?.mutationType?.value || 'physical',
                            description: mutation.system?.description?.value || 'No description',
                            effects: mutation.system?.specification?.value || undefined,
                        });
                    });
            }

            let response = `# Mutations: ${character.name}\n\n`;

            const currentCorruption = system.status?.corruption?.value || 0;
            response += `**Current Corruption**: ${currentCorruption} points\n\n`;

            if (mutations.length === 0) {
                response += `## ✅ No Mutations\n\n`;
                response += `${character.name} has no active mutations. `;
                if (currentCorruption > 0) {
                    response += `However, they do have ${currentCorruption} Corruption point(s).`;
                } else {
                    response += `They remain uncorrupted by Chaos.`;
                }
                return response;
            }

            response += `## 🧬 Active Mutations (${mutations.length})\n\n`;

            const physicalMutations = mutations.filter((m) => m.type === 'physical');
            const mentalMutations = mutations.filter((m) => m.type === 'mental');

            if (physicalMutations.length > 0) {
                response += `### 💪 Physical Mutations (${physicalMutations.length})\n\n`;
                physicalMutations.forEach((mutation, index) => {
                    response += `**${index + 1}. ${mutation.name}**\n`;
                    if (mutation.description && mutation.description !== 'No description') {
                        response += `${mutation.description}\n`;
                    }
                    if (mutation.effects) {
                        response += `**Effects**: ${mutation.effects}\n`;
                    }
                    response += `\n`;
                });
            }

            if (mentalMutations.length > 0) {
                response += `### 🧠 Mental Mutations (${mentalMutations.length})\n\n`;
                mentalMutations.forEach((mutation, index) => {
                    response += `**${index + 1}. ${mutation.name}**\n`;
                    if (mutation.description && mutation.description !== 'No description') {
                        response += `${mutation.description}\n`;
                    }
                    if (mutation.effects) {
                        response += `**Effects**: ${mutation.effects}\n`;
                    }
                    response += `\n`;
                });
            }

            response += `## 💡 Roleplay Considerations\n`;
            response += `- Physical mutations are visible and may cause fear or revulsion\n`;
            response += `- Mental mutations can affect personality, decision-making, and sanity\n`;
            response += `- NPCs may react with suspicion, hostility, or religious fervor\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to list mutations', error);
            throw new Error(`Failed to list mutations for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
