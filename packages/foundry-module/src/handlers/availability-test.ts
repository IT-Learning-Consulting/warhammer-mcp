// wfrp_layer_expansion_v1 Phase 6 (P-10) — availability-test handler.
//
// Computes WFRP4e market availability from a PRE-ROLLED d100 and posts a GM-visible
// market-result ChatMessage (the verifiable write per Q&A #1). Mirrors
// MarketWFRP4e.testForAvailability (wfrp4e.js:556) + availabilityTable (:21762) EXCEPT:
//   (a) HC2 — NEVER rolls. The d100 (`rolledTotal`) and dice-stock total (`stockRolled`)
//       are supplied by the sheet/GM; this handler instantiates no Roll object at all.
//   (b) GM feedback (audit) routes through notify.created('chatMessage', ...). The
//       market-result card itself is a genuine GM-facing content message that notify's
//       GM-only-whisper audit channel cannot carry (it needs a market alias + the
//       formatted availability table), so it is posted via ChatMessage.create directly
//       — this handler's basename is on the notify-migration-guard CHAT_ALLOWLIST,
//       exactly the roll-request / simple-quest precedent.
//
// DP-16: the posted message is re-read from game.messages and verified to exist before
// returning (AVAILABILITY_TEST_NOT_PERSISTED on failure).

import {
  ErrorTokens,
  AvailabilityTestInput,
  type AvailabilityTestInputType,
  type AvailabilityTestResponse,
  type AvailabilitySettlement,
  type AvailabilityRarity,
} from '@foundry-mcp/shared';
import { notify } from '../notify.js';
import { validateGMAccess, type Envelope } from '../utils/flatWorldCRUDFactory.js';
import { wrappedWrite } from '../transaction-manager.js';

const DENY = (op: string) => `Access denied: ${op} requires GM`;

// Friendly enum → WFRP4e availabilityTable localization keys (wfrp4e.js:21762).
const SETTLEMENT_KEY: Record<AvailabilitySettlement, string> = {
  village: 'MARKET.Village',
  town: 'MARKET.Town',
  city: 'MARKET.City',
};
const RARITY_KEY: Record<AvailabilityRarity, string> = {
  common: 'WFRP4E.Availability.Common',
  scarce: 'WFRP4E.Availability.Scarce',
  rare: 'WFRP4E.Availability.Rare',
  exotic: 'WFRP4E.Availability.Exotic',
};

interface AvailabilityLookup {
  test: number;
  stock: string;
}

// ── Compute (pure; unit-tested via the mcp-server vitest mirror) ───────────────

/**
 * Resolve {targetNumber, isAvailable, quantity} from a config lookup + pre-rolled d100.
 * Throws AVAILABILITY_TEST_STOCK_ROLL_REQUIRED when stock is a dice formula and no
 * stockRolled was supplied. NEVER rolls.
 */
export function computeAvailability(
  lookup: AvailabilityLookup,
  rolledTotal: number,
  stockRolled?: number,
): { targetNumber: number; isAvailable: boolean; quantity: number | string } {
  const targetNumber = Number(lookup.test) || 0;
  // Exotic (test:0) short-circuits — never available, regardless of the roll.
  const isAvailable = targetNumber > 0 && rolledTotal <= targetNumber;

  if (!isAvailable) {
    return { targetNumber, isAvailable: false, quantity: 0 };
  }

  const stock = String(lookup.stock ?? '0');
  // City "∞" passthrough.
  if (stock === '∞') {
    return { targetNumber, isAvailable: true, quantity: '∞' };
  }
  // Dice-formula stock (e.g. "2d10") requires a pre-rolled quantity — the handler never rolls.
  if (stock.includes('d')) {
    if (stockRolled === undefined) {
      throw new Error(
        `${ErrorTokens.AVAILABILITY_TEST_STOCK_ROLL_REQUIRED}: stock "${stock}" is a dice formula — supply stockRolled (a pre-rolled quantity). This tool never rolls (HC2).`,
      );
    }
    return { targetNumber, isAvailable: true, quantity: stockRolled };
  }
  // Static numeric stock (e.g. "2").
  const numeric = Number(stock);
  return { targetNumber, isAvailable: true, quantity: Number.isFinite(numeric) ? numeric : 0 };
}

