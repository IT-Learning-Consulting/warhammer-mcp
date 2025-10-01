import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class PrayerBlessingTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "get-active-blessings",
                description: `Get all active blessings and prayers affecting a WFRP 4e character.

WFRP Divine Magic System:
- Prayers are invocations to the gods for divine intervention
- Blessings are granted by priests to aid the faithful
- Each deity has specific prayers associated with their domain
- Prayer tests use the Pray skill
- Sin points can interfere with divine magic
- Miracles are powerful prayers requiring great faith

Prayer Requirements:
- Must worship the deity granting the prayer
- Some prayers require holy symbols or religious sites
- Sin or Corruption may prevent prayers from working
- Repeated failures may invoke divine wrath

Common Deities & Domains:
- Sigmar (Empire): Protection, Leadership, War
- Ulric (Winter): Wolves, Winter, Battle
- Shallya (Mercy): Healing, Compassion, Peace
- Morr (Death): Death, Dreams, Prophecy
- Ranald (Trickster): Luck, Fortune, Stealth

Returns: List of all active blessings with:
- Blessing/Prayer name
- Associated deity
- Duration and effects
- Conditions for maintaining blessing
- Divine favor status`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check for active blessings",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "invoke-prayer",
                description: `Invoke a prayer or blessing for a WFRP 4e character through divine magic.

Prayer Invocation Process:
1. Character makes a Pray test
2. Success: Prayer is granted, effects activate
3. Failure: Prayer is not heard, no effect
4. Critical Success: Miracle! Enhanced effect or divine favor
5. Critical Failure: Divine wrath or sin point gain

Prayer Test Modifiers:
- At holy site: +20
- Possessing holy symbol: +10
- During festival day: +10
- High Sin/Corruption: -10 to -30
- Opposed by enemy priest: Opposed test

Prayer Types:
- Blessings: Short-term bonuses (combat, skill tests)
- Protections: Ward against evil, disease, magic
- Healing: Restore wounds, cure disease, remove conditions
- Guidance: Divine insight, detect lies, find path
- Wrath: Smite enemies, banish undead, holy fire

Duration:
- Instant: Immediate effect (healing, smiting)
- Rounds: Combat duration (WP Bonus rounds)
- Minutes: Short-term blessing (WP Bonus minutes)
- Hours/Days: Long-term blessing (requires maintenance)

Example Prayers:
- "Blessing of Battle" (Sigmar): +10 to melee attacks
- "Cure Injury" (Shallya): Heal 1d10 wounds
- "Hoarfrost's Chill" (Ulric): Ice damage to enemies
- "Shield of Faith" (Any): +1 AP to all locations`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character invoking the prayer",
                        },
                        prayerName: {
                            type: "string",
                            description: "Name of the prayer or blessing being invoked",
                        },
                        deity: {
                            type: "string",
                            description: "Name of the deity being prayed to (e.g., 'Sigmar', 'Ulric', 'Shallya')",
                        },
                        difficulty: {
                            type: "string",
                            enum: ["easy", "average", "challenging", "difficult", "hard", "very-hard"],
                            description: "Difficulty of the Prayer test based on circumstances",
                        },
                        target: {
                            type: "string",
                            description: "Target of the prayer (self, ally name, or 'enemy')",
                        },
                    },
                    required: ["characterName", "prayerName", "deity", "difficulty"],
                },
            },
            {
                name: "check-divine-favor",
                description: `Check a character's divine favor, sin points, and standing with their deity in WFRP 4e.

Divine Favor System:
- Faith is measured through actions and devotion
- Sin points accumulate through transgressions
- High sin can block prayers or invoke divine wrath
- Penance and pilgrimage can restore favor

Sin Point Sources:
- Breaking deity's commandments
- Desecrating holy sites
- Failing critical prayer tests
- Killing deity's sacred animals/servants
- Worshipping rival or enemy gods

Sin Effects by Level:
- 1-2 Sin: Minor transgression (no effect)
- 3-5 Sin: Disfavored (-10 to Pray tests)
- 6-9 Sin: Forsaken (-20 to Pray tests, prayers may fail)
- 10+ Sin: Damned (prayers automatically fail, divine wrath)

Restoration Methods:
- Confession to priest (removes 1-2 sin)
- Penance quest (removes 3-5 sin)
- Sacred pilgrimage (removes 5+ sin)
- Heroic act in deity's name (removes all sin)

Returns detailed faith status:
- Current sin points
- Divine favor level
- Prayer test modifiers
- Required penance (if any)
- Deity relationship status`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check divine favor for",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "add-sin-point",
                description: `Add sin points to a WFRP 4e character for transgressions against their deity.

When to Add Sin:
- Breaking deity's core commandments
- Failing critical prayer tests
- Desecrating holy sites or symbols
- Harming deity's followers or creatures
- Blasphemy or apostasy

Sin Point Values:
- Minor transgression: 1 sin point
- Moderate offense: 2-3 sin points
- Major sacrilege: 4-5 sin points
- Unforgivable act: 6+ sin points

Consequences:
- Prayer tests become more difficult
- Divine magic may fail
- Deity may withdraw favor
- Divine wrath may be invoked
- Priests may shun the character

Deity-Specific Sins:
- Sigmar: Cowardice, breaking oaths, refusing to fight Chaos
- Ulric: Using ranged weapons, showing weakness, fleeing battle
- Shallya: Violence, causing suffering, refusing to heal
- Morr: Necromancy, disturbing the dead, preventing proper burial
- Ranald: Harming the poor, breaking promise to fellow rogue`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character gaining sin points",
                        },
                        sinPoints: {
                            type: "number",
                            description: "Number of sin points to add (1-10)",
                        },
                        reason: {
                            type: "string",
                            description: "Reason for the sin (e.g., 'Broke oath to Sigmar', 'Desecrated Ulric's shrine')",
                        },
                        deity: {
                            type: "string",
                            description: "Name of the offended deity",
                        },
                    },
                    required: ["characterName", "sinPoints", "reason", "deity"],
                },
            },
            {
                name: "perform-penance",
                description: `Perform penance to reduce sin points and restore divine favor in WFRP 4e.

Penance Options:
- Confession: Speak with priest, show remorse (removes 1-2 sin)
- Prayer Vigil: Night of prayer and fasting (removes 1 sin)
- Donation: Give money to temple (removes 1 sin per 10 GC)
- Service: Assist temple for days/weeks (removes 2-3 sin)
- Pilgrimage: Journey to holy site (removes 3-5 sin)
- Sacred Quest: Complete dangerous mission for deity (removes 5+ sin)

Penance Requirements:
- Must be sincere (roleplay required)
- May require time investment
- Some sins require specific penance
- Priest approval needed for major penance
- Repeated sins harder to cleanse

Success Conditions:
- Complete penance task
- Show genuine remorse
- Make restitution if applicable
- Avoid repeating the sin
- Gain priest's blessing

After Penance:
- Sin points reduced
- Prayer tests restored
- Divine favor regained
- May receive blessing
- Relationship with deity improves`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character performing penance",
                        },
                        penanceType: {
                            type: "string",
                            enum: ["confession", "vigil", "donation", "service", "pilgrimage", "quest"],
                            description: "Type of penance being performed",
                        },
                        sinReduction: {
                            type: "number",
                            description: "Number of sin points to remove (based on penance type)",
                        },
                        description: {
                            type: "string",
                            description: "Description of the penance performed",
                        },
                    },
                    required: ["characterName", "penanceType", "sinReduction", "description"],
                },
            },
            {
                name: "end-blessing",
                description: `End an active blessing or prayer effect on a WFRP 4e character.

Blessing Termination Reasons:
- Duration expired naturally
- Character chose to end it
- Conditions broken (sin gained, deity angered)
- Dispelled by enemy magic
- Character unconscious or dead
- Moved out of blessed area

When Ending Blessings:
- Remove all effects and bonuses
- Update character status
- Note reason for termination
- Check for lingering effects
- May need to re-invoke later

Some blessings fade gradually:
- Instant effects: Already completed
- Short duration: Sudden end
- Long duration: May fade over time
- Permanent: Require breaking conditions`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to remove blessing from",
                        },
                        blessingName: {
                            type: "string",
                            description: "Name of the blessing or prayer to end",
                        },
                        reason: {
                            type: "string",
                            description: "Reason for ending the blessing (e.g., 'Duration expired', 'Character gained sin')",
                        },
                    },
                    required: ["characterName", "blessingName", "reason"],
                },
            },
        ];
    }

    async handleGetActiveBlessings(args: { characterName: string }) {
        this.logger.info("Getting active blessings", { characterName: args.characterName });

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

        // Get prayer/blessing items
        const prayers = character.items?.filter(
            (item: any) => item.type === "prayer" || item.type === "blessing"
        ) || [];

        // Get active effects that might be blessings
        const activeEffects = character.effects?.filter(
            (effect: any) => !effect.disabled && effect.name?.toLowerCase().includes("blessing")
        ) || [];

        if (prayers.length === 0 && activeEffects.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🙏 **${character.name}** - Divine Status

✅ **NO ACTIVE BLESSINGS**

${character.name} has no active divine blessings or prayers currently affecting them. They may invoke prayers using the Pray skill or receive blessings from priests.

**Available Prayers:** ${prayers.length > 0 ? prayers.length : "None learned"}`,
                    },
                ],
            };
        }

        let blessingReport = `🙏 **${character.name}** - Divine Blessings & Prayers\n\n`;
        blessingReport += `✨ **BLESSED** - ${prayers.length + activeEffects.length} active divine effect(s)\n\n`;

        // Show active prayers/blessings
        if (prayers.length > 0) {
            blessingReport += `## Active Prayers & Blessings\n`;
            prayers.forEach((prayer: any, index: number) => {
                blessingReport += `### ${index + 1}. ${prayer.name}\n`;

                const deity = prayer.system?.god?.value || "Unknown deity";
                const range = prayer.system?.range?.value || "Self";
                const target = prayer.system?.target?.value || "Self";
                const duration = prayer.system?.duration?.value || "Instant";

                blessingReport += `**Deity:** ${deity}\n`;
                blessingReport += `**Range:** ${range}\n`;
                blessingReport += `**Target:** ${target}\n`;
                blessingReport += `**Duration:** ${duration}\n`;

                const description = prayer.system?.description?.value || "No description";
                blessingReport += `**Effect:** ${description}\n`;

                // Check if it's currently active
                const memorized = prayer.system?.memorized?.value;
                if (memorized) {
                    blessingReport += `✅ **Status:** Memorized and ready to invoke\n`;
                }

                blessingReport += `\n`;
            });
        }

        // Show active effects
        if (activeEffects.length > 0) {
            blessingReport += `## Active Divine Effects\n`;
            activeEffects.forEach((effect: any) => {
                blessingReport += `✨ **${effect.name}**\n`;
                if (effect.duration) {
                    const remaining = effect.duration.remaining || "Unknown";
                    blessingReport += `  Duration: ${remaining} remaining\n`;
                }
            });
            blessingReport += `\n`;
        }

        // Check sin points
        const sin = character.system?.status?.sin?.value || 0;
        if (sin > 0) {
            blessingReport += `---\n⚠️ **Sin Points:** ${sin}\n`;
            if (sin >= 10) {
                blessingReport += `🔴 **DAMNED** - Prayers automatically fail! Divine wrath imminent!\n`;
            } else if (sin >= 6) {
                blessingReport += `🟠 **FORSAKEN** - Prayers severely hindered (-20 to Pray tests)\n`;
            } else if (sin >= 3) {
                blessingReport += `🟡 **DISFAVORED** - Deity is displeased (-10 to Pray tests)\n`;
            }
        }

        // Prayer skill info
        const praySkill = character.items?.find(
            (item: any) => item.type === "skill" && item.name.toLowerCase().includes("pray")
        );

        if (praySkill) {
            const prayValue = praySkill.system?.total?.value || 0;
            blessingReport += `\n**Pray Skill:** ${prayValue}%\n`;
        }

        blessingReport += `\n💡 Use \`invoke-prayer\` to call upon divine intervention.\n`;

        return {
            content: [{ type: "text", text: blessingReport }],
        };
    }

    async handleInvokePrayer(args: {
        characterName: string;
        prayerName: string;
        deity: string;
        difficulty: string;
        target?: string;
    }) {
        this.logger.info("Invoking prayer", {
            characterName: args.characterName,
            prayerName: args.prayerName,
            deity: args.deity,
        });

        // Get character info
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

        // Check sin points
        const sin = character.system?.status?.sin?.value || 0;
        if (sin >= 10) {
            return {
                content: [
                    {
                        type: "text",
                        text: `⚡ **DIVINE WRATH!**

${args.characterName} attempts to invoke **${args.prayerName}** to ${args.deity}...

**PRAYER REJECTED!**

The heavens are silent. ${args.deity} has turned away from ${args.characterName} due to their grave sins (${sin} sin points).

🔴 **DAMNED STATUS:** All prayers automatically fail until penance is performed!

💀 **Divine Wrath:** The gods' fury manifests:
- Lose all active blessings
- Cannot invoke prayers
- May suffer divine punishment
- Must perform major penance to restore favor

Use \`perform-penance\` to seek redemption!`,
                    },
                ],
            };
        }

        // Get difficulty modifier
        const difficultyModifiers: Record<string, number> = {
            "easy": 40,
            "average": 20,
            "challenging": 0,
            "difficult": -10,
            "hard": -20,
            "very-hard": -30,
        };
        let modifier = difficultyModifiers[args.difficulty] || 0;

        // Apply sin modifier
        if (sin >= 6) {
            modifier -= 20;
        } else if (sin >= 3) {
            modifier -= 10;
        }

        // Make the Pray test
        const rollResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.rollSkill",
            {
                characterName: args.characterName,
                skillName: "Pray",
                modifier: modifier,
                testName: `Invoke ${args.prayerName}`,
            }
        );

        if (!rollResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to roll Pray test: ${rollResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const rollResult = rollResponse.data;
        const success = rollResult.success;
        const sl = rollResult.sl || 0;

        let resultText = `🙏 **Prayer Invocation** - ${args.prayerName}\n\n`;
        resultText += `**Invoker:** ${args.characterName}\n`;
        resultText += `**Deity:** ${args.deity}\n`;
        resultText += `**Difficulty:** ${args.difficulty.charAt(0).toUpperCase() + args.difficulty.slice(1)}\n`;
        resultText += `**Pray Test:** ${rollResult.roll} vs ${rollResult.target}\n`;
        resultText += `**Success Levels:** ${sl >= 0 ? "+" : ""}${sl}\n`;
        if (sin > 0) {
            resultText += `**Sin Penalty:** -${sin >= 6 ? 20 : 10} (${sin} sin points)\n`;
        }
        resultText += `\n`;

        if (success) {
            if (sl >= 6) {
                // Miracle!
                resultText += `✨ **MIRACLE!** ✨\n\n`;
                resultText += `${args.deity} answers ${args.characterName}'s prayer with overwhelming divine power!\n\n`;
                resultText += `**${args.prayerName}** manifests with miraculous effect:\n`;
                resultText += `- Effect magnified (double normal effect)\n`;
                resultText += `- Duration extended (x2 normal duration)\n`;
                resultText += `- Additional divine favor granted\n`;
                resultText += `- May affect additional targets\n\n`;
                resultText += `🌟 **Divine Favor Gained!** The gods smile upon ${args.characterName}.\n\n`;
                if (sin > 0) {
                    resultText += `💫 Your devotion has cleansed 1 sin point (${sin} → ${sin - 1})\n\n`;
                }
                resultText += `The prayer's effects are in full force. ${args.target ? `${args.target} receives the blessing.` : "The invoker is blessed."}`;
            } else {
                // Normal success
                resultText += `✅ **PRAYER GRANTED**\n\n`;
                resultText += `${args.deity} hears ${args.characterName}'s prayer and grants their request!\n\n`;
                resultText += `**${args.prayerName}** takes effect:\n`;
                resultText += `- Prayer successfully invoked\n`;
                resultText += `- Divine effects active\n`;
                resultText += `- ${args.target || "Invoker"} receives the blessing\n`;
                resultText += `- Success Level: +${sl} (enhanced effect)\n\n`;
                resultText += `The prayer's power flows through the faithful. Divine magic manifests as requested.`;
            }

            // Add blessing to character (if target is self or ally)
            const target = args.target || args.characterName;
            await this.foundryClient.query(
                "foundry-mcp-bridge.addItemToActor",
                {
                    actorName: target,
                    itemData: {
                        name: args.prayerName,
                        type: "blessing",
                        system: {
                            god: { value: args.deity },
                            description: { value: `Active blessing granted by ${args.deity}` },
                            duration: { value: "WP Bonus rounds" },
                        },
                    },
                }
            );
        } else {
            if (sl <= -6) {
                // Critical failure - Divine Wrath!
                resultText += `⚡ **CRITICAL FAILURE - DIVINE WRATH!**\n\n`;
                resultText += `${args.deity} not only rejects the prayer but is ANGERED by the presumption!\n\n`;
                resultText += `**Consequences:**\n`;
                resultText += `- Prayer spectacularly fails\n`;
                resultText += `- Gain ${Math.min(3, 10 - sin)} sin point(s)\n`;
                resultText += `- Divine disfavor (-20 to next Pray test)\n`;
                resultText += `- May suffer divine punishment:\n`;
                resultText += `  * Lose 1d10 Fate points\n`;
                resultText += `  * Cursed condition for 1d10 days\n`;
                resultText += `  * Physical manifestation (boils, marks)\n`;
                resultText += `  * Bad luck befalls the invoker\n\n`;
                resultText += `💀 The gods' displeasure is palpable. Seek penance immediately!\n\n`;
                resultText += `Use \`add-sin-point\` to track the transgression and \`perform-penance\` to seek forgiveness.`;
            } else {
                // Normal failure
                resultText += `❌ **PRAYER UNANSWERED**\n\n`;
                resultText += `${args.deity} does not respond to ${args.characterName}'s invocation.\n\n`;
                resultText += `The prayer fails to manifest:\n`;
                resultText += `- ${args.deity} did not hear or chose not to answer\n`;
                resultText += `- No divine effect occurs\n`;
                resultText += `- The faithful may try again\n`;
                resultText += `- Consider improving circumstances:\n`;
                resultText += `  * Find a holy site (+20)\n`;
                resultText += `  * Obtain holy symbol (+10)\n`;
                resultText += `  * Perform penance if sinful\n`;
                resultText += `  * Wait for auspicious timing\n\n`;
                resultText += `The gods' ways are mysterious. Sometimes faith is tested through silence.`;
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleCheckDivineFavor(args: { characterName: string }) {
        this.logger.info("Checking divine favor", { characterName: args.characterName });

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
        const sin = character.system?.status?.sin?.value || 0;

        let favorReport = `⚖️ **Divine Favor Status** - ${character.name}\n\n`;

        // Determine favor level
        let favorLevel = "";
        let favorEmoji = "";
        let favorDescription = "";
        let prayerModifier = 0;

        if (sin === 0) {
            favorLevel = "FAITHFUL";
            favorEmoji = "✅";
            favorDescription = "In good standing with the gods";
            prayerModifier = 0;
        } else if (sin <= 2) {
            favorLevel = "MINOR TRANSGRESSION";
            favorEmoji = "🟢";
            favorDescription = "Small sins, easily forgiven";
            prayerModifier = 0;
        } else if (sin <= 5) {
            favorLevel = "DISFAVORED";
            favorEmoji = "🟡";
            favorDescription = "The gods are displeased";
            prayerModifier = -10;
        } else if (sin <= 9) {
            favorLevel = "FORSAKEN";
            favorEmoji = "🟠";
            favorDescription = "Severely out of favor with the divine";
            prayerModifier = -20;
        } else {
            favorLevel = "DAMNED";
            favorEmoji = "🔴";
            favorDescription = "The gods have turned their backs";
            prayerModifier = -999; // Auto-fail
        }

        favorReport += `${favorEmoji} **Status:** ${favorLevel}\n`;
        favorReport += `**Sin Points:** ${sin}\n`;
        favorReport += `**Description:** ${favorDescription}\n\n`;

        if (sin > 0) {
            favorReport += `## Effects on Divine Magic\n`;
            if (sin >= 10) {
                favorReport += `🔴 **ALL PRAYERS AUTOMATICALLY FAIL**\n`;
                favorReport += `- Cannot invoke any divine magic\n`;
                favorReport += `- Active blessings are revoked\n`;
                favorReport += `- Divine wrath may manifest\n`;
                favorReport += `- Major penance required immediately\n`;
            } else if (sin >= 6) {
                favorReport += `🟠 **Severe Penalty:** ${prayerModifier} to all Pray tests\n`;
                favorReport += `- Prayers very difficult to invoke\n`;
                favorReport += `- May fail at critical moments\n`;
                favorReport += `- Pilgrimage or quest recommended\n`;
            } else if (sin >= 3) {
                favorReport += `🟡 **Moderate Penalty:** ${prayerModifier} to all Pray tests\n`;
                favorReport += `- Prayers hindered but possible\n`;
                favorReport += `- Penance will restore favor\n`;
            }

            favorReport += `\n## Penance Requirements\n`;
            if (sin >= 10) {
                favorReport += `**Required:** Sacred Quest or Pilgrimage to major holy site\n`;
                favorReport += `- Minimum ${sin - 5} penance actions needed\n`;
                favorReport += `- Must complete dangerous mission for deity\n`;
                favorReport += `- Or journey to holiest shrine and perform major ritual\n`;
            } else if (sin >= 6) {
                favorReport += `**Required:** Pilgrimage or extended service\n`;
                favorReport += `- ${Math.ceil(sin / 2)} penance actions needed\n`;
                favorReport += `- Visit holy site or serve temple for weeks\n`;
            } else if (sin >= 3) {
                favorReport += `**Required:** Confession and service\n`;
                favorReport += `- ${Math.ceil(sin / 2)} penance actions needed\n`;
                favorReport += `- Speak with priest and perform service\n`;
            } else {
                favorReport += `**Recommended:** Simple confession\n`;
                favorReport += `- 1-2 penance actions sufficient\n`;
                favorReport += `- Prayer vigil or donation\n`;
            }
        } else {
            favorReport += `✅ **No Penalties** - Prayers function normally\n\n`;
            favorReport += `${character.name} is in good standing with their deity. Continue to act in accordance with divine will to maintain this status.`;
        }

        // Check for deity information
        const deity = character.system?.details?.god?.value || "No deity chosen";
        favorReport += `\n\n---\n`;
        favorReport += `**Deity:** ${deity}\n`;

        // Prayer skill
        const praySkill = character.items?.find(
            (item: any) => item.type === "skill" && item.name.toLowerCase().includes("pray")
        );
        if (praySkill) {
            const prayValue = praySkill.system?.total?.value || 0;
            const effectiveValue = Math.max(0, prayValue + prayerModifier);
            favorReport += `**Pray Skill:** ${prayValue}% (Effective: ${effectiveValue}% with sin penalty)\n`;
        }

        favorReport += `\n💡 Use \`perform-penance\` to reduce sin points and restore divine favor.`;

        return {
            content: [{ type: "text", text: favorReport }],
        };
    }

    async handleAddSinPoint(args: {
        characterName: string;
        sinPoints: number;
        reason: string;
        deity: string;
    }) {
        this.logger.info("Adding sin points", {
            characterName: args.characterName,
            sinPoints: args.sinPoints,
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
        const currentSin = character.system?.status?.sin?.value || 0;
        const newSin = currentSin + args.sinPoints;

        // Update sin points
        const updateResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.updateActor",
            {
                actorName: args.characterName,
                updates: {
                    "system.status.sin.value": newSin,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to update sin points: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        let resultText = `⚠️ **SIN COMMITTED!**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Offense:** ${args.reason}\n`;
        resultText += `**Offended Deity:** ${args.deity}\n`;
        resultText += `**Sin Points Gained:** +${args.sinPoints}\n`;
        resultText += `**Previous Sin:** ${currentSin}\n`;
        resultText += `**Current Sin:** ${newSin}\n\n`;

        // Determine new status
        if (newSin >= 10 && currentSin < 10) {
            resultText += `🔴 **DAMNED!**\n\n`;
            resultText += `${args.characterName} has committed too many transgressions! ${args.deity} has completely forsaken them!\n\n`;
            resultText += `⚡ **DIVINE WRATH:**\n`;
            resultText += `- All prayers automatically fail\n`;
            resultText += `- Cannot receive blessings\n`;
            resultText += `- Active blessings revoked\n`;
            resultText += `- May suffer divine punishment\n`;
            resultText += `- Sacred quest required for redemption\n\n`;
            resultText += `💀 The character has crossed a terrible threshold. Only heroic penance can save them now!`;
        } else if (newSin >= 6 && currentSin < 6) {
            resultText += `🟠 **FORSAKEN!**\n\n`;
            resultText += `${args.deity} is gravely displeased with ${args.characterName}!\n\n`;
            resultText += `**Consequences:**\n`;
            resultText += `- -20 to all Pray tests\n`;
            resultText += `- Prayers likely to fail\n`;
            resultText += `- Divine magic severely hindered\n`;
            resultText += `- Pilgrimage or quest required\n\n`;
            resultText += `The character must seek major penance to restore their standing.`;
        } else if (newSin >= 3 && currentSin < 3) {
            resultText += `🟡 **DISFAVORED**\n\n`;
            resultText += `${args.deity} is displeased with ${args.characterName}'s actions.\n\n`;
            resultText += `**Consequences:**\n`;
            resultText += `- -10 to all Pray tests\n`;
            resultText += `- Divine magic weakened\n`;
            resultText += `- Penance recommended\n\n`;
            resultText += `Confession and service can restore favor.`;
        } else {
            resultText += `**Status:** Sin accumulating...\n\n`;
            if (newSin >= 8) {
                resultText += `⚠️ **WARNING:** Approaching damnation! ${10 - newSin} sin points away from total forsaking!\n\n`;
                resultText += `Seek penance immediately before it's too late!`;
            } else if (newSin >= 5) {
                resultText += `⚠️ Divine favor is slipping away. Perform penance soon to restore your standing.`;
            } else {
                resultText += `Minor transgressions can be forgiven through simple penance.`;
            }
        }

        resultText += `\n\n💡 Use \`perform-penance\` to seek redemption and reduce sin points.`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handlePerformPenance(args: {
        characterName: string;
        penanceType: string;
        sinReduction: number;
        description: string;
    }) {
        this.logger.info("Performing penance", {
            characterName: args.characterName,
            penanceType: args.penanceType,
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
        const currentSin = character.system?.status?.sin?.value || 0;
        const newSin = Math.max(0, currentSin - args.sinReduction);

        // Update sin points
        const updateResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.updateActor",
            {
                actorName: args.characterName,
                updates: {
                    "system.status.sin.value": newSin,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to update sin points: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const penanceNames: Record<string, string> = {
            "confession": "Confession",
            "vigil": "Prayer Vigil",
            "donation": "Temple Donation",
            "service": "Temple Service",
            "pilgrimage": "Sacred Pilgrimage",
            "quest": "Sacred Quest",
        };

        let resultText = `🙏 **PENANCE PERFORMED**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Penance Type:** ${penanceNames[args.penanceType] || args.penanceType}\n`;
        resultText += `**Description:** ${args.description}\n\n`;
        resultText += `**Previous Sin:** ${currentSin}\n`;
        resultText += `**Sin Reduced:** -${args.sinReduction}\n`;
        resultText += `**Current Sin:** ${newSin}\n\n`;

        if (newSin === 0) {
            resultText += `✨ **ABSOLUTION!** ✨\n\n`;
            resultText += `${args.characterName} has been completely absolved of their sins!\n\n`;
            resultText += `🌟 **Divine Favor Restored:**\n`;
            resultText += `- All prayer penalties removed\n`;
            resultText += `- Full divine magic access restored\n`;
            resultText += `- May receive blessing for devotion\n`;
            resultText += `- Character stands pure before the gods\n\n`;
            resultText += `The gods smile upon the truly penitent. ${args.characterName}'s faith has been proven through their actions.`;
        } else if (currentSin >= 10 && newSin < 10) {
            resultText += `💫 **REDEMPTION!**\n\n`;
            resultText += `${args.characterName} has been lifted from damnation!\n\n`;
            resultText += `While not fully absolved, the character is no longer forsaken:\n`;
            resultText += `- Prayers no longer auto-fail\n`;
            resultText += `- Divine magic partially restored\n`;
            resultText += `- ${newSin > 0 ? `Still has ${newSin} sin (${newSin >= 6 ? "-20" : newSin >= 3 ? "-10" : "no"} penalty)` : "Fully cleansed"}\n`;
            resultText += `- Continue penance to fully restore favor\n\n`;
            resultText += `The path back to grace is long, but ${args.characterName} has taken a crucial step.`;
        } else if (currentSin >= 6 && newSin < 6) {
            resultText += `🌅 **FAVOR IMPROVING**\n\n`;
            resultText += `${args.characterName}'s penance has been accepted!\n\n`;
            resultText += `**Status Improved:**\n`;
            resultText += `- Pray test penalty reduced (now ${newSin >= 3 ? "-10" : "none"})\n`;
            resultText += `- Divine magic more accessible\n`;
            resultText += `- ${newSin > 0 ? `${newSin} sin remaining` : "Fully cleansed"}\n\n`;
            resultText += `The gods recognize sincere repentance. Continue on the righteous path.`;
        } else if (currentSin >= 3 && newSin < 3) {
            resultText += `✅ **FAVOR RESTORED**\n\n`;
            resultText += `${args.characterName} is back in good standing!\n\n`;
            resultText += `**Benefits:**\n`;
            resultText += `- No prayer test penalties\n`;
            resultText += `- Divine magic functions normally\n`;
            resultText += `- ${newSin > 0 ? `Only ${newSin} minor sin(s) remaining` : "Completely cleansed"}\n\n`;
            resultText += `The character's devotion has been proven through their penance.`;
        } else {
            resultText += `📿 **Penance Accepted**\n\n`;
            resultText += `The gods acknowledge ${args.characterName}'s efforts to atone.\n\n`;
            if (newSin > 0) {
                resultText += `**Remaining Sin:** ${newSin} point(s)\n`;
                if (newSin >= 6) {
                    resultText += `Still requires ${Math.ceil((newSin - 5) / 3)} more major penance action(s) to lift forsaken status.\n`;
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

    async handleEndBlessing(args: {
        characterName: string;
        blessingName: string;
        reason: string;
    }) {
        this.logger.info("Ending blessing", {
            characterName: args.characterName,
            blessingName: args.blessingName,
        });

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.removeItemFromActor",
            {
                actorName: args.characterName,
                itemName: args.blessingName,
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to remove blessing: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `🌙 **Blessing Ended**

**${args.blessingName}** has faded from ${args.characterName}.

**Reason:** ${args.reason}

The divine power has left the character. All effects and bonuses from this blessing are no longer active.

${args.reason.toLowerCase().includes("sin") || args.reason.toLowerCase().includes("anger")
                            ? "⚠️ The blessing was revoked due to divine displeasure. Seek penance to restore favor."
                            : "The blessing served its purpose and has naturally concluded."}`,
                },
            ],
        };
    }
}
