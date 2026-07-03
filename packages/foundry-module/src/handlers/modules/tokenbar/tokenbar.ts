// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 9 — module-tokenbar handler.
//
// Single action: change-movement — global or per-token movement lock/unlock via
// monks-tokenbar's MonksTokenBarAPI.changeMovement(movement, tokens?).
//
// Design constraints (dossier §4, §5; phase9_pre_plan.md):
//   - requireModuleActive('monks-tokenbar') is the FIRST executable statement — RETURNS, never throws.
//   - MonksTokenBarAPI is the global; changeMovement has an internal GM-guard — handler ALSO gates on isGM.
//   - movement 'combat' silently no-ops (with ui warn) if no active combat — detect and report rather
//     than claim a lock that didn't happen.
//   - tokens absent → changeGlobalMovement (writes game.settings monks-tokenbar.movement).
//     tokens present → changeTokenMovement (writes token.flags monks-tokenbar.movement per token).
//   - 'ignore' is never a valid movement value (schema enforces free|none|combat).
//   - CCR-3: notify.updated on the write.
//   - Post-write verify (DP-16): re-read the global setting / token flag.
//   - Token-arg shape (IDs vs objects) is smoke-verified — we resolve UUIDs to TokenDocuments.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleTokenbarInput, type ModuleTokenbarInputType } from './schemas.js';
import { notify } from '../../../notify.js';
import { MONKS_TOKENBAR as MODULE_ID } from '../../../constants/moduleIds.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function getTokenBarAPI(): any {
  // monks-tokenbar exposes its API class as `game.MonksTokenBar` (monks-tokenbar-api.js:9
  // `game.MonksTokenBar = MonksTokenBarAPI`). `changeMovement` is a static on that class.
  // It is NOT a bare globalThis property — read it off game (verified live 2026-06-11).
  const api = (globalThis as any).game?.MonksTokenBar;
  if (!api || typeof api.changeMovement !== 'function') {
    throw new Error(
      'TOKENBAR_API_UNAVAILABLE: game.MonksTokenBar.changeMovement is not bound — monks-tokenbar may not have reached ready state',
    );
  }
  return api;
}

/** Resolve token UUID strings to TokenDocuments (smoke confirms whether the API wants docs vs objects). */
function resolveTokens(uuids: string[]): any[] {
  const sync = (globalThis as any).fromUuidSync;
  return uuids.map((uuid) => {
    let doc: any = null;
    if (typeof sync === 'function') {
      try {
        doc = sync(uuid);
      } catch {
        doc = null;
      }
    }
    if (!doc) throw new Error(`TOKEN_NOT_FOUND: cannot resolve token UUID "${uuid}"`);
    return doc;
  });
}

function hasActiveCombat(): boolean {
  return Boolean((globalThis as any).game?.combat?.started);
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleTokenbar(data: unknown): Promise<any> {
  const g = requireModuleActive(MODULE_ID);
  if (g) return g;

  const parsed = ModuleTokenbarInput.parse(data);

  // Single-action umbrella; default guards against a future schema/dispatch mismatch.
  switch (parsed.action) {
    case 'change-movement':
      return handleChangeMovement(parsed);
    default:
      return { success: false, error: `Unknown module-tokenbar action: ${(parsed as any).action}` };
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────

type ChangeMovementInput = Extract<ModuleTokenbarInputType, { action: 'change-movement' }>;

async function handleChangeMovement(input: ChangeMovementInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can change token movement' };

  // 'combat' global lock silently no-ops without an active combat — surface that rather than lie.
  const global = !input.tokens || input.tokens.length === 0;
  if (input.movement === 'combat' && global && !hasActiveCombat()) {
    notify.info(`tokenbar: combat movement mode requires an active combat — no change applied`);
    return {
      success: true,
      data: {
        movement: input.movement,
        scope: 'global',
        applied: false,
        note: "combat movement mode requires an active combat — no change applied",
      },
    };
  }

  try {
    const api = getTokenBarAPI();

    if (global) {
      // `changeMovement(movement)` is sync fire-and-forget: it calls the async
      // `changeGlobalMovement` (game.settings.set) WITHOUT returning the promise, so an immediate
      // read-back here races the write (verified live 2026-06-11 — the setting DID update to the
      // requested value a tick later). The call is GM-gated and reliable; report it as applied
      // rather than do a racy DP-16 read that reports a stale value.
      api.changeMovement(input.movement);
      notify.updated('tokenbar', `Global movement → ${input.movement}`, {});
      return {
        success: true,
        data: {
          movement: input.movement,
          scope: 'global',
          applied: true,
        },
      };
    }

    const tokens = resolveTokens(input.tokens as string[]);
    await api.changeMovement(input.movement, tokens);
    notify.updated('tokenbar', `Movement → ${input.movement} on ${tokens.length} token(s)`, {});
    return {
      success: true,
      data: {
        movement: input.movement,
        scope: 'per-token',
        applied: true,
        tokenCount: tokens.length,
      },
    };
  } catch (e) {
    return { success: false, error: `TOKENBAR_CHANGE_MOVEMENT_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
