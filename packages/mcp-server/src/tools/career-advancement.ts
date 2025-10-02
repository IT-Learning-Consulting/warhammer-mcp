import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface CareerAdvancementToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

interface CareerAdvanceInfo {
    name: string;
    type: 'skill' | 'talent' | 'characteristic';
    currentValue?: number;
    maxAdvances?: number;
    advancesTaken?: number;
    advancesRemaining?: number;
    xpCost?: number;
    canAfford: boolean;
    description?: string;
}

interface CareerInfo {
    name: string;
    level: number;
    class: string;
    status: string;
    currentXP: number;
    totalXP: number;
    spentXP: number;
    availableXP: number;
    characteristics: CareerAdvanceInfo[];
    skills: CareerAdvanceInfo[];
    talents: CareerAdvanceInfo[];
    completedAdvances: number;
    totalAdvances: number;
    percentComplete: number;
    nextCareerSuggestions?: string[];
}

export class CareerAdvancementTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: CareerAdvancementToolsOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'CareerAdvancementTools' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'get-career-advancement',
                description: 'View character career advancement options, available advances, XP costs, and progression tracking. Essential for WFRP 4e character development where careers define progression paths. Shows current career level, available skill/talent/characteristic advances, XP costs, and career path suggestions. Example: "Show Gustav\'s available career advances" or "What can Hans purchase with his XP?"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character (e.g., "Gustav Thalmann", "Hans", or actor ID)',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'advance-characteristic',
                description: 'Spend XP to advance a characteristic (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel). Automatically deducts XP cost based on current advances. Example: "Advance Gustav\'s Weapon Skill" or "Increase Hans\' Agility"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        characteristic: {
                            type: 'string',
                            description: 'Characteristic to advance (ws, bs, s, t, i, ag, dex, int, wp, fel)',
                            enum: ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'],
                        },
                        advances: {
                            type: 'number',
                            description: 'Number of advances to purchase (default: 1)',
                            default: 1,
                        },
                    },
                    required: ['characterName', 'characteristic'],
                },
            },
            {
                name: 'advance-skill',
                description: 'Spend XP to advance a skill or purchase a new skill. Automatically deducts XP cost based on current advances. Example: "Advance Gustav\'s Melee (Basic)" or "Purchase Stealth for Hans"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        skillName: {
                            type: 'string',
                            description: 'Name of the skill to advance or purchase',
                        },
                        advances: {
                            type: 'number',
                            description: 'Number of advances to purchase (default: 1)',
                            default: 1,
                        },
                    },
                    required: ['characterName', 'skillName'],
                },
            },
            {
                name: 'advance-talent',
                description: 'Spend XP to purchase a talent or increase its rank. Talents cost 100 XP per rank. Example: "Purchase Strike Mighty Blow for Gustav" or "Increase Hans\' Combat Reflexes rank"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        talentName: {
                            type: 'string',
                            description: 'Name of the talent to purchase or advance',
                        },
                        ranks: {
                            type: 'number',
                            description: 'Number of ranks to purchase (default: 1)',
                            default: 1,
                        },
                    },
                    required: ['characterName', 'talentName'],
                },
            },
        ];
    }

    async handleGetCareerAdvancement(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Getting career advancement information', { characterName });

        try {
            // Get character data using the same method as character.ts
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            if (character.type !== 'character') {
                return `${character.name} is not a player character and does not have career advancement.`;
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.details?.career || system.details?.class);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Career advancement is only available for WFRP characters.`;
            }

            // Get current career information
            const currentCareer = system.details?.career;
            const careerData = character.items?.find((item: any) => item.type === 'career' && item.system?.current?.value === true);

            if (!currentCareer && !careerData) {
                return `${character.name} does not have an active career. Please set a career first.`;
            }

            const careerInfo: CareerInfo = {
                name: careerData?.name || currentCareer?.value || 'Unknown Career',
                level: careerData?.system?.level?.value || system.details?.career?.level || 1,
                class: careerData?.system?.class?.value || system.details?.class?.value || 'Unknown',
                status: careerData?.system?.status?.value || system.details?.status?.value || 'Brass',
                currentXP: system.details?.experience?.current || 0,
                totalXP: system.details?.experience?.total || 0,
                spentXP: system.details?.experience?.spent || 0,
                availableXP: system.details?.experience?.current || 0,
                characteristics: [],
                skills: [],
                talents: [],
                completedAdvances: 0,
                totalAdvances: 0,
                percentComplete: 0,
            };

            // XP cost tables for WFRP 4e
            const characteristicXPCosts = [25, 30, 40, 50, 70, 90, 120, 150, 190, 230, 280, 330, 390, 450, 520];
            const skillXPCosts = [10, 15, 20, 30, 40, 60, 80, 110, 140, 180, 220, 270, 320, 380, 440];

            // Process career advances if available
            if (careerData?.system) {
                const careerSystem = careerData.system;

                // Process characteristic advances
                const characteristicList = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
                if (careerSystem.characteristics) {
                    characteristicList.forEach((char) => {
                        const advance = careerSystem.characteristics[char];
                        if (advance && typeof advance === 'number' && advance > 0) {
                            const currentChar = system.characteristics?.[char];
                            const currentAdvances = currentChar?.advances || 0;
                            const advancesRemaining = Math.max(0, advance - currentAdvances);
                            const xpCost = advancesRemaining > 0 ? characteristicXPCosts[Math.min(currentAdvances, characteristicXPCosts.length - 1)] : 0;

                            careerInfo.characteristics.push({
                                name: char.toUpperCase(),
                                type: 'characteristic',
                                currentValue: currentChar?.value || 0,
                                maxAdvances: advance,
                                advancesTaken: currentAdvances,
                                advancesRemaining,
                                xpCost,
                                canAfford: careerInfo.availableXP >= xpCost,
                                description: `${char.toUpperCase()}: ${currentChar?.value || 0} (${currentAdvances}/${advance} advances)`,
                            });

                            careerInfo.totalAdvances++;
                            if (currentAdvances >= advance) {
                                careerInfo.completedAdvances++;
                            }
                        }
                    });
                }

                // Process skill advances
                if (careerSystem.skills && Array.isArray(careerSystem.skills)) {
                    careerSystem.skills.forEach((skillName: string) => {
                        const skillItem = character.items?.find(
                            (item: any) => item.type === 'skill' && item.name.toLowerCase() === skillName.toLowerCase()
                        );

                        const currentAdvances = skillItem?.system?.advances?.value || 0;
                        const xpCost = currentAdvances > 0 ? skillXPCosts[Math.min(currentAdvances, skillXPCosts.length - 1)] : 10;

                        careerInfo.skills.push({
                            name: skillName,
                            type: 'skill',
                            currentValue: skillItem?.system?.total?.value || 0,
                            advancesTaken: currentAdvances,
                            xpCost,
                            canAfford: careerInfo.availableXP >= xpCost,
                            description: skillItem ? `${skillName}: ${skillItem.system?.total?.value || 0} (${currentAdvances} advances)` : `${skillName}: Not yet purchased`,
                        });

                        careerInfo.totalAdvances++;
                        if (skillItem) {
                            careerInfo.completedAdvances++;
                        }
                    });
                }

                // Process talent advances
                if (careerSystem.talents && Array.isArray(careerSystem.talents)) {
                    careerSystem.talents.forEach((talentName: string) => {
                        const talentItem = character.items?.find(
                            (item: any) => item.type === 'talent' && item.name.toLowerCase().includes(talentName.toLowerCase())
                        );

                        const talentTimes = talentItem?.system?.advances?.value || 0;
                        const maxTalent = talentItem?.system?.max?.value || 1;
                        const xpCost = 100 * (talentTimes + 1); // Talents cost 100 XP per time

                        careerInfo.talents.push({
                            name: talentName,
                            type: 'talent',
                            advancesTaken: talentTimes,
                            maxAdvances: typeof maxTalent === 'number' ? maxTalent : 1,
                            xpCost,
                            canAfford: careerInfo.availableXP >= xpCost,
                            description: talentItem ? `${talentName} (Rank ${talentTimes})` : `${talentName}: Not yet purchased`,
                        });

                        careerInfo.totalAdvances++;
                        if (talentItem) {
                            careerInfo.completedAdvances++;
                        }
                    });
                }
            }

            // Calculate completion percentage
            if (careerInfo.totalAdvances > 0) {
                careerInfo.percentComplete = Math.round((careerInfo.completedAdvances / careerInfo.totalAdvances) * 100);
            }

            // Build response
            let response = `# Career Advancement: ${character.name}\n\n`;
            response += `## Current Career: ${careerInfo.name}\n`;
            response += `- **Level**: ${careerInfo.level}\n`;
            response += `- **Class**: ${careerInfo.class}\n`;
            response += `- **Status**: ${careerInfo.status}\n`;
            response += `- **Progress**: ${careerInfo.completedAdvances}/${careerInfo.totalAdvances} advances (${careerInfo.percentComplete}%)\n\n`;

            response += `## Experience Points\n`;
            response += `- **Available XP**: ${careerInfo.availableXP}\n`;
            response += `- **Total XP Earned**: ${careerInfo.totalXP}\n`;
            response += `- **XP Spent**: ${careerInfo.spentXP}\n\n`;

            // Affordable advances
            const affordableAdvances = [
                ...careerInfo.characteristics.filter((a) => a.canAfford && a.advancesRemaining && a.advancesRemaining > 0),
                ...careerInfo.skills.filter((a) => a.canAfford),
                ...careerInfo.talents.filter((a) => a.canAfford),
            ].sort((a, b) => (a.xpCost || 0) - (b.xpCost || 0));

            if (affordableAdvances.length > 0) {
                response += `## 💰 Available Advances (Can Afford Now)\n`;
                affordableAdvances.forEach((advance) => {
                    const icon = advance.type === 'characteristic' ? '📊' : advance.type === 'skill' ? '🎯' : '⭐';
                    response += `- ${icon} **${advance.name}** (${advance.type}) - ${advance.xpCost} XP\n`;
                    if (advance.description) {
                        response += `  ${advance.description}\n`;
                    }
                });
                response += '\n';
            }

            // Characteristic advances
            if (careerInfo.characteristics.length > 0) {
                response += `## 📊 Characteristic Advances\n`;
                careerInfo.characteristics.forEach((char) => {
                    const status = char.advancesRemaining === 0 ? '✅ Complete' : char.canAfford ? '💰 Can afford' : '⏳ Need more XP';
                    response += `- **${char.name}**: ${char.advancesTaken}/${char.maxAdvances} advances`;
                    if (char.advancesRemaining && char.advancesRemaining > 0) {
                        response += ` (Next: ${char.xpCost} XP) ${status}`;
                    } else {
                        response += ` ${status}`;
                    }
                    response += `\n`;
                });
                response += '\n';
            }

            // Skill advances
            if (careerInfo.skills.length > 0) {
                response += `## 🎯 Career Skills\n`;
                const purchasedSkills = careerInfo.skills.filter((s) => s.advancesTaken && s.advancesTaken > 0);
                const unpurchasedSkills = careerInfo.skills.filter((s) => !s.advancesTaken || s.advancesTaken === 0);

                if (purchasedSkills.length > 0) {
                    response += `### Purchased Skills\n`;
                    purchasedSkills.forEach((skill) => {
                        const status = skill.canAfford ? '💰 Can advance' : '⏳ Need more XP';
                        response += `- **${skill.name}**: ${skill.currentValue} (${skill.advancesTaken} advances) - Next: ${skill.xpCost} XP ${status}\n`;
                    });
                }

                if (unpurchasedSkills.length > 0) {
                    response += `### Not Yet Purchased\n`;
                    unpurchasedSkills.forEach((skill) => {
                        const status = skill.canAfford ? '💰 Can afford' : '⏳ Need more XP';
                        response += `- **${skill.name}**: ${skill.xpCost} XP ${status}\n`;
                    });
                }
                response += '\n';
            }

            // Talent advances
            if (careerInfo.talents.length > 0) {
                response += `## ⭐ Career Talents\n`;
                const purchasedTalents = careerInfo.talents.filter((t) => t.advancesTaken && t.advancesTaken > 0);
                const unpurchasedTalents = careerInfo.talents.filter((t) => !t.advancesTaken || t.advancesTaken === 0);

                if (purchasedTalents.length > 0) {
                    response += `### Acquired Talents\n`;
                    purchasedTalents.forEach((talent) => {
                        const canAdvance = talent.advancesTaken! < (talent.maxAdvances || 1);
                        if (canAdvance) {
                            const status = talent.canAfford ? '💰 Can advance' : '⏳ Need more XP';
                            response += `- **${talent.name}**: Rank ${talent.advancesTaken}/${talent.maxAdvances} - Next: ${talent.xpCost} XP ${status}\n`;
                        } else {
                            response += `- **${talent.name}**: Rank ${talent.advancesTaken}/${talent.maxAdvances} ✅ Complete\n`;
                        }
                    });
                }

                if (unpurchasedTalents.length > 0) {
                    response += `### Not Yet Purchased\n`;
                    unpurchasedTalents.forEach((talent) => {
                        const status = talent.canAfford ? '💰 Can afford' : '⏳ Need more XP';
                        response += `- **${talent.name}**: ${talent.xpCost} XP ${status}\n`;
                    });
                }
                response += '\n';
            }

            // Career completion advice
            if (careerInfo.percentComplete === 100) {
                response += `## 🎓 Career Complete!\n`;
                response += `${character.name} has completed all advances in ${careerInfo.name}. Consider:\n`;
                response += `- Completing the career and moving to the next career in the path\n`;
                response += `- Continuing to advance skills and talents beyond career requirements\n`;
                response += `- Exploring a new career path\n\n`;
            } else if (careerInfo.percentComplete >= 75) {
                response += `## 📈 Nearly Complete!\n`;
                response += `${character.name} is ${careerInfo.percentComplete}% through ${careerInfo.name}. Almost ready to advance to the next career!\n\n`;
            }

            // XP advice
            if (careerInfo.availableXP === 0) {
                response += `## 💡 No XP Available\n`;
                response += `${character.name} needs to earn more experience points before making advances.\n`;
            } else if (affordableAdvances.length === 0) {
                response += `## 💡 Save More XP\n`;
                const cheapestAdvance = [...careerInfo.characteristics, ...careerInfo.skills, ...careerInfo.talents]
                    .filter((a) => !a.canAfford && ((a.advancesRemaining && a.advancesRemaining > 0) || !a.advancesTaken))
                    .sort((a, b) => (a.xpCost || 0) - (b.xpCost || 0))[0];

                if (cheapestAdvance) {
                    response += `${character.name} needs ${cheapestAdvance.xpCost! - careerInfo.availableXP} more XP to afford the next cheapest advance (${cheapestAdvance.name}).\n`;
                }
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get career advancement', error);
            throw new Error(`Failed to retrieve career advancement for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAdvanceCharacteristic(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            characteristic: z.enum(['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']),
            advances: z.number().int().positive().default(1),
        });

        const { characterName, characteristic, advances } = schema.parse(args);

        this.logger.info('Advancing characteristic', { characterName, characteristic, advances });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const currentChar = system.characteristics?.[characteristic];

            if (!currentChar) {
                throw new Error(`Characteristic "${characteristic}" not found on ${character.name}`);
            }

            const characteristicXPCosts = [25, 30, 40, 50, 70, 90, 120, 150, 190, 230, 280, 330, 390, 450, 520];
            const currentAdvances = currentChar.advances || 0;
            const availableXP = system.details?.experience?.current || 0;

            let totalCost = 0;
            for (let i = 0; i < advances; i++) {
                const advanceIndex = currentAdvances + i;
                if (advanceIndex >= characteristicXPCosts.length) {
                    throw new Error(`Cannot advance ${characteristic.toUpperCase()} beyond ${characteristicXPCosts.length} times`);
                }
                totalCost += characteristicXPCosts[advanceIndex];
            }

            if (availableXP < totalCost) {
                throw new Error(`Insufficient XP. Need ${totalCost} XP but only have ${availableXP} available.`);
            }

            // Update the characteristic advances
            const newAdvances = currentAdvances + advances;
            const updateData = {
                [`system.characteristics.${characteristic}.advances`]: newAdvances,
                'system.details.experience.current': availableXP - totalCost,
                'system.details.experience.spent': (system.details?.experience?.spent || 0) + totalCost,
            };

            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: updateData,
            });

            return `✅ Successfully advanced ${characteristic.toUpperCase()} by ${advances} advance(s) for ${character.name}!\n` +
                `- Previous advances: ${currentAdvances}\n` +
                `- New advances: ${newAdvances}\n` +
                `- XP spent: ${totalCost}\n` +
                `- Remaining XP: ${availableXP - totalCost}`;
        } catch (error) {
            this.logger.error('Failed to advance characteristic', error);
            throw new Error(`Failed to advance characteristic: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAdvanceSkill(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            skillName: z.string().min(1, 'Skill name cannot be empty'),
            advances: z.number().int().positive().default(1),
        });

        const { characterName, skillName, advances } = schema.parse(args);

        this.logger.info('Advancing skill', { characterName, skillName, advances });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const skillXPCosts = [10, 15, 20, 30, 40, 60, 80, 110, 140, 180, 220, 270, 320, 380, 440];
            const availableXP = system.details?.experience?.current || 0;

            // Find the skill item
            const skillItem = character.items?.find(
                (item: any) => item.type === 'skill' && item.name.toLowerCase().includes(skillName.toLowerCase())
            );

            if (!skillItem) {
                throw new Error(`Skill "${skillName}" not found on ${character.name}. Please purchase the skill first.`);
            }

            const currentAdvances = skillItem.system?.advances?.value || 0;

            let totalCost = 0;
            for (let i = 0; i < advances; i++) {
                const advanceIndex = currentAdvances + i;
                if (advanceIndex >= skillXPCosts.length) {
                    throw new Error(`Cannot advance ${skillName} beyond ${skillXPCosts.length} times`);
                }
                totalCost += skillXPCosts[advanceIndex];
            }

            if (availableXP < totalCost) {
                throw new Error(`Insufficient XP. Need ${totalCost} XP but only have ${availableXP} available.`);
            }

            // Update the skill advances
            const newAdvances = currentAdvances + advances;
            await this.foundryClient.query('foundry-mcp-bridge.updateItem', {
                actorId: character.id,
                itemId: skillItem.id,
                updateData: {
                    'system.advances.value': newAdvances,
                },
            });

            // Update character XP
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.details.experience.current': availableXP - totalCost,
                    'system.details.experience.spent': (system.details?.experience?.spent || 0) + totalCost,
                },
            });

            return `✅ Successfully advanced ${skillName} by ${advances} advance(s) for ${character.name}!\n` +
                `- Previous advances: ${currentAdvances}\n` +
                `- New advances: ${newAdvances}\n` +
                `- XP spent: ${totalCost}\n` +
                `- Remaining XP: ${availableXP - totalCost}`;
        } catch (error) {
            this.logger.error('Failed to advance skill', error);
            throw new Error(`Failed to advance skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAdvanceTalent(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            talentName: z.string().min(1, 'Talent name cannot be empty'),
            ranks: z.number().int().positive().default(1),
        });

        const { characterName, talentName, ranks } = schema.parse(args);

        this.logger.info('Advancing talent', { characterName, talentName, ranks });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;
            const availableXP = system.details?.experience?.current || 0;
            const talentCostPerRank = 100;

            // Find the talent item
            const talentItem = character.items?.find(
                (item: any) => item.type === 'talent' && item.name.toLowerCase().includes(talentName.toLowerCase())
            );

            if (!talentItem) {
                throw new Error(`Talent "${talentName}" not found on ${character.name}. Please add the talent first.`);
            }

            const currentRanks = talentItem.system?.advances?.value || 0;
            const maxRanks = talentItem.system?.max?.value || 1;
            const newRanks = currentRanks + ranks;

            if (newRanks > maxRanks) {
                throw new Error(`Cannot advance ${talentName} to rank ${newRanks}. Maximum rank is ${maxRanks}.`);
            }

            const totalCost = talentCostPerRank * ranks;

            if (availableXP < totalCost) {
                throw new Error(`Insufficient XP. Need ${totalCost} XP but only have ${availableXP} available.`);
            }

            // Update the talent ranks
            await this.foundryClient.query('foundry-mcp-bridge.updateItem', {
                actorId: character.id,
                itemId: talentItem.id,
                updateData: {
                    'system.advances.value': newRanks,
                },
            });

            // Update character XP
            await this.foundryClient.query('foundry-mcp-bridge.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.details.experience.current': availableXP - totalCost,
                    'system.details.experience.spent': (system.details?.experience?.spent || 0) + totalCost,
                },
            });

            return `✅ Successfully advanced ${talentName} by ${ranks} rank(s) for ${character.name}!\n` +
                `- Previous rank: ${currentRanks}\n` +
                `- New rank: ${newRanks}/${maxRanks}\n` +
                `- XP spent: ${totalCost}\n` +
                `- Remaining XP: ${availableXP - totalCost}`;
        } catch (error) {
            this.logger.error('Failed to advance talent', error);
            throw new Error(`Failed to advance talent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
