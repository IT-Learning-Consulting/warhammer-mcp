// creature-index-status.test.ts — MCP Code-Quality Hardening v1, Phase 13 (R13.1).
//
// Two proofs for the documented-and-tested cache-invalidation requirement:
//   (a) getStatus() reports `stale:true` when a module activation adds an Actor pack the persisted
//       index has no fingerprint for (the lazy "pack-set changed" detection path of isIndexValid),
//       and `stale:false` when the live pack-set still matches the saved fingerprints.
//   (b) updateDocument on a CREATURE-type compendium actor now triggers invalidateIndex(). This is
//       the BUG-357 gate fix: extractEnhancedDataFromPack indexes npc/character/creature, but the
//       invalidation hooks previously gated on npc/character only — so editing a bestiary creature
//       left the index silently stale. This test FAILS against the pre-fix gate (encodes intent).
//
// Harness mirrors creature-index-lifecycle.test.ts (installHookRegistry) + the game.packs Map stub
// from setup.ts. The persisted-index file layer is mocked (loadPersistedIndex spy) so the test
// exercises getStatus → isIndexValid without touching FilePicker/fetch.

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import * as lifecycle from '../utils/lifecycle.js';
import { PersistentCreatureIndex } from '../services/creature-index.js';
import type { PersistentEnhancedIndex } from '../service-interfaces.js';

type HookHandler = (...args: any[]) => void;
interface HookRegistry {
  next: number;
  byId: Map<number, { event: string; fn: HookHandler }>;
}

function installHookRegistry(): HookRegistry {
  const reg: HookRegistry = { next: 1, byId: new Map() };
  (globalThis as any).Hooks = {
    on: (event: string, fn: HookHandler) => {
      const id = reg.next++;
      reg.byId.set(id, { event, fn });
      return id;
    },
    off: (_event: string, id: number) => reg.byId.delete(id),
    once: () => 0,
    call: () => {},
    callAll: () => {},
  };
  return reg;
}

/** Minimal Actor compendium pack mock — enough for the type filter + generatePackFingerprint. */
function makeActorPack(id: string, label: string, size = 1): any {
  return { metadata: { id, label, type: 'Actor' }, index: { size } };
}

function findHandler(reg: HookRegistry, event: string): HookHandler {
  const entry = [...reg.byId.values()].find((e) => e.event === event);
  if (!entry) throw new Error(`hook not registered: ${event}`);
  return entry.fn;
}

describe('creature-index status + invalidation (R13.1)', () => {
  let hooks: HookRegistry;

  beforeEach(() => {
    hooks = installHookRegistry();
    (globalThis as any).game.packs = new Map();
  });

  afterEach(() => {
    lifecycle.teardownAll();
    (globalThis as any).game.packs = new Map();
  });

  it('getStatus() reports stale:true when a module activation adds an unfingerprinted Actor pack', async () => {
    const idx = new PersistentCreatureIndex();

    // Persisted index built against pack-set A only. Build packA's saved fingerprint with the REAL
    // generatePackFingerprint so packA matches exactly — leaving the newly-activated packB as the
    // SOLE cause of staleness (isolates the pack-set-changed path, not a checksum drift).
    const packA = makeActorPack('world.actorsA', 'Bestiary A');
    const fpA = (idx as any).generatePackFingerprint(packA);
    const persisted: PersistentEnhancedIndex = {
      metadata: {
        version: (idx as any).INDEX_VERSION,
        timestamp: 1234,
        packFingerprints: new Map([['world.actorsA', fpA]]),
        totalCreatures: 5,
      },
      creatures: [],
    };
    (idx as any).loadPersistedIndex = vi.fn().mockResolvedValue(persisted);

    // Module activated → live pack-set now ALSO has packB (Actor pack), absent from saved fingerprints.
    (globalThis as any).game.packs = new Map([
      ['world.actorsA', packA],
      ['world.actorsB', makeActorPack('world.actorsB', 'Bestiary B')],
    ]);

    const status = await idx.getStatus();
    expect(status.stale).toBe(true);
    expect(status.builtAt).toBe(1234);
    expect(status.version).toBe((idx as any).INDEX_VERSION);
    expect(status.packCount).toBe(1); // saved fingerprint count, not live pack count
    expect(status.totalCreatures).toBe(5);
  });

  it('getStatus() reports stale:false when the live pack-set still matches the saved fingerprints', async () => {
    const idx = new PersistentCreatureIndex();
    const packA = makeActorPack('world.actorsA', 'Bestiary A');
    const fpA = (idx as any).generatePackFingerprint(packA);
    const persisted: PersistentEnhancedIndex = {
      metadata: {
        version: (idx as any).INDEX_VERSION,
        timestamp: 9999,
        packFingerprints: new Map([['world.actorsA', fpA]]),
        totalCreatures: 3,
      },
      creatures: [],
    };
    (idx as any).loadPersistedIndex = vi.fn().mockResolvedValue(persisted);
    (globalThis as any).game.packs = new Map([['world.actorsA', packA]]);

    const status = await idx.getStatus();
    expect(status.stale).toBe(false);
    expect(status.builtAt).toBe(9999);
  });

  it('getStatus() reports stale:true with builtAt:null when no index file is built', async () => {
    const idx = new PersistentCreatureIndex();
    (idx as any).loadPersistedIndex = vi.fn().mockResolvedValue(null);

    const status = await idx.getStatus();
    expect(status.stale).toBe(true);
    expect(status.builtAt).toBeNull();
    expect(status.packCount).toBe(0);
    expect(status.totalCreatures).toBe(0);
  });

  // BUG-357 gate fix — this assertion FAILS against the pre-R13.1 gate (npc||character only).
  it('updateDocument on a creature-type compendium actor triggers invalidateIndex', () => {
    const idx = new PersistentCreatureIndex();
    const invalidateSpy = vi.fn();
    (idx as any).invalidateIndex = invalidateSpy; // shadow; the hook calls this.invalidateIndex()

    findHandler(hooks, 'updateDocument')({ pack: 'world.bestiary', type: 'creature' });

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it('createDocument/deleteDocument also invalidate on npc + character (regression guard)', () => {
    const idx = new PersistentCreatureIndex();
    const invalidateSpy = vi.fn();
    (idx as any).invalidateIndex = invalidateSpy;

    findHandler(hooks, 'createDocument')({ pack: 'world.x', type: 'npc' });
    findHandler(hooks, 'deleteDocument')({ pack: 'world.x', type: 'character' });

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });

  it('updateDocument ignores non-indexed types and unpacked docs (no false invalidation)', () => {
    const idx = new PersistentCreatureIndex();
    const invalidateSpy = vi.fn();
    (idx as any).invalidateIndex = invalidateSpy;

    const updateHandler = findHandler(hooks, 'updateDocument');
    updateHandler({ pack: 'world.x', type: 'weapon' }); // wrong type
    updateHandler({ type: 'creature' }); // no pack (world actor, not compendium)

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
