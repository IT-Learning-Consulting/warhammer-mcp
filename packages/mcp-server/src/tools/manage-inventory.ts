import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

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

export class ManageInventoryTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-inventory",
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

        const response = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!response.success || !response.data) {
            return `❌ Failed to get character info: ${response.error || "Unknown error"}`;
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

        const response = await this.foundryClient.query(
            "warhammer-mcp.addItemToInventory",
            {
                characterName: args.characterName,
                itemName: args.itemName,
                itemType: args.itemType,
                encumbrance: args.encumbrance,
                quantity: quantity
            }
        );

        if (!response.success) {
            return `❌ Failed to add item: ${response.error || "Unknown error"}`;
        }

        const totalWeight = args.encumbrance * quantity;
        return `✅ Added ${quantity}x **${args.itemName}** to ${args.characterName}'s inventory (${totalWeight} Enc)`;
    }

    private async handleRemoveItem(args: { characterName: string; itemName: string; quantity?: number | undefined }): Promise<string> {
        this.logger.info("Removing item from inventory", args);

        const quantity = args.quantity || 1;

        const response = await this.foundryClient.query(
            "warhammer-mcp.removeItemFromInventory",
            {
                characterName: args.characterName,
                itemName: args.itemName,
                quantity: quantity
            }
        );

        if (!response.success) {
            return `❌ Failed to remove item: ${response.error || "Unknown error"}`;
        }

        return `✅ Removed ${quantity}x **${args.itemName}** from ${args.characterName}'s inventory`;
    }

    private async handleTrackAmmunition(args: { characterName: string; ammunitionType: string; amount: number }): Promise<string> {
        this.logger.info("Tracking ammunition", args);

        const response = await this.foundryClient.query(
            "warhammer-mcp.trackAmmunition",
            {
                characterName: args.characterName,
                ammunitionType: args.ammunitionType,
                amount: args.amount
            }
        );

        if (!response.success) {
            return `❌ Failed to track ammunition: ${response.error || "Unknown error"}`;
        }

        const action = args.amount > 0 ? "Added" : "Used";
        const absAmount = Math.abs(args.amount);
        return `🎯 ${action} ${absAmount} **${args.ammunitionType}** for ${args.characterName}`;
    }

    private async handleCheckEncumbrance(args: { characterName: string }): Promise<string> {
        this.logger.info("Checking encumbrance", { characterName: args.characterName });

        const response = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!response.success || !response.data) {
            return `❌ Failed to get character info: ${response.error || "Unknown error"}`;
        }

        const character = response.data;

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
