import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";
import { BaseTool, BaseToolOptions } from "../base-tool.js";
import { CreateCustomItemTool } from "./create-custom-item.js";

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
    }),
    // P-04 (wfrp_layer_expansion Phase 5): wire a ranged weapon to a specific ammunition
    // item. Validates the ammo's `ammunitionType` matches the weapon's `ammunitionGroup`
    // BEFORE writing `weapon.system.currentAmmo.value` (the ammo item's id). Pass
    // ammoName: null to CLEAR the wiring. Name-based to match the umbrella's convention
    // (ADR-P5-01); ids are resolved internally via getCharacterInfo.
    z.object({
        action: z.literal("wire-ammo"),
        characterName: z.string(),
        weaponName: z.string(),
        ammoName: z.string().nullable()
    }),
    // Phase 13 (wfrp_layer_expansion_v1 R16): wraps actor.checkReloadExtendedTest — safe,
    // no dialog/roll (HC2). Name-keyed per the umbrella's convention (no actorId, no
    // .strict(), matches wire-ammo). The mcp-server handler resolves characterName +
    // weaponName to ids via getCharacterInfo before calling the foundry-module query key.
    z.object({
        action: z.literal("check-reload"),
        characterName: z.string(),
        weaponName: z.string()
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

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'manage-inventory', handler: (args: any) => this.handle(args) },
      ];
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

Use this when:
- Reading a character's full inventory + encumbrance state via action:"get-status" or action:"check-encumbrance".
- Adding or removing an existing weight-tracked item on a character's sheet (action:"add-item" / action:"remove-item").
- Tracking ammunition consumption during ranged combat (action:"track-ammunition", negative amount for shots fired).
- Wiring a ranged weapon to a specific ammunition item before it can fire (action:"wire-ammo"), or advancing a loading weapon's reload status (action:"check-reload").

Do NOT use action:"add-item" to add a new item — it is deprecated in favor of create-custom-item (homebrew item, full item data) or add-item-from-compendium (adding a real compendium-sourced item). This tool's other actions (get-status, remove-item, track-ammunition, check-encumbrance, wire-ammo, check-reload) remain the correct choice for their purposes.

WFRP Encumbrance System:
- Maximum Encumbrance = system-computed (Strength Bonus + Toughness Bonus, plus any Active-Effect modifiers and size multipliers, e.g. Ogre ×2)
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

Ammunition Wiring (wire-ammo):
- Wire a ranged weapon to a specific ammunition item (sets weapon.system.currentAmmo.value)
- Validates the ammo's Ammunition Type matches the weapon's Ammunition Group BEFORE writing
- Throws WIRE_AMMO_TYPE_MISMATCH on a mismatch (no write); pass ammoName=null to clear the wiring

Actions:
- **get-status**: Get detailed inventory overview with encumbrance and ammunition
- **add-item**: Add item to inventory with weight tracking
- **remove-item**: Remove item and update encumbrance
- **track-ammunition**: Add/subtract ammunition (use negative for shots fired)
- **check-encumbrance**: Calculate carrying capacity and penalties
- **wire-ammo**: Wire a weapon to compatible ammunition (validates type, then sets currentAmmo)
- **check-reload**: Check/advance a loading weapon's reload status (wraps actor.checkReloadExtendedTest — no dialog, no roll per HC2). Creates a reload-tracking item when unloaded; completes/removes it when the reload finishes.

Examples:
- Get inventory: action="get-status", characterName="Hans"
- Add item: action="add-item", characterName="Hans", itemName="Longsword", itemType="weapon", encumbrance=1
- Remove item: action="remove-item", characterName="Hans", itemName="Longsword"
- Track ammo: action="track-ammunition", characterName="Hans", ammunitionType="Arrows", amount=-1
- Check weight: action="check-encumbrance", characterName="Hans"
- Wire ammo: action="wire-ammo", characterName="Hans", weaponName="Bow", ammoName="Arrows"
- Clear wiring: action="wire-ammo", characterName="Hans", weaponName="Bow", ammoName=null
- Check reload: action="check-reload", characterName="Hans", weaponName="Crossbow"

