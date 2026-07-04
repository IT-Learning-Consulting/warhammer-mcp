// DIALOG-PATH: DIALOG_FREE — pure globalThis game/canvas accessors; no module-API calls, no dialog risk.
// mcp_code_quality_v2 Phase C2 (RC2.1) — shared module-handler helpers.
//
// Canonical extraction of the 4 byte-identical-or-behaviorally-identical local
// redefinitions that previously existed in every handlers/modules/**/*.ts file
// (44 Envelope<T> / 34 isGM / 21 getGame / 9 getCanvas). Disposition for each,
// including the 2 genuine cosmetic-variant helpers, is recorded in
// `.agents/research/mcp_code_quality_v2/phaseC2_byte_drift_check.md`.
//
// getCanvas here is the PLAIN 6-file-majority form (no scene guard). The 3
// scene-atmosphere files that need the `!c?.scene` throw keep a local
// `getCanvasOrThrow()` one-line wrapper over this shared `getCanvas()` — see
// the byte-drift artifact's getCanvas() disposition.

/** Standard module-handler response envelope: success-with-data, or error string. */
export type Envelope<T> = { success: true; data: T } | { success: false; error: string };

/** Foundry's global `game` object, untyped (module handlers run against the live client). */
export function getGame(): any {
  return (globalThis as any).game;
}

/** True when the current user is a GM. */
export function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}

/** Foundry's global `canvas` object, untyped. Plain form — no scene-active guard. */
export function getCanvas(): any {
  return (globalThis as any).canvas;
}
