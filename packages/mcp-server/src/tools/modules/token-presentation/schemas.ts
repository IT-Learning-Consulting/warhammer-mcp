// Module Integration v2 Phase 3B — module-token-presentation mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// 2-member bundle: boss-splash v1.2.1 (transient overlay; verify via currentOverlay) +
// token-notes v3.0.1 (flag writes on TokenDocument/Actor). get-bundle-status is the unguarded
// CCR-12 availability map.

// ── boss-splash ─────────────────────────────────────────────────────────────

export interface TPBossSplashShowResult {
  overlayActive: boolean; // game.bossSplash.currentOverlay !== null after the call
  actor: string | null;
  video: string | null;
  message: string | null;
}

export interface TPBossSplashCloseResult {
  overlayActive: boolean; // false after close
  closed: boolean;
}

export interface TPBossSplashConfigResult {
  settings: Record<string, unknown>; // get-config: all keys; set-config: { [key]: value }
}

// ── token-notes ─────────────────────────────────────────────────────────────

export interface TPNoteWriteResult {
  scope: 'token' | 'actor';
  targetId: string; // tokenId or actorId
  text: string;
}

export interface TPNoteReadResult {
  scope: 'token' | 'actor';
  targetId: string;
  text: string; // '' when no note
}

export interface TPUseActorResult {
  tokenId: string;
  useActor: boolean;
}

export interface TPNoteConfigResult {
  allowplayers: number; // 0 none / 1 readonly / 2 readwrite
}

// ── bundle status ───────────────────────────────────────────────────────────

export interface TPBundleMemberStatus {
  id: string;
  active: boolean;
  title: string | null;
  version: string | null;
}

export interface TPBundleStatusResult {
  members: TPBundleMemberStatus[];
}

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 10 actions) ──

export const TOKEN_PRESENTATION_ACTIONS = [
  // boss-splash (4)
  'boss-splash.show',
  'boss-splash.close',
  'boss-splash.get-config',
  'boss-splash.set-config',
  // token-notes (5)
  'token-notes.write-note',
  'token-notes.read-note',
  'token-notes.set-use-actor',
  'token-notes.get-config',
  'token-notes.set-config',
  // bundle (1)
  'get-bundle-status',
] as const;

export type TokenPresentationAction = (typeof TOKEN_PRESENTATION_ACTIONS)[number];
