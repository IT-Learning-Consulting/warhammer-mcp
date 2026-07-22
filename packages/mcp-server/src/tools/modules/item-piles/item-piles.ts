// Module Integration v1 Phase 3 — module-itempiles MCP tool (Item Piles v3.3.2).
//
// Umbrella tool exposing 17 actions for the full Item Piles economy surface.
// Conditional: MODULE_NOT_ACTIVE returned when item-piles is absent/inactive.
// MODULE_DEPENDENCY_NOT_ACTIVE for banker/auctioneer pile types (companion not installed).
//
// Anchors:
//   - DP-15: typed this.query<T> — never <any> on response path.
//   - R2.4: errors route through the shared BaseTool.errorResponse (was a module-local errorContent helper).
//   - phase5 carry-forward F03: formatters emit EVERY return field.
//   - Phase 3 module_integration_v1 acceptance criteria #1–12.

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { truncatedJoin } from '../../../utils/truncate.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { z } from 'zod';
import { ModuleItempilesInput } from '@foundry-mcp/shared';

type ModuleItempilesArgs = z.infer<typeof ModuleItempilesInput>;
import type {
  ItemPileCreateResult,
  ItemPileUpdateResult,
  ItemPileDeleteResult,
  ItemPileSetStateResult,
  ItemPileGetContentsResult,
  ItemPileAddItemsResult,
  ItemPileRemoveItemsResult,
  ItemPileTransferItemsResult,
  ItemPileAddCurrencyResult,
  ItemPileRemoveCurrencyResult,
  ItemPileTransferCurrencyResult,
  ItemPileSplitLootResult,
  ItemPileVaultInfoResult,
  ItemPileRollTableResult,
  ItemPileRefreshMerchantResult,
  ItemPileTradeResult,
  ItemPilePriceModifiersResult,
} from './schemas.js';

// ── Inline error helper (CCR-G2) ──────────────────────────────────────────────


// ── Format helpers (F03: emit every return field) ─────────────────────────────

function formatCreate(d: ItemPileCreateResult): string {
  return [
    `module-itempiles.create-pile: created ${d.type} pile`,
    `- tokenUuid: ${d.tokenUuid ?? '(null)'}`,
    `- actorUuid: ${d.actorUuid ?? '(null)'}`,
    `- sceneId: ${d.sceneId}`,
    `- flagData: ${JSON.stringify(d.flagData)}`,
  ].join('\n');
}

function formatUpdate(d: ItemPileUpdateResult): string {
  return [
    `module-itempiles.update-pile: updated pile ${d.actorUuid}`,
    `- pileUuid: ${d.pileUuid ?? d.actorUuid}`,
    `- updated: ${JSON.stringify(d.updated)}`,
    `- flagData: ${JSON.stringify(d.flagData)}`,
  ].join('\n');
}

function formatDelete(d: ItemPileDeleteResult): string {
  return `module-itempiles.delete-pile: pile ${d.tokenUuid} deleted=${d.deleted}`;
}

function formatSetState(d: ItemPileSetStateResult): string {
  const lines = [`module-itempiles.set-pile-state: state="${d.state}"`];
  if (d.actorUuid) lines.push(`- actorUuid: ${d.actorUuid}`);
  if (d.tokenCount !== undefined) lines.push(`- tokenCount: ${d.tokenCount}`);
  if (Array.isArray(d.pileActorUuids)) {
    lines.push(`- pileActorUuids (use as split-loot / get-contents actorUuid targets — NOT token.actorId): ${JSON.stringify(d.pileActorUuids)}`);
  }
  if (d.flagData !== undefined) lines.push(`- flagData: ${JSON.stringify(d.flagData)}`);
  lines.push(`- result: ${JSON.stringify(d.result)}`);
  return lines.join('\n');
}

