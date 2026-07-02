// wfrp_layer_expansion_v1 Phase 7 (P-11) — travel-distance tool (single-action primitive).
//
// Wraps the warhammer-mcp.travel-distance Foundry handler (dispatchTravelDistance). A PURE
// COMPUTE-ONLY reference lookup over the WFRP4e Reikland travel gazetteer
// (TravelDistanceWFRP4e.travel_data). HC2 / compute-only: NEVER rolls, NEVER writes — no
// ChatMessage, no actor/item mutation. Pace→daily-distance math (Steady / Forced March,
// Core p.290-294) lives in the /wfrp-travel SKILL; this tool returns raw gazetteer legs.
//
// CCR-Envelope-Consumer: execute() uses a concrete typed generic on this.query<...> — no <any>,
// no `.success` check (BaseTool.query returns bare unwrapped data, throws on failure). BUG-069.

import { z } from 'zod';
import {
  TravelDistanceInput,
  type TravelDistanceResponse,
  type TravelLeg,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions, type ToolRegistration } from '../base-tool.js';

type TravelDistanceArgs = z.infer<typeof TravelDistanceInput>;

export interface TravelDistanceToolOptions extends BaseToolOptions {}

export class TravelDistanceTool extends BaseTool {
  constructor(options: TravelDistanceToolOptions) {
    super(options);
  }

  getRegistration(): ToolRegistration[] {
    return [{ name: 'travel-distance', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'travel-distance',
        title: 'WFRP4e Travel Distance (Reikland gazetteer)',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        description:
          `Look up the WFRP4e travel distance between two Reikland towns (TravelDistanceWFRP4e gazetteer, Core p.290-294). Returns the road / river / sea legs that exist for that route, each with distance (km), baseline days, and a danger band (Very Low / Low / Medium / High / Very High).

**Compute-only:** this tool NEVER rolls and NEVER writes — no chat card, no actor changes. It is a pure reference lookup; narrate the result and compute pace (Steady vs Forced March) in the skill layer.

**Directional:** routes are one-way — a from→to entry may exist without the reverse. Town names are case-insensitive but must match the gazetteer (e.g. "Altdorf", "Bögenhafen", "Ubersreik").

**Errors:** TRAVEL_ROUTE_NOT_FOUND (no directional from→to entry — check spelling / try the reverse); TRAVEL_DATA_NOT_LOADED (the wfrp4e travel gazetteer is not loaded).`,
        inputSchema: {
          type: 'object',
          properties: {
            fromTown: {
              type: 'string',
              minLength: 1,
              description: 'Origin town name (case-insensitive), e.g. "Altdorf".',
            },
            toTown: {
              type: 'string',
              minLength: 1,
              description: 'Destination town name (case-insensitive), e.g. "Bögenhafen".',
            },
          },
          required: ['fromTown', 'toTown'],
        },
      },
    ];
  }

  async execute(args: TravelDistanceArgs) {
    this.logger.info('Executing travel-distance', {
      fromTown: args.fromTown,
      toTown: args.toTown,
    });
    try {
      const data = await this.query<TravelDistanceResponse>('travel-distance', args);
      const legLine = (label: string, leg?: TravelLeg): string | null =>
        leg
          ? `- **${label}:** ${leg.distance} km · ${leg.days} days · danger ${leg.dangerLabel}`
          : null;
      const lines = [
        legLine('Road', data.road),
        legLine('River', data.river),
        legLine('Sea', data.sea),
      ].filter((l): l is string => l !== null);
      const text =
        `🗺️ **${data.from} → ${data.to}**\n\n` +
        (lines.length > 0 ? lines.join('\n') : '_No transport legs recorded for this route._') +
        `\n\n_Baseline days are on foot/cart; scale for mounts or Forced March in the skill._`;
      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      return this.errorResponse('travel-distance', e instanceof Error ? e.message : String(e));
    }
  }
}
