import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Create NPC schema
const CreateNPCSchema = z.object({
    action: z.literal("create"),
    name: z.string(),
    totalXP: z.number().min(0).max(10000),
    archetype: z.enum([
        "aggressive-fighter",
        "ranged-combatant",
        "defensive-warrior",
        "agile-rogue",
        "cunning-thief",
        "wise-priest",
        "powerful-wizard",
        "charismatic-leader",
        "scholarly-sage",
        "hardy-survivalist",
        "brutal-berserker",
        "swift-duelist",
        "intimidating-thug",
        "sneaky-assassin"
    ]),
    personalityTraits: z.array(z.string()).optional(),
    species: z.enum(["human", "halfling", "dwarf", "high-elf", "wood-elf"]).default("human"),
    career: z.string().optional(),
    description: z.string().optional(),
    createInFoundry: z.boolean().default(true)
});

// List archetypes schema
const ListArchetypesSchema = z.object({
    action: z.literal("list-archetypes")
});

// Preview XP distribution schema
const PreviewXPSchema = z.object({
    action: z.literal("preview"),
    totalXP: z.number().min(0).max(10000),
    archetype: z.enum([
        "aggressive-fighter",
        "ranged-combatant",
        "defensive-warrior",
        "agile-rogue",
        "cunning-thief",
        "wise-priest",
        "powerful-wizard",
        "charismatic-leader",
        "scholarly-sage",
        "hardy-survivalist",
        "brutal-berserker",
        "swift-duelist",
        "intimidating-thug",
        "sneaky-assassin"
    ]),
    species: z.enum(["human", "halfling", "dwarf", "high-elf", "wood-elf"]).default("human")
});

const ManageNPCGenerationSchema = z.discriminatedUnion("action", [
    CreateNPCSchema,
    ListArchetypesSchema,
    PreviewXPSchema
]);

type ManageNPCGenerationArgs = z.infer<typeof ManageNPCGenerationSchema>;

