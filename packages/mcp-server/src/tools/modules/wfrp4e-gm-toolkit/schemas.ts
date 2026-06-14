// Module Integration v1 Phase 11 — module-gmtoolkit mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

import type { TokenId, ActorId, SceneId, PackId } from '@foundry-mcp/shared';

export interface GmtoolkitGroupTestResult {
  testSkill: string;
  ran: boolean;
  targetCount: number | null;
  aggregate: unknown;
}

export interface GmtoolkitAdvantageResult {
  // single-token modes
  tokenId?: TokenId;
  actorName?: string | null;
  mode: string;
  previousValue?: number;
  value?: number;
  playerOwned?: boolean;
  note?: string;
  // clear-bulk
  clearedCount?: number;
}

export interface GmtoolkitSessionInfoResult {
  sessionID: string | null;
  date: string | null;
  time: string | null;
}

export interface GmtoolkitGroupResult {
  groupType: string;
  count: number;
  members: Array<{ id: string | null; name: string | null }>;
}

export interface GmtoolkitAdjustStatusResult {
  actorId: ActorId;
  actorName: string | null;
  status: string;
  change: number;
  previousValue: number;
  value: number;
}

export interface GmtoolkitSceneLightResult {
  sceneId: SceneId | null;
  sceneName: string | null;
  tokenVision: boolean | null;
  globalLight: boolean | null;
}

export interface GmtoolkitPullResult {
  sceneId: SceneId | null;
  sceneName: string | null;
  activated: boolean;
}

export interface GmtoolkitCompendiumResult {
  packId: PackId;
  wasPrivate: boolean;
  private: boolean;
}

export interface GmtoolkitD100Result {
  formula: string;
  total: number;
  flavor: string;
}

export interface GmtoolkitConditionsResult {
  actorId: ActorId;
  actorName: string | null;
  count: number;
  conditions: Array<{ id: string; name: string | null; value: number | null }>;
}

export interface GmtoolkitSessionTurnoverResult {
  actorId: ActorId;
  actorName: string | null;
  xpAwarded: number;
  experienceTotal: number;
  fortuneReset: { from: number; to: number } | null;
  sceneActivated: string | null;
}

export interface GmtoolkitAddXpResult {
  actorId: ActorId;
  actorName: string | null;
  amount: number;
  reason: string;
  previousTotal: number;
  total: number;
  current: number;
}
