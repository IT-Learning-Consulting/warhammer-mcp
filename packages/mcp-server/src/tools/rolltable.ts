import { z } from "zod";
import { RollTableId, TableResultId } from "@foundry-mcp/shared";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";
import { BaseTool, BaseToolOptions } from "../base-tool.js";

// Phase 2 mcp_crud_expansion — RollTable tool extended from 5 → 13 actions.
//
// **Envelope-consumer contract (CCR-Envelope-Consumer; post-BUG-069 2026-05-14):**
// Legacy 5 actions (create/list/get/roll/delete) keep `query<any>` — grandfathered.
// New 8 actions use CONCRETE response interfaces — no `<any>` on new query calls.
// Every new handler wraps its query call in try/catch; failures return errorResponse().

// ── Response interfaces for new actions (concrete typed per CCR-Envelope-Consumer rule 3) ──

interface UpdateRollTableResponse {
  tableId: RollTableId;
  changes: Record<string, unknown>;
}

interface AddTableResultsResponse {
  tableId: RollTableId;
  addedCount: number;
}

// Handler returns updatedCount only (no updatedIds in the Foundry-side handler).
interface UpdateTableResultsResponse {
  tableId: RollTableId;
  updatedCount: number;
}

// Handler returns deletedCount only (no deletedIds in the Foundry-side handler).
interface DeleteTableResultsResponse {
  tableId: RollTableId;
  deletedCount: number;
}

interface NormalizeRollTableResponse {
  tableId: RollTableId;
  resultCount: number;
}

interface ResetRollTableResultsResponse {
  tableId: RollTableId;
  resultCount: number;
}

// drawManyFromTable handler returns tableName/roll at top level; no tableId in response.
interface DrawManyFromTableResponse {
  tableName: string;
  roll: number;
  results: Array<{
    id: string;
    type: string;
    text: string;
    content: string;
    documentUuid: string;
    name: string;
    img: string;
    description: string;
    range: number[];
    weight: number;
    drawn: boolean;
  }>;
  exhausted?: boolean;
  requested?: number;
  returned?: number;
}

interface ImportRollTableFromCompendiumResponse {
  newTableId: RollTableId;
  name: string;
  normalized: boolean;
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

// Legacy create schema extended: keep entries (now optional) + add results (new, 3 types).
const TableResultInputZ = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("text"),
        text: z.string(),
        name: z.string().optional(),
        img: z.string().optional(),
        description: z.string().optional(),
        range: z.tuple([z.number(), z.number()]).optional(),
        weight: z.number().optional(),
    }),
    z.object({
        type: z.literal("document"),
        documentCollection: z.string(),
        documentId: z.string(), // not a branded id (polymorphic / non-document)
        name: z.string().optional(),
        img: z.string().optional(),
        description: z.string().optional(),
        range: z.tuple([z.number(), z.number()]).optional(),
        weight: z.number().optional(),
    }),
    z.object({
        type: z.literal("compendium"),
        documentCollection: z.string(),
        documentId: z.string(), // not a branded id (polymorphic / non-document)
        name: z.string().optional(),
        img: z.string().optional(),
        description: z.string().optional(),
        range: z.tuple([z.number(), z.number()]).optional(),
        weight: z.number().optional(),
    }),
]);

// Create roll table schema — entries kept optional (backward-compat alias), results is new.
const CreateRollTableSchema = z.object({
    action: z.literal("create"),
    name: z.string(),
    description: z.string().optional(),
    formula: z.string().default("1d20"),
    // BUG-524: create now exposes folder/img/sort (the foundry createRollTable handler already builds them
    // into the payload; they were only missing from — and stripped by — this mcp-server tool schema).
    img: z.string().optional(),
    folder: z.string().nullable().optional(),
    sort: z.number().int().optional(),
    entries: z.array(z.object({
        text: z.string(),
        weight: z.number().optional(),
        range: z.tuple([z.number(), z.number()]).optional()
    })).optional(),
    results: z.array(TableResultInputZ).optional(),
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
    tableId: RollTableId
});

// Roll on table schema
const RollOnTableSchema = z.object({
    action: z.literal("roll"),
    tableId: RollTableId,
    rollMode: z.enum(["public", "private", "blind", "self"]).default("public"),
    modifier: z.number().optional()
});

