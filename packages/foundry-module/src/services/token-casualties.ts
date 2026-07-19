// services/token-casualties.ts — WFRP Battle Simulator Phase 5 (R13 / R5.1 / R5.1a).
//
// Batch per-token ActorDelta casualty writer. Mirrors the HC2 precedent in template-apply.ts:
// scene -> tokenDoc -> reject actorLink=true -> tokenDoc.actor (synthetic) -> write. NEVER touches
// game.actors.get(actorId) (the world actor) — encounter forces are unlinked siblings of one world
// actor, so a world write corrupts every sibling (BUG-133).
//
// DIALOG-PATH: DIALOG_INVESTIGATED — actor.update({skipExperienceChecks}), actor.addCondition, and
// actor.createEmbeddedDocuments('Item', …, {skipSpecialisationChoice:true}) confirmed dialog-free
// (the only known dialog trigger, SkillModel._handleSpecialisationChoice, is suppressed; crit items
// are not skills). No awaited path opens a Foundry dialog (ADR-10.1).

import { notify } from '../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyDocWrite } from '../utils/verifyWrite.js';
import { buildOperationReceipt } from './shared/operation-receipt.js';
import { MODULE_ID } from '../constants.js';

// BUG-409 idempotency: per-token applied-batch markers live at
// flags.warhammer-mcp.casualtyBatches (an array on the token's SYNTHETIC actor / ActorDelta).
// Capped to the most-recent N so a long-lived token does not accumulate unbounded batch ids.
const MAX_TRACKED_BATCHES = 25;

interface CasualtyInput {
  tokenId: string;
  wounds?: number | undefined;
  conditions?: string[] | undefined;
  criticalUuid?: string | undefined;
  criticalUuids?: string[] | undefined;
}

interface CasualtyResult {
  tokenId: string;
  applied: boolean;
  actorName?: string;
  woundsBefore?: number;
  woundsAfter?: number;
  conditionsApplied?: string[];
  critEmbedded?: string | null;
  critsEmbedded?: string[];
  siblingVerified?: boolean;
  alreadyApplied?: boolean; // BUG-409 — skipped as already-applied for the given batchId
  error?: string;
}

export class TokenCasualtiesService {
  constructor(private readonly validateState: () => void) {}

  async applyTokenCasualties(data: {
    sceneId: string;
    confirmedApply: true;
    casualties: CasualtyInput[];
    dryRun?: boolean | undefined;
    batchId?: string | undefined;
  }): Promise<any> {
    this.validateState();
    const scene: any = (globalThis as any).game?.scenes?.get(data.sceneId);
    if (!scene) throw new Error(`Scene not found with ID: ${data.sceneId}`);

    const dryRun = data.dryRun === true;
    const batchId = data.batchId;
    const warnings: string[] = [];
    const results: CasualtyResult[] = [];
    const createdItemIds: string[] = [];
    const updatedDocIds: string[] = [];

    for (const c of data.casualties) {
      const r = await this.applyOne(scene, c, dryRun, batchId, warnings);
      results.push(r);
      // A real content write happened only when applied AND not an idempotent skip (BUG-409).
      if (r.applied && !r.alreadyApplied && !dryRun) {
        updatedDocIds.push(c.tokenId);
        if (r.critsEmbedded?.length) createdItemIds.push(...r.critsEmbedded);
        else if (r.critEmbedded) createdItemIds.push(r.critEmbedded);
      }
    }

    const appliedCount = results.filter((r) => r.applied).length;
    const alreadyAppliedCount = results.filter((r) => r.alreadyApplied).length;
    const failedCount = results.length - appliedCount;
    const base = {
      sceneId: data.sceneId,
      dryRun,
      tokenCount: results.length,
      appliedCount,
      failedCount,
      alreadyAppliedCount,
      results,
    };
    // dryRun is a pure preview — no writes, so no operation receipt (quality-contract §3).
    if (dryRun) return base;
    // RC1.2 — failedItems derived from results[] (additive; results[]/counters stay verbatim —
    // evals/battle-sim.xml + wfrp-battle-simulator/references/apply-flow.md assert them by name).
    const failedItems = results
      .filter((r) => !r.applied)
      .map((r) => ({ id: r.tokenId, reason: r.error ?? 'unknown failure' }));
    if (failedCount > 0 && failedCount < results.length) warnings.push(ErrorTokens.BATCH_PARTIAL_FAILURE);
    return {
      ...base,
      ...buildOperationReceipt({ created: createdItemIds, updated: updatedDocIds, warnings, failed: failedItems }),
    };
  }

