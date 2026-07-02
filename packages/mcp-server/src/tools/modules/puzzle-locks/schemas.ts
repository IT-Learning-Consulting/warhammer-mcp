// Module Integration v2 Phase 13B — module-puzzle-locks mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side (handlers/modules/puzzle-locks/
// schemas.ts). This file only carries typed response shapes for this.query<T> (DP-15 — never <any>).

export interface PuzzleLocksGeneralConfig {
  lockType: string;
  label?: string;
  description?: string;
  unlocked?: boolean;
  attempts?: number;
  unlockSound?: string;
  interactionSound?: string;
  backgroundImage?: string;
  glow?: boolean;
  textColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryFont?: string;
  secondaryFont?: string;
  unlockMacro?: string;
  permission?: number;
  userPermissions?: number;
  [key: string]: unknown;
}

export interface PuzzleLocksAttachResult {
  action: 'attach-puzzle';
  documentUuid: string;
  lockType: string;
  general: PuzzleLocksGeneralConfig;
  typeConfig: Record<string, unknown>;
}

export interface PuzzleLocksGetResult {
  action: 'get-puzzle';
  documentUuid: string;
  general: PuzzleLocksGeneralConfig | null;
  lockType: string | null;
  typeConfig: Record<string, unknown> | null;
}

export interface PuzzleLocksCheckStateResult {
  action: 'check-solve-state';
  documentUuid: string;
  lockType: string;
  unlocked: boolean;
  attempts: number;
}

export interface PuzzleLocksSetMacroResult {
  action: 'set-solve-macro';
  documentUuid: string;
  unlockMacro: string;
}

export interface PuzzleLocksRemoveResult {
  action: 'remove-puzzle';
  documentUuid: string;
  removedLockType: string;
}

export interface PuzzleLocksForceUnlockResult {
  action: 'force-unlock';
  documentUuid: string;
  lockType: string;
  wallDoorClosed: boolean;
  warning: string;
}

export type PuzzleLocksResult =
  | PuzzleLocksAttachResult
  | PuzzleLocksGetResult
  | PuzzleLocksCheckStateResult
  | PuzzleLocksSetMacroResult
  | PuzzleLocksRemoveResult
  | PuzzleLocksForceUnlockResult;

// Package-local duplicate per CCR-5 — keep byte-identical to handlers/modules/puzzle-locks/schemas.ts's
// PUZZLE_LOCKS_ACTIONS / LOCK_TYPES.

export const PUZZLE_LOCKS_ACTIONS = [
  'attach-puzzle',
  'get-puzzle',
  'check-solve-state',
  'set-solve-macro',
  'remove-puzzle',
  'force-unlock',
] as const;

export type PuzzleLocksAction = (typeof PUZZLE_LOCKS_ACTIONS)[number];

export const LOCK_TYPES = [
  'number-lock',
  'password-lock',
  'cryptex-lock',
  'item-lock',
  'image-wheel',
  'mosaic-lock',
  'fifteen-lock',
  'fill-blanks-lock',
  'four-by-four-lock',
  'match-lock',
  'switches-lock',
  'mastermind-lock',
  'sudoku-lock',
  'sound-lock',
] as const;

export type LockType = (typeof LOCK_TYPES)[number];
