// wfrp_economy_system Phase 3 — module-trading-places MCP tool (Trading Places v0.3.0, WFRP4e
// bulk-cargo trading — the Death on the Reik buying/selling algorithm).
//
// Always-registered umbrella. The foundry-module handler guards on trading-places being active; when
// inactive it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active trading-places.
//
// 19 actions across 9 idioms (reference-data, season, market-math, tests, cargo-hold, bookkeeping,
// currency, merchant-generation, price-dial — the last two added wfrp_economy_system Phase 7).
// Anchors: DP-15 (concrete this.query<TradingPlacesResult> — never <any>); R2.4 (errors via
// errorResponse); HC1 (money in text output renders the full tri-currency triple, zeros never hidden).
// Currency writes are REAL wfrp4e actor money-item writes done by the handler itself (coinValue-keyed)
// and ledgered via the wfrp-economy unified ledger with source:'trade' — the module's own SystemAdapter
// money model targets a legacy data model and is never delegated to (ADR-015 / PRD Risk 3.A).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { TRADING_PLACES_ACTIONS, type TradingPlacesResult } from './schemas.js';
import { z } from 'zod';
import { TradingPlacesInput } from '@foundry-mcp/shared';

type TradingPlacesArgs = z.infer<typeof TradingPlacesInput>;

// ── HC1 tri-currency display: ALWAYS the full triple, zeros shown (300 BP → "1gc 5ss 0bp") ──