  /** Resolve + validate one token, then (unless dryRun) write its casualty. Never throws — a per-token
   *  failure is captured in the result so a batch surfaces which targets did not apply (§2). */
  private async applyOne(scene: any, c: CasualtyInput, dryRun: boolean, batchId?: string, warnings?: string[]): Promise<CasualtyResult> {
    const tokenDoc: any = scene.tokens?.get(c.tokenId);
    if (!tokenDoc) return { tokenId: c.tokenId, applied: false, error: `Token not found on scene "${scene.name}"` };
    if (tokenDoc.actorLink === true) {
      return { tokenId: c.tokenId, applied: false, error: `Token is linked (actorLink=true); a delta write has no effect (HC2). Use the world actor (${tokenDoc.actorId}).` };
    }
    const actor: any = tokenDoc.actor;
    if (!actor) return { tokenId: c.tokenId, applied: false, error: 'Token has no synthetic actor' };

    // BUG-409 idempotency: if this token was already written for this batchId, SKIP it — a blind
    // retry after a socket timeout re-sends the whole batch without double-applying (crit embeds /
    // numbered conditions are not idempotent). Checked in dryRun too so the preview is faithful.
    if (batchId && this.tokenHasBatch(actor, batchId)) {
      return { tokenId: c.tokenId, applied: true, alreadyApplied: true, actorName: actor.name };
    }

    // Pre-validate ALL inputs BEFORE any mutation so a per-token write is atomic on input errors:
    // an invalid condition key or unresolvable crit UUID must NOT leave a partial wounds write behind
    // (writeOne writes wounds first; a later condition/crit throw would otherwise persist the wounds).
    // This also makes the dry-run a true validation pass.
    const validationError = await this.validateCasualty(c);
    if (validationError) return { tokenId: c.tokenId, applied: false, actorName: actor.name, error: validationError };

    const woundsBefore: number = actor.system?.status?.wounds?.value ?? 0;
    if (dryRun) return this.previewOne(c, actor, woundsBefore);

    // HC2 baseline — the SHARED world actor's Wounds BEFORE we touch this token's delta. Captured
    // here (a read, never a write target) so writeOne can prove our delta write did NOT leak through
    // to the world actor (which every unlinked sibling falls back to). game.actors.get is read-only.
    const worldActor: any = (globalThis as any).game?.actors?.get(tokenDoc.actorId);
    const worldBaseline: number | undefined = worldActor?.system?.status?.wounds?.value;

    let result: CasualtyResult;
    try {
      result = await this.writeOne(scene, tokenDoc, actor, c, woundsBefore, worldActor, worldBaseline);
    } catch (e) {
      return { tokenId: c.tokenId, applied: false, actorName: actor.name, error: e instanceof Error ? e.message : String(e) };
    }
    // BUG-409: only AFTER the content writes succeed, stamp the idempotency marker. markBatchApplied
    // NEVER throws — a marker-persist failure degrades to the legacy non-idempotent behavior and is
    // surfaced as a warning, so it can never flip a successful content write to applied:false (which
    // would itself provoke the double-applying retry this fix exists to prevent).
    if (batchId) {
      const marked = await this.markBatchApplied(actor, batchId);
      if (!marked) {
        warnings?.push(
          `Idempotency marker for token ${c.tokenId} (batch ${batchId}) did not persist — a retry may re-apply this token; read back before retrying.`,
        );
      }
    }
    return result;
  }

  /** BUG-409: has this token's synthetic actor already been written for `batchId`? */
  private tokenHasBatch(actor: any, batchId: string): boolean {
    const arr = actor?.flags?.[MODULE_ID]?.casualtyBatches;
    return Array.isArray(arr) && arr.includes(batchId);
  }

  /** BUG-409: stamp `batchId` onto the token's SYNTHETIC actor (HC2 — never the world actor), capped
   *  to the most-recent N ids, then re-read to confirm it persisted. NEVER throws — returns whether
   *  the marker is now durably present so the caller can warn (but keep the content write) on failure. */
  private async markBatchApplied(actor: any, batchId: string): Promise<boolean> {
    try {
      const existing = actor?.flags?.[MODULE_ID]?.casualtyBatches;
      const arr: string[] = Array.isArray(existing) ? existing.slice() : [];
      if (!arr.includes(batchId)) arr.push(batchId);
      const capped = arr.slice(-MAX_TRACKED_BATCHES);
      await actor.update({ [`flags.${MODULE_ID}.casualtyBatches`]: capped }, { skipExperienceChecks: true });
      const fresh: any = await (globalThis as any).fromUuid(actor.uuid);
      const freshArr = fresh?.flags?.[MODULE_ID]?.casualtyBatches;
      return Array.isArray(freshArr) && freshArr.includes(batchId);
    } catch {
      return false;
    }
  }

