// Module Integration v1 Phase 7 — module-access-control MCP tool.
//
// Umbrella tool exposing the access-control bundle: LocknKey (lock/key/DC/jam/passkey)
// + LockView (canvas pan/zoom/boundingBox locks, forced viewport, autoscale). 27 actions.
//
// Conditional: returns MODULE_NOT_ACTIVE when the relevant member is absent/inactive.
//   LocknKey actions guard 'LocknKey'; LockView actions guard 'LockView'; get-lock-state
//   routes by input shape (documentId → LocknKey, else LockView).
//
// libWrapper (DEPENDENCY_GATED): LockView lock ENFORCEMENT needs lib-wrapper. Lock-write
//   actions WRITE the flag + return libWrapperActive — they do NOT hard-block.
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any>.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - F03: generic formatter emits the full returned payload (no silent field drops).
//   - dossiers/access-control.md + modules-docs/{LocknKey,LockView}/capability-manifest.json.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleAccessControlInput } from '@foundry-mcp/shared';

type ModuleAccessControlArgs = z.infer<typeof ModuleAccessControlInput>;

const TOOL_NAME = 'module-access-control' as const;

// Typed result envelope (DP-15 — never <any> on this.query). The bundle returns a
// heterogeneous payload per action; a permissive record keeps the contract typed while
// the generic formatter emits every field (F03).
type AccessControlResult = Record<string, unknown>;

export interface ModuleAccessControlToolOptions extends BaseToolOptions {}

