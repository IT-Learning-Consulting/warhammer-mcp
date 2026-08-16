// DIALOG-PATH: DIALOG_FREE — pure read helper over API.getActorItems; no module write paths, no dialog risk.
// BUG-445 (bugfix sprint 444-459, D8): shared quantity-dimension verify for item-piles
// DP-16 post-write checks. Distinct-item COUNT is the wrong dimension whenever item-piles
// stack-merges same-name items (trade-items into a buyer already holding a stack) or removes
// part of a stack (remove-items 1-of-2 → count static, quantity 2→1) — successful writes
// false-failed as *_NOT_PERSISTED and retry-on-error double-charged. Measure TOTAL QUANTITY
// (sum of system.quantity.value, quantity-less items counting 1) over the affected item
// name/id family instead.

/** Optional filter narrowing the sum to an item family (matched by embedded id OR name). */
export interface ItemFamily {
  names?: Set<string>;
  ids?: Set<string>;
}

/**
 * Total quantity over an actor's items (via API.getActorItems), optionally filtered to a
 * name/id family. Items without a numeric quantity count as 1.
 */
export function totalQuantity(API: any, actorUuid: string, family?: ItemFamily): number {
  // BUG-775: item-piles.js:34919 excludes every currency-registered item from getActorItems
  // by DEFAULT (getItemCurrencies:false); WFRP4e registers money items as item-type currencies,
  // so a generic add-items/remove-items call that only touched money was invisible to this
  // verify — before/after totals read identical, and a genuinely successful coin mutation
  // false-failed as *_NOT_PERSISTED. Upstream's own internal transfer callers (item-piles.js
  // :98491,98543,98630,98841,98897) pass getItemCurrencies:true for exactly this reason.
  const items = API.getActorItems(actorUuid, { getItemCurrencies: true });
  return (Array.isArray(items) ? items : [])
    .filter((item: any) => {
      if (!family) return true;
      const id = String(item?.id ?? item?._id ?? '');
      const name = String(item?.name ?? '');
      return (family.ids?.has(id) ?? false) || (family.names?.has(name) ?? false);
    })
    .reduce((acc: number, item: any) => {
      const q = item?.system?.quantity?.value ?? item?.system?.quantity;
      const n = Number(q);
      return acc + (q !== undefined && q !== null && Number.isFinite(n) ? n : 1);
    }, 0);
}
