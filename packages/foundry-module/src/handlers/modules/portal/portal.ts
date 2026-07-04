// DIALOG-PATH: DIALOG_FREE — module header states explicitly: NO DIALOG/DEADLOCK RISK — the setLocation()+spawn() path bypasses every Dialog/DialogV2/pick() call in the Portal module.
// Module Integration v2 Phase 13A — module-portal handler (Portal v3.0.4, Posh Rat Games).
//
// Always-registered umbrella. requireModuleActive('portal-lib') is the FIRST executable statement — RETURNS
// the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// DIRECT-CALL, NOT A MACRO BRIDGE (§13A.1-2): `globalThis.Portal` is assigned as a top-level side effect at
// module-eval time, live before `init` — directly callable from the handler. The PRD's "runmacro runasgm"
// framing is obsolete (pre-dates the Phase-1 direct-call discovery); this handler never creates or executes a
// macro.
//
// PROTOTYPE-PRESERVING SPAWN (§13A.3): `spawn()` sources token data from `Actor.getTokenDocument()` — the
// exact mechanism that avoids the token.create prototype-loss trap ([[feedback_token_create_loses_prototype]]).
// Its `createEmbeddedDocuments` call is properly awaited, so spawn() resolving means the Token document
// already exists — NO SETTLE-POLL needed.
//
// CANVAS-BOUND, NO sceneId PARAM (§13A.4): Portal writes to `canvas.scene` ONLY — there is no sceneId
// parameter anywhere in the fluent API. A caller targeting a non-viewed scene would otherwise silently spawn
// onto the WRONG scene. This handler enforces a STRICT scene-match guard: `input.sceneId` must equal the live
// `canvas.scene.id`, else PORTAL_WRONG_SCENE_ACTIVE (actionable: "activate scene X first").
//
// NO DIALOG/DEADLOCK RISK (§13A.5): the `setLocation()+spawn()` path bypasses every Dialog/DialogV2/pick()
// surface in the module. The only real precondition is `canvas?.ready` (token-attacher's
// TOKEN_ATTACHER_CANVAS_NOT_READY precedent) -> PORTAL_CANVAS_NOT_READY.
//
// Source of truth: .agents/research/module_integration/phase13_pre_plan.md §13A.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { PortalInput, type PortalInputType } from '@foundry-mcp/shared';
import { notify } from '../../../notify.js';
import { Envelope, isGM, getCanvas } from '../_shared/handler-utils.js';


const MODULE_ID = 'portal-lib';

function getPortalCtor(): any {
  return (globalThis as any).Portal;
}

function canvasNotReady(): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.PORTAL_CANVAS_NOT_READY}: canvas is not ready — open a scene in the GM client before spawning.` };
}
function wrongScene(sceneId: string, activeId: string | undefined): { success: false; error: string } {
  return {
    success: false,
    error: `${ErrorTokens.PORTAL_WRONG_SCENE_ACTIVE}: requested sceneId "${sceneId}" does not match the currently-viewed canvas scene ("${activeId ?? 'none'}"). Portal spawns onto canvas.scene ONLY (it has no sceneId parameter) — activate scene "${sceneId}" first, then retry.`,
  };
}
function spawnFailed(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.PORTAL_SPAWN_FAILED}: ${detail}` };
}

export async function dispatchModulePortal(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: PortalInputType;
  try {
    input = PortalInput.parse(data);
  } catch (e) {
    return { success: false, error: `${ErrorTokens.PORTAL_INVALID_INPUT}: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (!isGM()) {
    return { success: false, error: `${ErrorTokens.PORTAL_ACCESS_DENIED}: spawn requires GM` };
  }

  const canvas = getCanvas();
  if (!canvas?.ready) return canvasNotReady();

  const activeSceneId = canvas.scene?.id;
  if (activeSceneId !== input.sceneId) return wrongScene(input.sceneId, activeSceneId);

  const PortalCtor = getPortalCtor();
  if (typeof PortalCtor !== 'function') {
    return spawnFailed('globalThis.Portal is not callable — portal-lib may not have finished initializing.');
  }

  try {
    const p = new PortalCtor();
    for (const c of input.creatures) {
      p.addCreature(c.uuid, { count: c.count ?? 1, ...(c.updateData ? { updateData: c.updateData } : {}) });
    }
    p.setLocation({ x: input.x, y: input.y, ...(input.elevation !== undefined ? { elevation: input.elevation } : {}) });
    const tokens = await p.spawn();

    const tokenIds: string[] = Array.isArray(tokens) ? tokens.map((t: any) => t?.id ?? t?._id).filter(Boolean) : [];
    if (tokenIds.length === 0) {
      return spawnFailed('Portal.spawn() resolved but returned no token documents.');
    }

    notify.created('token', `${tokenIds.length} spawned token(s)`, { summary: 'module-portal spawn' });
    return { success: true, data: { action: 'spawn', sceneId: input.sceneId, tokenIds } };
  } catch (e) {
    return spawnFailed(e instanceof Error ? e.message : String(e));
  }
}
