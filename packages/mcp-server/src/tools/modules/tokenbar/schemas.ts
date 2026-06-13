// Module Integration v1 Phase 9 — module-tokenbar mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side.
// The mcp-server tool layer only needs typed response shapes for this.query<T> (DP-15).

export interface TokenbarMovementResult {
  movement: 'free' | 'none' | 'combat';
  scope: 'global' | 'per-token';
  applied: boolean;
  note?: string;
  tokenCount?: number;
}
