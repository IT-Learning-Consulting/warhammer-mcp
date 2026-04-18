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

export const CreateJournalEntryInput = z.object({
  name: z.string(),
  content: z.string(),
}).strict();

export const ListJournalsInput = z.object({}).strict();

export const GetJournalContentInput = z.object({
  journalId: z.string(),
}).strict();

export const UpdateJournalContentInput = z.object({
  journalId: z.string(),
  content: z.string(),
}).strict();

export const RequestPlayerRollsInput = z.object({
  rollType: z.string(),
  rollTarget: z.string(),
  targetPlayer: z.string(),
  isPublic: z.boolean(),
  rollModifier: z.string(),
  flavor: z.string(),
}).strict();

export const CreateRollTableInput = z.object({
  tableData: z.record(z.unknown()),
}).strict();

export const AddTableResultsInput = z.object({
  tableId: z.string(),
  results: z.array(z.record(z.unknown())),
}).strict();

export const ListRollTablesInput = z.object({}).strict();

export const GetRollTableInput = z.object({
  tableId: z.string(),
}).strict();

export const RollOnTableInput = z.object({
  tableId: z.string(),
  rollMode: z.string().optional(),
}).strict();

export const DeleteRollTableInput = z.object({
  tableId: z.string(),
}).strict();
