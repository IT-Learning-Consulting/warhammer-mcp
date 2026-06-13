// Phase 9 module_integration_v1 — Unit test for module-tokenbar dispatcher.
//
// Deterministic: mocks globalThis.game.modules + globalThis.MonksTokenBarAPI — no live Foundry.
// Branches:
//   - module inactive            → MODULE_NOT_ACTIVE envelope
//   - non-GM                     → GM_REQUIRED envelope
//   - bad movement enum          → ZodError (parse throws)
//   - 'combat' w/o active combat  → applied:false note
//   - API unbound                → TOKENBAR_API_UNAVAILABLE envelope
//   - global happy path          → changeMovement(movement), verified read-back
//   - per-token happy path        → changeMovement(movement, tokens)

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), info: vi.fn() },
}));

import { dispatchModuleTokenbar } from '../handlers/modules/tokenbar/tokenbar.js';
import { notify } from '../notify.js';

const MODULE_ID = 'monks-tokenbar';

function setGame(opts: { active: boolean; isGM: boolean; combatStarted?: boolean; movement?: string; api?: any }) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: opts.active } : undefined) },
    user: { isGM: opts.isGM },
    combat: opts.combatStarted ? { started: true } : undefined,
    settings: { get: (_ns: string, _key: string) => opts.movement ?? null },
    // monks-tokenbar exposes its API as game.MonksTokenBar (api.js:9).
    MonksTokenBar: opts.api,
  };
}

describe('dispatchModuleTokenbar', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).fromUuidSync = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when monks-tokenbar is inactive', async () => {
    setGame({ active: false, isGM: true });
    const r = await dispatchModuleTokenbar({ action: 'change-movement', movement: 'none' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('returns GM_REQUIRED for a non-GM caller', async () => {
    setGame({ active: true, isGM: false });
    const r = await dispatchModuleTokenbar({ action: 'change-movement', movement: 'none' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/^GM_REQUIRED:/);
  });

  it('throws on an invalid movement enum value', async () => {
    setGame({ active: true, isGM: true });
    await expect(
      dispatchModuleTokenbar({ action: 'change-movement', movement: 'ignore' } as any),
    ).rejects.toThrow();
  });

  it("reports applied:false for global 'combat' with no active combat", async () => {
    const changeMovement = vi.fn();
    setGame({ active: true, isGM: true, combatStarted: false, api: { changeMovement } });
    const r: any = await dispatchModuleTokenbar({ action: 'change-movement', movement: 'combat' });
    expect(r.success).toBe(true);
    expect(r.data.applied).toBe(false);
    expect(changeMovement).not.toHaveBeenCalled();
    // No-op path must still surface GM feedback (otherwise the GM sees silence).
    expect(notify.info).toHaveBeenCalled();
  });

  it('returns TOKENBAR_API_UNAVAILABLE when game.MonksTokenBar is unbound', async () => {
    setGame({ active: true, isGM: true, api: {} }); // no changeMovement
    const r = await dispatchModuleTokenbar({ action: 'change-movement', movement: 'none' });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/TOKENBAR_API_UNAVAILABLE/);
  });

  it('applies a global movement change (fire-and-forget, no racy read-back)', async () => {
    const changeMovement = vi.fn();
    setGame({ active: true, isGM: true, api: { changeMovement } });
    const r: any = await dispatchModuleTokenbar({ action: 'change-movement', movement: 'none' });
    expect(r.success).toBe(true);
    expect(r.data.scope).toBe('global');
    expect(r.data.applied).toBe(true);
    expect(r.data.movement).toBe('none');
    expect(changeMovement).toHaveBeenCalledWith('none');
  });

  it('applies a per-token movement change resolving token UUIDs', async () => {
    const changeMovement = vi.fn().mockResolvedValue(undefined);
    setGame({ active: true, isGM: true, api: { changeMovement } });
    (globalThis as any).fromUuidSync = (uuid: string) => ({ uuid });
    const r: any = await dispatchModuleTokenbar({
      action: 'change-movement',
      movement: 'free',
      tokens: ['Scene.a.Token.b'],
    });
    expect(r.success).toBe(true);
    expect(r.data.scope).toBe('per-token');
    expect(r.data.tokenCount).toBe(1);
    expect(changeMovement).toHaveBeenCalledWith('free', [{ uuid: 'Scene.a.Token.b' }]);
  });
});
