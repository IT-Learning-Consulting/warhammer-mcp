// DIALOG-PATH: DIALOG_FREE — module header states no write path touches a Dialog; every write is a raw awaited game.settings.set / game.financial.wallet.* call.
// Module Integration v2 Phase 6 — module-wfrp-economy handler (Warhammer Economy, wfrp4e-economy v1.0.0).
//
// Always-registered umbrella. requireModuleActive('wfrp4e-economy') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 88 actions across 16 idioms (capability_audit/wfrp4e-economy.md + phase6_pre_plan.md §Action surface;
// unified-ledger idiom — record-transaction / delete-account — added Phase 2, wfrp_economy_system_v1_prd.md
// §10; levy-and-burn idiom — apply-levies / money-to-burn — added Phase 4, same PRD §10; banking-and-income
// idiom — invest / resolve-investment / list-investments / stash-deposit / stash-withdraw / accrue-interest
// — added Phase 5, same PRD §10; legitimate-business-enterprises idiom — list-enterprises / get-enterprise /
// create-enterprise / connect-enterprise-actor / enterprise-income / enterprise-event /
// enterprise-pay-interest / enterprise-repay-debt / enterprise-upgrade / delete-enterprise — added Phase 6,
// same PRD §10; enterprise-ownership-and-debt idiom — set-enterprise-owners / add-enterprise-debt /
// forgive-enterprise-debt (+set-enterprise-income-sources added Phase 7e2) — + levy-groups idiom — list-levies / save-levy-group / list-levy-groups /
// delete-levy-group — both added Phase 7c, same PRD §10; trading idiom (20 actions, trading-* prefix) —
// the ported trading-places engine, native to this module — added Phase 7f, wfrp-economy-phase7f plan §10
// (see the DELEGATE block below the venture-ledger engine contract for the trading engine contract). ALL
// financial state lives in world-scoped game settings (economies / bankAccounts / transactionLogs /
// levies / recordedStashes / endeavourInvestments / enterprises). The retired bankers and stockPortfolios
// settings are never accessed. The
// 9 transactional writes are driven by runtime-importing
// the module's SocketHandler and calling its AWAITED process method DIRECTLY:
//
//   ⚠ ROUTING DEVIATIONS (phase6_pre_plan §Write access — re-verified 2026-07-18 against the D5-hardened
//   socket-handler.js: the _handle*Process wrappers are now SOCKET-ENVELOPE entry points that run
//   _authorizeGMRequest (requires _socketSenderUserId/requesterUserId) and unwrap data.payload — a direct
//   flat call silently no-ops. Call the direct process statics instead; actingUser defaults to game.user
//   and a GM caller skips the ownership gate):
//     • loan      → SocketHandler.LoanProcess(...)      NOT _handleLoanProcess (envelope-only).
//     • transfer  → SocketHandler.TransferProcess(...)  NOT _handleTransferProcess (envelope-only).
//     • stock sale→ SocketHandler.processStockSale(...) NOT broadcastStockSale (BUG A: it emits the
//                   socket action 'processStockSale' which neither switch handles → silently dropped).
//   create-bank → processCreateBank; deposit/withdraw → TransactionProcess; stock buy →
//   processStockPurchase; property → processPropertyPurchase/Sale; rent → processRentedChange.
//
// Every process* / _handle*Process method `await game.settings.set(...)` before returning, so there is
// NO settle-poll anywhere — immediate read-back is consistent (DP-16). economy CRUD + wallet ops are
// raw awaited writes (game.settings.set / game.financial.wallet.*). No write path touches a Dialog
// (advance-day / clearAllFinancialData are EXCLUDED — HC-v2-6 deadlock class).
//
// Confirm-gate (CCR-4): delete-economy (always) + transfer >= LARGE_TRANSFER_THRESHOLD use
// confirm:z.boolean().optional() + a handler `!== true` reject (NOT z.literal(true)).
//
// Source of truth: .agents/research/module_integration/phase6_pre_plan.md +
// capability_audit/wfrp4e-economy.md + .agents/plans/features/wfrp-economy-phase4-levies-costofliving-
// moneytoburn.md (Phase 4 — levy-and-burn idiom).
//
// levy-and-burn (apply-levies / money-to-burn) delegates to the fork's OWN headless, dialog-free engine
// (src/levies/levy-engine.js — Phase 1 of the same plan) via the same runtimeImport idiom used for
// SocketHandler/TransactionLogger above. DIALOG-PATH: the engine is contractually dialog-free (Phase 1
// task 1.3 acceptance: zero Dialog/prompt control flow) — this handler never awaits a path that could
// open a Foundry dialog ([[feedback_module_api_dialog_deadlock]]).
//
// Engine contract (fixed here at MCP-authoring time; Phase 1 implements TO this shape):
//   applyLevies({ levyIds?, actorIds, excludeActorIds?, dryRun }) => Promise<{
//     elapsedWeeks: number; weekIndex: number | null;
//     verdicts: Array<{ actorId, actorName, levyId, chargedBp, paid, declined, modifierDelta,
//                        persistedCheckFailed?, detail? }>;
//     refused: Array<{ actorId, reason }>; // e.g. non-character actor
//   }>
//   moneyToBurn({ actorIds, dryRun }) => Promise<{
//     verdicts: Array<{ actorId, actorName, wipedBp, protectedBp, persistedCheckFailed?, detail? }>;
//     refused: Array<{ actorId, reason }>;
//   }>
// Both functions apply their own writes (native money-item debits + fork transaction-log append) and are
// expected to have ALREADY verified persistence internally; `persistedCheckFailed` on a verdict entry
// lets this handler surface a DP-16-equivalent NOT_PERSISTED without re-deriving the check.
//
// banking-and-income (invest / resolve-investment / list-investments / stash-deposit / stash-withdraw /
// accrue-interest) delegates to the fork's OWN headless, dialog-free banking engine
// (src/banking/banking-engine.js — Phase 1 of the same plan) via the same runtimeImport idiom. Investments
// live in a standalone `endeavourInvestments` world setting (accounts carry no per-account rate — Phase 5's
// falsified PRD premise, see the plan's Design Decision D2). DIALOG-PATH: the engine is contractually
// dialog-free (Phase 1 acceptance: zero Dialog/prompt control flow) — this handler never awaits a path
// that could open a Foundry dialog.
//
// Engine contract (fixed here at MCP-authoring time; Phase 1 implements TO this shape):
//   investDeposit({ actorId, rate, amountBp, economyId?, bankId? }) => Promise<{
//     investmentId: string; principalBp: number; walletBalanceBp: number;
//     persistedCheckFailed?: boolean; detail?: string;
//   }>
//   resolveInvestment({ investmentId, d100Roll }) => Promise<{
//     notFound?: true;
//     actorId: string; actorName: string | null; bankrupt: boolean; payoutBp: number;
//     principalBp: number; accruedBp: number; walletBalanceBp: number;
//     persistedCheckFailed?: boolean; detail?: string;
//   }>
//   listInvestments({ actorId?, activeOnly? }) => Promise<Array<{
//     investmentId, actorId, actorName, rate, principalBp, accruedBp, economyId, bankId, active
//   }>>
//   stashDeposit({ actorId, amountBp }) => Promise<{
//     stashBalanceBp: number; walletBalanceBp: number; persistedCheckFailed?: boolean; detail?: string;
//   }>
//   stashWithdraw({ actorId, d100Roll }) => Promise<{
//     notFound?: true;
//     lost: boolean; amountBp: number; walletBalanceBp: number;
//     persistedCheckFailed?: boolean; detail?: string;
//   }>
//   accrueInterest({ economyId?, dryRun }) => Promise<{
//     cycleApplied: true; lastCycleAt: string;
//     investmentVerdicts: Array<{ investmentId, actorId, actorName, accruedDeltaBp, accruedBp, persistedCheckFailed?, detail? }>;
//     accountVerdicts: Array<{ accountId, actorId, actorName, economyId, bankId, accruedDeltaBp, newBalanceBp, persistedCheckFailed?, detail? }>;
//     loanReminders: Array<{ accountId, actorId, actorName, totalOwedBp }>;
//   }>
// CYCLE SEMANTICS (Phase 5b, ADR-U3, plan D1/D7): NOT worldTime-elapsed-month gated. Every call accrues one
// abstract GM-declared cycle to every eligible entity — there is no "caught up" no-op shape. `cycleApplied`
// is always `true`; `lastCycleAt` is a display-only ISO stamp, never a gate. A second immediate call pays
// again. `runEconomicCycle` (full 6-duty cycle incl. rentals + the venture pass) is now exposed via MCP as
// its own `run-economic-cycle` action (Phase 9, D7 revisit — see handleRunEconomicCycle below); it
// delegates to the SAME engine export the module's "Run Economic Cycle" button calls. TRAP unchanged:
// firing both the button and this action for the same GM-declared cycle still double-pays — pick one.
// Same firstPersistFailure/notPersisted surfacing convention as levy-and-burn above.
//
// legitimate-business-enterprises (list-enterprises / get-enterprise / create-enterprise /
// connect-enterprise-actor / enterprise-income / enterprise-event / enterprise-pay-interest /
// enterprise-repay-debt / enterprise-upgrade) delegates to the fork's OWN headless, roll-free/dialog-free
// enterprises engine (src/enterprises/enterprise-engine.js — Phase 1 of the same plan) via the same
// runtimeImport idiom. Enterprises live in a standalone `enterprises` world setting ({ profiles,
// instances }); an instance's `backing` mode is 'create' (embeds a NEW wfrp4e-archives3.enterprise actor —
// gated on requireModuleActive('wfrp4e-archives3')) | 'link' (an EXISTING archives3 actor) | 'data-only'
// (no actor at all — pure ledger row). `list-enterprises`(default)/`get-enterprise` are PURE READS over the
// `enterprises` setting store, NOT engine delegations — the engine exposes no `listInstances`/`getEnterprise`.
//
// Engine contract (verified against E:\foundry_v13\data\Data\modules\wfrp4e-economy\src\enterprises\
// enterprise-engine.js — the 8 real exports):
//   createEnterprise({ presetKey?, profile?, backing, ownerActorId, actorId?, financedPortion? }) => Promise<
//     { profileNotFound: true }
//     | { invalidFinancing: true; minimumSelfFundedBp?: number; maximumFinancedBp?: number }
//     | { moduleInactive: true }
//     | { insufficientFunds: true; walletBalanceBp: number; requiredBp: number }
//     | { instanceId: string | null; actorUuid: string | null; debtPrincipalBp: number; walletBalanceBp: number;
//         persistedCheckFailed?: boolean; detail?: string }
//   >
//   discoverEnterpriseActors() => Promise<Array<{ actorId: string; actorUuid: string; name: string }>>
//   connectActor({ actorId, ownerActorId? }) => Promise<
//     { notFound: true } | { alreadyConnected: true; instanceId: string }
//     | { instanceId: string; actorUuid: string; persistedCheckFailed?: boolean; detail?: string }
//   >
//   income(id, { rolledTotal, outcome }) => Promise<
//     { notFound: true } | { invalidRoll: true }
//     | { payoutBp: number; walletBalanceBp: number; persistedCheckFailed?: boolean; detail?: string }
//   >
//   drawEvent(id, { d100Roll }) => Promise<
//     { notFound: true } | { invalidRoll: true } | { text: string; matchedOverride: boolean }
//   >
//     ⚠ drawEvent is the ONE duty with NO persistedCheckFailed self-verify branch (it never writes the
//     enterprises STORE — event text is a pure lookup; it only appends a zero-amount ledger row and
//     posts chat/Chronicle via enterprise-journal.js) — this handler must NOT check for it.
//   payInterest(id, { declineToPay? }) => Promise<
//     { notFound: true } | { insufficientFunds: true; walletBalanceBp: number; requiredBp: number }
//     | { paid: boolean; escalationTier?: number; walletBalanceBp?: number; persistedCheckFailed?: boolean; detail?: string }
//   >
//   repayDebt(id, { amountBp }) => Promise<
//     { notFound: true } | { insufficientFunds: true; walletBalanceBp: number; requiredBp: number }
//     | { principalBp: number; walletBalanceBp: number; appliedBp: number; unappliedBp: number;
//         persistedCheckFailed?: boolean; detail?: string }
//   >
//   upgrade(id, { level, financedPortion? }) => Promise<
//     { notFound: true } | { upgradeBlocked: true }
//     | { invalidLevel: true; level: number; requiredLevel: number }
//     | { invalidFinancing: true; minimumSelfFundedBp?: number; maximumFinancedBp?: number }
//     | { insufficientFunds: true; walletBalanceBp: number; requiredBp: number }
//     | { level: number; newUpkeep: number; debtPrincipalBp: number; walletBalanceBp: number;
//         persistedCheckFailed?: boolean; detail?: string }
//   >
//   deleteEnterprise(id) => Promise<
//     { notFound: true } | { deleted: true; name: string; persistedCheckFailed?: boolean; detail?: string }
//   >
//     Untrack only: removes the store instance; the backing Actor is never deleted, no coin moves,
//     logs an enterprise-delete ledger row. (Added post-Phase-6 L4a, user directive 2026-07-12.)
// Same firstPersistFailure/notPersisted surfacing convention as levy-and-burn/banking-and-income above;
// the schema's `financedPortionBp` maps to the engine's `financedPortion` param name.
//
// venture-ledger (create-venture / get-venture / list-ventures / subscribe-venture /
// transfer-venture-parts / settle-venture / distribute-venture / venture-event — Phase 7d,
// wfrp_economy_system_v1_prd.md §10) delegates to the fork's OWN headless, roll-free/dialog-free ventures
// engine (src/ventures/venture-engine.js) via the same runtimeImport idiom. Ventures are a standalone
// `ventures` world setting ({instances}) — NO `profiles` bucket (D1). get-venture/list-ventures are pure
// reads over that store, NOT engine delegations (same convention as list-enterprises/get-enterprise).
//
// Engine contract (verified against E:\foundry_v13\data\Data\modules\wfrp4e-economy\src\ventures\
// venture-engine.js):
//   createVenture({name,type,parts:{total,priceBp},terms?,handledBy?,linkedEnterpriseId?,exposureTags?})
//     => Promise<{invalidType:true}|{ventureHoldsVentureNotAllowed:true}
//        |{instanceId,name,type,status,standing,escrowBp,persistedCheckFailed?,detail?}>
//   getVenture(id) => Promise<{notFound:true}|(full deed record)>
//   listVentures({type?,status?}) => Promise<Array<full deed record>>
//   subscribeVenture(id,{actorId?,externalName?,parts}) => Promise<
//     {notFound:true}|{registryNotHandling:true}|{partsExceedTotal:true,partsAvailable}
//     |{insufficientFunds:true,walletBalanceBp,requiredBp}
//     |{ventureId,subscribedParts,escrowBp,walletBalanceBp,persistedCheckFailed?,detail?}>
//   queueTransfer(id,{sellerActorId?,sellerExternalName?,parts,askingPriceBp}) => Promise<
//     {notFound:true}|{holderNotFound:true}|{partsExceedHolding:true,partsHeld}
//     |{queued:true,offerId,persistedCheckFailed?,detail?}>
//   settleVenture(id,{netBp?}) => Promise<{notFound:true}|{doesNotSettle:true}|{noHolders:true}
//     |{settled:true,status,distributed}> — noHolders (BUG-549 residual fix) refuses BEFORE any write
//   distributeVenture(id) => Promise<{notFound:true}|{noHolders:true}
//     |{distributed:true,distributedBp,escrowBp,splits,persistedCheckFailed?,detail?}>
//   drawVentureEvent(id,{d100Roll}) => Promise<{notFound:true}|{invalidRoll:true}
//     |{text,standing,effect,persistedCheckFailed?,detail?}>
// `parts` on the engine's subscribeVenture/queueTransfer maps from this schema's `partsCount` field (NOT
// `parts` — that name is reserved on create-venture for the {total,priceBp} object; a scalar under the
// same key would collide in the flattened mcp-server inputSchema).
//
// trading (trading-list-settlements / trading-list-cargo-types / trading-get-season / trading-set-season /
// trading-check-availability / trading-calc-purchase-price / trading-calc-sale-price / trading-haggle-test /
// trading-gossip-test / trading-buy-cargo / trading-sell-cargo / trading-delete-rumour / trading-get-hold /
// trading-list-gazetteers / trading-import-gazetteer / trading-configure-gazetteers / trading-generate-merchant /
// trading-reveal-quality / trading-get-price-modifiers / trading-set-price-modifiers /
// trading-migration-status / trading-list-vehicle-actors / trading-connect-cargo-vehicle /
// trading-disconnect-cargo-vehicle — Phase 7f, wfrp-economy-phase7f plan) delegates to THREE fork files instead of
// one (the trading port collapsed the old TradingEngine class into a duty split — D5): trading-engine.js
// (tradingSeason/ensureMigrated/resolveSettlement/quotePurchasePrice/quoteSalePrice/buyCargo/sellCargo/
// getHold/mintAndStoreRumour/getRumours — the store-owning "5th headless engine"), gazetteer-store.js
// (pack load/merge/import — loadCargoCatalog/loadTuning/readActiveGazetteerIds/setActiveGazetteerIds/
// readImportedGazetteers/importGazetteerPack/loadActiveGazetteers/BUILTIN_GAZETTEER_IDS/loadBuiltinPack),
// and trading-math.js (the pure-calculator barrel — performHaggleTest/performGossipTest/
// runAvailabilityPipeline/calculateCargoSlots/generateMerchant/revealQuality/assignSecretQuality — none of
// these are re-exported by trading-engine.js, so this handler runtime-imports all three files). ALL THREE
// are MODAL-PROMPT-FREE + ROLL-FREE (HC10) — every stochastic duty takes caller pre-rolled integers; this
// handler never awaits a path that could open a Foundry dialog.
//
// Engine contract (fixed here at MCP-authoring time; Phase 2/3 of the same plan implemented TO this shape —
// verified against E:\foundry_v13\data\Data\modules\wfrp4e-economy\src\trading\*.js):
//   tradingSeason() => {season, seasonSource:'manual'|'calendar'|'fallback'} (sync, no Promise)
//   ensureMigrated() => Promise<{alreadyMigrated:true,migratedFrom}|{migrated:true,seededSeason,
//     seededHoldCount,seededCapacity,seededDial,persistedCheckFailed?,detail?}>
//   resolveSettlement(name) => Promise<{notFound:true}|{settlement,pack}>
//   quotePurchasePrice({cargoName,quantity,season?,quality?,economyId?}) => Promise<{notFound:true}|priceResult>
//     (economyId — addendum-2 per-economy climate; omitted = identity/no climate factor)
//   quoteSalePrice({cargoName,quantity,settlementName,season?,quality?,economyId?}) =>
//     Promise<{notFound:true}|{settlementNotFound:true}|priceResult>
//   buyCargo({actorId,cargoName,quantity,settlementName,season?,quality?,secretQualityD10Roll?,
//     originBonusSteps?}) => Promise<{notFound:true}|{capacityExceeded:true,capacity,currentHoldEp}
//     |{insufficientFunds:true,walletBalanceBp,requiredBp}
//     |{bought:true,lotId,totalBp,walletBalanceBp,rumourApplied:?{id,text,multiplier,persistedCheckFailed?,
//       detail?},persistedCheckFailed?,detail?}>
//   sellCargo({actorId,lotId,settlementName,isTradeSettlement,buyerRoll,halfCargoRetryRoll?,
//     weeksElapsedSincePurchase?,topShelfBuyerRoll?}) => Promise<{notFound:true}|{lotNotFound:true}
//     |{refused:true,gate,verdict}
//     |{soldPartial:true,quantitySold,quantityRemaining,totalBp,walletBalanceBp,rumourApplied,linkedDemandApplied}
//     |{sold:true,totalBp,walletBalanceBp,rumourApplied:?{id,text,multiplier,persistedCheckFailed?,detail?},
//       linkedDemandApplied:?{multiplier,reason},persistedCheckFailed?,detail?}>
//     ⚠ Trade Rumour Table redesign (post-7f Change 1/2): sellCargo no longer takes a `rumour` param — it
//     auto-matches a stored sellBonus rumour against the lot's cargoName itself (rumourSellMultiplier,
//     sale-mechanics.js) and consumes (deletes) it internally on a successful sale, same for buyCargo's
//     buyDiscount match. This handler must NEVER pass a `rumour`/`rumourId` field to either call anymore.
//     linkedDemandApplied (this task) is DISTINCT from rumourApplied: a standing settlement-data condition
//     (calculateSalePrice/sale-mechanics.js's linkedDemandMultiplier), re-evaluated fresh every call — never
//     minted/stored/consumed like a rumour. quoteSalePrice's own priceResult carries the same field.
//   getHold() => Array<lot> (sync) — RAW tradingCargoHold setting only, ignores a connected vehicle.
//   getHoldRows() (post-7f vehicle materialization, this task) => Array<row> (sync) — the UNIFIED read
//     across both hold modes (abstract tradingCargoHold array when no vehicle connected, the vehicle's own
//     embedded `cargo`-type Items when one is). This handler's trading-get-hold action, and the lot lookup
//     inside handleTradingBuyCargo, MUST call getHoldRows() — NEVER getHold() — or vehicle-connected mode
//     silently reads an empty/stale abstract array instead of the real cargo.
//   getRumours() => Array<rumour> (sync)
//   mintAndStoreRumour({gossipSuccess,rumourD100Roll}) => Promise<null|{minted:true,rumour:{id,text,goods,
//     effect,mintedAt},persistedCheckFailed?,detail?}> — rolls the RAW 20-band d100 Trade Rumour Table
//     (data/trading/rumour-table.json) and stores the row's own {kind:'sellBonus'|'buyDiscount',multiplier}
//     effect; returns null (zero writes) when gossipSuccess is false. Replaces the old flat single-cargo
//     2x-eligibility rumour model entirely (Change 2).
//   deleteRumour({rumourId}) => Promise<{notFound:true}|{deleted:true,persistedCheckFailed?,detail?}> —
//     GM-only manual removal (Change 1); also called internally by buyCargo/sellCargo to consume a matched
//     rumour on use.
//   [post-7f vehicle-linked cargo capacity, trading-engine.js]
//   getCargoCapacityInfo() => {capacity,capacitySource:'vehicle'|'manual',connectedVehicleName:?string} (sync)
//   discoverCargoVehicleActors() => Array<{actorId,actorUuid,name,carriesMax}> (sync) — unconnected world
//     `vehicle`-type actors
//   connectCargoVehicle({actorId}) => Promise<{notFound:true}|{actorUuid,carriesMax,persistedCheckFailed?,
//     detail?}>
//   disconnectCargoVehicle() => Promise<{disconnected:true,persistedCheckFailed?,detail?}>
//   [gazetteer-store.js] loadCargoCatalog()/loadTuning() => Promise<Array|Object>; readActiveGazetteerIds()
//     => Array<string> (sync); setActiveGazetteerIds(ids) => Promise<{active,persistedCheckFailed?,detail?}>
//     readImportedGazetteers() => Object<string,pack> (sync); importGazetteerPack(raw) =>
//     Promise<{invalidPack:true,detail}|{imported:true,packId,persistedCheckFailed?,detail?}>
//   [trading-math.js barrel] performHaggleTest/performGossipTest (sync); runAvailabilityPipeline (sync,
//     throws if rolls.length < slotCount — this handler pre-computes slotCount via calculateCargoSlots to
//     surface a typed refusal instead of letting the throw propagate); generateMerchant (sync); revealQuality
//     (sync, needs the lot's secretQuality.tierIndex as trueTierIndex).
// D7 (no new ledger allowlist field): buyCargo/sellCargo log via TransactionLogger internally with
// `type:'trade-buy'/'trade-sell'`, `source:'trade'` — this handler never calls TransactionLogger itself for
// trading actions (unlike delete-account/get-transaction-history-style reads elsewhere in this file).
//
// RETIREMENT (D2): buy-stock/sell-stock/get-portfolio are intercepted BEFORE any engine work — the
// dispatcher's RETIRED_ACTIONS check runs BEFORE the WRITE_ACTIONS/GM gate (a caller learns about the
// retirement + successor regardless of GM status; these 3 actions are no longer real writes so they were
// dropped from WRITE_ACTIONS), short-circuiting to a typed WFRP_ECONOMY_ACTION_RETIRED error naming the
// venture-ledger successors. Enum literals stay (HC8-as-amended); the old handler fns + Result interfaces
// + formatter cases are deleted.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { WfrpEconomyInput, type WfrpEconomyInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';


