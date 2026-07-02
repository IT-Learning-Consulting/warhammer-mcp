// Module Integration v2 Phase 10 — module-narrator MCP tool (Narrator Tools v1.0.1, elizeuangelo).
//
// Always-registered umbrella. The foundry-module handler guards on narrator-tools being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active narrator-tools.
//
// 6 actions, ONE uniform write architecture: a settings broadcast (`sharedState.narration`/`.scenery`) and/
// or a persisted ChatMessage (`flags['narrator-tools'].type`). Anchors: DP-15 (concrete
// this.query<NarratorResult> — never <any>); R2.4 (errors via errorResponse). formatResult exhaustiveness
// is real — NO `as never` suppression ([[feedback_single_action_module_umbrella_exhaustiveness]]).
//
// D5 — NO confirm-gate on this umbrella: narrate/describe/notify/scenery/configure are all additive or
// reversible (no destructive/removal op exists on this surface). This intentionally breaks the phase
// 1-9 "at least one confirm-gated pair" streak — documented, not a missing gate.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { NARRATOR_ACTIONS, NARRATOR_CONFIGURE_KEYS, type NarratorResult } from './schemas.js';

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: NarratorResult): string {
  const p = 'module-narrator';
  switch (d.action) {
    case 'get-state':
      return `${p}.get-state: narration.display=${d.sharedState.narration.display} scenery=${d.sharedState.scenery}.`;
    case 'narrate':
      return `${p}.narrate: message ${d.messageId} (narration #${d.narrationId}, paused=${d.paused}${d.queuedCount > 0 ? `, ${d.queuedCount} queued` : ''}).`;
    case 'describe':
      return `${p}.describe: message ${d.messageId} posted.`;
    case 'notify':
      return `${p}.notify: message ${d.messageId} whispered to ${d.whisper.length} GM(s).`;
    case 'scenery':
      return `${p}.scenery: scenery is now ${d.scenery ? 'ON' : 'OFF'}.`;
    case 'configure':
      return `${p}.configure: "${d.key}" set to ${JSON.stringify(d.value)}.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleNarratorToolOptions extends BaseToolOptions {}

export class ModuleNarratorTool extends BaseTool {
  constructor(options: ModuleNarratorToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-narrator', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-narrator',
        title: 'Narrator Tools integration — cinematic narration overlay, styled chat, GM-only notes, scenery toggle',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Narrator Tools module — a GM-to-all-clients presentation layer: a full-screen cinematic narration overlay, styled chat "description"/"notification" messages, and a background scenery frame. Fires the module's own bare-lexical NarratorTools.* API (its internal game.settings/ChatMessage writes are fire-and-forget, so this handler settle-polls the data layer before confirming success — a small delay is normal and expected).
Conditional: returns MODULE_NOT_ACTIVE when narrator-tools is absent/inactive. Pre-flight: module-probe.is-active narrator-tools.

NARRATION OVERLAY (broadcast, not a chat-only post): narrate writes game.settings sharedState.narration (drives the full-screen overlay on every connected client) AND posts a ChatMessage flagged type:"narration". startPaused defaults to FALSE regardless of the world's NarrationStartPaused setting — this guarantees the overlay auto-plays; a headless narrate with startPaused left to the module default can hang the overlay forever when no live GM tab is present to click Play. Pass startPaused:true only for a deliberate dramatic hold a GM will manually resume. message accepts a string OR an array of strings for a multi-part cutscene queue — NOTE the queue OVERWRITES on a repeat narrate call (does not append) and queue-advance depends on a LIVE narrator-permitted browser tab (LIVE-SMOKE-ONLY; unverifiable from a snapshot).

STYLED CHAT: describe posts a public ChatMessage (all players) flagged type:"description". notify posts a ChatMessage flagged type:"notification", whispered to the currently-connected GMs only.

SCENERY: scenery toggles (state omitted) or sets (state:true/false) the background frame's opacity, broadcast via the same sharedState setting.

CONFIGURE: writes one of 16 typed appearance/permission world settings (FontSize/WebFont/TextColor/TextShadow/TextCSS/Copy/Pause/DurationMultiplier/BGColor/BGImage/NarrationStartPaused/MessageType/PERMScenery/PERMDescribe/PERMNarrate/PERMAs) directly via game.settings.set, round-trip verified.

NO CONFIRM-GATE: every action here is additive or reversible (no destructive/removal op exists on this surface) — an intentional deviation from other module-* umbrellas' confirm-gated pair.

6 actions:
read (ungated): get-state {} — returns the persisted sharedState.
writes (GM-only): narrate { message, startPaused?, speaker? } (message: string | string[]) · describe { message, speaker? } · notify { message, speaker? } · scenery { state? } (GM-only + SETTINGS_MODIFY) · configure { key, value } (GM-only + SETTINGS_MODIFY).

Example: { action: "narrate", message: "The mist parts over Ubersreik." }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...NARRATOR_ACTIONS], description: 'Narrator Tools action to perform.' },
            message: {
              // MUST declare the string|array union — an untyped param is JSON-stringified across the MCP
              // boundary, collapsing a narrate array into one literal string (breaks the cutscene queue).
              oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
              description: 'narrate/describe/notify: chat/overlay text. narrate accepts a string OR an array of strings (multi-part cutscene queue — overwrites, does not append, on a repeat call).',
            },
            startPaused: { type: 'boolean', description: 'narrate: hold the overlay paused for a live GM to manually resume (default false — guarantees auto-play, avoiding the NarrationStartPaused hang-forever trap).' },
            speaker: { type: 'string', description: 'narrate/describe/notify: override the default "Narrator" ChatMessage speaker alias.' },
            state: { type: 'boolean', description: 'scenery: true=on, false=off, omitted=toggle the current state.' },
            key: { type: 'string', enum: [...NARRATOR_CONFIGURE_KEYS], description: 'configure: the typed appearance/permission setting key to write.' },
            value: { description: 'configure: the new value for `key` (string/number/boolean depending on the key).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-narrator action', { action });
    if (!(NARRATOR_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<NarratorResult>('module-narrator', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-narrator', msg);
      return this.errorResponse(action, msg);
    }
  }
}
