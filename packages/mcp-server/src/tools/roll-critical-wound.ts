import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class RollCriticalWoundTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "roll-critical-wound",
            description: `Roll a random critical wound on the appropriate WFRP 4e Critical Table and add it to a character.

This tool simulates rolling d100 on the Critical Tables (Head, Body, Arm, or Leg) and automatically adds the result to the character.

WFRP Critical Table System:
- Each location (Head, Body, Arm, Leg) has its own critical table
- Roll d100 to determine which critical result occurs
- Higher rolls = more severe injuries
- Modifiers can be applied (e.g., -20 if damage was less than TB in negative wounds)
- For Arm/Leg, randomly determines Left or Right

Examples:
- Roll head critical: characterName="Hans", location="Head"
- Roll with modifier: characterName="Gustav", location="Body", modifier=-20
- Roll arm critical: characterName="Hans", location="Arm" (randomly picks left or right)

Note: Use manage-critical-wound with action="add" to add a specific known critical by name.`,
            inputSchema: {
                type: "object",
                properties: {
                    characterName: {
                        type: "string",
                        description: "Name of the character receiving the critical wound"
                    },
                    location: {
                        type: "string",
                        enum: ['Head', 'Body', 'Arm', 'Leg'],
                        description: "Hit location to determine which Critical Table to use"
                    },
                    modifier: {
                        type: "number",
                        description: "Optional modifier to the d100 roll (e.g., -20). Default: 0"
                    }
                },
                required: ["characterName", "location"]
            }
        }];
    }

    async handle(args: { characterName: string; location: 'Head' | 'Body' | 'Arm' | 'Leg'; modifier?: number }): Promise<string> {
        const schema = z.object({
            characterName: z.string().min(1, 'Character name is required'),
            location: z.enum(['Head', 'Body', 'Arm', 'Leg']),
            modifier: z.number().int().optional().default(0),
        });

        const { characterName, location, modifier } = schema.parse(args);

        this.logger.info('Rolling random critical wound', { characterName, location, modifier });

        // Roll d100
        const baseRoll = Math.floor(Math.random() * 100) + 1;
        const finalRoll = Math.max(1, Math.min(100, baseRoll + (modifier || 0)));

        this.logger.info('Critical wound roll', { baseRoll, modifier, finalRoll, location });

        // Search compendium for criticals matching this location and roll range
        const searchLocation = location === 'Arm' ? 'arm' : location === 'Leg' ? 'leg' : location.toLowerCase();

        const compendiumResults = await this.foundryClient.query('warhammer-mcp.searchCompendium', {
            query: searchLocation,
            types: ['critical'],
        });

        if (!compendiumResults || compendiumResults.length === 0) {
            return `❌ No critical wounds found for location: ${location}`;
        }

        // Filter by location and find the one that matches our roll
        let selectedCritical: any = null;

        for (const critical of compendiumResults) {
            const critLocation = critical.system?.location?.value || critical.system?.location || '';
            if (critLocation.toLowerCase().includes(searchLocation)) {
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
            return `❌ Could not find a critical wound for ${location} with roll ${finalRoll}. The compendium may not have the critical tables loaded.`;
        }

        this.logger.info('Selected critical from roll', {
            roll: finalRoll,
            critical: selectedCritical.name,
            location: selectedCritical.system?.location
        });

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

        // Get character info
        const character = await this.foundryClient.query('warhammer-mcp.getCharacterInfo', {
            characterName: characterName,
        });

        if (!character) {
            return `❌ Character "${characterName}" not found`;
        }

        const system = character.system as any;
        const tBonus = system.characteristics?.t?.bonus || 0;
        const criticalCurrent = system.status?.criticalWounds?.value || 0;
        const newCriticalCount = criticalCurrent + 1;
        const isDead = newCriticalCount > tBonus;

        // Get critical UUID
        let criticalUuid: string | null = null;
        if (selectedCritical.uuid) {
            criticalUuid = selectedCritical.uuid;
        } else if (selectedCritical.pack && (selectedCritical.id || selectedCritical._id)) {
            const itemId = selectedCritical.id || selectedCritical._id;
            criticalUuid = `Compendium.${selectedCritical.pack}.${itemId}`;
        }

        if (!criticalUuid) {
            return `❌ Critical wound "${selectedCritical.name}" found but lacks UUID/pack/id data.`;
        }

        // Add the critical wound from compendium
        const addResult = await this.foundryClient.query('warhammer-mcp.addItemFromCompendium', {
            actorId: character.id,
            compendiumId: criticalUuid,
        });

        if (!addResult || !addResult.success) {
            return `❌ Failed to add critical from compendium: ${addResult?.message || 'Unknown error'}`;
        }

        // Update location
        await this.foundryClient.query('warhammer-mcp.updateItem', {
            actorId: character.id,
            itemId: addResult.itemId,
            updateData: {
                'system.location.value': specificLocation,
            },
        });

        // Update critical wound count
        await this.foundryClient.query('warhammer-mcp.updateActor', {
            actorId: character.id,
            updateData: {
                'system.status.criticalWounds.value': newCriticalCount,
            },
        });

        // Build response
        let response = `🎲 **Critical Wound Rolled**\n\n`;
        response += `**Roll:** d100 = ${baseRoll}`;
        if (modifier !== 0) {
            response += ` ${modifier >= 0 ? '+' : ''}${modifier} = ${finalRoll}`;
        }
        response += `\n`;
        response += `**Table:** ${location}\n\n`;

        response += `---\n\n`;
        response += `**Character:** ${character.name}\n`;
        response += `**Critical:** ${selectedCritical.name}\n`;
        response += `**Location:** ${specificLocation}\n\n`;
        response += `**Critical Wound Count:** ${newCriticalCount} / ${tBonus} (Toughness Bonus)\n\n`;

        const criticalBar = '█'.repeat(newCriticalCount) + '░'.repeat(Math.max(0, tBonus - newCriticalCount));
        response += `\`${criticalBar}\`\n\n`;

        if (isDead) {
            response += `☠️ **DEATH!**\n${character.name} has exceeded their Toughness Bonus and **DIES IMMEDIATELY**.\nOnly burning a Fate point can save them now!\n`;
        } else if (newCriticalCount === tBonus) {
            response += `⚠️ **CRITICAL!** One more critical wound will be fatal!\n`;
        } else {
            const remaining = tBonus - newCriticalCount;
            response += `${character.name} can survive ${remaining} more critical${remaining === 1 ? '' : 's'} before dying.\n`;
        }

        return response;
    }
}