const MODULE_ID = 'wfrp4e-economy';
const SETTING_SCOPE = 'wfrp4e-economy';
const LARGE_TRANSFER_THRESHOLD = 4800; // 20 GC — transfers at/above require confirm:true (CCR-4)

// Write actions are GM-gated (warhammer-mcp runs as GM; the module fns also self-guard on isGM and would
// silently no-op for a non-GM, which our read-back verify would then surface as NOT_PERSISTED — reject early).
const WRITE_ACTIONS = new Set([
  'create-economy',
  'update-economy',
  'delete-economy',
  'create-account',
  'deposit',
  'withdraw',
  'transfer',
  'request-loan',
  'repay-loan',
  // buy-stock/sell-stock RETIRED Phase 7d (D2) — no longer real writes, removed from this set; the
  // retirement short-circuit fires before this gate is even checked (see RETIRED_ACTIONS below).
  'buy-property',
  'sell-property',
  'set-rented',
  'wallet-add',
  'wallet-remove',
  'record-transaction',
  'delete-account',
  'apply-levies',
  'money-to-burn',
  'invest',
  'resolve-investment',
  'stash-deposit',
  'stash-withdraw',
  'accrue-interest',
  'run-economic-cycle',
  'create-enterprise',
  'connect-enterprise-actor',
  'enterprise-income',
  'enterprise-event',
  'enterprise-pay-interest',
  'enterprise-repay-debt',
  'enterprise-upgrade',
  'delete-enterprise',
  'set-enterprise-owners',
  'add-enterprise-debt',
  'forgive-enterprise-debt',
  'save-levy-group',
  'delete-levy-group',
  'create-venture',
  'subscribe-venture',
  'transfer-venture-parts',
  'settle-venture',
  'distribute-venture',
  'venture-event',
  // BUG-842 — these five predate BUG-841 M8 and were never added; the engine fns self-guard on isGM()
  // and silently no-op for a non-GM, so without this gate a non-GM caller got a confusing NOT_PERSISTED
  // instead of a clean GM refusal.
  'delete-venture',
  'toggle-venture-badge',
  'issue-parts',
  'set-venture-status',
  'set-venture-standing',
  // BUG-841 M8 — the three GM lifecycle actions are real writes (status transitions + a capital-returning
  // distribution), so they belong in the early GM gate like their siblings.
  'launch-venture',
  'wind-up-venture',
  'close-out-venture',
  'trading-set-season',
  'trading-gossip-test', // Change 2: now mints+stores a rumour on a successful Gossip Test (real write)
  'trading-buy-cargo',
  'trading-sell-cargo',
  'trading-delete-rumour',
  'trading-import-gazetteer',
  'trading-configure-gazetteers',
  'trading-set-price-modifiers',
  'trading-migration-status', // idempotent (D2) but can write on first call — GM-gated like every other write
  'trading-connect-cargo-vehicle',
  'trading-disconnect-cargo-vehicle',
  'climate-set-state', // Phase 8 (D11) — GM-gated identically to trading-set-price-modifiers
]);

// D2 — the FIRST typed action retirement in the codebase. Checked immediately after the WRITE_ACTIONS/GM
// gate, before any engine import: buy-stock/sell-stock/get-portfolio are enum-preserved (HC8) but always
// refuse now that the Venture Ledger replaces stock trading.
const RETIRED_ACTIONS: Record<string, string> = {
  'buy-stock': 'create-venture / subscribe-venture',
  'sell-stock': 'transfer-venture-parts',
  'get-portfolio': 'list-ventures / get-venture',
};

// ── Local helpers ──────────────────────────────────────────────────────────────

function getSetting(key: string): any {
  return getGame()?.settings?.get?.(SETTING_SCOPE, key);
}

async function setSetting(key: string, value: unknown): Promise<void> {
  await getGame().settings.set(SETTING_SCOPE, key, value);
}

function readEconomies(): any[] {
  return getSetting('economies') ?? [];
}
function readBankAccounts(): Record<string, any> {
  return getSetting('bankAccounts') ?? {};
}
function readEnterprises(): { profiles: Record<string, any>; instances: Record<string, any> } {
  return getSetting('enterprises') ?? { profiles: {}, instances: {} };
}
function readVentures(): { instances: Record<string, any> } {
  return getSetting('ventures') ?? { instances: {} };
}
function ventureCount(): number {
  return Object.keys(readVentures().instances ?? {}).length;
}
function readLevies(): any[] {
  return getSetting('levies') ?? [];
}
function readLevyGroups(): any[] {
  return getSetting('levyGroups') ?? [];
}

function randomId(): string {
  const f = (globalThis as any).foundry;
  if (f?.utils?.randomID) return f.utils.randomID(16);
  return Math.random().toString(36).slice(2, 18).padEnd(16, '0');
}

function findEconomy(economyId: string): any | null {
  return readEconomies().find((e) => e?.id === economyId) ?? null;
}

function resolveBank(economy: any, bankId: string): any | null {
  return economy?.banks?.find((b: any) => b?.id === bankId) ?? null;
}

/**
 * Build the legacy `banker`-shaped descriptor that SocketHandler process methods still accept. Banker
 * assignments were retired in Phase 7g, so the account owner supplies actorId and no retired setting is
 * read.
 */
function resolveBanker(bankId: string, bankName: string | null, fallbackActorId: string): any {
  return { actorId: fallbackActorId, bankId, name: bankName ?? undefined };
}

function actorName(actorId: string | null | undefined): string | null {
  if (!actorId) return null;
  return getGame()?.actors?.get?.(actorId)?.name ?? null;
}

function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_TARGET_NOT_FOUND}: ${detail}` };
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_NOT_PERSISTED}: ${detail}` };
}

function confirmRequired(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_CONFIRM_REQUIRED}: ${detail}` };
}

/**
 * Runtime ESM import that EVADES esbuild/tsc static resolution (Function indirection). wfrp4e-economy
 * ships its src/ tree as individual servable modules (module.json esmodules is a thin loader), so these
 * URLs resolve and return the cached module namespace. Mirrors augur-nexus.ts L95-103.
 */
const runtimeImport = (specifier: string): Promise<any> => {
  // Test seam: the Function-wrapped dynamic import is un-mockable by vitest. When
  // globalThis.__wfrpEconomyRuntimeImport is a function (set ONLY by the unit tests), use it so the
  // DIRECT-method dispatch is deterministically coverable. Never set in Foundry → the real import runs.
  const override = (globalThis as any).__wfrpEconomyRuntimeImport;
  if (typeof override === 'function') return Promise.resolve(override(specifier));
  return (Function('s', 'return import(s)') as (s: string) => Promise<any>)(specifier);
};

const importSocketHandler = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/utils/socket-handler.js`).then((m) => m.SocketHandler);
const importTransactionLogger = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/utils/transaction-logger.js`).then((m) => m.TransactionLogger);
const importLevyEngine = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/levies/levy-engine.js`);
const importBankingEngine = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/banking/banking-engine.js`);
const importEnterpriseEngine = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/enterprises/enterprise-engine.js`);
const importVentureEngine = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/ventures/venture-engine.js`);
const importEconomyIntegrity = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/economy/economy-integrity.js`);
const importTradingEngine = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/trading/trading-engine.js`);
const importGazetteerStore = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/trading/gazetteer-store.js`);
const importTradingMath = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/trading/trading-math.js`);

function walletBalance(actorId: string, economyId: string | undefined): number {
  return Number(getGame()?.financial?.wallet?.getBalance?.(actorId, economyId ?? '') ?? 0);
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleWfrpEconomy(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: WfrpEconomyInputType;
  try {
    input = WfrpEconomyInput.parse(data);
  } catch (e) {
    return { success: false, error: `WFRP_ECONOMY_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  const retiredSuccessor = RETIRED_ACTIONS[input.action];
  if (retiredSuccessor) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_ACTION_RETIRED}: ${input.action} retired by the Venture Ledger (Phase 7d) — use ${retiredSuccessor}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `WFRP_ECONOMY_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // ── stand-up-an-economy ──
      case 'list-economies':
        return handleListEconomies();
      case 'get-economy':
        return handleGetEconomy(input);
      case 'list-bankers':
        return handleListBankers(input);
      case 'create-economy':
        return await handleCreateEconomy(input);
      case 'update-economy':
        return await handleUpdateEconomy(input);
      case 'delete-economy':
        return await handleDeleteEconomy(input);
      // ── open-a-bank-account ──
      case 'create-account':
        return await handleCreateAccount(input);
      case 'list-accounts':
        return handleListAccounts(input);
      // ── run-a-transaction ──
      case 'deposit':
      case 'withdraw':
        return await handleDepositWithdraw(input);
      case 'transfer':
        return await handleTransfer(input);
      // ── loan-cycle ──
      case 'request-loan':
        return await handleRequestLoan(input);
      case 'repay-loan':
        return await handleRepayLoan(input);
      // ── investment-cycle: RETIRED (D2) — intercepted above the switch, never reached here ──
      // ── property-management ──
      case 'buy-property':
        return await handleBuyProperty(input);
      case 'sell-property':
        return await handleSellProperty(input);
      case 'set-rented':
        return await handleSetRented(input);
      // ── wallet-quick-adjust ──
      case 'get-wallet-balance':
        return handleGetWalletBalance(input);
      case 'wallet-add':
      case 'wallet-remove':
        return await handleWalletAdjust(input);
      // ── audit-the-ledger ──
      case 'list-transactions':
        return await handleListTransactions(input);
      case 'actor-transaction-summary':
        return await handleActorSummary(input);
      case 'bank-transaction-summary':
        return await handleBankSummary(input);
      // ── unified-ledger (Phase 2) ──
      case 'record-transaction':
        return await handleRecordTransaction(input);
      case 'delete-account':
        return await handleDeleteAccount(input);
      // ── levy-and-burn (Phase 4) ──
      case 'apply-levies':
        return await handleApplyLevies(input);
      case 'money-to-burn':
        return await handleMoneyToBurn(input);
      // ── banking-and-income (Phase 5) ──
      case 'invest':
        return await handleInvest(input);
      case 'resolve-investment':
        return await handleResolveInvestment(input);
      case 'list-investments':
        return await handleListInvestments(input);
      case 'stash-deposit':
        return await handleStashDeposit(input);
      case 'stash-withdraw':
        return await handleStashWithdraw(input);
      case 'accrue-interest':
        return await handleAccrueInterest(input);
      case 'run-economic-cycle':
        return await handleRunEconomicCycle(input);
      // ── legitimate-business-enterprises (Phase 6) ──
      case 'list-enterprises':
        return await handleListEnterprises(input);
      case 'get-enterprise':
        return handleGetEnterprise(input);
      case 'create-enterprise':
        return await handleCreateEnterprise(input);
      case 'connect-enterprise-actor':
        return await handleConnectEnterpriseActor(input);
      case 'enterprise-income':
        return await handleEnterpriseIncome(input);
      case 'enterprise-event':
        return await handleEnterpriseEvent(input);
      case 'enterprise-pay-interest':
        return await handleEnterprisePayInterest(input);
      case 'enterprise-repay-debt':
        return await handleEnterpriseRepayDebt(input);
      case 'enterprise-upgrade':
        return await handleEnterpriseUpgrade(input);
      case 'delete-enterprise':
        return await handleDeleteEnterprise(input);
      // ── enterprise-ownership-and-debt (Phase 7c) ──
      case 'set-enterprise-owners':
        return await handleSetEnterpriseOwners(input);
      case 'add-enterprise-debt':
        return await handleAddEnterpriseDebt(input);
      case 'forgive-enterprise-debt':
        return await handleForgiveEnterpriseDebt(input);
      case 'set-enterprise-income-sources':
        return await handleSetEnterpriseIncomeSources(input);
      // ── levy-groups (Phase 7c) ──
      case 'list-levies':
        return handleListLevies(input);
      case 'save-levy-group':
        return await handleSaveLevyGroup(input);
      case 'list-levy-groups':
        return handleListLevyGroups(input);
      case 'delete-levy-group':
        return await handleDeleteLevyGroup(input);
      // ── venture-ledger (Phase 7d) ──
      case 'create-venture':
        return await handleCreateVenture(input);
      case 'get-venture':
        return await handleGetVenture(input);
      case 'list-ventures':
        return await handleListVentures(input);
      case 'subscribe-venture':
        return await handleSubscribeVenture(input);
      case 'transfer-venture-parts':
        return await handleTransferVentureParts(input);
      case 'settle-venture':
        return await handleSettleVenture(input);
      case 'distribute-venture':
        return await handleDistributeVenture(input);
      case 'delete-venture':
        return await handleDeleteVenture(input);
      // ── BUG-841 M8 — GM lifecycle controls (parity with the deed sheet's buttons) ──
      case 'launch-venture':
        return await handleLaunchVenture(input);
      case 'wind-up-venture':
        return await handleWindUpVenture(input);
      case 'close-out-venture':
        return await handleCloseOutVenture(input);
      case 'venture-event':
        return await handleVentureEvent(input);
      // ── venture-ledger (Phase 7d2 — Venture Events v2) ──
      case 'toggle-venture-badge':
        return await handleToggleVentureBadge(input);
      case 'issue-parts':
        return await handleIssueParts(input);
      case 'set-venture-status':
        return await handleSetVentureStatus(input);
      case 'set-venture-standing':
        return await handleSetVentureStanding(input);
      // ── trading (Phase 7f) ──
      case 'trading-list-settlements':
        return await handleTradingListSettlements(input);
      case 'trading-list-cargo-types':
        return await handleTradingListCargoTypes();
      case 'trading-get-season':
        return await handleTradingGetSeason();
      case 'trading-set-season':
        return await handleTradingSetSeason(input);
      case 'trading-check-availability':
        return await handleTradingCheckAvailability(input);
      case 'trading-calc-purchase-price':
        return await handleTradingCalcPurchasePrice(input);
      case 'trading-calc-sale-price':
        return await handleTradingCalcSalePrice(input);
      case 'trading-haggle-test':
        return await handleTradingHaggleTest(input);
      case 'trading-gossip-test':
        return await handleTradingGossipTest(input);
      case 'trading-buy-cargo':
        return await handleTradingBuyCargo(input);
      case 'trading-sell-cargo':
        return await handleTradingSellCargo(input);
      case 'trading-delete-rumour':
        return await handleTradingDeleteRumour(input);
      case 'trading-get-hold':
        return await handleTradingGetHold();
      case 'trading-list-vehicle-actors':
        return await handleTradingListVehicleActors();
      case 'trading-connect-cargo-vehicle':
        return await handleTradingConnectCargoVehicle(input);
      case 'trading-disconnect-cargo-vehicle':
        return await handleTradingDisconnectCargoVehicle();
      case 'trading-list-gazetteers':
        return await handleTradingListGazetteers();
      case 'trading-import-gazetteer':
        return await handleTradingImportGazetteer(input);
      case 'trading-configure-gazetteers':
        return await handleTradingConfigureGazetteers(input);
      case 'trading-generate-merchant':
        return await handleTradingGenerateMerchant(input);
      case 'trading-reveal-quality':
        return await handleTradingRevealQuality(input);
      case 'trading-get-price-modifiers':
        return handleTradingGetPriceModifiers();
      case 'trading-set-price-modifiers':
        return await handleTradingSetPriceModifiers(input);
      case 'trading-migration-status':
        return await handleTradingMigrationStatus();
      case 'climate-get-state':
        return await handleClimateGetState(input);
      case 'climate-set-state':
        return await handleClimateSetState(input);
      // Unreachable at runtime — RETIRED_ACTIONS intercepts these above, before this switch runs. Cases
      // kept only so the `never` exhaustiveness check below stays meaningful (D2).
      case 'buy-stock':
      case 'sell-stock':
      case 'get-portfolio':
        return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_ACTION_RETIRED}: ${input.action} retired by the Venture Ledger (Phase 7d)` };
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `WFRP_ECONOMY_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `WFRP_ECONOMY_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── stand-up-an-economy ──────────────────────────────────────────────────────────

function handleListEconomies(): Envelope<unknown> {
  const economies = readEconomies();
  // Ventures are world-scoped (not per-economy, D1) — the same total is additive on every row.
  const totalVentures = ventureCount();
  const list = economies.map((e: any) => ({
    id: e?.id,
    name: e?.name,
    currency: e?.currency ?? '',
    bankCount: e?.banks?.length ?? 0,
    propertyCount: e?.properties?.length ?? 0,
    stockCount: e?.stocks?.length ?? 0, // frozen — R7d.7
    ventureCount: totalVentures, // ADDITIVE, Phase 7d
  }));
  return { success: true, data: { action: 'list-economies', count: list.length, economies: list } };
}

type GetEconomyInput = Extract<WfrpEconomyInputType, { action: 'get-economy' }>;
function handleGetEconomy(input: GetEconomyInput): Envelope<unknown> {
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  // Follow-up plan (2026-07-19): optional propertyFilter — matches the wfrp4e-economy fork UI's
  // Available/Owned split (owner == null = available). Loose equality (not `!p.owner`) so `null`,
  // `undefined`, and a missing key all count as unowned regardless of which creation path wrote the
  // record (memo risk note: update-economy's properties[] doesn't visibly default-merge owner).
  const allProperties = economy.properties ?? [];
  const properties =
    input.propertyFilter === 'owned'
      ? allProperties.filter((p: any) => p?.owner != null)
      : input.propertyFilter === 'available'
        ? allProperties.filter((p: any) => p?.owner == null)
        : allProperties;
  return {
    success: true,
    data: {
      action: 'get-economy',
      economyId: economy.id,
      name: economy.name,
      currency: economy.currency ?? '',
      banks: economy.banks ?? [],
      properties,
      stocks: economy.stocks ?? [], // frozen — R7d.7
      ventureCount: ventureCount(), // ADDITIVE, Phase 7d — world-scoped, not per-economy
    },
  };
}

type ListBankersInput = Extract<WfrpEconomyInputType, { action: 'list-bankers' }>;
function handleListBankers(_input: ListBankersInput): Envelope<unknown> {
  return {
    success: true,
    data: {
      action: 'list-bankers', count: 0, bankers: [], retired: true,
      detail: 'Banker assignments were retired in Phase 7g; bank operations now use the account owner context.',
    },
  };
}

type CreateEconomyInput = Extract<WfrpEconomyInputType, { action: 'create-economy' }>;
async function handleCreateEconomy(input: CreateEconomyInput): Promise<Envelope<unknown>> {
  const economyId = randomId();
  const banks = (input.banks ?? []).map((b: any) => ({
    name: 'Bank',
    interestRate: 0,
    loanRate: 5,
    ...b,
    id: typeof b?.id === 'string' && b.id ? b.id : randomId(),
  }));
  const properties = (input.properties ?? []).map((p: any) => ({
    name: 'Property',
    value: 0,
    owner: null,
    ownerName: null,
    purchasedFromBankId: null,
    rented: false,
    ...p,
    id: typeof p?.id === 'string' && p.id ? p.id : randomId(),
  }));
  const stocks = (input.stocks ?? []).map((s: any) => {
    const currentPrice = Number(s?.currentPrice ?? 0);
    return {
      name: 'Stock',
      symbol: 'STK',
      currentPrice,
      availableShares: 0,
      priceHistory: Array.isArray(s?.priceHistory) ? s.priceHistory : [currentPrice],
      ...s,
      id: typeof s?.id === 'string' && s.id ? s.id : randomId(),
    };
  });

  const economy = {
    id: economyId,
    name: input.name,
    currency: input.currency ?? 'Gold Crowns',
    currencySystem: input.currencySystem ?? 'triCurrency',
    imagePath: '',
    banks,
    properties,
    stocks,
  };

  const economies = readEconomies();
  economies.push(economy);
  await setSetting('economies', economies);

  if (!findEconomy(economyId)) return notPersisted(`economy "${economyId}" absent after create`);
  notify.created('wfrp-economy', input.name, { summary: `economy ${economyId} (${banks.length} bank/${stocks.length} stock/${properties.length} prop)` });
  return {
    success: true,
    data: { action: 'create-economy', economyId, name: input.name, bankCount: banks.length, stockCount: stocks.length, propertyCount: properties.length, ventureCount: ventureCount() },
  };
}

