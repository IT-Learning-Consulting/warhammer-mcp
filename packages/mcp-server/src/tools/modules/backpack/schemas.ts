// Module Integration v2 Phase 12 — module-backpack mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Backpack v1.2.5. 10 actions over a world-settings-backed per-actor storage overlay. Each handler
// return carries `action` as a discriminant; BackpackResult is their union so the tool stays typed
// without <any>.

export interface BackpackItemPojo {
  _id: string;
  name: string;
  [key: string]: unknown;
}

export interface BackpackSlotLock {
  itemId: string;
  length?: number;
  indices?: number[];
}

export interface BackpackUserRecord {
  userId: string;
  limit: number;
}

export interface BackpackPlayerData {
  id: string;
  name: string;
  avatar?: string;
  isActive?: boolean;
  backpackLimit?: number;
  character?: string;
}

// ── read ──────────────────────────────────────────────────────────────────────

export interface BackpackReadActorResult {
  action: 'read';
  actorId: string;
  items: (BackpackItemPojo | null)[];
  limit: number;
  locks: Record<string, BackpackSlotLock>;
}

export interface BackpackReadGlobalResult {
  action: 'read';
  defaultLimit: number;
  players: BackpackPlayerData[];
  userRecords: BackpackUserRecord[];
}

export type BackpackReadResult = BackpackReadActorResult | BackpackReadGlobalResult;

// ── atomic round-trip ────────────────────────────────────────────────────────

export interface BackpackAddItemResult {
  action: 'add-item';
  actorId: string;
  slotIndex: number;
  item: BackpackItemPojo;
}

export interface BackpackRemoveItemResult {
  action: 'remove-item';
  actorId: string;
  slotIndex: number;
  itemId: string;
}

// ── storage-only writes ──────────────────────────────────────────────────────

export interface BackpackMoveItemResult {
  action: 'move-item';
  actorId: string;
  fromSlot: number;
  toSlot: number;
}

export interface BackpackSetLimitActorResult {
  action: 'set-limit';
  target: 'actor';
  actorId: string;
  limit: number;
}
export interface BackpackSetLimitDefaultResult {
  action: 'set-limit';
  target: 'default';
  limit: number;
}
export type BackpackSetLimitResult = BackpackSetLimitActorResult | BackpackSetLimitDefaultResult;

export interface BackpackSetUserLimitResult {
  action: 'set-user-limit';
  userId: string;
  limit: number;
}

export interface BackpackRemoveUserResult {
  action: 'remove-user';
  userId: string;
}

export interface BackpackLockSlotsResult {
  action: 'lock-slots';
  actorId: string;
  leaderSlot: number;
  lock: BackpackSlotLock;
}

export interface BackpackClearLocksResult {
  action: 'clear-locks';
  actorId: string;
}

// ── reset (confirm-gated) ────────────────────────────────────────────────────

export interface BackpackResetResult {
  action: 'reset';
  cleared: true;
}

export type BackpackResult =
  | BackpackReadResult
  | BackpackAddItemResult
  | BackpackRemoveItemResult
  | BackpackMoveItemResult
  | BackpackSetLimitResult
  | BackpackSetUserLimitResult
  | BackpackRemoveUserResult
  | BackpackLockSlotsResult
  | BackpackClearLocksResult
  | BackpackResetResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 10 actions) ──
// Package-local duplicate per CCR-5 (no cross-package import) — keep byte-identical to
// handlers/modules/backpack/schemas.ts's BACKPACK_ACTIONS.

export const BACKPACK_ACTIONS = [
  'read',
  'add-item',
  'remove-item',
  'move-item',
  'set-limit',
  'set-user-limit',
  'remove-user',
  'lock-slots',
  'clear-locks',
  'reset',
] as const;

export type BackpackAction = (typeof BACKPACK_ACTIONS)[number];
