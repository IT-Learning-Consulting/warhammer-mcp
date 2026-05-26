import { MODULE_ID } from '../constants.js';
import { isMcpActive } from '../mcp-activity.js';

/**
 * Register a Hooks.on('renderApplicationV2') listener that plays a chime
 * whenever a dialog renders while an MCP request is in flight.
 *
 * Gate ordering (all must pass):
 *   1. Current user is GM
 *   2. dialogChimeEnabled setting is true
 *   3. isMcpActive() — counter > 0 (strict: no grace window)
 *   4. isDialogLike(app) — DialogV2 subclass or GM's custom class allowlist
 *
 * A failure in the hook body never propagates — the chime must not break dialog
 * rendering.
 */
export function registerMcpDialogChimeHook(): void {
  Hooks.on('renderApplicationV2', (app: any) => {
    try {
      if (!game.user?.isGM) return;
      if (!game.settings.get(MODULE_ID, 'dialogChimeEnabled')) return;
      if (!isMcpActive()) return;
      if (!isDialogLike(app)) return;

      playDialogChime();
    } catch (err) {
      console.warn(`[${MODULE_ID}] mcp-dialog-chime hook error:`, err);
    }
  });
}

/**
 * Returns true if the application looks like a blocking dialog.
 *
 * Matches DialogV2 (and all its subclasses, e.g. ItemDialog, ValueDialog) via
 * instanceof.  The GM-editable dialogChimeClasses setting provides an escape
 * hatch for dialog classes that extend ApplicationV2 directly.
 */
function isDialogLike(app: any): boolean {
  try {
    if (app instanceof (foundry as any).applications.api.DialogV2) return true;

    const classesRaw: string = (game.settings.get(MODULE_ID, 'dialogChimeClasses') as string) ?? '';
    const allowlist = classesRaw
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    return allowlist.includes(app?.constructor?.name);
  } catch {
    return false;
  }
}

/**
 * Play the configured chime sound locally for the GM (no broadcast).
 *
 * Reads dialogChimeSound and dialogChimeVolume from client settings, falls
 * back to Foundry's built-in notify.wav and 0.8 volume.  Errors are swallowed
 * so a missing sound file never breaks dialog rendering.
 */
export function playDialogChime(): void {
  try {
    const src: string =
      (game.settings.get(MODULE_ID, 'dialogChimeSound') as string) || 'sounds/notify.wav';
    const volume: number =
      (game.settings.get(MODULE_ID, 'dialogChimeVolume') as number) ?? 0.8;

    (foundry as any).audio.AudioHelper.play({ src, volume, channel: 'interface' }, false);
  } catch (err) {
    console.warn(`[${MODULE_ID}] playDialogChime error:`, err);
  }
}
