import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Update stats schema
const UpdateStatsSchema = z.object({
    action: z.literal("update-stats"),
    characterName: z.string(),
    updates: z.object({
        // Characteristics
        weaponSkill: z.number().optional(),
        ballisticSkill: z.number().optional(),
        strength: z.number().optional(),
        toughness: z.number().optional(),
        initiative: z.number().optional(),
        agility: z.number().optional(),
        dexterity: z.number().optional(),
        intelligence: z.number().optional(),
        willpower: z.number().optional(),
        fellowship: z.number().optional(),
        // Status
        currentWounds: z.number().optional(),
        fortune: z.number().optional(),
        fate: z.number().optional(),
        resilience: z.number().optional(),
        resolve: z.number().optional(),
        // Physical details
        age: z.number().optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
        hair: z.string().optional(),
        eyes: z.string().optional(),
        gender: z.string().optional(),
        distinguishingMarks: z.string().optional(),
        starSign: z.string().optional()
    })
});

// Update skill/talent schema
const UpdateSkillTalentSchema = z.object({
    action: z.literal("update-skill-talent"),
    characterName: z.string(),
    itemName: z.string(),
    updates: z.object({
        advances: z.number().optional(),
        modifier: z.number().optional()
    })
});

// Add skill/talent schema
const AddSkillTalentSchema = z.object({
    action: z.literal("add-skill-talent"),
    characterName: z.string(),
    itemName: z.string(),
    itemType: z.enum(["skill", "talent"]),
    advances: z.number().optional()
});

// Update notes schema
const UpdateNotesSchema = z.object({
    action: z.literal("update-notes"),
    characterName: z.string(),
    noteType: z.enum(["gmnotes", "biography"]),
    content: z.string(),
    append: z.boolean().default(false)
});

// Add XP log schema
const AddXPLogSchema = z.object({
    action: z.literal("add-xp-log"),
    characterName: z.string(),
    amount: z.number(),
    reason: z.string(),
    type: z.enum(["earned", "spent"]).default("earned")
});

const ManageCharacterSchema = z.discriminatedUnion("action", [
    UpdateStatsSchema,
    UpdateSkillTalentSchema,
    AddSkillTalentSchema,
    UpdateNotesSchema,
    AddXPLogSchema
]);

type ManageCharacterArgs = z.infer<typeof ManageCharacterSchema>;