Performance Notes:
- Action-based umbrella, no response-mode variance: each action returns a small text summary (added/removed item, ammo count, encumbrance total, or reload status) scoped to one character's inventory — never the full sheet payload.`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get-status", "add-item", "remove-item", "track-ammunition", "check-encumbrance", "wire-ammo", "check-reload"],
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
                    amount: { type: "number", description: "Amount to add/subtract (for track-ammunition)" },
                    weaponName: { type: "string", description: "Name of the ranged weapon to wire (for wire-ammo) or check reload status on (for check-reload)" },
                    ammoName: { type: ["string", "null"], description: "Name of the ammunition item to wire, or null to clear (for wire-ammo)" }
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
            case "wire-ammo":
                return this.handleWireAmmo(parsed);
            case "check-reload":
                return this.handleCheckReload(parsed);
        }
    }

    private async handleGetStatus(args: { characterName: string }): Promise<string> {
        this.logger.info("Getting inventory status", { characterName: args.characterName });

        const character = await this.query<any>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );

        // Get encumbrance values
        // Phase 1 (wfrp_layer_expansion_v1): read system-computed .max (handles AE bonusMod + Ogre ×2 multiplier)
        const maxEncumbrance = character.system?.status?.encumbrance?.max || 0;
        const strengthBonus = Math.floor((character.system?.characteristics?.s?.value || 0) / 10);
        const toughnessBonus = Math.floor((character.system?.characteristics?.t?.value || 0) / 10);
        const currentEncumbrance = character.system?.status?.encumbrance?.value || 0;

        // BUG-318: guard against division by zero when maxEncumbrance is 0
        const encumbrancePercent = maxEncumbrance > 0 ? Math.round((currentEncumbrance / maxEncumbrance) * 100) : 0;
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

        // BUG-318: guard against division by zero for progress bar
        const barLength = 20;
        const filledBars = maxEncumbrance > 0
            ? Math.min(Math.round((currentEncumbrance / maxEncumbrance) * barLength), barLength)
            : 0;
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

    /**
     * @deprecated Use mcp__foundry-mcp__create-custom-item with
     * destination={type:"actor", actorName} instead.
     * Delegates to CreateCustomItemTool.handle() for full-stats item creation.
     * Response shape preserved verbatim (HC5 back-compat). The "money" itemType,
     * previously a live latent bug (enum present but no Foundry route), now works
     * via the delegation path.
     */
    private async handleAddItem(args: { characterName: string; itemName: string; itemType: string; encumbrance: number; quantity?: number | undefined }): Promise<string> {
        this.logger.warn('manage-inventory.add-item is deprecated; prefer mcp__foundry-mcp__create-custom-item with destination={type:"actor", actorName}.');
        this.logger.info("Adding item to inventory via create-custom-item delegation", args);

        const quantity = args.quantity || 1;
        // wfrp4e's "armor" subtype is spelled `armour`; remap before delegation.
        const wfrp4eType = args.itemType === "armor" ? "armour" : args.itemType;

        const createInput = {
            itemType: wfrp4eType,
            name: args.itemName,
            destination: { type: "actor", actorName: args.characterName },
            systemOverrides: {
                encumbrance: { value: args.encumbrance },
                quantity: { value: quantity },
            },
        };

        let result: any;
        try {
            const tool = new CreateCustomItemTool({ foundryClient: this.foundryClient, logger: this.logger });
            result = await tool.handle(createInput);
        } catch (err) {
            throw new Error(`ADD_ITEM_DELEGATION_FAILED: ${err instanceof Error ? err.message : String(err)}`);
        }

        const itemName = result?.structuredContent?.itemName ?? args.itemName;
        const totalWeight = args.encumbrance * quantity;
        return `✅ Added ${quantity}x **${itemName}** to ${args.characterName}'s inventory (${totalWeight} Enc)`;
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
            await this.query<unknown>('notify', {
                severity: 'deleted',
                message: `${args.characterName}: ${args.itemName}`,
                summary: `item removed via warhammer-mcp.manage-inventory`,
            });
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
        await this.query<unknown>('notify', {
            severity: 'deleted',
            message: `${args.characterName}: ${args.itemName}`,
            summary: `item removed via warhammer-mcp.manage-inventory`,
        });
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
        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${args.characterName}: ${args.ammunitionType}`,
            summary: `ammunition tracked via warhammer-mcp.manage-inventory`,
        });

        const action = args.amount > 0 ? "Added" : "Used";
        const absAmount = Math.abs(args.amount);
        return `🎯 ${action} ${absAmount} **${args.ammunitionType}** for ${args.characterName} (${newQty} remaining)`;
    }

    /**
     * P-04 (wfrp_layer_expansion Phase 5): wire a ranged weapon to a specific
     * ammunition item. Validates the ammo's `system.ammunitionType.value` matches the
     * weapon's `system.ammunitionGroup.value` BEFORE writing the weapon's
     * `system.currentAmmo.value` (the ammo item's id). Pass ammoName=null to clear.
     *
     * Quality contract: throws typed WIRE_AMMO_* errors on a type mismatch or a
     * silent-drop post-write-verify failure (DP-16); fires notify Pattern B after a
     * confirmed write. Name-based + getCharacterInfo-resolved per the umbrella convention
     * (ADR-P5-01) — no foundry-module handler, no new query key.
     */
    private async handleWireAmmo(args: { characterName: string; weaponName: string; ammoName: string | null }): Promise<string> {
        this.logger.info("Wiring ammunition to weapon", args);

        const character = await this.query<CharacterInfoResult>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );

        const weapon = (character.items ?? []).find(
            (i) => i.type === "weapon" && i.name === args.weaponName
        );
        if (!weapon) {
            throw new Error(`WIRE_AMMO_WEAPON_NOT_FOUND: weapon "${args.weaponName}" not found on ${args.characterName}.`);
        }

        // Clear path: ammoName === null wipes the wiring (currentAmmo.value = "").
        if (args.ammoName === null) {
            await this.query<WriteResult>(
                "updateItem",
                {
                    actorId: character.id,
                    itemId: weapon.id,
                    updateData: { "system.currentAmmo.value": "" }
                }
            );
            // DP-16 post-write verify (silent-drop trap).
            const afterClear = await this.query<CharacterInfoResult>(
                "getCharacterInfo",
                { characterName: args.characterName }
            );
            const clearedWeapon = (afterClear.items ?? []).find((i) => i.id === weapon.id);
            const clearedVal = clearedWeapon?.system?.currentAmmo?.value ?? "";
            if (clearedVal !== "") {
                throw new Error(`WIRE_AMMO_NOT_PERSISTED: currentAmmo.value is "${clearedVal}", expected "" (cleared) on ${args.weaponName}.`);
            }
            await this.query<unknown>('notify', {
                severity: 'updated',
                message: `${args.characterName}: ${args.weaponName} ammo cleared`,
                summary: `ammo wiring cleared via warhammer-mcp.manage-inventory`,
            });
            return `🎯 Cleared ammunition wiring on **${args.weaponName}** for ${args.characterName}.`;
        }

        const ammo = (character.items ?? []).find(
            (i) => i.type === "ammunition" && i.name === args.ammoName
        );
        if (!ammo) {
            throw new Error(`WIRE_AMMO_AMMO_NOT_FOUND: ammunition "${args.ammoName}" not found on ${args.characterName}.`);
        }

        // Type-match validation: the ammo's ammunitionType must equal the weapon's
        // ammunitionGroup. Reject BEFORE any write (no silent corruption — memo 06 B-01).
        const weaponGroup = String(weapon.system?.ammunitionGroup?.value ?? "").trim();
        const ammoType = String(ammo.system?.ammunitionType?.value ?? "").trim();
        if (!weaponGroup) {
            throw new Error(`WIRE_AMMO_TYPE_MISMATCH: "${args.weaponName}" has no ammunitionGroup (not a ranged weapon, or group unset).`);
        }
        if (weaponGroup !== ammoType) {
            throw new Error(
                `WIRE_AMMO_TYPE_MISMATCH: "${args.ammoName}" (type "${ammoType}") does not match "${args.weaponName}" (group "${weaponGroup}"). No write performed.`
            );
        }

        await this.query<WriteResult>(
            "updateItem",
            {
                actorId: character.id,
                itemId: weapon.id,
                updateData: { "system.currentAmmo.value": ammo.id }
            }
        );

        // DP-16 post-write verify — re-read and assert currentAmmo.value === ammo.id
        // (Document.update returns undefined for both no-op AND silent drop; BUG-070).
        const after = await this.query<CharacterInfoResult>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );
        const verifiedWeapon = (after.items ?? []).find((i) => i.id === weapon.id);
        const ammoCurrent = verifiedWeapon?.system?.currentAmmo?.value ?? "";
        if (ammoCurrent !== ammo.id) {
            throw new Error(
                `WIRE_AMMO_NOT_PERSISTED: currentAmmo.value is "${ammoCurrent}", expected "${ammo.id}" on ${args.weaponName}.`
            );
        }

        await this.query<unknown>('notify', {
            severity: 'updated',
            message: `${args.characterName}: ${args.weaponName} ← ${args.ammoName}`,
            summary: `ammo wired via warhammer-mcp.manage-inventory`,
        });

        return `🎯 Wired **${args.ammoName}** to **${args.weaponName}** for ${args.characterName} (currentAmmo set).`;
    }

    /**
     * P-13 (wfrp_layer_expansion_v1 Phase 13, R16): wraps actor.checkReloadExtendedTest
     * (safe, no dialog/roll — HC2). Name-keyed per the umbrella convention; resolves
     * characterName + weaponName to ids via getCharacterInfo before calling the
     * dedicated `checkReload` foundry-module query key. notify already fires
     * foundry-module-side inside that handler — no redundant notify call here.
     */
    private async handleCheckReload(args: { characterName: string; weaponName: string }): Promise<string> {
        this.logger.info("Checking reload", args);

        const character = await this.query<CharacterInfoResult>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );
        if (!character || !character.id) {
            return `❌ Character "${args.characterName}" not found`;
        }

        const weapon = (character.items ?? []).find(
            (i) => i.type === "weapon" && i.name === args.weaponName
        );
        if (!weapon) {
            throw new Error(`CHECK_RELOAD_WEAPON_NOT_FOUND: weapon "${args.weaponName}" not found on ${args.characterName}.`);
        }

        const result = await this.query<{ branch: "started" | "completed" | "restarted" | "no-op"; reloading: boolean; weaponName: string }>(
            "checkReload",
            { actorId: character.id, weaponId: weapon.id }
        );

        if (result.branch === "started") {
            return `🔄 **${args.weaponName}** reload started for ${args.characterName} (reload test in progress).`;
        }
        if (result.branch === "completed") {
            return `✅ **${args.weaponName}** reload complete for ${args.characterName} — weapon loaded.`;
        }
        // BUG-418: the tracker was REPLACED (id changed) — the old reload's accumulated SL
        // progress is gone. Never report this as "no change".
        if (result.branch === "restarted") {
            return `⚠️ **${args.weaponName}** reload RESTARTED for ${args.characterName} — the previous reload tracker (and any accumulated SL progress) was discarded; a fresh reload is now in progress from zero.`;
        }
        if (result.reloading) {
            return `ℹ️ **${args.weaponName}** reload still in progress for ${args.characterName} (tracker unchanged; advance it via the reload extended test on the sheet).`;
        }
        return `ℹ️ **${args.weaponName}** is not a reload-tracked weapon for ${args.characterName}; no change.`;
    }

    private async handleCheckEncumbrance(args: { characterName: string }): Promise<string> {
        this.logger.info("Checking encumbrance", { characterName: args.characterName });

        const character = await this.query<any>(
            "getCharacterInfo",
            { characterName: args.characterName }
        );

        // Phase 1 (wfrp_layer_expansion_v1): read system-computed .max (handles AE bonusMod + Ogre ×2 multiplier)
        const maxEncumbrance = character.system?.status?.encumbrance?.max || 0;
        const strengthBonus = Math.floor((character.system?.characteristics?.s?.value || 0) / 10);
        const toughnessBonus = Math.floor((character.system?.characteristics?.t?.value || 0) / 10);
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
