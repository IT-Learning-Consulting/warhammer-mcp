// WFRP4e condition IDs (PRD MCP Code-Quality Hardening — Phase 13, R13.2).
//
// DERIVES from the canonical shared `ConditionKey` enum — does NOT re-list the
// condition strings. The authoritative list lives at
// `shared/src/schemas/conditions.ts` (`ConditionKey`); a literal copy here would
// be the THIRD copy (after shared + mcp-server's manage-conditions.ts) and a
// drift risk. `ConditionKey.options` is the readonly tuple of values.
//
// Runtime handlers still validate against live `game.wfrp4e.config.conditions`
// to catch system drift; this constant is the static foundry-module-side mirror.

import { ConditionKey } from '@foundry-mcp/shared';

/** Canonical WFRP4e condition IDs, derived from the shared `ConditionKey` enum. */
export const WFRP_CONDITION_IDS = ConditionKey.options;

export type WfrpConditionId = (typeof WFRP_CONDITION_IDS)[number];