// Delete roll table schema
const DeleteRollTableSchema = z.object({
    action: z.literal("delete"),
    tableId: RollTableId,
    // BUG-322: CCR-Delete-Safety gate — must pass confirm: true to proceed
    confirm: z.boolean().optional()
});

// ── New 8 action schemas ──────────────────────────────────────────────────────

const UpdateRollTableSchema = z.object({
    action: z.literal("update"),
    tableId: RollTableId,
    changes: z.object({
        name: z.string().optional(),
        img: z.string().optional(),
        description: z.string().optional(),
        formula: z.string().optional(),
        replacement: z.boolean().optional(),
        displayRoll: z.boolean().optional(),
        folder: z.string().nullable().optional(),
        sort: z.number().int().optional(),
    }),
});

const AddTableResultsSchema = z.object({
    action: z.literal("add-results"),
    tableId: RollTableId,
    results: z.array(TableResultInputZ).min(1),
});

const UpdateTableResultsSchema = z.object({
    action: z.literal("update-results"),
    tableId: RollTableId,
    updates: z.array(z.object({
        _id: z.string(),
        name: z.string().optional(),
        text: z.string().optional(),
        img: z.string().optional(),
        description: z.string().optional(),
        range: z.tuple([z.number(), z.number()]).optional(),
        weight: z.number().optional(),
        drawn: z.boolean().optional(),
    })).min(1, 'ROLLTABLE_EMPTY_PAYLOAD: update-results requires at least one update in `updates`'), // BUG-524: name the token
});

const DeleteTableResultsSchema = z.object({
    action: z.literal("delete-results"),
    tableId: RollTableId,
    resultIds: z.array(TableResultId).min(1),
});

const NormalizeRollTableSchema = z.object({
    action: z.literal("normalize"),
    tableId: RollTableId,
});

const ResetRollTableSchema = z.object({
    action: z.literal("reset"),
    tableId: RollTableId,
});

const DrawManyFromTableSchema = z.object({
    action: z.literal("draw-many"),
    tableId: RollTableId,
    number: z.number().int().min(1).max(50),
    displayChat: z.boolean().optional(),
    recursive: z.boolean().optional(),
    rollMode: z.string().optional(),
});

const ImportRollTableFromCompendiumSchema = z.object({
    action: z.literal("import-from-compendium"),
    pack: z.string(),
    documentId: z.string(), // not a branded id (polymorphic / non-document)
    normalize: z.boolean().optional(),
});

const RollTableSchema = z.discriminatedUnion("action", [
    CreateRollTableSchema,
    ListRollTablesSchema,
    GetRollTableSchema,
    RollOnTableSchema,
    DeleteRollTableSchema,
    UpdateRollTableSchema,
    AddTableResultsSchema,
    UpdateTableResultsSchema,
    DeleteTableResultsSchema,
    NormalizeRollTableSchema,
    ResetRollTableSchema,
    DrawManyFromTableSchema,
    ImportRollTableFromCompendiumSchema,
]);

type RollTableArgs = z.infer<typeof RollTableSchema>;

