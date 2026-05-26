// Phase 8 mcp_crud_expansion — Macro CRUD + execute handler.
//
// Architecture:
//   - 5 CRUD handlers (create/update/delete/get/list) flow through
//     `createFlatWorldDocCRUDHandlers` — first reuse of the flat sibling factory.
//   - `executeMacro` is hand-rolled — it needs scope-injection resolution
//     (actorId/tokenId/speakerId → Foundry objects), best-effort throw capture,
//     and bespoke response shape (chat vs script branches).
//   - `dispatchMacro` dispatches over all 6 actions; mirrors `dispatchPlaylist`.
//
// Trust gates:
//   - `confirmedExecution: z.literal(true)` rejects at parse time (CCR-Trust).
//   - `confirm: true` truthy-check on delete (CCR-Delete-Safety).
//
// WARN-ONLY pre-delete audits (Phase 8 §G D5+D6):
//   - `hotbarRefs[]` scans `game.users[].hotbar` for the macro id.
//   - `regionBehaviorRefs[]` scans every `scene.regions[].behaviors[]` for
//     `type === 'executeMacro' && system.uuid === \`Macro.${macroId}\``.
//   - Foundry does NOT auto-cascade on either surface (probe-confirmed:
//     User.hotbar = ObjectField; RegionBehavior.executeMacro.system.uuid = DocumentUUIDField).
//   - Phase 10's `cross-doc-fk audit-orphans` / `repair-orphans` will own
//     actual cleanup; this phase surfaces the orphans WARN-only.
//
// Anchors:
//   - DP-15: typed Envelope<T> returns; no `<any>` on response side.
//   - DP-16 / F08: factory-baked _source scalar compare.
//   - DP-19: every formatter field is referenced in the tool description (formatter completeness gate).
//   - BUG-075: factory-baked snapshot before update.
//   - NEVER calls ChatMessage create directly — all GM feedback routes through notify.*
//     (notify-migration-guard test catches direct chat-message construction).

