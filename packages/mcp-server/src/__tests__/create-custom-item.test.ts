// Phase 5 — create-custom-item schema + dispatch + destination coverage.
// Per plan A.8: 25 describes (18 core + 7 module) + destination handling + negative cases + rune regression.
// Module subtypes are zod-parse-only (no live Foundry); live-creation validation is smoke-only.

import { describe, it, expect, vi } from 'vitest';
import {
  CreateCustomItemInputSchema,
  buildSystemForSubtype,
  buildEffectPayload,
} from '@foundry-mcp/shared';
import { CreateCustomItemTool } from '../tools/create-custom-item.js';

function actorDest(actorName = 'Test PC'): any {
  return { destination: { type: 'actor', actorName } };
}
function worldDest(folder?: string[]): any {
  return folder ? { destination: { type: 'world', folder } } : { destination: { type: 'world' } };
}

// Minimal logger stub matching the Logger interface surface we use.
function makeLogger(): any {
  const noop = () => undefined;
  return {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    child: () => makeLogger(),
  };
}

function makeTool() {
  const calls: any[] = [];
  const foundryClient: any = {
    // BUG-325: the real foundryClient.query unwraps the {success, data} envelope
    // and returns the inner data — mock must model the post-unwrap shape.
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return {
        itemId: 'new-item-id',
        itemName: args?.itemData?.name ?? 'item',
        itemType: args?.itemData?.type ?? 'weapon',
        scope: args?.destination?.type ?? 'actor',
      };
    }),
  };
  const tool = new CreateCustomItemTool({ foundryClient, logger: makeLogger() });
  return { tool, calls, foundryClient };
}

// ──────────────────────────── Core subtypes (18) ─────────────────────────────

describe('core: weapon', () => {
  it('accepts actor destination', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'weapon',
      name: 'Longsword',
      damage: 'SB+4',
      reach: 'average',
      weaponGroup: 'basic',
      ...actorDest('Hans'),
    });
    expect(parsed.itemType).toBe('weapon');
  });
  it('accepts world destination with nested folder', () => {
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'Fire Sword',
        damage: 'SB+6',
        ...worldDest(['Homebrew', 'Weapons']),
      })
    ).not.toThrow();
  });
  it('accepts effects array', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'weapon',
      name: 'Enchanted Blade',
      effects: [{ name: 'Burning', trigger: 'rollWeaponTest', script: 'args.test.result.damage += 1;' }],
      ...actorDest(),
    });
    expect(parsed.effects).toHaveLength(1);
  });
});

describe('core: armour', () => {
  it('accepts actor destination with AP block', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'armour',
      name: 'Mail Coat',
      armorType: 'mail',
      AP: { body: 3 },
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.AP.body).toBe(3);
  });
  it('accepts world destination', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'armour', name: 'Plate', ...worldDest() })
    ).not.toThrow());
  it('accepts effects array', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'armour',
        name: 'Warded Plate',
        effects: [{ name: 'Ward', trigger: 'APCalc', script: 'args.AP += 1;' }],
        ...actorDest(),
      })
    ).not.toThrow());
});

describe('core: trapping', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'trapping',
        name: 'Rope',
        trappingType: 'misc',
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'trapping', name: 'Candle', ...worldDest() })
    ).not.toThrow());
  it('accepts effects', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'trapping',
        name: 'Lucky Charm',
        effects: [{ name: 'Luck', trigger: 'preRollTest', script: '' }],
        ...actorDest(),
      })
    ).not.toThrow());
});

describe('core: ammunition', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'ammunition',
        name: 'Arrows',
        ammunitionType: 'bow',
        quantity: 20,
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'ammunition', name: 'Bolts', ...worldDest() })
    ).not.toThrow());
});

describe('core: container', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'container',
        name: 'Backpack',
        carries: 30,
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'container', name: 'Sack', ...worldDest() })
    ).not.toThrow());
});

describe('core: spell', () => {
  it('accepts actor dest with lore + cn', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'spell',
      name: 'Firebolt',
      lore: 'fire',
      cn: 5,
      ...actorDest('Mage'),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.lore.value).toBe('fire');
    expect(sys.cn.value).toBe(5);
  });
  it('accepts world dest with nested folder', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'spell',
        name: 'Magic Missile',
        lore: 'arcane',
        ...worldDest(['Custom', 'Spells']),
      })
    ).not.toThrow());
  it('accepts effects (rollCastTest)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'spell',
        name: 'Shock',
        effects: [{ name: 'Stunned', trigger: 'rollCastTest', script: '' }],
        ...actorDest(),
      })
    ).not.toThrow());
});

