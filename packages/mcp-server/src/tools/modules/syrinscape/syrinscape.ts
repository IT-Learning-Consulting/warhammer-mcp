// Module Integration v2 Phase 13C — module-syrinscape MCP tool (Syrinscape Control v1.0.5, Zhell).
//
// Always-registered umbrella. The foundry-module handler guards on syrinscape-control being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw -> moduleNotActiveContent().
// Pre-flight with module-probe.is-active syrinscape-control.
//
// 8 actions, direct-call over globalThis.syrinscapeControl.utils/storage — no macro bridge. DEP-GATED: real
// playback needs a paid Syrinscape account + a valid authToken; list/is-playing actions work without one.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { SYRINSCAPE_ACTIONS, type SyrinscapeResult } from './schemas.js';
import { z } from 'zod';
import { SyrinscapeInput } from '@foundry-mcp/shared';

type SyrinscapeArgs = z.infer<typeof SyrinscapeInput>;

function formatResult(d: SyrinscapeResult): string {
  const p = 'module-syrinscape';
  switch (d.action) {
    case 'set-mood':
    case 'stop-mood':
    case 'play-element':
    case 'stop-element':
      return `${p}.${d.action}: "${d.id}" accepted by Syrinscape (command sent, not confirmed playing).`;
    case 'stop-all':
      return `${p}.stop-all: stop-all sent.`;
    case 'is-playing':
      return `${p}.is-playing: "${d.elementId}" playing=${d.playing}${d.note ? ` (${d.note})` : ''}.`;
    case 'list-soundsets':
      if (d.hint) return `${p}.list-soundsets: ${d.hint}`;
      // BUG-464 (Wave 2): surface the bounded-page envelope.
      return `${p}.list-soundsets: ${d.soundsets.length}${d.totalAvailable !== undefined ? ` of ${d.totalAvailable}` : ''} soundset(s)${d.truncated ? ` — truncated; page with limit/offset (offset ${d.offset ?? 0}, limit ${d.limit ?? d.soundsets.length}) or narrow with filter` : ''}.`;
    case 'list-moods':
      if (d.hint) return `${p}.list-moods: ${d.hint}`;
      return `${p}.list-moods: ${d.moods.length}${d.totalAvailable !== undefined ? ` of ${d.totalAvailable}` : ''} mood(s)${d.truncated ? ` — truncated; page with limit/offset (offset ${d.offset ?? 0}, limit ${d.limit ?? d.moods.length}) or narrow with soundsetName/filter` : ''}.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleSyrinscapeToolOptions extends BaseToolOptions {}

export class ModuleSyrinscapeTool extends BaseTool {
  constructor(options: ModuleSyrinscapeToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-syrinscape', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-syrinscape',
        title: 'Syrinscape Control integration — soundscape mood/element playback',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description: `Drive the Syrinscape Control module — mood/element playback against a Syrinscape cloud session, plus cache reads of the discovered soundset/mood catalog.
Conditional: returns MODULE_NOT_ACTIVE when syrinscape-control is absent/inactive. Pre-flight: module-probe.is-active syrinscape-control.

DEP-GATED: real audio playback requires a PAID Syrinscape account with a valid "authToken" world setting configured. Play/stop actions pre-check the authToken and return SYRINSCAPE_AUTH_MISSING before calling anything if it's blank — the module itself would otherwise swallow the failure into an indistinguishable \`false\`.

VERIFIABILITY CEILING: play/stop calls only confirm Syrinscape ACCEPTED the command over its WebSocket — not that audio is actually playing (that's external, in the Syrinscape cloud client). A truthy result means "accepted"; is-playing gives a local (weaker, WS-echo-populated) in-memory read.

CACHE-ONLY LIST ACTIONS: list-soundsets/list-moods read the world's cached settings directly (populated only when a GM has opened the Syrinscape Browser at least once with a valid session) — they NEVER hit Syrinscape's REST API (which itself needs auth and can throw on a missing token). A cold/never-populated world returns an empty list plus a hint to refresh via the Syrinscape Browser — this is a valid state, not an error.

Use this when:
- Triggering a mood or one-shot element on a live Syrinscape cloud session to match the current scene's tone.
- Stopping a specific mood/element, or stopping all Syrinscape playback at once (scene transition, combat end).
- Checking whether a specific mood/element is currently believed to be playing (local WS-echo state).
- Browsing the cached soundset/mood catalog to find a valid id before calling set-mood/play-element.

8 actions:
set-mood { id } / stop-mood { id } / play-element { id } / stop-element { id } — GM-only, auth-gated.
stop-all {} — GM-only, auth-gated.
is-playing { elementId } — ungated, pure in-memory read, works without an authToken.
list-soundsets { limit?, offset?, filter? } — ungated cache read, returns [] + hint when cold; filter = case-insensitive name substring.
list-moods { soundsetName?, limit?, offset?, filter? } — ungated cache read, same bounded contract; soundsetName narrows to one soundset slug, filter matches mood names.

Example: { action: "set-mood", id: "m:12345" }

Do NOT use this tool for standard Foundry audio playback — use \`playlist\`/\`sound\` (core tools) for that. module-syrinscape controls an EXTERNAL Syrinscape cloud session (needs a paid account + authToken); it never touches a Foundry Playlist/PlaylistSound document.

Performance Notes:
- set-mood/stop-mood/play-element/stop-element/stop-all/is-playing: small fixed-shape response (an accepted/playing confirmation) — no pagination.
- list-soundsets/list-moods: BOUNDED (BUG-490/464) — default page 50 rows (max 500); response carries totalAvailable + truncated so a page boundary is always visible. The live warm cache holds 500+ soundsets / 4,500+ moods — always page with limit/offset or narrow with filter/soundsetName rather than requesting the max in one call.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...SYRINSCAPE_ACTIONS], description: 'Syrinscape action to perform.' },
            id: { type: 'string', description: 'set-mood/stop-mood/play-element/stop-element: the mood or element id (as listed by list-moods, e.g. "m:12345").' },
            elementId: { type: 'string', description: 'is-playing: the mood/element id to check.' },
            soundsetName: { type: 'string', description: 'list-moods (optional): filter to a single soundset by its slug name (from list-soundsets).' },
            limit: { type: 'number', description: '[list-soundsets/list-moods] Max rows per page (default 50, max 500). BUG-464 bounded contract.' },
            offset: { type: 'number', description: '[list-soundsets/list-moods] Zero-based row offset for paging.' },
            filter: { type: 'string', description: '[list-soundsets/list-moods] Case-insensitive name substring filter.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: SyrinscapeArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-syrinscape action', { action });
    if (!(SYRINSCAPE_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<SyrinscapeResult>('module-syrinscape', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-syrinscape', msg);
      return this.errorResponse(action, msg);
    }
  }
}
