// services/effects.ts — MCP Code-Quality Hardening v1, Phase 7 (R7.1).
//
// The active-effect MUTATION cluster (addActiveEffect / updateActiveEffect / deleteActiveEffect),
// extracted VERBATIM from data-access.ts (branch-by-abstraction Migrate; FoundryDataAccess keeps thin
// facade delegates until the Phase 8 Contract step). Effect READS (listActiveEffects /
// getActiveEffectByName) stay on FoundryDataAccess — keeps this file < 600 and avoids churning the LIVE
// da-effects / tool-opportunities read pierces.
//
// Seams: the injected validateState callback (was this.validateFoundryState — the cluster uses NO
// auditLog, unlike scene-placement) + the 4 shared document resolvers imported from services/shared/
// (no cross-service import — they are not flat service files). buildEffectPayload is lazy-imported inside
// the methods exactly as before; verifyDocWrite + notify are the same module imports.
//
// HC1: method bodies are byte-identical to the originals; the only change is `this.validateFoundryState()`
// → `this.validateState()` (the injected seam).

import { notify } from '../notify.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyDocWrite } from '../utils/verifyWrite.js';
import { _resolveActor, _resolveItem, _findEffect, _targetToResolverInput } from './shared/document-resolver.js';
import { buildOutcomeResponse } from './shared/outcome-response.js';

export class EffectsService {
  constructor(private readonly validateState: () => void) {}

