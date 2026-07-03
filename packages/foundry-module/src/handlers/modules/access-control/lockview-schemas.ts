// DIALOG-PATH: DIALOG_FREE — schema-level annotation only; comment references the setViewDialog socket-message shape (see lockview.ts DIALOG_GUARDED header for the real runtime classification of that method) but this file contains only Zod schemas, no runtime calls.
// Module Integration v1 Phase 7C — LockView (Lock View) action Zod schemas.
//
// Every variant is .strict() (CCR-5 package-local). Spread into the discriminated
// union by access-control/schemas.ts. Action names match
// modules-docs/LockView/capability-manifest.json mcp_action values (parity source).
//
// Module: LockView v2.1.0. Global API: globalThis.lockView (NOT game.modules.get().api).
// Scene flag model: flags.LockView.{locks:{pan,zoom,boundingBox}, ui, sidebar, avDock,
//   autoscale, forceInitialView}. Per-Drawing: Drawing.flags.LockView.boundingBox.
//
// libWrapper (DEPENDENCY_GATED): lock ENFORCEMENT (Canvas.prototype.pan wrap) needs
// lib-wrapper. The bundled shim lets LockView load without it, but locks won't enforce.
// Per user decision (2026-06-13): lock-write actions WRITE the flag + return a
// libWrapperActive warning — they do NOT hard-block.
//
// Confirm gates (CCR-4): forced-viewport actions (force-viewport-absolute/relative,
// clone-gm-view, set-view-dialog, set-view-with-pan-mode) directly move the player's
// camera → require confirm:true.
//
// NOTE: get-lock-state is the shared read action; it is declared in locknkey-schemas.ts
// and routed to LockView by the dispatcher when documentId is absent. It is NOT
// redeclared here (discriminated-union literals must be unique).
//
// PRD mis-attribution corrections (do NOT implement): LockView has NO token-lock and
// NO zoom min/max — there is no such API/flag. Surfaced in the skill body.

import { z } from 'zod';

// ── get-scene-flags ─────────────────────────────────────────────────────────────
// Read LockView scene flags (locks/ui/sidebar/avDock/autoscale/forceInitialView).
export const getSceneFlagsInput = z.object({
  action: z.literal('get-scene-flags'),
  /** Scene ID/UUID; defaults to active scene. */
  sceneId: z.string().optional(),
  /** Optional specific flag key to read (e.g. 'locks'); omit for all LockView flags. */
  key: z.string().optional(),
}).strict();

// ── set-pan-lock / set-zoom-lock ─────────────────────────────────────────────────
// lockView.locks.update({pan|zoom}, {save:true}) — persists to scene flag + broadcasts.
export const setPanLockInput = z.object({
  action: z.literal('set-pan-lock'),
  sceneId: z.string().optional(),
  /** true locks panning; false unlocks. */
  locked: z.boolean(),
}).strict();

export const setZoomLockInput = z.object({
  action: z.literal('set-zoom-lock'),
  sceneId: z.string().optional(),
  /** true locks zoom; false unlocks. (Binary — there is no zoom min/max.) */
  locked: z.boolean(),
}).strict();

// ── set-bounding-box-lock ────────────────────────────────────────────────────────
// Sets scene locks.boundingBox + optionally the per-Drawing boundingBox mode.
export const setBoundingBoxLockInput = z.object({
  action: z.literal('set-bounding-box-lock'),
  sceneId: z.string().optional(),
  /** Scene-level locks.boundingBox flag. */
  locked: z.boolean(),
  /** Optional Drawing ID to set the per-Drawing boundingBox mode on. */
  drawingId: z.string().optional(),
  /** Per-Drawing constraint mode (requires drawingId). */
  mode: z.enum(['disabled', 'owned', 'always']).optional(),
}).strict();

// ── set-autoscale ────────────────────────────────────────────────────────────────
export const setAutoscaleInput = z.object({
  action: z.literal('set-autoscale'),
  sceneId: z.string().optional(),
  /** Autoscale mode written to flags.LockView.autoscale. */
  mode: z.enum(['off', 'horizontal', 'vertical', 'autoInside', 'autoOutside', 'physical']),
}).strict();

// ── set-force-initial-view ───────────────────────────────────────────────────────
export const setForceInitialViewInput = z.object({
  action: z.literal('set-force-initial-view'),
  sceneId: z.string().optional(),
  /** flags.LockView.forceInitialView — pan to scene.initial on scene load. */
  enabled: z.boolean(),
}).strict();

// ── set-ui-hide ──────────────────────────────────────────────────────────────────
// Writes flags.LockView.ui (GUIDANCE_ONLY for the DOM effect — flag write is server-side).
export const setUiHideInput = z.object({
  action: z.literal('set-ui-hide'),
  sceneId: z.string().optional(),
  /** UI hide config object, e.g. { hideOn:'sceneLoad', sidebar:true, hotbar:true }. */
  ui: z.record(z.string(), z.union([z.boolean(), z.string()])),
}).strict();

// ── set-sidebar-behavior ─────────────────────────────────────────────────────────
export const setSidebarBehaviorInput = z.object({
  action: z.literal('set-sidebar-behavior'),
  sceneId: z.string().optional(),
  /** flags.LockView.sidebar.sceneLoad. */
  sceneLoad: z.enum(['noChange', 'collapse', 'expand']).optional(),
  /** Exclude sidebar width from viewbox/autoscale calcs. */
  exclude: z.boolean().optional(),
  /** Make the sidebar opaque. */
  blacken: z.boolean().optional(),
}).strict();

