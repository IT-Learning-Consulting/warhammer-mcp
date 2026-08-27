// DIALOG-PATH: DIALOG_INVESTIGATED — in-file comment confirms the wfrp4e basic-skills-dialog does NOT pop on the GM client for the create-pile actor path (item-piles.js:84719); no other Dialog/DialogV2 call is reachable from this file's write paths.
// Module Integration v1 Phase 3 — module-itempiles: pile lifecycle + container state + contents read.
// mcp_code_quality_v2 Phase C3 (19a split): extracted verbatim from item-piles.ts — zero
// behavioral change (behavior freeze HC3/HC13).
//
// GATE-SUPPRESS[success-semantics]: systemic_bug_class_prevention v2 Phase 1 (task 5.1) touches only
// handleDeletePile's confirm-gate consolidation onto requireConfirm() — this file's outcome-field
// retrofit (HC4/check-outcome-field allowlist membership) is out of scope; owned by v2 Phase 3 (C2).

import { ErrorTokens, type ModuleItempilesInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';
import { normalizeItemsArray, validateTokenUuid } from './catalog.js';
import { getItemPilesAPI, notPersisted, resolveToTokenObject, gmRequired, activeGmRequired, bankerAuctioneerCheck } from './helpers.js';
import { falseReturnEnvelope } from './flow.js';
import { boundList } from '../../../services/bounded-response.js';
import { requireConfirm } from '../../../services/shared/destructive-confirm.js';
import { runWriteSteps, type WriteStep, type StepIds } from '../../../services/shared/resume-boundary.js';

// ── 3A: Pile lifecycle ────────────────────────────────────────────────────────

type CreatePileInput = Extract<ModuleItempilesInputType, { action: 'create-pile' }>;

/** systemic_bug_class_prevention v2 Phase 2 (task 2.4): attaches a runWriteSteps() undo-failure
 *  warning onto an error envelope so it reaches the caller — never console-only (the exact
 *  BUG-779 residual defect this retrofit closes; pre-retrofit the rollback-of-rollback only
 *  `console.warn`'d, see resume-boundary.ts's own header). No-op when there are no warnings, so
 *  every ordinary refusal/verify-failure envelope stays byte-identical to pre-retrofit. */
function withWarnings<T extends Envelope<unknown>>(env: T, warnings: string[]): T & { warnings?: string[] } {
  return warnings.length > 0 ? { ...env, warnings } : env;
}

export async function handleCreatePile(input: CreatePileInput): Promise<Envelope<unknown> & { warnings?: string[] }> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  const typeErr = bankerAuctioneerCheck(input.type);
  if (typeErr) return typeErr;

  // L-5: defensive pre-check
  if (!input.sceneId) {
    return { success: false, error: 'MISSING_SCENE_ID: sceneId is required for create-pile (game.user.viewedScene is null server-side)' };
  }

  // BUG-779 (systemic_bug_class_prevention v2 Phase 2, task 2.4): the tracked-create + rollback
  // pattern that used to live here as a hand-rolled `createdActor` local + 3 scattered
  // `rollbackCreatedActor()` call sites is now expressed as a `runWriteSteps()` sequence — the
  // exact generalization this handler was the reference implementation for (see
  // resume-boundary.ts's own file header, which cites this function by name/line). Refusal/
  // rollback semantics, every response field, the dedicatedPile flag, and handleDeletePile's
  // cascade + confirm-preview below are all unchanged — only the rollback wiring moved.
  let dedicatedActor: any = null;
  let tokenUuid: string | null = null;
  let actorUuid: string | null = null;
  let flagData: unknown = null;
  let refused = false;
  let notPersistedMessage: string | null = null;
  let genericErrorMessage: string | null = null;

  try {
    const API = getItemPilesAPI();

    // Build itemPileFlags from pile-config fields (item-piles.js:97847 — these MUST be nested here;
    // flat top-level options are silently ignored by createItemPile).
    const itemPileFlags: Record<string, unknown> = {};
    const pileType = input.type ?? 'pile';
    itemPileFlags['type'] = pileType;
    // NOTE: do NOT set enabled — the API stamps enabled:true itself (item-piles.js:84707)
    if (input.locked !== undefined) itemPileFlags['locked'] = input.locked;
    if (input.closed !== undefined) itemPileFlags['closed'] = input.closed;
    if (input.closedImage) itemPileFlags['closedImage'] = input.closedImage;
    if (input.openedImage) itemPileFlags['openedImage'] = input.openedImage;
    if (input.lockedImage) itemPileFlags['lockedImage'] = input.lockedImage;
    if (input.emptyImage) itemPileFlags['emptyImage'] = input.emptyImage;
    if (input.lockedSound) itemPileFlags['lockedSound'] = input.lockedSound;
    if (input.closedSound) itemPileFlags['closedSound'] = input.closedSound;
    if (input.openedSound) itemPileFlags['openedSound'] = input.openedSound;

    const options: Record<string, unknown> = {
      sceneId: input.sceneId,
      itemPileFlags,
    };

    if (input.position) options['position'] = input.position;
    if (input.items) options['items'] = normalizeItemsArray(input.items);

    // tokenName → tokenOverrides.name (item-piles.js:97845)
    if (input.tokenName) options['tokenOverrides'] = { name: input.tokenName };

    // createDedicatedActor / pileActorName routing (item-piles.js:97849-97884):
    //   createActor:true  → create new actor (actor = name for the new actor)
    //   actor (string)    → resolve as existing actor UUID/name
    //   neither           → use shared Default Item Pile actor
    if (!input.createDedicatedActor && input.pileActorName) {
      options['actor'] = input.pileActorName;
    }

    const steps: WriteStep[] = [];

    if (input.createDedicatedActor) {
      steps.push({
        label: 'create-dedicated-actor',
        async run(): Promise<StepIds> {
          // Pre-create the dedicated actor with skipItems:true so the wfrp4e ActorWFRP4e._preCreate
          // "add basic skills + money?" DialogV2 does NOT pop on the GM client. item-piles.js:84719
          // calls Actor.create(actorData) with NO options, so we cannot forward skipItems through
          // createItemPile — pre-create here + hand it to item-piles as an existing actor instead.
          const g = getGame();
          const actorType = API.ACTOR_CLASS_TYPE ?? 'npc';
          const ActorCls = g?.actors?.documentClass ?? (globalThis as any).Actor;
          const newActor = await ActorCls.create(
            { name: input.pileActorName ?? 'Item Pile', type: actorType },
            { skipItems: true },
          );
          dedicatedActor = newActor;
          // BUG-779: stamp an ownership marker on the dedicated actor BEFORE any downstream
          // failure point, so delete-pile can later distinguish an MCP-created dedicated actor
          // (safe to cascade-delete) from the shared Default Item Pile actor or a pre-existing
          // named actor (never cascade-deleted) — best-effort; a rollback deletes the actor
          // outright regardless.
          if (newActor) {
            try {
              await newActor.setFlag('warhammer-mcp', 'dedicatedPile', true);
            } catch (_) { /* best-effort marker */ }
          }
          options['actor'] = newActor?.uuid;   // existing-actor path; createActor stays false
          return { created: [newActor?.uuid ?? null] };
        },
        async undo(): Promise<void> {
          // BUG-779: best-effort rollback of a dedicated actor this call created. A thrown
          // delete() here is caught by runWriteSteps() itself and pushed onto
          // receipt.warnings — never console-only (this is the residual defect task 2.4 closes;
          // pre-retrofit this was a local rollbackCreatedActor() that only console.warn'd).
          if (!dedicatedActor) return;
          await dedicatedActor.delete();
        },
      });
    }

    steps.push({
      label: 'create-item-pile',
      async run(): Promise<StepIds> {
        // createItemPile returns { tokenUuid?: string, actorUuid: string } (item-piles.js:84851/84860) —
        // NOT a bare UUID. Extract both; never assign the whole object to a string field.
        let result: any;
        try {
          result = await API.createItemPile(options);
        } catch (e) {
          genericErrorMessage = e instanceof Error ? e.message : String(e);
          throw e;
        }
        // BUG-779/BUG-784: hook veto / business-condition refusal / genuine GM disconnect after we
        // already created the dedicated actor — roll it back either way, then classify which one it was.
        if (result === false) {
          refused = true;
          throw new Error('ITEM_PILES_CREATE_PILE_REFUSED');
        }
        tokenUuid = result?.tokenUuid ?? null;
        actorUuid = result?.actorUuid ?? null;
        return { created: actorUuid ? [actorUuid] : [] };
      },
    });

    steps.push({
      label: 'finalize-dedicated-pile',
      async run(): Promise<StepIds> {
        // The createDedicatedActor path pre-creates a bare actor (with skipItems to avoid the wfrp4e
        // dialog) and hands it to createItemPile as an existing actor — but that path does NOT stamp
        // enabled:true or the type/config flags (only the createActor:true path does, and that one
        // triggers the dialog). Stamp the pile config now via updateItemPile (verified-working merge),
        // so the dedicated merchant/vault/container is actually enabled + correctly typed.
        if (input.createDedicatedActor && actorUuid) {
          try {
            await API.updateItemPile(actorUuid, { ...itemPileFlags, enabled: true });
          } catch (e) {
            genericErrorMessage = e instanceof Error ? e.message : String(e);
            throw e;
          }
        }

        // DP-16: post-write verify — read back flag data from the created actor (by actorUuid, not the result object)
        if (actorUuid) {
          try {
            flagData = API.getActorFlagData(actorUuid);
          } catch (_) { /* best-effort */ }
          if (!flagData || typeof flagData !== 'object') {
            // BUG-779: verify-after-write failed after we created the dedicated actor — the
            // undo cascade below rolls it back.
            notPersistedMessage = `created pile actor ${actorUuid} has no flag data after createItemPile`;
            throw new Error(notPersistedMessage);
          }
        }
        return {};
      },
    });

    const outcome = await runWriteSteps(steps);

    if (outcome.outcome !== 'applied') {
      const warnings = outcome.receipt.warnings;
      if (refused) {
        // BUG-784 (D2): no actorUuid resolved yet at this failure point (the create-item-pile
        // step throws before assignment) — nothing exists to probe, so targetUuid is omitted and
        // the classifier falls straight to its NO_ACTIVE_GM / ITEM_PILES_OPERATION_VETOED split.
        return withWarnings(falseReturnEnvelope('create-pile', `scene ${input.sceneId}`), warnings);
      }
      if (notPersistedMessage) {
        return withWarnings(notPersisted(ErrorTokens.ITEM_PILES_CREATE_NOT_PERSISTED, notPersistedMessage), warnings);
      }
      // Any other thrown exception past actor-creation (createItemPile throw, updateItemPile
      // throw, getActorFlagData throw outside its own best-effort try) — BUG-779: the dedicated
      // actor's rollback already ran inside runWriteSteps(); a rollback failure is now in
      // `warnings` (surfaced to the caller below), never console-only.
      return withWarnings(
        { success: false, error: `CREATE_PILE_ERROR: ${genericErrorMessage ?? 'unknown step failure'}` },
        warnings,
      );
    }

    // BUG-779: lifecycle/ownership metadata — tells the caller (and a later delete-pile call)
    // whether this actor is ours to reclaim ('dedicated'), the shared Default Item Pile actor
    // ('shared'), or a pre-existing actor we merely attached to by name ('existing').
    const actorOwnership: 'dedicated' | 'existing' | 'shared' | null = !actorUuid
      ? null
      : input.createDedicatedActor
        ? 'dedicated'
        : input.pileActorName
          ? 'existing'
          : 'shared';

    notify.created('item-piles', `Created ${input.type ?? 'pile'} pile in scene ${input.sceneId}`, {});
    return { success: true, data: { tokenUuid, actorUuid, type: input.type ?? 'pile', sceneId: input.sceneId, flagData, actorOwnership } };
  } catch (e) {
    // Setup-phase exception (e.g. getItemPilesAPI()/normalizeItemsArray() throwing before any
    // step ran) — nothing has been created yet, so there is nothing to roll back.
    return { success: false, error: `CREATE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type UpdatePileInput = Extract<ModuleItempilesInputType, { action: 'update-pile' }>;

export async function handleUpdatePile(input: UpdatePileInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // M-4: guard against banker/auctioneer (companion module required)
  const typeErr = bankerAuctioneerCheck(input.type);
  if (typeErr) return typeErr;

  try {
    const API = getItemPilesAPI();

    const updateData: Record<string, unknown> = {};
    // C-2: 'enabled' added — required to activate merchant/vault (isItemPileMerchant needs enabled&&type)
    const fields: (keyof UpdatePileInput)[] = [
      'type', 'enabled', 'locked', 'closed', 'closedImage', 'openedImage', 'lockedImage',
      'emptyImage', 'lockedSound', 'closedSound', 'openedSound', 'merchantColumns',
      'overheadCost', 'vaultAccess', 'vaultExpansion', 'cols', 'rows', 'openTimes',
      // BUG-448#6: tablesForPopulate is a top-level pile flag (item-piles.js:64389-64394);
      // it rides the same updateItemPile write. refresh-merchant consumes it.
      'tablesForPopulate',
    ];
    for (const f of fields) {
      if (input[f] !== undefined) updateData[f as string] = input[f];
    }

    // GUIDANCE_ONLY warning: openTimes.status:"auto" without Simple Calendar
    if ((updateData.openTimes as any)?.status === 'auto') {
      const scActive = (globalThis as any).game?.modules?.get?.('simple-calendar')?.active;
      if (!scActive) {
        // proceed but warn — the API will permanently rewrite the flag to "open" on the next cycle
        updateData._simpleCalendarWarning = 'Simple Calendar is not active; openTimes.status:"auto" will be rewritten to "open" by item-piles on the next open/close cycle';
      }
    }

    // BUG-429: token-pile synthetic-actor uuids (Scene.<s>.Token.<t>.Actor.<a>) must target
    // the parent TokenDocument — Item Piles keys token-pile flags on the token, not the
    // synthetic actor, so both the write and the flag re-read silently miss on the actor
    // uuid and the type change never lands. World-actor uuids (Actor.<id>) pass through.
    const tokenMatch = /^(Scene\.[^.]+\.Token\.[^.]+)\.Actor\./.exec(input.actorUuid);
    const pileUuid = tokenMatch ? tokenMatch[1] : input.actorUuid;

    const updateResult = await API.updateItemPile(pileUuid, updateData);
    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto.
    if (updateResult === false) {
      return falseReturnEnvelope('update-pile', String(pileUuid), undefined, String(pileUuid));
    }

    // DP-16: post-write verify — closure-diff against the requested field set (excluding the
    // advisory-only _simpleCalendarWarning marker, which is never persisted by design).
    // BUG-448#6(c): non-scalar fields (tablesForPopulate, openTimes, merchantColumns,
    // vaultAccess, overheadCost) String()-compare as "[object Object]" and always match —
    // JSON.stringify-compare objects/arrays instead.
    let flagData: any = API.getActorFlagData(pileUuid);
    const sameValue = (a: unknown, b: unknown): boolean =>
      (typeof b === 'object' && b !== null) ? JSON.stringify(a) === JSON.stringify(b) : String(a) === String(b);
    const computeDrift = (flags: any): string[] => Object.keys(updateData)
      .filter((k) => k !== '_simpleCalendarWarning')
      .filter((k) => !sameValue(flags?.[k], updateData[k]));
    let drift = computeDrift(flagData);
    // BUG-539: upstream updateItemPileData writes token-level pile flags only via
    // Actor#getActiveTokens(), which is viewed-canvas-scene-only — for a token-pile on a
    // non-viewed scene the token write silently no-ops (the actor-level write still lands,
    // which is what polluted the shared Default Item Pile actor). getActorFlagData reads
    // the TokenDocument's flags for token targets, so on drift write the merged flag data
    // onto the TokenDocument directly (canvas-render-independent, same treatment as
    // BUG-444's delete path) and re-verify.
    if (drift.length > 0 && tokenMatch) {
      const tokenDoc: any = await (globalThis as any).fromUuid(pileUuid);
      if (tokenDoc?.documentName === 'Token') {
        const requested: Record<string, unknown> = {};
        for (const k of Object.keys(updateData)) {
          if (k !== '_simpleCalendarWarning') requested[k] = updateData[k];
        }
        const merged = { ...(flagData ?? {}), ...requested };
        const write: Record<string, unknown> = { 'flags.item-piles.data': merged };
        if (!tokenDoc.actorLink) write.delta = { 'flags.item-piles.data': merged };
        await tokenDoc.update(write);
        flagData = API.getActorFlagData(pileUuid);
        drift = computeDrift(flagData);
      }
    }
    if (drift.length > 0) {
      return notPersisted(ErrorTokens.ITEM_PILES_UPDATE_NOT_PERSISTED, `pile ${pileUuid} field(s) did not persist: ${drift.join(', ')}`);
    }
    notify.updated('item-piles', `Updated pile ${pileUuid}`, {});
    return { success: true, data: { actorUuid: input.actorUuid, pileUuid, updated: updateData, flagData } };
  } catch (e) {
    return { success: false, error: `UPDATE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** BUG-779 (unlinked-token cascade fix): item-pile tokens are unlinked (actorLink:false), so
 *  `tokenDoc.actor` resolves the token's SYNTHETIC ActorDelta (uuid form
 *  `Scene.X.Token.Y.Actor.Z`), never the world Actor — deleting it silently no-ops and orphans
 *  the real dedicated actor. `TokenDocument#baseActor` (v13) returns the base world Actor for
 *  both linked and unlinked tokens; fall back to `game.actors.get(actorId)` if unavailable. */
function resolveWorldActor(tokenDoc: any): any {
  return tokenDoc?.baseActor ?? (tokenDoc?.actorId ? (globalThis as any).game?.actors?.get(tokenDoc.actorId) : null) ?? null;
}

type DeletePileInput = Extract<ModuleItempilesInputType, { action: 'delete-pile' }>;

export async function handleDeletePile(input: DeletePileInput): Promise<Envelope<unknown>> {
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  // C10: validate Token UUID
  const uuidErr = validateTokenUuid(input.tokenUuid);
  if (uuidErr) return { success: false, error: uuidErr };

  // CCR-4: dangerous — confirm required. Preserved BEFORE any resolution (as at baseline) so
  // CONFIRM_REQUIRED fires unconditionally, even when the token can't yet be resolved. BUG-779:
  // this preview is now also a best-effort disclosure of the dedicated pile actor (if any) that
  // confirm:true will cascade-delete alongside the token — "reversible via delete-pile" in the
  // safety table must mean the actor too. Resolution failure here never blocks the preview
  // itself; it just falls back to the token-only message.
  // Migrated onto the shared requireConfirm() helper (systemic_bug_class_prevention v2 Phase
  // 1/5.1 — R1.3 consolidation); preview content (dedicated-actor cascade disclosure) and
  // refusal trigger conditions are unchanged from the pre-migration hand-rolled envelope.
  if (input.confirm !== true) {
    let previewActor: any = null;
    try {
      const previewToken: any = await (globalThis as any).fromUuid(input.tokenUuid);
      if (previewToken?.documentName === 'Token') previewActor = resolveWorldActor(previewToken);
    } catch (_) { /* preview is best-effort only — resolution failure surfaces for real on confirm:true */ }
    const isDedicatedPreview = Boolean(previewActor?.getFlag?.('warhammer-mcp', 'dedicatedPile'));
    const cascadeNote = isDedicatedPreview
      ? ` and its dedicated pile actor "${previewActor?.name ?? previewActor?.uuid}" (${previewActor?.uuid}) — a shared or pre-existing actor is never cascade-deleted`
      : '';
    return requireConfirm(
      { confirm: false }, // inside the input.confirm !== true branch — always false here
      'delete-pile',
      `${input.tokenUuid} — permanently deletes the token${cascadeNote}`,
    ) as Envelope<unknown>;
  }

  try {
    // BUG-444: do NOT route through API.deleteItemPile — its getToken() helper returns the
    // bare TokenDocument when the token's scene is not viewed (`.object` is null,
    // item-piles.js:34269), and the upstream delete path then derefs `target.document.delete()`
    // (item-piles.js:85022) → "Cannot read properties of undefined (reading 'delete')".
    // Resolve the TokenDocument ourselves and delete it directly — canvas-render-independent.
    // Upstream's PRE_DELETE hook choreography is intentionally not re-implemented (plan D10).
    const tokenDoc: any = await (globalThis as any).fromUuid(input.tokenUuid);
    if (!tokenDoc) {
      return { success: false, error: `INVALID_PILE_UUID: token UUID "${input.tokenUuid}" did not resolve to a document` };
    }
    if (tokenDoc.documentName !== 'Token') {
      return { success: false, error: `INVALID_PILE_UUID: "${input.tokenUuid}" resolved to a ${tokenDoc.documentName ?? typeof tokenDoc}, not a TokenDocument` };
    }

    // BUG-779: only an actor WE created (createDedicatedActor path, marked at creation with the
    // warhammer-mcp.dedicatedPile flag) is ever cascade-deleted. The shared Default Item Pile
    // actor and any pre-existing actor attached via pileActorName-without-createDedicatedActor
    // are never touched here.
    const pileActor: any = resolveWorldActor(tokenDoc);
    const isDedicatedActor = Boolean(pileActor?.getFlag?.('warhammer-mcp', 'dedicatedPile'));

    await tokenDoc.delete();
    // DP-16: NEW post-write read-back (this site had zero verify at baseline) — confirm the
    // pile token no longer resolves.
    const stillResolves = (globalThis as any).fromUuidSync?.(input.tokenUuid);
    if (stillResolves) {
      return notPersisted(ErrorTokens.ITEM_PILES_DELETE_NOT_PERSISTED, `pile token ${input.tokenUuid} still resolves after the delete`);
    }

    // BUG-779: cascade-delete the dedicated actor now that the token delete is confirmed +
    // verified. Best-effort — a cascade failure is reported in the response but does not
    // revert the already-verified token delete (the token is gone either way).
    let actorDeleted = false;
    let actorDeleteError: string | null = null;
    if (isDedicatedActor && pileActor) {
      try {
        await pileActor.delete();
        actorDeleted = true;
      } catch (e) {
        actorDeleteError = e instanceof Error ? e.message : String(e);
      }
    }

    notify.deleted('item-piles', `Deleted pile token ${input.tokenUuid}`, {});
    return {
      success: true,
      data: {
        tokenUuid: input.tokenUuid,
        deleted: true,
        dedicatedActorUuid: isDedicatedActor ? (pileActor?.uuid ?? null) : null,
        actorDeleted,
        ...(actorDeleteError ? { actorDeleteError } : {}),
      },
    };
  } catch (e) {
    return { success: false, error: `DELETE_PILE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Container state ───────────────────────────────────────────────────────

type SetPileStateInput = Extract<ModuleItempilesInputType, { action: 'set-pile-state' }>;

export async function handleSetPileState(input: SetPileStateInput): Promise<Envelope<unknown>> {
  // M-3: GM gate covers ALL branches (open/close/lock/unlock/rattle + turnTokens/revertTokens)
  const gmErr = gmRequired();
  if (gmErr) return gmErr;
  const agmErr = activeGmRequired();
  if (agmErr) return agmErr;

  try {
    const API = getItemPilesAPI();

    // turnTokens/revertTokens: resolve live Token objects (C6/C7)
    if (input.state === 'turnTokens' || input.state === 'revertTokens') {
      // gmRequired already checked at handler top (M-3)
      if (!input.tokenUuids || input.tokenUuids.length === 0) {
        return { success: false, error: 'MISSING_TOKEN_UUIDS: tokenUuids is required for turnTokens/revertTokens' };
      }

      if (input.state === 'revertTokens' && input.confirm !== true) {
        return {
          success: false,
          error: 'CONFIRM_REQUIRED: revertTokens strips pile flags from live tokens. Re-send with confirm:true.',
        };
      }

      // Resolve UUID strings to live Token objects (API hard-rejects UUID strings)
      const tokens = input.tokenUuids.map(resolveToTokenObject);

      let result: unknown;
      if (input.state === 'turnTokens') {
        result = await API.turnTokensIntoItemPiles(tokens);
      } else {
        result = await API.revertTokensFromItemPiles(tokens);
      }
      // BUG-784: classify bare false — GM-disconnect vs. business-condition veto. This branch acts
      // on a BATCH of tokens (no single UUID) — probe the first token's pile-actor UUID as a
      // best-effort representative sample (D2's probes are already independently try/catch-
      // guarded, so an unresolvable/undefined sample degrades to the neutral veto, never a throw).
      if (result === false) {
        const representativeTargetUuid: string | undefined = (tokens[0] as any)?.document?.actor?.uuid ?? (tokens[0] as any)?.actor?.uuid ?? undefined;
        return falseReturnEnvelope(`set-pile-state (${input.state})`, `${tokens.length} token(s)`, undefined, representativeTargetUuid);
      }

      // BUG-420: echo the per-token SYNTHETIC pile-actor UUIDs (read post-conversion from
      // the live token objects). turnTokensIntoItemPiles resolves to TOKEN uuids only, and
      // token.actorId points at the SHARED base actor — neither is a valid split-loot /
      // get-contents target when N tokens share one base actor.
      const pileActorUuids = tokens.map((t: any) => t?.document?.actor?.uuid ?? t?.actor?.uuid ?? null);

      // DP-16: NEW post-write read-back (this site had zero verify at baseline) — confirm each
      // token's pile-actor validity actually flipped in the requested direction.
      for (const pileActorUuid of pileActorUuids) {
        if (!pileActorUuid) continue;
        const isValid = API.isValidItemPile(pileActorUuid);
        if (input.state === 'turnTokens' && !isValid) {
          return notPersisted(ErrorTokens.ITEM_PILES_TOKEN_CONVERT_NOT_PERSISTED, `token pile-actor ${pileActorUuid} is not a valid item pile after turnTokensIntoItemPiles`);
        }
        if (input.state === 'revertTokens' && isValid) {
          return notPersisted(ErrorTokens.ITEM_PILES_TOKEN_CONVERT_NOT_PERSISTED, `token pile-actor ${pileActorUuid} is still a valid item pile after revertTokensFromItemPiles`);
        }
      }

      notify.updated('item-piles', `${input.state} on ${tokens.length} token(s)`, {});
      return { success: true, data: { state: input.state, tokenCount: tokens.length, pileActorUuids, result } };
    }

    // open/close/lock/unlock/rattle — all take actorUuid
    if (!input.actorUuid) {
      return { success: false, error: 'MISSING_ACTOR_UUID: actorUuid is required for open/close/lock/unlock/rattle states' };
    }

    // BUG-447: open/close/lock/unlock return the same bare `false` for "not a container" as
    // for hook-veto / no-GM (item-piles.js:97969/:98001) — pre-check the pile type so a
    // non-container gets a truthful token instead of the BUG-784-classified false-return below.
    // 'rattle' is exempt (it doesn't gate on container). The classified false-return below is
    // now reserved for `false` returned on a VERIFIED container (see falseReturnEnvelope,
    // BUG-784, in flow.ts).
    if (input.state !== 'rattle' && !API.isItemPileContainer(input.actorUuid)) {
      const actualType = (API.getActorFlagData(input.actorUuid) as any)?.type ?? 'unknown';
      return { success: false, error: `INVALID_PILE_TYPE: set-pile-state "${input.state}" requires a container pile — this pile is type "${actualType}"` };
    }

    let result: unknown;
    const interacting = input.interactingTokenUuid || null;

    switch (input.state) {
      case 'open':
        result = await API.openItemPile(input.actorUuid, interacting);
        break;
      case 'close':
        result = await API.closeItemPile(input.actorUuid, interacting);
        break;
      case 'lock':
        result = await API.lockItemPile(input.actorUuid);
        break;
      case 'unlock':
        result = await API.unlockItemPile(input.actorUuid);
        break;
      case 'rattle':
        result = await API.rattleItemPile(input.actorUuid);
        break;
    }

    // BUG-784: classify bare false — GM-disconnect vs. business-condition veto (e.g. a
    // preOpenItemPile/preLockItemPile-style hook refusal — the container-type pre-check above
    // (BUG-447) already ruled out "not a container", but a dynamic hook veto is still possible).
    if (result === false) {
      return falseReturnEnvelope(`set-pile-state (${input.state})`, input.actorUuid, undefined, input.actorUuid);
    }

    // DP-16: post-write verify — closure-diff against the boolean flag the requested state implies.
    // ('rattle' has no persisted state change — shake-to-check flavor only, nothing to assert.)
    const flagData: any = API.getActorFlagData(input.actorUuid);
    if (input.state === 'open' || input.state === 'close') {
      const expectedClosed = input.state === 'close';
      if (Boolean(flagData?.closed) !== expectedClosed) {
        return notPersisted(ErrorTokens.ITEM_PILES_STATE_NOT_PERSISTED, `pile ${input.actorUuid} "closed" expected ${expectedClosed} after state "${input.state}", got ${Boolean(flagData?.closed)}`);
      }
    } else if (input.state === 'lock' || input.state === 'unlock') {
      const expectedLocked = input.state === 'lock';
      if (Boolean(flagData?.locked) !== expectedLocked) {
        return notPersisted(ErrorTokens.ITEM_PILES_STATE_NOT_PERSISTED, `pile ${input.actorUuid} "locked" expected ${expectedLocked} after state "${input.state}", got ${Boolean(flagData?.locked)}`);
      }
    }
    notify.updated('item-piles', `Set pile state to "${input.state}" on ${input.actorUuid}`, {});
    return { success: true, data: { state: input.state, actorUuid: input.actorUuid, result, flagData } };
  } catch (e) {
    return { success: false, error: `SET_PILE_STATE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── 3A: Contents read ─────────────────────────────────────────────────────────

type GetContentsInput = Extract<ModuleItempilesInputType, { action: 'get-contents' }>;

export async function handleGetContents(input: GetContentsInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: get-contents requires GM access' };

  try {
    const API = getItemPilesAPI();
    const actorUuid = input.actorUuid;

    const flagData = API.getActorFlagData(actorUuid);
    const items = API.getActorItems(actorUuid);
    const currencies = API.getActorCurrencies(actorUuid);

    // Type checks
    const isValidPile = API.isValidItemPile(actorUuid);
    const isContainer = API.isItemPileContainer(actorUuid);
    const isMerchant = API.isItemPileMerchant(actorUuid);
    const isVault = API.isItemPileVault(actorUuid);
    const isLocked = isValidPile ? API.isItemPileLocked(actorUuid) : null;
    const isClosed = isValidPile ? API.isItemPileClosed(actorUuid) : null;
    const isEmpty = isValidPile ? API.isItemPileEmpty(actorUuid) : null;

    // Serialize items (Item documents → plain objects)
    const serializedItems = (Array.isArray(items) ? items : []).map((item: any) => ({
      id: item.id ?? item._id ?? null,
      name: item.name ?? null,
      type: item.type ?? null,
      quantity: item.system?.quantity?.value ?? item.system?.quantity ?? 1,
      uuid: item.uuid ?? null,
    }));

    // BUG-788: paginate items independently — default to a bounded page (never the whole pile)
    // so a large merchant/vault stays under the global 64,000-char RESPONSE_TOO_LARGE guard,
    // with total/truncated/next-offset metadata so a caller can page down after an overflow.
    // itemCount stays the TOTAL item count on the pile (unchanged semantic); `items` is now
    // the bounded page, not the whole array.
    const boundedItems = boundList(serializedItems, { limit: input.limit, offset: input.offset });

    const result: Record<string, unknown> = {
      actorUuid,
      isValidPile,
      isContainer,
      isMerchant,
      isVault,
      isLocked,
      isClosed,
      isEmpty,
      itemCount: serializedItems.length,
      items: boundedItems.items,
      itemsOffset: boundedItems.offset,
      itemsLimit: boundedItems.limit,
      itemsTruncated: boundedItems.truncated,
      itemsNextOffset: boundedItems.truncated ? boundedItems.offset + boundedItems.items.length : null,
      currencies,
      // BUG-788: strip `log` out of the flagData projection unconditionally — flagData is the
      // full raw flag blob (API.getActorFlagData) and previously always embedded the entire,
      // unbounded audit log inside it even when includeLog was false; when includeLog was true
      // that same log was ALSO copied into the top-level `log` field, duplicating it. The log is
      // now surfaced ONLY via the paginated top-level `log` field below (when requested).
      flagData: stripEmbeddedLog(flagData),
    };

    // Vault/merchant audit log (if requested and available) — paginated independently of items.
    if (input.includeLog && flagData) {
      const fullLog: unknown[] = Array.isArray((flagData as any)?.log) ? (flagData as any).log : [];
      const boundedLog = boundList(fullLog, { limit: input.logLimit, offset: input.logOffset });
      result.log = boundedLog.items;
      result.logCount = fullLog.length;
      result.logOffset = boundedLog.offset;
      result.logLimit = boundedLog.limit;
      result.logTruncated = boundedLog.truncated;
      result.logNextOffset = boundedLog.truncated ? boundedLog.offset + boundedLog.items.length : null;
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: `GET_CONTENTS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** BUG-788: returns a shallow copy of flagData with the `log` key removed (or flagData
 *  unchanged if it isn't a plain object) — the log is surfaced separately, paginated, via
 *  the top-level `log` field so it is never duplicated inside the flagData projection. */
function stripEmbeddedLog(flagData: unknown): unknown {
  if (!flagData || typeof flagData !== 'object') return flagData;
  const { log: _log, ...rest } = flagData as Record<string, unknown>;
  return rest;
}