import {
  CreateMacroInput,
  UpdateMacroInput,
  DeleteMacroInput,
  GetMacroInput,
  ListMacrosInput,
  ExecuteMacroInput,
  MacroToolInput,
  type MacroViewModel,
  type MacroListItem,
  type MacroHotbarRef,
  type MacroRegionBehaviorRef,
  type MacroExecuteResponse,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import {
  createFlatWorldDocCRUDHandlers,
  validateGMAccess,
  type Envelope,
} from '../utils/flatWorldCRUDFactory.js';

// ── Error tag + deny message (parity with PLAYLIST_DENY in playlist.ts) ────

const MACRO_DENY = (op: string) => `Access denied: ${op}Macro requires GM`;

// ── Serializers ───────────────────────────────────────────────────────────

function serializeMacroViewModel(macro: any): MacroViewModel {
  const cmd = (macro._source?.command as string) ?? '';
  return {
    id: macro.id as string,
    name: (macro._source?.name as string) ?? '',
    type: (macro._source?.type as 'chat' | 'script') ?? 'chat',
    scope: (macro._source?.scope as 'global' | 'actors' | 'actor') ?? 'global',
    command: cmd,
    img: (macro._source?.img as string | null) ?? null,
    folder: (macro._source?.folder as string | null) ?? null,
    ownership: (macro._source?.ownership as Record<string, number>) ?? {},
    flags: (macro._source?.flags as Record<string, unknown>) ?? {},
    author: (macro._source?.author as string | null) ?? null,
  };
}

function serializeMacroListItem(macro: any): MacroListItem {
  const cmd = (macro._source?.command as string) ?? '';
  return {
    id: macro.id as string,
    name: (macro._source?.name as string) ?? '',
    type: (macro._source?.type as 'chat' | 'script') ?? 'chat',
    scope: (macro._source?.scope as 'global' | 'actors' | 'actor') ?? 'global',
    folder: (macro._source?.folder as string | null) ?? null,
    commandPreview: cmd.length > 80 ? cmd.slice(0, 80) + '…' : cmd,
  };
}

// ── List filters ──────────────────────────────────────────────────────────

function applyMacroListFilters(input: any, items: any[]): any[] {
  let out = items;
  if (input.filter) {
    const needle = String(input.filter).toLowerCase();
    out = out.filter((m) => {
      const name = ((m._source?.name as string) ?? '').toLowerCase();
      const cmd = ((m._source?.command as string) ?? '').toLowerCase();
      return name.includes(needle) || cmd.includes(needle);
    });
  }
  if (input.folderId) {
    out = out.filter((m) => m._source?.folder === input.folderId);
  }
  if (input.type) {
    out = out.filter((m) => m._source?.type === input.type);
  }
  return out;
}

function isAnyMacroFilterApplied(input: any): boolean | string {
  const applied: string[] = [];
  if (input.filter) applied.push(`filter="${input.filter}"`);
  if (input.folderId) applied.push(`folderId="${input.folderId}"`);
  if (input.type) applied.push(`type="${input.type}"`);
  return applied.length > 0 ? applied.join(', ') : false;
}

// ── Pre-delete WARN-only audit (hotbar + region-behavior scans) ───────────

function buildMacroPreDeleteAudit(macro: any): {
  hotbarRefs: MacroHotbarRef[];
  regionBehaviorRefs: MacroRegionBehaviorRef[];
} {
  const macroId = macro.id as string;
  const macroUuid = `Macro.${macroId}`;

  // Hotbar scan
  const hotbarRefs: MacroHotbarRef[] = [];
  for (const user of ((game as any).users ?? [])) {
    const hotbar = user.hotbar ?? {};
    const slots: number[] = [];
    for (const [slot, val] of Object.entries(hotbar)) {
      if (val === macroId) {
        const n = Number(slot);
        if (Number.isFinite(n)) slots.push(n);
      }
    }
    if (slots.length > 0) {
      hotbarRefs.push({
        userId: user.id as string,
        userName: (user.name as string) ?? '',
        slots: slots.sort((a, b) => a - b),
      });
    }
  }

  // Region-behavior scan (type='executeMacro' && system.uuid === `Macro.<id>`)
  const regionBehaviorRefs: MacroRegionBehaviorRef[] = [];
  for (const scene of ((game as any).scenes ?? [])) {
    for (const region of (scene.regions ?? [])) {
      for (const behavior of (region.behaviors ?? [])) {
        if (behavior.type === 'executeMacro' && behavior.system?.uuid === macroUuid) {
          regionBehaviorRefs.push({
            sceneId: scene.id as string,
            sceneName: (scene.name as string) ?? '',
            regionId: region.id as string,
            regionName: (region.name as string) ?? null,
            behaviorId: behavior.id as string,
          });
        }
      }
    }
  }

  return { hotbarRefs, regionBehaviorRefs };
}

// ── Factory configuration ─────────────────────────────────────────────────

const macroFactoryHandlers = createFlatWorldDocCRUDHandlers<
  any,                       // TCreate
  { changes: Record<string, any>; macroId: string },  // TUpdate
  MacroViewModel,            // TViewModel
  MacroListItem              // TListItem
>({
  documentName: 'Macro',
  documentLabel: 'macro',
  collectionKey: 'macros',
  idField: 'macroId',
  gmGateReads: true,
  schemas: {
    create: CreateMacroInput,
    update: UpdateMacroInput,
    delete: DeleteMacroInput,
    get: GetMacroInput,
    list: ListMacrosInput,
    toolInput: MacroToolInput,
  },
  // DP-16 skip set: 'command' (multiline strings fragile after Foundry normalization) + 'flags'
  // ('flags' always skipped by factory; 'command' added per plan Design Decision).
  dp16SkipFields: ['command'],
  formatter: serializeMacroViewModel,
  listItemFormatter: serializeMacroListItem,
  applyListFilters: applyMacroListFilters,
  isFilterApplied: isAnyMacroFilterApplied,
  responseKeys: {
    viewModel: 'macro',
    listArray: 'items',
    remainingCount: 'remainingCount',
  },
  notifyKind: 'macro',
  formatNotifyTitle: (m) => `Macro "${m?._source?.name ?? '(unnamed)'}"`,
  formatNotifySummary: (input) => {
    if (input.action === 'create') return `${input.type} macro`;
    return 'macro';
  },
  defaultPageSize: 20,
  preDeleteAudit: buildMacroPreDeleteAudit,
  responseBuilders: {
    create: ({ doc, requestedChanges }) => ({
      macroId: doc.id,
      macro: serializeMacroViewModel(doc),
      requestedChanges,
    }),
    update: ({ doc, requestedChanges, changedFields }) => ({
      macroId: doc.id,
      macro: serializeMacroViewModel(doc),
      requestedChanges,
      changedFields,
    }),
    delete: ({ deletedId, remainingCount, preDeleteAudit }) => ({
      deletedId,
      remainingCount,
      hotbarRefs: (preDeleteAudit?.hotbarRefs as MacroHotbarRef[]) ?? [],
      regionBehaviorRefs: (preDeleteAudit?.regionBehaviorRefs as MacroRegionBehaviorRef[]) ?? [],
    }),
    listBare: ({ items }) => ({
      items,
    }),
    listPaginated: ({ items, total, page, pageSize, pageCount }) => ({
      total,
      page,
      pageSize,
      pageCount,
      items,
    }),
    listCount: ({ total, filterApplied }) => ({
      total,
      filterApplied,
    }),
  },
});

// ── Exported CRUD handlers (pass-through from factory) ────────────────────

export const createMacro = macroFactoryHandlers.create;
export const updateMacro = macroFactoryHandlers.update;
export const deleteMacro = macroFactoryHandlers.delete;
export const getMacro = macroFactoryHandlers.get;
export const listMacros = macroFactoryHandlers.list;

// ── executeMacro: hand-rolled (scope injection + chat/script branching) ───

function sanitizeForJSON(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value;
  // Object / array — try a JSON round-trip; on failure (cycles, BigInts, functions) emit a marker.
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return '[non-serializable]';
  }
}

