// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 6B — multiface-tiles action handlers.
//
// No module API — the module (multiface-tiles v14.001) exports no global.
// All operations use standard Foundry Tile document flag manipulation + tile.update().
// No sockets, no settings. All writes route through Foundry's standard embedded doc update path.
//
// Tile resolution: canvas.scene.tiles.get(tileId) or canvas.scene.tiles.find() by document.id.
// Falls back to tile.document for all flag reads and updates.
//
// cycle-tile-face is MCP-AUTHORED:
//   The module's tooltip2 i18n key says "Cycle alternative image" but there is NO cycle function
//   in main.js. This was a planned/stub feature that was never implemented. The cycle logic
//   is entirely authored here in the MCP layer:
//     faces = [originalImage (if set), ...altImages]
//     currentIdx = faces.indexOf(texture.src)   — if not found, treat as -1
//     nextIdx = (currentIdx + 1) % faces.length
//     tile.update({ "texture.src": faces[nextIdx] })
//
// MATT overlap warning (CRITICAL for handler docstring and response):
//   Both multiface-tiles (altImages flags) and MATT (monks-active-tiles files flags) can
//   write tile.texture.src. If a tile has both flag namespaces:
//     - MATT-driven texture changes can trigger multiface-tiles' originalImage silent
//       reassignment on next HUD render (multiface-tiles auto-reassigns originalImage when
//       texture.src is not in altImages and differs from originalImage).
//     - Recommend keeping multiface-tiles and MATT on SEPARATE tiles to avoid tracking conflicts.
//
// Notify contract:
//   - switch-tile-face, reset-to-original-face, cycle-tile-face: notify.updated('tile', tileName)
//   - add-tile-face, remove-tile-face, clear-tile-faces: notify.updated('tile', tileName)
//   - list-tile-faces, get-tile-original-face, get-tile-active-face: silent (reads)
//
// Post-write verify (DP-16):
//   After tile.update, re-read texture.src and/or altImages flag and include in response.
//
// Anchors:
//   - multiface-tiles/audit.md §2 + §4 + §5
//   - multiface-tiles/capability-manifest.json
//   - CCR-4: no confirm gates (no destructive-without-recovery operations)

import { notify } from '../../../notify.js';
import type { ModuleSceneAtmosphereInputType } from './schemas.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── Tile resolution ───────────────────────────────────────────────────────────

function getCanvas(): any {
  const c = (globalThis as any).canvas;
  if (!c?.scene) {
    throw new Error('CANVAS_UNAVAILABLE: canvas.scene not available');
  }
  return c;
}

/**
 * Resolve a Tile PlaceableObject by document ID from the current canvas scene.
 * Returns the PlaceableObject (not the document) for compatibility with canvas layer ops.
 */
function resolveTile(tileId: string): any {
  const c = getCanvas();
  const tiles = c.tiles;
  if (!tiles) {
    throw new Error('CANVAS_LAYER_UNAVAILABLE: canvas.tiles layer not available');
  }

  // Try direct map lookup (O(1))
  const byGet = tiles.get?.(tileId);
  if (byGet) return byGet;

  // Fall back to linear search by document.id
  const byFind = tiles.placeables?.find?.(
    (t: any) => t.id === tileId || t.document?.id === tileId,
  );
  if (byFind) return byFind;

  // BUG-356: final fallback — resolve the TileDocument straight from the scene collection.
  // canvas.tiles.get()/.placeables only cover tiles currently in the RENDERED layer; a tile
  // that exists in canvas.scene.tiles (persisted) but whose PlaceableObject isn't in the live
  // layer (foreground sublayer inactive, canvas mid-render) would 404 above even though sibling
  // reads succeeded a moment earlier. getTileDoc() unwraps the {document} shape transparently.
  const bySceneTiles = c.scene?.tiles?.get?.(tileId);
  if (bySceneTiles) return { document: bySceneTiles };

  throw new Error(`TILE_NOT_FOUND: No Tile with id "${tileId}" on the current scene "${c.scene?.name ?? c.scene?.id}"`);
}

/**
 * Get the tile document from a PlaceableObject (or the object itself if it's already a doc).
 */
function getTileDoc(tile: any): any {
  return tile.document ?? tile;
}

/**
 * Get the display name for a tile (for notify labels).
 */
