import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class SpellMagicTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "get-known-spells",
                description: `Get all spells known by a WFRP 4e character, organized by lore.

WFRP Arcane Magic System:
- Spells are organized into Lores (schools of magic)
- Each spell has a Casting Number (CN) - difficulty to cast
- Channelling skill used to accumulate SL before casting
- Wizards can learn spells from multiple lores
- Memorization limits based on Intelligence Bonus

Common Lores of Magic:
- Lore of Fire (Aqshy): Flames, destruction, passion
- Lore of Metal (Chamon): Transformation, alchemy, metal
- Lore of Shadows (Ulgu): Illusion, misdirection, darkness
- Lore of Beasts (Ghur): Animals, primal nature, survival
- Lore of Heavens (Azyr): Divination, lightning, prophecy
- Lore of Life (Ghyran): Healing, growth, nature
- Lore of Light (Hysh): Banishment, truth, illumination
- Lore of Death (Shyish): Necromancy (often forbidden)

Spell Components:
- Casting Number (CN): Difficulty (0-20+)
- Range: Touch, feet, yards, miles
- Target: Individual, Area of Effect (AoE)
- Duration: Instant, Rounds, Minutes, Hours
- Ingredients: Material components (optional)

Returns comprehensive spell list with:
- Spell names and lores
- Casting Numbers
- Range, target, duration
- Memorization status
- Spell effects and descriptions`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the wizard/spellcaster to check",
                        },
                        lore: {
                            type: "string",
                            description: "Optional: Filter by specific lore (e.g., 'Fire', 'Shadow')",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "cast-spell",
                description: `Cast a spell using WFRP 4e magic rules with channelling and miscast checks.

WFRP Spell Casting Process:
1. Declare spell and target
2. Make Language (Magick) test
3. Compare SL to spell's Casting Number (CN)
4. If SL ≥ CN: Spell succeeds
5. If SL < CN: Spell fails, possible miscast

Channelling:
- Can use Channelling skill to accumulate SL first
- Each successful Channelling test adds +1 SL
- Maximum SL = Willpower Bonus
- Channelling takes time (rounds in combat)
- Can then add channelled SL to casting test

Casting Modifiers:
- Familiar present: +1 SL
- Quiet environment: +10 to test
- Combat/distraction: -10 to test
- Wounded: Penalties apply
- Multiple spells: Cumulative penalty

Critical Success (SL +6):
- Spell dramatically succeeds
- Enhanced effect
- No miscast risk
- May gain additional benefits

Failure & Miscast:
- Minor Miscast (failed by 0-2): Minor consequences
- Major Miscast (failed by 3-5): Serious effects
- Critical Miscast (failed by 6+): Catastrophic results

Miscast Effects:
- Minor: Headache, nosebleed, temporary weakness
- Major: Physical damage, Corruption, lose spell
- Critical: Mutation, summon daemon, explosion

Example Spells:
- "Blast" (Fire): CN 5, ranged damage
- "Aethyric Armor" (Metal): CN 3, +AP
- "Mindslip" (Shadow): CN 2, target forgets
- "Flight of Doom" (Heavens): CN 8, lightning`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the caster",
                        },
                        spellName: {
                            type: "string",
                            description: "Name of the spell being cast",
                        },
                        channelledSL: {
                            type: "number",
                            description: "Success Levels accumulated through Channelling (0 if none)",
                        },
                        target: {
                            type: "string",
                            description: "Target of the spell (enemy name, ally name, or 'self')",
                        },
                        modifier: {
                            type: "number",
                            description: "Additional modifier to the casting test (negative for penalties, positive for bonuses)",
                        },
                    },
                    required: ["characterName", "spellName"],
                },
            },
            {
                name: "channel-power",
                description: `Use the Channelling skill to accumulate magical power before casting in WFRP 4e.

Channelling Mechanics:
- Extended Test using Channelling (Lore) skill
- Each success adds +1 SL to next spell cast
- Maximum SL = Willpower Bonus
- Takes time (1 action per test in combat)
- Accumulated SL lost if interrupted

Channelling Process:
1. Declare which spell you're channelling for
2. Make Channelling test
3. Success: Gain +1 SL (cumulative)
4. Failure: No SL gained, but can try again
5. Critical Failure: Lose all accumulated SL

Strategic Use:
- Channel before combat for powerful first spell
- Build up SL for difficult high-CN spells
- Risk vs reward: channelling takes time
- Enemies may disrupt channelling

Channelling Modifiers:
- Quiet meditation: +20
- Combat: +0 (base difficulty)
- Wounded/distracted: -10 to -20
- Arcane locations: +10 to +20
- Opposing magical forces: -10 to -30

Maximum Channelling:
- Limited by Willpower Bonus
- WP 30 (Bonus 3) = max 3 SL
- WP 50 (Bonus 5) = max 5 SL
- Cannot exceed this limit

After Channelling:
- Use accumulated SL when casting spell
- SL adds directly to Language (Magick) test result
- Helps overcome high Casting Numbers
- One casting consumes all channelled SL`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character channelling power",
                        },
                        lore: {
                            type: "string",
                            description: "Lore of magic being channelled (e.g., 'Fire', 'Shadow')",
                        },
                        modifier: {
                            type: "number",
                            description: "Modifier to the Channelling test",
                        },
                    },
                    required: ["characterName", "lore"],
                },
            },
            {
                name: "check-miscast",
                description: `Determine miscast effects when a spell fails in WFRP 4e.

Miscast occurs when:
- Spell casting test fails
- Severity based on how badly failed (SL difference)
- More powerful spells = worse miscasts
- Corruption may increase miscast severity

Miscast Severity Levels:
- **Minor Miscast** (Failed by 0-2 SL):
  * Headache, nosebleed, fatigue
  * -10 to next casting test
  * Temporary minor effect
  * Usually no lasting damage

- **Major Miscast** (Failed by 3-5 SL):
  * Physical damage (1d10 wounds ignoring armor)
  * Gain 1-2 Corruption points
  * Lose memorized spell temporarily
  * Magical backlash affects nearby area
  * May gain Fatigued or Stunned condition

- **Critical Miscast** (Failed by 6+ SL):
  * Severe damage (2d10 wounds ignoring armor)
  * Gain 1d10 Corruption points
  * Roll on mutation table
  * Risk of summoning daemon
  * Magical explosion affects area
  * May permanently lose spell
  * Possible death or catastrophic effect

Factors Affecting Miscasts:
- High Corruption: Increases severity
- Multiple spells cast: Cumulative risk
- Powerful spells (high CN): Worse effects
- Tzeentch's Curse: Wizards attract chaos
- Location (unstable magic): Enhanced danger

Miscast Table (d100):
01-20: Minor effect (nosebleed, headache)
21-40: Moderate damage and condition
41-60: Corruption and spell loss
61-80: Mutation roll required
81-95: Daemonic manifestation
96-00: Catastrophic explosion

After Miscast:
- Character may be hesitant to cast
- Party wary of wizard's magic
- May attract witch hunters
- Corruption accumulates toward mutation`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the caster who miscasted",
                        },
                        spellName: {
                            type: "string",
                            description: "Name of the spell that miscasted",
                        },
                        failureLevel: {
                            type: "number",
                            description: "How badly the test failed (negative SL, e.g., -3 means failed by 3)",
                        },
                        castingNumber: {
                            type: "number",
                            description: "Casting Number of the spell (affects miscast severity)",
                        },
                    },
                    required: ["characterName", "spellName", "failureLevel", "castingNumber"],
                },
            },
            {
                name: "memorize-spell",
                description: `Memorize a spell for easier casting in WFRP 4e.

Spell Memorization:
- Wizards can memorize spells for quick access
- Memorized spells easier to recall and cast
- Limited by Intelligence Bonus
- Requires study time (hours or days)
- Can change memorized spells during downtime

Memorization Limits:
- Maximum memorized = Intelligence Bonus
- INT 30 (Bonus 3) = 3 spells
- INT 50 (Bonus 5) = 5 spells
- Must choose wisely for adventuring

Benefits of Memorization:
- Faster to cast (no grimoire needed)
- +10 to casting test
- Can cast even if grimoire lost
- Better for combat situations

Memorization Process:
1. Study spell in grimoire (1-2 hours)
2. Make Intelligence test
3. Success: Spell memorized
4. Failure: Can try again after rest

Forgetting Spells:
- Must "forget" a memorized spell to learn new one
- Instant process, no test required
- Can re-memorize later
- Spell still in grimoire

Strategic Choices:
- Combat spells vs utility spells
- Versatility vs specialization
- Party needs vs personal preference
- Dungeon delving vs social encounters

Common Memorized Loadouts:
- Combat Wizard: Damage, protection, utility
- Support Wizard: Healing, buffs, detection
- Infiltrator: Illusion, stealth, escape
- Generalist: Mix of all types`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the wizard memorizing the spell",
                        },
                        spellName: {
                            type: "string",
                            description: "Name of the spell to memorize",
                        },
                        forgetSpell: {
                            type: "string",
                            description: "Optional: Name of spell to forget to make room (if at memorization limit)",
                        },
                    },
                    required: ["characterName", "spellName"],
                },
            },
            {
                name: "learn-new-spell",
                description: `Learn a new spell and add it to the wizard's grimoire in WFRP 4e.

Learning Spells:
- Wizards acquire spells through study, research, or teachers
- Spells must be from lores the wizard knows
- Learning requires time and often money
- Must have access to spell source (scroll, grimoire, teacher)

Learning Methods:
- From Teacher: Easiest, requires payment and time
- From Scroll: Consumes scroll, Intelligence test
- From Another Grimoire: Copy spell, takes time
- Research: Create new spell (very difficult, advanced)

Learning Process:
1. Obtain spell source (scroll, book, teacher)
2. Study for required time (days or weeks)
3. Make Intelligence test
4. Pay costs (if applicable)
5. Success: Add to grimoire
6. Failure: Can retry after more study

Learning Costs:
- Teacher: 50-500 GC depending on spell power
- Scroll: Free but consumes scroll
- Copy: Time and materials (10-50 GC)
- Research: Months of work, very expensive

Time Required:
- Petty Magic: 1 day
- CN 0-4: 1 week
- CN 5-9: 2 weeks
- CN 10-14: 1 month
- CN 15+: 2+ months

Restrictions:
- Must know the lore
- Some spells require prerequisites
- Forbidden spells (Necromancy) risky
- Guild/College approval may be needed

Adding to Grimoire:
- Spell permanently known
- Can be cast anytime (with grimoire)
- Can be memorized later
- Part of wizard's repertoire`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the wizard learning the spell",
                        },
                        spellName: {
                            type: "string",
                            description: "Name of the spell being learned",
                        },
                        lore: {
                            type: "string",
                            description: "Lore the spell belongs to (e.g., 'Fire', 'Shadow')",
                        },
                        castingNumber: {
                            type: "number",
                            description: "Casting Number of the spell (0-20+)",
                        },
                        source: {
                            type: "string",
                            enum: ["teacher", "scroll", "grimoire", "research"],
                            description: "How the spell is being learned",
                        },
                    },
                    required: ["characterName", "spellName", "lore", "castingNumber", "source"],
                },
            },
        ];
    }

    async handleGetKnownSpells(args: { characterName: string; lore?: string }) {
        this.logger.info("Getting known spells", { characterName: args.characterName });

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

        // Get spells
        let spells = character.items?.filter(
            (item: any) => item.type === "spell"
        ) || [];

        // Filter by lore if specified
        if (args.lore) {
            spells = spells.filter((spell: any) =>
                spell.system?.lore?.value?.toLowerCase().includes(args.lore!.toLowerCase())
            );
        }

        if (spells.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🔮 **${character.name}** - Spell Knowledge

${args.lore ? `No spells known from Lore of ${args.lore}.` : "No spells known."}

${character.name} has not yet learned any arcane spells. Wizards learn spells through study, teachers, or discovering spell scrolls and grimoires.`,
                    },
                ],
            };
        }

        // Group spells by lore
        const spellsByLore: Record<string, any[]> = {};
        spells.forEach((spell: any) => {
            const lore = spell.system?.lore?.value || "Unknown Lore";
            if (!spellsByLore[lore]) {
                spellsByLore[lore] = [];
            }
            spellsByLore[lore].push(spell);
        });

        let spellReport = `🔮 **${character.name}** - Grimoire & Spell Knowledge\n\n`;
        spellReport += `📚 **Total Spells Known:** ${spells.length}\n`;

        // Get Intelligence Bonus for memorization limit
        const intelligence = character.system?.characteristics?.int?.value || 0;
        const intBonus = Math.floor(intelligence / 10);
        const memorizedCount = spells.filter((s: any) => s.system?.memorized?.value).length;

        spellReport += `💭 **Memorization:** ${memorizedCount} / ${intBonus} (Intelligence Bonus)\n\n`;

        // List spells by lore
        Object.keys(spellsByLore).sort().forEach((lore) => {
            const loreSpells = spellsByLore[lore];
            spellReport += `## ${lore} (${loreSpells.length} spell${loreSpells.length !== 1 ? 's' : ''})\n`;

            loreSpells.forEach((spell: any) => {
                const cn = spell.system?.cn?.value || 0;
                const range = spell.system?.range?.value || "Self";
                const target = spell.system?.target?.value || "Self";
                const duration = spell.system?.duration?.value || "Instant";
                const memorized = spell.system?.memorized?.value ? "💭" : "";

                spellReport += `${memorized} **${spell.name}** (CN ${cn})\n`;
                spellReport += `  Range: ${range} | Target: ${target} | Duration: ${duration}\n`;

                const description = spell.system?.description?.value || "";
                if (description) {
                    const shortDesc = description.length > 100
                        ? description.substring(0, 100) + "..."
                        : description;
                    spellReport += `  ${shortDesc}\n`;
                }
                spellReport += `\n`;
            });
        });

        // Magic skills
        spellReport += `---\n## Magical Skills\n`;

        const languageMagick = character.items?.find(
            (item: any) => item.type === "skill" && item.name.toLowerCase().includes("language") && item.name.toLowerCase().includes("magick")
        );
        if (languageMagick) {
            const value = languageMagick.system?.total?.value || 0;
            spellReport += `🗣️ **Language (Magick):** ${value}% (used for casting)\n`;
        }

        const channelling = character.items?.find(
            (item: any) => item.type === "skill" && item.name.toLowerCase().includes("channelling")
        );
        if (channelling) {
            const value = channelling.system?.total?.value || 0;
            spellReport += `⚡ **Channelling:** ${value}% (accumulate SL before casting)\n`;
        }

        // Willpower for max channelling
        const willpower = character.system?.characteristics?.wp?.value || 0;
        const wpBonus = Math.floor(willpower / 10);
        spellReport += `\n**Willpower:** ${willpower} (Bonus: ${wpBonus}) - Max Channelling SL: ${wpBonus}\n`;

        spellReport += `\n💡 Use \`cast-spell\` to invoke magic or \`channel-power\` to accumulate SL first.\n`;
        spellReport += `💡 Use \`memorize-spell\` to prepare spells for easier casting (max ${intBonus}).`;

        return {
            content: [{ type: "text", text: spellReport }],
        };
    }

    async handleCastSpell(args: {
        characterName: string;
        spellName: string;
        channelledSL?: number;
        target?: string;
        modifier?: number;
    }) {
        this.logger.info("Casting spell", {
            characterName: args.characterName,
            spellName: args.spellName,
        });

        // Get character and spell info
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

        // Find the spell
        const spell = character.items?.find(
            (item: any) => item.type === "spell" && item.name === args.spellName
        );

        if (!spell) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Spell "${args.spellName}" not found in ${args.characterName}'s grimoire.`,
                    },
                ],
            };
        }

        const cn = spell.system?.cn?.value || 0;
        const lore = spell.system?.lore?.value || "Unknown";
        const memorized = spell.system?.memorized?.value || false;
        const channelledSL = args.channelledSL || 0;
        const modifier = (args.modifier || 0) + (memorized ? 10 : 0);

        // Make Language (Magick) test
        const rollResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.rollSkill",
            {
                characterName: args.characterName,
                skillName: "Language (Magick)",
                modifier: modifier,
                testName: `Cast ${args.spellName}`,
            }
        );

        if (!rollResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to roll casting test: ${rollResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const rollResult = rollResponse.data;
        const rollSL = rollResult.sl || 0;
        const totalSL = rollSL + channelledSL;
        const success = totalSL >= cn;

        let resultText = `🔮 **Spell Casting** - ${args.spellName}\n\n`;
        resultText += `**Caster:** ${args.characterName}\n`;
        resultText += `**Lore:** ${lore}\n`;
        resultText += `**Casting Number:** ${cn}\n`;
        resultText += `**Memorized:** ${memorized ? "Yes (+10)" : "No"}\n`;
        if (channelledSL > 0) {
            resultText += `**Channelled SL:** +${channelledSL}\n`;
        }
        resultText += `**Language (Magick) Test:** ${rollResult.roll} vs ${rollResult.target}\n`;
        resultText += `**Roll SL:** ${rollSL >= 0 ? "+" : ""}${rollSL}\n`;
        resultText += `**Total SL:** ${totalSL >= 0 ? "+" : ""}${totalSL}\n`;
        resultText += `**Target:** ${args.target || "Self"}\n\n`;

        if (success) {
            const excessSL = totalSL - cn;

            if (excessSL >= 6) {
                // Critical Success - Miracle!
                resultText += `✨ **CRITICAL SUCCESS - MAGICAL MIRACLE!** ✨\n\n`;
                resultText += `${args.characterName} weaves the winds of magic with perfect mastery!\n\n`;
                resultText += `**${args.spellName}** manifests with overwhelming power:\n`;
                resultText += `- Effect DOUBLED or greatly enhanced\n`;
                resultText += `- Duration extended (x2)\n`;
                resultText += `- Area increased\n`;
                resultText += `- Additional targets may be affected\n`;
                resultText += `- NO risk of miscast\n`;
                resultText += `- Spell looks spectacular and impressive\n\n`;
                resultText += `🌟 The raw power of magic bends to the wizard's will! The spell's effects far exceed normal expectations.`;
            } else {
                // Normal Success
                resultText += `✅ **SPELL SUCCESSFULLY CAST**\n\n`;
                resultText += `${args.characterName} successfully channels the winds of magic!\n\n`;
                resultText += `**${args.spellName}** takes effect as intended:\n`;
                resultText += `- Spell manifests successfully\n`;
                resultText += `- Effects active on ${args.target || "caster"}\n`;
                resultText += `- Excess SL: +${excessSL} (enhanced effect)\n\n`;

                const description = spell.system?.description?.value || "Magical effect occurs";
                resultText += `**Effect:** ${description}\n\n`;
                resultText += `The arcane energies coalesce perfectly. Magic flows as commanded.`;
            }
        } else {
            // Failed - Miscast!
            const failedBy = Math.abs(totalSL - cn);

            resultText += `❌ **CASTING FAILED - MISCAST!**\n\n`;
            resultText += `The spell slips from ${args.characterName}'s control!\n\n`;
            resultText += `**Failed Casting:**\n`;
            resultText += `- Required: ${cn} SL\n`;
            resultText += `- Achieved: ${totalSL} SL\n`;
            resultText += `- Failed by: ${failedBy} SL\n\n`;

            // Determine miscast severity
            let severity = "";
            let effects = "";

            if (failedBy <= 2) {
                severity = "🟡 **MINOR MISCAST**";
                effects = `**Effects:**\n`;
                effects += `- Headache and nosebleed\n`;
                effects += `- -10 to next casting test\n`;
                effects += `- Spell energy dissipates harmlessly\n`;
                effects += `- Minor magical backlash (flickering lights, cold breeze)\n`;
                effects += `- No lasting damage\n\n`;
                effects += `The wizard shakes off the failed casting. A learning experience.`;
            } else if (failedBy <= 5) {
                severity = "🟠 **MAJOR MISCAST**";
                effects = `**Serious Effects:**\n`;
                effects += `- Take 1d10 wounds (ignoring armor)\n`;
                effects += `- Gain 1-2 Corruption points\n`;
                effects += `- Lose spell temporarily (forget until rest)\n`;
                effects += `- Magical backlash affects area (lights explode, cold wave)\n`;
                effects += `- May gain Fatigued or Stunned condition\n`;
                effects += `- -20 to next casting test\n\n`;
                effects += `⚠️ The winds of magic lash back violently! Use \`check-miscast\` for detailed effects.`;
            } else {
                severity = "🔴 **CRITICAL MISCAST - CATASTROPHIC!**";
                effects = `**CATASTROPHIC EFFECTS:**\n`;
                effects += `- Take 2d10 wounds (ignoring armor)\n`;
                effects += `- Gain 1d10 Corruption points (roll mutation table!)\n`;
                effects += `- Risk of summoning a daemon\n`;
                effects += `- Magical explosion affects large area (everyone nearby)\n`;
                effects += `- May PERMANENTLY lose the spell\n`;
                effects += `- Unconscious or death possible\n`;
                effects += `- Reality tears, strange phenomena\n\n`;
                effects += `💀 **EXTREME DANGER!** The fabric of reality rebels against the failed magic!\n`;
                effects += `Use \`check-miscast\` immediately to determine full catastrophic effects!`;
            }

            resultText += `${severity}\n\n${effects}`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleChannelPower(args: {
        characterName: string;
        lore: string;
        modifier?: number;
    }) {
        this.logger.info("Channelling power", {
            characterName: args.characterName,
            lore: args.lore,
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
        const willpower = character.system?.characteristics?.wp?.value || 0;
        const wpBonus = Math.floor(willpower / 10);

        // Make Channelling test
        const rollResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.rollSkill",
            {
                characterName: args.characterName,
                skillName: `Channelling (${args.lore})`,
                modifier: args.modifier || 0,
                testName: `Channel ${args.lore} Magic`,
            }
        );

        if (!rollResponse.success) {
            // Try generic Channelling if specific lore not found
            const genericResponse = await this.foundryClient.query(
                "foundry-mcp-bridge.rollSkill",
                {
                    characterName: args.characterName,
                    skillName: "Channelling",
                    modifier: args.modifier || 0,
                    testName: `Channel ${args.lore} Magic`,
                }
            );

            if (!genericResponse.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to roll Channelling test: ${genericResponse.error || "Unknown error"}`,
                        },
                    ],
                };
            }
        }

        const rollResult = rollResponse.success ? rollResponse.data : await this.foundryClient.query("foundry-mcp-bridge.rollSkill", {
            characterName: args.characterName,
            skillName: "Channelling",
            modifier: args.modifier || 0,
            testName: `Channel ${args.lore} Magic`,
        }).then(r => r.data);

        const success = rollResult.success;
        const sl = rollResult.sl || 0;

        let resultText = `⚡ **Channelling Power** - Lore of ${args.lore}\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Channelling Test:** ${rollResult.roll} vs ${rollResult.target}\n`;
        resultText += `**Success Levels:** ${sl >= 0 ? "+" : ""}${sl}\n`;
        resultText += `**Maximum SL:** ${wpBonus} (Willpower Bonus)\n\n`;

        if (success) {
            if (sl >= 4) {
                resultText += `✨ **EXCELLENT CHANNELLING!**\n\n`;
                resultText += `${args.characterName} draws deep from the winds of magic!\n\n`;
                resultText += `**Gained:** +${Math.min(2, wpBonus)} SL (bonus for excellent roll)\n`;
                resultText += `- Magical energy surges powerfully\n`;
                resultText += `- Add this SL to next spell casting\n`;
                resultText += `- Can continue channelling (max ${wpBonus} total)\n\n`;
                resultText += `💫 The winds of ${args.lore} flow strongly through the caster!`;
            } else {
                resultText += `✅ **CHANNELLING SUCCESSFUL**\n\n`;
                resultText += `${args.characterName} gathers magical power.\n\n`;
                resultText += `**Gained:** +1 SL\n`;
                resultText += `- Add this to next spell casting\n`;
                resultText += `- Can continue channelling (max ${wpBonus} total)\n`;
                resultText += `- Takes 1 action in combat\n\n`;
                resultText += `The winds of magic respond to the wizard's call.`;
            }

            resultText += `\n\n**Strategic Notes:**\n`;
            resultText += `- Accumulated SL adds to Language (Magick) test when casting\n`;
            resultText += `- Channel multiple times to reach high Casting Numbers\n`;
            resultText += `- Lost if interrupted or taking damage\n`;
            resultText += `- All SL consumed on next casting (success or fail)\n\n`;
            resultText += `💡 When ready, use \`cast-spell\` and specify your channelledSL.`;
        } else {
            if (sl <= -4) {
                resultText += `❌ **CRITICAL FAILURE!**\n\n`;
                resultText += `${args.characterName} loses control of the magical energies!\n\n`;
                resultText += `**Consequences:**\n`;
                resultText += `- All previously accumulated SL LOST\n`;
                resultText += `- Take 1d10 wounds from magical backlash\n`;
                resultText += `- Fatigued condition applied\n`;
                resultText += `- Cannot channel again this round\n`;
                resultText += `- May have attracted unwanted attention\n\n`;
                resultText += `⚠️ The winds of magic rebel and strike back!`;
            } else {
                resultText += `❌ **CHANNELLING FAILED**\n\n`;
                resultText += `The winds of ${args.lore} slip through ${args.characterName}'s grasp.\n\n`;
                resultText += `**Result:**\n`;
                resultText += `- No SL gained this attempt\n`;
                resultText += `- Previous SL maintained (if any)\n`;
                resultText += `- Can try again next action\n`;
                resultText += `- Takes 1 action in combat\n\n`;
                resultText += `The magic resists, but the caster can try again.`;
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleCheckMiscast(args: {
        characterName: string;
        spellName: string;
        failureLevel: number;
        castingNumber: number;
    }) {
        this.logger.info("Checking miscast", {
            characterName: args.characterName,
            spellName: args.spellName,
            failureLevel: args.failureLevel,
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
        const corruption = character.system?.status?.corruption?.value || 0;
        const failedBy = Math.abs(args.failureLevel);

        // Determine severity (corruption makes it worse)
        let severity = "";
        let severityLevel = 0;

        if (failedBy <= 2) {
            severityLevel = 1;
            severity = "MINOR MISCAST";
        } else if (failedBy <= 5) {
            severityLevel = 2;
            severity = "MAJOR MISCAST";
        } else {
            severityLevel = 3;
            severity = "CRITICAL MISCAST";
        }

        // Corruption increases severity
        if (corruption >= 6) {
            severityLevel = Math.min(3, severityLevel + 1);
        }

        let resultText = `💥 **MISCAST EFFECTS** - ${args.spellName}\n\n`;
        resultText += `**Caster:** ${args.characterName}\n`;
        resultText += `**Failed By:** ${failedBy} SL\n`;
        resultText += `**Casting Number:** ${args.castingNumber}\n`;
        resultText += `**Corruption:** ${corruption} ${corruption >= 6 ? "(INCREASES SEVERITY)" : ""}\n`;
        resultText += `**Severity:** ${severity}\n\n`;

        // Roll d100 for specific effect
        const d100 = Math.floor(Math.random() * 100) + 1;
        resultText += `**Miscast Roll:** ${d100}\n\n`;

        let effect = "";

        if (severityLevel === 1) {
            // Minor Miscast
            if (d100 <= 20) {
                effect = `**Nosebleed:**\n- Blood streams from nose\n- -10 to next casting test\n- Looks concerning but harmless\n- Wipes away in a minute`;
            } else if (d100 <= 40) {
                effect = `**Headache:**\n- Splitting headache\n- -10 to all Intelligence tests for 1 hour\n- -5 to casting tests\n- Aspirin helps (if available)`;
            } else if (d100 <= 60) {
                effect = `**Magical Discharge:**\n- Harmless sparks and flashes\n- Hair stands on end\n- Nearby candles flicker\n- Minor property damage`;
            } else if (d100 <= 80) {
                effect = `**Temporary Weakness:**\n- Fatigued condition for 10 minutes\n- -10 to physical tests\n- Need to catch breath\n- Rest helps`;
            } else {
                effect = `**Magical Hiccups:**\n- Random magical sparks when speaking\n- -10 to social tests for 1 hour\n- Harmless but embarrassing\n- Color changes with each hiccup`;
            }
        } else if (severityLevel === 2) {
            // Major Miscast
            if (d100 <= 20) {
                effect = `**Magical Backlash:**\n- Take 1d10 wounds (ignoring armor)\n- Knocked back 1d10 feet\n- Stunned for 1 round\n- Roll 1d10 for wounds: ${Math.floor(Math.random() * 10) + 1} wounds taken!`;
            } else if (d100 <= 40) {
                effect = `**Corruption Surge:**\n- Gain 2 Corruption points\n- Physical marks appear (veins darken, eyes glow)\n- -10 to Fellowship tests until corruption cleansed\n- Check corruption threshold!`;
            } else if (d100 <= 60) {
                effect = `**Spell Burned Out:**\n- Lose ${args.spellName} temporarily\n- Cannot cast this spell until completing 8 hours rest\n- Grimoire page smolders but not destroyed\n- Painful lesson learned`;
            } else if (d100 <= 80) {
                effect = `**Area Backlash:**\n- Everyone within 10 feet takes 1d10 damage\n- Random magical effects in area\n- Items may be damaged\n- Party will NOT be happy\n- Roll 1d10: ${Math.floor(Math.random() * 10) + 1} damage to area!`;
            } else {
                effect = `**Magical Overload:**\n- Fatigued AND Stunned conditions\n- Cannot cast spells for 1 hour\n- -20 to all tests for 10 minutes\n- Physical collapse (may fall unconscious)`;
            }
        } else {
            // Critical Miscast
            if (d100 <= 20) {
                effect = `**CATASTROPHIC EXPLOSION:**\n- Take 2d10 wounds (ignoring armor)\n- Everyone within 20 feet takes 1d10 wounds\n- Structure damage (roof/walls may collapse)\n- Magical shockwave visible for miles\n- Roll 2d10: ${Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1} wounds taken!\n- ⚠️ This could be fatal!`;
            } else if (d100 <= 40) {
                effect = `**CORRUPTION SURGE:**\n- Gain 1d10 Corruption points\n- IMMEDIATE mutation roll required!\n- Physical transformation begins\n- May attract Chaos attention\n- Roll 1d10: ${Math.floor(Math.random() * 10) + 1} corruption gained!\n- 💀 Check mutation table NOW!`;
            } else if (d100 <= 60) {
                effect = `**DAEMONIC MANIFESTATION:**\n- Tear in reality opens\n- Lesser daemon summoned (hostile to all!)\n- Combat begins immediately\n- Daemon bound to this location\n- May spread corruption\n- 🔥 EXTREME DANGER! Initiative roll!`;
            } else if (d100 <= 80) {
                effect = `**SPELL PERMANENTLY LOST:**\n- ${args.spellName} ERASED from grimoire\n- Pages crumble to ash\n- Cannot relearn for 1d10 months\n- Knowledge burned from mind\n- Psychological trauma (-10 WP for week)\n- 💔 The spell is gone forever (for now)`;
            } else {
                effect = `**REALITY TEAR:**\n- Rift to Realm of Chaos opens\n- Warp energy floods area\n- Everyone gains 1d10 Corruption\n- Mutations likely for all nearby\n- Area permanently tainted\n- Strange phenomena persist\n- 💀 THIS IS VERY BAD!\n- Witch hunters may investigate\n- Party reputation destroyed`;
            }
        }

        resultText += `## Effect\n${effect}\n\n`;

        resultText += `---\n`;
        resultText += `**Immediate Actions Required:**\n`;
        if (severityLevel >= 2) {
            resultText += `1. Apply damage/conditions immediately\n`;
            resultText += `2. Update corruption status\n`;
            resultText += `3. Check for mutations if corruption high\n`;
        }
        if (severityLevel === 3) {
            resultText += `4. Roll initiative if daemon summoned\n`;
            resultText += `5. Consider party morale/reputation\n`;
            resultText += `6. Plan how to hide this from authorities\n`;
        }

        resultText += `\n⚠️ **Lesson:** Magic is dangerous. Channel carefully and don't overreach!`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleMemorizeSpell(args: {
        characterName: string;
        spellName: string;
        forgetSpell?: string;
    }) {
        this.logger.info("Memorizing spell", {
            characterName: args.characterName,
            spellName: args.spellName,
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
        const intelligence = character.system?.characteristics?.int?.value || 0;
        const intBonus = Math.floor(intelligence / 10);

        // Find spell
        const spell = character.items?.find(
            (item: any) => item.type === "spell" && item.name === args.spellName
        );

        if (!spell) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Spell "${args.spellName}" not found in ${args.characterName}'s grimoire.`,
                    },
                ],
            };
        }

        // Count memorized spells
        const memorizedSpells = character.items?.filter(
            (item: any) => item.type === "spell" && item.system?.memorized?.value
        ) || [];

        // Check if at limit
        if (memorizedSpells.length >= intBonus && !spell.system?.memorized?.value) {
            if (!args.forgetSpell) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ **Memorization Limit Reached**\n\n${args.characterName} has ${memorizedSpells.length} spells memorized (max ${intBonus} based on Intelligence Bonus).\n\nCurrently memorized:\n${memorizedSpells.map((s: any) => `- ${s.name}`).join("\n")}\n\nTo memorize "${args.spellName}", you must forget one spell first. Use the \`forgetSpell\` parameter to specify which spell to forget.`,
                        },
                    ],
                };
            }

            // Forget specified spell
            const forgetSpellItem = character.items?.find(
                (item: any) => item.type === "spell" && item.name === args.forgetSpell
            );

            if (!forgetSpellItem) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Spell "${args.forgetSpell}" not found to forget.`,
                        },
                    ],
                };
            }

            const forgetResponse = await this.foundryClient.query(
                "foundry-mcp-bridge.updateItem",
                {
                    actorId: character.id,
                    itemId: forgetSpellItem.id,
                    updateData: {
                        "system.memorized.value": false,
                    },
                }
            );

            if (!forgetResponse.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to forget spell: ${forgetResponse.error || "Unknown error"}`,
                        },
                    ],
                };
            }
        }

        // Memorize the spell
        const memorizeResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.updateItem",
            {
                actorId: character.id,
                itemId: spell.id,
                updateData: {
                    "system.memorized.value": true,
                },
            }
        );

        if (!memorizeResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to memorize spell: ${memorizeResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        let resultText = `💭 **Spell Memorized**\n\n`;
        resultText += `${args.characterName} commits **${args.spellName}** to memory!\n\n`;

        if (args.forgetSpell) {
            resultText += `**Forgotten:** ${args.forgetSpell} (to make room)\n`;
        }

        resultText += `**Benefits:**\n`;
        resultText += `- +10 to casting tests\n`;
        resultText += `- No grimoire needed to cast\n`;
        resultText += `- Faster to invoke in combat\n`;
        resultText += `- Always available\n\n`;

        const newMemorizedCount = args.forgetSpell ? memorizedSpells.length : memorizedSpells.length + 1;
        resultText += `**Memorization Status:** ${newMemorizedCount} / ${intBonus} spells memorized\n\n`;

        if (newMemorizedCount < intBonus) {
            resultText += `✅ Room for ${intBonus - newMemorizedCount} more spell(s).`;
        } else {
            resultText += `⚠️ At maximum memorization capacity. Must forget a spell to memorize another.`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleLearnNewSpell(args: {
        characterName: string;
        spellName: string;
        lore: string;
        castingNumber: number;
        source: string;
    }) {
        this.logger.info("Learning new spell", {
            characterName: args.characterName,
            spellName: args.spellName,
        });

        // Time and cost based on CN
        let time = "";
        let cost = "";

        if (args.castingNumber <= 4) {
            time = "1 week";
            cost = "50-100 GC";
        } else if (args.castingNumber <= 9) {
            time = "2 weeks";
            cost = "100-200 GC";
        } else if (args.castingNumber <= 14) {
            time = "1 month";
            cost = "200-400 GC";
        } else {
            time = "2+ months";
            cost = "400-1000 GC";
        }

        const sourceText: Record<string, string> = {
            teacher: `Learning from a teacher is the easiest method. The instructor guides the student through the spell's intricacies over ${time}. Cost: ${cost} for tuition.`,
            scroll: `The spell scroll is consumed in the learning process. ${args.characterName} studies the scroll's magical inscriptions and absorbs the knowledge over ${time}. No additional cost, but scroll is destroyed.`,
            grimoire: `Copying the spell from another grimoire requires careful transcription and understanding. Takes ${time} and costs ${cost} in rare inks and materials.`,
            research: `Original magical research is extremely difficult. ${args.characterName} must experiment and theorize to develop this spell from first principles. Takes ${time} of intense study. Cost: ${cost} in materials and failed experiments.`,
        };

        let resultText = `📚 **Learning New Spell** - ${args.spellName}\n\n`;
        resultText += `**Wizard:** ${args.characterName}\n`;
        resultText += `**Lore:** ${args.lore}\n`;
        resultText += `**Casting Number:** ${args.castingNumber}\n`;
        resultText += `**Source:** ${args.source}\n\n`;

        resultText += `## Learning Process\n`;
        resultText += `${sourceText[args.source]}\n\n`;

        resultText += `**Requirements:**\n`;
        resultText += `- Time: ${time} of study\n`;
        resultText += `- Cost: ${cost}\n`;
        resultText += `- Intelligence test to successfully learn\n`;
        resultText += `- Access to spell source throughout study period\n\n`;

        // Get character info for actorId
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

        // Add the spell to grimoire
        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.createItem",
            {
                actorId: character.id,
                itemData: {
                    name: args.spellName,
                    type: "spell",
                    system: {
                        lore: { value: args.lore },
                        cn: { value: args.castingNumber },
                        memorized: { value: false },
                    },
                },
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to add spell: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        resultText += `✅ **SPELL LEARNED!**\n\n`;
        resultText += `After ${time} of dedicated study, ${args.characterName} has successfully learned **${args.spellName}**!\n\n`;
        resultText += `**Added to Grimoire:**\n`;
        resultText += `- Spell permanently known\n`;
        resultText += `- Can be cast with grimoire present\n`;
        resultText += `- Can be memorized for easier casting\n`;
        resultText += `- Part of wizard's magical repertoire\n\n`;

        resultText += `🔮 The wizard's power grows! Use \`memorize-spell\` to prepare it for adventure.`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }
}
