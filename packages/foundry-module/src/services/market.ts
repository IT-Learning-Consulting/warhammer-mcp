// services/market.ts — wfrp_layer_expansion_v1 Phase 13 (R16).
//
// Wraps the two `MarketWFRP4e` (`game.wfrp4e.market`, exposed wfrp4e.js:33299) coin
// methods, both of which have data-loss / silent-failure sharp edges that make a raw
// wrap unsafe:
//
// - `addMoneyTo(actor, moneyString)` (wfrp4e.js:1160-1206) is SYNC and does NOT persist
//   (caller must `updateEmbeddedDocuments`). It ZEROES ALL THREE COIN ITEMS when the
//   numeric prefix is falsy/zero (`!amt && !halfG && !halfS`) and THROWS RAW if the
//   target tier's coin item is missing. `handleAddMoney` strictly validates the numeric
//   prefix BEFORE calling it (blocking the zero-all trap) and pre-checks the coin item
//   exists (typed error instead of a raw throw), then persists + diff-verifies.
// - `directPayCommand(amount, actor, options)` (wfrp4e.js:755-760) delegates to
//   `payCommand`, which returns `false` on insufficient funds / an unparseable string —
//   `directPayCommand` FAILS SILENTLY in that case (no throw, no partial deduction).
//   `handleDirectPay` pre-flight-checks funds (parsing via the system's own
//   `parseMoneyTransactionString` to avoid locale/abbreviation drift) before calling it,
//   and BUG-064 hook-waits the fire-and-forget `updateEmbeddedDocuments` inside
//   `directPayCommand` before diff-verifying the deduction (mirrors
//   data-access.ts `applyDamage`'s hook-wait+timeout pattern).

import { notify } from '../notify.js';
import { recordEconomyTransaction } from '../handlers/modules/wfrp-economy/ledger.js';

const BP_PER_TYPE: Record<string, number> = { b: 1, s: 12, g: 240 };

function moneyItems(actor: any): any[] {
  return actor.itemTags?.['money'] ?? [];
}

function totalBP(items: any[]): number {
  return items.reduce(
    (sum: number, m: any) => sum + Number(m.system?.quantity?.value ?? 0) * Number(m.system?.coinValue?.value ?? 0),
    0,
  );
}

export class MarketService {
  constructor(private readonly validateState: () => void) {}

  async addMoney(data: { actorId: string; amountString: string }): Promise<any> {
    this.validateState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    const market: any = (globalThis as any).game?.wfrp4e?.market;
    if (!market) throw new Error('ADD_MONEY_MARKET_UNAVAILABLE: game.wfrp4e.market is unavailable');

    // Strict numeric-prefix validation — blocks addMoneyTo's zero-all-coins trap BEFORE
    // any write. Mirrors addMoneyTo's own slicing (last char = type, rest = amount) but
    // rejects a falsy/zero/non-numeric prefix instead of silently zeroing every coin.
    const match = /^(\d+(?:\.\d+)?)([bsg])$/i.exec(data.amountString.trim());
    if (!match) {
      throw new Error(
        `ADD_MONEY_INVALID_AMOUNT: "${data.amountString}" is not a valid amount ` +
          `(expected e.g. "5g", "1.5g", "12b")`,
      );
    }
    const numericPart = Number(match[1]);
    const typeChar = match[2]!.toLowerCase();
    if (!Number.isFinite(numericPart) || numericPart <= 0) {
      throw new Error(
        `ADD_MONEY_INVALID_AMOUNT: "${data.amountString}" resolves to a non-positive amount — ` +
          `refusing to avoid MarketWFRP4e.addMoneyTo zeroing all coin items`,
      );
    }

    const TYPE_TO_LABEL: Record<string, string> = {
      b: (globalThis as any).game.i18n.localize('NAME.BP'),
      s: (globalThis as any).game.i18n.localize('NAME.SS'),
      g: (globalThis as any).game.i18n.localize('NAME.GC'),
    };
    const label = TYPE_TO_LABEL[typeChar]!;
    const hasCoinItem = moneyItems(actor).some((m: any) => m.name === label);
    if (!hasCoinItem) {
      throw new Error(`ADD_MONEY_NO_COIN_ITEM: ${actor.name} has no "${label}" money item to credit`);
    }

    // addMoneyTo is SYNC and returns a patch array — it does NOT persist.
    const patch: any[] = market.addMoneyTo(actor, data.amountString);
    const expectedQty: Record<string, number> = {};
    for (const p of patch) {
      const id = p._id ?? p.id;
      if (id) expectedQty[id] = Number(p.system?.quantity?.value ?? 0);
    }

    await actor.updateEmbeddedDocuments('Item', patch);

    // DP-16 diff-verify — re-read each patched coin item's persisted quantity.
    const drift: string[] = [];
    for (const [itemId, expected] of Object.entries(expectedQty)) {
      const actual = actor.items?.get(itemId)?.system?.quantity?.value;
      if (actual !== expected) {
        drift.push(`${itemId}: expected ${expected}, got ${actual}`);
      }
    }
    if (drift.length > 0) {
      throw new Error(`ADD_MONEY_NOT_PERSISTED: ${actor.name} coin update did not persist. Drift: ${drift.join('; ')}`);
    }

    notify.updated('item', label, {
      summary: `+${data.amountString} for ${actor.name}`,
      uuid: actor.uuid,
    });

    await recordEconomyTransaction({
      actorId: actor.id,
      amount: Math.round(numericPart * BP_PER_TYPE[typeChar]!),
      type: 'add-money',
      source: 'trade',
      description: `Market: +${data.amountString} added`,
    });

    return {
      actorId: actor.id,
      amountString: data.amountString,
      coins: patch.map((p: any) => ({ name: p.name, quantity: p.system?.quantity?.value })),
    };
  }

