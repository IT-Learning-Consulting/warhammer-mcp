import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Get blessings schema
const GetBlessingsSchema = z.object({
    action: z.literal("get-blessings"),
    characterName: z.string()
});

// Invoke prayer schema
const InvokePrayerSchema = z.object({
    action: z.literal("invoke"),
    characterName: z.string(),
    prayerName: z.string(),
    targetName: z.string().optional(),
    difficulty: z.enum(["easy", "average", "challenging", "difficult", "very-hard"]).optional()
});

// Check favor schema
const CheckFavorSchema = z.object({
    action: z.literal("check-favor"),
    characterName: z.string()
});

// Add sin schema
const AddSinSchema = z.object({
    action: z.literal("add-sin"),
    characterName: z.string(),
    amount: z.number().min(1).max(10).default(1),
    reason: z.string()
});

// Penance schema
const PenanceSchema = z.object({
    action: z.literal("penance"),
    characterName: z.string(),
    penanceType: z.string(),
    sinReduction: z.number().min(1).max(10)
});

// End blessing schema
const EndBlessingSchema = z.object({
    action: z.literal("end-blessing"),
    characterName: z.string(),
    blessingName: z.string()
});

const ManageDivineMagicSchema = z.discriminatedUnion("action", [
    GetBlessingsSchema,
    InvokePrayerSchema,
    CheckFavorSchema,
    AddSinSchema,
    PenanceSchema,
    EndBlessingSchema
]);

type ManageDivineMagicArgs = z.infer<typeof ManageDivineMagicSchema>;

