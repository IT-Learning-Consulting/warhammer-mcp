// Deliverable-0 (bug-fix-campaign-123 Phase 3, plan D2/D9) — shared regression harness for the
// item-piles verify-after-write primitives: totalQuantity correctness, currency getAll
// semantics, and settlePoll bounded-retry. Generalizes the mockGlobals()/family-construction/
// before-after-quantity boilerplate duplicated across every sibling *.test.ts in this directory
// (BUG-769/770/775/776/780's own regression fixtures) so BUG-771/772/777/779/781/784/786/788's
// forthcoming fixtures extend it instead of hand-rolling verify-after-write logic again — the
// explicit anti-pattern the plan calls out: "narrow verify-after-write patches that don't
// generalize."
//
// This module is test infrastructure only. It imports and asserts against the REAL
// totalQuantity/settlePoll primitives — it never re-implements their logic, and it does not
// touch container.ts/flow.ts/merchant.ts (those are consumers, fixed individually per-bug).

import { expect } from 'vitest';
import { totalQuantity, type ItemFamily } from '../verify-quantity.js';
import { settlePoll } from '../../_shared/settle-poll.js';

export type { ItemFamily };

/** Build an ItemFamily from plain id/name arrays (test-authoring convenience over the raw Set shape). */
export function family(ids?: string[], names?: string[]): ItemFamily {
  const f: ItemFamily = {};
  if (ids && ids.length > 0) f.ids = new Set(ids);
  if (names && names.length > 0) f.names = new Set(names);
  return f;
}

/**
 * Installs `globalThis.game.itempiles.API` plus the isGM/active-user shape every handler's
 * gmRequired()/activeGmRequired() guard reads, and returns a teardown function. Mirrors the
 * mockGlobals()-then-`delete (globalThis as any).game`-in-afterEach boilerplate duplicated in
 * remove-currency-getall / trade-items-noop / trade-items-service / split-loot-remainder.
 */
export function installItemPilesGame(api: Record<string, any>, opts: { isGM?: boolean } = {}): () => void {
  const isGM = opts.isGM ?? true;
  (globalThis as any).game = {
    user: { isGM },
    users: [{ isGM, active: true }],
    itempiles: { API: api },
  };
  return () => {
    delete (globalThis as any).game;
  };
}

/**
 * A minimal item-piles API double. Defaults getActorItems to a currency-inclusive read (matching
 * totalQuantity's own required `{ getItemCurrencies: true }` call, BUG-775) and getActorCurrencies
 * to a getAll-inclusive read (matching BUG-769's required `{ getAll: true }` call) — both
 * overridable per test so a fixture can assert a HANDLER failing to request the right options
 * (the harness's own defaults are correct; a broken handler that fails to pass them through is
 * still tested by asserting on `overrides.getActorItems`/`overrides.getActorCurrencies` directly).
 */
export function baseApi(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    getActorItems: (_uuid: string, _opts?: any) => [],
    getActorCurrencies: (_uuid: string, _opts?: any) => [],
    ...overrides,
  };
}

/** Build a zero-balance currency entry (BUG-769 shape: a denomination the actor doesn't hold yet, no `id`). */
export function zeroBalanceCurrency(abbreviation: string, exchangeRate: number): Record<string, any> {
  return { id: undefined, abbreviation, quantity: 0, exchangeRate, type: 'item' };
}

/**
 * Runs `mutate`, then asserts totalQuantity(API, actorUuid, fam) before/after via `assertFn` —
 * the generalized shape of the before/after quantity check every add/remove/trade verify in
 * flow.ts + merchant.ts performs (DP-16). Uses the REAL totalQuantity primitive throughout.
 */
export async function expectQuantityChange(
  API: Record<string, any>,
  actorUuid: string,
  fam: ItemFamily | undefined,
  mutate: () => void | Promise<void>,
  assertFn: (before: number, after: number) => void,
): Promise<{ before: number; after: number }> {
  const before = totalQuantity(API, actorUuid, fam);
  await mutate();
  const after = totalQuantity(API, actorUuid, fam);
  assertFn(before, after);
  return { before, after };
}

/** Convenience wrapper: asserts totalQuantity strictly increases across `mutate` (the additive-path shape). */
export async function expectQuantityIncreases(
  API: Record<string, any>,
  actorUuid: string,
  fam: ItemFamily | undefined,
  mutate: () => void | Promise<void>,
): Promise<{ before: number; after: number }> {
  return expectQuantityChange(API, actorUuid, fam, mutate, (before, after) => {
    expect(after).toBeGreaterThan(before);
  });
}

/** Convenience wrapper: asserts totalQuantity strictly decreases across `mutate` (the subtractive-path shape). */
export async function expectQuantityDecreases(
  API: Record<string, any>,
  actorUuid: string,
  fam: ItemFamily | undefined,
  mutate: () => void | Promise<void>,
): Promise<{ before: number; after: number }> {
  return expectQuantityChange(API, actorUuid, fam, mutate, (before, after) => {
    expect(after).toBeLessThan(before);
  });
}

/** Asserts every recorded getActorCurrencies call requested `{ getAll: true }` (BUG-769 regression guard shape). */
export function expectAllGetAllCurrencyCalls(calls: Array<Record<string, any> | undefined>): void {
  expect(calls.length).toBeGreaterThan(0);
  for (const opts of calls) {
    expect(opts).toEqual({ getAll: true });
  }
}

/**
 * Builds a boolean predicate that returns false for the first `settleAfterCalls - 1` probes and
 * true from the `settleAfterCalls`-th probe onward, plus the ordered list of probe indices —
 * generalizes the "write settles on a later poll, not the first read" scenario every
 * settlePoll-boolean-form caller in flow.ts/merchant.ts depends on for its retry budget.
 */
export function mockSettlingPredicate(settleAfterCalls: number): { predicate: () => boolean; calls: number[] } {
  const calls: number[] = [];
  let n = 0;
  const predicate = () => {
    n += 1;
    calls.push(n);
    return n >= settleAfterCalls;
  };
  return { predicate, calls };
}

/**
 * Wraps the REAL boolean-predicate settlePoll form with test-friendly fast defaults (short
 * timeout/step) so a fixture asserting bounded-retry behavior (settles-late / never-settles /
 * immediate) does not have to wait out production's 2000ms/200ms real-world defaults — the
 * `settleAfterCalls` semantics stay identical to the production predicate form, only the polling
 * cadence is compressed for test speed.
 */
export async function fastSettlePoll(
  predicate: () => boolean,
  timeoutMs = 500,
  stepMs = 5,
): Promise<boolean> {
  return settlePoll(predicate, timeoutMs, stepMs);
}
