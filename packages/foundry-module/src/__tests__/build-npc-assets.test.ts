// Phase 4g — /wfrp-build-npc asset shape validation.
// Non-runtime tests: reads the extractor's output + hand-authored assets and
// asserts schema invariants locked in references/career-data-shape.md and
// references/configuration.md.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// NOTE: this file lives at warhammer-mcp/src/__tests__/, which is a junction
// to D:\foundry-vtt-mcp\packages\foundry-module\. __dirname resolves to the
// D:\ target, so relative paths escape the vault. Anchor to E:\ explicitly.
const ASSET = 'E:/warhammer_system/.claude/skills/wfrp-build-npc/assets';

function readJson(name: string): any {
  return JSON.parse(fs.readFileSync(path.join(ASSET, name), 'utf8'));
}

describe('build-npc assets — careers.json', () => {
  const careers = readJson('careers.json');
  const keys = Object.keys(careers);

  it('has exactly 64 careergroups', () => {
    expect(keys.length).toBe(64);
  });

  it('every careergroup has levels[0..3] and no missing gaps', () => {
    for (const k of keys) {
      const entry = careers[k];
      expect(entry.levels.length).toBe(4);
      for (let i = 0; i < 4; i++) {
        expect(entry.levels[i].level).toBe(i + 1);
        expect(entry.levels[i].missing).toBeUndefined();
        expect(entry.levels[i].item_id).toMatch(/^[A-Za-z0-9]{16}$/);
      }
    }
  });

  it('class is one of the 8 canonical WFRP4e classes', () => {
    // Compendium uses "Rangers" plural (schema doc §1 had "Ranger" singular — typo; data wins)
    const valid = new Set(['Academics', 'Burghers', 'Courtiers', 'Peasants', 'Rangers', 'Riverfolk', 'Rogues', 'Warriors']);
    for (const k of keys) {
      expect(valid.has(careers[k].class)).toBe(true);
    }
  });

  it('every level has characteristics as array-of-strings (normalized)', () => {
    for (const k of keys) {
      for (const lv of careers[k].levels) {
        expect(Array.isArray(lv.characteristics)).toBe(true);
        for (const c of lv.characteristics) {
          expect(typeof c).toBe('string');
        }
      }
    }
  });

  it('Apothecary L2 matches worked example in schema doc', () => {
    const l2 = careers['Apothecary'].levels[1];
    expect(l2.name).toBe('Apothecary');
    expect(l2.item_id).toBe('0Y29f5H8h6lyfT9f');
    expect(l2.status).toEqual({ tier: 's', standing: 1 });
  });

  it('Slayer levels are Troll/Giant/Dragon/Daemon', () => {
    const names = careers['Slayer'].levels.map((l: any) => l.name);
    expect(names).toEqual(['Troll Slayer', 'Giant Slayer', 'Dragon Slayer', 'Daemon Slayer']);
  });
});

describe('build-npc assets — career-index.json', () => {
  const index = readJson('career-index.json');

  it('has exactly 256 entries', () => {
    expect(Object.keys(index).length).toBe(256);
  });

  it('every entry has the locked shape', () => {
    for (const [name, rec] of Object.entries<any>(index)) {
      expect(typeof name).toBe('string');
      expect(rec.pack_id).toBe('wfrp4e-core.items');
      expect(rec.item_id).toMatch(/^[A-Za-z0-9]{16}$/);
      expect([1, 2, 3, 4]).toContain(rec.level);
      expect(typeof rec.careergroup).toBe('string');
    }
  });

  it('Apothecary → 0Y29f5H8h6lyfT9f L2 Apothecary', () => {
    expect(index['Apothecary']).toEqual({
      pack_id: 'wfrp4e-core.items',
      item_id: '0Y29f5H8h6lyfT9f',
      level: 2,
      careergroup: 'Apothecary',
    });
  });
});

describe('build-npc assets — species-bases.json', () => {
  const species = readJson('species-bases.json');

  it('has exactly 5 species', () => {
    expect(Object.keys(species).sort()).toEqual(['Dwarf', 'Halfling', 'High Elf', 'Human', 'Wood Elf']);
  });

  it('every species has world_template_id + compendium_fallback + aliases', () => {
    for (const [name, entry] of Object.entries<any>(species)) {
      expect(entry.world_template_id).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(entry.compendium_fallback.pack_id).toBe('wfrp4e-core.actors');
      expect(entry.compendium_fallback.item_id).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(Array.isArray(entry.aliases)).toBe(true);
      expect(entry.aliases.length).toBeGreaterThan(0);
    }
  });

  it('Human world_template_id is T1fQ1f0RMliQY4uc', () => {
    expect(species['Human'].world_template_id).toBe('T1fQ1f0RMliQY4uc');
  });
});

