// Phase 4h Phase 4.2 — skill-weapon correlation tests for /wfrp-encounter-builder.
// Loads skill-weapon-correlation.json from disk and verifies coverage + shape.
//
// Plan acceptance:
//   - All 15 wfrp4e weapon-group mappings represented.
//   - Each entry has a valid filter predicate matching ChoiceModel.options[].filters[] schema.
//   - Unknown specialisation falls back gracefully (random pick — tested by absence of mapping).

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Tests run via the D:\foundry-vtt-mcp junction; __dirname resolves to D:\, so use the
// vault absolute path to reach the skill assets.
const ASSET = 'E:/warhammer_system/.claude/skills/wfrp-encounter-builder/assets/skill-weapon-correlation.json';
void path;

// CI runners (GitHub Actions ubuntu-latest) don't check out the vault repo — this
// test validates parity with a vault-only skill asset and is skipped when absent.
const HAS_VAULT = fs.existsSync(ASSET);

const WFRP4E_WEAPON_GROUPS = [
  'basic', 'polearm', 'twohanded', 'cavalry', 'flail', 'fencing', 'brawling', 'parry',
  'bow', 'crossbow', 'sling', 'throwing', 'blackpowder', 'explosives', 'engineering',
];

describe.skipIf(!HAS_VAULT)('skill-weapon-correlation.json', () => {
  let data: Record<string, { path: string; operation: string; value: string }>;

  it('parses cleanly', () => {
    data = JSON.parse(fs.readFileSync(ASSET, 'utf8'));
    expect(typeof data).toBe('object');
  });

  it('covers all 15 wfrp4e weaponGroup values', () => {
    const valuesInAsset = new Set(Object.values(data).map((v) => v.value));
    const missing = WFRP4E_WEAPON_GROUPS.filter((g) => !valuesInAsset.has(g));
    expect(missing).toEqual([]);
  });

  it('every entry has the ChoiceModel filter predicate shape', () => {
    for (const [skillSpec, predicate] of Object.entries(data)) {
      expect(typeof skillSpec).toBe('string');
      expect(predicate).toMatchObject({
        path: 'system.weaponGroup.value',
        operation: '=',
      });
      expect(WFRP4E_WEAPON_GROUPS).toContain(predicate.value);
    }
  });

  it('every entry path uses Foundry property notation (system.X.value)', () => {
    for (const predicate of Object.values(data)) {
      expect(predicate.path).toMatch(/^system\.[a-zA-Z0-9.]+$/);
    }
  });

  it('unknown specialisation has no entry — walker treats absence as random fallback', () => {
    // Sanity check: a deliberately-unknown spec name has no mapping.
    expect(data['Melee (NotAReal)']).toBeUndefined();
    expect(data['Ranged (Unknown)']).toBeUndefined();
  });
});