function formatGetContents(d: ItemPileGetContentsResult): string {
  const lines = [
    `module-itempiles.get-contents: pile ${d.actorUuid}`,
    `- valid=${d.isValidPile}, container=${d.isContainer}, merchant=${d.isMerchant}, vault=${d.isVault}`,
    `- locked=${d.isLocked}, closed=${d.isClosed}, empty=${d.isEmpty}`,
    `- itemCount: ${d.itemCount}`,
  ];
  if (d.items.length > 0) {
    const itemLines = truncatedJoin(
      d.items.map((i) => `  • ${i.name ?? '(unnamed)'} [${i.type ?? '?'}] qty:${i.quantity} uuid:${i.uuid ?? i.id ?? '?'}`),
      10,
      '\n',
      (h) => `\n  … and ${h} more`,
    );
    lines.push('- items:\n' + itemLines);
  }
  lines.push(`- currencies: ${JSON.stringify(d.currencies)}`);
  lines.push(`- flagData: ${JSON.stringify(d.flagData)}`);
  if (d.log !== undefined) lines.push(`- log: ${JSON.stringify(d.log)}`);
  return lines.join('\n');
}

function formatAddItems(d: ItemPileAddItemsResult): string {
  return `module-itempiles.add-items: added ${d.itemsAdded} item(s) to ${d.actorUuid} — total items now: ${d.totalItems}`;
}

function formatRemoveItems(d: ItemPileRemoveItemsResult): string {
  return `module-itempiles.remove-items: removed ${d.itemsRemoved} item(s) from ${d.actorUuid} — total items now: ${d.totalItems}`;
}

function formatTransferItems(d: ItemPileTransferItemsResult): string {
  // BUG-423: read only the handler's normalized DTO fields — the raw API resolution is a
  // bare array; attributesTransferred/deletedTokens were never returned.
  const r = d.result;
  const itemCount = Array.isArray(r.itemsTransferred) ? r.itemsTransferred.length : 0;
  return [
    `module-itempiles.transfer-items: mode="${d.mode}" (ok: ${r.ok})`,
    `- source: ${d.sourceUuid}`,
    `- target: ${d.targetUuid}`,
    `- target item count now: ${d.targetItemCount}`,
    `- items transferred: ${itemCount}`,
  ].join('\n');
}

function formatAddCurrency(d: ItemPileAddCurrencyResult): string {
  return [
    `module-itempiles.add-currency: added "${d.currenciesAdded}" to ${d.actorUuid}`,
    `- currentCurrencies: ${JSON.stringify(d.currentCurrencies)}`,
  ].join('\n');
}

function formatRemoveCurrency(d: ItemPileRemoveCurrencyResult): string {
  return [
    `module-itempiles.remove-currency: removed "${d.currenciesRemoved}" from ${d.actorUuid}`,
    `- previousBalance: ${JSON.stringify(d.previousBalance)}`,
    `- currentCurrencies: ${JSON.stringify(d.currentCurrencies)}`,
  ].join('\n');
}

function formatTransferCurrency(d: ItemPileTransferCurrencyResult): string {
  // BUG-423 + live-smoke correction: real resolution is { itemDeltas, attributeDeltas }.
  // ok:false = EMPTY deltas — Item Piles can silently no-op without error (BUG-428).
  const r = d.result;
  const lines = [
    `module-itempiles.transfer-currency: mode="${d.mode}" (ok: ${r.ok}, currency deltas: ${r.itemDeltas.length})`,
    `- source: ${d.sourceUuid} → remaining: ${JSON.stringify(d.sourceCurrencies)}`,
    `- target: ${d.targetUuid} → new balance: ${JSON.stringify(d.targetCurrencies)}`,
  ];
  if (!r.ok) {
    lines.push(`- ⚠️ NO CURRENCY ACTUALLY MOVED — Item Piles resolved with empty deltas and no error (silent no-op; see BUG-428). Verify the balances above before narrating success.`);
  }
  return lines.join('\n');
}

function formatSplitLoot(d: ItemPileSplitLootResult): string {
  return [
    `module-itempiles.split-loot: split pile ${d.actorUuid}`,
    `- targets: ${d.targets.join(', ')}`,
    `- itemsRemaining in pile: ${d.itemsRemaining}`,
  ].join('\n');
}

