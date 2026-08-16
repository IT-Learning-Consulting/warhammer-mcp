// BUG-791/792 — end-effects / end-sounds could clear an entire scene without confirmation.
//
// Why: an omitted or empty filter passes {} upstream, and Sequencer fills it with
// game.user.viewedScene — matching every deletable effect/sound on that scene. The
// separately-named end-all-effects/end-all-sounds already require confirm:true; these
// targeted aliases previously bypassed that gate entirely (BUG-791). Separately, the
// SoundFilter schema exposed an `effects` key that live SoundManager._validateFilters
// silently ignores (it reads `sounds`), so an intended single-sound-scoped end-sounds
// call actually fell through to the same whole-scene default (BUG-792).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchModuleSequencer } from '../sequencer.js';

const endEffectsMock = vi.fn().mockResolvedValue(undefined);
const endSoundsMock = vi.fn().mockResolvedValue(undefined);
const endAllEffectsMock = vi.fn().mockResolvedValue(undefined);
const endAllSoundsMock = vi.fn().mockResolvedValue(undefined);

function mockGlobalsActive() {
  (globalThis as any).game = {
    user: { isGM: true },
    modules: { get: (id: string) => (id === 'sequencer' ? { active: true } : null) },
  };
  (globalThis as any).Sequencer = {
    EffectManager: { endEffects: endEffectsMock, endAllEffects: endAllEffectsMock },
    SoundManager: { endSounds: endSoundsMock, endAllSounds: endAllSoundsMock },
  };
}

beforeEach(() => {
  mockGlobalsActive();
  endEffectsMock.mockClear();
  endSoundsMock.mockClear();
  endAllEffectsMock.mockClear();
  endAllSoundsMock.mockClear();
});

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Sequencer;
});

describe('end-effects — BUG-791 confirm gate on effective whole-scene scope', () => {
  it('refuses an omitted filter without confirm:true', async () => {
    const result = await dispatchModuleSequencer({ action: 'end-effects' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(endEffectsMock).not.toHaveBeenCalled();
  });

  it('refuses an empty filter object without confirm:true', async () => {
    const result = await dispatchModuleSequencer({ action: 'end-effects', filter: {} });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(endEffectsMock).not.toHaveBeenCalled();
  });

  it('proceeds with an omitted filter when confirm:true is supplied', async () => {
    const result = await dispatchModuleSequencer({ action: 'end-effects', confirm: true });
    expect(result.success).toBe(true);
    expect(endEffectsMock).toHaveBeenCalledTimes(1);
  });

  it('proceeds without confirm when the filter genuinely narrows scope', async () => {
    const result = await dispatchModuleSequencer({ action: 'end-effects', filter: { name: 'trap-flash' } });
    expect(result.success).toBe(true);
    expect(endEffectsMock).toHaveBeenCalledWith({ name: 'trap-flash' });
  });
});

describe('end-sounds — BUG-791/792 confirm gate + real `sounds` filter key', () => {
  it('refuses an omitted filter without confirm:true', async () => {
    const result = await dispatchModuleSequencer({ action: 'end-sounds' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(endSoundsMock).not.toHaveBeenCalled();
  });

  it('proceeds without confirm when scoped by the real `sounds` id filter (not the removed `effects` key)', async () => {
    const result = await dispatchModuleSequencer({ action: 'end-sounds', filter: { sounds: ['sound-id-1'] } });
    expect(result.success).toBe(true);
    expect(endSoundsMock).toHaveBeenCalledWith({ sounds: ['sound-id-1'] });
  });

  it('rejects the retired `effects` key on SoundFilter (unknown-key strict schema; Zod throws at parse)', async () => {
    // ModuleSequencerInput.parse() throws synchronously on schema violation — this dispatcher
    // does not catch it into an envelope (consistent with the rest of this handler).
    await expect(dispatchModuleSequencer({ action: 'end-sounds', filter: { effects: ['x'] } as any })).rejects.toThrow(/effects/);
    expect(endSoundsMock).not.toHaveBeenCalled();
  });
});
