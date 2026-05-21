/**
 * Centralized GM feedback channel for warhammer-mcp.
 *
 * All `ui.notifications`, `ChatMessage`, and tooltip calls go through this
 * helper. Direct calls outside this module are caught by the migration guard
 * test (`src/__tests__/notify-migration-guard.test.ts`).
 *
 * Five channels, fired independently per call:
 *  1. **Console** — styled `%c` log with `light-dark(oklch())` colors. Always
 *     fires regardless of settings.
 *  2. **Toast** — `ui.notifications.success/info/warn/error`. Respects the
 *     `enableNotifications` world setting. Sticky (`permanent: true`) for
 *     error + lifecycle severities, or when `opts.sticky === true`.
 *  3. **Chat** — GM-whispered `ChatMessage` with `style: OTHER`. Fires only
 *     for severity ∈ {error, lifecycle}, or when `opts.chat === true`, or
 *     when the `auditWritesToChat` world setting is on.
 *  4. **Tooltip** — `game.tooltip.createLockedTooltip` pinned near a token /
 *     anchor for ~5s. Fires only when `opts.tooltip` is provided.
 *  5. **Hook** — `Hooks.callAll('warhammer-mcp:notify', payload)` for
 *     ecosystem listeners. Always fires.
 *
 * Verbose mode (any of `_dev-mode` flag, `localStorage.warhammer_mcp_verbose`,
 * or `mcpVerboseConsole` setting) wraps console output in `groupCollapsed`
 * with UUID, duration, and user.
 *
 * @see {@link https://github.com/anthropics/foundry-vtt-mcp .agents/plans/features/gm-feedback-channel-notify.md}
 *
 * @example
 *   notify.created('actor', 'Grimgor', { uuid: actor.uuid });
 *   notify.updated('item', 'Sword', { summary: 'on Kragnar', uuid: item.uuid });
 *   notify.deleted('scene', 'Old Tavern');
 *   notify.error('Failed to load', err);
 *   notify.lifecycle('connection-up', 'MCP connected successfully');
 *   notify.lifecycle('workflow-end', 'NPC built: Bandit Lieutenant');
 *   notify.warn('Permission denied');
 *   notify.info('Building index...');
 *
 *   // Canvas-anchored tooltip (apply-damage, apply-condition, etc.):
 *   notify.updated('actor', actor.name, {
 *     summary: '-5 wounds',
 *     tooltip: { tokenDoc, message: '-5 wounds' },
 *   });
 *
 *   // Progress bar (long-running ops like index rebuild):
 *   const handle = notify.progress('Building index...');
 *   handle.update(0.5, 'halfway');
 *   handle.done('Index built');
 *   // or handle.fail(err);
 */

import { MODULE_ID } from './constants.js';

// ============================================================================
// Public types
// ============================================================================

export type NotifyKind =
  | 'actor'
  | 'item'
  | 'effect'
  | 'active-effect'
  | 'scene'
  | 'journal'
  | 'rolltable'
  | 'token'
  | 'combat'
  | 'combatant'
  | 'condition'
  | 'template'
  | 'spell'
  | 'wall'
  | 'mcp'
  | 'light'
  | 'sound'
  | 'note'
  | 'region'
  | 'tile'
  | 'drawing'
  | 'playlist'
  | 'playlist-sound'
  | 'macro'
  | 'user'
  | 'compendium-pack'
  | 'compendium-document'
  | 'cross-doc-fk'
  | 'folder'
  | 'setting'
  | 'chatMessage';

export type NotifySeverity =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'warn'
  | 'error'
  | 'info'
  | 'lifecycle';

export interface NotifyTooltipOpts {
  tokenDoc?: any;
  anchor?: { top: number; left: number };
  message?: string;
}

export interface NotifyOpts {
  /** When set, fires the tooltip channel pinned near token / anchor. */
  tooltip?: NotifyTooltipOpts | undefined;
  /** Force-route to chat regardless of severity. */
  chat?: boolean | undefined;
  /** Force-sticky toast (permanent: true). Auto-enabled for error + lifecycle. */
  sticky?: boolean | undefined;
  /** Document UUID — surfaced in verbose mode. */
  uuid?: string | undefined;
  /** Operation duration in ms — surfaced in verbose mode. */
  durationMs?: number | undefined;
  /** Optional summary appended to the label. */
  summary?: string | undefined;
}