export class ManageCharacterTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-character",
            description: `Unified character management for WFRP 4e - update stats, skills, talents, notes, and experience logs.

**Actions:**
- **update-stats**: Set characteristics, status values, physical details (GM override - no restrictions)
- **update-skill-talent**: Modify existing skill/talent advances or modifiers
- **add-skill-talent**: Add skill or talent from compendium
- **update-notes**: Update GM notes or biography
- **add-xp-log**: Add experience log entry

**Update Stats** (Direct value setting):
Use for quick stat changes, character creation, testing, or corrections where you just need to SET a value.
- Characteristics: weaponSkill, ballisticSkill, strength, toughness, initiative, agility, dexterity, intelligence, willpower, fellowship (0-100)
- Status: currentWounds, fortune, fate, resilience, resolve
- Physical: age, height, weight, hair, eyes, gender, distinguishingMarks, starSign

**Note:** For awarding bonus Fortune/Fate with proper narrative ceremony, use the /wfrp-resources skill (grant-fate / spend-fortune actions).

**Examples:**
- Update stats: action="update-stats", characterName="Hans", updates={strength: 40, fortune: 3}
- Update skill: action="update-skill-talent", characterName="Hans", itemName="Melee (Basic)", updates={advances: 5}
- Add talent: action="add-skill-talent", characterName="Hans", itemName="Strike Mighty Blow", itemType="talent"
- Update notes: action="update-notes", characterName="Hans", noteType="gmnotes", content="Suspicious behavior"
- Add XP: action="add-xp-log", characterName="Hans", amount=50, reason="Defeated ogre", type="earned"`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["update-stats", "update-skill-talent", "add-skill-talent", "update-notes", "add-xp-log"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Character name" },
                    // update-stats fields
                    updates: {
                        type: "object",
                        description: "Stats to update (for update-stats or update-skill-talent)",
                        properties: {
                            // Characteristics
                            weaponSkill: { type: "number" },
                            ballisticSkill: { type: "number" },
                            strength: { type: "number" },
                            toughness: { type: "number" },
                            initiative: { type: "number" },
                            agility: { type: "number" },
                            dexterity: { type: "number" },
                            intelligence: { type: "number" },
                            willpower: { type: "number" },
                            fellowship: { type: "number" },
                            // Status
                            currentWounds: { type: "number" },
                            fortune: { type: "number" },
                            fate: { type: "number" },
                            resilience: { type: "number" },
                            resolve: { type: "number" },
                            // Physical
                            age: { type: "number" },
                            height: { type: "string" },
                            weight: { type: "string" },
                            hair: { type: "string" },
                            eyes: { type: "string" },
                            gender: { type: "string" },
                            distinguishingMarks: { type: "string" },
                            starSign: { type: "string" },
                            // Skill/talent updates
                            advances: { type: "number" },
                            modifier: { type: "number" }
                        }
                    },
                    // add-skill-talent fields
                    itemName: { type: "string", description: "Skill/talent name (for update-skill-talent or add-skill-talent)" },
                    itemType: {
                        type: "string",
                        enum: ["skill", "talent"],
                        description: "Type of item to add (for add-skill-talent)"
                    },
                    advances: { type: "number", description: "Number of advances (for add-skill-talent)" },
                    // update-notes fields
                    noteType: {
                        type: "string",
                        enum: ["gmnotes", "biography"],
                        description: "Type of note (for update-notes)"
                    },
                    content: { type: "string", description: "Note content (for update-notes) or reason (for add-xp-log)" },
                    append: { type: "boolean", description: "Append to existing notes (for update-notes)" },
                    // add-xp-log fields
                    amount: { type: "number", description: "XP amount (for add-xp-log)" },
                    reason: { type: "string", description: "Reason for XP change (for add-xp-log)" },
                    type: {
                        type: "string",
                        enum: ["earned", "spent"],
                        description: "XP type (for add-xp-log)"
                    }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageCharacterArgs): Promise<string> {
        const parsed = ManageCharacterSchema.parse(args);

        switch (parsed.action) {
            case "update-stats":
                return this.handleUpdateStats(parsed);
            case "update-skill-talent":
                return this.handleUpdateSkillTalent(parsed);
            case "add-skill-talent":
                return this.handleAddSkillTalent(parsed);
            case "update-notes":
                return this.handleUpdateNotes(parsed);
            case "add-xp-log":
                return this.handleAddXPLog(parsed);
        }
    }

    private async handleUpdateStats(args: z.infer<typeof UpdateStatsSchema>): Promise<string> {
        this.logger.info("Updating character stats", { characterName: args.characterName });

        // Get character first
        const character = await this.foundryClient.query<any>("warhammer-mcp.getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Map user-friendly names to Foundry paths
        const updateData: Record<string, any> = {};

        // Characteristics mapping
        const charMap: Record<string, string> = {
            weaponSkill: 'ws',
            ballisticSkill: 'bs',
            strength: 's',
            toughness: 't',
            initiative: 'i',
            agility: 'ag',
            dexterity: 'dex',
            intelligence: 'int',
            willpower: 'wp',
            fellowship: 'fel'
        };

        for (const [key, value] of Object.entries(args.updates)) {
            if (value === undefined) continue;

            const lowerKey = key.toLowerCase();

            // Characteristics
            if (charMap[key as keyof typeof charMap]) {
                const charKey = charMap[key as keyof typeof charMap];
                updateData[`system.characteristics.${charKey}.initial`] = value;
            }
            // Status values
            else if (lowerKey === 'currentwounds') {
                updateData['system.status.wounds.value'] = value;
            }
            else if (lowerKey === 'fortune') {
                updateData['system.status.fortune.value'] = value;
            }
            else if (lowerKey === 'fate') {
                updateData['system.status.fate.value'] = value;
            }
            else if (lowerKey === 'resilience') {
                updateData['system.status.resilience.value'] = value;
            }
            else if (lowerKey === 'resolve') {
                updateData['system.status.resolve.value'] = value;
            }
            // Physical details
            else if (lowerKey === 'age') {
                updateData['system.details.age.value'] = value;
            }
            else if (lowerKey === 'height') {
                updateData['system.details.height.value'] = value;
            }
            else if (lowerKey === 'weight') {
                updateData['system.details.weight'] = value;
            }
            else if (lowerKey === 'hair') {
                updateData['system.details.haircolour.value'] = value;
            }
            else if (lowerKey === 'eyes') {
                updateData['system.details.eyecolour.value'] = value;
            }
            else if (lowerKey === 'gender') {
                updateData['system.details.gender.value'] = value;
            }
            else if (lowerKey === 'distinguishingmarks') {
                updateData['system.details.distinguishingmark.value'] = value;
            }
            else if (lowerKey === 'starsign') {
                updateData['system.details.starsign.value'] = value;
            }
        }

        await this.foundryClient.query<any>("warhammer-mcp.updateActor", {
            actorId: character.id,
            updateData
        });

        let result = `✅ Updated stats for **${character.name}**\n`;
        const updates = Object.entries(args.updates).filter(([_, v]) => v !== undefined);

        if (updates.length > 0) {
            result += `\n**Changes:**\n`;
            updates.forEach(([key, value]) => {
                result += `- ${key}: ${value}\n`;
            });
        }

        return result;
    }

    private async handleUpdateSkillTalent(args: z.infer<typeof UpdateSkillTalentSchema>): Promise<string> {
        this.logger.info("Updating skill/talent", { characterName: args.characterName, itemName: args.itemName });

        // Get character
        const character = await this.foundryClient.query<any>("warhammer-mcp.getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Find the item (skill or talent)
        const item = character.items?.find((i: any) =>
            i.name.toLowerCase().includes(args.itemName.toLowerCase())
        );

        if (!item) {
            return `❌ Item "${args.itemName}" not found on ${character.name}`;
        }

        // Build update data
        const updateData: Record<string, any> = {};
        if (args.updates.advances !== undefined) {
            updateData['system.advances.value'] = args.updates.advances;
        }
        if (args.updates.modifier !== undefined) {
            updateData['system.modifier.value'] = args.updates.modifier;
        }

        await this.foundryClient.query<any>("warhammer-mcp.updateItem", {
            actorId: character.id,
            itemId: item.id,
            updateData
        });

        let result = `✅ Updated **${item.name}** for ${character.name}\n`;

        if (args.updates.advances !== undefined) {
            result += `- Advances: ${args.updates.advances}\n`;
        }
        if (args.updates.modifier !== undefined) {
            result += `- Modifier: ${args.updates.modifier}\n`;
        }

        return result;
    }

    private async handleAddSkillTalent(args: z.infer<typeof AddSkillTalentSchema>): Promise<string> {
        this.logger.info("Adding skill/talent", { characterName: args.characterName, itemName: args.itemName });

        // Get character
        const character = await this.foundryClient.query<any>("warhammer-mcp.getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Check if already exists
        const existingItem = character.items?.find((i: any) =>
            i.type === args.itemType && i.name.toLowerCase() === args.itemName.toLowerCase()
        );

        if (existingItem) {
            return `⚠️ ${character.name} already has the ${args.itemType} "${existingItem.name}"`;
        }

        // Search compendium
        const searchResults = await this.foundryClient.query<any>("warhammer-mcp.searchCompendium", {
            query: args.itemName,
            packType: "Item"
        });

        if (!searchResults || searchResults.length === 0) {
            return `❌ ${args.itemType} "${args.itemName}" not found in compendiums`;
        }

        // Filter for the specific type
        const typeResults = searchResults.filter((item: any) => item.type === args.itemType);

        if (typeResults.length === 0) {
            return `❌ No ${args.itemType}s matching "${args.itemName}" found`;
        }

        // Find exact or best match
        const compendiumItem = typeResults.find((item: any) =>
            item.name.toLowerCase() === args.itemName.toLowerCase()
        ) || typeResults[0];

        // Construct UUID
        const compendiumUuid = `Compendium.${compendiumItem.pack}.${compendiumItem.id || compendiumItem._id}`;

        // Add from compendium
        await this.foundryClient.query<any>("warhammer-mcp.addItemFromCompendium", {
            actorId: character.id,
            compendiumId: compendiumUuid
        });

        // If advances specified, update them
        if (args.advances) {
            // Get the newly added item
            const updatedCharacter = await this.foundryClient.query<any>("warhammer-mcp.getCharacterInfo", {
                characterName: args.characterName
            });

            const newItem = updatedCharacter.items?.find((i: any) =>
                i.type === args.itemType && i.name.toLowerCase() === args.itemName.toLowerCase()
            );

            if (newItem) {
                await this.foundryClient.query<any>("warhammer-mcp.updateItem", {
                    actorId: character.id,
                    itemId: newItem.id,
                    updateData: {
                        'system.advances.value': args.advances
                    }
                });
            }
        }

        return `✅ Added **${compendiumItem.name}** (${args.itemType}) to ${character.name}` +
            (args.advances ? ` with ${args.advances} advances` : '');
    }

    private async handleUpdateNotes(args: z.infer<typeof UpdateNotesSchema>): Promise<string> {
        this.logger.info("Updating character notes", { characterName: args.characterName, noteType: args.noteType });

        // Get character
        const character = await this.foundryClient.query<any>("warhammer-mcp.getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const updateData: Record<string, any> = {};

        if (args.noteType === "gmnotes") {
            const currentNotes = character.system?.gmnotes?.value || '';
            const newContent = args.append ? currentNotes + '\n\n' + args.content : args.content;
            updateData['system.gmnotes.value'] = newContent;
        } else {
            const currentBio = character.system?.details?.biography?.value || '';
            const newContent = args.append ? currentBio + '\n\n' + args.content : args.content;
            updateData['system.details.biography.value'] = newContent;
        }

        await this.foundryClient.query<any>("warhammer-mcp.updateActor", {
            actorId: character.id,
            updateData
        });

        const action = args.append ? "Appended to" : "Updated";
        return `✅ ${action} ${args.noteType} for **${character.name}**`;
    }

    private async handleAddXPLog(args: z.infer<typeof AddXPLogSchema>): Promise<string> {
        this.logger.info("Adding XP log entry", { characterName: args.characterName, amount: args.amount });

        // Get character
        const character = await this.foundryClient.query<any>("warhammer-mcp.getCharacterInfo", {
            characterName: args.characterName
        });

        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        // Get existing log
        const existingLog = character.system?.details?.experience?.log || [];

        // Create new entry
        const newEntry = {
            amount: Math.abs(args.amount),
            reason: args.reason,
            type: args.type
        };

        // Update log
        const updatedLog = [...existingLog, newEntry];

        await this.foundryClient.query<any>("warhammer-mcp.updateActor", {
            actorId: character.id,
            updateData: {
                'system.details.experience.log': updatedLog
            }
        });

        const sign = args.type === "earned" ? "+" : "-";
        return `✅ Added XP log for **${character.name}**: ${sign}${args.amount} XP - ${args.reason}`;
    }
}
