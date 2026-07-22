// Phase 4g — /wfrp-build-npc asset shape validation.
// Non-runtime tests: reads the extractor's output + hand-authored assets and
// asserts schema invariants locked in references/career-data-shape.md and
// references/configuration.md.
//
// Post-R-007 migration (2026-05-15 port): the single-file `careers.json` +
// `career-index.json` layout was migrated to per-careergroup `careers/<group>.json`
// files (one per group; expansion modules add `__<module>` suffix variants) plus
// a flat `career-lookup.ndjson` for per-career indexing. The extractor at
// _tools/extract-build-npc-assets.mjs:319-322 actively deletes any legacy
// `careers.json` it finds. This test file was ported to the new layout but
// preserves every original invariant (64 core careergroups, levels[0..3],
// Apothecary L2 anchor, Slayer level names, 256 core careers, etc.) by
// filtering to module_id="wfrp4e-core".

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// NOTE: this file lives at warhammer-mcp/src/__tests__/, which is a junction
// to D:\foundry-vtt-mcp\packages\foundry-module\. __dirname resolves to the
// D:\ target, so relative paths escape the vault. Anchor to E:\ explicitly.
// 2026-05-16: wfrp-build-npc/assets/ migrated to _shared/wfrp-character-build/ (bi-skill share with /wfrp-build-pc).
const ASSET = 'E:/warhammer_system/.claude/skills/_shared/wfrp-character-build';

// CI runners (GitHub Actions ubuntu-latest) don't check out the vault repo — these
// tests validate parity with vault-only skill assets and are skipped when absent.
// Guarded at the loader level (not just describe.skipIf) because several describe
// bodies below call these loaders directly, outside any `it()`, so they'd otherwise
// still execute — and throw — during test collection even on a skipped suite.
const HAS_VAULT = fs.existsSync(ASSET);

function readJson(name: string): any {
  if (!HAS_VAULT) return {};
  return JSON.parse(fs.readFileSync(path.join(ASSET, name), 'utf8'));
}

// Reconstruct the legacy `careers.json` shape (one object keyed by careergroup,
// each value with class + levels[0..3]) from the new per-careergroup files.
// Filter to module_id="wfrp4e-core" to preserve the original "64 core careergroups"
// invariant — expansion modules (wfrp4e-archives, wfrp4e-soc, wfrp4e-wom, etc.)
// add their own variants under `__<module>` suffixes which are out of scope here.
function loadCoreCareers(): Record<string, any> {
  if (!HAS_VAULT) return {};
  const CAREERS_DIR = path.join(ASSET, 'careers');
  const result: Record<string, any> = {};
  for (const filename of fs.readdirSync(CAREERS_DIR)) {
    if (!filename.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(CAREERS_DIR, filename), 'utf8'));
    if (data.module_id !== 'wfrp4e-core') continue;
    result[data.group_key] = data;
  }
  return result;
}

// Reconstruct the legacy `career-index.json` shape (one entry per individual
// career, keyed by name, value = {pack_id, item_id, level, careergroup}) from
// the new flat NDJSON. Filter to wfrp4e-core for the original 256-entry invariant.
function loadCoreCareerIndex(): Record<string, any> {
  if (!HAS_VAULT) return {};
  const ndjson = fs.readFileSync(path.join(ASSET, 'career-lookup.ndjson'), 'utf8');
  const result: Record<string, any> = {};
  for (const line of ndjson.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    if (rec.module_id !== 'wfrp4e-core') continue;
    result[rec.name] = {
      pack_id: rec.pack_id,
      item_id: rec.item_id,
      level: rec.level,
      careergroup: rec.careergroup,
    };
  }
  return result;
}

