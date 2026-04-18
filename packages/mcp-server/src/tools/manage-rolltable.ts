import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

// Create roll table schema
const CreateRollTableSchema = z.object({
    action: z.literal("create"),
    name: z.string(),
    description: z.string().optional(),
    formula: z.string().default("1d20"),
    entries: z.array(z.object({
        text: z.string(),
        weight: z.number().optional(),
        range: z.tuple([z.number(), z.number()]).optional()
    })),
    replacement: z.boolean().default(true),
    displayRoll: z.boolean().default(true)
});

// List roll tables schema
const ListRollTablesSchema = z.object({
    action: z.literal("list")
});

// Get roll table schema
const GetRollTableSchema = z.object({
    action: z.literal("get"),
    tableId: z.string()
});

// Roll on table schema
const RollOnTableSchema = z.object({
    action: z.literal("roll"),
    tableId: z.string(),
    rollMode: z.enum(["public", "private", "blind", "self"]).default("public")
});

// Delete roll table schema
const DeleteRollTableSchema = z.object({
    action: z.literal("delete"),
    tableId: z.string()
});

const ManageRollTableSchema = z.discriminatedUnion("action", [
    CreateRollTableSchema,
    ListRollTablesSchema,
    GetRollTableSchema,
    RollOnTableSchema,
    DeleteRollTableSchema
]);

type ManageRollTableArgs = z.infer<typeof ManageRollTableSchema>;