describe('core: prayer', () => {
  it('accepts blessing discriminator', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'prayer',
        name: 'Blessing of Might',
        type: 'blessing',
        god: 'Sigmar',
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts miracle discriminator (world scope)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'prayer',
        name: 'Beacon of Righteous Virtue',
        type: 'miracle',
        god: 'Sigmar',
        ...worldDest(),
      })
    ).not.toThrow());
  it('rejects invalid type value', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'prayer',
        name: 'Bogus',
        type: 'wishful',
        ...actorDest(),
      })
    ).toThrow());
});

describe('core: talent', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'talent',
        name: 'Marksman',
        max: 'bs',
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest with effects', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'talent',
        name: 'Accurate Shot',
        effects: [{ name: 'Accurate', trigger: 'rollWeaponTest', script: '' }],
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('core: career', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'career',
        name: 'Wizard',
        careergroup: 'Academics',
        class: 'Academics',
        level: 1,
        statusTier: 's',
        statusStanding: 3,
        ...actorDest(),
      })
    ).not.toThrow());
  it('defaults current/complete to false per Core p.44', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'career',
      name: 'Apprentice',
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.current.value).toBe(false);
    expect(sys.complete.value).toBe(false);
  });
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'career',
        name: 'Charlatan',
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('core: skill', () => {
  it('accepts actor dest with advances', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'skill',
        name: 'Melee (Basic)',
        characteristic: 'ws',
        advances: 5,
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'skill', name: 'Dodge', ...worldDest() })
    ).not.toThrow());
});

describe('core: trait', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'trait',
        name: 'Ethereal',
        rollable: { value: false },
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest with effects', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'trait',
        name: 'Armour (Bone)',
        effects: [{ name: 'Armoured', trigger: 'APCalc', script: '' }],
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('core: mutation', () => {
  it('accepts physical', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'mutation',
        name: 'Third Eye',
        mutationType: 'physical',
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts mental (world)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'mutation',
        name: 'Paranoia',
        mutationType: 'mental',
        ...worldDest(),
      })
    ).not.toThrow());
  // BUG-649: Zod stays optional deliberately (see mutation.ts's own comment) — the handler is
  // the single canonical enforcement point. Pin that the handle() path actually throws.
  it('handle() throws CREATE_CUSTOM_ITEM_MUTATION_TYPE_REQUIRED when mutationType is omitted', async () => {
    const { tool } = makeTool();
    await expect(
      tool.handle({ itemType: 'mutation', name: 'No Type', ...actorDest() })
    ).rejects.toThrow('CREATE_CUSTOM_ITEM_MUTATION_TYPE_REQUIRED');
  });
  it('systemOverrides does NOT satisfy the mutationType requirement (BUG-649)', async () => {
    const { tool } = makeTool();
    await expect(
      tool.handle({
        itemType: 'mutation',
        name: 'No Type',
        systemOverrides: { 'mutationType.value': 'physical' },
        ...actorDest(),
      })
    ).rejects.toThrow('CREATE_CUSTOM_ITEM_MUTATION_TYPE_REQUIRED');
  });
});

