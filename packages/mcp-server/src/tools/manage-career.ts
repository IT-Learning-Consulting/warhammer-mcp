import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

const ManageCareerSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("get-advancement"),
        characterName: z.string()
    }),
    z.object({
        action: z.literal("advance-characteristic"),
        characterName: z.string(),
        characteristic: z.enum(['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']),
        advances: z.number().default(1)
    }),
    z.object({
        action: z.literal("advance-skill"),
        characterName: z.string(),
        skillName: z.string(),
        advances: z.number().default(1)
    }),
    z.object({
        action: z.literal("advance-talent"),
        characterName: z.string(),
        talentName: z.string(),
        ranks: z.number().default(1)
    }),
    z.object({
        action: z.literal("change-career"),
        characterName: z.string(),
        newCareerName: z.string()
    })
]);

type ManageCareerArgs = z.infer<typeof ManageCareerSchema>;

export class ManageCareerTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-career",
            description: `Manage career advancement, XP spending, and progression for WFRP 4e characters.

WFRP Career System:
- Careers define character progression paths (soldier, merchant, wizard, etc.)
- Each career has 4 levels with specific advancement schemes
- Advance characteristics, skills, and talents using XP
- Complete career advances to progress to next level or change careers

XP Costs:
- **Characteristics**: 25 XP × number of advances already taken
  * First advance: 25 XP
  * Second advance: 50 XP
  * Third advance: 75 XP, etc.
- **Skills**: 
  * In-career: 10 XP × (current advances + 1)
  * Out-of-career: 15 XP × (current advances + 1)
- **Talents**: 100 XP per rank
- **Career Change**: 
  * 100 XP if current career complete
  * 200 XP if current career incomplete

Actions:
- **get-advancement**: View available career advances, XP costs, and progress
- **advance-characteristic**: Spend XP to increase a characteristic (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)
- **advance-skill**: Spend XP to advance or purchase a skill
- **advance-talent**: Spend XP to purchase or increase talent rank
- **change-career**: Change to a new career (deducts XP, finds career in compendium)

Examples:
- Get advances: action="get-advancement", characterName="Hans"
- Advance char: action="advance-characteristic", characterName="Hans", characteristic="ws", advances=1
- Advance skill: action="advance-skill", characterName="Hans", skillName="Melee (Basic)", advances=1
- Add talent: action="advance-talent", characterName="Hans", talentName="Strike Mighty Blow", ranks=1
- Change career: action="change-career", characterName="Hans", newCareerName="Sergeant"`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get-advancement", "advance-characteristic", "advance-skill", "advance-talent", "change-career"],
                        description: "Action to perform"
                    },
                    characterName: { type: "string", description: "Name of the character" },
                    characteristic: {
                        type: "string",
                        enum: ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'],
                        description: "Characteristic to advance (for advance-characteristic)"
                    },
                    advances: { type: "number", description: "Number of advances (for advance-characteristic/skill)" },
                    skillName: { type: "string", description: "Skill name (for advance-skill)" },
                    talentName: { type: "string", description: "Talent name (for advance-talent)" },
                    ranks: { type: "number", description: "Talent ranks (for advance-talent)" },
                    newCareerName: { type: "string", description: "New career name (for change-career)" }
                },
                required: ["action", "characterName"]
            }
        }];
    }

    async handle(args: ManageCareerArgs): Promise<string> {
        const parsed = ManageCareerSchema.parse(args);

        switch (parsed.action) {
            case "get-advancement":
                return this.handleGetAdvancement(parsed);
            case "advance-characteristic":
                return this.handleAdvanceCharacteristic(parsed);
            case "advance-skill":
                return this.handleAdvanceSkill(parsed);
            case "advance-talent":
                return this.handleAdvanceTalent(parsed);
            case "change-career":
                return this.handleChangeCareer(parsed);
        }
    }

    private async handleGetAdvancement(args: { characterName: string }): Promise<string> {
        this.logger.info('Getting career advancement', { characterName: args.characterName });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.getCareerAdvancement",
            { characterName: args.characterName }
        );

        return response ?? "Career advancement information retrieved";
    }

    private async handleAdvanceCharacteristic(args: {
        characterName: string;
        characteristic: string;
        advances: number;
    }): Promise<string> {
        this.logger.info('Advancing characteristic', args);

        await this.foundryClient.query<any>(
            "warhammer-mcp.advanceCharacteristic",
            {
                characterName: args.characterName,
                characteristic: args.characteristic,
                advances: args.advances
            }
        );

        const charName = args.characteristic.toUpperCase();
        const xpCost = 25 * args.advances; // Simplified - actual cost varies
        return `✅ Advanced **${charName}** by ${args.advances} for ${args.characterName}\n` +
            `XP spent: ~${xpCost} (varies by current advances)`;
    }

    private async handleAdvanceSkill(args: {
        characterName: string;
        skillName: string;
        advances: number;
    }): Promise<string> {
        this.logger.info('Advancing skill', args);

        await this.foundryClient.query<any>(
            "warhammer-mcp.advanceSkill",
            {
                characterName: args.characterName,
                skillName: args.skillName,
                advances: args.advances
            }
        );

        return `✅ Advanced **${args.skillName}** by ${args.advances} for ${args.characterName}`;
    }

    private async handleAdvanceTalent(args: {
        characterName: string;
        talentName: string;
        ranks: number;
    }): Promise<string> {
        this.logger.info('Advancing talent', args);

        await this.foundryClient.query<any>(
            "warhammer-mcp.advanceTalent",
            {
                characterName: args.characterName,
                talentName: args.talentName,
                ranks: args.ranks
            }
        );

        const xpCost = 100 * args.ranks;
        return `✅ Advanced **${args.talentName}** by ${args.ranks} rank(s) for ${args.characterName}\n` +
            `XP spent: ${xpCost}`;
    }

    private async handleChangeCareer(args: {
        characterName: string;
        newCareerName: string;
    }): Promise<string> {
        this.logger.info('Changing career', args);

        await this.foundryClient.query<any>(
            "warhammer-mcp.changeCareer",
            {
                characterName: args.characterName,
                newCareerName: args.newCareerName
            }
        );

        return `✅ **${args.characterName}** changed career to **${args.newCareerName}**\n\n` +
            `XP cost: 100-200 depending on current career completion`;
    }
}