export class ManageDivineMagicTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-divine-magic",
            description: `Manage divine magic for WFRP 4e priests and religious characters. Handle prayers, blessings, sin points, and divine favor.

**WFRP Divine Magic System:**
- Prayers are invocations to the gods for divine intervention
- Blessings are granted by priests to aid the faithful
- Sin points accumulate from transgressions and interfere with divine magic
- Penance can reduce sin and restore divine favor

**Actions:**
- **get-blessings**: List all active blessings/prayers on a character
- **invoke**: Cast a prayer or blessing (requires Pray skill test in Foundry)
- **check-favor**: Get sin points and divine standing
- **add-sin**: Add sin points for transgressions (minor: 1, moderate: 2-3, major: 4-10)
- **penance**: Perform penance to reduce sin (amount based on penance severity)
- **end-blessing**: Terminate an active blessing effect

**Common Deities & Domains:**
- Sigmar (Empire): Protection, Leadership, War
- Ulric (Winter): Wolves, Winter, Battle
- Shallya (Mercy): Healing, Compassion, Peace
- Morr (Death): Death, Dreams, Prophecy
- Ranald (Trickster): Luck, Fortune, Stealth

**Sin Thresholds:**
- 0-2: Good standing, no penalties
- 3-5: Minor sin, -10 to Pray tests
- 6-9: Major sin, -20 to Pray tests
- 10+: Forsaken, prayers auto-fail

**Example Usage:**
- Get active blessings: {action: "get-blessings", characterName: "Father Wilhelm"}
- Invoke prayer: {action: "invoke", characterName: "Father Wilhelm", prayerName: "Blessing of Battle", targetName: "Hans"}
- Check divine favor: {action: "check-favor", characterName: "Father Wilhelm"}
- Add sin: {action: "add-sin", characterName: "Father Wilhelm", amount: 2, reason: "Lied to temple superior"}
- Perform penance: {action: "penance", characterName: "Father Wilhelm", penanceType: "Prayer vigil all night", sinReduction: 2}
- End blessing: {action: "end-blessing", characterName: "Hans", blessingName: "Blessing of Battle"}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get-blessings", "invoke", "check-favor", "add-sin", "penance", "end-blessing"],
                        description: "The divine magic action to perform"
                    },
                    characterName: {
                        type: "string",
                        description: "Name of the character (priest or target)"
                    },
                    prayerName: {
                        type: "string",
                        description: "[invoke] Name of the prayer/blessing to invoke"
                    },
                    targetName: {
                        type: "string",
                        description: "[invoke] Optional target character for the blessing"
                    },
                    difficulty: {
                        type: "string",
                        enum: ["easy", "average", "challenging", "difficult", "very-hard"],
                        description: "[invoke] Prayer difficulty level"
                    },
                    amount: {
                        type: "number",
                        description: "[add-sin] Number of sin points to add (1-10)"
                    },
                    reason: {
                        type: "string",
                        description: "[add-sin] Reason for gaining sin"
                    },
                    penanceType: {
                        type: "string",
                        description: "[penance] Description of the penance performed"
                    },
                    sinReduction: {
                        type: "number",
                        description: "[penance] Number of sin points to remove (1-10)"
                    },
                    blessingName: {
                        type: "string",
                        description: "[end-blessing] Name of blessing to terminate"
                    }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async execute(args: ManageDivineMagicArgs) {
        this.logger.info("Executing manage-divine-magic", { action: args.action });

        switch (args.action) {
            case "get-blessings":
                return this.handleGetBlessings(args);
            case "invoke":
                return this.handleInvoke(args);
            case "check-favor":
                return this.handleCheckFavor(args);
            case "add-sin":
                return this.handleAddSin(args);
            case "penance":
                return this.handlePenance(args);
            case "end-blessing":
                return this.handleEndBlessing(args);
        }
    }

    private async handleGetBlessings(args: { characterName: string }) {
        this.logger.info("Getting active blessings", { characterName: args.characterName });

        const character = await this.foundryClient.query<any>(
            "warhammer-mcp.getCharacterInfo",
            { actorName: args.characterName }
        );

        const items = character.items || [];
        const blessings = items.filter(
            (item: any) => item.type === "prayer" || item.type === "blessing"
        );

        if (blessings.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🙏 **No Active Blessings**\n\n${args.characterName} currently has no active prayers or blessings.`,
                    },
                ],
            };
        }

        let resultText = `✨ **Active Blessings for ${args.characterName}**\n\n`;
        resultText += `**Total Active:** ${blessings.length}\n\n`;

        for (const blessing of blessings) {
            resultText += `🌟 **${blessing.name}**\n`;
            if (blessing.system?.god?.value) {
                resultText += `   Deity: ${blessing.system.god.value}\n`;
            }
            if (blessing.system?.range?.value) {
                resultText += `   Range: ${blessing.system.range.value}\n`;
            }
            if (blessing.system?.target?.value) {
                resultText += `   Target: ${blessing.system.target.value}\n`;
            }
            if (blessing.system?.duration?.value) {
                resultText += `   Duration: ${blessing.system.duration.value}\n`;
            }
            if (blessing.system?.description?.value) {
                const desc = blessing.system.description.value.replace(/<[^>]*>/g, "").substring(0, 200);
                resultText += `   Effect: ${desc}${blessing.system.description.value.length > 200 ? "..." : ""}\n`;
            }
            resultText += `\n`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleInvoke(args: {
        characterName: string;
        prayerName: string;
        targetName?: string | undefined;
        difficulty?: string | undefined;
    }) {
        this.logger.info("Invoking prayer", {
            characterName: args.characterName,
            prayerName: args.prayerName,
        });

        // First check if character has the prayer
        const charResponse = await this.foundryClient.query<any>(
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
        const prayer = items.find(
            (item: any) =>
                (item.type === "prayer" || item.type === "blessing") &&
                item.name.toLowerCase().includes(args.prayerName.toLowerCase())
        );

        if (!prayer) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ **Prayer Not Found**\n\n${args.characterName} does not know the prayer "${args.prayerName}".\n\nAvailable prayers: ${items
                            .filter((i: any) => i.type === "prayer" || i.type === "blessing")
                            .map((i: any) => i.name)
                            .join(", ") || "None"}`,
                    },
                ],
            };
        }

        // Prepare prayer invocation message
        let resultText = `🙏 **Prayer Invocation**\n\n`;
        resultText += `**Priest:** ${args.characterName}\n`;
        resultText += `**Prayer:** ${prayer.name}\n`;
        if (args.targetName) {
            resultText += `**Target:** ${args.targetName}\n`;
        }
        if (prayer.system?.god?.value) {
            resultText += `**Deity:** ${prayer.system.god.value}\n`;
        }
        if (args.difficulty) {
            resultText += `**Difficulty:** ${args.difficulty}\n`;
        }
        resultText += `\n`;

        if (prayer.system?.description?.value) {
            const desc = prayer.system.description.value.replace(/<[^>]*>/g, "");
            resultText += `**Effect:**\n${desc}\n\n`;
        }

        resultText += `**Next Steps:**\n`;
        resultText += `1. Make a Pray skill test in Foundry VTT\n`;
        resultText += `2. Apply difficulty modifiers if present\n`;
        resultText += `3. On success, apply prayer effects to ${args.targetName || args.characterName}\n`;
        resultText += `4. On failure, no effect occurs\n`;
        resultText += `5. On critical failure, may gain sin point\n\n`;

        resultText += `**Prayer Test Modifiers:**\n`;
        resultText += `- At holy site: +20\n`;
        resultText += `- Possessing holy symbol: +10\n`;
        resultText += `- During festival day: +10\n`;
        resultText += `- High Sin/Corruption: -10 to -30\n`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleCheckFavor(args: { characterName: string }) {
        this.logger.info("Checking divine favor", { characterName: args.characterName });

        const character = await this.foundryClient.query<any>(
            "warhammer-mcp.getCharacterInfo",
            { actorName: args.characterName }
        );

        const sinPoints = character.system?.status?.sin?.value || 0;
        const corruption = character.system?.status?.corruption?.value || 0;

        let status = "";
        let penalty = "";
        let icon = "";

        if (sinPoints >= 10) {
            status = "Forsaken by the Gods";
            penalty = "Prayers automatically fail";
            icon = "💀";
        } else if (sinPoints >= 6) {
            status = "Major Sinner";
            penalty = "-20 to all Pray tests";
            icon = "⚠️";
        } else if (sinPoints >= 3) {
            status = "Minor Sinner";
            penalty = "-10 to all Pray tests";
            icon = "⚡";
        } else {
            status = "Good Standing";
            penalty = "No penalties";
            icon = "✨";
        }

        let resultText = `${icon} **Divine Favor Status**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Sin Points:** ${sinPoints}/10\n`;
        resultText += `**Corruption:** ${corruption}\n`;
        resultText += `**Status:** ${status}\n`;
        resultText += `**Effect:** ${penalty}\n\n`;

        if (sinPoints >= 10) {
            resultText += `🔥 **FORSAKEN!**\n`;
            resultText += `The gods have turned their backs on this character. No divine magic will answer their prayers until they perform major penance.\n\n`;
            resultText += `**Required:** At least ${Math.ceil((sinPoints - 9) / 3)} major penance actions to lift forsaken status.\n`;
        } else if (sinPoints >= 6) {
            resultText += `⚠️ **Severe Sin:**\n`;
            resultText += `This character's transgressions are known to the gods. Divine magic is difficult and unreliable.\n\n`;
            resultText += `**Suggested:** ${Math.ceil((sinPoints - 5) / 3)} penance actions to improve standing.\n`;
        } else if (sinPoints >= 3) {
            resultText += `⚡ **Minor Sin:**\n`;
            resultText += `The character has committed minor transgressions. The gods are displeased but not wrathful.\n\n`;
            resultText += `**Suggested:** ${Math.ceil((sinPoints - 2) / 2)} penance actions to restore full favor.\n`;
        } else if (sinPoints > 0) {
            resultText += `📿 **Nearly Pure:**\n`;
            resultText += `Only minor sins remain. One simple penance should restore perfect standing.\n`;
        } else {
            resultText += `✨ **Perfect Standing:**\n`;
            resultText += `The character is pure before the gods. Divine magic flows freely through their prayers.\n`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleAddSin(args: {
        characterName: string;
        amount: number;
        reason: string;
    }) {
        this.logger.info("Adding sin points", {
            characterName: args.characterName,
            amount: args.amount,
        });

        // Get current sin
        const charResponse = await this.foundryClient.query<any>(
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

        const currentSin = charResponse.data.system?.status?.sin?.value || 0;
        const newSin = Math.min(10, currentSin + args.amount);

        // Update sin
        const updateResponse = await this.foundryClient.query<any>(
            "warhammer-mcp.updateActor",
            {
                actorName: args.characterName,
                updateData: {
                    "system.status.sin.value": newSin,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to update sin: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        let resultText = `⚡ **Sin Gained**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Transgression:** ${args.reason}\n`;
        resultText += `**Sin Added:** +${args.amount}\n`;
        resultText += `**Previous Sin:** ${currentSin}\n`;
        resultText += `**Current Sin:** ${newSin}\n\n`;

        // Status change warnings
        if (currentSin < 10 && newSin >= 10) {
            resultText += `💀 **FORSAKEN BY THE GODS!**\n\n`;
            resultText += `${args.characterName} has committed such grave sins that the gods refuse to answer their prayers!\n\n`;
            resultText += `**Effects:**\n`;
            resultText += `- All prayers automatically fail\n`;
            resultText += `- No divine magic will function\n`;
            resultText += `- Must perform major penance to restore any favor\n`;
            resultText += `- Other priests may shun or condemn them\n\n`;
            resultText += `The path back to grace is long and difficult. Immediate penance is required.`;
        } else if (currentSin < 6 && newSin >= 6) {
            resultText += `⚠️ **MAJOR SINNER STATUS**\n\n`;
            resultText += `${args.characterName}'s sins have become grievous in the eyes of the gods!\n\n`;
            resultText += `**New Penalties:**\n`;
            resultText += `- -20 to all Pray tests\n`;
            resultText += `- Divine magic is very difficult\n`;
            resultText += `- Risk of forsaken status if more sin accumulated\n`;
            resultText += `- ${10 - newSin} sin points from being forsaken\n\n`;
            resultText += `Penance is strongly recommended before the situation worsens.`;
        } else if (currentSin < 3 && newSin >= 3) {
            resultText += `⚡ **MINOR SINNER STATUS**\n\n`;
            resultText += `The gods are displeased with ${args.characterName}'s actions.\n\n`;
            resultText += `**New Penalties:**\n`;
            resultText += `- -10 to all Pray tests\n`;
            resultText += `- Divine magic is more difficult\n`;
            resultText += `- ${6 - newSin} sin points from major sinner status\n\n`;
            resultText += `Consider performing penance to restore favor.`;
        } else {
            resultText += `**Current Status:**\n`;
            if (newSin >= 6) {
                resultText += `Major Sinner (-20 to Pray tests)\n`;
                resultText += `${10 - newSin} sin points from forsaken status\n`;
            } else if (newSin >= 3) {
                resultText += `Minor Sinner (-10 to Pray tests)\n`;
                resultText += `${6 - newSin} sin points from major sinner status\n`;
            } else {
                resultText += `Good Standing (no penalties)\n`;
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handlePenance(args: {
        characterName: string;
        penanceType: string;
        sinReduction: number;
    }) {
        this.logger.info("Performing penance", {
            characterName: args.characterName,
            sinReduction: args.sinReduction,
        });

        // Get current sin
        const charResponse = await this.foundryClient.query<any>(
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

        const currentSin = charResponse.data.system?.status?.sin?.value || 0;
        const newSin = Math.max(0, currentSin - args.sinReduction);

        // Update sin
        const updateResponse = await this.foundryClient.query<any>(
            "warhammer-mcp.updateActor",
            {
                actorName: args.characterName,
                updateData: {
                    "system.status.sin.value": newSin,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to update sin: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        let resultText = `📿 **Penance Performed**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Penance:** ${args.penanceType}\n`;
        resultText += `**Sin Reduced:** -${args.sinReduction}\n`;
        resultText += `**Previous Sin:** ${currentSin}\n`;
        resultText += `**Current Sin:** ${newSin}\n\n`;

        // Status improvement messages
        if (newSin === 0 && currentSin > 0) {
            resultText += `✨ **FULLY ABSOLVED!**\n\n`;
            resultText += `${args.characterName} has been completely cleansed of sin!\n\n`;
            resultText += `**Benefits:**\n`;
            resultText += `- No prayer test penalties\n`;
            resultText += `- Full divine magic access restored\n`;
            resultText += `- May receive blessing for devotion\n`;
            resultText += `- Character stands pure before the gods\n\n`;
            resultText += `The gods smile upon the truly penitent.`;
        } else if (currentSin >= 10 && newSin < 10) {
            resultText += `💫 **REDEMPTION!**\n\n`;
            resultText += `${args.characterName} has been lifted from damnation!\n\n`;
            resultText += `While not fully absolved, the character is no longer forsaken:\n`;
            resultText += `- Prayers no longer auto-fail\n`;
            resultText += `- Divine magic partially restored\n`;
            resultText += `- ${newSin > 0 ? `Still has ${newSin} sin (${newSin >= 6 ? "-20" : newSin >= 3 ? "-10" : "no"} penalty)` : "Fully cleansed"}\n`;
            resultText += `- Continue penance to fully restore favor\n\n`;
            resultText += `The path back to grace is long, but a crucial step has been taken.`;
        } else if (currentSin >= 6 && newSin < 6) {
            resultText += `🌅 **FAVOR IMPROVING**\n\n`;
            resultText += `${args.characterName}'s penance has been accepted!\n\n`;
            resultText += `**Status Improved:**\n`;
            resultText += `- Pray test penalty reduced (now ${newSin >= 3 ? "-10" : "none"})\n`;
            resultText += `- Divine magic more accessible\n`;
            resultText += `- ${newSin > 0 ? `${newSin} sin remaining` : "Fully cleansed"}\n\n`;
            resultText += `The gods recognize sincere repentance.`;
        } else if (currentSin >= 3 && newSin < 3) {
            resultText += `✅ **FAVOR RESTORED**\n\n`;
            resultText += `${args.characterName} is back in good standing!\n\n`;
            resultText += `**Benefits:**\n`;
            resultText += `- No prayer test penalties\n`;
            resultText += `- Divine magic functions normally\n`;
            resultText += `- ${newSin > 0 ? `Only ${newSin} minor sin(s) remaining` : "Completely cleansed"}\n\n`;
            resultText += `Devotion has been proven through penance.`;
        } else {
            resultText += `📿 **Penance Accepted**\n\n`;
            resultText += `The gods acknowledge the effort to atone.\n\n`;
            if (newSin > 0) {
                resultText += `**Remaining Sin:** ${newSin} point(s)\n`;
                if (newSin >= 6) {
                    resultText += `Still requires ${Math.ceil((newSin - 5) / 3)} more major penance action(s) to lift major sinner status.\n`;
                } else if (newSin >= 3) {
                    resultText += `Requires ${Math.ceil((newSin - 2) / 2)} more penance action(s) to fully restore favor.\n`;
                } else {
                    resultText += `Nearly cleansed! One more simple penance should suffice.\n`;
                }
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleEndBlessing(args: {
        characterName: string;
        blessingName: string;
    }) {
        this.logger.info("Ending blessing", {
            characterName: args.characterName,
            blessingName: args.blessingName,
        });

        await this.foundryClient.query<any>(
            "warhammer-mcp.removeItemFromActor",
            {
                actorName: args.characterName,
                itemName: args.blessingName,
            }
        );

        return {
            content: [
                {
                    type: "text",
                    text: `🌙 **Blessing Ended**\n\n**${args.blessingName}** has faded from ${args.characterName}.\n\nThe divine power has left the character. All effects and bonuses from this blessing are no longer active.`,
                },
            ],
        };
    }
}
