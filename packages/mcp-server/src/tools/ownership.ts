import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";
import { BaseTool, BaseToolOptions } from "../base-tool.js";

// Phase 1 mcp_crud_expansion — polymorphic ownership tool.
// 5 actions × 7 doc types (Folder is read-allowed, write-rejected per ADR-024).
// Legacy `actorName` arg preserved as a soft alias mapped to {documentType: 'actor', name}.
//
// **Envelope-consumer contract (CCR-Envelope-Consumer; post-BUG-069 2026-05-14):**
// Every query call below uses a CONCRETE response interface for the generic, never the
// loose alias. The return is the UNWRAPPED data payload (see BaseTool.query JSDoc).
// Failures THROW — handlers wrap in try/catch and convert to errorResponse envelopes.
// Phase 2-9 tools must follow the same pattern. The CI guard at
// `D:/foundry-vtt-mcp/scripts/check-envelope-consumer.sh` hard-fails on any
// consumer-side success / data / error access on a query return and warns on
// loose-type query calls. See `validation_rubric.md` §DP-15 for the L3 review rule.

// Response shapes for the 4 Foundry-side handlers — typed so TS catches consumer drift.
interface SetDocumentOwnershipResponse {
  documentType: string;
  resolvedId: string;
  ownership: Record<string, number>;
}

interface GetDocumentOwnershipResponse {
  documentType: string;
  resolvedId: string;
  ownership: Record<string, number> | null;
  reason?: string;
}

interface BulkSetDocumentOwnershipResponse {
  overall_success: boolean;
  per_class: Array<{
    documentType: string;
    succeeded: number;
    failed: Array<{ target: unknown; error: string }>;
  }>;
}

const DocumentTypeEnum = z.enum([
  "actor", "item", "journal", "scene", "rolltable", "folder", "macro",
]);

const LevelInput = z.union([
  z.string(), // "none" | "limited" | "observer" | "owner" | "inherit"
  z.number(), // -1 | 0 | 1 | 2 | 3
]);

const TargetIdShape = {
  documentType: DocumentTypeEnum.optional(),
  uuid: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  // Legacy alias — when present, the tool maps to {documentType: 'actor', name: <value>}.
  actorName: z.string().optional(),
};

const AssignOwnershipSchema = z.object({
  action: z.literal("assign"),
  ...TargetIdShape,
  userId: z.string().optional(),
  default: z.boolean().optional(),
  level: LevelInput,
});

const RemoveOwnershipSchema = z.object({
  action: z.literal("remove"),
  ...TargetIdShape,
  userId: z.string(),
});

const ListOwnershipSchema = z.object({
  action: z.literal("list"),
  ...TargetIdShape,
});

const BulkSetOwnershipSchema = z.object({
  action: z.literal("bulk-set"),
  targets: z.array(z.object({
    documentType: DocumentTypeEnum,
    uuid: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
  })).min(1),
  userId: z.string().optional(),
  default: z.boolean().optional(),
  level: LevelInput,
});

const ResetOwnershipSchema = z.object({
  action: z.literal("reset"),
  ...TargetIdShape,
});

const OwnershipSchema = z.discriminatedUnion("action", [
  AssignOwnershipSchema,
  RemoveOwnershipSchema,
  ListOwnershipSchema,
  BulkSetOwnershipSchema,
  ResetOwnershipSchema,
]);

type OwnershipArgs = z.infer<typeof OwnershipSchema>;

// String → number mapping. `inherit` (-1) added per ADR-026 (per-user only).
const OwnershipLevels: Record<string, number> = {
  none: 0,
  limited: 1,
  observer: 2,
  owner: 3,
  inherit: -1,
};

function coerceLevel(input: string | number): number {
  if (typeof input === "number") return input;
  // F10 fix (2026-05-14): pass numeric strings (including META values -10/-20) through to
  // the Foundry-side Zod schema, which owns the META/INHERIT/standard-level validation per
  // ADR-026. Single source of truth for level validation lives on the producer side; the
  // mcp-server tool just coerces shape, not semantics. Pre-fix, coerceLevel rejected -10/-20
  // here with "Invalid level" before the documented OWNERSHIP_META_LEVEL_FORBIDDEN could fire
  // at the schema layer (F10 in validation report).
  const asNum = Number(input);
  if (Number.isFinite(asNum) && Math.floor(asNum) === asNum) {
    return asNum;
  }
  const lc = input.toLowerCase();
  if (lc in OwnershipLevels) return OwnershipLevels[lc]!;
  throw new Error(`Invalid level "${input}" — expected one of ${Object.keys(OwnershipLevels).join(", ")} or a finite integer (Foundry-side Zod enforces -1|0|1|2|3 for standard levels; META values -10/-20 reject with OWNERSHIP_META_LEVEL_FORBIDDEN per ADR-026)`);
}

