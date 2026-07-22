// BUG-845 — setting.set validates `value`'s JS type against the setting's REGISTERED type BEFORE
// calling game.settings.set(). Reproduced live: writing the string "false" to a Boolean-registered
// setting was silently coerced to `true` by Foundry's own game.settings.set (JS Boolean() truthiness),
// and the round-trip verify reported the SAME SETTING_WRITE_NOT_PERSISTED for that genuine corruption
// as for a harmless "true" mismatch that happened to coerce correctly — the caller could not tell the
// two failure modes apart from the error text. This guard closes the root cause: a mismatched primitive
// never reaches game.settings.set at all.
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dispatchSetting } from '../handlers/setting.js';

const NS = 'wfrp4e-economy';
const KEY = 'ventureEventsInCycle';
const FULL_KEY = `${NS}.${KEY}`;

function installGame(registered: Map<string, any>, storedValue: unknown) {
  const setMock = vi.fn(async (ns: string, key: string, value: unknown) => {
    // Mirror Foundry's OWN coercion for a Boolean-typed setting given a non-boolean primitive —
    // this is exactly the behaviour the guard must prevent from ever being reached.
    const cfg = registered.get(`${ns}.${key}`);
    storedValue = cfg?.type === Boolean && value !== null ? Boolean(value) : value;
  });
  (globalThis as any).game = {
    user: { isGM: true },
    settings: {
      settings: registered,
      get: vi.fn((_ns: string, _key: string) => storedValue),
      set: setMock,
    },
  };
  return setMock;
}

describe('BUG-845: setting.set type-validates before writing', () => {
  let registered: Map<string, any>;

  beforeEach(() => {
    registered = new Map([
      [FULL_KEY, { namespace: NS, key: KEY, type: Boolean, scope: 'world', config: true }],
    ]);
  });

  it('refuses a string value on a Boolean setting with SETTING_VALUE_TYPE_MISMATCH, never reaching game.settings.set', async () => {
    const setMock = installGame(registered, false);
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: KEY, value: 'false' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SETTING_VALUE_TYPE_MISMATCH');
    expect(res.error).toContain('registered as Boolean');
    expect(setMock).not.toHaveBeenCalled();
  });

  it('refuses the harmless-looking "true" string too — both directions are caught identically', async () => {
    const setMock = installGame(registered, false);
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: KEY, value: 'true' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SETTING_VALUE_TYPE_MISMATCH');
    expect(setMock).not.toHaveBeenCalled();
  });

  it('accepts a real boolean and persists it', async () => {
    const setMock = installGame(registered, true);
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: KEY, value: false });
    expect(res.success).toBe(true);
    expect(res.data.verified).toBe(true);
    expect(res.data.setting.value).toBe(false);
    expect(setMock).toHaveBeenCalledWith(NS, KEY, false);
  });

  it('refuses a boolean value on a registered Number setting', async () => {
    registered.set(FULL_KEY, { namespace: NS, key: KEY, type: Number, scope: 'world', config: true });
    const setMock = installGame(registered, 3);
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: KEY, value: true });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SETTING_VALUE_TYPE_MISMATCH');
    expect(res.error).toContain('registered as Number');
    expect(setMock).not.toHaveBeenCalled();
  });

  it('refuses a non-array value on a registered Array setting', async () => {
    registered.set(FULL_KEY, { namespace: NS, key: KEY, type: Array, scope: 'world', config: false });
    const setMock = installGame(registered, []);
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: KEY, value: 'not-an-array' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('SETTING_VALUE_TYPE_MISMATCH');
    expect(setMock).not.toHaveBeenCalled();
  });

  it('allows null through regardless of registered type — an explicit clear, not a type error', async () => {
    const setMock = installGame(registered, null);
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: KEY, value: null });
    expect(res.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith(NS, KEY, null);
  });

  it('does not block a write to an unregistered key — no type to check against', async () => {
    const emptyRegistry = new Map<string, any>();
    const setMock = installGame(emptyRegistry, 'anything');
    const res: any = await dispatchSetting({ action: 'set', namespace: NS, key: 'unregisteredKey', value: 'anything' });
    expect(res.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith(NS, 'unregisteredKey', 'anything');
  });
});
