// Module Integration v1 Phase 9 — module-robak mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side.
// The mcp-server tool layer only needs typed response shapes for this.query<T> (DP-15).

import { ActorId } from '@foundry-mcp/shared';

export interface RobakRollResult {
  actorId: ActorId;
  actorName: string | null;
  skill: string;
  roll: number | null;
  sl: number | null;
  outcome: string | null;
  testResult: {
    roll: number | null;
    sl: number | null;
    outcome: string | null;
    target: number | null;
  };
}