type UpdateEconomyInput = Extract<WfrpEconomyInputType, { action: 'update-economy' }>;
async function handleUpdateEconomy(input: UpdateEconomyInput): Promise<Envelope<unknown>> {
  const economies = readEconomies();
  const idx = economies.findIndex((e: any) => e?.id === input.economyId);
  if (idx === -1) return targetNotFound(`economy "${input.economyId}" not found`);
  const economy = economies[idx];
  if (input.name !== undefined) economy.name = input.name;
  if (input.currency !== undefined) economy.currency = input.currency;
  if (input.currencySystem !== undefined) economy.currencySystem = input.currencySystem;
  if (input.banks !== undefined) economy.banks = input.banks;
  if (input.properties !== undefined) economy.properties = input.properties;
  if (input.stocks !== undefined) economy.stocks = input.stocks;
  economies[idx] = economy;
  await setSetting('economies', economies);

  const fresh = findEconomy(input.economyId);
  if (input.name !== undefined && fresh?.name !== input.name) {
    return notPersisted(`economy name expected "${input.name}", got "${fresh?.name ?? 'null'}"`);
  }
  notify.updated('wfrp-economy', economy.name, { summary: `economy ${input.economyId} updated` });
  return { success: true, data: { action: 'update-economy', economyId: input.economyId, name: economy.name } };
}

type DeleteEconomyInput = Extract<WfrpEconomyInputType, { action: 'delete-economy' }>;
async function handleDeleteEconomy(input: DeleteEconomyInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `delete-economy "${input.economyId}" archives the economy and dependent active records before removal. Transaction history is retained. Re-call with confirm:true.`,
    );
  }
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const name = economy.name;

  const integrity = await importEconomyIntegrity();
  const result = await integrity.archiveAndDeleteEconomy(input.economyId);
  if (result?.accessDenied) return { success: false, error: `WFRP_ECONOMY_ACCESS_DENIED: delete-economy requires GM` };
  if (result?.notFound) return targetNotFound(`economy "${input.economyId}" not found`);
  if (!result?.deleted) return notPersisted(`economy "${input.economyId}" deletion returned no success verdict`);
  if (result.persistedCheckFailed) return notPersisted(result.detail ?? `economy "${input.economyId}" deletion persisted only partially`);

  notify.deleted('wfrp-economy', name, { summary: `economy ${input.economyId} archived and removed; transaction history retained` });
  return {
    success: true,
    data: {
      action: 'delete-economy', economyId: input.economyId, deleted: true,
      archiveId: result.archiveId, affected: result.affected,
      transactionHistoryRetained: result.transactionHistoryRetained === true,
    },
  };
}

// ── open-a-bank-account ────────────────────────────────────────────────────────

type CreateAccountInput = Extract<WfrpEconomyInputType, { action: 'create-account' }>;
async function handleCreateAccount(input: CreateAccountInput): Promise<Envelope<unknown>> {
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  if (!resolveBank(economy, input.bankId)) return targetNotFound(`bank "${input.bankId}" not in economy "${input.economyId}"`);
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const SocketHandler = await importSocketHandler();
  const bankAccounts = readBankAccounts();
  const before = new Set(Object.keys(bankAccounts));
  // processCreateBank mutates the passed bankAccounts object and `await game.settings.set`s it. It does
  // NOT return the new id, so we diff the keyset.
  await SocketHandler.processCreateBank({
    selectedActorId: input.actorId,
    currentBanker: { bankId: input.bankId, economyId: input.economyId },
    bankAccounts,
  });

  const after = readBankAccounts();
  const newId = Object.keys(after).find((k) => !before.has(k) && after[k]?.actorId === input.actorId && after[k]?.bankId === input.bankId);
  if (!newId) return notPersisted(`no new bank account appeared for actor "${input.actorId}" at bank "${input.bankId}"`);

  notify.created('wfrp-economy', actorName(input.actorId) ?? input.actorId, { summary: `account ${newId} @ ${input.bankId}` });
  return {
    success: true,
    data: { action: 'create-account', economyId: input.economyId, bankId: input.bankId, actorId: input.actorId, accountId: newId, balance: Number(after[newId]?.balance ?? 0) },
  };
}

type ListAccountsInput = Extract<WfrpEconomyInputType, { action: 'list-accounts' }>;
function handleListAccounts(input: ListAccountsInput): Envelope<unknown> {
  const accounts = readBankAccounts();
  const list = Object.entries(accounts)
    .map(([accountId, a]: [string, any]) => ({
      accountId,
      actorId: a?.actorId,
      actorName: actorName(a?.actorId),
      bankId: a?.bankId,
      economyId: a?.economyId,
      balance: Number(a?.balance ?? 0),
      loanActive: Boolean(a?.loan?.active),
      loanAmount: a?.loan?.active ? Number(a?.loan?.amount ?? 0) : null,
    }))
    .filter((a) => (!input.economyId || a.economyId === input.economyId) && (!input.actorId || a.actorId === input.actorId));
  return { success: true, data: { action: 'list-accounts', count: list.length, accounts: list } };
}

// ── run-a-transaction ───────────────────────────────────────────────────────────

type DepositWithdrawInput = Extract<WfrpEconomyInputType, { action: 'deposit' | 'withdraw' }>;
async function handleDepositWithdraw(input: DepositWithdrawInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const bank = resolveBank(economy, account.bankId);
  const actorId: string = account.actorId;
  const beforeBalance = Number(account.balance ?? 0);

  // Pre-validate the funds path the module checks silently (it returns without writing on shortfall).
  if (input.action === 'deposit') {
    const wb = walletBalance(actorId, input.economyId);
    if (input.amountBp > wb) return notPersisted(`deposit of ${input.amountBp} BP exceeds wallet balance ${wb} BP (actor ${actorId})`);
  } else {
    if (input.amountBp > beforeBalance) return notPersisted(`withdraw of ${input.amountBp} BP exceeds account balance ${beforeBalance} BP`);
  }

  const banker = resolveBanker(account.bankId, bank?.name ?? null, actorId);
  const SocketHandler = await importSocketHandler();
  await SocketHandler.TransactionProcess({
    actorId,
    type: input.action,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
  });

  const after = readBankAccounts()[input.accountId];
  const afterBalance = Number(after?.balance ?? 0);
  const expected = input.action === 'deposit' ? beforeBalance + input.amountBp : beforeBalance - input.amountBp;
  if (afterBalance !== expected) {
    return notPersisted(`account balance expected ${expected} BP after ${input.action}, got ${afterBalance} BP`);
  }
  notify.updated('wfrp-economy', actorName(actorId) ?? actorId, { summary: `${input.action} ${input.amountBp} BP → account ${input.accountId}` });
  return {
    success: true,
    data: { action: input.action, accountId: input.accountId, amountBp: input.amountBp, accountBalance: afterBalance, walletBalanceBp: walletBalance(actorId, input.economyId) },
  };
}

