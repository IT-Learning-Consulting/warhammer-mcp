// Characterization snapshot tests — FoundryDataAccess.getWfrp4eConfig
// Phase 0 sub-phase 0.7.3: lock the return-shape so refactors have a regression net.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

// Minimal realistic game.wfrp4e.config surface. BUG-344 note: must live on game.wfrp4e.config,
// NOT CONFIG.WFRP4E — the latter is undefined in the live system.
const WFRP4E_CONFIG_STUB = {
  xpCost: { characteristic: 25, skill: 10, talent: 100, career: 200 },
  talentMax: { default: 1 },
  statusTiers: { Brass: 0, Silver: 1, Gold: 2 },
  earningValues: { Brass: '2d10', Silver: '1d10', Gold: '1' },
  conditions: {
    ablaze: 'Ablaze',
    bleeding: 'Bleeding',
    blinded: 'Blinded',
    broken: 'Broken',
    entangled: 'Entangled',
    fatigued: 'Fatigued',
    poisoned: 'Poisoned',
    stunned: 'Stunned',
  },
  // i18n-looking key to verify resolveI18nDeep doesn't break on non-WFRP4E. prefixes
  difficultyModifiers: { easy: 30, average: 0, hard: -20 },
};

describe('FoundryDataAccess.getWfrp4eConfig — characterization', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // game.wfrp4e.config is the canonical accessor (BUG-344)
    (globalThis as any).game = {
      ...(globalThis as any).game,
      wfrp4e: { config: WFRP4E_CONFIG_STUB },
      i18n: {
        // Simulate no actual i18n; return the key unchanged for non-WFRP4E. strings
        localize: (key: string) => key,
      },
    };
  });

  it('snapshot: allowed keys are returned, values shape preserved', async () => {
    const da = makeDA();
    const result = await da.getWfrp4eConfig({
      keys: ['xpCost', 'statusTiers', 'earningValues', 'conditions'],
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: non-allowed key is moved to skipped[], allowed key still returned', async () => {
    const da = makeDA();
    const result = await da.getWfrp4eConfig({
      keys: ['xpCost', 'secretKey', 'talentMax'],
    });
    expect(result).toMatchSnapshot();
  });

  it('snapshot: all-skipped input returns empty values and full skipped array', async () => {
    const da = makeDA();
    const result = await da.getWfrp4eConfig({ keys: ['badKey1', 'badKey2'] });
    expect(result).toMatchSnapshot();
  });
});
