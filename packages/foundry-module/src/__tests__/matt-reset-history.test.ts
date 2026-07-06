// Bugfix sprint 444-459 — BUG-452: reset-history must use Foundry `-=` deletion markers.
//
// WHY (Rule 9): Foundry Document.update() MERGES plain objects — `history: {}` contributes
// zero keys (no-op on non-empty history) and a filtered copy re-asserts remaining keys
// without deleting the removed one. Upstream MATT's own resetHistory uses the `-=`
// deletion-marker syntax (monks-active-tiles.js:5263-5276); the handler now mirrors it.
// These specs assert the UPDATE PAYLOAD SHAPE (the deletion markers), with a tile mock whose
// update() implements Foundry's merge + `-=` semantics — so a regression back to plain
// object assignment fails the all-tokens case loudly (merge keeps the entries).
//
// Mock-shape citations (PF-003):
//   - tile._source.flags['monks-active-tiles'].history keyed by tokenId — readMattFlags
//     (matt-helpers.ts:51-53, F08-safe _source read) + live get-trigger-tile captures
//     (BUG-452 probe evidence, skill-audit sweep 2026-07-05).
//   - `-=` semantics — Foundry core Document.update deletion-marker contract
//     (foundry_docs; upstream usage monks-active-tiles.js:5267/:5271).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleResetHistory } from '../handlers/modules/monks-active-tiles/matt-sequence.js';

const MATT = 'monks-active-tiles';

/** Tile mock whose update() implements Foundry merge + `-=` deletion semantics. */
function makeTile(history: Record<string, unknown>) {
  const source: any = { flags: { [MATT]: { name: 'Trap Tile', history: { ...history } } } };
  const tile: any = {
    id: 'tile1',
    uuid: 'Scene.s1.Tile.tile1',
    _source: source,
    flags: source.flags,
    parent: { id: 's1' },
    update: vi.fn(async (payload: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(payload)) {
        const parts = key.split('.');
        let node: any = tile._source;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i]!;
          if (p.startsWith('-=')) throw new Error('deletion marker must be the LAST segment');
          node[p] = node[p] ?? {};
          node = node[p];
        }
        const last = parts[parts.length - 1]!;
        if (last.startsWith('-=')) {
          delete node[last.slice(2)]; // Foundry `-=` deletion semantics
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          node[last] = { ...(node[last] ?? {}), ...(value as object) }; // Foundry MERGE semantics
        } else {
          node[last] = value;
        }
      }
    }),
  };
  return tile;
}

describe('BUG-452: handleResetHistory deletion markers', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('all-tokens reset deletes the whole history key via `-=history` (merge-proof)', async () => {
    const tile = makeTile({ tok1: { count: 1 }, tok2: { count: 3 } });
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(tile);

    const result = await handleResetHistory({ action: 'reset-history', tileUuid: tile.uuid } as any);

    expect(result.success).toBe(true);
    expect((result as any).data.cleared).toBe('all tokens');
    // The payload must be the deletion marker — a plain `history: {}` write merges zero
    // keys and leaves tok1/tok2 intact (the exact BUG-452 failure).
    expect(tile.update).toHaveBeenCalledWith({ [`flags.${MATT}.-=history`]: null });
    expect(tile._source.flags[MATT].history).toBeUndefined();
  });

  it('per-token reset deletes only that key via `history.-=<tokenId>`', async () => {
    const tile = makeTile({ tok1: { count: 1 }, tok2: { count: 3 } });
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(tile);

    const result = await handleResetHistory({ action: 'reset-history', tileUuid: tile.uuid, tokenId: 'tok1' } as any);

    expect(result.success).toBe(true);
    expect((result as any).data.cleared).toBe('token tok1');
    expect(tile.update).toHaveBeenCalledWith({ [`flags.${MATT}.history.-=tok1`]: null });
    expect(tile._source.flags[MATT].history).toEqual({ tok2: { count: 3 } });
  });

  it('reset on already-empty history still succeeds', async () => {
    const tile = makeTile({});
    (globalThis as any).fromUuidSync = vi.fn().mockReturnValue(tile);

    const result = await handleResetHistory({ action: 'reset-history', tileUuid: tile.uuid } as any);

    expect(result.success).toBe(true);
  });
});
