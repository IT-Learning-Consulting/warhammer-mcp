// Actor update-commit observer — extracted VERBATIM from FoundryDataAccess.waitForActorUpdateCommit
// (Phase 7.3.1, R7.1).
//
// Used by the actor cluster (updateActor + applyNpcCareerAdvance, which move to services/actor.ts in
// Phase 7.6) to await the next `updateActor` Hook for a given actor before sampling post-write state
// (BUG-043/018 single-merged-update + BUG-086 drift-verify timing). Pure — no `this.` references
// (uses globalThis.Hooks).
//
// PLACEMENT (Phase 7 user decision, 2026-06-16): services/shared/ — co-located with the other
// verbatim-moved shared helpers (caps-exempt under the lint-ratchet services/ glob; not a flat
// services/<svc>.ts so dep-cruiser permits cross-service import).
//
// HC1: body is byte-identical to the original.

export async function waitForActorUpdateCommit(actorId: string, timeoutMs: number = 250): Promise<void> {
  const hooksApi: any = (globalThis as any).Hooks;
  if (!hooksApi?.on || !hooksApi?.off) {
    await Promise.resolve();
    return;
  }

  let hookId: number | undefined;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve) => {
      hookId = hooksApi.on('updateActor', (updatedActor: any) => {
        if (updatedActor?.id === actorId) {
          resolve();
        }
      });
      timeoutHandle = setTimeout(resolve, timeoutMs);
    });
  } finally {
    if (hookId !== undefined) hooksApi.off('updateActor', hookId);
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  }
}
