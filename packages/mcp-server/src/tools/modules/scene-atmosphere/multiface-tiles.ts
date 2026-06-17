// Phase 8 (R8.4): multiface-tiles sub-family of module-scene-atmosphere — result interfaces + formatters
// extracted VERBATIM from scene-atmosphere.ts (no logic change; the split is purely to land
// each file <=600 lines). Imported back by the main tool's formatResult trampoline.
import { TileId } from '@foundry-mcp/shared';

// ── Phase 4B: multiface-tiles result shapes ───────────────────────────────────

export interface TileFaceEntry {
  label: string;
  path: string;
  isActive: boolean;
}

export interface SwitchTileFaceResult {
  tileId: TileId;
  tileName: string;
  previousFacePath?: string | null;
  facePath?: string;
  changed: boolean;
  verifiedTextureSrc?: string | null;
  verifiedMatch?: boolean;
  note?: string;
  mattOverlapNote?: string;
}

export interface ListTileFacesResult {
  tileId: TileId;
  originalImage: string | null;
  altImages: string[];
  activeFace: string | null;
  activeFaceLabel: string;
  totalFaces: number;
  faces: TileFaceEntry[];
}

export interface GetTileOriginalFaceResult {
  tileId: TileId;
  tileName: string;
  originalImage: string | null;
  hasOriginalImage: boolean;
  note?: string;
}

export interface GetTileActiveFaceResult {
  tileId: TileId;
  tileName: string;
  activeSrc: string | null;
  activeFaceLabel?: string;
  originalImage?: string | null;
}

export interface ResetToOriginalFaceResult {
  tileId: TileId;
  tileName: string;
  originalImage: string;
  previousFacePath?: string | null;
  changed: boolean;
  verifiedTextureSrc?: string | null;
  verifiedMatch?: boolean;
  note?: string;
}

export interface AddTileFaceResult {
  tileId: TileId;
  tileName: string;
  addedFacePath: string;
  altImages: string[];
  altImagesCount: number;
  originalImage: string | null;
  originalImageSetOnFirstAdd: boolean;
  verifiedAltImages: string[];
  verifiedAltImagesCount: number;
}

export interface RemoveTileFaceResult {
  tileId: TileId;
  tileName: string;
  removedFacePath: string;
  wasActiveFace: boolean;
  altImages: string[];
  altImagesCount: number;
  verifiedAltImages: string[];
  verifiedAltImagesCount: number;
  activeStateNote: string | null;
}

export interface CycleTileFaceResult {
  tileId: TileId;
  tileName: string;
  previousFacePath: string | null;
  previousFaceIndex: number;
  nextFacePath: string;
  nextFaceIndex: number;
  facesInCycle: string[];
  facesCount: number;
  verifiedTextureSrc: string | null;
  verifiedMatch: boolean;
  authoredNote: string;
  mattOverlapNote: string;
}

export interface ClearTileFacesResult {
  tileId: TileId;
  tileName: string;
  hadFaces: boolean;
  clearedAltImagesCount: number;
  clearedOriginalImage: string | null;
  verifiedAltImages: string[];
  verifiedOriginalImage: string | null;
  activeSrc: string | null;
  note: string;
}

export type MultifaceTilesResult =
  | SwitchTileFaceResult
  | ListTileFacesResult
  | GetTileOriginalFaceResult
  | GetTileActiveFaceResult
  | ResetToOriginalFaceResult
  | AddTileFaceResult
  | RemoveTileFaceResult
  | CycleTileFaceResult
  | ClearTileFacesResult;


// ── Phase 4B: multiface-tiles formatters (F03 — emit EVERY returned field) ───

export function formatSwitchTileFace(r: SwitchTileFaceResult): string {
  if (!r.changed) {
    return [
      `multiface-tiles: switch-tile-face — tile ${r.tileId} (${r.tileName}).`,
      `(was already the active face — no-op)`,
      r.note ? `Note: ${r.note}` : '',
    ].filter(Boolean).join('\n');
  }
  return [
    `multiface-tiles: switch-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Previous: ${r.previousFacePath ?? '(none)'} → New: ${r.facePath}`,
    `Verified face: ${r.verifiedTextureSrc ?? '(none)'} | Match: ${r.verifiedMatch}`,
    r.mattOverlapNote ? `Note: ${r.mattOverlapNote}` : '',
  ].filter(Boolean).join('\n');
}