  async directPay(data: { actorId: string; amountString: string }): Promise<any> {
    this.validateState();
    const actor: any = (game as any).actors?.get(data.actorId);
    if (!actor) throw new Error(`Actor not found with ID: ${data.actorId}`);

    const market: any = (globalThis as any).game?.wfrp4e?.market;
    if (!market) throw new Error('DIRECT_PAY_MARKET_UNAVAILABLE: game.wfrp4e.market is unavailable');

    // Parse via the system's own parser (locale-safe) instead of hand-rolling the
    // abbreviation regex — mirrors the "read the template at call time" philosophy.
    const parsed = market.parseMoneyTransactionString(data.amountString);
    if (!parsed) {
      throw new Error(`DIRECT_PAY_INVALID_AMOUNT: "${data.amountString}" could not be parsed (expected e.g. "8gc6bp")`);
    }
    const requestedBP = parsed.gc * 240 + parsed.ss * 12 + parsed.bp;

    const before = moneyItems(actor);
    const availableBP = totalBP(before);

    // Pre-flight funds check — directPayCommand FAILS SILENTLY on insufficient funds
    // (no throw, no partial deduction). Reject BEFORE calling it.
    if (requestedBP > availableBP) {
      throw new Error(
        `DIRECT_PAY_INSUFFICIENT_FUNDS: ${actor.name} has ${availableBP} BP available, ` +
          `needs ${requestedBP} BP for "${data.amountString}"`,
      );
    }

    // BUG-064: directPayCommand's internal actor.updateEmbeddedDocuments call is
    // fire-and-forget (wfrp4e.js:755-760, not awaited) — pre-register an updateItem hook
    // wait + timeout before sampling the after-state (mirrors data-access.ts
    // handleApplyDamage's hook-wait+timeout pattern).
    let hookId: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const updateApplied = new Promise<void>((resolve) => {
      hookId = (Hooks as any).on('updateItem', (updatedItem: any) => {
        if (updatedItem?.parent?.id === actor.id) resolve();
      });
      timeoutHandle = setTimeout(resolve, 2000);
    });

    try {
      market.directPayCommand(data.amountString, actor, { suppressMessage: true });
      await updateApplied;
    } finally {
      if (hookId !== undefined) (Hooks as any).off('updateItem', hookId);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    }

    // DP-16 diff-verify — the total BP deduction must match the requested amount.
    const after = moneyItems(actor);
    const afterBP = totalBP(after);
    const actualDeduction = availableBP - afterBP;
    if (actualDeduction !== requestedBP) {
      throw new Error(
        `DIRECT_PAY_NOT_PERSISTED: ${actor.name} expected a ${requestedBP} BP deduction, ` +
          `observed ${actualDeduction} BP`,
      );
    }

    notify.updated('item', 'coin purse', {
      summary: `-${data.amountString} paid by ${actor.name}`,
      uuid: actor.uuid,
    });

    await recordEconomyTransaction({
      actorId: actor.id,
      amount: actualDeduction,
      type: 'pay',
      source: 'trade',
      description: `Market: paid ${data.amountString}`,
    });

    return {
      actorId: actor.id,
      amountString: data.amountString,
      deductedBP: actualDeduction,
      remainingBP: afterBP,
    };
  }
}
