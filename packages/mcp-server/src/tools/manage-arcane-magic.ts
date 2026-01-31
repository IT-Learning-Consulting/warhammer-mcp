import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Get spells schema
const GetSpellsSchema = z.object({
    action: z.literal("get-spells"),
    characterName: z.string(),
    lore: z.string().optional()
});

// Cast spell schema
const CastSpellSchema = z.object({
    action: z.literal("cast"),
    characterName: z.string(),
    spellName: z.string(),
    channelledSL: z.number().default(0),
    targetName: z.string().optional(),
    overcast: z.boolean().default(false)
});

// Channel power schema
const ChannelPowerSchema = z.object({
    action: z.literal("channel"),
    characterName: z.string(),
    lore: z.string(),
    accumulatedSL: z.number().default(0)
});

// Check miscast schema
const CheckMiscastSchema = z.object({
    action: z.literal("check-miscast"),
    characterName: z.string(),
    severity: z.enum(["minor", "major", "catastrophic"]),
    rollResult: z.number().optional()
});

// Memorize spell schema
const MemorizeSpellSchema = z.object({
    action: z.literal("memorize"),
    characterName: z.string(),
    spellName: z.string()
});

// Learn spell schema
const LearnSpellSchema = z.object({
    action: z.literal("learn"),
    characterName: z.string(),
    spellName: z.string(),
    lore: z.string()
});

const ManageArcaneMagicSchema = z.discriminatedUnion("action", [
    GetSpellsSchema,
    CastSpellSchema,
    ChannelPowerSchema,
    CheckMiscastSchema,
    MemorizeSpellSchema,
    LearnSpellSchema
]);

type ManageArcaneMagicArgs = z.infer<typeof ManageArcaneMagicSchema>;