export function formatListTileFaces(r: ListTileFacesResult): string {
  const rows = r.faces.map((f) => `  ${f.label}: ${f.path}${f.isActive ? ' [ACTIVE]' : ''}`);
  return [
    `multiface-tiles: list-tile-faces — tile ${r.tileId} — ${r.totalFaces} face(s).`,
    `Active face (${r.activeFaceLabel}): ${r.activeFace ?? '(none)'}`,
    `Original image: ${r.originalImage ?? '(not tracked)'}`,
    rows.join('\n'),
  ].join('\n');
}

export function formatGetTileOriginalFace(r: GetTileOriginalFaceResult): string {
  return [
    `multiface-tiles: get-tile-original-face — tile ${r.tileId} (${r.tileName}).`,
    `Original image: ${r.originalImage ?? '(not tracked)'} | Has original: ${r.hasOriginalImage}`,
    r.note ? `Note: ${r.note}` : '',
  ].filter(Boolean).join('\n');
}

export function formatGetTileActiveFace(r: GetTileActiveFaceResult): string {
  const labelSuffix = r.activeFaceLabel ? ` (${r.activeFaceLabel})` : '';
  return [
    `multiface-tiles: get-tile-active-face — tile ${r.tileId} (${r.tileName}).`,
    `Active face${labelSuffix}: ${r.activeSrc ?? '(none)'}`,
    r.originalImage !== undefined ? `Original image: ${r.originalImage ?? '(not tracked)'}` : '',
  ].filter(Boolean).join('\n');
}

export function formatResetToOriginalFace(r: ResetToOriginalFaceResult): string {
  if (!r.changed) {
    return [
      `multiface-tiles: reset-to-original-face — tile ${r.tileId} (${r.tileName}).`,
      `(was already on original face — no-op)`,
      r.note ? `Note: ${r.note}` : '',
    ].filter(Boolean).join('\n');
  }
  return [
    `multiface-tiles: reset-to-original-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Previous: ${r.previousFacePath ?? '(none)'} → Original: ${r.originalImage}`,
    `Verified face: ${r.verifiedTextureSrc ?? '(none)'} | Match: ${r.verifiedMatch}`,
  ].filter(Boolean).join('\n');
}

export function formatAddTileFace(r: AddTileFaceResult): string {
  return [
    `multiface-tiles: add-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Added: "${r.addedFacePath}"`,
    `Total alt count: ${r.altImagesCount} (verified: ${r.verifiedAltImagesCount})`,
    r.originalImageSetOnFirstAdd ? `Original image set to: "${r.originalImage}"` : `Original image was already: "${r.originalImage ?? '(none)'}"`,
  ].join('\n');
}

export function formatRemoveTileFace(r: RemoveTileFaceResult): string {
  return [
    `multiface-tiles: remove-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Removed: "${r.removedFacePath}"`,
    r.wasActiveFace ? 'Warning: removed face was the active face; tile will show previous texture until face is switched.' : '',
    `Total alt count: ${r.altImagesCount} (verified: ${r.verifiedAltImagesCount})`,
    r.activeStateNote ? `Note: ${r.activeStateNote}` : '',
  ].filter(Boolean).join('\n');
}

export function formatCycleTileFace(r: CycleTileFaceResult): string {
  return [
    `multiface-tiles: cycle-tile-face OK — tile ${r.tileId} (${r.tileName}).`,
    `Previous: ${r.previousFacePath ?? '(none)'} (index ${r.previousFaceIndex}) → New (index ${r.nextFaceIndex}/${r.facesCount - 1}): ${r.nextFacePath}`,
    `Verified face: ${r.verifiedTextureSrc ?? '(none)'} | Match: ${r.verifiedMatch}`,
    `Note: ${r.authoredNote}`,
    `Note: ${r.mattOverlapNote}`,
  ].join('\n');
}

export function formatClearTileFaces(r: ClearTileFacesResult): string {
  return [
    `multiface-tiles: clear-tile-faces OK — tile ${r.tileId} (${r.tileName}).`,
    `Had faces: ${r.hadFaces} | Cleared ${r.clearedAltImagesCount} alt face(s) | Original image was: ${r.clearedOriginalImage ?? '(none)'}`,
    `Verified altImages count: ${r.verifiedAltImages.length} | Verified originalImage: ${r.verifiedOriginalImage ?? '(null)'}`,
    `Active src: ${r.activeSrc ?? '(none)'}`,
    `Note: ${r.note}`,
  ].join('\n');
}

