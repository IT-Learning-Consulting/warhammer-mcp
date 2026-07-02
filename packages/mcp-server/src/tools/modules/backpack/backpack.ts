// Module Integration v2 Phase 12 — module-backpack MCP tool (Backpack v1.2.5, lobowarewolf).
//
// Always-registered umbrella. The foundry-module handler guards on backpack being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active backpack.
//
// 10 actions over a per-actor item storage overlay that lives ENTIRELY in world settings (not embedded
// items, not actor.items — invisible to /foundry-item). Anchors: DP-15 (concrete this.query<BackpackResult>
// — never <any>); R2.4 (errors via errorResponse). formatResult exhaustiveness is real — NO `as never`
// suppression ([[feedback_single_action_module_umbrella_exhaustiveness]]).
//
// CONFIRM-GATE (CCR-4): reset is destructive (wipes per-user limit records + the global default) and
// requires confirm:true.
//
// ATOMIC ROUND-TRIP: add-item and remove-item each write BOTH the world-settings storage AND the actor's
// embedded-item collection in one call (additive-step-first ordering; each side independently verified;
// a 2nd-side failure rolls back the 1st). See the tool description below for the caveat.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { BACKPACK_ACTIONS, type BackpackResult } from './schemas.js';

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: BackpackResult): string {
  const p = 'module-backpack';
  switch (d.action) {
    case 'read':
      return 'actorId' in d
        ? `${p}.read: actor ${d.actorId} — ${d.items.filter(Boolean).length} item(s), limit ${d.limit}.`
        : `${p}.read: default limit ${d.defaultLimit}, ${d.players.length} player(s), ${d.userRecords.length} user record(s).`;
    case 'add-item':
      return `${p}.add-item: deposited into actor ${d.actorId} slot ${d.slotIndex} ("${d.item.name}").`;
    case 'remove-item':
      return `${p}.remove-item: withdrawn from actor ${d.actorId} slot ${d.slotIndex} to actor item ${d.itemId}.`;
    case 'move-item':
      return `${p}.move-item: actor ${d.actorId} slot ${d.fromSlot} → ${d.toSlot}.`;
    case 'set-limit':
      return d.target === 'actor'
        ? `${p}.set-limit: actor ${d.actorId} limit set to ${d.limit}.`
        : `${p}.set-limit: default limit set to ${d.limit}.`;
    case 'set-user-limit':
      return `${p}.set-user-limit: user ${d.userId} limit set to ${d.limit}.`;
    case 'remove-user':
      return `${p}.remove-user: user ${d.userId} record removed.`;
    case 'lock-slots':
      return `${p}.lock-slots: actor ${d.actorId} leaderSlot ${d.leaderSlot} locked for item ${d.lock.itemId}.`;
    case 'clear-locks':
      return `${p}.clear-locks: actor ${d.actorId} slot lock(s) cleared.`;
    case 'reset':
      return `${p}.reset: per-user backpack limit records cleared; default limit reset to 5.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleBackpackToolOptions extends BaseToolOptions {}

export class ModuleBackpackTool extends BaseTool {
  constructor(options: ModuleBackpackToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-backpack', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-backpack',
        title: 'Backpack integration — per-actor item storage overlay',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Backpack module — a per-actor item storage overlay that lives ENTIRELY in world settings, invisible to actor.items / /foundry-item. Items deposited into a backpack are removed from the actor's embedded items and stored as plain POJOs; withdrawing re-creates them as embedded items.
Conditional: returns MODULE_NOT_ACTIVE when backpack is absent/inactive. Pre-flight: module-probe.is-active backpack.

ATOMIC ROUND-TRIP: add-item and remove-item each perform BOTH the storage write AND the actor embedded-item create/delete in ONE call, additive-step-first (add-item: storage-add then actor-delete; remove-item: actor-create then storage-remove) — a failure on the 2nd step rolls back the 1st, so a failure DUPLICATES the item (recoverable) rather than losing it. Both sides are independently verified.

OCCUPIED-SLOT GUARD: add-item (explicit slotIndex) and move-item (toSlot) reject an occupied target slot with BACKPACK_SLOT_OCCUPIED unless overwrite:true is passed — the module's own storage layer has NO guard of its own and will silently clobber.

RESET BLAST RADIUS (honest, narrower than the name implies): reset wipes ONLY the per-user backpack limit records and resets the GLOBAL DEFAULT slot limit to 5 — it does NOT touch stored items, per-actor limits, or slot locks. CONFIRM-GATED (confirm:true required, else BACKPACK_CONFIRM_REQUIRED).

10 actions:
read (ungated): { actorId? } — actorId present: per-actor { items, limit, locks }; absent: global { defaultLimit, players, userRecords }.
writes (GM-only): add-item { actorId, itemId, slotIndex?, overwrite? } · remove-item { actorId, slotIndex } · move-item { actorId, fromSlot, toSlot, overwrite? } · set-limit { target: "actor"|"default", actorId?, limit } (5..100, self-imposed — the data layer has no max of its own) · set-user-limit { userId, limit } (5..100) · remove-user { userId } · lock-slots { actorId, leaderSlot, itemId, length? OR indices? — exactly one required } · clear-locks { actorId, itemId? OR leaderSlot? — exactly one required }.
writes (GM-only, CONFIRM-GATED — destructive): reset { confirm:true }.

Example: { action: "add-item", actorId: "abc123", itemId: "def456" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...BACKPACK_ACTIONS], description: 'Backpack action to perform.' },
            actorId: { type: 'string', description: 'read (optional filter)/add-item/remove-item/move-item/lock-slots/clear-locks: the target actor id. set-limit: required when target is "actor".' },
            itemId: { type: 'string', description: 'add-item: the actor-embedded item id to deposit. lock-slots: the item id the lock is associated with. clear-locks: XOR with leaderSlot — clears every lock entry referencing this item id.' },
            slotIndex: { type: 'integer', minimum: 0, description: 'add-item: target backpack slot (omit for first-free/append). remove-item: the backpack slot to withdraw from (required).' },
            overwrite: { type: 'boolean', description: 'add-item/move-item: pass true to replace an occupied target slot — omitted/false returns BACKPACK_SLOT_OCCUPIED on a collision.' },
            fromSlot: { type: 'integer', minimum: 0, description: 'move-item: source backpack slot (required).' },
            toSlot: { type: 'integer', minimum: 0, description: 'move-item: destination backpack slot (required).' },
            target: { type: 'string', enum: ['actor', 'default'], description: 'set-limit: whether to set a per-actor override (requires actorId) or the global default.' },
            limit: { type: 'integer', minimum: 5, maximum: 100, description: 'set-limit/set-user-limit: new slot cap, self-imposed range 5..100 (the module\'s own data layer enforces only the 5 minimum).' },
            userId: { type: 'string', description: 'set-user-limit/remove-user: the target user id.' },
            leaderSlot: { type: 'integer', minimum: 0, description: 'lock-slots: the anchor slot the lock is keyed on (required). clear-locks: XOR with itemId — clears the lock entry at this leaderSlot.' },
            length: { type: 'integer', minimum: 1, description: 'lock-slots: contiguous slot-run length starting at leaderSlot — XOR with indices (exactly one required).' },
            indices: { type: 'array', items: { type: 'integer', minimum: 0 }, description: 'lock-slots: explicit non-contiguous slot indices to lock — XOR with length (exactly one required).' },
            confirm: { type: 'boolean', description: 'reset: must be true to actually wipe the per-user limit records + default limit — omitted/false returns BACKPACK_CONFIRM_REQUIRED.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-backpack action', { action });
    if (!(BACKPACK_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<BackpackResult>('module-backpack', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-backpack', msg);
      return this.errorResponse(action, msg);
    }
  }
}