export interface ProgressHandle {
  update(pct: number, message?: string): void;
  done(message?: string): void;
  fail(err?: Error | string): void;
}

export interface NotifyHookPayload {
  severity: NotifySeverity;
  kind?: NotifyKind | undefined;
  label: string;
  opts?: NotifyOpts | undefined;
}

// ============================================================================
// Color palette — theme-safe via light-dark(oklch(L1 C H), oklch(L2 C H))
// Chromium >=123 (shipped 2024). Foundry v13's Electron meets this.
// ============================================================================

interface SeverityStyle {
  bg: string;
  fg: string;
  tag: string;
}

const COLORS: Record<NotifySeverity, SeverityStyle> = {
  created: { bg: 'light-dark(oklch(45% 0.20 145), oklch(68% 0.20 145))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'CREATE' },
  updated: { bg: 'light-dark(oklch(45% 0.18 250), oklch(68% 0.18 250))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'UPDATE' },
  deleted: { bg: 'light-dark(oklch(45% 0.22 25), oklch(70% 0.22 25))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'DELETE' },
  warn: { bg: 'light-dark(oklch(48% 0.18 70), oklch(72% 0.16 70))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'WARN' },
  error: { bg: 'light-dark(oklch(40% 0.25 25), oklch(72% 0.22 25))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'ERROR' },
  info: { bg: 'light-dark(oklch(42% 0.10 250), oklch(70% 0.10 250))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'INFO' },
  lifecycle: { bg: 'light-dark(oklch(40% 0.16 280), oklch(68% 0.16 280))', fg: 'light-dark(oklch(98% 0 0), oklch(15% 0 0))', tag: 'EVENT' },
};

export const MODULE_BADGE_STYLE =
  'background: light-dark(oklch(25% 0.02 280), oklch(85% 0.02 280)); ' +
  'color: light-dark(oklch(95% 0 0), oklch(15% 0 0)); ' +
  'padding: 1px 6px; border-radius: 3px; font-weight: bold;';

const RESET_STYLE = '';

export function badgeStyle(severity: NotifySeverity): string {
  const c = COLORS[severity];
  return `background: ${c.bg}; color: ${c.fg}; padding: 1px 6px; border-radius: 3px; font-weight: bold;`;
}

// ============================================================================
// Severity → ui.notifications method
// ============================================================================

const SEVERITY_TO_NOTIFICATION_LEVEL: Record<NotifySeverity, 'info' | 'warn' | 'error' | 'success'> = {
  created: 'success',
  updated: 'info',
  deleted: 'warn',
  warn: 'warn',
  error: 'error',
  info: 'info',
  lifecycle: 'info',
};

// ============================================================================
// Channel gating helpers
// ============================================================================

function shouldChat(severity: NotifySeverity, opts?: NotifyOpts): boolean {
  if (opts?.chat === true) return true;
  if (severity === 'error' || severity === 'lifecycle') return true;
  try {
    if ((game as any)?.settings?.get?.(MODULE_ID, 'auditWritesToChat')) return true;
  } catch {
    // Settings not yet registered (early init) — fall through.
  }
  return false;
}

function shouldSticky(severity: NotifySeverity, opts?: NotifyOpts): boolean {
  if (opts?.sticky === true) return true;
  return severity === 'error' || severity === 'lifecycle';
}

function isVerbose(): boolean {
  try {
    const devModeApi = (game as any)?.modules?.get?.('_dev-mode')?.api;
    if (devModeApi?.getPackageDebugValue) {
      return !!devModeApi.getPackageDebugValue(MODULE_ID);
    }
  } catch {
    // _dev-mode not installed.
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage?.getItem('warhammer_mcp_verbose') === '1') {
      return true;
    }
  } catch {
    // localStorage unavailable.
  }
  try {
    if ((game as any)?.settings?.get?.(MODULE_ID, 'mcpVerboseConsole')) return true;
  } catch {
    // Setting not registered yet.
  }
  return false;
}

function notificationsEnabled(): boolean {
  try {
    return !!((game as any)?.settings?.get?.(MODULE_ID, 'enableNotifications'));
  } catch {
    return true;
  }
}

function getGMIds(): string[] {
  try {
    const users: any[] = (game as any)?.users?.contents ?? (game as any)?.users ?? [];
    return users.filter((u: any) => u?.isGM).map((u: any) => u.id);
  } catch {
    return [];
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================================
// Channel emitters
// ============================================================================

function emitConsole(severity: NotifySeverity, label: string, opts?: NotifyOpts): void {
  const tag = COLORS[severity].tag;
  const moduleSeg = `%c${MODULE_ID}`;
  const tagSeg = `%c ${tag} `;
  const messageSeg = `%c ${label}`;

  if (isVerbose()) {
    console.groupCollapsed(
      `${moduleSeg}${tagSeg}${messageSeg}`,
      MODULE_BADGE_STYLE,
      badgeStyle(severity),
      RESET_STYLE,
    );
    if (opts?.uuid) console.log('UUID:', opts.uuid);
    if (opts?.durationMs !== undefined) console.log('Duration:', `${opts.durationMs}ms`);
    if (opts?.summary) console.log('Summary:', opts.summary);
    try {
      const userName = (game as any)?.user?.name;
      if (userName) console.log('User:', userName);
    } catch {
      // game.user unavailable.
    }
    console.groupEnd();
  } else {
    console.log(
      `${moduleSeg}${tagSeg}${messageSeg}`,
      MODULE_BADGE_STYLE,
      badgeStyle(severity),
      RESET_STYLE,
    );
  }
}

function emitToast(severity: NotifySeverity, label: string, opts?: NotifyOpts): any {
  if (!notificationsEnabled()) return undefined;
  const level = SEVERITY_TO_NOTIFICATION_LEVEL[severity];
  const sticky = shouldSticky(severity, opts);
  const message = `[${COLORS[severity].tag}] ${label}`;
  try {
    const notifications: any = (ui as any)?.notifications;
    if (!notifications) return undefined;
    const fn = (typeof notifications[level] === 'function' ? notifications[level] : notifications.info);
    return fn.call(notifications, message, { permanent: sticky, console: false });
  } catch (err) {
    console.error(`[${MODULE_ID}] [notify] toast emit failed:`, err);
    return undefined;
  }
}

function emitChat(severity: NotifySeverity, label: string, opts?: NotifyOpts): void {
  if (!shouldChat(severity, opts)) return;
  const gmIds = getGMIds();
  if (gmIds.length === 0) return;
  const tag = COLORS[severity].tag;
  const cssClass = `mcp-audit mcp-audit-${severity}`;
  const badgeClass = `mcp-audit-badge mcp-audit-badge-${severity}`;
  const summaryHtml = opts?.summary
    ? `<div class="mcp-audit-summary">${escapeHtml(opts.summary)}</div>`
    : '';
  const uuidHtml = opts?.uuid
    ? `<div class="mcp-audit-uuid"><code>${escapeHtml(opts.uuid)}</code></div>`
    : '';
  const content =
    `<div class="${cssClass}">` +
    `<span class="${badgeClass}">${tag}</span> ` +
    `<span class="mcp-audit-message">${escapeHtml(label)}</span>` +
    `${summaryHtml}${uuidHtml}` +
    `</div>`;
  try {
    const ChatMessage: any = (globalThis as any).ChatMessage;
    if (!ChatMessage?.create) return;
    Promise.resolve(
      ChatMessage.create({
        content,
        whisper: gmIds,
        style: 0,
        speaker: {},
      }),
    ).catch((err: any) => {
      console.error(`[${MODULE_ID}] [notify] ChatMessage.create rejected:`, err);
    });
  } catch (err) {
    console.error(`[${MODULE_ID}] [notify] ChatMessage.create threw:`, err);
  }
}

function emitTooltip(severity: NotifySeverity, label: string, opts?: NotifyOpts): void {
  if (!opts?.tooltip) return;
  const { tokenDoc, anchor, message } = opts.tooltip;
  try {
    const tip: any = (game as any)?.tooltip;
    if (!tip?.createLockedTooltip) return;
    let position = anchor;
    if (!position && tokenDoc) {
      const placeable: any = tokenDoc?.object;
      if (placeable && typeof placeable.x === 'number' && typeof placeable.y === 'number') {
        position = {
          top: placeable.y - 30,
          left: placeable.x + (placeable.width ?? 50) / 2,
        };
      }
    }
    if (!position) return;
    const text = message ?? `${COLORS[severity].tag}: ${label}`;
    const tooltipEl = tip.createLockedTooltip(position, text, {
      cssClass: `mcp-tooltip mcp-tooltip-${severity}`,
    });
    setTimeout(() => {
      try {
        if (tooltipEl) tip.dismissLockedTooltip(tooltipEl);
      } catch {
        // Tooltip already dismissed.
      }
    }, 5000);
  } catch (err) {
    console.error(`[${MODULE_ID}] [notify] tooltip emit failed:`, err);
  }
}

function emitHook(payload: NotifyHookPayload): void {
  try {
    const Hooks: any = (globalThis as any).Hooks;
    Hooks?.callAll?.(`${MODULE_ID}:notify`, payload);
  } catch (err) {
    console.error(`[${MODULE_ID}] [notify] hook emit failed:`, err);
  }
}

// ============================================================================
// Dispatcher
// ============================================================================

function makeLabel(kind: NotifyKind, name: string | null | undefined, opts?: NotifyOpts): string {
  const base = `${kind}: ${name ?? '<unnamed>'}`;
  return opts?.summary ? `${base} — ${opts.summary}` : base;
}

function dispatch(
  severity: NotifySeverity,
  label: string,
  kind: NotifyKind | undefined,
  opts?: NotifyOpts,
): void {
  emitConsole(severity, label, opts);
  emitToast(severity, label, opts);
  emitChat(severity, label, opts);
  emitTooltip(severity, label, opts);
  emitHook({ severity, kind, label, opts });
}

// ============================================================================
// Public API
// ============================================================================

export const notify = {
  /**
   * Surface a document-creation event (actor, item, effect, scene, ...).
   * Emits a green success toast, a green-badged console line, and a
   * `warhammer-mcp:notify` hook event. Chat audit fires only if
   * `opts.chat === true` or the `auditWritesToChat` setting is on.
   *
   * @param kind  Document kind — restricted to known `NotifyKind` strings.
   * @param name  Document name (may be null; falls back to `<unnamed>`).
   * @param opts  Optional payload (tooltip anchor, chat opt-in, summary, uuid).
   * @example notify.created('actor', actor.name, { uuid: actor.uuid });
   */
  created(kind: NotifyKind, name: string | null | undefined, opts?: NotifyOpts): void {
    dispatch('created', makeLabel(kind, name, opts), kind, opts);
  },

  /**
   * Surface a document-update event.
   * @param kind  Document kind.
   * @param name  Document name (nullable).
   * @param opts  Optional payload — `opts.summary` is recommended for updates
   *              to describe what changed (e.g. `'wounds -5'`).
   * @example notify.updated('actor', actor.name, { summary: '-5 wounds' });
   */
  updated(kind: NotifyKind, name: string | null | undefined, opts?: NotifyOpts): void {
    dispatch('updated', makeLabel(kind, name, opts), kind, opts);
  },

  /**
   * Surface a document-deletion event. Emits a red-toned warn toast.
   * Not the same as `error` — deletes are intentional, errors are unexpected.
   * @example notify.deleted('item', 'Sword of Pointy', { summary: 'from Kragnar' });
   */
  deleted(kind: NotifyKind, name: string | null | undefined, opts?: NotifyOpts): void {
    dispatch('deleted', makeLabel(kind, name, opts), kind, opts);
  },

  /**
   * Surface a non-fatal warning. Yellow-toned toast, not sticky by default
   * (pass `{sticky: true}` to keep it on screen).
   * @example notify.warn('Permission denied');
   */
  warn(message: string, opts?: NotifyOpts): void {
    dispatch('warn', message, undefined, opts);
  },

  /**
   * Surface a fatal/exceptional error. ALWAYS sticky toast + GM-whispered
   * chat audit. The `err` argument is appended to the message and the stack
   * is logged on a separate console line.
   * @param message  Operator-facing message (no internal detail).
   * @param err      Optional Error instance — message + stack appended.
   * @example notify.error('Failed to load actor', new Error('not found'));
   */
  error(message: string, err?: Error, opts?: NotifyOpts): void {
    const fullMessage = err
      ? `${message}: ${err.message ?? String(err)}`
      : message;
    dispatch('error', fullMessage, undefined, opts);
    if (err?.stack) {
      console.log(
        '%c[stack]',
        'color: light-dark(#666, #aaa); font-style: italic;',
      );
      console.log(err.stack);
    }
  },

  /**
   * Surface low-importance informational text. Use sparingly — most updates
   * should use `created/updated/deleted` for clearer semantics.
   * @example notify.info('Rebuilding index...');
   */
  info(message: string, opts?: NotifyOpts): void {
    dispatch('info', message, undefined, opts);
  },

  /**
   * Surface a connection-lifecycle event. Always sticky + chat (the GM needs
   * a durable signal for connect/disconnect/init events).
   * @param event    Lifecycle event identifier. `workflow-end` is fired by
   *                 skill bookends (wfrp-build-npc, wfrp-encounter-builder,
   *                 wfrp-combat) once a composite skill workflow completes.
   * @param message  GM-facing message.
   * @example notify.lifecycle('connection-up', 'MCP connected successfully');
   * @example notify.lifecycle('workflow-end', 'NPC built: Bandit Lieutenant');
   */
  lifecycle(
    event: 'connection-up' | 'connection-down' | 'init' | 'workflow-end',
    message: string,
  ): void {
    dispatch('lifecycle', message, 'mcp', { sticky: true, chat: true, summary: event });
  },

  /**
   * Begin a long-running operation with a progress bar toast. Returns a
   * handle whose `.update(pct, msg)`, `.done(msg)`, and `.fail(err)` methods
   * drive the toast in place (no flashing multi-toast pattern).
   *
   * @param message  Initial GM-facing message.
   * @returns ProgressHandle — call `.done()` or `.fail()` to clear the bar.
   * @example
   *   const handle = notify.progress('Building creature index...');
   *   for (let i = 0; i < N; i++) {
   *     handle.update(i / N, `Pack ${i + 1}/${N}`);
   *   }
   *   handle.done(`Indexed ${total} creatures`);
   */
  progress(message: string): ProgressHandle {
    emitConsole('info', message);
    let handle: any = undefined;
    if (notificationsEnabled()) {
      try {
        const notifications: any = (ui as any)?.notifications;
        handle = notifications?.info?.call(notifications, message, {
          permanent: true,
          progress: true,
          console: false,
        });
      } catch (err) {
        console.error(`[${MODULE_ID}] [notify] progress init failed:`, err);
      }
    }
    emitHook({ severity: 'info', label: message, opts: { sticky: true } });
    return {
      update(pct: number, msg?: string): void {
        try {
          if (handle?.update) {
            handle.update({ pct, message: msg });
          }
          if (msg) {
            emitConsole('info', `${msg} (${Math.round(pct * 100)}%)`);
          }
        } catch (err) {
          console.error(`[${MODULE_ID}] [notify] progress update failed:`, err);
        }
      },
      done(msg?: string): void {
        try {
          if (handle?.remove) handle.remove();
        } catch {
          // Toast already removed.
        }
        dispatch('created', msg ?? 'Done', undefined, undefined);
      },
      fail(err?: Error | string): void {
        try {
          if (handle?.remove) handle.remove();
        } catch {
          // Toast already removed.
        }
        const errObj =
          err instanceof Error
            ? err
            : new Error(typeof err === 'string' ? err : 'Operation failed');
        notify.error('Operation failed', errObj);
      },
    };
  },
};
