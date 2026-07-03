// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 3 — Item Piles action catalog.
//
// Per-action { dataDefaults, preChecks, danger } map (mirrors MATT action-catalog + mastercrafted pattern).
// Pure module — NO Foundry global imports → unit-testable.
//
// Safety contract from subagent-2 source audit:
//   C1–C4: items array guard (addItems/removeItems/transferItems/tradeItems forEach/map — no array guard)
//   C5:    createItemPile sceneId required (game.user.viewedScene = null server-side)
//   C6/C7: turnTokensIntoItemPiles/revertTokensFromItemPiles hard instanceof Token check — UUID strings rejected
//   C8:    splitItemPileContents targets omitted + no active player chars → silent no-op
//   C9:    updateMerchantPriceModifiers relative:true with undefined modifier → silent NaN
//   C10:   deleteItemPile needs Token UUID (contains "Token"), not Actor UUID
//   C11:   every socket method returns false (not throw) with no active GM
//   Asymmetric default: addItems.removeExistingActorItems=false (safe) vs refreshMerchantInventory=true (wipes)

export type PreCheckResult = null | { error: string };

export interface CatalogEntry {
  /** Defaults injected before calling the API (to avoid undefined-default crashes). */
  dataDefaults: Record<string, unknown>;
  /** Description of what this action does (for documentation). */
  description: string;
  /** Whether this action requires explicit confirm:true (CCR-4 dangerous write). */
  danger: boolean;
  /** Whether this action routes through a socket (needs active GM). */
  requiresActiveGm: boolean;
}

/** C11: pre-check gate — returns error string if no active GM is present, null if GM is active. */
export function checkActiveGm(game: any): string | null {
  if (!game?.users) return 'NO_ACTIVE_GM: game.users not available';
  const activeGm = game.users.find((u: any) => u.isGM && u.active);
  if (!activeGm) return 'NO_ACTIVE_GM: no active GM client detected — item-piles socket operations require an active GM';
  return null;
}

/** C1–C4: ensure items is always an array (prevent forEach/map TypeError).
 *  C-8: remap id→_id so removeItems/transferItems (which read only _id) don't crash
 *  when callers pass {id} objects (item-piles.js:98494, 98546).
 */
export function normalizeItemsArray(items: unknown): unknown[] {
  let arr: unknown[];
  if (Array.isArray(items)) arr = items;
  else if (items == null) return [];
  else arr = [items];

  return arr.map((entry) => {
    if (entry && typeof entry === 'object') {
      const obj = entry as Record<string, unknown>;
      if (obj['id'] !== undefined && obj['_id'] === undefined) {
        return { ...obj, _id: obj['id'] };
      }
    }
    return entry;
  });
}

/** C10: validate that a UUID looks like a Token UUID (for deleteItemPile) */
export function validateTokenUuid(uuid: string): string | null {
  if (!uuid.includes('Token')) {
    return 'INVALID_PILE_UUID: deleteItemPile requires a Token UUID (must contain "Token"), not an Actor UUID. Use the Token\'s UUID from the scene.';
  }
  return null;
}

/** C9: validate that price modifier values are finite numbers when relative:true */
export function validateRelativeModifier(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) return null; // field omitted = OK (won't be relative-applied)
  if (typeof value !== 'number' || !isFinite(value)) {
    return `INVALID_MODIFIER: ${fieldName} must be a finite number when relative:true — non-finite value would silently corrupt prices`;
  }
  return null;
}

/** Currency string format: "Xgc Yss Zbp" — at least one gc/ss/bp component required.
 *  item-piles' getPriceFromString extracts currency ONLY via the gc/ss/bp identifiers
 *  (bare numbers and full names yield zero currencies → ADD_CURRENCY_ERROR), so a string
 *  with no identifier is unparseable. Rejecting it here is a strict subset of what item-piles
 *  would reject — no valid string is over-rejected (BUG-376). */
export function validateCurrencyString(currency: string): string | null {
  if (!currency || currency.trim() === '') {
    return 'INVALID_CURRENCY_STRING: currency must be a non-empty string like "5gc 3ss 12bp"';
  }
  // item-piles strips spaces/commas and lowercases before matching the gc/ss/bp identifiers.
  if (!/gc|ss|bp/i.test(currency)) {
    return `INVALID_CURRENCY_STRING: no gc/ss/bp component found in "${currency}" — use a string like "5gc 3ss 12bp"`;
  }
  return null;
}

