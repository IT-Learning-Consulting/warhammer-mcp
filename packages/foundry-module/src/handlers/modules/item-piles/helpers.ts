// DIALOG-PATH: DIALOG_FREE — pure helper functions; no dialog-opening calls.
// Module Integration v1 Phase 3 — module-itempiles shared helpers.
// mcp_code_quality_v2 Phase C3 (19a split): extracted verbatim from item-piles.ts — zero
// behavioral change (behavior freeze HC3/HC13).

import { ErrorTokens } from '@foundry-mcp/shared';
import { Envelope, getGame, isGM } from '../_shared/handler-utils.js';
import { checkActiveGm } from './catalog.js';

// ── API accessor ──────────────────────────────────────────────────────────────

export function getItemPilesAPI(): any {
  const api = (globalThis as any).game?.itempiles?.API;
  if (!api) throw new Error('ITEMPILES_API_UNAVAILABLE: game.itempiles.API is not available — module may not have reached ready state');
  return api;
}

// RC1.1b closure-diff idiom (wfrp-economy.ts:128 shape) — before/after accessor compare,
// Number()/Boolean() coercion wraps hand-rolled per site (module-API accessor state has no
// live-Document freshDoc for verifyDocWrite; see plan Design Decisions). `token` is the
// site-specific ITEM_PILES_*_NOT_PERSISTED literal (never a shared generic token).
export function notPersisted(token: string, detail: string): { success: false; error: string } {
  return { success: false, error: `${token}: ${detail}` };
}

// DP-16 settle-poll (feedback_settle_poll_module_api_verify): Item Piles' private API
// resolves before its document writes settle into the client accessors, so an immediate
// re-read false-fails the *_NOT_PERSISTED verify (live-confirmed 2026-07-03: add-currency
// coins landed, but the same-tick getActorCurrencies re-read still saw pre-write state).
// Poll the post-write predicate on a bounded window; only declare non-persistence after
// the window expires. A genuine silent no-op (BUG-428 class) still fails loud at timeout.
// Consolidated to `_shared/settle-poll.ts` (mcp_code_quality_v2 Phase C2, RC2.1) — this
// file's boolean-predicate shape is the canonical predicate overload.

/** Resolve a UUID string to a live Token object (for turnTokens/revertTokens — C6/C7) */
export function resolveToTokenObject(uuid: string): any {
  const fromUuidSync = (globalThis as any).fromUuidSync;
  if (typeof fromUuidSync === 'function') {
    const doc = fromUuidSync(uuid);
    if (doc?.object) return doc.object;   // TokenDocument → Token (canvas object)
    if (doc && doc.documentName === 'Token') return doc;
  }
  // fallback: try canvas.scene tokens
  const scene = (globalThis as any).canvas?.scene;
  if (scene) {
    // extract token id from the UUID (Scene.xxx.Token.yyy)
    const parts = uuid.split('.');
    const tokenIdx = parts.findIndex((p) => p === 'Token');
    if (tokenIdx !== -1 && parts[tokenIdx + 1]) {
      const tokenId = parts[tokenIdx + 1];
      const tokenDoc = scene.tokens?.get?.(tokenId);
      if (tokenDoc?.object) return tokenDoc.object;
    }
  }
  throw new Error(`TOKEN_NOT_FOUND: cannot resolve UUID "${uuid}" to a live Token object — ensure the token is on the active canvas scene`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function gmRequired(): Envelope<never> | null {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can perform item pile write operations' };
  return null;
}

export function activeGmRequired(): Envelope<never> | null {
  const err = checkActiveGm(getGame());
  if (err) return { success: false, error: err };
  return null;
}

export function bankerAuctioneerCheck(type: string | undefined): Envelope<never> | null {
  if (type === 'banker' || type === 'auctioneer') {
    return {
      success: false,
      error: `${ErrorTokens.MODULE_DEPENDENCY_NOT_ACTIVE}: pile type "${type}" requires a companion module that is not installed. Install "item_piles_bankers" (for banker) or "item_piles_auctioneer" (for auctioneer) via Foundry Module Manager.`,
    };
  }
  return null;
}
