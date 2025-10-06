import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface FortuneFateToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

interface FortuneFateStatus {
    fortune: {
        current: number;
        max: number;
    };
    fate: {
        current: number;
        max: number;
    };
}

export class FortuneFateTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: FortuneFateToolsOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'FateResilienceTools' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'get-fortune-fate-status',
                description: 'Check a character\'s Fortune and Fate points. WFRP 4e specific: Fortune points can be spent to reroll tests or add +1 Success Level to a test result. Fate points represent destiny - when reduced to 0 Wounds, a character can burn a Fate point to survive (but permanently loses it). Fortune refreshes daily, Fate is permanent. Example: "Check Hans\' Fortune points" or "How much Fate does Gustav have?"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to check Fortune/Fate for',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'spend-fortune',
                description: 'Spend a Fortune point for a reroll or to add Success Level. WFRP 4e specific: Fortune can be spent in two ways: 1) Reroll any failed test, or 2) Add +1 SL to a test result after rolling. Fortune points refresh each day. This tool tracks the expenditure and provides guidance on when to use Fortune. Example: "Hans spends Fortune to reroll" or "Use Fortune to add SL to the attack"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character spending Fortune',
                        },
                        purpose: {
                            type: 'string',
                            description: 'Why Fortune is being spent (e.g., "Reroll failed Weapon Skill test", "Add SL to Charm test")',
                        },
                        usageType: {
                            type: 'string',
                            enum: ['reroll', 'add-sl'],
                            description: 'How the Fortune point is being used: reroll (reroll entire test) or add-sl (add +1 Success Level)',
                        },
                    },
                    required: ['characterName', 'purpose', 'usageType'],
                },
            },
            {
                name: 'burn-fate',
                description: 'Burn a permanent Fate point to survive death. WFRP 4e specific: When reduced to 0 Wounds, a character can burn a Fate point to miraculously survive - they are left with 1 Wound and gain a permanent, often disfiguring injury. The Fate point is permanently lost (max Fate reduced by 1). This is a last resort that reflects destiny intervening. Example: "Gustav burns Fate to survive" or "Use Fate point to cheat death"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character burning Fate',
                        },
                        circumstance: {
                            type: 'string',
                            description: 'Description of how the character was reduced to 0 Wounds (e.g., "Stabbed by cultist", "Fell from tower", "Mauled by mutant")',
                        },
                    },
                    required: ['characterName', 'circumstance'],
                },
            },
            {
                name: 'refresh-fortune',
                description: 'Refresh Fortune points to maximum (daily refresh). WFRP 4e specific: Fortune points restore to their maximum at the start of each day (typically after a good night\'s rest). This represents renewed luck and vigor. Fate points do NOT refresh - they are permanent destiny points. Example: "Refresh Fortune after rest" or "Restore Hans\' Fortune for the new day"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to refresh Fortune for',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'foundry-add-fortune-point',
                description: 'Award bonus Fortune points for exceptional play (increments within bounds). WFRP 4e specific: Use this when a player deserves EXTRA Fortune beyond daily refresh for exceptional roleplay, clever solutions, or dramatic moments. This increments Fortune and checks against Fate limit (Fortune cannot exceed Fate value). Use natural language like "award", "grant", "give bonus Fortune". For direct stat manipulation without ceremony, use foundry-update-character-info instead. Example: "Award Hans 1 Fortune for excellent roleplay" or "Grant Gustav bonus Fortune for clever plan"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character receiving bonus Fortune',
                        },
                        amount: {
                            type: 'number',
                            description: 'Number of Fortune points to award (typically 1-2, cannot exceed Fate value)',
                            minimum: 1,
                        },
                        reason: {
                            type: 'string',
                            description: 'Why Fortune is being awarded (e.g., "Exceptional roleplay", "Clever solution to puzzle", "Dramatic heroic moment")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'foundry-add-fate-point',
                description: 'Award Fate points for epic achievements with full ceremony (EXTREMELY RARE). WFRP 4e specific: Use this ONLY when a character accomplishes something truly momentous that deserves the full ceremonial treatment with extensive narrative emphasis, rarity guidelines, and roleplay prompts. Gaining Fate represents divine favor, destiny manifesting, or world-changing heroism. Increments Fate and provides elaborate celebration. Use natural language like "grant Fate for", "award Fate for [epic deed]". For quick stat changes without ceremony, use foundry-update-character-info instead. Example: "Grant Gustav 1 Fate for defeating the Daemon Prince" or "Award Maria Fate for saving the Empire"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character receiving this momentous destiny increase',
                        },
                        amount: {
                            type: 'number',
                            description: 'Number of Fate points to add (almost always 1)',
                            minimum: 1,
                            maximum: 3,
                        },
                        reason: {
                            type: 'string',
                            description: 'The momentous achievement that earned this Fate (e.g., "Defeated Greater Daemon", "Saved the Empire", "Divine blessing from Sigmar")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'get-resilience-resolve-status',
                description: 'Check a character\'s Resilience and Resolve points. WFRP 4e specific: Resolve points can be spent to ignore Psychology, remove Conditions, or ignore Critical Wound modifiers. Resilience represents permanent willpower and can be spent to deny mutations or automatically succeed at any Test. Resolve refreshes when acting according to Motivation, Resilience is permanent. Example: "Check Hans\' Resolve points" or "How much Resilience does Gustav have?"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to check Resilience/Resolve for',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'spend-resolve',
                description: 'Spend a Resolve point to overcome obstacles. WFRP 4e specific: Resolve can be spent to: 1) Become immune to Psychology until end of next round, 2) Ignore all Critical Wound modifiers until start of next round, or 3) Remove one Condition (removing Prone also heals 1 Wound). Resolve refreshes when acting according to Motivation. Example: "Hans spends Resolve to ignore Psychology" or "Use Resolve to remove Stunned condition"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character spending Resolve',
                        },
                        purpose: {
                            type: 'string',
                            description: 'Why Resolve is being spent (e.g., "Ignore Psychology from Fear test", "Remove Stunned condition", "Ignore Critical Wound penalties")',
                        },
                        usageType: {
                            type: 'string',
                            enum: ['ignore-psychology', 'ignore-criticals', 'remove-condition'],
                            description: 'How the Resolve point is being used: ignore-psychology, ignore-criticals, or remove-condition',
                        },
                    },
                    required: ['characterName', 'purpose', 'usageType'],
                },
            },
            {
                name: 'spend-resilience',
                description: 'Spend permanent Resilience to defy Chaos or guarantee success (EXTREME circumstances). WFRP 4e specific: Resilience can be permanently spent to: 1) "I Deny You!" - Refuse a rolled mutation (does not remove Corruption), or 2) "I Will Not Fail!" - Automatically succeed at any Test, win Opposed Tests by +1 SL, choose Critical hit locations. This is a PERMANENT loss of Resilience. Example: "Gustav spends Resilience to deny mutation" or "Use Resilience to automatically succeed"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character spending Resilience',
                        },
                        circumstance: {
                            type: 'string',
                            description: 'Description of the extreme circumstance requiring this permanent expenditure',
                        },
                        usageType: {
                            type: 'string',
                            enum: ['deny-mutation', 'auto-succeed'],
                            description: 'How Resilience is being spent: deny-mutation (I Deny You!) or auto-succeed (I Will Not Fail!)',
                        },
                    },
                    required: ['characterName', 'circumstance', 'usageType'],
                },
            },
            {
                name: 'refresh-resolve',
                description: 'Refresh Resolve points when acting according to Motivation. WFRP 4e specific: Resolve points restore when a character acts according to their Motivation (core belief/deity/goal). This represents spiritual renewal and determination. Resilience points do NOT refresh - they are permanent inner strength. Example: "Refresh Resolve after prayer" or "Restore Hans\' Resolve for acting on Motivation"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to refresh Resolve for',
                        },
                        motivationAction: {
                            type: 'string',
                            description: 'Description of how the character acted according to their Motivation (e.g., "Prayed at temple of Sigmar", "Protected the innocent", "Sought knowledge")',
                        },
                    },
                    required: ['characterName', 'motivationAction'],
                },
            },
            {
                name: 'foundry-add-resolve-point',
                description: 'Award bonus Resolve points for following Motivation (increments within bounds). WFRP 4e specific: Use this when a character acts strongly according to their Motivation and deserves extra Resolve beyond normal refresh. This increments Resolve and checks against Resilience limit (Resolve cannot exceed Resilience value). Use natural language like "award", "grant", "give bonus Resolve". For direct stat manipulation without ceremony, use foundry-update-character-info instead. Example: "Award Hans 1 Resolve for devotion to Sigmar" or "Grant Gustav bonus Resolve for protecting the innocent"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character receiving bonus Resolve',
                        },
                        amount: {
                            type: 'number',
                            description: 'Number of Resolve points to award (typically 1-2, cannot exceed Resilience value)',
                            minimum: 1,
                        },
                        reason: {
                            type: 'string',
                            description: 'Why Resolve is being awarded (e.g., "Exceptional devotion to Motivation", "Significant act aligned with beliefs")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'foundry-add-resilience-point',
                description: 'Award Resilience points for extreme Motivation fulfillment with full ceremony (EXTREMELY RARE). WFRP 4e specific: Use this ONLY when a character accomplishes something of extreme importance to their Motivation that deserves the full ceremonial treatment. Gaining Resilience represents permanent nourishment of the soul through acts aligned with core beliefs. Increments Resilience and provides elaborate celebration. Use natural language like "grant Resilience for", "award Resilience for [significant deed]". For quick stat changes without ceremony, use foundry-update-character-info instead. Example: "Grant Griselda 1 Resilience for financing temple" or "Award Hans Resilience for converting heretics"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character receiving this permanent inner strength increase',
                        },
                        amount: {
                            type: 'number',
                            description: 'Number of Resilience points to add (almost always 1)',
                            minimum: 1,
                            maximum: 3,
                        },
                        reason: {
                            type: 'string',
                            description: 'The significant achievement aligned with Motivation (e.g., "Financed new temple", "Saved village from Chaos", "Converted major heretic")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
        ];
    }

    async handleGetFortuneFateStatus(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Getting Fortune/Fate status', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune/Fate tracking is only available for WFRP characters.`;
            }

            // Get Fortune and Fate data
            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;

            // WFRP 4e rule: Fortune max = current Fate value
            // Fate max is stored separately and can reduce when burned
            const fortuneMax = fateCurrent;
            const fateMax = system.status?.fate?.max || fateCurrent;

            const status: FortuneFateStatus = {
                fortune: {
                    current: fortuneCurrent,
                    max: fortuneMax,
                },
                fate: {
                    current: fateCurrent,
                    max: fateMax,
                },
            };

            // Build response
            let response = `# Fortune & Fate: ${character.name}\n\n`;

            // Fortune Section
            response += `## 🍀 Fortune Points\n`;
            response += `**Current**: ${status.fortune.current} / ${status.fortune.max}\n\n`;

            // Fortune visualization
            const fortuneBar = '●'.repeat(status.fortune.current) + '○'.repeat(Math.max(0, status.fortune.max - status.fortune.current));
            response += `\`${fortuneBar}\`\n\n`;

            if (status.fortune.current === 0) {
                response += `⚠️ **No Fortune remaining!** ${character.name} cannot reroll tests or add Success Levels until Fortune refreshes.\n\n`;
            } else if (status.fortune.current < status.fortune.max / 2) {
                response += `⚠️ **Low Fortune.** Consider saving remaining points for critical moments.\n\n`;
            } else if (status.fortune.current === status.fortune.max) {
                response += `✅ **Full Fortune!** ${character.name} has all their luck available.\n\n`;
            } else {
                response += `${character.name} has ${status.fortune.current} Fortune point${status.fortune.current === 1 ? '' : 's'} remaining.\n\n`;
            }

            response += `### Fortune Usage:\n`;
            response += `- **Reroll**: Reroll any failed test entirely\n`;
            response += `- **Add SL**: Add +1 Success Level to a test result\n`;
            response += `- **Refresh**: Fortune restores to maximum after a good night's rest\n\n`;

            // Fate Section
            response += `## ⭐ Fate Points\n`;
            response += `**Current**: ${status.fate.current} / ${status.fate.max}\n\n`;

            // Fate visualization
            const fateBar = '★'.repeat(status.fate.current) + '☆'.repeat(Math.max(0, status.fate.max - status.fate.current));
            response += `\`${fateBar}\`\n\n`;

            if (status.fate.current === 0) {
                response += `💀 **NO FATE REMAINING!** ${character.name} has no protection from death. If reduced to 0 Wounds, they will die permanently!\n\n`;
            } else if (status.fate.current === 1) {
                response += `⚠️ **Last Fate Point!** ${character.name} has only one chance to cheat death remaining. Use it wisely.\n\n`;
            } else if (status.fate.current === status.fate.max && status.fate.max < status.fate.current) {
                response += `💫 **Fate Burned Previously.** ${character.name} has permanently lost ${status.fate.max - status.fate.current} Fate point(s) from surviving death.\n\n`;
            } else {
                response += `${character.name} has ${status.fate.current} Fate point${status.fate.current === 1 ? '' : 's'} - protection from death.\n\n`;
            }

            response += `### Fate Usage:\n`;
            response += `- **Burn Fate**: When reduced to 0 Wounds, burn a Fate point to survive with 1 Wound\n`;
            response += `- **Permanent Loss**: Burning Fate permanently reduces maximum Fate by 1\n`;
            response += `- **No Refresh**: Fate points do NOT refresh - they represent destiny itself\n`;
            response += `- **Consequence**: Burning Fate typically results in a permanent injury or disfigurement\n\n`;

            // Tactical Advice
            response += `## 💡 Tactical Guidance\n\n`;

            if (status.fortune.current > 0) {
                response += `**When to Use Fortune:**\n`;
                response += `- Reroll critical failed tests (combat, important skill checks)\n`;
                response += `- Add SL when you narrowly failed or need extra degrees of success\n`;
                response += `- Save 1 Fortune for emergencies if possible\n`;
                response += `- Remember: Fortune refreshes daily!\n\n`;
            }

            if (status.fate.current > 0) {
                response += `**About Fate:**\n`;
                response += `- Fate is your last-ditch survival mechanism\n`;
                response += `- Only burn Fate when facing actual death (0 Wounds)\n`;
                response += `- Each burned Fate permanently changes your character\n`;
                response += `- If Fate reaches 0, death becomes permanent\n`;
            } else {
                response += `**⚠️ WARNING: No Fate Protection!**\n`;
                response += `- Avoid high-risk situations\n`;
                response += `- Retreat when severely wounded\n`;
                response += `- Death is now permanent for ${character.name}\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get Fortune/Fate status', error);
            throw new Error(`Failed to retrieve Fortune/Fate status for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleSpendFortune(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            purpose: z.string().min(1, 'Purpose cannot be empty'),
            usageType: z.enum(['reroll', 'add-sl']),
        });

        const { characterName, purpose, usageType } = schema.parse(args);

        this.logger.info('Spending Fortune', { characterName, purpose, usageType });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;

            // WFRP 4e rule: Fortune max = current Fate value
            const fortuneMax = fateCurrent;

            // Check if Fortune is available
            if (fortuneCurrent <= 0) {
                return `❌ **Cannot Spend Fortune!**\n\n${character.name} has no Fortune points remaining. Fortune will refresh after a good night's rest.\n\n**Current Fortune**: 0 / ${fortuneMax}`;
            }

            const newFortune = fortuneCurrent - 1;

            // Update the character
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fortune.value': newFortune,
                },
            });

            // Build response
            let response = `# Fortune Spent: ${character.name}\n\n`;
            response += `**Purpose**: ${purpose}\n`;
            response += `**Usage**: ${usageType === 'reroll' ? '🎲 Reroll Test' : '➕ Add +1 Success Level'}\n\n`;

            response += `## Fortune Change\n`;
            response += `- Previous: ${fortuneCurrent} point${fortuneCurrent === 1 ? '' : 's'}\n`;
            response += `- Spent: -1 point\n`;
            response += `- **Remaining**: ${newFortune} / ${fortuneMax}\n\n`;

            // Visual
            const fortuneBar = '●'.repeat(newFortune) + '○'.repeat(Math.max(0, fortuneMax - newFortune));
            response += `\`${fortuneBar}\`\n\n`;

            // Usage-specific guidance
            if (usageType === 'reroll') {
                response += `## 🎲 Reroll Effect\n`;
                response += `${character.name} rerolls the entire test. Use the new result, even if it's worse than the original roll.\n\n`;
                response += `**Mechanic**: Completely reroll the d100 test and recalculate Success Levels.\n\n`;
            } else {
                response += `## ➕ Add Success Level Effect\n`;
                response += `${character.name} adds +1 Success Level to the test result.\n\n`;
                response += `**Mechanic**: This can turn a failure into a success, or increase degrees of success (0 SL → 1 SL, 1 SL → 2 SL, etc.)\n\n`;
            }

            // Remaining Fortune status
            if (newFortune === 0) {
                response += `⚠️ **All Fortune Spent!** No Fortune points remaining until next rest.\n\n`;
            } else if (newFortune === 1) {
                response += `⚠️ **Last Fortune Point!** ${character.name} has 1 Fortune point left. Use it wisely.\n\n`;
            } else {
                response += `${newFortune} Fortune point${newFortune === 1 ? '' : 's'} still available for emergencies.\n\n`;
            }

            response += `## 💡 Next Steps\n`;
            response += `1. Update ${character.name}'s Fortune to **${newFortune}** in Foundry VTT\n`;
            if (usageType === 'reroll') {
                response += `2. Reroll the test completely and apply the new result\n`;
                response += `3. Narrate how luck intervenes to give ${character.name} another chance\n`;
            } else {
                response += `2. Add +1 to the Success Level of the test\n`;
                response += `3. Narrate how fortune smiles upon ${character.name} at the crucial moment\n`;
            }
            response += `4. Fortune will refresh after a good night's rest\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to spend Fortune', error);
            throw new Error(`Failed to spend Fortune for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleBurnFate(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            circumstance: z.string().min(1, 'Circumstance cannot be empty'),
        });

        const { characterName, circumstance } = schema.parse(args);

        this.logger.info('Burning Fate', { characterName, circumstance });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.fate !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fate tracking is only available for WFRP characters.`;
            }

            const fateCurrent = system.status?.fate?.value ?? 0;
            const fateMax = system.status?.fate?.max || fateCurrent;

            // Check if Fate is available
            if (fateCurrent <= 0) {
                return `💀 **FATE UNAVAILABLE!**\n\n${character.name} has no Fate points remaining. They cannot cheat death.\n\n**${character.name} DIES from: ${circumstance}**\n\nWithout Fate to intervene, death is permanent. The character's story ends here.`;
            }

            const newFate = fateCurrent - 1;
            const newFateMax = fateMax - 1; // Fate max permanently reduces

            // Update the character
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fate.value': newFate,
                    'system.status.fate.max': newFateMax,
                    'system.status.wounds.value': 1, // Set to 1 Wound after burning Fate
                },
            });

            // Build response
            let response = `# 💫 FATE BURNED: ${character.name}\n\n`;
            response += `**Circumstance**: ${circumstance}\n\n`;
            response += `---\n\n`;

            response += `## Death Defied\n`;
            response += `As ${character.name} falls to 0 Wounds, destiny itself intervenes. Through sheer force of will and the threads of fate, they cling to life by the narrowest of margins.\n\n`;

            response += `## Fate Points\n`;
            response += `- Previous: ${fateCurrent} point${fateCurrent === 1 ? '' : 's'}\n`;
            response += `- **BURNED**: -1 point (PERMANENT)\n`;
            response += `- **New Current**: ${newFate} / ${newFateMax}\n`;
            response += `- **New Maximum**: ${newFateMax} (permanently reduced)\n\n`;

            // Visual
            const fateBar = '★'.repeat(newFate) + '☆'.repeat(Math.max(0, newFateMax - newFate));
            response += `\`${fateBar}\`\n\n`;

            // Survival outcome
            response += `## 🩹 Survival Outcome\n`;
            response += `${character.name} survives with **1 Wound remaining**.\n\n`;

            response += `**However, there is always a price for cheating death:**\n`;
            response += `- Roll or choose a permanent injury or disfigurement\n`;
            response += `- Consider scars, lost fingers/eye, psychological trauma\n`;
            response += `- This should be a meaningful, lasting consequence\n`;
            response += `- The experience should be roleplayed and remembered\n\n`;

            // Remaining Fate warning
            if (newFate === 0) {
                response += `## 💀 NO FATE REMAINING\n`;
                response += `**THIS WAS ${character.name.toUpperCase()}'S LAST FATE POINT!**\n\n`;
                response += `They have used all of their destiny. If reduced to 0 Wounds again, death will be PERMANENT. There is no more cheating fate.\n\n`;
                response += `${character.name} should:\n`;
                response += `- Be extremely cautious in combat\n`;
                response += `- Seek healing immediately when wounded\n`;
                response += `- Avoid unnecessary risks\n`;
                response += `- Consider their mortality in every decision\n\n`;
            } else if (newFate === 1) {
                response += `## ⚠️ Last Fate Point\n`;
                response += `${character.name} has only **1 Fate point remaining**. One more brush with death is all destiny will allow.\n\n`;
            } else {
                response += `## Remaining Fate\n`;
                response += `${character.name} has ${newFate} Fate point${newFate === 1 ? '' : 's'} remaining. Destiny still watches over them, but its protection is finite.\n\n`;
            }

            response += `## 💡 GM Actions Required\n`;
            response += `1. Update ${character.name}'s Fate: **Current ${newFate}, Max ${newFateMax}** in Foundry VTT\n`;
            response += `2. Set Wounds to **1** (barely alive)\n`;
            response += `3. Determine a permanent consequence:\n`;
            response += `   - Lost eye (visual impairment)\n`;
            response += `   - Severed fingers (manual dexterity penalty)\n`;
            response += `   - Terrible scarring (Fellowship penalty in certain situations)\n`;
            response += `   - Limp (Movement penalty)\n`;
            response += `   - Psychological trauma (fear, paranoia)\n`;
            response += `4. Narrate the miraculous survival and its cost\n`;
            response += `5. Update character sheet with permanent injury\n\n`;

            response += `## 🎭 Narrative Moment\n`;
            response += `This is a pivotal character moment. ${character.name} has brushed against death itself and survived, but they are forever changed. This should be a dramatic, memorable scene that shapes their story going forward.\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to burn Fate', error);
            throw new Error(`Failed to burn Fate for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRefreshFortune(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Refreshing Fortune', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;

            // WFRP 4e rule: Fortune max = current Fate value
            const fortuneMax = fateCurrent;

            // Check if Fate is 0 (no Fortune possible)
            if (fortuneMax === 0) {
                return `❌ **Cannot Refresh Fortune**\n\n${character.name} has 0 Fate points, which means Fortune maximum is 0. Fate must be increased before Fortune can be refreshed.\n\nCurrent Status:\n- Fate: ${fateCurrent}\n- Fortune: ${fortuneCurrent} / ${fortuneMax}`;
            }

            // Check if already at max
            if (fortuneCurrent >= fortuneMax) {
                return `${character.name}'s Fortune is already at maximum.\n\nCurrent Status:\n- Fate: ${fateCurrent}\n- Fortune: ${fortuneCurrent} / ${fortuneMax}\n\nNo refresh needed.`;
            }

            // Update the character
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fortune.value': fortuneMax,
                },
            });

            // Build response
            let response = `# 🌅 Fortune Refreshed: ${character.name}\n\n`;
            response += `After a good night's rest, ${character.name} awakens with renewed luck and vigor.\n\n`;

            response += `## Fortune Restored\n`;
            response += `- Previous: ${fortuneCurrent} / ${fortuneMax}\n`;
            response += `- **Restored to**: ${fortuneMax} / ${fortuneMax}\n`;
            response += `- Gained: +${fortuneMax - fortuneCurrent} Fortune point${(fortuneMax - fortuneCurrent) === 1 ? '' : 's'}\n\n`;

            // Visual
            const fortuneBar = '●'.repeat(fortuneMax);
            response += `\`${fortuneBar}\` **FULL FORTUNE!**\n\n`;

            response += `## ✅ Ready for Adventure\n`;
            response += `${character.name} now has all ${fortuneMax} Fortune point${fortuneMax === 1 ? '' : 's'} available for:\n`;
            response += `- Rerolling failed tests\n`;
            response += `- Adding Success Levels to important rolls\n`;
            response += `- Turning the tide in critical moments\n\n`;

            response += `💡 **Reminder**: Fortune refreshes each day after proper rest. Use it wisely throughout the day!\n\n`;

            response += `## Next Steps\n`;
            response += `1. Update ${character.name}'s Fortune to **${fortuneMax}** in Foundry VTT\n`;
            response += `2. Note the rest period (time, location)\n`;
            response += `3. Consider any other benefits of rest (Wound recovery, spell preparation, etc.)\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to refresh Fortune', error);
            throw new Error(`Failed to refresh Fortune for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddFortune(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().int().min(1),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Adding Fortune points', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fortune !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fortune tracking is only available for WFRP characters.`;
            }

            const fortuneCurrent = system.status?.fortune?.value ?? 0;
            const fateCurrent = system.status?.fate?.value ?? 0;

            // WFRP 4e rule: Fortune max = current Fate value
            const fortuneMax = fateCurrent;

            // Check if Fate is 0 (no Fortune possible)
            if (fortuneMax === 0) {
                return `❌ **Cannot Add Fortune**\n\n${character.name} has 0 Fate points, which means Fortune maximum is 0. Fate must be increased before Fortune can be added.\n\nCurrent Status:\n- Fate: ${fateCurrent}\n- Fortune: ${fortuneCurrent} / ${fortuneMax}\n\nUse \`foundry-update-character-info\` to set Fate, or \`foundry-add-fate-point\` for epic achievements.`;
            }

            // Calculate new Fortune value (cannot exceed Fate)
            const newFortune = Math.min(fortuneCurrent + amount, fortuneMax);
            const actualAdded = newFortune - fortuneCurrent;

            // Check if already at max
            if (actualAdded === 0) {
                return `❌ **Cannot Add Fortune**\n\n${character.name}'s Fortune is already at maximum.\n\nCurrent Status:\n- Fate: ${fateCurrent}\n- Fortune: ${fortuneCurrent} / ${fortuneMax}\n\nFortune cannot exceed Fate value. To increase Fortune capacity, the character must gain Fate points (extremely rare).`;
            }

            // Update the character
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fortune.value': newFortune,
                },
            });

            // Build response with appropriate narrative emphasis
            let response = `# ✨ Fortune Awarded: ${character.name}\n\n`;

            if (actualAdded < amount) {
                response += `🎭 **GM Award:** ${character.name} has earned bonus Fortune for exceptional circumstances!\n\n`;
                response += `⚠️ *Note: Only ${actualAdded} of ${amount} Fortune point${amount === 1 ? '' : 's'} added (already at maximum of ${fortuneMax})*\n\n`;
            } else {
                response += `🎭 **GM Award:** ${character.name} has earned bonus Fortune through exceptional play!\n\n`;
            }

            response += `## Fortune Change\n`;
            response += `- Previous: ${fortuneCurrent} / ${fortuneMax}\n`;
            response += `- **New Total**: ${newFortune} / ${fortuneMax}\n`;
            response += `- Added: +${actualAdded} Fortune point${actualAdded === 1 ? '' : 's'}\n\n`;

            response += `### 🌟 Reason\n`;
            response += `> ${reason}\n\n`;

            // Visual
            const fortuneBar = '●'.repeat(newFortune) + '○'.repeat(Math.max(0, fortuneMax - newFortune));
            response += `\`${fortuneBar}\`\n\n`;

            response += `## About GM Fortune Awards\n`;
            response += `While Fortune normally only refreshes through rest, GMs may award bonus Fortune for:\n`;
            response += `- Exceptional roleplay and character development\n`;
            response += `- Clever solutions that enhance the story\n`;
            response += `- Dramatic heroic moments\n`;
            response += `- Selfless sacrifices or brave decisions\n`;
            response += `- Advancing the narrative in memorable ways\n\n`;

            response += `💡 **Reminder**: These bonus Fortune points still count against the character's maximum and will reset to max during the next daily refresh.\n\n`;

            response += `## Using Fortune\n`;
            response += `${character.name} can now use Fortune to:\n`;
            response += `- **Reroll** any failed test\n`;
            response += `- **Add +1 SL** to a test result\n`;
            response += `- Turn a close failure into success\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Fortune', error);
            throw new Error(`Failed to add Fortune for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddFate(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().int().min(1).max(3),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Adding Fate point (RARE EVENT)', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.fate !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Fate tracking is only available for WFRP characters.`;
            }

            const fateCurrent = system.status?.fate?.value ?? 0;
            const fateMax = system.status?.fate?.max || fateCurrent;
            const fortuneCurrent = system.status?.fortune?.value ?? 0;

            // Calculate new Fate values
            const newFate = fateCurrent + amount;
            const newFateMax = fateMax + amount;

            // Update the character with new Fate
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.fate.value': newFate,
                    'system.status.fate.max': newFateMax,
                },
            });

            // Build response with MAXIMUM narrative emphasis
            let response = `# 🌟✨ FATE GRANTED ✨🌟\n\n`;
            response += `# 🎺🎺🎺 **MOMENTOUS ACHIEVEMENT** 🎺🎺🎺\n\n`;

            response += `## ⚡ ${character.name}'s Destiny Has Changed! ⚡\n\n`;

            response += `In one of the rarest and most significant events in the Warhammer world, **${character.name}** has gained **${amount} Fate point${amount === 1 ? '' : 's'}**! This represents destiny itself reshaping around their heroic deeds.\n\n`;

            response += `### 📜 The Achievement\n`;
            response += `> ${reason}\n\n`;

            response += `## 🎭 Character Changes\n\n`;

            response += `### Fate (Destiny Points)\n`;
            response += `- Previous: ${fateCurrent} / ${fateMax}\n`;
            response += `- **New**: ${newFate} / ${newFateMax}\n`;
            response += `- Gained: **+${amount} Fate point${amount === 1 ? '' : 's'}** ✨\n\n`;

            const fateBar = '★'.repeat(newFate);
            response += `\`${fateBar}\` **${newFate} FATE POINT${newFate === 1 ? '' : 'S'}!**\n\n`;

            response += `### Fortune (Daily Luck)\n`;
            response += `- Fortune capacity increased to match new Fate value (**${newFate}**)\n`;
            response += `- ${character.name} now refreshes to **${newFate} Fortune** each day\n\n`;

            response += `## 💫 What This Means\n\n`;
            response += `**Fate represents destiny itself.** This increase means:\n\n`;
            response += `1. **Additional Protection from Death**\n`;
            response += `   - ${character.name} can survive being reduced to 0 Wounds ${amount} more time${amount === 1 ? '' : 's'}\n`;
            response += `   - Each Fate point burned keeps them alive (but permanently loses that Fate)\n\n`;

            response += `2. **Increased Daily Fortune**\n`;
            response += `   - Fortune maximum now equals ${newFate} (matching Fate value)\n`;
            response += `   - More rerolls and success bonuses available each day\n`;
            response += `   - Represents increased luck and capability\n\n`;

            response += `3. **Character Significance**\n`;
            response += `   - ${character.name} is marked by destiny\n`;
            response += `   - Greater narrative importance in the story\n`;
            response += `   - The gods/fate have noticed their deeds\n\n`;

            response += `## 🎯 Rarity and Importance\n\n`;
            response += `In WFRP 4e, gaining Fate is one of the **rarest** possible character advancements. It should only occur for:\n\n`;
            response += `- ✨ Defeating major campaign villains or apocalyptic threats\n`;
            response += `- ✨ Completing epic, world-changing quests\n`;
            response += `- ✨ Divine intervention or blessing from gods\n`;
            response += `- ✨ Fulfilling ancient prophecies\n`;
            response += `- ✨ Saving nations, cities, or the world itself\n`;
            response += `- ✨ Acts of such heroism they echo through history\n\n`;

            response += `This is a **permanent, campaign-defining** character advancement that should be celebrated and remembered!\n\n`;

            response += `## 📝 Suggested Follow-Up\n`;
            response += `1. Update ${character.name}'s character sheet in Foundry VTT:\n`;
            response += `   - Fate: **${newFate}** (current) / **${newFateMax}** (max)\n`;
            response += `   - Fortune will now refresh to **${newFate}** daily\n\n`;
            response += `2. **Roleplay the moment!**\n`;
            response += `   - Describe how destiny manifests (divine vision? golden aura? prophecy fulfilled?)\n`;
            response += `   - Let the player narrate how their character feels touched by fate\n`;
            response += `   - Other characters might notice the change\n\n`;
            response += `3. **Document this achievement**\n`;
            response += `   - Add to character history/biography\n`;
            response += `   - Note the date and circumstances\n`;
            response += `   - This is a milestone moment in the campaign\n\n`;

            response += `---\n\n`;
            response += `🎊 **Congratulations to ${character.name}!** 🎊\n\n`;
            response += `*May their increased Fate guide them through the dark paths of the Old World...*`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Fate', error);
            throw new Error(`Failed to add Fate for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ========================================
    // RESILIENCE & RESOLVE HANDLERS
    // ========================================

    async handleGetResilienceResolveStatus(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Getting Resilience/Resolve status', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resilience/Resolve tracking is only available for WFRP characters.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;

            // WFRP 4e rule: Resolve max = current Resilience value
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
            response += `  - Win Opposed Tests by +1 SL minimum\n`;
            response += `  - Choose Critical hit locations\n`;
            response += `  - Can even succeed on already-failed Tests\n`;
            response += `- **No Refresh**: Resilience points do NOT refresh - they represent permanent willpower\n\n`;

            // Tactical Advice
            response += `## 💡 Tactical Guidance\n\n`;

            if (resolveCurrent > 0) {
                response += `**When to Use Resolve:**\n`;
                response += `- Face terrifying enemies without fear (Psychology immunity)\n`;
                response += `- Fight through injuries (ignore Critical Wounds)\n`;
                response += `- Shake off debilitating Conditions\n`;
                response += `- Resolve refreshes through Motivation - use it!\n\n`;
            }

            if (resilienceCurrent > 0) {
                response += `**About Resilience:**\n`;
                response += `- Resilience is your ultimate failsafe mechanism\n`;
                response += `- Use to deny mutations when Corruption threatens\n`;
                response += `- Save for absolutely critical moments (impossible Tests)\n`;
                response += `- Each spent Resilience permanently changes your character\n`;
                response += `- If Resilience reaches 0, you lose these safety nets forever\n`;
            } else {
                response += `**⚠️ WARNING: No Resilience Protection!**\n`;
                response += `- Cannot deny mutations if Corruption triggers them\n`;
                response += `- No guaranteed successes available\n`;
                response += `- ${character.name}'s inner reserves are depleted\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get Resilience/Resolve status', error);
            throw new Error(`Failed to retrieve Resilience/Resolve status for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleSpendResolve(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            purpose: z.string().min(1, 'Purpose cannot be empty'),
            usageType: z.enum(['ignore-psychology', 'ignore-criticals', 'remove-condition']),
        });

        const { characterName, purpose, usageType } = schema.parse(args);

        this.logger.info('Spending Resolve', { characterName, purpose, usageType });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resolve tracking is only available for WFRP characters.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resolveMax = resilienceCurrent;

            if (resolveCurrent <= 0) {
                return `❌ **Cannot Spend Resolve!**\n\n${character.name} has no Resolve points remaining. Resolve will refresh when acting according to Motivation.\n\n**Current Resolve**: 0 / ${resolveMax}\n\n**How to Refresh**: Act according to your Motivation (${character.name}'s core beliefs/deity/goals).`;
            }

            const newResolve = resolveCurrent - 1;

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resolve.value': newResolve,
                },
            });

            let response = `# 💪 Resolve Spent: ${character.name}\n\n`;
            response += `**Purpose**: ${purpose}\n\n`;

            response += `## Resolve Change\n`;
            response += `- Previous: ${resolveCurrent} point${resolveCurrent === 1 ? '' : 's'}\n`;
            response += `- Spent: -1 point\n`;
            response += `- **Remaining**: ${newResolve} / ${resolveMax}\n\n`;

            const resolveBar = '●'.repeat(newResolve) + '○'.repeat(Math.max(0, resolveMax - newResolve));
            response += `\`${resolveBar}\`\n\n`;

            // Usage-specific guidance
            if (usageType === 'ignore-psychology') {
                response += `## 🧠 Ignore Psychology Effect\n`;
                response += `${character.name} becomes immune to all Psychology effects until the end of the next round.\n\n`;
                response += `**Mechanic**: No Fear, Terror, or other Psychology Tests required. Face any horror without flinching!\n\n`;
            } else if (usageType === 'ignore-criticals') {
                response += `## 🩹 Ignore Critical Wounds Effect\n`;
                response += `${character.name} ignores ALL modifiers from ALL Critical Wounds until the beginning of the next round.\n\n`;
                response += `**Mechanic**: Fight at full effectiveness despite injuries. The pain is still there, but willpower pushes through it.\n\n`;
            } else {
                response += `## 🚫 Remove Condition Effect\n`;
                response += `${character.name} removes one Condition through sheer determination.\n\n`;
                response += `**Mechanic**: Choose which Condition to remove. If removing Prone, also regain 1 Wound as you surge to your feet!\n\n`;
            }

            if (newResolve === 0) {
                response += `⚠️ **All Resolve Spent!** No Resolve points remaining until you act according to Motivation.\n\n`;
            } else if (newResolve === 1) {
                response += `⚠️ **Last Resolve Point!** ${character.name} has 1 Resolve point left. Use it wisely.\n\n`;
            } else {
                response += `${newResolve} Resolve point${newResolve === 1 ? '' : 's'} still available.\n\n`;
            }

            response += `## 💡 Next Steps\n`;
            response += `1. Update ${character.name}'s Resolve to **${newResolve}** in Foundry VTT\n`;
            response += `2. Apply the mechanical effect (duration noted above)\n`;
            response += `3. Narrate how ${character.name} pushes through the obstacle\n`;
            response += `4. Resolve will refresh when acting according to Motivation\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to spend Resolve', error);
            throw new Error(`Failed to spend Resolve for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleSpendResilience(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            circumstance: z.string().min(1, 'Circumstance cannot be empty'),
            usageType: z.enum(['deny-mutation', 'auto-succeed']),
        });

        const { characterName, circumstance, usageType } = schema.parse(args);

        this.logger.info('Spending Resilience (PERMANENT)', { characterName, circumstance, usageType });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resilience !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resilience tracking is only available for WFRP characters.`;
            }

            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resilienceMax = system.status?.resilience?.max || resilienceCurrent;

            if (resilienceCurrent <= 0) {
                return `💀 **RESILIENCE UNAVAILABLE!**\n\n${character.name} has no Resilience points remaining. They cannot deny mutations or guarantee success.\n\n**This is permanent** - ${character.name}'s inner reserves are depleted.`;
            }

            const newResilience = resilienceCurrent - 1;
            const newResilienceMax = resilienceMax - 1;

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resilience.value': newResilience,
                    'system.status.resilience.max': newResilienceMax,
                },
            });

            let response = `# 🛡️ RESILIENCE SPENT: ${character.name}\n\n`;
            response += `**Circumstance**: ${circumstance}\n\n`;
            response += `---\n\n`;

            if (usageType === 'deny-mutation') {
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

            if (usageType === 'deny-mutation') {
                response += `## 🚫 Mutation Denied\n`;
                response += `The mutation that would have manifested is refused. ${character.name}'s Corruption points remain unchanged.\n\n`;
                response += `**Important**: This does NOT remove Corruption! The character is still perilously close to mutation. Future Corruption may still trigger mutations.\n\n`;
                response += `**Roleplay**: How does ${character.name} physically reject the mutation? Sheer willpower? Religious faith? Inner strength?\n\n`;
            } else {
                response += `## ✅ Automatic Success\n`;
                response += `${character.name} chooses the Test result instead of rolling. They can:\n`;
                response += `- Succeed at any difficulty Test\n`;
                response += `- Win any Opposed Test by +1 SL (minimum)\n`;
                response += `- Choose to cause a Critical and select hit location\n`;
                response += `- Even succeed on a Test already failed!\n\n`;
                response += `**Example**: Against an enemy with 10 Advantage, ${character.name} can still hit them perfectly, cause a Critical to chosen location, and end their rampage.\n\n`;
                response += `**Roleplay**: Describe the impossible feat. How does perfect success manifest?\n\n`;
            }

            if (newResilience === 0) {
                response += `## 💀 NO RESILIENCE REMAINING\n`;
                response += `**THIS WAS ${character.name.toUpperCase()}'S LAST RESILIENCE POINT!**\n\n`;
                response += `Their inner reserves are completely depleted. ${character.name} can no longer:\n`;
                response += `- Deny mutations (Corruption will manifest unchecked)\n`;
                response += `- Guarantee success on impossible Tests\n\n`;
                response += `${character.name} should:\n`;
                response += `- Be extremely cautious around Chaos and Corruption\n`;
                response += `- Avoid situations requiring impossible feats\n`;
                response += `- Consider their limitations in every decision\n\n`;
            } else if (newResilience === 1) {
                response += `## ⚠️ Last Resilience Point\n`;
                response += `${character.name} has only **1 Resilience point remaining**. One more extraordinary feat is all their willpower can muster.\n\n`;
            } else {
                response += `## Remaining Resilience\n`;
                response += `${character.name} has ${newResilience} Resilience point${newResilience === 1 ? '' : 's'} remaining. Their inner strength endures, but it is finite.\n\n`;
            }

            response += `## 💡 Next Steps\n`;
            response += `1. Update ${character.name}'s Resilience: **${newResilience}** (current) / **${newResilienceMax}** (max)\n`;
            response += `2. Apply the effect (mutation denied or test auto-succeeds)\n`;
            response += `3. **Roleplay the moment!** This is a significant character event\n`;
            response += `4. Note this permanent change in character history\n\n`;

            response += `## 🎭 Narrative Moment\n`;
            response += `This is a pivotal character moment. ${character.name} has drawn upon their deepest reserves of willpower. This should be a dramatic, memorable scene that demonstrates their strength of character and determination.\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to spend Resilience', error);
            throw new Error(`Failed to spend Resilience for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRefreshResolve(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            motivationAction: z.string().min(1, 'Motivation action cannot be empty'),
        });

        const { characterName, motivationAction } = schema.parse(args);

        this.logger.info('Refreshing Resolve', { characterName, motivationAction });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resolve tracking is only available for WFRP characters.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;

            // WFRP 4e rule: Resolve max = current Resilience value
            const resolveMax = resilienceCurrent;

            if (resolveMax === 0) {
                return `❌ **Cannot Refresh Resolve**\n\n${character.name} has 0 Resilience points, which means Resolve maximum is 0. Resilience must be increased before Resolve can be refreshed.\n\nCurrent Status:\n- Resilience: ${resilienceCurrent}\n- Resolve: ${resolveCurrent} / ${resolveMax}`;
            }

            if (resolveCurrent >= resolveMax) {
                return `${character.name}'s Resolve is already at maximum.\n\nCurrent Status:\n- Resilience: ${resilienceCurrent}\n- Resolve: ${resolveCurrent} / ${resolveMax}\n\nNo refresh needed.`;
            }

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resolve.value': resolveMax,
                },
            });

            let response = `# 🙏 Resolve Refreshed: ${character.name}\n\n`;
            response += `By acting according to their Motivation, ${character.name} renews their inner reserves.\n\n`;

            response += `## Motivation Action\n`;
            response += `> ${motivationAction}\n\n`;

            response += `## Resolve Restored\n`;
            response += `- Previous: ${resolveCurrent} / ${resolveMax}\n`;
            response += `- **Restored to**: ${resolveMax} / ${resolveMax}\n`;
            response += `- Gained: +${resolveMax - resolveCurrent} Resolve point${(resolveMax - resolveCurrent) === 1 ? '' : 's'}\n\n`;

            const resolveBar = '●'.repeat(resolveMax);
            response += `\`${resolveBar}\` **FULL RESOLVE!**\n\n`;

            response += `## ✅ Ready for Challenges\n`;
            response += `${character.name} now has all ${resolveMax} Resolve point${resolveMax === 1 ? '' : 's'} available for:\n`;
            response += `- Ignoring Psychology (fear, terror)\n`;
            response += `- Pushing through Critical Wound penalties\n`;
            response += `- Removing debilitating Conditions\n\n`;

            response += `💡 **Reminder**: Resolve refreshes by acting according to Motivation. Stay true to your beliefs!\n\n`;

            response += `## Next Steps\n`;
            response += `1. Update ${character.name}'s Resolve to **${resolveMax}** in Foundry VTT\n`;
            response += `2. Note how acting on Motivation restored determination\n`;
            response += `3. Different Motivation acts may be needed for future refreshes\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to refresh Resolve', error);
            throw new Error(`Failed to refresh Resolve for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddResolve(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().int().min(1),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Adding Resolve points', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resolve !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resolve tracking is only available for WFRP characters.`;
            }

            const resolveCurrent = system.status?.resolve?.value ?? 0;
            const resilienceCurrent = system.status?.resilience?.value ?? 0;

            // WFRP 4e rule: Resolve max = current Resilience value
            const resolveMax = resilienceCurrent;

            if (resolveMax === 0) {
                return `❌ **Cannot Add Resolve**\n\n${character.name} has 0 Resilience points, which means Resolve maximum is 0. Resilience must be increased before Resolve can be added.\n\nCurrent Status:\n- Resilience: ${resilienceCurrent}\n- Resolve: ${resolveCurrent} / ${resolveMax}\n\nUse \`foundry-update-character-info\` to set Resilience, or \`foundry-add-resilience-point\` for significant Motivation achievements.`;
            }

            const newResolve = Math.min(resolveCurrent + amount, resolveMax);
            const actualAdded = newResolve - resolveCurrent;

            if (actualAdded === 0) {
                return `❌ **Cannot Add Resolve**\n\n${character.name}'s Resolve is already at maximum.\n\nCurrent Status:\n- Resilience: ${resilienceCurrent}\n- Resolve: ${resolveCurrent} / ${resolveMax}\n\nResolve cannot exceed Resilience value. To increase Resolve capacity, the character must gain Resilience points (very rare).`;
            }

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resolve.value': newResolve,
                },
            });

            let response = `# ✨ Resolve Awarded: ${character.name}\n\n`;

            if (actualAdded < amount) {
                response += `🎭 **GM Award:** ${character.name} has earned bonus Resolve for acting strongly according to Motivation!\n\n`;
                response += `⚠️ *Note: Only ${actualAdded} of ${amount} Resolve point${amount === 1 ? '' : 's'} added (already at maximum of ${resolveMax})*\n\n`;
            } else {
                response += `🎭 **GM Award:** ${character.name} has earned bonus Resolve through devotion to Motivation!\n\n`;
            }

            response += `## Resolve Change\n`;
            response += `- Previous: ${resolveCurrent} / ${resolveMax}\n`;
            response += `- **New Total**: ${newResolve} / ${resolveMax}\n`;
            response += `- Added: +${actualAdded} Resolve point${actualAdded === 1 ? '' : 's'}\n\n`;

            response += `### 🌟 Reason\n`;
            response += `> ${reason}\n\n`;

            const resolveBar = '●'.repeat(newResolve) + '○'.repeat(Math.max(0, resolveMax - newResolve));
            response += `\`${resolveBar}\`\n\n`;

            response += `## About GM Resolve Awards\n`;
            response += `While Resolve normally refreshes through Motivation actions, GMs may award bonus Resolve for:\n`;
            response += `- Exceptional devotion to Motivation\n`;
            response += `- Significant acts aligned with core beliefs\n`;
            response += `- Self-sacrificing choices supporting Motivation\n`;
            response += `- Advancing character's spiritual/personal journey\n\n`;

            response += `💡 **Reminder**: These bonus Resolve points still count against the character's maximum (Resilience value).\n\n`;

            response += `## Using Resolve\n`;
            response += `${character.name} can now use Resolve to:\n`;
            response += `- **Ignore Psychology** until end of next round\n`;
            response += `- **Ignore Critical Wounds** until start of next round\n`;
            response += `- **Remove a Condition** (Prone also heals 1 Wound)\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Resolve', error);
            throw new Error(`Failed to add Resolve for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddResilience(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().int().min(1).max(3),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Adding Resilience point (RARE EVENT)', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const isWFRP = !!(system.status?.resilience !== undefined || system.characteristics?.wp);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Resilience tracking is only available for WFRP characters.`;
            }

            const resilienceCurrent = system.status?.resilience?.value ?? 0;
            const resilienceMax = system.status?.resilience?.max || resilienceCurrent;
            const resolveCurrent = system.status?.resolve?.value ?? 0;

            const newResilience = resilienceCurrent + amount;
            const newResilienceMax = resilienceMax + amount;

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.resilience.value': newResilience,
                    'system.status.resilience.max': newResilienceMax,
                },
            });

            let response = `# 🌟✨ RESILIENCE GRANTED ✨🌟\n\n`;
            response += `# 🙏🙏🙏 **SOUL NOURISHED** 🙏🙏🙏\n\n`;

            response += `## ⚡ ${character.name}'s Inner Strength Has Grown! ⚡\n\n`;

            response += `In one of the rarest and most significant spiritual events, **${character.name}** has gained **${amount} Resilience point${amount === 1 ? '' : 's'}**! This represents permanent nourishment of the soul through acts of extreme importance to their Motivation.\n\n`;

            response += `### 📜 The Achievement\n`;
            response += `> ${reason}\n\n`;

            response += `## 🎭 Character Changes\n\n`;

            response += `### Resilience (Inner Strength)\n`;
            response += `- Previous: ${resilienceCurrent} / ${resilienceMax}\n`;
            response += `- **New**: ${newResilience} / ${newResilienceMax}\n`;
            response += `- Gained: **+${amount} Resilience point${amount === 1 ? '' : 's'}** ✨\n\n`;

            const resilienceBar = '■'.repeat(newResilience);
            response += `\`${resilienceBar}\` **${newResilience} RESILIENCE POINT${newResilience === 1 ? '' : 'S'}!**\n\n`;

            response += `### Resolve (Daily Determination)\n`;
            response += `- Resolve capacity increased to match new Resilience value (**${newResilience}**)\n`;
            response += `- ${character.name} now refreshes to **${newResilience} Resolve** when acting on Motivation\n\n`;

            response += `## 💫 What This Means\n\n`;
            response += `**Resilience represents permanent inner strength.** This increase means:\n\n`;
            response += `1. **Additional Protection from Chaos**\n`;
            response += `   - ${character.name} can deny mutations ${amount} more time${amount === 1 ? '' : 's'}\n`;
            response += `   - Each Resilience point can refuse the corruption of Chaos\n\n`;

            response += `2. **Guaranteed Success Reserve**\n`;
            response += `   - Can guarantee success on impossible Tests ${amount} more time${amount === 1 ? '' : 's'}\n`;
            response += `   - Automatic wins in critical moments\n`;
            response += `   - Choose outcomes instead of rolling dice\n\n`;

            response += `3. **Increased Daily Resolve**\n`;
            response += `   - Resolve maximum permanently increased to ${newResilience}\n`;
            response += `   - More ability to overcome obstacles each day\n`;
            response += `   - Represents increased determination and willpower\n\n`;

            response += `4. **Character Significance**\n`;
            response += `   - ${character.name}'s Motivation has been powerfully reinforced\n`;
            response += `   - Their beliefs and convictions are strengthened\n`;
            response += `   - The soul is nourished and resilient\n\n`;

            response += `## 🎯 Rarity and Importance\n\n`;
            response += `In WFRP 4e, gaining Resilience is **extremely rare**. It should only occur for:\n\n`;
            response += `- ✨ Acts of extreme importance to character's Motivation\n`;
            response += `- ✨ Financing temples, founding orders, converting regions\n`;
            response += `- ✨ Massive personal sacrifices for beliefs\n`;
            response += `- ✨ Life-defining moments aligned with Motivation\n`;
            response += `- ✨ Achievements that permanently strengthen the soul\n`;
            response += `- ✨ Acts that echo through the character's spiritual journey\n\n`;

            response += `This is a **permanent, character-defining** spiritual advancement that should be celebrated and remembered!\n\n`;

            response += `## 📝 Suggested Follow-Up\n`;
            response += `1. Update ${character.name}'s character sheet in Foundry VTT:\n`;
            response += `   - Resilience: **${newResilience}** (current) / **${newResilienceMax}** (max)\n`;
            response += `   - Resolve will now refresh to **${newResilience}** when acting on Motivation\n\n`;
            response += `2. **Roleplay the moment!**\n`;
            response += `   - Describe how the soul is nourished (spiritual vision? inner peace? renewed conviction?)\n`;
            response += `   - Let the player narrate how their character feels spiritually strengthened\n`;
            response += `   - This should reinforce their Motivation\n\n`;
            response += `3. **Document this achievement**\n`;
            response += `   - Add to character history/biography\n`;
            response += `   - Note the date and circumstances\n`;
            response += `   - This is a spiritual milestone\n\n`;

            response += `---\n\n`;
            response += `🎊 **Congratulations to ${character.name}!** 🎊\n\n`;
            response += `*May their strengthened Resilience guide them through the trials of the Old World...*`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Resilience', error);
            throw new Error(`Failed to add Resilience for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
