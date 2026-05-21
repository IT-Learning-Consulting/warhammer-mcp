// MCP Completion v1 Phase 1 (R1.1) — manage-character typed actorType branching.
// Parse-only tests (~24 cases) covering Zod schema acceptance/rejection per actor type.
// No live Foundry calls; these verify the schema layer + runtime guard logic only.

import { describe, it, expect } from 'vitest';
import { ManageCharacterSchema } from '../tools/manage-character.js';

// Shared base for update-stats payloads
const base = { action: 'update-stats' as const, characterName: 'Test Actor' };

describe('actorType default — back-compat regression guard', () => {
  it('parses without actorType and defaults to character', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      updates: { weaponSkill: 40 },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.actorType).toBe('character');
  });

  it('parses actorType=character explicitly', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: { weaponSkill: 35, toughness: 30, fortune: 3 },
    });
    expect(r.success).toBe(true);
  });
});

describe('actorType=character — accepts all character fields', () => {
  it('accepts 10 characteristics', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: {
        weaponSkill: 40, ballisticSkill: 35, strength: 30, toughness: 28,
        initiative: 32, agility: 33, dexterity: 30, intelligence: 35,
        willpower: 30, fellowship: 28,
      },
    });
    expect(r.success).toBe(true);
  });

  it('accepts character-only pools: fate, fortune, resilience, resolve', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: { fate: 2, fortune: 2, resilience: 1, resolve: 1 },
    });
    expect(r.success).toBe(true);
  });

  it('accepts physical detail fields', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: { age: 25, height: '5\'8"', weight: '70kg', hair: 'Brown', eyes: 'Blue' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts PC creation detail fields', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: {
        motivation: 'Revenge', career: 'Soldier', careerlevel: 'Sergeant',
        personalAmbitionShort: 'Find missing brother',
        partyAmbitionName: 'Defeat the chaos lord',
      },
    });
    expect(r.success).toBe(true);
  });

  it('accepts currentWounds (shared field)', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: { currentWounds: 12 },
    });
    expect(r.success).toBe(true);
  });
});

describe('actorType=npc — accepts NPC/creature-specific fields', () => {
  it('accepts species and subspecies', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { species: 'Vampire', subspecies: 'Von Carstein' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts biography and gmnotes', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { biography: 'A dangerous vampire lord', gmnotes: 'Boss of the region' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts size enum values', () => {
    for (const size of ['avg', 'sml', 'lrg', 'grg', 'enor', 'mnst'] as const) {
      const r = ManageCharacterSchema.safeParse({
        ...base,
        actorType: 'npc',
        updates: { size },
      });
      expect(r.success).toBe(true);
    }
  });

  it('rejects unknown size value', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { size: 'huge' as any },
    });
    expect(r.success).toBe(false);
  });

  it('accepts god, statusTier, statusStanding', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { god: 'Khaine', statusTier: 2, statusStanding: '15' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts shared status pools: advantage, criticalWounds, sin, corruption', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { advantage: 1, criticalWounds: 0, sin: 2, corruption: 1 },
    });
    expect(r.success).toBe(true);
  });

  it('accepts 10 characteristics (same as character)', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { weaponSkill: 50, strength: 45, toughness: 40 },
    });
    expect(r.success).toBe(true);
  });

  it('accepts currentWounds (shared field)', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { currentWounds: 8 },
    });
    expect(r.success).toBe(true);
  });
});

describe('actorType=creature — same branch as npc (identical DataModels)', () => {
  it('accepts creature-specific fields', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'creature',
      updates: { size: 'lrg', god: 'Khaine', species: 'Daemon' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts move field (NumberField on creature)', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'creature',
      updates: { move: 6 },
    });
    expect(r.success).toBe(true);
  });
});

describe('cross-type rejection — character-only fields on npc/creature', () => {
  it('schema accepts fate on npc at parse level (runtime guard rejects in handler)', () => {
    // The Zod schema does NOT reject fate on npc — it's a single flat schema.
    // Cross-type rejection happens in handleUpdateStats at runtime.
    // This test documents that schema.safeParse PASSES but the handler will throw.
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { fate: 5 },
    });
    // Schema-level: PASSES (flat schema accepts all fields; runtime rejects)
    expect(r.success).toBe(true);
  });

  it('schema rejects actorType outside the enum', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'vehicle' as any,
      updates: { weaponSkill: 30 },
    });
    expect(r.success).toBe(false);
  });
});

describe('schema edge cases', () => {
  it('rejects update-stats with no characterName', () => {
    const r = ManageCharacterSchema.safeParse({
      action: 'update-stats',
      updates: { weaponSkill: 30 },
    });
    expect(r.success).toBe(false);
  });

  it('accepts update-stats with empty updates object', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      updates: {},
    });
    expect(r.success).toBe(true);
  });

  it('accepts actorType=character with move as string (StringField for character)', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'character',
      updates: { move: '4' },
    });
    expect(r.success).toBe(true);
  });

  it('accepts actorType=npc with move as number (NumberField for npc)', () => {
    const r = ManageCharacterSchema.safeParse({
      ...base,
      actorType: 'npc',
      updates: { move: 4 },
    });
    expect(r.success).toBe(true);
  });

  it('accepts gender on both character and npc (shared field)', () => {
    for (const actorType of ['character', 'npc'] as const) {
      const r = ManageCharacterSchema.safeParse({
        ...base,
        actorType,
        updates: { gender: 'Male' },
      });
      expect(r.success).toBe(true);
    }
  });
});
