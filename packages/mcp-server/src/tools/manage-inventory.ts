import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";
import { BaseTool, BaseToolOptions } from "../base-tool.js";

// BUG-007 rewire: typed generics for new query call sites per the BUG-077
// prevention stack (no `<any>` propagation on new writes).
interface CharacterInfoResult {
  id: string;
  name: string;
  system?: any;
  items?: Array<{ id: string; name: string; type: string; system?: any; [key: string]: any }>;
  [key: string]: any;
}
type WriteResult = unknown;

const ManageInventorySchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("get-status"),
        characterName: z.string()
    }),
    z.object({
        action: z.literal("add-item"),
        characterName: z.string(),
        itemName: z.string(),
        itemType: z.enum(["weapon", "armor", "ammunition", "container", "trapping", "money"]),
        encumbrance: z.number(),
        quantity: z.number().optional()
    }),
    z.object({
        action: z.literal("remove-item"),
        characterName: z.string(),
        itemName: z.string(),
        quantity: z.number().optional()
    }),
    z.object({
        action: z.literal("track-ammunition"),
        characterName: z.string(),
        ammunitionType: z.string(),
        amount: z.number()
    }),
    z.object({
        action: z.literal("check-encumbrance"),
        characterName: z.string()
    })
]);

type ManageInventoryArgs = z.infer<typeof ManageInventorySchema>;

