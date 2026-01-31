import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ManageCorruptionOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

const ManageCorruptionSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('add'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10),
        reason: z.string().min(1, 'Reason cannot be empty'),
    }),
    z.object({
        action: z.literal('remove'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10),
        reason: z.string().min(1, 'Reason cannot be empty'),
    }),
    z.object({
        action: z.literal('get-status'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
    }),
]);

export class ManageCorruptionTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: ManageCorruptionOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'ManageCorruption' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'manage-corruption',
                description: 'Manage Corruption points for WFRP 4e characters. Corruption accumulates from Chaos exposure. When it exceeds thresholds (based on WP+T Bonus), mutations occur. Actions: add, remove, get-status. Example: "Add 2 Corruption to Hans for witnessing ritual" or "Check Gustav\'s Corruption status"',
                inputSchema: {
                    type: 'object',
                    oneOf: [
                        {
                            properties: {
                                action: { type: 'string', const: 'add' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, description: 'Number of Corruption points to add (1-10)' },
                                reason: { type: 'string', description: 'Reason for gaining Corruption (e.g., "Witnessed daemonic ritual", "Cast dark magic")' },
                            },
                            required: ['action', 'characterName', 'amount', 'reason'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'remove' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, description: 'Number of Corruption points to remove (1-10)' },
                                reason: { type: 'string', description: 'Reason for removing Corruption (e.g., "Divine blessing", "Cleansing ritual")' },
                            },
                            required: ['action', 'characterName', 'amount', 'reason'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'get-status' },
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
        const parsed = ManageCorruptionSchema.parse(args);

        switch (parsed.action) {
            case 'add':
                return this.handleAddCorruption(parsed);
            case 'remove':
                return this.handleRemoveCorruption(parsed);
            case 'get-status':
                return this.handleGetStatus(parsed);
        }
    }

    private async handleGetStatus(args: { characterName: string }): Promise<string> {
        this.logger.info('Getting corruption status', { characterName: args.characterName });

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
                return `${character.name} is not using the WFRP 4e system. Corruption tracking is only available for WFRP characters.`;
            }

            const currentCorruption = system.status?.corruption?.value || 0;
            const maxCorruption = system.status?.corruption?.max || 0;
            const wpBonus = system.characteristics?.wp?.bonus || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const baseThreshold = wpBonus + tBonus;

            const thresholds = {
                minor: baseThreshold,
                moderate: baseThreshold * 2,
                major: baseThreshold * 3,
            };

            let response = `# Corruption Status: ${character.name}\n\n`;
            response += `## Current Corruption: ${currentCorruption} points\n\n`;

            const barLength = 20;
            const filledBars = Math.min(barLength, Math.floor((currentCorruption / Math.max(thresholds.major, 1)) * barLength));
            const emptyBars = barLength - filledBars;
            const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
            response += `\`${progressBar}\` ${currentCorruption} points\n\n`;

            response += `## 🎯 Corruption Thresholds\n`;
            response += `Based on WP Bonus (${wpBonus}) + T Bonus (${tBonus}) = ${baseThreshold}\n\n`;
            response += `- **Minor Mutation**: ${thresholds.minor} points ${currentCorruption >= thresholds.minor ? '⚠️ EXCEEDED' : ''}\n`;
            response += `- **Moderate Mutation**: ${thresholds.moderate} points ${currentCorruption >= thresholds.moderate ? '⚠️ EXCEEDED' : ''}\n`;
            response += `- **Major Mutation**: ${thresholds.major} points ${currentCorruption >= thresholds.major ? '⚠️ EXCEEDED' : ''}\n\n`;

            if (currentCorruption < thresholds.minor) {
                response += `## ✅ Status: Uncorrupted\n`;
                response += `${character.name} is ${thresholds.minor - currentCorruption} points away from their first mutation threshold.\n`;
            } else if (currentCorruption < thresholds.moderate) {
                response += `## ⚠️ Status: Minor Corruption\n`;
                response += `${character.name} has exceeded the minor threshold and may have gained a mutation.\n`;
            } else if (currentCorruption < thresholds.major) {
                response += `## 🔶 Status: Moderate Corruption\n`;
                response += `${character.name} has significant Corruption and likely has multiple mutations.\n`;
            } else {
                response += `## ☠️ Status: SEVERE CORRUPTION\n`;
                response += `${character.name} has exceeded all corruption thresholds! They are deeply tainted by Chaos.\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get corruption status', error);
            throw new Error(`Failed to retrieve corruption status for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleAddCorruption(args: { characterName: string; amount: number; reason: string }): Promise<string> {
        this.logger.info('Adding corruption', { characterName: args.characterName, amount: args.amount });

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
                return `${character.name} is not using the WFRP 4e system.`;
            }

            const currentCorruption = system.status?.corruption?.value || 0;
            const newCorruption = currentCorruption + args.amount;

            const wpBonus = system.characteristics?.wp?.bonus || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const baseThreshold = wpBonus + tBonus;

            const thresholds = {
                minor: baseThreshold,
                moderate: baseThreshold * 2,
                major: baseThreshold * 3,
            };

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

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.corruption.value': newCorruption,
                },
            });

            let response = `# Corruption Added: ${character.name}\n\n`;
            response += `**Reason**: ${args.reason}\n\n`;
            response += `- Previous: ${currentCorruption} points\n`;
            response += `- Added: +${args.amount} points\n`;
            response += `- **New Total**: ${newCorruption} points\n\n`;

            let severityLabel = 'Minor';
            if (args.amount >= 4) severityLabel = 'Severe';
            else if (args.amount >= 2) severityLabel = 'Moderate';

            response += `**Exposure Severity**: ${severityLabel} (${args.amount} points)\n\n`;

            if (crossedThresholds.length > 0) {
                response += `## ⚠️ THRESHOLDS CROSSED!\n\n`;
                crossedThresholds.forEach((threshold) => {
                    response += `- **${threshold} Corruption Threshold** exceeded!\n`;
                });
                response += `\n**GM Action Required**: Roll for ${crossedThresholds.length} new mutation(s).\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to add corruption', error);
            throw new Error(`Failed to add corruption to "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleRemoveCorruption(args: { characterName: string; amount: number; reason: string }): Promise<string> {
        this.logger.info('Removing Corruption', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const currentCorruption = system.status?.corruption?.value || 0;

            if (currentCorruption === 0) {
                return `${character.name} has no Corruption points to remove.`;
            }

            const amountToRemove = Math.min(args.amount, currentCorruption);
            const newCorruption = currentCorruption - amountToRemove;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.corruption.value': newCorruption,
                },
            });

            let response = `✅ Removed ${amountToRemove} Corruption point(s) from ${character.name}\n\n`;
            response += `**Reason**: ${args.reason}\n`;
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
}