// ── Chat-card HTML (mirrors MarketWFRP4e.formatTestForChat, wfrp4e.js:614) ─────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMarketCard(
  settlementLabel: string,
  rarityLabel: string,
  isAvailable: boolean,
  quantity: number | string,
  rolledTotal: number,
  itemName?: string,
): string {
  const g = game as any;
  const L = (k: string, fallback: string): string => {
    try {
      const v = g.i18n?.localize?.(k);
      return v && v !== k ? v : fallback;
    } catch {
      return fallback;
    }
  };
  const yes = L('Yes', 'Yes');
  const no = L('No', 'No');
  const header = `<h3><b>${L('MARKET.AvailabilityTest', 'Availability Test')}</b></h3>`;
  const flavor = itemName ? `<p><i>${escapeHtml(itemName)}</i></p>` : '';
  return (
    header +
    flavor +
    `<b>${L('MARKET.SettlementSize', 'Settlement Size:')}</b> ${escapeHtml(settlementLabel)}<br>` +
    `<b>${L('MARKET.Rarity', 'Rarity:')}</b> ${escapeHtml(rarityLabel)}<br><br>` +
    `<b>${L('MARKET.InStock', 'In Stock:')}</b> ${isAvailable ? yes : no}<br>` +
    `<b>${L('MARKET.QuantityAvailable', 'Quantity Available:')}</b> ${escapeHtml(String(quantity))}<br>` +
    `<b>${L('Roll', 'Roll')}:</b> ${rolledTotal}`
  );
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function dispatchAvailabilityTest(
  data: unknown,
): Promise<Envelope<AvailabilityTestResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('availabilityTest') };

  let input: AvailabilityTestInputType;
  try {
    input = AvailabilityTestInput.strict().parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  const config = (game as any).wfrp4e?.config?.availabilityTable;
  if (!config) {
    throw new Error(
      'AVAILABILITY_TEST_CONFIG_NOT_FOUND: game.wfrp4e.config.availabilityTable is unavailable',
    );
  }

  const settlementKey = SETTLEMENT_KEY[input.settlement];
  const rarityKey = RARITY_KEY[input.rarity];

  const settlementRow = config[settlementKey];
  if (!settlementRow) {
    throw new Error(
      `${ErrorTokens.AVAILABILITY_TEST_INVALID_SETTLEMENT}: "${input.settlement}" (${settlementKey}) not found in availabilityTable`,
    );
  }
  const lookup: AvailabilityLookup | undefined = settlementRow[rarityKey];
  if (!lookup) {
    throw new Error(
      `${ErrorTokens.AVAILABILITY_TEST_INVALID_RARITY}: "${input.rarity}" (${rarityKey}) not found for settlement "${input.settlement}"`,
    );
  }

  // Pure compute — throws AVAILABILITY_TEST_STOCK_ROLL_REQUIRED on dice-stock w/o stockRolled.
  const { targetNumber, isAvailable, quantity } = computeAvailability(
    lookup,
    input.rolledTotal,
    input.stockRolled,
  );

  // Localized labels for the card (fall back to the friendly enum capitalized).
  const g = game as any;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const settlementLabel = (() => {
    const v = g.i18n?.localize?.(settlementKey);
    return v && v !== settlementKey ? v : cap(input.settlement);
  })();
  const rarityLabel = (() => {
    const v = g.i18n?.localize?.(rarityKey);
    return v && v !== rarityKey ? v : cap(input.rarity);
  })();

  const content = buildMarketCard(
    settlementLabel,
    rarityLabel,
    isAvailable,
    quantity,
    input.rolledTotal,
    input.itemName,
  );

  // Post the GM market-result card and DP-16-verify it landed. The card is genuine
  // GM-facing content (not a notify audit toast) — posted via ChatMessage.create
  // directly; this basename is on the notify-migration-guard CHAT_ALLOWLIST.
  const messageId = await wrappedWrite('availability-test', async () => {
    const ChatMessage: any = (globalThis as any).ChatMessage;
    if (!ChatMessage?.create) {
      throw new Error('AVAILABILITY_TEST_CHAT_UNAVAILABLE: ChatMessage.create is unavailable');
    }
    const created = await ChatMessage.create({
      content,
      style: (globalThis as any).CONST?.CHAT_MESSAGE_STYLES?.OTHER ?? 0,
      flavor: input.itemName ?? '',
      speaker: { alias: 'Market Availability' },
    });
    const id = created?.id;
    if (!id) {
      throw new Error(
        `${ErrorTokens.AVAILABILITY_TEST_NOT_PERSISTED}: ChatMessage.create returned no id`,
      );
    }
    // DP-16 post-verify: the message must be retrievable from the collection.
    const fresh = (game as any).messages?.get?.(id);
    if (!fresh) {
      throw new Error(
        `${ErrorTokens.AVAILABILITY_TEST_NOT_PERSISTED}: message "${id}" not found in game.messages after create`,
      );
    }
    return id as string;
  });

  notify.created('chatMessage', `Market: ${input.itemName ?? cap(input.rarity)} in ${cap(input.settlement)}`, {
    summary: `availability ${isAvailable ? 'AVAILABLE' : 'unavailable'} (rolled ${input.rolledTotal} vs ${targetNumber}) via warhammer-mcp.availability-test`,
  });

  return {
    success: true,
    data: {
      settlement: input.settlement,
      rarity: input.rarity,
      rolledTotal: input.rolledTotal,
      targetNumber,
      isAvailable,
      quantity,
      messageId,
    },
  };
}
