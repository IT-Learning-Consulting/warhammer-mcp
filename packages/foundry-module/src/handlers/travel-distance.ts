// wfrp_layer_expansion_v1 Phase 7 (P-11) — travel-distance handler.
//
// PURE COMPUTE-ONLY reference lookup over the WFRP4e Reikland travel gazetteer
// (systems/wfrp4e/data/travel_data.json — 216 DIRECTIONAL town-to-town rows; each row may carry
// road / river / sea legs ({<leg>_distance, <leg>_days, <leg>_danger})).
//
// The wfrp4e system loads this JSON at init into a module-PRIVATE TravelDistanceWFRP4e class
// (wfrp4e.js:2847-2970) that is NOT exposed on globalThis or game.wfrp4e (confirmed live
// 2026-06-25 — every accessor returned undefined). So we load the same static gazetteer file
// directly (foundry.utils.getRoute + fetch), exactly as the system's own loadTravelData() does,
// and cache it module-side. The lookup stays side-effect-free (no GM gate, no chat, no writes).
//
// HC2 / compute-only: NEVER rolls, NEVER writes — no ChatMessage, no actor/item mutation, no
// verifyWrite. The TravelDistanceWFRP4e.displayTravelDistance() method posts a gmroll chat card
// (wfrp4e.js:2959); we deliberately do NOT call it. The skill narrates pace→daily-distance.

import {
  ErrorTokens,
  TravelDistanceInput,
  type TravelDistanceInputType,
  type TravelDistanceResponse,
  type TravelLeg,
} from '@foundry-mcp/shared';

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Raw gazetteer row shape (only the fields we read). Empty-string sentinels mark an absent leg.
interface TravelRow {
  from: string;
  to: string;
  road_distance: number | string;
  road_days: number | string;
  road_danger: string;
  river_distance: number | string;
  river_days: number | string;
  river_danger: string;
  sea_distance: number | string;
  sea_days: number | string;
  sea_danger: string;
}

// Mirrors TravelDistanceWFRP4e.dangerToString (wfrp4e.js:2879) WITHOUT the i18n dependency —
// the unit returns the English band directly so it is testable headless. "" → Very Low,
// "!" → Low, "!!" → Medium, "!!!" → High, anything else → Very High.
export function dangerLabel(code: string): string {
  switch (code) {
    case '':
      return 'Very Low';
    case '!':
      return 'Low';
    case '!!':
      return 'Medium';
    case '!!!':
      return 'High';
    default:
      return 'Very High';
  }
}

// A leg exists when its distance sentinel is a non-empty value (the gazetteer stores "" for
// "no such leg"). Builds {distance, days, dangerCode, dangerLabel} with numeric coercion.
function buildLeg(
  distance: number | string,
  days: number | string,
  danger: string,
): TravelLeg | undefined {
  if (distance === '' || distance === null || distance === undefined) return undefined;
  const code = danger ?? '';
  return {
    distance: Number(distance) || 0,
    days: Number(days) || 0,
    dangerCode: code,
    dangerLabel: dangerLabel(code),
  };
}

/**
 * Resolve a directional from→to route into its road/river/sea legs. Pure compute over a supplied
 * gazetteer array — extracted so the unit test exercises the matching + leg logic without globals.
 * Throws TRAVEL_ROUTE_NOT_FOUND when no directional entry matches (case-insensitive).
 */
export function computeTravelDistance(
  travelData: TravelRow[],
  fromTown: string,
  toTown: string,
): TravelDistanceResponse {
  const from = fromTown.toLowerCase();
  const to = toTown.toLowerCase();
  const row = travelData.find(
    (t) => String(t.from).toLowerCase() === from && String(t.to).toLowerCase() === to,
  );
  if (!row) {
    throw new Error(
      `${ErrorTokens.TRAVEL_ROUTE_NOT_FOUND}: no directional route "${fromTown}" → "${toTown}" in the WFRP4e travel gazetteer. Routes are directional — the reverse may exist; check spelling against the gazetteer town names.`,
    );
  }
  const response: TravelDistanceResponse = { from: row.from, to: row.to };
  const road = buildLeg(row.road_distance, row.road_days, row.road_danger);
  if (road) response.road = road;
  const river = buildLeg(row.river_distance, row.river_days, row.river_danger);
  if (river) response.river = river;
  const sea = buildLeg(row.sea_distance, row.sea_days, row.sea_danger);
  if (sea) response.sea = sea;
  return response;
}

// ── Gazetteer load (cached) ─────────────────────────────────────────────────────

const TRAVEL_DATA_PATH = 'systems/wfrp4e/data/travel_data.json';
let travelDataCache: TravelRow[] | null = null;

/** Test-only: clear the module-side gazetteer cache between cases. */
export function __resetTravelDataCacheForTests(): void {
  travelDataCache = null;
}

/**
 * Load the static Reikland gazetteer (cached). The wfrp4e TravelDistanceWFRP4e class is
 * module-private and unreachable from here, so we fetch the same JSON it loads at init. Throws
 * TRAVEL_DATA_NOT_LOADED if the file can't be fetched or doesn't parse to an array.
 */
async function loadTravelData(): Promise<TravelRow[]> {
  if (travelDataCache) return travelDataCache;
  const getRoute = (globalThis as any).foundry?.utils?.getRoute;
  const route = typeof getRoute === 'function' ? getRoute(TRAVEL_DATA_PATH) : TRAVEL_DATA_PATH;
  let parsed: unknown;
  try {
    const res = await fetch(route);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    parsed = await res.json();
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(
      `${ErrorTokens.TRAVEL_DATA_NOT_LOADED}: could not load ${TRAVEL_DATA_PATH} (${detail}).`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(
      `${ErrorTokens.TRAVEL_DATA_NOT_LOADED}: ${TRAVEL_DATA_PATH} did not parse to an array.`,
    );
  }
  travelDataCache = parsed as TravelRow[];
  return travelDataCache;
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function dispatchTravelDistance(
  data: unknown,
): Promise<Envelope<TravelDistanceResponse>> {
  let input: TravelDistanceInputType;
  try {
    input = TravelDistanceInput.strict().parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  const travelData = await loadTravelData();
  const result = computeTravelDistance(travelData, input.fromTown, input.toTown);
  return { success: true, data: result };
}
