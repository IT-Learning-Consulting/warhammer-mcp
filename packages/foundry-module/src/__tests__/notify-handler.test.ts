// Phase 4 mcp_notify_coverage — unit tests for QueryHandlers.handleNotify.
//
// Coverage matrix per plan §B.2 acceptance:
//   - GM gate rejection
//   - Zod rejection of lifecycle-without-lifecycleEvent
//   - 7 severity dispatches (created/updated/deleted/warn/info/error/lifecycle)
//   - acknowledged=true on happy path
//   - acknowledged=false when underlying notify.* throws
//
// Mocking pattern mirrors notify.test.ts (setupGMUsers / setupNotificationsMock).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryHandlers } from '../queries.js';
import * as notifyModule from '../notify.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

function invokeNotify(qh: QueryHandlers, data: unknown): Promise<any> {
  return (qh as any).handleNotify(data);
}

describe('handleNotify (mcp_notify_coverage Phase 4)', () => {
  let createdSpy: ReturnType<typeof vi.spyOn>;
  let updatedSpy: ReturnType<typeof vi.spyOn>;
  let deletedSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let lifecycleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      user: { isGM: true, id: 'gm', name: 'GM' },
    };
    createdSpy = vi.spyOn(notifyModule.notify, 'created').mockImplementation(() => {});
    updatedSpy = vi.spyOn(notifyModule.notify, 'updated').mockImplementation(() => {});
    deletedSpy = vi.spyOn(notifyModule.notify, 'deleted').mockImplementation(() => {});
    warnSpy = vi.spyOn(notifyModule.notify, 'warn').mockImplementation(() => {});
    infoSpy = vi.spyOn(notifyModule.notify, 'info').mockImplementation(() => {});
    errorSpy = vi.spyOn(notifyModule.notify, 'error').mockImplementation(() => {});
    lifecycleSpy = vi.spyOn(notifyModule.notify, 'lifecycle').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── GM gate ────────────────────────────────────────────────────────────────

  it('rejects non-GM caller', async () => {
    (globalThis as any).game.user = { isGM: false, id: 'p', name: 'Player' };
    const qh = makeHandlers();

    const res = await invokeNotify(qh, { severity: 'info', message: 'x' });

    expect(res).toEqual({ success: false, error: expect.stringMatching(/Access denied/) });
    expect(infoSpy).not.toHaveBeenCalled();
  });

  // ── Zod rejection ──────────────────────────────────────────────────────────

  it('rejects severity=lifecycle without lifecycleEvent', async () => {
    const qh = makeHandlers();

    const res = await invokeNotify(qh, { severity: 'lifecycle', message: 'x' });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/NOTIFY_INVALID_INPUT|lifecycleEvent/);
    expect(lifecycleSpy).not.toHaveBeenCalled();
  });

  it('rejects unknown severity', async () => {
    const qh = makeHandlers();

    const res = await invokeNotify(qh, { severity: 'bogus', message: 'x' });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/NOTIFY_INVALID_INPUT/);
  });

  // ── Dispatch per severity ──────────────────────────────────────────────────

  it('dispatches severity=created to notify.created("mcp", ...)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, { severity: 'created', message: 'hi' });
    expect(createdSpy).toHaveBeenCalledWith('mcp', 'hi', expect.any(Object));
  });

  it('dispatches severity=updated to notify.updated("mcp", ...)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, { severity: 'updated', message: 'hi' });
    expect(updatedSpy).toHaveBeenCalledWith('mcp', 'hi', expect.any(Object));
  });

  it('dispatches severity=deleted to notify.deleted("mcp", ...)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, { severity: 'deleted', message: 'hi' });
    expect(deletedSpy).toHaveBeenCalledWith('mcp', 'hi', expect.any(Object));
  });

  it('dispatches severity=warn to notify.warn(message, opts)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, { severity: 'warn', message: 'oops' });
    expect(warnSpy).toHaveBeenCalledWith('oops', expect.any(Object));
  });

  it('dispatches severity=info to notify.info(message, opts)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, { severity: 'info', message: 'fyi' });
    expect(infoSpy).toHaveBeenCalledWith('fyi', expect.any(Object));
  });

  it('dispatches severity=error to notify.error(message, undefined, opts)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, { severity: 'error', message: 'boom' });
    expect(errorSpy).toHaveBeenCalledWith('boom', undefined, expect.any(Object));
  });

  it('dispatches severity=lifecycle to notify.lifecycle(event, message)', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, {
      severity: 'lifecycle',
      lifecycleEvent: 'workflow-end',
      message: 'NPC built',
    });
    expect(lifecycleSpy).toHaveBeenCalledWith('workflow-end', 'NPC built');
  });

  // ── acknowledged envelope ──────────────────────────────────────────────────

  it('returns acknowledged=true on successful dispatch', async () => {
    const qh = makeHandlers();
    const res = await invokeNotify(qh, { severity: 'info', message: 'x' });
    expect(res).toEqual({ success: true, data: { acknowledged: true } });
  });

  it('returns acknowledged=false when notify throws', async () => {
    warnSpy.mockImplementation(() => {
      throw new Error('dispatcher crash');
    });
    const qh = makeHandlers();
    const res = await invokeNotify(qh, { severity: 'warn', message: 'x' });
    expect(res).toEqual({ success: true, data: { acknowledged: false } });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // ── Forwarding of opts ─────────────────────────────────────────────────────

  it('forwards summary/sticky/chat opts on non-lifecycle severities', async () => {
    const qh = makeHandlers();
    await invokeNotify(qh, {
      severity: 'info',
      message: 'x',
      summary: 'detail',
      sticky: true,
      chat: true,
    });
    expect(infoSpy).toHaveBeenCalledWith(
      'x',
      expect.objectContaining({ summary: 'detail', sticky: true, chat: true }),
    );
  });

  it('rejects summary/sticky/chat on severity=lifecycle (schema strictness)', async () => {
    const qh = makeHandlers();
    const res = await invokeNotify(qh, {
      severity: 'lifecycle',
      lifecycleEvent: 'workflow-end',
      message: 'x',
      summary: 'detail',
    });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/NOTIFY_INVALID_INPUT/);
  });
});
