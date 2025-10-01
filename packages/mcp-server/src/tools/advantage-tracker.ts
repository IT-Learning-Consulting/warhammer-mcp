import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface AdvantageToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

interface AdvantageStatus {
    current: number;
    max: number;
    bonus: number;
    description: string;
}

export class AdvantageTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: AdvantageToolsOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'AdvantageTools' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'get-advantage',
                description: 'Check a character\'s current Advantage. WFRP 4e specific: Advantage represents combat momentum and tactical positioning. Each point of Advantage adds +10 to combat tests. Advantage is gained from successful attacks, positioning, and tactics. It\'s typically lost at the end of combat or when certain conditions occur. Shows current Advantage and the test bonus it provides. Example: "Check Hans\' Advantage" or "What\'s Gustav\'s current Advantage?"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to check Advantage for',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'add-advantage',
                description: 'Add Advantage points to a character. WFRP 4e specific: Advantage is gained from successful attacks, clever tactics, good positioning, or advantageous situations. Common sources include: winning an Opposed Test, successful attack, gaining higher ground, flanking enemies, or using the environment cleverly. Each point adds +10 to combat tests. Example: "Add 1 Advantage to Hans for successful attack" or "Gustav gains 2 Advantage from flanking"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character gaining Advantage',
                        },
                        amount: {
                            type: 'number',
                            description: 'Amount of Advantage to add (typically 1-3)',
                        },
                        reason: {
                            type: 'string',
                            description: 'Reason for gaining Advantage (e.g., "Successful attack", "Flanking enemy", "Higher ground")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'remove-advantage',
                description: 'Remove Advantage points from a character. WFRP 4e specific: Advantage is lost when: failing a test while being attacked, being Surprised, suffering a Critical Wound, or through certain enemy abilities. It\'s also typically cleared at the end of combat. Losing Advantage represents losing momentum or tactical positioning. Example: "Remove 1 Advantage from Hans for failed test" or "Clear Gustav\'s Advantage (combat ended)"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character losing Advantage',
                        },
                        amount: {
                            type: 'number',
                            description: 'Amount of Advantage to remove (use current Advantage to clear all)',
                        },
                        reason: {
                            type: 'string',
                            description: 'Reason for losing Advantage (e.g., "Failed test while attacked", "Surprised", "Combat ended")',
                        },
                    },
                    required: ['characterName', 'amount', 'reason'],
                },
            },
            {
                name: 'calculate-advantage-bonus',
                description: 'Calculate the test bonus from current Advantage. WFRP 4e specific: Each point of Advantage provides +10 bonus to combat-related tests (attacks, parries, dodges). This bonus can significantly improve success chances. For example, 3 Advantage = +30 to tests, making even difficult actions much easier. This tool shows the current bonus and explains its impact. Example: "Calculate Hans\' Advantage bonus" or "What bonus does Gustav get from his Advantage?"',
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
        ];
    }

    async handleGetAdvantage(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Getting Advantage', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.advantage !== undefined || system.characteristics?.ws);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Advantage tracking is only available for WFRP characters.`;
            }

            // Get Advantage data
            const advantageCurrent = system.status?.advantage?.value || 0;
            const advantageMax = system.status?.advantage?.max || 10;

            const status: AdvantageStatus = {
                current: advantageCurrent,
                max: advantageMax,
                bonus: advantageCurrent * 10,
                description: this.getAdvantageDescription(advantageCurrent),
            };

            // Build response
            let response = `# Advantage: ${character.name}\n\n`;

            // Status icon
            let statusIcon = '⚔️';
            if (advantageCurrent === 0) {
                statusIcon = '🔵';
            } else if (advantageCurrent >= 3) {
                statusIcon = '🔥';
            }

            response += `## ${statusIcon} Current Advantage: ${status.current}\n\n`;

            // Visual bar
            const advantageBar = '█'.repeat(advantageCurrent) + '░'.repeat(Math.max(0, 10 - advantageCurrent));
            response += `\`${advantageBar}\` ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'}\n\n`;

            // Test bonus
            response += `## 🎯 Combat Test Bonus: +${status.bonus}\n\n`;

            if (status.bonus === 0) {
                response += `${character.name} has no Advantage bonus. They fight on equal footing with their opponent.\n\n`;
            } else {
                response += `${character.name} adds **+${status.bonus}** to all combat tests (attacks, parries, dodges).\n\n`;
                response += `**Impact**: ${status.description}\n\n`;
            }

            // Tactical situation
            response += `## ⚔️ Tactical Situation\n\n`;

            if (advantageCurrent === 0) {
                response += `**No Momentum**: ${character.name} has no tactical advantage in combat.\n\n`;
                response += `**Gain Advantage by**:\n`;
                response += `- Successfully attacking and damaging an opponent\n`;
                response += `- Winning Opposed Tests in combat\n`;
                response += `- Gaining tactical positioning (higher ground, flanking)\n`;
                response += `- Using the environment creatively\n`;
            } else if (advantageCurrent <= 2) {
                response += `**Minor Advantage**: ${character.name} has a slight edge in combat.\n\n`;
                response += `**Maintain momentum by**:\n`;
                response += `- Continuing aggressive attacks\n`;
                response += `- Avoiding failed tests while being attacked\n`;
                response += `- Preventing enemy from gaining position\n`;
            } else if (advantageCurrent <= 4) {
                response += `**Significant Advantage**: ${character.name} has strong momentum!\n\n`;
                response += `**Press the advantage**:\n`;
                response += `- The +${status.bonus} bonus makes attacks much more likely to succeed\n`;
                response += `- Consider aggressive tactics to maintain pressure\n`;
                response += `- Watch for enemy attempts to disrupt your momentum\n`;
            } else {
                response += `**Dominant Position**: ${character.name} has overwhelming momentum!\n\n`;
                response += `**Crushing advantage**:\n`;
                response += `- The +${status.bonus} bonus makes even difficult attacks feasible\n`;
                response += `- Enemy is at severe disadvantage\n`;
                response += `- Consider finishing moves or special actions\n`;
                response += `- Be aware that Critical Wounds or Surprise can still reset Advantage\n`;
            }

            // Rules reminder
            response += `## 📖 Advantage Rules\n\n`;
            response += `**Gaining Advantage**:\n`;
            response += `- Successful attack that causes damage: +1 Advantage\n`;
            response += `- Winning Opposed Test in combat: +1 Advantage\n`;
            response += `- Tactical positioning: +1-2 Advantage (GM discretion)\n`;
            response += `- Some talents and abilities grant Advantage\n\n`;

            response += `**Losing Advantage**:\n`;
            response += `- Failing a test while being attacked: -1 Advantage\n`;
            response += `- Being Surprised: lose all Advantage\n`;
            response += `- Suffering a Critical Wound: lose all Advantage\n`;
            response += `- End of combat: typically reset to 0\n\n`;

            response += `**Using Advantage**:\n`;
            response += `- Automatically adds +${status.bonus} to combat tests\n`;
            response += `- Some special actions consume Advantage points\n`;
            response += `- Group Advantage rules may apply if enabled\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to get Advantage', error);
            throw new Error(`Failed to retrieve Advantage for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddAdvantage(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().min(1).max(10),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Adding Advantage', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.advantage !== undefined || system.characteristics?.ws);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Advantage tracking is only available for WFRP characters.`;
            }

            const advantageCurrent = system.status?.advantage?.value || 0;
            const advantageMax = system.status?.advantage?.max || 10;
            const newAdvantage = Math.min(advantageMax, advantageCurrent + amount);
            const actualGain = newAdvantage - advantageCurrent;

            // Build response
            let response = `# Advantage Gained: ${character.name}\n\n`;
            response += `**Reason**: ${reason}\n\n`;

            response += `## ⚔️ Advantage Change\n`;
            response += `- Previous: ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'} (+${advantageCurrent * 10} bonus)\n`;
            response += `- Gained: +${actualGain} point${actualGain === 1 ? '' : 's'}\n`;
            response += `- **New Total**: ${newAdvantage} point${newAdvantage === 1 ? '' : 's'}\n`;
            response += `- **New Bonus**: +${newAdvantage * 10} to combat tests\n\n`;

            // Visual
            const advantageBar = '█'.repeat(newAdvantage) + '░'.repeat(Math.max(0, 10 - newAdvantage));
            response += `\`${advantageBar}\`\n\n`;

            // Cap warning
            if (actualGain < amount) {
                response += `⚠️ **Advantage Capped**: Gained ${actualGain} instead of ${amount} due to maximum Advantage limit (${advantageMax}).\n\n`;
            }

            // Momentum description
            if (newAdvantage === 1 && advantageCurrent === 0) {
                response += `## 🎯 Momentum Established!\n`;
                response += `${character.name} has gained the initiative! The tide of battle begins to turn.\n\n`;
            } else if (newAdvantage >= 3 && advantageCurrent < 3) {
                response += `## 🔥 Strong Momentum!\n`;
                response += `${character.name} now has significant combat advantage! The +${newAdvantage * 10} bonus makes them formidable.\n\n`;
            } else if (newAdvantage >= 5) {
                response += `## ⚡ Overwhelming Advantage!\n`;
                response += `${character.name} dominates the combat! With +${newAdvantage * 10} bonus, they're in a devastating position.\n\n`;
            } else {
                response += `## ↗️ Advantage Increases\n`;
                response += `${character.name} builds momentum with +${newAdvantage * 10} bonus to combat tests.\n\n`;
            }

            // Tactical advice
            response += `## 💡 Tactical Impact\n\n`;
            response += `**Current Bonus**: ${character.name} adds +${newAdvantage * 10} to:\n`;
            response += `- All attack tests\n`;
            response += `- Parry attempts\n`;
            response += `- Dodge tests\n`;
            response += `- Other combat-related tests\n\n`;

            if (newAdvantage >= 3) {
                response += `**Recommended Actions**:\n`;
                response += `- Press the attack aggressively\n`;
                response += `- The high bonus makes risky maneuvers more viable\n`;
                response += `- Consider special attacks or called shots\n`;
                response += `- Maintain pressure to keep Advantage\n\n`;
            } else {
                response += `**Building Momentum**:\n`;
                response += `- Continue attacking to gain more Advantage\n`;
                response += `- Avoid failed tests to prevent losing Advantage\n`;
                response += `- Use tactical positioning for additional gains\n\n`;
            }

            response += `## 🎲 Next Steps\n`;
            response += `1. Update ${character.name}'s Advantage to **${newAdvantage}** in Foundry VTT\n`;
            response += `2. Add +${newAdvantage * 10} to all combat tests\n`;
            response += `3. Track Advantage changes throughout combat\n`;
            response += `4. Remember: Advantage typically resets at combat end\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to add Advantage', error);
            throw new Error(`Failed to add Advantage to "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRemoveAdvantage(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            amount: z.number().min(1).max(10),
            reason: z.string().min(1, 'Reason cannot be empty'),
        });

        const { characterName, amount, reason } = schema.parse(args);

        this.logger.info('Removing Advantage', { characterName, amount, reason });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.advantage !== undefined || system.characteristics?.ws);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Advantage tracking is only available for WFRP characters.`;
            }

            const advantageCurrent = system.status?.advantage?.value || 0;
            const newAdvantage = Math.max(0, advantageCurrent - amount);
            const actualLoss = advantageCurrent - newAdvantage;

            // Check if already at 0
            if (advantageCurrent === 0) {
                return `${character.name} already has 0 Advantage. No Advantage to lose.`;
            }

            // Build response
            let response = `# Advantage Lost: ${character.name}\n\n`;
            response += `**Reason**: ${reason}\n\n`;

            response += `## ⚔️ Advantage Change\n`;
            response += `- Previous: ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'} (+${advantageCurrent * 10} bonus)\n`;
            response += `- Lost: -${actualLoss} point${actualLoss === 1 ? '' : 's'}\n`;
            response += `- **New Total**: ${newAdvantage} point${newAdvantage === 1 ? '' : 's'}\n`;
            response += `- **New Bonus**: +${newAdvantage * 10} to combat tests\n\n`;

            // Visual
            const advantageBar = '█'.repeat(newAdvantage) + '░'.repeat(Math.max(0, 10 - newAdvantage));
            response += `\`${advantageBar}\`\n\n`;

            // Momentum description
            if (newAdvantage === 0) {
                response += `## ⚠️ Momentum Lost!\n`;
                response += `${character.name} has lost all combat advantage! They're back to fighting on equal footing.\n\n`;

                if (reason.toLowerCase().includes('combat ended') || reason.toLowerCase().includes('end of combat')) {
                    response += `Combat has concluded. Advantage naturally resets to 0.\n\n`;
                } else if (reason.toLowerCase().includes('surprised') || reason.toLowerCase().includes('surprise')) {
                    response += `**Surprised!** ${character.name} was caught off-guard, completely losing their tactical advantage.\n\n`;
                } else if (reason.toLowerCase().includes('critical') || reason.toLowerCase().includes('wound')) {
                    response += `**Critical Wound!** The injury disrupts ${character.name}'s combat flow, resetting all Advantage.\n\n`;
                } else {
                    response += `The setback costs ${character.name} their tactical positioning and momentum.\n\n`;
                }
            } else if (advantageCurrent >= 3 && newAdvantage < 3) {
                response += `## ↘️ Significant Momentum Loss\n`;
                response += `${character.name}'s strong advantage has been reduced! The combat situation has shifted.\n\n`;
            } else {
                response += `## ↘️ Advantage Reduced\n`;
                response += `${character.name} loses some momentum but maintains position with +${newAdvantage * 10} bonus.\n\n`;
            }

            // Tactical situation
            response += `## 💡 Tactical Situation\n\n`;

            if (newAdvantage === 0) {
                response += `**No Advantage Remaining**:\n`;
                response += `- ${character.name} fights without bonus\n`;
                response += `- Must rebuild momentum through successful actions\n`;
                response += `- Be cautious of enemy gaining Advantage\n`;
                response += `- Focus on solid tactics and positioning\n\n`;
            } else {
                response += `**Reduced Advantage** (+${newAdvantage * 10} remaining):\n`;
                response += `- Still have a tactical edge, but it's diminished\n`;
                response += `- Avoid further setbacks to prevent losing all Advantage\n`;
                response += `- Try to rebuild with successful attacks\n`;
                response += `- Stay aggressive to maintain momentum\n\n`;
            }

            response += `## 🎲 Next Steps\n`;
            response += `1. Update ${character.name}'s Advantage to **${newAdvantage}** in Foundry VTT\n`;
            if (newAdvantage > 0) {
                response += `2. Apply +${newAdvantage * 10} bonus to remaining combat tests\n`;
                response += `3. Work to rebuild Advantage through successful actions\n`;
            } else {
                response += `2. Remove Advantage bonus from tests (now +0)\n`;
                response += `3. Focus on regaining momentum\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to remove Advantage', error);
            throw new Error(`Failed to remove Advantage from "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleCalculateAdvantageBonus(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Calculating Advantage bonus', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.advantage !== undefined || system.characteristics?.ws);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Advantage tracking is only available for WFRP characters.`;
            }

            const advantageCurrent = system.status?.advantage?.value || 0;
            const bonus = advantageCurrent * 10;

            // Build response
            let response = `# Advantage Bonus Calculation: ${character.name}\n\n`;

            response += `## 🎯 Current Combat Bonus\n\n`;
            response += `**Advantage**: ${advantageCurrent} point${advantageCurrent === 1 ? '' : 's'}\n`;
            response += `**Bonus to Tests**: +${bonus}\n\n`;

            // Visual formula
            response += `### 📊 Calculation\n`;
            response += `\`\`\`\n`;
            response += `Advantage Points: ${advantageCurrent}\n`;
            response += `× 10 per point\n`;
            response += `─────────────────\n`;
            response += `Total Bonus: +${bonus}\n`;
            response += `\`\`\`\n\n`;

            // Practical examples
            response += `## 🎲 Practical Impact\n\n`;

            if (bonus === 0) {
                response += `**No Bonus**: ${character.name} rolls normally without Advantage modifiers.\n\n`;
                response += `Example test (WS 45): Roll under 45 to succeed.\n`;
            } else {
                // Get a characteristic for example (WS if available)
                const ws = system.characteristics?.ws?.value || 40;
                const modifiedWS = ws + bonus;

                response += `**With +${bonus} Bonus**: All combat tests are significantly easier!\n\n`;

                response += `### Example: Weapon Skill Test\n`;
                response += `- Base WS: ${ws}\n`;
                response += `- Advantage Bonus: +${bonus}\n`;
                response += `- **Modified WS: ${modifiedWS}**\n`;
                response += `- Roll under ${modifiedWS} to succeed\n\n`;

                // Show impact
                const successIncrease = bonus;
                response += `**Success Increase**: The +${bonus} bonus increases success chance by ${successIncrease}%!\n\n`;

                if (bonus >= 30) {
                    response += `💥 **Dominant**: With +${bonus}, even difficult attacks become very likely to succeed. This is overwhelming momentum!\n\n`;
                } else if (bonus >= 20) {
                    response += `🔥 **Strong Edge**: The +${bonus} bonus makes ${character.name} significantly more effective in combat.\n\n`;
                } else {
                    response += `⚔️ **Tactical Edge**: The +${bonus} bonus provides a meaningful advantage in combat tests.\n\n`;
                }

                // Additional examples
                response += `### Other Combat Tests Affected:\n`;
                response += `- **Parry**: +${bonus} to parry attempts\n`;
                response += `- **Dodge**: +${bonus} to dodge tests\n`;
                response += `- **Melee Attacks**: +${bonus} to hit\n`;
                response += `- **Ranged Attacks**: +${bonus} to shooting (if in melee)\n\n`;
            }

            // Strategic advice
            response += `## 💡 Strategic Considerations\n\n`;

            if (bonus === 0) {
                response += `**Build Advantage**:\n`;
                response += `- Make successful attacks to gain +1 Advantage each\n`;
                response += `- Win Opposed Tests in combat\n`;
                response += `- Use tactical positioning (flanking, higher ground)\n`;
                response += `- Each point of Advantage gained adds +10 to tests\n`;
            } else if (bonus >= 30) {
                response += `**Maximize Your Advantage**:\n`;
                response += `- This is the time for bold, decisive actions\n`;
                response += `- Consider special attacks or combat maneuvers\n`;
                response += `- Called shots are much more viable with +${bonus}\n`;
                response += `- Maintain pressure - don't let enemy recover\n`;
                response += `- Watch for conditions that reset Advantage (Critical Wounds, Surprise)\n`;
            } else {
                response += `**Maintain Momentum**:\n`;
                response += `- Keep making successful attacks to build more Advantage\n`;
                response += `- Avoid failed tests while being attacked (lose 1 Advantage)\n`;
                response += `- Each additional point adds another +10\n`;
                response += `- Push for 3+ Advantage for strong tactical position\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to calculate Advantage bonus', error);
            throw new Error(`Failed to calculate Advantage bonus for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private getAdvantageDescription(advantage: number): string {
        if (advantage === 0) {
            return 'No tactical advantage in combat.';
        } else if (advantage === 1) {
            return 'Slight edge - combat tests are marginally easier.';
        } else if (advantage === 2) {
            return 'Minor advantage - noticeable improvement in combat effectiveness.';
        } else if (advantage === 3) {
            return 'Significant advantage - strong tactical position.';
        } else if (advantage === 4) {
            return 'Strong momentum - combat tests become much easier.';
        } else if (advantage >= 5) {
            return 'Overwhelming advantage - dominant position in combat!';
        }
        return 'Advantage active.';
    }
}
