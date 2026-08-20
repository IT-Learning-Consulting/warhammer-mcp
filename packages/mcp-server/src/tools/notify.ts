// Phase 4 mcp_notify_coverage — Notify umbrella tool (1 action).
//
// Wraps the `notify` Foundry-side handler (queries.ts handleNotify).
// Emits GM-visible workflow events through the 5-channel notify dispatcher
// (console + toast + chat + tooltip + hook). Intended for skill bookends
// (start/end of /wfrp-build-npc, /wfrp-encounter-builder, /wfrp-combat) and
// ad-hoc GM-facing info/warn lines from composite skills.
//
// **CCR-Envelope-Consumer:** typed `this.query<NotifyResponse>` generic; no `<any>`.
// **BUG-069 compliance:** this.query<T> returns BARE unwrapped data; never check
// .success on the return value.

import { z } from 'zod';
import {
  NotifyToolInput,
  type NotifyResponse,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type NotifyArgs = z.infer<typeof NotifyToolInput>;


export interface NotifyToolOptions extends BaseToolOptions {}

// Internal: `warhammer-mcp.filepickerNotifyWarn` (formerly `notify.warn`) is a separate
// query key registered in queries.ts, handled by handlers/filepicker.ts:notifyWarn. It is a
// filepicker-internal round-trip and is NOT a sub-action of this NotifyTool. See PARITY-012.
export class NotifyTool extends BaseTool {
  constructor(options: NotifyToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'notify', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'notify',
        title: 'Emit GM-visible Notification',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description:
          `Emit a GM-visible notification through the Foundry-side 5-channel dispatcher (console + toast + chat + tooltip + hook). Intended as bookends for composite skill workflows (start/end of /wfrp-build-npc, /wfrp-encounter-builder, /wfrp-combat) and for ad-hoc GM info/warn lines from skill orchestration. GM-only (non-GM callers receive an Access denied envelope).

Use this when:
- Marking the start of a composite skill workflow (severity:"info", e.g. "Building NPC: Grendel Ironjaw").
- Marking the end of a composite skill workflow (severity:"lifecycle", lifecycleEvent:"workflow-end") so the GM sees a sticky confirmation with an audit-log chat entry.
- Surfacing a soft-failure inside a workflow that shouldn't abort it (severity:"warn", e.g. "Some species rolls produced duplicates").
- Recording a fatal/exceptional condition the GM must see immediately (severity:"error") — sparingly, prefer letting real errors propagate through their normal envelopes.
- Announcing a document-shaped event ("wrote X" / "changed Y" / "removed Z") with severity created/updated/deleted as a workflow bookend, not a substitute for the actual write's own response.

Do NOT use this for routine chat-log posting — use \`chat-message\` (core tool) for a plain, non-dispatcher chat post; \`notify\` is specifically for GM-visible multi-channel workflow signals, not everyday chat text.

**Severities (7):**
- **created / updated / deleted** — document-shaped events. Use for "wrote X" / "changed Y" / "removed Z" bookends. Routes through notify.created/updated/deleted under kind="mcp".
- **warn** — non-fatal warning (yellow toast). Use for soft-failure paths inside a workflow.
- **error** — fatal/exceptional error (red sticky toast + GM chat). Use sparingly; prefer letting actual errors propagate through their normal envelopes.
- **info** — low-importance informational text (blue toast). Use for "started X" workflow bookends.
- **lifecycle** — workflow lifecycle event (sticky toast + GM chat). Requires lifecycleEvent. Use for "workflow done" bookends — typically lifecycleEvent="workflow-end".

**When lifecycleEvent is required:** ONLY for severity="lifecycle". The four valid lifecycleEvent values are init / connection-up / connection-down / workflow-end. workflow-end is the standard skill-completion bookend. Omitting lifecycleEvent for severity="lifecycle" rejects with NOTIFY_INVALID_INPUT.

**summary / sticky / chat:** Optional, accepted on all non-lifecycle severities. summary appends a "— <summary>" suffix to the toast/console label. sticky forces a permanent toast (auto-true for error+lifecycle). chat force-routes to the GM-whispered chat audit log (auto-true for error+lifecycle, or when the auditWritesToChat world setting is on). These three are NOT accepted on severity="lifecycle" (notify.lifecycle hardcodes its own sticky/chat behavior).

**acknowledged semantics:** Response envelope is { acknowledged: boolean }. true iff the foundry-module dispatcher invoked notify.* without throwing. false ONLY when the internal notify.* call itself crashed — NOT when individual channels (toast/chat/etc.) were suppressed by world settings. Intentional suppression by enableNotifications=false or unconfigured auditWritesToChat is NOT a failure and does NOT flip acknowledged to false.

**Skill bookend pattern:**
- Workflow start: notify({ severity: "info", message: "Building NPC: \${name}", summary: "\${species} \${career} Lv\${tier}" })
- Workflow end: notify({ severity: "lifecycle", lifecycleEvent: "workflow-end", message: "NPC built: \${name}" })

Performance Notes:
- Flat, mode-less: single small fixed-shape response { acknowledged: boolean } regardless of severity — no response modes, no pagination, no size bound of practical concern.

**Examples:**
- info bookend: {severity:"info", message:"Building encounter: 5 hostiles"}
- lifecycle end: {severity:"lifecycle", lifecycleEvent:"workflow-end", message:"Encounter built: 5 actors", summary:"journal: abc123"}  // ← summary REJECTED on lifecycle — see schema strictness above
- warn: {severity:"warn", message:"Some species rolls produced duplicates"}`,
        inputSchema: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['created', 'updated', 'deleted', 'warn', 'error', 'info', 'lifecycle'],
              description: 'Notification severity. lifecycle requires lifecycleEvent; all others accept summary/sticky/chat.',
            },
            message: {
              type: 'string',
              minLength: 1,
              description: 'GM-facing message text (required, non-empty).',
            },
            summary: {
              type: 'string',
              description: '[non-lifecycle] Optional short suffix appended to the label (e.g. "Human Soldier Lv1").',
            },
            sticky: {
              type: 'boolean',
              description: '[non-lifecycle] Force permanent toast. Auto-true for error severity.',
            },
            chat: {
              type: 'boolean',
              description: '[non-lifecycle] Force GM-whispered chat audit entry. Auto-true for error severity.',
            },
            lifecycleEvent: {
              type: 'string',
              enum: ['init', 'connection-up', 'connection-down', 'workflow-end'],
              description: '[lifecycle only — REQUIRED] Lifecycle event identifier. workflow-end is the standard skill-bookend value.',
            },
          },
          required: ['severity', 'message'],
        },
      },
    ];
  }

  async execute(args: NotifyArgs) {
    this.logger.info('Executing notify', { severity: args.severity });
    try {
      const data = await this.query<NotifyResponse>('notify', args);
      const text = data.acknowledged
        ? `🔔 **Notification dispatched** (acknowledged) · severity=${args.severity}` +
          (args.severity === 'lifecycle' ? ` · event=${args.lifecycleEvent}` : '')
        : `⚠️ **Notification dispatcher threw** — see Foundry F12 console · severity=${args.severity}`;
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return this.errorResponse(args.severity, e instanceof Error ? e.message : String(e));
    }
  }
}