describe('build-npc assets — species-career-matrix.json', () => {
  const matrix = readJson('species-career-matrix.json');
  const careers = readJson('careers.json');
  const species = ['Human', 'Dwarf', 'Halfling', 'High Elf', 'Wood Elf'];

  it('has exactly 64 keys matching careers.json careergroups', () => {
    const mKeys = new Set(Object.keys(matrix));
    const cKeys = new Set(Object.keys(careers));
    expect(mKeys.size).toBe(64);
    for (const k of cKeys) expect(mKeys.has(k)).toBe(true);
  });

  it('each entry has exactly the 5 species keys', () => {
    for (const cg of Object.keys(matrix)) {
      expect(Object.keys(matrix[cg]).sort()).toEqual(['Dwarf', 'Halfling', 'High Elf', 'Human', 'Wood Elf']);
    }
  });

  it('each cell is [min,max] or "—" with 1 ≤ min ≤ max ≤ 100', () => {
    for (const cg of Object.keys(matrix)) {
      for (const s of species) {
        const v = matrix[cg][s];
        if (v === '—') continue;
        expect(Array.isArray(v)).toBe(true);
        expect(v.length).toBe(2);
        expect(v[0]).toBeGreaterThanOrEqual(1);
        expect(v[0]).toBeLessThanOrEqual(v[1]);
        expect(v[1]).toBeLessThanOrEqual(100);
      }
    }
  });

  it('per-species total legal range equals exactly 100 (d100 coverage)', () => {
    for (const s of species) {
      let total = 0;
      for (const cg of Object.keys(matrix)) {
        const v = matrix[cg][s];
        if (Array.isArray(v)) total += v[1] - v[0] + 1;
      }
      expect(total).toBe(100);
    }
  });

  it('Slayer is Dwarf-only', () => {
    expect(matrix['Slayer']['Dwarf']).toEqual([97, 100]);
    for (const s of ['Human', 'Halfling', 'High Elf', 'Wood Elf']) {
      expect(matrix['Slayer'][s]).toBe('—');
    }
  });

  it('Nun is Human-only', () => {
    expect(matrix['Nun']['Human']).toEqual([4, 5]);
    for (const s of ['Dwarf', 'Halfling', 'High Elf', 'Wood Elf']) {
      expect(matrix['Nun'][s]).toBe('—');
    }
  });

  it('Wizard: no Dwarf/Halfling; Human/HighElf/WoodElf have ranges', () => {
    expect(matrix['Wizard']['Dwarf']).toBe('—');
    expect(matrix['Wizard']['Halfling']).toBe('—');
    expect(matrix['Wizard']['Human']).toEqual([14, 14]);
    expect(matrix['Wizard']['High Elf']).toEqual([13, 16]);
    expect(matrix['Wizard']['Wood Elf']).toEqual([2, 5]);
  });
});

describe('build-npc assets — cost-tables.json', () => {
  const cost = readJson('cost-tables.json');

  it('characteristic + skill curves are 15-entry arrays', () => {
    expect(cost.characteristic.length).toBe(15);
    expect(cost.skill.length).toBe(15);
  });

  it('first characteristic band is 25 (matches wfrp4e.js:21134)', () => {
    expect(cost.characteristic[0]).toBe(25);
  });

  it('first skill band is 10 (matches wfrp4e.js:21135)', () => {
    expect(cost.skill[0]).toBe(10);
  });

  it('talent + career_change are locked constants', () => {
    expect(cost.talent).toEqual({ base: 100, per_prior: 100 });
    expect(cost.career_change).toEqual({ complete: 100, incomplete: 200, cross_class_penalty: 100 });
  });
});

describe('build-npc assets — config.json', () => {
  const config = readJson('config.json');

  it('has all 7 top-level keys', () => {
    expect(Object.keys(config).sort()).toEqual([
      'career_overrides', 'coin_items', 'default_actor_type', 'legality_mode',
      'money_roll', 'species_overrides', 'talent_policy',
    ]);
  });

  it('coin_items has all three currencies with valid 16-char IDs', () => {
    for (const coin of ['Gold Crown', 'Silver Shilling', 'Brass Penny']) {
      expect(config.coin_items[coin].pack_id).toBe('wfrp4e-core.items');
      expect(config.coin_items[coin].item_id).toMatch(/^[A-Za-z0-9]{16}$/);
    }
  });

  it('money_roll has brass/silver/gold entries with {dice, coin} shape', () => {
    // Per Core p.64: earnings = dice × standing. Defaults: brass 2d10, silver 1d10, gold 1 (flat).
    for (const tier of ['brass', 'silver', 'gold']) {
      expect(typeof config.money_roll[tier].dice).toBe('string');
      expect(typeof config.money_roll[tier].coin).toBe('string');
    }
    expect(config.money_roll.brass.dice).toBe('2d10');
    expect(config.money_roll.brass.coin).toBe('Brass Penny');
    expect(config.money_roll.silver.dice).toBe('1d10');
    expect(config.money_roll.silver.coin).toBe('Silver Shilling');
    expect(config.money_roll.gold.dice).toBe('1');
    expect(config.money_roll.gold.coin).toBe('Gold Crown');
  });

  it('enums are in allowed sets', () => {
    expect(['all', 'min']).toContain(config.talent_policy);
    expect(['creature', 'npc']).toContain(config.default_actor_type);
    expect(['warn', 'enforce', 'silent']).toContain(config.legality_mode);
  });
});