describe('core: critical', () => {
  // BUG-646 (2026-07-21): this test previously asserted the opposite — that a dice
  // formula like '1d10+SB' is accepted and preserved. Live-verified against
  // wfrp4e.js:28575-28602: CriticalModel._onCreate calls Number.parseInt(this.wounds.value)
  // and never rolls anything, so a formula string silently truncates to its leading integer.
  // The test itself was encoding the bug's false premise; corrected to pin real behavior.
  it('accepts a plain integer wounds string', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'critical',
      name: 'Broken Arm',
      wounds: '4',
      location: 'lArm',
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.wounds.value).toBe('4');
  });
  it('accepts the literal "death" wounds token', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'critical',
      name: 'Instant Death',
      wounds: 'death',
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.wounds.value).toBe('death');
  });
  it('rejects dice-notation wounds strings (BUG-646)', () => {
    for (const bad of ['1d10+SB', '1d5', '2d6+3']) {
      expect(() =>
        CreateCustomItemInputSchema.parse({
          itemType: 'critical',
          name: 'Broken Arm',
          wounds: bad,
          ...actorDest(),
        })
      ).toThrow();
    }
  });
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'critical',
        name: 'Gutted',
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('core: disease', () => {
  it('accepts incubation + duration formulas', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'disease',
      name: 'The Galloping Trots',
      incubation: { value: '2d10', unit: 'hours' },
      duration: { value: '1d10', unit: 'days' },
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.incubation.unit).toBe('hours');
  });
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'disease',
        name: 'Ratte Fever',
        ...worldDest(),
      })
    ).not.toThrow());
  // BUG-648: unit was previously z.enum(['hours','days','weeks']) — the published corpus (44
  // diseases) also uses 'minutes' and blank '', both live-verified as valid (wfrp4e.js:28723-
  // 28724 interpolates the value directly with no validation). Pinned so a future edit can't
  // silently re-narrow this back to an enum.
  it('accepts "minutes" and blank "" as unit values (BUG-648)', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'disease',
      name: 'Fast Fever',
      incubation: { value: '10', unit: 'minutes' },
      duration: { value: 'Instant', unit: '' },
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.incubation.unit).toBe('minutes');
    expect(sys.duration.unit).toBe('');
  });
});

describe('core: template', () => {
  it('accepts composite characteristics + skills', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'template',
        name: 'Veteran',
        characteristics: { ws: 10, bs: 5 },
        skills: { list: [{ name: 'Melee', advances: 10 }] },
        ...worldDest(),
      })
    ).not.toThrow());
  it('accepts actor dest (edge use case)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'template',
        name: 'Noble Retainer',
        ...actorDest(),
      })
    ).not.toThrow());
});

describe('core: cargo', () => {
  it('accepts full schema', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'cargo',
      name: 'Wool Bale',
      cargoType: 'Textiles',
      unitPrice: 20,
      origin: 'Nuln',
      quality: 'good',
      encumbrance: 50,
      ...worldDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.quality.value).toBe('good');
    expect(sys.origin.value).toBe('Nuln');
  });
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'cargo',
        name: 'Salt',
        ...actorDest(),
      })
    ).not.toThrow());
});

describe('core: injury', () => {
  it('accepts actor dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'injury',
        name: 'Sprained Ankle',
        location: 'lLeg',
        penalty: '-10 Agi',
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'injury',
        name: 'Concussion',
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('core: psychology', () => {
  it('accepts minimal (description-only)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'psychology',
        name: 'Frenzy',
        ...actorDest(),
      })
    ).not.toThrow());
  it('accepts world dest with effects', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'psychology',
        name: 'Stupidity',
        effects: [{ name: 'Stupid', trigger: 'startTurn', script: '' }],
        ...worldDest(),
      })
    ).not.toThrow());
});

// ──────────────────────────── Module subtypes (7) ─────────────────────────────

describe('module: forien-armoury.grimoire', () => {
  it('parses happy-path payload', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'forien-armoury.grimoire',
        name: 'Tome of Ulric',
        spells: [{ name: 'Wolf Form', uuid: 'Compendium.pack.Item.xxx' }],
        language: 'Magick',
        ...worldDest(['Custom', 'Grimoires']),
      })
    ).not.toThrow());
});

describe('module: forien-armoury.scroll', () => {
  it('parses happy-path payload', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'forien-armoury.scroll',
        name: 'Scroll of Firebolt',
        spellUuid: 'Compendium.pack.Item.yyy',
        ...actorDest(),
      })
    ).not.toThrow());
});

