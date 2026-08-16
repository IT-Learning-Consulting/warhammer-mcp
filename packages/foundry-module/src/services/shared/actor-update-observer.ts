// Actor update-commit observer — originally extracted VERBATIM from
// FoundryDataAccess.waitForActorUpdateCommit (Phase 7.3.1, R7.1); BUG-692 (2026-08-16) changed
// its return contract from `Promise<void>` (always "success") to `Promise<boolean>` (did the
// hook genuinely fire before the timeout) — see the BUG-692 note below. No longer byte-identical
// to the pre-Phase-7.3.1 original; that HC1 freeze is superseded by this fix.
//
// Used by the actor cluster (updateActor + applyNpcCareerAdvance, in services/actor.ts) to await
// the next `updateActor` Hook for a given actor before sampling post-write state (BUG-043/018
// single-merged-update + BUG-086 drift-verify timing). Pure — no `this.` references (uses
// globalThis.Hooks).
//
// PLACEMENT (Phase 7 user decision, 2026-06-16): services/shared/ — co-located with the other
// verbatim-moved shared helpers (caps-exempt under the lint-ratchet services/ glob; not a flat
// services/<svc>.ts so dep-cruiser permits cross-service import).
//
// BUG-692: the original implementation resolved identically whether the `updateActor` hook
// fired OR the timeout elapsed — callers could not tell a genuine commit from "we gave up after
// 250ms", and treated both as success. wfrp4e.js's advance() chain (StandardActorModel.advance
// :7036 -> Advancement.advance :2742) calls `this.actor.update(updateObj)` WITHOUT awaiting it,
// two layers deep, so a slow/contended write can genuinely outlive a short timeout. Callers MUST
// now check the returned boolean and treat `false` as an explicit failure, not a resolved result.
export async function waitForActorUpdateCommit(actorId: string, timeoutMs: number = 250): Promise<boolean> {
  const hooksApi: any = (globalThis as any).Hooks;
  if (!hooksApi?.on || !hooksApi?.off) {
    await Promise.resolve();
    return false;
  }

  let hookId: number | undefined;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    return await new Promise<boolean>((resolve) => {
      hookId = hooksApi.on('updateActor', (updatedActor: any) => {
        if (updatedActor?.id === actorId) {
          resolve(true);
        }
      });
      timeoutHandle = setTimeout(() => resolve(false), timeoutMs);
    });
  } finally {
    if (hookId !== undefined) hooksApi.off('updateActor', hookId);
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  }
}
