// Module Integration v2 Phase 6 — module-wfrp-economy MCP tool (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// Always-registered umbrella. The foundry-module handler guards on wfrp4e-economy being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active wfrp4e-economy.
//
// 27 actions across 9 idioms (stand-up-an-economy, open-a-bank-account, run-a-transaction, loan-cycle,
// investment-cycle, property-management, wallet-quick-adjust, audit-the-ledger, unified-ledger). Anchors:
// DP-15 (concrete this.query<WfrpEconomyResult> — never <any>); R2.4 (errors via errorResponse). The
// transactional writes + property/stock ops are LIVE-SMOKE-ONLY (need a configured economy; the
// smoke-runbook self-bootstraps one).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { WFRP_ECONOMY_ACTIONS, type WfrpEconomyResult } from './schemas.js';
import { z } from 'zod';
import { WfrpEconomyInput } from '@foundry-mcp/shared';

type WfrpEconomyArgs = z.infer<typeof WfrpEconomyInput>;

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: WfrpEconomyResult): string {
  const p = 'module-wfrp-economy';
  switch (d.action) {
    case 'list-economies':
      return `${p}.list-economies: ${d.count} economy(ies)${d.count ? ` — ${d.economies.map((e) => `${e.name} (${e.id})`).join(', ')}` : ''}.`;
    case 'get-economy':
      return `${p}.get-economy: ${d.name} (${d.economyId}) — ${d.banks.length} bank(s), ${d.stocks.length} stock(s), ${d.properties.length} property(ies), currency "${d.currency}".`;
    case 'list-bankers':
      return `${p}.list-bankers: ${d.count} banker(s).`;
    case 'create-economy':
      return `${p}.create-economy: ${d.name} (${d.economyId}) — ${d.bankCount} bank/${d.stockCount} stock/${d.propertyCount} property.`;
    case 'update-economy':
      return `${p}.update-economy: ${d.name} (${d.economyId}) updated.`;
    case 'delete-economy':
      return `${p}.delete-economy: economy ${d.economyId} ${d.deleted ? 'deleted (+ related stores purged)' : 'not deleted'}.`;
    case 'create-account':
      return `${p}.create-account: account ${d.accountId} for actor ${d.actorId} @ bank ${d.bankId} (balance ${d.balance} BP).`;
    case 'list-accounts':
      return `${p}.list-accounts: ${d.count} account(s).`;
    case 'deposit':
    case 'withdraw':
      return `${p}.${d.action}: ${d.amountBp} BP on account ${d.accountId} — account ${d.accountBalance} BP, wallet ${d.walletBalanceBp} BP.`;
    case 'transfer':
      return `${p}.transfer: ${d.amountBp} BP ${d.sourceAccountId} (${d.sourceBalance} BP) → ${d.destinationAccountId} (${d.destinationBalance} BP).`;
    case 'request-loan':
    case 'repay-loan':
      return `${p}.${d.action}: ${d.amountBp} BP on account ${d.accountId} — loan ${d.loanActive ? `active (${d.loanAmount} BP)` : 'cleared'}, balance ${d.accountBalance} BP.`;
    case 'buy-stock':
    case 'sell-stock':
      return `${p}.${d.action}: ${d.quantity}× ${d.stockId} for ${d.totalBp} BP — holding ${d.holding}, account ${d.accountBalance} BP.`;
    case 'get-portfolio':
      return `${p}.get-portfolio: actor ${d.actorId} holds ${d.holdingCount} stock(s) in economy ${d.economyId}.`;
    case 'buy-property':
      return `${p}.buy-property: property ${d.propertyId} bought by ${d.ownerName ?? d.owner} — account ${d.accountId} now ${d.accountBalance} BP.`;
    case 'sell-property':
      return `${p}.sell-property: property ${d.propertyId} sold — account ${d.accountId} now ${d.accountBalance} BP.`;
    case 'set-rented':
      return `${p}.set-rented: property ${d.propertyId} rented → ${d.rented}.`;
    case 'get-wallet-balance':
      return `${p}.get-wallet-balance: actor ${d.actorId} has ${d.balanceBp} BP.`;
    case 'wallet-add':
    case 'wallet-remove':
      return `${p}.${d.action}: ${d.amountBp} BP → actor ${d.actorId} now ${d.balanceBp} BP.`;
    case 'list-transactions':
      return `${p}.list-transactions: ${d.count} transaction(s).`;
    case 'actor-transaction-summary':
      return `${p}.actor-transaction-summary: actor ${d.actorId} in economy ${d.economyId}.`;
    case 'bank-transaction-summary':
      return `${p}.bank-transaction-summary: bank ${d.bankId} in economy ${d.economyId}.`;
    case 'record-transaction':
      return `${p}.record-transaction: ${d.amountBp} BP (${d.source}/${d.type}) logged for actor ${d.actorId} — id ${d.transactionId}.`;
    case 'delete-account':
      return `${p}.delete-account: account ${d.accountId} ${d.deleted ? 'deleted' : 'not deleted'}.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleWfrpEconomyToolOptions extends BaseToolOptions {}

export class ModuleWfrpEconomyTool extends BaseTool {
  constructor(options: ModuleWfrpEconomyToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-wfrp-economy', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-wfrp-economy',
        title: 'Warhammer Economy integration — banks / loans / stocks / property / wallet ledger',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Warhammer Economy module (wfrp4e-economy) — named bank economies with interest-bearing accounts, loans, an account-to-account transfer rail, a stock market with portfolios, property ownership/rent, and an immutable transaction ledger. All state persists in world settings (economies / bankers / bankAccounts / stockPortfolios / transactionLogs — server-verifiable). Wallet ops read/write the actor's WFRP4e money items (GC/SS/BP at 240/12/1 BP). Additive to /module-itempiles (physical loot) and /wfrp-status (weekly earnings).
Conditional: returns MODULE_NOT_ACTIVE when wfrp4e-economy is absent/inactive. Pre-flight: module-probe.is-active wfrp4e-economy. All amounts are integer Brass Pennies (BP).

CONFIRM-GATED (CCR-4): delete-economy (purges the economy + its accounts/bankers/portfolios/logs), delete-account (removes the account record; transaction history is kept), and transfer >= 4800 BP (20 GC) require confirm:true. EXCLUDED (HC-v2-6 dialog-deadlock): advance-day, clearAllFinancialData, and every UI-open — not exposed.

27 actions:
stand-up-an-economy: list-economies {} · get-economy { economyId } · list-bankers { economyId? } · create-economy { name, currency?, currencySystem?, banks?, properties?, stocks? } · update-economy { economyId, name?, currency?, banks?, properties?, stocks? } · delete-economy { economyId, confirm }.
open-a-bank-account: create-account { economyId, bankId, actorId } · list-accounts { economyId?, actorId? }.
run-a-transaction: deposit { economyId, accountId, amountBp } · withdraw { economyId, accountId, amountBp } · transfer { economyId, sourceAccountId, destinationAccountId, amountBp, confirm? }.
loan-cycle: request-loan { economyId, accountId, amountBp, interestRate? } · repay-loan { economyId, accountId, amountBp }.
investment-cycle: buy-stock { economyId, accountId, stockId, quantity } · sell-stock { economyId, accountId, stockId, quantity } · get-portfolio { actorId, economyId }.
property-management: buy-property { economyId, accountId, propertyId } · sell-property { economyId, accountId, propertyId } (credits value × the GM-configurable propertySaleRate world setting, default 0.8) · set-rented { economyId, propertyId, rented }.
wallet-quick-adjust: get-wallet-balance { actorId, economyId? } · wallet-add { actorId, amountBp, economyId? } · wallet-remove { actorId, amountBp, economyId? }.
audit-the-ledger: list-transactions { actorId?, economyId?, type?, bankId?, source? } · actor-transaction-summary { actorId, economyId } · bank-transaction-summary { bankId, economyId }.
unified-ledger: record-transaction { actorId, amountBp, source, type, description, economyId?, bankId?, targetActorId?, currency? } — append an arbitrary ledger row (source: earn/trade/itempiles/levy/economy); use for skill/levy callers that write coins outside this module's own 9 tracked ops · delete-account { accountId, economyId?, confirm } — remove a stale/orphaned account record (does NOT cascade-delete ledger history).

For create-economy, embed a stock to enable the buy/sell round-trip: stocks:[{ name, symbol, currentPrice, availableShares }]. Example: { action: "deposit", economyId: "abc", accountId: "def", amountBp: 240 }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...WFRP_ECONOMY_ACTIONS], description: 'Warhammer Economy action to perform.' },
            economyId: { type: 'string', description: 'Economy id (most actions).' },
            bankId: { type: 'string', description: 'Bank id within the economy (create-account / bank-transaction-summary).' },
            accountId: { type: 'string', description: 'Bank account id (deposit / withdraw / loan / stock / property / delete-account).' },
            sourceAccountId: { type: 'string', description: 'transfer: source bank account id.' },
            destinationAccountId: { type: 'string', description: 'transfer: destination bank account id.' },
            actorId: { type: 'string', description: 'Actor id (create-account / wallet ops / get-portfolio / summaries / list filter / record-transaction).' },
            stockId: { type: 'string', description: 'Stock id within the economy (buy-stock / sell-stock).' },
            propertyId: { type: 'string', description: 'Property id within the economy (buy/sell-property / set-rented).' },
            amountBp: { type: 'number', description: 'Amount in integer Brass Pennies (deposit/withdraw/transfer/loan/wallet/record-transaction). 1 GC = 240 BP, 1 SS = 12 BP.' },
            quantity: { type: 'number', description: 'Share count (buy-stock / sell-stock).' },
            interestRate: { type: 'number', description: 'request-loan: optional loan interest percent (defaults to the bank loanRate).' },
            rented: { type: 'boolean', description: 'set-rented: the rented state to set.' },
            name: { type: 'string', description: 'create-economy (required) / update-economy: economy display name.' },
            currency: { type: 'string', description: 'create-economy / update-economy: currency display name (default "Gold Crowns"). record-transaction: optional currency label on the logged row.' },
            currencySystem: { type: 'string', description: 'create-economy / update-economy: "triCurrency" for WFRP4e (default).' },
            banks: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'create-economy / update-economy: bank objects { name, interestRate?, loanRate? } (ids auto-filled).' },
            properties: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'create-economy / update-economy: property objects { name, value } (ids auto-filled).' },
            stocks: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'create-economy / update-economy: stock objects { name, symbol, currentPrice, availableShares } (ids auto-filled).' },
            type: { type: 'string', description: 'list-transactions: optional transaction-type filter (e.g. deposit, withdraw, stock_purchase). record-transaction (required): free-form transaction type label.' },
            source: { type: 'string', enum: ['earn', 'trade', 'itempiles', 'levy', 'economy'], description: 'record-transaction (required): who originated this row. list-transactions: optional source filter.' },
            description: { type: 'string', description: 'record-transaction (required): human-readable ledger description.' },
            targetActorId: { type: 'string', description: 'record-transaction: optional second actor (e.g. transfer counterparty).' },
            confirm: { type: 'boolean', description: 'delete-economy / delete-account / large transfer: must be true to execute the gated op.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: WfrpEconomyArgs) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-wfrp-economy action', { action });
    if (!(WFRP_ECONOMY_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<WfrpEconomyResult>('module-wfrp-economy', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-wfrp-economy', msg);
      return this.errorResponse(action, msg);
    }
  }
}
