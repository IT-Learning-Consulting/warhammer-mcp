import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";

export class RollTableTools {
    constructor(
        private foundryClient: FoundryClient,
        private logger: Logger
    ) { }

    getToolDefinitions() {
        return [
            {
                name: "create-rolltable",
                description: `Create a RollTable in Foundry VTT with custom entries.

RollTables are used for random generation of encounters, loot, events, weather, rumors, etc.

**Common Use Cases:**
- Random Encounter Tables (d100 wilderness encounters)
- Loot Tables (treasure generation)
- Critical Hit/Fumble Tables
- Random Event Tables
- NPC Name/Personality Tables
- Weather Tables
- Rumor/Hook Tables

**Entry Types:**
- **Text**: Simple text results
- **Document**: Link to Actor, Item, JournalEntry, etc.
- **Compendium**: Reference to compendium content

**Formula Examples:**
- "1d100" - Roll 1d100, each entry has a range (1-5, 6-10, etc.)
- "1d20" - Standard d20 roll
- "1d6" - Simple d6 table
- "2d6" - 2d6 bell curve (2-12)

Returns the created RollTable with ID and all entries configured.`,
                inputSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "Name of the RollTable (e.g., 'Random Wilderness Encounters', 'Treasure Hoard', 'Critical Hits')",
                        },
                        description: {
                            type: "string",
                            description: "Optional description of what the table is for",
                        },
                        formula: {
                            type: "string",
                            description: "Dice formula for the table (e.g., '1d100', '1d20', '2d6')",
                            default: "1d20",
                        },
                        entries: {
                            type: "array",
                            description: "Array of table entries. Each entry should have 'text' and optionally 'weight' or 'range'",
                            items: {
                                type: "object",
                                properties: {
                                    text: {
                                        type: "string",
                                        description: "The result text for this entry",
                                    },
                                    weight: {
                                        type: "number",
                                        description: "Weight/probability (higher = more likely). Use this OR range, not both.",
                                    },
                                    range: {
                                        type: "array",
                                        description: "Explicit range [min, max] (e.g., [1, 5] for rolls 1-5). Use this OR weight, not both.",
                                        items: { type: "number" },
                                        minItems: 2,
                                        maxItems: 2,
                                    },
                                },
                                required: ["text"],
                            },
                        },
                        replacement: {
                            type: "boolean",
                            description: "Whether to allow the same result to be rolled multiple times (true = with replacement, false = without)",
                            default: true,
                        },
                        displayRoll: {
                            type: "boolean",
                            description: "Whether to display the roll result publicly in chat",
                            default: true,
                        },
                    },
                    required: ["name", "entries"],
                },
            },
            {
                name: "list-rolltables",
                description: `List all RollTables in the current Foundry world.

Returns a list of all available RollTables with their names, IDs, formulas, and entry counts. Useful for finding tables to roll on or modify.`,
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "get-rolltable",
                description: `Get detailed information about a specific RollTable.

Returns the table's formula, description, entries, and configuration. Use this to see what's in a table before rolling or modifying it.`,
                inputSchema: {
                    type: "object",
                    properties: {
                        tableId: {
                            type: "string",
                            description: "The ID of the RollTable to retrieve",
                        },
                    },
                    required: ["tableId"],
                },
            },
            {
                name: "roll-on-table",
                description: `Roll on a RollTable and get the result.

This will execute the table's dice formula and return the randomly selected result. Results can be automatically posted to chat if configured.`,
                inputSchema: {
                    type: "object",
                    properties: {
                        tableId: {
                            type: "string",
                            description: "The ID of the RollTable to roll on",
                        },
                        rollMode: {
                            type: "string",
                            enum: ["public", "private", "blind", "self"],
                            description: "How to display the roll result (public = everyone sees, private = GM + player, blind = GM only, self = roller only)",
                            default: "public",
                        },
                    },
                    required: ["tableId"],
                },
            },
            {
                name: "delete-rolltable",
                description: `Delete a RollTable from the world.

WARNING: This permanently removes the table. Make sure you have the correct table ID.`,
                inputSchema: {
                    type: "object",
                    properties: {
                        tableId: {
                            type: "string",
                            description: "The ID of the RollTable to delete",
                        },
                    },
                    required: ["tableId"],
                },
            },
        ];
    }

    async handleCreateRollTable(args: {
        name: string;
        description?: string;
        formula?: string;
        entries: Array<{ text: string; weight?: number; range?: [number, number] }>;
        replacement?: boolean;
        displayRoll?: boolean;
    }) {
        this.logger.info("Creating RollTable", {
            name: args.name,
            entryCount: args.entries.length,
            formula: args.formula || "1d20"
        });

        try {
            // Build the table entries first
            const tableEntries = [];
            let currentRangeStart = 1;

            for (let i = 0; i < args.entries.length; i++) {
                const entry = args.entries[i];
                const entryData: any = {
                    type: 0, // CONST.TABLE_RESULT_TYPES.TEXT
                    text: entry.text,
                    weight: entry.weight || 1,
                };

                // If explicit range is provided, use it
                if (entry.range && entry.range.length === 2) {
                    entryData.range = entry.range;
                } else if (!entry.weight) {
                    // Auto-calculate ranges for equal probability
                    const rangeSize = 1; // Each entry gets 1 value by default
                    entryData.range = [currentRangeStart, currentRangeStart + rangeSize - 1];
                    currentRangeStart += rangeSize;
                }

                tableEntries.push(entryData);
            }

            // Build the RollTable data with results included
            const tableData: any = {
                name: args.name,
                formula: args.formula || "1d20",
                replacement: args.replacement !== false,
                displayRoll: args.displayRoll !== false,
                results: tableEntries
            };

            if (args.description) {
                tableData.description = args.description;
            }

            // Create the table with all results in one call
            const result = await this.foundryClient.query('foundry-mcp-bridge.createRollTable', {
                tableData: tableData
            });

            const tableId = result.id;

            this.logger.info("RollTable created successfully", {
                tableId: tableId,
                name: args.name,
                entriesAdded: tableEntries.length
            });

            // Build response
            let report = `✅ **RollTable Created: ${args.name}**\n\n`;
            report += `🎲 **Table ID**: ${tableId}\n`;
            report += `📊 **Formula**: ${args.formula || "1d20"}\n`;
            report += `📝 **Entries**: ${args.entries.length}\n`;
            if (args.description) {
                report += `\n**Description**: ${args.description}\n`;
            }
            report += `\n## 📋 Table Entries\n`;

            for (let i = 0; i < args.entries.length; i++) {
                const entry = args.entries[i];
                if (entry.range) {
                    report += `- **[${entry.range[0]}-${entry.range[1]}]** ${entry.text}\n`;
                } else {
                    report += `- ${i + 1}. ${entry.text}${entry.weight ? ` (weight: ${entry.weight})` : ''}\n`;
                }
            }

            report += `\n---\n`;
            report += `✅ RollTable successfully created in Foundry VTT!\n`;
            report += `Use \`roll-on-table\` with ID \`${tableId}\` to roll on this table.`;

            return {
                content: [{ type: "text", text: report }],
            };

        } catch (error) {
            this.logger.error("Failed to create RollTable", error);
            return {
                content: [{ type: "text", text: `❌ Failed to create RollTable: ${error}` }],
            };
        }
    }

    async handleListRollTables(args: {}) {
        this.logger.info("Listing RollTables");

        try {
            const tables = await this.foundryClient.query('foundry-mcp-bridge.listRollTables', {});

            if (!tables || tables.length === 0) {
                return {
                    content: [{ type: "text", text: "📋 No RollTables found in this world." }],
                };
            }

            let report = `📋 **RollTables in World** (${tables.length} total)\n\n`;

            for (const table of tables) {
                report += `## ${table.name}\n`;
                report += `- **ID**: \`${table.id}\`\n`;
                report += `- **Formula**: ${table.formula}\n`;
                report += `- **Entries**: ${table.results?.length || 0}\n`;
                if (table.description) {
                    report += `- **Description**: ${table.description}\n`;
                }
                report += `\n`;
            }

            report += `---\n`;
            report += `Use \`get-rolltable\` with a table ID to see detailed entries.\n`;
            report += `Use \`roll-on-table\` with a table ID to roll on a table.`;

            return {
                content: [{ type: "text", text: report }],
            };

        } catch (error) {
            this.logger.error("Failed to list RollTables", error);
            return {
                content: [{ type: "text", text: `❌ Failed to list RollTables: ${error}` }],
            };
        }
    }

    async handleGetRollTable(args: { tableId: string }) {
        this.logger.info("Getting RollTable", { tableId: args.tableId });

        try {
            const table = await this.foundryClient.query('foundry-mcp-bridge.getRollTable', {
                tableId: args.tableId
            });

            let report = `📋 **RollTable: ${table.name}**\n\n`;
            report += `🎲 **Formula**: ${table.formula}\n`;
            report += `🔄 **Replacement**: ${table.replacement ? 'Yes' : 'No'}\n`;
            report += `👁️ **Display Roll**: ${table.displayRoll ? 'Yes' : 'No'}\n`;

            if (table.description) {
                report += `\n**Description**: ${table.description}\n`;
            }

            report += `\n## 📝 Table Entries (${table.results?.length || 0})\n`;

            if (table.results && table.results.length > 0) {
                for (const result of table.results) {
                    const range = result.range && result.range.length === 2
                        ? `[${result.range[0]}-${result.range[1]}]`
                        : '';
                    report += `- ${range} ${result.text}\n`;
                }
            } else {
                report += `*No entries*\n`;
            }

            report += `\n---\n`;
            report += `Use \`roll-on-table\` with ID \`${args.tableId}\` to roll on this table.`;

            return {
                content: [{ type: "text", text: report }],
            };

        } catch (error) {
            this.logger.error("Failed to get RollTable", error);
            return {
                content: [{ type: "text", text: `❌ Failed to get RollTable: ${error}` }],
            };
        }
    }

    async handleRollOnTable(args: { tableId: string; rollMode?: string }) {
        this.logger.info("Rolling on RollTable", {
            tableId: args.tableId,
            rollMode: args.rollMode || "public"
        });

        try {
            const result = await this.foundryClient.query('foundry-mcp-bridge.rollOnTable', {
                tableId: args.tableId,
                rollMode: args.rollMode || "public"
            });

            let report = `🎲 **Roll Result**\n\n`;
            report += `**Table**: ${result.tableName}\n`;
            report += `**Roll**: ${result.roll} (${result.formula})\n`;
            report += `\n## 🎯 Result\n`;
            report += `${result.text}\n`;

            if (result.drawn) {
                report += `\n*This result has been drawn and won't appear again (no replacement)*\n`;
            }

            return {
                content: [{ type: "text", text: report }],
            };

        } catch (error) {
            this.logger.error("Failed to roll on RollTable", error);
            return {
                content: [{ type: "text", text: `❌ Failed to roll on table: ${error}` }],
            };
        }
    }

    async handleDeleteRollTable(args: { tableId: string }) {
        this.logger.info("Deleting RollTable", { tableId: args.tableId });

        try {
            await this.foundryClient.query('foundry-mcp-bridge.deleteRollTable', {
                tableId: args.tableId
            });

            return {
                content: [{ type: "text", text: `✅ RollTable deleted successfully.` }],
            };

        } catch (error) {
            this.logger.error("Failed to delete RollTable", error);
            return {
                content: [{ type: "text", text: `❌ Failed to delete RollTable: ${error}` }],
            };
        }
    }
}
