// Module Integration v1 Phase 14 — module-gatherer mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

export interface SpotStatusResult {
  pageUuid: string;
  name: string;
  tableUuid: string | null;
  maxDraws: number | null;
  drawsUsed: number;
  drawsRemaining: number | null;
  timeHours: number;
  resetAtWorldTime?: number;
  resetInSeconds?: number;
  minigame: boolean;
  minigameWarning?: string;
}

export interface GatherResult {
  pageUuid: string;
  actorUuid: string;
  result: unknown;
  quantityPathOk: boolean;
  quantityPathWarning?: string;
  // BUG-375 addendum: interactive-minigame pages open the dialog fire-and-forget.
  minigame?: 'opened';
  note?: string;
}

export interface HarvestResult {
  harvestedFrom: string;
  gatheringActorUuid: string;
  gatherSheet: unknown;
  result: unknown;
  drawsRemaining?: number;
  quantityPathOk: boolean;
  quantityPathWarning?: string;
  // BUG-375 addendum: interactive-minigame harvest sources open the dialog fire-and-forget.
  minigame?: 'opened';
  note?: string;
}

// Phase 14 full-functionality expansion.
export interface GatherSpot {
  pageUuid: string;
  name: string;
  journalName: string;
  tableUuid: string | null;
  drawsRemaining: number | null;
  minigame: boolean;
  exhausted: boolean;
}

export interface ListSpotsResult {
  count: number;
  spots: GatherSpot[];
}

export interface GenericGathererResult {
  [k: string]: unknown;
}

export interface ResetResult {
  pageUuid: string;
  name: string;
  reset: boolean;
}

export interface ConfigureResult {
  pageUuid: string;
  name: string;
  written: Record<string, unknown>;
  minigameWarning?: string;
}
