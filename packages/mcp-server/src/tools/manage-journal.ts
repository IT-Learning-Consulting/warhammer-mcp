import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Create journal schema
const CreateJournalSchema = z.object({
    action: z.literal("create"),
    questTitle: z.string(),
    questDescription: z.string(),
    questType: z.enum(['main', 'side', 'personal', 'mystery', 'fetch', 'escort', 'kill', 'collection']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']).optional(),
    location: z.string().optional(),
    questGiver: z.string().optional(),
    npcName: z.string().optional(),
    rewards: z.string().optional()
});

// Update journal schema
const UpdateJournalSchema = z.object({
    action: z.literal("update"),
    journalId: z.string(),
    newContent: z.string(),
    updateType: z.enum(['progress', 'completion', 'failure', 'modification'])
});

// Link NPC schema
const LinkNPCSchema = z.object({
    action: z.literal("link-npc"),
    journalId: z.string(),
    npcName: z.string(),
    relationship: z.enum(['quest_giver', 'target', 'ally', 'enemy', 'contact'])
});

// List journals schema
const ListJournalsSchema = z.object({
    action: z.literal("list"),
    filterQuests: z.boolean().default(false),
    includeContent: z.boolean().default(false)
});

// Search journals schema
const SearchJournalsSchema = z.object({
    action: z.literal("search"),
    query: z.string()
});

const ManageJournalSchema = z.discriminatedUnion("action", [
    CreateJournalSchema,
    UpdateJournalSchema,
    LinkNPCSchema,
    ListJournalsSchema,
    SearchJournalsSchema
]);

type ManageJournalArgs = z.infer<typeof ManageJournalSchema>;

export class ManageJournalTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-journal",
            description: `Manage journal entries and quests in Foundry VTT.

**Journal Entries** store campaign notes, quests, lore, NPC information, and session logs.

**Quest Types:**
- main: Primary campaign storyline
- side: Optional side quests
- personal: Character-specific quests
- mystery: Investigation quests
- fetch: Retrieval missions
- escort: Protection missions
- kill: Combat missions
- collection: Gathering objectives

**Difficulty Levels:**
- easy: Low-level characters
- medium: Average challenge
- hard: Experienced characters
- deadly: High-level danger

**Actions:**
- **create**: Create new quest journal with AI-generated content
- **update**: Add progress/completion info to existing journal
- **link-npc**: Link journal to NPC (quest giver, target, ally, enemy, contact)
- **list**: List all journals (optionally filter for quests)
- **search**: Search journal content

**Content Formatting (for update action):**
Use quest-style HTML or plain text (Markdown will be stripped):
- Sections: <h2 class="spaced">Section Title</h2>
- GM Notes: <div class="gmnote"><p>GM info</p></div>
- Player Info: <div class="readaloud"><p>Player content</p></div>
- Plain text: Auto-wrapped in <p> tags

**Example Usage:**
- Create quest: {action: "create", questTitle: "The Cult of the Purple Hand", questDescription: "Investigate cultist activity", location: "Altdorf sewers"}
- Update quest: {action: "update", journalId: "abc123", newContent: "The party discovered...", updateType: "progress"}
- Link NPC: {action: "link-npc", journalId: "abc123", npcName: "Captain Marcus", relationship: "quest_giver"}
- List quests: {action: "list", filterQuests: true}
- Search: {action: "search", query: "cultist"}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["create", "update", "link-npc", "list", "search"],
                        description: "The journal action to perform"
                    },
                    questTitle: {
                        type: "string",
                        description: "[create] Title of the quest/journal"
                    },
                    questDescription: {
                        type: "string",
                        description: "[create] Detailed quest description"
                    },
                    questType: {
                        type: "string",
                        enum: ['main', 'side', 'personal', 'mystery', 'fetch', 'escort', 'kill', 'collection'],
                        description: "[create] Type of quest"
                    },
                    difficulty: {
                        type: "string",
                        enum: ['easy', 'medium', 'hard', 'deadly'],
                        description: "[create] Quest difficulty level"
                    },
                    location: {
                        type: "string",
                        description: "[create] Where the quest takes place"
                    },
                    questGiver: {
                        type: "string",
                        description: "[create] NPC who gives the quest"
                    },
                    npcName: {
                        type: "string",
                        description: "[create/link-npc] Key NPC name"
                    },
                    rewards: {
                        type: "string",
                        description: "[create] Quest rewards"
                    },
                    journalId: {
                        type: "string",
                        description: "[update/link-npc] Journal entry ID"
                    },
                    newContent: {
                        type: "string",
                        description: "[update] Content to add (HTML or plain text)"
                    },
                    updateType: {
                        type: "string",
                        enum: ['progress', 'completion', 'failure', 'modification'],
                        description: "[update] Type of update"
                    },
                    relationship: {
                        type: "string",
                        enum: ['quest_giver', 'target', 'ally', 'enemy', 'contact'],
                        description: "[link-npc] Relationship type"
                    },
                    filterQuests: {
                        type: "boolean",
                        description: "[list] Only show quest-related journals"
                    },
                    includeContent: {
                        type: "boolean",
                        description: "[list] Include content preview"
                    },
                    query: {
                        type: "string",
                        description: "[search] Search query"
                    }
                },
                required: ["action"]
            }
        }];
    }

    async execute(args: ManageJournalArgs) {
        this.logger.info("Executing manage-journal", { action: args.action });

        switch (args.action) {
            case "create":
                return this.handleCreate(args);
            case "update":
                return this.handleUpdate(args);
            case "link-npc":
                return this.handleLinkNPC(args);
            case "list":
                return this.handleList(args);
            case "search":
                return this.handleSearch(args);
        }
    }

    private async handleCreate(args: {
        questTitle: string;
        questDescription: string;
        questType?: string | undefined;
        difficulty?: string | undefined;
        location?: string | undefined;
        questGiver?: string | undefined;
        npcName?: string | undefined;
        rewards?: string | undefined;
    }) {
        this.logger.info("Creating quest journal", { title: args.questTitle });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.createQuestJournal",
            {
                questTitle: args.questTitle,
                questDescription: args.questDescription,
                questType: args.questType,
                difficulty: args.difficulty,
                location: args.location,
                questGiver: args.questGiver,
                npcName: args.npcName,
                rewards: args.rewards,
            }
        );

        const journal = response;
        return {
            content: [
                {
                    type: "text",
                    text: `📖 **Quest Journal Created**\n\n**Title:** ${args.questTitle}\n**ID:** ${journal.journalId || "N/A"}\n**Type:** ${args.questType || "general"}\n**Difficulty:** ${args.difficulty || "not specified"}\n\n✅ Journal entry created successfully. ${args.questGiver ? `Quest given by ${args.questGiver}.` : ""}`,
                },
            ],
        };
    }

    private async handleUpdate(args: {
        journalId: string;
        newContent: string;
        updateType: string;
    }) {
        this.logger.info("Updating quest journal", { journalId: args.journalId });

        await this.foundryClient.query<any>(
            "warhammer-mcp.updateQuestJournal",
            {
                journalId: args.journalId,
                newContent: args.newContent,
                updateType: args.updateType,
            }
        );

        let updateIcon = "📝";
        switch (args.updateType) {
            case "completion":
                updateIcon = "✅";
                break;
            case "failure":
                updateIcon = "❌";
                break;
            case "progress":
                updateIcon = "🔄";
                break;
        }

        return {
            content: [
                {
                    type: "text",
                    text: `${updateIcon} **Journal Updated**\n\n**Update Type:** ${args.updateType}\n\n✅ Journal entry has been updated with the new content.`,
                },
            ],
        };
    }

    private async handleLinkNPC(args: {
        journalId: string;
        npcName: string;
        relationship: string;
    }) {
        this.logger.info("Linking journal to NPC", {
            journalId: args.journalId,
            npcName: args.npcName,
        });

        await this.foundryClient.query<any>(
            "warhammer-mcp.linkQuestToNPC",
            {
                journalId: args.journalId,
                npcName: args.npcName,
                relationship: args.relationship,
            }
        );

        return {
            content: [
                {
                    type: "text",
                    text: `🔗 **Journal Linked to NPC**\n\n**NPC:** ${args.npcName}\n**Relationship:** ${args.relationship}\n\n✅ Journal and NPC are now linked.`,
                },
            ],
        };
    }

    private async handleList(args: {
        filterQuests: boolean;
        includeContent: boolean;
    }) {
        this.logger.info("Listing journals", { filterQuests: args.filterQuests });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.listJournals",
            {
                filterQuests: args.filterQuests,
                includeContent: args.includeContent,
            }
        );

        const journals = response ?? [];
        if (journals.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `📋 **No Journals Found**\n\nThere are no ${args.filterQuests ? "quest " : ""}journal entries in this world yet.`,
                    },
                ],
            };
        }

        let resultText = `📖 **${args.filterQuests ? "Quest " : ""}Journals** (${journals.length})\n\n`;
        for (const journal of journals) {
            resultText += `**${journal.name}**\n`;
            resultText += `   ID: ${journal.id}\n`;
            if (journal.folder) {
                resultText += `   Folder: ${journal.folder}\n`;
            }
            if (args.includeContent && journal.content) {
                const preview = journal.content
                    .replace(/<[^>]*>/g, "")
                    .substring(0, 100);
                resultText += `   Preview: ${preview}${journal.content.length > 100 ? "..." : ""}\n`;
            }
            resultText += `\n`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleSearch(args: { query: string }) {
        this.logger.info("Searching journals", { query: args.query });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.searchJournals",
            { query: args.query }
        );

        const results = response ?? [];
        if (results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `🔍 **No Results Found**\n\nNo journals match the search query "${args.query}".`,
                    },
                ],
            };
        }

        let resultText = `🔍 **Search Results** for "${args.query}"\n\n`;
        resultText += `Found ${results.length} matching journal(s):\n\n`;

        for (const result of results) {
            resultText += `**${result.name}**\n`;
            resultText += `   ID: ${result.id}\n`;
            if (result.matches && result.matches.length > 0) {
                resultText += `   Matches:\n`;
                for (const match of result.matches.slice(0, 2)) {
                    const preview = match.replace(/<[^>]*>/g, "").substring(0, 100);
                    resultText += `   - ${preview}...\n`;
                }
            }
            resultText += `\n`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }
}
