// DIALOG-PATH: DIALOG_FREE — every action is a retired short-circuit returning TRADING_PLACES_ACTION_RETIRED; no handler logic runs, no dialog paths.
// RETIRED (Phase 7g, D2/D6/D7): module-trading-places is fully retired — module-wfrp-economy's ported
// Phase 7f trading engine (24 trading-* actions) replaces it, live-proven before this retirement landed.
// Every one of the 19 legacy actions is intercepted below and returns a typed TRADING_PLACES_ACTION_RETIRED
// error naming its successor; NO handler logic runs anymore. Historical context (module singleton access
// quirks, currency-write routing deviations, haggle/gossip roll injection, season resolution, merchant
// generation) lived in this file's original doc comment through Phase 7f and is preserved in patch-log.md
// / the Phase 7g research memo, not repeated here now that the handlers themselves are gone.
//
// D6 ORDERING (inverts the Phase 7d precedent in wfrp-economy.ts, where RETIRED_ACTIONS is checked AFTER
// requireModuleActive because that module STAYS active): trading-places is being DISABLED as part of the
// same retirement, so requireModuleActive would return MODULE_NOT_ACTIVE for every call and the
// successor-naming message would be unreachable. The RETIRED_ACTIONS short-circuit therefore runs BEFORE
// requireModuleActive in the dispatcher below — a caller learns the successor action regardless of whether
// trading-places is enabled, disabled, or was never installed.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { TradingPlacesInput, type TradingPlacesInputType } from '@foundry-mcp/shared';
import { ErrorTokens } from '@foundry-mcp/shared';
import { Envelope } from '../_shared/handler-utils.js';

const MODULE_ID = 'trading-places';

// Names read from the live wfrp-economy schemas.ts action enum, never guessed (7e2 carry-forward
// discipline). The 3 currency ops map to the pre-existing wallet actions (D11 — no 1:1 trading-*
// successor exists for raw currency get/add/deduct).
const RETIRED_ACTIONS: Record<string, string> = {
  'list-settlements': 'trading-list-settlements',
  'list-cargo-types': 'trading-list-cargo-types',
  'get-season': 'trading-get-season',
  'set-season': 'trading-set-season',
  'check-availability': 'trading-check-availability',
  'calc-purchase-price': 'trading-calc-purchase-price',
  'calc-sale-price': 'trading-calc-sale-price',
  'haggle-test': 'trading-haggle-test',
  'gossip-test': 'trading-gossip-test',
  'add-cargo': 'trading-buy-cargo',
  'remove-cargo': 'trading-sell-cargo',
  'get-current-cargo': 'trading-get-hold',
  'get-transaction-history': "list-transactions (module-wfrp-economy, filter source:'trade')",
  'get-currency': 'get-wallet-balance (module-wfrp-economy)',
  'deduct-currency': 'wallet-remove (module-wfrp-economy)',
  'add-currency': 'wallet-add (module-wfrp-economy)',
  'merchant-generation': 'trading-generate-merchant',
  'get-price-modifiers': 'trading-get-price-modifiers',
  'set-price-modifiers': 'trading-set-price-modifiers',
};

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleTradingPlaces(data: unknown): Promise<Envelope<unknown>> {
  // D6: retirement short-circuit runs BEFORE requireModuleActive — see file header. Parse first (so a
  // malformed payload still gets TRADING_PLACES_INVALID_INPUT, not a retirement message for an action
  // that doesn't validate), then check retirement, THEN the module-active gate.
  let input: TradingPlacesInputType;
  try {
    input = TradingPlacesInput.parse(data);
  } catch (e) {
    return { success: false, error: `TRADING_PLACES_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  const retiredSuccessor = RETIRED_ACTIONS[input.action];
  if (retiredSuccessor) {
    return {
      success: false,
      error: `${ErrorTokens.TRADING_PLACES_ACTION_RETIRED}: ${input.action} retired by module-wfrp-economy (Phase 7g) — use ${retiredSuccessor}`,
    };
  }

  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  switch (input.action) {
    // Unreachable at runtime — RETIRED_ACTIONS intercepts every one of these above, before this switch
    // runs. Cases kept only so the `never` exhaustiveness check below stays meaningful (7d pattern,
    // wfrp-economy.ts:694-699) — ALL 19 actions are retired, so every case falls through to the same
    // shared return.
    case 'list-settlements':
    case 'list-cargo-types':
    case 'get-season':
    case 'set-season':
    case 'check-availability':
    case 'calc-purchase-price':
    case 'calc-sale-price':
    case 'haggle-test':
    case 'gossip-test':
    case 'add-cargo':
    case 'remove-cargo':
    case 'get-current-cargo':
    case 'get-transaction-history':
    case 'get-currency':
    case 'deduct-currency':
    case 'add-currency':
    case 'merchant-generation':
    case 'get-price-modifiers':
    case 'set-price-modifiers':
      return { success: false, error: `${ErrorTokens.TRADING_PLACES_ACTION_RETIRED}: ${input.action} retired by module-wfrp-economy (Phase 7g) — use ${RETIRED_ACTIONS[input.action]}` };
    default: {
      const _exhaustive: never = input;
      return { success: false, error: `TRADING_PLACES_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
    }
  }
}