describe('module: wfrp4e-dwarfs.rune', () => {
  it('parses happy-path payload', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'wfrp4e-dwarfs.rune',
        name: 'Rune of Fire',
        SL: { value: 0, required: 10 },
        category: 'Weapon',
        master: false,
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('module: wfrp4e-soc.chanty', () => {
  it('parses happy-path payload', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'wfrp4e-soc.chanty',
        name: 'Sea Shanty of Courage',
        usage: { establish: 30, duration: 3, skill: 'Entertain (Singing)' },
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('module: wfrp4e-helf.technique', () => {
  it('parses happy-path payload', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'wfrp4e-helf.technique',
        name: 'Sword Dance of Isha',
        sl: 2,
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('module: wfrp4e-archives3.cant', () => {
  it('parses happy-path payload', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'wfrp4e-archives3.cant',
        name: 'Thieves Cant — Silence',
        lore: 'petty',
        cost: { value: 1, variable: false },
        ...worldDest(),
      })
    ).not.toThrow());
});

describe('module: wfrp4e-archives3.armour', () => {
  it('parses happy-path payload (with fit)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'wfrp4e-archives3.armour',
        name: 'Bespoke Mail',
        armorType: 'mail',
        fit: 'tailored',
        AP: { body: 3, lArm: 2, rArm: 2 },
        ...worldDest(),
      })
    ).not.toThrow());
});

// ──────────────────────────── Destination handling ─────────────────────────────

describe('destination handling', () => {
  it('accepts world destination with no folder (root placement)', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'Root Sword',
        ...worldDest(),
      })
    ).not.toThrow());
  it('accepts world destination with single-segment folder', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'Folder Sword',
        ...worldDest(['Homebrew']),
      })
    ).not.toThrow());
  it('accepts world destination with 3-segment nested folder', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'Deep Sword',
        ...worldDest(['Homebrew', 'Items', 'Keys']),
      })
    ).not.toThrow());
  it('rejects world destination with empty-string folder segment', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'Bad Sword',
        destination: { type: 'world', folder: ['Homebrew', ''] },
      })
    ).toThrow());
  it('accepts actor destination with actorId', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'X',
        destination: { type: 'actor', actorId: 'abc123' },
      })
    ).not.toThrow());
  it('accepts actor destination with actorName', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'X',
        destination: { type: 'actor', actorName: 'Hans' },
      })
    ).not.toThrow());
});

// ──────────────────────────── Tool dispatch ─────────────────────────────

describe('tool dispatch — payload composition', () => {
  it('passes destination through unchanged to warhammer-mcp.createItem', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'spell',
      name: 'Firebolt',
      lore: 'fire',
      cn: 5,
      destination: { type: 'world', folder: ['Custom', 'Spells'] },
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('warhammer-mcp.createItem');
    expect(calls[0].args.destination).toEqual({
      type: 'world',
      folder: ['Custom', 'Spells'],
    });
  });
  it('forwards fromCompendium when set', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'weapon',
      name: 'Copy',
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.abc',
      ...actorDest(),
    });
    expect(calls[0].args.fromCompendium).toBe('Compendium.wfrp4e-core.items.Item.abc');
  });
  // BUG-643: when cloning, only caller-customized fields should be sent — anything left at
  // its bare default must be ABSENT (not present-with-a-default-value) so the foundry-module's
  // clone-merge preserves the compendium source's own value instead of stomping it.
  it('sends a sparse system (customized fields only) when fromCompendium is set', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'weapon',
      name: 'Copy',
      damage: 'SB+4',
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.abc',
      ...actorDest(),
    });
    const sys: any = calls[0].args.itemData.system;
    // Leaf-level diffing: `dice` is unchanged from its bare default ('') even though `damage`
    // as a whole differs, so only the genuinely-customized leaf survives — the compendium
    // source's own `dice` value (if any) is preserved rather than stomped with ''.
    expect(sys.damage).toEqual({ value: 'SB+4' });
    expect(sys.encumbrance).toBeUndefined();
    expect(sys.price).toBeUndefined();
    expect(sys.availability).toBeUndefined();
    expect(sys.reach).toBeUndefined();
    expect(sys.ammunitionGroup).toBeUndefined();
    expect(sys.weaponGroup).toBeUndefined(); // 'basic' default, not customized
  });
  it('sends the FULL default-populated system for a non-clone create (no fromCompendium)', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'weapon',
      name: 'Fresh',
      damage: 'SB+4',
      ...actorDest(),
    });
    const sys: any = calls[0].args.itemData.system;
    expect(sys.damage).toEqual({ value: 'SB+4', dice: '' });
    expect(sys.weaponGroup).toEqual({ value: 'basic' }); // full defaults present, unlike the clone path
    expect(sys.encumbrance).toEqual({ value: 0 });
  });
  it('systemOverrides still lands even if it happens to equal the bare default (clone path)', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'weapon',
      name: 'Copy',
      fromCompendium: 'Compendium.wfrp4e-core.items.Item.abc',
      systemOverrides: { weaponGroup: { value: 'basic' } },
      ...actorDest(),
    });
    const sys: any = calls[0].args.itemData.system;
    expect(sys.weaponGroup).toEqual({ value: 'basic' });
  });
  it('forwards returnFullPayload flag through the call', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'talent',
      name: 'Marksman',
      returnFullPayload: true,
      ...actorDest(),
    });
    expect(calls[0].args.returnFullPayload).toBe(true);
  });
  it('builds correct itemData.type + name', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'critical',
      name: 'Guts',
      wounds: '4',
      ...actorDest(),
    });
    expect(calls[0].args.itemData.type).toBe('critical');
    expect(calls[0].args.itemData.name).toBe('Guts');
  });
  it('transforms effects to Foundry nested shape (scriptData array)', async () => {
    const { tool, calls } = makeTool();
    await tool.handle({
      itemType: 'talent',
      name: 'Accurate',
      effects: [{ name: 'Accurate', trigger: 'rollWeaponTest', script: 'x=1;' }],
      ...actorDest(),
    });
    const effects = calls[0].args.itemData.effects;
    expect(effects).toHaveLength(1);
    expect(effects[0].system.scriptData[0].trigger).toBe('rollWeaponTest');
    expect(effects[0].system.scriptData[0].script).toBe('x=1;');
  });
});

