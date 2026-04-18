import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Base properties shared by all items
const BaseItemSchema = z.object({
    characterName: z.string().optional(),
    description: z.string().optional()
});

// Weapon-specific schema
const WeaponSchema = BaseItemSchema.extend({
    itemType: z.literal("weapon"),
    weaponName: z.string(),
    weaponGroup: z.enum(['basic', 'cavalry', 'fencing', 'brawling', 'flail', 'parry', 'polearm', 'twohanded', 'blackpowder', 'bow', 'crossbow', 'entangling', 'engineering', 'explosives', 'sling', 'throwing']),
    damage: z.string(),
    reach: z.enum(['personal', 'vshort', 'short', 'average', 'long', 'vLong', 'massive']),
    range: z.number().optional(),
    encumbrance: z.number().default(1),
    qualities: z.array(z.object({ name: z.string(), value: z.number().optional() })).optional(),
    flaws: z.array(z.object({ name: z.string(), value: z.number().optional() })).optional()
});

// Armour-specific schema
const ArmourSchema = BaseItemSchema.extend({
    itemType: z.literal("armour"),
    armourName: z.string(),
    armourType: z.enum(['softLeather', 'boiledLeather', 'mail', 'plate', 'other', 'otherMetal']),
    locations: z.array(z.enum(['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg'])),
    armorPoints: z.number(),
    encumbrance: z.number().default(1),
    qualities: z.array(z.string()).optional(),
    flaws: z.array(z.string()).optional()
});

// Trapping-specific schema
const TrappingSchema = BaseItemSchema.extend({
    itemType: z.literal("trapping"),
    trappingName: z.string(),
    trappingType: z.enum(['clothingAccessories', 'foodAndDrink', 'toolsAndKits', 'booksAndDocuments', 'tradeTools', 'drugsPoisonsHerbsDraughts', 'ingredient', 'misc']),
    encumbrance: z.number().default(1),
    quantity: z.number().default(1),
    qualities: z.array(z.string()).optional(),
    flaws: z.array(z.string()).optional()
});

// Ammunition-specific schema
const AmmunitionSchema = BaseItemSchema.extend({
    itemType: z.literal("ammunition"),
    ammunitionName: z.string(),
    ammunitionGroup: z.enum(['bow', 'crossbow', 'sling', 'BPandEng', 'throwing', 'entangling']),
    quantity: z.number().default(10),
    encumbrance: z.number().default(0.1)
});

// Container-specific schema
const ContainerSchema = BaseItemSchema.extend({
    itemType: z.literal("container"),
    containerName: z.string(),
    capacity: z.number(),
    encumbrance: z.number().default(1)
});

// Modify-qualities schema
const ModifyQualitiesSchema = z.object({
    itemType: z.literal("modify-qualities"),
    characterName: z.string(),
    itemName: z.string(),
    addQualities: z.array(z.object({
        name: z.string(),
        value: z.number().optional()
    })).default([]),
    removeQualities: z.array(z.string()).default([]),
    addFlaws: z.array(z.object({
        name: z.string(),
        value: z.number().optional()
    })).default([]),
    removeFlaws: z.array(z.string()).default([])
});

const CreateItemSchema = z.discriminatedUnion("itemType", [
    WeaponSchema,
    ArmourSchema,
    TrappingSchema,
    AmmunitionSchema,
    ContainerSchema,
    ModifyQualitiesSchema
]);

type CreateItemArgs = z.infer<typeof CreateItemSchema>;

