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
import { MacroId, FolderId, ActorId, TokenId, PackId } from './branded-ids.js';
import { FOUNDRY_ID, paginationFields } from './primitives.js';

// ── Shared primitives ──────────────────────────────────────────────────────

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
  folder: FolderId.nullable().optional(),
  flags: z.record(z.any()).optional(),
});

const UpdateMacroChanges = z.object({
  name: z.string().min(1).optional(),
  type: MACRO_TYPE.optional(),
  scope: MACRO_SCOPE.optional(),
  command: z.string().optional(),
  img: z.string().min(1).nullable().optional(),
  folder: FolderId.nullable().optional(),
  flags: z.record(z.any()).optional(),
}).strict().refine(
  (o) => Object.keys(o).length > 0,
  { message: 'MACRO_EMPTY_PAYLOAD: update-macro requires at least one field in changes' },
);

export const UpdateMacroInput = z.object({
  action: z.literal('update'),
  macroId: MacroId,
  changes: UpdateMacroChanges,
});

export const DeleteMacroInput = z.object({
  action: z.literal('delete'),
  macroId: MacroId,
  confirm: z.boolean(),
});

export const GetMacroInput = z.object({
  action: z.literal('get'),
  macroId: MacroId,
});

export const ListMacrosInput = z.object({
  action: z.literal('list'),
  filter: z.string().optional(),
  folderId: FolderId.optional(),
  type: MACRO_TYPE.optional(),
  ...paginationFields(),
  countOnly: z.boolean().optional(),
});

export const ExecuteMacroInput = z.object({
  action: z.literal('execute'),
  macroId: MacroId,
  // CCR-Trust — stricter than playlist's z.boolean(); Zod rejects absent/false at parse time
  // with a literal-mismatch error, surfaced as MACRO_EXECUTE_NOT_CONFIRMED by the handler.
  confirmedExecution: z.literal(true),
  // Optional scope injection — handler resolves IDs to Foundry objects before macro.execute(scope).
  actorId: ActorId.optional(),
  tokenId: TokenId.optional(),
  speakerId: FOUNDRY_ID.optional(), // polymorphic: not branded (Phase 1 design)
});

// ── Phase 9B — execute-by-name + import-from-compendium ─────────────────────

// R9B.3 — resolve name→id then execute. Carries the SAME confirmedExecution gate
// as `execute`. Name collisions (>1 match) are rejected by the handler (no guessing).
export const ExecuteMacroByNameInput = z.object({
  action: z.literal('execute-by-name'),
  name: z.string().min(1),
  confirmedExecution: z.literal(true),
  actorId: ActorId.optional(),
  tokenId: TokenId.optional(),
  speakerId: FOUNDRY_ID.optional(), // polymorphic: not branded (Phase 1 design)
}).strict();

// R9B.4 — import a Macro from a compendium pack into the world. CCR-2a.
// {packId, documentId} per plan D1 (matches item-directory / rolltable convention; NOT {uuid}).
export const ImportMacroFromCompendiumInput = z.object({
  action: z.literal('import-from-compendium'),
  packId: PackId,
  documentId: FOUNDRY_ID, // polymorphic: not branded (Phase 1 design)
}).strict();

// ── Phase 12 module_integration_v1 — Advanced Macros execution-routing actions ──
// advanced-macros (v2.3.0) augments the Macro document with one flag:
// flags.advanced-macros.runForSpecificUser. These 3 actions read/write that flag on existing Macro
// docs. Each is guarded by requireModuleActive('advanced-macros') in the handler; the 8 core actions
// above stay UNGUARDED. `target` is z.string() (NOT z.enum) because "" is a valid clear-flag value
// and a raw User._id is also accepted; the handler enforces enum semantics + the canRunAsGM
// pre-flight (dossier §2.5).

export const SetExecutionTargetInput = z.object({
  action: z.literal('set-execution-target'),
  macroId: MacroId,
  // "GM" | "runForEveryone" | "runForEveryoneElse" | "runAsWorldScript" | "runAsWorldScriptSetup" | <User._id> | "" (clear)
  target: z.string(),
  // Handler-enforced confirm gate for target "GM" / "runForEveryone" (arbitrary JS, elevated scope).
  confirm: z.boolean().optional(),
}).strict();

