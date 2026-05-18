// Phase 8 mcp_crud_expansion — Macro umbrella shared schemas.
//
// 6 actions in a single discriminated union: create, update, delete, get, list, execute.
// Execute carries a STRICTER trust gate than other CCR-Trust gates: `confirmedExecution: z.literal(true)`
// rejects absent/false values at parse-time (vs runtime check on `z.boolean()`).
//
// Live-Foundry probes (.agents/research/mcp_crud_expansion/phase8_probes.md):
//   - MACRO_SCOPES = ["global","actors","actor"] — NO "world" (drift vs PRD R8.2; validate Step 10.5 emits PRD-amendment callout)
//   - MACRO_TYPES = {SCRIPT: "script", CHAT: "chat"}
//   - chat-macro execute returns ChatMessage with .id; script-macro execute returns the script's literal return value
//   - script-body throws DO propagate to outer try/catch (threw=true, err captured) — `threw` field is reliable
//   - User.hotbar = ObjectField (no auto-cascade); RegionBehavior.executeMacro.system.uuid = DocumentUUIDField (no auto-cascade)
//
// Anchors:
//   - DP-15: typed inputs (no <any>).
//   - DP-20: every Zod field has explicit type metadata; numeric-literal fields (none here) would get explicit type:'integer'.
//   - CCR-Trust: `confirmedExecution: z.literal(true)` stricter than `z.boolean()`.
//   - CCR-Delete-Safety: `confirm: z.boolean()` truthy-check enforced at handler level.

import { z } from 'zod';

// ── Shared primitives ──────────────────────────────────────────────────────

const FOUNDRY_ID = z.string().min(1);

// Phase 0 probe: live StringField.choices on Macro.schema.fields.scope.
const MACRO_SCOPE = z.enum(['global', 'actors', 'actor']);

// Phase 0 probe: live MACRO_TYPES.
const MACRO_TYPE = z.enum(['chat', 'script']);

// ── Discriminated-union variants ───────────────────────────────────────────

export const CreateMacroInput = z.object({
  action: z.literal('create'),
  name: z.string().min(1),
  type: MACRO_TYPE,
  scope: MACRO_SCOPE.optional(),       // defaults to 'global' server-side
  command: z.string().optional(),      // Foundry default ''
  img: z.string().min(1).nullable().optional(),
  folder: FOUNDRY_ID.nullable().optional(),
  flags: z.record(z.any()).optional(),
});

const UpdateMacroChanges = z.object({
  name: z.string().min(1).optional(),
  type: MACRO_TYPE.optional(),
  scope: MACRO_SCOPE.optional(),
  command: z.string().optional(),
  img: z.string().min(1).nullable().optional(),
  folder: FOUNDRY_ID.nullable().optional(),
  flags: z.record(z.any()).optional(),
}).strict().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'MACRO_EMPTY_PAYLOAD: update-macro requires at least one field in changes' },
);

export const UpdateMacroInput = z.object({
  action: z.literal('update'),
  macroId: FOUNDRY_ID,
  changes: UpdateMacroChanges,
});

export const DeleteMacroInput = z.object({
  action: z.literal('delete'),
  macroId: FOUNDRY_ID,
  confirm: z.boolean(),
});

export const GetMacroInput = z.object({
  action: z.literal('get'),
  macroId: FOUNDRY_ID,
});

export const ListMacrosInput = z.object({
  action: z.literal('list'),
  filter: z.string().optional(),
  folderId: FOUNDRY_ID.optional(),
  type: MACRO_TYPE.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  countOnly: z.boolean().optional(),
});