export class ManageRollTableTool {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [{
            name: "manage-rolltable",
            description: `Manage roll tables in Foundry VTT - create, list, get, roll, and delete tables.

**Roll Tables** are used for random generation: encounters, loot, events, weather, rumors, etc.

**Common Use Cases:**
- Random Encounter Tables (d100 wilderness)
- Loot/Treasure Tables
- Critical Hit/Fumble Tables
- Random Event/Weather Tables
- NPC Name/Personality Tables

**Formula Examples:**
- "1d100": Roll 1d100, entries have ranges (1-5, 6-10, etc.)
- "1d20": Standard d20
- "1d6": Simple d6
- "2d6": 2d6 bell curve (2-12)

**Actions:**
- **create**: Create new roll table with entries
- **list**: List all roll tables in world
- **get**: Get details of specific table
- **roll**: Roll on table and get result
- **delete**: Permanently delete table

**Example Usage:**
- Create table: {action: "create", name: "Random Encounters", formula: "1d20", entries: [{text: "Goblin ambush", range: [1, 5]}, ...]}
- List tables: {action: "list"}
- Get table: {action: "get", tableId: "abc123"}
- Roll on table: {action: "roll", tableId: "abc123", rollMode: "public"}
- Delete table: {action: "delete", tableId: "abc123"}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["create", "list", "get", "roll", "delete"],
                        description: "The roll table action to perform"
                    },
                    tableId: {
                        type: "string",
                        description: "[get/roll/delete] ID of the roll table"
                    },
                    name: {
                        type: "string",
                        description: "[create] Name of the roll table"
                    },
                    description: {
                        type: "string",
                        description: "[create] Optional table description"
                    },
                    formula: {
                        type: "string",
                        description: "[create] Dice formula (e.g., '1d100', '1d20', '2d6')"
                    },
                    entries: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                text: { type: "string" },
                                weight: { type: "number" },
                                range: {
                                    type: "array",
                                    items: { type: "number" },
                                    minItems: 2,
                                    maxItems: 2
                                }
                            },
                            required: ["text"]
                        },
                        description: "[create] Array of table entries"
                    },
                    replacement: {
                        type: "boolean",
                        description: "[create] Allow same result multiple times (default: true)"
                    },
                    displayRoll: {
                        type: "boolean",
                        description: "[create] Display roll publicly in chat (default: true)"
                    },
                    rollMode: {
                        type: "string",
                        enum: ["public", "private", "blind", "self"],
                        description: "[roll] How to display the roll result"
                    }
                },
                required: ["action"]
            }
        }];
    }

    async execute(args: ManageRollTableArgs) {
        this.logger.info("Executing manage-rolltable", { action: args.action });

        switch (args.action) {
            case "create":
                return this.handleCreate(args);
            case "list":
                return this.handleList();
            case "get":
                return this.handleGet(args);
            case "roll":
                return this.handleRoll(args);
            case "delete":
                return this.handleDelete(args);
        }
    }

    private async handleCreate(args: {
        name: string;
        description?: string | undefined;
        formula: string;
        entries: Array<{
            text: string;
            weight?: number | undefined;
            range?: [number, number] | undefined;
        }>;
        replacement: boolean;
        displayRoll: boolean;
    }) {
        this.logger.info("Creating roll table", { name: args.name });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.createRollTable",
            {
                name: args.name,
                description: args.description,
                formula: args.formula,
                entries: args.entries,
                replacement: args.replacement,
                displayRoll: args.displayRoll,
            }
        );

        const table = response;
        return {
            content: [
                {
                    type: "text",
                    text: `🎲 **Roll Table Created**\n\n**Name:** ${args.name}\n**Formula:** ${args.formula}\n**Entries:** ${args.entries.length}\n**ID:** ${table.id || "N/A"}\n\n✅ Roll table is ready to use. Use the 'roll' action to roll on this table.`,
                },
            ],
        };
    }

    private async handleList() {
        this.logger.info("Listing roll tables");

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.listRollTables",
            {}
        );

        const tables = response ?? [];
        if (tables.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `📋 **No Roll Tables Found**\n\nThere are no roll tables in this world yet. Create one using the 'create' action.`,
                    },
                ],
            };
        }

        let resultText = `🎲 **Roll Tables** (${tables.length})\n\n`;
        for (const table of tables) {
            resultText += `**${table.name}**\n`;
            resultText += `   ID: ${table.id}\n`;
            if (table.formula) {
                resultText += `   Formula: ${table.formula}\n`;
            }
            if (table.results) {
                resultText += `   Entries: ${table.results.length}\n`;
            }
            resultText += `\n`;
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleGet(args: { tableId: string }) {
        this.logger.info("Getting roll table", { tableId: args.tableId });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.getRollTable",
            { tableId: args.tableId }
        );

        const table = response;
        let resultText = `🎲 **Roll Table Details**\n\n`;
        resultText += `**Name:** ${table.name}\n`;
        resultText += `**ID:** ${table.id}\n`;
        resultText += `**Formula:** ${table.formula || "Unknown"}\n`;
        if (table.description) {
            resultText += `**Description:** ${table.description}\n`;
        }
        resultText += `\n`;

        if (table.results && table.results.length > 0) {
            resultText += `**Entries:** (${table.results.length})\n\n`;
            for (const entry of table.results) {
                if (entry.range) {
                    resultText += `${entry.range[0]}-${entry.range[1]}: ${entry.text}\n`;
                } else {
                    resultText += `- ${entry.text}${entry.weight ? ` (weight: ${entry.weight})` : ""}\n`;
                }
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleRoll(args: {
        tableId: string;
        rollMode: string;
    }) {
        this.logger.info("Rolling on table", { tableId: args.tableId });

        const response = await this.foundryClient.query<any>(
            "warhammer-mcp.rollOnTable",
            {
                tableId: args.tableId,
                rollMode: args.rollMode,
            }
        );

        const result = response;
        let resultText = `🎲 **Roll Table Result**\n\n`;
        if (result.tableName) {
            resultText += `**Table:** ${result.tableName}\n`;
        }
        if (result.roll) {
            resultText += `**Roll:** ${result.roll}\n`;
        }
        resultText += `**Result:** ${result.text || result.result || "Unknown"}\n\n`;
        resultText += `Roll mode: ${args.rollMode}`;

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private async handleDelete(args: { tableId: string }) {
        this.logger.info("Deleting roll table", { tableId: args.tableId });

        await this.foundryClient.query<any>(
            "warhammer-mcp.deleteRollTable",
            { tableId: args.tableId }
        );

        return {
            content: [
                {
                    type: "text",
                    text: `🗑️ **Roll Table Deleted**\n\nThe roll table has been permanently removed from the world.`,
                },
            ],
        };
    }
}
