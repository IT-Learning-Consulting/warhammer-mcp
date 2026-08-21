// BUG-788 — get-contents had no bounded recovery path for large piles or logs: it always
// returned every compact item, all currency objects, and full flagData; includeLog:true then
// duplicated the flag log into a second top-level field; the text formatter only truncated its
// own item LINES (not the underlying structured data), so a large pile/log eventually tripped
// the global 64,000-char RESPONSE_TOO_LARGE guard with no smaller page to retry.
//
// Fix: items and the (optional) audit log are paginated INDEPENDENTLY via boundList() (BUG-490's
// shared bounded-response primitive — reused here, not re-implemented), defaulting to a bounded
// page (50, capped 500) instead of the whole array; total/truncated/next-offset metadata is
// returned so a caller can page down; the embedded `log` key is stripped from the flagData
// projection unconditionally so it is never duplicated with the top-level (paginated) `log`.
//
// This file directly unit-tests handleGetContents (container.ts) against a real item-piles API
// double built via installItemPilesGame/baseApi (verify-harness.ts, Deliverable-0) — never
// re-implementing the pagination math, only asserting the handler's contract.

import { describe, it, expect, afterEach } from 'vitest';
import { handleGetContents } from '../container.js';
import { installItemPilesGame, baseApi } from './verify-harness.js';

function makeItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `item${i}`,
    _id: `item${i}`,
    name: `Item ${i}`,
    type: 'trapping',
    uuid: `Actor.pile.Item.item${i}`,
    system: { quantity: { value: 1 } },
  }));
}

function makeLog(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `log${i}`, text: `entry ${i}` }));
}

let teardown: (() => void) | undefined;

afterEach(() => {
  teardown?.();
  teardown = undefined;
});