function getTileName(tileDoc: any, tileId: string): string {
  return tileDoc?.name ?? tileDoc?.texture?.src?.split('/').pop() ?? tileId;
}

// ── Type aliases ──────────────────────────────────────────────────────────────

type SwitchTileFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'switch-tile-face' }>;
type ListTileFacesInput = Extract<ModuleSceneAtmosphereInputType, { action: 'list-tile-faces' }>;
type GetTileOriginalFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-tile-original-face' }>;
type GetTileActiveFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'get-tile-active-face' }>;
type ResetToOriginalFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'reset-to-original-face' }>;
type AddTileFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'add-tile-face' }>;
type RemoveTileFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'remove-tile-face' }>;
type CycleTileFaceInput = Extract<ModuleSceneAtmosphereInputType, { action: 'cycle-tile-face' }>;
type ClearTileFacesInput = Extract<ModuleSceneAtmosphereInputType, { action: 'clear-tile-faces' }>;

// ── switch-tile-face ──────────────────────────────────────────────────────────

export async function handleSwitchTileFace(input: SwitchTileFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const currentSrc = tileDoc.texture?.src ?? null;

    // No-op guard: skip if already on this face
    if (currentSrc === input.facePath) {
      notify.info(`tile: ${tileName} — switch-tile-face: already on this face, no change`);
      return {
        success: true,
        data: {
          tileId: input.tileId,
          tileName,
          facePath: input.facePath,
          changed: false,
          note: 'Already on this face — no update needed.',
        },
      };
    }

    await tileDoc.update({ 'texture.src': input.facePath });

    // Post-write verify
    const verifiedSrc = tileDoc.texture?.src ?? null;

    notify.updated('tile', tileName, {
      summary: `switch-tile-face: path=${input.facePath}`,
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        previousFacePath: currentSrc,
        facePath: input.facePath,
        changed: true,
        verifiedTextureSrc: verifiedSrc,
        verifiedMatch: verifiedSrc === input.facePath,
        mattOverlapNote: 'If this tile also has monks-active-tiles flags, MATT-driven texture changes can conflict with multiface-tiles originalImage tracking. Keep multiface-tiles and MATT on separate tiles.',
      },
    };
  } catch (e) {
    return { success: false, error: `SWITCH_TILE_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── list-tile-faces ───────────────────────────────────────────────────────────

export async function handleListTileFaces(input: ListTileFacesInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const altImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];
    const originalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;
    const activeSrc: string | null = tileDoc.texture?.src ?? null;

    // Determine which face is active
    let activeFaceLabel: string;
    if (activeSrc === originalImage) {
      activeFaceLabel = 'originalImage';
    } else {
      const altIdx = altImages.indexOf(activeSrc ?? '');
      activeFaceLabel = altIdx >= 0 ? `altImages[${altIdx}]` : 'unknown';
    }

    // Build the flat faces list the mcp-server formatter consumes
    // ({ label, path, isActive }). originalImage first (if tracked), then each altImage.
    const faces: Array<{ label: string; path: string; isActive: boolean }> = [];
    if (originalImage) {
      faces.push({ label: 'originalImage', path: originalImage, isActive: activeSrc === originalImage });
    }
    altImages.forEach((p, i) => {
      faces.push({ label: `altImages[${i}]`, path: p, isActive: activeSrc === p });
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        activeSrc,
        activeFace: activeSrc,
        activeFaceLabel,
        originalImage,
        altImages,
        altImagesCount: altImages.length,
        totalFaces: (originalImage ? 1 : 0) + altImages.length,
        faces,
      },
    };
  } catch (e) {
    return { success: false, error: `LIST_TILE_FACES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-tile-original-face ────────────────────────────────────────────────────

export async function handleGetTileOriginalFace(input: GetTileOriginalFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const originalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        originalImage,
        hasOriginalImage: originalImage !== null,
        note: originalImage === null
          ? 'originalImage flag not set — no alt faces have been added yet. Add a face via add-tile-face to initialize it.'
          : 'originalImage is the texture.src saved when the first alt face was added.',
      },
    };
  } catch (e) {
    return { success: false, error: `GET_TILE_ORIGINAL_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-tile-active-face ──────────────────────────────────────────────────────

export async function handleGetTileActiveFace(input: GetTileActiveFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const activeSrc: string | null = tileDoc.texture?.src ?? null;
    const originalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;
    const altImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];

    let activeFaceLabel: string;
    if (activeSrc === originalImage && originalImage !== null) {
      activeFaceLabel = 'originalImage';
    } else {
      const altIdx = altImages.indexOf(activeSrc ?? '');
      activeFaceLabel = altIdx >= 0 ? `altImages[${altIdx}]` : 'unknown';
    }

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        activeSrc,
        activeFaceLabel,
        originalImage,
      },
    };
  } catch (e) {
    return { success: false, error: `GET_TILE_ACTIVE_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── reset-to-original-face ────────────────────────────────────────────────────

export async function handleResetToOriginalFace(input: ResetToOriginalFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const originalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;

    if (!originalImage) {
      return {
        success: false,
        error: `RESET_TO_ORIGINAL_FACE_ERROR: No originalImage flag on tile "${tileName}" (${input.tileId}). Use add-tile-face to set up alt faces first.`,
      };
    }

    const currentSrc = tileDoc.texture?.src ?? null;

    if (currentSrc === originalImage) {
      notify.info(`tile: ${tileName} — reset-to-original-face: already on original face, no change`);
      return {
        success: true,
        data: {
          tileId: input.tileId,
          tileName,
          originalImage,
          changed: false,
          note: 'Already on the original face — no update needed.',
        },
      };
    }

    await tileDoc.update({ 'texture.src': originalImage });

    // Post-write verify
    const verifiedSrc = tileDoc.texture?.src ?? null;

    notify.updated('tile', tileName, {
      summary: `reset-to-original-face: restored originalImage`,
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        previousFacePath: currentSrc,
        originalImage,
        changed: true,
        verifiedTextureSrc: verifiedSrc,
        verifiedMatch: verifiedSrc === originalImage,
      },
    };
  } catch (e) {
    return { success: false, error: `RESET_TO_ORIGINAL_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── add-tile-face ─────────────────────────────────────────────────────────────

export async function handleAddTileFace(input: AddTileFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const currentAltImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];
    const currentOriginalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;

    // Build updated altImages
    const newAltImages = [...currentAltImages, input.facePath];

    // Lazy-init originalImage on first alt face add
    const updateData: Record<string, unknown> = {
      flags: { 'multiface-tiles': { altImages: newAltImages } },
    };

    let originalImageSet = false;
    if (!currentOriginalImage) {
      const currentSrc = tileDoc.texture?.src ?? '';
      if (currentSrc) {
        updateData.flags = {
          'multiface-tiles': {
            altImages: newAltImages,
            originalImage: currentSrc,
          },
        };
        originalImageSet = true;
      }
    }

    await tileDoc.update(updateData);

    // Post-write verify
    const verifiedAltImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];
    const verifiedOriginalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;

    notify.updated('tile', tileName, {
      summary: `add-tile-face: added path=${input.facePath} (total ${newAltImages.length} alt faces)`,
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        addedFacePath: input.facePath,
        altImages: newAltImages,
        altImagesCount: newAltImages.length,
        originalImage: verifiedOriginalImage,
        originalImageSetOnFirstAdd: originalImageSet,
        verifiedAltImages,
        verifiedAltImagesCount: verifiedAltImages.length,
      },
    };
  } catch (e) {
    return { success: false, error: `ADD_TILE_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── remove-tile-face ──────────────────────────────────────────────────────────

export async function handleRemoveTileFace(input: RemoveTileFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const currentAltImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];

    if (!currentAltImages.includes(input.facePath)) {
      return {
        success: false,
        error: `REMOVE_TILE_FACE_ERROR: Path "${input.facePath}" not found in altImages for tile "${tileName}" (${input.tileId}). Use list-tile-faces to see available faces.`,
      };
    }

    const newAltImages = currentAltImages.filter((p) => p !== input.facePath);
    const activeSrc = tileDoc.texture?.src ?? null;
    const wasActive = activeSrc === input.facePath;

    await tileDoc.update({
      flags: { 'multiface-tiles': { altImages: newAltImages } },
    });

    // Post-write verify
    const verifiedAltImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];

    notify.updated('tile', tileName, {
      summary: `remove-tile-face: removed path=${input.facePath} (${newAltImages.length} alt faces remain)`,
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        removedFacePath: input.facePath,
        wasActiveFace: wasActive,
        altImages: newAltImages,
        altImagesCount: newAltImages.length,
        verifiedAltImages,
        verifiedAltImagesCount: verifiedAltImages.length,
        activeStateNote: wasActive
          ? 'WARNING: The removed face was the active face. Call switch-tile-face or reset-to-original-face to restore a valid state.'
          : null,
      },
    };
  } catch (e) {
    return { success: false, error: `REMOVE_TILE_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── cycle-tile-face ───────────────────────────────────────────────────────────
//
// MCP-AUTHORED cycle logic (module never implemented this despite i18n tooltip2 stub).
//
// Cycle sequence: [originalImage (if set), ...altImages]
// Current index determined by finding texture.src in the sequence.
// Wraps: after last altImage, returns to first element in sequence.

export async function handleCycleTileFace(input: CycleTileFaceInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const altImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];
    const originalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;
    const currentSrc: string | null = tileDoc.texture?.src ?? null;

    if (altImages.length === 0) {
      return {
        success: false,
        error: `CYCLE_TILE_FACE_ERROR: No alt faces on tile "${tileName}" (${input.tileId}). Add faces via add-tile-face first.`,
      };
    }

    // Build the full cycle sequence
    const faces: string[] = originalImage ? [originalImage, ...altImages] : [...altImages];

    if (faces.length < 2) {
      return {
        success: false,
        error: `CYCLE_TILE_FACE_ERROR: Only one face available on tile "${tileName}" — nothing to cycle to.`,
      };
    }

    const currentIdx = faces.indexOf(currentSrc ?? '');
    // If currentSrc is not in the sequence, start from index 0
    const nextIdx = (currentIdx + 1) % faces.length;
    const nextFace = faces[nextIdx];

    await tileDoc.update({ 'texture.src': nextFace });

    // Post-write verify
    const verifiedSrc = tileDoc.texture?.src ?? null;

    notify.updated('tile', tileName, {
      summary: `cycle-tile-face: advanced to index ${nextIdx} (path=${nextFace})`,
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        previousFacePath: currentSrc,
        previousFaceIndex: currentIdx,
        nextFacePath: nextFace,
        nextFaceIndex: nextIdx,
        facesInCycle: faces,
        facesCount: faces.length,
        verifiedTextureSrc: verifiedSrc,
        verifiedMatch: verifiedSrc === nextFace,
        authoredNote: 'cycle-tile-face is MCP-authored — the module\'s tooltip2 i18n key exists but the function was never implemented in main.js.',
        mattOverlapNote: 'If this tile also has monks-active-tiles flags, MATT-driven texture changes can conflict with originalImage tracking. Keep multiface-tiles and MATT on separate tiles.',
      },
    };
  } catch (e) {
    return { success: false, error: `CYCLE_TILE_FACE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── clear-tile-faces ──────────────────────────────────────────────────────────

export async function handleClearTileFaces(input: ClearTileFacesInput): Promise<Envelope<unknown>> {
  try {
    const tile = resolveTile(input.tileId);
    const tileDoc = getTileDoc(tile);
    const tileName = getTileName(tileDoc, input.tileId);

    const currentAltImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];
    const currentOriginalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;
    const hadFaces = currentAltImages.length > 0 || currentOriginalImage !== null;

    // Clear altImages and originalImage
    await tileDoc.update({
      flags: { 'multiface-tiles': { altImages: [], originalImage: null } },
    });

    // Post-write verify
    const verifiedAltImages: string[] = tileDoc.getFlag?.('multiface-tiles', 'altImages') ?? [];
    const verifiedOriginalImage: string | null = tileDoc.getFlag?.('multiface-tiles', 'originalImage') ?? null;

    notify.updated('tile', tileName, {
      summary: `clear-tile-faces: removed ${currentAltImages.length} alt faces and originalImage`,
    });

    return {
      success: true,
      data: {
        tileId: input.tileId,
        tileName,
        hadFaces,
        clearedAltImagesCount: currentAltImages.length,
        clearedOriginalImage: currentOriginalImage,
        verifiedAltImages,
        verifiedOriginalImage,
        activeSrc: tileDoc.texture?.src ?? null,
        note: 'Alt faces cleared. The tile\'s active texture.src is unchanged — switch or reset manually if needed.',
      },
    };
  } catch (e) {
    return { success: false, error: `CLEAR_TILE_FACES_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
