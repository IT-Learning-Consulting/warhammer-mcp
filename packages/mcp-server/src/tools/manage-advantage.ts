import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ManageAdvantageOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

const ManageAdvantageSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('add'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10).default(1),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal('remove'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10).default(1),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal('clear'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal('get'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
    }),
]);

export class ManageAdvantageTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: ManageAdvantageOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'ManageAdvantage' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'manage-advantage',
                description: 'Manage Advantage for WFRP 4e combat. Advantage accumulates from successful attacks and is lost when hit or combat ends. Each point adds +10 to combat tests. Actions: add, remove, clear, get. Example: "Add 1 Advantage to Hans for successful attack" or "Clear Gustav\'s Advantage (combat ended)"',
                inputSchema: {
                    type: 'object',
                    oneOf: [
                        {
                            properties: {
                                action: { type: 'string', const: 'add' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, default: 1, description: 'Amount of Advantage to add (typically 1-3)' },
                                reason: { type: 'string', description: 'Reason for gaining Advantage (e.g., "Successful attack", "Flanking enemy")' },
                            },
                            required: ['action', 'characterName'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'remove' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, default: 1, description: 'Amount of Advantage to remove' },
                                reason: { type: 'string', description: 'Reason for losing Advantage (e.g., "Failed test while attacked", "Surprised")' },
                            },
                            required: ['action', 'characterName'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'clear' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                reason: { type: 'string', description: 'Reason for clearing Advantage (e.g., "Combat ended")' },
                            },
                            required: ['action', 'characterName'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'get' },
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
        const parsed = ManageAdvantageSchema.parse(args);

        switch (parsed.action) {
            case 'add':
                return this.handleAddAdvantage(parsed);
            case 'remove':
                return this.handleRemoveAdvantage(parsed);
            case 'clear':
                return this.handleClearAdvantage(parsed);
            case 'get':
                return this.handleGetAdvantage(parsed);
        }
    }

    private async handleGetAdvantage(args: { characterName: string }): Promise<string> {
        this.logger.info('Getting Advantage', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;

            const advantageCurrent = system.status?.advantage?.value || 0;
            const advantageMax = system.status?.advantage?.max || 10;

            let response = `# Advantage: ${character.name}\n\n`;

            let statusIcon = '⚔️';
            if (advantageCurrent === 0) {
                statusIcon = '🔵';
            } else if (advantageCurrent >= 3) {
                statusIcon = '🔥';
            }

            response += `## ${statusIcon} Current Advantage: ${advantageCurrent}\n\n`;

            const advantageBar = '█'.repeat(advantageCurrent) + '░'.repeat(Math.max(0, 10 - advantageCurrent));
            response += `\`${advantageBar}\` ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'}\n\n`;

            response += `## 🎯 Combat Test Bonus: +${advantageCurrent * 10}\n\n`;

            if (advantageCurrent === 0) {
                response += `${character.name} has no Advantage bonus. They fight on equal footing with their opponent.\n\n`;
            } else {
                response += `${character.name} adds **+${advantageCurrent * 10}** to all combat tests (attacks, parries, dodges).\n\n`;
            }

            response += `## ⚔️ Tactical Situation\n\n`;

            if (advantageCurrent === 0) {
                response += `**No Momentum**: ${character.name} has no tactical advantage in combat.\n\n`;
                response += `**Gain Advantage by**:\n`;
                response += `- Successfully attacking and damaging an opponent\n`;
                response += `- Winning Opposed Tests in combat\n`;
                response += `- Gaining tactical positioning (higher ground, flanking)\n`;
            } else if (advantageCurrent <= 2) {
                response += `**Minor Advantage**: ${character.name} has a slight edge in combat.\n`;
            } else if (advantageCurrent <= 4) {
                response += `**Significant Advantage**: ${character.name} has strong momentum!\n`;
                response += `The +${advantageCurrent * 10} bonus makes attacks much more likely to succeed.\n`;
            } else {
                response += `**Dominant Position**: ${character.name} has overwhelming momentum!\n`;
                response += `The +${advantageCurrent * 10} bonus makes even difficult attacks feasible.\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get Advantage', error);
            throw new Error(`Failed to retrieve Advantage for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleAddAdvantage(args: { characterName: string; amount?: number; reason?: string | undefined }): Promise<string> {
        this.logger.info('Adding Advantage', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;

            const advantageCurrent = system.status?.advantage?.value || 0;
            const advantageMax = system.status?.advantage?.max || 10;
            const amount = args.amount ?? 1;
            const newAdvantage = Math.min(advantageMax, advantageCurrent + amount);
            const actualGain = newAdvantage - advantageCurrent;

            await this.foundryClient.query<any>('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.advantage.value': newAdvantage,
                },
            });

            let response = `# Advantage Gained: ${character.name}\n\n`;
            if (args.reason) {
                response += `**Reason**: ${args.reason}\n\n`;
            }

            response += `- Previous: ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'} (+${advantageCurrent * 10} bonus)\n`;
            response += `- Gained: +${actualGain} point${actualGain === 1 ? '' : 's'}\n`;
            response += `- **New Total**: ${newAdvantage} point${newAdvantage === 1 ? '' : 's'}\n`;
            response += `- **New Bonus**: +${newAdvantage * 10} to combat tests\n\n`;

            const advantageBar = '█'.repeat(newAdvantage) + '░'.repeat(Math.max(0, 10 - newAdvantage));
            response += `\`${advantageBar}\`\n\n`;

            if (actualGain < amount) {
                response += `⚠️ **Advantage Capped**: Gained ${actualGain} instead of ${amount} due to maximum Advantage limit (${advantageMax}).\n\n`;
            }

            if (newAdvantage === 1 && advantageCurrent === 0) {
                response += `## 🎯 Momentum Established!\n${character.name} has gained the initiative!\n`;
            } else if (newAdvantage >= 3 && advantageCurrent < 3) {
                response += `## 🔥 Strong Momentum!\n${character.name} now has significant combat advantage!\n`;
            } else if (newAdvantage >= 5) {
                response += `## ⚡ Overwhelming Advantage!\n${character.name} dominates the combat!\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to add Advantage', error);
            throw new Error(`Failed to add Advantage to "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleRemoveAdvantage(args: { characterName: string; amount?: number; reason?: string | undefined }): Promise<string> {
        this.logger.info('Removing Advantage', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;

            const advantageCurrent = system.status?.advantage?.value || 0;
            const amount = args.amount ?? 1;
            const newAdvantage = Math.max(0, advantageCurrent - amount);
            const actualLoss = advantageCurrent - newAdvantage;

            if (advantageCurrent === 0) {
                return `${character.name} already has 0 Advantage. No Advantage to lose.`;
            }

            await this.foundryClient.query<any>('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.advantage.value': newAdvantage,
                },
            });

            let response = `# Advantage Lost: ${character.name}\n\n`;
            if (args.reason) {
                response += `**Reason**: ${args.reason}\n\n`;
            }

            response += `- Previous: ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'} (+${advantageCurrent * 10} bonus)\n`;
            response += `- Lost: -${actualLoss} point${actualLoss === 1 ? '' : 's'}\n`;
            response += `- **New Total**: ${newAdvantage} point${newAdvantage === 1 ? '' : 's'}\n`;
            response += `- **New Bonus**: +${newAdvantage * 10} to combat tests\n\n`;

            const advantageBar = '█'.repeat(newAdvantage) + '░'.repeat(Math.max(0, 10 - newAdvantage));
            response += `\`${advantageBar}\`\n\n`;

            if (newAdvantage === 0) {
                response += `## ⚠️ Momentum Lost!\n${character.name} has lost all combat advantage!\n`;
            } else if (advantageCurrent >= 3 && newAdvantage < 3) {
                response += `## ↘️ Significant Momentum Loss\n${character.name}'s strong advantage has been reduced!\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to remove Advantage', error);
            throw new Error(`Failed to remove Advantage from "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleClearAdvantage(args: { characterName: string; reason?: string | undefined }): Promise<string> {
        this.logger.info('Clearing Advantage', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const advantageCurrent = system.status?.advantage?.value || 0;

            if (advantageCurrent === 0) {
                return `${character.name} already has 0 Advantage.`;
            }

            await this.foundryClient.query<any>('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.advantage.value': 0,
                },
            });

            let response = `# Advantage Cleared: ${character.name}\n\n`;
            if (args.reason) {
                response += `**Reason**: ${args.reason}\n\n`;
            }

            response += `- Previous: ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'} (+${advantageCurrent * 10} bonus)\n`;
            response += `- **New Total**: 0 points\n\n`;

            response += `⚠️ All combat advantage has been reset to 0.\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to clear Advantage', error);
            throw new Error(`Failed to clear Advantage for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