// ──────────────────────────── Negative cases ─────────────────────────────

describe('negative cases', () => {
  it('rejects unknown itemType', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'bogus-subtype',
        name: 'X',
        ...actorDest(),
      })
    ).toThrow());
  it('rejects unknown destination.type', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'weapon',
        name: 'X',
        destination: { type: 'cosmic-realm' as any },
      })
    ).toThrow());
  it('rejects missing name', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'weapon', ...actorDest() })
    ).toThrow());
  it('rejects empty-string name', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'weapon', name: '', ...actorDest() })
    ).toThrow());
  it('rejects effect with invalid trigger key', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'talent',
        name: 'X',
        effects: [{ name: 'X', trigger: 'onBogusEvent', script: '' } as any],
        ...actorDest(),
      })
    ).toThrow());
  it('rejects missing destination', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({ itemType: 'weapon', name: 'X' })
    ).toThrow());
});

// ────────────── Rune effect-transfer regression (plan suggestion B1) ──────────────

describe('rune effect-transfer regression', () => {
  it('wfrp4e-dwarfs.rune with effects: payload shape accepts but shouldTransferEffect is module-side', () => {
    // Payload shape only — live transfer suppression (shouldTransferEffect=false)
    // is exercised by smoke probe 4 per plan.
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'wfrp4e-dwarfs.rune',
      name: 'Rune of Forging',
      category: 'Weapon',
      effects: [{ name: 'Inscribe-on-complete', trigger: 'rollWeaponTest', script: '' }],
      ...worldDest(),
    });
    expect(parsed.itemType).toBe('wfrp4e-dwarfs.rune');
    expect((parsed as any).effects).toHaveLength(1);
    // Rune effects remain on the rune item until inscription — module-layer behavior;
    // no assertion of cross-actor transfer here (this is a schema test).
  });
});

// ────────────── Compendium clone _id strip (plan suggestion B4) ──────────────

