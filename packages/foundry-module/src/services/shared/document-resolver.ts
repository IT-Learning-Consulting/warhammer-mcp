// Shared document resolvers — extracted VERBATIM from FoundryDataAccess (Phase 7.3.1, R7.1).
//
// These four were private methods (_resolveActor / _resolveItem / _findEffect /
// _targetToResolverInput) with ZERO `this.` references — pure lookups over game.actors /
// game.items / a passed doc. They are shared by ItemService (_resolveItem), EffectsService
// (all four) AND the surviving FoundryDataAccess effect READS (getActiveEffectByName /
// listActiveEffects).
//
// PLACEMENT (Phase 7 user decision, 2026-06-16): services/shared/ — NOT a flat services/<svc>.ts,
// so dep-cruiser `no-cross-service-import` (which matches only flat service files) permits every
// service + data-access to import it; AND the lint-ratchet `**/services/**` glob exempts per-function
// caps (file-cap only) — the blessed mechanism for verbatim large-method moves whose pre-existing
// complexity (e.g. _resolveItem = 46) cannot meet the utils/ complexity-10 cap without breaking HC1.
//
// HC1: bodies are byte-identical to the data-access originals. The only non-body change is hoisting
// _resolveItem's inline param/return object types to named aliases (compile-time only).

export type ResolveItemTarget = {
  actorId?: string | undefined;
  itemId?: string | undefined;
  itemName?: string | undefined;
  destination?:
  | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
  | { type: 'world'; folder?: string[] | undefined }
  | undefined;
};

export type ResolveItemResult = { item: any; owner: any | null; scope: 'actor' | 'world' };

export function _resolveActor(actorId?: string, actorName?: string): any {
  let actor: any = null;
  if (actorId) actor = (game.actors as any)?.get(actorId) ?? null;
  if (!actor && actorName) {
    const wanted = actorName.toLowerCase();
    actor = (game.actors as any)?.find((a: any) => a.name?.toLowerCase() === wanted) ?? null;
  }
  if (!actor) {
    throw new Error(`Actor not found: ${actorId ?? actorName ?? '(no identifier)'}`);
  }
  return actor;
}

/**
 * Resolve an item to its doc + (optional) owning actor.
 * Unifies actor-embedded and world-scope lookup across updateItem / deleteItem
 * / addActiveEffect / updateActiveEffect / deleteActiveEffect.
 *
 * Accepts two target shapes:
 *  - legacy `{actorId, itemId}` — actor-embedded lookup by id.
 *  - new `{destination, itemId?, itemName?}` — route on destination.type.
 * World-scope branch does NOT take an owner.
 */
export function _resolveItem(target: ResolveItemTarget): ResolveItemResult {
  const dest = target.destination;
  const hasActorLegacy = !!target.actorId;
  if (!dest && !hasActorLegacy) {
    throw new Error('Either `actorId` or `destination` must be supplied to resolve an item');
  }

  // World scope
  if (dest?.type === 'world') {
    const items: any = game.items as any;
    let item: any = null;
    if (target.itemId) item = items?.get?.(target.itemId) ?? null;
    if (!item && target.itemName) {
      const wanted = target.itemName.toLowerCase();
      item = items?.find?.((i: any) => i.name?.toLowerCase() === wanted) ?? null;
    }
    if (!item) {
      throw new Error(
        `World item "${target.itemName ?? target.itemId ?? '(no identifier)'}" not found in Items sidebar`
      );
    }
    return { item, owner: null, scope: 'world' };
  }

  // Actor scope (explicit destination or legacy actorId)
  let actor: any = null;
  if (dest?.type === 'actor') {
    if (dest.actorId) actor = (game.actors as any)?.get(dest.actorId) ?? null;
    if (!actor && dest.actorName) {
      const wanted = dest.actorName.toLowerCase();
      actor = (game.actors as any)?.find((a: any) => a.name?.toLowerCase() === wanted) ?? null;
    }
  } else if (hasActorLegacy) {
    actor = (game.actors as any)?.get(target.actorId!) ?? null;
  }
  if (!actor) {
    const ident =
      dest?.type === 'actor' ? dest.actorId ?? dest.actorName : target.actorId;
    throw new Error(`Actor not found: ${ident ?? '(no identifier)'}`);
  }

  let item: any = null;
  if (target.itemId) item = actor.items?.get?.(target.itemId) ?? null;
  if (!item && target.itemName) {
    const wanted = target.itemName.toLowerCase();
    item = actor.items?.find?.((i: any) => i.name?.toLowerCase() === wanted) ?? null;
  }
  if (!item) {
    throw new Error(
      `Item "${target.itemName ?? target.itemId ?? '(no identifier)'}" not found on ${actor.name}`
    );
  }
  return { item, owner: actor, scope: 'actor' };
}

export function _findEffect(doc: any, effectId?: string, effectName?: string): any {
  const effects: any[] = (doc.effects as any)?.contents ?? Array.from(doc.effects ?? []);
  let found: any = null;
  if (effectId) found = effects.find((e: any) => e.id === effectId) ?? null;
  if (!found && effectName) {
    const wanted = effectName.toLowerCase();
    found = effects.find((e: any) => e.name?.toLowerCase() === wanted) ?? null;
  }
  if (!found) {
    throw new Error(
      `Effect "${effectName ?? effectId ?? '(no identifier)'}" not found on "${doc.name}"`
    );
  }
  return found;
}

export function _targetToResolverInput(target: any): {
  itemId?: string | undefined;
  itemName?: string | undefined;
  destination:
  | { type: 'actor'; actorId?: string | undefined; actorName?: string | undefined }
  | { type: 'world' };
} {
  if (target?.scope === 'world') {
    return {
      itemId: target.itemId,
      itemName: target.itemName,
      destination: { type: 'world' },
    };
  }
  return {
    itemId: target.itemId,
    itemName: target.itemName,
    destination: {
      type: 'actor',
      actorId: target.actorId,
      actorName: target.actorName,
    },
  };
}