export class ModuleAccessControlTool extends BaseTool {
  constructor(options: ModuleAccessControlToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-access-control', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        // String literal (not TOOL_NAME const) so _tools/audit-skills.mjs --check resolve
        // regex-scans `name: '<literal>'`. Matches the module-* convention.
        name: 'module-access-control',
        title: 'Access control — LocknKey (locks/keys) + LockView (view locks)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Access control umbrella for WFRP4e. Door/object locks + keys (LocknKey) and
canvas view control — pan/zoom/boundingBox locks, forced viewport, autoscale (LockView).
Conditional: returns MODULE_NOT_ACTIVE per member when the relevant module is absent/inactive.
Pre-flight: use get-bundle-status to check which members (and lib-wrapper) are active.

LockView lock ENFORCEMENT requires lib-wrapper active (DEPENDENCY_GATED). Lock-write actions
still WRITE the scene flag (it persists + enforces once lib-wrapper is on) and return
libWrapperActive — they do NOT fail when lib-wrapper is off.

LocknKey corrections: WFRP4e has NO default break/pickpocket formula (REPAIR_GATED — GM must
configure). Key item type defaults to "cargo"; recommend the KeyItemtype setting = "trapping".
LockView corrections: there is NO token-lock and NO zoom min/max — LockView is canvas-view only.

Use this when:
- Configuring a lock (DC, jam state, passkey, key linkage) on an EXISTING door Wall, Token, or Tile.
- Creating and linking a key Item to a lock, or granting keyless/identity-based access.
- Resolving a player's lockpick/break/passkey attempt and applying the GM-adjudicated outcome.
- Locking/unlocking a scene's pan, zoom, or bounding box, or forcing a player's viewport to a specific position.
- Checking which access-control bundle members (LocknKey, LockView, lib-wrapper) are currently active before dispatching a member-specific action.

— BUNDLE —
- get-bundle-status                         — report active state of LocknKey, LockView, lib-wrapper

— LocknKey (door/object locks + keys; requires LocknKey active) —
- get-lock-state    { documentId, documentType:'wall'|'token'|'tile' } — read lock metadata
- configure-lock    { documentId, documentType, lockable?, locked?, startLocked?, pickDC?, breakDC?, ccDC?, jammed?, lockOnClose?, confirm? } — batch-configure a lock (locked-state writes wall.ds for doors; gated on isLockable)
- configure-lp-attempts { documentId, documentType, attempts?, attemptsMax?, requiredSuccesses?, reset? } — lockpick attempts / multi-success
- create-key        { keyName, lockDocumentId?, lockDocumentType?, keyImage?, keyFolder?, removeOnUse? } — create + link a key Item (api.createNewcustomKey)
- assign-key        { lockDocumentId, lockDocumentType, keyItemId?, keyId?, identityIds?, confirm? } — link an existing key (linkKeyLock) and/or grant identity-key access
- set-passkey       { documentId, documentType, passkey, changeable? } — set a password/PIN
- set-custom-popup  { documentId, documentType, popups:{ '0'..'5': msg } } — custom lock messages (6 slots)
- grant-free-circumvent { tokenId, charges? } — grant/remove free-circumvent charges (Knock spell); charges:0 removes
- circumvent-lock   { documentId, documentType, method:'pick'|'break'|'custom'|'key'|'passkey', outcome?, keyItemId?, passkey?, confirm:true } — apply a circumvention via public LnKFlags: pick/break/custom apply a GM-resolved outcome (success→unlock, failure→reduce attempts, critical-failure→jam); key/passkey unlock on a deterministic match. (Re-implements outcomes; LnK's own chat/crit/sound pipeline is client-internal.) (SWC)
- transfer-items    { sourceId, targetId, itemInfos:[{id,quantity?}], confirm:true } — GM-auth item transfer, bypasses pickpocket (SWC)

— LockView (canvas view control; requires LockView active) —
- get-lock-state    { sceneId? }            — read view-lock state (NO documentId → routes to LockView)
- get-scene-flags   { sceneId?, key? }      — read flags.LockView (locks/ui/sidebar/avDock/autoscale/forceInitialView)
- set-pan-lock      { sceneId?, locked }    — lock/unlock panning (persists + broadcasts)
- set-zoom-lock     { sceneId?, locked }    — lock/unlock zoom (binary — no min/max)
- set-bounding-box-lock { sceneId?, locked, drawingId?, mode?:'disabled'|'owned'|'always' } — scene boundingBox lock + per-Drawing mode
- set-autoscale     { sceneId?, mode:'off'|'horizontal'|'vertical'|'autoInside'|'autoOutside'|'physical' }
- set-force-initial-view { sceneId?, enabled } — pan to scene.initial on load
- set-ui-hide       { sceneId?, ui }        — UI hide config (GUIDANCE_ONLY for the DOM effect)
- set-sidebar-behavior { sceneId?, sceneLoad?, exclude?, blacken? }
- trigger-initial-view { sceneId? }         — force initial view now
- trigger-autoscale { sceneId? }            — run autoscale now
- broadcast-refresh {}                      — push LockView refresh to all clients
- pull-static-users { sceneId? }            — force static users to a scene
- force-viewport-absolute { userId, position:{x,y}, width?, confirm:true } — move a player's camera (SWC)
- force-viewport-relative { userId, position:{x?,y?,scale?}, confirm:true } — relative camera move (SWC)
- clone-gm-view     { userIds, pan?, zoom?, confirm:true } — push GM view to players (SWC)
- set-view-dialog   { userIds, data, confirm:true } — raw dialog-style view push (SWC)
- set-view-with-pan-mode { userIds, pan?, zoom?, coordinates?, gridSpaces?, scale?, confirm:true } — named pan/zoom modes (SWC)

GM required for all write actions. Forced-viewport + circumvent + transfer require confirm:true.

Do NOT use this tool to create the underlying Wall/Token/Tile — use the \`scene\`/\`tile\` (core) document tools for that. module-access-control only configures locks and view-control state on documents that ALREADY EXIST; it never creates or deletes a placeable.

Performance Notes:
- All actions return a small fixed-shape status/result object (bundle status, lock metadata, or a write confirmation) — no response modes, no pagination; cost does not scale with scene or world size.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'get-bundle-status',
                // LocknKey
                'get-lock-state', 'configure-lock', 'configure-lp-attempts', 'create-key',
                'assign-key', 'set-passkey', 'set-custom-popup', 'grant-free-circumvent',
                'circumvent-lock', 'transfer-items',
                // LockView
                'get-scene-flags', 'set-pan-lock', 'set-zoom-lock', 'set-bounding-box-lock',
                'set-autoscale', 'set-force-initial-view', 'set-ui-hide', 'set-sidebar-behavior',
                'trigger-initial-view', 'trigger-autoscale', 'broadcast-refresh', 'pull-static-users',
                'force-viewport-absolute', 'force-viewport-relative', 'clone-gm-view',
                'set-view-dialog', 'set-view-with-pan-mode',
              ],
              description: 'Access-control action to perform.',
            },
            // LocknKey fields
            documentId: { type: 'string', description: '[LnK] Wall/Token/Tile document ID. For get-lock-state, present → LocknKey, absent → LockView.' },
            documentType: { type: 'string', enum: ['wall', 'token', 'tile'], description: '[LnK] Document kind.' },
            lockable: { type: 'boolean', description: '[configure-lock] Make the object a lock / disable it.' },
            locked: { type: 'boolean', description: '[configure-lock/set-*-lock] Locked state.' },
            startLocked: { type: 'boolean', description: '[configure-lock] Start locked when making lockable.' },
            pickDC: { type: 'number', description: '[configure-lock] Pick DC (-1 = impassable).' },
            breakDC: { type: 'number', description: '[configure-lock] Break DC (-1 = impassable).' },
            ccDC: { type: 'number', description: '[configure-lock] Custom-check DC.' },
            jammed: { type: 'boolean', description: '[configure-lock] Jam / unjam the lock.' },
            lockOnClose: { type: 'boolean', description: '[configure-lock] Auto-lock door on close.' },
            attempts: { type: 'number', description: '[configure-lp-attempts] Current LP attempts (-1 = unlimited).' },
            attemptsMax: { type: 'number', description: '[configure-lp-attempts] Max LP attempts.' },
            requiredSuccesses: { type: 'number', description: '[configure-lp-attempts] Successes needed (multi-success lock).' },
            reset: { type: 'boolean', description: '[configure-lp-attempts] Reset attempts to max.' },
            lockDocumentId: { type: 'string', description: '[create-key/assign-key] Lock document ID.' },
            lockDocumentType: { type: 'string', enum: ['wall', 'token', 'tile'], description: '[create-key/assign-key] Lock document kind.' },
            keyName: { type: 'string', description: '[create-key] Name for the new key Item.' },
            keyImage: { type: 'string', description: '[create-key] Key icon path.' },
            keyFolder: { type: 'string', description: '[create-key] Folder for the key Item.' },
            removeOnUse: { type: 'boolean', description: '[create-key] Consume on use.' },
            keyItemId: { type: 'string', description: '[assign-key] Existing key Item ID to link.' },
            keyId: { type: 'string', description: '[assign-key] Explicit shared key ID.' },
            identityIds: { type: 'array', items: { type: 'string' }, description: '[assign-key] Token/actor/player IDs for keyless access.' },
            passkey: { type: 'string', description: '[set-passkey] Password/PIN.' },
            changeable: { type: 'boolean', description: '[set-passkey] Players can change the passkey.' },
            popups: { type: 'object', description: "[set-custom-popup] Map of slot index '0'..'5' → message." },
            tokenId: { type: 'string', description: '[grant-free-circumvent] Token document ID.' },
            charges: { type: 'number', description: '[grant-free-circumvent] Charges (0 removes).' },
            method: { type: 'string', enum: ['pick', 'break', 'custom', 'key', 'passkey'], description: '[circumvent-lock] Circumvention method. pick/break/custom apply a GM-resolved outcome; key/passkey check a deterministic match.' },
            outcome: { type: 'string', enum: ['success', 'failure', 'critical-failure'], description: '[circumvent-lock pick/break/custom] GM-resolved outcome: success→unlock, failure→reduce LP attempts, critical-failure→jam.' },
            considerKeyName: { type: 'boolean', description: '[circumvent-lock method:key] Also accept the key Item name as an ID.' },
            characterId: { type: 'string', description: '[circumvent-lock] Acting actor ID (informational).' },
            rollResult: { type: 'number', description: '[circumvent-lock] Pre-computed roll total (informational).' },
            diceResult: { type: 'number', description: '[circumvent-lock] Raw dice result (informational).' },
            sourceId: { type: 'string', description: '[transfer-items] Source actor/token ID.' },
            targetId: { type: 'string', description: '[transfer-items] Target actor/token ID.' },
            itemInfos: { type: 'array', items: { type: 'object' }, description: '[transfer-items] [{id, quantity?}].' },
            // LockView fields
            sceneId: { type: 'string', description: '[LockView] Scene ID/UUID; defaults to active scene.' },
            key: { type: 'string', description: '[get-scene-flags] Specific LockView flag key.' },
            drawingId: { type: 'string', description: '[set-bounding-box-lock] Drawing ID for per-Drawing mode.' },
            mode: { type: 'string', description: '[set-bounding-box-lock/set-autoscale] mode value.' },
            enabled: { type: 'boolean', description: '[set-force-initial-view] Enable forceInitialView.' },
            ui: { type: 'object', description: '[set-ui-hide] UI hide config object.' },
            sceneLoad: { type: 'string', enum: ['noChange', 'collapse', 'expand'], description: '[set-sidebar-behavior] Sidebar on-load behavior.' },
            exclude: { type: 'boolean', description: '[set-sidebar-behavior] Exclude sidebar from calcs.' },
            blacken: { type: 'boolean', description: '[set-sidebar-behavior] Opaque sidebar.' },
            userId: { type: 'string', description: '[force-viewport-*] Target user ID.' },
            userIds: { type: 'array', items: { type: 'string' }, description: '[clone-gm-view/set-view-*] Target user IDs.' },
            position: { type: 'object', description: '[force-viewport-*] Viewport position.' },
            width: { type: 'number', description: '[force-viewport-absolute] Viewport width.' },
            pan: { oneOf: [{ type: 'boolean' }, { type: 'string' }], description: '[clone-gm-view: boolean | set-view-with-pan-mode: mode string]. (CCR-V8: union typed via oneOf)' },
            zoom: { oneOf: [{ type: 'boolean' }, { type: 'string' }], description: '[clone-gm-view: boolean | set-view-with-pan-mode: mode string]. (CCR-V8: union typed via oneOf)' },
            coordinates: { type: 'object', description: '[set-view-with-pan-mode] {x?,y?} for move modes.' },
            gridSpaces: { type: 'object', description: '[set-view-with-pan-mode] {x?,y?} grid offset.' },
            scale: { type: 'number', description: '[set-view-with-pan-mode] Explicit zoom scale.' },
            data: { type: 'object', description: '[set-view-dialog] Raw setViewDialog payload.' },
            // Confirm gate
            confirm: { type: 'boolean', description: 'Required true for circumvent-lock, transfer-items, and all forced-viewport actions (CCR-4).' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: ModuleAccessControlArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info(`Executing ${TOOL_NAME} action`, { action });
    try {
      const data = await this.query<AccessControlResult>(TOOL_NAME, args);
      return { content: [{ type: 'text' as const, text: this.formatResult(action, data) }], structuredContent: data as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE) || msg.includes(ErrorTokens.MODULE_DEPENDENCY_NOT_ACTIVE)) {
        return moduleNotActiveContent(TOOL_NAME, msg);
      }
      return this.errorResponse(`${TOOL_NAME}/${action}`, msg);
    }
  }

  // F03: emit the full returned payload so no field is silently dropped. The bundle's
  // per-action shapes are heterogeneous; a structured JSON render is the honest format.
  private formatResult(action: string, data: AccessControlResult): string {
    if (action === 'get-bundle-status') {
      const members = (data.members as Array<{ id: string; active: boolean; title: string | null; version: string | null }>) ?? [];
      const lines = members.map((m) => `- ${m.id}${m.title ? ` (${m.title}${m.version ? ` v${m.version}` : ''})` : ''}: ${m.active ? 'ACTIVE' : 'INACTIVE'}`);
      const lw = data.libWrapper as { active?: boolean } | undefined;
      lines.push(`- lib-wrapper: ${lw?.active ? 'ACTIVE' : 'INACTIVE'} (LockView enforcement gate)`);
      return `module-access-control bundle status:\n${lines.join('\n')}`;
    }
    return `${TOOL_NAME}.${action}:\n${JSON.stringify(data, null, 2)}`;
  }
}
