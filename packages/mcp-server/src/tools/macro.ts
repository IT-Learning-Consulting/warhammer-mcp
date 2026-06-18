// Phase 8 mcp_crud_expansion — Macro umbrella tool.
//
// Wraps `dispatchMacro` (foundry-module handler). 6 actions: create / update / delete
// / get / list / execute. Execute carries the strict `confirmedExecution: true` gate
// (CCR-Trust); delete carries the `confirm: true` gate (CCR-Delete-Safety).
//
// **CCR-Envelope-Consumer / DP-15:** every handler uses a concrete typed generic on
// `this.query<...>` — no `<any>`. BUG-069: `this.query<T>` returns BARE unwrapped data;
// never check `.success` on the return.
//
// **DP-19 formatter completeness:** every field claimed by the description below is
// grep-findable in the formatter functions.
//
// **DP-20 / BUG-088 4-surface parity:** every nullable Zod field has a matching
// `inputSchema.type` union (e.g. `["string","null"]`). Numeric-literal fields (none
// in macro) would get explicit `type:'integer'`.
//
// **WARN-only delete-refs:** delete-macro response surfaces `hotbarRefs[]` +
// `regionBehaviorRefs[]` so consumers see orphans the user must clean up via
// Phase 10's `cross-doc-fk` umbrella.

