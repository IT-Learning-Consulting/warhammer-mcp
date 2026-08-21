// F7-B (opportunity-scan 2026-08-21) — client-side `window.warhammerMcp` global helper.
// Source design: .agents/research/module_matt_v3_ideas/07_cross_mcp_proposals.md §C.
//
// Exposes a stable, discoverable entry point so a plain hotbar macro can fire a Monk's
// Active Tiles (MATT) tile WITHOUT going through Claude/MCP or knowing MATT internals:
//
//   await game.warhammerMcp?.fireTrigger('Tile.<uuid>', { method: 'manual' });
//
// The optional-chain guard means a pinned macro silently no-ops if warhammer-mcp is not
// loaded (safe to pin; does not error on world load before the module initializes).
//
// API-fidelity note: the source memo's sample called `game.MonksActiveTiles.triggerTile(doc, {tokens, method})`,
// but the source-confirmed MATT signature is `triggerTile(uuid: string)` (no token/method args —
// see handlers/modules/monks-active-tiles/matt-runtime.ts:37-39,59). The token/method-aware path
// is the TileDocument.prototype `trigger({ tokens, method })` method (matt-runtime.ts:184,
// handleFireTriggerAs). This helper uses `trigger()` so `options.tokens`/`options.method` are honoured.
//
// No confirm-gate here (unlike the MCP `fire-trigger` handler's CCR-4 gate): a GM/player deliberately
// clicking a hotbar-pinned macro IS the confirmation, and any dangerous sub-action still hits MATT's
// own runtime safety on the client (memo §C Decision B).

import { MODULE_ID } from './constants.js';

/**
 * Fire a MATT tile's action sequence, as if triggered live.
 *
 * @param tileUuid  the tile document UUID (e.g. "Scene.<id>.Tile.<id>")
 * @param options.tokens  TokenDocuments to fire with (default: currently controlled tokens)
 * @param options.method  MATT trigger method (default 'manual' — matches subroutine-library tiles,
 *                         which use trigger:["manual"]; mirrors handleFireTriggerAs's default)
 *
 * Input/precondition failures never throw: bad/empty UUID, MATT inactive, tile-not-found, and a
 * non-triggerable document each surface a Foundry UI error notification and return early, so a
 * hotbar macro needs no try/catch for those. The one path that can reject is the fired sequence
 * itself (`tileDoc.trigger(...)`): a throwing MATT action propagates deliberately, so the GM sees
 * MATT's own runtime/confirm error (memo §C Decision B); Foundry's macro executor surfaces it.
 */
export async function fireTrigger(
  tileUuid: string,
  options: { tokens?: unknown[]; method?: string } = {},
): Promise<void> {
  const g = globalThis as any;
  const ui = g.ui;

  if (typeof tileUuid !== 'string' || tileUuid.length === 0) {
    ui?.notifications?.error('warhammerMcp.fireTrigger: a tile UUID string is required.');
    return;
  }

  // MATT-active check — the global is patched onto game only when monks-active-tiles is enabled.
  if (!g.game?.MonksActiveTiles) {
    ui?.notifications?.error("warhammerMcp.fireTrigger: Monk's Active Tiles is not active.");
    return;
  }

  const tileDoc = await g.fromUuid(tileUuid);
  if (!tileDoc) {
    ui?.notifications?.error(`warhammerMcp.fireTrigger: Tile '${tileUuid}' not found.`);
    return;
  }
  // TileDocument.prototype.trigger is MATT-patched; absent → the UUID is not a MATT-armed tile.
  if (typeof tileDoc.trigger !== 'function') {
    ui?.notifications?.error(`warhammerMcp.fireTrigger: '${tileUuid}' is not a triggerable MATT tile.`);
    return;
  }

  const tokens = options.tokens ?? g.canvas?.tokens?.controlled ?? [];
  const method = options.method ?? 'manual';
  await tileDoc.trigger({ tokens, method });
}

/**
 * Register the `window.warhammerMcp` global on Foundry's `ready` hook. Called once from main.ts.
 * Registered on every client (like foundryMCPBridge/foundryMCPDebug) so a pinned hotbar macro
 * resolves the same way regardless of who clicks it; MATT enforces its own per-tile permissions.
 */
export function registerWarhammerMcpGlobals(): void {
  (Hooks as any).once('ready', () => {
    (globalThis as any).warhammerMcp = { fireTrigger };
    console.log(`[${MODULE_ID}] window.warhammerMcp.fireTrigger registered (hotbar-macro MATT firing)`);
  });
}
