import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ItemCreatorToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}

/**
 * Advanced Item Creator and Manager for WFRP 4e
 * 
 * Handles creation, modification, and management of all WFRP4e item types:
 * - Weapons (melee/ranged with qualities, flaws, damage, reach, groups)
 * - Armour (with armor points, locations, qualities, flaws, types)
 * - Trappings (general equipment with categories and encumbrance)
 * - Ammunition (with types and quantities)
 * - Containers (with capacity and contents)
 * - Money (GC, SS, BP)
 */
export class ItemCreatorTools {
    private foundryClient: FoundryClient;
    private logger: Logger;

    constructor({ foundryClient, logger }: ItemCreatorToolsOptions) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'ItemCreatorTools' });
    }

    getToolDefinitions() {
        return [
            {
                name: 'create-weapon',
                description: `Create a WFRP 4e weapon with full specifications.

**Weapon Creation System:**
Weapons have extensive properties including damage, reach, weapon group, and special qualities/flaws.

**Weapon Types & Groups:**
- **Melee Groups**: basic, cavalry, fencing, brawling, flail, parry, polearm, twohanded
- **Ranged Groups**: blackpowder, bow, crossbow, entangling, engineering, explosives, sling, throwing

**Weapon Reach** (Melee only):
- personal: Unarmed strikes
- vshort: Very Short (knuckledusters)
- short: Short (daggers)
- average: Average (swords, hand weapons)
- long: Long (spears)
- vLong: Very Long (pikes)
- massive: Massive (lances)

**Weapon Qualities** (add benefits):
- accurate: Easier to hit
- blast: Area damage
- damaging: Extra damage
- defensive: Aids parrying  
- fast: +10 to Initiative
- hack: Ignore 1 AP
- impact: Knockback on hit
- impale: Extra damage on 9-10 roll
- penetrating: Ignore armor
- precise: Target specific locations
- shield: Can be used to block
- And more...

**Weapon Flaws** (add penalties):
- dangerous: Can hurt wielder
- imprecise: Harder to hit
- reload: Takes actions to reload
- slow: Initiative penalty
- tiring: Causes fatigue
- undamaging: Reduced damage

**Damage Format**: SB+4 means Strength Bonus + 4
Use format like "SB+4", "7", "SB+0"

**Example**: Create a longsword - "basic" group, "average" reach, "SB+4" damage, qualities: ["damaging", "hack"]`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character to give weapon to (or omit to create without adding to character)',
                        },
                        weaponName: {
                            type: 'string',
                            description: 'Name of the weapon (e.g., "Longsword", "Crossbow", "Greatsword")',
                        },
                        weaponGroup: {
                            type: 'string',
                            enum: ['basic', 'cavalry', 'fencing', 'brawling', 'flail', 'parry', 'polearm', 'twohanded', 'blackpowder', 'bow', 'crossbow', 'entangling', 'engineering', 'explosives', 'sling', 'throwing'],
                            description: 'Weapon group determining what skill is used',
                        },
                        damage: {
                            type: 'string',
                            description: 'Weapon damage (e.g., "SB+4", "7", "SB", "10")',
                        },
                        reach: {
                            type: 'string',
                            enum: ['personal', 'vshort', 'short', 'average', 'long', 'vLong', 'massive'],
                            description: 'Weapon reach (melee only, use "average" as default for ranged)',
                        },
                        range: {
                            type: 'number',
                            description: 'Maximum range in yards (ranged weapons only, e.g., 30 for bow)',
                        },
                        encumbrance: {
                            type: 'number',
                            description: 'Encumbrance value (0-5, typically 0=light, 1=average, 2-3=heavy)',
                            default: 1,
                        },
                        qualities: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        enum: ['accurate', 'blackpowder', 'blast', 'damaging', 'defensive', 'distract', 'entangle', 'fast', 'hack', 'impact', 'impale', 'magical', 'penetrating', 'pistol', 'precise', 'pummel', 'repeater', 'shield', 'trapblade', 'unbreakable', 'wrap'],
                                        description: 'Quality name',
                                    },
                                    value: {
                                        type: 'number',
                                        description: 'Quality value (if applicable, e.g., blast radius, shield AP)',
                                    },
                                },
                                required: ['name'],
                            },
                            description: 'Array of weapon qualities',
                            default: [],
                        },
                        flaws: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        enum: ['dangerous', 'imprecise', 'reload', 'slow', 'tiring', 'undamaging'],
                                        description: 'Flaw name',
                                    },
                                    value: {
                                        type: 'number',
                                        description: 'Flaw value (if applicable, e.g., reload time)',
                                    },
                                },
                                required: ['name'],
                            },
                            description: 'Array of weapon flaws',
                            default: [],
                        },
                        description: {
                            type: 'string',
                            description: 'Weapon description',
                            default: '',
                        },
                    },
                    required: ['weaponName', 'weaponGroup', 'damage', 'reach'],
                },
            },
            {
                name: 'create-armour',
                description: `Create WFRP 4e armour with armor points and location coverage.

**Armour System:**
Armour provides Armor Points (AP) that reduce damage. Each location can be separately armored.

**Armor Types:**
- softLeather: Soft leather (flexible, cheap)
- boiledLeather: Boiled leather (sturdier)
- mail: Mail/chain (good protection, noisy)
- plate: Plate armor (best protection, expensive)
- other: Other materials
- otherMetal: Other metal materials

**Armor Locations:**
- head: Helmets, coifs
- body: Breastplates, mail shirts
- lArm/rArm: Arm armor (bracers, vambraces)
- lLeg/rLeg: Leg armor (greaves, chausses)

**Armor Points (AP):**
- 0 AP: No protection
- 1 AP: Light leather, cloth
- 2 AP: Boiled leather, light mail
- 3-4 AP: Mail coat, brigandine
- 5+ AP: Plate armor

**Armor Qualities:**
- flexible: Doesn't hinder movement
- impenetrable: Extremely hard to penetrate
- magical: Enchanted protection

**Armor Flaws:**
- partial: Only covers part of location
- weakpoints: Vulnerable spots

**Examples:**
- Mail Coat: body, 3 AP, mail type
- Plate Helm: head, 5 AP, plate type
- Leather Jack: body + arms, 1 AP, softLeather type`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character to give armor to (or omit to create standalone)',
                        },
                        armourName: {
                            type: 'string',
                            description: 'Name of the armor piece (e.g., "Mail Coat", "Plate Helm")',
                        },
                        armourType: {
                            type: 'string',
                            enum: ['softLeather', 'boiledLeather', 'mail', 'plate', 'other', 'otherMetal'],
                            description: 'Type of armor material',
                        },
                        locations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    location: {
                                        type: 'string',
                                        enum: ['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg'],
                                        description: 'Hit location covered',
                                    },
                                    value: {
                                        type: 'number',
                                        description: 'Armor Points at this location',
                                    },
                                },
                                required: ['location', 'value'],
                            },
                            description: 'Array of locations and their AP values',
                        },
                        encumbrance: {
                            type: 'number',
                            description: 'Encumbrance value (0-5, typically 1=light, 2-3=medium, 4-5=heavy)',
                            default: 1,
                        },
                        qualities: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['flexible', 'impenetrable', 'magical'],
                            },
                            description: 'Array of armor qualities',
                            default: [],
                        },
                        flaws: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['partial', 'weakpoints'],
                            },
                            description: 'Array of armor flaws',
                            default: [],
                        },
                        description: {
                            type: 'string',
                            description: 'Armor description',
                            default: '',
                        },
                    },
                    required: ['armourName', 'armourType', 'locations'],
                },
            },
            {
                name: 'create-trapping',
                description: `Create WFRP 4e general equipment/trapping.

**Trapping Categories:**
- clothingAccessories: Clothing and accessories (cloaks, hats, jewelry)
- foodAndDrink: Food and beverages (rations, ale, wine)
- toolsAndKits: Tools and toolkits (lockpicks, healing kit)
- booksAndDocuments: Books and papers (grimoires, maps, letters)
- tradeTools: Trade tools and workshops (anvil, loom)
- drugsPoisonsHerbsDraughts: Drugs, poisons, and potions (healing draught, antidote)
- ingredient: Spell/alchemy ingredients
- misc: Miscellaneous items (rope, torches, tent)

**Common Examples:**
- Rope (50 yards): misc, Enc 1
- Healing Potion: drugsPoisonsHerbsDraughts, Enc 0
- Lockpicks: toolsAndKits, Enc 0
- Rations (1 day): foodAndDrink, Enc 0
- Torch: misc, Enc 0
- Backpack: Container (use create-container instead)

**Encumbrance Guidelines:**
- Enc 0: Negligible (coins, small items)
- Enc 0.1-0.5: Very light (potions, letters)
- Enc 1: Light (rope, torch, small tools)
- Enc 2-3: Medium (tent, large tools)
- Enc 4-5: Heavy (anvil, barrel)

**Item Qualities/Flaws** apply to trappings too:
- durable: Lasts longer
- fine: High quality, valuable
- lightweight: Reduced encumbrance
- practical: Bonus to relevant tests
- ugly/shoddy: Reduced value
- bulky: Increased encumbrance
- unreliable: May fail`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character to give item to (or omit to create standalone)',
                        },
                        trappingName: {
                            type: 'string',
                            description: 'Name of the trapping/equipment',
                        },
                        trappingType: {
                            type: 'string',
                            enum: ['clothingAccessories', 'foodAndDrink', 'toolsAndKits', 'booksAndDocuments', 'tradeTools', 'drugsPoisonsHerbsDraughts', 'ingredient', 'misc'],
                            description: 'Category of trapping',
                        },
                        encumbrance: {
                            type: 'number',
                            description: 'Encumbrance value',
                            default: 1,
                        },
                        quantity: {
                            type: 'number',
                            description: 'Quantity of items (stacks)',
                            default: 1,
                        },
                        qualities: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['durable', 'fine', 'lightweight', 'practical'],
                            },
                            description: 'Item qualities',
                            default: [],
                        },
                        flaws: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['ugly', 'shoddy', 'unreliable', 'bulky'],
                            },
                            description: 'Item flaws',
                            default: [],
                        },
                        description: {
                            type: 'string',
                            description: 'Item description and effects',
                            default: '',
                        },
                    },
                    required: ['trappingName', 'trappingType'],
                },
            },
            {
                name: 'create-ammunition',
                description: `Create WFRP 4e ammunition for ranged weapons.

**Ammunition Types:**
- bow: Arrows for bows
- crossbow: Bolts for crossbows
- sling: Stones and bullets for slings
- blackpowder: Powder and shot for firearms (BPandEng)
- throwing: Throwing weapons (daggers, axes)
- entangling: Net ammunition

**Ammunition Quantity:**
Ammo is tracked by quantity. Common amounts:
- Arrows/Bolts: 10-20 per quiver
- Sling bullets: 20-30
- Blackpowder shots: 10 shots
- Throwing weapons: Individual count

**Example**: 
- "Arrows" (bow type, 20 quantity)
- "Crossbow Bolts" (crossbow type, 12 quantity)
- "Pistol Shot and Powder" (BPandEng type, 10 quantity)`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character to give ammo to',
                        },
                        ammunitionName: {
                            type: 'string',
                            description: 'Name of ammunition (e.g., "Arrows", "Crossbow Bolts")',
                        },
                        ammunitionGroup: {
                            type: 'string',
                            enum: ['bow', 'crossbow', 'sling', 'BPandEng', 'throwing', 'entangling'],
                            description: 'Type of ammunition',
                        },
                        quantity: {
                            type: 'number',
                            description: 'Number of rounds/shots',
                            default: 10,
                        },
                        encumbrance: {
                            type: 'number',
                            description: 'Encumbrance per unit or per group',
                            default: 0.1,
                        },
                        description: {
                            type: 'string',
                            description: 'Ammunition description',
                            default: '',
                        },
                    },
                    required: ['characterName', 'ammunitionName', 'ammunitionGroup'],
                },
            },
            {
                name: 'create-container',
                description: `Create WFRP 4e container for storing items.

**Container Types:**
- Backpack: Standard adventurer's pack, holds ~30 Enc
- Sack/Bag: Small carry bag, holds ~10 Enc
- Chest: Large storage, holds ~50+ Enc
- Pouch: Belt pouch for coins/small items, holds ~2 Enc

**Container Mechanics:**
- Items in containers reduce carried encumbrance
- Container's own encumbrance is counted when worn
- Accessing items in containers may take extra time
- Some containers can be secured with locks

**Encumbrance Reduction:**
Worn containers reduce item weight through better distribution:
- Backpack: Items count as 1/10 encumbrance (90% reduction)
- Most others: No reduction unless specially designed`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character to give container to',
                        },
                        containerName: {
                            type: 'string',
                            description: 'Name of container (e.g., "Backpack", "Sack", "Chest")',
                        },
                        capacity: {
                            type: 'number',
                            description: 'Maximum encumbrance the container can hold',
                        },
                        encumbrance: {
                            type: 'number',
                            description: 'Encumbrance of the empty container itself',
                            default: 1,
                        },
                        description: {
                            type: 'string',
                            description: 'Container description',
                            default: '',
                        },
                    },
                    required: ['characterName', 'containerName', 'capacity'],
                },
            },
            {
                name: 'modify-item-qualities',
                description: `Add or remove qualities and flaws from existing items.

**Use Cases:**
- Add magical property to found weapon
- Apply damage/wear (shoddy flaw)
- Enhance item with qualities
- Remove flaws through repair/enchantment

**Quality/Flaw Types by Item:**
- **All Items**: durable, fine, lightweight, practical (qualities); ugly, shoddy, unreliable, bulky (flaws)
- **Weapons Only**: accurate, blast, damaging, defensive, fast, hack, impale, penetrating, etc.
- **Armor Only**: flexible, impenetrable (qualities); partial, weakpoints (flaws)

**Examples:**
- Add "magical" quality to Sword +1
- Remove "shoddy" flaw after repair
- Add "blast(3)" to explosive weapon`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character who has the item',
                        },
                        itemName: {
                            type: 'string',
                            description: 'Name of the item to modify',
                        },
                        addQualities: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'Quality name',
                                    },
                                    value: {
                                        type: 'number',
                                        description: 'Quality value (if applicable)',
                                    },
                                },
                                required: ['name'],
                            },
                            description: 'Qualities to add',
                            default: [],
                        },
                        removeQualities: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Quality names to remove',
                            default: [],
                        },
                        addFlaws: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'Flaw name',
                                    },
                                    value: {
                                        type: 'number',
                                        description: 'Flaw value (if applicable)',
                                    },
                                },
                                required: ['name'],
                            },
                            description: 'Flaws to add',
                            default: [],
                        },
                        removeFlaws: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Flaw names to remove',
                            default: [],
                        },
                    },
                    required: ['characterName', 'itemName'],
                },
            },
            {
                name: 'add-item-to-character',
                description: `Add an existing item from compendium to a character.

**Common Items to Add:**
- Weapons from compendium (Hand Weapon, Sword, Bow)
- Armor pieces (Mail Coat, Plate Helm)
- Standard equipment (Rope, Torch, Backpack)
- Trade tools and kits

**Search Process:**
The system searches the WFRP4e compendiums for matching items by name.

**Tips:**
- Use exact names when possible ("Hand Weapon" not "hand weapon")
- For specialized items, use create-weapon/create-armour instead
- Common items are faster to add this way than creating custom`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character to receive item',
                        },
                        itemName: {
                            type: 'string',
                            description: 'Name of item to search for in compendiums',
                        },
                        quantity: {
                            type: 'number',
                            description: 'Number of items to add (for stackable items)',
                            default: 1,
                        },
                        equip: {
                            type: 'boolean',
                            description: 'Whether to equip/wear the item immediately',
                            default: false,
                        },
                    },
                    required: ['characterName', 'itemName'],
                },
            },
            {
                name: 'remove-item-from-character',
                description: `Remove an item from a character's inventory.

**Removal Types:**
- Drop: Remove from inventory (lost/sold/dropped)
- Partial: Reduce quantity for stackable items
- Complete: Delete item entirely

**Examples:**
- Remove "Rope" completely
- Reduce "Arrows" by 5 (partial)
- Drop "Rusty Sword"`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        characterName: {
                            type: 'string',
                            description: 'Name of character',
                        },
                        itemName: {
                            type: 'string',
                            description: 'Name of item to remove',
                        },
                        quantity: {
                            type: 'number',
                            description: 'Quantity to remove (for stackable items, omit to remove all)',
                        },
                    },
                    required: ['characterName', 'itemName'],
                },
            },
        ];
    }

    // Implementation methods continue...
    async handleCreateWeapon(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().optional(),
            weaponName: z.string().min(1),
            weaponGroup: z.enum(['basic', 'cavalry', 'fencing', 'brawling', 'flail', 'parry', 'polearm', 'twohanded', 'blackpowder', 'bow', 'crossbow', 'entangling', 'engineering', 'explosives', 'sling', 'throwing']),
            damage: z.string(),
            reach: z.enum(['personal', 'vshort', 'short', 'average', 'long', 'vLong', 'massive']),
            range: z.number().optional(),
            encumbrance: z.number().default(1),
            qualities: z.array(z.object({
                name: z.string(),
                value: z.number().optional(),
            })).default([]),
            flaws: z.array(z.object({
                name: z.string(),
                value: z.number().optional(),
            })).default([]),
            description: z.string().default(''),
        });

        const parsed = schema.parse(args);

        this.logger.info('Creating weapon', { weaponName: parsed.weaponName });

        try {
            // Determine weapon type (melee or ranged) from group
            const meleeGroups = ['basic', 'cavalry', 'fencing', 'brawling', 'flail', 'parry', 'polearm', 'twohanded'];
            const weaponType = meleeGroups.includes(parsed.weaponGroup) ? 'melee' : 'ranged';

            // Build weapon data structure
            const weaponData: any = {
                name: parsed.weaponName,
                type: 'weapon',
                system: {
                    damage: { value: parsed.damage },
                    reach: { value: parsed.reach },
                    weaponGroup: { value: parsed.weaponGroup },
                    range: { value: parsed.range || 0 },
                    equipped: { value: false },
                    encumbrance: { value: parsed.encumbrance },
                    properties: {
                        qualities: {},
                        flaws: {},
                    },
                    description: { value: parsed.description },
                },
            };

            // Add qualities
            for (const quality of parsed.qualities) {
                weaponData.system.properties.qualities[quality.name] = quality.value || true;
            }

            // Add flaws
            for (const flaw of parsed.flaws) {
                weaponData.system.properties.flaws[flaw.name] = flaw.value || true;
            }

            // If character specified, add to character
            if (parsed.characterName) {
                const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                    characterName: parsed.characterName,
                });

                if (!character) {
                    throw new Error(`Character "${parsed.characterName}" not found`);
                }

                await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                    actorId: character.id,
                    itemData: weaponData,
                });

                return this.formatWeaponCreationResponse(parsed, weaponType, `Added to ${character.name}'s inventory`);
            }

            // Otherwise return the item data for manual use
            return this.formatWeaponCreationResponse(parsed, weaponType, 'Weapon created (not added to character)');
        } catch (error) {
            this.logger.error('Failed to create weapon', error);
            throw new Error(`Failed to create weapon: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private formatWeaponCreationResponse(weapon: any, weaponType: string, statusMessage: string): string {
        let response = `# ⚔️ Weapon Created: ${weapon.weaponName}\n\n`;
        response += `**Status**: ${statusMessage}\n\n`;
        response += `## Weapon Stats\n`;
        response += `- **Type**: ${weaponType === 'melee' ? 'Melee' : 'Ranged'}\n`;
        response += `- **Group**: ${weapon.weaponGroup}\n`;
        response += `- **Damage**: ${weapon.damage}\n`;
        response += `- **Reach**: ${weapon.reach}${weaponType === 'ranged' && weapon.range ? ` (Range: ${weapon.range} yards)` : ''}\n`;
        response += `- **Encumbrance**: ${weapon.encumbrance}\n\n`;

        if (weapon.qualities && weapon.qualities.length > 0) {
            response += `## ✨ Qualities\n`;
            for (const quality of weapon.qualities) {
                response += `- **${quality.name}**${quality.value ? ` (${quality.value})` : ''}\n`;
            }
            response += `\n`;
        }

        if (weapon.flaws && weapon.flaws.length > 0) {
            response += `## ⚠️ Flaws\n`;
            for (const flaw of weapon.flaws) {
                response += `- **${flaw.name}**${flaw.value ? ` (${flaw.value})` : ''}\n`;
            }
            response += `\n`;
        }

        if (weapon.description) {
            response += `## 📖 Description\n${weapon.description}\n\n`;
        }

        return response;
    }

    async handleCreateArmour(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().optional(),
            armourName: z.string().min(1),
            armourType: z.enum(['softLeather', 'boiledLeather', 'mail', 'plate', 'other', 'otherMetal']),
            locations: z.array(z.object({
                location: z.enum(['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg']),
                value: z.number(),
            })),
            encumbrance: z.number().default(1),
            qualities: z.array(z.string()).default([]),
            flaws: z.array(z.string()).default([]),
            description: z.string().default(''),
        });

        const parsed = schema.parse(args);

        this.logger.info('Creating armour', { armourName: parsed.armourName });

        try {
            // Build armor data structure
            const armourData: any = {
                name: parsed.armourName,
                type: 'armour',
                system: {
                    armorType: { value: parsed.armourType },
                    encumbrance: { value: parsed.encumbrance },
                    properties: {
                        qualities: {},
                        flaws: {},
                    },
                    APDetails: {
                        head: { value: 0 },
                        body: { value: 0 },
                        lArm: { value: 0 },
                        rArm: { value: 0 },
                        lLeg: { value: 0 },
                        rLeg: { value: 0 },
                    },
                    worn: { value: false },
                    description: { value: parsed.description },
                },
            };

            // Set AP for each location
            for (const loc of parsed.locations) {
                armourData.system.APDetails[loc.location].value = loc.value;
            }

            // Add qualities
            for (const quality of parsed.qualities) {
                armourData.system.properties.qualities[quality] = true;
            }

            // Add flaws
            for (const flaw of parsed.flaws) {
                armourData.system.properties.flaws[flaw] = true;
            }

            // If character specified, add to character
            if (parsed.characterName) {
                const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                    characterName: parsed.characterName,
                });

                if (!character) {
                    throw new Error(`Character "${parsed.characterName}" not found`);
                }

                await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                    actorId: character.id,
                    itemData: armourData,
                });

                return this.formatArmourCreationResponse(parsed, `Added to ${character.name}'s inventory`);
            }

            return this.formatArmourCreationResponse(parsed, 'Armour created (not added to character)');
        } catch (error) {
            this.logger.error('Failed to create armour', error);
            throw new Error(`Failed to create armour: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private formatArmourCreationResponse(armour: any, statusMessage: string): string {
        let response = `# 🛡️ Armour Created: ${armour.armourName}\n\n`;
        response += `**Status**: ${statusMessage}\n\n`;
        response += `## Armour Stats\n`;
        response += `- **Type**: ${armour.armourType}\n`;
        response += `- **Encumbrance**: ${armour.encumbrance}\n\n`;
        response += `## 📍 Armor Points by Location\n`;
        for (const loc of armour.locations) {
            response += `- **${loc.location}**: ${loc.value} AP\n`;
        }
        response += `\n`;

        if (armour.qualities && armour.qualities.length > 0) {
            response += `## ✨ Qualities\n`;
            for (const quality of armour.qualities) {
                response += `- ${quality}\n`;
            }
            response += `\n`;
        }

        if (armour.flaws && armour.flaws.length > 0) {
            response += `## ⚠️ Flaws\n`;
            for (const flaw of armour.flaws) {
                response += `- ${flaw}\n`;
            }
            response += `\n`;
        }

        if (armour.description) {
            response += `## 📖 Description\n${armour.description}\n\n`;
        }

        return response;
    }

    async handleCreateTrapping(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string().optional(),
            trappingName: z.string().min(1),
            trappingType: z.enum(['clothingAccessories', 'foodAndDrink', 'toolsAndKits', 'booksAndDocuments', 'tradeTools', 'drugsPoisonsHerbsDraughts', 'ingredient', 'misc']),
            encumbrance: z.number().default(1),
            quantity: z.number().default(1),
            qualities: z.array(z.string()).default([]),
            flaws: z.array(z.string()).default([]),
            description: z.string().default(''),
        });

        const parsed = schema.parse(args);

        this.logger.info('Creating trapping', { trappingName: parsed.trappingName });

        try {
            const trappingData: any = {
                name: parsed.trappingName,
                type: 'trapping',
                system: {
                    trappingType: { value: parsed.trappingType },
                    encumbrance: { value: parsed.encumbrance },
                    quantity: { value: parsed.quantity },
                    properties: {
                        qualities: {},
                        flaws: {},
                    },
                    description: { value: parsed.description },
                },
            };

            // Add qualities
            for (const quality of parsed.qualities) {
                trappingData.system.properties.qualities[quality] = true;
            }

            // Add flaws
            for (const flaw of parsed.flaws) {
                trappingData.system.properties.flaws[flaw] = true;
            }

            if (parsed.characterName) {
                const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                    characterName: parsed.characterName,
                });

                if (!character) {
                    throw new Error(`Character "${parsed.characterName}" not found`);
                }

                await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                    actorId: character.id,
                    itemData: trappingData,
                });

                return this.formatTrappingCreationResponse(parsed, `Added to ${character.name}'s inventory`);
            }

            return this.formatTrappingCreationResponse(parsed, 'Trapping created (not added to character)');
        } catch (error) {
            this.logger.error('Failed to create trapping', error);
            throw new Error(`Failed to create trapping: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private formatTrappingCreationResponse(trapping: any, statusMessage: string): string {
        let response = `# 🎒 Trapping Created: ${trapping.trappingName}\n\n`;
        response += `**Status**: ${statusMessage}\n\n`;
        response += `## Item Details\n`;
        response += `- **Category**: ${trapping.trappingType}\n`;
        response += `- **Quantity**: ${trapping.quantity}\n`;
        response += `- **Encumbrance**: ${trapping.encumbrance} per item\n\n`;

        if (trapping.qualities && trapping.qualities.length > 0) {
            response += `## ✨ Qualities\n`;
            for (const quality of trapping.qualities) {
                response += `- ${quality}\n`;
            }
            response += `\n`;
        }

        if (trapping.flaws && trapping.flaws.length > 0) {
            response += `## ⚠️ Flaws\n`;
            for (const flaw of trapping.flaws) {
                response += `- ${flaw}\n`;
            }
            response += `\n`;
        }

        if (trapping.description) {
            response += `## 📖 Description\n${trapping.description}\n\n`;
        }

        return response;
    }

    async handleCreateAmmunition(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string(),
            ammunitionName: z.string().min(1),
            ammunitionGroup: z.enum(['bow', 'crossbow', 'sling', 'BPandEng', 'throwing', 'entangling']),
            quantity: z.number().default(10),
            encumbrance: z.number().default(0.1),
            description: z.string().default(''),
        });

        const parsed = schema.parse(args);

        this.logger.info('Creating ammunition', { ammunitionName: parsed.ammunitionName });

        try {
            const ammunitionData: any = {
                name: parsed.ammunitionName,
                type: 'ammunition',
                system: {
                    ammunitionType: { value: parsed.ammunitionGroup },
                    quantity: { value: parsed.quantity },
                    encumbrance: { value: parsed.encumbrance },
                    description: { value: parsed.description },
                },
            };

            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: parsed.characterName,
            });

            if (!character) {
                throw new Error(`Character "${parsed.characterName}" not found`);
            }

            await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                actorId: character.id,
                itemData: ammunitionData,
            });

            return `# 🏹 Ammunition Created: ${parsed.ammunitionName}\n\n` +
                `Added ${parsed.quantity} ${parsed.ammunitionName} to ${character.name}'s inventory.\n\n` +
                `- **Type**: ${parsed.ammunitionGroup}\n` +
                `- **Quantity**: ${parsed.quantity}\n` +
                `- **Encumbrance**: ${parsed.encumbrance}\n`;
        } catch (error) {
            this.logger.error('Failed to create ammunition', error);
            throw new Error(`Failed to create ammunition: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleCreateContainer(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string(),
            containerName: z.string().min(1),
            capacity: z.number(),
            encumbrance: z.number().default(1),
            description: z.string().default(''),
        });

        const parsed = schema.parse(args);

        this.logger.info('Creating container', { containerName: parsed.containerName });

        try {
            const containerData: any = {
                name: parsed.containerName,
                type: 'container',
                system: {
                    capacity: { value: parsed.capacity },
                    encumbrance: { value: parsed.encumbrance },
                    description: { value: parsed.description },
                },
            };

            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: parsed.characterName,
            });

            if (!character) {
                throw new Error(`Character "${parsed.characterName}" not found`);
            }

            await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                actorId: character.id,
                itemData: containerData,
            });

            return `# 📦 Container Created: ${parsed.containerName}\n\n` +
                `Added to ${character.name}'s inventory.\n\n` +
                `- **Capacity**: ${parsed.capacity} Enc\n` +
                `- **Weight**: ${parsed.encumbrance} Enc\n` +
                `${parsed.description ? `\n**Description**: ${parsed.description}\n` : ''}`;
        } catch (error) {
            this.logger.error('Failed to create container', error);
            throw new Error(`Failed to create container: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleModifyItemQualities(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string(),
            itemName: z.string().min(1),
            addQualities: z.array(z.object({
                name: z.string(),
                value: z.number().optional(),
            })).default([]),
            removeQualities: z.array(z.string()).default([]),
            addFlaws: z.array(z.object({
                name: z.string(),
                value: z.number().optional(),
            })).default([]),
            removeFlaws: z.array(z.string()).default([]),
        });

        const parsed = schema.parse(args);

        this.logger.info('Modifying item qualities', { itemName: parsed.itemName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: parsed.characterName,
            });

            if (!character) {
                throw new Error(`Character "${parsed.characterName}" not found`);
            }

            // Find the item
            const item = character.items?.find((i: any) =>
                i.name.toLowerCase() === parsed.itemName.toLowerCase()
            );

            if (!item) {
                throw new Error(`Item "${parsed.itemName}" not found on ${character.name}`);
            }

            // Build update data
            const updateData: any = {
                'system.properties.qualities': { ...(item.system?.properties?.qualities || {}) },
                'system.properties.flaws': { ...(item.system?.properties?.flaws || {}) },
            };

            // Add qualities
            for (const quality of parsed.addQualities) {
                updateData['system.properties.qualities'][quality.name] = quality.value || true;
            }

            // Remove qualities
            for (const quality of parsed.removeQualities) {
                delete updateData['system.properties.qualities'][quality];
            }

            // Add flaws
            for (const flaw of parsed.addFlaws) {
                updateData['system.properties.flaws'][flaw.name] = flaw.value || true;
            }

            // Remove flaws
            for (const flaw of parsed.removeFlaws) {
                delete updateData['system.properties.flaws'][flaw];
            }

            await this.foundryClient.query('foundry-mcp-bridge.updateItem', {
                actorId: character.id,
                itemId: item.id,
                updateData: updateData,
            });

            let response = `# ✨ Item Modified: ${item.name}\n\n`;

            if (parsed.addQualities.length > 0) {
                response += `## Added Qualities\n`;
                for (const q of parsed.addQualities) {
                    response += `- ${q.name}${q.value ? ` (${q.value})` : ''}\n`;
                }
                response += `\n`;
            }

            if (parsed.removeQualities.length > 0) {
                response += `## Removed Qualities\n`;
                for (const q of parsed.removeQualities) {
                    response += `- ${q}\n`;
                }
                response += `\n`;
            }

            if (parsed.addFlaws.length > 0) {
                response += `## Added Flaws\n`;
                for (const f of parsed.addFlaws) {
                    response += `- ${f.name}${f.value ? ` (${f.value})` : ''}\n`;
                }
                response += `\n`;
            }

            if (parsed.removeFlaws.length > 0) {
                response += `## Removed Flaws\n`;
                for (const f of parsed.removeFlaws) {
                    response += `- ${f}\n`;
                }
                response += `\n`;
            }

            return response;
        } catch (error) {
            this.logger.error('Failed to modify item qualities', error);
            throw new Error(`Failed to modify item qualities: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleAddItemToCharacter(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string(),
            itemName: z.string().min(1),
            quantity: z.number().default(1),
            equip: z.boolean().default(false),
        });

        const parsed = schema.parse(args);

        this.logger.info('Adding item to character', { itemName: parsed.itemName, characterName: parsed.characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: parsed.characterName,
            });

            if (!character) {
                throw new Error(`Character "${parsed.characterName}" not found`);
            }

            // Search compendium for the item
            const searchResult = await this.foundryClient.query('foundry-mcp-bridge.searchCompendium', {
                query: parsed.itemName,
                type: 'Item',
            });

            if (!searchResult || searchResult.length === 0) {
                throw new Error(`Item "${parsed.itemName}" not found in compendiums`);
            }

            // Get the first matching item
            const compendiumItem = searchResult[0];

            // Create the item on the character
            const itemData = {
                ...compendiumItem,
                'system.quantity.value': parsed.quantity,
            };

            if (parsed.equip && (compendiumItem.type === 'weapon' || compendiumItem.type === 'armour')) {
                itemData['system.equipped.value'] = true;
            }

            await this.foundryClient.query('foundry-mcp-bridge.createItem', {
                actorId: character.id,
                itemData: itemData,
            });

            return `# ➕ Item Added: ${compendiumItem.name}\n\n` +
                `Added ${parsed.quantity > 1 ? `${parsed.quantity}x ` : ''}${compendiumItem.name} to ${character.name}'s inventory.\n\n` +
                `- **Type**: ${compendiumItem.type}\n` +
                `${parsed.equip ? '- **Equipped**: Yes\n' : ''}`;
        } catch (error) {
            this.logger.error('Failed to add item to character', error);
            throw new Error(`Failed to add item to character: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async handleRemoveItemFromCharacter(args: any): Promise<any> {
        const schema = z.object({
            characterName: z.string(),
            itemName: z.string().min(1),
            quantity: z.number().optional(),
        });

        const parsed = schema.parse(args);

        this.logger.info('Removing item from character', { itemName: parsed.itemName, characterName: parsed.characterName });

        try {
            const character = await this.foundryClient.query('foundry-mcp-bridge.getCharacterInfo', {
                characterName: parsed.characterName,
            });

            if (!character) {
                throw new Error(`Character "${parsed.characterName}" not found`);
            }

            // Find the item
            const item = character.items?.find((i: any) =>
                i.name.toLowerCase() === parsed.itemName.toLowerCase()
            );

            if (!item) {
                throw new Error(`Item "${parsed.itemName}" not found on ${character.name}`);
            }

            // Check if item has quantity (stackable)
            const currentQuantity = item.system?.quantity?.value || 1;

            if (parsed.quantity && parsed.quantity < currentQuantity) {
                // Reduce quantity
                const newQuantity = currentQuantity - parsed.quantity;
                await this.foundryClient.query('foundry-mcp-bridge.updateItem', {
                    actorId: character.id,
                    itemId: item.id,
                    updateData: {
                        'system.quantity.value': newQuantity,
                    },
                });

                return `# ➖ Item Quantity Reduced: ${item.name}\n\n` +
                    `Removed ${parsed.quantity} from ${character.name}'s inventory.\n\n` +
                    `- **Remaining**: ${newQuantity}\n`;
            } else {
                // Delete item completely
                await this.foundryClient.query('foundry-mcp-bridge.deleteItem', {
                    actorId: character.id,
                    itemId: item.id,
                });

                return `# ➖ Item Removed: ${item.name}\n\n` +
                    `Removed ${item.name} from ${character.name}'s inventory.\n`;
            }
        } catch (error) {
            this.logger.error('Failed to remove item from character', error);
            throw new Error(`Failed to remove item from character: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
