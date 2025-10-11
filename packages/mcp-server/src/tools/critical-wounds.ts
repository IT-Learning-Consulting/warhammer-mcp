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
                description: 'Add a critical wound from the WFRP 4e Critical Tables to a character. IMPORTANT: This searches the compendium for the actual critical wound result and adds it with all official effects. Critical wounds occur when: (1) Taking damage while at 0 Wounds, or (2) Suffering a Critical Hit. The GM should have already rolled on the appropriate Critical Table (Head/Body/Arm/Leg) and determined the specific critical result. This tool then adds that result from the compendium. Example: "Add Minor Head Injury to Hans" or "Gustav suffers Badly Jarred Arm"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of the character receiving the critical wound',
                        },
                        criticalName: {
                            type: 'string',
                            description: 'Name of the critical wound from the Critical Tables (e.g., "Minor Head Injury", "Badly Jarred Arm", "Cracked Ribs"). Must match the exact critical result rolled on the table.',
                        },
                        location: {
                            type: 'string',
                            description: 'Hit location (Head, Body, Left Arm, Right Arm, Left Leg, Right Leg)',
                            enum: ['Head', 'Body', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'],
                        },
                    },
                    required: ['characterName', 'criticalName', 'location'],
                },
            },
            {
                name: 'roll-critical-wound',
                description: 'Roll a random critical wound on the appropriate WFRP 4e Critical Table and add it to a character. The tool rolls d100 and selects the corresponding critical from the Head, Body, Arm, or Leg table based on the specified location. This simulates the GM rolling on the Critical Tables. Example: "Roll a head critical for Hans" or "Gustav takes a random body critical"',
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of the character receiving the critical wound',
                        },
                        location: {
                            type: 'string',
                            description: 'Hit location to determine which Critical Table to use (Head, Body, Arm, or Leg)',
                            enum: ['Head', 'Body', 'Arm', 'Leg'],
                        },
                        modifier: {
                            type: 'number',
                            description: 'Optional modifier to the d100 roll (e.g., -20 if damage was less than Toughness Bonus in negative wounds). Default: 0',
                        },
                    },
                    required: ['characterName', 'location'],
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
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
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
            characterName: z.string().min(1, 'Character name is required'),
            criticalName: z.string().min(1, 'Critical wound name is required'),
            location: z.enum(['Head', 'Body', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg']),
        });

        const { characterName, criticalName, location } = schema.parse(args);

        this.logger.info('Adding critical wound from compendium', { characterName, criticalName, location });

        try {
            // Get character
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
                characterName: characterName,
            });

            if (!character) {
                throw new Error(`Character "${characterName}" not found`);
            }

            const system = character.system as any;

            // Check if this is a WFRP character
            const isWFRP = !!(system.status?.criticalWounds !== undefined || system.characteristics?.t);

            if (!isWFRP) {
                return {
                    content: [{
                        type: 'text',
                        text: `${character.name} is not using the WFRP 4e system. Critical wound tracking is only available for WFRP characters.`
                    }]
                };
            }

            const criticalCurrent = system.status?.criticalWounds?.value || 0;
            const tBonus = system.characteristics?.t?.bonus || 0;
            const newCriticalCount = criticalCurrent + 1;

            // Check for death
            const isDead = newCriticalCount > tBonus;

            // Search compendium for the critical wound
            this.logger.info('Searching compendium for critical wound', { criticalName });

            const compendiumResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
                query: criticalName,
                types: ['critical'],
            });

            if (!compendiumResults || compendiumResults.length === 0) {
                throw new Error(
                    `Critical wound "${criticalName}" not found in compendium.\n` +
                    `Please check the spelling or use the exact name from the Critical Tables.\n` +
                    `Common criticals: "Minor Head Injury", "Badly Jarred Arm", "Cracked Ribs", "Torn Thigh"`
                );
            }

            // Find exact or best match
            let criticalItem = compendiumResults.find(
                (item: any) => item.name.toLowerCase() === criticalName.toLowerCase()
            );

            if (!criticalItem) {
                // No exact match, use the first result
                criticalItem = compendiumResults[0];
                this.logger.info('No exact match found, using closest match', {
                    searched: criticalName,
                    found: criticalItem.name
                });
            }

            // Construct UUID from pack and id (CRITICAL - same pattern as career change fix)
            let criticalUuid: string | null = null;
            if (criticalItem.uuid) {
                // If UUID is already present, use it
                criticalUuid = criticalItem.uuid;
            } else if (criticalItem.pack && (criticalItem.id || criticalItem._id)) {
                // Construct UUID from pack and id
                const itemId = criticalItem.id || criticalItem._id;
                criticalUuid = `Compendium.${criticalItem.pack}.${itemId}`;
                this.logger.info('Constructed UUID for critical wound', {
                    critical: criticalItem.name,
                    pack: criticalItem.pack,
                    id: itemId,
                    uuid: criticalUuid
                });
            }

            if (!criticalUuid) {
                throw new Error(
                    `Critical wound "${criticalItem.name}" found but lacks UUID/pack/id data. ` +
                    `Cannot add from compendium. Data: ${JSON.stringify(criticalItem)}`
                );
            }

            // Add the critical wound from compendium with all official effects
            this.logger.info('Adding critical wound from compendium', {
                character: character.name,
                critical: criticalItem.name,
                uuid: criticalUuid,
                location
            });

            const addResult = await this.foundryClient.query('warhammer-mcp.addItemFromCompendium', {
                actorId: character.id,
                compendiumId: criticalUuid,
            });

            if (!addResult || !addResult.success) {
                throw new Error(`Failed to add critical from compendium: ${addResult?.message || 'Unknown error'}`);
            }

            // Update the added critical's location
            await this.foundryClient.query('warhammer-mcp.updateItem', {
                actorId: character.id,
                itemId: addResult.itemId,
                updateData: {
                    'system.location.value': location,
                },
            });

            // Update critical wound count
            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.criticalWounds.value': newCriticalCount,
                },
            });

            // Build simplified response
            let response = `# Critical Wound Added\n\n`;
            response += `**Character**: ${character.name}\n`;
            response += `**Critical**: ${criticalItem.name}\n`;
            response += `**Location**: ${location}\n\n`;

            response += `**Critical Wound Count**: ${newCriticalCount} / ${tBonus} (Toughness Bonus)\n\n`;

            // Visual bar
            const criticalBar = '█'.repeat(newCriticalCount) + '░'.repeat(Math.max(0, tBonus - newCriticalCount));
            response += `\`${criticalBar}\`\n\n`;

            // Death check
            if (isDead) {
                response += `## ☠️ DEATH!\n`;
                response += `${character.name} has exceeded their Toughness Bonus and **DIES IMMEDIATELY**.\n\n`;
                response += `Only burning a Fate point can save them now!\n`;
            } else if (newCriticalCount === tBonus) {
                response += `## ⚠️ CRITICAL!\n`;
                response += `One more critical wound will be fatal!\n`;
            } else {
                const remaining = tBonus - newCriticalCount;
                response += `${character.name} can survive ${remaining} more critical${remaining === 1 ? '' : 's'} before dying.\n`;
            }

            return {
                content: [{
                    type: 'text',
                    text: response
                }]
            };
        } catch (error) {
            this.logger.error('Failed to add critical wound', error);
            throw new Error(`Failed to add critical wound to "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRollCriticalWound(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name is required'),
            location: z.enum(['Head', 'Body', 'Arm', 'Leg']),
            modifier: z.number().int().optional().default(0),
        });

        const { characterName, location, modifier } = schema.parse(args);

        this.logger.info('Rolling random critical wound', { characterName, location, modifier });

        try {
            // Roll d100
            const baseRoll = Math.floor(Math.random() * 100) + 1;
            const finalRoll = Math.max(1, Math.min(100, baseRoll + modifier));

            this.logger.info('Critical wound roll', { baseRoll, modifier, finalRoll, location });

            // Search compendium for criticals matching this location and roll range
            // WFRP4e stores criticals with their roll ranges, we need to find the right one
            const searchLocation = location === 'Arm' ? 'arm' : location === 'Leg' ? 'leg' : location.toLowerCase();

            const compendiumResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
                query: searchLocation,
                types: ['critical'],
            });

            if (!compendiumResults || compendiumResults.length === 0) {
                throw new Error(`No critical wounds found for location: ${location}`);
            }

            // Filter by location and find the one that matches our roll
            // Note: WFRP4e criticals should have system.location and system.range data
            let selectedCritical: any = null;

            for (const critical of compendiumResults) {
                // Check if this critical matches the location
                const critLocation = critical.system?.location?.value || critical.system?.location || '';
                if (critLocation.toLowerCase().includes(searchLocation)) {
                    // Check if our roll falls in this critical's range
                    const minRoll = critical.system?.minRoll?.value || critical.system?.minRoll || 0;
                    const maxRoll = critical.system?.maxRoll?.value || critical.system?.maxRoll || 0;

                    if (minRoll > 0 && maxRoll > 0 && finalRoll >= minRoll && finalRoll <= maxRoll) {
                        selectedCritical = critical;
                        break;
                    }
                }
            }

            // If no critical found by roll range, pick one randomly from matching location
            if (!selectedCritical) {
                const locationCriticals = compendiumResults.filter((c: any) => {
                    const loc = c.system?.location?.value || c.system?.location || '';
                    return loc.toLowerCase().includes(searchLocation);
                });

                if (locationCriticals.length > 0) {
                    const randomIndex = Math.floor(Math.random() * locationCriticals.length);
                    selectedCritical = locationCriticals[randomIndex];
                    this.logger.info('No critical found by roll range, selected randomly', {
                        selectedName: selectedCritical.name
                    });
                }
            }

            if (!selectedCritical) {
                throw new Error(
                    `Could not find a critical wound for ${location} with roll ${finalRoll}.\n` +
                    `This may indicate the compendium doesn't have the critical tables loaded.`
                );
            }

            this.logger.info('Selected critical from roll', {
                roll: finalRoll,
                critical: selectedCritical.name,
                location: selectedCritical.system?.location
            });

            // Now use the regular add-critical-wound logic
            // Determine specific location (Left/Right for arms and legs)
            let specificLocation: 'Head' | 'Body' | 'Left Arm' | 'Right Arm' | 'Left Leg' | 'Right Leg';
            if (location === 'Arm') {
                const side = Math.random() < 0.5 ? 'Left' : 'Right';
                specificLocation = `${side} Arm` as 'Left Arm' | 'Right Arm';
            } else if (location === 'Leg') {
                const side = Math.random() < 0.5 ? 'Left' : 'Right';
                specificLocation = `${side} Leg` as 'Left Leg' | 'Right Leg';
            } else {
                specificLocation = location as 'Head' | 'Body';
            }

            // Call the add handler with the rolled critical
            return await this.handleAddCriticalWound({
                characterName,
                criticalName: selectedCritical.name,
                location: specificLocation
            });

        } catch (error) {
            this.logger.error('Failed to roll critical wound', error);
            throw new Error(`Failed to roll critical wound for "${characterName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
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
                    (item: any) => (item.type === 'critical' || item.type === 'injury') && item.name.toLowerCase().includes(woundName.toLowerCase())
                );
            }

            if (!foundCritical) {
                // List available criticals to help
                const availableCriticals = character.items
                    ?.filter((item: any) => item.type === 'critical' || item.type === 'injury')
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

            // Delete the critical wound item
            await this.foundryClient.query('warhammer-mcp.deleteItem', {
                actorId: character.id,
                itemId: foundCritical._id,
            });

            // Update critical wound count
            await this.foundryClient.query('warhammer-mcp.updateActor', {
                actorId: character.id,
                updateData: {
                    'system.status.criticalWounds.value': newCriticalCount,
                },
            });

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
            response += `1. ✅ Critical wound count updated to **${newCriticalCount}** in Foundry VTT\n`;
            response += `2. ✅ Critical wound item "${foundCritical.name}" deleted from character sheet\n`;
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
            const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
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
