// Module Integration v1 Phase 13A — module-css handler.
//
// 4-action umbrella: get / set / append / reset over the custom-css module's
// world CSS injection system.
//
// Design constraints (dossier §2.1–2.2, §3.1, §4.1; phase13_pre_plan §"13A"):
//   - requireModuleActive('custom-css') is the FIRST executable statement — RETURNS failure, never throws.
//   - set/append/reset are GM-gated; NONE are confirm-gated (all reversible per dossier §4.1).
//   - Write path mirrors custom-css's own Settings.updateStylesheets (settings.js:65-74):
//       game.settings.set('custom-css','worldStylesheet',css)  → persists to world DB
//       window.CustomCss.applyStyles()                         → re-inject on GM client (lowercase 'ss', custom-css.js:19)
//       game.socket.emit('module.custom-css')                  → payload-free broadcast trigger (settings.js:73)
//   - DP-16: re-read game.settings.get after every write to verify persistence (socket emit is transient — no read-back).
//   - Empty/null normalises to the sentinel "/* Custom CSS */" (settings.js:53).
//   - get mirrors the legacy-key fallback in Settings.getStylesheet("world") (settings.js:22-34).
//   - userStylesheet is client-scoped (LocalStorage) → the GM's OWN session only; never reachable for other users.
//   - CCR-3: notify.updated('setting', …) on every write; no notify on get.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleCssInput, type ModuleCssInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'custom-css';
const SENTINEL = '/* Custom CSS */';

// ── Local helpers ──────────────────────────────────────────────────────────────

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

function getSettings(): any {
  const settings = (globalThis as any).game?.settings;
  if (!settings) throw new Error('SETTINGS_UNAVAILABLE: game.settings is not bound — Foundry may not have reached ready state');
  return settings;
}

/** Normalize empty/null → sentinel (mirrors Settings.setStylesheet, settings.js:53). */
function normalizeCss(css: string | null | undefined): string {
  return (css === null || css === undefined || css === '') ? SENTINEL : css;
}

/** Read worldStylesheet, with legacy-key fallback mirroring Settings.getStylesheet("world"). */
function readWorldCss(): string {
  const settings = getSettings();
  const current: string = settings.get(MODULE_ID, 'worldStylesheet') ?? SENTINEL;
  if (current === SENTINEL || current === '') {
    try {
      const legacy: string = settings.get(MODULE_ID, 'stylesheet');
      if (legacy && legacy !== SENTINEL && legacy !== '') return legacy;
    } catch {
      // legacy key not registered — ignore.
    }
  }
  return current;
}

function readUserCss(): string {
  return getSettings().get(MODULE_ID, 'userStylesheet') ?? SENTINEL;
}

/** Re-inject on the GM client + broadcast to all other clients (mirrors Settings.updateStylesheets). */
function reapplyAndBroadcast(): void {
  // Re-inject on the GM's own browser session.
  try {
    (globalThis as any).window?.CustomCss?.applyStyles?.();
  } catch {
    // applyStyles best-effort — the settings write is the source of truth.
  }
  // Payload-free broadcast: each other client re-reads settings and re-injects.
  try {
    (globalThis as any).game?.socket?.emit?.('module.custom-css');
  } catch {
    // socket best-effort.
  }
}

/** Write world CSS, verify persistence (DP-16), re-inject + broadcast. Returns the persisted value. */
async function writeWorldCss(css: string): Promise<string> {
  const settings = getSettings();
  const value = normalizeCss(css);
  await settings.set(MODULE_ID, 'worldStylesheet', value);
  const verify: string = settings.get(MODULE_ID, 'worldStylesheet');
  if (verify !== value) {
    throw new Error(
      `CSS_WRITE_NOT_PERSISTED: worldStylesheet read-back mismatch (expected ${value.length} chars, got ${verify?.length ?? 'undefined'})`,
    );
  }
  reapplyAndBroadcast();
  return verify;
}

