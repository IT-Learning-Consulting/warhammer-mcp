import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface CriticalWoundsToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

interface CriticalWoundInfo {
    name: string;
    location: string;
    wounds: number;
    description: string;
    penalty?: string;
    duration?: string;
}

interface CriticalWoundsStatus {
    current: number;
    max: number;
    wounds: CriticalWoundInfo[];
    severity: 'none' | 'injured' | 'critical' | 'dying';
}

export class CriticalWoundsTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: CriticalWoundsToolsOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'CriticalWoundsTools' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'get-critical-wounds',
                description: 'Check a character\'s critical wounds and injuries. WFRP 4e specific: Critical wounds are serious injuries from taking damage while at 0 Wounds, or from critical hits. Each has a location (head, body, arm, leg), severity, and lasting effects. Characters can have up to their Toughness Bonus in critical wounds before dying. Shows all active criticals, wound count, and recovery status. Example: "Check Gustav\'s critical wounds" or "Show Hans\' injuries"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to check critical wounds for',
                        },
                    },
                    required: ['characterName'],
                },
            },
            {
                name: 'add-critical-wound',
                description: 'Add a critical wound to a character. WFRP 4e specific: Critical wounds occur when taking damage at 0 Wounds, or from a critical hit. Location is determined by hit location (head, body, left/right arm/leg). The GM should roll on the appropriate critical table based on damage type and severity. Each critical has specific penalties and healing times. Example: "Add critical wound to Hans - Left Leg, Cracked Shin" or "Gustav takes head critical"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character receiving the critical wound',
                        },
                        location: {
                            type: 'string',
                            description: 'Hit location of the critical wound (e.g., "Head", "Body", "Left Arm", "Right Arm", "Left Leg", "Right Leg")',
                        },
                        woundName: {
                            type: 'string',
                            description: 'Name/description of the critical wound (e.g., "Cracked Shin", "Concussion", "Broken Ribs")',
                        },
                        wounds: {
                            type: 'number',
                            description: 'Number of Wounds dealt by this critical (typically 1-10+)',
                        },
                        description: {
                            type: 'string',
                            description: 'Full description of the critical wound effects and duration',
                        },
                    },
                    required: ['characterName', 'location', 'woundName', 'wounds', 'description'],
                },
            },
            {
                name: 'remove-critical-wound',
                description: 'Remove a healed critical wound from a character. WFRP 4e specific: Critical wounds heal over time with rest and medical attention. Simple criticals may heal in days, severe ones take weeks or months. Some may never fully heal, leaving permanent disabilities. Use this when a critical has completed its healing duration. Example: "Remove Hans\' Cracked Shin critical" or "Mark Gustav\'s head wound as healed"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character',
                        },
                        woundName: {
                            type: 'string',
                            description: 'Name of the critical wound to remove (must match existing critical)',
                        },
                    },
                    required: ['characterName', 'woundName'],
                },
            },
            {
                name: 'check-death-from-criticals',
                description: 'Check if a character dies from too many critical wounds. WFRP 4e specific: A character can survive a number of critical wounds equal to their Toughness Bonus. If they receive more critical wounds than this, they die immediately. This tool checks current critical wound count against the Toughness Bonus threshold. Example: "Check if Hans dies from criticals" or "Verify critical wound death threshold for Gustav"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name or ID of the character to check',
                        },
                    },
                    required: ['characterName'],
                },
            },
        ];
    }

    async handleGetCriticalWounds(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Getting critical wounds', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.criticalWounds !== undefined || system.characteristics?.t);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Critical wound tracking is only available for WFRP characters.`;
            }

            // Get critical wounds data
            const criticalCurrent = system.status?.criticalWounds?.value || 0;
            const criticalMax = system.status?.criticalWounds?.max || 0;
            const toughness = system.characteristics?.t?.value || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;

            // Get critical wound items
            const criticals: CriticalWoundInfo[] = [];
            if (character.items && Array.isArray(character.items)) {
                character.items
                    .filter((item: any) => item.type === 'critical')
                    .forEach((critical: any) => {
                        criticals.push({
                            name: critical.name,
                            location: critical.system?.location?.value || 'Unknown',
                            wounds: critical.system?.wounds?.value || 0,
                            description: critical.system?.description?.value || 'No description',
                            penalty: critical.system?.penalty?.value || undefined,
                            duration: critical.system?.duration?.value || undefined,
                        });
                    });
            }

            // Determine severity
            let severity: 'none' | 'injured' | 'critical' | 'dying' = 'none';
            if (criticalCurrent === 0) {
                severity = 'none';
            } else if (criticalCurrent < tBonus) {
                severity = 'injured';
            } else if (criticalCurrent === tBonus) {
                severity = 'critical';
            } else {
                severity = 'dying';
            }

            const status: CriticalWoundsStatus = {
                current: criticalCurrent,
                max: criticalMax,
                wounds: criticals,
                severity: severity,
            };

            // Build response
            let response = `# Critical Wounds: ${character.name}\n\n`;

            // Status icon based on severity
            const severityIcons = {
                none: '✅',
                injured: '🩹',
                critical: '🔴',
                dying: '💀',
            };

            const severityLabels = {
                none: 'Healthy',
                injured: 'Injured',
                critical: 'CRITICAL CONDITION',
                dying: 'DYING',
            };

            response += `## ${severityIcons[severity]} Status: ${severityLabels[severity]}\n\n`;
            response += `**Critical Wounds**: ${criticalCurrent} / ${tBonus} (Toughness Bonus)\n`;
            response += `**Toughness**: ${toughness} (Bonus: ${tBonus})\n\n`;

            // Visual bar
            const criticalBar = '█'.repeat(criticalCurrent) + '░'.repeat(Math.max(0, tBonus - criticalCurrent));
            response += `\`${criticalBar}\` ${criticalCurrent} critical${criticalCurrent === 1 ? '' : 's'}\n\n`;

            // Severity-specific warnings
            if (severity === 'dying') {
                response += `## ☠️ DEATH!\n`;
                response += `${character.name} has exceeded their Toughness Bonus in critical wounds and **DIES IMMEDIATELY**.\n\n`;
                response += `Only burning a Fate point can save them now!\n\n`;
            } else if (severity === 'critical') {
                response += `## ⚠️ CRITICAL THRESHOLD REACHED\n`;
                response += `${character.name} is at their maximum critical wound capacity. **ONE MORE CRITICAL WOUND WILL KILL THEM!**\n\n`;
                response += `Immediate medical attention and avoidance of further combat is essential.\n\n`;
            } else if (severity === 'injured') {
                response += `## ⚠️ Injured\n`;
                response += `${character.name} has ${criticalCurrent} critical wound${criticalCurrent === 1 ? '' : 's'}. `;
                response += `They can survive ${tBonus - criticalCurrent} more before reaching the death threshold.\n\n`;
            } else {
                response += `## ✅ No Critical Wounds\n`;
                response += `${character.name} has no critical wounds. They can survive up to ${tBonus} critical wounds based on their Toughness Bonus.\n\n`;
            }

            // List critical wounds
            if (criticals.length > 0) {
                response += `## 🩹 Active Critical Wounds (${criticals.length})\n\n`;

                // Group by location
                const locations = ['Head', 'Body', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'];
                locations.forEach((loc) => {
                    const locationCriticals = criticals.filter((c) => c.location.toLowerCase().includes(loc.toLowerCase()));
                    if (locationCriticals.length > 0) {
                        response += `### 📍 ${loc}\n`;
                        locationCriticals.forEach((critical, index) => {
                            response += `**${index + 1}. ${critical.name}** (${critical.wounds} Wound${critical.wounds === 1 ? '' : 's'})\n`;
                            if (critical.description && critical.description !== 'No description') {
                                response += `${critical.description}\n`;
                            }
                            if (critical.penalty) {
                                response += `**Penalty**: ${critical.penalty}\n`;
                            }
                            if (critical.duration) {
                                response += `**Duration**: ${critical.duration}\n`;
                            }
                            response += `\n`;
                        });
                    }
                });

                // Any without clear location
                const unknownLocation = criticals.filter((c) =>
                    !locations.some(loc => c.location.toLowerCase().includes(loc.toLowerCase()))
                );
                if (unknownLocation.length > 0) {
                    response += `### 📍 Other\n`;
                    unknownLocation.forEach((critical, index) => {
                        response += `**${index + 1}. ${critical.name}** - ${critical.location} (${critical.wounds} Wound${critical.wounds === 1 ? '' : 's'})\n`;
                        if (critical.description && critical.description !== 'No description') {
                            response += `${critical.description}\n`;
                        }
                        response += `\n`;
                    });
                }
            }

            // Recovery guidance
            if (criticals.length > 0) {
                response += `## 💊 Recovery & Healing\n`;
                response += `**Critical Wound Healing**:\n`;
                response += `- Minor criticals: Days to weeks with rest\n`;
                response += `- Major criticals: Weeks to months\n`;
                response += `- Some criticals may leave permanent disabilities\n`;
                response += `- Successful Heal tests can reduce recovery time\n`;
                response += `- Surgery may be required for severe wounds\n\n`;

                response += `**Character Impact**:\n`;
                response += `- Apply all listed penalties from active criticals\n`;
                response += `- Stack penalties if multiple criticals affect same area\n`;
                response += `- Some activities may be impossible with certain criticals\n`;
                response += `- Roleplay the pain and disability appropriately\n`;
            }

            // Tactical advice
            if (criticalCurrent > 0) {
                response += `\n## 💡 Recommendations\n`;
                if (severity === 'critical') {
                    response += `- **IMMEDIATE RETREAT** from combat situations\n`;
                    response += `- Seek skilled medical attention urgently\n`;
                    response += `- Avoid any risky activities\n`;
                    response += `- Have Fate points ready in case of emergency\n`;
                } else {
                    response += `- Seek medical attention when possible\n`;
                    response += `- Be cautious in combat to avoid additional criticals\n`;
                    response += `- Track healing times for each critical wound\n`;
                    response += `- Consider the cumulative effects of multiple wounds\n`;
                }
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to get critical wounds', error);
            throw new Error(`Failed to retrieve critical wounds for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddCriticalWound(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            location: z.string().min(1, 'Location cannot be empty'),
            woundName: z.string().min(1, 'Wound name cannot be empty'),
            wounds: z.number().min(1),
            description: z.string().min(1, 'Description cannot be empty'),
        });

        const { characterName, location, woundName, wounds, description } = schema.parse(args);

        this.logger.info('Adding critical wound', { characterName, location, woundName, wounds });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.criticalWounds !== undefined || system.characteristics?.t);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Critical wound tracking is only available for WFRP characters.`;
            }

            const criticalCurrent = system.status?.criticalWounds?.value || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const newCriticalCount = criticalCurrent + 1;

            // Check for death
            const isDead = newCriticalCount > tBonus;

            // Build response
            let response = `# Critical Wound Added: ${character.name}\n\n`;

            response += `## 🩸 New Critical Wound\n`;
            response += `**Location**: ${location}\n`;
            response += `**Injury**: ${woundName}\n`;
            response += `**Wounds Dealt**: ${wounds}\n\n`;
            response += `**Description**: ${description}\n\n`;

            response += `## 📊 Critical Wound Count\n`;
            response += `- Previous: ${criticalCurrent} critical${criticalCurrent === 1 ? '' : 's'}\n`;
            response += `- Added: +1 critical\n`;
            response += `- **New Total**: ${newCriticalCount} / ${tBonus} (Toughness Bonus)\n\n`;

            // Visual
            const criticalBar = '█'.repeat(newCriticalCount) + '░'.repeat(Math.max(0, tBonus - newCriticalCount));
            response += `\`${criticalBar}\`\n\n`;

            // Death check
            if (isDead) {
                response += `## ☠️ DEATH FROM CRITICAL WOUNDS!\n\n`;
                response += `${character.name} has exceeded their Toughness Bonus (${tBonus}) in critical wounds.\n\n`;
                response += `**${character.name.toUpperCase()} DIES IMMEDIATELY!**\n\n`;
                response += `### Last Chance: Burn Fate\n`;
                response += `If ${character.name} has any Fate points remaining, they can burn one to survive:\n`;
                response += `- Survives with 1 Wound\n`;
                response += `- Permanently loses 1 Fate point (max Fate reduced by 1)\n`;
                response += `- Gains a permanent injury or disfigurement\n`;
                response += `- All critical wounds remain active\n\n`;
                response += `If they have no Fate points, or choose not to burn one, **death is permanent**.\n\n`;
            } else if (newCriticalCount === tBonus) {
                response += `## ⚠️ CRITICAL THRESHOLD REACHED!\n\n`;
                response += `${character.name} is now at their maximum critical wound capacity.\n\n`;
                response += `**ONE MORE CRITICAL WOUND WILL BE FATAL!**\n\n`;
                response += `Immediate actions:\n`;
                response += `- Retreat from combat if possible\n`;
                response += `- Seek urgent medical attention\n`;
                response += `- Avoid any further risks\n`;
                response += `- Prepare to burn Fate if necessary\n\n`;
            } else {
                response += `## ⚠️ Injured\n`;
                response += `${character.name} now has ${newCriticalCount} critical wound${newCriticalCount === 1 ? '' : 's'}. `;
                const remaining = tBonus - newCriticalCount;
                response += `They can survive ${remaining} more critical${remaining === 1 ? '' : 's'} before dying.\n\n`;
            }

            // Location-specific concerns
            response += `## 📍 Location: ${location}\n`;
            const locationEffects: Record<string, string> = {
                'head': 'Head injuries may cause unconsciousness, concussion, or sensory impairment. May affect Intelligence, Initiative, or Fellowship tests.',
                'body': 'Body wounds affect core functions. May cause bleeding, difficulty breathing, or internal damage. Can affect Toughness and Endurance.',
                'arm': 'Arm injuries impair manual dexterity and weapon use. May prevent using two-handed weapons or shields. Affects Agility and Weapon Skill tests.',
                'leg': 'Leg injuries reduce mobility and balance. Movement may be halved or impossible. Affects Movement, Dodge, and Athletics tests.',
            };

            let locationKey = location.toLowerCase();
            if (locationKey.includes('arm')) locationKey = 'arm';
            if (locationKey.includes('leg')) locationKey = 'leg';
            if (locationKey.includes('head')) locationKey = 'head';
            if (locationKey.includes('body')) locationKey = 'body';

            if (locationEffects[locationKey]) {
                response += `${locationEffects[locationKey]}\n\n`;
            }

            response += `## 💡 Next Steps\n`;
            response += `1. Update ${character.name}'s critical wound count to **${newCriticalCount}** in Foundry VTT\n`;
            response += `2. Add the critical wound item "${woundName}" to their character sheet\n`;
            response += `   - Set location: ${location}\n`;
            response += `   - Set wounds: ${wounds}\n`;
            response += `   - Add description and effects\n`;
            response += `3. Apply any immediate penalties from this critical\n`;
            response += `4. Reduce current Wounds by ${wounds}\n`;
            if (isDead) {
                response += `5. **DETERMINE IF FATE IS BURNED** or if character dies permanently\n`;
            } else {
                response += `5. Determine healing time and track recovery\n`;
                response += `6. Narrate the injury and its immediate impact\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to add critical wound', error);
            throw new Error(`Failed to add critical wound to "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRemoveCriticalWound(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
            woundName: z.string().min(1, 'Wound name cannot be empty'),
        });

        const { characterName, woundName } = schema.parse(args);

        this.logger.info('Removing critical wound', { characterName, woundName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.criticalWounds !== undefined || system.characteristics?.t);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Critical wound tracking is only available for WFRP characters.`;
            }

            // Find the critical wound
            let foundCritical: any = null;
            if (character.items && Array.isArray(character.items)) {
                foundCritical = character.items.find(
                    (item: any) => item.type === 'critical' && item.name.toLowerCase().includes(woundName.toLowerCase())
                );
            }

            if (!foundCritical) {
                // List available criticals to help
                const availableCriticals = character.items
                    ?.filter((item: any) => item.type === 'critical')
                    .map((item: any) => item.name) || [];

                let errorMsg = `Critical wound "${woundName}" not found on ${character.name}.\n\n`;
                if (availableCriticals.length > 0) {
                    errorMsg += `Available critical wounds:\n${availableCriticals.map((name: string) => `- ${name}`).join('\n')}`;
                } else {
                    errorMsg += `${character.name} has no critical wounds.`;
                }
                return errorMsg;
            }

            const criticalCurrent = system.status?.criticalWounds?.value || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const newCriticalCount = Math.max(0, criticalCurrent - 1);

            // Build response
            let response = `# Critical Wound Removed: ${character.name}\n\n`;

            response += `## ✅ Healed Critical Wound\n`;
            response += `**Injury**: ${foundCritical.name}\n`;
            response += `**Location**: ${foundCritical.system?.location?.value || 'Unknown'}\n`;
            response += `**Wounds**: ${foundCritical.system?.wounds?.value || 0}\n\n`;

            response += `This critical wound has completed its healing duration and is now removed from ${character.name}.\n\n`;

            response += `## 📊 Critical Wound Count\n`;
            response += `- Previous: ${criticalCurrent} critical${criticalCurrent === 1 ? '' : 's'}\n`;
            response += `- Healed: -1 critical\n`;
            response += `- **New Total**: ${newCriticalCount} / ${tBonus} (Toughness Bonus)\n\n`;

            // Visual
            const criticalBar = '█'.repeat(newCriticalCount) + '░'.repeat(Math.max(0, tBonus - newCriticalCount));
            response += `\`${criticalBar}\`\n\n`;

            // Status update
            if (newCriticalCount === 0) {
                response += `## 🎉 Fully Recovered!\n`;
                response += `${character.name} has no remaining critical wounds and has recovered from their injuries!\n\n`;
            } else {
                response += `## 🩹 Still Injured\n`;
                response += `${character.name} still has ${newCriticalCount} critical wound${newCriticalCount === 1 ? '' : 's'} remaining. `;
                response += `Continue tracking their healing and recovery.\n\n`;
            }

            response += `## 💡 Next Steps\n`;
            response += `1. Update ${character.name}'s critical wound count to **${newCriticalCount}** in Foundry VTT\n`;
            response += `2. Delete the critical wound item "${foundCritical.name}" from their character sheet\n`;
            response += `3. Remove any penalties associated with this critical\n`;
            response += `4. Note the healing date for character records\n`;
            if (newCriticalCount > 0) {
                response += `5. Continue monitoring remaining critical wounds for healing\n`;
            } else {
                response += `5. ${character.name} is now fully healed from critical wounds!\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to remove critical wound', error);
            throw new Error(`Failed to remove critical wound from "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleCheckDeathFromCriticals(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name cannot be empty'),
        });

        const { characterName } = schema.parse(args);

        this.logger.info('Checking death from criticals', { characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.criticalWounds !== undefined || system.characteristics?.t);

            if (!isWFRP) {
                return `${character.name} is not using the WFRP 4e system. Critical wound tracking is only available for WFRP characters.`;
            }

            const criticalCurrent = system.status?.criticalWounds?.value || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const toughness = system.characteristics?.t?.value || 0;

            // Build response
            let response = `# Death Check: ${character.name}\n\n`;

            response += `## Critical Wound Threshold\n`;
            response += `**Current Critical Wounds**: ${criticalCurrent}\n`;
            response += `**Death Threshold**: ${tBonus} (Toughness Bonus)\n`;
            response += `**Toughness**: ${toughness} (Bonus: ${tBonus})\n\n`;

            // Visual
            const criticalBar = '█'.repeat(criticalCurrent) + '░'.repeat(Math.max(0, tBonus - criticalCurrent));
            response += `\`${criticalBar}\`\n\n`;

            // Determine status
            if (criticalCurrent > tBonus) {
                response += `## ☠️ DECEASED\n\n`;
                response += `${character.name} has **${criticalCurrent} critical wounds**, which exceeds their Toughness Bonus of ${tBonus}.\n\n`;
                response += `**${character.name.toUpperCase()} IS DEAD.**\n\n`;
                response += `According to WFRP 4e rules, a character dies immediately when their critical wound count exceeds their Toughness Bonus.\n\n`;
                response += `### Fate Point Option\n`;
                response += `If ${character.name} has a Fate point available, they can burn it to survive:\n`;
                response += `- Permanent survival (reduced to 1 Wound)\n`;
                response += `- Fate max permanently reduced by 1\n`;
                response += `- Gain a permanent injury/disfigurement\n`;
                response += `- All critical wounds remain active\n`;
            } else if (criticalCurrent === tBonus) {
                response += `## ⚠️ CRITICAL - AT DEATH THRESHOLD\n\n`;
                response += `${character.name} has **${criticalCurrent} critical wounds**, exactly equal to their Toughness Bonus.\n\n`;
                response += `**ONE MORE CRITICAL WOUND WILL BE FATAL!**\n\n`;
                response += `${character.name} is in critical condition:\n`;
                response += `- Cannot survive another critical wound\n`;
                response += `- Should retreat from combat immediately\n`;
                response += `- Requires urgent medical attention\n`;
                response += `- Should avoid all risky situations\n`;
                response += `- Have Fate points ready\n`;
            } else if (criticalCurrent > 0) {
                const remaining = tBonus - criticalCurrent;
                response += `## 🩹 INJURED - BELOW THRESHOLD\n\n`;
                response += `${character.name} has **${criticalCurrent} critical wound${criticalCurrent === 1 ? '' : 's'}**, below their Toughness Bonus of ${tBonus}.\n\n`;
                response += `**Status**: Alive but injured\n\n`;
                response += `${character.name} can survive **${remaining} more critical wound${remaining === 1 ? '' : 's'}** before reaching the death threshold.\n\n`;
                if (remaining <= 2) {
                    response += `⚠️ **Warning**: Only ${remaining} critical wound${remaining === 1 ? '' : 's'} away from death. Exercise caution!\n`;
                }
            } else {
                response += `## ✅ HEALTHY - NO CRITICAL WOUNDS\n\n`;
                response += `${character.name} has no critical wounds.\n\n`;
                response += `**Status**: Healthy\n\n`;
                response += `${character.name} can survive up to **${tBonus} critical wounds** before dying, based on their Toughness Bonus.\n`;
            }

            // Rules reminder
            response += `\n## 📖 WFRP 4e Rule\n`;
            response += `**Critical Wound Death**: A character dies when their number of critical wounds **exceeds** their Toughness Bonus.\n\n`;
            response += `- Equal to TB: At death threshold (still alive)\n`;
            response += `- Greater than TB: Immediate death (Fate can save)\n`;
            response += `- Each critical wound is a serious injury that requires time to heal\n`;
            response += `- Multiple criticals can have cumulative penalties\n`;

            return response;
        } catch (error) {
            this.logger.error('Failed to check death from criticals', error);
            throw new Error(`Failed to check death status for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