describe('BUG-788 — handleGetContents pagination', () => {
  it('defaults to a bounded page of items (never the whole pile) and reports total/truncated/next-offset', async () => {
    const items = makeItems(120);
    const api = baseApi({
      getActorFlagData: () => ({ type: 'container' }),
      getActorItems: () => items,
      getActorCurrencies: () => ({}),
      isValidItemPile: () => true,
      isItemPileContainer: () => true,
      isItemPileMerchant: () => false,
      isItemPileVault: () => false,
      isItemPileLocked: () => false,
      isItemPileClosed: () => false,
      isItemPileEmpty: () => false,
    });
    teardown = installItemPilesGame(api);

    const result: any = await handleGetContents({ action: 'get-contents', actorUuid: 'Actor.pile' } as any);

    expect(result.success).toBe(true);
    expect(result.data.itemCount).toBe(120);          // total on the pile — unchanged semantic
    expect(result.data.items).toHaveLength(50);        // default bounded page (boundList DEFAULT_LIST_LIMIT)
    expect(result.data.itemsOffset).toBe(0);
    expect(result.data.itemsLimit).toBe(50);
    expect(result.data.itemsTruncated).toBe(true);
    expect(result.data.itemsNextOffset).toBe(50);
  });

  it('pages items down via limit/offset until itemsTruncated is false and itemsNextOffset is null', async () => {
    const items = makeItems(120);
    const api = baseApi({
      getActorFlagData: () => ({ type: 'container' }),
      getActorItems: () => items,
      getActorCurrencies: () => ({}),
      isValidItemPile: () => true,
      isItemPileContainer: () => true,
      isItemPileMerchant: () => false,
      isItemPileVault: () => false,
      isItemPileLocked: () => false,
      isItemPileClosed: () => false,
      isItemPileEmpty: () => false,
    });
    teardown = installItemPilesGame(api);

    const page1: any = await handleGetContents({ action: 'get-contents', actorUuid: 'Actor.pile', limit: 50, offset: 0 } as any);
    const page2: any = await handleGetContents({ action: 'get-contents', actorUuid: 'Actor.pile', limit: 50, offset: 50 } as any);
    const page3: any = await handleGetContents({ action: 'get-contents', actorUuid: 'Actor.pile', limit: 50, offset: 100 } as any);

    expect(page1.data.items.map((i: any) => i.id)).toEqual(items.slice(0, 50).map((i) => i.id));
    expect(page2.data.items.map((i: any) => i.id)).toEqual(items.slice(50, 100).map((i) => i.id));
    expect(page2.data.itemsTruncated).toBe(true);
    expect(page2.data.itemsNextOffset).toBe(100);
    expect(page3.data.items).toHaveLength(20);
    expect(page3.data.itemsTruncated).toBe(false);
    expect(page3.data.itemsNextOffset).toBeNull();
  });

  it('strips the embedded log from flagData unconditionally, even when includeLog is not requested', async () => {
    const api = baseApi({
      getActorFlagData: () => ({ type: 'vault', enabled: true, log: makeLog(200) }),
      getActorItems: () => [],
      getActorCurrencies: () => ({}),
      isValidItemPile: () => true,
      isItemPileContainer: () => false,
      isItemPileMerchant: () => false,
      isItemPileVault: () => true,
      isItemPileLocked: () => false,
      isItemPileClosed: () => false,
      isItemPileEmpty: () => true,
    });
    teardown = installItemPilesGame(api);

    const result: any = await handleGetContents({ action: 'get-contents', actorUuid: 'Actor.vault' } as any);

    expect(result.success).toBe(true);
    expect(result.data.flagData).toEqual({ type: 'vault', enabled: true }); // no `log` key
    expect(result.data.log).toBeUndefined();  // includeLog not requested — no top-level log either
  });

  it('paginates the audit log independently of items, and never duplicates it inside flagData (includeLog:true)', async () => {
    const items = makeItems(5);
    const log = makeLog(130);
    const api = baseApi({
      getActorFlagData: () => ({ type: 'merchant', enabled: true, log }),
      getActorItems: () => items,
      getActorCurrencies: () => ({ gc: 3 }),
      isValidItemPile: () => true,
      isItemPileContainer: () => false,
      isItemPileMerchant: () => true,
      isItemPileVault: () => false,
      isItemPileLocked: () => false,
      isItemPileClosed: () => false,
      isItemPileEmpty: () => false,
    });
    teardown = installItemPilesGame(api);

    const result: any = await handleGetContents({
      action: 'get-contents',
      actorUuid: 'Actor.merchant',
      includeLog: true,
      logLimit: 25,
      logOffset: 50,
    } as any);

    expect(result.success).toBe(true);
    // flagData carries no `log` key — the ONLY copy of the log is the paginated top-level field.
    expect(result.data.flagData).toEqual({ type: 'merchant', enabled: true });
    expect(result.data.log).toHaveLength(25);
    expect(result.data.log.map((l: any) => l.id)).toEqual(log.slice(50, 75).map((l) => l.id));
    expect(result.data.logCount).toBe(130);
    expect(result.data.logOffset).toBe(50);
    expect(result.data.logLimit).toBe(25);
    expect(result.data.logTruncated).toBe(true);
    expect(result.data.logNextOffset).toBe(75);
    // items pagination is completely independent of the log pagination requested above.
    expect(result.data.items).toHaveLength(5);
    expect(result.data.itemsTruncated).toBe(false);
  });

  it('a large pile (500+ items, 500+ log entries) stays far under the 64,000-char RESPONSE_TOO_LARGE budget on default paging', async () => {
    const items = makeItems(2000);
    const log = makeLog(2000);
    const api = baseApi({
      getActorFlagData: () => ({ type: 'vault', enabled: true, log }),
      getActorItems: () => items,
      getActorCurrencies: () => ({ gc: 100, ss: 5, bp: 3 }),
      isValidItemPile: () => true,
      isItemPileContainer: () => false,
      isItemPileMerchant: () => false,
      isItemPileVault: () => true,
      isItemPileLocked: () => false,
      isItemPileClosed: () => false,
      isItemPileEmpty: () => false,
    });
    teardown = installItemPilesGame(api);

    const result: any = await handleGetContents({
      action: 'get-contents',
      actorUuid: 'Actor.vault',
      includeLog: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.itemCount).toBe(2000);
    expect(result.data.logCount).toBe(2000);
    const size = JSON.stringify(result).length;
    expect(size).toBeLessThan(64_000); // the exact regression this bug reported (RESPONSE_TOO_LARGE with no smaller page)
  });
});