function bp(totalBp: number): string {
  const sign = totalBp < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalBp));
  const gc = Math.floor(abs / 240);
  const ss = Math.floor((abs % 240) / 12);
  const b = abs % 12;
  return `${sign}${gc}gc ${ss}ss ${b}bp`;
}

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: TradingPlacesResult): string {
  const p = 'module-trading-places';
  switch (d.action) {
    case 'list-settlements':
      return `${p}.list-settlements: ${d.count} settlement(s)${d.region ? ` in ${d.region}` : ''}${d.count ? ` — ${d.settlements.map((s) => s.name).join(', ')}` : ''}.`;
    case 'list-cargo-types':
      return `${p}.list-cargo-types: ${d.count} cargo type(s)${d.count ? ` — ${d.cargoTypes.map((c) => c.name).join(', ')}` : ''}.`;
    case 'get-season':
      return `${p}.get-season: ${d.season} (seasonSource: ${d.seasonSource}).`;
    case 'set-season':
      return `${p}.set-season: ${d.previousSeason ?? 'none'} → ${d.season} (persisted).`;
    case 'check-availability':
      return `${p}.check-availability: ${d.settlement} in ${d.season} (${d.seasonSource}) — ${d.available ? 'CARGO AVAILABLE' : 'no cargo'} (roll ${d.roll ?? 'module-internal'} vs ${d.chance}%)${d.available ? `; types: ${d.cargoTypes.join(', ') || '—'}; size ${d.cargoSizeEp ?? '?'} EP` : ''}.`;
    case 'calc-purchase-price':
    case 'calc-sale-price':
      return `${p}.${d.action}: ${d.quantity} EP of ${d.cargoName}${d.settlement ? ` @ ${d.settlement}` : ''} (${d.season}, ${d.quality}) — total ${bp(d.totalBp)} (${bp(d.pricePerEpBp)}/EP, ${d.pricePerEpBp} BP)${d.priceModifierApplied ? ` [price dial: global×${d.priceModifierApplied.global}${d.priceModifierApplied.perCargo ? ` × perCargo×${d.priceModifierApplied.perCargo}` : ''}]` : ''}.`;
    case 'haggle-test':
      return `${p}.haggle-test: ${d.playerWins ? 'PLAYER WINS' : 'MERCHANT WINS / NO CHANGE'} — ${d.resultDescription}`;
    case 'gossip-test':
      return `${p}.gossip-test: ${d.testSucceeded ? 'SUCCESS' : 'FAILURE'} (roll ${d.roll} vs ${d.modifiedSkill}, ${d.degrees} degree(s)) — ${d.resultDescription}`;
    case 'add-cargo':
      return `${p}.add-cargo: ${d.quantity} EP of ${d.cargoName} for ${bp(d.totalCostBp)}${d.merged ? ' (merged into existing lot)' : ''} — hold ${d.holdUsedEp}/${d.holdCapacityEp} EP (id ${d.cargoId}).`;
    case 'remove-cargo':
      return `${p}.remove-cargo: ${d.removedQuantity} EP of ${d.cargoName} removed (${d.remainingQuantity} EP of that lot left) — hold ${d.holdUsedEp} EP used (id ${d.cargoId}).`;
    case 'get-current-cargo':
      return `${p}.get-current-cargo: ${d.count} lot(s), ${d.holdUsedEp}/${d.holdCapacityEp} EP${d.count ? ` — ${d.cargo.map((c) => `${c.quantity} EP ${c.cargo}`).join(', ')}` : ''}.`;
    case 'get-transaction-history':
      return `${p}.get-transaction-history: ${d.count} transaction(s).`;
    case 'get-currency':
      return `${p}.get-currency: ${d.actorName ?? d.actorId} holds ${bp(d.totalBp)} (${d.totalBp} BP).`;
    case 'deduct-currency':
    case 'add-currency':
      return `${p}.${d.action}: ${bp(d.amountBp)} ${d.action === 'deduct-currency' ? 'deducted from' : 'added to'} ${d.actorName ?? d.actorId} — ${bp(d.previousTotalBp)} → ${bp(d.newTotalBp)}${d.ledgered ? ' (ledgered source:trade)' : ' (ledger row NOT appended — wfrp4e-economy inactive?)'}.`;
    case 'merchant-generation':
      return `${p}.merchant-generation: ${d.type} merchant at ${d.settlement.name} for ${d.cargoType} — skill ${d.skill} (${d.skillDescription}), quantity ${d.quantity} EP (prices are narrative-only, id ${d.id}).`;
    case 'get-price-modifiers':
      return `${p}.get-price-modifiers: global×${d.global}${Object.keys(d.perCargo).length ? `, perCargo: ${Object.entries(d.perCargo).map(([k, v]) => `${k}×${v}`).join(', ')}` : ' (no perCargo overrides)'}.`;
    case 'set-price-modifiers':
      return `${p}.set-price-modifiers: global ${d.previous.global} → ${d.current.global}; perCargo now ${Object.keys(d.current.perCargo).length} override(s) (persisted).`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleTradingPlacesToolOptions extends BaseToolOptions {}

export class ModuleTradingPlacesTool extends BaseTool {
  constructor(options: ModuleTradingPlacesToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-trading-places', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-trading-places',
        title: 'Trading Places integration — WFRP4e bulk-cargo trading (Death on the Reik algorithm)',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `RETIRED (Phase 7g). This tool has no legitimate use for new work: every action below now returns a typed TRADING_PLACES_ACTION_RETIRED error naming its module-wfrp-economy trading-* successor (or, for the 3 currency ops, the existing wallet action) — the retirement fires whether trading-places is active, inactive, or uninstalled. Route new work to module-wfrp-economy's trading-* actions instead (get-currency/add-currency/deduct-currency → get-wallet-balance/wallet-add/wallet-remove). Schema/enum below are UNCHANGED (HC8 — registry stays stable) so a caller mid-migration still gets a typed, actionable refusal rather than a hard schema break; this description is the only thing that changed.

Use this when:
- You need the typed TRADING_PLACES_ACTION_RETIRED error's payload to discover the exact module-wfrp-economy successor action name for a specific legacy action you're migrating off of.
- A caller/integration is still hard-coded against module-trading-places and you need to confirm it fails LOUD and typed (not silently) rather than actually executing.
- Almost never otherwise — for any real trading/economy work, skip this tool entirely and call module-wfrp-economy's trading-* actions (or wallet-* for currency) directly.

Historical (pre-retirement) purpose, kept for context on what the successor replaces: drove the Trading Places module (trading-places) — settlement/cargo reference data, seasonal availability checks, purchase/sale price calculation, haggle/gossip test resolution, the shared cargo hold, and REAL actor coin movement. Bulk-EP cargo economy (Death on the Reik companion algorithm) — complements /module-itempiles (item-level shops) and availability-test (Core-RAW single-item market availability).
Conditional: returns MODULE_NOT_ACTIVE when trading-places is absent/inactive. Pre-flight: module-probe.is-active trading-places. All amounts are integer Brass Pennies (BP); 1 GC = 240 BP, 1 SS = 12 BP.

DATASET LIMIT (R7.3): the bundled dataset is Empire-only — 14 provinces/regions of Reikland-and-neighbours settlements. Settlements outside the Empire are not in the data and will TARGET_NOT_FOUND.

ROLL DELEGATION: haggle-test and gossip-test REQUIRE pre-rolled d100 totals (playerRoll, merchantRoll) — the sheet/GM rolls; this tool never rolls. check-availability likewise REQUIRES a pre-rolled availabilityRoll (the module's internal chat-invisible roll never fires).

CARGO SEMANTICS: add-cargo/remove-cargo/get-current-cargo operate on the module's shared 'currentCargo' world-setting hold (one party hold, capacity 400 EP default, enforced on add) — NOT on actor inventories. Coin is NOT moved by cargo actions; move it explicitly with deduct-currency/add-currency (buy = deduct + add-cargo; sell = remove-cargo + add-currency).

CURRENCY: get/deduct/add-currency read/write the actor's wfrp4e money Items keyed by coinValue (240/12/1) with change-making; deduct halts loud on insufficient funds (no partial writes). Writes >= 4800 BP (20 GC) require confirm:true. Every currency write appends a wfrp-economy unified-ledger row (source:'trade' — audit via module-wfrp-economy list-transactions).

SEASON (CCR-CALENDAR): get-season derives from the Foundry world calendar when the calendar exposes a season index, else falls back to the module's manual currentSeason setting — the response's seasonSource field discloses which ('calendar' | 'module-setting'; 'explicit' when you passed season). Availability/price actions resolve season the same way unless an explicit season is passed.

MERCHANT GENERATION: merchant-generation returns a narrative merchant (skill/quantity/personality flavor) from the module's own generator — its price fields are ALWAYS narrative-only (pricesAreNarrativeOnly:true, narrativePriceHintBase/Final) because the generator's price math predates the 20-cargo catalog and isn't calcToBp-compatible. Real coin for any merchant interaction still comes from calc-purchase-price/calc-sale-price + deduct/add-currency. percentile (1-100) optionally overrides the skill roll; equilibrium is a neutral {supply:1,demand:1} stub in v1.

PRICE DIAL: get-price-modifiers / set-price-modifiers manage a GM-tunable multiplier {global, perCargo} applied to calc-purchase-price/calc-sale-price AFTER calcToBp (default {global:1, perCargo:{}} — neutral, disclosed via priceModifierApplied only when non-neutral). set-price-modifiers is GM-gated, validates values > 0, merges perCargo keys into the existing map (global replaces), and reset:true restores the default.

EXCLUDED BY DESIGN: UI opens (dialog-deadlock class), and the module's compound buy path (validatePurchase/performPurchase — unreachable dead code, disposed 2026-07-10; orchestrate buys with the actions above instead).

19 actions:
reference-data: list-settlements { region? } · list-cargo-types {}.
season: get-season {} · set-season { season: spring|summer|autumn|winter }.
market-math: check-availability { settlement, availabilityRoll, season? } · calc-purchase-price { cargoName, quantity, quality?, season?, isPartialPurchase?, haggleSuccess?, hasDealmakerTalent? } · calc-sale-price { cargoName, quantity, settlement, quality?, season?, haggleSuccess?, hasDealmakerTalent? }.
tests: haggle-test { playerSkill, merchantSkill, playerRoll, merchantRoll, hasDealmakerTalent? } · gossip-test { playerSkill, playerRoll, difficulty? }.
cargo-hold: add-cargo { cargoName, quantity, totalCostBp, settlement, category?, season?, contraband? } · remove-cargo { cargoId? | cargoName?, quantity? } · get-current-cargo {}.
bookkeeping: get-transaction-history { limit? }.
currency: get-currency { actorId } · deduct-currency { actorId, amountBp, description?, confirm? } · add-currency { actorId, amountBp, description?, confirm? }.
merchant-generation: merchant-generation { settlement, cargoType, merchantType: producer|seeker, percentile? }.
price-dial: get-price-modifiers {} · set-price-modifiers { global?, perCargo?, reset? }.

Example: { action: "check-availability", settlement: "Altdorf", availabilityRoll: 42 }

Do NOT use this tool for any trading/economy work — module-wfrp-economy's trading-* actions (and wallet-* for currency) are the successor and the only path that actually executes; every action here is RETIRED and returns a typed refusal, never a real result. The bullets above and the actions catalog below describe the tool's HISTORICAL (pre-retirement) shape only, kept for migration context.

Performance Notes:
- Every action returns one small fixed-shape TRADING_PLACES_ACTION_RETIRED error object naming the successor — no response modes, no pagination, no world-size-dependent cost (nothing is executed).`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...TRADING_PLACES_ACTIONS], description: 'Trading Places action to perform.' },
            region: { type: 'string', description: 'list-settlements: optional region filter (e.g. "Reikland").' },
            season: { type: 'string', enum: ['spring', 'summer', 'autumn', 'winter'], description: 'set-season (required) / availability + price actions (optional override; default = calendar-derived season).' },
            settlement: { type: 'string', description: 'Settlement name (check-availability / calc-sale-price required; add-cargo required — the purchase location).' },
            availabilityRoll: { type: 'number', description: 'check-availability: pre-rolled 1d100 total (required — this tool never rolls).' },
            cargoName: { type: 'string', description: 'Cargo type name (price calcs / add-cargo required; remove-cargo alternative to cargoId).' },
            quantity: { type: 'number', description: 'Quantity in Encumbrance Points (price calcs / add-cargo required; remove-cargo optional partial removal).' },
            quality: { type: 'string', enum: ['poor', 'average', 'good', 'excellent'], description: 'Price calcs: wine/brandy quality tier (default average).' },
            isPartialPurchase: { type: 'boolean', description: 'calc-purchase-price: apply the +10% partial-purchase penalty.' },
            haggleSuccess: { type: 'boolean', description: 'Price calcs: outcome of a prior haggle-test to fold into the price.' },
            hasDealmakerTalent: { type: 'boolean', description: 'haggle-test / price calcs: the buyer has the Dealmaker talent.' },
            playerSkill: { type: 'number', description: 'haggle-test / gossip-test: player skill target (0-100).' },
            merchantSkill: { type: 'number', description: 'haggle-test: merchant skill target (0-100).' },
            playerRoll: { type: 'number', description: 'haggle-test / gossip-test: pre-rolled 1d100 total for the player (REQUIRED — sheet/GM rolls).' },
            merchantRoll: { type: 'number', description: 'haggle-test: pre-rolled 1d100 total for the merchant (REQUIRED).' },
            difficulty: { type: 'number', description: 'gossip-test: modifier (module default -10).' },
            totalCostBp: { type: 'number', description: 'add-cargo: total cost of the lot in integer BP (recorded on the hold entry; coin moves only via deduct-currency).' },
            category: { type: 'string', description: 'add-cargo: cargo category; resolved from the cargo dataset when omitted.' },
            contraband: { type: 'boolean', description: 'add-cargo: mark the lot contraband.' },
            cargoId: { type: 'string', description: 'remove-cargo: hold entry id (from get-current-cargo); alternative to cargoName.' },
            limit: { type: 'number', description: 'get-transaction-history: max rows returned (default all, cap 200).' },
            actorId: { type: 'string', description: 'Actor id (get-currency / deduct-currency / add-currency).' },
            amountBp: { type: 'number', description: 'Currency writes: amount in integer Brass Pennies (> 0).' },
            description: { type: 'string', description: 'Currency writes: ledger row description (default auto-generated).' },
            confirm: { type: 'boolean', description: 'Currency writes >= 4800 BP (20 GC): must be true to execute.' },
            merchantType: { type: 'string', enum: ['producer', 'seeker'], description: 'merchant-generation (required): whether the merchant buys (seeker) or sells (producer) the cargo.' },
            percentile: { type: 'number', description: 'merchant-generation: optional 1-100 override for the skill-roll percentile (omitted → the generator rolls its own).' },
            global: { type: 'number', description: 'set-price-modifiers: global price multiplier (> 0; 1 = neutral). Omitted leaves the existing global unchanged.' },
            perCargo: { type: 'object', description: 'set-price-modifiers: per-cargo-name multiplier overrides (> 0 each), merged into the existing map by key.' },
            reset: { type: 'boolean', description: 'set-price-modifiers: true restores the default {global:1, perCargo:{}}, ignoring global/perCargo on the same call.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: TradingPlacesArgs) {
    const action = String((rawArgs as any)?.action ?? 'unknown');
    this.logger.info('Executing module-trading-places action', { action });
    if (!(TRADING_PLACES_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<TradingPlacesResult>('module-trading-places', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-trading-places', msg);
      return this.errorResponse(action, msg);
    }
  }
}
