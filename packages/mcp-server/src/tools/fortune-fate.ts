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
        this.logger = logger.child({ component: 'FortuneFateTools' });
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

            // In WFRP 4e, max Fortune/Fate is typically equal to current at character creation
            // but Fortune max doesn't change, while Fate max reduces when burned
            const fortuneMax = system.status?.fortune?.max || fortuneCurrent;
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
            const fortuneMax = system.status?.fortune?.max || fortuneCurrent;

            // Check if Fortune is available
            if (fortuneCurrent <= 0) {
                return `❌ **Cannot Spend Fortune!**\n\n${character.name} has no Fortune points remaining. Fortune will refresh after a good night's rest.\n\n**Current Fortune**: 0 / ${fortuneMax}`;
            }

            const newFortune = fortuneCurrent - 1;

            // Update the character
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character._id,
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
                actorId: character._id,
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
            const fortuneMax = system.status?.fortune?.max || fortuneCurrent;

            // Check if already at max
            if (fortuneCurrent >= fortuneMax) {
                return `${character.name}'s Fortune is already at maximum (${fortuneMax} / ${fortuneMax}). No refresh needed.`;
            }

            // Update the character
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character._id,
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
}