type TransferInput = Extract<WfrpEconomyInputType, { action: 'transfer' }>;
async function handleTransfer(input: TransferInput): Promise<Envelope<unknown>> {
  if (input.amountBp >= LARGE_TRANSFER_THRESHOLD && input.confirm !== true) {
    return confirmRequired(`transfer of ${input.amountBp} BP (>= ${LARGE_TRANSFER_THRESHOLD} BP) is a large transfer. Re-call with confirm:true.`);
  }
  const accounts = readBankAccounts();
  const source = accounts[input.sourceAccountId];
  if (!source) return targetNotFound(`source account "${input.sourceAccountId}" not found`);
  const dest = accounts[input.destinationAccountId];
  if (!dest) return targetNotFound(`destination account "${input.destinationAccountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const beforeSource = Number(source.balance ?? 0);
  const beforeDest = Number(dest.balance ?? 0);
  if (input.amountBp > beforeSource) return notPersisted(`transfer of ${input.amountBp} BP exceeds source balance ${beforeSource} BP`);

  const bank = resolveBank(economy, source.bankId);
  const banker = resolveBanker(source.bankId, bank?.name ?? null, source.actorId);
  const SocketHandler = await importSocketHandler();
  const engineResult = await SocketHandler.TransferProcess({
    sourceActorId: source.actorId,
    sourceAccountId: input.sourceAccountId,
    destinationAccountId: input.destinationAccountId,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
    description: '',
  });
  if (engineResult?.ok === false) {
    return notPersisted(`transfer refused by engine: ${engineResult.code}${engineResult.detail ? ` — ${engineResult.detail}` : ''}`);
  }

  const fresh = readBankAccounts();
  const afterSource = Number(fresh[input.sourceAccountId]?.balance ?? 0);
  const afterDest = Number(fresh[input.destinationAccountId]?.balance ?? 0);
  if (afterSource !== beforeSource - input.amountBp || afterDest !== beforeDest + input.amountBp) {
    return notPersisted(`transfer not reflected: source ${beforeSource}->${afterSource}, dest ${beforeDest}->${afterDest} (amount ${input.amountBp})`);
  }
  notify.updated('wfrp-economy', `transfer ${input.amountBp} BP`, { summary: `${input.sourceAccountId} → ${input.destinationAccountId}` });
  return {
    success: true,
    data: { action: 'transfer', sourceAccountId: input.sourceAccountId, destinationAccountId: input.destinationAccountId, amountBp: input.amountBp, sourceBalance: afterSource, destinationBalance: afterDest },
  };
}

// ── loan-cycle ──────────────────────────────────────────────────────────────────

type RequestLoanInput = Extract<WfrpEconomyInputType, { action: 'request-loan' }>;
async function handleRequestLoan(input: RequestLoanInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  if (account.loan?.active) return notPersisted(`account "${input.accountId}" already has an active loan`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const bank = resolveBank(economy, account.bankId);
  const banker = resolveBanker(account.bankId, bank?.name ?? null, account.actorId);

  const SocketHandler = await importSocketHandler();
  const engineResult = await SocketHandler.LoanProcess({
    actorId: account.actorId,
    accountId: input.accountId,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
    // Published contract takes interestRate as a PERCENT (e.g. 5 = 5%); the module stores loan.interest
    // as a FRACTION (socket-handler.js:780-781). Convert here; undefined falls through to bank.loanRate.
    // (BUG-546/DF8: the engine ignores caller-supplied interestRate on request — kept for back-compat.)
    interestRate: input.interestRate != null ? input.interestRate / 100 : undefined,
    loanAction: 'request',
  });
  if (engineResult?.ok === false) {
    return notPersisted(`loan request refused by engine: ${engineResult.code}${engineResult.detail ? ` — ${engineResult.detail}` : ''}`);
  }

  const after = readBankAccounts()[input.accountId];
  if (!after?.loan?.active || Number(after.loan.amount) !== input.amountBp) {
    return notPersisted(`loan not active/wrong amount after request (loan=${JSON.stringify(after?.loan ?? null)})`);
  }
  notify.updated('wfrp-economy', actorName(account.actorId) ?? account.actorId, { summary: `loan ${input.amountBp} BP @ ${(Number(after.loan.interest) * 100).toFixed(2)}% on ${input.accountId}` });
  return {
    success: true,
    data: { action: 'request-loan', accountId: input.accountId, amountBp: input.amountBp, loanAmount: Number(after.loan.amount), loanActive: true, accountBalance: Number(after.balance ?? 0) },
  };
}

type RepayLoanInput = Extract<WfrpEconomyInputType, { action: 'repay-loan' }>;
async function handleRepayLoan(input: RepayLoanInput): Promise<Envelope<unknown>> {
  const account = readBankAccounts()[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  if (!account.loan?.active) return notPersisted(`account "${input.accountId}" has no active loan to repay`);
  // ALIASING GUARD: game.settings.get returns Foundry's CACHED bankAccounts object reference; the module's
  // _handleLoanProcess mutates account.balance / account.loan.amount IN PLACE on that same object. Snapshot
  // the before-state as PRIMITIVES now, so the post-write verification compares against the true pre-values
  // (not the mutated-in-place reference). Without this, account.balance reads the AFTER value post-call →
  // false WFRP_ECONOMY_NOT_PERSISTED on a repay that actually succeeded.
  const beforeBalance = Number(account.balance ?? 0);
  const beforeLoanAmount = Number(account.loan.amount ?? 0);
  // account.loan.interest is a FRACTION (0.1 = 10%), per the module's own storage convention
  // (socket-handler.js:780-781 explicit comment, consistent with bank.loanRate). BUG-542: the old
  // formula divided by 100 as if it were a percent → ~100x undercharge vs the module's math.
  const interest = Number(account.loan.interest ?? 0);
  // The module is interest-bearing: a full payoff costs round(principal × (1 + interest)) — mirror of
  // socket-handler.js:817. A repay below that is a valid PARTIAL repayment (reduces principal, loan
  // stays active) — not a failure.
  const totalOwed = Math.round(beforeLoanAmount * (1 + interest));
  if (input.amountBp > beforeBalance) {
    return notPersisted(`repay of ${input.amountBp} BP exceeds account balance ${beforeBalance} BP`);
  }
  if (input.amountBp > totalOwed) {
    return notPersisted(
      `repay of ${input.amountBp} BP exceeds total owed ${totalOwed} BP (principal ${beforeLoanAmount} + ${(interest * 100).toFixed(2)}% interest); the module rejects over-repayment`,
    );
  }
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const bank = resolveBank(economy, account.bankId);
  const banker = resolveBanker(account.bankId, bank?.name ?? null, account.actorId);

  const SocketHandler = await importSocketHandler();
  const engineResult = await SocketHandler.LoanProcess({
    actorId: account.actorId,
    accountId: input.accountId,
    economyId: input.economyId,
    currency: economy.currency,
    banker,
    amount: input.amountBp,
    interestRate: interest,
    loanAction: 'repay',
  });
  if (engineResult?.ok === false) {
    return notPersisted(`loan repay refused by engine: ${engineResult.code}${engineResult.detail ? ` — ${engineResult.detail}` : ''}`);
  }

  const after = readBankAccounts()[input.accountId];
  const afterBalance = Number(after?.balance ?? 0);
  if (afterBalance !== beforeBalance - input.amountBp) {
    return notPersisted(`account balance expected ${beforeBalance - input.amountBp} BP after repay, got ${afterBalance} BP`);
  }
  const loanCleared = !after?.loan?.active;
  const remainingLoan = Number(after?.loan?.amount ?? 0);
  // The module clears the loan only when amount >= totalOwed (it leaves loan.amount unchanged but flips
  // active=false). A partial repay keeps the loan active with a reduced principal. Verify the right outcome.
  if (!loanCleared && remainingLoan >= beforeLoanAmount) {
    return notPersisted(`repay did not reduce loan principal (before ${beforeLoanAmount} BP, after ${remainingLoan} BP)`);
  }
  notify.updated('wfrp-economy', actorName(account.actorId) ?? account.actorId, {
    summary: `repaid ${input.amountBp} BP on ${input.accountId}${loanCleared ? ' (loan cleared)' : ` (partial — ${remainingLoan.toFixed(2)} BP principal remains)`}`,
  });
  return {
    success: true,
    data: {
      action: 'repay-loan',
      accountId: input.accountId,
      amountBp: input.amountBp,
      totalOwed,
      loanCleared,
      loanAmount: remainingLoan,
      loanActive: Boolean(after?.loan?.active),
      accountBalance: afterBalance,
    },
  };
}

// ── investment-cycle: RETIRED Phase 7d (D2) — handlers removed, see venture-ledger below ──────

// ── property-management ─────────────────────────────────────────────────────────

type BuyPropertyInput = Extract<WfrpEconomyInputType, { action: 'buy-property' }>;
async function handleBuyProperty(input: BuyPropertyInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const property = economy.properties?.find((p: any) => p?.id === input.propertyId);
  if (!property) return targetNotFound(`property "${input.propertyId}" not in economy "${input.economyId}"`);
  if (property.owner) return notPersisted(`property "${input.propertyId}" already owned by ${property.owner}`);
  const propertyValue = Number(property.value ?? 0);
  if (propertyValue > Number(account.balance ?? 0)) return notPersisted(`property value ${propertyValue} BP exceeds account balance ${Number(account.balance ?? 0)} BP`);
  const bank = resolveBank(economy, account.bankId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processPropertyPurchase({
    actorId: account.actorId,
    propertyId: input.propertyId,
    economyId: input.economyId,
    bankId: account.bankId,
    bankName: bank?.name ?? 'Bank',
    propertyValue,
    currency: economy.currency,
    propertyName: property.name,
  });

  const freshProp = findEconomy(input.economyId)?.properties?.find((p: any) => p?.id === input.propertyId);
  if (freshProp?.owner !== account.actorId) {
    return notPersisted(`property owner expected ${account.actorId}, got ${freshProp?.owner ?? 'null'} after buy-property`);
  }
  notify.updated('wfrp-economy', property.name, { summary: `bought by ${actorName(account.actorId) ?? account.actorId} for ${propertyValue} BP` });
  return {
    success: true,
    data: { action: 'buy-property', propertyId: input.propertyId, accountId: input.accountId, owner: account.actorId, ownerName: actorName(account.actorId), accountBalance: Number(readBankAccounts()[input.accountId]?.balance ?? 0) },
  };
}

type SellPropertyInput = Extract<WfrpEconomyInputType, { action: 'sell-property' }>;
async function handleSellProperty(input: SellPropertyInput): Promise<Envelope<unknown>> {
  const accounts = readBankAccounts();
  const account = accounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const property = economy.properties?.find((p: any) => p?.id === input.propertyId);
  if (!property) return targetNotFound(`property "${input.propertyId}" not in economy "${input.economyId}"`);
  if (property.owner !== account.actorId) return notPersisted(`property "${input.propertyId}" not owned by account holder ${account.actorId} (owner=${property.owner ?? 'null'})`);
  // GM-configurable rate (Phase 2, default 0.8) — matches the module UI's sell path, which reads the
  // same setting (bank-property-manager.js). Was previously the full property value (parity gap).
  const propertySaleRate = Number(getGame()?.settings?.get?.(SETTING_SCOPE, 'propertySaleRate') ?? 0.8);
  const saleValue = Math.round(Number(property.value ?? 0) * propertySaleRate);
  const bank = resolveBank(economy, account.bankId);

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processPropertySale({
    actorId: account.actorId,
    propertyId: input.propertyId,
    economyId: input.economyId,
    bankId: account.bankId,
    bankName: bank?.name ?? 'Bank',
    saleValue,
    currency: economy.currency,
    propertyName: property.name,
  });

  const freshProp = findEconomy(input.economyId)?.properties?.find((p: any) => p?.id === input.propertyId);
  if (freshProp?.owner !== null && freshProp?.owner !== undefined) {
    return notPersisted(`property owner expected null after sell-property, got ${freshProp?.owner}`);
  }
  notify.updated('wfrp-economy', property.name, { summary: `sold by ${actorName(account.actorId) ?? account.actorId} for ${saleValue} BP` });
  return {
    success: true,
    data: { action: 'sell-property', propertyId: input.propertyId, accountId: input.accountId, accountBalance: Number(readBankAccounts()[input.accountId]?.balance ?? 0) },
  };
}

type SetRentedInput = Extract<WfrpEconomyInputType, { action: 'set-rented' }>;
async function handleSetRented(input: SetRentedInput): Promise<Envelope<unknown>> {
  const economy = findEconomy(input.economyId);
  if (!economy) return targetNotFound(`economy "${input.economyId}" not found`);
  const property = economy.properties?.find((p: any) => p?.id === input.propertyId);
  if (!property) return targetNotFound(`property "${input.propertyId}" not in economy "${input.economyId}"`);

  const currentBanker = {
    bankId: property.purchasedFromBankId ?? economy.banks?.[0]?.id ?? null,
    actorId: property.owner ?? null,
  };

  const SocketHandler = await importSocketHandler();
  await SocketHandler.processRentedChange({
    propertyId: input.propertyId,
    isRented: input.rented,
    currentBanker,
    economy,
    selectedAccountIds: {},
  });

  const freshProp = findEconomy(input.economyId)?.properties?.find((p: any) => p?.id === input.propertyId);
  if (Boolean(freshProp?.rented) !== input.rented) {
    return notPersisted(`property rented expected ${input.rented}, got ${Boolean(freshProp?.rented)} after set-rented`);
  }
  notify.updated('wfrp-economy', property.name, { summary: `rented → ${input.rented}` });
  return { success: true, data: { action: 'set-rented', propertyId: input.propertyId, rented: input.rented } };
}

// ── wallet-quick-adjust ─────────────────────────────────────────────────────────

type GetWalletInput = Extract<WfrpEconomyInputType, { action: 'get-wallet-balance' }>;
function handleGetWalletBalance(input: GetWalletInput): Envelope<unknown> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);
  return { success: true, data: { action: 'get-wallet-balance', actorId: input.actorId, balanceBp: walletBalance(input.actorId, input.economyId) } };
}

type WalletAdjustInput = Extract<WfrpEconomyInputType, { action: 'wallet-add' | 'wallet-remove' }>;
async function handleWalletAdjust(input: WalletAdjustInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);
  const before = walletBalance(input.actorId, input.economyId);
  const wallet = getGame()?.financial?.wallet;
  if (!wallet) return targetNotFound('game.financial.wallet is unavailable (module not ready)');

  if (input.action === 'wallet-add') {
    await wallet.addFunds(input.actorId, input.economyId ?? '', input.amountBp);
  } else {
    await wallet.removeFunds(input.actorId, input.economyId ?? '', input.amountBp);
  }

  const after = walletBalance(input.actorId, input.economyId);
  const expected = input.action === 'wallet-add' ? before + input.amountBp : Math.max(0, before - input.amountBp);
  if (after !== expected) {
    return notPersisted(`wallet balance expected ${expected} BP after ${input.action}, got ${after} BP (actor may lack money items)`);
  }
  notify.updated('wfrp-economy', actorName(input.actorId) ?? input.actorId, { summary: `${input.action} ${input.amountBp} BP → ${after} BP` });
  return { success: true, data: { action: input.action, actorId: input.actorId, amountBp: input.amountBp, balanceBp: after } };
}

// ── audit-the-ledger ────────────────────────────────────────────────────────────

type ListTxInput = Extract<WfrpEconomyInputType, { action: 'list-transactions' }>;
async function handleListTransactions(input: ListTxInput): Promise<Envelope<unknown>> {
  const TransactionLogger = await importTransactionLogger();
  const filters: Record<string, unknown> = {};
  if (input.actorId) filters.actorId = input.actorId;
  if (input.economyId) filters.economyId = input.economyId;
  if (input.type) filters.type = input.type;
  if (input.bankId) filters.bankId = input.bankId;
  if (input.source) filters.source = input.source;
  const logs = TransactionLogger.getTransactionLogs(filters) ?? [];
  const list = logs.map((l: any) => ({
    id: l?.id,
    type: l?.type,
    source: l?.source ?? null,
    actorId: l?.actorId ?? null,
    actorName: l?.actorName ?? null,
    economyId: l?.economyId ?? null,
    bankId: l?.bankId ?? null,
    // Phase5b validate: rows STORE bankName (engine G4 resolves it via findBank) but the
    // projection dropped it — task 1.2's probe asserts non-null bankName on engine rows here.
    bankName: l?.bankName ?? null,
    amount: Number(l?.amount ?? 0),
    amountDisplay: l?.amountDisplay ?? null,
    // Phase4 validate F12: rows STORE targetActorId/Name (ledger.ts resolves them) but the
    // projection dropped both — the item-ops-money-transfer eval pair asserts the target.
    targetActorId: l?.targetActorId ?? null,
    targetActorName: l?.targetActorName ?? null,
    // Phase 6 (legitimate-business-enterprises): enterprise-* rows carry an enterpriseId naming the
    // instance (enterprise-engine.js TransactionLogger.logTransaction calls) — surface it same as
    // bankName/targetActorId above rather than silently dropping it.
    enterpriseId: l?.enterpriseId ?? null,
    // Phase 7d (D16): venture-* rows carry a ventureId naming the deed instance — same convention as
    // enterpriseId/bankName/targetActorId above, not silently dropped.
    ventureId: l?.ventureId ?? null,
    description: l?.description ?? '',
    date: l?.date ?? null,
  }));
  return { success: true, data: { action: 'list-transactions', count: list.length, transactions: list } };
}

// BUG-471 (D5): re-bucket the module's summary at READ, WITHOUT patching wfrp4e-economy. The module
// aggregators (transaction-logger.js getActor/getBankTransactionSummary) match stock sales by
// 'stock_sale' (underscore) while rows are logged 'stock-sale' (hyphen), and only credit actor-side
// loans under the targetActorId clause — so a borrower-actor's own loan and every hyphen-spelled stock
// sale silently drop to 0. Re-derive both from the FULL logs (both spellings, both actor sides), and
// localize raw i18n-key descriptions (e.g. the withdraw row `financial-system.bank.transactions.withdraw`)
// in recentTransactions. The summary itself only carries recentTransactions.slice(0,5), so we re-read
// via getTransactionLogs. On any module-shape drift the caller keeps the unmodified module summary.
export function rebucketEconomySummary(summary: any, logs: any[], scope: { actorId?: string }): void {
  const isStockSale = (t: unknown) => t === 'stock-sale' || t === 'stock_sale';
  const inScope = (l: any) => (scope.actorId ? l?.actorId === scope.actorId || l?.targetActorId === scope.actorId : true);
  const sum = (pred: (l: any) => boolean) =>
    logs.filter((l) => inScope(l) && pred(l)).reduce((s: number, l: any) => s + (Number(l?.amount) || 0), 0);
  summary.totalStockSales = sum((l) => isStockSale(l?.type));
  summary.totalLoans = sum((l) => String(l?.type) === 'loan');
  // Displays were formatted from the module's stale (0) totals — restate in the base BP unit so they
  // don't contradict the corrected numerics (Rule 12: no silent stale field).
  summary.totalStockSalesDisplay = `${summary.totalStockSales} BP`;
  summary.totalLoansDisplay = `${summary.totalLoans} BP`;
  // Phase 7d (D17): BUG-471 4th site — venture-* rows are bucketed at the fork's transaction-logger.js
  // (P7d-5, sites 1-2) AND the display switch (P7d-13, site 3); this handler-side re-derivation is site 4.
  summary.totalVenture = sum((l) => String(l?.type).startsWith('venture-'));
  summary.totalVentureDisplay = `${summary.totalVenture} BP`;
  const i18n = (globalThis as any).game?.i18n;
  if (i18n?.localize && Array.isArray(summary.recentTransactions)) {
    summary.recentTransactions = summary.recentTransactions.map((tx: any) => {
      const d = tx?.description;
      if (typeof d === 'string' && !d.includes(' ') && /^[a-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(d)) {
        const loc = i18n.localize(d);
        if (loc && loc !== d) return { ...tx, description: loc };
      }
      return tx;
    });
  }
}

type ActorSummaryInput = Extract<WfrpEconomyInputType, { action: 'actor-transaction-summary' }>;
async function handleActorSummary(input: ActorSummaryInput): Promise<Envelope<unknown>> {
  const TransactionLogger = await importTransactionLogger();
  const summary = TransactionLogger.getActorTransactionSummary(input.actorId, input.economyId) ?? {};
  try {
    const logs: any[] = TransactionLogger.getTransactionLogs?.({ actorId: input.actorId, economyId: input.economyId }) ?? [];
    rebucketEconomySummary(summary, logs, { actorId: input.actorId });
  } catch { /* module-shape drift — return the module summary unmodified */ }
  return { success: true, data: { action: 'actor-transaction-summary', actorId: input.actorId, economyId: input.economyId, summary } };
}

type BankSummaryInput = Extract<WfrpEconomyInputType, { action: 'bank-transaction-summary' }>;
async function handleBankSummary(input: BankSummaryInput): Promise<Envelope<unknown>> {
  const TransactionLogger = await importTransactionLogger();
  const summary = TransactionLogger.getBankTransactionSummary(input.bankId, input.economyId) ?? {};
  try {
    const logs: any[] = TransactionLogger.getTransactionLogs?.({ bankId: input.bankId, economyId: input.economyId }) ?? [];
    rebucketEconomySummary(summary, logs, {});
  } catch { /* module-shape drift — return the module summary unmodified */ }
  return { success: true, data: { action: 'bank-transaction-summary', bankId: input.bankId, economyId: input.economyId, summary } };
}

// ── unified-ledger (Phase 2, wfrp_economy_system) ───────────────────────────────
//
// Hybrid MCP-layer seam (Option D, phase2_pre_plan.md §Recommended approach): record-transaction is the
// arbitrary-append entry point for callers OUTSIDE this module's own 9 tracked ops (status earnings,
// /wfrp-trade, item-piles, future levies). The module's own 9 handlers above (deposit/withdraw/transfer/
// loan/stock/property) do NOT call this — they already log via TransactionLogger internally (R2.2, no
// double-log). delete-account mirrors delete-economy's confirm idiom exactly (generic confirmRequired/
// notPersisted/targetNotFound helpers, NOT bespoke per-action error tokens — matches every other action
// in this file; Rule 11 codebase-convention match over the plan's literal "WFRP_ECONOMY_DELETE_*" token
// wording).

type RecordTransactionInput = Extract<WfrpEconomyInputType, { action: 'record-transaction' }>;
async function handleRecordTransaction(input: RecordTransactionInput): Promise<Envelope<unknown>> {
  const actor = getGame()?.actors?.get?.(input.actorId);
  if (!actor) return targetNotFound(`actor "${input.actorId}" not found`);

  const TransactionLogger = await importTransactionLogger();
  const transactionId: string = await TransactionLogger.logTransaction({
    type: input.type,
    source: input.source,
    actorId: input.actorId,
    actorName: actor.name,
    economyId: input.economyId,
    bankId: input.bankId,
    amount: input.amountBp,
    currency: input.currency,
    description: input.description,
    targetActorId: input.targetActorId,
    targetActorName: actorName(input.targetActorId),
  });

  const verifyLogs: any[] = TransactionLogger.getTransactionLogs?.({ source: input.source }) ?? [];
  if (!verifyLogs.some((l: any) => l?.id === transactionId)) {
    return notPersisted(`transaction "${transactionId}" not found in ledger after record-transaction`);
  }
  notify.created('wfrp-economy', actor.name, { summary: `${input.source}/${input.type} ${input.amountBp} BP logged (${transactionId})` });
  return {
    success: true,
    data: { action: 'record-transaction', actorId: input.actorId, amountBp: input.amountBp, source: input.source, type: input.type, transactionId },
  };
}

type DeleteAccountInput = Extract<WfrpEconomyInputType, { action: 'delete-account' }>;
async function handleDeleteAccount(input: DeleteAccountInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`delete-account "${input.accountId}" removes the account record (transaction history is kept). Re-call with confirm:true.`);
  }
  const bankAccounts = readBankAccounts();
  const account = bankAccounts[input.accountId];
  if (!account) return targetNotFound(`bank account "${input.accountId}" not found`);

  const SocketHandler = await importSocketHandler();
  const engineResult = await SocketHandler.processDeleteAccount({ accountId: input.accountId, bankAccounts });
  if (engineResult?.ok === false) {
    // ACCOUNT_HAS_OBLIGATIONS carries the actionable blockers list (non-zero balance / active loan /
    // linked property) — surface it instead of masking the deliberate refusal as NOT_PERSISTED.
    const blockers = Array.isArray(engineResult?.data?.blockers)
      ? ` Blockers: ${engineResult.data.blockers.map((b: any) => b?.detail ?? b?.code).join('; ')}`
      : '';
    return notPersisted(`delete-account refused by engine: ${engineResult.code}${engineResult.detail ? ` — ${engineResult.detail}` : ''}${blockers}`);
  }

  if (readBankAccounts()[input.accountId]) return notPersisted(`bank account "${input.accountId}" still present after delete-account`);
  notify.deleted('wfrp-economy', actorName(account.actorId) ?? input.accountId, { summary: `account ${input.accountId} deleted` });
  return { success: true, data: { action: 'delete-account', accountId: input.accountId, deleted: true } };
}

// ── levy-and-burn (Phase 4, wfrp_economy_system) ────────────────────────────────
//
// Both actions DELEGATE to the fork's own headless levy-engine.js (see the engine-contract comment at the
// top of this file). The engine owns arithmetic, sequencing, and its own DP-16-equivalent persistence
// checks per verdict; this handler validates actor existence up front, surfaces any `persistedCheckFailed`
// verdict as WFRP_ECONOMY_NOT_PERSISTED, and never re-derives the engine's internal math.

function missingActor(actorIds: readonly string[]): string | null {
  for (const id of actorIds) {
    if (!getGame()?.actors?.get?.(id)) return id;
  }
  return null;
}

function firstPersistFailure(verdicts: unknown): { actorId: string; detail: string } | null {
  if (!Array.isArray(verdicts)) return null;
  for (const v of verdicts as any[]) {
    if (v?.persistedCheckFailed) return { actorId: String(v?.actorId ?? 'unknown'), detail: String(v?.detail ?? 'unknown') };
  }
  return null;
}

// Venture-pass verdicts (runVenturePass) key on ventureId, not actorId — a dedicated scanner mirrors
// firstPersistFailure's contract but reports the venture instance instead of an actor.
function firstVentureVerdictFailure(verdicts: unknown): { ventureId: string; detail: string } | null {
  if (!Array.isArray(verdicts)) return null;
  for (const v of verdicts as any[]) {
    if (v?.persistedCheckFailed) return { ventureId: String(v?.ventureId ?? 'unknown'), detail: String(v?.detail ?? 'unknown') };
  }
  return null;
}

type ApplyLeviesInput = Extract<WfrpEconomyInputType, { action: 'apply-levies' }>;
async function handleApplyLevies(input: ApplyLeviesInput): Promise<Envelope<unknown>> {
  // Phase 7c (R7c.5): explicit actorIds still validates up front (back-compat); target/groupId are
  // resolved ENGINE-SIDE by resolveTargets() — an unknown groupId resolves to an empty roster there
  // (zero verdicts, zero refused), not a handler-side error.
  if (input.actorIds) {
    const missing = missingActor(input.actorIds);
    if (missing) return targetNotFound(`actor "${missing}" not found`);
  }

  const LevyEngine = await importLevyEngine();
  const dryRun = input.dryRun === true;
  const result = await LevyEngine.applyLevies({
    economyId: input.economyId,
    levyIds: input.levyIds,
    actorIds: input.actorIds,
    target: input.target,
    groupId: input.groupId,
    excludeActorIds: input.excludeActorIds,
    dryRun,
    declared: input.declared,
  });

  if (!dryRun) {
    const failure = firstPersistFailure(result?.verdicts);
    if (failure) return notPersisted(`levy verdict for actor "${failure.actorId}" failed persistence check: ${failure.detail}`);
  }

  const elapsedWeeks = Number(result?.elapsedWeeks ?? 0);
  const verdicts = Array.isArray(result?.verdicts) ? result.verdicts : [];
  const refused = Array.isArray(result?.refused) ? result.refused : [];
  notify.updated('wfrp-economy', 'levies', {
    summary: `${dryRun ? '[dry-run] ' : ''}apply-levies: elapsedWeeks=${elapsedWeeks}, ${verdicts.length} verdict(s), ${refused.length} refused`,
  });
  return {
    success: true,
    data: {
      action: 'apply-levies',
      dryRun,
      declared: input.declared === true,
      groupId: input.groupId ?? null,
      elapsedWeeks,
      weekIndex: result?.weekIndex ?? null,
      verdicts,
      refused,
    },
  };
}

type MoneyToBurnInput = Extract<WfrpEconomyInputType, { action: 'money-to-burn' }>;
async function handleMoneyToBurn(input: MoneyToBurnInput): Promise<Envelope<unknown>> {
  const dryRun = input.dryRun === true;
  if (!dryRun && input.confirm !== true) {
    return confirmRequired(
      `money-to-burn wipes unprotected carried coin for the resolved roster (bank-account + recorded-stash balances survive; items are never deleted). Re-call with confirm:true, or dryRun:true to preview first.`,
    );
  }
  // Phase 7c (Q&A fold-in): same actorIds/target/groupId resolution contract as apply-levies above.
  if (input.actorIds) {
    const missing = missingActor(input.actorIds);
    if (missing) return targetNotFound(`actor "${missing}" not found`);
  }

  const LevyEngine = await importLevyEngine();
  const result = await LevyEngine.moneyToBurn({ economyId: input.economyId, actorIds: input.actorIds, target: input.target, groupId: input.groupId, dryRun });

  if (!dryRun) {
    const failure = firstPersistFailure(result?.verdicts);
    if (failure) return notPersisted(`money-to-burn verdict for actor "${failure.actorId}" failed persistence check: ${failure.detail}`);
  }

  const verdicts = Array.isArray(result?.verdicts) ? result.verdicts : [];
  const refused = Array.isArray(result?.refused) ? result.refused : [];
  notify.updated('wfrp-economy', 'money-to-burn', {
    summary: `${dryRun ? '[dry-run] ' : ''}money-to-burn: ${verdicts.length} actor(s) processed, ${refused.length} refused`,
  });
  return {
    success: true,
    data: { action: 'money-to-burn', dryRun, groupId: input.groupId ?? null, verdicts, refused },
  };
}

// ── banking-and-income (Phase 5, wfrp_economy_system) ───────────────────────────
//
// All six DELEGATE to the fork's own headless banking-engine.js (engine-contract comment at the top of
// this file). The engine owns arithmetic, endeavourInvestments/recordedStashes persistence, and its own
// DP-16-equivalent checks; this handler validates actor/wallet pre-conditions up front (mirroring the
// deposit/withdraw pre-validation above — the module returns silently on shortfall, so we reject early
// with a readable message instead), confirm-gates the two roll-resolved ops (D11: they can total-loss a
// holding), and surfaces `persistedCheckFailed` as WFRP_ECONOMY_NOT_PERSISTED without re-deriving the
// engine's internal math.

type InvestInput = Extract<WfrpEconomyInputType, { action: 'invest' }>;
async function handleInvest(input: InvestInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);
  const wb = walletBalance(input.actorId, input.economyId);
  if (input.amountBp > wb) return notPersisted(`invest of ${input.amountBp} BP exceeds wallet balance ${wb} BP (actor ${input.actorId})`);

  const BankingEngine = await importBankingEngine();
  const result = await BankingEngine.investDeposit({
    actorId: input.actorId,
    rate: input.rate,
    amountBp: input.amountBp,
    economyId: input.economyId,
    bankId: input.bankId,
  });

  if (result?.insufficientFunds) {
    // G1 — defensive: the pre-check above already guards this path; kept in sync with the engine
    // contract in case that guard is ever loosened.
    return notPersisted(`invest of ${input.amountBp} BP exceeds wallet balance ${result.walletBalanceBp} BP (actor ${input.actorId})`);
  }
  if (result?.invalidContext) return targetNotFound(result.detail ?? `economy "${input.economyId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`invest for actor "${input.actorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.created('wfrp-economy', actorName(input.actorId) ?? input.actorId, {
    summary: `invested ${input.amountBp} BP @ rate ${input.rate}% (${result.investmentId})`,
  });
  return {
    success: true,
    data: {
      action: 'invest',
      investmentId: result.investmentId,
      actorId: input.actorId,
      rate: input.rate,
      principalBp: Number(result.principalBp ?? input.amountBp),
      economyId: input.economyId ?? null,
      bankId: input.bankId ?? null,
      walletBalanceBp: Number(result.walletBalanceBp ?? walletBalance(input.actorId, input.economyId)),
    },
  };
}

type ResolveInvestmentInput = Extract<WfrpEconomyInputType, { action: 'resolve-investment' }>;
async function handleResolveInvestment(input: ResolveInvestmentInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `resolve-investment "${input.investmentId}" can total-loss the investment (RAW d100Roll <= rate = bankrupt, no payout). Re-call with confirm:true.`,
    );
  }
  const BankingEngine = await importBankingEngine();
  const result = await BankingEngine.resolveInvestment({ investmentId: input.investmentId, d100Roll: input.d100Roll, economyId: input.economyId });

  if (result?.notFound) return targetNotFound(`investment "${input.investmentId}" not found or already resolved`);
  if (result?.invalidRoll) {
    // G2 — defensive: the shared Zod schema already constrains d100Roll to an integer 1-100.
    return notPersisted(`resolve-investment "${input.investmentId}" received an invalid d100Roll (${result.d100Roll})`);
  }
  // D11 (Phase 9 orphan-guard): the owner actor was deleted. This is NOT a persistence failure — the
  // engine never attempted a wallet write — so it surfaces as a distinct, non-error outcome (the caller
  // can then drive the Banking-tab "remove record" affordance) instead of the misleading NOT_PERSISTED
  // this used to fall through to.
  if (result?.ownerDeleted) {
    notify.updated('wfrp-economy', input.investmentId, {
      summary: `investment ${input.investmentId} owner actor no longer exists — cannot resolve (principal ${result.principalBp} BP + accrued ${result.accruedBp} BP on record; untrack via the Banking tab's Remove Record control)`,
    });
    return {
      success: true,
      data: {
        action: 'resolve-investment',
        investmentId: input.investmentId,
        ownerDeleted: true,
        principalBp: Number(result.principalBp ?? 0),
        accruedBp: Number(result.accruedBp ?? 0),
      },
    };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`resolve-investment "${input.investmentId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', result.actorName ?? result.actorId, {
    summary: result.bankrupt
      ? `investment ${input.investmentId} bankrupt (d100=${input.d100Roll} <= rate) — total loss`
      : `investment ${input.investmentId} paid out ${result.payoutBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'resolve-investment',
      investmentId: input.investmentId,
      actorId: result.actorId,
      bankrupt: Boolean(result.bankrupt),
      payoutBp: Number(result.payoutBp ?? 0),
      principalBp: Number(result.principalBp ?? 0),
      accruedBp: Number(result.accruedBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
    },
  };
}

type ListInvestmentsInput = Extract<WfrpEconomyInputType, { action: 'list-investments' }>;
async function handleListInvestments(input: ListInvestmentsInput): Promise<Envelope<unknown>> {
  const BankingEngine = await importBankingEngine();
  const raw = await BankingEngine.listInvestments({ actorId: input.actorId, activeOnly: input.activeOnly, economyId: input.economyId });
  const list = (Array.isArray(raw) ? raw : []).map((i: any) => ({
    investmentId: i?.investmentId,
    actorId: i?.actorId,
    actorName: i?.actorName ?? actorName(i?.actorId),
    rate: Number(i?.rate ?? 0),
    principalBp: Number(i?.principalBp ?? 0),
    accruedBp: Number(i?.accruedBp ?? 0),
    economyId: i?.economyId ?? null,
    bankId: i?.bankId ?? null,
    active: Boolean(i?.active),
    lastCycleAt: i?.lastCycleAt ?? null, // Phase 5b, D9 — display-only ISO stamp, never a gate.
  }));
  return { success: true, data: { action: 'list-investments', count: list.length, investments: list } };
}

type StashDepositInput = Extract<WfrpEconomyInputType, { action: 'stash-deposit' }>;
async function handleStashDeposit(input: StashDepositInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);
  const wb = walletBalance(input.actorId, undefined);
  if (input.amountBp > wb) return notPersisted(`stash-deposit of ${input.amountBp} BP exceeds wallet balance ${wb} BP (actor ${input.actorId})`);

  const BankingEngine = await importBankingEngine();
  const result = await BankingEngine.stashDeposit({ actorId: input.actorId, amountBp: input.amountBp, economyId: input.economyId });

  if (result?.insufficientFunds) {
    // G1 — defensive: the pre-check above already guards this path.
    return notPersisted(`stash-deposit of ${input.amountBp} BP exceeds wallet balance ${result.walletBalanceBp} BP (actor ${input.actorId})`);
  }
  if (result?.invalidContext) return targetNotFound(result.detail ?? `economy "${input.economyId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`stash-deposit for actor "${input.actorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', actorName(input.actorId) ?? input.actorId, {
    summary: `stashed ${input.amountBp} BP (total ${result.stashBalanceBp} BP)`,
  });
  return {
    success: true,
    data: {
      action: 'stash-deposit',
      actorId: input.actorId,
      amountBp: input.amountBp,
      stashBalanceBp: Number(result.stashBalanceBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? walletBalance(input.actorId, undefined)),
    },
  };
}