  /** Validate a casualty's inputs against the live world BEFORE any write (atomicity guard).
   *  Returns an error string if a condition key is unknown or the crit UUID is unresolvable; null if OK. */
  private async validateCasualty(c: CasualtyInput): Promise<string | null> {
    const conditions = c.conditions ?? [];
    if (conditions.length) {
      const validKeys = Object.keys((globalThis as any).game?.wfrp4e?.config?.conditions ?? {});
      for (const key of conditions) {
        if (validKeys.length && !validKeys.includes(key)) {
          return `Unknown condition key '${key}'. Valid: ${validKeys.join(', ')}`;
        }
      }
    }
    for (const uuid of this.getCriticalUuids(c)) {
      const source: any = await (globalThis as any).fromUuid(uuid);
      if (!source) return `Critical Item not found for UUID: ${uuid}`;
    }
    return null;
  }

  private previewOne(c: CasualtyInput, actor: any, woundsBefore: number): CasualtyResult {
    const max: number = actor.system?.status?.wounds?.max ?? woundsBefore;
    return {
      tokenId: c.tokenId,
      applied: true,
      actorName: actor.name,
      woundsBefore,
      woundsAfter: c.wounds !== undefined ? Math.max(0, Math.min(c.wounds, max)) : woundsBefore,
      conditionsApplied: c.conditions ?? [],
      critEmbedded: this.getCriticalUuids(c).length ? '(dry-run)' : null,
      critsEmbedded: this.getCriticalUuids(c).map(() => '(dry-run)'),
    };
  }

  private async writeOne(scene: any, tokenDoc: any, actor: any, c: CasualtyInput, woundsBefore: number, worldActor: any, worldBaseline: number | undefined): Promise<CasualtyResult> {
    let woundsAfter = woundsBefore;
    if (c.wounds !== undefined) {
      woundsAfter = await this.writeWounds(actor, c.wounds);
    }
    const conditionsApplied = await this.applyConditions(actor, c.conditions ?? []);
    const critsEmbedded = await this.embedCrits(actor, this.getCriticalUuids(c));
    const critEmbedded = critsEmbedded[0] ?? null;
    // A CriticalModel _onCreate hook normally subtracts its `system.wounds.value`. embedCrits suppresses
    // that hook for this pre-resolved absolute-Wounds tool, then restores the Item's authored value.
    // Re-read after every hook/write anyway: the receipt must report persisted reality, never a stale
    // pre-embed local. When an absolute value was requested, fail loud on any final drift.
    const freshActor: any = await (globalThis as any).fromUuid(actor.uuid);
    woundsAfter = freshActor?.system?.status?.wounds?.value ?? woundsAfter;
    if (c.wounds !== undefined) {
      const max: number = actor.system?.status?.wounds?.max ?? c.wounds;
      const expected = Math.max(0, Math.min(c.wounds, max));
      verifyDocWrite(freshActor, { 'system.status.wounds.value': expected }, 'APPLY_TOKEN_CASUALTIES_FINAL_WOUNDS_NOT_PERSISTED');
    }
    const siblingVerified = this.verifyWorldActorUnchanged(scene, tokenDoc, actor, worldActor, worldBaseline);

    notify.updated('actor', actor.name, {
      summary: `wounds ${woundsBefore} → ${woundsAfter}${conditionsApplied.length ? `, +${conditionsApplied.join('/')}` : ''}`,
      uuid: tokenDoc.uuid,
      tooltip: { tokenDoc, message: `-${Math.max(0, woundsBefore - woundsAfter)} wounds` },
    });
    if (critsEmbedded.length) {
      notify.created('item', `${actor.name}: critical wound`, { summary: `${critsEmbedded.length} battle-sim crit(s)`, uuid: tokenDoc.uuid });
    }

    return { tokenId: c.tokenId, applied: true, actorName: actor.name, woundsBefore, woundsAfter, conditionsApplied, critEmbedded, critsEmbedded, siblingVerified };
  }

  /** Clamp to [0, max] and write the absolute Wounds, then DP-16 verify it persisted (BUG-070). */
  private async writeWounds(actor: any, wounds: number): Promise<number> {
    const max: number = actor.system?.status?.wounds?.max ?? wounds;
    const clamped = Math.max(0, Math.min(wounds, max));
    await actor.update({ 'system.status.wounds.value': clamped }, { skipExperienceChecks: true });
    const fresh: any = await (globalThis as any).fromUuid(actor.uuid);
    verifyDocWrite(fresh, { 'system.status.wounds.value': clamped }, 'APPLY_TOKEN_CASUALTIES_NOT_PERSISTED');
    return clamped;
  }

