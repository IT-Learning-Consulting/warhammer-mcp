import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ManageFortuneFateOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

const ManageFortuneFateSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('add-fortune'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal('spend-fortune'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10).default(1),
        reason: z.string().optional(),
        usageType: z.enum(['reroll', 'add-sl']),
    }),
    z.object({
        action: z.literal('refresh-fortune'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
    }),
    z.object({
        action: z.literal('add-fate'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(3),
        reason: z.string().min(1, 'Reason cannot be empty'),
    }),
    z.object({
        action: z.literal('burn-fate'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        circumstance: z.string().min(1, 'Circumstance cannot be empty'),
    }),
    z.object({
        action: z.literal('get-status'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
    }),
]);

export class ManageFortuneFateTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: ManageFortuneFateOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'ManageFortuneFate' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'manage-fortune-fate',
                description: 'Manage Fortune and Fate points for WFRP 4e characters. Fortune refreshes each session and can be spent to reroll tests or add Success Levels. Fate is permanent but can be burned to survive death (becoming permanently lost). Actions: add-fortune, spend-fortune, refresh-fortune, add-fate, burn-fate, get-status. Example: "Check Hans\' Fortune and Fate status" or "Hans spends Fortune to reroll"',
                inputSchema: {
                    type: 'object',
                    oneOf: [
                        {
                            properties: {
                                action: { type: 'string', const: 'add-fortune' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, description: 'Number of Fortune points to add' },
                                reason: { type: 'string', description: 'Why Fortune is being awarded (optional)' },
                            },
                            required: ['action', 'characterName', 'amount'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'spend-fortune' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, default: 1, description: 'Number of Fortune points to spend' },
                                reason: { type: 'string', description: 'Why Fortune is being spent (optional)' },
                                usageType: { type: 'string', enum: ['reroll', 'add-sl'], description: 'How Fortune is used: reroll entire test or add +1 SL' },
                            },
                            required: ['action', 'characterName', 'usageType'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'refresh-fortune' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                            },
                            required: ['action', 'characterName'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'add-fate' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 3, description: 'Number of Fate points to add (EXTREMELY RARE)' },
                                reason: { type: 'string', description: 'The momentous achievement that earned this Fate' },
                            },
                            required: ['action', 'characterName', 'amount', 'reason'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'burn-fate' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                circumstance: { type: 'string', description: 'How the character was reduced to 0 Wounds' },
                            },
                            required: ['action', 'characterName', 'circumstance'],
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
        const parsed = ManageFortuneFateSchema.parse(args);

        switch (parsed.action) {
            case 'add-fortune':
                return this.handleAddFortune(parsed);
            case 'spend-fortune':
                return this.handleSpendFortune(parsed);
            case 'refresh-fortune':
                return this.handleRefreshFortune(parsed);
            case 'add-fate':
                return this.handleAddFate(parsed);
            case 'burn-fate':
                return this.handleBurnFate(parsed);
            case 'get-status':
                return this.handleGetStatus(parsed);
        }
    }

    private async handleGetStatus(args: { characterName: string }): Promise<string> {
        this.logger.info('Getting Fortune/Fate status', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune/Fate tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;
            const fortuneMax = fateCurrent;
            const fateMax = system.status?.fate?.max || fateCurrent;

            let response = `# Fortune & Fate: ${character.name}\n\n`;

            // Fortune Section
            response += `## 🍀 Fortune Points\n`;
            response += `**Current**: ${fortuneCurrent} / ${fortuneMax}\n\n`;

            const fortuneBar = '●'.repeat(fortuneCurrent) + '○'.repeat(Math.max(0, fortuneMax - fortuneCurrent));
            response += `\`${fortuneBar}\`\n\n`;

            if (fortuneCurrent === 0) {
                response += `⚠️ **No Fortune remaining!** ${character.name} cannot reroll tests or add Success Levels until Fortune refreshes.\n\n`;
            } else if (fortuneCurrent < fortuneMax / 2) {
                response += `⚠️ **Low Fortune.** Consider saving remaining points for critical moments.\n\n`;
            } else if (fortuneCurrent === fortuneMax) {
                response += `✅ **Full Fortune!** ${character.name} has all their luck available.\n\n`;
            } else {
                response += `${character.name} has ${fortuneCurrent} Fortune point${fortuneCurrent === 1 ? '' : 's'} remaining.\n\n`;
            }

            response += `### Fortune Usage:\n`;
            response += `- **Reroll**: Reroll any failed test entirely\n`;
            response += `- **Add SL**: Add +1 Success Level to a test result\n`;
            response += `- **Refresh**: Fortune restores to maximum after a good night's rest\n\n`;

            // Fate Section
            response += `## ⭐ Fate Points\n`;
            response += `**Current**: ${fateCurrent} / ${fateMax}\n\n`;

            const fateBar = '★'.repeat(fateCurrent) + '☆'.repeat(Math.max(0, fateMax - fateCurrent));
            response += `\`${fateBar}\`\n\n`;

            if (fateCurrent === 0) {
                response += `💀 **NO FATE REMAINING!** ${character.name} has no protection from death. If reduced to 0 Wounds, they will die permanently!\n\n`;
            } else if (fateCurrent === 1) {
                response += `⚠️ **Last Fate Point!** ${character.name} has only one chance to cheat death remaining. Use it wisely.\n\n`;
            } else {
                response += `${character.name} has ${fateCurrent} Fate point${fateCurrent === 1 ? '' : 's'} - protection from death.\n\n`;
            }

            response += `### Fate Usage:\n`;
            response += `- **Burn Fate**: When reduced to 0 Wounds, burn a Fate point to survive with 1 Wound\n`;
            response += `- **Permanent Loss**: Burning Fate permanently reduces maximum Fate by 1\n`;
            response += `- **No Refresh**: Fate points do NOT refresh - they represent destiny itself\n`;
            response += `- **Consequence**: Burning Fate typically results in a permanent injury or disfigurement\n\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to get Fortune/Fate status', error);
            throw new Error(`Failed to retrieve Fortune/Fate status for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleAddFortune(args: { characterName: string; amount: number; reason?: string | undefined }): Promise<string> {
        this.logger.info('Adding Fortune points', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;
            const fortuneMax = fateCurrent;

            if (fortuneMax === 0) {
                return `❌ **Cannot Add Fortune**\n\n${character.name} has 0 Fate points, which means Fortune maximum is 0. Fate must be increased before Fortune can be added.`;
            }

            const newFortune = Math.min(fortuneCurrent + args.amount, fortuneMax);
            const actualAdded = newFortune - fortuneCurrent;

            if (actualAdded === 0) {
                return `❌ **Cannot Add Fortune**\n\n${character.name}'s Fortune is already at maximum (${fortuneMax}).`;
            }

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fortune.value': newFortune,
                },
            });

            let response = `# ✨ Fortune Awarded: ${character.name}\n\n`;
            response += `- Previous: ${fortuneCurrent} / ${fortuneMax}\n`;
            response += `- **New Total**: ${newFortune} / ${fortuneMax}\n`;
            response += `- Added: +${actualAdded} Fortune point${actualAdded === 1 ? '' : 's'}\n\n`;

            if (args.reason) {
                response += `### 🌟 Reason\n> ${args.reason}\n\n`;
            }

            const fortuneBar = '●'.repeat(newFortune) + '○'.repeat(Math.max(0, fortuneMax - newFortune));
            response += `\`${fortuneBar}\`\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Fortune', error);
            throw new Error(`Failed to add Fortune for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleSpendFortune(args: { characterName: string; amount?: number; reason?: string | undefined; usageType: 'reroll' | 'add-sl' }): Promise<string> {
        this.logger.info('Spending Fortune', { characterName: args.characterName, amount: args.amount, usageType: args.usageType });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;
            const fortuneMax = fateCurrent;
            const spendAmount = args.amount ?? 1;

            if (fortuneCurrent < spendAmount) {
                return `❌ **Cannot Spend Fortune!**\n\n${character.name} has only ${fortuneCurrent} Fortune point${fortuneCurrent === 1 ? '' : 's'} remaining (needs ${spendAmount}).`;
            }

            const newFortune = fortuneCurrent - spendAmount;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fortune.value': newFortune,
                },
            });

            let response = `# Fortune Spent: ${character.name}\n\n`;
            if (args.reason) {
                response += `**Purpose**: ${args.reason}\n`;
            }
            response += `**Usage**: ${args.usageType === 'reroll' ? '🎲 Reroll Test' : '➕ Add +1 Success Level'}\n\n`;

            response += `## Fortune Change\n`;
            response += `- Previous: ${fortuneCurrent} point${fortuneCurrent === 1 ? '' : 's'}\n`;
            response += `- Spent: -${spendAmount} point${spendAmount === 1 ? '' : 's'}\n`;
            response += `- **Remaining**: ${newFortune} / ${fortuneMax}\n\n`;

            const fortuneBar = '●'.repeat(newFortune) + '○'.repeat(Math.max(0, fortuneMax - newFortune));
            response += `\`${fortuneBar}\`\n\n`;

            if (args.usageType === 'reroll') {
                response += `## 🎲 Reroll Effect\n${character.name} rerolls the entire test. Use the new result, even if it's worse.\n`;
            } else {
                response += `## ➕ Add Success Level Effect\n${character.name} adds +1 SL to the test result. This can turn failure into success.\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to spend Fortune', error);
            throw new Error(`Failed to spend Fortune for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleRefreshFortune(args: { characterName: string }): Promise<string> {
        this.logger.info('Refreshing Fortune', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;
            const fortuneMax = fateCurrent;

            if (fortuneMax === 0) {
                return `❌ **Cannot Refresh Fortune**\n\n${character.name} has 0 Fate points, which means Fortune maximum is 0.`;
            }

            if (fortuneCurrent >= fortuneMax) {
                return `${character.name}'s Fortune is already at maximum (${fortuneMax}).`;
            }

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fortune.value': fortuneMax,
                },
            });

            let response = `# 🌅 Fortune Refreshed: ${character.name}\n\n`;
            response += `After a good night's rest, ${character.name} awakens with renewed luck and vigor.\n\n`;
            response += `- Previous: ${fortuneCurrent} / ${fortuneMax}\n`;
            response += `- **Restored to**: ${fortuneMax} / ${fortuneMax}\n`;
            response += `- Gained: +${fortuneMax - fortuneCurrent} Fortune point${(fortuneMax - fortuneCurrent) === 1 ? '' : 's'}\n\n`;

            const fortuneBar = '●'.repeat(fortuneMax);
            response += `\`${fortuneBar}\` **FULL FORTUNE!**\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to refresh Fortune', error);
            throw new Error(`Failed to refresh Fortune for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleAddFate(args: { characterName: string; amount: number; reason: string }): Promise<string> {
        this.logger.info('Adding Fate point (RARE EVENT)', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fate !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fate tracking is only available for WFRP characters.`;
            }

            const fateCurrent = system.status?.fate?.value ?? 0;
            const fateMax = system.status?.fate?.max || fateCurrent;
            const newFate = fateCurrent + args.amount;
            const newFateMax = fateMax + args.amount;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fate.value': newFate,
                },
            });

            let response = `# 🌟✨ FATE GRANTED ✨🌟\n\n`;
            response += `## ⚡ ${character.name}'s Destiny Has Changed! ⚡\n\n`;
            response += `**${character.name}** has gained **${args.amount} Fate point${args.amount === 1 ? '' : 's'}**! This represents destiny itself reshaping around their heroic deeds.\n\n`;
            response += `### 📜 The Achievement\n> ${args.reason}\n\n`;

            response += `### Fate (Destiny Points)\n`;
            response += `- Previous: ${fateCurrent} / ${fateMax}\n`;
            response += `- **New**: ${newFate} / ${newFateMax}\n`;
            response += `- Gained: **+${args.amount} Fate point${args.amount === 1 ? '' : 's'}** ✨\n\n`;

            const fateBar = '★'.repeat(newFate);
            response += `\`${fateBar}\` **${newFate} FATE POINT${newFate === 1 ? '' : 'S'}!**\n\n`;

            response += `## 💫 What This Means\n`;
            response += `- Additional protection from death (can survive being reduced to 0 Wounds ${args.amount} more time${args.amount === 1 ? '' : 's'})\n`;
            response += `- Fortune capacity increased to **${newFate}** (refreshes to this amount each day)\n`;
            response += `- ${character.name} is marked by destiny\n\n`;

            response += `🎊 **This is a momentous, campaign-defining achievement!** 🎊\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Fate', error);
            throw new Error(`Failed to add Fate for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleBurnFate(args: { characterName: string; circumstance: string }): Promise<string> {
        this.logger.info('Burning Fate', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fate !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fate tracking is only available for WFRP characters.`;
            }

            const fateCurrent = system.status?.fate?.value ?? 0;
            const fateMax = system.status?.fate?.max || fateCurrent;

            if (fateCurrent <= 0) {
                return `💀 **FATE UNAVAILABLE!**\n\n${character.name} has no Fate points remaining. They cannot cheat death.\n\n**${character.name} DIES from: ${args.circumstance}**\n\nWithout Fate to intervene, death is permanent.`;
            }

            const newFate = fateCurrent - 1;
            const newFateMax = fateMax - 1;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fate.value': newFate,
                    'system.status.wounds.value': 1,
                },
            });

            let response = `# 💫 FATE BURNED: ${character.name}\n\n`;
            response += `**Circumstance**: ${args.circumstance}\n\n`;
            response += `As ${character.name} falls to 0 Wounds, destiny itself intervenes. Through sheer force of will and the threads of fate, they cling to life by the narrowest of margins.\n\n`;

            response += `## Fate Points\n`;
            response += `- Previous: ${fateCurrent} point${fateCurrent === 1 ? '' : 's'}\n`;
            response += `- **BURNED**: -1 point (PERMANENT)\n`;
            response += `- **New Current**: ${newFate} / ${newFateMax}\n`;
            response += `- **New Maximum**: ${newFateMax} (permanently reduced)\n\n`;

            const fateBar = '★'.repeat(newFate) + '☆'.repeat(Math.max(0, newFateMax - newFate));
            response += `\`${fateBar}\`\n\n`;

            response += `## 🩹 Survival Outcome\n`;
            response += `${character.name} survives with **1 Wound remaining**.\n\n`;
            response += `**However, there is always a price for cheating death:**\n`;
            response += `- Roll or choose a permanent injury or disfigurement\n`;
            response += `- Consider scars, lost fingers/eye, psychological trauma\n`;
            response += `- This should be a meaningful, lasting consequence\n\n`;

            if (newFate === 0) {
                response += `## 💀 NO FATE REMAINING\n`;
                response += `**THIS WAS ${character.name.toUpperCase()}'S LAST FATE POINT!**\n\n`;
                response += `If reduced to 0 Wounds again, death will be PERMANENT.\n`;
            } else if (newFate === 1) {
                response += `## ⚠️ Last Fate Point\n`;
                response += `${character.name} has only **1 Fate point remaining**. One more brush with death is all destiny will allow.\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to burn Fate', error);
            throw new Error(`Failed to burn Fate for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
