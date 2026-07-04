// Module Integration v2 Phase 4 — module-perceptive MCP tool (Perceptive v6.0.4, saibot).
//
// Always-registered umbrella. The foundry-module handler guards on perceptive being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw →
// moduleNotActiveContent(). The ONE exception is wfrp-stealth-delegate, which the handler FAILS OPEN
// (returns success with applied:false) so the WFRP host flow is unchanged (CCR-9) — it never reaches
// the moduleNotActiveContent path. Pre-flight with module-probe.is-active perceptive.
//
// 8 actions: set-stealth / set-spotting / set-spottable / reset-stealth (token flag writes; DP-16
// verified, raw-awaited / properly-awaited-API — no settle) + peek-door / move-door (GM-direct door
// ops; LIVE-SMOKE-ONLY; create persistent aux walls) + wfrp-stealth-delegate (GM-supplied SL →
// PPDC/APDC; fail-open) + get-state (read).
// Anchors: DP-15 (concrete this.query<T> per action — never <any>); R2.4 (errors via errorResponse).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { PERCEPTIVE_ACTIONS } from './schemas.js';
import { z } from 'zod';
import { PerceptiveInput } from '@foundry-mcp/shared';

type PerceptiveArgs = z.infer<typeof PerceptiveInput>;
import type {
  PerceptiveStealthResult,
  PerceptiveSpottingResult,
  PerceptiveSpottableResult,
  PerceptiveResetResult,
  PerceptivePeekDoorResult,
  PerceptiveMoveDoorResult,
  PerceptiveDelegateResult,
  PerceptiveStateResult,
} from './schemas.js';

// ── Per-action formatters ─────────────────────────────────────────────────────

function formatStealth(d: PerceptiveStealthResult): string {
  return `module-perceptive.set-stealth: token ${d.tokenName} (${d.tokenId}) stealth ${d.stealthing ? 'ENABLED' : 'disabled'}.`;
}
function formatSpotting(d: PerceptiveSpottingResult): string {
  return `module-perceptive.set-spotting: token ${d.tokenName} (${d.tokenId}) spotted by ${d.spotterId} — SpottedbyFlag now has ${d.spottedBy.length} spotter(s).`;
}
function formatSpottable(d: PerceptiveSpottableResult): string {
  const dcs = `PPDC=${d.ppdc ?? '—'} APDC=${d.apdc ?? '—'}`;
  return `module-perceptive.set-spottable: token ${d.tokenName} (${d.tokenId}) canbeSpotted=${d.canbeSpotted}, ${dcs}.`;
}
function formatReset(d: PerceptiveResetResult): string {
  return `module-perceptive.reset-stealth: token ${d.tokenName} (${d.tokenId}) reset — SpottedbyFlag cleared, stealth off.`;
}
function formatPeekDoor(d: PerceptivePeekDoorResult): string {
  return `module-perceptive.peek-door: door ${d.doorId} lock-peek dispatched for ${d.tokenIds.length} token(s). ${d.note}`;
}
function formatMoveDoor(d: PerceptiveMoveDoorResult): string {
  return `module-perceptive.move-door: door ${d.doorId} moved (dir=${d.direction}, type=${d.doorMovementType ?? 'unset'}). ${d.note}`;
}
function formatDelegate(d: PerceptiveDelegateResult): string {
  if (!d.applied) {
    return `module-perceptive.wfrp-stealth-delegate: ${d.message ?? '[Perceptive inactive] SL not written (fail-open).'}`;
  }
  return `module-perceptive.wfrp-stealth-delegate: WFRP Stealth SL ${d.sl} → token ${d.tokenName} PPDC=${d.ppdc} APDC=${d.apdc}.`;
}
function formatState(d: PerceptiveStateResult): string {
  return (
    `module-perceptive.get-state: token ${d.tokenName} (${d.tokenId}) — stealthing=${d.stealthing}, ` +
    `spottedBy=${d.spottedBy.length}, PPDC=${d.ppdc ?? '—'}, APDC=${d.apdc ?? '—'}, ` +
    `canbeSpotted=${d.canbeSpotted}, lightLevel=${d.lightLevel ?? '—'}.`
  );
}

export interface ModulePerceptiveToolOptions extends BaseToolOptions {}