export interface OwnershipToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class OwnershipTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  getToolDefinitions() {
    return [{
      name: "ownership",
      title: "Manage Ownership",
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      description: `Polymorphic ownership manager — assign/remove/list/bulk-set/reset permissions across 7 document types in Foundry VTT (actor, item, journal, scene, rolltable, folder, macro). Folder is read-only here (BaseFolder has no ownership field; grant on contained docs).

**Foundry Ownership Levels:**
- **none** (0) — No access
- **limited** (1) — Sees name + limited info
- **observer** (2) — Views full sheet, cannot edit
- **owner** (3) — Full control
- **inherit** (-1) — Per-user only: defer to default

**Actions:**
- **assign**: Set permission for a userId on a doc, OR set the default-level via {default: true}
- **remove**: Revoke (set to NONE) a userId on a doc
- **list**: Return current ownership map for a doc
- **bulk-set**: Apply one {userId|default, level} to many targets in one call (per-class atomic; cross-class best-effort with per_class envelope)
- **reset**: Clear all per-user entries; restore default=0

**Identifier (any single):**
- uuid (preferred, unambiguous) — Compendium UUIDs not yet supported
- id + documentType
- name + documentType
- actorName (deprecated) — auto-maps to {documentType: actor, name}

**Examples:**
- Assign: {action: "assign", documentType: "rolltable", name: "Random Loot", userId: "player1", level: "observer"}
- Default: {action: "assign", documentType: "scene", id: "abc", default: true, level: 0}
- Bulk: {action: "bulk-set", targets: [{documentType: "actor", name: "Hans"}, {documentType: "journal", name: "Dossier"}], userId: "player1", level: "observer"}
- List: {action: "list", documentType: "macro", name: "OpenChest"}
- Reset: {action: "reset", documentType: "rolltable", id: "xyz"}
- Legacy: {action: "assign", actorName: "Hans", userId: "p1", level: "owner"}

**Carve-outs:**
- Folder writes reject with OWNERSHIP_FOLDER_NOT_SUPPORTED.
- Compendium UUIDs reject with OWNERSHIP_COMPENDIUM_NOT_SUPPORTED.
- META levels (-10, -20) reject with OWNERSHIP_META_LEVEL_FORBIDDEN.
- Setting OWNER on a SCRIPT macro does NOT enable arbitrary-user execution — Foundry separately gates SCRIPT execution on author === user.id.`,
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["assign", "remove", "list", "bulk-set", "reset"],
          },
          documentType: {
            type: "string",
            enum: ["actor", "item", "journal", "scene", "rolltable", "folder", "macro"],
          },
          uuid: { type: "string", description: "Preferred identifier; Compendium UUIDs not supported in Phase 1" },
          id: { type: "string", description: "Document id (requires documentType)" },
          name: { type: "string", description: "Document name (requires documentType; case-sensitive)" },
          actorName: { type: "string", description: "[deprecated] Legacy alias; auto-maps to {documentType: actor, name}" },
          userId: { type: "string", description: "Per-user grant target (mutex with `default`)" },
          default: { type: "boolean", description: "When true, target the default-level of the ownership map (mutex with `userId`)" },
          level: {
            description: "[assign/bulk-set] one of 'none'|'limited'|'observer'|'owner'|'inherit' or -1|0|1|2|3",
          },
          targets: {
            type: "array",
            items: { type: "object" },
            description: "[bulk-set] Array of {documentType, uuid|id|name} entries",
          },
        },
        required: ["action"],
      },
    }];
  }

  async execute(args: OwnershipArgs) {
    this.logger.info("Executing ownership", { action: args.action });

    switch (args.action) {
      case "assign":
        return this.handleAssign(args);
      case "remove":
        return this.handleRemove(args);
      case "list":
        return this.handleList(args);
      case "bulk-set":
        return this.handleBulkSet(args);
      case "reset":
        return this.handleReset(args);
    }
  }

  // Map legacy `actorName` to {documentType: 'actor', name}. Logs a deprecation warning.
  private resolveLegacyAlias(input: Record<string, any>): Record<string, any> {
    if (input.actorName && !input.documentType && !input.name) {
      this.logger.warn("ownership: `actorName` is deprecated — use {documentType: 'actor', name}", { actorName: input.actorName });
      return { ...input, documentType: "actor", name: input.actorName };
    }
    return input;
  }

  private validateSingleTarget(input: Record<string, any>, action: string): void {
    if (!input.documentType) {
      throw new Error(`ownership.${action}: documentType is required (one of actor|item|journal|scene|rolltable|folder|macro)`);
    }
    if (!input.uuid && !input.id && !input.name) {
      throw new Error(`ownership.${action}: provide one of uuid, id, or name to identify the document`);
    }
  }

  private async handleAssign(args: z.infer<typeof AssignOwnershipSchema>) {
    try {
      const input = this.resolveLegacyAlias(args);
      this.validateSingleTarget(input, "assign");

      const level = coerceLevel(input.level);
      const payload: any = {
        documentType: input.documentType,
        ...(input.uuid ? { uuid: input.uuid } : {}),
        ...(input.id ? { id: input.id } : {}),
        ...(input.name ? { name: input.name } : {}),
        level,
      };
      if (input.default === true) payload.default = true;
      else if (input.userId) payload.userId = input.userId;
      else throw new Error('ownership.assign: provide userId (per-user grant) or default:true (default-level update)');

      const data = await this.query<SetDocumentOwnershipResponse>("setDocumentOwnership", payload);
      return {
        content: [{
          type: "text",
          text: `${this.getLevelIcon(level)} **Ownership Assigned**\n\n` +
            `**Document:** ${input.documentType} (${data.resolvedId ?? input.id ?? input.name})\n` +
            `**Target:** ${input.default === true ? "default" : `user ${input.userId}`}\n` +
            `**Permission:** ${this.getLevelName(level)}\n\n` +
            `${this.getLevelDescription(level)}`,
        }],
      };
    } catch (e) {
      return this.errorResponse("assign", e instanceof Error ? e.message : String(e));
    }
  }

  private async handleRemove(args: z.infer<typeof RemoveOwnershipSchema>) {
    try {
      const input = this.resolveLegacyAlias(args);
      this.validateSingleTarget(input, "remove");

      const payload: any = {
        documentType: input.documentType,
        ...(input.uuid ? { uuid: input.uuid } : {}),
        ...(input.id ? { id: input.id } : {}),
        ...(input.name ? { name: input.name } : {}),
        userId: input.userId,
        level: 0,
      };
      const data = await this.query<SetDocumentOwnershipResponse>("setDocumentOwnership", payload);
      return {
        content: [{
          type: "text",
          text: `🚫 **Ownership Removed**\n\n**Document:** ${input.documentType} (${data.resolvedId ?? input.id ?? input.name})\n**User:** ${input.userId}\n\nNo permissions for this user on this document.`,
        }],
      };
    } catch (e) {
      return this.errorResponse("remove", e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: z.infer<typeof ListOwnershipSchema>) {
    try {
      const input = this.resolveLegacyAlias(args);
      this.validateSingleTarget(input, "list");

      const payload: any = {
        documentType: input.documentType,
        ...(input.uuid ? { uuid: input.uuid } : {}),
        ...(input.id ? { id: input.id } : {}),
        ...(input.name ? { name: input.name } : {}),
      };
      const data = await this.query<GetDocumentOwnershipResponse>("getDocumentOwnership", payload);

      if (data.ownership === null) {
        return {
          content: [{
            type: "text",
            text: `📋 **Ownership for ${input.documentType} (${data.resolvedId ?? input.id ?? input.name})**\n\n` +
              `_${data.reason ?? "no ownership"}_ — ${input.documentType} has no per-user ownership map (ADR-024).`,
          }],
        };
      }

      const entries = Object.entries(data.ownership ?? {}).filter(([k]) => k !== "default");
      const defaultLevel = (data.ownership ?? {}).default ?? 0;
      let body = `📋 **Ownership for ${input.documentType} (${data.resolvedId ?? input.id ?? input.name})**\n\n`;
      body += `**Default:** ${this.getLevelName(defaultLevel)}\n\n`;
      if (entries.length === 0) {
        body += `_No per-user permissions set._\n`;
      } else {
        body += `**Per-user permissions:**\n\n`;
        for (const [userId, lvl] of entries) {
          body += `${this.getLevelIcon(lvl as number)} **${userId}**: ${this.getLevelName(lvl as number)}\n`;
        }
      }
      return { content: [{ type: "text", text: body }] };
    } catch (e) {
      return this.errorResponse("list", e instanceof Error ? e.message : String(e));
    }
  }

  private async handleBulkSet(args: z.infer<typeof BulkSetOwnershipSchema>) {
    try {
      const level = coerceLevel(args.level);
      if (args.userId && args.default) throw new Error("ownership.bulk-set: provide userId XOR default:true, not both");
      if (!args.userId && !args.default) throw new Error("ownership.bulk-set: provide userId (per-user grant) or default:true (default-level update)");

      const payload: any = { targets: args.targets, level };
      if (args.default === true) payload.default = true;
      else payload.userId = args.userId;

      const data = await this.query<BulkSetDocumentOwnershipResponse>("bulkSetDocumentOwnership", payload);
      const status = data.overall_success ? "✅ all succeeded" : "⚠️ partial failure";
      let body = `📦 **Bulk Ownership Set** — ${status}\n\n`;
      body += `**Target:** ${args.default === true ? "default" : `user ${args.userId}`}\n`;
      body += `**Level:** ${this.getLevelName(level)}\n\n`;
      for (const cls of data.per_class ?? []) {
        body += `- **${cls.documentType}**: ${cls.succeeded} succeeded, ${cls.failed?.length ?? 0} failed\n`;
        for (const f of cls.failed ?? []) {
          body += `  - ❌ ${JSON.stringify(f.target)}: ${f.error}\n`;
        }
      }
      return { content: [{ type: "text", text: body }] };
    } catch (e) {
      return this.errorResponse("bulk-set", e instanceof Error ? e.message : String(e));
    }
  }

  private async handleReset(args: z.infer<typeof ResetOwnershipSchema>) {
    try {
      const input = this.resolveLegacyAlias(args);
      this.validateSingleTarget(input, "reset");
      const payload: any = {
        documentType: input.documentType,
        ...(input.uuid ? { uuid: input.uuid } : {}),
        ...(input.id ? { id: input.id } : {}),
        ...(input.name ? { name: input.name } : {}),
      };
      const data = await this.query<SetDocumentOwnershipResponse>("resetDocumentOwnership", payload);
      return {
        content: [{
          type: "text",
          text: `🔄 **Ownership Reset**\n\n` +
            `**Document:** ${input.documentType} (${data.resolvedId ?? input.id ?? input.name})\n` +
            `All per-user entries cleared; default restored to NONE.`,
        }],
      };
    } catch (e) {
      return this.errorResponse("reset", e instanceof Error ? e.message : String(e));
    }
  }

  private errorResponse(action: string, error: string) {
    return {
      content: [{ type: "text", text: `❌ **ownership.${action} failed**\n\n${error}` }],
      isError: true,
    };
  }

  private getLevelName(level: number): string {
    switch (level) {
      case -1: return "Inherit";
      case 0: return "None";
      case 1: return "Limited";
      case 2: return "Observer";
      case 3: return "Owner";
      default: return `Unknown(${level})`;
    }
  }

  private getLevelIcon(level: number): string {
    switch (level) {
      case -1: return "↩️";
      case 0: return "🚫";
      case 1: return "🔒";
      case 2: return "👁️";
      case 3: return "👑";
      default: return "❓";
    }
  }

  private getLevelDescription(level: number): string {
    switch (level) {
      case -1: return "Defers to the document's default permission";
      case 0: return "No access";
      case 1: return "Can see basic info only";
      case 2: return "Can view full sheet but cannot control or edit";
      case 3: return "Full control — can view, edit, control, and delete";
      default: return "";
    }
  }
}