  /** Apply each condition via the wfrp4e system method (validated against the live config). */
  private async applyConditions(actor: any, conditions: string[]): Promise<string[]> {
    if (!conditions.length) return [];
    const validKeys = Object.keys((globalThis as any).game?.wfrp4e?.config?.conditions ?? {});
    const applied: string[] = [];
    for (const key of conditions) {
      if (validKeys.length && !validKeys.includes(key)) {
        throw new Error(`Unknown condition key '${key}'. Valid: ${validKeys.join(', ')}`);
      }
      await actor.addCondition(key, 1);
      applied.push(key);
    }
    return applied;
  }

  /** Return every requested critical UUID in its explicit, deterministic input order. The legacy
   *  singular field is prepended when both forms are supplied so older mixed callers lose nothing. */
  private getCriticalUuids(c: CasualtyInput): string[] {
    return [...(c.criticalUuid ? [c.criticalUuid] : []), ...(c.criticalUuids ?? [])];
  }

  /** Embed the resolved crits without re-applying their wounds, then restore authored wound values.
   *  WFRP4e CriticalModel._onCreate subtracts `system.wounds.value` automatically. This tool's `wounds`
   *  is already the simulator's absolute post-critical value, so creation carries an empty wound value
   *  (no hook update) and the embedded Item is restored immediately afterward via Item.update. */
  private async embedCrits(actor: any, uuids: string[]): Promise<string[]> {
    if (!uuids.length) return [];
    const itemDatas: any[] = [];
    const authoredWounds: unknown[] = [];
    for (const uuid of uuids) {
      const source: any = await (globalThis as any).fromUuid(uuid);
      if (!source) throw new Error(`Critical Item not found for UUID: ${uuid}`);
      const itemData = source.toObject();
      delete itemData._id;
      const authored = itemData?.system?.wounds?.value;
      authoredWounds.push(authored);
      if (itemData?.type === 'critical' && authored !== undefined) itemData.system.wounds.value = '';
      itemDatas.push(itemData);
    }
    const created: any[] = await actor.createEmbeddedDocuments('Item', itemDatas, { skipSpecialisationChoice: true });
    if (created.length !== itemDatas.length || created.some((item) => !item || !actor.items?.get(item.id))) {
      throw new Error(`APPLY_TOKEN_CASUALTIES_NOT_PERSISTED: expected ${itemDatas.length} critical item(s) on ${actor.name}, found ${created.length}`);
    }
    for (let i = 0; i < created.length; i++) {
      const critItem = created[i];
      const authored = authoredWounds[i];
      if (itemDatas[i]?.type === 'critical' && authored !== undefined) {
        await critItem.update({ 'system.wounds.value': authored }, { skipExperienceChecks: true });
        const freshCrit: any = await (globalThis as any).fromUuid(critItem.uuid);
        verifyDocWrite(freshCrit, { 'system.wounds.value': authored }, 'APPLY_TOKEN_CASUALTIES_CRIT_VALUE_NOT_PERSISTED');
      }
    }
    const current: number = actor.system?.status?.criticalWounds?.value ?? 0;
    await actor.update({ 'system.status.criticalWounds.value': current + created.length }, { skipExperienceChecks: true });
    const fresh: any = await (globalThis as any).fromUuid(actor.uuid);
    verifyDocWrite(fresh, { 'system.status.criticalWounds.value': current + created.length }, 'APPLY_TOKEN_CASUALTIES_NOT_PERSISTED');
    return created.map((item) => item.id);
  }

  /** HC2 — confirm our token-delta write did NOT leak through to the SHARED world actor. A leak
   *  (writing game.actors.get instead of tokenDoc.actor) would move the world actor's Wounds, which
   *  every unlinked sibling falls back to. Re-read the world actor and assert it equals the baseline
   *  captured before the write. Returns true when verified (or when there is no world actor to check). */
  private verifyWorldActorUnchanged(scene: any, tokenDoc: any, actor: any, worldActor: any, worldBaseline: number | undefined): boolean {
    if (!worldActor || worldBaseline === undefined) return true;
    const worldAfter: number | undefined = worldActor.system?.status?.wounds?.value;
    if (worldAfter !== worldBaseline) {
      const siblings = Array.from(scene.tokens?.values() ?? []).filter(
        (t: any) => t && t.id !== tokenDoc.id && t.actorId === tokenDoc.actorId && t.actorLink !== true,
      ).length;
      throw new Error(
        `APPLY_TOKEN_CASUALTIES_SIBLING_LEAK: writing ${actor.name} moved the shared world actor's ` +
          `Wounds (${worldBaseline} → ${worldAfter}) — HC2 isolation breach affecting ${siblings} sibling token(s). ` +
          `The write must target tokenDoc.actor (the delta), never game.actors.get(actorId).`,
      );
    }
    return true;
  }
}