export class CreateItemTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "create-item",
            description: `Create items for WFRP 4e characters - weapons, armor, trappings, ammunition, containers.

**Item Types:**
- **weapon**: Combat weapons with damage, reach, qualities, flaws
- **armour**: Protective gear with AP, locations, type
- **trapping**: General equipment (tools, food, misc items)
- **ammunition**: Ranged weapon ammo (arrows, bolts, bullets)
- **container**: Storage containers (backpack, sack, chest)
- **modify-qualities**: Add/remove qualities and flaws from existing items

**Weapon Properties:**
- Groups: basic, cavalry, fencing, brawling, flail, parry, polearm, twohanded, blackpowder, bow, crossbow, sling, throwing, etc.
- Reach: personal, vshort, short, average, long, vLong, massive
- Damage: Format like "SB+4", "7", "SB"
- Qualities: accurate, damaging, defensive, fast, hack, impale, penetrating, precise, etc.
- Flaws: dangerous, imprecise, reload, slow, tiring, undamaging

**Armour Properties:**
- Types: softLeather, boiledLeather, mail, plate
- Locations: head, body, lArm, rArm, lLeg, rLeg
- Armor Points: 0-5+ (protection level)

**Trapping Categories:**
- clothingAccessories, foodAndDrink, toolsAndKits, booksAndDocuments, tradeTools, drugsPoisonsHerbsDraughts, ingredient, misc

**Examples:**
- Weapon: itemType="weapon", weaponName="Longsword", weaponGroup="basic", damage="SB+4", reach="average"
- Armour: itemType="armour", armourName="Mail Coat", armourType="mail", locations=["body"], armorPoints=3
- Trapping: itemType="trapping", trappingName="Rope", trappingType="misc", encumbrance=1
- Ammo: itemType="ammunition", ammunitionName="Arrows", ammunitionGroup="bow", quantity=20
- Container: itemType="container", containerName="Backpack", capacity=30, encumbrance=1
- Modify: itemType="modify-qualities", characterName="Hans", itemName="Longsword", addQualities=[{name: "damaging"}]`,
            inputSchema: {
                type: "object",
                properties: {
                    itemType: {
                        type: "string",
                        enum: ["weapon", "armour", "trapping", "ammunition", "container", "modify-qualities"],
                        description: "Type of item to create or action to perform"
                    },
                    characterName: { type: "string", description: "Character to give item to (optional)" },
                    // Weapon fields
                    weaponName: { type: "string", description: "Weapon name (for weapon)" },
                    weaponGroup: {
                        type: "string",
                        enum: ['basic', 'cavalry', 'fencing', 'brawling', 'flail', 'parry', 'polearm', 'twohanded', 'blackpowder', 'bow', 'crossbow', 'entangling', 'engineering', 'explosives', 'sling', 'throwing'],
                        description: "Weapon skill group (for weapon)"
                    },
                    damage: { type: "string", description: "Damage like 'SB+4' (for weapon)" },
                    reach: {
                        type: "string",
                        enum: ['personal', 'vshort', 'short', 'average', 'long', 'vLong', 'massive'],
                        description: "Weapon reach (for weapon)"
                    },
                    range: { type: "number", description: "Max range in yards (for ranged weapon)" },
                    // Armour fields
                    armourName: { type: "string", description: "Armour name (for armour)" },
                    armourType: {
                        type: "string",
                        enum: ['softLeather', 'boiledLeather', 'mail', 'plate', 'other', 'otherMetal'],
                        description: "Armour material type (for armour)"
                    },
                    locations: {
                        type: "array",
                        items: { type: "string", enum: ['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg'] },
                        description: "Body locations covered (for armour)"
                    },
                    armorPoints: { type: "number", description: "Armor Points protection (for armour)" },
                    // Trapping fields
                    trappingName: { type: "string", description: "Trapping name (for trapping)" },
                    trappingType: {
                        type: "string",
                        enum: ['clothingAccessories', 'foodAndDrink', 'toolsAndKits', 'booksAndDocuments', 'tradeTools', 'drugsPoisonsHerbsDraughts', 'ingredient', 'misc'],
                        description: "Trapping category (for trapping)"
                    },
                    // Ammunition fields
                    ammunitionName: { type: "string", description: "Ammunition name (for ammunition)" },
                    ammunitionGroup: {
                        type: "string",
                        enum: ['bow', 'crossbow', 'sling', 'BPandEng', 'throwing', 'entangling'],
                        description: "Ammunition type (for ammunition)"
                    },
                    // Container fields
                    containerName: { type: "string", description: "Container name (for container)" },
                    capacity: { type: "number", description: "Max Enc capacity (for container)" },
                    // Modify qualities fields
                    itemName: { type: "string", description: "Existing item name (for modify-qualities)" },
                    addQualities: {
                        type: "array",
                        items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } },
                        description: "Qualities to add (for modify-qualities)"
                    },
                    removeQualities: {
                        type: "array",
                        items: { type: "string" },
                        description: "Quality names to remove (for modify-qualities)"
                    },
                    addFlaws: {
                        type: "array",
                        items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } },
                        description: "Flaws to add (for modify-qualities)"
                    },
                    removeFlaws: {
                        type: "array",
                        items: { type: "string" },
                        description: "Flaw names to remove (for modify-qualities)"
                    },
                    // Common fields
                    encumbrance: { type: "number", description: "Item weight" },
                    quantity: { type: "number", description: "Quantity (for stackable items)" },
                    qualities: { type: "array", items: { type: "object" }, description: "Item qualities" },
                    flaws: { type: "array", items: { type: "object" }, description: "Item flaws" },
                    description: { type: "string", description: "Item description" }
                },
                required: ["itemType"]
            }
        }];
    }

    async handle(args: CreateItemArgs): Promise<string> {
        const parsed = CreateItemSchema.parse(args);

        switch (parsed.itemType) {
            case "weapon":
                return this.handleCreateWeapon(parsed);
            case "armour":
                return this.handleCreateArmour(parsed);
            case "trapping":
                return this.handleCreateTrapping(parsed);
            case "ammunition":
                return this.handleCreateAmmunition(parsed);
            case "container":
                return this.handleCreateContainer(parsed);
            case "modify-qualities":
                return this.handleModifyQualities(parsed);
        }
    }

    private async handleCreateWeapon(args: z.infer<typeof WeaponSchema>): Promise<string> {
        this.logger.info("Creating weapon", { weaponName: args.weaponName });

        await this.foundryClient.query<any>(
            "warhammer-mcp.createWeapon",
            {
                characterName: args.characterName,
                weaponName: args.weaponName,
                weaponGroup: args.weaponGroup,
                damage: args.damage,
                reach: args.reach,
                range: args.range,
                encumbrance: args.encumbrance,
                qualities: args.qualities || [],
                flaws: args.flaws || [],
                description: args.description || ''
            }
        );

        const target = args.characterName ? ` for ${args.characterName}` : '';
        return `✅ Created **${args.weaponName}**${target}\n` +
            `- Group: ${args.weaponGroup}\n` +
            `- Damage: ${args.damage}\n` +
            `- Reach: ${args.reach}\n` +
            `- Enc: ${args.encumbrance}`;
    }

    private async handleCreateArmour(args: z.infer<typeof ArmourSchema>): Promise<string> {
        this.logger.info("Creating armour", { armourName: args.armourName });

        await this.foundryClient.query<any>(
            "warhammer-mcp.createArmour",
            {
                characterName: args.characterName,
                armourName: args.armourName,
                armourType: args.armourType,
                locations: args.locations,
                armorPoints: args.armorPoints,
                encumbrance: args.encumbrance,
                qualities: args.qualities || [],
                flaws: args.flaws || [],
                description: args.description || ''
            }
        );

        const target = args.characterName ? ` for ${args.characterName}` : '';
        return `✅ Created **${args.armourName}**${target}\n` +
            `- Type: ${args.armourType}\n` +
            `- Locations: ${args.locations.join(', ')}\n` +
            `- AP: ${args.armorPoints}\n` +
            `- Enc: ${args.encumbrance}`;
    }

    private async handleCreateTrapping(args: z.infer<typeof TrappingSchema>): Promise<string> {
        this.logger.info("Creating trapping", { trappingName: args.trappingName });

        await this.foundryClient.query<any>(
            "warhammer-mcp.createTrapping",
            {
                characterName: args.characterName,
                trappingName: args.trappingName,
                trappingType: args.trappingType,
                encumbrance: args.encumbrance,
                quantity: args.quantity,
                qualities: args.qualities || [],
                flaws: args.flaws || [],
                description: args.description || ''
            }
        );

        const target = args.characterName ? ` for ${args.characterName}` : '';
        return `✅ Created **${args.trappingName}**${target}\n` +
            `- Type: ${args.trappingType}\n` +
            `- Quantity: ${args.quantity}\n` +
            `- Enc: ${args.encumbrance}`;
    }

    private async handleCreateAmmunition(args: z.infer<typeof AmmunitionSchema>): Promise<string> {
        this.logger.info("Creating ammunition", { ammunitionName: args.ammunitionName });

        await this.foundryClient.query<any>(
            "warhammer-mcp.createAmmunition",
            {
                characterName: args.characterName,
                ammunitionName: args.ammunitionName,
                ammunitionGroup: args.ammunitionGroup,
                quantity: args.quantity,
                encumbrance: args.encumbrance,
                description: args.description || ''
            }
        );

        const target = args.characterName ? ` for ${args.characterName}` : '';
        return `✅ Created **${args.ammunitionName}**${target}\n` +
            `- Type: ${args.ammunitionGroup}\n` +
            `- Quantity: ${args.quantity}\n` +
            `- Enc: ${args.encumbrance} each`;
    }

    private async handleCreateContainer(args: z.infer<typeof ContainerSchema>): Promise<string> {
        this.logger.info("Creating container", { containerName: args.containerName });

        await this.foundryClient.query<any>(
            "warhammer-mcp.createContainer",
            {
                characterName: args.characterName,
                containerName: args.containerName,
                capacity: args.capacity,
                encumbrance: args.encumbrance,
                description: args.description || ''
            }
        );

        const target = args.characterName ? ` for ${args.characterName}` : '';
        return `✅ Created **${args.containerName}**${target}\n` +
            `- Capacity: ${args.capacity} Enc\n` +
            `- Weight: ${args.encumbrance} Enc`;
    }

    private async handleModifyQualities(args: z.infer<typeof ModifyQualitiesSchema>): Promise<string> {
        this.logger.info("Modifying item qualities", { itemName: args.itemName, characterName: args.characterName });

        await this.foundryClient.query<any>(
            "warhammer-mcp.modifyItemQualities",
            {
                characterName: args.characterName,
                itemName: args.itemName,
                addQualities: args.addQualities,
                removeQualities: args.removeQualities,
                addFlaws: args.addFlaws,
                removeFlaws: args.removeFlaws
            }
        );

        let result = `✅ Modified **${args.itemName}** for ${args.characterName}\n`;

        if (args.addQualities.length > 0) {
            result += `\n**Added Qualities:**\n`;
            args.addQualities.forEach(q => {
                result += `- ${q.name}${q.value ? ` (${q.value})` : ''}\n`;
            });
        }

        if (args.removeQualities.length > 0) {
            result += `\n**Removed Qualities:**\n`;
            args.removeQualities.forEach(q => result += `- ${q}\n`);
        }

        if (args.addFlaws.length > 0) {
            result += `\n**Added Flaws:**\n`;
            args.addFlaws.forEach(f => {
                result += `- ${f.name}${f.value ? ` (${f.value})` : ''}\n`;
            });
        }

        if (args.removeFlaws.length > 0) {
            result += `\n**Removed Flaws:**\n`;
            args.removeFlaws.forEach(f => result += `- ${f}\n`);
        }

        return result;
    }
}
