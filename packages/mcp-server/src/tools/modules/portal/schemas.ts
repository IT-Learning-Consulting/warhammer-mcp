// Module Integration v2 Phase 13A — module-portal mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. This file only carries typed
// response shapes for this.query<T> (DP-15 — never <any>).

export interface PortalSpawnResult {
  action: 'spawn';
  sceneId: string;
  tokenIds: string[];
}

export type PortalResult = PortalSpawnResult;

// Package-local duplicate per CCR-5 — keep byte-identical to handlers/modules/portal/schemas.ts's
// PORTAL_ACTIONS.

export const PORTAL_ACTIONS = ['spawn'] as const;
export type PortalAction = (typeof PORTAL_ACTIONS)[number];