export class ManageArcaneMagicTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-arcane-magic",
            description: `Manage arcane magic for WFRP 4e wizards. Handle spells, channelling, miscasts, and spell memorization.

**WFRP Arcane Magic System:**
- Spells organized into Lores (schools of magic)
- Each spell has a Casting Number (CN) - difficulty to cast
- Channelling skill accumulates SL before casting
- Miscasts occur when casting fails or with critical failures
- Memorization limits based on Intelligence Bonus

**Common Lores of Magic:**
- petty: Simple cantrips and minor spells
- fire: Flames, destruction, passion
- metal: Transformation, alchemy, metal
- shadow: Illusion, misdirection, darkness
- beasts: Animals, primal nature, survival
- heavens: Divination, lightning, prophecy
- life: Healing, growth, nature
- light: Banishment, truth, illumination
- death: Necromancy (often forbidden)

**Actions:**
- **get-spells**: List all known spells (optionally filter by lore)
- **cast**: Cast a spell with optional channelled SL (requires Language (Magick) test in Foundry)
- **channel**: Use Channelling skill to accumulate SL for later casting
- **check-miscast**: Determine miscast effects by severity (minor/major/catastrophic)
- **memorize**: Memorize a spell from spellbook (limited by Int Bonus)
- **learn**: Learn a new spell from compendium (requires XP cost)

**Miscast Severity:**
- Minor: Failed casting with small margin (SL -1 to -3)
- Major: Failed casting with large margin (SL -4 to -6)
- Catastrophic: Critical failure or SL -7+

**Example Usage:**
- Get all spells: {action: "get-spells", characterName: "Magnus"}
- Get fire spells: {action: "get-spells", characterName: "Magnus", lore: "fire"}
- Cast spell: {action: "cast", characterName: "Magnus", spellName: "Fireball", channelledSL: 2}
- Channel power: {action: "channel", characterName: "Magnus", lore: "fire", accumulatedSL: 2}
- Check miscast: {action: "check-miscast", characterName: "Magnus", severity: "major"}
- Memorize spell: {action: "memorize", characterName: "Magnus", spellName: "Fireball"}
- Learn spell: {action: "learn", characterName: "Magnus", spellName: "Fireball", lore: "fire"}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get-spells", "cast", "channel", "check-miscast", "memorize", "learn"],
                        description: "The arcane magic action to perform"
                    },
                    characterName: {
                        type: "string",
                        description: "Name of the wizard/spellcaster"
                    },
                    spellName: {
                        type: "string",
                        description: "[cast/memorize/learn] Name of the spell"
                    },
                    lore: {
                        type: "string",
                        description: "[get-spells/channel/learn] Lore/school of magic (lowercase: fire, shadow, metal, etc.)"
                    },
                    channelledSL: {
                        type: "number",
                        description: "[cast] Success Levels accumulated via Channelling (0-10)"
                    },
                    targetName: {
                        type: "string",
                        description: "[cast] Optional target character for the spell"
                    },
                    overcast: {
                        type: "boolean",
                        description: "[cast] Whether to overcast the spell for enhanced effect"
                    },
                    accumulatedSL: {
                        type: "number",
                        description: "[channel] Current accumulated SL from previous channelling"
                    },
                    severity: {
                        type: "string",
                        enum: ["minor", "major", "catastrophic"],
                        description: "[check-miscast] Severity of the miscast"
                    },
                    rollResult: {
                        type: "number",
                        description: "[check-miscast] Optional d100 roll result for specific miscast effect"
                    }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async execute(args: ManageArcaneMagicArgs) {
        this.logger.info("Executing manage-arcane-magic", { action: args.action });

        switch (args.action) {
            case "get-spells":
                return this.handleGetSpells(args);
            case "cast":
                return this.handleCast(args);
            case "channel":
                return this.handleChannel(args);
            case "check-miscast":
                return this.handleCheckMiscast(args);
            case "memorize":
                return this.handleMemorize(args);
            case "learn":
                return this.handleLearn(args);
        }
    }

    private async handleGetSpells(args: {
        characterName: string;
        lore?: string | undefined;
    }) {
        this.logger.info("Getting known spells", {
            characterName: args.characterName,
            lore: args.lore,
        });

        const response = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { actorName: args.characterName }
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

        const items = response.data.items || [];
        let spells = items.filter((item: any) => item.type === "spell");

        if (args.lore) {
            spells = spells.filter(
                (spell: any) =>
                    spell.system?.lore?.value?.toLowerCase() === args.lore?.toLowerCase()
            );
        }

        if (spells.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🔮 **No Spells Found**\n\n${args.characterName} ${args.lore ? `knows no ${args.lore} spells` : "has no known spells"}.`,
                    },
                ],
            };
        }

        // Group by lore
        const spellsByLore: Record<string, any[]> = {};
        for (const spell of spells) {
            const lore = spell.system?.lore?.value || "Unknown";
            if (!spellsByLore[lore]) {
                spellsByLore[lore] = [];
            }
            spellsByLore[lore].push(spell);
        }

        let resultText = `✨ **Known Spells for ${args.characterName}**\n\n`;
        resultText += `**Total Spells:** ${spells.length}\n\n`;

        for (const [lore, loreSpells] of Object.entries(spellsByLore)) {
            resultText += `🔮 **${lore.charAt(0).toUpperCase() + lore.slice(1)}** (${loreSpells.length})\n\n`;

            for (const spell of loreSpells) {
                resultText += `   📜 **${spell.name}**\n`;
                if (spell.system?.cn?.value !== undefined) {
                    resultText += `      CN: ${spell.system.cn.value}\n`;
                }
                if (spell.system?.range?.value) {
                    resultText += `      Range: ${spell.system.range.value}\n`;
                }
                if (spell.system?.target?.value) {
                    resultText += `      Target: ${spell.system.target.value}\n`;
                }
                if (spell.system?.duration?.value) {
                    resultText += `      Duration: ${spell.system.duration.value}\n`;
                }
                if (spell.system?.memorized?.value !== undefined) {
                    resultText += `      Memorized: ${spell.system.memorized.value ? "Yes" : "No"}\n`;
                }
                if (spell.system?.description?.value) {
                    const desc = spell.system.description.value.replace(/<[^>]*>/g, "").substring(0, 150);
                    resultText += `      Effect: ${desc}${spell.system.description.value.length > 150 ? "..." : ""}\n`;
                }
                resultText += `\n`;
            }
        }

        const intBonus = response.data.system?.characteristics?.int?.bonus || 0;
        const memorizedCount = spells.filter((s: any) => s.system?.memorized?.value).length;
        resultText += `\n**Memorization:** ${memorizedCount}/${intBonus} (Intelligence Bonus)\n`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleCast(args: {
        characterName: string;
        spellName: string;
        channelledSL: number;
        targetName?: string | undefined;
        overcast: boolean;
    }) {
        this.logger.info("Casting spell", {
            characterName: args.characterName,
            spellName: args.spellName,
        });

        // Get character and spell info
        const charResponse = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { actorName: args.characterName }
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

        const items = charResponse.data.items || [];
        const spell = items.find(
            (item: any) =>
                item.type === "spell" &&
                item.name.toLowerCase().includes(args.spellName.toLowerCase())
        );

        if (!spell) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ **Spell Not Found**\n\n${args.characterName} does not know the spell "${args.spellName}".\n\nKnown spells: ${items
                            .filter((i: any) => i.type === "spell")
                            .map((i: any) => i.name)
                            .join(", ") || "None"}`,
                    },
                ],
            };
        }

        const cn = spell.system?.cn?.value || 0;
        const lore = spell.system?.lore?.value || "Unknown";

        let resultText = `🔮 **Spell Casting**\n\n`;
        resultText += `**Wizard:** ${args.characterName}\n`;
        resultText += `**Spell:** ${spell.name}\n`;
        resultText += `**Lore:** ${lore}\n`;
        resultText += `**Casting Number (CN):** ${cn}\n`;
        if (args.channelledSL > 0) {
            resultText += `**Channelled SL:** +${args.channelledSL}\n`;
        }
        if (args.targetName) {
            resultText += `**Target:** ${args.targetName}\n`;
        }
        if (args.overcast) {
            resultText += `**Overcast:** Yes (enhanced effect, +1 CN)\n`;
        }
        resultText += `\n`;

        if (spell.system?.description?.value) {
            const desc = spell.system.description.value.replace(/<[^>]*>/g, "");
            resultText += `**Effect:**\n${desc}\n\n`;
        }

        resultText += `**Casting Process:**\n`;
        resultText += `1. Make Language (Magick) test in Foundry VTT\n`;
        resultText += `2. Add ${args.channelledSL > 0 ? `channelled SL (+${args.channelledSL})` : "any channelled SL"} to test result\n`;
        resultText += `3. Compare total SL to CN (${cn}${args.overcast ? " +1" : ""})\n`;
        resultText += `4. If SL ≥ CN: Spell succeeds, apply effects\n`;
        resultText += `5. If SL < CN: Spell fails, check for miscast\n\n`;

        resultText += `**Success Requirements:**\n`;
        resultText += `- Need ${cn}${args.overcast ? " +1" : ""} SL to cast successfully\n`;
        if (args.channelledSL > 0) {
            resultText += `- With channelled SL, need ${Math.max(0, cn - args.channelledSL)}${args.overcast ? " +1" : ""} more SL from Language test\n`;
        }
        resultText += `\n`;

        resultText += `**Modifiers:**\n`;
        resultText += `- Familiar present: +1 SL\n`;
        resultText += `- Quiet environment: +10 to test\n`;
        resultText += `- Combat/distraction: -10 to test\n`;
        resultText += `- Wounded: Additional penalties\n`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleChannel(args: {
        characterName: string;
        lore: string;
        accumulatedSL: number;
    }) {
        this.logger.info("Channelling power", {
            characterName: args.characterName,
            lore: args.lore,
        });

        const response = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { actorName: args.characterName }
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

        const wpBonus = response.data.system?.characteristics?.wp?.bonus || 0;

        let resultText = `🌀 **Channelling Power**\n\n`;
        resultText += `**Wizard:** ${args.characterName}\n`;
        resultText += `**Lore:** ${args.lore}\n`;
        resultText += `**Current Accumulated SL:** ${args.accumulatedSL}\n`;
        resultText += `**Maximum SL:** ${wpBonus} (Willpower Bonus)\n\n`;

        if (args.accumulatedSL >= wpBonus) {
            resultText += `⚠️ **Maximum Reached!**\n\n`;
            resultText += `${args.characterName} has reached their channelling limit. No more SL can be accumulated.\n\n`;
            resultText += `Use the accumulated ${args.accumulatedSL} SL to cast a spell, or lose it if distracted.`;
        } else {
            resultText += `**Next Steps:**\n`;
            resultText += `1. Make a Channelling (${args.lore}) test in Foundry VTT\n`;
            resultText += `2. On success: Add +1 SL to accumulated total\n`;
            resultText += `3. On failure: Lose all accumulated SL\n`;
            resultText += `4. Can accumulate ${wpBonus - args.accumulatedSL} more SL\n\n`;

            resultText += `**Channelling Rules:**\n`;
            resultText += `- Each successful test adds +1 SL\n`;
            resultText += `- Failed test loses all accumulated SL\n`;
            resultText += `- Takes 1 Action (1 round in combat)\n`;
            resultText += `- Requires concentration (distraction may break)\n`;
            resultText += `- Use accumulated SL to boost next casting test\n\n`;

            resultText += `**Benefits:**\n`;
            resultText += `- Increases chance of successful casting\n`;
            resultText += `- Can exceed spell's CN before casting\n`;
            resultText += `- Allows casting more difficult spells\n`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleCheckMiscast(args: {
        characterName: string;
        severity: string;
        rollResult?: number | undefined;
    }) {
        this.logger.info("Checking miscast", {
            characterName: args.characterName,
            severity: args.severity,
        });

        let resultText = `💥 **MISCAST!**\n\n`;
        resultText += `**Wizard:** ${args.characterName}\n`;
        resultText += `**Severity:** ${args.severity.charAt(0).toUpperCase() + args.severity.slice(1)}\n\n`;

        if (args.severity === "minor") {
            resultText += `⚡ **Minor Miscast** (SL -1 to -3)\n\n`;
            resultText += `**Possible Effects:**\n`;
            resultText += `- Spell fizzles harmlessly\n`;
            resultText += `- Wizard takes 1 Wound\n`;
            resultText += `- Lose 1d10 channelled SL\n`;
            resultText += `- -10 to next spellcasting test\n`;
            resultText += `- Minor magical phenomenon (lights flicker, wind gust)\n\n`;
            resultText += `Roll on Minor Miscast table in Foundry or rulebook.`;
        } else if (args.severity === "major") {
            resultText += `🔥 **Major Miscast** (SL -4 to -6)\n\n`;
            resultText += `**Possible Effects:**\n`;
            resultText += `- Spell backfires on caster\n`;
            resultText += `- Wizard takes 1d10 Wounds\n`;
            resultText += `- Lose all channelled SL\n`;
            resultText += `- Gain 1 Corruption point\n`;
            resultText += `- -20 to next spellcasting test\n`;
            resultText += `- Significant magical phenomenon (explosion, teleportation)\n\n`;
            resultText += `Roll on Major Miscast table in Foundry or rulebook.`;
        } else {
            resultText += `💀 **CATASTROPHIC MISCAST** (Critical failure or SL -7+)\n\n`;
            resultText += `**Dire Effects:**\n`;
            resultText += `- Spell explodes violently\n`;
            resultText += `- Wizard takes 2d10 Wounds\n`;
            resultText += `- All nearby take 1d10 Wounds\n`;
            resultText += `- Gain 1d10 Corruption points\n`;
            resultText += `- Risk of mutation\n`;
            resultText += `- Cannot cast spells for 1d10 rounds\n`;
            resultText += `- Reality-warping phenomenon (daemon manifestation, rift to Chaos)\n\n`;
            resultText += `⚠️ **EXTREME DANGER!** Roll on Catastrophic Miscast table in Foundry or rulebook.`;
        }

        if (args.rollResult) {
            resultText += `\n\n**Roll Result:** ${args.rollResult}\n`;
            resultText += `Check the appropriate miscast table for this specific result.`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleMemorize(args: {
        characterName: string;
        spellName: string;
    }) {
        this.logger.info("Memorizing spell", {
            characterName: args.characterName,
            spellName: args.spellName,
        });

        // Get character and spell
        const charResponse = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { actorName: args.characterName }
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

        const items = charResponse.data.items || [];
        const spell = items.find(
            (item: any) =>
                item.type === "spell" &&
                item.name.toLowerCase().includes(args.spellName.toLowerCase())
        );

        if (!spell) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ **Spell Not Found**\n\n${args.characterName} does not have "${args.spellName}" in their spellbook.`,
                    },
                ],
            };
        }

        const intBonus = charResponse.data.system?.characteristics?.int?.bonus || 0;
        const memorizedSpells = items.filter(
            (i: any) => i.type === "spell" && i.system?.memorized?.value
        );

        if (memorizedSpells.length >= intBonus && !spell.system?.memorized?.value) {
            return {
                content: [
                    {
                        type: "text",
                        text: `⚠️ **Memorization Limit Reached**\n\n${args.characterName} has memorized ${memorizedSpells.length}/${intBonus} spells (Intelligence Bonus).\n\nForget a spell first before memorizing a new one:\n${memorizedSpells.map((s: any) => `- ${s.name}`).join("\n")}`,
                    },
                ],
            };
        }

        // Update spell to memorized
        const updateResponse = await this.foundryClient.query(
            "warhammer-mcp.updateItem",
            {
                actorName: args.characterName,
                itemName: spell.name,
                updateData: {
                    "system.memorized.value": true,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to memorize spell: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `📖 **Spell Memorized**\n\n${args.characterName} has memorized **${spell.name}**.\n\n**Memorization:** ${memorizedSpells.length + 1}/${intBonus}\n\nThe spell is now ready to cast without consulting the spellbook.`,
                },
            ],
        };
    }

    private async handleLearn(args: {
        characterName: string;
        spellName: string;
        lore: string;
    }) {
        this.logger.info("Learning spell", {
            characterName: args.characterName,
            spellName: args.spellName,
        });

        // Try to find spell in compendium and add to character
        const response = await this.foundryClient.query(
            "warhammer-mcp.addItemFromCompendium",
            {
                actorName: args.characterName,
                itemName: args.spellName,
                compendiumType: "spell",
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to learn spell: ${response.error || "Unknown error"}\n\nMake sure the spell "${args.spellName}" exists in the WFRP4e spell compendiums.`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `✨ **Spell Learned**\n\n${args.characterName} has learned **${args.spellName}** from the Lore of ${args.lore}!\n\n**Note:** This typically costs 100 XP per spell in WFRP 4e. Deduct XP accordingly.\n\nThe spell is now in the character's spellbook and can be memorized for casting.`,
                },
            ],
        };
    }
}