export const ExecuteMacroInput = z.object({
  action: z.literal('execute'),
  macroId: FOUNDRY_ID,
  // CCR-Trust — stricter than playlist's z.boolean(); Zod rejects absent/false at parse time
  // with a literal-mismatch error, surfaced as MACRO_EXECUTE_NOT_CONFIRMED by the handler.
  confirmedExecution: z.literal(true),
  // Optional scope injection — handler resolves IDs to Foundry objects before macro.execute(scope).
  actorId: FOUNDRY_ID.optional(),
  tokenId: FOUNDRY_ID.optional(),
  speakerId: FOUNDRY_ID.optional(),
});

export const MacroToolInput = z.discriminatedUnion('action', [
  CreateMacroInput,
  UpdateMacroInput,
  DeleteMacroInput,
  GetMacroInput,
  ListMacrosInput,
  ExecuteMacroInput,
]);

// ── Type exports (z.infer for each input + the union) ──────────────────────

export type CreateMacroInputType = z.infer<typeof CreateMacroInput>;
export type UpdateMacroInputType = z.infer<typeof UpdateMacroInput>;
export type DeleteMacroInputType = z.infer<typeof DeleteMacroInput>;
export type GetMacroInputType = z.infer<typeof GetMacroInput>;
export type ListMacrosInputType = z.infer<typeof ListMacrosInput>;
export type ExecuteMacroInputType = z.infer<typeof ExecuteMacroInput>;
export type MacroToolInputType = z.infer<typeof MacroToolInput>;

// ── Response shapes (concrete typed; CCR-Envelope-Consumer rule 3) ─────────

export interface MacroViewModel {
  id: string;
  name: string;
  type: 'chat' | 'script';
  scope: 'global' | 'actors' | 'actor';
  command: string;
  img: string | null;
  folder: string | null;
  ownership: Record<string, number>;
  flags: Record<string, unknown>;
  author: string | null;
}

export interface MacroListItem {
  id: string;
  name: string;
  type: 'chat' | 'script';
  scope: 'global' | 'actors' | 'actor';
  folder: string | null;
  commandPreview: string;  // First 80 chars of command, truncated
}

export interface MacroCreateResponse {
  macroId: string;
  macro: MacroViewModel;
  requestedChanges: Record<string, unknown>;
}

export interface MacroUpdateResponse {
  macroId: string;
  macro: MacroViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}

// WARN-only refs surfaced on delete (Phase 8 §G D5+D6; Phase 10 owns actual cascade).
export interface MacroHotbarRef {
  userId: string;
  userName: string;
  slots: number[];        // hotbar slot numbers (1-50) holding this macro id
}

export interface MacroRegionBehaviorRef {
  sceneId: string;
  sceneName: string;
  regionId: string;
  regionName: string | null;
  behaviorId: string;
}

export interface MacroDeleteResponse {
  deletedId: string;
  remainingCount: number;
  hotbarRefs: MacroHotbarRef[];                 // empty array when no orphans
  regionBehaviorRefs: MacroRegionBehaviorRef[]; // empty array when no orphans
}

export type MacroGetResponse = { macro: MacroViewModel };

// 3-branch list response shape:
//   bare:        { items: MacroListItem[] }
//   paginated:   { total, page, pageSize, pageCount, items }
//   countOnly:   { total, filterApplied }
export interface MacroListBareResponse {
  items: MacroListItem[];
}

export interface MacroListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  items: MacroListItem[];
}

export interface MacroListCountResponse {
  total: number;
  filterApplied: boolean | string | null;
}

export type MacroListResponse =
  | MacroListBareResponse
  | MacroListPaginatedResponse
  | MacroListCountResponse;

export interface MacroExecuteResponse {
  executedAt: string;            // ISO timestamp
  macroId: string;
  macroType: 'chat' | 'script';
  chatMessageId: string | null;  // populated for chat-type macros
  scriptReturnValue: unknown;    // populated for script-type macros (sanitized for JSON)
  errors: string[];              // non-fatal warnings
  threw: boolean;                // script-body throws DO propagate (probe-confirmed)
  thrownError: string | null;
  elapsedMs: number;             // HC6 — informational, no v1 timeout
}
