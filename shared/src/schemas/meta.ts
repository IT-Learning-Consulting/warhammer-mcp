// Non-domain / infrastructure schemas:
// - MCP protocol (query, response)
// - config (foundry + server)
// - world info, bridge status
// - Handler inputs not owned by actor/item/compendium/scene domains:
//   journal, rolltable, player rolls, ping, world info.
// Infrastructure schemas (protocol/config/world) do not use .strict() —
// they are not handler inputs. Handler-input schemas in this file DO use .strict().

import { z } from 'zod';

// ── Protocol ───────────────────────────────────────────────────────────────

export const MCPQuerySchema = z.object({
  method: z.string(),
  data: z.unknown().optional(),
});

export const MCPResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
}).strict();

/**
 * Uniform handler response envelope (PRD CCR-1 / BUG-015).
 * Every Foundry-side handler returns this shape; FoundryClient.query
 * asserts it and unwraps .data at the single client-side site (PRD R3).
 */
export type HandlerEnvelope<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ── Config ─────────────────────────────────────────────────────────────────

export const FoundryMCPConfigSchema = z.object({
  enabled: z.boolean(),
  mcpHost: z.string(),
  mcpPort: z.number().min(1024).max(65535),
  connectionTimeout: z.number().min(5).max(60),
  debugLogging: z.boolean(),
});

export const MCPServerConfigSchema = z.object({
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  foundry: z.object({
    host: z.string(),
    port: z.number().min(1024).max(65535),
    namespace: z.string(),
    reconnectAttempts: z.number().min(1).max(10),
    reconnectDelay: z.number().min(100).max(10000),
  }),
});

// ── World ──────────────────────────────────────────────────────────────────

export const WorldUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  isGM: z.boolean(),
});

export const WorldInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  system: z.string(),
  systemVersion: z.string(),
  foundryVersion: z.string(),
  users: z.array(WorldUserSchema),
});

export const BridgeStatusSchema = z.object({
  isRunning: z.boolean(),
  config: FoundryMCPConfigSchema,
  timestamp: z.number(),
});

// ── Handler inputs (.strict()) ─────────────────────────────────────────────

export const PingInput = z.object({}).strict();

export const GetWorldInfoInput = z.object({}).strict();

// Phase 4c.0 — whitelisted CONFIG.WFRP4E.* read-through for skills.
// Skills (e.g. /wfrp-advance) need authoritative WFRP rule tables (xpCost,
// talentMax, statusTiers, earningValues) at runtime so they can compute costs
// without hardcoding. Keys are validated against an allowlist server-side
// (data-access.ts:getWfrp4eConfig).
export const GetWfrp4eConfigInput = z.object({
  keys: z.array(z.string()).min(1),
}).strict();

// Journal Input schemas retired in Phase 3 mcp_crud_expansion. The 5 legacy
// schemas (CreateJournalEntryInput, ListJournalsInput, GetJournalContentInput,
// UpdateJournalContentInput, DeleteJournalEntryInput) are superseded by the
// `journal` umbrella schemas in `./journal.ts`. See JournalToolInput.

export const RequestPlayerRollsInput = z.object({
  rollType: z.string(),
  rollTarget: z.string(),
  targetPlayer: z.string(),
  isPublic: z.boolean(),
  rollModifier: z.string(),
  flavor: z.string(),
  /** When true, the mcp-server awaits the player's roll result before returning. */
  awaitResult: z.boolean().optional().default(false),
}).strict();

// ── RollTable schemas (Phase 2 mcp_crud_expansion) ─────────────────────────
//
// v13 BaseTableResult uses a single `documentUuid: DocumentUUIDField` for
// document/compendium results (BaseTableResult.md L1163). MCP tool input
// accepts `{documentCollection, documentId}` as a builder convenience; the
// Foundry-side handler assembles the UUID + validates via fromUuid().
// See ADR-027 (mcp_crud_expansion_v1_journal.md).

const ResultCommonShape = {
  name: z.string().optional(),
  img: z.string().optional(),
  description: z.string().optional(),
  range: z.tuple([z.number().int(), z.number().int()]).optional(),
  weight: z.number().nonnegative().optional(),
};

export const TextResultSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  ...ResultCommonShape,
}).strict();

export const DocumentResultSchema = z.object({
  type: z.literal('document'),
  documentCollection: z.string().min(1),
  documentId: z.string().min(1),
  ...ResultCommonShape,
}).strict();

export const CompendiumResultSchema = z.object({
  type: z.literal('compendium'),
  documentCollection: z.string().min(1),
  documentId: z.string().min(1),
  ...ResultCommonShape,
}).strict();

