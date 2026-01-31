import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

const ManageSocialStatusSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("get-status"),
        characterName: z.string()
    }),
    z.object({
        action: z.literal("change-status"),
        characterName: z.string(),
        newStanding: z.number(),
        reason: z.string()
    }),
    z.object({
        action: z.literal("make-social-test"),
        characterName: z.string(),
        targetName: z.string().optional(),
        testType: z.enum(['charm', 'intimidate', 'bribery', 'gossip', 'leadership']),
        modifier: z.number().optional()
    }),
    z.object({
        action: z.literal("calculate-income"),
        characterName: z.string()
    }),
    z.object({
        action: z.literal("check-reputation"),
        characterName: z.string()
    })
]);

type ManageSocialStatusArgs = z.infer<typeof ManageSocialStatusSchema>;

export class ManageSocialStatusTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-social-status",
            description: `Manage social status, standing, and reputation for WFRP 4e characters.

WFRP Social Status System:
- Status represents social standing, wealth, and influence
- Divided into tiers: Brass (poor), Silver (middle class), Gold (nobility)
- Standing is the numeric value within a tier (0-5)
- Affects NPC reactions, social tests, income, and opportunities

Status Tiers:
- **Brass** (0-1): Peasants, beggars, criminals - poor conditions, limited respect
- **Silver** (2-4): Craftsmen, merchants, soldiers - comfortable lifestyle, moderate respect
- **Gold** (5+): Knights, nobles, royalty - luxurious lifestyle, high privilege

Social Tests:
- Charm: Persuade, seduce, befriend (higher status helps)
- Intimidate: Threaten, coerce (status aids intimidation)
- Bribery: Offer money/favors (status affects expected amount)
- Gossip: Gather/spread rumors (status affects information access)
- Leadership: Command followers (status provides authority)

Status Modifiers:
- Equal status: No modifier
- Higher status (+1-2 tiers): -10 to -20 (harder to influence superiors)
- Lower status (-1-2 tiers): +10 to +20 (easier to influence inferiors)

Actions:
- **get-status**: Get current status, tier, standing, and social rank
- **change-status**: Change standing (career advancement, scandal, honors, disgrace)
- **make-social-test**: Make social interaction test with status modifiers
- **calculate-income**: Calculate income based on status and career
- **check-reputation**: Check reputation and public standing

Examples:
- Get status: action="get-status", characterName="Hans"
- Change status: action="change-status", characterName="Hans", newStanding=4, reason="Promoted to Knight"
- Social test: action="make-social-test", characterName="Hans", targetName="Baron", testType="charm"
- Calculate income: action="calculate-income", characterName="Hans"
- Check reputation: action="check-reputation", characterName="Hans"`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get-status", "change-status", "make-social-test", "calculate-income", "check-reputation"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Name of the character" },
                    newStanding: { type: "number", description: "New standing value 0-10 (for change-status)" },
                    reason: { type: "string", description: "Reason for status change (for change-status)" },
                    targetName: { type: "string", description: "Target character name (for make-social-test)" },
                    testType: {
                        type: "string",
                        enum: ['charm', 'intimidate', 'bribery', 'gossip', 'leadership'],
                        description: "Type of social test (for make-social-test)"
                    },
                    modifier: { type: "number", description: "Additional modifier to test (for make-social-test)" }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageSocialStatusArgs): Promise<string> {
        const parsed = ManageSocialStatusSchema.parse(args);

        switch (parsed.action) {
            case "get-status":
                return this.handleGetStatus(parsed);
            case "change-status":
                return this.handleChangeStatus(parsed);
            case "make-social-test":
                return this.handleMakeSocialTest(parsed);
            case "calculate-income":
                return this.handleCalculateIncome(parsed);
            case "check-reputation":
                return this.handleCheckReputation(parsed);
        }
    }

    private async handleGetStatus(args: { characterName: string }): Promise<string> {
        this.logger.info("Getting social status", { characterName: args.characterName });

        const response = await this.foundryClient.query(
            "warhammer-mcp.getCharacterInfo",
            { characterName: args.characterName }
        );

        if (!response.success || !response.data) {
            return `❌ Failed to get character info: ${response.error || "Unknown error"}`;
        }

        const character = response.data;
        const status = character.system?.details?.status?.value || 0;
        const standing = character.system?.details?.status?.standing || status;

        // Determine tier
        let tier = "Brass";
        let tierEmoji = "🥉";
        if (standing >= 5) {
            tier = "Gold";
            tierEmoji = "🥇";
        } else if (standing >= 2) {
            tier = "Silver";
            tierEmoji = "🥈";
        }

        // Get career and title
        const career = character.items?.find((item: any) => item.type === "career" && item.system?.current?.value);
        const careerName = career?.name || "Unknown";
        const careerLevel = career?.system?.level?.value || 1;

        let report = `👔 **${character.name}** - Social Status\n\n`;
        report += `## Status Overview\n`;
        report += `${tierEmoji} **Tier:** ${tier}\n`;
        report += `**Standing:** ${standing}\n`;
        report += `**Career:** ${careerName} (Level ${careerLevel})\n\n`;

        // Tier description
        if (tier === "Brass") {
            report += `### Brass Tier - Lower Class\n`;
            report += `Peasants, laborers, beggars, and criminals. Poor living conditions and limited respect.\n\n`;
        } else if (tier === "Silver") {
            report += `### Silver Tier - Middle Class\n`;
            report += `Craftsmen, merchants, soldiers, and professionals. Comfortable lifestyle and moderate respect.\n\n`;
        } else {
            report += `### Gold Tier - Upper Class\n`;
            report += `Knights, nobles, and royalty. Luxurious lifestyle, high respect, and significant privilege.\n\n`;
        }

        // Social modifiers
        report += `## Social Interaction Modifiers\n`;
        report += `- vs Lower Status (+1): +10 to social tests\n`;
        report += `- vs Lower Status (+2+): +20 to social tests\n`;
        report += `- vs Equal Status: No modifier\n`;
        report += `- vs Higher Status (-1): -10 to social tests\n`;
        report += `- vs Higher Status (-2+): -20 to social tests\n`;

        return report;
    }

    private async handleChangeStatus(args: { characterName: string; newStanding: number; reason: string }): Promise<string> {
        this.logger.info("Changing social status", args);

        const response = await this.foundryClient.query(
            "warhammer-mcp.updateCharacter",
            {
                characterName: args.characterName,
                updates: {
                    "system.details.status.value": args.newStanding,
                    "system.details.status.standing": args.newStanding
                }
            }
        );

        if (!response.success) {
            return `❌ Failed to change status: ${response.error || "Unknown error"}`;
        }

        // Determine old and new tiers
        const getTier = (standing: number) => {
            if (standing >= 5) return "Gold 🥇";
            if (standing >= 2) return "Silver 🥈";
            return "Brass 🥉";
        };

        return `✅ **${args.characterName}** - Status Changed\n\n` +
            `**New Standing:** ${args.newStanding}\n` +
            `**Tier:** ${getTier(args.newStanding)}\n` +
            `**Reason:** ${args.reason}\n\n` +
            `Status change affects income, NPC reactions, and social opportunities.`;
    }

    private async handleMakeSocialTest(args: {
        characterName: string;
        targetName?: string | undefined;
        testType: "charm" | "intimidate" | "bribery" | "gossip" | "leadership";
        modifier?: number | undefined;
    }): Promise<string> {
        this.logger.info("Making social test", args);

        const response = await this.foundryClient.query(
            "warhammer-mcp.makeSocialTest",
            {
                characterName: args.characterName,
                targetName: args.targetName,
                testType: args.testType,
                modifier: args.modifier || 0
            }
        );

        if (!response.success) {
            return `❌ Failed to make social test: ${response.error || "Unknown error"}`;
        }

        return response.data || "Social test completed";
    }

    private async handleCalculateIncome(args: { characterName: string }): Promise<string> {
        this.logger.info("Calculating income", { characterName: args.characterName });

        const response = await this.foundryClient.query(
            "warhammer-mcp.calculateIncome",
            { characterName: args.characterName }
        );

        if (!response.success) {
            return `❌ Failed to calculate income: ${response.error || "Unknown error"}`;
        }

        return response.data || "Income calculated";
    }

    private async handleCheckReputation(args: { characterName: string }): Promise<string> {
        this.logger.info("Checking reputation", { characterName: args.characterName });

        const response = await this.foundryClient.query(
            "warhammer-mcp.checkReputation",
            { characterName: args.characterName }
        );

        if (!response.success) {
            return `❌ Failed to check reputation: ${response.error || "Unknown error"}`;
        }

        return response.data || "Reputation checked";
    }
}
