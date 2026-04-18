// Phase 3d — BUG-025/026/027: WFRP-shaped creature index extraction.
// Verifies extractEnhancedCreatureData reads spells/prayers/traits from embedded
// Items (not system.* D&D-5e paths) and sums armour from equipped armour Items.

import { describe, it, expect } from 'vitest';
import { FoundryDataAccess } from '../data-access.js';

const pack = { metadata: { id: 'test.pack', label: 'Test Pack' } };

function make(items: any[], extra: any = {}) {
  return {
    _id: 'creature-1',
    name: 'TestCreature',
    type: 'creature',
    img: '',
    system: {
      characteristics: { t: { value: 40 } },
      status: { wounds: { max: 20 } },
      details: { species: { value: 'Beast' } },
      ...extra,
    },
    items,
  };
}

describe('creature index — WFRP primitives', () => {
  const da = new FoundryDataAccess();
  const extract = (doc: any) => (da as any).persistentIndex.extractEnhancedCreatureData(doc, pack);

  it('wfrp-caster: spell/prayer/trait Items → hasSpells, hasSpecialAbilities', () => {
    const doc = make([
      { type: 'spell', name: 'Dart' },
      { type: 'trait', name: 'Fear 2' },
    ]);
    const { creature } = extract(doc);
    expect(creature.hasSpells).toBe(true);
    expect(creature.hasSpecialAbilities).toBe(true);
  });

  it('wfrp-fighter: weapon-only Items → both flags false', () => {
    const doc = make([{ type: 'weapon', name: 'Sword' }]);
    const { creature } = extract(doc);
    expect(creature.hasSpells).toBe(false);
    expect(creature.hasSpecialAbilities).toBe(false);
  });

  it('wfrp-prayer: prayer Item alone → hasSpells true', () => {
    const doc = make([{ type: 'prayer', name: 'Heal' }]);
    const { creature } = extract(doc);
    expect(creature.hasSpells).toBe(true);
  });

  it('armour sum: equipped armour Items contribute currentAP to toughness', () => {
    const doc = make([
      { type: 'armour', name: 'Helm', system: { equipped: { value: true }, currentAP: { value: 2 } } },
      { type: 'armour', name: 'Mail', system: { equipped: { value: true }, currentAP: { value: 3 } } },
      { type: 'armour', name: 'Spare', system: { equipped: { value: false }, currentAP: { value: 5 } } },
    ]);
    const { creature } = extract(doc);
    // toughnessBonus = floor(40/10)=4; armorPoints = 2+3 = 5; total = 9
    expect(creature.toughness).toBe(9);
  });

  it('no items: hasSpells=false, hasSpecialAbilities=false, no throw', () => {
    const doc = make([]);
    const { creature } = extract(doc);
    expect(creature.hasSpells).toBe(false);
    expect(creature.hasSpecialAbilities).toBe(false);
    expect(creature.toughness).toBe(4);
  });
});
