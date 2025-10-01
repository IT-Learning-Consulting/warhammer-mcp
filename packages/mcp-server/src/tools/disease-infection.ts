import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class DiseaseInfectionTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "get-diseases",
                description: `Get all active diseases and infections affecting a WFRP 4e character.
        
WFRP Disease System:
- Diseases have incubation periods before symptoms appear
- Each disease has specific symptoms and effects (penalties to characteristics, conditions)
- Requires Resilience tests to resist initial infection and for recovery
- Duration varies by disease type (acute vs chronic)
- Some diseases have stages that worsen over time

Common WFRP Diseases:
- The Bloody Flux (bloody diarrhea, -20 to Strength/Toughness)
- Galloping Trots (explosive diarrhea, movement penalties)
- Minor Infection (festering wound, -10 to affected characteristic)
- The Black Plague (fever, black boils, often fatal)
- Bone Ague (aching bones, -10 to Agility)

Returns: List of all active diseases with:
- Disease name and type
- Current stage and symptoms
- Effects on characteristics/conditions
- Incubation status (if still incubating)
- Duration remaining
- Recovery test requirements
- Next test timing`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to check for diseases",
                        },
                    },
                    required: ["characterName"],
                },
            },
            {
                name: "add-disease",
                description: `Add a disease or infection to a WFRP 4e character.
        
When adding a disease:
1. Character makes initial Resilience test to resist infection
2. If failed, disease is added with incubation period
3. After incubation, symptoms appear and effects activate
4. Periodic Resilience tests required for recovery

Disease Parameters:
- Name: Disease name (e.g., "The Bloody Flux", "Minor Infection")
- Type: acute (short-term) or chronic (long-lasting)
- Incubation: Days before symptoms appear
- Duration: How long disease lasts (in days)
- Symptoms: Description of effects
- Effects: Mechanical penalties (e.g., "-10 to Strength tests")
- Recovery: Difficulty and frequency of Resilience tests

Example diseases:
- "Minor Infection": Acute, 1d10 days incubation, -10 to related tests
- "The Bloody Flux": Acute, 1d10 hours incubation, -20 Strength/Toughness
- "The Black Plague": Chronic, 1d10 days incubation, potentially fatal`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character contracting the disease",
                        },
                        diseaseName: {
                            type: "string",
                            description: "Name of the disease or infection",
                        },
                        type: {
                            type: "string",
                            enum: ["acute", "chronic"],
                            description: "Disease type: acute (short-term) or chronic (long-lasting)",
                        },
                        incubationDays: {
                            type: "number",
                            description: "Days of incubation before symptoms appear (0 for immediate)",
                        },
                        durationDays: {
                            type: "number",
                            description: "Total duration of disease in days",
                        },
                        symptoms: {
                            type: "string",
                            description: "Description of symptoms and visible effects",
                        },
                        effects: {
                            type: "string",
                            description: "Mechanical effects (e.g., '-10 to Strength tests', 'Fatigued condition')",
                        },
                        difficulty: {
                            type: "string",
                            enum: ["easy", "average", "challenging", "difficult", "hard", "very-hard"],
                            description: "Difficulty of Resilience tests for recovery",
                        },
                    },
                    required: ["characterName", "diseaseName", "type", "incubationDays", "durationDays", "symptoms", "effects", "difficulty"],
                },
            },
            {
                name: "check-infection-resilience",
                description: `Make a Resilience test for disease recovery or resistance for a WFRP 4e character.
        
Resilience Test Usage:
- Initial Test: To resist contracting disease (before adding it)
- Recovery Test: Periodic tests to recover from active disease
- Resistance Test: To avoid disease worsening or progressing to next stage

Test Process:
1. Roll Resilience test at specified difficulty
2. Success: Recover from disease or resist progression
3. Failure: Disease continues or worsens
4. Critical Success: Immediate recovery
5. Critical Failure: Disease worsens or gains complications

Recovery depends on disease severity:
- Easy: Common ailments (+40 to test)
- Average: Typical diseases (+20 to test)
- Challenging: Serious infections (+0 to test)
- Difficult: Dangerous diseases (-10 to test)
- Hard: Severe plagues (-20 to test)
- Very Hard: Near-fatal conditions (-30 to test)`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character making the Resilience test",
                        },
                        diseaseName: {
                            type: "string",
                            description: "Name of the disease being tested against",
                        },
                        testType: {
                            type: "string",
                            enum: ["resistance", "recovery"],
                            description: "Type of test: resistance (to avoid infection) or recovery (to heal from disease)",
                        },
                    },
                    required: ["characterName", "diseaseName", "testType"],
                },
            },
            {
                name: "remove-disease",
                description: `Remove a disease or infection from a WFRP 4e character.
        
Disease Removal Reasons:
- Successful recovery through Resilience tests
- Disease duration expired naturally
- Magical healing (e.g., prayer, potion)
- Medical treatment completed
- GM ruling/story progression

When disease is removed:
- All symptoms and effects end
- Character returns to normal health
- May have lingering consequences if severe
- Immunity period may apply for some diseases

Note: Some chronic diseases may recur or have permanent effects even after removal.`,
                inputSchema: {
                    type: "object",
                    properties: {
                        characterName: {
                            type: "string",
                            description: "Name of the character to remove disease from",
                        },
                        diseaseName: {
                            type: "string",
                            description: "Name of the disease to remove",
                        },
                        reason: {
                            type: "string",
                            description: "Reason for removal (e.g., 'Recovered via Resilience test', 'Healed by prayer', 'Duration expired')",
                        },
                    },
                    required: ["characterName", "diseaseName", "reason"],
                },
            },
        ];
    }

    async handleGetDiseases(args: { characterName: string }) {
        this.logger.info("Getting diseases", { characterName: args.characterName });

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

        // Get disease items (type: disease)
        const diseases = character.items?.filter(
            (item: any) => item.type === "disease"
        ) || [];

        if (diseases.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🩺 **${character.name}** - Disease & Infection Status

✅ **HEALTHY** - No active diseases or infections

${character.name} is currently free from disease and infection. Their immune system is functioning normally.`,
                    },
                ],
            };
        }

        let diseaseReport = `🩺 **${character.name}** - Disease & Infection Status\n\n`;
        diseaseReport += `⚠️ **INFECTED** - ${diseases.length} active disease(s)\n\n`;

        diseases.forEach((disease: any, index: number) => {
            diseaseReport += `### ${index + 1}. ${disease.name}\n`;

            // Disease type and stage
            const diseaseType = disease.system?.diseaseType?.value || "unknown";
            const stage = disease.system?.stage?.value || "incubating";
            diseaseReport += `**Type:** ${diseaseType.charAt(0).toUpperCase() + diseaseType.slice(1)}\n`;
            diseaseReport += `**Stage:** ${stage.charAt(0).toUpperCase() + stage.slice(1)}\n`;

            // Incubation status
            const incubating = disease.system?.incubating?.value || false;
            if (incubating) {
                const incubationRemaining = disease.system?.incubation?.value || "unknown";
                diseaseReport += `🕐 **Incubating:** Yes (${incubationRemaining} remaining)\n`;
            } else {
                diseaseReport += `🕐 **Incubating:** No (symptoms active)\n`;
            }

            // Duration
            const duration = disease.system?.duration?.value || "unknown";
            diseaseReport += `⏱️ **Duration:** ${duration}\n`;

            // Symptoms
            const symptoms = disease.system?.symptoms?.value || "No symptoms listed";
            diseaseReport += `**Symptoms:** ${symptoms}\n`;

            // Effects
            const effects = disease.system?.effects || [];
            if (effects.length > 0) {
                diseaseReport += `**Effects:**\n`;
                effects.forEach((effect: any) => {
                    diseaseReport += `  - ${effect}\n`;
                });
            }

            // Contraction details
            const contraction = disease.system?.contraction?.value;
            if (contraction) {
                diseaseReport += `**Contraction:** ${contraction}\n`;
            }

            // Recovery test info
            const difficulty = disease.system?.difficulty?.value || "average";
            const testInterval = disease.system?.testInterval?.value || "daily";
            diseaseReport += `**Recovery Test:** ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Resilience, ${testInterval}\n`;

            diseaseReport += `\n`;
        });

        // Resilience characteristic info
        const resilience = character.system?.characteristics?.t?.value || 0;
        const resilienceBonus = Math.floor(resilience / 10);
        diseaseReport += `---\n`;
        diseaseReport += `**Resilience (Toughness):** ${resilience} (Bonus: ${resilienceBonus})\n`;
        diseaseReport += `💡 Use \`check-infection-resilience\` to make recovery tests for active diseases.\n`;

        return {
            content: [{ type: "text", text: diseaseReport }],
        };
    }

    async handleAddDisease(args: {
        characterName: string;
        diseaseName: string;
        type: string;
        incubationDays: number;
        durationDays: number;
        symptoms: string;
        effects: string;
        difficulty: string;
    }) {
        this.logger.info("Adding disease", {
            characterName: args.characterName,
            diseaseName: args.diseaseName,
        });

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.addItemToActor",
            {
                actorName: args.characterName,
                itemData: {
                    name: args.diseaseName,
                    type: "disease",
                    system: {
                        diseaseType: { value: args.type },
                        incubating: { value: args.incubationDays > 0 },
                        incubation: { value: `${args.incubationDays} days` },
                        duration: { value: `${args.durationDays} days` },
                        symptoms: { value: args.symptoms },
                        difficulty: { value: args.difficulty },
                        testInterval: { value: "daily" },
                        contraction: { value: "Exposed to infection source" },
                        stage: { value: args.incubationDays > 0 ? "incubating" : "active" },
                    },
                },
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to add disease: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const incubationStatus = args.incubationDays > 0
            ? `\n\n🕐 **Incubation Period:** ${args.incubationDays} days\nSymptoms will not appear until the incubation period completes. The character may not even realize they are infected yet.`
            : `\n\n⚠️ **Immediate Effect:** Symptoms appear immediately. The infection has taken hold.`;

        return {
            content: [
                {
                    type: "text",
                    text: `🦠 **Disease Contracted!**

**${args.characterName}** has been infected with **${args.diseaseName}**!

**Type:** ${args.type.charAt(0).toUpperCase() + args.type.slice(1)}
**Duration:** ${args.durationDays} days
**Symptoms:** ${args.symptoms}
**Effects:** ${args.effects}
**Recovery Difficulty:** ${args.difficulty.charAt(0).toUpperCase() + args.difficulty.slice(1)} Resilience test${incubationStatus}

**Recovery Process:**
- Make ${args.difficulty} Resilience tests daily
- Success moves toward recovery
- Failure prolongs illness
- Critical failure may worsen condition

💊 **Treatment Options:**
- Heal skill tests to provide care
- Magical healing (prayers, potions)
- Rest and proper nutrition
- Quarantine to prevent spread

Use \`check-infection-resilience\` to attempt recovery tests.`,
                },
            ],
        };
    }

    async handleCheckInfectionResilience(args: {
        characterName: string;
        diseaseName: string;
        testType: string;
    }) {
        this.logger.info("Checking infection resilience", {
            characterName: args.characterName,
            diseaseName: args.diseaseName,
            testType: args.testType,
        });

        // Get character and disease info
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

        // Find the disease
        const disease = character.items?.find(
            (item: any) => item.type === "disease" && item.name === args.diseaseName
        );

        if (!disease) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Disease "${args.diseaseName}" not found on ${args.characterName}.`,
                    },
                ],
            };
        }

        // Get difficulty modifier
        const difficulty = disease.system?.difficulty?.value || "average";
        const difficultyModifiers: Record<string, number> = {
            "easy": 40,
            "average": 20,
            "challenging": 0,
            "difficult": -10,
            "hard": -20,
            "very-hard": -30,
        };
        const modifier = difficultyModifiers[difficulty] || 0;

        // Make the Resilience (Toughness) test
        const rollResponse = await this.foundryClient.query(
            "foundry-mcp-bridge.rollCharacteristic",
            {
                characterName: args.characterName,
                characteristic: "t", // Toughness for Resilience
                modifier: modifier,
                testName: `${args.testType === "resistance" ? "Resist" : "Recover from"} ${args.diseaseName}`,
            }
        );

        if (!rollResponse.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to roll Resilience test: ${rollResponse.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const rollResult = rollResponse.data;
        const success = rollResult.success;
        const sl = rollResult.sl || 0;

        let resultText = `🩺 **Resilience Test** - ${args.testType === "resistance" ? "Resisting" : "Recovering from"} ${args.diseaseName}\n\n`;
        resultText += `**Character:** ${args.characterName}\n`;
        resultText += `**Disease:** ${args.diseaseName}\n`;
        resultText += `**Difficulty:** ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (${modifier >= 0 ? "+" : ""}${modifier})\n`;
        resultText += `**Roll:** ${rollResult.roll} vs ${rollResult.target}\n`;
        resultText += `**Success Levels:** ${sl >= 0 ? "+" : ""}${sl}\n\n`;

        if (args.testType === "resistance") {
            if (success) {
                if (sl >= 4) {
                    resultText += `✅ **CRITICAL SUCCESS!**\n\n`;
                    resultText += `${args.characterName}'s immune system completely repels the infection! Not only do they avoid contracting ${args.diseaseName}, but they develop a temporary immunity to similar diseases.\n\n`;
                    resultText += `💪 The character's constitution proves remarkably resilient.`;
                } else {
                    resultText += `✅ **SUCCESS!**\n\n`;
                    resultText += `${args.characterName} successfully resists the infection. Their body fights off ${args.diseaseName} before it can take hold.\n\n`;
                    resultText += `💊 No disease effects occur. The character remains healthy.`;
                }
            } else {
                if (sl <= -4) {
                    resultText += `❌ **CRITICAL FAILURE!**\n\n`;
                    resultText += `${args.characterName}'s body completely fails to resist the infection! ${args.diseaseName} takes hold with exceptional virulence.\n\n`;
                    resultText += `⚠️ **Worsened Infection:** The disease is more severe than normal. Consider:\n`;
                    resultText += `- Reduced incubation period (symptoms appear faster)\n`;
                    resultText += `- Increased severity of effects\n`;
                    resultText += `- Additional complications\n`;
                    resultText += `- Higher difficulty for recovery tests`;
                } else {
                    resultText += `❌ **FAILURE**\n\n`;
                    resultText += `${args.characterName} fails to resist the infection. ${args.diseaseName} takes hold in their body.\n\n`;
                    resultText += `🦠 The disease progresses as normal. Use \`add-disease\` to apply the infection.`;
                }
            }
        } else {
            // Recovery test
            if (success) {
                if (sl >= 4) {
                    resultText += `✅ **CRITICAL SUCCESS!**\n\n`;
                    resultText += `${args.characterName} makes a miraculous recovery! Their body completely purges ${args.diseaseName}.\n\n`;
                    resultText += `💚 **Fully Recovered:** All symptoms and effects end immediately. The character feels better than ever!\n\n`;
                    resultText += `Use \`remove-disease\` to remove "${args.diseaseName}" from the character.`;
                } else {
                    resultText += `✅ **SUCCESS!**\n\n`;
                    resultText += `${args.characterName} makes progress in fighting off ${args.diseaseName}. Their condition improves.\n\n`;
                    resultText += `📈 **Progress Made:**\n`;
                    resultText += `- Symptoms begin to subside\n`;
                    resultText += `- ${sl} step(s) toward full recovery\n`;
                    resultText += `- Continue making daily recovery tests\n\n`;
                    resultText += `💡 After ${3 - sl} more successful test(s), the disease will be fully cured.`;
                }
            } else {
                if (sl <= -4) {
                    resultText += `❌ **CRITICAL FAILURE!**\n\n`;
                    resultText += `${args.characterName}'s condition worsens dramatically! ${args.diseaseName} intensifies.\n\n`;
                    resultText += `⚠️ **Complications:**\n`;
                    resultText += `- Disease becomes more severe\n`;
                    resultText += `- Additional symptoms may manifest\n`;
                    resultText += `- Risk of permanent effects\n`;
                    resultText += `- May gain Fatigued or Unconscious condition\n\n`;
                    resultText += `🏥 Seek immediate medical attention or magical healing!`;
                } else {
                    resultText += `❌ **FAILURE**\n\n`;
                    resultText += `${args.characterName} fails to make progress against ${args.diseaseName}. The infection persists.\n\n`;
                    resultText += `🔄 **No Improvement:** The disease continues with its current effects. Make another recovery test tomorrow.`;
                }
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    async handleRemoveDisease(args: {
        characterName: string;
        diseaseName: string;
        reason: string;
    }) {
        this.logger.info("Removing disease", {
            characterName: args.characterName,
            diseaseName: args.diseaseName,
        });

        const response = await this.foundryClient.query(
            "foundry-mcp-bridge.removeItemFromActor",
            {
                actorName: args.characterName,
                itemName: args.diseaseName,
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to remove disease: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `💚 **Disease Cured!**

**${args.characterName}** has been cured of **${args.diseaseName}**!

**Reason:** ${args.reason}

The character is now free of this infection. All symptoms and effects have ended. They may resume normal activities.

🩺 **Recovery Notes:**
- Monitor for any lingering effects
- Some diseases may leave temporary weakness
- Chronic diseases may recur under stress
- Natural immunity may develop

The character's health has been restored.`,
                },
            ],
        };
    }
}
