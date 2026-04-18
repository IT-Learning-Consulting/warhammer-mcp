import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

const ManageCriticalWoundSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("list"),
        characterName: z.string()
    }),
    z.object({
        action: z.literal("add"),
        characterName: z.string(),
        criticalName: z.string(),
        location: z.enum(['Head', 'Body', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'])
    }),
    z.object({
        action: z.literal("remove"),
        characterName: z.string(),
        woundName: z.string()
    }),
    z.object({
        action: z.literal("check-death"),
        characterName: z.string()
    })
]);

type ManageCriticalWoundArgs = z.infer<typeof ManageCriticalWoundSchema>;

export class ManageCriticalWoundTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-critical-wound",
            description: `Manage critical wounds for WFRP 4e characters.

WFRP Critical Wound System:
- Critical wounds occur when taking damage at 0 Wounds or suffering critical hits
- Each character can survive up to their Toughness Bonus in critical wounds
- Exceeding this limit results in immediate death (unless Fate is burned)
- Criticals have locations (Head, Body, Arms, Legs), severity, and lasting effects
- Healing takes time - simple criticals heal in days, severe ones in weeks/months

Actions:
- **list**: Check all active critical wounds with details, penalties, and recovery status
- **add**: Add a specific critical wound from the compendium (must match exact name from Critical Tables)
- **remove**: Remove a healed critical wound after recovery period
- **check-death**: Check if character dies from too many critical wounds (exceeds Toughness Bonus)

Examples:
- List criticals: action="list", characterName="Hans"
- Add critical: action="add", characterName="Hans", criticalName="Minor Head Injury", location="Head"
- Remove critical: action="remove", characterName="Hans", woundName="Minor Head Injury"
- Check death: action="check-death", characterName="Hans"

Note: Use the roll-critical-wound tool to randomly roll on Critical Tables.`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["list", "add", "remove", "check-death"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Name of the character" },
                    criticalName: { type: "string", description: "Exact name of critical from tables (for add)" },
                    location: {
                        type: "string",
                        enum: ['Head', 'Body', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'],
                        description: "Hit location (for add)"
                    },
                    woundName: { type: "string", description: "Name of wound to remove (for remove)" }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageCriticalWoundArgs): Promise<string> {
        const parsed = ManageCriticalWoundSchema.parse(args);

        switch (parsed.action) {
            case "list":
                return this.handleList(parsed);
            case "add":
                return this.handleAdd(parsed);
            case "remove":
                return this.handleRemove(parsed);
            case "check-death":
                return this.handleCheckDeath(parsed);
        }
    }

    private async handleList(args: { characterName: string }): Promise<string> {
        this.logger.info('Getting critical wounds', { characterName: args.characterName });

        const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
            characterName: args.characterName,
        });

        if (!character) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const system = character.system as any;

        const criticalCurrent = system.status?.criticalWounds?.value || 0;
        const criticalMax = system.status?.criticalWounds?.max || 0;
        const toughness = system.characteristics?.t?.value || 0;
        const tBonus = system.characteristics?.t?.bonus || 0;

        const criticals: any[] = [];
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

        let response = `🩹 **${character.name}** - Critical Wounds Status\n\n`;
        response += `## Critical Wound Count\n`;
        response += `**Current:** ${criticalCurrent} / ${tBonus} (Toughness Bonus)\n`;
        response += `**Toughness:** ${toughness} (TB: ${tBonus})\n\n`;

        const criticalBar = '█'.repeat(criticalCurrent) + '░'.repeat(Math.max(0, tBonus - criticalCurrent));
        response += `\`${criticalBar}\`\n\n`;

        if (severity === 'dying') {
            response += `☠️ **DYING!** Exceeded Toughness Bonus - character is dead unless Fate is burned!\n\n`;
        } else if (severity === 'critical') {
            response += `⚠️ **CRITICAL!** One more critical wound will be fatal!\n\n`;
        } else if (severity === 'injured') {
            const remaining = tBonus - criticalCurrent;
            response += `🩹 **INJURED** - Can survive ${remaining} more critical${remaining === 1 ? '' : 's'} before death.\n\n`;
        } else {
            response += `✅ **HEALTHY** - No critical wounds.\n\n`;
        }

        if (criticals.length > 0) {
            response += `## Active Critical Wounds (${criticals.length})\n\n`;
            criticals.forEach((critical, index) => {
                response += `### ${index + 1}. ${critical.name}\n`;
                response += `**Location:** ${critical.location}\n`;
                response += `**Wounds:** ${critical.wounds}\n`;
                if (critical.penalty) {
                    response += `**Penalty:** ${critical.penalty}\n`;
                }
                if (critical.duration) {
                    response += `**Duration:** ${critical.duration}\n`;
                }
                response += `**Description:** ${critical.description}\n\n`;
            });
        } else if (criticalCurrent > 0) {
            response += `⚠️ Critical wound count is ${criticalCurrent} but no critical items found. This may indicate a data inconsistency.\n\n`;
        }

        return response;
    }

    private async handleAdd(args: { characterName: string; criticalName: string; location: string }): Promise<string> {
        this.logger.info('Adding critical wound', args);

        const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
            characterName: args.characterName,
        });

        if (!character) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const system = character.system as any;
        const tBonus = system.characteristics?.t?.bonus || 0;
        const criticalCurrent = system.status?.criticalWounds?.value || 0;
        const newCriticalCount = criticalCurrent + 1;
        const isDead = newCriticalCount > tBonus;

        // Search compendium for the critical
        const compendiumResults = await this.foundryClient.query<any>('warhammer-mcp.searchCompendium', {
            query: args.criticalName,
            types: ['critical'],
        });

        if (!compendiumResults || compendiumResults.length === 0) {
            return `❌ Critical wound "${args.criticalName}" not found in compendium. Ensure the exact name from the Critical Tables is used.`;
        }

        const criticalItem = compendiumResults[0];
        let criticalUuid: string | null = null;

        if (criticalItem.uuid) {
            criticalUuid = criticalItem.uuid;
        } else if (criticalItem.pack && (criticalItem.id || criticalItem._id)) {
            const itemId = criticalItem.id || criticalItem._id;
            criticalUuid = `Compendium.${criticalItem.pack}.${itemId}`;
        }

        if (!criticalUuid) {
            return `❌ Critical wound "${criticalItem.name}" found but lacks UUID/pack/id data.`;
        }

        // Add the critical wound from compendium
        const addResult = await this.foundryClient.query<any>('warhammer-mcp.addItemFromCompendium', {
            actorId: character.id,
            compendiumId: criticalUuid,
        });

        if (!addResult || !addResult.success) {
            return `❌ Failed to add critical from compendium: ${addResult?.message || 'Unknown error'}`;
        }

        // Update location
        await this.foundryClient.query<any>('warhammer-mcp.updateItem', {
            actorId: character.id,
            itemId: addResult.itemId,
            updateData: {
                'system.location.value': args.location,
            },
        });

        // Update critical wound count
        await this.foundryClient.query<any>('warhammer-mcp.updateActor', {
            actorId: character.id,
            updateData: {
                'system.status.criticalWounds.value': newCriticalCount,
            },
        });

        let response = `🩹 **Critical Wound Added**\n\n`;
        response += `**Character:** ${character.name}\n`;
        response += `**Critical:** ${criticalItem.name}\n`;
        response += `**Location:** ${args.location}\n\n`;
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

    private async handleRemove(args: { characterName: string; woundName: string }): Promise<string> {
        this.logger.info('Removing critical wound', args);

        const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
            characterName: args.characterName,
        });

        if (!character) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const system = character.system as any;
        let foundCritical: any = null;

        if (character.items && Array.isArray(character.items)) {
            foundCritical = character.items.find(
                (item: any) => (item.type === 'critical' || item.type === 'injury') &&
                    item.name.toLowerCase().includes(args.woundName.toLowerCase())
            );
        }

        if (!foundCritical) {
            const availableCriticals = character.items
                ?.filter((item: any) => item.type === 'critical' || item.type === 'injury')
                .map((item: any) => item.name) || [];

            let errorMsg = `❌ Critical wound "${args.woundName}" not found on ${character.name}.\n\n`;
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
        await this.foundryClient.query<any>('warhammer-mcp.deleteItem', {
            actorId: character.id,
            itemId: foundCritical._id,
        });

        // Update critical wound count
        await this.foundryClient.query<any>('warhammer-mcp.updateActor', {
            actorId: character.id,
            updateData: {
                'system.status.criticalWounds.value': newCriticalCount,
            },
        });

        let response = `✅ **Critical Wound Removed**\n\n`;
        response += `**Character:** ${character.name}\n`;
        response += `**Injury:** ${foundCritical.name}\n`;
        response += `**Location:** ${foundCritical.system?.location?.value || 'Unknown'}\n\n`;
        response += `**New Total:** ${newCriticalCount} / ${tBonus} (Toughness Bonus)\n\n`;

        const criticalBar = '█'.repeat(newCriticalCount) + '░'.repeat(Math.max(0, tBonus - newCriticalCount));
        response += `\`${criticalBar}\`\n\n`;

        if (newCriticalCount === 0) {
            response += `🎉 **Fully Recovered!** ${character.name} has no remaining critical wounds.\n`;
        } else {
            response += `🩹 **Still Injured** - ${newCriticalCount} critical wound${newCriticalCount === 1 ? '' : 's'} remaining.\n`;
        }

        return response;
    }

    private async handleCheckDeath(args: { characterName: string }): Promise<string> {
        this.logger.info('Checking death from criticals', { characterName: args.characterName });

        const character = await this.foundryClient.query<any>('warhammer-mcp.getCharacterInfo', {
            characterName: args.characterName,
        });

        if (!character) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const system = character.system as any;
        const criticalCurrent = system.status?.criticalWounds?.value || 0;
        const tBonus = system.characteristics?.t?.bonus || 0;
        const toughness = system.characteristics?.t?.value || 0;

        let response = `☠️ **Death Check: ${character.name}**\n\n`;
        response += `**Current Critical Wounds:** ${criticalCurrent}\n`;
        response += `**Death Threshold:** ${tBonus} (Toughness Bonus)\n`;
        response += `**Toughness:** ${toughness} (Bonus: ${tBonus})\n\n`;

        const criticalBar = '█'.repeat(criticalCurrent) + '░'.repeat(Math.max(0, tBonus - criticalCurrent));
        response += `\`${criticalBar}\`\n\n`;

        if (criticalCurrent > tBonus) {
            response += `☠️ **DECEASED**\n\n`;
            response += `${character.name} has **${criticalCurrent} critical wounds**, exceeding their Toughness Bonus of ${tBonus}.\n\n`;
            response += `**${character.name.toUpperCase()} IS DEAD.**\n\n`;
            response += `**Fate Point Option:** If ${character.name} has a Fate point, they can burn it to survive (permanently reduced Fate, permanent injury).\n`;
        } else if (criticalCurrent === tBonus) {
            response += `⚠️ **CRITICAL - AT DEATH THRESHOLD**\n\n`;
            response += `**ONE MORE CRITICAL WOUND WILL BE FATAL!**\n\n`;
            response += `${character.name} should retreat from combat immediately and seek urgent medical attention.\n`;
        } else if (criticalCurrent > 0) {
            const remaining = tBonus - criticalCurrent;
            response += `🩹 **INJURED - BELOW THRESHOLD**\n\n`;
            response += `${character.name} can survive **${remaining} more critical wound${remaining === 1 ? '' : 's'}** before reaching death threshold.\n`;
            if (remaining <= 2) {
                response += `\n⚠️ **Warning:** Only ${remaining} critical wound${remaining === 1 ? '' : 's'} away from death!\n`;
            }
        } else {
            response += `✅ **HEALTHY - NO CRITICAL WOUNDS**\n\n`;
            response += `${character.name} can survive up to **${tBonus} critical wounds** before dying.\n`;
        }

        return response;
    }
}