/** Write the GM's own client-scoped user CSS (GM session only). Returns the persisted value. */
async function writeUserCss(css: string): Promise<string> {
  const settings = getSettings();
  const value = normalizeCss(css);
  await settings.set(MODULE_ID, 'userStylesheet', value);
  // BUG-309: mirror writeWorldCss — verify read-back matches before reapplying
  const verify: string = settings.get(MODULE_ID, 'userStylesheet');
  if (verify !== value) {
    throw new Error(
      `CSS_WRITE_NOT_PERSISTED: userStylesheet read-back mismatch (expected ${value.length} chars, got ${verify?.length ?? 'undefined'})`,
    );
  }
  reapplyAndBroadcast();
  return verify;
}

const USER_SCOPE_CAVEAT =
  "userStylesheet is client-scoped (LocalStorage) — this is the GM session's own user CSS only; other players' user CSS is unreachable from the server.";

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleCss(data: unknown): Promise<any> {
  const g = requireModuleActive('custom-css');
  if (g) return g;

  const parsed = ModuleCssInput.parse(data);

  switch (parsed.action) {
    case 'get':    return handleGet(parsed);
    case 'set':    return handleSet(parsed);
    case 'append': return handleAppend(parsed);
    case 'reset':  return handleReset(parsed);
    default: {
      const _exhaustive: never = parsed;
      return { success: false, error: `Unknown module-css action: ${(_exhaustive as any).action}` };
    }
  }
}

// ── Read handler ───────────────────────────────────────────────────────────────

type GetInput = Extract<ModuleCssInputType, { action: 'get' }>;

async function handleGet(input: GetInput): Promise<Envelope<unknown>> {
  try {
    const worldStylesheet = readWorldCss();
    const data: Record<string, unknown> = {
      worldStylesheet,
      worldLength: worldStylesheet.length,
      isEmpty: worldStylesheet === SENTINEL,
    };
    if (input.includeUserStylesheet) {
      const userStylesheet = readUserCss();
      data.userStylesheet = userStylesheet;
      data.userLength = userStylesheet.length;
      data.userScopeCaveat = USER_SCOPE_CAVEAT;
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, error: `CSS_GET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Write handlers ─────────────────────────────────────────────────────────────

type SetInput = Extract<ModuleCssInputType, { action: 'set' }>;

async function handleSet(input: SetInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can modify world CSS' };
  try {
    const worldStylesheet = await writeWorldCss(input.css);
    const data: Record<string, unknown> = {
      worldStylesheet,
      worldLength: worldStylesheet.length,
      broadcast: true,
    };
    let summary = `world CSS set (${worldStylesheet.length} chars), broadcast to all clients`;
    if (input.userStylesheet !== undefined) {
      const userStylesheet = await writeUserCss(input.userStylesheet);
      data.userStylesheet = userStylesheet;
      data.userScopeCaveat = USER_SCOPE_CAVEAT;
      summary += `; GM user CSS set (${userStylesheet.length} chars)`;
    }
    notify.updated('setting', `Custom CSS — ${summary}`, {});
    return { success: true, data };
  } catch (e) {
    return { success: false, error: `CSS_SET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type AppendInput = Extract<ModuleCssInputType, { action: 'append' }>;

async function handleAppend(input: AppendInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can modify world CSS' };
  try {
    const existing = readWorldCss();
    const base = existing === SENTINEL ? '' : existing;
    const separator = input.separator ?? '\n\n';
    const combined = base ? `${base}${separator}${input.css}` : input.css;
    const worldStylesheet = await writeWorldCss(combined);
    notify.updated('setting', `Custom CSS — appended ${input.css.length} chars (total ${worldStylesheet.length}), broadcast`, {});
    return {
      success: true,
      data: {
        worldStylesheet,
        worldLength: worldStylesheet.length,
        appendedLength: input.css.length,
        broadcast: true,
      },
    };
  } catch (e) {
    return { success: false, error: `CSS_APPEND_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

type ResetInput = Extract<ModuleCssInputType, { action: 'reset' }>;

async function handleReset(_input: ResetInput): Promise<Envelope<unknown>> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: only the GM can reset world CSS' };
  try {
    const worldStylesheet = await writeWorldCss(SENTINEL);
    notify.updated('setting', 'Custom CSS — world CSS reset to empty, broadcast', {});
    return {
      success: true,
      data: { worldStylesheet, worldLength: worldStylesheet.length, reset: true, broadcast: true },
    };
  } catch (e) {
    return { success: false, error: `CSS_RESET_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}
