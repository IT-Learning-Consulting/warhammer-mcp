// DIALOG-PATH: DIALOG_FREE — pure settings read + runtime import + TransactionLogger.logTransaction
// (an awaited game.settings.set), no Dialog/prompt path.
// Module Integration v2 Phase 2 (wfrp_economy_system) — fail-open unified-ledger append helper.
//
// Hybrid MCP-layer seam (Option D, phase2_pre_plan.md §Recommended approach): wired into the 6
// foundry-module coin-write sites OUTSIDE module-wfrp-economy's own 9 tracked ops (item-piles
// add-currency/remove-currency/transfer-currency/trade-items, MarketService directPay/addMoney) so
// every coin movement becomes visible to module-wfrp-economy.list-transactions (R2.1/R2.2/R2.3, HC5).
//
// FAIL-OPEN CONTRACT: a ledger-log failure must NEVER fail the coin write that triggered it. This
// helper never throws — on any error (module inactive, import failure, actor unresolved) it
// console.warns and returns without persisting a row. Call it AFTER the coin write has settled/
// verified, never concurrently with it (CCR-ITEMPILES-CONCURRENCY is scoped to actor.items writes;
// this only appends to a world SETTING, so it structurally cannot trigger that race — memo
// §Concurrency origin — but sequencing after settle keeps the ledger row causally after the money
// move it describes).

const MODULE_ID = 'wfrp4e-economy';

const runtimeImport = (specifier: string): Promise<any> => {
  const override = (globalThis as any).__wfrpEconomyRuntimeImport;
  if (typeof override === 'function') return Promise.resolve(override(specifier));
  return (Function('s', 'return import(s)') as (s: string) => Promise<any>)(specifier);
};

const importTransactionLogger = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/src/utils/transaction-logger.js`).then((m) => m.TransactionLogger);

/** Accepts either a plain actor id or a Foundry UUID (world or synthetic token actor). */
async function resolveActor(actorIdOrUuid: string): Promise<{ id: string; name: string }> {
  const game = (globalThis as any).game;
  if (!actorIdOrUuid.includes('.')) {
    const actor = game?.actors?.get?.(actorIdOrUuid);
    return { id: actorIdOrUuid, name: actor?.name ?? actorIdOrUuid };
  }
  const doc: any = await (globalThis as any).fromUuid?.(actorIdOrUuid);
  const actor = doc?.actor ?? doc; // TokenDocument.actor for synthetic actors, else the Actor itself
  return { id: actor?.id ?? actorIdOrUuid, name: actor?.name ?? actorIdOrUuid };
}

export interface RecordEconomyTransactionInput {
  /** Plain actor id OR a Foundry UUID (Actor.xxx / Scene.yyy.Token.zzz) — resolved internally. */
  actorId: string;
  /** Integer Brass Pennies. */
  amount: number;
  /** Free-form transaction type label (e.g. "currency-add", "pay"). */
  type: string;
  source: 'earn' | 'trade' | 'itempiles' | 'levy' | 'economy';
  description: string;
  targetActorId?: string;
}

export async function recordEconomyTransaction(input: RecordEconomyTransactionInput): Promise<void> {
  try {
    const game = (globalThis as any).game;
    const mod = game?.modules?.get?.(MODULE_ID);
    if (!mod?.active) return; // fail-open: module absent/inactive — nothing to log against

    const actor = await resolveActor(input.actorId);
    const target = input.targetActorId ? await resolveActor(input.targetActorId) : null;

    const TransactionLogger = await importTransactionLogger();
    await TransactionLogger.logTransaction({
      type: input.type,
      source: input.source,
      actorId: actor.id,
      actorName: actor.name,
      amount: input.amount,
      description: input.description,
      targetActorId: target?.id,
      targetActorName: target?.name,
    });
  } catch (e) {
    console.warn(`[wfrp-economy ledger] recordEconomyTransaction failed (fail-open, coin write unaffected): ${e instanceof Error ? e.message : String(e)}`);
  }
}
