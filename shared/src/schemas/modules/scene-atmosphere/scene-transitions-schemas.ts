// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 6B — scene-transitions action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys.
// Imported by scene-atmosphere/schemas.ts and spread into the discriminated union.
//
// Hard dependency: socketlib must be active for play-transition and end-transition.
// The dispatcher enforces a SOCKETLIB_ACTIONS guard (like WOUND_ACTIONS) on these two.
//
// Per-scene flag shape: flags['scene-transitions'].transition = { options: SceneTransitionOptions }
// Read/write: scene.setFlag / scene.getFlag / scene.unsetFlag('scene-transitions','transition',...)
//
// CRITICAL: fromSocket field — NEVER set in outbound calls. The macro() routing function
// sets fromSocket=true automatically when dispatching. Setting it in outbound calls would
// cause the macro() to execute locally instead of broadcasting via socketlib.
//
// All 22 SceneTransitionOptions fields are exposed (source-verified from audit.md §3).
//
// Confirm gates (CCR-4):
//   delete-scene-transition requires confirm:true.
//
// Anchors:
//   - scene-transitions/capability-manifest.json mcp_action = module-scene-atmosphere.<action>
//   - scene-transitions/audit.md §3 Transition Options + §4 Primary API + §6 Per-Scene Flag
//   - CCR-4: confirm gate on delete-scene-transition
//   - CCR-5: schemas promoted to @foundry-mcp/shared (ADR-020)

import { z } from 'zod';

// ── Shared: SceneTransitionOptions sub-schema ─────────────────────────────────
//
// All 22 user-facing SceneTransitionOptions fields (source-verified).
// Internal/derived fields (fromSocket, action:"end", showCloseButton, isVideo, zIndex, sourceType)
// are NOT exposed — they are set internally by the module's routing logic.
// The `users` field is exposed here for targeted delivery.
//
// Note: fromSocket MUST NOT appear here. The macro() routing sets it automatically.

const transitionOptionsSchema = z.object({
  /**
   * Foundry Scene ID. Paired with activateScene:true to activate/view the scene
   * after the fadeIn completes. Pass "" or omit for no scene activation.
   */
  sceneID: z.string().optional(),
  /**
   * Raw HTML content shown in the overlay text layer. Rendered via triple-stache ({{{content}}}).
   * Supports block-level HTML: BLOCKQUOTE, CODE, H1-H6, P.
   * Example: "<h1>Act II: The Long Night</h1>"
   */
  content: z.string().optional(),
  /**
   * Hex color for the content text layer. Default: "#777777".
   * Example: "#c9a84c" for WFRP gold palette.
   */
  fontColor: z.string().optional(),
  /**
   * Font size in pixels for the text layer. Default: 28.
   */
  fontSize: z.number().int().positive().optional(),
  /**
   * Path to a background image OR video (.webm / .mp4) (Foundry-relative path or URL).
   * If video is detected by extension, module auto-derives `delay` from video duration.
   * Example: "modules/wfrp4e-core/assets/art/encounter-tavern.webp"
   */
  bgImg: z.string().optional(),
  /**
   * CSS background-position for image backgrounds. Default: "center center".
   * Example: "center top", "50% 20%"
   */
  bgPos: z.string().optional(),
  /**
   * Loop video background. Default: true.
   */
  bgLoop: z.boolean().optional(),
  /**
   * Mute video background audio track. Default: true.
   */
  bgMuted: z.boolean().optional(),
  /**
   * CSS background-size for image backgrounds. Default: "cover".
   * Example: "contain", "100% 100%"
   */
  bgSize: z.string().optional(),
  /**
   * Hex solid background colour used as the overlay base. Default: "#000000".
   * Also used as the div background-color under images/videos.
   */
  bgColor: z.string().optional(),
  /**
   * Opacity of the background layer (0–1). Default: 0.7.
   */
  bgOpacity: z.number().min(0).max(1).optional(),
  /**
   * Duration of jQuery fadeIn on the overlay element (milliseconds). Default: 400.
   */
  fadeIn: z.number().int().min(0).optional(),
  /**
   * Time the overlay stays visible before auto-destroying (milliseconds). Default: 4000.
   * For video backgrounds, this is overridden with the video's actual duration.
   */
  delay: z.number().int().min(0).optional(),
  /**
   * Duration of jQuery fadeOut when overlay destroys (milliseconds). Default: 1000.
   */
  fadeOut: z.number().int().min(0).optional(),
  /**
   * Path to a separate audio file played via AudioHelper.play() (local, not broadcast).
   * Example: "modules/wfrp4e-core/assets/sounds/dramatic-sting.mp3"
   */
  audio: z.string().optional(),
  /**
   * Volume for the audio track (0–1). Default: 1.
   */
  volume: z.number().min(0).max(1).optional(),
  /**
   * Loop the audio track. Default: true.
   */
  audioLoop: z.boolean().optional(),
  /**
   * Show a close button to players so they can end the transition on their client.
   * Default: true.
   */
  allowPlayersToEnd: z.boolean().optional(),
  /**
   * When the GM clicks the close button, socket-broadcasts end to all connected clients.
   * Default: true.
   */
  gmEndAll: z.boolean().optional(),
  /**
   * If true and game.user.isGM, the transition is not rendered for the GM.
   * Default: false. Use when the GM does not need to see the overlay.
   */
  gmHide: z.boolean().optional(),
  /**
   * If true, overlay z-index is 1 (Foundry UI visible through transition).
   * If false, z-index is 5000 (transition covers the UI). Default: false.
   * Note: GM always gets z-index 1 regardless of this setting.
   */
  showUI: z.boolean().optional(),
  /**
   * If true, the scene identified by sceneID is activated (GM) or viewed (player)
   * after the fadeIn completes. Requires sceneID to be set. Default: false.
   */
  activateScene: z.boolean().optional(),
  /**
   * Array of Foundry User IDs for targeted delivery.
   * If empty (default): broadcast to everyone or everyone-except-GM based on showMe.
   * If populated: deliver only to these specific users (showMe modifies whether
   * the GM's own ID is included/excluded from this list).
   */
  users: z.array(z.string()).optional(),
}).strict();