  async addActiveEffect(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effect: any;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    this.validateState();
    try {
      // buildEffectPayload is imported lazily to avoid a top-of-file shuffle.
      const { buildEffectPayload } = await import('@foundry-mcp/shared');

      // BUG-340/659: an `immediate`-trigger script can self-delete either by returning
      // false or by explicitly awaiting this.effect.delete() (both are documented recipes).
      // createEmbeddedDocuments then returns [] (the doc was removed inside the create op),
      // or the read-back is absent — but the script DID run. Detect this so the one-shot
      // self-deleting recipe is reported as success (fired + autoDeleted), not failure.
      const isSelfDeletingImmediate = (eff: any): boolean => {
        if (eff?.trigger !== 'immediate' || typeof eff?.script !== 'string') return false;
        const script = eff.script;
        return /\breturn\s+false\b/.test(script) || script.includes('this.effect.delete(');
      };
      // WFRP4e 9.6.3 can reject the surrounding createEmbeddedDocuments promise after an
      // explicit immediate delete has already succeeded.  The rejection comes from Foundry
      // attempting a second embedded-collection lookup with the transient effect's null id.
      // Keep this deliberately narrow: an arbitrary create error must never be reported as a
      // successful one-shot.
      const isPostSelfDeleteCreateError = (error: unknown): boolean =>
        isSelfDeletingImmediate(data.effect)
        && /undefined id \[null\] does not exist in the EmbeddedCollection collection/i.test(
          error instanceof Error ? error.message : String(error),
        );

      // --- actor-direct branch: effect lives directly on the actor ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = _resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effectPayload = buildEffectPayload(data.effect);
        let created: any[];
        try {
          created = await actor.createEmbeddedDocuments('ActiveEffect', [effectPayload]);
        } catch (error) {
          if (!isPostSelfDeleteCreateError(error)) throw error;
          notify.created('active-effect', data.effect.name, {
            summary: `on ${actor.name} (immediate one-shot — fired + self-deleted)`,
          });
          return buildOutcomeResponse('applied', {
            success: true,
            scope: 'actor-direct',
            actorId: actor.id,
            actorName: actor.name,
            itemId: null,
            itemName: null,
            effectId: null,
            effectName: data.effect.name,
            parentType: 'Actor' as const,
            fired: true,
            autoDeleted: true,
          });
        }
        if (!created || created.length === 0) {
          if (isSelfDeletingImmediate(data.effect)) {
            notify.created('active-effect', data.effect.name, {
              summary: `on ${actor.name} (immediate one-shot — fired + self-deleted)`,
            });
            return buildOutcomeResponse('applied', {
              success: true,
              scope: 'actor-direct',
              actorId: actor.id,
              actorName: actor.name,
              itemId: null,
              itemName: null,
              effectId: null,
              effectName: data.effect.name,
              parentType: 'Actor' as const,
              fired: true,
              autoDeleted: true,
            });
          }
          throw new Error('Failed to create ActiveEffect on actor');
        }

        const createdEffect: any = created[0];
        // CCR-2a re-read: verify the AE was persisted
        const fresh: any = actor.effects.get(createdEffect.id);
        if (!fresh) {
          if (isSelfDeletingImmediate(data.effect)) {
            notify.created('active-effect', createdEffect.name, {
              summary: `on ${actor.name} (immediate one-shot — fired + self-deleted)`,
            });
            return buildOutcomeResponse('applied', {
              success: true,
              scope: 'actor-direct',
              actorId: actor.id,
              actorName: actor.name,
              itemId: null,
              itemName: null,
              effectId: createdEffect.id,
              effectName: createdEffect.name,
              parentType: 'Actor' as const,
              fired: true,
              autoDeleted: true,
            });
          }
          throw new Error(`${ErrorTokens.ADD_ACTIVE_EFFECT_NOT_PERSISTED}: effect ${createdEffect.id} absent after create`);
        }

        notify.created('active-effect', createdEffect.name, {
          summary: `on ${actor.name}`,
          uuid: (createdEffect as any).uuid,
        });

        const base: any = {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          actorName: actor.name,
          itemId: null,
          itemName: null,
          effectId: createdEffect.id,
          effectName: createdEffect.name,
          parentType: 'Actor' as const,
        };
        if (data.returnFullPayload === true) {
          base.effectData = createdEffect.toObject?.() ?? null;
        }
        return buildOutcomeResponse('applied', base);
      }

      // --- item path (scope:'actor' or scope:'world') — unchanged ---
      const { item, owner, scope } = _resolveItem(_targetToResolverInput(data.target as any));
      const effectPayload = buildEffectPayload(data.effect);
      let created: any[];
      try {
        created = await item.createEmbeddedDocuments('ActiveEffect', [effectPayload]);
      } catch (error) {
        if (!isPostSelfDeleteCreateError(error)) throw error;
        notify.created('active-effect', data.effect.name, {
          summary: `on ${item.name} (immediate one-shot — fired + self-deleted)`,
        });
        return buildOutcomeResponse('applied', {
          success: true,
          scope,
          actorId: owner?.id ?? null,
          itemId: item.id,
          itemName: item.name,
          effectId: null,
          effectName: data.effect.name,
          fired: true,
          autoDeleted: true,
        });
      }
      if (!created || created.length === 0) {
        if (isSelfDeletingImmediate(data.effect)) {
          notify.created('active-effect', data.effect.name, {
            summary: `on ${item.name} (immediate one-shot — fired + self-deleted)`,
          });
          return buildOutcomeResponse('applied', {
            success: true,
            scope,
            actorId: owner?.id ?? null,
            itemId: item.id,
            itemName: item.name,
            effectId: null,
            effectName: data.effect.name,
            fired: true,
            autoDeleted: true,
          });
        }
        throw new Error('Failed to create ActiveEffect');
      }

      const createdEffect: any = created[0];
      // RC1.1a re-read: mirror the actor-direct branch's :77 verify (CORE-02) — confirm the
      // item-embedded AE actually persisted before returning success.
      if (!item.effects.get(createdEffect.id)) {
        if (isSelfDeletingImmediate(data.effect)) {
          notify.created('active-effect', createdEffect.name, {
            summary: `on ${item.name} (immediate one-shot — fired + self-deleted)`,
          });
          return buildOutcomeResponse('applied', {
            success: true,
            scope,
            actorId: owner?.id ?? null,
            itemId: item.id,
            itemName: item.name,
            effectId: createdEffect.id,
            effectName: createdEffect.name,
            fired: true,
            autoDeleted: true,
          });
        }
        throw new Error(`${ErrorTokens.ADD_ACTIVE_EFFECT_NOT_PERSISTED}: effect ${createdEffect.id} absent after create`);
      }

      // Canvas-anchored tooltip when effect's owning item belongs to an actor
      // that has a token placed on the current scene.
      const ownerActorId: string | null = owner?.id ?? null;
      const placedToken: any = ownerActorId
        ? (globalThis as any).canvas?.tokens?.placeables?.find((t: any) => t?.actor?.id === ownerActorId)
        : null;
      const tokenDoc = placedToken?.document;
      notify.created('active-effect', createdEffect.name, {
        summary: `on ${item.name}`,
        uuid: (createdEffect as any).uuid,
        tooltip: tokenDoc ? { tokenDoc, message: `+${createdEffect.name}` } : undefined,
      });

      const base: any = {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        itemName: item.name,
        effectId: createdEffect.id,
        effectName: createdEffect.name,
      };
      if (data.returnFullPayload === true) {
        base.effectData = createdEffect.toObject?.() ?? null;
      }
      return buildOutcomeResponse('applied', base);
    } catch (error) {
      throw new Error(
        `Failed to add active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 5 follow-up B — partial update an existing ActiveEffect.
   * Phase 4 mcp_coverage_expansion — also handles scope:'actor-direct' (effect on the actor itself).
   * Flat input is inflated via buildEffectPayload; merge semantics preserve
   * unlisted fields on the effect.
   */
  async updateActiveEffect(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effectId?: string | undefined;
    effectName?: string | undefined;
    updates: any;
    returnFullPayload?: boolean | undefined;
  }): Promise<any> {
    this.validateState();
    if (!data.effectId && !data.effectName) {
      throw new Error('updateActiveEffect requires one of effectId or effectName');
    }
    try {
      const { buildEffectPayload } = await import('@foundry-mcp/shared');

      // --- actor-direct branch ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = _resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effect: any = _findEffect(actor, data.effectId, data.effectName);

        const mergedFlat: any = {
          name: data.updates.name ?? effect.name,
          trigger: data.updates.trigger ?? effect.system?.scriptData?.[0]?.trigger ?? 'manual',
          script: data.updates.script ?? effect.system?.scriptData?.[0]?.script ?? '',
          ...data.updates,
        };
        const fullInflated = buildEffectPayload(mergedFlat);

        const updatePayload: Record<string, unknown> = {};
        const touchedScript = 'trigger' in data.updates || 'script' in data.updates || 'label' in data.updates;
        const touchedTransfer = 'transfer' in data.updates;
        for (const key of Object.keys(data.updates)) {
          if (key === 'trigger' || key === 'script' || key === 'label') continue;
          if (key === 'transfer') continue;
          updatePayload[key] = (fullInflated as any)[key] ?? data.updates[key];
        }
        if (touchedScript) updatePayload['system.scriptData'] = (fullInflated as any).system.scriptData;
        if (touchedTransfer) updatePayload['system.transferData'] = (fullInflated as any).system.transferData;

        const flatUpdate = (foundry as any).utils.flattenObject(updatePayload) as Record<string, unknown>;
        const beforeValues: Record<string, unknown> = {};
        for (const path of Object.keys(flatUpdate)) {
          if (path.includes('.-=')) continue;
          beforeValues[path] = (foundry as any).utils.getProperty(effect, path);
        }

        const updateResult = await effect.update(updatePayload);

        if (updateResult === undefined) {
          const cancelled = Object.entries(flatUpdate)
            .filter(([path]) => !path.includes('.-='))
            .filter(([path, expected]) => JSON.stringify(beforeValues[path]) !== JSON.stringify(expected));
          if (cancelled.length > 0) {
            const preview = cancelled.slice(0, 3).map(([path, expected]) =>
              `${path}: expected ${JSON.stringify(expected)}, before ${JSON.stringify(beforeValues[path])}`
            ).join('; ');
            throw new Error(
              `${ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED}: effect.update() returned undefined. ${preview}`,
            );
          }
        }

        // CCR-2a re-read
        let freshEffect: any;
        try {
          freshEffect = _findEffect(actor, effect.id);
        } catch {
          throw new Error(`${ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED}: effect ${effect.id} disappeared after update`);
        }
        // BUG-342: foundry.utils.flattenObject treats arrays as LEAF values, so the whole
        // `system.scriptData` array is a single flat key. Its wfrp4e-managed `options`
        // sub-object is normalized on write (live keys: targeter/defending/runIfDisabled/
        // deleteEffect/showDuplicates) and never matches the MCP payload template, so a
        // whole-array compare false-fails. Skip the array from the generic drift verify and
        // instead verify the caller-meaningful scriptData[0] fields (script/trigger/label) landed.
        const scriptDataSkip = touchedScript ? ['system.scriptData'] : [];
        verifyDocWrite(freshEffect, flatUpdate, ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED, { skipPaths: scriptDataSkip });
        if (touchedScript) {
          const sd0: any = (freshEffect as any).system?.scriptData?.[0] ?? {};
          for (const f of ['script', 'trigger', 'label'] as const) {
            if (typeof data.updates[f] === 'string' && sd0[f] !== data.updates[f]) {
              throw new Error(
                `${ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED}: scriptData.${f} did not persist (expected ${JSON.stringify(data.updates[f])}, got ${JSON.stringify(sd0[f])})`,
              );
            }
          }
        }

        notify.updated('active-effect', effect.name, {
          summary: `on ${actor.name}`,
          uuid: (effect as any).uuid,
        });

        const base: any = {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          actorName: actor.name,
          itemId: null,
          itemName: null,
          effectId: effect.id,
          effectName: effect.name,
          updated: Object.keys(updatePayload),
          parentType: 'Actor' as const,
        };
        if (data.returnFullPayload === true) {
          base.effectData = freshEffect.toObject?.() ?? null;
        }
        return base;
      }

      // --- item path (scope:'actor' or scope:'world') — unchanged ---
      const { item, owner, scope } = _resolveItem(_targetToResolverInput(data.target as any));
      const effect: any = _findEffect(item, data.effectId, data.effectName);

      // If updates contains flat keys that map through buildEffectPayload
      // (name, trigger, script, label, transfer, disabled, changes, statuses,
      // duration, flags, equipTransfer, enableScript, preApplyScript,
      // testIndependent), inflate the subset. buildEffectPayload REQUIRES
      // `name` and `trigger`; for a partial update we synthesize those from
      // the existing effect if absent.
      const mergedFlat: any = {
        name: data.updates.name ?? effect.name,
        trigger:
          data.updates.trigger ??
          effect.system?.scriptData?.[0]?.trigger ??
          'manual',
        script:
          data.updates.script ??
          effect.system?.scriptData?.[0]?.script ??
          '',
        ...data.updates,
      };
      const fullInflated = buildEffectPayload(mergedFlat);

      // Build a minimal update payload: only the top-level keys the caller
      // actually supplied get written (merge semantics), except when those
      // keys' values live in nested system.* paths that buildEffectPayload
      // rebuilds — for those, we pass the rebuilt subtree.
      const updatePayload: Record<string, unknown> = {};
      const touchedScript =
        'trigger' in data.updates || 'script' in data.updates || 'label' in data.updates;
      const touchedTransfer = 'transfer' in data.updates;
      for (const key of Object.keys(data.updates)) {
        if (key === 'trigger' || key === 'script' || key === 'label') continue;
        if (key === 'transfer') continue;
        updatePayload[key] = (fullInflated as any)[key] ?? data.updates[key];
      }
      if (touchedScript) {
        updatePayload['system.scriptData'] = (fullInflated as any).system.scriptData;
      }
      if (touchedTransfer) {
        updatePayload['system.transferData'] = (fullInflated as any).system.transferData;
      }

      // Snapshot before-values for the undefined-cancel guard (mirrors updateItem:4665).
      const flatUpdate = (foundry as any).utils.flattenObject(updatePayload) as Record<string, unknown>;
      const beforeValues: Record<string, unknown> = {};
      for (const path of Object.keys(flatUpdate)) {
        if (path.includes('.-=')) continue;
        beforeValues[path] = (foundry as any).utils.getProperty(effect, path);
      }

      const updateResult = await effect.update(updatePayload);

      // BUG-216: full DP-16 post-verify (token: UPDATE_ACTIVE_EFFECT_NOT_PERSISTED).
      if (updateResult === undefined) {
        const cancelled = Object.entries(flatUpdate)
          .filter(([path]) => !path.includes('.-='))
          .filter(([path, expected]) => JSON.stringify(beforeValues[path]) !== JSON.stringify(expected));
        if (cancelled.length > 0) {
          const preview = cancelled.slice(0, 3).map(([path, expected]) =>
            `${path}: expected ${JSON.stringify(expected)}, before ${JSON.stringify(beforeValues[path])}`
          ).join('; ');
          throw new Error(
            `${ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED}: effect.update() returned undefined (preUpdate cancelled write?). ${preview}`,
          );
        }
      }
      // BUG-279: _findEffect throws when not found, so wrap in try/catch to make the
      // UPDATE_ACTIVE_EFFECT_NOT_PERSISTED sentinel reachable.
      let freshEffect: any;
      try {
        freshEffect = _findEffect(item, effect.id);
      } catch {
        throw new Error(`${ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED}: effect ${effect.id} disappeared after update`);
      }
      // BUG-342: foundry.utils.flattenObject treats arrays as LEAF values, so the whole
      // `system.scriptData` array is a single flat key whose wfrp4e-normalized `options`
      // sub-object never matches the MCP payload template (whole-array compare false-fails).
      // Skip it from the generic drift verify; verify the meaningful scriptData[0] fields instead.
      const scriptDataSkip = touchedScript ? ['system.scriptData'] : [];
      verifyDocWrite(freshEffect, flatUpdate, ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED, { skipPaths: scriptDataSkip });
      if (touchedScript) {
        const sd0: any = (freshEffect as any).system?.scriptData?.[0] ?? {};
        for (const f of ['script', 'trigger', 'label'] as const) {
          if (typeof data.updates[f] === 'string' && sd0[f] !== data.updates[f]) {
            throw new Error(
              `${ErrorTokens.UPDATE_ACTIVE_EFFECT_NOT_PERSISTED}: scriptData.${f} did not persist (expected ${JSON.stringify(data.updates[f])}, got ${JSON.stringify(sd0[f])})`,
            );
          }
        }
      }

      notify.updated('active-effect', effect.name, {
        summary: `on ${item.name}`,
        uuid: (effect as any).uuid,
      });

      const base: any = {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        effectId: effect.id,
        effectName: effect.name,
        updated: Object.keys(updatePayload),
      };
      if (data.returnFullPayload === true) {
        base.effectData = freshEffect.toObject?.() ?? null;
      }
      return base;
    } catch (error) {
      throw new Error(
        `Failed to update active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Phase 5 follow-up B — remove an ActiveEffect from an item.
   * Phase 4 mcp_coverage_expansion — also handles scope:'actor-direct' (effect on the actor itself).
   */
  async deleteActiveEffect(data: {
    target:
    | { scope: 'actor'; actorId?: string | undefined; actorName?: string | undefined; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'world'; itemId?: string | undefined; itemName?: string | undefined }
    | { scope: 'actor-direct'; actorId?: string | undefined; actorName?: string | undefined };
    effectId?: string | undefined;
    effectName?: string | undefined;
  }): Promise<any> {
    this.validateState();
    if (!data.effectId && !data.effectName) {
      throw new Error('deleteActiveEffect requires one of effectId or effectName');
    }
    try {
      // --- actor-direct branch ---
      if (data.target.scope === 'actor-direct') {
        const actorDirect = data.target as { scope: 'actor-direct'; actorId?: string; actorName?: string };
        const actor = _resolveActor(actorDirect.actorId, actorDirect.actorName);
        const effect: any = _findEffect(actor, data.effectId, data.effectName);
        const effectId: string = effect.id;
        const effectName: string = effect.name;
        await actor.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
        // CCR-2a verify gone
        if (actor.effects.get(effectId)) {
          throw new Error(`${ErrorTokens.DELETE_ACTIVE_EFFECT_NOT_PERSISTED}: effect ${effectId} still present after delete`);
        }
        notify.deleted('active-effect', effectName, { summary: `from ${actor.name}` });
        return {
          success: true,
          scope: 'actor-direct',
          actorId: actor.id,
          actorName: actor.name,
          itemId: null,
          effectId,
          effectName,
          parentType: 'Actor' as const,
        };
      }

      // --- item path (scope:'actor' or scope:'world') — unchanged ---
      const { item, owner, scope } = _resolveItem(_targetToResolverInput(data.target as any));
      const effect: any = _findEffect(item, data.effectId, data.effectName);
      const effectId: string = effect.id;
      const effectName: string = effect.name;
      await item.deleteEmbeddedDocuments('ActiveEffect', [effectId]);
      // RC1.1a verify gone — mirror the actor-direct branch's :450 absence check.
      if (item.effects.get(effectId)) {
        throw new Error(`${ErrorTokens.DELETE_ACTIVE_EFFECT_NOT_PERSISTED}: effect ${effectId} still present after delete`);
      }
      notify.deleted('active-effect', effectName, { summary: `from ${item.name}` });
      return {
        success: true,
        scope,
        actorId: owner?.id ?? null,
        itemId: item.id,
        effectId,
        effectName,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete active effect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