function formatVaultInfo(d: ItemPileVaultInfoResult): string {
  const lines = [`module-itempiles.vault-info: subAction="${d.subAction}" for vault ${d.actorUuid}`];
  if (d.canFit !== undefined) lines.push(`- canFit: ${d.canFit} (item: ${d.itemUuid}, qty: ${d.quantity})`);
  if (d.gridData !== undefined) {
    const g = d.gridData;
    lines.push(`- grid: ${g.cols}×${g.rows} (enabled: ${g.enabledCols}×${g.enabledRows})`);
    lines.push(`- spaces: total=${g.totalSpaces}, enabled=${g.enabledSpaces}, free=${g.freeSpaces}`);
    lines.push(`- items placed: ${g.items.length}, free cells: ${g.freeCells.length}`);
  }
  if (d.fitResult !== undefined) lines.push(`- fitResult: ${JSON.stringify(d.fitResult)}`);
  if (d.flagData !== undefined) lines.push(`- flagData: ${JSON.stringify(d.flagData)}`);
  return lines.join('\n');
}

function formatRollTable(d: ItemPileRollTableResult): string {
  // BUG-446: targetItems is null on the documented no-target shape and result is the raw
  // API resolution — the old unguarded .length threw a raw TypeError masking a successful roll.
  const result = Array.isArray(d.result) ? d.result : [];
  const targetItems = Array.isArray(d.targetItems) ? d.targetItems : null;
  const lines = [
    `module-itempiles.roll-item-table: rolled table ${d.tableUuid}`,
    `- targetActorUuid: ${d.targetActorUuid ?? '(none)'}`,
    `- result entries: ${result.length}`,
    targetItems === null ? '- targetItems: (none — no targetActorUuid)' : `- targetItems: ${targetItems.length} item(s)`,
  ];
  if (targetItems !== null && targetItems.length > 0) {
    const itemLines = truncatedJoin(
      targetItems.map((i) => `  • ${i.name} [${i.type}] qty:${i.quantity} id:${i.id}`),
      10,
      '\n',
      (h) => `\n  … and ${h} more`,
    );
    lines.push(itemLines);
  }
  return lines.join('\n');
}

function formatRefreshMerchant(d: ItemPileRefreshMerchantResult): string {
  return [
    `module-itempiles.refresh-merchant: refreshed merchant ${d.merchantUuid}`,
    `- removeExistingActorItems: ${d.removeExistingActorItems}`,
    `- itemCount after refresh: ${d.itemCount}`,
  ].join('\n');
}

function formatTrade(d: ItemPileTradeResult): string {
  // BUG-423 + live-smoke correction: real resolution is { itemDeltas, attributeDeltas,
  // itemPrices } — {itemMoved} never existed. Empty deltas = nothing moved (warn).
  const r = d.result;
  const lines = [
    `module-itempiles.trade-items: traded ${d.itemsTraded} item(s) (ok: ${r.ok}, item deltas: ${r.itemDeltas.length})`,
    `- merchant: ${d.merchantUuid}`,
    `- buyer: ${d.buyerUuid}`,
    `- buyerCurrencies after: ${JSON.stringify(d.buyerCurrencies)}`,
    `- buyer item count: ${d.buyerItemCount}`,
  ];
  if (!r.ok) {
    lines.push(`- ⚠️ NO ITEMS ACTUALLY MOVED — Item Piles resolved with empty deltas and no error (silent no-op; see BUG-428). Verify the buyer inventory above before narrating success.`);
  }
  return lines.join('\n');
}

function formatPriceModifiers(d: ItemPilePriceModifiersResult): string {
  const lines = [`module-itempiles.update-price-modifiers: subAction="${d.subAction ?? 'get-modifiers'}" for ${d.actorUuid}`];
  if (d.modifiers !== undefined) lines.push(`- modifiers: ${JSON.stringify(d.modifiers)}`);
  if (d.itemUuid !== undefined) lines.push(`- itemUuid: ${d.itemUuid}, quantity: ${d.quantity}`);
  if (d.prices !== undefined) lines.push(`- prices: ${JSON.stringify(d.prices)}`);
  if (d.cost !== undefined) lines.push(`- cost: ${JSON.stringify(d.cost)}`);
  return lines.join('\n');
}

export interface ModuleItempilsToolOptions extends BaseToolOptions {}

