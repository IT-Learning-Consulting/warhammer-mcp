// Module Integration v1 Phase 14 — module-patrol mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

import { DrawingId, SceneId } from '@foundry-mcp/shared';

export interface PatrolGlobalState {
  wanderStarted: boolean;
  pathStarted: boolean;
}

export interface GetConfigResult {
  tokenUuid: string;
  tokenName: string;
  flags: Record<string, unknown>;
  global: PatrolGlobalState;
}

export interface EnableTokenItem {
  tokenUuid: string;
  tokenName?: string;
  ok: boolean;
  error?: string;
  mode?: string;
  flags?: Record<string, unknown>;
}

export interface EnableTokenResult {
  mode: string;
  results: EnableTokenItem[];
}

export interface DisableTokenResult {
  results: EnableTokenItem[];
}

export interface SetZoneResult {
  drawingId: DrawingId;
  sceneId: SceneId;
  label: string;
  referenced: boolean;
}

export interface UndetectableResult {
  actorUuid: string;
  actorName: string;
  active: boolean;
}

export interface ToggleGlobalResult {
  started: boolean;
  engines: string;
  wanderStarted: boolean;
  pathStarted: boolean;
  note: string;
}

// Phase 14 full-functionality expansion.
export interface WorldSettingsResult {
  settings: Record<string, unknown>;
  runtime: Record<string, unknown>;
}

export interface ListTokensResult {
  sceneId: SceneId;
  filter: string;
  count: number;
  tokens: { tokenUuid: string; tokenName: string; mode: string; flags: Record<string, unknown> }[];
}

export interface GenericPatrolResult {
  [k: string]: unknown;
}
