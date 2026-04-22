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
    query: vi.fn(async (key: string, args: any) => {
      calls.push({ key, args });
      return {
        success: true,
        data: {
          itemId: 'new-item-id',
          itemName: args?.itemData?.name ?? 'item',
          itemType: args?.itemData?.type ?? 'weapon',
          scope: args?.destination?.type ?? 'actor',
        },
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
});

describe('core: critical', () => {
  it('accepts wounds formula', () => {
    const parsed = CreateCustomItemInputSchema.parse({
      itemType: 'critical',
      name: 'Broken Arm',
      wounds: '1d10+SB',
      location: 'lArm',
      ...actorDest(),
    });
    const sys = buildSystemForSubtype(parsed) as any;
    expect(sys.wounds.value).toBe('1d10+SB');
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
      wounds: '1d10',
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
  it('includes all 53 triggers in enum (spot-check)', () => {
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
});
