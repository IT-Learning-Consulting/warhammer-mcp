// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v2 Phase 3B — module-token-presentation handler.
// 2-member bundle: boss-splash v1.2.1 (LostPhoenix) + token-notes v3.0.1 (theripper93).
//
// CCR-12: two independently-activatable members under one umbrella (mirror scene-atmosphere.ts).
//   - ACTION_MEMBER_MAP maps each member-prefixed action → member module id.
//   - Per-action requireModuleActive(member, deps?) runs BEFORE the handler. token-notes hard-deps
//     lib-wrapper; boss-splash has no hard dep.
//   - get-bundle-status is UNGUARDED — reachable when BOTH members are inactive (pre-flight aid).
//
// boss-splash (transient — NO document persisted; verify via game.bossSplash.currentOverlay):
//   show  — require ≥1 of actor/video/(message+actorImg) (avoids the canvas.tokens.controlled fallback,
//           boss-splash.js:313); refuse if currentOverlay !== null (BOSS_SPLASH_ALREADY_ACTIVE, the
//           module silently no-ops a double-splash, boss-splash.js:337); await splashBoss(opts); verify
//           currentOverlay !== null. timer option is MS (world splashTimer setting is seconds).
//   close — splashBoss({close:true}); verify currentOverlay === null.
//   get/set-config — game.settings.get/set('boss-splash', key). NO DP-16 flag check possible (transient).
//
// token-notes (pure flag writes — DP-16 verifiable):
//   write-note   — scope:token → TokenDocument.update; scope:actor → Actor.update;
//                  flags.token-notes.notes; verifyFlagWrite.
//   read-note    — getFlag('token-notes','notes') ?? ''.
//   set-use-actor— TokenDocument flags.token-notes.useActor; verifyFlagWrite.
//   get/set-config — world setting allowplayers (0|1|2).
//
// Accessors are live globals: game.bossSplash.* (boss-splash.js:8-13), Document.update for token-notes
// (no module API — token-notes.md §4). NEVER import a bundled-module internal by path (carry-forward §2).
//
// Source of truth: .agents/research/module_integration/phase3_pre_plan.md §3B.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { verifyFlagWrite } from '../../../utils/verifyWrite.js';
import { TokenPresentationInput, type TokenPresentationInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const BOSS_SPLASH_ID = 'boss-splash';
const TOKEN_NOTES_ID = 'token-notes';
const NOTES_FLAG_SCOPE = 'token-notes';

// The bundle's member module ids (for get-bundle-status). lib-wrapper is a token-notes hard dep but
// not a bundle member — it's checked by requireModuleActive on each token-notes action.
const BUNDLE_MEMBERS = [BOSS_SPLASH_ID, TOKEN_NOTES_ID] as const;

// CCR-12 — action → primary member id. get-bundle-status is deliberately absent (unguarded).
export const ACTION_MEMBER_MAP: Record<string, string> = {
  'boss-splash.show': BOSS_SPLASH_ID,
  'boss-splash.close': BOSS_SPLASH_ID,
  'boss-splash.get-config': BOSS_SPLASH_ID,
  'boss-splash.set-config': BOSS_SPLASH_ID,
  'token-notes.write-note': TOKEN_NOTES_ID,
  'token-notes.read-note': TOKEN_NOTES_ID,
  'token-notes.set-use-actor': TOKEN_NOTES_ID,
  'token-notes.get-config': TOKEN_NOTES_ID,
  'token-notes.set-config': TOKEN_NOTES_ID,
};

// token-notes actions additionally require lib-wrapper (its declared hard dep).
const TOKEN_NOTES_DEPS = ['lib-wrapper'];

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}

function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}

function bossSplash(): any {
  return getGame()?.bossSplash;
}