type StashWithdrawInput = Extract<WfrpEconomyInputType, { action: 'stash-withdraw' }>;
async function handleStashWithdraw(input: StashWithdrawInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `stash-withdraw for actor "${input.actorId}" is WHOLE-STASH (no partial) and can total-loss on a bad roll (RAW d100Roll <= 10). Re-call with confirm:true.`,
    );
  }
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const BankingEngine = await importBankingEngine();
  const result = await BankingEngine.stashWithdraw({ actorId: input.actorId, d100Roll: input.d100Roll, economyId: input.economyId });

  if (result?.notFound) return targetNotFound(`actor "${input.actorId}" has no recorded stash`);
  if (result?.invalidRoll) {
    // G2 — defensive: the shared Zod schema already constrains d100Roll to an integer 1-100.
    return notPersisted(`stash-withdraw for actor "${input.actorId}" received an invalid d100Roll (${result.d100Roll})`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`stash-withdraw for actor "${input.actorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', actorName(input.actorId) ?? input.actorId, {
    summary: result.lost ? `stash LOST (d100=${input.d100Roll} <= 10)` : `withdrew stash ${result.amountBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'stash-withdraw',
      actorId: input.actorId,
      lost: Boolean(result.lost),
      amountBp: Number(result.amountBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
    },
  };
}

type AccrueInterestInput = Extract<WfrpEconomyInputType, { action: 'accrue-interest' }>;
async function handleAccrueInterest(input: AccrueInterestInput): Promise<Envelope<unknown>> {
  const BankingEngine = await importBankingEngine();
  const dryRun = input.dryRun === true;
  const result = await BankingEngine.accrueInterest({ economyId: input.economyId, dryRun });

  const investmentVerdicts = Array.isArray(result?.investmentVerdicts) ? result.investmentVerdicts : [];
  const accountVerdicts = Array.isArray(result?.accountVerdicts) ? result.accountVerdicts : [];
  const loanReminders = Array.isArray(result?.loanReminders) ? result.loanReminders : [];

  if (!dryRun) {
    const failure = firstPersistFailure(investmentVerdicts) ?? firstPersistFailure(accountVerdicts);
    if (failure) return notPersisted(`accrue-interest verdict for actor "${failure.actorId}" failed persistence check: ${failure.detail}`);
  }

  notify.updated('wfrp-economy', 'interest', {
    summary: `${dryRun ? '[dry-run] ' : ''}accrue-interest: cycleApplied=${result?.cycleApplied === true}, ${investmentVerdicts.length} investment(s), ${accountVerdicts.length} account(s), ${loanReminders.length} loan reminder(s)`,
  });
  return {
    success: true,
    data: {
      action: 'accrue-interest',
      dryRun,
      cycleApplied: result?.cycleApplied === true,
      lastCycleAt: result?.lastCycleAt ?? null,
      investmentVerdicts,
      accountVerdicts,
      loanReminders,
    },
  };
}

// D7 revisit (Phase 9): the fork's own headless composer for the module-UI-only "Run Economic Cycle"
// button. Delegates to the SAME BankingEngine.runEconomicCycle the button calls (identical engine path —
// kills the double-pay hazard by construction rather than merely documenting it). Supersedes
// accrue-interest for full-cycle use (accrue-interest still covers duties a-c standalone); TRAP: running
// BOTH this action and the module's own button for the same GM-declared cycle double-pays every duty —
// pick exactly one trigger per world per cycle (D6 in the Phase 9 plan).
type RunEconomicCycleInput = Extract<WfrpEconomyInputType, { action: 'run-economic-cycle' }>;
async function handleRunEconomicCycle(input: RunEconomicCycleInput): Promise<Envelope<unknown>> {
  const dryRun = input.dryRun === true;
  if (!dryRun && input.confirm !== true) {
    return confirmRequired(
      `run-economic-cycle applies one abstract GM-declared cycle to economy "${input.economyId}" — investment/account interest, loan reminders, rental income, and the full venture pass (queued-transfer resolution, distributions, standing decay, delay-tick, events). No worldTime gate — a repeat call pays every duty again. Re-call with confirm:true, or dryRun:true to preview investment/account/loan/rental verdicts first (the venture pass never previews on dryRun).`,
    );
  }
  if (!findEconomy(input.economyId)) return targetNotFound(`economy "${input.economyId}" not found`);

  const BankingEngine = await importBankingEngine();
  const result = await BankingEngine.runEconomicCycle({
    economyId: input.economyId,
    dryRun,
    rolls: input.cycleRolls,
  });

  const investmentVerdicts = Array.isArray(result?.investmentVerdicts) ? result.investmentVerdicts : [];
  const accountVerdicts = Array.isArray(result?.accountVerdicts) ? result.accountVerdicts : [];
  const loanReminders = Array.isArray(result?.loanReminders) ? result.loanReminders : [];
  const rentalVerdicts = Array.isArray(result?.rentalVerdicts) ? result.rentalVerdicts : [];
  const ventureVerdicts = Array.isArray(result?.ventureVerdicts) ? result.ventureVerdicts : [];

  if (!dryRun) {
    const failure =
      firstPersistFailure(investmentVerdicts) ??
      firstPersistFailure(accountVerdicts) ??
      firstPersistFailure(rentalVerdicts) ??
      firstVentureVerdictFailure(ventureVerdicts);
    if (failure) {
      const who = 'actorId' in failure ? `actor "${failure.actorId}"` : `venture "${failure.ventureId}"`;
      return notPersisted(`run-economic-cycle verdict for ${who} failed persistence check: ${failure.detail}`);
    }
  }

  notify.updated('wfrp-economy', input.economyId, {
    summary: `${dryRun ? '[dry-run] ' : ''}run-economic-cycle "${input.economyId}": ${investmentVerdicts.length} investment(s), ${accountVerdicts.length} account(s), ${loanReminders.length} loan reminder(s), ${rentalVerdicts.length} rental verdict(s), ${ventureVerdicts.length} venture-pass event(s)`,
  });
  return {
    success: true,
    data: {
      action: 'run-economic-cycle',
      economyId: input.economyId,
      dryRun,
      lastCycleAt: result?.lastCycleAt ?? null,
      investmentVerdicts,
      accountVerdicts,
      loanReminders,
      rentalVerdicts,
      ventureVerdicts,
    },
  };
}

// ── legitimate-business-enterprises (Phase 6, wfrp_economy_system) ─────────────
//
// list-enterprises(default)/get-enterprise are PURE READS over the `enterprises` setting store (see the
// engine-contract comment atop this file — no listInstances/getEnterprise engine export exists). The other
// 7 actions DELEGATE to the fork's own headless enterprise-engine.js.

// Phase 7c (D2/D3): weighted owners[], falling back to the legacy scalar for pre-migration instances
// (main.js's ready-hook migration backfills owners[] on every instance, but this stays defensive).
// Phase 7d: an owner slot may be venture-held (o.ventureId set, no actorId) — D2/task 1.7 lift.
function mapOwners(inst: any): Array<{ actorId: string | null; ventureId: string | null; sharePct: number; actorName: string | null }> {
  const owners = Array.isArray(inst?.owners) && inst.owners.length ? inst.owners : (inst?.ownerActorId ? [{ actorId: inst.ownerActorId, sharePct: 100 }] : []);
  return owners.map((o: any) => ({ actorId: o.actorId ?? null, ventureId: o.ventureId ?? null, sharePct: Number(o.sharePct ?? 0), actorName: o.actorId ? actorName(o.actorId) : null }));
}

type ListEnterprisesInput = Extract<WfrpEconomyInputType, { action: 'list-enterprises' }>;
async function handleListEnterprises(input: ListEnterprisesInput): Promise<Envelope<unknown>> {
  const store = readEnterprises();
  const enterprises = Object.values(store.instances ?? {}).filter((i: any) => i?.economyId === input.economyId).map((i: any) => ({
    instanceId: i?.id,
    name: i?.name,
    profileId: i?.profileId ?? null,
    backing: i?.backing,
    actorUuid: i?.actorUuid ?? null,
    ownerActorId: i?.ownerActorId ?? null,
    ownerActorName: actorName(i?.ownerActorId),
    owners: mapOwners(i),
    level: Number(i?.level ?? 0),
    upkeep: Number(i?.upkeep ?? 0),
    debtPrincipalBp: Number(i?.debt?.principal ?? 0),
    escalationTier: Number(i?.debt?.escalationTier ?? 0),
  }));

  let actors: Array<{ actorId: string; actorUuid: string; name: string }> = [];
  if (input.unconnectedActors) {
    const EnterpriseEngine = await importEnterpriseEngine();
    const raw = await EnterpriseEngine.discoverEnterpriseActors();
    actors = (Array.isArray(raw) ? raw : []).map((a: any) => ({ actorId: a?.actorId, actorUuid: a?.actorUuid, name: a?.name }));
  }

  return {
    success: true,
    data: {
      action: 'list-enterprises',
      unconnectedActors: input.unconnectedActors === true,
      count: enterprises.length,
      enterprises,
      actors,
    },
  };
}

type GetEnterpriseInput = Extract<WfrpEconomyInputType, { action: 'get-enterprise' }>;
function handleGetEnterprise(input: GetEnterpriseInput): Envelope<unknown> {
  const store = readEnterprises();
  const inst = store.instances?.[input.enterpriseId];
  if (!inst) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  return {
    success: true,
    data: {
      action: 'get-enterprise',
      instanceId: inst.id,
      name: inst.name,
      profileId: inst.profileId ?? null,
      backing: inst.backing,
      actorUuid: inst.actorUuid ?? null,
      ownerActorId: inst.ownerActorId ?? null,
      ownerActorName: actorName(inst.ownerActorId),
      owners: mapOwners(inst),
      level: Number(inst.level ?? 0),
      upkeep: Number(inst.upkeep ?? 0),
      incomeModifiers: inst.incomeModifiers ?? [],
      eventTable: inst.eventTable ?? { uuid: null, overrides: [] },
      debt: {
        principalBp: Number(inst.debt?.principal ?? 0),
        escalationTier: Number(inst.debt?.escalationTier ?? 0),
        creditor: { name: inst.debt?.creditor?.name ?? '', notes: inst.debt?.creditor?.notes ?? '' },
      },
      createdAt: inst.createdAt ?? null,
    },
  };
}

type CreateEnterpriseInput = Extract<WfrpEconomyInputType, { action: 'create-enterprise' }>;
async function handleCreateEnterprise(input: CreateEnterpriseInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `create-enterprise debits the owner actor's wallet for the start-up cost (self-funded portion after financedPortionBp) and, for backing:"create", embeds a NEW wfrp4e-archives3 enterprise actor. Re-call with confirm:true.`,
    );
  }
  if (!input.presetKey && !input.profile) {
    return targetNotFound('create-enterprise requires either presetKey or profile');
  }
  if (input.backing === 'link' && !input.actorId) {
    return targetNotFound('create-enterprise backing:"link" requires actorId');
  }
  if (!getGame()?.actors?.get?.(input.ownerActorId)) return targetNotFound(`actor "${input.ownerActorId}" not found`);
  if (input.backing === 'create') {
    // Fail-soft BEFORE calling the engine: backing:'create' embeds a wfrp4e-archives3.enterprise actor.
    const guard = requireModuleActive('wfrp4e-archives3');
    if (guard) return guard;
  }

  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.createEnterprise({
    presetKey: input.presetKey,
    profile: input.profile,
    backing: input.backing,
    ownerActorId: input.ownerActorId,
    actorId: input.actorId,
    financedPortion: input.financedPortionBp,
    creditor: input.creditor,
    economyId: input.economyId,
  });

  if (result?.profileNotFound) {
    return targetNotFound(`enterprise profile not found (presetKey="${input.presetKey ?? 'null'}")${result?.detail ? `: ${result.detail}` : ''}`);
  }
  if (result?.moduleInactive) {
    // Defensive: the pre-guard above already covers backing:'create' — only reachable on a race where
    // wfrp4e-archives3 was deactivated between the guard check and this call.
    return requireModuleActive('wfrp4e-archives3') ?? notPersisted('wfrp4e-archives3 became inactive during create-enterprise');
  }
  if (result?.invalidFinancing) {
    const bounds = Number.isSafeInteger(result.minimumSelfFundedBp) && Number.isSafeInteger(result.maximumFinancedBp)
      ? `owner must self-fund at least ${result.minimumSelfFundedBp} BP and Creditor financing cannot exceed ${result.maximumFinancedBp} BP`
      : 'cost, financedPortionBp, and minimum funding percentage must form valid non-negative whole-BP financing';
    return notPersisted(`create-enterprise financing is invalid: ${bounds}`);
  }
  if (result?.insufficientFunds) {
    return notPersisted(`create-enterprise start-up cost exceeds wallet balance ${result.walletBalanceBp} BP (required ${result.requiredBp} BP)`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`create-enterprise for owner "${input.ownerActorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.created('wfrp-economy', actorName(input.ownerActorId) ?? input.ownerActorId, {
    summary: `enterprise ${result.instanceId} created (${input.backing}) — debt ${result.debtPrincipalBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'create-enterprise',
      instanceId: result.instanceId ?? null,
      actorUuid: result.actorUuid ?? null,
      backing: input.backing,
      debtPrincipalBp: Number(result.debtPrincipalBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
    },
  };
}

type ConnectEnterpriseActorInput = Extract<WfrpEconomyInputType, { action: 'connect-enterprise-actor' }>;
async function handleConnectEnterpriseActor(input: ConnectEnterpriseActorInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.connectActor({ actorId: input.actorId, ownerActorId: input.ownerActorId, economyId: input.economyId });

  if (result?.notFound) return targetNotFound(`actor "${input.actorId}" is not a wfrp4e-archives3 enterprise actor`);
  if (result?.alreadyConnected) {
    const store = readEnterprises();
    const existingUuid = store.instances?.[result.instanceId]?.actorUuid ?? null;
    return {
      success: true,
      data: { action: 'connect-enterprise-actor', instanceId: result.instanceId, actorUuid: existingUuid, alreadyConnected: true },
    };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`connect-enterprise-actor for actor "${input.actorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.created('wfrp-economy', actorName(input.actorId) ?? input.actorId, { summary: `enterprise ${result.instanceId} connected` });
  return {
    success: true,
    data: { action: 'connect-enterprise-actor', instanceId: result.instanceId, actorUuid: result.actorUuid ?? null, alreadyConnected: false },
  };
}

type EnterpriseIncomeInput = Extract<WfrpEconomyInputType, { action: 'enterprise-income' }>;
async function handleEnterpriseIncome(input: EnterpriseIncomeInput): Promise<Envelope<unknown>> {
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.income(input.enterpriseId, { rolledTotal: input.rolledTotal, outcome: input.outcome });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.invalidRoll) {
    // Defensive: the shared Zod schema already constrains rolledTotal/outcome.
    return notPersisted(`enterprise-income for "${input.enterpriseId}" received an invalid roll (rolledTotal=${result.rolledTotal}, outcome=${result.outcome})`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`enterprise-income for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `income ${input.outcome} (rolled ${input.rolledTotal}) — paid ${result.payoutBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'enterprise-income',
      enterpriseId: input.enterpriseId,
      payoutBp: Number(result.payoutBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
    },
  };
}

type EnterpriseEventInput = Extract<WfrpEconomyInputType, { action: 'enterprise-event' }>;
async function handleEnterpriseEvent(input: EnterpriseEventInput): Promise<Envelope<unknown>> {
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.drawEvent(input.enterpriseId, { d100Roll: input.d100Roll });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.invalidRoll) {
    // Defensive: the shared Zod schema already constrains d100Roll to an integer 1-100.
    return notPersisted(`enterprise-event for "${input.enterpriseId}" received an invalid d100Roll (${result.d100Roll})`);
  }
  // drawEvent NEVER writes the enterprises store (pure table lookup; it only appends a zero-amount
  // ledger row + chat/Chronicle post) — the ONE enterprise duty with no persistedCheckFailed
  // self-verify branch (see the engine-contract comment atop this file). Do NOT check for it here.
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, { summary: `event drawn (d100=${input.d100Roll})` });
  return {
    success: true,
    data: {
      action: 'enterprise-event',
      enterpriseId: input.enterpriseId,
      text: String(result?.text ?? ''),
      matchedOverride: Boolean(result?.matchedOverride),
    },
  };
}

type EnterprisePayInterestInput = Extract<WfrpEconomyInputType, { action: 'enterprise-pay-interest' }>;
async function handleEnterprisePayInterest(input: EnterprisePayInterestInput): Promise<Envelope<unknown>> {
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.payInterest(input.enterpriseId, { declineToPay: input.declineToPay });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.insufficientFunds) {
    return notPersisted(`enterprise-pay-interest for "${input.enterpriseId}" exceeds wallet balance ${result.walletBalanceBp} BP (required ${result.requiredBp} BP)`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`enterprise-pay-interest for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: result.paid ? `interest paid — wallet ${result.walletBalanceBp} BP` : `interest DECLINED — Creditor escalation now tier ${result.escalationTier}`,
  });
  return {
    success: true,
    data: {
      action: 'enterprise-pay-interest',
      enterpriseId: input.enterpriseId,
      paid: Boolean(result.paid),
      escalationTier: result.escalationTier ?? null,
      walletBalanceBp: result.walletBalanceBp ?? null,
    },
  };
}

type EnterpriseRepayDebtInput = Extract<WfrpEconomyInputType, { action: 'enterprise-repay-debt' }>;
async function handleEnterpriseRepayDebt(input: EnterpriseRepayDebtInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `enterprise-repay-debt "${input.enterpriseId}" debits the owner actor's wallet ${input.amountBp} BP against the Creditor principal. Re-call with confirm:true.`,
    );
  }
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.repayDebt(input.enterpriseId, { amountBp: input.amountBp });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.insufficientFunds) {
    return notPersisted(`enterprise-repay-debt of ${input.amountBp} BP exceeds wallet balance ${result.walletBalanceBp} BP (required ${result.requiredBp} BP)`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`enterprise-repay-debt for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  const appliedBp = Number(result?.appliedBp);
  const unappliedBp = Number(result?.unappliedBp);
  if (!Number.isSafeInteger(appliedBp) || appliedBp < 0
    || !Number.isSafeInteger(unappliedBp) || unappliedBp < 0
    || appliedBp + unappliedBp !== input.amountBp) {
    return notPersisted(`enterprise-repay-debt for "${input.enterpriseId}" returned an invalid applied/unapplied result contract`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `debt repaid ${appliedBp} BP${unappliedBp > 0 ? ` (${unappliedBp} BP unapplied)` : ''} — principal now ${result.principalBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'enterprise-repay-debt',
      enterpriseId: input.enterpriseId,
      principalBp: Number(result.principalBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
      appliedBp,
      unappliedBp,
    },
  };
}

type EnterpriseUpgradeInput = Extract<WfrpEconomyInputType, { action: 'enterprise-upgrade' }>;
async function handleEnterpriseUpgrade(input: EnterpriseUpgradeInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `enterprise-upgrade "${input.enterpriseId}" to level ${input.level} debits the owner actor's wallet for the self-funded portion of the upgrade cost. Re-call with confirm:true.`,
    );
  }
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.upgrade(input.enterpriseId, { level: input.level, financedPortion: input.financedPortionBp, creditor: input.creditor });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.upgradeBlocked) {
    // RAW refusal, zero writes: an enterprise cannot Expand while it carries active Creditor debt.
    return notPersisted(`enterprise "${input.enterpriseId}" cannot upgrade while in debt (RAW: Expand is blocked with an active Creditor principal)`);
  }
  if (result?.invalidLevel) {
    const requiredLevel = Number.isSafeInteger(result.requiredLevel) ? result.requiredLevel : 'unknown';
    return notPersisted(`enterprise "${input.enterpriseId}" cannot upgrade to level ${input.level}; the required next sequential level is ${requiredLevel}`);
  }
  if (result?.invalidFinancing) {
    const bounds = Number.isSafeInteger(result.minimumSelfFundedBp) && Number.isSafeInteger(result.maximumFinancedBp)
      ? `owner must self-fund at least ${result.minimumSelfFundedBp} BP and Creditor financing cannot exceed ${result.maximumFinancedBp} BP`
      : 'cost, financedPortionBp, and minimum funding percentage must form valid non-negative whole-BP financing';
    return notPersisted(`enterprise-upgrade financing is invalid: ${bounds}`);
  }
  if (result?.insufficientFunds) {
    return notPersisted(`enterprise-upgrade for "${input.enterpriseId}" exceeds wallet balance ${result.walletBalanceBp} BP (required ${result.requiredBp} BP)`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`enterprise-upgrade for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `upgraded to level ${result.level} — upkeep now ${result.newUpkeep} BP, debt ${result.debtPrincipalBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'enterprise-upgrade',
      enterpriseId: input.enterpriseId,
      level: Number(result.level ?? input.level),
      newUpkeep: Number(result.newUpkeep ?? 0),
      debtPrincipalBp: Number(result.debtPrincipalBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
    },
  };
}

type DeleteEnterpriseInput = Extract<WfrpEconomyInputType, { action: 'delete-enterprise' }>;
async function handleDeleteEnterprise(input: DeleteEnterpriseInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `delete-enterprise removes "${input.enterpriseId}" from the enterprises store (the backing Actor is NOT deleted and no coin moves). Re-call with confirm:true.`,
    );
  }
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.deleteEnterprise(input.enterpriseId);

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`delete-enterprise for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.deleted('wfrp-economy', String(result.name ?? input.enterpriseId), {
    summary: `enterprise ${input.enterpriseId} untracked (actor untouched, no coin moved)`,
  });
  return {
    success: true,
    data: {
      action: 'delete-enterprise',
      enterpriseId: input.enterpriseId,
      deleted: true,
      name: String(result.name ?? ''),
    },
  };
}

// ── enterprise-ownership-and-debt (Phase 7c, R7c.1/R7c.2) ───────────────────────
//
// All three DELEGATE to enterprise-engine.js's setOwners/addDebt/forgiveDebt exports (Phase 1 of the
// same plan). DIALOG-PATH: the engine is contractually dialog-free (same file-header contract as every
// other enterprise-engine.js export) — this handler never awaits a path that could open a Foundry dialog.

type SetEnterpriseOwnersInput = Extract<WfrpEconomyInputType, { action: 'set-enterprise-owners' }>;
async function handleSetEnterpriseOwners(input: SetEnterpriseOwnersInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `set-enterprise-owners replaces the owners list for "${input.enterpriseId}" (${input.ownerShares.length} owner(s)) and re-derives the ownerActorId alias. Re-call with confirm:true.`,
    );
  }
  // Phase 7d: ownerShareInput is a union — {actorId,sharePct} | {ventureId,sharePct}. Only actor-bearing
  // slots go through the actor existence pre-check; venture slots are validated engine-side (setOwners
  // now calls getVenture() itself, D2/task 1.7 lift).
  const actorIds = input.ownerShares.map((o: any) => o.actorId).filter((id: unknown): id is string => typeof id === 'string');
  const missing = missingActor(actorIds);
  if (missing) return targetNotFound(`actor "${missing}" not found`);

  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.setOwners(input.enterpriseId, { ownerShares: input.ownerShares });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.ventureNotFound) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_NOT_FOUND}: ownerShares references venture "${result.ventureId}" which does not exist` };
  }
  if (result?.invalidShares) {
    return { success: false, error: `WFRP_ECONOMY_INVALID_SHARES: owner sharePct must sum to exactly 100 (got ${result.shareSum})` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`set-enterprise-owners for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  // Phase 7d: a venture-slot owner (o.ventureId set, o.actorId absent) has no actor to resolve — surface
  // it as actorId:null, actorName:null so callers can tell it apart from a stale/deleted actor.
  const owners = (Array.isArray(result.owners) ? result.owners : []).map((o: any) => ({
    actorId: o.actorId ?? null,
    ventureId: o.ventureId ?? null,
    sharePct: Number(o.sharePct ?? 0),
    actorName: o.actorId ? actorName(o.actorId) : null,
  }));
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `owners set: ${owners.map((o: any) => o.ventureId ? `venture ${o.ventureId} (${o.sharePct}%)` : `${o.actorName ?? o.actorId} (${o.sharePct}%)`).join(', ')}`,
  });
  return {
    success: true,
    data: {
      action: 'set-enterprise-owners',
      enterpriseId: input.enterpriseId,
      owners,
      ownerActorId: String(result.ownerActorId ?? ''),
    },
  };
}

type AddEnterpriseDebtInput = Extract<WfrpEconomyInputType, { action: 'add-enterprise-debt' }>;
async function handleAddEnterpriseDebt(input: AddEnterpriseDebtInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `add-enterprise-debt credits ${input.amountBp} BP to a recipient owner of "${input.enterpriseId}" and adds the same amount to debt.principal. Re-call with confirm:true.`,
    );
  }
  if (input.recipientActorId && !getGame()?.actors?.get?.(input.recipientActorId)) {
    return targetNotFound(`actor "${input.recipientActorId}" not found`);
  }

  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.addDebt(input.enterpriseId, {
    amountBp: input.amountBp,
    creditor: input.creditor,
    recipientActorId: input.recipientActorId,
  });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`add-enterprise-debt for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `Creditor advanced ${input.amountBp} BP — principal now ${result.principalBp} BP`,
  });
  const recipientActorName = result.recipientActorId
    ? (getGame()?.actors?.get?.(String(result.recipientActorId))?.name ?? null)
    : null;
  return {
    success: true,
    data: {
      action: 'add-enterprise-debt',
      enterpriseId: input.enterpriseId,
      amountBp: Number(input.amountBp),
      principalBp: Number(result.principalBp ?? 0),
      recipientActorId: String(result.recipientActorId ?? ''),
      recipientActorName,
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
    },
  };
}

