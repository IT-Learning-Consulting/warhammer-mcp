// Phase 4g — /wfrp-build-npc legality check behavior per config.json.legality_mode.
// Pins the rules in SKILL.md §"Legality (Core p.32 ...)":
//   warn    → proceed + 1-line warning
//   enforce → refuse; list legal careergroups for the species
//   silent  → skip check entirely

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

type LegalityMode = 'warn' | 'enforce' | 'silent';
type Range = [number, number];
type Cell = Range | '—';

interface LegalityResult {
  allow: boolean;
  warnings: string[];
  legalAlternatives?: string[];
}

// Junction-safe absolute path (see build-npc-assets.test.ts for rationale)
// 2026-05-16: assets migrated to _shared/wfrp-character-build/ (bi-skill share).
const ASSET = 'E:/warhammer_system/.claude/skills/_shared/wfrp-character-build';

// CI runners (GitHub Actions ubuntu-latest) don't check out the vault repo — this
// test validates parity with a vault-only skill asset and is skipped when absent.
const HAS_VAULT = fs.existsSync(ASSET);
const matrix = HAS_VAULT ? JSON.parse(fs.readFileSync(path.join(ASSET, 'species-career-matrix.json'), 'utf8')) : {};

function checkLegality(species: string, careergroup: string, mode: LegalityMode): LegalityResult {
  const row = matrix[careergroup];
  if (!row) throw new Error(`unknown careergroup: ${careergroup}`);
  const cell: Cell = row[species];
  if (cell === undefined) throw new Error(`unknown species: ${species}`);

  const illegal = cell === '—';

  if (!illegal) return { allow: true, warnings: [] };

  if (mode === 'silent') return { allow: true, warnings: [] };
  if (mode === 'warn') {
    return {
      allow: true,
      warnings: [`${species} + ${careergroup} is not on the Random Class and Career Table; proceeding`],
    };
  }
  // enforce
  const legal = Object.keys(matrix).filter((cg) => matrix[cg][species] !== '—');
  return { allow: false, warnings: [], legalAlternatives: legal };
}

describe.skipIf(!HAS_VAULT)('build-npc legality — Halfling + Wizard (canonical illegal)', () => {
  it('warn: allows + emits 1 warning', () => {
    const r = checkLegality('Halfling', 'Wizard', 'warn');
    expect(r.allow).toBe(true);
    expect(r.warnings.length).toBe(1);
    expect(r.warnings[0]).toContain('not on the Random Class');
  });

  it('enforce: refuses + returns legal alternatives list', () => {
    const r = checkLegality('Halfling', 'Wizard', 'enforce');
    expect(r.allow).toBe(false);
    expect(r.warnings.length).toBe(0);
    expect(r.legalAlternatives).toBeDefined();
    expect(r.legalAlternatives!.length).toBeGreaterThan(0);
    // Halflings are legal at Apothecary per Core p.32
    expect(r.legalAlternatives).toContain('Apothecary');
  });

  it('silent: allows, zero warnings, no alternatives list', () => {
    const r = checkLegality('Halfling', 'Wizard', 'silent');
    expect(r.allow).toBe(true);
    expect(r.warnings.length).toBe(0);
    expect(r.legalAlternatives).toBeUndefined();
  });
});

describe.skipIf(!HAS_VAULT)('build-npc legality — legal combo (Dwarf + Slayer)', () => {
  it('warn: allows, zero warnings', () => {
    const r = checkLegality('Dwarf', 'Slayer', 'warn');
    expect(r.allow).toBe(true);
    expect(r.warnings.length).toBe(0);
  });

  it('enforce: allows, zero warnings', () => {
    const r = checkLegality('Dwarf', 'Slayer', 'enforce');
    expect(r.allow).toBe(true);
    expect(r.legalAlternatives).toBeUndefined();
  });

  it('silent: allows, zero warnings', () => {
    const r = checkLegality('Dwarf', 'Slayer', 'silent');
    expect(r.allow).toBe(true);
  });
});

describe.skipIf(!HAS_VAULT)('build-npc legality — unknown inputs throw', () => {
  it('unknown careergroup throws', () => {
    expect(() => checkLegality('Human', 'Necromancer', 'warn')).toThrow(/careergroup/);
  });

  it('unknown species throws', () => {
    expect(() => checkLegality('Unknown Species', 'Soldier', 'warn')).toThrow(/species/);
  });
});