export class ModulePerceptiveTool extends BaseTool {
  constructor(options: ModulePerceptiveToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-perceptive', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-perceptive',
        title: 'Perceptive integration — stealth, spotting, spotting-DCs, and door peek/move',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Perceptive module (WFRP4e) stealth / spotting / door surface — set a token's perceptive stealth, mark it spotted, set its spotting DCs (PPDC/APDC), reset it, peek/move doors, and bridge a WFRP Stealth test SL to the spotting DCs. State persists as flags.perceptive.* on the Token/Wall (server-verifiable).
Conditional: returns MODULE_NOT_ACTIVE when perceptive is absent/inactive — EXCEPT wfrp-stealth-delegate, which FAILS OPEN (returns a soft message, applied:false) so a WFRP stealth flow is never blocked.
Pre-flight: module-probe.is-active perceptive before using this tool.

DOOR OPS need a GM (warhammer-mcp runs as GM) — peek-door/move-door call Perceptive's GM-direct path (no socket, no confirm dialog). They create persistent invisible aux Wall docs; delete-before-recreate to avoid orphan accumulation.

8 actions:
set-stealth { tokenId|tokenName, sceneId?, stealthing } — set the PerceptiveStealthingFlag (raw awaited write; verified).
set-spotting { tokenId|tokenName, sceneId?, spotterId|spotterName } — add the spotter to the target's SpottedbyFlag.
set-spottable { tokenId|tokenName, sceneId?, canbeSpotted, ppdc?, apdc? } — set canbeSpotted + optional spotting DCs.
reset-stealth { tokenId|tokenName, sceneId? } — clear lingering AP + SpottedbyFlag + stealth flag.
peek-door { doorId, tokenIds[], sceneId? } — lock-peek a door for the given tokens (LIVE-SMOKE-ONLY).
move-door { doorId, direction, speed?, sceneId? } — swing/slide a door (direction +1/-1; LIVE-SMOKE-ONLY).
wfrp-stealth-delegate { tokenId|tokenName, sceneId?, sl } — write PPDCFlag=APDCFlag=sl from a WFRP Stealth test SL (GM-supplied; fail-open when inactive).
get-state { tokenId|tokenName, sceneId? } — read stealthing / spottedBy / PPDC / APDC / canbeSpotted / lightLevel.

Token targets accept id OR name. sceneId defaults to the active scene. Doors are addressed by Wall id (walls have no name).
Example: { action: "set-spottable", tokenName: "Sneaky Thief", canbeSpotted: true, ppdc: 40, apdc: 30 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [...PERCEPTIVE_ACTIONS],
              description: 'Perceptive action to perform.',
            },
            tokenId: { type: 'string', description: 'Target token id (token-flag actions). Provide tokenId or tokenName.' },
            tokenName: { type: 'string', description: 'Target token name (token-flag actions). Provide tokenId or tokenName.' },
            sceneId: { type: 'string', description: 'Scene that owns the token/door. Omit for the active scene.' },
            stealthing: { type: 'boolean', description: 'set-stealth: true to enable perceptive stealth, false to disable.' },
            spotterId: { type: 'string', description: 'set-spotting: the spotting token id.' },
            spotterName: { type: 'string', description: 'set-spotting: the spotting token name.' },
            canbeSpotted: { type: 'boolean', description: 'set-spottable: whether the token can be spotted.' },
            ppdc: { type: 'number', description: 'Passive perception DC (set-spottable).' },
            apdc: { type: 'number', description: 'Active perception DC (set-spottable).' },
            doorId: { type: 'string', description: 'peek-door/move-door: the Wall (door) id.' },
            tokenIds: { type: 'array', items: { type: 'string' }, description: 'peek-door: the peeking token ids.' },
            direction: { type: 'number', description: 'move-door: swing/slide direction (+1 / -1).' },
            speed: { type: 'number', description: 'move-door: optional speed multiplier (default 1).' },
            sl: { type: 'number', description: 'wfrp-stealth-delegate: the WFRP Stealth test Success Level to write to PPDC/APDC.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: PerceptiveArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-perceptive action', { action });
    switch (action) {
      case 'set-stealth': return this.run<PerceptiveStealthResult>(action, rawArgs, formatStealth);
      case 'set-spotting': return this.run<PerceptiveSpottingResult>(action, rawArgs, formatSpotting);
      case 'set-spottable': return this.run<PerceptiveSpottableResult>(action, rawArgs, formatSpottable);
      case 'reset-stealth': return this.run<PerceptiveResetResult>(action, rawArgs, formatReset);
      case 'peek-door': return this.run<PerceptivePeekDoorResult>(action, rawArgs, formatPeekDoor);
      case 'move-door': return this.run<PerceptiveMoveDoorResult>(action, rawArgs, formatMoveDoor);
      case 'wfrp-stealth-delegate': return this.run<PerceptiveDelegateResult>(action, rawArgs, formatDelegate);
      case 'get-state': return this.run<PerceptiveStateResult>(action, rawArgs, formatState);
      default:
        return this.errorResponse('unknown', `unknown action: ${action}`);
    }
  }

  /** Run one action: typed query + format, intercept MODULE_NOT_ACTIVE, else BaseTool.errorResponse. */
  private async run<T>(action: string, args: Record<string, unknown>, fmt: (d: T) => string) {
    try {
      const data = await this.query<T>('module-perceptive', args);
      return { content: [{ type: 'text' as const, text: fmt(data) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-perceptive', msg);
      return this.errorResponse(action, msg);
    }
  }
}