type ForgiveEnterpriseDebtInput = Extract<WfrpEconomyInputType, { action: 'forgive-enterprise-debt' }>;
async function handleForgiveEnterpriseDebt(input: ForgiveEnterpriseDebtInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(
      `forgive-enterprise-debt reduces "${input.enterpriseId}"'s Creditor principal${input.amountBp ? ` by ${input.amountBp} BP` : ' to ZERO (the entire remaining principal)'}. Zero wallet writes. Re-call with confirm:true.`,
    );
  }
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.forgiveDebt(input.enterpriseId, { amountBp: input.amountBp });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`forgive-enterprise-debt for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `Creditor debt forgiven — principal now ${result.principalBp} BP`,
  });
  return {
    success: true,
    data: {
      action: 'forgive-enterprise-debt',
      enterpriseId: input.enterpriseId,
      principalBp: Number(result.principalBp ?? 0),
    },
  };
}

// Phase 7e2 (R6.1/R6.5/R7c.3): manager-primary income-source write. DELEGATES to enterprise-engine.js's
// setIncomeSources export (mutex + verify + echo-tagged actor push — the sync contract that keeps the
// Economy Manager instance and the backing archives3 actor from drifting). Full-list replace, not a
// patch; no confirm gate — unlike owners/debt this never moves coin and only replaces a metadata list.
type SetEnterpriseIncomeSourcesInput = Extract<WfrpEconomyInputType, { action: 'set-enterprise-income-sources' }>;
async function handleSetEnterpriseIncomeSources(input: SetEnterpriseIncomeSourcesInput): Promise<Envelope<unknown>> {
  const EnterpriseEngine = await importEnterpriseEngine();
  const result = await EnterpriseEngine.setIncomeSources(input.enterpriseId, { incomeModifiers: input.incomeModifiers });

  if (result?.notFound) return targetNotFound(`enterprise "${input.enterpriseId}" not found`);
  if (result?.invalidSources) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_INVALID_INCOME_SOURCES}: ${result.reason}` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`set-enterprise-income-sources for "${input.enterpriseId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `enterprise ${input.enterpriseId}`, {
    summary: `income sources set (${(result.incomeModifiers ?? []).length} source(s))${result.actorSynced ? ', synced to backing actor' : ''}`,
  });
  return {
    success: true,
    data: {
      action: 'set-enterprise-income-sources',
      enterpriseId: input.enterpriseId,
      incomeModifiers: result.incomeModifiers ?? [],
      actorSynced: Boolean(result.actorSynced),
    },
  };
}

// ── levy-groups (Phase 7c, R7c.4/R7c.5) ──────────────────────────────────────────
//
// list-levies is a PURE READ over the `levies` world setting (mirrors list-enterprises' pure-read
// precedent — no engine delegation for reads). save-levy-group/delete-levy-group write the standalone
// `levyGroups` world setting DIRECTLY (register.js pattern — no engine export needed for simple CRUD
// over a flat array setting; mirrors how levyExcludedActorIds is written today).

type ListLeviesInput = Extract<WfrpEconomyInputType, { action: 'list-levies' }>;
function handleListLevies(input: ListLeviesInput): Envelope<unknown> {
  const levies = readLevies().filter((l: any) => l?.economyId === input.economyId).map((l: any) => ({
    levyId: l?.id,
    name: l?.name,
    type: l?.builtin ? 'builtin' : (l?.type ?? 'custom'),
    cadence: l?.cadence,
    active: l?.active === true,
    amount: l?.amount ?? {},
    target: l?.target ?? null,
    groupId: typeof l?.target === 'string' && l.target.startsWith('group:') ? l.target.slice('group:'.length) : null,
    builtin: l?.builtin === true,
    state: l?.state ?? {},
  }));
  return { success: true, data: { action: 'list-levies', count: levies.length, levies } };
}

type SaveLevyGroupInput = Extract<WfrpEconomyInputType, { action: 'save-levy-group' }>;
async function handleSaveLevyGroup(input: SaveLevyGroupInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`save-levy-group ${input.groupId ? `updates group "${input.groupId}"` : 'creates a new group'} ("${input.name}", ${input.actorIds.length} member(s)). Re-call with confirm:true.`);
  }
  const missing = missingActor(input.actorIds);
  if (missing) return targetNotFound(`actor "${missing}" not found`);

  const groups = readLevyGroups();
  const groupId = input.groupId ?? randomId();
  const idx = groups.findIndex((g: any) => g?.id === groupId && g?.economyId === input.economyId);
  const entry = { id: groupId, economyId: input.economyId, name: input.name, actorIds: [...input.actorIds] };
  if (idx >= 0) groups[idx] = entry;
  else groups.push(entry);
  await setSetting('levyGroups', groups);

  const fresh = readLevyGroups().find((g: any) => g?.id === groupId);
  if (!fresh) return notPersisted(`levy group "${groupId}" absent from levyGroups setting after write`);

  notify.updated('wfrp-economy', `levy group "${input.name}"`, { summary: `${input.actorIds.length} member(s)` });
  return {
    success: true,
    data: { action: 'save-levy-group', groupId, name: input.name, actorIds: input.actorIds },
  };
}

type ListLevyGroupsInput = Extract<WfrpEconomyInputType, { action: 'list-levy-groups' }>;
function handleListLevyGroups(input: ListLevyGroupsInput): Envelope<unknown> {
  const groups = readLevyGroups().filter((g: any) => g?.economyId === input.economyId).map((g: any) => ({
    groupId: g?.id,
    name: g?.name,
    actorIds: Array.isArray(g?.actorIds) ? g.actorIds : [],
    memberCount: Array.isArray(g?.actorIds) ? g.actorIds.length : 0,
  }));
  return { success: true, data: { action: 'list-levy-groups', count: groups.length, groups } };
}

type DeleteLevyGroupInput = Extract<WfrpEconomyInputType, { action: 'delete-levy-group' }>;
async function handleDeleteLevyGroup(input: DeleteLevyGroupInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`delete-levy-group removes group "${input.groupId}" (levies still targeting it resolve to an empty roster afterward — no cascade rewrite). Re-call with confirm:true.`);
  }
  const groups = readLevyGroups();
  const existing = groups.find((g: any) => g?.id === input.groupId && g?.economyId === input.economyId);
  if (!existing) return targetNotFound(`levy group "${input.groupId}" not found`);

  await setSetting('levyGroups', groups.filter((g: any) => g?.id !== input.groupId || g?.economyId !== input.economyId));
  const stillThere = readLevyGroups().some((g: any) => g?.id === input.groupId && g?.economyId === input.economyId);
  if (stillThere) return notPersisted(`levy group "${input.groupId}" still present in levyGroups setting after delete`);

  notify.deleted('wfrp-economy', String(existing.name ?? input.groupId), { summary: `levy group ${input.groupId} removed` });
  return { success: true, data: { action: 'delete-levy-group', groupId: input.groupId, deleted: true } };
}

// ── venture-ledger (Phase 7d, wfrp_economy_system, R7d.1-R7d.8) ─────────────────

function ventureHolderEntry(h: any): { actorId: string | null; externalName: string | null; actorName: string | null; parts: number } {
  const actorId = h?.actorId ?? null;
  const externalName = actorId ? null : (h?.externalName ?? null);
  return { actorId, externalName, actorName: actorId ? actorName(actorId) : externalName, parts: Number(h?.parts ?? 0) };
}

function ventureQueuedTransferEntry(o: any): {
  offerId: string; sellerActorId: string | null; sellerExternalName: string | null; sellerName: string | null; parts: number; askingPriceBp: number;
} {
  const sellerActorId = o?.sellerActorId ?? null;
  const sellerExternalName = sellerActorId ? null : (o?.sellerExternalName ?? null);
  return {
    offerId: o?.offerId,
    sellerActorId,
    sellerExternalName,
    sellerName: sellerActorId ? actorName(sellerActorId) : sellerExternalName,
    parts: Number(o?.parts ?? 0),
    askingPriceBp: Number(o?.askingPriceBp ?? 0),
  };
}

/**
 * BUG-822 — the D8 Registry/institution array. It is stored on the deed and DRIVES list-ventures
 * bankId filtering, and the mcp-server result types have always declared it, but no venture response
 * ever emitted it: callers could not see which Registry handles a deed without settings access. Shape
 * mirrors `WfrpEconomyVentureHandledByEntry` exactly (nulls, not undefined, so the field is always
 * present in JSON rather than silently dropped by serialisation).
 */
function ventureHandledByEntry(h: any) {
  return {
    role: String(h?.role ?? ''),
    name: h?.name ?? null,
    bankId: h?.bankId ?? null,
    economyId: h?.economyId ?? null,
  };
}

function ventureSummaryEntry(inst: any) {
  return {
    ventureId: inst?.id,
    name: inst?.name,
    type: inst?.type,
    status: inst?.status,
    standing: inst?.standing,
    partsTotal: Number(inst?.parts?.total ?? 0),
    partsSubscribed: Number(inst?.parts?.subscribed ?? 0),
    priceBp: Number(inst?.parts?.priceBp ?? 0),
    escrowBp: Number(inst?.escrowBp ?? 0),
    // The capital line (D1/D2) — escrowBp alone is ambiguous, because it holds invested principal
    // PLUS accumulated profit. Without capitalBp a reader cannot tell a thriving deed from a sterile
    // one, which is the exact misread the sheet's three-figure breakdown exists to prevent; the read
    // surface has to make the same distinction the UI does.
    capitalBp: Number(inst?.capitalBp ?? 0),
    // M7 (BUG-841) — F09 shipped these two onto get-venture but not onto this summary, so a caller
    // surveying "which deeds are ready to launch / going quiet" had to call get-venture per instance.
    quietCycles: Number(inst?.quietCycles ?? 0),
    readyToLaunch: inst?.readyToLaunch === true,
    badges: Array.isArray(inst?.badges) ? inst.badges : [],
    // BUG-822 — this is the field that drives this very list's bankId filtering; not projecting it
    // meant a caller could filter by Registry but never see which Registry matched.
    handledBy: (inst?.handledBy ?? []).map(ventureHandledByEntry),
  };
}

type CreateVentureInput = Extract<WfrpEconomyInputType, { action: 'create-venture' }>;
async function handleCreateVenture(input: CreateVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`create-venture starts a new "${input.type}" deed "${input.name}" (${input.parts.total} Parts @ ${input.parts.priceBp} BP). Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.createVenture({
    name: input.name,
    type: input.type,
    parts: input.parts,
    terms: input.terms,
    handledBy: input.handledBy,
    linkedEnterpriseId: input.linkedEnterpriseId,
    exposureTags: input.exposureTags,
    economyId: input.economyId,
  });

  if (result?.invalidType) return targetNotFound(`invalid venture type "${input.type}"`);
  // C6 (BUG-841): createVenture refuses with `economyNotFound` / `economyMismatch` BEFORE any write, and
  // neither was branched — so a refused create fell through to notify.created + success:true with
  // `ventureId: undefined`. Both are caller-controllable (economyId / handledBy / linkedEnterpriseId).
  if (result?.economyNotFound) return targetNotFound(`economy "${input.economyId}" not found`);
  if (result?.economyMismatch) {
    return { success: false, error: `WFRP_ECONOMY_ECONOMY_MISMATCH: venture "${input.name}" names a handledBy entry or linkedEnterpriseId belonging to a different economy than "${input.economyId}"` };
  }
  if (result?.ventureHoldsVentureNotAllowed) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_HOLDS_VENTURE: a venture can never hold another venture (D19)` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`create-venture "${input.name}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.created('wfrp-economy', input.name, { summary: `venture ${result.instanceId} (${input.type}, ${input.parts.total} Parts)` });
  return {
    success: true,
    // BUG-822 — echo handledBy back from the PERSISTED result, not from `input`, so the caller sees
    // what was actually stored (the engine normalises/defaults entries) rather than what was sent.
    data: { action: 'create-venture', ventureId: result.instanceId, name: result.name, type: result.type, status: result.status, standing: result.standing, escrowBp: Number(result.escrowBp ?? 0), handledBy: (result.handledBy ?? []).map(ventureHandledByEntry) },
  };
}

type GetVentureInput = Extract<WfrpEconomyInputType, { action: 'get-venture' }>;
async function handleGetVenture(input: GetVentureInput): Promise<Envelope<unknown>> {
  const VentureEngine = await importVentureEngine();
  const inst = await VentureEngine.getVenture(input.ventureId);
  if (inst?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  return {
    success: true,
    data: {
      action: 'get-venture',
      ventureId: inst.id,
      name: inst.name,
      type: inst.type,
      status: inst.status,
      standing: inst.standing,
      partsTotal: Number(inst.parts?.total ?? 0),
      partsSubscribed: Number(inst.parts?.subscribed ?? 0),
      priceBp: Number(inst.parts?.priceBp ?? 0),
      escrowBp: Number(inst.escrowBp ?? 0),
      // The three instance fields the capital-line / lifecycle / conditional-decay work added. All
      // were written correctly by the engine but projected nowhere, so no MCP caller could verify a
      // capital line, tell a ready-to-launch deed from a merely funded one, or see how close a deed
      // was to a standing decay. Defensive `?? 0` / `=== true` mirrors the engine's own reads, so a
      // deed that predates the migration reads as 0/false rather than undefined.
      capitalBp: Number(inst.capitalBp ?? 0),
      quietCycles: Number(inst.quietCycles ?? 0),
      readyToLaunch: inst.readyToLaunch === true,
      holders: (inst.holders ?? []).map(ventureHolderEntry),
      queuedTransfers: (inst.queuedTransfers ?? []).map(ventureQueuedTransferEntry),
      badges: Array.isArray(inst.badges) ? inst.badges : [],
      // BUG-822 — the Phase 7e contract says handledBy echoes verbatim; it never did.
      handledBy: (inst.handledBy ?? []).map(ventureHandledByEntry),
      notices: Array.isArray(inst.notices) ? inst.notices : [],
      deedDateText: inst.deedDate?.text ?? null,
    },
  };
}

type ListVenturesInput = Extract<WfrpEconomyInputType, { action: 'list-ventures' }>;
async function handleListVentures(input: ListVenturesInput): Promise<Envelope<unknown>> {
  const VentureEngine = await importVentureEngine();
  const list: any[] = await VentureEngine.listVentures({ type: input.type, status: input.status, bankId: input.bankId, economyId: input.economyId });
  const ventures = list.map(ventureSummaryEntry);
  return { success: true, data: { action: 'list-ventures', count: ventures.length, ventures } };
}

type SubscribeVentureInput = Extract<WfrpEconomyInputType, { action: 'subscribe-venture' }>;
async function handleSubscribeVenture(input: SubscribeVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`subscribe-venture buys ${input.partsCount} Part(s) of venture "${input.ventureId}" for the subscriber. Re-call with confirm:true.`);
  }
  if (input.actorId && !getGame()?.actors?.get?.(input.actorId)) {
    return targetNotFound(`actor "${input.actorId}" not found`);
  }
  const VentureEngine = await importVentureEngine();
  // Phase 9 validate S3 fix (eval T80/T83 regression): the D8 institution-context pair MUST be forwarded —
  // the engine owns the partial-context / exact-institution / economy-mismatch gates (BUG-545
  // defense-in-depth), and dropping the fields here silently disabled all three, letting a wrong-bank or
  // one-sided-context subscribe move real coin.
  const result = await VentureEngine.subscribeVenture(input.ventureId, {
    actorId: input.actorId,
    externalName: input.externalName,
    parts: input.partsCount,
    bankId: input.bankId,
    economyId: input.economyId,
  });

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.partialContext) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_PARTIAL_CONTEXT: bankId/economyId must both be present (institution-linked) or both absent (context-free) — one-sided context refused, zero writes` };
  }
  if (result?.economyMismatch) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_REGISTRY_NOT_HANDLING: venture "${input.ventureId}" does not belong to economy "${input.economyId}" — subscription refused, zero writes` };
  }
  if (result?.registryNotHandling) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_REGISTRY_NOT_HANDLING: venture "${input.ventureId}" has no Registry handling it — subscriptions are refused` };
  }
  if (result?.ventureDisputed) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_DISPUTED}: venture "${input.ventureId}" is Disputed — new subscriptions are refused until the badge is cleared` };
  }
  if (result?.partsExceedTotal) {
    return notPersisted(`subscribe-venture ${input.partsCount} Part(s) exceeds ${result.partsAvailable} available on "${input.ventureId}"`);
  }
  if (result?.insufficientFunds) {
    return notPersisted(`subscribe-venture cost exceeds wallet balance ${result.walletBalanceBp} BP (required up to that amount)`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`subscribe-venture on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `subscribed ${input.partsCount} Part(s) — escrow now ${result.escrowBp} BP` });
  return {
    success: true,
    data: { action: 'subscribe-venture', ventureId: input.ventureId, subscribedParts: Number(result.subscribedParts ?? 0), escrowBp: Number(result.escrowBp ?? 0), walletBalanceBp: result.walletBalanceBp ?? null },
  };
}

type TransferVenturePartsInput = Extract<WfrpEconomyInputType, { action: 'transfer-venture-parts' }>;
async function handleTransferVentureParts(input: TransferVenturePartsInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`transfer-venture-parts queues an offer to sell ${input.partsCount} Part(s) of venture "${input.ventureId}" for ${input.askingPriceBp} BP — it resolves ONLY at the next economic cycle, never instantly. Re-call with confirm:true.`);
  }
  if (input.sellerActorId && !getGame()?.actors?.get?.(input.sellerActorId)) {
    return targetNotFound(`actor "${input.sellerActorId}" not found`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.queueTransfer(input.ventureId, {
    sellerActorId: input.sellerActorId,
    sellerExternalName: input.sellerExternalName,
    parts: input.partsCount,
    askingPriceBp: input.askingPriceBp,
  });

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.holderNotFound) return targetNotFound(`seller is not a holder of venture "${input.ventureId}"`);
  if (result?.partsExceedHolding) {
    return notPersisted(`transfer-venture-parts ${input.partsCount} Part(s) exceeds holding ${result.partsHeld} on "${input.ventureId}"`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`transfer-venture-parts on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `transfer offer ${result.offerId} queued — ${input.partsCount} Part(s) @ ${input.askingPriceBp} BP` });
  return { success: true, data: { action: 'transfer-venture-parts', ventureId: input.ventureId, offerId: result.offerId, queued: true as const } };
}

