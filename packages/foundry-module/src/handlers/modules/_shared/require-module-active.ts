// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
import { ErrorTokens } from '@foundry-mcp/shared';
// Module Integration v1 Phase 1 — Shared module-active guard.
//
// Called at the top of every module-* dispatcher. Returns a well-formed
// failure envelope when the target Foundry module is absent or inactive;
// returns null when the module (and all required hard deps) are active.
//
// Design Decision (confirmed by round-trip trace):
//   RETURNS { success: false, error } — never throws.
//   Round-trip: socket-bridge wraps → foundry-connector strips outer →
//   foundry-client:79 sees !envelope.success → throws → tool catch → isError.
//   This is the Envelope<T> contract (worldCRUDFactory.ts:40-42): all 50+ handler
//   sites return {success:false,error} for failures. Throwing inside requireModuleActive
//   would bypass the envelope and produce a raw exception, which the connector
//   would reject with a generic "Query failed" instead of the typed MODULE_NOT_ACTIVE token.
//
// Anchors:
//   - Phase 1 module_integration_v1 acceptance criterion #2.
//   - 07_architecture.md §4 — exact signature design.
//   - phase1_pre_plan.md §2 envelope contract (resolved).

type ModuleGuardError = { success: false; error: string };

function checkModule(moduleId: string): ModuleGuardError | null {
  const mod = (globalThis as any).game?.modules?.get?.(moduleId);
  if (!mod) {
    return {
      success: false,
      error: `${ErrorTokens.MODULE_NOT_ACTIVE}: Foundry module "${moduleId}" is not installed. Install and activate it to use this tool.`,
    };
  }
  if (!mod.active) {
    return {
      success: false,
      error: `${ErrorTokens.MODULE_NOT_ACTIVE}: Foundry module "${moduleId}" is installed but not active in the current world. Enable it in Module Management.`,
    };
  }
  return null;
}

/**
 * Guard for module-* handlers.
 *
 * @param primaryId - The Foundry module ID to require active (e.g. 'monks-active-tiles').
 * @param requiredDeps - Optional hard dependencies; any absent/inactive dep returns
 *   MODULE_DEPENDENCY_NOT_ACTIVE.
 * @returns null when all modules are active; a ModuleGuardError to return immediately otherwise.
 *
 * Usage:
 *   const g = requireModuleActive('monks-active-tiles');
 *   if (g) return g;
 */
export function requireModuleActive(
  primaryId: string,
  requiredDeps?: string[],
): ModuleGuardError | null {
  // 1. Check primary module
  const primaryGuard = checkModule(primaryId);
  if (primaryGuard) return primaryGuard;

  // 2. Check hard dependencies (if any)
  for (const dep of requiredDeps ?? []) {
    const depMod = (globalThis as any).game?.modules?.get?.(dep);
    if (!depMod || !depMod.active) {
      return {
        success: false,
        error: `${ErrorTokens.MODULE_DEPENDENCY_NOT_ACTIVE}: "${dep}" is required by module-${primaryId} but is not active. Enable it in Module Management.`,
      };
    }
  }

  return null; // primary + all hard deps are present and active
}

/**
 * Guard for optional companion modules (e.g. tokenmagic-automatic-wounds).
 *
 * Distinct from requireModuleActive: a companion is an *optional* add-on that
 * extends a primary module's functionality. Its absence returns COMPANION_NOT_ACTIVE
 * (not MODULE_NOT_ACTIVE) so callers can surface the distinction to the user.
 *
 * @param companionId - The Foundry module ID of the companion (e.g. 'tokenmagic-automatic-wounds').
 * @returns null when the companion is present and active; a ModuleGuardError otherwise.
 *
 * Usage:
 *   const g = requireCompanionActive('tokenmagic-automatic-wounds');
 *   if (g) return g;
 */
export function requireCompanionActive(companionId: string): ModuleGuardError | null {
  const mod = (globalThis as any).game?.modules?.get?.(companionId);
  if (!mod || !mod.active) {
    return {
      success: false,
      error: `${ErrorTokens.COMPANION_NOT_ACTIVE}: Optional companion module "${companionId}" is not installed or not active. Install and enable it to use this action.`,
    };
  }
  return null;
}