export class ManageNPCGenerationTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-npc-generation",
            description: `Generate custom WFRP 4e NPCs using archetypes and XP budgets.

**Archetypes** (determines XP distribution):
- **aggressive-fighter**: WS, S, T, combat skills, aggressive talents
- **ranged-combatant**: BS, Ag, Dex, ranged skills, sharpshooter talents
- **defensive-warrior**: T, WP, defensive skills, resilient talents
- **agile-rogue**: Ag, Dex, I, stealth skills, cunning talents
- **cunning-thief**: Dex, Int, Fel, criminal skills, deceptive talents
- **wise-priest**: WP, Int, Fel, religious skills, divine talents
- **powerful-wizard**: Int, WP, magical skills, arcane talents
- **charismatic-leader**: Fel, WP, social skills, inspiring talents
- **scholarly-sage**: Int, academic skills, knowledge talents
- **hardy-survivalist**: T, outdoor skills, wilderness talents
- **brutal-berserker**: S, WS, T, frenzied combat
- **swift-duelist**: Ag, I, WS, finesse combat, precision talents
- **intimidating-thug**: S, T, Fel, intimidation/brawling
- **sneaky-assassin**: Ag, Dex, WS, stealth/poison, deadly precision

**XP Budget Guidelines:**
- 500-1000: Novice NPCs
- 1000-2000: Experienced NPCs
- 2000-4000: Veteran NPCs
- 4000+: Master NPCs

**Actions:**
- **create**: Generate NPC with specified archetype and XP budget
- **list-archetypes**: Show all archetypes with details
- **preview**: Preview XP distribution before creating

**Example Usage:**
- Create NPC: {action: "create", name: "Brutalus", totalXP: 1500, archetype: "brutal-berserker"}
- List archetypes: {action: "list-archetypes"}
- Preview distribution: {action: "preview", totalXP: 1500, archetype: "brutal-berserker"}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["create", "list-archetypes", "preview"],
                        description: "The NPC generation action to perform"
                    },
                    name: {
                        type: "string",
                        description: "[create] Name for the NPC"
                    },
                    totalXP: {
                        type: "number",
                        description: "[create/preview] Total XP budget (0-10000)"
                    },
                    archetype: {
                        type: "string",
                        enum: [
                            "aggressive-fighter", "ranged-combatant", "defensive-warrior",
                            "agile-rogue", "cunning-thief", "wise-priest", "powerful-wizard",
                            "charismatic-leader", "scholarly-sage", "hardy-survivalist",
                            "brutal-berserker", "swift-duelist", "intimidating-thug", "sneaky-assassin"
                        ],
                        description: "[create/preview] Archetype determining XP distribution"
                    },
                    personalityTraits: {
                        type: "array",
                        items: { type: "string" },
                        description: "[create] Optional personality traits"
                    },
                    species: {
                        type: "string",
                        enum: ["human", "halfling", "dwarf", "high-elf", "wood-elf"],
                        description: "[create/preview] Species (default: human)"
                    },
                    career: {
                        type: "string",
                        description: "[create] Optional specific career"
                    },
                    description: {
                        type: "string",
                        description: "[create] Optional physical description/background"
                    },
                    createInFoundry: {
                        type: "boolean",
                        description: "[create] Actually create in Foundry (default: true)"
                    }
                },
                required: ["action"]
            }
        }];
    }

    async execute(args: ManageNPCGenerationArgs) {
        this.logger.info("Executing manage-npc-generation", { action: args.action });

        switch (args.action) {
            case "create":
                return this.handleCreate(args);
            case "list-archetypes":
                return this.handleListArchetypes();
            case "preview":
                return this.handlePreview(args);
        }
    }

    private async handleCreate(args: {
        name: string;
        totalXP: number;
        archetype: string;
        personalityTraits?: string[] | undefined;
        species: string;
        career?: string | undefined;
        description?: string | undefined;
        createInFoundry: boolean;
    }) {
        this.logger.info("Creating custom NPC", {
            name: args.name,
            archetype: args.archetype,
            totalXP: args.totalXP,
        });

        const response = await this.foundryClient.query(
            "warhammer-mcp.createCustomNPC",
            {
                name: args.name,
                totalXP: args.totalXP,
                archetype: args.archetype,
                personalityTraits: args.personalityTraits,
                species: args.species,
                career: args.career,
                description: args.description,
                createInFoundry: args.createInFoundry,
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to create NPC: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const npc = response.data;
        let resultText = `✨ **NPC ${args.createInFoundry ? "Created" : "Preview"}**\n\n`;
        resultText += `**Name:** ${args.name}\n`;
        resultText += `**Archetype:** ${args.archetype}\n`;
        resultText += `**Species:** ${args.species}\n`;
        if (args.career) {
            resultText += `**Career:** ${args.career}\n`;
        }
        resultText += `**XP Budget:** ${args.totalXP}\n`;
        resultText += `**XP Spent:** ${npc.xpSpent || 0}\n\n`;

        if (npc.characteristics) {
            resultText += `**Characteristics:**\n`;
            for (const [char, value] of Object.entries(npc.characteristics)) {
                resultText += `- ${char.toUpperCase()}: ${value}\n`;
            }
            resultText += `\n`;
        }

        if (npc.skills && npc.skills.length > 0) {
            resultText += `**Skills:** (${npc.skills.length})\n`;
            for (const skill of npc.skills.slice(0, 10)) {
                resultText += `- ${skill.name}${skill.advances ? ` (+${skill.advances})` : ""}\n`;
            }
            if (npc.skills.length > 10) {
                resultText += `- ...and ${npc.skills.length - 10} more\n`;
            }
            resultText += `\n`;
        }

        if (npc.talents && npc.talents.length > 0) {
            resultText += `**Talents:** (${npc.talents.length})\n`;
            for (const talent of npc.talents) {
                resultText += `- ${talent.name}\n`;
            }
            resultText += `\n`;
        }

        if (args.personalityTraits && args.personalityTraits.length > 0) {
            resultText += `**Personality:** ${args.personalityTraits.join(", ")}\n\n`;
        }

        if (args.createInFoundry) {
            resultText += `✅ NPC has been created in Foundry VTT and is ready to use.`;
        } else {
            resultText += `📋 This is a preview. Set createInFoundry: true to actually create the NPC.`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleListArchetypes() {
        this.logger.info("Listing NPC archetypes");

        let resultText = `🎭 **WFRP 4e NPC Archetypes**\n\n`;

        const archetypes = [
            {
                name: "aggressive-fighter",
                primary: "WS, S, T",
                role: "Front-line combatant, prioritizes offense",
                careers: "Soldier, Mercenary, Pit Fighter"
            },
            {
                name: "ranged-combatant",
                primary: "BS, Ag, Dex",
                role: "Ranged combat specialist",
                careers: "Hunter, Outrider, Marksman"
            },
            {
                name: "defensive-warrior",
                primary: "T, WP, Endurance",
                role: "Tank, protects others",
                careers: "Bodyguard, Knight, Guard"
            },
            {
                name: "agile-rogue",
                primary: "Ag, Dex, I",
                role: "Stealth and agility specialist",
                careers: "Thief, Spy, Cat Burglar"
            },
            {
                name: "cunning-thief",
                primary: "Dex, Int, Fel",
                role: "Criminal mastermind, deception",
                careers: "Thief, Charlatan, Fence"
            },
            {
                name: "wise-priest",
                primary: "WP, Int, Fel",
                role: "Divine magic user, religious leader",
                careers: "Priest, Mystic, Zealot"
            },
            {
                name: "powerful-wizard",
                primary: "Int, WP, Channelling",
                role: "Arcane magic user",
                careers: "Wizard, Apprentice Wizard, Wizard Lord"
            },
            {
                name: "charismatic-leader",
                primary: "Fel, WP, Leadership",
                role: "Social influencer, inspires others",
                careers: "Noble, Politician, Demagogue"
            },
            {
                name: "scholarly-sage",
                primary: "Int, Lore skills",
                role: "Knowledge specialist, researcher",
                careers: "Scholar, Physician, Engineer"
            },
            {
                name: "hardy-survivalist",
                primary: "T, Outdoor skills",
                role: "Wilderness expert, tracker",
                careers: "Scout, Ranger, Herbalist"
            },
            {
                name: "brutal-berserker",
                primary: "S, WS, T (max)",
                role: "Frenzied combat, all-out offense",
                careers: "Berserker, Norse Raider, Pit Fighter"
            },
            {
                name: "swift-duelist",
                primary: "Ag, I, WS",
                role: "Finesse combat, precision strikes",
                careers: "Duellist, Fencer, Assassin"
            },
            {
                name: "intimidating-thug",
                primary: "S, T, Fel (Intimidate)",
                role: "Brute force, intimidation",
                careers: "Thug, Bounty Hunter, Bailiff"
            },
            {
                name: "sneaky-assassin",
                primary: "Ag, Dex, Stealth",
                role: "Silent killer, precision strikes",
                careers: "Assassin, Spy, Witch Hunter"
            }
        ];

        for (const archetype of archetypes) {
            resultText += `**${archetype.name}**\n`;
            resultText += `   Primary: ${archetype.primary}\n`;
            resultText += `   Role: ${archetype.role}\n`;
            resultText += `   Careers: ${archetype.careers}\n\n`;
        }

        resultText += `\n**Usage:** Use these archetypes with the 'create' action to generate balanced NPCs.\n`;
        resultText += `**XP Guidelines:** 500-1000 (novice), 1000-2000 (experienced), 2000-4000 (veteran), 4000+ (master)`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handlePreview(args: {
        totalXP: number;
        archetype: string;
        species: string;
    }) {
        this.logger.info("Previewing XP distribution", {
            archetype: args.archetype,
            totalXP: args.totalXP,
        });

        const response = await this.foundryClient.query(
            "warhammer-mcp.previewNPCXP",
            {
                totalXP: args.totalXP,
                archetype: args.archetype,
                species: args.species,
            }
        );

        if (!response.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `❌ Failed to preview XP: ${response.error || "Unknown error"}`,
                    },
                ],
            };
        }

        const preview = response.data;
        let resultText = `📊 **XP Distribution Preview**\n\n`;
        resultText += `**Archetype:** ${args.archetype}\n`;
        resultText += `**Species:** ${args.species}\n`;
        resultText += `**Total XP:** ${args.totalXP}\n\n`;

        if (preview.characteristics) {
            resultText += `**Characteristic Advances:**\n`;
            let charXP = 0;
            for (const [char, advances] of Object.entries(preview.characteristics)) {
                if (typeof advances === 'number' && advances > 0) {
                    resultText += `- ${char.toUpperCase()}: +${advances} advances\n`;
                    charXP += preview.characteristicCosts?.[char] || 0;
                }
            }
            resultText += `Total: ${charXP} XP\n\n`;
        }

        if (preview.skills && preview.skills.length > 0) {
            resultText += `**Skill Advances:**\n`;
            let skillXP = 0;
            for (const skill of preview.skills) {
                resultText += `- ${skill.name}: +${skill.advances || 0}\n`;
                skillXP += skill.cost || 0;
            }
            resultText += `Total: ${skillXP} XP\n\n`;
        }

        if (preview.talents && preview.talents.length > 0) {
            resultText += `**Talents:**\n`;
            let talentXP = 0;
            for (const talent of preview.talents) {
                resultText += `- ${talent.name}\n`;
                talentXP += talent.cost || 100;
            }
            resultText += `Total: ${talentXP} XP\n\n`;
        }

        const totalSpent = preview.totalSpent || 0;
        const remaining = args.totalXP - totalSpent;
        resultText += `**Summary:**\n`;
        resultText += `- Total Spent: ${totalSpent} XP\n`;
        resultText += `- Remaining: ${remaining} XP\n`;
        resultText += `- Efficiency: ${((totalSpent / args.totalXP) * 100).toFixed(1)}%`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }
}