describe('buildEffectPayload — compendium clone regression', () => {
  it('omits _id from scriptData when input has no id field', () => {
    const out: any = buildEffectPayload({
      name: 'Cloned',
      trigger: 'prePrepareData',
      script: 'x',
    } as any);
    expect(out.system.scriptData[0]._id).toBeUndefined();
  });
  // BUG-334: description is the Foundry-core user-facing text shown on sheet
  // expansion — effects without it are opaque to players. It must survive both
  // the Zod parse (the schema strips unknown keys) and the payload build.
  it('passes description through to the Foundry payload (BUG-334)', () => {
    const out: any = buildEffectPayload({
      name: 'Glowing Blade',
      trigger: 'prePrepareData',
      script: '',
      description: '<p>+10 WS while drawn.</p>',
    } as any);
    expect(out.description).toBe('<p>+10 WS while drawn.</p>');
    const parsed: any = CreateCustomItemInputSchema.parse({
      itemType: 'talent',
      name: 'T',
      effects: [{ name: 'e', trigger: 'endRound', script: '', description: 'visible text' }],
      ...actorDest(),
    });
    expect(parsed.effects[0].description).toBe('visible text');
  });
  it('defaults description to empty string when omitted (BUG-334)', () => {
    const out: any = buildEffectPayload({ name: 'NoDesc', trigger: 'endTurn', script: '' } as any);
    expect(out.description).toBe('');
  });

  // BUG-644: warhammer-lib routes owner-transfer effects by dispatching on
  // `transferData.type == "document"`. It never tests for "ownership", so an effect
  // built with that literal is silently never applied to the owning actor — it
  // creates cleanly, reports success, and does nothing. Live-verified 2026-07-18:
  // type=document yields AP with transfer true OR false; type=ownership yields 0 with
  // either. These tests fail if the default or the alias normalization regresses.
  it('defaults transferData.type to "document", not "ownership" (BUG-644)', () => {
    const out: any = buildEffectPayload({ name: 'Barding', trigger: 'APCalc', script: '' } as any);
    expect(out.system.transferData.type).toBe('document');
    expect(out.system.transferData.documentType).toBe('Actor');
  });
  it('normalizes the deprecated "ownership" alias to "document" (BUG-644)', () => {
    const out: any = buildEffectPayload({
      name: 'Barding',
      trigger: 'APCalc',
      script: '',
      transfer: { type: 'ownership' },
    } as any);
    expect(out.system.transferData.type).toBe('document');
  });
  it('preserves non-document transfer types verbatim (BUG-644)', () => {
    for (const t of ['damage', 'target', 'area', 'aura', 'other'] as const) {
      const out: any = buildEffectPayload({
        name: 'E',
        trigger: 'applyDamage',
        script: '',
        transfer: { type: t },
      } as any);
      expect(out.system.transferData.type).toBe(t);
    }
  });
  // The `transfer` boolean is NOT load-bearing for routing (live matrix above) —
  // system.transferData drives it. Pinned so a future "fix" doesn't flip it to true
  // and mask a transferData regression.
  it('keeps the Foundry-core transfer flag false (BUG-644)', () => {
    const out: any = buildEffectPayload({
      name: 'E',
      trigger: 'APCalc',
      script: '',
      transfer: { type: 'document' },
    } as any);
    expect(out.transfer).toBe(false);
  });

  // BUG-644 full rewrite (2026-07-21): fields moved from wrong top-level system.* paths
  // to their correct nested home under system.transferData, matching wfrp4e.js's own
  // _migrateEffectFlags output shape — the system's own "this is the current valid
  // shape" reference. Pinned so a future edit can't silently regress the nesting.
  it('nests testIndependent/preApplyScript/equipTransfer/enableConditionScript/avoidTest under system.transferData, not top-level system.* (BUG-644)', () => {
    const out: any = buildEffectPayload({
      name: 'E',
      trigger: 'APCalc',
      script: '',
      testIndependent: true,
      preApplyScript: 'return true',
      equipTransfer: true,
      enableConditionScript: 'return false',
    } as any);
    expect(out.system.transferData.testIndependent).toBe(true);
    expect(out.system.transferData.preApplyScript).toBe('return true');
    expect(out.system.transferData.equipTransfer).toBe(true);
    expect(out.system.transferData.enableConditionScript).toBe('return false');
    expect(out.system.testIndependent).toBeUndefined();
    expect(out.system.preApplyScript).toBeUndefined();
    expect(out.system.equipTransfer).toBeUndefined();
    expect(out.system.enableScript).toBeUndefined();
  });
  it('accepts "crew" as a valid transfer type (BUG-644 — live-confirmed via WFRP4E.transferTypes, contradicting a prior "unverified" ledger note)', () => {
    const out: any = buildEffectPayload({ name: 'E', trigger: 'APCalc', script: '', transfer: { type: 'crew' } } as any);
    expect(out.system.transferData.type).toBe('crew');
  });
  it('writes system.zone as an object and adds system.sourceData (BUG-644)', () => {
    const out: any = buildEffectPayload({ name: 'E', trigger: 'APCalc', script: '' } as any);
    expect(out.system.zone).toEqual({});
    expect(out.system.sourceData).toEqual({ item: null, test: null, area: null });
  });
  it('nests area.templateData/duration/keep/aura under transfer.area (BUG-644)', () => {
    const out: any = buildEffectPayload({
      name: 'E',
      trigger: 'APCalc',
      script: '',
      transfer: { type: 'area', area: { templateData: 'tmpl-1', duration: 'Instant', keep: true, aura: { render: true, transferred: true } } },
    } as any);
    expect(out.system.transferData.area.templateData).toBe('tmpl-1');
    expect(out.system.transferData.area.duration).toBe('Instant');
    expect(out.system.transferData.area.keep).toBe(true);
    expect(out.system.transferData.area.aura.render).toBe(true);
    expect(out.system.transferData.area.aura.transferred).toBe(true);
  });
  it('silently strips the removed dead transferDocument field — never reaches buildEffectPayload (BUG-644)', () => {
    // ActiveEffectDataSchema is not .strict() — Zod's default behavior for an unrecognized
    // key is to strip it, not throw. Pinned so the field's removal is visible: previously
    // it parsed AND was accepted-then-ignored by the builder; now it's stripped at parse time.
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'talent',
      name: 'T',
      effects: [{ name: 'e', trigger: 'endRound', script: '', transferDocument: true }],
      ...actorDest(),
    });
    expect((parsed.effects?.[0] as any).transferDocument).toBeUndefined();
  });

  it('includes all 59 triggers in enum (spot-check)', () => {
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'talent',
        name: 'T',
        effects: [{ name: 'e', trigger: 'endRound', script: '' }],
        ...actorDest(),
      })
    ).not.toThrow();
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'talent',
        name: 'T',
        effects: [{ name: 'e', trigger: 'preChannellingTest', script: '' }],
        ...actorDest(),
      })
    ).not.toThrow();
  });
  it('accepts the 6 triggers added by BUG-645 (targeted, rollIncomeTest, castSpellPrayer, targetPrefillDialog, startCombat, startRound)', () => {
    for (const trigger of ['targeted', 'rollIncomeTest', 'castSpellPrayer', 'targetPrefillDialog', 'startCombat', 'startRound'] as const) {
      expect(() =>
        CreateCustomItemInputSchema.parse({
          itemType: 'talent',
          name: 'T',
          effects: [{ name: 'e', trigger, script: '' }],
          ...actorDest(),
        })
      ).not.toThrow();
    }
  });
});

