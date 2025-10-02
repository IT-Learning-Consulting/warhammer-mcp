import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class InventoryManagementTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "get-inventory-status",
                description: `Get detailed inventory status for a WFRP 4e character including encumbrance and ammunition.

WFRP Encumbrance System:
- Maximum Encumbrance = Strength + Toughness Bonus
- Each point of Encumbrance allows carrying items up to certain weight
- Being Over Encumbered applies penalties to movement and physical tests
- Encumbrance Levels:
  * Normal: Below max encumbrance (no penalties)
  * Encumbered: At max encumbrance (-10 to Agility)
  * Over Encumbered: Above max encumbrance (-20 to Agility, Movement halved)

Weight Categories:
- Enc 0: Very light items (coins, ammunition)
- Enc 1: Light items (dagger, potion)
- Enc 2: Medium items (sword, shield)
- Enc 3+: Heavy items (armor, two-handed weapons)

Ammunition Tracking:
- Track individual ammunition types (arrows, bolts, bullets, stones)
- Ammunition consumed during ranged attacks
- Running low warnings when ammunition < 5
- Out of ammunition prevents ranged attacks

Returns comprehensive inventory overview with:
- Current encumbrance vs maximum capacity
- Weight breakdown by item category
- Ammunition status for all ranged weapons
- Carrying capacity warnings
- Movement penalties if over encumbered`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check inventory for",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "track-ammunition",
                description: `Track ammunition usage for a WFRP 4e character's ranged weapon.

WFRP Ammunition System:
- Each ranged weapon uses specific ammunition type:
  * Bow → Arrows
  * Crossbow → Bolts
  * Sling → Stones/Bullets
  * Firearm → Bullets
- Standard quiver/pouch holds 10-20 rounds
- Ammunition must be tracked per type
- Running out requires reloading or finding more
- Some weapons have limited ammunition (e.g., pistol with 1 shot)

Usage Tracking:
- Deduct ammunition when ranged attacks are made
- Track remaining count per ammunition type
- Warn when running low (< 5 rounds)
- Alert when completely out (cannot attack)

Ammunition Management:
- Add ammunition when purchasing/finding
- Track multiple ammunition types simultaneously
- Consider ammunition weight for encumbrance
- Special ammunition (silvered, magical) tracked separately`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character using ammunition",
                        },
                        ammunitionType: {
                            type: "string",
                            description: "Type of ammunition (e.g., 'Arrows', 'Bolts', 'Bullets', 'Stones')",
                        },
                        amount: {
                            type: "number",
                            description: "Amount to add (positive) or subtract (negative). Use negative for shots fired.",
                        },
                    },
                    required: ["characterName", "ammunitionType", "amount"],
                },
            },
            {
                name: "check-encumbrance",
                description: `Calculate encumbrance and check if character is over carrying capacity in WFRP 4e.

WFRP Encumbrance Calculation:
- Maximum Encumbrance = Strength Bonus + Toughness Bonus
- Current Encumbrance = Sum of all carried item weights (Enc value)
- Encumbrance Levels:
  * Normal: Current < Maximum (no penalties)
  * At Limit: Current = Maximum (-10 to Agility tests)
  * Over Encumbered: Current > Maximum (-20 to Agility, Movement halved, cannot run)

Item Weight Rules:
- Worn armor: Enc value applies
- Weapons: Each has Enc rating (0-3+)
- Containers: Weight of container + contents
- Currency: 100 coins = 1 Enc
- Small items: Often Enc 0 (negligible weight)

Penalties for Being Over Encumbered:
- -20 to Agility-based tests
- Movement speed halved
- Cannot take Run action
- Fatigued condition may apply
- Strength tests to carry very heavy loads

Solutions:
- Drop items (fastest)
- Store items on mount/vehicle
- Use pack animals (mule, horse)
- Find containers to organize weight
- Distribute items among party members`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check encumbrance for",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "add-inventory-item",
                description: `Add an item to a WFRP 4e character's inventory with proper weight tracking.

When adding items:
- Specify item name and type (weapon, armor, container, trapping, ammunition)
- Include encumbrance (weight) value
- Automatically updates total encumbrance
- Checks if adding item would exceed carrying capacity
- Warns if character becomes over encumbered

Item Types:
- Weapon: Combat items (swords, bows, etc.)
- Armor: Protective gear (helmets, breastplates, etc.)
- Ammunition: Projectiles (arrows, bolts, bullets)
- Container: Bags, backpacks, pouches
- Trapping: General equipment (rope, torches, rations)
- Money: Currency (brass pennies, silver shillings, gold crowns)

Encumbrance Tracking:
- Small items: Enc 0
- Light items: Enc 1
- Medium items: Enc 2
- Heavy items: Enc 3+
- Worn armor counts toward encumbrance

Common Item Weights:
- Dagger: Enc 1
- Sword: Enc 1-2
- Two-handed weapon: Enc 2-3
- Shield: Enc 2
- Light armor: Enc 2-3
- Medium armor: Enc 3-4
- Heavy armor: Enc 5+`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to add item to",
                        },
                        itemName: {
                            type: "string",
                            description: "Name of the item being added",
                        },
                        itemType: {
                            type: "string",
                            enum: ["weapon", "armor", "ammunition", "container", "trapping", "money"],
                            description: "Type of item being added",
                        },
                        encumbrance: {
                            type: "number",
                            description: "Weight/encumbrance value of the item (0 for very light items)",
                        },
                        quantity: {
                            type: "number",
                            description: "Number of items being added (default 1)",
                        },
                    },
                    required: ["characterName", "itemName", "itemType", "encumbrance"],
                },
            },
            {
                name: "remove-inventory-item",
                description: `Remove an item from a WFRP 4e character's inventory and update encumbrance.

Item Removal Reasons:
- Sold or traded item
- Used consumable (potion, ration)
- Lost or destroyed in combat
- Given to another character
- Dropped to reduce encumbrance
- Stored in camp/home

When removing items:
- Specify exact item name or ID
- Optionally specify quantity (for stackable items)
- Automatically reduces encumbrance
- Updates carrying capacity status
- May remove over-encumbered penalties

Dropping Items in Combat:
- Free action to drop held item
- Move action to remove worn item
- Dropping items can prevent over-encumbrance
- Consider tactical implications (dropping shield to flee)`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to remove item from",
                        },
                        itemName: {
                            type: "string",
                            description: "Name of the item to remove",
                        },
                        quantity: {
                            type: "number",
                            description: "Number of items to remove (default 1, for stackable items)",
                        },
                    },
                    required: ["characterName", "itemName"],
                },
            },
        ];
    }

    async handleGetInventoryStatus(args: { characterName: string }) {
        this.logger.info("Getting inventory status", { characterName: args.characterName });

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!response.success || !response.data) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to get character info: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const character = response.data;

        // Get encumbrance values
        const strengthBonus = Math.floor((character.system?.characteristics?.s?.value || 0) / 10);
        const toughnessBonus = Math.floor((character.system?.characteristics?.t?.value || 0) / 10);
        const maxEncumbrance = strengthBonus + toughnessBonus;
        const currentEncumbrance = character.system?.status?.encumbrance?.value || 0;

        // Calculate encumbrance status
        const encumbrancePercent = Math.round((currentEncumbrance / maxEncumbrance) * 100);
        let encumbranceStatus = "Normal";
        let encumbrancePenalty = "";
        let statusEmoji = "✅";

        if (currentEncumbrance > maxEncumbrance) {
            encumbranceStatus = "Over Encumbered";
            encumbrancePenalty = "⚠️ **PENALTIES:** -20 to Agility tests, Movement halved, Cannot run";
            statusEmoji = "🔴";
        } else if (currentEncumbrance === maxEncumbrance) {
            encumbranceStatus = "At Limit";
            encumbrancePenalty = "⚠️ **PENALTY:** -10 to Agility tests";
            statusEmoji = "🟡";
        }

        // Progress bar for encumbrance
        const barLength = 20;
        const filledBars = Math.min(Math.round((currentEncumbrance / maxEncumbrance) * barLength), barLength);
        const emptyBars = barLength - filledBars;
        const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars);

        let inventoryReport = `🎒 **${character.name}** - Inventory Status\n\n`;
        inventoryReport += `## Encumbrance\n`;
        inventoryReport += `${statusEmoji} **Status:** ${encumbranceStatus} (${encumbrancePercent}%)\n`;
        inventoryReport += `**Current:** ${currentEncumbrance} / ${maxEncumbrance} Enc\n`;
        inventoryReport += `[${progressBar}]\n`;

        if (encumbrancePenalty) {
            inventoryReport += `\n${encumbrancePenalty}\n`;
        }

        inventoryReport += `\n**Carrying Capacity:**\n`;
        inventoryReport += `- Strength Bonus: ${strengthBonus}\n`;
        inventoryReport += `- Toughness Bonus: ${toughnessBonus}\n`;
        inventoryReport += `- Maximum Encumbrance: ${maxEncumbrance}\n`;
        inventoryReport += `- Available Capacity: ${Math.max(0, maxEncumbrance - currentEncumbrance)} Enc\n`;

        // Categorize items
        const weapons = character.items?.filter((item: any) => item.type === "weapon") || [];
        const armor = character.items?.filter((item: any) => item.type === "armour") || [];
        const ammunition = character.items?.filter((item: any) => item.type === "ammunition") || [];
        const trappings = character.items?.filter((item: any) => item.type === "trapping") || [];
        const containers = character.items?.filter((item: any) => item.type === "container") || [];
        const money = character.items?.filter((item: any) => item.type === "money") || [];

        // Ammunition status
        if (ammunition.length > 0) {
            inventoryReport += `\n## 🏹 Ammunition\n`;
            ammunition.forEach((ammo: any) => {
                const quantity = ammo.system?.quantity?.value || 0;
                const statusIcon = quantity === 0 ? "❌" : quantity < 5 ? "⚠️" : "✅";
                const statusText = quantity === 0 ? "(OUT OF AMMO!)" : quantity < 5 ? "(RUNNING LOW)" : "";
                inventoryReport += `${statusIcon} **${ammo.name}:** ${quantity} ${statusText}\n`;
            });
        } else {
            inventoryReport += `\n## 🏹 Ammunition\n`;
            inventoryReport += `No ammunition tracked.\n`;
        }

        // Weapons summary
        if (weapons.length > 0) {
            inventoryReport += `\n## ⚔️ Weapons (${weapons.length})\n`;
            let weaponEnc = 0;
            weapons.forEach((weapon: any) => {
                const enc = weapon.system?.encumbrance?.value || 0;
                weaponEnc += enc;
                const equipped = weapon.system?.equipped?.value ? "📍" : "";
                inventoryReport += `${equipped} ${weapon.name} (${enc} Enc)\n`;
            });
            inventoryReport += `**Total Weapon Encumbrance:** ${weaponEnc} Enc\n`;
        }

        // Armor summary
        if (armor.length > 0) {
            inventoryReport += `\n## 🛡️ Armor (${armor.length})\n`;
            let armorEnc = 0;
            armor.forEach((piece: any) => {
                const enc = piece.system?.encumbrance?.value || 0;
                armorEnc += enc;
                const worn = piece.system?.worn?.value ? "👤" : "";
                inventoryReport += `${worn} ${piece.name} (${enc} Enc)\n`;
            });
            inventoryReport += `**Total Armor Encumbrance:** ${armorEnc} Enc\n`;
        }

        // Containers
        if (containers.length > 0) {
            inventoryReport += `\n## 👜 Containers (${containers.length})\n`;
            containers.forEach((container: any) => {
                const capacity = container.system?.carries?.value || 0;
                inventoryReport += `📦 ${container.name} (Capacity: ${capacity} Enc)\n`;
            });
        }

        // Trappings summary
        if (trappings.length > 0) {
            inventoryReport += `\n## 🎁 Trappings & Equipment (${trappings.length})\n`;
            let trappingEnc = 0;
            trappings.slice(0, 10).forEach((trapping: any) => {
                const enc = trapping.system?.encumbrance?.value || 0;
                trappingEnc += enc;
                const quantity = trapping.system?.quantity?.value || 1;
                const quantityText = quantity > 1 ? ` x${quantity}` : "";
                inventoryReport += `- ${trapping.name}${quantityText} (${enc} Enc)\n`;
            });
            if (trappings.length > 10) {
                inventoryReport += `... and ${trappings.length - 10} more items\n`;
            }
            inventoryReport += `**Total Trapping Encumbrance:** ${trappingEnc} Enc\n`;
        }

        // Money
        if (money.length > 0) {
            inventoryReport += `\n## 💰 Currency\n`;
            money.forEach((coin: any) => {
                const quantity = coin.system?.quantity?.value || 0;
                inventoryReport += `💵 ${coin.name}: ${quantity}\n`;
            });
            const totalCoins = money.reduce((sum: number, coin: any) => sum + (coin.system?.quantity?.value || 0), 0);
            const coinEnc = Math.floor(totalCoins / 100);
            if (coinEnc > 0) {
                inventoryReport += `**Currency Weight:** ${coinEnc} Enc (${totalCoins} coins)\n`;
            }
        }

        // Inventory management tips
        inventoryReport += `\n---\n`;
        inventoryReport += `💡 **Inventory Management:**\n`;
        if (currentEncumbrance > maxEncumbrance) {
            inventoryReport += `- ⚠️ You are OVER ENCUMBERED! Drop items to restore mobility\n`;
            inventoryReport += `- Consider storing items at camp or on a mount\n`;
            inventoryReport += `- Distribute heavy items among party members\n`;
        } else if (currentEncumbrance === maxEncumbrance) {
            inventoryReport += `- ⚠️ You are at maximum capacity! Avoid picking up more items\n`;
        } else {
            inventoryReport += `- ✅ You have ${maxEncumbrance - currentEncumbrance} Enc of available space\n`;
        }
        inventoryReport += `- Use \`track-ammunition\` to update ammunition counts\n`;
        inventoryReport += `- Use \`add-inventory-item\` or \`remove-inventory-item\` to manage items\n`;

        return {
            content: [{ type: "text", text: inventoryReport }],
        };
    }

    async handleTrackAmmunition(args: {
        characterName: string;
        ammunitionType: string;
        amount: number;
    }) {
        this.logger.info("Tracking ammunition", {
            characterName: args.characterName,
            ammunitionType: args.ammunitionType,
            amount: args.amount,
        });

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!response.success || !response.data) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to get character info: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const character = response.data;

        // Find ammunition item
        const ammoItem = character.items?.find(
            (item: any) => item.type === "ammunition" && item.name.toLowerCase().includes(args.ammunitionType.toLowerCase())
        );

        if (!ammoItem) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Ammunition type "${args.ammunitionType}" not found in ${args.characterName}'s inventory.\n\nAvailable ammunition types:\n${character.items?.filter((item: any) => item.type === "ammunition").map((item: any) => `- ${item.name}`).join("\n") || "None"}`,
                    },
                ],
            };
        }

        const currentQuantity = ammoItem.system?.quantity?.value || 0;
        const newQuantity = Math.max(0, currentQuantity + args.amount);

        // Update ammunition quantity
        const updateResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.updateItem",
            {
                actorId: character.id,
                itemId: ammoItem.id,
                updateData: {
                    "system.quantity.value": newQuantity,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to update ammunition: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const action = args.amount > 0 ? "Added" : "Used";
        const absAmount = Math.abs(args.amount);

        let statusText = `🏹 **Ammunition ${action}**\n\n`;
        statusText += `**Character:** ${args.characterName}\n`;
        statusText += `**Type:** ${ammoItem.name}\n`;
        statusText += `**Change:** ${args.amount > 0 ? "+" : ""}${args.amount}\n`;
        statusText += `**Previous:** ${currentQuantity}\n`;
        statusText += `**Current:** ${newQuantity}\n\n`;

        if (newQuantity === 0) {
            statusText += `❌ **OUT OF AMMUNITION!**\n\n`;
            statusText += `${args.characterName} has run out of ${ammoItem.name}! They cannot make ranged attacks with weapons requiring this ammunition until they acquire more.\n\n`;
            statusText += `💡 **Solutions:**\n`;
            statusText += `- Purchase ammunition from a merchant\n`;
            statusText += `- Recover ammunition after combat (50% recovery rate)\n`;
            statusText += `- Switch to melee weapons\n`;
            statusText += `- Craft ammunition if skilled\n`;
        } else if (newQuantity < 5) {
            statusText += `⚠️ **RUNNING LOW!**\n\n`;
            statusText += `${args.characterName} only has ${newQuantity} ${ammoItem.name} remaining. Consider restocking soon to avoid running out in combat.\n`;
        } else {
            statusText += `✅ **Sufficient ammunition** (${newQuantity} remaining)\n`;
        }

        return {
            content: [{ type: "text", text: statusText }],
        };
    }

    async handleCheckEncumbrance(args: { characterName: string }) {
        this.logger.info("Checking encumbrance", { characterName: args.characterName });

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!response.success || !response.data) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to get character info: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const character = response.data;

        const strengthValue = character.system?.characteristics?.s?.value || 0;
        const toughnessValue = character.system?.characteristics?.t?.value || 0;
        const strengthBonus = Math.floor(strengthValue / 10);
        const toughnessBonus = Math.floor(toughnessValue / 10);
        const maxEncumbrance = strengthBonus + toughnessBonus;
        const currentEncumbrance = character.system?.status?.encumbrance?.value || 0;

        let encumbranceReport = `⚖️ **Encumbrance Check** - ${character.name}\n\n`;

        // Status determination
        if (currentEncumbrance > maxEncumbrance) {
            const overBy = currentEncumbrance - maxEncumbrance;
            encumbranceReport += `🔴 **OVER ENCUMBERED** (by ${overBy} Enc)\n\n`;
            encumbranceReport += `${character.name} is carrying too much weight!\n\n`;
            encumbranceReport += `**Current:** ${currentEncumbrance} Enc\n`;
            encumbranceReport += `**Maximum:** ${maxEncumbrance} Enc\n`;
            encumbranceReport += `**Over Limit:** ${overBy} Enc\n\n`;
            encumbranceReport += `⚠️ **PENALTIES APPLIED:**\n`;
            encumbranceReport += `- -20 to all Agility-based tests\n`;
            encumbranceReport += `- Movement speed halved\n`;
            encumbranceReport += `- Cannot take Run action\n`;
            encumbranceReport += `- May gain Fatigued condition\n`;
            encumbranceReport += `- Physical tests become much harder\n\n`;
            encumbranceReport += `💡 **SOLUTIONS:**\n`;
            encumbranceReport += `1. Drop ${overBy}+ Enc worth of items immediately\n`;
            encumbranceReport += `2. Store items on mount or pack animal\n`;
            encumbranceReport += `3. Distribute items among party members\n`;
            encumbranceReport += `4. Leave items at camp/safe location\n`;
            encumbranceReport += `5. Sell/discard unnecessary items\n\n`;

            // Suggest items to drop
            const items = character.items?.filter((item: any) => {
                const enc = item.system?.encumbrance?.value || 0;
                return enc > 0;
            }).sort((a: any, b: any) => {
                const encA = a.system?.encumbrance?.value || 0;
                const encB = b.system?.encumbrance?.value || 0;
                return encB - encA;
            }) || [];

            if (items.length > 0) {
                encumbranceReport += `**Heaviest Items (consider dropping):**\n`;
                items.slice(0, 5).forEach((item: any) => {
                    const enc = item.system?.encumbrance?.value || 0;
                    encumbranceReport += `- ${item.name} (${enc} Enc)\n`;
                });
            }
        } else if (currentEncumbrance === maxEncumbrance) {
            encumbranceReport += `🟡 **AT CARRYING LIMIT**\n\n`;
            encumbranceReport += `${character.name} is at maximum carrying capacity.\n\n`;
            encumbranceReport += `**Current:** ${currentEncumbrance} Enc\n`;
            encumbranceReport += `**Maximum:** ${maxEncumbrance} Enc\n`;
            encumbranceReport += `**Available:** 0 Enc\n\n`;
            encumbranceReport += `⚠️ **PENALTY:**\n`;
            encumbranceReport += `- -10 to all Agility-based tests\n\n`;
            encumbranceReport += `💡 Cannot pick up additional items without dropping something first.\n`;
        } else {
            const available = maxEncumbrance - currentEncumbrance;
            const percentUsed = Math.round((currentEncumbrance / maxEncumbrance) * 100);
            encumbranceReport += `✅ **NORMAL CARRYING CAPACITY**\n\n`;
            encumbranceReport += `${character.name} is comfortably carrying their equipment.\n\n`;
            encumbranceReport += `**Current:** ${currentEncumbrance} Enc\n`;
            encumbranceReport += `**Maximum:** ${maxEncumbrance} Enc\n`;
            encumbranceReport += `**Available:** ${available} Enc (${100 - percentUsed}% capacity free)\n`;
            encumbranceReport += `**Status:** No penalties\n\n`;
            encumbranceReport += `✅ Can carry ${available} more Enc worth of items before becoming encumbered.\n`;
        }

        // Calculation breakdown
        encumbranceReport += `\n---\n`;
        encumbranceReport += `**Encumbrance Calculation:**\n`;
        encumbranceReport += `- Strength: ${strengthValue} (Bonus: ${strengthBonus})\n`;
        encumbranceReport += `- Toughness: ${toughnessValue} (Bonus: ${toughnessBonus})\n`;
        encumbranceReport += `- Maximum Encumbrance: ${strengthBonus} + ${toughnessBonus} = **${maxEncumbrance} Enc**\n`;

        return {
            content: [{ type: "text", text: encumbranceReport }],
        };
    }

    async handleAddInventoryItem(args: {
        characterName: string;
        itemName: string;
        itemType: string;
        encumbrance: number;
        quantity?: number;
    }) {
        this.logger.info("Adding inventory item", {
            characterName: args.characterName,
            itemName: args.itemName,
        });

        const quantity = args.quantity || 1;

        // Get character to find actor ID
        const charResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!charResponse.success || !charResponse.data) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to get character info: ${charResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const character = charResponse.data;

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.createItem",
            {
                actorId: character.id,
                itemData: {
                    name: args.itemName,
                    type: args.itemType,
                    system: {
                        encumbrance: { value: args.encumbrance },
                        quantity: { value: quantity },
                    },
                },
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to add item: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        // Get updated character info to check encumbrance
        const updatedCharResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.getCharacterInfo",
            { characterName: args.characterName }
        );

        const totalWeight = args.encumbrance * quantity;
        let resultText = `✅ **Item Added to Inventory**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Item:** ${args.itemName}\n`;
        resultText += `**Type:** ${args.itemType}\n`;
        resultText += `**Quantity:** ${quantity}\n`;
        resultText += `**Encumbrance:** ${args.encumbrance} Enc each (${totalWeight} Enc total)\n\n`;

        if (updatedCharResponse.success && updatedCharResponse.data) {
            const updatedCharacter = updatedCharResponse.data;
            const currentEnc = updatedCharacter.system?.status?.encumbrance?.value || 0;
            const strengthBonus = Math.floor((updatedCharacter.system?.characteristics?.s?.value || 0) / 10);
            const toughnessBonus = Math.floor((updatedCharacter.system?.characteristics?.t?.value || 0) / 10);
            const maxEnc = strengthBonus + toughnessBonus;

            resultText += `**Updated Encumbrance:** ${currentEnc} / ${maxEnc} Enc\n`;

            if (currentEnc > maxEnc) {
                const overBy = currentEnc - maxEnc;
                resultText += `\n🔴 **WARNING: OVER ENCUMBERED!**\n\n`;
                resultText += `${args.characterName} is now carrying too much weight (over by ${overBy} Enc)!\n\n`;
                resultText += `⚠️ **PENALTIES:**\n`;
                resultText += `- -20 to Agility tests\n`;
                resultText += `- Movement halved\n`;
                resultText += `- Cannot run\n\n`;
                resultText += `💡 Drop ${overBy}+ Enc worth of items to restore normal movement.`;
            } else if (currentEnc === maxEnc) {
                resultText += `\n🟡 **AT CARRYING LIMIT**\n`;
                resultText += `${args.characterName} is at maximum capacity (-10 to Agility tests).\n`;
                resultText += `Cannot pick up more items without dropping something.`;
            } else {
                const remaining = maxEnc - currentEnc;
                resultText += `\n✅ **${remaining} Enc** of carrying capacity remaining.`;
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleRemoveInventoryItem(args: {
        characterName: string;
        itemName: string;
        quantity?: number;
    }) {
        this.logger.info("Removing inventory item", {
            characterName: args.characterName,
            itemName: args.itemName,
        });

        // Get character info to find the item
        const charResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!charResponse.success || !charResponse.data) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to get character info: ${charResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const character = charResponse.data;
        const item = character.items?.find((i: any) => i.name === args.itemName);

        if (!item) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Item "${args.itemName}" not found in ${args.characterName}'s inventory.`,
                    },
                ],
            };
        }

        const itemQuantity = item.system?.quantity?.value || 1;
        const itemEnc = item.system?.encumbrance?.value || 0;
        const removeQuantity = args.quantity || itemQuantity;

        // If removing all or item is not stackable, delete the item
        if (removeQuantity >= itemQuantity) {
            const response = await this.foundryClient.query(
                "foundry-mcp-bridge.deleteItem",
                {
                    actorId: character.id,
                    itemId: item.id,
                }
            );

            if (!response.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to remove item: ${response.error || "Unknown error"}`,
                        },
                    ],
                };
            }

            const weightRemoved = itemEnc * itemQuantity;
            let resultText = `✅ **Item Removed from Inventory**\n\n`;
            resultText += `**Character:** ${args.characterName}\n`;
            resultText += `**Item:** ${args.itemName}\n`;
            resultText += `**Quantity Removed:** ${itemQuantity}\n`;
            resultText += `**Encumbrance Freed:** ${weightRemoved} Enc\n`;

            // Get updated encumbrance
            const updatedResponse = await this.foundryClient.query(
                "foundry-mcp-bridge.getCharacterInfo",
                { characterName: args.characterName }
            );

            if (updatedResponse.success && updatedResponse.data) {
                const updatedChar = updatedResponse.data;
                const currentEnc = updatedChar.system?.status?.encumbrance?.value || 0;
                const strengthBonus = Math.floor((updatedChar.system?.characteristics?.s?.value || 0) / 10);
                const toughnessBonus = Math.floor((updatedChar.system?.characteristics?.t?.value || 0) / 10);
                const maxEnc = strengthBonus + toughnessBonus;

                resultText += `\n**Updated Encumbrance:** ${currentEnc} / ${maxEnc} Enc\n`;

                if (currentEnc > maxEnc) {
                    resultText += `\n⚠️ Still over encumbered. Drop more items to restore mobility.`;
                } else if (currentEnc === maxEnc) {
                    resultText += `\n🟡 At carrying limit. One more item will cause over-encumbrance.`;
                } else {
                    resultText += `\n✅ **${maxEnc - currentEnc} Enc** of carrying capacity available.`;
                }
            }

            return {
                content: [{ type: "text", text: resultText }],
            };
        } else {
            // Update quantity for stackable items
            const newQuantity = itemQuantity - removeQuantity;
            const response = await this.foundryClient.query(
                "foundry-mcp-bridge.updateItem",
                {
                    actorId: character.id,
                    itemId: item.id,
                    updateData: {
                        "system.quantity.value": newQuantity,
                    },
                }
            );

            if (!response.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to update item quantity: ${response.error || "Unknown error"}`,
                        },
                    ],
                };
            }

            const weightRemoved = itemEnc * removeQuantity;
            return {
                content: [
                    {
                        type: "text",
                        text: `✅ **Item Quantity Reduced**\n\n**Character:** ${args.characterName}\n**Item:** ${args.itemName}\n**Previous Quantity:** ${itemQuantity}\n**Current Quantity:** ${newQuantity}\n**Encumbrance Freed:** ${weightRemoved} Enc`,
                    },
                ],
            };
        }
    }
}