interface ResolvedExecuteScope {
  actor?: any;
  token?: any;
  speaker?: any;
}

function resolveExecuteScope(input: {
  actorId?: string;
  tokenId?: string;
  speakerId?: string;
}): { scope: ResolvedExecuteScope; warnings: string[] } {
  const scope: ResolvedExecuteScope = {};
  const warnings: string[] = [];

  if (input.actorId) {
    const actor = (game as any).actors?.get(input.actorId);
    if (actor) scope.actor = actor;
    else warnings.push(`MACRO_EXECUTE_SCOPE_ACTOR_NOT_FOUND: no actor with id "${input.actorId}"`);
  }
  if (input.tokenId) {
    let tokenDoc: any = null;
    const canvasToken = (globalThis as any).canvas?.tokens?.get(input.tokenId);
    if (canvasToken) tokenDoc = canvasToken.document ?? canvasToken;
    if (!tokenDoc) {
      // Fall back to scene scan
      for (const scene of ((game as any).scenes ?? [])) {
        const t = scene.tokens?.get?.(input.tokenId);
        if (t) { tokenDoc = t; break; }
      }
    }
    if (tokenDoc) scope.token = tokenDoc;
    else warnings.push(`MACRO_EXECUTE_SCOPE_TOKEN_NOT_FOUND: no token with id "${input.tokenId}"`);
  }
  if (input.speakerId) {
    const speakerActor = (game as any).actors?.get(input.speakerId);
    if (speakerActor) {
      // ChatMessage.getSpeaker({actor}) — speaker is the resolved speaker object
      scope.speaker = (globalThis as any).ChatMessage?.getSpeaker?.({ actor: speakerActor }) ?? { actor: speakerActor.id };
    } else {
      warnings.push(`MACRO_EXECUTE_SCOPE_SPEAKER_NOT_FOUND: no actor with id "${input.speakerId}"`);
    }
  }

  return { scope, warnings };
}