// ────────────── Phase 2: money subtype + branch count (2026-05-19) ──────────────

describe('core: money — Phase 2 addition', () => {
  it('accepts actor destination with default coinValue (BP = 1)', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'money',
      name: 'Brass Pennies',
      ...actorDest('Hans'),
    });
    expect(parsed.itemType).toBe('money');
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.coinValue.value).toBe(1);
  });

  it('accepts coinValue=240 (Gold Crown denomination)', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'money',
      name: 'Gold Crown',
      coinValue: 240,
      quantity: 5,
      ...worldDest(['Custom', 'Money']),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.coinValue.value).toBe(240);
    expect(sys.quantity.value).toBe(5);
  });

  it('accepts actor-scope destination for embedding on character', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'money',
        name: 'Silver Shillings',
        coinValue: 12,
        quantity: 10,
        ...actorDest('Merchant'),
      })
    ).not.toThrow());
});

describe('subtype coverage (Phase 2 — money + branch count)', () => {
  it('CreateCustomItemInputSchema has exactly 26 branches (19 core + 7 module)', () => {
    // z.discriminatedUnion exposes branch schemas via ._def.options in Zod v3.
    const options = (CreateCustomItemInputSchema as any)._def.options;
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBe(26);
  });

  it('"money" is a valid itemType discriminator in the schema', () =>
    expect(() =>
      CreateCustomItemInputSchema.parse({
        itemType: 'money',
        name: 'Test Coin',
        ...actorDest(),
      })
    ).not.toThrow());
});

// ────────────── Phase 3: schema gap closures (2026-05-20) ──────────────

describe('core: skill — Phase 3 gap closure: advances.force + costModifier', () => {
  it('creates a skill item with advances.force=true and advances.costModifier=5', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'skill',
      name: 'Melee (Basic)',
      characteristic: 'ws',
      advances: { value: 3, force: true, costModifier: 5 },
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.advances.force).toBe(true);
    expect(sys.advances.costModifier).toBe(5);
    expect(sys.advances.value).toBe(3);
  });

  it('scalar advances form still produces force=false costModifier=0 defaults', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'skill',
      name: 'Dodge',
      advances: 7,
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.advances.value).toBe(7);
    expect(sys.advances.force).toBe(false);
    expect(sys.advances.costModifier).toBe(0);
  });
});

