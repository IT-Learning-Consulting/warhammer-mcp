// Module Integration v1 Phase 13A — module-css MCP tool.
//
// Umbrella tool exposing 4 actions for custom-css (world CSS injection module).
// Conditional: MODULE_NOT_ACTIVE returned when custom-css is absent/inactive.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - Phase-5 F03 lesson: the formatter MUST surface worldStylesheet text on `get`,
//     otherwise the caller receives an empty success message and never sees the CSS.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleCssInput } from '@foundry-mcp/shared';

type ModuleCssArgs = z.infer<typeof ModuleCssInput>;

// ── Response shapes (DP-15 — typed, never <any>) ─────────────────────────────

interface CssGetResult {
  worldStylesheet: string;
  worldLength: number;
  isEmpty: boolean;
  userStylesheet?: string;
  userLength?: number;
  userScopeCaveat?: string;
}

interface CssWriteResult {
  worldStylesheet: string;
  worldLength: number;
  broadcast?: boolean;
  reset?: boolean;
  appendedLength?: number;
  userStylesheet?: string;
  userScopeCaveat?: string;
}

type CssResult = CssGetResult | CssWriteResult;

// Long CSS strings are truncated in the surfaced text to keep responses focused;
// the full string is still returned in structuredContent for programmatic use.
const TEXT_TRUNCATE_AT = 4000;

function truncate(css: string): string {
  if (css.length <= TEXT_TRUNCATE_AT) return css;
  return `${css.slice(0, TEXT_TRUNCATE_AT)}\n\n…[truncated ${css.length - TEXT_TRUNCATE_AT} more chars — full CSS in structuredContent]`;
}

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


// ── Format helpers ────────────────────────────────────────────────────────────

function formatGet(r: CssGetResult): string {
  const head = r.isEmpty
    ? 'module-css.get: world CSS is empty (sentinel).'
    : `module-css.get: world CSS (${r.worldLength} chars):`;
  let text = `${head}\n\n${truncate(r.worldStylesheet)}`;
  if (r.userStylesheet !== undefined) {
    text += `\n\n--- GM user CSS (${r.userLength} chars, client-scoped) ---\n${truncate(r.userStylesheet)}`;
    if (r.userScopeCaveat) text += `\n\n(${r.userScopeCaveat})`;
  }
  return text;
}

function formatWrite(action: string, r: CssWriteResult): string {
  const broadcast = r.broadcast ? ' Broadcast to all connected clients.' : '';
  let text: string;
  switch (action) {
    case 'set':
      text = `module-css.set: world CSS written (${r.worldLength} chars).${broadcast}`;
      break;
    case 'append':
      text = `module-css.append: appended ${r.appendedLength ?? 0} chars → total ${r.worldLength} chars.${broadcast}`;
      break;
    case 'reset':
      text = `module-css.reset: world CSS reset to empty sentinel.${broadcast}`;
      break;
    default:
      text = `module-css.${action}: ${r.worldLength} chars.${broadcast}`;
  }
  if (r.userStylesheet !== undefined) {
    text += ` GM user CSS also set (${r.userStylesheet.length} chars, client-scoped).`;
  }
  return text;
}

export interface ModuleCssToolOptions extends BaseToolOptions {}

export class ModuleCssTool extends BaseTool {
  constructor(options: ModuleCssToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-css', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-css',
        title: 'Custom CSS — world stylesheet read/write',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `World CSS injection via the custom-css Foundry module. Write a CSS string to the
world stylesheet; every connected client re-injects it live (socket broadcast). Pair with
/foundry-journal to theme journals (store CSS on a journal page, read it, set it here).
Conditional: returns MODULE_NOT_ACTIVE when custom-css is absent/inactive.
Pre-flight: module-probe.is-active custom-css before using this tool.

4 actions:
- get    { includeUserStylesheet? }   — read worldStylesheet (+ GM-own userStylesheet if requested)
- set    { css, userStylesheet? }      — overwrite worldStylesheet; broadcast to all clients
- append { css, separator? }           — concatenate onto the existing worldStylesheet; broadcast
- reset  { }                           — clear worldStylesheet to the empty sentinel; broadcast

SAFETY:
- set/append/reset require GM. None are confirm-gated — all are reversible (reset/set restores any prior CSS).
- worldStylesheet is world-scoped (server DB) → replicated to all clients on write.
- userStylesheet is CLIENT-scoped (LocalStorage) → only the GM's own session; other players' user CSS is
  unreachable from the server. Use it sparingly; document the caveat to operators.
- Writing worldStylesheet completes the legacy v1→v2 migration implicitly; never write the legacy 'stylesheet' key.

Examples:
- { action: "get" }
- { action: "set", css: ".grim-page { background: #e8dcc0; }" }
- { action: "append", css: "/* night theme */ .grim-codex { background:#1c1108; }" }
- { action: "reset" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get', 'set', 'append', 'reset'],
              description: 'Custom CSS action to perform.',
            },
            css: {
              type: 'string',
              description: '[set/append] The CSS string to write (set) or concatenate (append).',
            },
            includeUserStylesheet: {
              type: 'boolean',
              description: "[get] Also return the GM session's own client-scoped user CSS.",
            },
            userStylesheet: {
              type: 'string',
              description: "[set] Optional — also write the GM session's own client-scoped user CSS (GM browser only).",
            },
            separator: {
              type: 'string',
              description: '[append] Separator inserted between existing and appended CSS. Default "\\n\\n".',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: ModuleCssArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-css action', { action });
    try {
      const data = await this.query<CssResult>('module-css', args);
      const text =
        action === 'get'
          ? formatGet(data as CssGetResult)
          : formatWrite(action, data as CssWriteResult);
      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-css', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
