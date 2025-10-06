import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface CorruptionMutationToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

interface CorruptionInfo {
    current: number;
    max: number;
    thresholds: {
        minor: number;
        moderate: number;
        major: number;
    };
    nextThreshold: string;
    pointsUntilNextThreshold: number;
    warningLevel: 'safe' | 'caution' | 'danger' | 'critical';
}

interface MutationInfo {
    name: string;
    type: 'physical' | 'mental';
    description: string;
    effects?: string;
}

export class CorruptionMutationTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: CorruptionMutationToolsOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'CorruptionMutationTools' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'get-corruption-status',
                description: 'Check a character\'s Corruption points and mutation status. WFRP 4e specific: Corruption accumulates from Chaos exposure, dark magic, and witnessing horrors. When Corruption exceeds thresholds (based on Willpower + Toughness), characters gain mutations. Shows current Corruption, thresholds, active mutations, and warning level. Example: "Check Gustav\'s Corruption" or "How corrupted is Hans?"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to check Corruption for',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'add-corruption',
                description: 'Add Corruption points to a character from Chaos exposure. WFRP 4e has three exposure levels: Minor (1 point - witnessing dark rituals, exposure to Warpstone), Moderate (2-3 points - casting dark magic, witnessing daemonic manifestations), Severe (4+ points - prolonged Chaos exposure, making pacts with daemons). Automatically checks if new mutations are gained. Example: "Add minor Corruption to Hans for witnessing the ritual" or "Gustav gains moderate Corruption from the Warpstone"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character gaining Corruption',
                        },
                        amount: {
                            type: 'number',
                            description: 'Number of Corruption points to add (1-10)',
                        },
                        reason: {
                            type: 'string',
                            description: 'Reason for gaining Corruption (e.g., "Witnessed daemonic ritual", "Cast dark magic", "Touched Warpstone")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'list-mutations',
                description: 'List all active mutations on a character. WFRP 4e mutations are permanent physical or mental changes from Corruption. Physical mutations might be extra limbs, warped features, or unnatural growths. Mental mutations affect personality, sanity, or cognitive functions. Shows mutation type, description, and game effects. Example: "Show all of Gustav\'s mutations" or "List Hans\' Chaos mutations"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'remove-corruption',
                description: 'Remove Corruption points from a character through cleansing, rituals, or divine intervention. In WFRP 4e, Corruption is very difficult to remove - typically requiring powerful blessings, extensive penance, or rare magical rituals. Example: "Remove 2 Corruption from Gustav after the cleansing ritual"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        amount: {
                            type: 'number',
                            description: 'Number of Corruption points to remove (1-10)',
                        },
                        reason: {
                            type: 'string',
                            description: 'Reason for removing Corruption (e.g., "Divine blessing", "Cleansing ritual", "Penance completed")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'add-mutation',
                description: 'Add a mutation to a character from the WFRP 4e compendium. Searches for the mutation by name in compendiums and adds it with all official effects and mechanics. For custom mutations not in compendiums, use the characterName, mutationName, mutationType (physical/mental), and description parameters to create a custom entry. Example: "Add Animalistic Legs mutation to Hans" will search compendiums first, falling back to custom creation if not found.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        mutationName: {
                            type: 'string',
                            description: 'Name of the mutation to add (will search compendiums first)',
                        },
                        mutationType: {
                            type: 'string',
                            description: 'Type of mutation (only used for custom mutations if compendium search fails)',
                            enum: ['physical', 'mental'],
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the mutation (only used for custom mutations if compendium search fails)',
                        },
                    },
                    required: ['characterName', 'mutationName'],
                },
            },
            {
                name: 'remove-mutation',
                description: 'Remove a mutation from a character. Mutations are normally permanent in WFRP 4e, but may be removed through extremely rare magical means or divine miracles. Example: "Remove Bestial Appearance from Gustav after divine intervention"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        mutationName: {
                            type: 'string',
                            description: 'Name of the mutation to remove',
                        },
                    },
                    required: ['characterName', 'mutationName'],
                },
            },
        ];
    }

    async handleGetCorruptionStatus(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Getting corruption status', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.corruption !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Corruption tracking is only available for WFRP characters.`;
            }

            // Get Corruption data
            const currentCorruption = system.status?.corruption?.value || 0;
            const maxCorruption = system.status?.corruption?.max || 0;

            // Calculate thresholds based on Willpower Bonus + Toughness Bonus
            const wpBonus = system.characteristics?.wp?.bonus || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const baseThreshold = wpBonus + tBonus;

            const corruptionInfo: CorruptionInfo = {
                current: currentCorruption,
                max: maxCorruption,
                thresholds: {
                    minor: baseThreshold,
                    moderate: baseThreshold * 2,
                    major: baseThreshold * 3,
                },
                nextThreshold: '',
                pointsUntilNextThreshold: 0,
                warningLevel: 'safe',
            };

            // Determine next threshold and warning level
            if (currentCorruption < corruptionInfo.thresholds.minor) {
                corruptionInfo.nextThreshold = 'Minor';
                corruptionInfo.pointsUntilNextThreshold = corruptionInfo.thresholds.minor - currentCorruption;
                corruptionInfo.warningLevel = 'safe';
            } else if (currentCorruption < corruptionInfo.thresholds.moderate) {
                corruptionInfo.nextThreshold = 'Moderate';
                corruptionInfo.pointsUntilNextThreshold = corruptionInfo.thresholds.moderate - currentCorruption;
                corruptionInfo.warningLevel = 'caution';
            } else if (currentCorruption < corruptionInfo.thresholds.major) {
                corruptionInfo.nextThreshold = 'Major';
                corruptionInfo.pointsUntilNextThreshold = corruptionInfo.thresholds.major - currentCorruption;
                corruptionInfo.warningLevel = 'danger';
            } else {
                corruptionInfo.nextThreshold = 'Maximum';
                corruptionInfo.pointsUntilNextThreshold = 0;
                corruptionInfo.warningLevel = 'critical';
            }

            // Get mutations
            const mutations: MutationInfo[] = [];
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

            // Build response
            let response = `# Corruption Status: ${character.name}\n\n`;

            // Warning icon based on level
            const warningIcons = {
                safe: '🟢',
                caution: '🟡',
                danger: '🟠',
                critical: '🔴',
            };

            response += `## ${warningIcons[corruptionInfo.warningLevel]} Current Corruption: ${corruptionInfo.current} / ${corruptionInfo.max || '∞'}\n\n`;

            // Corruption bar visualization
            const barLength = 20;
            const filledBars = Math.min(barLength, Math.floor((corruptionInfo.current / Math.max(corruptionInfo.thresholds.major, 1)) * barLength));
            const emptyBars = barLength - filledBars;
            const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
            response += `\`${progressBar}\` ${corruptionInfo.current} points\n\n`;

            // Thresholds
            response += `## 🎯 Corruption Thresholds\n`;
            response += `Based on WP Bonus (${wpBonus}) + T Bonus (${tBonus}) = ${baseThreshold}\n\n`;
            response += `- **Minor Mutation**: ${corruptionInfo.thresholds.minor} points ${currentCorruption >= corruptionInfo.thresholds.minor ? '⚠️ EXCEEDED' : ''}\n`;
            response += `- **Moderate Mutation**: ${corruptionInfo.thresholds.moderate} points ${currentCorruption >= corruptionInfo.thresholds.moderate ? '⚠️ EXCEEDED' : ''}\n`;
            response += `- **Major Mutation**: ${corruptionInfo.thresholds.major} points ${currentCorruption >= corruptionInfo.thresholds.major ? '⚠️ EXCEEDED' : ''}\n\n`;

            // Warning and next threshold
            if (corruptionInfo.warningLevel === 'safe') {
                response += `## ✅ Status: Uncorrupted\n`;
                response += `${character.name} is ${corruptionInfo.pointsUntilNextThreshold} points away from their first mutation threshold.\n\n`;
            } else if (corruptionInfo.warningLevel === 'caution') {
                response += `## ⚠️ Status: Minor Corruption\n`;
                response += `${character.name} has exceeded the minor threshold and may have gained a mutation.\n`;
                if (corruptionInfo.pointsUntilNextThreshold > 0) {
                    response += `They are ${corruptionInfo.pointsUntilNextThreshold} points from the next threshold.\n\n`;
                }
            } else if (corruptionInfo.warningLevel === 'danger') {
                response += `## 🔶 Status: Moderate Corruption\n`;
                response += `${character.name} has significant Corruption and likely has multiple mutations.\n`;
                if (corruptionInfo.pointsUntilNextThreshold > 0) {
                    response += `They are ${corruptionInfo.pointsUntilNextThreshold} points from the major threshold.\n\n`;
                }
            } else {
                response += `## ☠️ Status: SEVERE CORRUPTION\n`;
                response += `${character.name} has exceeded all corruption thresholds! They are deeply tainted by Chaos and likely have multiple severe mutations.\n\n`;
            }

            // Active mutations
            if (mutations.length > 0) {
                response += `## 🧬 Active Mutations (${mutations.length})\n\n`;
                mutations.forEach((mutation, index) => {
                    const typeIcon = mutation.type === 'physical' ? '💪' : '🧠';
                    response += `### ${index + 1}. ${typeIcon} ${mutation.name} (${mutation.type})\n`;
                    if (mutation.description && mutation.description !== 'No description') {
                        response += `${mutation.description}\n`;
                    }
                    if (mutation.effects) {
                        response += `**Effects**: ${mutation.effects}\n`;
                    }
                    response += `\n`;
                });
            } else {
                response += `## 🧬 Mutations\n`;
                response += `No mutations currently active.\n\n`;
            }

            // Advice
            if (corruptionInfo.current > 0) {
                response += `## 💡 Managing Corruption\n`;
                response += `- **Reduce Exposure**: Avoid Chaos-tainted areas, dark magic, and Warpstone\n`;
                response += `- **Seek Cleansing**: Some temples and holy sites may offer ritual purification\n`;
                response += `- **Track Carefully**: Each threshold crossed typically means rolling for a new mutation\n`;
                response += `- **Roleplay Changes**: Mutations should affect how others perceive and interact with ${character.name}\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get corruption status', error);
            throw new Error(`Failed to retrieve corruption status for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddCorruption(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().min(1).max(10),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Adding corruption', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.corruption !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Corruption tracking is only available for WFRP characters.`;
            }

            const currentCorruption = system.status?.corruption?.value || 0;
            const newCorruption = currentCorruption + amount;

            // Calculate thresholds
            const wpBonus = system.characteristics?.wp?.bonus || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const baseThreshold = wpBonus + tBonus;

            const thresholds = {
                minor: baseThreshold,
                moderate: baseThreshold * 2,
                major: baseThreshold * 3,
            };

            // Check if any thresholds were crossed
            const crossedThresholds: string[] = [];
            if (currentCorruption < thresholds.minor && newCorruption >= thresholds.minor) {
                crossedThresholds.push('Minor');
            }
            if (currentCorruption < thresholds.moderate && newCorruption >= thresholds.moderate) {
                crossedThresholds.push('Moderate');
            }
            if (currentCorruption < thresholds.major && newCorruption >= thresholds.major) {
                crossedThresholds.push('Major');
            }

            // Build response
            let response = `# Corruption Added: ${character.name}\n\n`;
            response += `**Reason**: ${reason}\n\n`;
            response += `## 📊 Corruption Change\n`;
            response += `- Previous: ${currentCorruption} points\n`;
            response += `- Added: +${amount} points\n`;
            response += `- **New Total**: ${newCorruption} points\n\n`;

            // Severity indicator
            let severityLabel = 'Minor';
            let severityIcon = '⚠️';
            if (amount >= 4) {
                severityLabel = 'Severe';
                severityIcon = '☠️';
            } else if (amount >= 2) {
                severityLabel = 'Moderate';
                severityIcon = '🔶';
            }

            response += `**Exposure Severity**: ${severityIcon} ${severityLabel} (${amount} points)\n\n`;

            // Threshold warnings
            if (crossedThresholds.length > 0) {
                response += `## ⚠️ THRESHOLDS CROSSED!\n\n`;
                crossedThresholds.forEach((threshold) => {
                    response += `- **${threshold} Corruption Threshold** exceeded!\n`;
                });
                response += `\n**GM Action Required**: Roll for ${crossedThresholds.length} new mutation(s) using the Corruption tables.\n\n`;
            }

            // Current thresholds
            response += `## 🎯 Current Thresholds\n`;
            response += `- Minor (${thresholds.minor}): ${newCorruption >= thresholds.minor ? '⚠️ EXCEEDED' : `${thresholds.minor - newCorruption} points away`}\n`;
            response += `- Moderate (${thresholds.moderate}): ${newCorruption >= thresholds.moderate ? '⚠️ EXCEEDED' : `${thresholds.moderate - newCorruption} points away`}\n`;
            response += `- Major (${thresholds.major}): ${newCorruption >= thresholds.major ? '⚠️ EXCEEDED' : `${thresholds.major - newCorruption} points away`}\n\n`;

            // Actually update the actor in Foundry
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.corruption.value': newCorruption,
                },
            });

            response += `## 💡 Next Steps\n`;
            if (crossedThresholds.length > 0) {
                response += `1. Roll for mutation(s) on the appropriate Corruption table(s)\n`;
                response += `2. Add the mutation(s) to ${character.name}'s character sheet\n`;
                response += `3. Roleplay the physical or mental changes\n`;
            } else {
                response += `1. Note the Corruption source in ${character.name}'s background\n`;
                response += `2. Consider the psychological impact of the exposure\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to add corruption', error);
            throw new Error(`Failed to add corruption to "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleListMutations(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Listing mutations', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.corruption !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Mutation tracking is only available for WFRP characters.`;
            }

            // Get mutations
            const mutations: MutationInfo[] = [];
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

            // Build response
            let response = `# Mutations: ${character.name}\n\n`;

            const currentCorruption = system.status?.corruption?.value || 0;
            response += `**Current Corruption**: ${currentCorruption} points\n\n`;

            if (mutations.length === 0) {
                response += `## ✅ No Mutations\n\n`;
                response += `${character.name} has no active mutations. `;
                if (currentCorruption > 0) {
                    response += `However, they do have ${currentCorruption} Corruption point(s). Monitor for threshold crossings that trigger mutation rolls.`;
                } else {
                    response += `They remain uncorrupted by Chaos.`;
                }
                return response;
            }

            response += `## 🧬 Active Mutations (${mutations.length})\n\n`;

            // Separate by type
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
            response += `- Consider disguises, concealment, or explanation for mutations\n`;
            response += `- Some mutations may provide mechanical benefits despite their corruption\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to list mutations', error);
            throw new Error(`Failed to list mutations for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRemoveCorruption(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().int().positive().max(10),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Removing Corruption', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const currentCorruption = system.status?.corruption?.value || 0;

            if (currentCorruption === 0) {
                return `${character.name} has no Corruption points to remove.`;
            }

            const amountToRemove = Math.min(amount, currentCorruption);
            const newCorruption = currentCorruption - amountToRemove;

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.corruption.value': newCorruption,
                },
            });

            let response = `✅ Removed ${amountToRemove} Corruption point(s) from ${character.name}\n\n`;
            response += `**Reason**: ${reason}\n`;
            response += `**Previous Corruption**: ${currentCorruption}\n`;
            response += `**New Corruption**: ${newCorruption}\n\n`;

            if (newCorruption === 0) {
                response += `🎉 ${character.name} is now free of Corruption!`;
            } else {
                response += `⚠️ ${character.name} still has ${newCorruption} Corruption point(s) remaining.`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to remove Corruption', error);
            throw new Error(`Failed to remove Corruption: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddMutation(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            mutationName: z.string().min(1, 'Mutation name cannot be empty'),
            mutationType: z.enum(['physical', 'mental']).optional(),
            description: z.string().optional(),
        });

        const { characterName, mutationName, mutationType, description } = schema.parse(args);

        this.logger.info('Adding mutation', { characterName, mutationName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            // Check if mutation already exists
            const existingMutation = character.items?.find(
                (item: any) => item.type === 'mutation' && item.name.toLowerCase() === mutationName.toLowerCase()
            );

            if (existingMutation) {
                return `⚠️ ${character.name} already has the mutation "${mutationName}". Mutations do not stack.`;
            }

            // STEP 1: Search compendiums for the mutation
            this.logger.info('Searching compendiums for mutation', { mutationName });

            let compendiumMutation = null;
            let compendiumUuid = null;
            try {
                const searchResults = await this.foundryClient.query('foundry-mcp-bridge.searchCompendium', {
                    query: mutationName,
                    packType: 'Item',
                });

                this.logger.info('Search results:', { searchResults });

                if (searchResults && searchResults.length > 0) {
                    // Filter for mutations only
                    const mutationResults = searchResults.filter((item: any) => item.type === 'mutation');

                    if (mutationResults.length > 0) {
                        // Find exact or best match
                        compendiumMutation = mutationResults.find((item: any) =>
                            item.name.toLowerCase() === mutationName.toLowerCase()
                        ) || mutationResults[0]; // Use first result if no exact match

                        // Construct UUID from pack and id
                        // Format: Compendium.{packId}.{itemId}
                        if (compendiumMutation.pack && compendiumMutation.id) {
                            compendiumUuid = `Compendium.${compendiumMutation.pack}.${compendiumMutation.id}`;
                        } else if (compendiumMutation.pack && compendiumMutation._id) {
                            compendiumUuid = `Compendium.${compendiumMutation.pack}.${compendiumMutation._id}`;
                        }

                        this.logger.info('Found mutation in compendium', {
                            mutationName: compendiumMutation.name,
                            pack: compendiumMutation.pack,
                            id: compendiumMutation.id || compendiumMutation._id,
                            constructedUuid: compendiumUuid
                        });
                    } else {
                        this.logger.info('No mutation-type items found in search results');
                    }
                }
            } catch (compendiumError) {
                this.logger.warn('Compendium search failed, will create custom mutation', compendiumError);
            }

            let response = '';

            // STEP 2: Add mutation from compendium OR create custom
            if (compendiumMutation && compendiumUuid) {
                // Add official compendium mutation with all effects
                await this.foundryClient.query('foundry-mcp-bridge.addItemFromCompendium', {
                    actorId: character.id,
                    compendiumId: compendiumUuid,
                });

                const mutType = compendiumMutation.type || 'unknown';
                const icon = mutType === 'physical' ? '💪' : mutType === 'mental' ? '🧠' : '🧬';

                response = `✅ Added official ${icon} mutation from compendium to ${character.name}\n\n`;
                response += `**Mutation**: ${compendiumMutation.name}\n`;
                response += `**Type**: ${mutType.charAt(0).toUpperCase() + mutType.slice(1)}\n`;
                response += `**Source**: WFRP 4e Compendium (${compendiumUuid})\n`;
                if (compendiumMutation.description) {
                    const desc = compendiumMutation.description;
                    const truncatedDesc = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
                    response += `**Description**: ${truncatedDesc}\n`;
                }
                response += `\n✅ All official game effects, modifiers, and mechanics have been applied.\n`;
                response += `⚠️ This mutation is permanent unless removed through divine intervention or powerful magic.`;

            } else {
                // Fallback: Create custom mutation
                if (!mutationType || !description) {
                    throw new Error(
                        `Mutation "${mutationName}" not found in compendiums. ` +
                        `To create a custom mutation, provide both "mutationType" (physical/mental) and "description" parameters.`
                    );
                }

                const mutationData = {
                    name: mutationName,
                    type: 'mutation',
                    system: {
                        mutationType: { value: mutationType },
                        description: { value: description },
                    },
                };

                await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                    actorId: character.id,
                    itemData: mutationData,
                });

                const icon = mutationType === 'physical' ? '💪' : '🧠';
                response = `✅ Created custom ${icon} ${mutationType} mutation for ${character.name}\n\n`;
                response += `**Mutation**: ${mutationName}\n`;
                response += `**Type**: ${mutationType.charAt(0).toUpperCase() + mutationType.slice(1)}\n`;
                response += `**Description**: ${description}\n`;
                response += `**Source**: Custom (not from compendium)\n\n`;
                response += `⚠️ Note: This is a custom mutation without official WFRP 4e effects. `;
                response += `Consider searching the compendium for official mutations with proper game mechanics.\n`;
                response += `⚠️ This mutation is permanent unless removed through divine intervention or powerful magic.`;
            }

            return response;

        } catch (error) {
            this.logger.error('Failed to add mutation', error);
            throw new Error(`Failed to add mutation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRemoveMutation(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            mutationName: z.string().min(1, 'Mutation name cannot be empty'),
        });

        const { characterName, mutationName } = schema.parse(args);

        this.logger.info('Removing mutation', { characterName, mutationName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            // Find the mutation
            const mutation = character.items?.find(
                (item: any) => item.type === 'mutation' && item.name.toLowerCase().includes(mutationName.toLowerCase())
            );

            if (!mutation) {
                throw new Error(`Mutation "${mutationName}" not found on ${character.name}`);
            }

            await this.foundryClient.query('foundry-mcp-bridge.deleteItem', {
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
}
