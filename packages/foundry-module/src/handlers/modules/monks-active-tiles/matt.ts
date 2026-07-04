// DIALOG-PATH: DIALOG_FREE — dispatcher delegates to per-seam handler files; see matt-runtime.ts for the MOD-04 fire-trigger deferral note.
// Module Integration v1 Phase 2 — module-matt handler (Monk's Active Tiles).
//
// Expands the Phase-1 stub into the full ~19-action umbrella. Conditional on
// monks-active-tiles being active: requireModuleActive RETURNS the failure envelope
// (never throws — carry-forward §Discoveries) and is the FIRST executable statement.
//
// mcp_code_quality_v2 Phase C3 (19b) split: this file is now a thin dispatcher; handler
// bodies moved VERBATIM to matt-helpers.ts / matt-reads.ts / matt-sequence.ts /
// matt-runtime.ts (zero behavioral change — behavior freeze HC3/HC13). queries.ts
// registration is UNCHANGED — it imports only dispatchModuleMatt from this same path.
//
// Validation standard (dossier §3): catalog-driven (action-catalog.ts) — strict Zod for
// high-value/dangerous actions + raw-with-warning long tail. Every write: catalog-validate →
// scene/region.update → DP-16 post-read of _source → notify.* (CCR-3).
//
// Phase split (original 2A/2B/2C sub-phases; each left a green tree):
//   2A: reads (get-capabilities/get-trigger-tile/list-trigger-tiles/validate-sequence)
//       + create-trigger-tile + update-trigger-config.
//   2B: sequence editing + set-variables + reset-history.
//   2C: fire-trigger + link-region-trigger + destructive safety finalization.
//
// Anchors:
//   - PRD R3/R17/R18; CCR-1 (guard), CCR-3 (notify), CCR-4 (preview/confirm), CCR-5 (schema).
//   - DP-15 (typed), DP-16 (post-write verify), exhaustiveness via const _exhaustive:never.
//   - phaseC3_pre_plan.md §19b (split design).

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleMattInput, type ModuleMattInputType } from '@foundry-mcp/shared';
// R2.2 dedup: canonical deepStripUndefined (was a local byte-identical copy; browser-safe — tree-shaken, same bundle as verifyWrite/notify).
import { deepStripUndefined } from '../../../utils/embeddedCRUDFactory.js';
import { MONKS_ACTIVE_TILES as MATT_MODULE_ID } from '../../../constants/moduleIds.js';
import { Envelope, isGM } from '../_shared/handler-utils.js';
import {
  buildImpactReport,
  normalizeActions,
  getTileByUuidOrThrow,
  readMattFlags,
  getSceneOrThrow,
  resolveTaggerSelectorsInSequence,
} from './matt-helpers.js';
import {
  handleGetCapabilities,
  handleGetTriggerTile,
  handleListTriggerTiles,
  handleValidateSequence,
  handleCreateTriggerTile,
  handleUpdateTriggerConfig,
} from './matt-reads.js';
import {
  handleReplaceActionSequence,
  handleAddAction,
  handleInsertAction,
  handleUpdateAction,
  handleRemoveAction,
  handleReorderActions,
  handleDuplicateAction,
  handleSetVariables,
  handleResetHistory,
} from './matt-sequence.js';
import {
  handleFireTrigger,
  handleFireTriggerAs,
  handleFindTriggerTile,
  handleLinkRegionTrigger,
} from './matt-runtime.js';

// ── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Dispatch a `module-matt` umbrella request.
 *
 * Guard FIRST (returns MODULE_NOT_ACTIVE when monks-active-tiles is absent/inactive),
 * then strict-parse, then switch over all 19 actions with a compile-time exhaustiveness check.
 */
export async function dispatchModuleMatt(data: unknown): Promise<Envelope<unknown>> {
  // Guard — requireModuleActive RETURNS {success:false,error}; never throws (carry-forward).
  const guard = requireModuleActive(MATT_MODULE_ID);
  if (guard) return guard;

  // Strict-parse via the package-local discriminated union.
  let input: ModuleMattInputType;
  try {
    input = ModuleMattInput.parse(data);
  } catch (e) {
    return { success: false, error: `MATT_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  // Writes are GM-gated.
  const WRITE_ACTIONS = new Set([
    'create-trigger-tile', 'update-trigger-config', 'replace-action-sequence', 'add-action',
    'insert-action', 'update-action', 'remove-action', 'reorder-actions', 'duplicate-action',
    'set-variables', 'reset-history', 'fire-trigger', 'fire-trigger-as', 'link-region-trigger',
  ]);
  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `MATT_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      // — reads —
      case 'get-capabilities':
        return handleGetCapabilities();
      case 'get-trigger-tile':
        return handleGetTriggerTile(input.tileUuid, input.returnFullPayload ?? false);
      case 'list-trigger-tiles':
        return handleListTriggerTiles(input.sceneId);
      case 'validate-sequence':
        return handleValidateSequence(input.actions);

      // — create + config (2A.6) —
      case 'create-trigger-tile':
        return handleCreateTriggerTile(input);
      case 'update-trigger-config':
        return handleUpdateTriggerConfig(input);

      // — sequence editing (2B) —
      case 'replace-action-sequence':
        return handleReplaceActionSequence(input);
      case 'add-action':
        return handleAddAction(input);
      case 'insert-action':
        return handleInsertAction(input);
      case 'update-action':
        return handleUpdateAction(input);
      case 'remove-action':
        return handleRemoveAction(input);
      case 'reorder-actions':
        return handleReorderActions(input);
      case 'duplicate-action':
        return handleDuplicateAction(input);

      // — state (2B) —
      case 'set-variables':
        return handleSetVariables(input);
      case 'reset-history':
        return handleResetHistory(input);

      // — runtime + region (2C) —
      case 'fire-trigger':
        return handleFireTrigger(input);
      case 'fire-trigger-as':
        return handleFireTriggerAs(input);
      case 'find-trigger-tile':
        return handleFindTriggerTile(input);
      case 'link-region-trigger':
        return handleLinkRegionTrigger(input);

      default: {
        const _exhaustive: never = input;
        return { success: false, error: `MATT_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `MATT_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// Re-export shared helpers for tests + external callers (existing barrel, extended with
// resolveTaggerSelectorsInSequence per Phase C3 19b so tagger-resolution.test.ts needs no edit).
export {
  buildImpactReport,
  normalizeActions,
  getTileByUuidOrThrow,
  readMattFlags,
  deepStripUndefined,
  getSceneOrThrow,
  resolveTaggerSelectorsInSequence,
};