describe('core: talent — Phase 3 gap closure: advances.force', () => {
  it('creates a talent item with advances.force=true', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'talent',
      name: 'Marksman',
      advances: { value: 2, force: true },
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.advances.force).toBe(true);
    expect(sys.advances.value).toBe(2);
  });
});

describe('core: spell — Phase 3 gap closure: typed overcast', () => {
  it('creates a spell with typed overcast.valuePerOvercast block', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'spell',
      name: 'Fireball',
      lore: 'fire',
      cn: 7,
      overcast: {
        enabled: true,
        label: 'Extra Damage',
        valuePerOvercast: { type: 'damage', value: 1, SL: false },
        initial: { type: 'damage', value: 3 },
      },
      ...actorDest('Mage'),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.overcast.enabled).toBe(true);
    expect(sys.overcast.valuePerOvercast.type).toBe('damage');
    expect(sys.overcast.valuePerOvercast.value).toBe(1);
    expect(sys.overcast.initial.value).toBe(3);
  });
});

describe('core: prayer — Phase 3 gap closure: typed overcast with additional', () => {
  it('creates a prayer with typed overcast including additional field', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'prayer',
      name: 'Beacon of Righteous Virtue',
      type: 'miracle',
      god: 'Sigmar',
      overcast: {
        enabled: true,
        valuePerOvercast: { type: 'target', value: 1, additional: 'and one ally' },
        initial: { type: 'target', value: 1, additional: 'friendly' },
      },
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.overcast.enabled).toBe(true);
    expect(sys.overcast.valuePerOvercast.additional).toBe('and one ally');
    expect(sys.overcast.initial.additional).toBe('friendly');
  });
});

// ────────────── TOOL-IDEA-010 (2026-05-14): structured response envelope ──────────────

describe('handle() — TOOL-IDEA-010 structured response envelope', () => {
  it('returns MCP content envelope with content[0].text + structuredContent', async () => {
    const { tool } = makeTool();
    const result: any = await tool.handle({
      itemType: 'weapon',
      name: 'Longsword',
      damage: 'SB+4',
      ...actorDest('Hans'),
    });

    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
    expect(result).toHaveProperty('structuredContent');
  });

  it('structuredContent always carries itemId/itemName/itemType/scope for chaining', async () => {
    const { tool } = makeTool();
    const result: any = await tool.handle({
      itemType: 'weapon',
      name: 'Longsword',
      damage: 'SB+4',
      ...actorDest('Hans'),
    });

    expect(result.structuredContent).toMatchObject({
      success: true,
      itemId: 'new-item-id',
      itemName: 'Longsword',
      itemType: 'weapon',
      scope: 'actor',
    });
  });

  it('world-scope response carries folderId/folderPath in structuredContent', async () => {
    const { tool } = makeTool();
    const result: any = await tool.handle({
      itemType: 'weapon',
      name: 'Fire Sword',
      damage: 'SB+6',
      ...worldDest(['Custom', 'Weapons']),
    });

    expect(result.structuredContent.scope).toBe('world');
    expect(result.structuredContent).toHaveProperty('folderPath');
    expect(result.structuredContent.folderPath).toEqual(['Custom', 'Weapons']);
  });

  it('actor-scope response carries actorId/actorName in structuredContent', async () => {
    const tool = (() => {
      const calls: any[] = [];
      const foundryClient: any = {
        // BUG-325: mock models the post-unwrap shape returned by foundryClient.query
        query: vi.fn(async () => ({
          itemId: 'item-99',
          itemName: 'Sword',
          itemType: 'weapon',
          scope: 'actor',
          actorId: 'actor-7',
          actorName: 'Hans',
        })),
      };
      return new CreateCustomItemTool({ foundryClient, logger: makeLogger() });
    })();

    const result: any = await tool.handle({
      itemType: 'weapon',
      name: 'Sword',
      damage: 'SB+4',
      ...actorDest('Hans'),
    });

    expect(result.structuredContent).toMatchObject({
      scope: 'actor',
      itemId: 'item-99',
      actorId: 'actor-7',
      actorName: 'Hans',
    });
  });

  it('prose content[0].text mentions item name (for human display)', async () => {
    const { tool } = makeTool();
    const result: any = await tool.handle({
      itemType: 'weapon',
      name: 'Longsword',
      damage: 'SB+4',
      ...actorDest('Hans'),
    });

    expect(result.content[0].text).toMatch(/Longsword/);
  });
});
