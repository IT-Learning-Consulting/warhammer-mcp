// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 1 — module-probe handler.
//
// Always-on umbrella (no requireModuleActive guard). Reads game.modules for
// skill-layer pre-flight: is a given module active? What modules are active?
//
// Design Decisions:
//   - Does NOT gate on enableDiagnosticTools setting (07_architecture.md R10).
//     module-probe is a read-only probe, not a diagnostic introspection tool.
//     The diagnostic gate (isDiagnosticEnabled) is deliberately NOT inherited.
//   - GM-gated via validateGMAccess() (same as all other read handlers).
//   - Uses game.modules.values() iterator — same source as handleModuleInventory
//     (diagnostic.ts:824-860) but without the broader diagnostic payload.
//
// Anchors:
//   - Phase 1 module_integration_v1 acceptance criterion #1.
//   - 07_architecture.md §4 (is-active, list-active probe design).
//   - phase1_pre_plan.md §2 C1 (reuse iterator, skip diagnostic gate).

import { ModuleProbeInput } from '@foundry-mcp/shared';
import { validateGMAccess } from '../../../utils/flatWorldCRUDFactory.js';
import type { Envelope } from '../../../utils/flatWorldCRUDFactory.js';

// ── Response shapes ──────────────────────────────────────────────────────────

interface ModuleIsActiveResponse {
  id: string;
  active: boolean;
  title?: string;
  version?: string;
}

interface ModuleListActiveResponse {
  modules: Array<{ id: string; title: string; version: string }>;
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Dispatch a `module-probe` umbrella request.
 *
 * queries.ts registers CONFIG.queries['warhammer-mcp.module-probe'] to forward here.
 * Two actions: is-active (checks one module), list-active (lists all active modules).
 * Never returns MODULE_NOT_ACTIVE — the probe always succeeds; it just reports status.
 */
export async function dispatchModuleProbe(
  data: unknown,
): Promise<Envelope<ModuleIsActiveResponse | ModuleListActiveResponse>> {
  // GM gate — module list is GM-accessible only.
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return { success: false, error: 'MODULE_PROBE_ACCESS_DENIED: GM required' };
  }

  // Strict-parse input via shared discriminated union.
  let input: ReturnType<typeof ModuleProbeInput.parse>;
  try {
    input = ModuleProbeInput.parse(data);
  } catch (e) {
    return {
      success: false,
      error: `MODULE_PROBE_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  switch (input.action) {
    case 'is-active':
      return handleIsActive(input.moduleId);
    case 'list-active':
      return handleListActive();
    default: {
      // Exhaustiveness check — assigning to `never` fails compilation if a new
      // ModuleProbeInput action is added above without a matching case here.
      const _exhaustive: never = input;
      return { success: false, error: `MODULE_PROBE_UNKNOWN_ACTION: ${String(_exhaustive)}` };
    }
  }
}

function handleIsActive(moduleId: string): Envelope<ModuleIsActiveResponse> {
  try {
    const mod = (globalThis as any).game?.modules?.get?.(moduleId);
    if (!mod) {
      return { success: true, data: { id: moduleId, active: false } };
    }
    const title = mod.title ? String(mod.title) : undefined;
    const version = mod.version ? String(mod.version) : undefined;
    return {
      success: true,
      data: {
        id: moduleId,
        active: mod.active === true,
        ...(title !== undefined ? { title } : {}),
        ...(version !== undefined ? { version } : {}),
      },
    };
  } catch (e) {
    return {
      success: false,
      error: `MODULE_PROBE_IS_ACTIVE_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

function handleListActive(): Envelope<ModuleListActiveResponse> {
  try {
    const modulesIter: Iterable<any> | undefined =
      (globalThis as any).game?.modules?.values?.();
    const modules: Array<{ id: string; title: string; version: string }> = [];

    if (modulesIter) {
      for (const m of modulesIter) {
        if (m?.active === true) {
          modules.push({
            id: String(m?.id ?? ''),
            title: String(m?.title ?? ''),
            version: String(m?.version ?? ''),
          });
        }
      }
    }

    return { success: true, data: { modules } };
  } catch (e) {
    return {
      success: false,
      error: `MODULE_PROBE_LIST_ACTIVE_FAILED: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
