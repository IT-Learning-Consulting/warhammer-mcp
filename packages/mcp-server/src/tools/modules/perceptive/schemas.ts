// Module Integration v2 Phase 4 — module-perceptive mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Perceptive v6.0.4 (saibot). 8 actions; mixed write paths (raw flag write / module API / GM-direct
// door fn). Door results carry a `note` because they are fire-and-forget (LIVE-SMOKE-ONLY).

export interface PerceptiveStealthResult {
  action: 'set-stealth';
  tokenId: string;
  tokenName: string;
  sceneId: string;
  stealthing: boolean;
}

export interface PerceptiveSpottingResult {
  action: 'set-spotting';
  tokenId: string;
  tokenName: string;
  sceneId: string;
  spotterId: string;
  spottedBy: string[];
}

export interface PerceptiveSpottableResult {
  action: 'set-spottable';
  tokenId: string;
  tokenName: string;
  sceneId: string;
  canbeSpotted: boolean;
  ppdc: number | null;
  apdc: number | null;
}

export interface PerceptiveResetResult {
  action: 'reset-stealth';
  tokenId: string;
  tokenName: string;
  sceneId: string;
  spottedBy: string[];
  stealthing: boolean;
}

export interface PerceptivePeekDoorResult {
  action: 'peek-door';
  doorId: string;
  sceneId: string;
  tokenIds: string[];
  lockpeekedBy: string[];
  note: string;
}

export interface PerceptiveMoveDoorResult {
  action: 'move-door';
  doorId: string;
  sceneId: string;
  direction: number;
  speed: number;
  doorMovementType: string | null;
  swingState: number | null;
  slideState: number | null;
  note: string;
}

// wfrp-stealth-delegate: applied:true when active (ppdc/apdc set); applied:false fail-open when inactive.
export interface PerceptiveDelegateResult {
  action: 'wfrp-stealth-delegate';
  applied: boolean;
  moduleActive: boolean;
  sl: number;
  tokenId: string | null;
  tokenName: string | null;
  sceneId?: string;
  ppdc?: number;
  apdc?: number;
  message?: string;
}

export interface PerceptiveStateResult {
  action: 'get-state';
  tokenId: string;
  tokenName: string;
  sceneId: string;
  stealthing: boolean;
  spottedBy: string[];
  ppdc: number | null;
  apdc: number | null;
  canbeSpotted: boolean;
  lightLevel: number | null;
}

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 8 actions) ──

export const PERCEPTIVE_ACTIONS = [
  'set-stealth',
  'set-spotting',
  'set-spottable',
  'reset-stealth',
  'peek-door',
  'move-door',
  'wfrp-stealth-delegate',
  'get-state',
] as const;

export type PerceptiveAction = (typeof PERCEPTIVE_ACTIONS)[number];
