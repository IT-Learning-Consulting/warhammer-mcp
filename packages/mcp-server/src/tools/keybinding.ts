import { z } from 'zod';
import { BaseTool, BaseToolOptions } from '../base-tool.js';
// Phase 10 mcp_coverage_expansion — keybinding tool (GM-client scope over game.keybindings).
import {
  KeybindingToolInput,
  type KeybindingListResponse,
  type KeybindingGetResponse,
  type KeybindingSetResponse,
  type KeybindingResetActionResponse,
  type KeybindingResetAllResponse,
  type KeybindingConflictsResponse,
} from '@foundry-mcp/shared';

type KeybindingArgs = z.infer<typeof KeybindingToolInput>;
type KeybindingArgsFor<A extends KeybindingArgs['action']> = Extract<KeybindingArgs, { action: A }>;


function fmtBindings(bindings: Array<{ key: string; modifiers: string[] }>): string {
  if (!bindings.length) return '_(unbound)_';
  return bindings.map((b) => `\`${[...b.modifiers, b.key].filter(Boolean).join(' + ')}\``).join(', ');
}

export class KeybindingTools extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'keybinding', handler: (args: any) => this.handleKeybinding(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'keybinding',
        title: 'Keybinding (GM client)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description:
          `Inspect and change Foundry keybindings over \`game.keybindings\`.

**⚠ CLIENT-ONLY:** keybindings are a CLIENT-scope setting (the GM browser's localStorage). Writes affect ONLY the GM client this MCP runs on — other players' bindings are unreachable, and registration is init-time, so only already-registered actions appear in \`list\`/\`get\`.

**Actions:**
- **list**: Enumerate every registered keybinding action with its current bindings. Optional: namespace (filter, e.g. "core"). Returns {actions:[{id, namespace, name, hint?, precedence, restricted, editable[], current[], humanized[]}], total}.
- **get**: Read one action. Required: namespace, keyAction (e.g. namespace:"core", keyAction:"panUp"). Returns the action view.
- **set**: Rebind one action. Required: namespace, keyAction, bindings (array of {key, modifiers?}). key is a KeyboardEvent.code (e.g. "KeyF", "Digit1", "F5"); modifiers are values from KeyboardManager.MODIFIER_KEYS (Alt/Control/Shift). Re-reads to confirm persistence.
- **reset-action**: Reset one action to its registered defaults. Required: namespace, keyAction.
- **reset-all**: Reset ALL keybindings to defaults (bulk-irreversible). Pass dryRun:true to preview {count, items[]} with no change; pass confirm:true to execute. Without either it is rejected.
- **find-conflicts**: Report key+modifier combos bound to more than one action. Optional: precedenceFilter (PRIORITY/NORMAL/DEFERRED) to scope to one tier (cross-tier matches are layered, not true collisions). Returns {conflicts:[{key, modifiers[], actions:[{id,name,precedence,restricted}]}], total}.

**Examples:**
- list: {action:"list", namespace:"core"}
- get: {action:"get", namespace:"core", keyAction:"panUp"}
- set: {action:"set", namespace:"core", keyAction:"panUp", bindings:[{key:"KeyW"}]}
- reset-all preview: {action:"reset-all", dryRun:true}
- find-conflicts: {action:"find-conflicts"}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'get', 'set', 'reset-action', 'reset-all', 'find-conflicts'],
              description: 'The keybinding action to perform.',
            },
            namespace: {
              type: 'string',
              description:
                '[list filter / get / set / reset-action] Keybinding namespace (e.g. "core", or a module/system id).',
            },
            keyAction: {
              type: 'string',
              description: '[get / set / reset-action] The action name within the namespace (e.g. "panUp").',
            },
            bindings: {
              type: 'array',
              description: '[set] Replacement bindings. Each: {key: KeyboardEvent.code, modifiers?: ["Alt"|"Control"|"Shift"]}.',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: 'KeyboardEvent.code, e.g. "KeyF", "Digit1", "F5".' },
                  modifiers: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Modifier value strings from KeyboardManager.MODIFIER_KEYS (Alt/Control/Shift).',
                  },
                },
                required: ['key'],
              },
            },
            dryRun: {
              type: 'boolean',
              description: '[reset-all] Preview the impact (count + affected actions) without resetting.',
            },
            confirm: {
              type: 'boolean',
              const: true,
              description: '[reset-all] Must be true to execute the irreversible reset of ALL keybindings.',
            },
            precedenceFilter: {
              type: 'string',
              enum: ['PRIORITY', 'NORMAL', 'DEFERRED'],
              description: '[find-conflicts] Restrict to one precedence tier (cross-tier matches are layered, not true collisions).',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async handleKeybinding(args: unknown) {
    let params: KeybindingArgs;
    try {
      params = KeybindingToolInput.parse(args);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`);
        return this.errorResponse('keybinding', messages.join('; '));
      }
      return this.errorResponse('keybinding', error instanceof Error ? error.message : String(error));
    }

    switch (params.action) {
      case 'list':
        return this.handleList(params);
      case 'get':
        return this.handleGet(params);
      case 'set':
        return this.handleSet(params);
      case 'reset-action':
        return this.handleResetAction(params);
      case 'reset-all':
        return this.handleResetAll(params);
      case 'find-conflicts':
        return this.handleFindConflicts(params);
    }
  }

  private async handleList(args: KeybindingArgsFor<'list'>) {
    try {
      const data = await this.query<KeybindingListResponse>('keybinding', args);
      const scope = args.namespace ? ` (namespace \`${args.namespace}\`)` : '';
      const lines = data.actions
        .map((a) => `- \`${a.id}\` — ${a.name}: ${fmtBindings(a.current)}`)
        .join('\n');
      const text =
        `⌨️ **Keybindings**${scope} — ${data.total} action(s)\n\n${lines || '_(none)_'}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('list', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleGet(args: KeybindingArgsFor<'get'>) {
    try {
      const data = await this.query<KeybindingGetResponse>('keybinding', args);
      const text =
        `⌨️ **\`${data.id}\`** — ${data.name}\n\n` +
        `- **Bound:** ${fmtBindings(data.current)}\n` +
        `- **Default:** ${fmtBindings(data.editable)}\n` +
        `- **Precedence:** ${data.precedence}${data.restricted ? ' · GM-only' : ''}` +
        (data.hint ? `\n- **Hint:** ${data.hint}` : '');
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('get', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSet(args: KeybindingArgsFor<'set'>) {
    try {
      const data = await this.query<KeybindingSetResponse>('keybinding', args);
      const text = `⌨️ **Set** \`${data.id}\` → ${fmtBindings(data.bindings)} _(client only)_`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('set', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleResetAction(args: KeybindingArgsFor<'reset-action'>) {
    try {
      const data = await this.query<KeybindingResetActionResponse>('keybinding', args);
      const text = `⌨️ **Reset** \`${data.id}\` → ${fmtBindings(data.bindings)} _(defaults, client only)_`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('reset-action', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleResetAll(args: KeybindingArgsFor<'reset-all'>) {
    try {
      const data = await this.query<KeybindingResetAllResponse>('keybinding', args);
      if (data.dryRun) {
        const items = (data.items ?? []).map((i) => `  - \`${i.id}\` (${i.name})`).join('\n');
        const text =
          `⌨️ **Reset-all preview** — ${data.count} customized action(s) would reset:\n\n` +
          `${items || '_(none — all already at defaults)_'}\n\n` +
          `Pass \`confirm:true\` to execute (irreversible, client only).`;
        return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
      }
      const text = `⌨️ **Reset-all** — restored ${data.count} action(s) to defaults _(client only)_`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('reset-all', e instanceof Error ? e.message : String(e));
    }
  }

  private async handleFindConflicts(args: KeybindingArgsFor<'find-conflicts'>) {
    try {
      const data = await this.query<KeybindingConflictsResponse>('keybinding', args);
      const lines = data.conflicts
        .map((c) => {
          const combo = [...c.modifiers, c.key].filter(Boolean).join(' + ');
          const actors = c.actions.map((a) => `\`${a.id}\` (p${a.precedence})`).join(', ');
          return `- **${combo}** → ${actors}`;
        })
        .join('\n');
      const scope = args.precedenceFilter ? ` (${args.precedenceFilter} tier)` : '';
      const text =
        `⌨️ **Keybinding conflicts**${scope} — ${data.total} collision(s)\n\n${lines || '_(none)_'}`;
      return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      return this.errorResponse('find-conflicts', e instanceof Error ? e.message : String(e));
    }
  }
}