import { z } from 'zod';
import {
  MacroToolInput,
  type MacroViewModel,
  type MacroListItem,
  type MacroHotbarRef,
  type MacroRegionBehaviorRef,
  type MacroExecuteResponse,
  // Phase 12 module_integration_v1 — advanced-macros execution-routing responses.
  type SetExecutionTargetResponse,
  type ListWorldScriptsResponse,
  type GetExecutionTargetResponse,
  MacroId,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type MacroArgs = z.infer<typeof MacroToolInput>;
type ArgsFor<A extends MacroArgs['action']> = Extract<MacroArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ────

interface MacroCreateResponse {
  macroId: MacroId;
  macro: MacroViewModel;
  requestedChanges: Record<string, unknown>;
}
interface MacroUpdateResponse {
  macroId: MacroId;
  macro: MacroViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface MacroDeleteResponse {
  deletedId: string; // not a branded id (polymorphic / non-document)
  remainingCount: number;
  hotbarRefs: MacroHotbarRef[];
  regionBehaviorRefs: MacroRegionBehaviorRef[];
}
interface MacroGetResponse {
  macro: MacroViewModel;
}
interface MacroImportResponse {
  macroId: MacroId;
  macro: MacroViewModel;
  sourcePack: string;
}

interface MacroListBareResponse {
  items: MacroListItem[];
}
interface MacroListPaginatedResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  items: MacroListItem[];
}
interface MacroListCountResponse {
  total: number;
  filterApplied: boolean | string | null;
}
type MacroListResponse =
  | MacroListBareResponse
  | MacroListPaginatedResponse
  | MacroListCountResponse;

// ── Utilities ─────────────────────────────────────────────────────────────────


function commandPreview(cmd: string, max = 200): string {
  if (!cmd) return '_(empty)_';
  const truncated = cmd.length > max ? cmd.slice(0, max) + '…' : cmd;
  return '```\n' + truncated + '\n```';
}

function formatMacroView(m: MacroViewModel): string {
  return [
    `## Macro \`${m.id}\` — ${m.name}`,
    ``,
    `### Settings`,
    `- type: ${m.type} · scope: ${m.scope}`,
    `- img: ${m.img ?? '_(none)_'} · folder: ${m.folder ?? '_(none)_'}`,
    `- author: ${m.author ?? '_(unknown)_'}`,
    ``,
    `### Command`,
    commandPreview(m.command),
    ``,
    `### Ownership / Flags`,
    `- ownership keys: ${Object.keys(m.ownership).length}`,
    `- flag keys: ${Object.keys(m.flags).length}`,
  ].join('\n');
}

function formatMacroListItem(m: MacroListItem): string {
  return (
    `- \`${m.id}\` ${m.name}` +
    ` · type=${m.type}` +
    ` · scope=${m.scope}` +
    ` · folder=${m.folder ?? '_(none)_'}` +
    (m.commandPreview ? ` · cmd=\`${m.commandPreview}\`` : '')
  );
}

function formatExecuteResult(r: MacroExecuteResponse): string {
  const lines: string[] = [
    `Macro Executed`,
    ``,
    `- **Macro ID:** \`${r.macroId}\``,
    `- **Type:** ${r.macroType}`,
    `- **Executed at:** ${r.executedAt}`,
    `- **Elapsed:** ${r.elapsedMs}ms`,
    `- **Threw:** ${r.threw ? 'yes' : 'no'}`,
  ];
  if (r.threw && r.thrownError) lines.push(`- **Error:** ${r.thrownError}`);
  if (r.macroType === 'chat') {
    lines.push(`- **ChatMessage ID:** ${r.chatMessageId ?? '_(none — script may not have posted)_'}`);
  } else {
    let preview: string;
    if (r.scriptReturnValue === null || r.scriptReturnValue === undefined) preview = '_(no return value)_';
    else if (typeof r.scriptReturnValue === 'string') preview = `"${r.scriptReturnValue}"`;
    else preview = '`' + JSON.stringify(r.scriptReturnValue) + '`';
    lines.push(`- **Script return:** ${preview}`);
  }
  if (r.warnings.length > 0) { // BUG-304: field renamed from `errors` to `warnings`
    lines.push(``, `### Warnings`, ...r.warnings.map((e) => `- ${e}`));
  }
  return lines.join('\n');
}

// ── Phase 12 — advanced-macros execution-routing formatters ─────────────────

function formatSetExecutionTarget(d: SetExecutionTargetResponse): string {
  const lines = [
    `Macro Execution Target Set`,
    ``,
    `- **Macro:** \`${d.macroId}\` ${d.name}`,
    `- **Target:** ${d.target || '_(cleared — vanilla local execution)_'}`,
  ];
  if (d.canRunAsGM !== null) lines.push(`- **canRunAsGM:** ${d.canRunAsGM}`);
  if (d.warning) lines.push(``, `⚠ **${d.warning}** — flag NOT written.`, d.reason ? `_${d.reason}_` : '');
  if (d.note) lines.push(``, `_${d.note}_`);
  return lines.filter((l) => l !== undefined).join('\n');
}

function formatListWorldScripts(d: ListWorldScriptsResponse): string {
  if (!d.items.length) return 'No world-script macros found.';
  const lines = d.items.map(
    (i) => `- \`${i.id}\` ${i.name} · hook=${i.hook}` + (i.command ? ` · cmd=\`${i.command.slice(0, 60)}\`` : ''),
  );
  return `World-script macros (${d.items.length})\n\n${lines.join('\n')}`;
}

function formatGetExecutionTarget(d: GetExecutionTargetResponse): string {
  return [
    `Macro Execution Target`,
    ``,
    `- **Macro:** \`${d.macroId}\` ${d.name}`,
    `- **Target:** ${d.target ?? '_(unset — vanilla local execution)_'}`,
    `- **canRunAsGM:** ${d.canRunAsGM}`,
  ].join('\n');
}

function formatDeleteResponse(d: MacroDeleteResponse): string {
  const lines: string[] = [
    `Macro Deleted`,
    ``,
    `- **ID:** \`${d.deletedId}\``,
    `- **Remaining macros:** ${d.remainingCount}`,
  ];
  const totalRefs = d.hotbarRefs.length + d.regionBehaviorRefs.length;
  if (totalRefs === 0) {
    lines.push(``, `_No orphan references found._`);
  } else {
    lines.push(``, `### WARN: orphan references (Phase 10 cleanup territory)`);
    if (d.hotbarRefs.length > 0) {
      lines.push(``, `**Hotbar slots (${d.hotbarRefs.length} user(s)):**`);
      for (const ref of d.hotbarRefs) {
        lines.push(`- \`${ref.userId}\` ${ref.userName}: slots ${ref.slots.join(', ')}`);
      }
    }
    if (d.regionBehaviorRefs.length > 0) {
      lines.push(``, `**Region executeMacro behaviors (${d.regionBehaviorRefs.length}):**`);
      for (const ref of d.regionBehaviorRefs) {
        lines.push(`- Scene \`${ref.sceneId}\` ${ref.sceneName} → region \`${ref.regionId}\` ${ref.regionName ?? '_(unnamed)_'} → behavior \`${ref.behaviorId}\``);
      }
    }
    lines.push(``, `Use \`/wfrp-user clear-stale-slot\` for single-slot cleanup, \`/wfrp-region deleteBehavior\` for single region cleanup, or \`cross-doc-fk audit-orphans\` for full-world bulk audit.`);
  }
  return lines.join('\n');
}

export interface MacroToolOptions extends BaseToolOptions { }

export class MacroTool extends BaseTool {
  constructor(options: MacroToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'macro', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'macro',
        title: 'Manage Macros + execute with safety gate',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT Macro documents and execute them with explicit consent gating. 8 actions span CRUD + safe execution + Phase 9B name-execute/import.

**Actions:**
- **create**: Create a new Macro. Required: name, type (chat or script). Optional: scope (global/actors/actor, default global), command, img, folder, flags. Returns macroId + macro view + requestedChanges.
- **update**: Partial-diff update. macroId + changes (≥1 of: name, type, scope, command, img, folder, flags). Returns macro view + changedFields.
- **delete**: Hard delete with CCR-Delete-Safety. macroId + confirm: true (REQUIRED — false rejects). Response surfaces hotbarRefs[] and regionBehaviorRefs[] WARN-only audits (orphan cleanup deferred to Phase 10 cross-doc-fk umbrella).
- **get**: Fetch a Macro by id. Returns MacroViewModel (id, name, type, scope, command, img, folder, ownership, flags, author).
- **list**: List world macros. Optional filter (substring on name+command), folderId, type (chat/script), page/pageSize (1-100), countOnly. Items: id, name, type, scope, folder, commandPreview.
- **execute**: Run a Macro with explicit consent. macroId + confirmedExecution: true (REQUIRED — false or missing rejects at parse-time with MACRO_EXECUTE_NOT_CONFIRMED). Optional scope injection: actorId, tokenId, speakerId resolve to Foundry objects passed to macro.execute(scope). Returns macroType, chatMessageId (chat), scriptReturnValue (script), warnings[], threw, thrownError, elapsedMs, executedAt.
- **execute-by-name** (Phase 9B): Resolve a macro by name then execute it. Required: name, confirmedExecution: true. Optional scope: actorId/tokenId/speakerId. Rejects with MACRO_EXECUTE_NAME_AMBIGUOUS (listing matches) when >1 macro shares the name, or MACRO_NOT_FOUND when none match — never guesses.
- **import-from-compendium** (Phase 9B): Import a Macro from a compendium pack into the world. Required: packId, documentId (NOT a UUID). Returns the new world macro {macroId, macro, sourcePack}.
- **set-execution-target** (Phase 12 · CONDITIONAL on advanced-macros — returns MODULE_NOT_ACTIVE when absent): Set the advanced-macros execution-routing flag. macroId + target ("GM" | "runForEveryone" | "runForEveryoneElse" | "runAsWorldScript" | "runAsWorldScriptSetup" | <userId> | "" to clear). target "GM"/"runForEveryone" REQUIRE confirm:true (arbitrary JS at elevated scope). target "GM" pre-flights canRunAsGM — if false, the flag is NOT written and a warning is returned (the module would silently fall back to local execution). World-script targets take effect on the NEXT world reload. Returns {target, canRunAsGM, warning?, note?}.
- **list-world-scripts** (Phase 12 · CONDITIONAL): List macros flagged to auto-run at world load. Optional hook ("setup" | "ready" | "all", default "all"). Returns items[{id, name, command, hook}].
- **get-execution-target** (Phase 12 · CONDITIONAL): Read a macro's execution-routing flag + canRunAsGM. macroId. Returns {target, canRunAsGM}.

**Scope enum:** global / actors / actor (per CONST.MACRO_SCOPES; live-confirmed Phase 0 probe — NO "world" value).

**Trust gates:**
- delete requires confirm: true — bare confirm: false returns CCR-Delete-Safety reject.
- execute requires confirmedExecution: true — Zod literal(true) rejects missing/false at parse time.

**Examples:**
- create chat: {action:"create", name:"Roll Initiative", type:"chat", command:"/roll 1d10", scope:"global"}
- create script: {action:"create", name:"Apply Bleed", type:"script", command:"const t = canvas.tokens.controlled[0]; t.actor.update({...});", scope:"actor"}
- update: {action:"update", macroId:"abc", changes:{name:"Renamed", command:"/roll 2d10"}}
- delete: {action:"delete", macroId:"abc", confirm:true}
- list: {action:"list", filter:"intimidation", type:"chat", page:1, pageSize:20}
- execute: {action:"execute", macroId:"abc", confirmedExecution:true, actorId:"xyz"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'get', 'list', 'execute', 'execute-by-name', 'import-from-compendium', 'set-execution-target', 'list-world-scripts', 'get-execution-target'],
              description: 'The macro action to perform.',
            },
            macroId: {
              type: 'string',
              description: '[update/delete/get/execute] Macro document ID.',
            },
            // create writable fields (and update.changes shape)
            name: {
              type: 'string',
              minLength: 1,
              description: '[create] Required macro name. [update.changes] Optional new name. [execute-by-name] Required — resolves to a single macro (rejects on name collision).',
            },
            packId: {
              type: 'string',
              description: '[import-from-compendium] Compendium pack id (e.g. "wfrp4e-core.macros").',
            },
            documentId: {
              type: 'string',
              description: '[import-from-compendium] Macro document id within the pack.',
            },
            type: {
              type: 'string',
              enum: ['chat', 'script'],
              description: '[create/list/update.changes] Macro type: chat (template/roll command) or script (JavaScript body).',
            },
            scope: {
              type: 'string',
              enum: ['global', 'actors', 'actor'],
              description: '[create/update.changes] MACRO_SCOPES value. Default "global". Per CONST.MACRO_SCOPES — no "world".',
            },
            command: {
              type: 'string',
              description: '[create/update.changes] Macro body. Chat: e.g. "/roll 1d10". Script: JavaScript executed in eval scope.',
            },
            img: {
              type: ['string', 'null'],
              description: '[create/update.changes] Macro icon path. null = no icon.',
            },
            folder: {
              type: ['string', 'null'],
              description: '[create/update.changes] Folder document ID. null = no folder.',
            },
            flags: {
              type: 'object',
              description: '[create/update.changes] Foundry flag bag.',
            },
            // update.changes
            changes: {
              type: 'object',
              description:
                '[update] Partial-diff of writable fields. Must contain ≥1. Allowed keys: name, type, scope, command, img, folder, flags.',
            },
            // delete CCR-Delete-Safety
            confirm: {
              type: 'boolean',
              description: '[delete] Required confirmation flag. Must be true to proceed. [set-execution-target] Required (true) when target is "GM" or "runForEveryone".',
            },
            // Phase 12 — advanced-macros execution-routing
            target: {
              type: 'string',
              description: '[set-execution-target] Routing target: "GM" | "runForEveryone" | "runForEveryoneElse" | "runAsWorldScript" | "runAsWorldScriptSetup" | <userId> | "" (clear). "GM"/"runForEveryone" need confirm:true.',
            },
            hook: {
              type: 'string',
              enum: ['setup', 'ready', 'all'],
              description: '[list-world-scripts] Which world-load hook to filter by. Default "all".',
            },
            // execute CCR-Trust + scope injection
            confirmedExecution: {
              type: 'boolean',
              enum: [true],
              description: '[execute] STRICT consent gate. Must be literally true; missing/false rejects at parse time as MACRO_EXECUTE_NOT_CONFIRMED.',
            },
            actorId: {
              type: 'string',
              description: '[execute] Optional. Actor document ID — resolved and passed as `scope.actor` to macro.execute().',
            },
            tokenId: {
              type: 'string',
              description: '[execute] Optional. Token document ID — resolved (canvas first, then scene scan) and passed as `scope.token`.',
            },
            speakerId: {
              type: 'string',
              description: '[execute] Optional. Actor ID used to build `scope.speaker` via ChatMessage.getSpeaker({actor}).',
            },
            // list filters
            filter: {
              type: 'string',
              description: '[list] Substring match on macro name+command (case-insensitive).',
            },
            folderId: {
              type: 'string',
              description: '[list] Restrict list to macros in this folder id.',
            },
            page: {
              type: 'integer',
              minimum: 1,
              description: '[list] 1-based page number.',
            },
            pageSize: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: '[list] Items per page (default 20).',
            },
            countOnly: {
              type: 'boolean',
              description: '[list] Return {total, filterApplied} only.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: MacroArgs) {
    this.logger.info('Executing macro action', { action: args.action });
    switch (args.action) {
      case 'create':
        return this.handleCreate(args);
      case 'update':
        return this.handleUpdate(args);
      case 'delete':
        return this.handleDelete(args);
      case 'get':
        return this.handleGet(args);
      case 'list':
        return this.handleList(args);
      case 'execute':
        return this.handleExecute(args);
      case 'execute-by-name':
        return this.handleExecuteByName(args);
      case 'import-from-compendium':
        return this.handleImportFromCompendium(args);
      // Phase 12 — advanced-macros execution-routing (conditional; handler-guarded).
      case 'set-execution-target':
        return this.handleSetExecutionTarget(args);
      case 'list-world-scripts':
        return this.handleListWorldScripts(args);
      case 'get-execution-target':
        return this.handleGetExecutionTarget(args);
    }
  }

  // ── Phase 12 — advanced-macros execution-routing handlers ──────────────────

  private async handleSetExecutionTarget(args: ArgsFor<'set-execution-target'>) {
    try {
      const data = await this.query<SetExecutionTargetResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatSetExecutionTarget(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('set-execution-target', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleListWorldScripts(args: ArgsFor<'list-world-scripts'>) {
    try {
      const data = await this.query<ListWorldScriptsResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatListWorldScripts(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('list-world-scripts', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGetExecutionTarget(args: ArgsFor<'get-execution-target'>) {
    try {
      const data = await this.query<GetExecutionTargetResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatGetExecutionTarget(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get-execution-target', e instanceof Error ? e.message : String(e));
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ────────────

  private async handleExecuteByName(args: ArgsFor<'execute-by-name'>) {
    try {
      const data = await this.query<MacroExecuteResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatExecuteResult(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('execute-by-name', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleImportFromCompendium(args: ArgsFor<'import-from-compendium'>) {
    try {
      const data = await this.query<MacroImportResponse>('macro', args);
      const text = `📥 **Macro Imported**\n\nFrom pack \`${data.sourcePack}\`\n\n${formatMacroView(data.macro)}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('import-from-compendium', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<MacroCreateResponse>('macro', args);
      const reqKeys = Object.keys(data.requestedChanges).filter((k) => k !== 'action').join(', ');
      const text =
        `Macro Created\n\n${formatMacroView(data.macro)}\n\n**Requested fields:** ${reqKeys || '(name/type only)'}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<MacroUpdateResponse>('macro', args);
      const text =
        `Macro Updated\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatMacroView(data.macro)}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    if (!args.confirm) {
      return this.errorResponse('delete', 'MACRO_DELETE_NOT_CONFIRMED: delete requires confirm: true');
    }
    try {
      const data = await this.query<MacroDeleteResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatDeleteResponse(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<MacroGetResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatMacroView(data.macro) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<MacroListResponse>('macro', args);

      if ('pageCount' in data) {
        const p = data as MacroListPaginatedResponse;
        const lines = p.items.map(formatMacroListItem);
        const text = `Macros (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(none)_'}`;
        return { content: [{ type: 'text' as const, text }], structuredContent: p as unknown as Record<string, unknown> };
      }

      if ('filterApplied' in data) {
        const c = data as MacroListCountResponse;
        const filterLine = c.filterApplied ? `\n**Filter applied:** ${c.filterApplied}` : '';
        const text = `Macro count\n\n**Total:** ${c.total}${filterLine}`;
        return { content: [{ type: 'text' as const, text }], structuredContent: c as unknown as Record<string, unknown> };
      }

      const bare = data as MacroListBareResponse;
      if (bare.items.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No Macros found.' }], structuredContent: bare as unknown as Record<string, unknown> };
      }
      const lines = bare.items.map(formatMacroListItem);
      const text = `Macros (${bare.items.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: bare as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleExecute(args: ArgsFor<'execute'>) {
    if (args.confirmedExecution !== true) {
      return this.errorResponse(
        'execute',
        'MACRO_EXECUTE_NOT_CONFIRMED: execute requires confirmedExecution: true (CCR-Trust)',
      );
    }
    try {
      const data = await this.query<MacroExecuteResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatExecuteResult(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('execute', e instanceof Error ? e.message : String(e));
    }
  }
}