export const ListWorldScriptsInput = z.object({
  action: z.literal('list-world-scripts'),
  hook: z.enum(['setup', 'ready', 'all']).optional(),  // default 'all' server-side
}).strict();

export const GetExecutionTargetInput = z.object({
  action: z.literal('get-execution-target'),
  macroId: MacroId,
}).strict();

export const MacroToolInput = z.discriminatedUnion('action', [
  CreateMacroInput,
  UpdateMacroInput,
  DeleteMacroInput,
  GetMacroInput,
  ListMacrosInput,
  ExecuteMacroInput,
  ExecuteMacroByNameInput,
  ImportMacroFromCompendiumInput,
  // Phase 12 — advanced-macros execution-routing (conditional; handler-guarded).
  SetExecutionTargetInput,
  ListWorldScriptsInput,
  GetExecutionTargetInput,
]);

// ── Type exports (z.infer for each input + the union) ──────────────────────

export type CreateMacroInputType = z.infer<typeof CreateMacroInput>;
export type UpdateMacroInputType = z.infer<typeof UpdateMacroInput>;
export type DeleteMacroInputType = z.infer<typeof DeleteMacroInput>;
export type GetMacroInputType = z.infer<typeof GetMacroInput>;
export type ListMacrosInputType = z.infer<typeof ListMacrosInput>;
export type ExecuteMacroInputType = z.infer<typeof ExecuteMacroInput>;
export type ExecuteMacroByNameInputType = z.infer<typeof ExecuteMacroByNameInput>;
export type ImportMacroFromCompendiumInputType = z.infer<typeof ImportMacroFromCompendiumInput>;
// Phase 12 — advanced-macros execution-routing input types.
export type SetExecutionTargetInputType = z.infer<typeof SetExecutionTargetInput>;
export type ListWorldScriptsInputType = z.infer<typeof ListWorldScriptsInput>;
export type GetExecutionTargetInputType = z.infer<typeof GetExecutionTargetInput>;
export type MacroToolInputType = z.infer<typeof MacroToolInput>;

// Phase 12 — the advanced-macros runForSpecificUser flag value space.
// "GM" | "runForEveryone" | "runForEveryoneElse" | "runAsWorldScript" | "runAsWorldScriptSetup"
// | <User._id string> | "" (clear). Modeled as string (the handler enforces the semantics).
export type RunForValue = string;

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
  warnings: string[];            // BUG-304: renamed from `errors`; non-fatal scope-resolution notices
  threw: boolean;                // script-body throws DO propagate (probe-confirmed)
  thrownError: string | null;
  elapsedMs: number;             // HC6 — informational, no v1 timeout
}

// Phase 9B — import-from-compendium returns the new world macro (CCR-2a re-read).
export interface MacroImportResponse {
  macroId: string;
  macro: MacroViewModel;
  sourcePack: string;
}

// ── Phase 12 — advanced-macros execution-routing response shapes ───────────
export interface SetExecutionTargetResponse {
  macroId: string;
  name: string;
  target: string;               // verified flag value (post-write read-back); '' when cleared
  canRunAsGM: boolean | null;   // evaluated only for target 'GM'; null otherwise
  warning?: string;             // e.g. 'canRunAsGM_false' — flag was NOT written
  reason?: string;              // human-readable explanation when warning present
  note?: string;                // world-script timing note (effect on next reload)
}

export interface WorldScriptItem {
  id: string;
  name: string;
  command: string;
  hook: 'setup' | 'ready';      // ready→runAsWorldScript, setup→runAsWorldScriptSetup
}

export interface ListWorldScriptsResponse {
  items: WorldScriptItem[];
}

export interface GetExecutionTargetResponse {
  macroId: string;
  name: string;
  target: string | null;        // RunForValue, or null when the flag is unset (vanilla execution)
  canRunAsGM: boolean;
}
