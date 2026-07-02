// Module Integration v2 Phase 13B — module-puzzle-locks MCP tool (Puzzle Locks v3.1.4, theripper93).
//
// Always-registered umbrella. The foundry-module handler guards on puzzle-locks being active; when inactive
// it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw -> moduleNotActiveContent().
// Pre-flight with module-probe.is-active puzzle-locks.
//
// 6 actions over document flags (flags.puzzle-locks.*) — no embedded items, no world settings. F04: both
// object-typed params (generalConfig, typeConfig) declare explicit `type: 'object'` so they don't silently
// stringify across the MCP boundary.
//
// CONFIRM-GATE (CCR-4): remove-puzzle (destructive unset) and force-unlock (bypasses interactive solve,
// unlockMacro does NOT fire) both require confirm:true.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { PUZZLE_LOCKS_ACTIONS, LOCK_TYPES, type PuzzleLocksResult } from './schemas.js';

function formatResult(d: PuzzleLocksResult): string {
  const p = 'module-puzzle-locks';
  switch (d.action) {
    case 'attach-puzzle':
      return `${p}.attach-puzzle: "${d.lockType}" attached to ${d.documentUuid}.`;
    case 'get-puzzle':
      return d.lockType
        ? `${p}.get-puzzle: ${d.documentUuid} has a "${d.lockType}" lock.`
        : `${p}.get-puzzle: ${d.documentUuid} has no puzzle-lock attached.`;
    case 'check-solve-state':
      return `${p}.check-solve-state: ${d.documentUuid} (${d.lockType}) unlocked=${d.unlocked}, attempts=${d.attempts}.`;
    case 'set-solve-macro':
      return `${p}.set-solve-macro: ${d.documentUuid} unlockMacro updated.`;
    case 'remove-puzzle':
      return `${p}.remove-puzzle: "${d.removedLockType}" removed from ${d.documentUuid}.`;
    case 'force-unlock':
      return `${p}.force-unlock: ${d.documentUuid} (${d.lockType}) forced unlocked${d.wallDoorClosed ? ' + wall door closed' : ''}. ${d.warning}`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModulePuzzleLocksToolOptions extends BaseToolOptions {}

export class ModulePuzzleLocksTool extends BaseTool {
  constructor(options: ModulePuzzleLocksToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-puzzle-locks', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-puzzle-locks',
        title: 'Puzzle Locks integration — document puzzle-lock authoring',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Puzzle Locks module — 14 interactive puzzle types (number/password/cryptex/item/image-wheel/mosaic/fifteen/fill-blanks/four-by-four/match/switches/mastermind/sudoku/sound) attachable to Wall, Tile, Token, Drawing, MeasuredTemplate, and most world documents. ALL state lives in document flags — no module-side cache.
Conditional: returns MODULE_NOT_ACTIVE when puzzle-locks is absent/inactive. Pre-flight: module-probe.is-active puzzle-locks.

FULL-REPLACE TRAP: attach-puzzle's typeConfig is a FULL REPLACE of the per-type flag — re-attaching an in-use lock wipes any in-progress player state stored there. Safe on a fresh document; document the caveat when reconfiguring a live one.

unlockMacro fires ONLY through the interactive player-facing solve — force-unlock does NOT execute it (only sets general.unlocked=true, and on a Wall also closes the door). set-solve-macro writes it via a targeted dotted-path flag write (safe vs the full-replace trap).

6 actions (GM-only):
attach-puzzle { documentUuid, lockType, generalConfig?, typeConfig } — typeConfig fields vary per lockType; solution-bearing types (password/number/cryptex/fill-blanks/four-by-four/match/switches/mastermind/sudoku/sound) require a non-empty solution field or this rejects PUZZLE_LOCKS_INVALID_LOCK_TYPE (the module itself performs no validation of its own).
get-puzzle { documentUuid } — reads general + per-type flags.
check-solve-state { documentUuid } — { lockType, unlocked, attempts }.
set-solve-macro { documentUuid, jsCode? OR macroName? — exactly one required }.
remove-puzzle { documentUuid, confirm:true } — CONFIRM-GATED, deletes general + per-type flags.
force-unlock { documentUuid, confirm:true } — CONFIRM-GATED GM override; on a Wall ALSO closes the door (two-write); unlockMacro does NOT fire.

Example: { action: "attach-puzzle", documentUuid: "Scene.abc.Drawing.def", lockType: "password-lock", typeConfig: { password: "open sesame" } }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...PUZZLE_LOCKS_ACTIONS], description: 'Puzzle Locks action to perform.' },
            documentUuid: { type: 'string', description: 'All actions: the target document UUID (resolved via fromUuid).' },
            lockType: { type: 'string', enum: [...LOCK_TYPES], description: 'attach-puzzle: which of the 14 puzzle-lock types to attach.' },
            generalConfig: {
              type: 'object',
              description: 'attach-puzzle (optional): partial override of the 17-field general lock config (label, description, unlocked, attempts, unlockSound, interactionSound, backgroundImage, glow, textColor, primaryColor, secondaryColor, primaryFont, secondaryFont, unlockMacro, permission, userPermissions).',
              additionalProperties: true,
            },
            typeConfig: {
              type: 'object',
              description: 'attach-puzzle (required): the per-lockType field set (e.g. password-lock: { password }, number-lock: { code }, mastermind-lock: { solution, pipOptions }). Field names vary per lockType — see skill references for the full per-type catalog.',
              additionalProperties: true,
            },
            jsCode: { type: 'string', description: 'set-solve-macro: raw JS to run as new Function("object","user",code) on unlock — XOR with macroName.' },
            macroName: { type: 'string', description: 'set-solve-macro: a world Macro name to execute on unlock (resolved to game.macros.getName(...).execute()) — XOR with jsCode.' },
            confirm: { type: 'boolean', description: 'remove-puzzle/force-unlock: must be true to proceed — omitted/false returns PUZZLE_LOCKS_CONFIRM_REQUIRED.' },
          },
          required: ['action', 'documentUuid'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-puzzle-locks action', { action });
    if (!(PUZZLE_LOCKS_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<PuzzleLocksResult>('module-puzzle-locks', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-puzzle-locks', msg);
      return this.errorResponse(action, msg);
    }
  }
}
