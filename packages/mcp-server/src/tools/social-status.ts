import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class SocialStatusTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "get-social-status",
                description: `Get a WFRP 4e character's social status, standing, and tier information.

WFRP Social Status System:
- Status represents social standing, wealth, and influence
- Divided into tiers: Brass (poor), Silver (middle class), Gold (nobility)
- Standing is the numeric value within a tier (0-5)
- Affects NPC reactions, social tests, and opportunities

Status Tiers:
- **Brass Tier** (Standing 0-1):
  * Peasants, beggars, criminals
  * Poor living conditions
  * Limited respect
  * Examples: Beggar (B 0), Peasant (B 1)

- **Silver Tier** (Standing 2-4):
  * Craftsmen, merchants, soldiers
  * Comfortable lifestyle
  * Moderate respect
  * Examples: Craftsman (S 2), Merchant (S 3), Lawyer (S 4)

- **Gold Tier** (Standing 5+):
  * Knights, nobles, royalty
  * Luxurious lifestyle
  * High respect and privilege
  * Examples: Knight (G 5), Baron (G 6), Duke (G 8)

Status Effects:
- High status: Better prices, NPC deference, access to elite circles
- Low status: Discrimination, suspicious NPCs, denied entry to venues
- Status difference: Modifiers to social interaction tests
- Losing status: Social disgrace, career problems

Returns detailed status information:
- Current standing and tier
- Social rank and title (if any)
- Status modifiers for interactions
- Income and lifestyle
- Reputation effects`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check status for",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "change-social-status",
                description: `Change a character's social status and standing in WFRP 4e.

Status Changes Occur Through:
- Career advancement (promotion increases status)
- Social achievements (earning titles, honors)
- Reputation gains (heroic deeds, good works)
- Wealth accumulation (buying status improvements)
- Marriage (marrying up/down in status)
- Royal decree (granted or stripped)
- Scandal (public disgrace, criminal conviction)

Gaining Status:
- Complete career advancement
- Gain noble title or knighthood
- Earn reputation through heroism
- Purchase status improvements (expensive!)
- Win tournaments or competitions
- Receive royal recognition

Losing Status:
- Criminal conviction
- Public scandal or disgrace
- Bankruptcy or financial ruin
- Excommunication from church
- Failure in important duties
- Association with chaos or corruption

Status Change Effects:
- Immediate change to tier/standing
- New income level
- Different NPC reactions
- Access to new social circles
- May gain or lose career opportunities
- Wardrobe and lifestyle must match new status`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character whose status is changing",
                        },
                        newStanding: {
                            type: "number",
                            description: "New standing value (0-10)",
                        },
                        reason: {
                            type: "string",
                            description: "Reason for status change (e.g., 'Promoted to Knight', 'Convicted of theft', 'Earned noble title')",
                        },
                    },
                    required: ["characterName", "newStanding", "reason"],
                },
            },
            {
                name: "make-social-test",
                description: `Make a social interaction test with status modifiers in WFRP 4e.

Social Tests:
- Used for persuasion, intimidation, negotiation, deception
- Common skills: Charm, Intimidate, Bribery, Gossip
- Status differences modify test difficulty

Status Modifiers:
- Equal status: No modifier
- Higher status (+1-2): -10 to -20 (harder to influence superiors)
- Lower status (-1-2): +10 to +20 (easier to influence inferiors)
- Vastly different status (3+): ±30 or more

Social Test Types:
- **Charm**: Persuade, seduce, befriend
  * Higher status helps (+10 per tier difference)
  * Good manners and appearance matter
  
- **Intimidate**: Threaten, coerce, frighten
  * Higher status aids intimidation
  * Physical presence adds modifier
  
- **Bribery**: Offer money or favors
  * Status affects expected bribe amount
  * Low status may be refused
  
- **Gossip**: Gather rumors, spread information
  * Status affects which circles you can access
  * High status = better information

- **Haggle**: Negotiate prices, deals
  * Merchant status helps
  * Status difference affects prices

Situational Modifiers:
- Appropriate dress: +10 to +20
- Wrong social circle: -10 to -30
- Wealth displayed: +5 to +15
- Poor hygiene/appearance: -10 to -20
- Reputation: ±10 to ±30

Success Effects:
- Target persuaded/intimidated
- Better prices in haggling
- Information gained
- Social connection made
- Favor granted

Failure Effects:
- Target refuses or becomes hostile
- Worse prices or denial of service
- Social faux pas committed
- Reputation damaged
- May be asked to leave`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character making the social test",
                        },
                        skillName: {
                            type: "string",
                            description: "Social skill being used (e.g., 'Charm', 'Intimidate', 'Gossip', 'Haggle')",
                        },
                        targetName: {
                            type: "string",
                            description: "Name or description of the target NPC",
                        },
                        targetStatus: {
                            type: "number",
                            description: "Target's status standing (0-10) for calculating modifiers",
                        },
                        situationModifier: {
                            type: "number",
                            description: "Additional situational modifier (dress, reputation, etc.)",
                        },
                    },
                    required: ["characterName", "skillName", "targetName", "targetStatus"],
                },
            },
            {
                name: "calculate-income",
                description: `Calculate income based on character's status and career in WFRP 4e.

WFRP Income System:
- Income tied to status and career
- Paid periodically (daily, weekly, or yearly)
- Determines lifestyle and expenses

Income by Status Tier:
- **Brass 0**: 1d10 brass pennies/day (begging)
- **Brass 1**: 2d10 brass pennies/day (peasant labor)
- **Silver 2**: 1 gold crown/day (skilled labor)
- **Silver 3**: 2 gold crowns/day (professionals)
- **Silver 4**: 4 gold crowns/day (experts)
- **Gold 5**: 10 gold crowns/day (knights)
- **Gold 6**: 50 gold crowns/day (barons)
- **Gold 7+**: 100+ gold crowns/day (counts, dukes)

Currency Conversion:
- 1 Gold Crown (GC) = 20 Silver Shillings (SS)
- 1 Silver Shilling = 12 Brass Pennies (BP)
- 1 GC = 240 BP

Income Types:
- **Daily**: Laborers, beggars (Brass tier)
- **Weekly**: Most careers (Silver tier)
- **Seasonal**: Agricultural workers
- **Yearly**: Nobles (Gold tier)

Living Expenses:
- Match status to avoid social problems
- Living below status: Save money but lose standing
- Living above status: Impressive but expensive
- Going broke: Lose status level

Expense Levels:
- Brass: 18 BP/day (poor lodging, bad food)
- Silver Low: 1 GC/day (decent room, good food)
- Silver High: 2 GC/day (private room, fine food)
- Gold: 5+ GC/day (suite, excellent food, servants)

Additional Income:
- Investments and businesses
- Inherited wealth
- Adventuring loot (irregular)
- Gifts from patrons
- Gambling winnings`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to calculate income for",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "check-reputation",
                description: `Check a character's reputation and how it affects social interactions in WFRP 4e.

Reputation System:
- Separate from status but affects it
- Based on deeds, behavior, and rumors
- Can be positive (hero) or negative (villain)
- Local vs widespread reputation

Reputation Types:
- **Hero** (+20 to +30):
  * Famous for good deeds
  * NPC trust and admiration
  * Easier social tests
  * May attract followers

- **Champion** (+10 to +20):
  * Well-regarded locally
  * Positive recognition
  * Moderate social benefits
  * Some fame

- **Known** (±0 to ±10):
  * Face in the crowd
  * No significant reputation
  * Normal interactions
  * Starting point for most

- **Suspicious** (-10 to -20):
  * Whispered about negatively
  * NPCs wary
  * Harder social tests
  * May be watched

- **Infamous** (-20 to -30):
  * Known for crimes/evil
  * NPCs hostile or afraid
  * Severe social penalties
  * May be hunted

Reputation Sources:
- Heroic deeds (saving village, slaying monsters)
- Criminal acts (theft, murder, chaos worship)
- Professional reputation (skilled craftsman, fair merchant)
- Social behavior (generous, cruel, honorable)
- Spreading rumors (gossip skill)
- Public performances or displays

Reputation Effects:
- Modifies Fellowship-based tests
- Affects prices and service quality
- Determines initial NPC attitudes
- May open or close opportunities
- Can attract allies or enemies

Managing Reputation:
- Good deeds improve reputation
- Time heals bad reputation
- Moving to new area resets local reputation
- Rumors can be countered with Gossip skill
- Disguises can hide identity temporarily

Reputation Scope:
- Local: Known in one town/region
- Regional: Known across province
- National: Known throughout nation
- International: Known in multiple lands`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check reputation for",
                        },
                        location: {
                            type: "string",
                            description: "Where reputation is being checked (e.g., 'Altdorf', 'this village', 'The Empire')",
                        },
                    },
                    required: ["characterName"],
                },
            },
        ];
    }

    async handleGetSocialStatus(args: { characterName: string }) {
        this.logger.info("Getting social status", { characterName: args.characterName });

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

        // Get status information
        const standing = character.system?.details?.status?.value || 0;
        const statusTier = character.system?.details?.status?.tier || "brass";

        // Determine tier and description
        let tier = "";
        let tierEmoji = "";
        let tierDescription = "";
        let incomeRange = "";

        if (standing <= 1) {
            tier = "Brass";
            tierEmoji = "🟤";
            tierDescription = "Lower class - Peasants and laborers";
            incomeRange = "1-2d10 brass pennies/day";
        } else if (standing <= 4) {
            tier = "Silver";
            tierEmoji = "⚪";
            tierDescription = "Middle class - Craftsmen and professionals";
            incomeRange = "1-4 gold crowns/day";
        } else {
            tier = "Gold";
            tierEmoji = "🟡";
            tierDescription = "Upper class - Knights and nobility";
            incomeRange = "10+ gold crowns/day";
        }

        let statusReport = `👑 **${character.name}** - Social Status\n\n`;
        statusReport += `${tierEmoji} **Status Tier:** ${tier}\n`;
        statusReport += `**Standing:** ${standing}\n`;
        statusReport += `**Description:** ${tierDescription}\n\n`;

        // Career and title
        const career = character.system?.details?.career?.value || "No career";
        const careerLevel = character.system?.details?.career?.level || 0;
        statusReport += `**Career:** ${career}`;
        if (careerLevel > 0) {
            statusReport += ` (Level ${careerLevel})`;
        }
        statusReport += `\n\n`;

        // Status effects
        statusReport += `## Social Effects\n`;

        statusReport += `**Income Range:** ${incomeRange}\n`;
        statusReport += `**Lifestyle:** `;
        if (standing <= 1) {
            statusReport += `Poor - Rough lodging, simple food, worn clothing\n`;
        } else if (standing <= 2) {
            statusReport += `Modest - Basic room, decent food, serviceable clothing\n`;
        } else if (standing <= 4) {
            statusReport += `Comfortable - Private room, good food, quality clothing\n`;
        } else if (standing <= 6) {
            statusReport += `Wealthy - Fine accommodations, excellent food, fashionable attire\n`;
        } else {
            statusReport += `Luxurious - Estates, servants, gourmet meals, haute couture\n`;
        }

        statusReport += `\n**NPC Reactions:**\n`;
        if (standing <= 1) {
            statusReport += `- Commoners: Sympathetic or dismissive\n`;
            statusReport += `- Authorities: Suspicious, may be harassed\n`;
            statusReport += `- Nobles: Ignored or scorned\n`;
            statusReport += `- Merchants: Poor service, may refuse entry\n`;
        } else if (standing <= 4) {
            statusReport += `- Commoners: Respectful to neutral\n`;
            statusReport += `- Authorities: Normal treatment\n`;
            statusReport += `- Nobles: Acknowledged but not equal\n`;
            statusReport += `- Merchants: Fair prices and service\n`;
        } else {
            statusReport += `- Commoners: Deferential, may seek favors\n`;
            statusReport += `- Authorities: Respectful, some deference\n`;
            statusReport += `- Nobles: Treated as peer\n`;
            statusReport += `- Merchants: Best prices, excellent service\n`;
        }

        // Social test modifiers
        statusReport += `\n## Social Interaction Modifiers\n`;
        statusReport += `When interacting with NPCs of different status:\n`;
        statusReport += `- **Lower status (-1-2):** +10 to +20 (easier to influence)\n`;
        statusReport += `- **Equal status:** No modifier\n`;
        statusReport += `- **Higher status (+1-2):** -10 to -20 (harder to influence)\n`;
        statusReport += `- **Much higher (+3+):** -30 or worse (very difficult)\n\n`;

        // Fellowship for social tests
        const fellowship = character.system?.characteristics?.fel?.value || 0;
        const felBonus = Math.floor(fellowship / 10);
        statusReport += `**Fellowship:** ${fellowship} (Bonus: ${felBonus})\n`;

        // Check for social skills
        const socialSkills = ["Charm", "Intimidate", "Gossip", "Bribery", "Haggle"];
        const knownSocialSkills = character.items?.filter(
            (item: any) => item.type === "skill" && socialSkills.some(skill => item.name.includes(skill))
        ) || [];

        if (knownSocialSkills.length > 0) {
            statusReport += `\n**Social Skills:**\n`;
            knownSocialSkills.forEach((skill: any) => {
                const value = skill.system?.total?.value || 0;
                statusReport += `- ${skill.name}: ${value}%\n`;
            });
        }

        statusReport += `\n💡 Use \`make-social-test\` to interact with NPCs using social skills.\n`;
        statusReport += `💡 Use \`calculate-income\` to determine earnings and expenses.`;

        return {
            content: [{ type: "text", text: statusReport }],
        };
    }

    async handleChangeSocialStatus(args: {
        characterName: string;
        newStanding: number;
        reason: string;
    }) {
        this.logger.info("Changing social status", {
            characterName: args.characterName,
            newStanding: args.newStanding,
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
        const oldStanding = character.system?.details?.status?.value || 0;

        // Update status
        const updateResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.updateActor",
            {
                actorName: args.characterName,
                updates: {
                    "system.details.status.value": args.newStanding,
                },
            }
        );

        if (!updateResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to update status: ${updateResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const change = args.newStanding - oldStanding;
        const direction = change > 0 ? "increased" : "decreased";

        // Determine old and new tiers
        const oldTier = oldStanding <= 1 ? "Brass" : oldStanding <= 4 ? "Silver" : "Gold";
        const newTier = args.newStanding <= 1 ? "Brass" : args.newStanding <= 4 ? "Silver" : "Gold";
        const tierChanged = oldTier !== newTier;

        let resultText = `👑 **Social Status Change**\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Reason:** ${args.reason}\n\n`;
        resultText += `**Previous Standing:** ${oldStanding} (${oldTier} tier)\n`;
        resultText += `**New Standing:** ${args.newStanding} (${newTier} tier)\n`;
        resultText += `**Change:** ${change >= 0 ? "+" : ""}${change}\n\n`;

        if (change > 0) {
            // Status increased
            resultText += `📈 **STATUS INCREASED!**\n\n`;

            if (tierChanged) {
                resultText += `🎉 **TIER PROMOTION!**\n\n`;
                resultText += `${args.characterName} has risen from the ${oldTier} tier to the ${newTier} tier!\n\n`;

                if (newTier === "Silver") {
                    resultText += `**Welcome to the Middle Class:**\n`;
                    resultText += `- Better income (1-4 GC/day)\n`;
                    resultText += `- Comfortable lifestyle\n`;
                    resultText += `- More respect from commoners\n`;
                    resultText += `- Access to better establishments\n`;
                    resultText += `- Can own property\n`;
                    resultText += `- May train apprentices\n\n`;
                    resultText += `⚠️ **New Expectations:**\n`;
                    resultText += `- Must maintain appearances\n`;
                    resultText += `- Expected to wear decent clothing\n`;
                    resultText += `- Should avoid slums and lowly venues\n`;
                } else if (newTier === "Gold") {
                    resultText += `**Elevated to the Upper Class:**\n`;
                    resultText += `- Substantial income (10+ GC/day)\n`;
                    resultText += `- Luxurious lifestyle expected\n`;
                    resultText += `- High social standing\n`;
                    resultText += `- Access to noble circles\n`;
                    resultText += `- May own estates\n`;
                    resultText += `- Can employ servants\n`;
                    resultText += `- Invitations to balls and galas\n\n`;
                    resultText += `⚠️ **Noble Responsibilities:**\n`;
                    resultText += `- Must dress impeccably at all times\n`;
                    resultText += `- Expected to maintain dignity\n`;
                    resultText += `- Cannot be seen in common establishments\n`;
                    resultText += `- Social obligations and etiquette crucial\n`;
                }
            } else {
                resultText += `${args.characterName} has risen in social standing within the ${newTier} tier.\n\n`;
                resultText += `**Benefits:**\n`;
                resultText += `- Improved reputation\n`;
                resultText += `- Better NPC reactions (+${change * 5} to social tests)\n`;
                resultText += `- Slightly increased income\n`;
                resultText += `- More opportunities\n`;
            }
        } else if (change < 0) {
            // Status decreased
            resultText += `📉 **STATUS DECREASED**\n\n`;

            if (tierChanged) {
                resultText += `💔 **TIER DEMOTION!**\n\n`;
                resultText += `${args.characterName} has fallen from the ${oldTier} tier to the ${newTier} tier!\n\n`;

                if (newTier === "Silver") {
                    resultText += `**Fallen to Middle Class:**\n`;
                    resultText += `- Reduced income (1-4 GC/day)\n`;
                    resultText += `- Lost noble privileges\n`;
                    resultText += `- No longer welcome in elite circles\n`;
                    resultText += `- Must sell estates/luxuries\n`;
                    resultText += `- Former peers may shun you\n\n`;
                    resultText += `⚠️ **Social Disgrace:**\n`;
                    resultText += `- Whispers follow you\n`;
                    resultText += `- Some may gloat at your fall\n`;
                    resultText += `- Rebuilding reputation will be difficult\n`;
                } else if (newTier === "Brass") {
                    resultText += `**Fallen to Lower Class:**\n`;
                    resultText += `- Minimal income (pennies/day)\n`;
                    resultText += `- Poor living conditions\n`;
                    resultText += `- Lost all privileges\n`;
                    resultText += `- Treated with suspicion or contempt\n`;
                    resultText += `- Struggle for survival\n\n`;
                    resultText += `💀 **Desperate Situation:**\n`;
                    resultText += `- May face poverty and hunger\n`;
                    resultText += `- Former connections severed\n`;
                    resultText += `- Very difficult to recover from this fall\n`;
                }
            } else {
                resultText += `${args.characterName} has lost social standing within the ${newTier} tier.\n\n`;
                resultText += `**Consequences:**\n`;
                resultText += `- Damaged reputation\n`;
                resultText += `- Worse NPC reactions (${change * 5} to social tests)\n`;
                resultText += `- Reduced income\n`;
                resultText += `- Some opportunities lost\n`;
                resultText += `- Must work to restore standing\n`;
            }
        } else {
            resultText += `**No Change**\n\nStatus remains at ${args.newStanding}.`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleMakeSocialTest(args: {
        characterName: string;
        skillName: string;
        targetName: string;
        targetStatus: number;
        situationModifier?: number;
    }) {
        this.logger.info("Making social test", {
            characterName: args.characterName,
            skillName: args.skillName,
            targetName: args.targetName,
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
        const characterStatus = character.system?.details?.status?.value || 0;

        // Calculate status modifier
        const statusDifference = characterStatus - args.targetStatus;
        let statusModifier = 0;

        if (Math.abs(statusDifference) >= 3) {
            statusModifier = statusDifference * 15; // ±45+ for vast differences
        } else if (Math.abs(statusDifference) >= 2) {
            statusModifier = statusDifference * 20; // ±40 for large differences
        } else if (Math.abs(statusDifference) >= 1) {
            statusModifier = statusDifference * 10; // ±10 for small differences
        }

        const totalModifier = statusModifier + (args.situationModifier || 0);

        // Make the skill test
        const rollResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.rollSkill",
            {
                characterName: args.characterName,
                skillName: args.skillName,
                modifier: totalModifier,
                testName: `${args.skillName} ${args.targetName}`,
            }
        );

        if (!rollResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to roll social test: ${rollResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const rollResult = rollResponse.data;
        const success = rollResult.success;
        const sl = rollResult.sl || 0;

        let resultText = `🗣️ **Social Interaction Test** - ${args.skillName}\n\n`;
        resultText += `**Character:** ${args.characterName} (Status ${characterStatus})\n`;
        resultText += `**Target:** ${args.targetName} (Status ${args.targetStatus})\n`;
        resultText += `**Status Difference:** ${statusDifference >= 0 ? "+" : ""}${statusDifference} (${statusModifier >= 0 ? "+" : ""}${statusModifier} modifier)\n`;
        if (args.situationModifier) {
            resultText += `**Situation Modifier:** ${args.situationModifier >= 0 ? "+" : ""}${args.situationModifier}\n`;
        }
        resultText += `**Total Modifier:** ${totalModifier >= 0 ? "+" : ""}${totalModifier}\n`;
        resultText += `**Test Roll:** ${rollResult.roll} vs ${rollResult.target}\n`;
        resultText += `**Success Levels:** ${sl >= 0 ? "+" : ""}${sl}\n\n`;

        if (success) {
            if (sl >= 6) {
                // Spectacular success
                resultText += `✨ **SPECTACULAR SUCCESS!**\n\n`;
                resultText += `${args.characterName} completely charms ${args.targetName}!\n\n`;

                if (args.skillName.toLowerCase().includes("charm")) {
                    resultText += `**Exceptional Result:**\n`;
                    resultText += `- Target is thoroughly charmed and impressed\n`;
                    resultText += `- Will go out of their way to help\n`;
                    resultText += `- May become friend or ally\n`;
                    resultText += `- Reputation improved significantly\n`;
                    resultText += `- Others witnessing are also impressed\n`;
                    resultText += `- May receive unexpected favors or gifts\n`;
                } else if (args.skillName.toLowerCase().includes("intimidate")) {
                    resultText += `**Exceptional Result:**\n`;
                    resultText += `- Target is genuinely terrified\n`;
                    resultText += `- Will comply with demands immediately\n`;
                    resultText += `- May flee or grovel\n`;
                    resultText += `- Others nearby also intimidated\n`;
                    resultText += `- Reputation as fearsome spreads\n`;
                } else if (args.skillName.toLowerCase().includes("haggle")) {
                    resultText += `**Exceptional Result:**\n`;
                    resultText += `- Incredible deal secured (50% discount)\n`;
                    resultText += `- Merchant impressed by negotiation\n`;
                    resultText += `- May offer exclusive items\n`;
                    resultText += `- Future dealings improved\n`;
                } else if (args.skillName.toLowerCase().includes("gossip")) {
                    resultText += `**Exceptional Result:**\n`;
                    resultText += `- Excellent information gained\n`;
                    resultText += `- Multiple useful rumors acquired\n`;
                    resultText += `- New contacts made\n`;
                    resultText += `- Secret information revealed\n`;
                }
            } else {
                // Normal success
                resultText += `✅ **SUCCESS**\n\n`;
                resultText += `${args.characterName} successfully influences ${args.targetName}.\n\n`;

                if (args.skillName.toLowerCase().includes("charm")) {
                    resultText += `**Result:**\n`;
                    resultText += `- Target is favorably disposed\n`;
                    resultText += `- Willing to help or provide information\n`;
                    resultText += `- Positive impression made\n`;
                    resultText += `- ${sl > 2 ? "May develop into friendship" : "Pleasant interaction"}\n`;
                } else if (args.skillName.toLowerCase().includes("intimidate")) {
                    resultText += `**Result:**\n`;
                    resultText += `- Target is cowed or nervous\n`;
                    resultText += `- Complies with reasonable demands\n`;
                    resultText += `- Won't cause trouble\n`;
                    resultText += `- ${sl > 2 ? "Genuinely afraid" : "Wisely cautious"}\n`;
                } else if (args.skillName.toLowerCase().includes("haggle")) {
                    resultText += `**Result:**\n`;
                    resultText += `- Better price negotiated\n`;
                    resultText += `- ${10 + (sl * 5)}% discount secured\n`;
                    resultText += `- Merchant respects your skill\n`;
                } else if (args.skillName.toLowerCase().includes("gossip")) {
                    resultText += `**Result:**\n`;
                    resultText += `- Useful information gathered\n`;
                    resultText += `- ${sl} significant rumor(s) learned\n`;
                    resultText += `- Local knowledge acquired\n`;
                } else {
                    resultText += `**Result:**\n`;
                    resultText += `- Social objective achieved\n`;
                    resultText += `- Target cooperates or complies\n`;
                    resultText += `- Situation resolved favorably\n`;
                }
            }
        } else {
            if (sl <= -6) {
                // Catastrophic failure
                resultText += `💥 **CATASTROPHIC FAILURE!**\n\n`;
                resultText += `${args.characterName} completely misreads the situation!\n\n`;

                resultText += `**Disaster:**\n`;
                resultText += `- Target is deeply offended or enraged\n`;
                resultText += `- May become hostile or violent\n`;
                resultText += `- Social faux pas witnessed by others\n`;
                resultText += `- Reputation damaged (-10 to future tests here)\n`;
                resultText += `- May be asked to leave or banned\n`;

                if (args.skillName.toLowerCase().includes("charm")) {
                    resultText += `- Target actively dislikes you now\n`;
                    resultText += `- Will spread negative rumors\n`;
                } else if (args.skillName.toLowerCase().includes("intimidate")) {
                    resultText += `- Target calls guards or retaliates\n`;
                    resultText += `- You may face criminal charges\n`;
                } else if (args.skillName.toLowerCase().includes("haggle")) {
                    resultText += `- Merchant refuses all business\n`;
                    resultText += `- You're overcharged or cheated\n`;
                }
            } else {
                // Normal failure
                resultText += `❌ **FAILURE**\n\n`;
                resultText += `${args.characterName} fails to influence ${args.targetName}.\n\n`;

                if (args.skillName.toLowerCase().includes("charm")) {
                    resultText += `**Result:**\n`;
                    resultText += `- Target is unmoved or unimpressed\n`;
                    resultText += `- Politely declines or refuses\n`;
                    resultText += `- No rapport established\n`;
                    resultText += `- ${Math.abs(sl) > 2 ? "May be annoyed" : "Simply not interested"}\n`;
                } else if (args.skillName.toLowerCase().includes("intimidate")) {
                    resultText += `**Result:**\n`;
                    resultText += `- Target is not intimidated\n`;
                    resultText += `- Stands firm or laughs it off\n`;
                    resultText += `- ${Math.abs(sl) > 2 ? "May become hostile" : "Unimpressed by threats"}\n`;
                } else if (args.skillName.toLowerCase().includes("haggle")) {
                    resultText += `**Result:**\n`;
                    resultText += `- No discount obtained\n`;
                    resultText += `- Must pay full price\n`;
                    resultText += `- ${Math.abs(sl) > 2 ? "Merchant slightly annoyed" : "Fair but firm"}\n`;
                } else if (args.skillName.toLowerCase().includes("gossip")) {
                    resultText += `**Result:**\n`;
                    resultText += `- No useful information gained\n`;
                    resultText += `- Target doesn't know or won't tell\n`;
                    resultText += `- Time wasted\n`;
                } else {
                    resultText += `**Result:**\n`;
                    resultText += `- Social objective not achieved\n`;
                    resultText += `- Target unmoved or refuses\n`;
                    resultText += `- May need different approach\n`;
                }
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleCalculateIncome(args: { characterName: string }) {
        this.logger.info("Calculating income", { characterName: args.characterName });

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
        const standing = character.system?.details?.status?.value || 0;
        const career = character.system?.details?.career?.value || "Unemployed";

        // Income by status
        let dailyIncome = "";
        let weeklyIncome = "";
        let yearlyIncome = "";
        let incomeType = "";

        if (standing === 0) {
            dailyIncome = "1d10 brass pennies";
            weeklyIncome = "~4-7 shillings";
            incomeType = "Daily (begging or poorest labor)";
        } else if (standing === 1) {
            dailyIncome = "2d10 brass pennies";
            weeklyIncome = "~8-15 shillings";
            incomeType = "Daily (peasant labor)";
        } else if (standing === 2) {
            dailyIncome = "1 gold crown";
            weeklyIncome = "7 gold crowns";
            yearlyIncome = "~350 GC";
            incomeType = "Daily/Weekly (skilled trade)";
        } else if (standing === 3) {
            dailyIncome = "2 gold crowns";
            weeklyIncome = "14 gold crowns";
            yearlyIncome = "~700 GC";
            incomeType = "Weekly (professional)";
        } else if (standing === 4) {
            dailyIncome = "4 gold crowns";
            weeklyIncome = "28 gold crowns";
            yearlyIncome = "~1,400 GC";
            incomeType = "Weekly (expert/master)";
        } else if (standing === 5) {
            dailyIncome = "10 gold crowns";
            weeklyIncome = "70 gold crowns";
            yearlyIncome = "~3,500 GC";
            incomeType = "Yearly (knight/minor noble)";
        } else if (standing === 6) {
            dailyIncome = "50 gold crowns";
            weeklyIncome = "350 gold crowns";
            yearlyIncome = "~18,000 GC";
            incomeType = "Yearly (baron/major noble)";
        } else {
            dailyIncome = "100+ gold crowns";
            weeklyIncome = "700+ gold crowns";
            yearlyIncome = "~36,000+ GC";
            incomeType = "Yearly (count/duke/prince)";
        }

        // Living expenses
        let dailyExpense = "";
        let weeklyExpense = "";
        let lifestyleDescription = "";

        if (standing <= 1) {
            dailyExpense = "18 brass pennies (1.5 shillings)";
            weeklyExpense = "~9 shillings";
            lifestyleDescription = "**Poor:** Flophouse or street, gruel/bread, rags";
        } else if (standing === 2) {
            dailyExpense = "1 gold crown";
            weeklyExpense = "7 gold crowns";
            lifestyleDescription = "**Modest:** Common room, hearty meals, serviceable clothes";
        } else if (standing === 3) {
            dailyExpense = "1.5 gold crowns";
            weeklyExpense = "10.5 gold crowns";
            lifestyleDescription = "**Comfortable:** Private room, good food, quality clothing";
        } else if (standing === 4) {
            dailyExpense = "2 gold crowns";
            weeklyExpense = "14 gold crowns";
            lifestyleDescription = "**Fine:** Suite, excellent meals, fashionable attire";
        } else if (standing <= 6) {
            dailyExpense = "5 gold crowns";
            weeklyExpense = "35 gold crowns";
            lifestyleDescription = "**Wealthy:** Estate/mansion, gourmet food, haute couture, servants";
        } else {
            dailyExpense = "10+ gold crowns";
            weeklyExpense = "70+ gold crowns";
            lifestyleDescription = "**Luxurious:** Palace, feast daily, royal finery, many servants";
        }

        let incomeReport = `💰 **Income & Expenses** - ${character.name}\n\n`;
        incomeReport += `**Career:** ${career}\n`;
        incomeReport += `**Status Standing:** ${standing}\n\n`;

        incomeReport += `## Income\n`;
        incomeReport += `**Type:** ${incomeType}\n`;
        incomeReport += `**Daily:** ${dailyIncome}\n`;
        incomeReport += `**Weekly:** ${weeklyIncome}\n`;
        if (yearlyIncome) {
            incomeReport += `**Yearly:** ${yearlyIncome}\n`;
        }

        incomeReport += `\n## Living Expenses\n`;
        incomeReport += `${lifestyleDescription}\n`;
        incomeReport += `**Daily Cost:** ${dailyExpense}\n`;
        incomeReport += `**Weekly Cost:** ${weeklyExpense}\n`;

        // Calculate net income
        incomeReport += `\n## Financial Summary\n`;

        if (standing <= 1) {
            incomeReport += `⚠️ **Barely Surviving:**\n`;
            incomeReport += `- Income roughly matches expenses\n`;
            incomeReport += `- Little to no savings possible\n`;
            incomeReport += `- One mishap could mean starvation\n`;
            incomeReport += `- Adventuring loot is crucial for survival\n`;
        } else if (standing <= 2) {
            incomeReport += `**Breaking Even:**\n`;
            incomeReport += `- Income covers basic expenses\n`;
            incomeReport += `- Small savings possible (pennies/shillings per week)\n`;
            incomeReport += `- Must budget carefully\n`;
            incomeReport += `- Adventuring provides extra income\n`;
        } else if (standing <= 4) {
            incomeReport += `✅ **Comfortable Position:**\n`;
            incomeReport += `- Income exceeds basic expenses\n`;
            incomeReport += `- Can save several crowns per week\n`;
            incomeReport += `- Afford occasional luxuries\n`;
            incomeReport += `- Building wealth slowly\n`;
        } else {
            incomeReport += `💎 **Wealthy:**\n`;
            incomeReport += `- Substantial income beyond expenses\n`;
            incomeReport += `- Large savings accumulate naturally\n`;
            incomeReport += `- Can afford investments and luxuries\n`;
            incomeReport += `- Financial security established\n`;
        }

        incomeReport += `\n---\n`;
        incomeReport += `**Currency Conversion:**\n`;
        incomeReport += `- 1 Gold Crown (GC) = 20 Silver Shillings (SS)\n`;
        incomeReport += `- 1 Silver Shilling = 12 Brass Pennies (BP)\n`;
        incomeReport += `- 1 GC = 240 BP\n\n`;

        incomeReport += `💡 **Financial Tips:**\n`;
        if (standing <= 2) {
            incomeReport += `- Seek career advancement to increase status\n`;
            incomeReport += `- Adventuring provides irregular but significant income\n`;
            incomeReport += `- Be careful with spending on equipment\n`;
        } else {
            incomeReport += `- Maintain lifestyle appropriate to status\n`;
            incomeReport += `- Consider investments or businesses\n`;
            incomeReport += `- Living below status saves money but may cost standing\n`;
        }

        return {
            content: [{ type: "text", text: incomeReport }],
        };
    }

    async handleCheckReputation(args: { characterName: string; location?: string }) {
        this.logger.info("Checking reputation", { characterName: args.characterName });

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
        const fellowship = character.system?.characteristics?.fel?.value || 0;
        const status = character.system?.details?.status?.value || 0;

        // Check for reputation-affecting items/traits
        const reputation = character.system?.details?.reputation || 0;
        const location = args.location || "the local area";

        let reputationReport = `🎭 **Reputation Check** - ${character.name}\n\n`;
        reputationReport += `**Location:** ${location}\n`;
        reputationReport += `**Fellowship:** ${fellowship}\n`;
        reputationReport += `**Status:** ${status}\n\n`;

        // Determine reputation level (simplified - in real game this would track deeds)
        let reputationLevel = "";
        let reputationEmoji = "";
        let reputationModifier = 0;
        let reputationDescription = "";

        if (fellowship >= 60) {
            reputationLevel = "Charismatic";
            reputationEmoji = "⭐";
            reputationModifier = 20;
            reputationDescription = "Natural charm makes you well-liked";
        } else if (fellowship >= 40) {
            reputationLevel = "Likeable";
            reputationEmoji = "😊";
            reputationModifier = 10;
            reputationDescription = "People generally warm to you";
        } else if (fellowship >= 30) {
            reputationLevel = "Average";
            reputationEmoji = "😐";
            reputationModifier = 0;
            reputationDescription = "You blend into the crowd";
        } else if (fellowship >= 20) {
            reputationLevel = "Awkward";
            reputationEmoji = "😬";
            reputationModifier = -10;
            reputationDescription = "Social situations are challenging";
        } else {
            reputationLevel = "Off-putting";
            reputationEmoji = "😰";
            reputationModifier = -20;
            reputationDescription = "People tend to avoid you";
        }

        reputationReport += `${reputationEmoji} **General Impression:** ${reputationLevel}\n`;
        reputationReport += `**Description:** ${reputationDescription}\n`;
        reputationReport += `**Fellowship Modifier:** ${reputationModifier >= 0 ? "+" : ""}${reputationModifier} to social tests\n\n`;

        reputationReport += `## Reputation Sources\n`;
        reputationReport += `Your reputation is built through:\n`;
        reputationReport += `- **Heroic Deeds:** Saving villages, slaying monsters (+10 to +30)\n`;
        reputationReport += `- **Professional Work:** Quality craftsmanship, fair dealing (+5 to +15)\n`;
        reputationReport += `- **Social Behavior:** Generosity, honor, wit (+5 to +10)\n`;
        reputationReport += `- **Negative Acts:** Crimes, cruelty, failures (-10 to -30)\n`;
        reputationReport += `- **Rumors:** What people say about you (±5 to ±20)\n\n`;

        reputationReport += `## Current Standing in ${location}\n`;

        // Simulate some reputation based on status and fellowship
        if (status >= 5 && fellowship >= 40) {
            reputationReport += `✨ **RENOWNED:**\n`;
            reputationReport += `- Well-known and respected\n`;
            reputationReport += `- NPCs recognize you on sight\n`;
            reputationReport += `- +20 to social tests here\n`;
            reputationReport += `- People seek your company\n`;
            reputationReport += `- Stories told about you\n`;
        } else if (status >= 3 || fellowship >= 50) {
            reputationReport += `✅ **RESPECTED:**\n`;
            reputationReport += `- Positively regarded locally\n`;
            reputationReport += `- +10 to social tests here\n`;
            reputationReport += `- Shopkeepers remember you\n`;
            reputationReport += `- Generally trusted\n`;
        } else if (status <= 1 && fellowship <= 25) {
            reputationReport += `⚠️ **SUSPICIOUS:**\n`;
            reputationReport += `- Viewed with wariness\n`;
            reputationReport += `- -10 to social tests here\n`;
            reputationReport += `- May be watched by authorities\n`;
            reputationReport += `- Shopkeepers cautious\n`;
        } else {
            reputationReport += `**UNKNOWN:**\n`;
            reputationReport += `- Just another face in the crowd\n`;
            reputationReport += `- No special recognition\n`;
            reputationReport += `- No modifiers\n`;
            reputationReport += `- Must build reputation through actions\n`;
        }

        reputationReport += `\n## Managing Reputation\n`;
        reputationReport += `**Improve Reputation:**\n`;
        reputationReport += `- Perform heroic deeds publicly\n`;
        reputationReport += `- Help locals with problems\n`;
        reputationReport += `- Be generous and honorable\n`;
        reputationReport += `- Use Gossip skill to spread good stories\n\n`;

        reputationReport += `**Damage Control:**\n`;
        reputationReport += `- Counter rumors with Gossip tests\n`;
        reputationReport += `- Make public apologies or restitution\n`;
        reputationReport += `- Leave and start fresh elsewhere\n`;
        reputationReport += `- Use disguises to hide identity\n\n`;

        reputationReport += `💡 **Note:** Reputation is local. Moving to a new region resets it, but major deeds may spread through rumors.`;

        return {
            content: [{ type: "text", text: reputationReport }],
        };
    }
}