// ── play-transition ───────────────────────────────────────────────────────────
//
// Broadcast a transition overlay to clients via game.modules.get('scene-transitions').api.macro(options, showMe).
// REQUIRES socketlib active (SOCKETLIB_ACTIONS guard in dispatcher).
//
// showMe controls delivery routing:
//   true  + users:[]       → executeForEveryone (all clients including GM)
//   false + users:[]       → executeForOthers (all clients except GM)
//   any   + users:["id1"]  → executeForUsers (targeted; showMe includes/excludes GM's ID)
//
// Transient — no Foundry document is written. The transition exists only in browser DOM.
// To persist a default transition on a scene, use set-scene-transition instead.
//
// SOCKETLIB GUARD: This action requires socketlib active. The dispatcher checks
// requireModuleActive('socketlib') after the primary scene-transitions guard.

export const playTransitionInput = z.object({
  action: z.literal('play-transition'),
  /** Transition options — all 22 SceneTransitionOptions fields. */
  transitionOptions: transitionOptionsSchema,
  /**
   * Whether the GM (caller) also sees the transition.
   * true  → show to everyone including GM (executeForEveryone)
   * false → show to players only, not GM (executeForOthers)
   * When options.users[] is populated, showMe controls whether GM's ID is in/out of that list.
   * Default: true (show to everyone).
   */
  showMe: z.boolean().optional(),
}).strict();

// ── end-transition ────────────────────────────────────────────────────────────
//
// End the active transition for all clients by broadcasting action:"end" via socket.
// Calls API.macro({ action: "end" }, true) — executeForEveryone.
// REQUIRES socketlib active (SOCKETLIB_ACTIONS guard in dispatcher).
//
// Use after a manual-end-all flow (e.g. after an end-scene blackout) to ensure
// all clients have cleared the overlay even if gmEndAll:true didn't fire.

export const endTransitionInput = z.object({
  action: z.literal('end-transition'),
}).strict();

// ── set-scene-transition ──────────────────────────────────────────────────────
//
// Persist a default transition on a Scene document.
// Writes: scene.setFlag('scene-transitions', 'transition', { options: {...} })
// The saved transition is loaded by the scene context menu "Play Transition" button.
//
// Also supports writing the world default-options setting and show-journal-header-transition.
// These are distinct from the per-scene flag: they affect the default base values for ALL
// transitions when SceneTransitionOptions is constructed.
//
// subAction controls what is written:
//   'per-scene'     → write/update flags['scene-transitions'].transition on a specific scene
//   'world-default' → write game.settings('scene-transitions','default-options')
//   'show-journal'  → write game.settings('scene-transitions','show-journal-header-transition')

export const setSceneTransitionInput = z.object({
  action: z.literal('set-scene-transition'),
  /**
   * What to update:
   *   'per-scene'     — write/update the per-scene flag (sceneId required)
   *   'world-default' — write the world default-options setting (options required)
   *   'show-journal'  — toggle show-journal-header-transition world setting (showJournal required)
   */
  subAction: z.enum(['per-scene', 'world-default', 'show-journal']),
  /** Scene document ID or UUID. Required for subAction='per-scene'. */
  sceneId: z.string().optional(),
  /** Transition options to persist. Required for 'per-scene' and 'world-default'. */
  transitionOptions: transitionOptionsSchema.optional(),
  /** Boolean toggle for show-journal-header-transition. Required for 'show-journal'. */
  showJournal: z.boolean().optional(),
}).strict();

// ── get-scene-transition ──────────────────────────────────────────────────────
//
// Read the saved per-scene default transition (or world defaults).
// Returns { options: SceneTransitionOptions } or null if not configured.
//
// subAction:
//   'per-scene'     → read flags['scene-transitions'].transition from a specific scene
//   'world-default' → read game.settings('scene-transitions','default-options')

export const getSceneTransitionInput = z.object({
  action: z.literal('get-scene-transition'),
  /**
   * What to read:
   *   'per-scene'     — read the per-scene flag (sceneId required)
   *   'world-default' — read the world default-options setting
   */
  subAction: z.enum(['per-scene', 'world-default']),
  /** Scene document ID or UUID. Required for subAction='per-scene'. */
  sceneId: z.string().optional(),
}).strict();

// ── delete-scene-transition ───────────────────────────────────────────────────
//
// Delete (unset) the per-scene default transition flag from a Scene document.
// Calls: scene.unsetFlag('scene-transitions', 'transition')
// CCR-4: requires confirm:true — this removes the saved transition configuration.
//
// Does NOT affect the world default-options setting; only clears the per-scene override.

export const deleteSceneTransitionInput = z.object({
  action: z.literal('delete-scene-transition'),
  /** Scene document ID or UUID for which to delete the saved transition. */
  sceneId: z.string(),
  /**
   * CCR-4: Required true to confirm deletion of the per-scene transition flag.
   * This removes the saved transition configuration for the scene.
   */
  confirm: z.literal(true),
}).strict();

// ── Exported variant array (inserted into discriminated union by schemas.ts) ──

export const sceneTransitionsVariants = [
  playTransitionInput,
  endTransitionInput,
  setSceneTransitionInput,
  getSceneTransitionInput,
  deleteSceneTransitionInput,
] as const;