export interface RollTableToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class RollTableTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'rolltable', handler: (args: any) => this.execute(args) },
      ];
    }

    getToolDefinitions() {
        return [{
            name: "rolltable",
            title: "Roll On Table",
            annotations: {
              readOnlyHint: false,
              destructiveHint: false,
              idempotentHint: false,
              openWorldHint: true,
            },
            description: `Manage roll tables in Foundry VTT — 13 actions: create, list, get, roll, delete, update, add-results, update-results, delete-results, normalize, reset, draw-many, import-from-compendium.

**Actions:**
- **create**: Create a table with entries (legacy text-only) or results (text/document/compendium). Supports folder/img/sort (BUG-524).
- **list**: List all roll tables in world.
- **get**: Get full details + result list for a table.
- **roll**: Roll once on a table and get a result. Response carries text + description + content (= text-or-description) + drawn. READ the 'content' field for the row body — many WFRP4e tables leave 'text' empty and store the row HTML in 'description', so 'content' gives the right body in one field without a follow-up get.
- **delete**: Permanently delete entire table. ⚠️ Irreversible. Requires confirm: true.
- **update**: Edit top-level table fields (name, formula, img, description, replacement, displayRoll, folder, sort).
- **add-results**: Append one or more new results (text/document/compendium types) to an existing table.
- **update-results**: Update fields on existing results by _id (text, range, weight, drawn, etc.).
- **delete-results**: Permanently remove specific results by ID. ⚠️ Irreversible.
- **normalize**: Recalculate all result range values from weights. ⚠️ This REWRITES the table formula to 1d<sum-of-weights> (e.g. 1d100→1d20) — the response now surfaces 'formulaRewritten' + 'previousFormula' so the change isn't silent (BUG-504). Overwrites manually-set ranges (Risk 2.B); collapses pre-banded published tables, so avoid on tables whose author set explicit bands.
- **reset**: Clear all drawn flags so all results are available again (for non-replacement tables).
- **draw-many**: Draw multiple results in one call (1–50). Returns partial + exhausted flag if pool runs dry. The 'roll' field is the table's DICE total (Foundry's draw.roll), while 'requested'/'returned' carry the count — the two are now distinct fields (BUG-504). 'rollMode' accepts Foundry's canonical DICE_ROLL_MODES (publicroll/gmroll/blindroll/selfroll). Each result carries text + description + content (= text-or-description); READ the 'content' field for the row body (WFRP4e tables store it in 'description').
- **import-from-compendium**: Import a roll table from a compendium pack into the world.

**Formula Examples:** "1d100", "1d20", "2d6"

**Result types (add-results / create.results):**
- text: {type:"text", text:"...", weight?, range?}
- document: {type:"document", documentCollection:"Actor", documentId:"abc"}
- compendium: {type:"compendium", documentCollection:"wfrp4e-core.Actor", documentId:"xyz"}

**Examples:**
- create: {action:"create", name:"Encounters", formula:"1d20", results:[{type:"text",text:"Goblin"}]}
- update: {action:"update", tableId:"abc", changes:{name:"New Name", formula:"1d100"}}
- add-results: {action:"add-results", tableId:"abc", results:[{type:"text",text:"Wolf",weight:2}]}
- update-results: {action:"update-results", tableId:"abc", updates:[{_id:"r1",drawn:false}]}
- delete-results: {action:"delete-results", tableId:"abc", resultIds:["r1","r2"]}
- normalize: {action:"normalize", tableId:"abc"}
- reset: {action:"reset", tableId:"abc"}
- draw-many: {action:"draw-many", tableId:"abc", number:5, rollMode:"public"}
- import-from-compendium: {action:"import-from-compendium", pack:"wfrp4e-core.tables", documentId:"xyz", normalize:true}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["create", "list", "get", "roll", "delete", "update", "add-results", "update-results", "delete-results", "normalize", "reset", "draw-many", "import-from-compendium"],
                        description: "The roll table action to perform"
                    },
                    tableId: {
                        type: "string",
                        description: "[get/roll/delete/update/add-results/update-results/delete-results/normalize/reset/draw-many] ID of the roll table"
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
                    img: {
                        type: "string",
                        description: "[create] Optional table image path (BUG-524)"
                    },
                    folder: {
                        type: ["string", "null"],
                        description: "[create] Optional folder id for placement (null = root) (BUG-524)"
                    },
                    sort: {
                        type: "integer",
                        description: "[create] Optional sort weight (BUG-524)"
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
                        description: "[create] Legacy text-only entries (use 'results' for document/compendium types)"
                    },
                    results: {
                        type: "array",
                        items: { type: "object" },
                        description: "[create/add-results] Result objects with type='text'|'document'|'compendium'"
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
                        description: "[roll/draw-many] How to display the roll result (maps to Foundry's canonical DICE_ROLL_MODES: public=publicroll, private=gmroll, blind=blindroll, self=selfroll)"
                    },
                    modifier: {
                        type: "number",
                        description: "[roll] Optional numeric modifier added to the roll result"
                    },
                    changes: {
                        type: "object",
                        description: "[update] Fields to change: name, img, description, formula, replacement, displayRoll, folder, sort"
                    },
                    updates: {
                        type: "array",
                        items: { type: "object" },
                        description: "[update-results] Array of {_id, ...fields} result update objects"
                    },
                    resultIds: {
                        type: "array",
                        items: { type: "string" },
                        description: "[delete-results] IDs of results to permanently remove"
                    },
                    number: {
                        type: "integer",
                        description: "[draw-many] Number of results to draw (1–50)"
                    },
                    displayChat: {
                        type: "boolean",
                        description: "[draw-many] Display the roll results in chat (default: true)"
                    },
                    recursive: {
                        type: "boolean",
                        description: "[draw-many] Roll nested tables recursively (default: false)"
                    },
                    pack: {
                        type: "string",
                        description: "[import-from-compendium] Compendium pack ID (e.g. 'wfrp4e-core.tables')"
                    },
                    documentId: {
                        type: "string",
                        description: "[import-from-compendium] Document ID within the pack"
                    },
                    documentCollection: {
                        type: "string",
                        description: "[result input] Collection for document/compendium result types"
                    },
                    normalize: {
                        type: "boolean",
                        description: "[import-from-compendium] Normalize ranges after import (overwrites manual ranges)"
                    },
                    // BUG-322: CCR-Delete-Safety gate
                    confirm: {
                        type: "boolean",
                        description: "[delete] Required confirmation flag. Must be true to proceed (CCR-Delete-Safety)."
                    },
                    // Phase 10 cross-doc-fk cascade flag (delete action only; current catalog has no inbound FKs to RollTable so this is API-uniform no-op).
                    cascade: {
                        type: "boolean",
                        description: "[delete] When true, clears cross-doc FK references pointing AT this rolltable before deletion. Default false. Note: current FK catalog has no inbound refs to RollTable; this returns affectedDocs: [] (uniform API per Phase 10 PC1)."
                    }
                },
                required: ["action"]
            }
        }];
    }

    async execute(args: RollTableArgs) {
        this.logger.info("Executing rolltable", { action: args.action });

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
            case "update":
                return this.handleUpdate(args);
            case "add-results":
                return this.handleAddResults(args);
            case "update-results":
                return this.handleUpdateResults(args);
            case "delete-results":
                return this.handleDeleteResults(args);
            case "normalize":
                return this.handleNormalize(args);
            case "reset":
                return this.handleReset(args);
            case "draw-many":
                return this.handleDrawMany(args);
            case "import-from-compendium":
                return this.handleImportFromCompendium(args);
          default:
            // BUG-439: an unknown action must throw (clean isError envelope via the
            // dispatch catch) instead of falling through to an undefined result.
            throw new Error(`Unknown action "${String((args as any).action)}" — valid actions: create, list, get, roll, delete, update, add-results, update-results, delete-results, normalize, reset, draw-many, import-from-compendium`);
        }
    }

    // ── Legacy action handlers (query<any> grandfathered per CCR-Envelope-Consumer rule 3) ──

    private async handleCreate(args: {
        name: string;
        description?: string | undefined;
        formula: string;
        img?: string | undefined;
        folder?: string | null | undefined;
        sort?: number | undefined;
        entries?: Array<{
            text: string;
            weight?: number | undefined;
            range?: [number, number] | undefined;
        }> | undefined;
        results?: Array<z.infer<typeof TableResultInputZ>> | undefined;
        replacement: boolean;
        displayRoll: boolean;
    }) {
        this.logger.info("Creating roll table", { name: args.name });

        // Backward-compat: if entries provided but not results, normalize entries → text results.
        let resolvedResults: Array<z.infer<typeof TableResultInputZ>> | undefined = args.results;
        if (!resolvedResults && args.entries && args.entries.length > 0) {
            resolvedResults = args.entries.map(e => ({
                type: "text" as const,
                text: e.text,
                weight: e.weight,
                range: e.range,
            }));
        }

        const response = await this.query<any>(
            "createRollTable",
            {
                name: args.name,
                description: args.description,
                formula: args.formula,
                replacement: args.replacement,
                displayRoll: args.displayRoll,
                ...(args.img !== undefined ? { img: args.img } : {}),
                ...(args.folder !== undefined ? { folder: args.folder } : {}),
                ...(args.sort !== undefined ? { sort: args.sort } : {}),
                ...(resolvedResults !== undefined ? { results: resolvedResults } : {}),
            }
        );

        const table = response;
        const entryCount = resolvedResults?.length ?? 0;
        return {
            content: [
                {
                    type: "text",
                    text: `🎲 **Roll Table Created**\n\n**Name:** ${args.name}\n**Formula:** ${args.formula}\n**Entries:** ${entryCount}\n**ID:** ${table.id || "N/A"}\n\n✅ Roll table is ready to use. Use the 'roll' action to roll on this table.`,
                },
            ],
            structuredContent: table as unknown as Record<string, unknown>,
        };
    }

    private async handleList() {
        this.logger.info("Listing roll tables");

        const response = await this.query<any>(
            "listRollTables",
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
                structuredContent: { tables } as unknown as Record<string, unknown>,
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
            structuredContent: { tables } as unknown as Record<string, unknown>,
        };
    }

    private async handleGet(args: { tableId: RollTableId }) {
        this.logger.info("Getting roll table", { tableId: args.tableId });

        const response = await this.query<any>(
            "getRollTable",
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
                // F09: expose result id + type so callers can construct update-results/delete-results
                // payloads from a single get without needing F12 paste. Compendium/document-typed
                // results show the documentUuid in place of (empty) text.
                const label = entry.text || entry.documentUuid || "(unknown)";
                const idTag = entry.id ? ` [_id: ${entry.id}]` : "";
                const typeTag = entry.type && entry.type !== "text" ? ` (${entry.type})` : "";
                if (entry.range && entry.range.length === 2) {
                    resultText += `${entry.range[0]}-${entry.range[1]}: ${label}${typeTag}${idTag}\n`;
                } else {
                    resultText += `- ${label}${typeTag}${entry.weight ? ` (weight: ${entry.weight})` : ""}${idTag}\n`;
                }
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
            structuredContent: table as unknown as Record<string, unknown>,
        };
    }

    private async handleRoll(args: {
        tableId: RollTableId;
        rollMode: string;
        modifier?: number | undefined;
    }) {
        this.logger.info("Rolling on table", { tableId: args.tableId });

        const response = await this.query<any>(
            "rollOnTable",
            {
                tableId: args.tableId,
                rollMode: args.rollMode,
                ...(args.modifier !== undefined ? { modifier: args.modifier } : {}),
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
        resultText += `**Result:** ${result.content || result.text || result.result || "Unknown"}\n\n`;
        resultText += `Roll mode: ${args.rollMode}`;

        return {
            content: [{ type: "text", text: resultText }],
            structuredContent: result as unknown as Record<string, unknown>,
        };
    }

    private async handleDelete(args: { tableId: RollTableId; confirm?: boolean | undefined }) {
        // BUG-322: CCR-Delete-Safety gate — mirrors macro.ts handleDelete pattern
        if (!args.confirm) {
            return this.errorResponse('rolltable.delete', 'ROLLTABLE_DELETE_NOT_CONFIRMED: delete requires confirm: true');
        }
        this.logger.info("Deleting roll table", { tableId: args.tableId });

        await this.query<any>(
            "deleteRollTable",
            { tableId: args.tableId }
        );

        return {
            content: [
                {
                    type: "text",
                    text: `🗑️ **Roll Table Deleted**\n\nThe roll table has been permanently removed from the world.`,
                },
            ],
            structuredContent: { deleted: true, tableId: args.tableId } as unknown as Record<string, unknown>,
        };
    }

    // ── New action handlers (concrete typed per CCR-Envelope-Consumer rule 3) ──

    private async handleUpdate(args: z.infer<typeof UpdateRollTableSchema>) {
        this.logger.info("Updating roll table", { tableId: args.tableId });
        try {
            const response = await this.query<UpdateRollTableResponse>("updateRollTable", {
                tableId: args.tableId,
                changes: args.changes,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `✏️ **Roll Table Updated**\n\n**Table ID:** ${response.tableId}\n**Changed Fields:** ${Object.keys(response.changes).join(", ")}`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("update", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleAddResults(args: z.infer<typeof AddTableResultsSchema>) {
        this.logger.info("Adding results to roll table", { tableId: args.tableId });
        try {
            const response = await this.query<AddTableResultsResponse>("addTableResults", {
                tableId: args.tableId,
                results: args.results,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `➕ **Results Added**\n\n**Table ID:** ${response.tableId}\n**Added:** ${response.addedCount} result${response.addedCount !== 1 ? "s" : ""}`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("add-results", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleUpdateResults(args: z.infer<typeof UpdateTableResultsSchema>) {
        this.logger.info("Updating table results", { tableId: args.tableId });
        try {
            const response = await this.query<UpdateTableResultsResponse>("updateTableResults", {
                tableId: args.tableId,
                updates: args.updates,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `✏️ **Table Results Updated**\n\n**Table ID:** ${response.tableId}\n**Updated:** ${response.updatedCount} result${response.updatedCount !== 1 ? "s" : ""}`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("update-results", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleDeleteResults(args: z.infer<typeof DeleteTableResultsSchema>) {
        this.logger.info("Deleting table results", { tableId: args.tableId });
        try {
            const response = await this.query<DeleteTableResultsResponse>("deleteTableResults", {
                tableId: args.tableId,
                resultIds: args.resultIds,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `🗑️ **Table Results Deleted**\n\n**Table ID:** ${response.tableId}\n**Deleted:** ${response.deletedCount} result${response.deletedCount !== 1 ? "s" : ""}\n\n⚠️ This operation is permanent and cannot be undone.`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("delete-results", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleNormalize(args: z.infer<typeof NormalizeRollTableSchema>) {
        this.logger.info("Normalizing roll table", { tableId: args.tableId });
        try {
            const response = await this.query<NormalizeRollTableResponse>("normalizeRollTable", {
                tableId: args.tableId,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `📐 **Roll Table Normalized**\n\n**Table ID:** ${response.tableId}\n**Results:** ${response.resultCount}\n\n⚠️ All result ranges have been recalculated from weights — any manually-set ranges have been overwritten.`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("normalize", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleReset(args: z.infer<typeof ResetRollTableSchema>) {
        this.logger.info("Resetting roll table drawn flags", { tableId: args.tableId });
        try {
            const response = await this.query<ResetRollTableResultsResponse>("resetRollTableResults", {
                tableId: args.tableId,
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `🔄 **Roll Table Reset**\n\n**Table ID:** ${response.tableId}\n**Results:** ${response.resultCount}\n\nAll drawn flags cleared — all results are available to draw again.`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("reset", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleDrawMany(args: z.infer<typeof DrawManyFromTableSchema>) {
        this.logger.info("Drawing many from roll table", { tableId: args.tableId, number: args.number });
        try {
            const response = await this.query<DrawManyFromTableResponse>("drawManyFromTable", {
                tableId: args.tableId,
                number: args.number,
                ...(args.displayChat !== undefined ? { displayChat: args.displayChat } : {}),
                ...(args.recursive !== undefined ? { recursive: args.recursive } : {}),
                ...(args.rollMode !== undefined ? { rollMode: args.rollMode } : {}),
            });

            let text = `🎲 **Draw Many Results** — ${response.tableName}\n\n`;
            text += `**Requested:** ${args.number}  **Returned:** ${response.returned ?? response.results.length}\n\n`;

            for (let i = 0; i < response.results.length; i++) {
                const r = response.results[i]!;
                const label = r.text || r.documentUuid || "(unknown)";
                const idTag = r.id ? ` [_id: ${r.id}]` : "";
                text += `${i + 1}. ${label}${idTag}`;
                if (r.drawn) text += " *(drawn)*";
                text += "\n";
            }

            if (response.exhausted) {
                text += `\n⚠️ **Pool exhausted** — only ${response.returned} of ${response.requested} requested results were available. Call 'reset' to clear drawn flags.`;
            }

            return {
                content: [{ type: "text" as const, text }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("draw-many", e instanceof Error ? e.message : String(e));
        }
    }

    private async handleImportFromCompendium(args: z.infer<typeof ImportRollTableFromCompendiumSchema>) {
        this.logger.info("Importing roll table from compendium", { pack: args.pack, documentId: args.documentId });
        try {
            const response = await this.query<ImportRollTableFromCompendiumResponse>("importRollTableFromCompendium", {
                pack: args.pack,
                documentId: args.documentId,
                ...(args.normalize !== undefined ? { normalize: args.normalize } : {}),
            });
            return {
                content: [{
                    type: "text" as const,
                    text: `📦 **Table Imported**\n\n**New Table ID:** ${response.newTableId}\n**Name:** ${response.name}\n**Normalized:** ${response.normalized ? "yes" : "no"}`,
                }],
                structuredContent: response as unknown as Record<string, unknown>,
            };
        } catch (e) {
            return this.errorResponse("import-from-compendium", e instanceof Error ? e.message : String(e));
        }
    }

}
