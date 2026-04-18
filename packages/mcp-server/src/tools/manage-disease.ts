import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

const ManageDiseaseSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("list"),
        characterName: z.string()
    }),
    z.object({
        action: z.literal("add"),
        characterName: z.string(),
        diseaseName: z.string(),
        type: z.enum(["acute", "chronic"]),
        incubationDays: z.number(),
        durationDays: z.number(),
        symptoms: z.string(),
        effects: z.string(),
        difficulty: z.enum(["easy", "average", "challenging", "difficult", "hard", "very-hard"])
    }),
    z.object({
        action: z.literal("remove"),
        characterName: z.string(),
        diseaseName: z.string(),
        reason: z.string()
    }),
    z.object({
        action: z.literal("check-resilience"),
        characterName: z.string(),
        diseaseName: z.string(),
        testType: z.enum(["resistance", "recovery"])
    })
]);

type ManageDiseaseArgs = z.infer<typeof ManageDiseaseSchema>;

export class ManageDiseaseTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-disease",
            description: `Manage diseases and infections for WFRP 4e characters.

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

Actions:
- **list**: Get all active diseases with symptoms, effects, and recovery requirements
- **add**: Contract a disease with incubation period and difficulty
- **remove**: Remove cured disease
- **check-resilience**: Make Resilience test for disease resistance or recovery

Examples:
- List diseases: action="list", characterName="Hans"
- Add disease: action="add", characterName="Hans", diseaseName="The Bloody Flux", type="acute", incubationDays=1, durationDays=7, symptoms="Bloody diarrhea", effects="-20 to Strength/Toughness tests", difficulty="challenging"
- Remove disease: action="remove", characterName="Hans", diseaseName="The Bloody Flux", reason="Recovered via Resilience test"
- Test resilience: action="check-resilience", characterName="Hans", diseaseName="The Bloody Flux", testType="recovery"`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["list", "add", "remove", "check-resilience"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Name of the character" },
                    diseaseName: { type: "string", description: "Name of the disease (for add, remove, check-resilience)" },
                    type: {
                        type: "string",
                        enum: ["acute", "chronic"],
                        description: "Disease type: acute (short-term) or chronic (long-lasting) - for add"
                    },
                    incubationDays: { type: "number", description: "Days before symptoms appear (for add)" },
                    durationDays: { type: "number", description: "Total duration in days (for add)" },
                    symptoms: { type: "string", description: "Description of symptoms (for add)" },
                    effects: { type: "string", description: "Mechanical effects like '-10 to Strength' (for add)" },
                    difficulty: {
                        type: "string",
                        enum: ["easy", "average", "challenging", "difficult", "hard", "very-hard"],
                        description: "Recovery test difficulty (for add)"
                    },
                    reason: { type: "string", description: "Reason for removal (for remove)" },
                    testType: {
                        type: "string",
                        enum: ["resistance", "recovery"],
                        description: "Test type: resistance (avoid infection) or recovery (heal) - for check-resilience"
                    }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageDiseaseArgs): Promise<string> {
        const parsed = ManageDiseaseSchema.parse(args);

        switch (parsed.action) {
            case "list":
                return this.handleList(parsed);
            case "add":
                return this.handleAdd(parsed);
            case "remove":
                return this.handleRemove(parsed);
            case "check-resilience":
                return this.handleCheckResilience(parsed);
        }
    }

    private async handleList(args: { characterName: string }): Promise<string> {
        this.logger.info("Getting diseases", { characterName: args.characterName });

        const character = await this.foundryClient.query<any>(
            "warhammer-mcp.getCharacterInfo",
            { characterName: args.characterName }
        );

        const diseases = character.items?.filter(
            (item: any) => item.type === "disease"
        ) || [];

        if (diseases.length === 0) {
            return `🩺 **${character.name}** - Disease & Infection Status\n\n✅ **HEALTHY** - No active diseases or infections\n\n${character.name} is currently free from disease and infection.`;
        }

        let diseaseReport = `🩺 **${character.name}** - Disease & Infection Status\n\n`;
        diseaseReport += `⚠️ **INFECTED** - ${diseases.length} active disease(s)\n\n`;

        diseases.forEach((disease: any, index: number) => {
            diseaseReport += `### ${index + 1}. ${disease.name}\n`;

            const diseaseType = disease.system?.diseaseType?.value || "unknown";
            const stage = disease.system?.stage?.value || "incubating";
            diseaseReport += `**Type:** ${diseaseType.charAt(0).toUpperCase() + diseaseType.slice(1)}\n`;
            diseaseReport += `**Stage:** ${stage.charAt(0).toUpperCase() + stage.slice(1)}\n`;

            const incubating = disease.system?.incubating?.value || false;
            if (incubating) {
                const incubationRemaining = disease.system?.incubation?.value || "unknown";
                diseaseReport += `🕐 **Incubating:** Yes (${incubationRemaining} remaining)\n`;
            } else {
                diseaseReport += `🕐 **Incubating:** No (symptoms active)\n`;
            }

            const duration = disease.system?.duration?.value || "unknown";
            diseaseReport += `⏱️ **Duration:** ${duration}\n`;

            const symptoms = disease.system?.symptoms?.value || "No symptoms listed";
            diseaseReport += `**Symptoms:** ${symptoms}\n`;

            const effects = disease.system?.effects || [];
            if (effects.length > 0) {
                diseaseReport += `**Effects:**\n`;
                effects.forEach((effect: any) => {
                    diseaseReport += `  - ${effect}\n`;
                });
            }

            const contraction = disease.system?.contraction?.value;
            if (contraction) {
                diseaseReport += `**Contraction:** ${contraction}\n`;
            }

            const difficulty = disease.system?.difficulty?.value || "average";
            const testInterval = disease.system?.testInterval?.value || "daily";
            diseaseReport += `**Recovery Test:** ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Resilience, ${testInterval}\n`;

            diseaseReport += `\n`;
        });

        const resilience = character.system?.characteristics?.t?.value || 0;
        const resilienceBonus = Math.floor(resilience / 10);
        diseaseReport += `---\n`;
        diseaseReport += `**Resilience (Toughness):** ${resilience} (Bonus: ${resilienceBonus})\n`;

        return diseaseReport;
    }

    private async handleAdd(args: {
        characterName: string;
        diseaseName: string;
        type: "acute" | "chronic";
        incubationDays: number;
        durationDays: number;
        symptoms: string;
        effects: string;
        difficulty: string;
    }): Promise<string> {
        this.logger.info("Adding disease", args);

        await this.foundryClient.query<any>(
            "warhammer-mcp.addDisease",
            {
                characterName: args.characterName,
                diseaseName: args.diseaseName,
                type: args.type,
                incubationDays: args.incubationDays,
                durationDays: args.durationDays,
                symptoms: args.symptoms,
                effects: args.effects,
                difficulty: args.difficulty
            }
        );

        return `🦠 **${args.characterName}** contracted **${args.diseaseName}**!\n\n` +
            `**Type:** ${args.type.charAt(0).toUpperCase() + args.type.slice(1)}\n` +
            `**Incubation:** ${args.incubationDays} days\n` +
            `**Duration:** ${args.durationDays} days\n` +
            `**Symptoms:** ${args.symptoms}\n` +
            `**Effects:** ${args.effects}\n` +
            `**Recovery Difficulty:** ${args.difficulty}`;
    }

    private async handleRemove(args: { characterName: string; diseaseName: string; reason: string }): Promise<string> {
        this.logger.info("Removing disease", args);

        await this.foundryClient.query<any>(
            "warhammer-mcp.removeDisease",
            {
                characterName: args.characterName,
                diseaseName: args.diseaseName,
                reason: args.reason
            }
        );

        return `✅ **${args.characterName}** recovered from **${args.diseaseName}**!\n\nReason: ${args.reason}`;
    }

    private async handleCheckResilience(args: { characterName: string; diseaseName: string; testType: "resistance" | "recovery" }): Promise<string> {
        this.logger.info("Checking resilience", args);

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.checkInfectionResilience",
            {
                characterName: args.characterName,
                diseaseName: args.diseaseName,
                testType: args.testType
            }
        );

        return response ?? "Resilience test completed";
    }
}