// ── trigger-initial-view ─────────────────────────────────────────────────────────
export const triggerInitialViewInput = z.object({
  action: z.literal('trigger-initial-view'),
  sceneId: z.string().optional(),
}).strict();

// ── trigger-autoscale ────────────────────────────────────────────────────────────
export const triggerAutoscaleInput = z.object({
  action: z.literal('trigger-autoscale'),
  sceneId: z.string().optional(),
}).strict();

// ── broadcast-refresh ────────────────────────────────────────────────────────────
// lockView.socket.refresh() — full LockView refresh on all clients.
export const broadcastRefreshInput = z.object({
  action: z.literal('broadcast-refresh'),
}).strict();

// ── pull-static-users ────────────────────────────────────────────────────────────
// lockView.socket.pullStaticUsers(sceneId) — force static users to a scene.
export const pullStaticUsersInput = z.object({
  action: z.literal('pull-static-users'),
  /** Scene ID to pull static users to; defaults to active scene. */
  sceneId: z.string().optional(),
}).strict();

// ── force-viewport-absolute (SUPPORTED_WITH_CONFIRMATION) ─────────────────────────
export const forceViewportAbsoluteInput = z.object({
  action: z.literal('force-viewport-absolute'),
  /** Target user ID. */
  userId: z.string().min(1),
  /** Absolute canvas position. */
  position: z.object({ x: z.number(), y: z.number() }).strict(),
  /** Optional viewport width (drives zoom-to-fit). */
  width: z.number().optional(),
  /** CCR-4: required — directly moves the player's camera. */
  confirm: z.literal(true),
}).strict();

// ── force-viewport-relative (SUPPORTED_WITH_CONFIRMATION) ─────────────────────────
export const forceViewportRelativeInput = z.object({
  action: z.literal('force-viewport-relative'),
  userId: z.string().min(1),
  /** Relative offset / scale. */
  position: z.object({ x: z.number().optional(), y: z.number().optional(), scale: z.number().optional() }).strict(),
  confirm: z.literal(true),
}).strict();

// ── clone-gm-view (SUPPORTED_WITH_CONFIRMATION) ───────────────────────────────────
// lockView.apps.cloneView.apply(pan, zoom, users) — push GM view to players.
export const cloneGmViewInput = z.object({
  action: z.literal('clone-gm-view'),
  /** Copy GM pan. Defaults true. */
  pan: z.boolean().optional(),
  /** Copy GM zoom. Defaults true. */
  zoom: z.boolean().optional(),
  /** Target user IDs. */
  userIds: z.array(z.string()).min(1),
  confirm: z.literal(true),
}).strict();

// ── set-view-dialog (SUPPORTED_WITH_CONFIRMATION) ─────────────────────────────────
// lockView.socket.setViewDialog(data, users[]) — raw dialog-style view push.
export const setViewDialogInput = z.object({
  action: z.literal('set-view-dialog'),
  /** Raw setViewDialog data payload (pan/zoom modes + params). */
  data: z.record(z.string(), z.unknown()),
  /** Target user IDs (flat array of user ID strings). */
  userIds: z.array(z.string()).min(1),
  confirm: z.literal(true),
}).strict();

// ── set-view-with-pan-mode (SUPPORTED_WITH_CONFIRMATION) ──────────────────────────
// Convenience over setViewDialog with named pan/zoom modes.
export const setViewWithPanModeInput = z.object({
  action: z.literal('set-view-with-pan-mode'),
  userIds: z.array(z.string()).min(1),
  /** Pan mode. */
  pan: z.enum([
    'noChange', 'initialView', 'moveGridSpaces', 'moveByCoords', 'moveToCoords',
    'cloneView', 'horizontal', 'vertical', 'autoInside', 'autoOutside',
  ]).optional(),
  /** Zoom mode. */
  zoom: z.enum(['noChange', 'set', 'initialView', 'physical', 'cloneView']).optional(),
  /** Coordinates for moveByCoords/moveToCoords. */
  coordinates: z.object({ x: z.number().optional(), y: z.number().optional() }).strict().optional(),
  /** Grid-space offset for moveGridSpaces. */
  gridSpaces: z.object({ x: z.number().optional(), y: z.number().optional() }).strict().optional(),
  /** Explicit scale for zoom mode 'set'. */
  scale: z.number().optional(),
  confirm: z.literal(true),
}).strict();

// ── Exported variant array (spread into the discriminated union by schemas.ts) ──
export const lockviewVariants = [
  getSceneFlagsInput,
  setPanLockInput,
  setZoomLockInput,
  setBoundingBoxLockInput,
  setAutoscaleInput,
  setForceInitialViewInput,
  setUiHideInput,
  setSidebarBehaviorInput,
  triggerInitialViewInput,
  triggerAutoscaleInput,
  broadcastRefreshInput,
  pullStaticUsersInput,
  forceViewportAbsoluteInput,
  forceViewportRelativeInput,
  cloneGmViewInput,
  setViewDialogInput,
  setViewWithPanModeInput,
] as const;
