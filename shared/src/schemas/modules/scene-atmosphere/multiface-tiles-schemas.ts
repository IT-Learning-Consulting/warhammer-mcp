// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 6B — multiface-tiles action Zod schemas.
//
// Every variant is .strict() — rejects unknown top-level keys.
// Imported by scene-atmosphere/schemas.ts and spread into the discriminated union.
//
// No module API — entire surface is Tile document flag manipulation + tile.texture.src write.
// No sockets, no settings. All operations resolve the tile from canvas.scene.tiles.get(tileId)
// or fall back to canvas.scene to find the tile document.
//
// Face data model (flags["multiface-tiles"] on Tile document):
//   altImages:     string[]  — ordered list of alt image paths
//   originalImage: string    — tile's original texture.src when first alt was added (lazy-init)
//   imageRemove:   boolean?  — UI-mode toggle only; meaningless to expose via MCP
//
// Active face: tile.texture.src (standard Tile field — no separate flag).
// Face switch is a real tile.update({ "texture.src": path }) — fully persisted, survives reload.
//
// cycle-tile-face is MCP-AUTHORED (module never implemented it despite tooltip2 i18n stub):
//   Read altImages + texture.src → compute next index (wrap: after last altImage returns to
//   originalImage if set, otherwise index 0) → tile.update({ "texture.src": nextPath }).
//
// MATT overlap note:
//   Both multiface-tiles and MATT (monks-active-tiles) can write tile.texture.src.
//   If a tile has both altImages flags AND MATT files flags, a MATT-driven texture change
//   can trigger multiface-tiles' originalImage silent reassignment on next HUD render.
//   RECOMMENDATION: Keep multiface-tiles and MATT managed tiles on SEPARATE tiles to avoid
//   tracking conflicts. Document this in caller-facing guidance.
//
// Anchors:
//   - multiface-tiles/capability-manifest.json mcp_action = module-scene-atmosphere.<action>
//   - multiface-tiles/audit.md §2 Face Data Model + §4 Face-Switch Mechanics + §5 MATT Overlap
//   - CCR-5: schemas promoted to @foundry-mcp/shared (ADR-020)

import { z } from 'zod';

// ── switch-tile-face ──────────────────────────────────────────────────────────
//
// Switch a tile to a specific face by path. Writes tile.update({ "texture.src": facePath }).
// The facePath should be one of the paths in altImages or originalImage.
// After update, all connected clients see the new texture immediately (standard Foundry broadcast).

export const switchTileFaceInput = z.object({
  action: z.literal('switch-tile-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
  /**
   * Full path to the face image (must match a path in altImages or originalImage).
   * Example: "modules/wfrp4e-core/assets/tiles/brazier_lit.webp"
   */
  facePath: z.string().min(1),
}).strict();

// ── list-tile-faces ───────────────────────────────────────────────────────────
//
// Read all faces for a tile. Returns altImages[], originalImage, and the active texture.src.
// Use as a pre-flight before switch-tile-face or cycle-tile-face.

export const listTileFacesInput = z.object({
  action: z.literal('list-tile-faces'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
}).strict();

// ── get-tile-original-face ────────────────────────────────────────────────────
//
// Read the originalImage flag — the tile's texture.src at the time the first alt face was added.
// Returns null if originalImage is not yet set (no alt faces have been added).

export const getTileOriginalFaceInput = z.object({
  action: z.literal('get-tile-original-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
}).strict();

// ── get-tile-active-face ──────────────────────────────────────────────────────
//
// Read the currently active face (tile.texture.src). Does not read flags.
// Use as a quick check of the current visual state without reading the full face list.

export const getTileActiveFaceInput = z.object({
  action: z.literal('get-tile-active-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
}).strict();

// ── reset-to-original-face ────────────────────────────────────────────────────
//
// Reset the tile to its originalImage face. Reads originalImage flag, then writes
// tile.update({ "texture.src": originalImage }).
// If originalImage is not set, returns an error (no reset possible).

export const resetToOriginalFaceInput = z.object({
  action: z.literal('reset-to-original-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
}).strict();

// ── add-tile-face ─────────────────────────────────────────────────────────────
//
// Add a new alt face path to a tile's altImages array. Reads the current altImages array,
// appends the new path, and writes back via tile.update({ flags: { "multiface-tiles": { altImages: [...] } } }).
// Also sets originalImage lazily if not yet set (first alt face write).
//
// Does not switch to the new face — use switch-tile-face after adding.

export const addTileFaceInput = z.object({
  action: z.literal('add-tile-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
  /**
   * File path to add as an alt face.
   * Example: "modules/wfrp4e-core/assets/tiles/chest_open.webp"
   * Supports .webp, .png, .jpg, .webm (video tiles).
   */
  facePath: z.string().min(1),
}).strict();

// ── remove-tile-face ──────────────────────────────────────────────────────────
//
// Remove an alt face path from a tile's altImages array. Reads altImages, filters out
// the target path, and writes back. Does not change the active texture.src.
// If the removed face is currently active, the caller should call switch-tile-face or
// reset-to-original-face to restore a valid state.

export const removeTileFaceInput = z.object({
  action: z.literal('remove-tile-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
  /**
   * Exact path to remove from altImages.
   * If the path is not found, returns an error (not a no-op).
   */
  facePath: z.string().min(1),
}).strict();

// ── cycle-tile-face ───────────────────────────────────────────────────────────
//
// MCP-AUTHORED: advance the tile to the next face in the cycle.
// The module's tooltip2 i18n key says "Cycle alternative image" but this function was
// NEVER implemented in main.js. The cycle logic is entirely authored here in MCP.
//
// Cycle algorithm:
//   faces = [originalImage, ...altImages]  (originalImage first, then alts in order)
//   if altImages is empty, returns error (no cycle possible)
//   currentIdx = faces.indexOf(texture.src) — -1 if current src not in faces
//   nextIdx = (currentIdx + 1) % faces.length
//   tile.update({ "texture.src": faces[nextIdx] })
//
// This provides a deterministic wrap-around cycle through all faces including the original.
// If originalImage is not set, only cycles through altImages (no originalImage in the sequence).

export const cycleTileFaceInput = z.object({
  action: z.literal('cycle-tile-face'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
}).strict();

// ── clear-tile-faces ──────────────────────────────────────────────────────────
//
// Remove ALL alt faces from a tile (set altImages to [] and unset originalImage).
// This effectively un-registers the tile from the multiface-tiles module.
// Does not change the active texture.src — the tile keeps its current face image.
//
// Use when archiving a tile or resetting it to plain tile status.

export const clearTileFacesInput = z.object({
  action: z.literal('clear-tile-faces'),
  /** Tile document ID on the current scene. */
  tileId: z.string(),
}).strict();

// ── Exported variant array (inserted into discriminated union by schemas.ts) ──

export const multifaceTilesVariants = [
  switchTileFaceInput,
  listTileFacesInput,
  getTileOriginalFaceInput,
  getTileActiveFaceInput,
  resetToOriginalFaceInput,
  addTileFaceInput,
  removeTileFaceInput,
  cycleTileFaceInput,
  clearTileFacesInput,
] as const;
