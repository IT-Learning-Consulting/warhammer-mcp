// Module Integration v2 Phase 8 — module-mortal-needs mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Mortal Needs v2.3.2. 26 actions across 9 idioms. Each handler return carries `action` as a
// discriminant; MortalNeedsResult is their union so the tool stays typed without <any>.

export interface MortalNeedsNeedState {
  value: number;
  min: number;
  max: number;
  lastChange: number;
  source: string;
}

export interface MortalNeedsGetNeedsResult {
  action: 'get-needs';
  entityId: string;
  needs: Record<string, MortalNeedsNeedState>;
}

export interface MortalNeedsGetNeedResult extends MortalNeedsNeedState {
  action: 'get-need';
  entityId: string;
  needId: string;
}

export interface MortalNeedsTrackedEntity {
  id: string;
  source: string;
  name: string;
  img: string;
  linkedActorId: string | null;
  needs: Record<string, MortalNeedsNeedState>;
}

export interface MortalNeedsListTrackedResult {
  action: 'list-tracked';
  count: number;
  tracked: MortalNeedsTrackedEntity[];
}

export interface MortalNeedsGetNeedConfigSingleResult {
  action: 'get-need-config';
  needId: string;
  config: Record<string, unknown>;
}

export interface MortalNeedsGetNeedConfigListResult {
  action: 'get-need-config';
  count: number;
  configs: Array<Record<string, unknown>>;
}

export interface MortalNeedsQueryCriticalResult {
  action: 'query-critical';
  count: number;
  actors: Array<Record<string, unknown>>;
}

export interface MortalNeedsQueryAboveThresholdResult {
  action: 'query-above-threshold';
  needId: string;
  threshold: number;
  count: number;
  actors: Array<Record<string, unknown>>;
}

export interface MortalNeedsHistoryEntry {
  id: string;
  timestamp: number;
  needId: string;
  previousValue: number;
  newValue: number;
  min: number;
  max: number;
  source: string;
  entityId: string;
}

export interface MortalNeedsGetNeedHistoryResult {
  action: 'get-need-history';
  entityId: string;
  needId: string | null;
  count: number;
  entries: MortalNeedsHistoryEntry[];
}

export interface MortalNeedsStressRelieveResult {
  action: 'stress-need' | 'relieve-need';
  entityId: string;
  needId: string;
  value: number;
  previousValue: number;
  min: number;
  max: number;
}

export interface MortalNeedsSetNeedResult {
  action: 'set-need';
  entityId: string;
  needId: string;
  value: number;
  requestedValue: number;
  clamped: boolean;
  min: number;
  max: number;
}

export interface MortalNeedsResetNeedResult {
  action: 'reset-need';
  entityId: string;
  needId: string;
  value: number;
}

export interface MortalNeedsTrackActorResult {
  action: 'track-actor';
  entityId: string;
  alreadyTracked: boolean;
}

export interface MortalNeedsBatchResult {
  action: 'batch-stress' | 'batch-relieve';
  needId: string;
  amount: number | null;
  affected: number;
  results: Record<string, number | null>;
}

export interface MortalNeedsShortRestResult {
  action: 'short-rest';
  reliefPercentage: number;
  affected: number;
  actors: Array<{ id: string; name: string; needs: Record<string, MortalNeedsNeedState> }>;
}

export interface MortalNeedsLongRestSingleResult {
  action: 'long-rest';
  entityId: string;
  partyWide: false;
}

export interface MortalNeedsLongRestPartyResult {
  action: 'long-rest';
  partyWide: true;
  affected: number;
  entityIds: string[];
}

export interface MortalNeedsConfigureNeedResult {
  action: 'configure-need' | 'enable-need' | 'disable-need';
  needId: string;
  config: Record<string, unknown>;
}

export interface MortalNeedsConditionConsequenceResult {
  action: 'apply-consequence' | 'remove-consequence';
  entityId: string;
  needId: string;
  consequenceType: 'condition-apply';
  statusId: string;
  active: boolean;
}

export interface MortalNeedsAttributeConsequenceResult {
  action: 'apply-consequence' | 'remove-consequence';
  entityId: string;
  needId: string;
  consequenceType: 'attribute-modify';
  path: string;
  previousValue: number;
  value: number;
  reverted?: boolean;
}

export interface MortalNeedsSetSceneModifierResult {
  action: 'set-scene-modifier';
  sceneId: string;
  needId: string;
  modifiers: Record<string, number>;
}

export interface MortalNeedsRegisterCustomNeedResult {
  action: 'register-custom-need';
  needId: string;
  config: Record<string, unknown>;
}

export interface MortalNeedsUnregisterCustomNeedResult {
  action: 'unregister-custom-need';
  needId: string;
  deleted: true;
}

export interface MortalNeedsResetAllResult {
  action: 'reset-all';
  entityId: string;
}

export interface MortalNeedsUntrackActorResult {
  action: 'untrack-actor';
  entityId: string;
  deleted: true;
}

export type MortalNeedsResult =
  | MortalNeedsGetNeedsResult
  | MortalNeedsGetNeedResult
  | MortalNeedsListTrackedResult
  | MortalNeedsGetNeedConfigSingleResult
  | MortalNeedsGetNeedConfigListResult
  | MortalNeedsQueryCriticalResult
  | MortalNeedsQueryAboveThresholdResult
  | MortalNeedsGetNeedHistoryResult
  | MortalNeedsStressRelieveResult
  | MortalNeedsSetNeedResult
  | MortalNeedsResetNeedResult
  | MortalNeedsTrackActorResult
  | MortalNeedsBatchResult
  | MortalNeedsShortRestResult
  | MortalNeedsLongRestSingleResult
  | MortalNeedsLongRestPartyResult
  | MortalNeedsConfigureNeedResult
  | MortalNeedsConditionConsequenceResult
  | MortalNeedsAttributeConsequenceResult
  | MortalNeedsSetSceneModifierResult
  | MortalNeedsRegisterCustomNeedResult
  | MortalNeedsUnregisterCustomNeedResult
  | MortalNeedsResetAllResult
  | MortalNeedsUntrackActorResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 26 actions) ──

export const MORTAL_NEEDS_ACTIONS = [
  'get-needs',
  'get-need',
  'list-tracked',
  'get-need-config',
  'query-critical',
  'query-above-threshold',
  'get-need-history',
  'stress-need',
  'relieve-need',
  'set-need',
  'reset-need',
  'track-actor',
  'batch-stress',
  'batch-relieve',
  'short-rest',
  'long-rest',
  'configure-need',
  'enable-need',
  'disable-need',
  'apply-consequence',
  'remove-consequence',
  'set-scene-modifier',
  'register-custom-need',
  'unregister-custom-need',
  'reset-all',
  'untrack-actor',
] as const;

export type MortalNeedsAction = (typeof MORTAL_NEEDS_ACTIONS)[number];
