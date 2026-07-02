// wfrp_layer_expansion_v1 Phase 7 (P-11) — travel-distance handler unit tests.
//
// Encodes WHY the tool exists (Rule 9): a compute-only gazetteer lookup that NEVER rolls/writes
// and surfaces directional routes with their road/river/sea legs + danger band. Asserts the three
// load-bearing branches the skill depends on:
//   - route hit → canonical from/to + per-leg {distance, days, dangerCode, dangerLabel}
//   - route miss (directional) → TRAVEL_ROUTE_NOT_FOUND (the reverse may exist; not symmetric)
//   - gazetteer file unfetchable → TRAVEL_DATA_NOT_LOADED
//   - danger code → band mapping (mirrors dangerToString incl. the "" → Very Low and the
//     unknown → Very High fallthrough, wfrp4e.js:2879)
//
// Deterministic: mocks global fetch (the dispatcher loads the static gazetteer JSON directly,
// since the wfrp4e TravelDistanceWFRP4e class is module-private). NEVER touches a live Foundry.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  computeTravelDistance,
  dangerLabel,
  dispatchTravelDistance,
  __resetTravelDataCacheForTests,
} from '../handlers/travel-distance.js';

// Mirror of travel_data.json (only the rows the tests touch). Altdorf→Bögenhafen has a low-danger
// road leg + a "!" river leg and no sea leg ("" sentinels). Altdorf→Barak Varr is road-only "!!".
const TRAVEL_DATA = [
  {
    from: 'Altdorf',
    to: 'Bögenhafen',
    road_distance: 145,
    road_days: 4,
    road_danger: '',
    river_distance: 217,
    river_days: 4,
    river_danger: '!',
    sea_distance: '',
    sea_days: '',
    sea_danger: '',
  },
  {
    from: 'Altdorf',
    to: 'Barak Varr (Dwarfs/ Border Princes)',
    road_distance: 2044,
    road_days: 51,
    road_danger: '!!',
    river_distance: '',
    river_days: '',
    river_danger: '',
    sea_distance: '',
    sea_days: '',
    sea_danger: '',
  },
];

// The dispatcher loads the gazetteer via fetch(foundry.utils.getRoute(...)) and caches it
// module-side, so each dispatcher test mocks global fetch + resets the cache.
function mockFetch(impl: () => Promise<unknown>) {
  (globalThis as any).fetch = impl as never;
}

afterEach(() => {
  __resetTravelDataCacheForTests();
  delete (globalThis as any).fetch;
});

// ── danger band mapping ─────────────────────────────────────────────────────────

describe('dangerLabel', () => {
  it('maps the gazetteer codes to the five danger bands (incl. the fallthrough)', () => {
    expect(dangerLabel('')).toBe('Very Low');
    expect(dangerLabel('!')).toBe('Low');
    expect(dangerLabel('!!')).toBe('Medium');
    expect(dangerLabel('!!!')).toBe('High');
    expect(dangerLabel('????')).toBe('Very High'); // unknown → Very High (wfrp4e.js:2884)
  });
});

// ── pure compute ────────────────────────────────────────────────────────────────

describe('computeTravelDistance', () => {
  it('returns canonical from/to + road + river legs, omitting the absent sea leg', () => {
    const r = computeTravelDistance(TRAVEL_DATA as any, 'altdorf', 'bögenhafen');
    expect(r.from).toBe('Altdorf'); // canonical casing echoed back
    expect(r.to).toBe('Bögenhafen');
    expect(r.road).toEqual({ distance: 145, days: 4, dangerCode: '', dangerLabel: 'Very Low' });
    expect(r.river).toEqual({ distance: 217, days: 4, dangerCode: '!', dangerLabel: 'Low' });
    expect(r.sea).toBeUndefined(); // "" sentinel → no leg
  });

  it('road-only route omits river + sea', () => {
    const r = computeTravelDistance(TRAVEL_DATA as any, 'Altdorf', 'Barak Varr (Dwarfs/ Border Princes)');
    expect(r.road).toEqual({ distance: 2044, days: 51, dangerCode: '!!', dangerLabel: 'Medium' });
    expect(r.river).toBeUndefined();
    expect(r.sea).toBeUndefined();
  });

  it('throws TRAVEL_ROUTE_NOT_FOUND for a directional miss (reverse not symmetric)', () => {
    // Bögenhafen→Altdorf is NOT in the data even though Altdorf→Bögenhafen is.
    expect(() => computeTravelDistance(TRAVEL_DATA as any, 'Bögenhafen', 'Altdorf')).toThrow(
      /TRAVEL_ROUTE_NOT_FOUND/,
    );
  });
});

// ── dispatcher ────────────────────────────────────────────────────────────────────

describe('dispatchTravelDistance', () => {
  beforeEach(() => {
    __resetTravelDataCacheForTests();
    mockFetch(async () => ({ ok: true, json: async () => TRAVEL_DATA }));
  });

  it('happy path returns success + the resolved legs', async () => {
    const r: any = await dispatchTravelDistance({ fromTown: 'Altdorf', toTown: 'Bögenhafen' });
    expect(r.success).toBe(true);
    expect(r.data.road.distance).toBe(145);
    expect(r.data.river.dangerLabel).toBe('Low');
  });

  it('route miss rejects with TRAVEL_ROUTE_NOT_FOUND', async () => {
    await expect(
      dispatchTravelDistance({ fromTown: 'Altdorf', toTown: 'Nowhere' }),
    ).rejects.toThrow(/TRAVEL_ROUTE_NOT_FOUND/);
  });

  it('rejects TRAVEL_DATA_NOT_LOADED when the gazetteer file cannot be fetched', async () => {
    __resetTravelDataCacheForTests();
    mockFetch(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    await expect(
      dispatchTravelDistance({ fromTown: 'Altdorf', toTown: 'Bögenhafen' }),
    ).rejects.toThrow(/TRAVEL_DATA_NOT_LOADED/);
  });

  it('rejects unknown input keys (.strict)', async () => {
    await expect(
      dispatchTravelDistance({ fromTown: 'Altdorf', toTown: 'Bögenhafen', extra: 1 }),
    ).rejects.toThrow(/Invalid input/);
  });
});