export class ModuleItempilesTool extends BaseTool {
  constructor(options: ModuleItempilsToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'module-itempiles', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-itempiles',
        title: 'Item Piles — economy and loot surface',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Full Item Piles economy surface for WFRP4e via game.itempiles.API.
Conditional: returns MODULE_NOT_ACTIVE when item-piles is absent/inactive.
Pre-flight: module-probe.is-active item-piles before using this tool.
WFRP4e bridge (item-piles-wfrp4e): GC/SS/BP currencies at 240/12/1 bp. Currency strings: "Xgc Yss Zbp" (case-insensitive).

17 actions:
PILE LIFECYCLE:
- create-pile         { sceneId, type?, position?, items?, createDedicatedActor?, ... }  — create token (sceneId REQUIRED — C5); createDedicatedActor required for merchant/vault
- update-pile         { actorUuid, type?, locked?, enabled?, merchantColumns?, vaultAccess?, overheadCost?, tablesForPopulate?, ... }
- delete-pile         { tokenUuid, confirm }                                    — confirm required; Token UUID only (C10)
- set-pile-state      { actorUuid|tokenUuids, state, confirm? }                 — state: open/close/lock/unlock/rattle/turnTokens/revertTokens

CONTENTS READ:
- get-contents        { actorUuid, includeLog? }                                — items + currencies + flags + type checks

ITEM MUTATIONS:
- add-items           { actorUuid, items[] }                                    — items array required (C1); returns { actorUuid, itemsAdded, totalItems }
- remove-items        { actorUuid, items[] }                                    — items array required (C2)
- transfer-items      { sourceUuid, targetUuid, items?, mode?, confirm? }       — mode: transfer/all/combine; confirm required for all/combine

CURRENCY FLOW:
- add-currency        { actorUuid, currencies }                                 — "Xgc Yss Zbp"
- remove-currency     { actorUuid, currencies, confirm }                        — confirm required; pre-checks balance
- transfer-currency   { sourceUuid, targetUuid, currencies?, mode? }            — mode: transfer/all; confirm required for all

LOOT DISTRIBUTION:
- split-loot          { actorUuid, targets[], instigator?, confirm }            — targets REQUIRED (C8 — omitting = silent no-op); returns { actorUuid, targets, itemsRemaining }

VAULT:
- vault-info          { actorUuid, itemUuid?, quantity?, subAction? }           — subAction: fit-check/grid-data/fit-items; read-only

ROLLTABLE / MERCHANT:
- roll-item-table     { tableUuid, targetActorUuid?, rollData?, timesToRoll? }
- refresh-merchant    { merchantUuid, removeExistingActorItems?, confirm? }
                                                                                — removeExistingActorItems defaults FALSE (asymmetric safe default); restocks from the pile's tablesForPopulate flag — set it first via update-pile's tablesForPopulate param
TRADE / PRICE:
- trade-items         { merchantUuid, buyerUuid, items[], confirm }             — scripted buy with currency exchange; confirm required
- update-price-modifiers { actorUuid, subAction?, buyPriceModifier?, sellPriceModifier?, relative?, itemUuid? }

SAFETY:
- banker/auctioneer pile types → MODULE_DEPENDENCY_NOT_ACTIVE (companion not installed)
- No active GM → NO_ACTIVE_GM structured error on all socket operations
- delete-pile, remove-currency, split-loot, trade-items, refresh-merchant(removeExisting:true) require confirm:true
- CONFIRM_REQUIRED previews are readable summaries (denomination strings like "4GC 2SS", first-item price), not raw JSON
- remove-currency writes an absolute per-denomination set: the VALUE removed is exact but coin shapes may consolidate (e.g. 12 BP → 1 SS)
- transfer-currency is non-atomic: an add-side failure after a debited source surfaces ITEM_PILES_PARTIAL_TRANSFER (manual reconcile; no automatic rollback)
- turnTokens/revertTokens: tokenUuids are resolved server-side — UUID strings NOT passed to API (C6/C7)
- relative:true price modifiers require finite numbers (C9 — silent NaN corruption otherwise)
- Simple Calendar GUIDANCE_ONLY: openTimes.status:"auto" without SC rewrites flag to "open"

ERROR TOKENS: MODULE_NOT_ACTIVE, MODULE_DEPENDENCY_NOT_ACTIVE, NO_ACTIVE_GM, GM_REQUIRED,
INSUFFICIENT_CURRENCY, VAULT_FULL, INVALID_PILE_TYPE (set-pile-state on non-container; trade/modifiers on non-merchant),
INVALID_PILE_UUID (delete-pile only), INVALID_CURRENCY_STRING, ITEM_PILES_PARTIAL_TRANSFER,
TOKEN_NOT_FOUND, CONFIRM_REQUIRED

GM required for all write actions.`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create-pile', 'update-pile', 'delete-pile', 'set-pile-state',
                'get-contents', 'add-items', 'remove-items', 'transfer-items',
                'add-currency', 'remove-currency', 'transfer-currency', 'split-loot',
                'vault-info', 'roll-item-table', 'refresh-merchant',
                'trade-items', 'update-price-modifiers',
              ],
              description: 'Item Piles action to perform.',
            },
            actorUuid: { type: 'string', description: '[most actions] UUID of the actor / pile actor.' },
            tokenUuid: { type: 'string', description: '[delete-pile] Token UUID (must contain "Token"). Not an Actor UUID.' },
            tokenUuids: { type: 'array', items: { type: 'string' }, description: '[set-pile-state turnTokens/revertTokens] Array of Token UUIDs.' },
            sceneId: { type: 'string', description: '[create-pile] Scene UUID. REQUIRED — game.user.viewedScene is null server-side.' },
            type: { type: 'string', enum: ['pile', 'container', 'merchant', 'vault', 'banker', 'auctioneer'], description: '[create-pile/update-pile] Pile type. banker/auctioneer → MODULE_DEPENDENCY_NOT_ACTIVE (companion not installed).' },
            position: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, description: '[create-pile] Canvas position.' },
            items: { type: 'array', items: { type: 'object' }, description: '[add-items/remove-items/transfer-items/trade-items] Items array. REQUIRED on add/remove/trade. Per-action shapes: add-items takes item-data objects (full item data); remove-items and transfer-items take {_id:string, quantity:number} (use _id NOT id); trade-items takes {itemId:string, quantity:number, paymentIndex?:number}.' },
            currencies: { type: 'string', description: '[add-currency/remove-currency/transfer-currency] Currency string "Xgc Yss Zbp" (case-insensitive GC/SS/BP).' },
            mode: { type: 'string', enum: ['transfer', 'all', 'combine'], description: '[transfer-items/transfer-currency] Mode. "all"/"combine" require confirm:true. "combine" is only valid for transfer-items (merges source pile into target); transfer-currency only accepts "transfer" or "all".' },
            state: { type: 'string', enum: ['open', 'close', 'lock', 'unlock', 'rattle', 'turnTokens', 'revertTokens'], description: '[set-pile-state] Target state.' },
            confirm: { type: 'boolean', description: 'Required true for dangerous actions: delete-pile, remove-currency, split-loot, trade-items, refresh-merchant(removeExisting:true), transfer-items all/combine, revertTokens.' },
            targets: { type: 'array', items: { type: 'string' }, description: '[split-loot] Target actor UUIDs. REQUIRED — omitting causes silent no-op (C8).' },
            sourceUuid: { type: 'string', description: '[transfer-items/transfer-currency] Source actor UUID.' },
            targetUuid: { type: 'string', description: '[transfer-items/transfer-currency] Target actor UUID.' },
            merchantUuid: { type: 'string', description: '[refresh-merchant/trade-items] Merchant actor UUID.' },
            buyerUuid: { type: 'string', description: '[trade-items] Buyer actor UUID.' },
            tableUuid: { type: 'string', description: '[roll-item-table] RollTable UUID.' },
            targetActorUuid: { type: 'string', description: '[roll-item-table/update-price-modifiers] Actor to receive rolled items (roll-item-table) or the per-actor target for update-price-modifiers (OPTIONAL — defaults to actorUuid, i.e. the merchant\'s own modifier entry).' },
            rollData: { type: 'object', description: '[roll-item-table] Formula context for roll expressions.' },
            timesToRoll: { type: 'number', description: '[roll-item-table] How many times to roll (default 1).' },
            removeExistingActorItems: { type: 'boolean', description: '[add-items/refresh-merchant] Default FALSE (safe). Setting true on refresh-merchant WIPES inventory before restocking.' },
            subAction: { type: 'string', enum: ['fit-check', 'grid-data', 'fit-items', 'get-modifiers', 'update-modifiers', 'get-prices'], description: '[vault-info/update-price-modifiers] Sub-operation.' },
            itemUuid: { type: 'string', description: '[vault-info/update-price-modifiers] Item UUID for fit-check or price lookup.' },
            quantity: { type: 'number', description: '[vault-info/update-price-modifiers] Quantity for fit-check or price calculation.' },
            buyPriceModifier: { type: 'number', description: '[update-price-modifiers] Buy price modifier. Must be finite when relative:true (C9).' },
            sellPriceModifier: { type: 'number', description: '[update-price-modifiers] Sell price modifier. Must be finite when relative:true (C9).' },
            relative: { type: 'boolean', description: '[update-price-modifiers] Apply as relative (additive) modifier.' },
            override: { type: 'boolean', description: '[update-price-modifiers] Override existing modifiers.' },
            vaultAccess: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  uuid: { type: 'string', description: 'Actor or User UUID.' },
                  view: { type: 'boolean' },
                  organize: { type: 'boolean' },
                  items: { type: 'object', properties: { withdraw: { type: 'boolean' }, deposit: { type: 'boolean' } } },
                  currencies: { type: 'object', properties: { withdraw: { type: 'boolean' }, deposit: { type: 'boolean' } } },
                },
              },
              description: '[update-pile vault] Per-user access control for vault.',
            },
            merchantColumns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  path: { type: 'string' },
                  buying: { type: 'boolean', description: 'Show on the buy (merchant) side; upstream defaults true.' },
                  selling: { type: 'boolean', description: 'Show on the sell (player) side; upstream defaults true.' },
                  mapping: { type: 'object', description: 'Raw value -> display label/sort-order key, e.g. WFRP availability tiers.' },
                  formatting: { type: 'string', description: 'e.g. "{#} common" — {#} is replaced with the localized value.' },
                  condition: {
                    type: 'object',
                    properties: {
                      path: { type: 'string' },
                      // CCR-V8: value is compared against an arbitrary getProperty() result
                      // (string/number/boolean per WFRP field), so it's a genuine scalar union —
                      // oneOf, not an untyped stub (ownership.ts `level` precedent).
                      value: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] },
                      placeholder: { type: 'string' },
                    },
                    description: 'Show placeholder text instead of the raw value when doc[path] === value.',
                  },
                },
                required: ['label', 'path'],
              },
              description: '[update-pile merchant] Display columns. WFRP4e default: Availability + Encumbrance (pre-wired by item-piles-wfrp4e bridge). BUG-783: buying/selling/mapping/formatting/condition are real upstream fields — previously silently stripped before reaching update-pile.',
            },
            overheadCost: {
              type: 'array',
              items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'string' } } },
              description: '[update-pile merchant] Overhead costs (e.g. rent, upkeep).',
            },
            locked: { type: 'boolean', description: '[create-pile/update-pile] Whether pile is locked.' },
            closed: { type: 'boolean', description: '[create-pile/update-pile] Whether pile is closed.' },
            instigator: { type: 'string', description: '[split-loot] Token UUID of the character initiating the split.' },
            interactingTokenUuid: { type: 'string', description: '[set-pile-state] Token UUID of the interacting character (for open/close).' },
            includeLog: { type: 'boolean', description: '[get-contents] Include the vault/merchant audit log in response.' },
            pileActorName: { type: 'string', description: '[create-pile] Name for the pile actor.' },
            tokenName: { type: 'string', description: '[create-pile] Name for the canvas token.' },
            cols: { type: 'number', description: '[update-pile vault] Vault grid columns.' },
            rows: { type: 'number', description: '[update-pile vault] Vault grid rows.' },
            vaultExpansion: { type: 'boolean', description: '[update-pile vault] Allow vault grid expansion.' },
            openTimes: { type: 'object', description: '[update-pile merchant] Merchant open/close schedule. status:"auto" requires Simple Calendar (GUIDANCE_ONLY).' },
            tablesForPopulate: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  uuid: { type: 'string', description: 'RollTable UUID (e.g. "RollTable.<id>").' },
                  addAll: { type: 'boolean', description: 'Add every table entry instead of rolling.' },
                  items: { type: 'array', items: { type: 'object' }, description: 'Per-entry overrides (upstream UI detail; usually omitted).' },
                  timesToRoll: { oneOf: [{ type: 'string' }, { type: 'number' }], description: 'Roll count or formula, e.g. 4 or "1d4".' },
                  customCategory: { type: 'string', description: 'Category label applied to rolled items.' },
                },
              },
              description: '[update-pile] RollTable population config (top-level pile flag, item-piles.js:64389). refresh-merchant consumes it to restock.',
            },
            closedImage: { type: 'string', description: '[create-pile/update-pile] Token image when closed.' },
            openedImage: { type: 'string', description: '[create-pile/update-pile] Token image when open.' },
            lockedImage: { type: 'string', description: '[create-pile/update-pile] Token image when locked.' },
            emptyImage: { type: 'string', description: '[create-pile/update-pile] Token image when empty.' },
            lockedSound: { type: 'string', description: '[create-pile/update-pile] Sound played on locked interaction (heist rattle).' },
            closedSound: { type: 'string', description: '[create-pile/update-pile] Sound played when closed.' },
            openedSound: { type: 'string', description: '[create-pile/update-pile] Sound played when opened.' },
            targetItemPileFlags: { type: 'object', description: '[transfer-items combine] Flags merged into the combined pile.' },
            createDedicatedActor: { type: 'boolean', description: '[create-pile] true → create a dedicated named pile actor (createActor). Required for distinct merchant/vault actors; without this, all piles share the Default Item Pile actor.' },
            enabled: { type: 'boolean', description: '[update-pile] Activate an existing actor as a pile. Required for merchant/vault to be valid — sets the enabled flag on the pile data.' },
          },
          required: ['action'],
          // BUG-782 (D1 — tighten in place, never anyOf): per-branch required sets generated
          // from ModuleItempilesInput's own Zod discriminated union (17 branches). Wire shape
          // (type/properties/required at top level) is unchanged; this only adds enforcement.
          allOf: [
            { if: { properties: { action: { const: 'create-pile' } } }, then: { required: ['sceneId'] } },
            { if: { properties: { action: { const: 'update-pile' } } }, then: { required: ['actorUuid'] } },
            { if: { properties: { action: { const: 'delete-pile' } } }, then: { required: ['tokenUuid'] } },
            { if: { properties: { action: { const: 'set-pile-state' } } }, then: { required: ['state'] } },
            { if: { properties: { action: { const: 'get-contents' } } }, then: { required: ['actorUuid'] } },
            { if: { properties: { action: { const: 'add-items' } } }, then: { required: ['actorUuid', 'items'] } },
            { if: { properties: { action: { const: 'remove-items' } } }, then: { required: ['actorUuid', 'items'] } },
            { if: { properties: { action: { const: 'transfer-items' } } }, then: { required: ['sourceUuid', 'targetUuid'] } },
            { if: { properties: { action: { const: 'add-currency' } } }, then: { required: ['actorUuid', 'currencies'] } },
            { if: { properties: { action: { const: 'remove-currency' } } }, then: { required: ['actorUuid', 'currencies'] } },
            { if: { properties: { action: { const: 'transfer-currency' } } }, then: { required: ['sourceUuid', 'targetUuid'] } },
            { if: { properties: { action: { const: 'split-loot' } } }, then: { required: ['actorUuid', 'targets'] } },
            { if: { properties: { action: { const: 'vault-info' } } }, then: { required: ['actorUuid'] } },
            { if: { properties: { action: { const: 'roll-item-table' } } }, then: { required: ['tableUuid'] } },
            { if: { properties: { action: { const: 'refresh-merchant' } } }, then: { required: ['merchantUuid'] } },
            { if: { properties: { action: { const: 'trade-items' } } }, then: { required: ['buyerUuid', 'items', 'merchantUuid'] } },
            { if: { properties: { action: { const: 'update-price-modifiers' } } }, then: { required: ['actorUuid'] } },
          ],
        },
      },
    ];
  }

  async execute(args: ModuleItempilesArgs) {
    const action = String(args.action ?? 'unknown');
    this.logger.info('Executing module-itempiles action', { action });
    try {
      let text: string;
      let data: unknown;
      switch (action) {
        case 'create-pile': {
          const d = await this.query<ItemPileCreateResult>('module-itempiles', args);
          text = formatCreate(d);
          data = d;
          break;
        }
        case 'update-pile': {
          const d = await this.query<ItemPileUpdateResult>('module-itempiles', args);
          text = formatUpdate(d);
          data = d;
          break;
        }
        case 'delete-pile': {
          const d = await this.query<ItemPileDeleteResult>('module-itempiles', args);
          text = formatDelete(d);
          data = d;
          break;
        }
        case 'set-pile-state': {
          const d = await this.query<ItemPileSetStateResult>('module-itempiles', args);
          text = formatSetState(d);
          data = d;
          break;
        }
        case 'get-contents': {
          const d = await this.query<ItemPileGetContentsResult>('module-itempiles', args);
          text = formatGetContents(d);
          data = d;
          break;
        }
        case 'add-items': {
          const d = await this.query<ItemPileAddItemsResult>('module-itempiles', args);
          text = formatAddItems(d);
          data = d;
          break;
        }
        case 'remove-items': {
          const d = await this.query<ItemPileRemoveItemsResult>('module-itempiles', args);
          text = formatRemoveItems(d);
          data = d;
          break;
        }
        case 'transfer-items': {
          const d = await this.query<ItemPileTransferItemsResult>('module-itempiles', args);
          text = formatTransferItems(d);
          data = d;
          break;
        }
        case 'add-currency': {
          const d = await this.query<ItemPileAddCurrencyResult>('module-itempiles', args);
          text = formatAddCurrency(d);
          data = d;
          break;
        }
        case 'remove-currency': {
          const d = await this.query<ItemPileRemoveCurrencyResult>('module-itempiles', args);
          text = formatRemoveCurrency(d);
          data = d;
          break;
        }
        case 'transfer-currency': {
          const d = await this.query<ItemPileTransferCurrencyResult>('module-itempiles', args);
          text = formatTransferCurrency(d);
          data = d;
          break;
        }
        case 'split-loot': {
          const d = await this.query<ItemPileSplitLootResult>('module-itempiles', args);
          text = formatSplitLoot(d);
          data = d;
          break;
        }
        case 'vault-info': {
          const d = await this.query<ItemPileVaultInfoResult>('module-itempiles', args);
          text = formatVaultInfo(d);
          data = d;
          break;
        }
        case 'roll-item-table': {
          const d = await this.query<ItemPileRollTableResult>('module-itempiles', args);
          text = formatRollTable(d);
          data = d;
          break;
        }
        case 'refresh-merchant': {
          const d = await this.query<ItemPileRefreshMerchantResult>('module-itempiles', args);
          text = formatRefreshMerchant(d);
          data = d;
          break;
        }
        case 'trade-items': {
          const d = await this.query<ItemPileTradeResult>('module-itempiles', args);
          text = formatTrade(d);
          data = d;
          break;
        }
        case 'update-price-modifiers': {
          const d = await this.query<ItemPilePriceModifiersResult>('module-itempiles', args);
          text = formatPriceModifiers(d);
          data = d;
          break;
        }
        default:
          return this.errorResponse(action, `Unknown action "${action}"`);
      }
      return { content: [{ type: 'text' as const, text }], structuredContent: data as Record<string, unknown> };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE) || msg.includes(ErrorTokens.MODULE_DEPENDENCY_NOT_ACTIVE)) {
        return moduleNotActiveContent('module-itempiles', msg);
      }
      return this.errorResponse(action, msg);
    }
  }
}
