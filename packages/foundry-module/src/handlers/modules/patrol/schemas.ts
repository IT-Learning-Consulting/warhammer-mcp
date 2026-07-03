// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 14 — package-local Zod schema for module-patrol (patrol v3.0.3).
//
// CCR-5: module-specific schemas stay package-local. `.strict()` on every variant.
//
// 7 actions over the verified server-reachable surface (dossier thin-session.md §2.7):
//   reads:  get-config
//   GM writes: enable-token, disable-token, set-wander-zone, set-path, apply-undetectable
//   confirm-gated write: toggle-global (affects ALL patrol tokens at once — CCR-4 z.literal(true)).
//
// Accessor (pre-plan §accessor): token flags under the `patrol` scope; global runtime state at
// `game.patrol._patrol.started` / `game.patrol._pathPatrol.started` (set on canvasReady, GM-only;
// NOT persisted across reload). Engine tick computation is GM-client canvas-ticker — we only set flags.
//
// Write-order constraint (§2.4): path mode needs a Drawing labeled with `patrolPathName` to exist
// BEFORE the token flag write — the handler creates/verifies the Drawing first.
//
// Source: phase14_pre_plan.md + dossiers/thin-session.md §2.

import { z } from 'zod';

const Point = z.object({ x: z.number(), y: z.number() }).strict();

export const ModulePatrolInput = z.discriminatedUnion('action', [
  // ── Reads ─────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('get-token-config'),
      tokenUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({ action: z.literal('get-world-settings') })
    .strict(),
  z
    .object({
      action: z.literal('list-tokens'),
      sceneId: z.string().min(1),
      filter: z.enum(['all', 'wander', 'path', 'spotting']).optional(), // default all
    })
    .strict(),

  // ── GM writes ───────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('enable-token'),
      tokenUuids: z.array(z.string().min(1)).min(1),
      mode: z.enum(['wander', 'path']),
      spotting: z.boolean().optional(), // enableSpotting — independent of patrol mode
      // path-mode only:
      patrolPathName: z.string().min(1).optional(),
      pathNodeIndex: z.number().int().min(0).optional(),
      multiPath: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('disable-token'),
      tokenUuids: z.array(z.string().min(1)).min(1),
    })
    .strict(),
  z
    .object({
      // Create (or reference) a "Patrol"-labeled Drawing enclosing a random-wander zone.
      action: z.literal('set-wander-zone'),
      sceneId: z.string().min(1),
      points: z.array(Point).min(3).optional(), // polygon vertices (absolute canvas coords)
      drawingId: z.string().min(1).optional(), // reference an existing Drawing instead of creating
    })
    .strict(),
  z
    .object({
      // Create (or reference) a named path Drawing for path-follower mode.
      action: z.literal('set-path'),
      sceneId: z.string().min(1),
      pathName: z.string().min(1),
      points: z.array(Point).min(2).optional(),
      drawingId: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('apply-undetectable'),
      actorUuid: z.string().min(1),
      active: z.boolean(),
    })
    .strict(),

  z
    .object({
      // Write world settings (tick delays, alert timing, diagonals, smoothing, sounds, reset mode).
      action: z.literal('configure'),
      patrolDelay: z.number().int().min(500).max(10000).optional(),
      pathPatrolDelay: z.number().int().min(500).max(10000).optional(),
      patrolAlertDelay: z.number().int().min(0).max(10000).optional(), // 0 = skip alert → immediate spot
      patrolDiagonals: z.boolean().optional(),
      patrolSmooth: z.boolean().optional(),
      patrolSound: z.string().optional(),
      patrolAlert: z.string().optional(),
      resetToRandomNode: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      // Reposition a path-follower to an arbitrary waypoint (mid-run; does NOT trigger the resolve hook).
      action: z.literal('set-waypoint'),
      tokenUuids: z.array(z.string().min(1)).min(1),
      pathNodeIndex: z.number().int().min(0),
      pathID: z.string().optional(),
    })
    .strict(),

  // ── Confirm-gated writes (CCR-4) ─────────────────────────────────────────────
  z
    .object({
      action: z.literal('toggle-global'),
      started: z.boolean(),
      engines: z.enum(['wander', 'path', 'both']).optional(), // default both
      confirm: z.literal(true, {
        errorMap: () => ({
          message: 'toggle-global requires confirm:true (starts/stops ALL patrol movement on the scene)',
        }),
      }),
    })
    .strict(),
  z
    .object({
      // Force the path engine to re-map Drawings + reset path indices (after creating path Drawings).
      action: z.literal('remap-paths'),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'remap-paths requires confirm:true (resets every path-follower to its first waypoint)' }),
      }),
    })
    .strict(),
]);

export type ModulePatrolInputType = z.infer<typeof ModulePatrolInput>;
