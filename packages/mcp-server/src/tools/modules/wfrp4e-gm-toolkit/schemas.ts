// Module Integration v1 Phase 11 — module-gmtoolkit mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

export interface GmtoolkitGroupTestResult {
  testSkill: string;
  ran: boolean;
  targetCount: number | null;
  aggregate: unknown;
}

export interface GmtoolkitAdvantageResult {
  // single-token modes
  tokenId?: string;
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
  actorId: string;
  actorName: string | null;
  status: string;
  change: number;
  previousValue: number;
  value: number;
}

export interface GmtoolkitSceneLightResult {
  sceneId: string | null;
  sceneName: string | null;
  tokenVision: boolean | null;
  globalLight: boolean | null;
}

export interface GmtoolkitPullResult {
  sceneId: string | null;
  sceneName: string | null;
  activated: boolean;
}

export interface GmtoolkitCompendiumResult {
  packId: string;
  wasPrivate: boolean;
  private: boolean;
}

export interface GmtoolkitD100Result {
  formula: string;
  total: number;
  flavor: string;
}

export interface GmtoolkitConditionsResult {
  actorId: string;
  actorName: string | null;
  count: number;
  conditions: Array<{ id: string; name: string | null; value: number | null }>;
}

export interface GmtoolkitSessionTurnoverResult {
  actorId: string;
  actorName: string | null;
  xpAwarded: number;
  experienceTotal: number;
  fortuneReset: { from: number; to: number } | null;
  sceneActivated: string | null;
}

export interface GmtoolkitAddXpResult {
  actorId: string;
  actorName: string | null;
  amount: number;
  reason: string;
  previousTotal: number;
  total: number;
  current: number;
}
