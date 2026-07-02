// Module Integration v2 Phase 3A — module-token-attacher mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Token Attacher v4.6.12 (KayelGee). attach/detach write flags.token-attacher.attached on the base
// TokenDocument; query-* read it back. All 5 actions are GM-routed canvas/flag ops.

// attach / detach / detach-all all return the post-op attached map (re-read flag).
export interface TAAttachResult {
  baseTokenId: string;
  sceneId: string;
  attached: Record<string, string[]>; // { [type]: ids[] } after the op
  affected: Array<{ type: string; id: string }>; // the elements this op acted on
}

export interface TADetachAllResult {
  baseTokenId: string;
  sceneId: string;
  attached: Record<string, string[]>; // should be {} after detach-all
  cleared: boolean;
}

export interface TAQueryAttachedResult {
  baseTokenId: string;
  sceneId: string;
  attached: Record<string, string[]>; // { [type]: ids[] } or {}
  total: number; // count of attached element ids across all types
}

export interface TAQueryByTypeResult {
  baseTokenId: string;
  sceneId: string;
  type: string;
  ids: string[];
}

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 5 actions) ──

export const TOKEN_ATTACHER_ACTIONS = [
  'attach',
  'detach',
  'detach-all',
  'query-attached',
  'query-by-type',
] as const;

export type TokenAttacherAction = (typeof TOKEN_ATTACHER_ACTIONS)[number];
