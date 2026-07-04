// DIALOG-PATH: DIALOG_FREE — dispatcher delegates to per-seam handler files; the create-pile dialog-investigation now lives in container.ts (DIALOG_INVESTIGATED).
// Module Integration v1 Phase 3 — module-itempiles handler (Item Piles v3.3.2).
//
// 17-action umbrella: pile lifecycle, container state, item/currency ops, merchant,
// vault, rolltable, trade, price modifiers, loot split.
//
// mcp_code_quality_v2 Phase C3 (19a) split: this file is now a thin dispatcher; handler bodies
// moved VERBATIM to helpers.ts / container.ts / flow.ts / merchant.ts (zero behavioral change —
// behavior freeze HC3/HC13). queries.ts registration is UNCHANGED: it imports only
// dispatchModuleItempiles from this same path/export.
//
// Design constraints (unchanged — see the seam files for the per-handler comments):
//   - requireModuleActive('item-piles') is the FIRST executable statement — RETURNS failure, never throws.
//   - Catalog dataDefaults injected before each API call (C1–C9 crash prevention).
//   - Pre-check gates return structured errors before calling the API.
//   - turnTokens/revertTokens MUST resolve fromUuidSync(uuid)?.object — API hard-rejects UUID strings (C6/C7).
//   - No active GM → NO_ACTIVE_GM structured error on socket-routed actions (C11).
//   - banker/auctioneer pile types → MODULE_DEPENDENCY_NOT_ACTIVE (companion not installed).
//   - DP-16: post-write re-read via getActorFlagData/getActorItems/getActorCurrencies.
//   - CCR-3: notify.* once per write, after verify.
//   - CCR-4: confirm:true required for dangerous actions (delete-pile, split-loot,
//            remove-currency, refresh-merchant with removeExistingActorItems:true,
//            transfer-items all/combine modes, revert mode).
//   - Simple Calendar openTimes GUIDANCE_ONLY warning (not enforced, but warned).
//
// Sources: phase3_pre_plan.md §Confirmed facts; dossier §3, §4; item-piles.js source audit;
// phaseC3_pre_plan.md §19a (split design).

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleItempilesInput, type ModuleItempilesInputType } from '@foundry-mcp/shared';
import {
  handleCreatePile,
  handleUpdatePile,
  handleDeletePile,
  handleSetPileState,
  handleGetContents,
} from './container.js';
import {
  handleAddItems,
  handleRemoveItems,
  handleTransferItems,
  handleAddCurrency,
  handleRemoveCurrency,
  handleTransferCurrency,
  handleSplitLoot,
} from './flow.js';
import {
  handleVaultInfo,
  handleRollItemTable,
  handleRefreshMerchant,
  handleTradeItems,
  handleUpdatePriceModifiers,
} from './merchant.js';

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleItempiles(data: unknown): Promise<any> {
  const g = requireModuleActive('item-piles');
  if (g) return g;

  const parsed: ModuleItempilesInputType = ModuleItempilesInput.parse(data);

  switch (parsed.action) {
    case 'create-pile':           return handleCreatePile(parsed);
    case 'update-pile':           return handleUpdatePile(parsed);
    case 'delete-pile':           return handleDeletePile(parsed);
    case 'set-pile-state':        return handleSetPileState(parsed);
    case 'get-contents':          return handleGetContents(parsed);
    case 'add-items':             return handleAddItems(parsed);
    case 'remove-items':          return handleRemoveItems(parsed);
    case 'transfer-items':        return handleTransferItems(parsed);
    case 'add-currency':          return handleAddCurrency(parsed);
    case 'remove-currency':       return handleRemoveCurrency(parsed);
    case 'transfer-currency':     return handleTransferCurrency(parsed);
    case 'split-loot':            return handleSplitLoot(parsed);
    case 'vault-info':            return handleVaultInfo(parsed);
    case 'roll-item-table':       return handleRollItemTable(parsed);
    case 'refresh-merchant':      return handleRefreshMerchant(parsed);
    case 'trade-items':           return handleTradeItems(parsed);
    case 'update-price-modifiers': return handleUpdatePriceModifiers(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-itempiles action: ${(_exhaustive as any).action}` };
    }
  }
}