async function getActorDoc(actorId: string): Promise<any | null> {
  const game = getGame();
  // Try id first, then fromUuid for UUID forms.
  const byId = game?.actors?.get?.(actorId);
  if (byId) return byId;
  const fromUuid = (globalThis as any).fromUuid;
  if (typeof fromUuid === 'function') {
    try {
      const doc = await fromUuid(actorId);
      return doc ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

function getTokenDoc(sceneId: string | undefined, tokenId: string): any | null {
  const game = getGame();
  const scene = sceneId ? game?.scenes?.get?.(sceneId) : (globalThis as any).canvas?.scene;
  return scene?.tokens?.get?.(tokenId) ?? null;
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleTokenPresentation(data: unknown): Promise<Envelope<unknown>> {
  let input: TokenPresentationInputType;
  try {
    input = TokenPresentationInput.parse(data);
  } catch (e) {
    return { success: false, error: `TOKEN_PRESENTATION_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  // CCR-12 per-action guard. get-bundle-status is UNGUARDED (reachable when both members inactive).
  if (input.action !== 'get-bundle-status') {
    const member = ACTION_MEMBER_MAP[input.action];
    if (member) {
      const deps = member === TOKEN_NOTES_ID ? TOKEN_NOTES_DEPS : undefined;
      const g = requireModuleActive(member, deps);
      if (g) return g;
    }
  }

  // GM gate on every write action (everything except reads + bundle status).
  const READ_ONLY = new Set(['get-bundle-status', 'token-notes.read-note', 'token-notes.get-config', 'boss-splash.get-config']);
  if (!READ_ONLY.has(input.action) && !isGM()) {
    return { success: false, error: `TOKEN_PRESENTATION_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'boss-splash.show':
        return await handleBossSplashShow(input);
      case 'boss-splash.close':
        return await handleBossSplashClose(input);
      case 'boss-splash.get-config':
        return handleBossSplashGetConfig(input);
      case 'boss-splash.set-config':
        return handleBossSplashSetConfig(input);
      case 'token-notes.write-note':
        return await handleWriteNote(input);
      case 'token-notes.read-note':
        return await handleReadNote(input);
      case 'token-notes.set-use-actor':
        return await handleSetUseActor(input);
      case 'token-notes.get-config':
        return handleNotesGetConfig(input);
      case 'token-notes.set-config':
        return handleNotesSetConfig(input);
      case 'get-bundle-status':
        return handleGetBundleStatus(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `TOKEN_PRESENTATION_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `TOKEN_PRESENTATION_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── boss-splash ────────────────────────────────────────────────────────────────

const BOSS_SPLASH_SETTING_KEYS = [
  'permissions-emit',
  'colorFirst',
  'colorSecond',
  'colorThird',
  'colorFont',
  'colorShadow',
  'subColorFont',
  'subColorShadow',
  'bossSound',
  'fontFamily',
  'fontSize',
  'subFontSize',
  'splashMessage',
  'subText',
  'splashTimer',
  'animationDuration',
  'animationDelay',
  'showTokenHUD',
];

/**
 * Poll game.bossSplash.currentOverlay until it reaches `expectPresent` (or a bounded deadline).
 * boss-splash assigns currentOverlay inside a setTimeout(fn, animationDelay) on show
 * (boss-splash.js:347-349) and nulls it inside an async overlay.close() on close (boss-splash.js:357/473)
 * — BOTH land on a macrotask AFTER splashBoss() resolves, so an immediate currentOverlay check races the
 * deferred write (live-audit 2026-06-25; same fire-and-forget class as the token-attacher detach-all
 * settle / F03). `extraDelayMs` lets show wait past the configured animationDelay before the poll.
 */
async function waitForOverlayState(expectPresent: boolean, extraDelayMs: number): Promise<boolean> {
  const deadline = Math.max(0, extraDelayMs) + 300;
  const step = 30;
  let waited = 0;
  let present = bossSplash()?.currentOverlay != null;
  while (waited < deadline && present !== expectPresent) {
    await new Promise((r) => setTimeout(r, step));
    waited += step;
    present = bossSplash()?.currentOverlay != null;
  }
  return present;
}

type ShowInput = Extract<TokenPresentationInputType, { action: 'boss-splash.show' }>;
async function handleBossSplashShow(input: ShowInput): Promise<Envelope<unknown>> {
  const bs = bossSplash();
  if (typeof bs?.splashBoss !== 'function') {
    return { success: false, error: 'TOKEN_PRESENTATION_API_UNAVAILABLE: game.bossSplash.splashBoss not found (module loaded?)' };
  }
  // Require ≥1 of actor / video / (message+actorImg). Avoids the silent canvas.tokens.controlled
  // fallback (boss-splash.js:313). Enforced in the handler (NOT via .refine() — carry-forward §4).
  const hasIdentity = Boolean(input.actor || input.video || (input.message && input.actorImg));
  if (!hasIdentity) {
    return {
      success: false,
      error: 'TOKEN_PRESENTATION_INVALID_INPUT: boss-splash.show requires at least one of: actor, video, or (message + actorImg). Without one, the module falls back to the controlled token.',
    };
  }
  // Refuse a double-splash — the module silently no-ops when currentOverlay is non-null (boss-splash.js:337).
  if (bs.currentOverlay != null) {
    return {
      success: false,
      error: `${ErrorTokens.BOSS_SPLASH_ALREADY_ACTIVE}: a boss splash is already on screen. Close it first (boss-splash.close) before showing another.`,
    };
  }

  const opts: Record<string, unknown> = {};
  if (input.actor !== undefined) opts.actor = input.actor;
  if (input.actorImg !== undefined) opts.actorImg = input.actorImg;
  if (input.video !== undefined) opts.video = input.video;
  if (input.message !== undefined) opts.message = input.message;
  if (input.subText !== undefined) opts.subText = input.subText;
  if (input.tokenName !== undefined) opts.tokenName = input.tokenName;
  if (input.timerMs !== undefined) opts.timer = input.timerMs; // module wants ms on options.timer
  if (input.sound !== undefined) opts.sound = input.sound;
  if (input.fill !== undefined) opts.fill = input.fill;

  await bs.splashBoss(opts);

  // Transient verify — no document persists; the only signal is the live overlay. currentOverlay is
  // assigned on a setTimeout(fn, animationDelay) macrotask (boss-splash.js:347-349) AFTER splashBoss
  // resolves, so settle past the configured delay before asserting (see waitForOverlayState).
  const animDelayMs = Number(getGame()?.settings?.get?.(BOSS_SPLASH_ID, 'animationDelay')) || 0;
  const overlayActive = await waitForOverlayState(true, animDelayMs);
  if (!overlayActive) {
    return { success: false, error: `${ErrorTokens.TOKEN_PRESENTATION_NOT_PERSISTED}: boss-splash did not produce a live overlay (currentOverlay still null ${animDelayMs + 300}ms after splashBoss).` };
  }

  notify.created('token-presentation', input.actor ?? input.video ?? input.message ?? 'boss splash', { summary: 'boss splash shown to all clients' });
  return {
    success: true,
    data: {
      overlayActive,
      actor: input.actor ?? null,
      video: input.video ?? null,
      message: input.message ?? null,
    },
  };
}

type CloseInput = Extract<TokenPresentationInputType, { action: 'boss-splash.close' }>;
async function handleBossSplashClose(_input: CloseInput): Promise<Envelope<unknown>> {
  const bs = bossSplash();
  if (typeof bs?.splashBoss !== 'function') {
    return { success: false, error: 'TOKEN_PRESENTATION_API_UNAVAILABLE: game.bossSplash.splashBoss not found' };
  }
  await bs.splashBoss({ close: true });
  // overlay.close() is async (boss-splash.js:357/473) — currentOverlay nulls on a later tick; settle.
  const overlayActive = await waitForOverlayState(false, 0);
  if (overlayActive) {
    return { success: false, error: `${ErrorTokens.TOKEN_PRESENTATION_NOT_PERSISTED}: boss-splash overlay still active after close.` };
  }
  notify.deleted('token-presentation', 'boss splash', { summary: 'boss splash closed' });
  return { success: true, data: { overlayActive: false, closed: true } };
}

type BSGetConfigInput = Extract<TokenPresentationInputType, { action: 'boss-splash.get-config' }>;
function handleBossSplashGetConfig(_input: BSGetConfigInput): Envelope<unknown> {
  const game = getGame();
  const settings: Record<string, unknown> = {};
  for (const key of BOSS_SPLASH_SETTING_KEYS) {
    try {
      settings[key] = game?.settings?.get?.(BOSS_SPLASH_ID, key);
    } catch {
      settings[key] = undefined;
    }
  }
  return { success: true, data: { settings } };
}

type BSSetConfigInput = Extract<TokenPresentationInputType, { action: 'boss-splash.set-config' }>;
function handleBossSplashSetConfig(input: BSSetConfigInput): Envelope<unknown> {
  if (!BOSS_SPLASH_SETTING_KEYS.includes(input.key)) {
    return { success: false, error: `TOKEN_PRESENTATION_INVALID_INPUT: "${input.key}" is not a boss-splash setting. Valid: ${BOSS_SPLASH_SETTING_KEYS.join(', ')}` };
  }
  const game = getGame();
  // settings.set is async but returns the value; fire and read back synchronously is not reliable,
  // so we set and trust Foundry's GM-gated write (transient module — no doc to DP-16-verify).
  game?.settings?.set?.(BOSS_SPLASH_ID, input.key, input.value);
  notify.updated('token-presentation', `boss-splash.${input.key}`, { summary: `set ${input.key}=${String(input.value)}` });
  return { success: true, data: { settings: { [input.key]: input.value } } };
}

// ── token-notes ────────────────────────────────────────────────────────────────

type WriteNoteInput = Extract<TokenPresentationInputType, { action: 'token-notes.write-note' }>;
async function handleWriteNote(input: WriteNoteInput): Promise<Envelope<unknown>> {
  let doc: any | null;
  let targetId: string;
  if (input.scope === 'actor') {
    if (!input.actorId) return { success: false, error: 'TOKEN_PRESENTATION_INVALID_INPUT: scope=actor requires actorId' };
    doc = await getActorDoc(input.actorId);
    targetId = input.actorId;
    if (!doc) return { success: false, error: `TOKEN_PRESENTATION_NOT_FOUND: actor "${input.actorId}"` };
  } else {
    if (!input.tokenId) return { success: false, error: 'TOKEN_PRESENTATION_INVALID_INPUT: scope=token requires tokenId' };
    doc = getTokenDoc(input.sceneId, input.tokenId);
    targetId = input.tokenId;
    if (!doc) return { success: false, error: `TOKEN_PRESENTATION_NOT_FOUND: token "${input.tokenId}" on scene "${input.sceneId ?? 'active'}"` };
  }

  await doc.update({ 'flags.token-notes.notes': input.text });

  // DP-16 — re-read the flag (the in-memory doc reflects the update for embedded/world docs).
  verifyFlagWrite(doc, NOTES_FLAG_SCOPE, 'notes', input.text, ErrorTokens.TOKEN_PRESENTATION_NOT_PERSISTED);

  notify.updated('token-presentation', targetId, { summary: `${input.scope} note written (${input.text.length} chars)` });
  return { success: true, data: { scope: input.scope, targetId, text: input.text } };
}

type ReadNoteInput = Extract<TokenPresentationInputType, { action: 'token-notes.read-note' }>;
async function handleReadNote(input: ReadNoteInput): Promise<Envelope<unknown>> {
  let doc: any | null;
  let targetId: string;
  if (input.scope === 'actor') {
    if (!input.actorId) return { success: false, error: 'TOKEN_PRESENTATION_INVALID_INPUT: scope=actor requires actorId' };
    doc = await getActorDoc(input.actorId);
    targetId = input.actorId;
    if (!doc) return { success: false, error: `TOKEN_PRESENTATION_NOT_FOUND: actor "${input.actorId}"` };
  } else {
    if (!input.tokenId) return { success: false, error: 'TOKEN_PRESENTATION_INVALID_INPUT: scope=token requires tokenId' };
    doc = getTokenDoc(input.sceneId, input.tokenId);
    targetId = input.tokenId;
    if (!doc) return { success: false, error: `TOKEN_PRESENTATION_NOT_FOUND: token "${input.tokenId}" on scene "${input.sceneId ?? 'active'}"` };
  }
  const text = doc.getFlag?.(NOTES_FLAG_SCOPE, 'notes') ?? '';
  return { success: true, data: { scope: input.scope, targetId, text } };
}

type SetUseActorInput = Extract<TokenPresentationInputType, { action: 'token-notes.set-use-actor' }>;
async function handleSetUseActor(input: SetUseActorInput): Promise<Envelope<unknown>> {
  const doc = getTokenDoc(input.sceneId, input.tokenId);
  if (!doc) return { success: false, error: `TOKEN_PRESENTATION_NOT_FOUND: token "${input.tokenId}" on scene "${input.sceneId ?? 'active'}"` };
  await doc.update({ 'flags.token-notes.useActor': input.useActor });
  verifyFlagWrite(doc, NOTES_FLAG_SCOPE, 'useActor', input.useActor, ErrorTokens.TOKEN_PRESENTATION_NOT_PERSISTED);
  notify.updated('token-presentation', input.tokenId, { summary: `useActor=${input.useActor}` });
  return { success: true, data: { tokenId: input.tokenId, useActor: input.useActor } };
}

type NotesGetConfigInput = Extract<TokenPresentationInputType, { action: 'token-notes.get-config' }>;
function handleNotesGetConfig(_input: NotesGetConfigInput): Envelope<unknown> {
  const game = getGame();
  let allowplayers = 0;
  try {
    allowplayers = Number(game?.settings?.get?.(TOKEN_NOTES_ID, 'allowplayers') ?? 0);
  } catch {
    allowplayers = 0;
  }
  return { success: true, data: { allowplayers } };
}

type NotesSetConfigInput = Extract<TokenPresentationInputType, { action: 'token-notes.set-config' }>;
function handleNotesSetConfig(input: NotesSetConfigInput): Envelope<unknown> {
  const game = getGame();
  game?.settings?.set?.(TOKEN_NOTES_ID, 'allowplayers', input.allowplayers);
  notify.updated('token-presentation', 'token-notes.allowplayers', { summary: `allowplayers=${input.allowplayers}` });
  return { success: true, data: { allowplayers: input.allowplayers } };
}

// ── bundle status (UNGUARDED) ────────────────────────────────────────────────

interface BundleMemberStatus {
  id: string;
  active: boolean;
  title: string | null;
  version: string | null;
}

type GetBundleStatusInput = Extract<TokenPresentationInputType, { action: 'get-bundle-status' }>;
function handleGetBundleStatus(_input: GetBundleStatusInput): Envelope<{ members: BundleMemberStatus[] }> {
  const game = getGame();
  const members: BundleMemberStatus[] = BUNDLE_MEMBERS.map((id) => {
    const mod = game?.modules?.get?.(id);
    return {
      id,
      active: Boolean(mod?.active),
      title: mod?.title ?? null,
      version: mod?.version ?? null,
    };
  });
  return { success: true, data: { members } };
}
