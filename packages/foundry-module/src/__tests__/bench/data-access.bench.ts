// data-access.bench.ts — in-process bench for FoundryDataAccess hot paths.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.8.1 (HC12 / NF1).
//
// Benchable in-process targets (memo §HC12 bench, 2.5):
//   - passesEnhancedCriteria   (~ns, pure, no Foundry globals)
//   - getCharacterInfo          (~µs, mock game.actors via setup.ts stubs)
//   - searchCompendium basic    (~µs, mocked pack I/O; happy-path: index absent → empty packs → returns [])
//
// setup.ts is auto-loaded via vitest.config.ts, so game/CONFIG/Hooks/foundry.utils are already stubbed.
// Each bench validates.FoundryState is patched to a no-op so we skip the live-game guard.
//
// NOTE: bench() suites do NOT mix with describe/it in vitest 3.x — keep this file bench-only.

import { bench, beforeEach } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';
// Phase 4 (R3.3): the search service left FoundryDataAccess — bench it directly.
import { CompendiumSearchService } from '../../services/index.js';
import { MODULE_ID } from '../../constants.js';

// ---------------------------------------------------------------------------
// Shared fixture helpers
// ---------------------------------------------------------------------------

function makeDA(): FoundryDataAccess {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

function makeActor(id = 'actor-bench00000', name = 'Bench Actor') {
  return {
    id,
    name,
    type: 'npc',
    system: {
      characteristics: { ws: { value: 40, advances: 0 } },
      status: { wounds: { value: 10, max: 10 }, advantage: { value: 0, max: 10 } },
      details: { species: { value: 'Human' } },
    },
    items: [],
    effects: [],
  };
}

// ---------------------------------------------------------------------------
// Bench 1: passesEnhancedCriteria — pure boolean logic, ~ns scale
// ---------------------------------------------------------------------------
// We access the private method via cast to reach the pure comparator without
// calling any async path.  The method reads no globals and performs only
// numeric/string comparisons — the ideal in-process bench target.

const searchForCriteria = new CompendiumSearchService(MODULE_ID, { getEnhancedIndex: async () => [] });
const sampleCreature = {
  id: 'c1',
  name: 'Rat',
  type: 'creature',
  pack: 'core',
  packLabel: 'Core',
  challengeRating: 4,
  creatureType: 'beast',
  size: 'small',
  wounds: 8,
  toughness: 3,
  hasSpells: false,
  hasSpecialAbilities: false,
};

// Phase 4 (R3.3): passesEnhancedCriteria lives on CompendiumSearchService; benched on the service directly
// (it left FoundryDataAccess in the Contract step). Same method, same inputs benched.
bench('passesEnhancedCriteria — no filters (pass-through)', () => {
  (searchForCriteria as any).passesEnhancedCriteria(sampleCreature, {});
});

bench('passesEnhancedCriteria — numeric threatLevel match', () => {
  (searchForCriteria as any).passesEnhancedCriteria(sampleCreature, { threatLevel: 4 });
});

bench('passesEnhancedCriteria — range threatLevel + creatureType + size', () => {
  (searchForCriteria as any).passesEnhancedCriteria(sampleCreature, {
    threatLevel: { min: 1, max: 10 },
    creatureType: 'beast',
    size: 'small',
  });
});

bench('passesEnhancedCriteria — all filters (early-exit on first mismatch)', () => {
  (searchForCriteria as any).passesEnhancedCriteria(sampleCreature, {
    threatLevel: { min: 1, max: 3 }, // fails here; rest short-circuits
    creatureType: 'beast',
    size: 'small',
    hasSpells: false,
    hasSpecialAbilities: true,
  });
});

// ---------------------------------------------------------------------------
// Bench 2: getCharacterInfo — µs scale; async but mocked game.actors
// ---------------------------------------------------------------------------

const benchActor = makeActor();

beforeEach(() => {
  // Stable randomID so inner calls don't generate non-deterministic IDs.
  (globalThis as any).foundry.utils.randomID = () => 'bench-fixed-id';
  // Wire game.actors with the bench actor.
  (globalThis as any).game = {
    ...(globalThis as any).game,
    actors: {
      get: (_id: string) => undefined,
      find: (fn: (a: any) => boolean) => (fn(benchActor) ? benchActor : undefined),
      values: () => [benchActor][Symbol.iterator](),
      getName: (_name: string) => undefined,
    },
  };
});

bench('getCharacterInfo — found by name (mocked actors)', async () => {
  const da = makeDA();
  await da.getCharacterInfo('Bench Actor');
});

bench('getCharacterInfo — not found (throws, mocked actors)', async () => {
  const da = makeDA();
  try {
    await da.getCharacterInfo('Nobody');
  } catch {
    // expected — we are timing the path including the error throw
  }
});

// ---------------------------------------------------------------------------
// Bench 3: searchCompendium basic path — µs scale; mocked packs (empty)
// ---------------------------------------------------------------------------
// With no actor packs and no enhanced-index, searchCompendium falls through to
// an empty basic-search on an empty game.packs map.  This benches the setup
// cost + guard logic rather than the actual pack-scan (which requires I/O).

beforeEach(() => {
  (globalThis as any).game = {
    ...(globalThis as any).game,
    packs: {
      filter: (_fn: any) => [],
      forEach: (_fn: any) => {},
      get: (_id: string) => undefined,
      [Symbol.iterator]: function* () {},
    },
  };
});

bench('searchCompendium — empty packs (no match)', async () => {
  const search = new CompendiumSearchService(MODULE_ID, { getEnhancedIndex: async () => [] });
  try {
    // Query is valid (>=2 chars); packs are empty so result should be []
    await search.searchCompendium('rat');
  } catch {
    // Some code paths throw on empty packs; timing includes the error path
  }
});
