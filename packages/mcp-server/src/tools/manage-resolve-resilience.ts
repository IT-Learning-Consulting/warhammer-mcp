import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ManageResolveResilienceOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

const ManageResolveResilienceSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('add-resolve'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal('spend-resolve'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(10).default(1),
        reason: z.string().optional(),
        usageType: z.enum(['ignore-psychology', 'ignore-criticals', 'remove-condition']),
    }),
    z.object({
        action: z.literal('refresh-resolve'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        motivationAction: z.string().min(1, 'Motivation action cannot be empty'),
    }),
    z.object({
        action: z.literal('add-resilience'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        amount: z.number().int().min(1).max(3),
        reason: z.string().min(1, 'Reason cannot be empty'),
    }),
    z.object({
        action: z.literal('spend-resilience'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
        circumstance: z.string().min(1, 'Circumstance cannot be empty'),
        usageType: z.enum(['deny-mutation', 'auto-succeed']),
    }),
    z.object({
        action: z.literal('get-status'),
        characterName: z.string().min(1, 'Character name cannot be empty'),
    }),
]);

export class ManageResolveResilienceTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: ManageResolveResilienceOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'ManageResolveResilience' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'manage-resolve-resilience',
                description: 'Manage Resolve and Resilience points for WFRP 4e characters. Resolve refreshes when acting according to Motivation and can be spent to overcome obstacles. Resilience is permanent but can be spent to resist Corruption or guarantee success (EXTREME circumstances). Actions: add-resolve, spend-resolve, refresh-resolve, add-resilience, spend-resilience, get-status. Example: "Check Hans\' Resolve status" or "Hans spends Resolve to ignore Psychology"',
                inputSchema: {
                    type: 'object',
                    oneOf: [
                        {
                            properties: {
                                action: { type: 'string', const: 'add-resolve' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, description: 'Number of Resolve points to add' },
                                reason: { type: 'string', description: 'Why Resolve is being awarded (optional)' },
                            },
                            required: ['action', 'characterName', 'amount'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'spend-resolve' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 10, default: 1, description: 'Number of Resolve points to spend' },
                                reason: { type: 'string', description: 'Why Resolve is being spent (optional)' },
                                usageType: { type: 'string', enum: ['ignore-psychology', 'ignore-criticals', 'remove-condition'], description: 'How Resolve is used' },
                            },
                            required: ['action', 'characterName', 'usageType'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'refresh-resolve' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                motivationAction: { type: 'string', description: 'How the character acted according to their Motivation' },
                            },
                            required: ['action', 'characterName', 'motivationAction'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'add-resilience' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                amount: { type: 'number', minimum: 1, maximum: 3, description: 'Number of Resilience points to add (EXTREMELY RARE)' },
                                reason: { type: 'string', description: 'The significant achievement aligned with Motivation' },
                            },
                            required: ['action', 'characterName', 'amount', 'reason'],
                        },
                        {
                            properties: {
                                action: { type: 'string', const: 'spend-resilience' },
                                characterName: { type: 'string', description: 'Name or ID of the character' },
                                circumstance: { type: 'string', description: 'The extreme circumstance requiring this permanent expenditure' },
                                usageType: { type: 'string', enum: ['deny-mutation', 'auto-succeed'], description: 'How Resilience is spent: deny mutation or auto-succeed on test' },
                            },
                            required: ['action', 'characterName', 'circumstance', 'usageType'],
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
        const parsed = ManageResolveResilienceSchema.parse(args);

        switch (parsed.action) {
            case 'add-resolve':
                return this.handleAddResolve(parsed);
            case 'spend-resolve':
                return this.handleSpendResolve(parsed);
            case 'refresh-resolve':
                return this.handleRefreshResolve(parsed);
            case 'add-resilience':
                return this.handleAddResilience(parsed);
            case 'spend-resilience':
                return this.handleSpendResilience(parsed);
            case 'get-status':
                return this.handleGetStatus(parsed);
        }
    }

    private async handleGetStatus(args: { characterName: string }): Promise<string> {
        this.logger.info('Getting Resilience/Resolve status', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resilience/Resolve tracking is only available for WFRP characters.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resolveMax = resilienceCurrent;
            const resilienceMax = system.status?.resilience?.max || resilienceCurrent;

            let response = `# Resilience & Resolve: ${character.name}\n\n`;

            // Resolve Section
            response += `## 💪 Resolve Points\n`;
            response += `**Current**: ${resolveCurrent} / ${resolveMax}\n\n`;

            const resolveBar = '●'.repeat(resolveCurrent) + '○'.repeat(Math.max(0, resolveMax - resolveCurrent));
            response += `\`${resolveBar}\`\n\n`;

            if (resolveCurrent === 0) {
                response += `⚠️ **No Resolve remaining!** ${character.name} cannot ignore Psychology, Critical Wounds, or remove Conditions until Resolve refreshes.\n\n`;
            } else if (resolveCurrent < resolveMax / 2) {
                response += `⚠️ **Low Resolve.** Consider saving remaining points for critical moments.\n\n`;
            } else if (resolveCurrent === resolveMax) {
                response += `✅ **Full Resolve!** ${character.name} has all their determination available.\n\n`;
            } else {
                response += `${character.name} has ${resolveCurrent} Resolve point${resolveCurrent === 1 ? '' : 's'} remaining.\n\n`;
            }

            response += `### Resolve Usage:\n`;
            response += `- **Ignore Psychology**: Become immune to Psychology until end of next round\n`;
            response += `- **Ignore Criticals**: Ignore all Critical Wound modifiers until start of next round\n`;
            response += `- **Remove Condition**: Remove one Condition (Prone also heals 1 Wound)\n`;
            response += `- **Refresh**: Resolve restores when acting according to Motivation\n\n`;

            // Resilience Section
            response += `## 🛡️ Resilience Points\n`;
            response += `**Current**: ${resilienceCurrent} / ${resilienceMax}\n\n`;

            const resilienceBar = '■'.repeat(resilienceCurrent) + '□'.repeat(Math.max(0, resilienceMax - resilienceCurrent));
            response += `\`${resilienceBar}\`\n\n`;

            if (resilienceCurrent === 0) {
                response += `💀 **NO RESILIENCE REMAINING!** ${character.name} has no inner strength left. They cannot deny mutations or guarantee success!\n\n`;
            } else if (resilienceCurrent === 1) {
                response += `⚠️ **Last Resilience Point!** ${character.name} has only one chance for an extraordinary feat of will remaining. Use it wisely.\n\n`;
            } else {
                response += `${character.name} has ${resilienceCurrent} Resilience point${resilienceCurrent === 1 ? '' : 's'} - permanent inner strength.\n\n`;
            }

            response += `### Resilience Usage (PERMANENT):\n`;
            response += `- **I Deny You!**: Refuse a rolled mutation (does not remove Corruption points)\n`;
            response += `- **I Will Not Fail!**: Automatically succeed at any Test, choose roll result\n`;
            response += `- **No Refresh**: Resilience points do NOT refresh - they represent permanent willpower\n\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to get Resilience/Resolve status', error);
            throw new Error(`Failed to retrieve Resilience/Resolve status for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleAddResolve(args: { characterName: string; amount: number; reason?: string | undefined }): Promise<string> {
        this.logger.info('Adding Resolve points', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resolveMax = resilienceCurrent;

            if (resolveMax === 0) {
                return `❌ **Cannot Add Resolve**\n\n${character.name} has 0 Resilience points, which means Resolve maximum is 0.`;
            }

            const newResolve = Math.min(resolveCurrent + args.amount, resolveMax);
            const actualAdded = newResolve - resolveCurrent;

            if (actualAdded === 0) {
                return `❌ **Cannot Add Resolve**\n\n${character.name}'s Resolve is already at maximum (${resolveMax}).`;
            }

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resolve.value': newResolve,
                },
            });

            let response = `# ✨ Resolve Awarded: ${character.name}\n\n`;
            response += `- Previous: ${resolveCurrent} / ${resolveMax}\n`;
            response += `- **New Total**: ${newResolve} / ${resolveMax}\n`;
            response += `- Added: +${actualAdded} Resolve point${actualAdded === 1 ? '' : 's'}\n\n`;

            if (args.reason) {
                response += `### 🌟 Reason\n> ${args.reason}\n\n`;
            }

            const resolveBar = '●'.repeat(newResolve) + '○'.repeat(Math.max(0, resolveMax - newResolve));
            response += `\`${resolveBar}\`\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Resolve', error);
            throw new Error(`Failed to add Resolve for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleSpendResolve(args: { characterName: string; amount?: number; reason?: string | undefined; usageType: string }): Promise<string> {
        this.logger.info('Spending Resolve', { characterName: args.characterName, usageType: args.usageType });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resolveMax = resilienceCurrent;
            const spendAmount = args.amount ?? 1;

            if (resolveCurrent < spendAmount) {
                return `❌ **Cannot Spend Resolve!**\n\n${character.name} has only ${resolveCurrent} Resolve point${resolveCurrent === 1 ? '' : 's'} remaining (needs ${spendAmount}).`;
            }

            const newResolve = resolveCurrent - spendAmount;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resolve.value': newResolve,
                },
            });

            let response = `# 💪 Resolve Spent: ${character.name}\n\n`;
            if (args.reason) {
                response += `**Purpose**: ${args.reason}\n\n`;
            }

            response += `## Resolve Change\n`;
            response += `- Previous: ${resolveCurrent} point${resolveCurrent === 1 ? '' : 's'}\n`;
            response += `- Spent: -${spendAmount} point${spendAmount === 1 ? '' : 's'}\n`;
            response += `- **Remaining**: ${newResolve} / ${resolveMax}\n\n`;

            const resolveBar = '●'.repeat(newResolve) + '○'.repeat(Math.max(0, resolveMax - newResolve));
            response += `\`${resolveBar}\`\n\n`;

            if (args.usageType === 'ignore-psychology') {
                response += `## 🧠 Ignore Psychology Effect\n${character.name} becomes immune to all Psychology effects until the end of the next round.\n`;
            } else if (args.usageType === 'ignore-criticals') {
                response += `## 🩹 Ignore Critical Wounds Effect\n${character.name} ignores ALL modifiers from ALL Critical Wounds until the beginning of the next round.\n`;
            } else {
                response += `## 🚫 Remove Condition Effect\n${character.name} removes one Condition through sheer determination. If removing Prone, also regain 1 Wound!\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to spend Resolve', error);
            throw new Error(`Failed to spend Resolve for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleRefreshResolve(args: { characterName: string; motivationAction: string }): Promise<string> {
        this.logger.info('Refreshing Resolve', { characterName: args.characterName });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resolveMax = resilienceCurrent;

            if (resolveMax === 0) {
                return `❌ **Cannot Refresh Resolve**\n\n${character.name} has 0 Resilience points, which means Resolve maximum is 0.`;
            }

            if (resolveCurrent >= resolveMax) {
                return `${character.name}'s Resolve is already at maximum (${resolveMax}).`;
            }

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resolve.value': resolveMax,
                },
            });

            let response = `# 🙏 Resolve Refreshed: ${character.name}\n\n`;
            response += `By acting according to their Motivation, ${character.name} renews their inner reserves.\n\n`;
            response += `## Motivation Action\n> ${args.motivationAction}\n\n`;

            response += `## Resolve Restored\n`;
            response += `- Previous: ${resolveCurrent} / ${resolveMax}\n`;
            response += `- **Restored to**: ${resolveMax} / ${resolveMax}\n`;
            response += `- Gained: +${resolveMax - resolveCurrent} Resolve point${(resolveMax - resolveCurrent) === 1 ? '' : 's'}\n\n`;

            const resolveBar = '●'.repeat(resolveMax);
            response += `\`${resolveBar}\` **FULL RESOLVE!**\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to refresh Resolve', error);
            throw new Error(`Failed to refresh Resolve for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleAddResilience(args: { characterName: string; amount: number; reason: string }): Promise<string> {
        this.logger.info('Adding Resilience point (RARE EVENT)', { characterName: args.characterName, amount: args.amount });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resilience !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system.`;
            }

            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resilienceMax = system.status?.resilience?.max || resilienceCurrent;
            const newResilience = resilienceCurrent + args.amount;
            const newResilienceMax = resilienceMax + args.amount;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resilience.value': newResilience,
                },
            });

            let response = `# 🌟✨ RESILIENCE GRANTED ✨🌟\n\n`;
            response += `## ⚡ ${character.name}'s Inner Strength Has Grown! ⚡\n\n`;
            response += `**${character.name}** has gained **${args.amount} Resilience point${args.amount === 1 ? '' : 's'}**! This represents permanent nourishment of the soul through acts of extreme importance to their Motivation.\n\n`;
            response += `### 📜 The Achievement\n> ${args.reason}\n\n`;

            response += `### Resilience (Inner Strength)\n`;
            response += `- Previous: ${resilienceCurrent} / ${resilienceMax}\n`;
            response += `- **New**: ${newResilience} / ${newResilienceMax}\n`;
            response += `- Gained: **+${args.amount} Resilience point${args.amount === 1 ? '' : 's'}** ✨\n\n`;

            const resilienceBar = '■'.repeat(newResilience);
            response += `\`${resilienceBar}\` **${newResilience} RESILIENCE POINT${newResilience === 1 ? '' : 'S'}!**\n\n`;

            response += `## 💫 What This Means\n`;
            response += `- Additional protection from Chaos (can deny mutations ${args.amount} more time${args.amount === 1 ? '' : 's'})\n`;
            response += `- Guaranteed success reserve (auto-succeed on Tests ${args.amount} more time${args.amount === 1 ? '' : 's'})\n`;
            response += `- Resolve capacity increased to **${newResilience}**\n\n`;

            response += `🎊 **This is an extremely rare, character-defining spiritual advancement!** 🎊\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Resilience', error);
            throw new Error(`Failed to add Resilience for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleSpendResilience(args: { characterName: string; circumstance: string; usageType: string }): Promise<string> {
        this.logger.info('Spending Resilience (PERMANENT)', { characterName: args.characterName, usageType: args.usageType });

        try {
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: args.characterName,
            });

            if (!character) {
                throw new Error(`Character "${args.characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resilience !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system.`;
            }

            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resilienceMax = system.status?.resilience?.max || resilienceCurrent;

            if (resilienceCurrent <= 0) {
                return `💀 **RESILIENCE UNAVAILABLE!**\n\n${character.name} has no Resilience points remaining. They cannot deny mutations or guarantee success.\n\n**This is permanent** - ${character.name}'s inner reserves are depleted.`;
            }

            const newResilience = resilienceCurrent - 1;
            const newResilienceMax = resilienceMax - 1;

            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resilience.value': newResilience,
                },
            });

            let response = `# 🛡️ RESILIENCE SPENT: ${character.name}\n\n`;
            response += `**Circumstance**: ${args.circumstance}\n\n`;

            if (args.usageType === 'deny-mutation') {
                response += `## I DENY YOU!\n`;
                response += `Through sheer force of will, ${character.name} refuses the mutation attempting to twist their flesh. The Chaos within recoils, denied by unbreakable determination.\n\n`;
            } else {
                response += `## I WILL NOT FAIL!\n`;
                response += `${character.name} taps into reserves of willpower thought impossible. Success is not hoped for - it is WILLED into existence through pure determination.\n\n`;
            }

            response += `## Resilience Points\n`;
            response += `- Previous: ${resilienceCurrent} point${resilienceCurrent === 1 ? '' : 's'}\n`;
            response += `- **SPENT**: -1 point (PERMANENT)\n`;
            response += `- **New Current**: ${newResilience} / ${newResilienceMax}\n`;
            response += `- **New Maximum**: ${newResilienceMax} (permanently reduced)\n\n`;

            const resilienceBar = '■'.repeat(newResilience) + '□'.repeat(Math.max(0, newResilienceMax - newResilience));
            response += `\`${resilienceBar}\`\n\n`;

            if (args.usageType === 'deny-mutation') {
                response += `## 🚫 Mutation Denied\n`;
                response += `The mutation that would have manifested is refused. ${character.name}'s Corruption points remain unchanged.\n`;
                response += `**Important**: This does NOT remove Corruption!\n\n`;
            } else {
                response += `## ✅ Automatic Success\n`;
                response += `${character.name} chooses the Test result instead of rolling. They can:\n`;
                response += `- Succeed at any difficulty Test\n`;
                response += `- Win any Opposed Test by +1 SL\n`;
                response += `- Choose to cause a Critical and select hit location\n`;
                response += `- Even succeed on a Test already failed!\n\n`;
            }

            if (newResilience === 0) {
                response += `## 💀 NO RESILIENCE REMAINING\n`;
                response += `**THIS WAS ${character.name.toUpperCase()}'S LAST RESILIENCE POINT!**\n\n`;
                response += `Their inner reserves are completely depleted.\n`;
            } else if (newResilience === 1) {
                response += `## ⚠️ Last Resilience Point\n`;
                response += `${character.name} has only **1 Resilience point remaining**.\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to spend Resilience', error);
            throw new Error(`Failed to spend Resilience for "${args.characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
