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
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type MacroArgs = z.infer<typeof MacroToolInput>;
type ArgsFor<A extends MacroArgs['action']> = Extract<MacroArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler local types) ────

interface MacroCreateResponse {
  macroId: string;
  macro: MacroViewModel;
  requestedChanges: Record<string, unknown>;
}
interface MacroUpdateResponse {
  macroId: string;
  macro: MacroViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface MacroDeleteResponse {
  deletedId: string;
  remainingCount: number;
  hotbarRefs: MacroHotbarRef[];
  regionBehaviorRefs: MacroRegionBehaviorRef[];
}
interface MacroGetResponse {
  macro: MacroViewModel;
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

function errorContent(action: string, message: string) {
  return {
    content: [{ type: 'text' as const, text: `Macro/${action} failed: ${message}` }],
    isError: true,
  };
}

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
          `Manage Foundry VTT Macro documents and execute them with explicit consent gating. 6 actions span CRUD + safe execution.

**Actions:**
- **create**: Create a new Macro. Required: name, type (chat or script). Optional: scope (global/actors/actor, default global), command, img, folder, flags. Returns macroId + macro view + requestedChanges.
- **update**: Partial-diff update. macroId + changes (≥1 of: name, type, scope, command, img, folder, flags). Returns macro view + changedFields.
- **delete**: Hard delete with CCR-Delete-Safety. macroId + confirm: true (REQUIRED — false rejects). Response surfaces hotbarRefs[] and regionBehaviorRefs[] WARN-only audits (orphan cleanup deferred to Phase 10 cross-doc-fk umbrella).
- **get**: Fetch a Macro by id. Returns MacroViewModel (id, name, type, scope, command, img, folder, ownership, flags, author).
- **list**: List world macros. Optional filter (substring on name+command), folderId, type (chat/script), page/pageSize (1-100), countOnly. Items: id, name, type, scope, folder, commandPreview.
- **execute**: Run a Macro with explicit consent. macroId + confirmedExecution: true (REQUIRED — false or missing rejects at parse-time with MACRO_EXECUTE_NOT_CONFIRMED). Optional scope injection: actorId, tokenId, speakerId resolve to Foundry objects passed to macro.execute(scope). Returns macroType, chatMessageId (chat), scriptReturnValue (script), warnings[], threw, thrownError, elapsedMs, executedAt.

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
              enum: ['create', 'update', 'delete', 'get', 'list', 'execute'],
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
              description: '[create] Required macro name. [update.changes] Optional new name.',
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
              description: '[delete] Required confirmation flag. Must be true to proceed.',
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
    }
  }

  // ── Handlers (concrete typed per CCR-Envelope-Consumer rule 3) ────────────

  private async handleCreate(args: ArgsFor<'create'>) {
    try {
      const data = await this.query<MacroCreateResponse>('macro', args);
      const reqKeys = Object.keys(data.requestedChanges).filter((k) => k !== 'action').join(', ');
      const text =
        `Macro Created\n\n${formatMacroView(data.macro)}\n\n**Requested fields:** ${reqKeys || '(name/type only)'}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('create', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleUpdate(args: ArgsFor<'update'>) {
    try {
      const data = await this.query<MacroUpdateResponse>('macro', args);
      const text =
        `Macro Updated\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatMacroView(data.macro)}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('update', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleDelete(args: ArgsFor<'delete'>) {
    if (!args.confirm) {
      return errorContent('delete', 'MACRO_DELETE_NOT_CONFIRMED: delete requires confirm: true');
    }
    try {
      const data = await this.query<MacroDeleteResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatDeleteResponse(data) }] };
    } catch (e) {
      return errorContent('delete', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: ArgsFor<'get'>) {
    try {
      const data = await this.query<MacroGetResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatMacroView(data.macro) }] };
    } catch (e) {
      return errorContent('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleList(args: ArgsFor<'list'>) {
    try {
      const data = await this.query<MacroListResponse>('macro', args);

      if ('pageCount' in data) {
        const p = data as MacroListPaginatedResponse;
        const lines = p.items.map(formatMacroListItem);
        const text = `Macros (page ${p.page} of ${p.pageCount}, ${p.total} total)\n\n${lines.join('\n') || '_(none)_'}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      if ('filterApplied' in data) {
        const c = data as MacroListCountResponse;
        const filterLine = c.filterApplied ? `\n**Filter applied:** ${c.filterApplied}` : '';
        const text = `Macro count\n\n**Total:** ${c.total}${filterLine}`;
        return { content: [{ type: 'text' as const, text }] };
      }

      const bare = data as MacroListBareResponse;
      if (bare.items.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No Macros found.' }] };
      }
      const lines = bare.items.map(formatMacroListItem);
      const text = `Macros (${bare.items.length})\n\n${lines.join('\n')}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return errorContent('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleExecute(args: ArgsFor<'execute'>) {
    if (args.confirmedExecution !== true) {
      return errorContent(
        'execute',
        'MACRO_EXECUTE_NOT_CONFIRMED: execute requires confirmedExecution: true (CCR-Trust)',
      );
    }
    try {
      const data = await this.query<MacroExecuteResponse>('macro', args);
      return { content: [{ type: 'text' as const, text: formatExecuteResult(data) }] };
    } catch (e) {
      return errorContent('execute', e instanceof Error ? e.message : String(e));
    }
  }
}