export interface ManageInventoryToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ManageInventoryTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

    getToolDefinitions() {
        return [{
            name: "manage-inventory",
            title: "Manage Inventory",
            annotations: {
              readOnlyHint: false,
              destructiveHint: false,
              idempotentHint: false,
              openWorldHint: true,
            },
            description: `Manage inventory for WFRP 4e characters including items, encumbrance, and ammunition.

WFRP Encumbrance System:
- Maximum Encumbrance = Strength + Toughness Bonus
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

Actions:
- **get-status**: Get detailed inventory overview with encumbrance and ammunition
- **add-item**: Add item to inventory with weight tracking
- **remove-item**: Remove item and update encumbrance
- **track-ammunition**: Add/subtract ammunition (use negative for shots fired)
- **check-encumbrance**: Calculate carrying capacity and penalties

Examples:
- Get inventory: action="get-status", characterName="Hans"
- Add item: action="add-item", characterName="Hans", itemName="Longsword", itemType="weapon", encumbrance=1
- Remove item: action="remove-item", characterName="Hans", itemName="Longsword"
- Track ammo: action="track-ammunition", characterName="Hans", ammunitionType="Arrows", amount=-1
- Check weight: action="check-encumbrance", characterName="Hans"`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get-status", "add-item", "remove-item", "track-ammunition", "check-encumbrance"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Name of the character" },
                    itemName: { type: "string", description: "Name of the item (for add-item, remove-item)" },
                    itemType: {
                        type: "string",
                        enum: ["weapon", "armor", "ammunition", "container", "trapping", "money"],
                        description: "Type of item (for add-item)"
                    },
                    encumbrance: { type: "number", description: "Weight/encumbrance value (for add-item)" },
                    quantity: { type: "number", description: "Quantity (for add-item, remove-item)" },
                    ammunitionType: { type: "string", description: "Type of ammunition like 'Arrows', 'Bolts' (for track-ammunition)" },
                    amount: { type: "number", description: "Amount to add/subtract (for track-ammunition)" }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageInventoryArgs): Promise<string> {
        const parsed = ManageInventorySchema.parse(args);

        switch (parsed.action) {
            case "get-status":
                return this.handleGetStatus(parsed);
            case "add-item":
                return this.handleAddItem(parsed);
            case "remove-item":
                return this.handleRemoveItem(parsed);
            case "track-ammunition":
                return this.handleTrackAmmunition(parsed);
            case "check-encumbrance":
                return this.handleCheckEncumbrance(parsed);
        }
    }

    private async handleGetStatus(args: { characterName: string }): Promise<string> {
        this.logger.info("Getting inventory status", { characterName: args.characterName });

        const character = await this.query<any>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );

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
        inventoryReport += `## 📊 Encumbrance\n`;
        inventoryReport += `${statusEmoji} **Status:** ${encumbranceStatus} (${encumbrancePercent}%)\n`;
        inventoryReport += `**Carrying:** ${currentEncumbrance} / ${maxEncumbrance} Enc\n`;
        inventoryReport += `\`${progressBar}\`\n`;
        if (encumbrancePenalty) {
            inventoryReport += `\n${encumbrancePenalty}\n`;
        }

        // Count items by category
        const items = character.items || [];
        const weapons = items.filter((item: any) => item.type === "weapon");
        const armor = items.filter((item: any) => item.type === "armour");
        const trappings = items.filter((item: any) => item.type === "trapping");
        const containers = items.filter((item: any) => item.type === "container");
        const ammunition = items.filter((item: any) => item.type === "ammunition");

        inventoryReport += `\n## 📦 Inventory Summary\n`;
        inventoryReport += `- **Weapons:** ${weapons.length}\n`;
        inventoryReport += `- **Armor:** ${armor.length}\n`;
        inventoryReport += `- **Trappings:** ${trappings.length}\n`;
        inventoryReport += `- **Containers:** ${containers.length}\n`;
        inventoryReport += `- **Ammunition:** ${ammunition.length}\n`;

        // Ammunition status
        if (ammunition.length > 0) {
            inventoryReport += `\n## 🎯 Ammunition Status\n`;
            for (const ammo of ammunition) {
                const quantity = ammo.system?.quantity?.value || 0;
                let ammoStatus = "✅";
                let warning = "";
                if (quantity === 0) {
                    ammoStatus = "❌";
                    warning = " - **OUT OF AMMO!**";
                } else if (quantity < 5) {
                    ammoStatus = "⚠️";
                    warning = " - **Running low!**";
                }
                inventoryReport += `${ammoStatus} **${ammo.name}:** ${quantity}${warning}\n`;
            }
        }

        // Money
        const money = character.system?.status?.money;
        if (money) {
            const gc = money.gc || 0;
            const ss = money.ss || 0;
            const bp = money.bp || 0;
            inventoryReport += `\n## 💰 Money\n`;
            inventoryReport += `**Gold Crowns:** ${gc} GC\n`;
            inventoryReport += `**Silver Shillings:** ${ss} SS\n`;
            inventoryReport += `**Brass Pennies:** ${bp} BP\n`;
        }

        return inventoryReport;
    }

    private async handleAddItem(args: { characterName: string; itemName: string; itemType: string; encumbrance: number; quantity?: number | undefined }): Promise<string> {
        this.logger.info("Adding item to inventory", args);

        const quantity = args.quantity || 1;

        // BUG-007 rewire: `addItemToInventory` was a dead query key. The live
        // equivalent for this tool's "custom inventory item" shape is
        // `createItem` with destination=actor, itemData carrying name/type +
        // wfrp4e-canonical `system.encumbrance.value` + `system.quantity.value`.
        // wfrp4e's "armor" subtype is spelled `armour`; remap before write.
        const wfrp4eType = args.itemType === "armor" ? "armour" : args.itemType;
        await this.query<WriteResult>(
            "createItem",
            {
                itemData: {
                    name: args.itemName,
                    type: wfrp4eType,
                    system: {
                        encumbrance: { value: args.encumbrance },
                        quantity: { value: quantity }
                    }
                },
                destination: { type: "actor", actorName: args.characterName }
            }
        );

        const totalWeight = args.encumbrance * quantity;
        return `✅ Added ${quantity}x **${args.itemName}** to ${args.characterName}'s inventory (${totalWeight} Enc)`;
    }

    private async handleRemoveItem(args: { characterName: string; itemName: string; quantity?: number | undefined }): Promise<string> {
        this.logger.info("Removing item from inventory", args);

        const quantity = args.quantity || 1;

        // BUG-007 rewire: `removeItemFromInventory` was a dead query key. The
        // live composition is getCharacterInfo (resolve actorId + itemId) →
        // deleteItem (when quantity covers full stack) or updateItem (when
        // decrementing). For this tool's contract — "remove an item" — we
        // delete by name when the requested quantity meets/exceeds the stack;
        // otherwise we decrement.
        const character = await this.query<CharacterInfoResult>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );
        const item = (character.items ?? []).find(
            (i) => i.name === args.itemName
        );
        if (!item) {
            return `⚠️ **${args.itemName}** not found in ${args.characterName}'s inventory.`;
        }

        const currentQty = Number(item.system?.quantity?.value ?? 1);
        if (quantity >= currentQty) {
            await this.query<WriteResult>(
                "deleteItem",
                { actorId: character.id, itemId: item.id }
            );
            return `✅ Removed ${currentQty}x **${args.itemName}** from ${args.characterName}'s inventory`;
        }

        await this.query<WriteResult>(
            "updateItem",
            {
                actorId: character.id,
                itemId: item.id,
                updateData: { "system.quantity.value": currentQty - quantity }
            }
        );
        return `✅ Removed ${quantity}x **${args.itemName}** from ${args.characterName}'s inventory (${currentQty - quantity} remaining)`;
    }

    private async handleTrackAmmunition(args: { characterName: string; ammunitionType: string; amount: number }): Promise<string> {
        this.logger.info("Tracking ammunition", args);

        // BUG-007 rewire: `trackAmmunition` was a dead query key. The live
        // composition is getCharacterInfo (resolve actorId + ammo item) →
        // updateItem with the delta-adjusted `system.quantity.value`.
        const character = await this.query<CharacterInfoResult>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );
        const ammo = (character.items ?? []).find(
            (i) => i.type === "ammunition" && i.name === args.ammunitionType
        );
        if (!ammo) {
            return `⚠️ **${args.ammunitionType}** not found in ${args.characterName}'s inventory.`;
        }

        const currentQty = Number(ammo.system?.quantity?.value ?? 0);
        const newQty = Math.max(0, currentQty + args.amount);
        await this.query<WriteResult>(
            "updateItem",
            {
                actorId: character.id,
                itemId: ammo.id,
                updateData: { "system.quantity.value": newQty }
            }
        );

        const action = args.amount > 0 ? "Added" : "Used";
        const absAmount = Math.abs(args.amount);
        return `🎯 ${action} ${absAmount} **${args.ammunitionType}** for ${args.characterName} (${newQty} remaining)`;
    }

    private async handleCheckEncumbrance(args: { characterName: string }): Promise<string> {
        this.logger.info("Checking encumbrance", { characterName: args.characterName });

        const character = await this.query<any>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );

        const strengthBonus = Math.floor((character.system?.characteristics?.s?.value || 0) / 10);
        const toughnessBonus = Math.floor((character.system?.characteristics?.t?.value || 0) / 10);
        const maxEncumbrance = strengthBonus + toughnessBonus;
        const currentEncumbrance = character.system?.status?.encumbrance?.value || 0;

        let report = `⚖️ **${character.name}** - Encumbrance Check\n\n`;
        report += `**Current Encumbrance:** ${currentEncumbrance} Enc\n`;
        report += `**Maximum Encumbrance:** ${maxEncumbrance} Enc\n`;
        report += `**Strength Bonus:** ${strengthBonus}\n`;
        report += `**Toughness Bonus:** ${toughnessBonus}\n\n`;

        if (currentEncumbrance > maxEncumbrance) {
            const excess = currentEncumbrance - maxEncumbrance;
            report += `🔴 **OVER ENCUMBERED** by ${excess} Enc!\n\n`;
            report += `**Penalties:**\n`;
            report += `- -20 to all Agility tests\n`;
            report += `- Movement speed halved\n`;
            report += `- Cannot take Run action\n`;
            report += `- May gain Fatigued condition\n\n`;
            report += `**Solutions:**\n`;
            report += `- Drop ${excess}+ Enc of items\n`;
            report += `- Store items on mount/vehicle\n`;
            report += `- Distribute items among party\n`;
        } else if (currentEncumbrance === maxEncumbrance) {
            report += `🟡 **AT CARRYING LIMIT**\n\n`;
            report += `**Penalty:** -10 to all Agility tests\n\n`;
            report += `⚠️ **Warning:** Adding any item will cause Over Encumbered penalties!\n`;
        } else {
            const remaining = maxEncumbrance - currentEncumbrance;
            report += `✅ **NORMAL CARRYING CAPACITY**\n\n`;
            report += `Can carry **${remaining}** more Enc before penalties apply.\n`;
        }

        return report;
    }
}
