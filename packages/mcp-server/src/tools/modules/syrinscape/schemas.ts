// Module Integration v2 Phase 13C — module-syrinscape mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. This file only carries typed
// response shapes for this.query<T> (DP-15 — never <any>).

export interface SyrinscapePlayActionResult {
  action: 'set-mood' | 'stop-mood' | 'play-element' | 'stop-element';
  id: string;
  accepted: true;
}

export interface SyrinscapeStopAllResult {
  action: 'stop-all';
  accepted: true;
}

export interface SyrinscapeIsPlayingResult {
  action: 'is-playing';
  elementId: string;
  playing: boolean;
  note?: string;
}

export interface SyrinscapeSoundsetRow {
  id: string;
  name: string;
  fullName: string;
}
// BUG-464 (Wave 2): both list results carry the bounded-page envelope.
export interface SyrinscapeListSoundsetsResult {
  action: 'list-soundsets';
  soundsets: SyrinscapeSoundsetRow[];
  hint?: string;
  totalAvailable?: number;
  truncated?: boolean;
  offset?: number;
  limit?: number;
}

export interface SyrinscapeMoodRow {
  id: string;
  name: string;
  soundset: string;
  soundsetFullName: string;
}
export interface SyrinscapeListMoodsResult {
  action: 'list-moods';
  moods: SyrinscapeMoodRow[];
  hint?: string;
  totalAvailable?: number;
  truncated?: boolean;
  offset?: number;
  limit?: number;
}

export type SyrinscapeResult =
  | SyrinscapePlayActionResult
  | SyrinscapeStopAllResult
  | SyrinscapeIsPlayingResult
  | SyrinscapeListSoundsetsResult
  | SyrinscapeListMoodsResult;

// Package-local duplicate per CCR-5 — keep byte-identical to handlers/modules/syrinscape/schemas.ts's
// SYRINSCAPE_ACTIONS.

export const SYRINSCAPE_ACTIONS = [
  'set-mood',
  'stop-mood',
  'play-element',
  'stop-element',
  'stop-all',
  'is-playing',
  'list-soundsets',
  'list-moods',
] as const;

export type SyrinscapeAction = (typeof SYRINSCAPE_ACTIONS)[number];
