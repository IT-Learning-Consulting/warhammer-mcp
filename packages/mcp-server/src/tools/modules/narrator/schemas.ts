// Module Integration v2 Phase 10 — module-narrator mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Narrator Tools v1.0.1. 6 actions, ONE uniform write architecture (settings broadcast + persisted
// ChatMessage). Each handler return carries `action` as a discriminant; NarratorResult is their union so
// the tool stays typed without <any>.

export interface NarratorSharedState {
  narration: {
    id: number;
    display: boolean;
    message: string;
    paused: boolean;
  };
  scenery: boolean;
}

export interface NarratorGetStateResult {
  action: 'get-state';
  sharedState: NarratorSharedState;
}

export interface NarratorNarrateResult {
  action: 'narrate';
  narrationId: number;
  paused: boolean;
  messageId: string;
  queuedCount: number;
}

export interface NarratorDescribeResult {
  action: 'describe';
  messageId: string;
}

export interface NarratorNotifyResult {
  action: 'notify';
  messageId: string;
  whisper: string[];
}

export interface NarratorSceneryResult {
  action: 'scenery';
  scenery: boolean;
}

export interface NarratorConfigureResult {
  action: 'configure';
  key: string;
  value: string | number | boolean;
}

export type NarratorResult =
  | NarratorGetStateResult
  | NarratorNarrateResult
  | NarratorDescribeResult
  | NarratorNotifyResult
  | NarratorSceneryResult
  | NarratorConfigureResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 6 actions) ──

export const NARRATOR_ACTIONS = ['get-state', 'narrate', 'describe', 'notify', 'scenery', 'configure'] as const;

export type NarratorAction = (typeof NARRATOR_ACTIONS)[number];

// The 16 typed appearance/permission settings `configure` may write (mirrors the foundry-module schema's
// NARRATOR_CONFIGURE_KEYS — duplicated here package-local per CCR-5 so the mcp-server tool description
// can enumerate them without importing across the package boundary).
export const NARRATOR_CONFIGURE_KEYS = [
  'FontSize',
  'WebFont',
  'TextColor',
  'TextShadow',
  'TextCSS',
  'Copy',
  'Pause',
  'DurationMultiplier',
  'BGColor',
  'BGImage',
  'NarrationStartPaused',
  'MessageType',
  'PERMScenery',
  'PERMDescribe',
  'PERMNarrate',
  'PERMAs',
] as const;