/** The action catalog: all 17 actions */
export function getActionCatalog(): Record<string, CatalogEntry> {
  return {
    'create-pile': {
      description: 'Create a new item pile token on a scene (createItemPile). sceneId REQUIRED — game.user.viewedScene is null server-side (C5).',
      dataDefaults: { type: 'pile', items: [], currencies: '' },
      danger: false,
      requiresActiveGm: true,
    },
    'update-pile': {
      description: 'Update item pile configuration flags on an actor (updateItemPile). Safe — updates flags only.',
      dataDefaults: {},
      danger: false,
      requiresActiveGm: true,
    },
    'delete-pile': {
      description: 'Delete an item pile token permanently (deleteItemPile). Requires Token UUID (C10). DANGEROUS — permanent deletion.',
      dataDefaults: {},
      danger: true,
      requiresActiveGm: true,
    },
    'set-pile-state': {
      description: 'Open/close/lock/unlock/rattle a pile, or turn/revert tokens. turnTokens/revertTokens require live Token objects (C6/C7 — resolve via fromUuidSync).',
      dataDefaults: {},
      danger: false, // revert mode is confirm-gated in handler
      requiresActiveGm: true,
    },
    'get-contents': {
      description: 'Read items, currencies, flag data, and type-check results from an item pile (read-only).',
      dataDefaults: {},
      danger: false,
      requiresActiveGm: false,
    },
    'add-items': {
      description: 'Add items to a pile actor (addItems). items array required — forEach crash on null/undefined (C1).',
      dataDefaults: { items: [], removeExistingActorItems: false },
      danger: false,
      requiresActiveGm: true,
    },
    'remove-items': {
      description: 'Remove items from a pile actor (removeItems). items array required — forEach crash on null/undefined (C2).',
      dataDefaults: { items: [] },
      danger: false,
      requiresActiveGm: true,
    },
    'transfer-items': {
      description: 'Transfer items between actors (transferItems/transferAllItems/combineItemPiles). items array required (C3). transferAll and combine modes are confirm-gated.',
      dataDefaults: { items: [] },
      danger: false, // all/combine modes: confirm-gated in handler
      requiresActiveGm: true,
    },
    'add-currency': {
      description: 'Add currency to an actor (addCurrencies). Currency string "Xgc Yss Zbp".',
      dataDefaults: {},
      danger: false,
      requiresActiveGm: true,
    },
    'remove-currency': {
      description: 'Remove currency from an actor (removeCurrencies). Pre-check getActorCurrencies for insufficient balance. DANGEROUS — permanent deduction.',
      dataDefaults: {},
      danger: true,
      requiresActiveGm: true,
    },
    'transfer-currency': {
      description: 'Transfer currencies between actors (transferCurrencies/transferAllCurrencies). transferAll mode is confirm-gated.',
      dataDefaults: {},
      danger: false,
      requiresActiveGm: true,
    },
    'split-loot': {
      description: 'Distribute pile contents among party (splitItemPileContents). targets REQUIRED — omitting targets with no active player chars → silent no-op (C8).',
      dataDefaults: {},
      danger: true,
      requiresActiveGm: true,
    },
    'vault-info': {
      description: 'Read vault grid data, fit-check items, get vault config (canItemFitInVault/fitItemsIntoVault/getVaultGridData). Read-only.',
      dataDefaults: {},
      danger: false,
      requiresActiveGm: false,
    },
    'roll-item-table': {
      description: 'Roll a RollTable and optionally add results to a target actor (rollItemTable).',
      dataDefaults: { timesToRoll: 1, removeExistingActorItems: false },
      danger: false,
      requiresActiveGm: true,
    },
    'refresh-merchant': {
      description: 'Refresh merchant inventory from tables (refreshMerchantInventory). removeExistingActorItems defaults FALSE here (asymmetric default — the API default is TRUE which wipes; flipped to safe). DANGEROUS when removeExistingActorItems:true.',
      dataDefaults: { removeExistingActorItems: false },
      danger: false, // confirm-gated in handler when removeExistingActorItems:true
      requiresActiveGm: true,
    },
    'trade-items': {
      description: 'Scripted merchant sale with price validation and currency exchange (tradeItems). items array required (C4). DANGEROUS — currency deducted.',
      dataDefaults: { items: [] },
      danger: true,
      requiresActiveGm: true,
    },
    'update-price-modifiers': {
      description: 'Get or update per-actor merchant price modifiers (getMerchantPriceModifiers/updateMerchantPriceModifiers/getPricesForItem). relative:true requires finite numbers (C9).',
      dataDefaults: {},
      danger: false,
      requiresActiveGm: false, // reads; writes need GM but handler checks
    },
  };
}