export const TableResultInputSchema = z.discriminatedUnion('type', [
  TextResultSchema,
  DocumentResultSchema,
  CompendiumResultSchema,
]);

const RollTableWritableFields = {
  name: z.string().min(1).optional(),
  img: z.string().optional(),
  description: z.string().optional(),
  formula: z.string().min(1).optional(),
  replacement: z.boolean().optional(),
  displayRoll: z.boolean().optional(),
  folder: z.string().nullable().optional(),
  sort: z.number().int().optional(),
};

export const CreateRollTableInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  formula: z.string().min(1).optional(),
  img: z.string().optional(),
  replacement: z.boolean().optional(),
  displayRoll: z.boolean().optional(),
  folder: z.string().nullable().optional(),
  sort: z.number().int().optional(),
  results: z.array(TableResultInputSchema).optional(),
}).strict();

export const AddTableResultsInput = z.object({
  tableId: z.string().min(1),
  results: z.array(TableResultInputSchema).min(1),
}).strict();

export const ListRollTablesInput = z.object({}).strict();

export const GetRollTableInput = z.object({
  tableId: z.string().min(1),
}).strict();

export const RollOnTableInput = z.object({
  tableId: z.string().min(1),
  rollMode: z.string().optional(),
}).strict();

export const DeleteRollTableInput = z.object({
  tableId: z.string().min(1),
  // Phase 10 cross-doc-fk: when true, walks the catalog for inbound FK refs
  // to this RollTable and clears them before delete. Default false (R10.6).
  // NOTE: catalog has no inbound FKs to RollTable currently — `cascade:true`
  // returns affectedDocs: [] (API-uniform no-op per Task 4.3 design).
  cascade: z.boolean().default(false).optional(),
}).strict();

export const UpdateRollTableInput = z.object({
  tableId: z.string().min(1),
  changes: z.object(RollTableWritableFields).strict().refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'ROLLTABLE_EMPTY_PAYLOAD: changes object must contain at least one field' },
  ),
}).strict();

export const UpdateTableResultsInput = z.object({
  tableId: z.string().min(1),
  updates: z.array(
    z.object({
      _id: z.string().min(1),
      name: z.string().optional(),
      img: z.string().optional(),
      description: z.string().optional(),
      text: z.string().optional(),
      range: z.tuple([z.number().int(), z.number().int()]).optional(),
      weight: z.number().nonnegative().optional(),
      drawn: z.boolean().optional(),
    }).strict(),
  ).min(1),
}).strict();

export const DeleteTableResultsInput = z.object({
  tableId: z.string().min(1),
  resultIds: z.array(z.string().min(1)).min(1),
}).strict();

export const NormalizeRollTableInput = z.object({
  tableId: z.string().min(1),
}).strict();

export const ResetRollTableInput = z.object({
  tableId: z.string().min(1),
}).strict();

export const DrawManyFromTableInput = z.object({
  tableId: z.string().min(1),
  number: z.number().int().min(1).max(50),
  displayChat: z.boolean().optional(),
  recursive: z.boolean().optional(),
  rollMode: z.string().optional(),
}).strict();

export const ImportRollTableFromCompendiumInput = z.object({
  pack: z.string().min(1),
  documentId: z.string().min(1),
  normalize: z.boolean().default(true),
}).strict();

export type TableResultInputType = z.infer<typeof TableResultInputSchema>;
export type CreateRollTableInputType = z.infer<typeof CreateRollTableInput>;
export type AddTableResultsInputType = z.infer<typeof AddTableResultsInput>;
export type UpdateRollTableInputType = z.infer<typeof UpdateRollTableInput>;
export type UpdateTableResultsInputType = z.infer<typeof UpdateTableResultsInput>;
export type DeleteTableResultsInputType = z.infer<typeof DeleteTableResultsInput>;
export type NormalizeRollTableInputType = z.infer<typeof NormalizeRollTableInput>;
export type ResetRollTableInputType = z.infer<typeof ResetRollTableInput>;
export type DrawManyFromTableInputType = z.infer<typeof DrawManyFromTableInput>;
export type ImportRollTableFromCompendiumInputType = z.infer<typeof ImportRollTableFromCompendiumInput>;

export const DeleteActorInput = z.object({
  id: z.string().min(1),
}).strict();

// DeleteJournalEntryInput retired in Phase 3 mcp_crud_expansion — folded into
// the `journal` umbrella as action: "delete-entry". See ./journal.ts.