describe.skipIf(!HAS_VAULT)('build-npc assets — careers/* (per-careergroup files; core-filtered)', () => {
  const careers = loadCoreCareers();
  const keys = Object.keys(careers);

  it('has exactly 64 core careergroups', () => {
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

describe.skipIf(!HAS_VAULT)('build-npc assets — career-lookup.ndjson (per-career index; core-filtered)', () => {
  const index = loadCoreCareerIndex();

  it('has exactly 256 core entries (64 careergroups × 4 levels)', () => {
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

describe.skipIf(!HAS_VAULT)('build-npc assets — species-bases.json', () => {
  const species = readJson('species-bases.json');

  it('has exactly 8 species (5 core + Norse/Gnome/Ogre via wfrp4e-core fallbacks)', () => {
    expect(Object.keys(species).sort()).toEqual(['Dwarf', 'Gnome', 'Halfling', 'High Elf', 'Human', 'Norse', 'Ogre', 'Wood Elf']);
  });

  it('every species has world_template_id + compendium_fallback + aliases', () => {
    for (const [, entry] of Object.entries<any>(species)) {
      expect(entry.world_template_id).toMatch(/^[A-Za-z0-9]{16}$/);
      // Norse compendium lives in wfrp4e-tribes; core species in wfrp4e-core.actors.
      expect(entry.compendium_fallback.pack_id).toMatch(/^wfrp4e-(core|tribes)\.actors$/);
      expect(entry.compendium_fallback.item_id).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(Array.isArray(entry.aliases)).toBe(true);
      expect(entry.aliases.length).toBeGreaterThan(0);
    }
  });

  it('Human world_template_id is T1fQ1f0RMliQY4uc', () => {
    expect(species['Human'].world_template_id).toBe('T1fQ1f0RMliQY4uc');
  });
});

describe.skipIf(!HAS_VAULT)('build-npc assets — species-career-matrix.json', () => {
  const matrix = readJson('species-career-matrix.json');
  const careers = loadCoreCareers();
  const species = ['Human', 'Dwarf', 'Halfling', 'High Elf', 'Wood Elf', 'Norse'];

  it('is a superset of the 64 core careergroups (expansion modules add more)', () => {
    const mKeys = new Set(Object.keys(matrix));
    const cKeys = new Set(Object.keys(careers));
    // Matrix may contain expansion-only careergroups; the invariant is that
    // every core careergroup MUST be present so the d100 distribution is complete.
    expect(mKeys.size).toBeGreaterThanOrEqual(cKeys.size);
    for (const k of cKeys) expect(mKeys.has(k)).toBe(true);
  });

  it('each entry has exactly the 8 species keys', () => {
    for (const cg of Object.keys(matrix)) {
      expect(Object.keys(matrix[cg]).sort()).toEqual(['Dwarf', 'Gnome', 'Halfling', 'High Elf', 'Human', 'Norse', 'Ogre', 'Wood Elf']);
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

  it('5 original species have full d100 coverage over CORE careergroups', () => {
    // d100 distribution invariant: the 5 original WFRP4e species (Human/Dwarf/Halfling/
    // High Elf/Wood Elf) each have a complete d100 roll across the 64 core careergroups.
    // Expansion careergroups (matrix superset) add OPTIONAL careers beyond d100 — they
    // are NOT part of the canonical core roll, so the assertion scopes to core only.
    //
    // Norse (Tribes expansion species) has its OWN distribution that mixes core +
    // expansion careergroups; its core-only sum is partial-by-design (~97/100 in current
    // data) — Norse has its own rollable matrix in wfrp4e-tribes. Out of scope here.
    const coreKeys = new Set(Object.keys(careers));
    const coreSpecies = ['Human', 'Dwarf', 'Halfling', 'High Elf', 'Wood Elf'];
    for (const s of coreSpecies) {
      let total = 0;
      for (const cg of Object.keys(matrix)) {
        if (!coreKeys.has(cg)) continue;
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

describe.skipIf(!HAS_VAULT)('build-npc assets — cost-tables.json', () => {
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

describe.skipIf(!HAS_VAULT)('build-npc assets — config.json', () => {
  // config.json is npc-specific and stayed in wfrp-build-npc/assets/ post-2026-05-16 rename.
  const NPC_CONFIG = 'E:/warhammer_system/.claude/skills/wfrp-build-npc/assets';
  const config = HAS_VAULT ? JSON.parse(fs.readFileSync(path.join(NPC_CONFIG, 'config.json'), 'utf8')) : {};

  it('has all 10 top-level keys', () => {
    // BUG-427: criminal_mode added for /wfrp-build-npc --mode criminal (SKILL.md §criminal mode).
    // BUG-708 (task 4.2): class_mode added for /wfrp-build-npc --mode riverfolk.
    expect(Object.keys(config).sort()).toEqual([
      'career_overrides', 'class_mode', 'coin_items', 'criminal_mode', 'default_actor_type', 'legality_mode',
      'money_roll', 'species_overrides', 'talent_policy', 'with_details_default',
    ]);
  });

  it('criminal_mode.careergroups is a non-empty array of career-group name strings', () => {
    expect(Array.isArray(config.criminal_mode.careergroups)).toBe(true);
    expect(config.criminal_mode.careergroups.length).toBeGreaterThan(0);
    for (const cg of config.criminal_mode.careergroups) {
      expect(typeof cg).toBe('string');
      expect(cg.length).toBeGreaterThan(0);
    }
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
    // default_actor_type migrated from a single string to a per-species-source object
    // (player_species vs bestiary_species; allows e.g. "creature for bestiary, npc for players").
    expect(typeof config.default_actor_type).toBe('object');
    expect(['creature', 'npc']).toContain(config.default_actor_type.player_species);
    expect(['creature', 'npc']).toContain(config.default_actor_type.bestiary_species);
    expect(['warn', 'enforce', 'silent']).toContain(config.legality_mode);
  });
});