type SettleVentureInput = Extract<WfrpEconomyInputType, { action: 'settle-venture' }>;
async function handleSettleVenture(input: SettleVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`settle-venture settles "${input.ventureId}"${input.netBp ? ` with net proceeds ${input.netBp} BP` : ''} and auto-distributes escrow to every holder. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.settleVenture(input.ventureId, { netBp: input.netBp });

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.doesNotSettle) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_DOES_NOT_SETTLE}: "${input.ventureId}" is open-ended (Partnership/Chartered-Concern) — Wind Up first (set-venture-status to "settling"), or use distribute-venture instead` };
  }
  if (result?.escrowSeized) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_SEIZED}: venture "${input.ventureId}" escrow is Seized — Settle is refused until the badge is cleared` };
  }
  // BUG-549 residual fix (2026-07-18): the engine now preflights the holder set BEFORE any write —
  // a no-holder settlement is refused with zero escrow/status/ledger mutation (previously it credited
  // netBp + wrote a venture-settle row while the deed stayed Settling, repeatably). Same mapping shape
  // as distribute-venture's own noHolders branch.
  if (result?.noHolders) {
    return notPersisted(`venture "${input.ventureId}" has no holders — settlement refused before any write (subscribe a holder first, or park the deed via set-venture-status)`);
  }
  // B2 FIX (7d2): the engine's {settleDelayed:true} return had NO branch here — this fell through to the
  // success path below, reporting success:true/status:undefined/distributedBp:0 for a settlement that
  // never happened. Now a typed refusal naming the remaining delay.
  if (result?.settleDelayed) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_SETTLE_DELAYED}: venture "${input.ventureId}" schedule is delayed — ${result.delayCycles} economic cycle(s) remain before it can be settled` };
  }
  // Phase 9 validate S3 fix (eval T59): the post-BUG-549 isSettlementReady gate returns
  // {settlementNotReady:true, status} for a deed not yet at "settling" — the sibling guard to
  // settleDelayed above, with the same fell-through-to-false-success failure mode. Typed refusal now.
  if (result?.settlementNotReady) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_SETTLE_NOT_READY: venture "${input.ventureId}" is "${result.status}" — only a "settling" deed can settle (Wind Up first via set-venture-status, or let an Expedition reach its reckoning)` };
  }
  // BUG-544 (DP-16): settleVenture now re-reads the store and verifies its escrow/status write before
  // ledgering. Without this branch the engine's `persistedCheckFailed` verdict would fall straight through
  // to the success path below — the fix would be invisible at the MCP layer, which is the whole bug class.
  if (result?.persistedCheckFailed) {
    return notPersisted(`settle-venture for "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `settled — status ${result.status}` });
  return {
    success: true,
    data: { action: 'settle-venture', ventureId: input.ventureId, status: result.status, distributedBp: Number(result.distributed?.distributedBp ?? 0) },
  };
}

type DistributeVentureInput = Extract<WfrpEconomyInputType, { action: 'distribute-venture' }>;
async function handleDistributeVenture(input: DistributeVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`distribute-venture drains "${input.ventureId}"'s current escrow to every holder by Parts-weighted split. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.distributeVenture(input.ventureId);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.noHolders) return notPersisted(`venture "${input.ventureId}" has no holders to distribute to`);
  if (result?.escrowSeized) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_SEIZED}: venture "${input.ventureId}" escrow is Seized — Distribute is refused until the badge is cleared` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`distribute-venture on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `distributed ${result.distributedBp} BP across ${(result.splits ?? []).length} split(s)` });
  return {
    success: true,
    data: { action: 'distribute-venture', ventureId: input.ventureId, distributedBp: Number(result.distributedBp ?? 0), escrowBp: Number(result.escrowBp ?? 0), splitCount: (result.splits ?? []).length },
  };
}

type VentureEventInput = Extract<WfrpEconomyInputType, { action: 'venture-event' }>;
async function handleVentureEvent(input: VentureEventInput): Promise<Envelope<unknown>> {
  // C5 (BUG-841, CCR-4): this is a MUTATING action and was the only venture action with no confirm gate.
  // One unconfirmed draw can shift standing, move escrow (escrowModPct), force `defaulted` (forceStatus),
  // issue Parts, or subscribe an off-book patron.
  if (input.confirm !== true) {
    return confirmRequired(`venture-event draws a live event band on venture "${input.ventureId}" with natural roll ${input.d100Roll} and APPLIES its effects immediately. Depending on the band this can shift standing, move or destroy escrow, add a Disputed/Seized badge, delay settlement, issue new Parts (diluting holders), or force the deed to defaulted. It cannot be undone. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.drawVentureEvent(input.ventureId, { d100Roll: input.d100Roll });

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.invalidRoll) return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_INVALID_ROLL}: d100Roll must be an integer 1-100` };
  if (result?.noEventsForStatus) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_NO_EVENTS_FOR_STATUS: venture "${input.ventureId}" is ${result.status} — no event table applies` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`venture-event on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `event drawn — standing now ${result.standing}` });
  return {
    success: true,
    data: {
      action: 'venture-event',
      ventureId: input.ventureId,
      text: result.text,
      standing: result.standing,
      naturalRoll: Number(result.naturalRoll ?? input.d100Roll),
      modifiedRoll: Number(result.modifiedRoll ?? input.d100Roll),
      standingModifier: Number(result.standingModifier ?? 0),
      critical: result.critical ?? null,
      effectsApplied: Array.isArray(result.effectsApplied) ? result.effectsApplied : [],
    },
  };
}

type DeleteVentureInput = Extract<WfrpEconomyInputType, { action: 'delete-venture' }>;
async function handleDeleteVenture(input: DeleteVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`delete-venture permanently removes venture deed "${input.ventureId}" from the ledger. Transaction history rows are kept. If the deed still holds escrow that no remaining holder can be paid (every holder is a deleted actor and/or an external name), that coin is WRITTEN OFF — it is not paid to anyone. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.deleteVenture(input.ventureId);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.escrowNotEmpty) {
    return {
      success: false,
      error: `WFRP_ECONOMY_VENTURE_ESCROW_NOT_EMPTY: venture "${input.ventureId}" still holds ${result.escrowBp} BP and at least one holder can still be paid — distribute or settle it first. (A deed whose holders are ALL unpayable can be deleted; this one is not.)`,
    };
  }
  // C2b (BUG-841): the deed is held as an ownership slot by an enterprise. Removing a slot with a real
  // share would break that enterprise's 100% ownership split, so the engine refuses rather than silently
  // redistributing someone else's shares.
  if (result?.enterpriseSlotHeld) {
    return {
      success: false,
      error: `WFRP_ECONOMY_VENTURE_ENTERPRISE_SLOT_HELD: ${result.detail}`,
    };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`delete-venture on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }

  const writtenOffBp = Number(result?.writtenOffBp ?? 0);
  notify.deleted('wfrp-economy', String(result?.name ?? input.ventureId), {
    summary: writtenOffBp > 0
      ? `venture ${input.ventureId} removed — ${writtenOffBp} BP written off (no holder could be paid); transaction history retained`
      : `venture ${input.ventureId} removed; transaction history retained`,
  });
  return {
    success: true,
    data: {
      action: 'delete-venture',
      ventureId: input.ventureId,
      name: String(result?.name ?? ''),
      writtenOffBp,
      scrubbedEnterpriseSlots: Number(result?.scrubbedEnterpriseSlots ?? 0),
    },
  };
}

// ── BUG-841 M8 — the three GM lifecycle actions the deed sheet had but MCP did not ────────────────

type LaunchVentureInput = Extract<WfrpEconomyInputType, { action: 'launch-venture' }>;
async function handleLaunchVenture(input: LaunchVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`launch-venture moves fully-subscribed deed "${input.ventureId}" from Funded to Underway immediately. Launching by hand SKIPS the preparation event the deed would otherwise draw at the next economic cycle (D5b). Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.launchVenture(input.ventureId);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.notReady) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_NOT_READY: venture "${input.ventureId}" is ${result.status} and not marked ready to launch — a deed must be Funded AND fully subscribed to launch` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`launch-venture on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `launched — status now ${result.status}` });
  return { success: true, data: { action: 'launch-venture', ventureId: input.ventureId, status: String(result.status) } };
}

type WindUpVentureInput = Extract<WfrpEconomyInputType, { action: 'wind-up-venture' }>;
async function handleWindUpVenture(input: WindUpVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`wind-up-venture moves OPEN-ENDED deed "${input.ventureId}" from Underway to Settling, so the Reckoning event table applies and close-out-venture becomes reachable. Self-liquidating types (Expedition/Project) are refused — they close out directly from Underway. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.windUpVenture(input.ventureId);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.alreadySettles) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_ALREADY_SETTLES: venture "${input.ventureId}" is a self-liquidating type (Expedition/Project) — it does not wind up; use close-out-venture directly from Underway` };
  }
  if (result?.invalidStatusForWindUp) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_INVALID_STATUS_FOR_WIND_UP: venture "${input.ventureId}" is ${result.status} — only an Underway open-ended deed can be wound up` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`wind-up-venture on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `wound up — status now ${result.status}` });
  return { success: true, data: { action: 'wind-up-venture', ventureId: input.ventureId, status: String(result.status) } };
}