export async function executeMacro(rawInput: unknown): Promise<Envelope<MacroExecuteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: MACRO_DENY('execute') };

  // CCR-Trust: Zod's literal(true) rejects absent/false at parse time.
  // Surface as the documented MACRO_EXECUTE_NOT_CONFIRMED sentinel.
  let input: { macroId: string; confirmedExecution: true; actorId?: string; tokenId?: string; speakerId?: string };
  try {
    input = ExecuteMacroInput.strict().parse(rawInput ?? {}) as typeof input;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    if (/confirmedExecution/.test(msg)) {
      return {
        success: false,
        error: 'MACRO_EXECUTE_NOT_CONFIRMED: executeMacro requires confirmedExecution: true (CCR-Trust)',
      };
    }
    return { success: false, error: `Invalid input: ${msg}` };
  }

  const macro = (game as any).macros?.get(input.macroId);
  if (!macro) {
    return { success: false, error: `MACRO_NOT_FOUND: no macro with id "${input.macroId}"` };
  }

  // Belt-and-suspenders: GM should always pass, but check the explicit gate.
  if (typeof macro.canUserExecute === 'function' && !macro.canUserExecute(game.user)) {
    return {
      success: false,
      error: `MACRO_EXECUTE_NOT_PERMITTED: current user cannot execute macro "${macro._source?.name ?? input.macroId}"`,
    };
  }

  const scopeInput: { actorId?: string; tokenId?: string; speakerId?: string } = {};
  if (input.actorId !== undefined) scopeInput.actorId = input.actorId;
  if (input.tokenId !== undefined) scopeInput.tokenId = input.tokenId;
  if (input.speakerId !== undefined) scopeInput.speakerId = input.speakerId;
  const { scope, warnings } = resolveExecuteScope(scopeInput);
  const macroType: 'chat' | 'script' = (macro._source?.type === 'script') ? 'script' : 'chat';

  return wrappedWrite('macro.execute', async () => {
    const startedAt = Date.now();
    let result: unknown;
    let threw = false;
    let thrownError: string | null = null;

    try {
      result = await macro.execute(scope);
    } catch (e) {
      threw = true;
      thrownError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }

    const elapsedMs = Date.now() - startedAt;
    const executedAt = new Date(startedAt).toISOString();

    let chatMessageId: string | null = null;
    let scriptReturnValue: unknown = null;

    if (macroType === 'chat' && !threw) {
      chatMessageId = (result as any)?.id ?? null;
    } else if (macroType === 'script' && !threw) {
      scriptReturnValue = sanitizeForJSON(result);
    }

    if (threw) {
      notify.warn(`Macro "${macro._source?.name ?? input.macroId}" threw during execution`, {
        summary: `${macroType}, ${elapsedMs}ms, threw`,
      });
    } else {
      notify.updated('macro', `Macro "${macro._source?.name ?? input.macroId}" executed`, {
        summary: `${macroType}, ${elapsedMs}ms`,
      });
    }

    return {
      success: true as const,
      data: {
        executedAt,
        macroId: input.macroId,
        macroType,
        chatMessageId,
        scriptReturnValue,
        errors: warnings,
        threw,
        thrownError,
        elapsedMs,
      },
    };
  });
}

// ── Umbrella dispatcher ───────────────────────────────────────────────────

export async function dispatchMacro(data: unknown): Promise<any> {
  let input: any;
  try {
    input = MacroToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createMacro(input);
    case 'update':
      return updateMacro(input);
    case 'delete':
      return deleteMacro(input);
    case 'get':
      return getMacro(input);
    case 'list':
      return listMacros(input);
    case 'execute':
      return executeMacro(input);
    default:
      throw new Error(`Unknown macro action: ${(input as any).action}`);
  }
}
