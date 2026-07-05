// BUG-439 regression: unknown-action calls must yield a VALID MCP error envelope.
//
// Root cause (2026-07-05 sprint): umbrella execute() switches had no `default:` — an
// unknown action fell through, execute() resolved `undefined`, and backend.ts built
// `text: JSON.stringify(undefined)` = undefined, so content[0] had NO `text` and the
// client rejected the whole result as malformed ("Zod-rejection" in the original
// ledger entry was a mis-attribution; no runtime Zod validation runs on this path).
//
// Two-layer fix, two-layer test:
//   1. Every execute() switch dispatching on `.action` now carries a `default:` throw
//      whose message names the valid actions — the throw flows through backend.ts's
//      dispatch catch, which already builds a valid `isError` envelope (scrubError).
//      Tested here at the tool layer via getRegistration() → handler (same harness as
//      output-schema-conformance.test.ts): the handler must REJECT, and the message
//      must name the offending action AND the valid action values (compendium.xml
//      pair #19 asserts the latter live).
//   2. backend.ts additionally guards `result === undefined` (belt-and-braces for any
//      future switch that slips the sweep). That builder is inline in startBackend()
//      (not exportable), so it is NOT unit-tested here — the guard's contract is
//      covered live by the compendium#19 eval pair; this file covers the tool layer.

import { describe, it, expect } from 'vitest';
import { makeToolDeps } from './test-utils.js';
import { CompendiumUmbrellaTools } from '../tools/compendium-umbrella.js';
import { CardsTool } from '../tools/cards.js';

describe('BUG-439 — unknown-action refusal shape', () => {
  it('compendium: unknown action rejects with a message naming the valid actions', async () => {
    const tool = new CompendiumUmbrellaTools(makeToolDeps({}));
    const reg = tool.getRegistration().find((r) => r.name === 'compendium')!;
    // delete-pack is deliberately NOT a compendium action (HC3: no pack deletes).
    await expect(reg.handler({ action: 'delete-pack', packId: 'world.x', confirm: true } as any))
      .rejects.toThrow(/Unknown action "delete-pack" — valid actions: .*create-pack.*read-pack/);
  });

  it('cards: unknown action rejects with a message naming the valid actions', async () => {
    const tool = new CardsTool(makeToolDeps({}));
    const reg = tool.getRegistration().find((r) => r.name === 'cards')!;
    await expect(reg.handler({ action: 'burn-deck' } as any))
      .rejects.toThrow(/Unknown action "burn-deck" — valid actions: .*create-stack/);
  });

  it('the thrown message is a non-empty string (envelope text can never be undefined)', async () => {
    const tool = new CompendiumUmbrellaTools(makeToolDeps({}));
    const reg = tool.getRegistration().find((r) => r.name === 'compendium')!;
    const err: unknown = await reg.handler({ action: 'nope' } as any).then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(Error);
    const text = `Error: ${(err as Error).message}`; // what backend.ts:326 renders
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan('Error: '.length);
  });
});