type CloseOutVentureInput = Extract<WfrpEconomyInputType, { action: 'close-out-venture' }>;
async function handleCloseOutVenture(input: CloseOutVentureInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`close-out-venture releases the WORKING CAPITAL of deed "${input.ventureId}" and distributes it to the holders — the only action that returns principal (distribute-venture pays profit above the capital line only). Reachable from Settling (any type), from Underway for a self-liquidating Expedition/Project, and from Completed when a deed still holds capital nobody was paid. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.closeOutVenture(input.ventureId, { netBp: input.netBp });

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.notCloseable) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_NOT_CLOSEABLE: venture "${input.ventureId}" is ${result.status} — an open-ended deed must be wound up to Settling first` };
  }
  if (result?.doesNotSettle) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_DOES_NOT_SETTLE: venture "${input.ventureId}" is an open-ended type outside Settling — wind it up first` };
  }
  if (result?.settlementNotReady) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_SETTLEMENT_NOT_READY: venture "${input.ventureId}" is ${result.status} and cannot settle from that state` };
  }
  if (result?.escrowSeized) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_SEIZED}: venture "${input.ventureId}" escrow is Seized — clear the badge first` };
  }
  if (result?.settleDelayed) {
    return { success: false, error: `${ErrorTokens.WFRP_ECONOMY_VENTURE_SETTLE_DELAYED}: venture "${input.ventureId}" has ${result.delayCycles} delay cycle(s) remaining` };
  }
  if (result?.noHolders) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_NO_HOLDERS: venture "${input.ventureId}" has no holders to pay — nothing to close out` };
  }
  if (result?.noCapitalToReturn) {
    return { success: false, error: `WFRP_ECONOMY_VENTURE_NO_CAPITAL_TO_RETURN: venture "${input.ventureId}" holds no working capital — nothing to return` };
  }
  // H4: the wrapper lifts a failed NESTED distribution, so this branch also catches "closed out but a
  // holder was never paid" — which previously surfaced as a clean success.
  if (result?.persistedCheckFailed) {
    return notPersisted(`close-out-venture on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }

  const distributedBp = Number(result?.distributed?.distributedBp ?? 0);
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `closed out — ${distributedBp} BP returned to holders` });
  return {
    success: true,
    data: {
      action: 'close-out-venture',
      ventureId: input.ventureId,
      status: String(result?.status ?? ''),
      distributedBp,
    },
  };
}

type ToggleVentureBadgeInput = Extract<WfrpEconomyInputType, { action: 'toggle-venture-badge' }>;
async function handleToggleVentureBadge(input: ToggleVentureBadgeInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`toggle-venture-badge flips the "${input.badge}" badge on venture "${input.ventureId}" (add if absent, remove if present). Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.toggleBadge(input.ventureId, input.badge);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`toggle-venture-badge on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `badge "${input.badge}" toggled — badges now: ${(result.badges ?? []).join(', ') || '(none)'}` });
  return { success: true, data: { action: 'toggle-venture-badge', ventureId: input.ventureId, badges: Array.isArray(result.badges) ? result.badges : [] } };
}

type IssuePartsInput = Extract<WfrpEconomyInputType, { action: 'issue-parts' }>;
async function handleIssueParts(input: IssuePartsInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`issue-parts raises venture "${input.ventureId}"'s total Parts by ${input.count}${input.priceModPct ? ` and adjusts price by ${input.priceModPct > 0 ? '+' : ''}${input.priceModPct}%` : ''}. Existing holders are diluted only once the new Parts are subscribed. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.issuePartsForVenture(input.ventureId, { count: input.count, priceModPct: input.priceModPct });

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.invalidCount) return { success: false, error: `WFRP_ECONOMY_VENTURE_INVALID_PARTS_COUNT: count must be a positive integer` };
  if (result?.persistedCheckFailed) {
    return notPersisted(`issue-parts on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `issued ${input.count} new Part(s) — total now ${result.partsTotal}` });
  return { success: true, data: { action: 'issue-parts', ventureId: input.ventureId, partsTotal: Number(result.partsTotal ?? 0), priceBp: Number(result.priceBp ?? 0) } };
}

type SetVentureStatusInput = Extract<WfrpEconomyInputType, { action: 'set-venture-status' }>;
async function handleSetVentureStatus(input: SetVentureStatusInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    // M9 (BUG-841): the gate existed but warned of nothing. This is a GM OVERRIDE that bypasses the
    // whole lifecycle — mirroring delete-venture's explicit write-off warning.
    return confirmRequired(`set-venture-status FORCES venture "${input.ventureId}" to status "${input.status}", bypassing the entire lifecycle: no subscription, launch, wind-up or settlement check runs, and no delay, badge or holder guard applies. Forcing to a TERMINAL status (completed/defaulted) now also runs the real invariant work — completing a deed that still holds working capital RELEASES that capital to the holders, while defaulting WRITES IT OFF (holders are paid nothing). Forcing backwards out of a terminal status resurrects a closed deed. Prefer launch-venture / wind-up-venture / close-out-venture for the sanctioned transitions. Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.setStatus(input.ventureId, input.status);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.invalidStatus) return { success: false, error: `WFRP_ECONOMY_VENTURE_INVALID_STATUS: "${input.status}" is not a valid status` };
  if (result?.persistedCheckFailed) {
    return notPersisted(`set-venture-status on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `status now ${result.status}` });
  return { success: true, data: { action: 'set-venture-status', ventureId: input.ventureId, status: result.status } };
}

type SetVentureStandingInput = Extract<WfrpEconomyInputType, { action: 'set-venture-standing' }>;
async function handleSetVentureStanding(input: SetVentureStandingInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return confirmRequired(`set-venture-standing forces venture "${input.ventureId}" to standing "${input.standing}". Re-call with confirm:true.`);
  }
  const VentureEngine = await importVentureEngine();
  const result = await VentureEngine.setStanding(input.ventureId, input.standing);

  if (result?.notFound) return targetNotFound(`venture "${input.ventureId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`set-venture-standing on "${input.ventureId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', `venture ${input.ventureId}`, { summary: `standing now ${result.standing}` });
  return { success: true, data: { action: 'set-venture-standing', ventureId: input.ventureId, standing: result.standing } };
}

// ── trading (Phase 7f) ──────────────────────────────────────────────────────────
// DIALOG-PATH: DIALOG_FREE — src/trading/{trading-engine,gazetteer-store,trading-math}.js are all
// MODAL-PROMPT-FREE + ROLL-FREE (Phase 2 task 2.2/2.4 acceptance: zero Dialog/DialogV2, zero Math.random
// in trading-math.js/trading-engine.js — confirmed by reading all three files at MCP-authoring time).
// Every stochastic action below takes a caller pre-rolled total; this handler never awaits a path that
// could open a Foundry dialog or silently roll.

type TradingListSettlementsInput = Extract<WfrpEconomyInputType, { action: 'trading-list-settlements' }>;
async function handleTradingListSettlements(input: TradingListSettlementsInput): Promise<Envelope<unknown>> {
  const GazetteerStore = await importGazetteerStore();
  const packs = await GazetteerStore.loadActiveGazetteers();
  const filtered = input.gazetteerId ? packs.filter((p: any) => p?.packId === input.gazetteerId) : packs;
  if (input.gazetteerId && filtered.length === 0) {
    return targetNotFound(`gazetteer "${input.gazetteerId}" is not active (or does not exist)`);
  }
  const settlements = filtered.flatMap((pack: any) =>
    (pack.settlements ?? []).map((s: any) => ({
      name: s.name,
      gazetteerId: pack.packId,
      region: pack.label ?? pack.packId,
      size: Number(s.size ?? 0),
      wealth: Number(s.wealth ?? 0),
      population: s.population ?? null,
      produces: Array.isArray(s.produces) ? s.produces : [],
      demands: Array.isArray(s.demands) ? s.demands : [],
      flags: Array.isArray(s.flags) ? s.flags : [],
    })),
  );
  return { success: true, data: { action: 'trading-list-settlements', count: settlements.length, settlements } };
}

async function handleTradingListCargoTypes(): Promise<Envelope<unknown>> {
  const GazetteerStore = await importGazetteerStore();
  const catalog = await GazetteerStore.loadCargoCatalog();
  const cargoTypes = Array.isArray(catalog) ? catalog : [];
  return { success: true, data: { action: 'trading-list-cargo-types', count: cargoTypes.length, cargoTypes } };
}

async function handleTradingGetSeason(): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const { season, seasonSource } = TradingEngine.tradingSeason();
  return { success: true, data: { action: 'trading-get-season', season, seasonSource } };
}

type TradingSetSeasonInput = Extract<WfrpEconomyInputType, { action: 'trading-set-season' }>;
async function handleTradingSetSeason(input: TradingSetSeasonInput): Promise<Envelope<unknown>> {
  if (!input.clear && !input.season) {
    return { success: false, error: 'WFRP_ECONOMY_TRADING_INVALID_INPUT: trading-set-season requires either `season` or `clear:true`' };
  }
  const value = input.clear ? '' : (input.season as string);
  await setSetting('tradingSeason', value);

  const fresh = getSetting('tradingSeason');
  if (fresh !== value) {
    return notPersisted(`trading-set-season expected "${value}", read back "${fresh}"`);
  }
  const TradingEngine = await importTradingEngine();
  const resolved = TradingEngine.tradingSeason();
  notify.updated('wfrp-economy', 'trading season', {
    summary: input.clear ? 'season override cleared (calendar-derived)' : `season set to ${input.season}`,
  });
  return { success: true, data: { action: 'trading-set-season', season: resolved.season, seasonSource: resolved.seasonSource } };
}

type TradingCheckAvailabilityInput = Extract<WfrpEconomyInputType, { action: 'trading-check-availability' }>;
async function handleTradingCheckAvailability(input: TradingCheckAvailabilityInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const resolved = await TradingEngine.resolveSettlement(input.settlement);
  if (resolved.notFound) return targetNotFound(`settlement "${input.settlement}" not found in any active gazetteer`);

  const GazetteerStore = await importGazetteerStore();
  const TradingMath = await importTradingMath();
  const [cargoCatalog, tuning] = await Promise.all([GazetteerStore.loadCargoCatalog(), GazetteerStore.loadTuning()]);
  const season = input.season ?? TradingEngine.tradingSeason().season;
  const flags = (resolved.settlement.flags ?? []).map((f: string) => String(f).toLowerCase());
  // calculateCargoSlots is the max POTENTIAL slot count (Size + 1 if Trade-flagged) — the RAW availability
  // gate (P10-4) is rolled and checked per-slot inside runAvailabilityPipeline, so a settlement can return
  // fewer than this many slots, or none, depending on each slot's availabilityRoll.
  const potentialSlotCount = TradingMath.calculateCargoSlots(resolved.settlement, flags, tuning);

  if (input.rolls.length < potentialSlotCount) {
    return {
      success: false,
      error: `WFRP_ECONOMY_TRADING_INSUFFICIENT_ROLLS: "${input.settlement}" needs ${potentialSlotCount} pre-rolled {availabilityRoll,cargoRoll,amountRoll} triple(s) this season, got ${input.rolls.length}`,
    };
  }

  const pipeline = TradingMath.runAvailabilityPipeline({ settlement: resolved.settlement, season, cargoCatalog, tuning, rolls: input.rolls });
  return {
    success: true,
    data: { action: 'trading-check-availability', settlement: resolved.settlement.name, season, potentialSlotCount: pipeline.potentialSlotCount, slotCount: pipeline.slotCount, slots: pipeline.slots },
  };
}

type TradingCalcPurchasePriceInput = Extract<WfrpEconomyInputType, { action: 'trading-calc-purchase-price' }>;
async function handleTradingCalcPurchasePrice(input: TradingCalcPurchasePriceInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const quote = await TradingEngine.quotePurchasePrice({ cargoName: input.cargoName, quantity: input.quantity, season: input.season, quality: input.quality, economyId: input.economyId });
  if (quote.notFound) return targetNotFound(`cargo "${input.cargoName}" not found in the catalog`);
  return {
    success: true,
    data: {
      action: 'trading-calc-purchase-price',
      cargoName: input.cargoName,
      quantity: input.quantity,
      season: input.season ?? TradingEngine.tradingSeason().season,
      pricePerEpBp: Number(quote.pricePerEpBp ?? 0),
      totalBp: Number(quote.totalBp ?? 0),
      dialFactor: Number(quote.dialFactor ?? 1),
    },
  };
}

type TradingCalcSalePriceInput = Extract<WfrpEconomyInputType, { action: 'trading-calc-sale-price' }>;
async function handleTradingCalcSalePrice(input: TradingCalcSalePriceInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const quote = await TradingEngine.quoteSalePrice({
    cargoName: input.cargoName,
    quantity: input.quantity,
    settlementName: input.settlement,
    season: input.season,
    quality: input.quality,
    economyId: input.economyId,
  });
  if (quote.notFound) return targetNotFound(`cargo "${input.cargoName}" not found in the catalog`);
  if (quote.settlementNotFound) return targetNotFound(`settlement "${input.settlement}" not found in any active gazetteer`);
  return {
    success: true,
    data: {
      action: 'trading-calc-sale-price',
      cargoName: input.cargoName,
      quantity: input.quantity,
      settlement: input.settlement,
      season: input.season ?? TradingEngine.tradingSeason().season,
      pricePerEpBp: Number(quote.pricePerEpBp ?? 0),
      totalBp: Number(quote.totalBp ?? 0),
      dialFactor: Number(quote.dialFactor ?? 1),
      linkedDemandApplied: quote.linkedDemandApplied ?? null,
    },
  };
}

type TradingHaggleTestInput = Extract<WfrpEconomyInputType, { action: 'trading-haggle-test' }>;
async function handleTradingHaggleTest(input: TradingHaggleTestInput): Promise<Envelope<unknown>> {
  const TradingMath = await importTradingMath();
  const result = TradingMath.performHaggleTest(input.playerSkill, input.merchantSkill, !!input.hasDealmakerTalent, input.playerRoll, input.merchantRoll);
  return {
    success: true,
    data: {
      action: 'trading-haggle-test',
      success: Boolean(result.success),
      hasDealmakerTalent: Boolean(result.hasDealmakerTalent),
      player: result.player,
      merchant: result.merchant,
      resultDescription: result.resultDescription,
    },
  };
}

type TradingGossipTestInput = Extract<WfrpEconomyInputType, { action: 'trading-gossip-test' }>;
async function handleTradingGossipTest(input: TradingGossipTestInput): Promise<Envelope<unknown>> {
  const TradingMath = await importTradingMath();
  const result = TradingMath.performGossipTest(input.playerSkill, input.playerRoll, input.difficulty ?? -10);
  const gossipSuccess = Boolean(result.success);

  // Change 2: a successful Gossip Test rolls the RAW 20-band d100 Trade Rumour Table and mints+stores the
  // row's own rumour — mintAndStoreRumour returns null (zero writes) when gossipSuccess is false.
  const TradingEngine = await importTradingEngine();
  const minted = await TradingEngine.mintAndStoreRumour({ gossipSuccess, rumourD100Roll: input.rumourD100Roll });
  if (minted?.persistedCheckFailed) {
    return notPersisted(`trading-gossip-test rumour mint failed persistence check: ${minted?.detail ?? 'unknown'}`);
  }
  if (minted?.minted) {
    notify.created('wfrp-economy', 'trade rumour', { summary: `minted rumour ${minted.rumour.id} (goods: ${(minted.rumour.goods ?? []).join(', ')})` });
  }

  return {
    success: true,
    data: {
      action: 'trading-gossip-test',
      success: gossipSuccess,
      degrees: Number(result.degrees ?? 0),
      resultDescription: result.resultDescription,
      rumourMinted: minted?.minted ? minted.rumour : null,
    },
  };
}

type TradingBuyCargoInput = Extract<WfrpEconomyInputType, { action: 'trading-buy-cargo' }>;
async function handleTradingBuyCargo(input: TradingBuyCargoInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const TradingEngine = await importTradingEngine();
  const result = await TradingEngine.buyCargo({
    actorId: input.actorId,
    cargoName: input.cargoName,
    quantity: input.quantity,
    settlementName: input.settlement,
    season: input.season,
    quality: input.quality,
    secretQualityD10Roll: input.secretQualityD10Roll,
    // F04 (validate 2026-07-17): pass through as-is — an omitted value lets the engine derive the
    // bonus from the settlement's own wineQualityBonus (D3 wiring); explicit values (incl. 0) win.
    originBonusSteps: input.originBonusSteps,
    economyId: input.economyId,
  });

  if (result?.notFound) return targetNotFound(`cargo "${input.cargoName}" not found in the catalog`);
  if (result?.capacityExceeded) {
    return {
      success: false,
      error: `WFRP_ECONOMY_TRADING_CAPACITY_EXCEEDED: hold capacity ${result.capacity} EP — ${result.currentHoldEp} EP already held, ${input.quantity} EP would overflow it`,
    };
  }
  if (result?.insufficientFunds) {
    return notPersisted(`trading-buy-cargo of ${input.quantity} EP ${input.cargoName} requires ${result.requiredBp} BP but actor "${input.actorId}" wallet has ${result.walletBalanceBp} BP`);
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-buy-cargo for actor "${input.actorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }

  // D12: echo the secret quality — the MCP caller IS the GM surface, so this is not a leak to a player.
  // getHoldRows() (post-7f vehicle materialization), NOT getHold() — see handleTradingGetHold's comment;
  // when a vehicle is connected the just-bought lot lives as an embedded Item, absent from getHold()'s
  // abstract-array read, which would silently null out secretQuality below.
  const hold = TradingEngine.getHoldRows();
  const lot = (Array.isArray(hold) ? hold : []).find((l: any) => l?.lotId === result.lotId);

  notify.created('wfrp-economy', actorName(input.actorId) ?? input.actorId, {
    summary: `bought ${input.quantity} EP ${input.cargoName} at ${input.settlement} for ${result.totalBp} BP (lot ${result.lotId})`,
  });
  return {
    success: true,
    data: {
      action: 'trading-buy-cargo',
      actorId: input.actorId,
      lotId: result.lotId,
      cargoName: input.cargoName,
      quantity: input.quantity,
      settlement: input.settlement,
      totalBp: Number(result.totalBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
      secretQuality: lot?.secretQuality ?? null,
      rumourApplied: result.rumourApplied ?? null,
    },
  };
}

type TradingSellCargoInput = Extract<WfrpEconomyInputType, { action: 'trading-sell-cargo' }>;
async function handleTradingSellCargo(input: TradingSellCargoInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const TradingEngine = await importTradingEngine();

  // Change 2: no more explicit rumourId lookup — sellCargo auto-matches a stored sellBonus rumour against
  // the lot's cargoName internally and consumes it on a successful sale (see the engine-contract comment
  // above this file's imports).
  const result = await TradingEngine.sellCargo({
    actorId: input.actorId,
    lotId: input.lotId,
    settlementName: input.settlement,
    isTradeSettlement: input.isTradeSettlement,
    buyerRoll: input.buyerRoll,
    halfCargoRetryRoll: input.halfCargoRetryRoll,
    weeksElapsedSincePurchase: input.weeksElapsedSincePurchase ?? 1,
    topShelfBuyerRoll: input.topShelfBuyerRoll,
    acceptFireSale: input.acceptFireSale ?? false,
    economyId: input.economyId,
  });

  if (result?.lotNotFound) return targetNotFound(`cargo lot "${input.lotId}" not found in the hold`);
  if (result?.notFound) return targetNotFound(`settlement "${input.settlement}" not found in any active gazetteer`);
  if (result?.refused) {
    return { success: false, error: `WFRP_ECONOMY_TRADING_SALE_REFUSED: gate=${result.gate} — ${result.verdict?.reason ?? 'refused'}` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-sell-cargo of lot "${input.lotId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }

  const partial = Boolean(result?.soldPartial);
  notify.updated('wfrp-economy', actorName(input.actorId) ?? input.actorId, {
    summary: `sold lot ${input.lotId} at ${input.settlement} for ${result.totalBp} BP${partial ? ` (${result.quantitySold} EP of it — ${result.quantityRemaining} EP remaining)` : ''}`,
  });
  return {
    success: true,
    data: {
      action: 'trading-sell-cargo',
      actorId: input.actorId,
      lotId: input.lotId,
      settlement: input.settlement,
      soldPartial: partial,
      quantitySold: partial ? Number(result.quantitySold ?? 0) : null,
      quantityRemaining: partial ? Number(result.quantityRemaining ?? 0) : 0,
      totalBp: Number(result.totalBp ?? 0),
      walletBalanceBp: Number(result.walletBalanceBp ?? 0),
      saleType: result.saleType ?? 'normal',
      rumourApplied: result.rumourApplied ?? null,
      linkedDemandApplied: result.linkedDemandApplied ?? null,
    },
  };
}

type TradingDeleteRumourInput = Extract<WfrpEconomyInputType, { action: 'trading-delete-rumour' }>;
async function handleTradingDeleteRumour(input: TradingDeleteRumourInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const result = await TradingEngine.deleteRumour({ rumourId: input.rumourId });

  if (result?.notFound) return targetNotFound(`rumour "${input.rumourId}" not found`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-delete-rumour of "${input.rumourId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.deleted('wfrp-economy', 'trade rumour', { summary: `rumour ${input.rumourId} removed` });
  return { success: true, data: { action: 'trading-delete-rumour', rumourId: input.rumourId, deleted: true } };
}

async function handleTradingGetHold(): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  // getHoldRows() (post-7f vehicle materialization), NOT getHold() — getHold() only ever reads the
  // abstract tradingCargoHold setting, which buyCargo/sellCargo/deleteCargoLot stop touching entirely once
  // a vehicle is connected (embedded `cargo`-type Items on the vehicle are the record instead). Calling
  // getHold() here would silently show an empty/stale hold whenever a vehicle is connected.
  const hold = TradingEngine.getHoldRows();
  const { capacity, capacitySource, connectedVehicleName } = TradingEngine.getCargoCapacityInfo();
  const list = Array.isArray(hold) ? hold : [];
  const currentHoldEp = list.reduce((sum: number, lot: any) => sum + Number(lot?.quantity ?? 0), 0);
  return {
    success: true,
    data: { action: 'trading-get-hold', capacity, capacitySource, connectedVehicleName: connectedVehicleName ?? null, currentHoldEp, count: list.length, hold: list },
  };
}

async function handleTradingListVehicleActors(): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const actors = TradingEngine.discoverCargoVehicleActors();
  const list = Array.isArray(actors) ? actors : [];
  return { success: true, data: { action: 'trading-list-vehicle-actors', count: list.length, actors: list } };
}

type TradingConnectCargoVehicleInput = Extract<WfrpEconomyInputType, { action: 'trading-connect-cargo-vehicle' }>;
async function handleTradingConnectCargoVehicle(input: TradingConnectCargoVehicleInput): Promise<Envelope<unknown>> {
  if (!getGame()?.actors?.get?.(input.actorId)) return targetNotFound(`actor "${input.actorId}" not found`);

  const TradingEngine = await importTradingEngine();
  const result = await TradingEngine.connectCargoVehicle({ actorId: input.actorId });

  if (result?.notFound) return targetNotFound(`actor "${input.actorId}" is not a vehicle-type actor`);
  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-connect-cargo-vehicle for actor "${input.actorId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', actorName(input.actorId) ?? input.actorId, { summary: `connected as the cargo hold's vehicle (carries.max ${result.carriesMax})` });
  return {
    success: true,
    data: { action: 'trading-connect-cargo-vehicle', actorId: input.actorId, actorUuid: result.actorUuid, carriesMax: Number(result.carriesMax ?? 0) },
  };
}

async function handleTradingDisconnectCargoVehicle(): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const result = await TradingEngine.disconnectCargoVehicle();

  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-disconnect-cargo-vehicle failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', 'cargo hold', { summary: 'vehicle disconnected — capacity reverted to the manual setting' });
  return { success: true, data: { action: 'trading-disconnect-cargo-vehicle', disconnected: true } };
}

async function handleTradingListGazetteers(): Promise<Envelope<unknown>> {
  const GazetteerStore = await importGazetteerStore();
  const activeIds: string[] = GazetteerStore.readActiveGazetteerIds();
  const imported = GazetteerStore.readImportedGazetteers();

  const builtinRows = await Promise.all(
    (GazetteerStore.BUILTIN_GAZETTEER_IDS as string[]).map(async (packId: string) => {
      try {
        const pack = await GazetteerStore.loadBuiltinPack(packId);
        return {
          packId,
          label: pack?.label ?? packId,
          builtin: true,
          active: activeIds.includes(packId),
          settlementCount: Array.isArray(pack?.settlements) ? pack.settlements.length : 0,
        };
      } catch (e) {
        return {
          packId,
          label: packId,
          builtin: true,
          active: activeIds.includes(packId),
          settlementCount: 0,
          loadError: e instanceof Error ? e.message : String(e),
        };
      }
    }),
  );
  const importedRows = Object.entries(imported).map(([packId, pack]: [string, any]) => ({
    packId,
    label: pack?.label ?? packId,
    builtin: false,
    active: activeIds.includes(packId),
    settlementCount: Array.isArray(pack?.settlements) ? pack.settlements.length : 0,
  }));

  const gazetteers = [...builtinRows, ...importedRows];
  return { success: true, data: { action: 'trading-list-gazetteers', count: gazetteers.length, activeIds, gazetteers } };
}

type TradingImportGazetteerInput = Extract<WfrpEconomyInputType, { action: 'trading-import-gazetteer' }>;
async function handleTradingImportGazetteer(input: TradingImportGazetteerInput): Promise<Envelope<unknown>> {
  const GazetteerStore = await importGazetteerStore();
  const result = await GazetteerStore.importGazetteerPack(input.pack);

  if (result?.invalidPack) {
    return { success: false, error: `WFRP_ECONOMY_TRADING_INVALID_GAZETTEER: ${result.detail}` };
  }
  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-import-gazetteer "${result.packId}" failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  const settlementCount = Array.isArray((input.pack as any)?.settlements) ? (input.pack as any).settlements.length : 0;
  notify.created('wfrp-economy', result.packId, { summary: `imported gazetteer "${result.packId}" (${settlementCount} settlement(s))` });
  return { success: true, data: { action: 'trading-import-gazetteer', packId: result.packId, settlementCount } };
}

type TradingConfigureGazetteersInput = Extract<WfrpEconomyInputType, { action: 'trading-configure-gazetteers' }>;
async function handleTradingConfigureGazetteers(input: TradingConfigureGazetteersInput): Promise<Envelope<unknown>> {
  const GazetteerStore = await importGazetteerStore();
  const result = await GazetteerStore.setActiveGazetteerIds(input.activeIds);
  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-configure-gazetteers failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  notify.updated('wfrp-economy', 'active gazetteers', { summary: `active gazetteers now: ${(result.active ?? []).join(', ') || '(none)'}` });
  return { success: true, data: { action: 'trading-configure-gazetteers', active: result.active ?? [] } };
}

type TradingGenerateMerchantInput = Extract<WfrpEconomyInputType, { action: 'trading-generate-merchant' }>;
async function handleTradingGenerateMerchant(input: TradingGenerateMerchantInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const resolved = await TradingEngine.resolveSettlement(input.settlement);
  if (resolved.notFound) return targetNotFound(`settlement "${input.settlement}" not found in any active gazetteer`);

  const GazetteerStore = await importGazetteerStore();
  const TradingMath = await importTradingMath();
  const tuning = await GazetteerStore.loadTuning();

  const merchant = TradingMath.generateMerchant({
    settlement: resolved.settlement,
    cargoType: input.cargoType,
    merchantType: input.merchantType,
    percentileRoll: input.percentileRoll,
    merchantId: randomId(),
    skillDistribution: tuning?.skillDistribution ?? {},
    specialSourceBehaviors: tuning?.specialSourceBehaviors ?? {},
  });

  return { success: true, data: { action: 'trading-generate-merchant', ...merchant } };
}

type TradingRevealQualityInput = Extract<WfrpEconomyInputType, { action: 'trading-reveal-quality' }>;
async function handleTradingRevealQuality(input: TradingRevealQualityInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  // getHoldRows() (post-7f vehicle materialization) — see handleTradingGetHold's comment; a vehicle-mode
  // lot lives as an embedded Item, invisible to getHold()'s abstract-array read.
  const hold = TradingEngine.getHoldRows();
  const lot = (Array.isArray(hold) ? hold : []).find((l: any) => l?.lotId === input.lotId);
  if (!lot) return targetNotFound(`cargo lot "${input.lotId}" not found in the hold`);
  if (!lot.secretQuality) {
    return { success: false, error: `WFRP_ECONOMY_TRADING_NO_SECRET_QUALITY: lot "${input.lotId}" (${lot.cargoName}) carries no secret quality tier to reveal` };
  }

  const TradingMath = await importTradingMath();
  const revealed = TradingMath.revealQuality({
    trueTierIndex: lot.secretQuality.tierIndex,
    evaluateSuccess: input.evaluateSuccess,
    sl: input.sl,
    misreportDirection: input.misreportDirection ?? 1,
  });

  return {
    success: true,
    data: {
      action: 'trading-reveal-quality',
      lotId: input.lotId,
      cargoName: lot.cargoName,
      revealedTier: revealed.revealedTier,
      misreported: Boolean(revealed.misreported),
      trueTier: lot.secretQuality.tier, // GM-only ground truth — the MCP caller IS the GM surface (D12)
    },
  };
}

// Phase 7f (task 4.3): the NEW trading dial lives under THIS module's own namespace (SETTING_SCOPE =
// 'wfrp4e-economy'). The OLD dial registration at settings.ts:~297 (`warhammer-mcp`.`tradingPriceModifiers`,
// consumed by module-trading-places' get/set-price-modifiers) stays untouched for the still-live old
// umbrella until Phase 7g retirement — the two dials are deliberately separate stores (D2 seed-once
// migration copies the old value into this one ONCE, at first engine init; they don't stay in sync after).
function tradingDial(): { global: number; perCargo: Record<string, number> } {
  return getSetting('tradingPriceModifiers') ?? { global: 1, perCargo: {} };
}

function handleTradingGetPriceModifiers(): Envelope<unknown> {
  const dial = tradingDial();
  return { success: true, data: { action: 'trading-get-price-modifiers', global: dial.global, perCargo: dial.perCargo } };
}

type TradingSetPriceModifiersInput = Extract<WfrpEconomyInputType, { action: 'trading-set-price-modifiers' }>;
async function handleTradingSetPriceModifiers(input: TradingSetPriceModifiersInput): Promise<Envelope<unknown>> {
  const previous = tradingDial();
  const next = input.reset
    ? { global: 1, perCargo: {} }
    : { global: input.global ?? previous.global, perCargo: { ...previous.perCargo, ...(input.perCargo ?? {}) } };

  await setSetting('tradingPriceModifiers', next);

  const persisted = tradingDial();
  const roundTripOk = persisted.global === next.global && JSON.stringify(persisted.perCargo) === JSON.stringify(next.perCargo);
  if (!roundTripOk) {
    return notPersisted('trading-set-price-modifiers wrote a value that did not round-trip through the tradingPriceModifiers setting');
  }

  notify.updated('wfrp-economy', 'trading price dial', {
    summary: `global ${previous.global} → ${next.global}${Object.keys(next.perCargo).length ? `, ${Object.keys(next.perCargo).length} perCargo override(s)` : ''}`,
  });
  return { success: true, data: { action: 'trading-set-price-modifiers', previous, current: next } };
}

async function handleTradingMigrationStatus(): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const result = await TradingEngine.ensureMigrated();

  if (result?.persistedCheckFailed) {
    return notPersisted(`trading-migration-status seed-once write failed persistence check: ${result?.detail ?? 'unknown'}`);
  }
  if (result?.alreadyMigrated) {
    notify.updated('wfrp-economy', 'trading migration', { summary: `already migrated (source: ${result.migratedFrom})` });
    return { success: true, data: { action: 'trading-migration-status', migrated: true, alreadyMigrated: true, migratedFrom: result.migratedFrom } };
  }
  notify.created('wfrp-economy', 'trading migration', {
    summary: `seed-once migration ran — season ${result.seededSeason ?? 'n/a'}, ${result.seededHoldCount} hold lot(s), capacity ${result.seededCapacity ?? 'n/a'}, dial seeded ${result.seededDial}`,
  });
  return {
    success: true,
    data: {
      action: 'trading-migration-status',
      migrated: true,
      alreadyMigrated: false,
      seededSeason: result.seededSeason ?? null,
      seededHoldCount: Number(result.seededHoldCount ?? 0),
      seededCapacity: result.seededCapacity ?? null,
      seededDial: Boolean(result.seededDial),
    },
  };
}

// Phase 8 (D1/D4/D11) — economic climate. F03 fix (2026-07-18): the hand-copied TS mirror of the D13
// table is GONE — labels/factors are read from the FORK's own CLIMATE_STATES (re-exported by
// trading-engine.js from climate-math.js) at echo time, so a D13 re-tune is a one-file fork edit and
// the echo can never lie. This handler still never computes a price/income/event number itself (D2).
type ClimateStatesTable = Record<string, { labelKey: string; priceFactor: number; incomeFactor: number; eventShift: number }>;

function climateResultFrom(action: 'climate-get-state' | 'climate-set-state', economyId: string, record: { state: string; updatedAt: number | null }, states: ClimateStatesTable): Envelope<unknown> {
  const meta = states[record.state] ?? states.none!;
  const label = (globalThis as any).game?.i18n?.localize?.(meta.labelKey) ?? record.state;
  return {
    success: true,
    data: {
      action,
      economyId,
      state: record.state,
      label,
      priceFactor: meta.priceFactor,
      incomeFactor: meta.incomeFactor,
      eventShift: meta.eventShift,
      updatedAt: record.updatedAt,
    },
  };
}

type ClimateGetStateInput = Extract<WfrpEconomyInputType, { action: 'climate-get-state' }>;
async function handleClimateGetState(input: ClimateGetStateInput): Promise<Envelope<unknown>> {
  // Validate economy existence like climate-set-state/get-economy do — without this, a guessed/typo'd
  // economyId silently returns the identity `none`/Stable record instead of failing loud (Phase 9
  // validate S3 sweep finding: a bogus id read back as a plausible "Stable" climate).
  if (!findEconomy(input.economyId)) return targetNotFound(`economy "${input.economyId}" not found`);
  const TradingEngine = await importTradingEngine();
  // addendum-2: climate is per-economy — reads that economy's record (missing key = identity `none`).
  const record = TradingEngine.getEconomicClimate(input.economyId);
  return climateResultFrom('climate-get-state', input.economyId, record, TradingEngine.CLIMATE_STATES);
}

type ClimateSetStateInput = Extract<WfrpEconomyInputType, { action: 'climate-set-state' }>;
async function handleClimateSetState(input: ClimateSetStateInput): Promise<Envelope<unknown>> {
  const TradingEngine = await importTradingEngine();
  const written = await TradingEngine.setEconomicClimate(input.economyId, input.state);
  if ((written as { economyNotFound?: boolean })?.economyNotFound) {
    return targetNotFound(`economy "${input.economyId}" not found — climate-set-state refused, zero writes`);
  }

  const persisted = TradingEngine.getEconomicClimate(input.economyId);
  if (persisted?.state !== written.state || persisted?.updatedAt !== written.updatedAt) {
    return notPersisted('climate-set-state wrote a value that did not round-trip through the economicClimate setting');
  }

  notify.updated('wfrp-economy', 'economic climate', { summary: `climate set to ${input.state} for economy ${input.economyId}` });
  return climateResultFrom('climate-set-state', input.economyId, persisted, TradingEngine.CLIMATE_STATES);
}
