// wfrp_layer_expansion_v1 Phase 7 (P-11) — travel-distance schema.
//
// Single-action primitive (NOT an umbrella). A PURE COMPUTE-ONLY reference lookup over the
// WFRP4e Reikland travel gazetteer (TravelDistanceWFRP4e.travel_data, wfrp4e.js:2847 — 216
// directional town-to-town entries with road / river / sea legs, distances in km, day counts,
// and danger codes "" / "!" / "!!" / "!!!").
//
// HC2 / compute-only: this tool NEVER rolls and NEVER writes — no ChatMessage, no actor/item
// mutation, no verifyWrite (there is nothing to persist; SA-2 + phase6 carry-forward line 45).
// It does NOT call TravelDistanceWFRP4e.displayTravelDistance() (that method returns void and
// posts a gmroll chat card — wfrp4e.js:2959); the handler reads `.travel_data` directly.
//
// Pace → daily-distance math (Steady / Forced March multipliers, Core p.290-294) lives in the
// /wfrp-travel SKILL, not here — the tool returns the raw gazetteer legs and the skill narrates.

import { z } from 'zod';

export const TravelDistanceInput = z
  .object({
    fromTown: z
      .string()
      .min(1)
      .describe(
        'Origin town name (case-insensitive), e.g. "Altdorf". Matched against TravelDistanceWFRP4e.travel_data[].from. Routes are DIRECTIONAL — a from→to entry may exist without the reverse.',
      ),
    toTown: z
      .string()
      .min(1)
      .describe(
        'Destination town name (case-insensitive), e.g. "Bögenhafen". Matched against TravelDistanceWFRP4e.travel_data[].to. TRAVEL_ROUTE_NOT_FOUND if no from→to entry exists.',
      ),
  })
  .strict();

export type TravelDistanceInputType = z.infer<typeof TravelDistanceInput>;

// ── Response ──────────────────────────────────────────────────────────────────

/** One transport leg (road / river / sea). Present only when the gazetteer has that leg. */
export interface TravelLeg {
  /** Distance in kilometres. */
  distance: number;
  /** Baseline travel time in days (on foot/cart; the skill scales for mounts/forced march). */
  days: number;
  /** Raw danger code from the gazetteer: "" | "!" | "!!" | "!!!". */
  dangerCode: string;
  /** Human-readable danger band: Very Low | Low | Medium | High | Very High. */
  dangerLabel: string;
}

export interface TravelDistanceResponse {
  /** Canonical origin town name (as stored in the gazetteer). */
  from: string;
  /** Canonical destination town name (as stored in the gazetteer). */
  to: string;
  /** Road leg, when the gazetteer has a non-empty road_distance. */
  road?: TravelLeg;
  /** River leg, when the gazetteer has a non-empty river_distance. */
  river?: TravelLeg;
  /** Sea leg, when the gazetteer has a non-empty sea_distance. */
  sea?: TravelLeg;
}
