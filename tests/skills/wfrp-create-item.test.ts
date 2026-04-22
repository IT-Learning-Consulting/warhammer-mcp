// wfrp-create-item.test.ts — SKILL.md workflow scenarios.
//
// Each test composes the same primitive sequence the skill names in its
// workflow. Phase 5 Exit Snapshot: `create-custom-item` carries
// `destination`, `systemOverrides`, `effects[]` (flat input), and
// optional `fromCompendium`. Verifies world-default routing,
// actor-embed opt-in, clone + override, ambiguous-intent refusal,
// mid-conversation effect lifecycle, rename, and delete.

import { describe, it, expect, beforeEach } from 'vitest';
import { callMcp, clearMcpMocks, getCallLog, mockMcpCall } from './_harness.js';

type Destination =
  | { type: 'world'; folder?: string[] }
  | { type: 'actor'; actorId?: string; actorName?: string };

interface CreatePayload {
  itemType: string;
  name: string;
  destination: Destination;
  description?: string;
  effects?: Array<{ name: string; trigger: string; script: string }>;
  fromCompendium?: string;
  systemOverrides?: Record<string, unknown>;
  returnFullPayload?: boolean;
}

const SUBTYPE_FOLDER_LABEL: Record<string, string> = {
  weapon: 'Weapons',
  armour: 'Armour',
  ammunition: 'Ammunition',
  container: 'Containers',
  trapping: 'Trappings',
  spell: 'Spells',
  prayer: 'Prayers',
  talent: 'Talents',
  career: 'Careers',
  skill: 'Skills',
  trait: 'Traits',
  mutation: 'Mutations',
  critical: 'Criticals',
  disease: 'Diseases',
  injury: 'Injuries',
  psychology: 'Psychology',
  template: 'Templates',
  cargo: 'Cargo',
  'forien-armoury.grimoire': 'Grimoires',
  'forien-armoury.scroll': 'Magic Scrolls',
  'wfrp4e-dwarfs.rune': 'Runes',
  'wfrp4e-soc.chanty': 'Chanties',
  'wfrp4e-helf.technique': 'Sword Dances',
  'wfrp4e-archives3.cant': 'Cants',
  'wfrp4e-archives3.armour': 'Armour',
};

const KNOWN_TRIGGERS = new Set([
  'addItems', 'APCalc', 'applyCondition', 'applyDamage',
  'calculateOpposedDamage', 'calculateSize', 'computeApplyDamageModifiers',
  'computeCharacteristics', 'computeEncumbrance', 'computeTakeDamageModifiers',
  'createToken', 'deleteEffect', 'dialog', 'endCombat', 'endRound',
  'endTurn', 'equipToggle', 'getInitiativeFormula', 'immediate', 'manual',
  'opposedAttacker', 'opposedDefender', 'preAPCalc', 'preApplyCondition',
  'preApplyDamage', 'preChannellingTest', 'preOpposedAttacker',
  'preOpposedDefender', 'prepareData', 'prepareItem', 'prepareOwned',
  'prePrepareData', 'prePrepareItem', 'prePrepareItems', 'preRollCastTest',
  'preRollPrayerTest', 'preRollTest', 'preRollTraitTest',
  'preRollWeaponTest', 'preTakeDamage', 'preUpdateDocument', 'preWoundCalc',
  'rollCastTest', 'rollChannellingTest', 'rollPrayerTest', 'rollTest',
  'rollTraitTest', 'rollWeaponTest', 'startTurn', 'takeDamage', 'update',
  'updateCombat', 'woundCalc',
]);

function defaultWorldDestination(itemType: string, explicitFolder?: string[]): Destination {
  if (explicitFolder) return { type: 'world', folder: explicitFolder };
  const label = SUBTYPE_FOLDER_LABEL[itemType];
  return { type: 'world', folder: ['Custom', label] };
}

interface Intent {
  userText: string;
  itemType: string;
  actorName?: string;
  explicitFolder?: string[];
  cloneQuery?: string;
  effects?: Array<{ name: string; trigger: string; script: string }>;
  systemOverrides?: Record<string, unknown>;
  name: string;
}

async function runCreate(intent: Intent): Promise<{
  ok: boolean;
  refused?: string;
  payload?: CreatePayload;
}> {
  // Subtype routing — single known itemType, so pass through.
  if (!SUBTYPE_FOLDER_LABEL[intent.itemType]) {
    return { ok: false, refused: `unknown itemType ${intent.itemType}` };
  }

  // Effect validation — refuse unknown triggers.
  if (intent.effects) {
    for (const e of intent.effects) {
      if (!KNOWN_TRIGGERS.has(e.trigger)) {
        return { ok: false, refused: `unknown trigger ${e.trigger}` };
      }
    }
  }

  const destination: Destination = intent.actorName
    ? { type: 'actor', actorName: intent.actorName }
    : defaultWorldDestination(intent.itemType, intent.explicitFolder);

  // Optional compendium clone seed.
  let fromCompendium: string | undefined;
  if (intent.cloneQuery) {
    const search = (await callMcp('warhammer-mcp.searchCompendium', {
      itemType: intent.itemType,
      query: intent.cloneQuery,
    })) as { success: boolean; data: Array<{ pack: { id: string }; id: string; name: string }> };
    if (!search.success || search.data.length === 0) {
      return { ok: false, refused: `compendium search empty for ${intent.cloneQuery}` };
    }
    const hit = search.data[0];
    fromCompendium = `Compendium.${hit.pack.id}.${hit.id}`;
  }

  const payload: CreatePayload = {
    itemType: intent.itemType,
    name: intent.name,
    destination,
    returnFullPayload: true,
    ...(fromCompendium ? { fromCompendium } : {}),
    ...(intent.effects ? { effects: intent.effects } : {}),
    ...(intent.systemOverrides ? { systemOverrides: intent.systemOverrides } : {}),
  };

  const res = (await callMcp('warhammer-mcp.createCustomItem', payload)) as {
    success: boolean;
    data?: { id: string; name: string; type: string; effects?: unknown[] };
    error?: string;
  };
  if (!res.success) return { ok: false, refused: res.error || 'create failed' };
  return { ok: true, payload };
}

async function runAddEffect(
  target: { scope: 'actor' | 'world'; actorName?: string; itemName?: string; itemId?: string },
  effect: { name: string; trigger: string; script: string },
): Promise<{ ok: boolean; refused?: string }> {
  if (!KNOWN_TRIGGERS.has(effect.trigger)) {
    return { ok: false, refused: `unknown trigger ${effect.trigger}` };
  }
  const res = (await callMcp('warhammer-mcp.addActiveEffect', { target, effect })) as {
    success: boolean;
    error?: string;
  };
  return { ok: res.success, refused: res.error };
}

async function runAddQuality(
  destination: Destination,
  itemName: string,
  quality: { name: string; value?: number },
): Promise<{ ok: boolean }> {
  const res = (await callMcp('warhammer-mcp.modifyItemQualities', {
    destination,
    itemName,
    add: [quality],
  })) as { success: boolean };
  return { ok: res.success };
}

async function runRename(
  destination: Destination,
  itemName: string,
  newName: string,
): Promise<{ ok: boolean }> {
  const res = (await callMcp('warhammer-mcp.updateItem', {
    destination,
    itemName,
    updateData: { name: newName },
  })) as { success: boolean };
  return { ok: res.success };
}

async function runDelete(
  destination: Destination,
  itemId: string,
): Promise<{ ok: boolean }> {
  const res = (await callMcp('warhammer-mcp.deleteItem', {
    destination,
    itemId,
  })) as { success: boolean };
  return { ok: res.success };
}

function mockCreateOk(id = 'item-new'): void {
  mockMcpCall('warhammer-mcp.createCustomItem', (i: any) => ({
    success: true,
    data: {
      id,
      name: i.name,
      type: i.itemType,
      effects: i.effects || [],
      system: i.systemOverrides || {},
      folder: i.destination?.folder || null,
    },
  }));
}

beforeEach(() => clearMcpMocks());

describe('wfrp-create-item / defaults + routing', () => {
  it('defaults no-actor weapon intent to world + Custom/Weapons', async () => {
    mockCreateOk();
    const r = await runCreate({
      userText: 'create a fire sword',
      itemType: 'weapon',
      name: 'Fire Sword',
    });
    expect(r.ok).toBe(true);
    expect(r.payload?.destination).toEqual({ type: 'world', folder: ['Custom', 'Weapons'] });
    expect(r.payload?.returnFullPayload).toBe(true);
  });

  it('routes to actor-scope when the user names an actor', async () => {
    mockCreateOk();
    const r = await runCreate({
      userText: 'make Hans a silver longsword',
      itemType: 'weapon',
      name: "Hans's Silver Longsword",
      actorName: 'Hans',
      systemOverrides: { qualities: { value: [{ name: 'silvered' }] } },
    });
    expect(r.ok).toBe(true);
    expect(r.payload?.destination).toEqual({ type: 'actor', actorName: 'Hans' });
    expect(r.payload?.systemOverrides).toBeDefined();
    // No world folder leaked onto the payload.
    expect((r.payload?.destination as any).folder).toBeUndefined();
  });

  it('uses explicit folder path verbatim (no Custom prefix merge)', async () => {
    mockCreateOk();
    const r = await runCreate({
      userText: 'create a fire spell in Homebrew/Fire Spells',
      itemType: 'spell',
      name: 'Ice Lance',
      explicitFolder: ['Homebrew', 'Fire Spells'],
    });
    expect(r.ok).toBe(true);
    expect(r.payload?.destination).toEqual({
      type: 'world',
      folder: ['Homebrew', 'Fire Spells'],
    });
  });
});

describe('wfrp-create-item / compendium clone', () => {
  it('clones Fireball as Ice-lore spell via fromCompendium + systemOverrides', async () => {
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ pack: { id: 'wfrp4e-core.items' }, id: 'spell-fireball', name: 'Fireball' }],
    });
    mockCreateOk('ice-lance-1');
    const r = await runCreate({
      userText: 'clone Fireball as Ice-lore',
      itemType: 'spell',
      name: 'Ice Lance',
      cloneQuery: 'Fireball',
      systemOverrides: { lore: { value: 'ice' } },
    });
    expect(r.ok).toBe(true);
    expect(r.payload?.fromCompendium).toBe('Compendium.wfrp4e-core.items.spell-fireball');
    expect(r.payload?.systemOverrides).toEqual({ lore: { value: 'ice' } });
    expect(r.payload?.destination).toEqual({ type: 'world', folder: ['Custom', 'Spells'] });
  });

  it('refuses when compendium search returns zero hits', async () => {
    mockMcpCall('warhammer-mcp.searchCompendium', { success: true, data: [] });
    const r = await runCreate({
      userText: 'clone Nonexistent Spell',
      itemType: 'spell',
      name: 'Nonexistent',
      cloneQuery: 'Nonexistent Spell',
    });
    expect(r.ok).toBe(false);
    expect(r.refused).toMatch(/empty/i);
  });
});

describe('wfrp-create-item / module subtypes', () => {
  it('routes grimoire intent to forien-armoury.grimoire with Custom/Grimoires folder', async () => {
    mockCreateOk();
    const r = await runCreate({
      userText: 'make a grimoire with Aethyric Armour',
      itemType: 'forien-armoury.grimoire',
      name: 'My Grimoire',
    });
    expect(r.ok).toBe(true);
    expect(r.payload?.destination).toEqual({
      type: 'world',
      folder: ['Custom', 'Grimoires'],
    });
    expect(r.payload?.itemType).toBe('forien-armoury.grimoire');
  });

  it('relays Foundry error when module subtype is unrecognized server-side', async () => {
    mockMcpCall('warhammer-mcp.createCustomItem', {
      success: false,
      error: 'Unknown type "forien-armoury.grimoire"',
    });
    const r = await runCreate({
      userText: 'make a grimoire',
      itemType: 'forien-armoury.grimoire',
      name: 'Ghost Grimoire',
    });
    expect(r.ok).toBe(false);
    expect(r.refused).toMatch(/Unknown type/);
  });
});

describe('wfrp-create-item / effects', () => {
  it('attaches a rollWeaponTest effect when user describes runtime behavior', async () => {
    mockCreateOk();
    const r = await runCreate({
      userText: 'make a talent that adds +1 damage on ranged attacks',
      itemType: 'talent',
      name: 'Deadly Marksman',
      effects: [
        {
          name: '+1 Ranged Damage',
          trigger: 'rollWeaponTest',
          script: 'if (args.test.item?.system?.isRanged) args.test.result.damage += 1;',
        },
      ],
    });
    expect(r.ok).toBe(true);
    expect(r.payload?.effects).toHaveLength(1);
    expect(r.payload?.effects?.[0].trigger).toBe('rollWeaponTest');
  });

  it('refuses effects with triggers outside the 53-name catalogue', async () => {
    const r = await runCreate({
      userText: 'make a weapon with an onWhirl effect',
      itemType: 'weapon',
      name: 'Whirling Blade',
      effects: [
        { name: 'Whirl', trigger: 'onWhirl', script: '/* noop */' },
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.refused).toMatch(/unknown trigger onWhirl/);
    // Skill must not have fired createCustomItem.
    expect(
      getCallLog().filter((e) => e.queryKey === 'warhammer-mcp.createCustomItem'),
    ).toHaveLength(0);
  });
});

describe('wfrp-create-item / mid-conversation edits', () => {
  it('adds a quality via modifyItemQualities with the captured destination', async () => {
    mockMcpCall('warhammer-mcp.modifyItemQualities', { success: true });
    const r = await runAddQuality(
      { type: 'world', folder: ['Custom', 'Weapons'] },
      'Fire Sword',
      { name: 'damaging' },
    );
    expect(r.ok).toBe(true);
    // Did NOT re-fire createCustomItem.
    expect(
      getCallLog().filter((e) => e.queryKey === 'warhammer-mcp.createCustomItem'),
    ).toHaveLength(0);
  });

  it('attaches a post-create effect via addActiveEffect (not a new create)', async () => {
    mockMcpCall('warhammer-mcp.addActiveEffect', { success: true });
    const r = await runAddEffect(
      { scope: 'world', itemName: 'Fire Sword' },
      { name: 'Flame on Hit', trigger: 'applyDamage', script: 'await args.actor.addCondition("ablaze");' },
    );
    expect(r.ok).toBe(true);
    expect(
      getCallLog().filter((e) => e.queryKey === 'warhammer-mcp.createCustomItem'),
    ).toHaveLength(0);
  });

  it('renames a just-created world item via updateItem rather than delete+recreate', async () => {
    mockMcpCall('warhammer-mcp.updateItem', { success: true });
    const r = await runRename(
      { type: 'world', folder: ['Custom', 'Weapons'] },
      'Fire Sword',
      'Phoenix Sword',
    );
    expect(r.ok).toBe(true);
    const log = getCallLog();
    expect(log.filter((e) => e.queryKey === 'warhammer-mcp.deleteItem')).toHaveLength(0);
    expect(log.filter((e) => e.queryKey === 'warhammer-mcp.createCustomItem')).toHaveLength(0);
  });

  it('scraps a world item via deleteItem with world destination', async () => {
    mockMcpCall('warhammer-mcp.deleteItem', { success: true });
    const r = await runDelete(
      { type: 'world', folder: ['Custom', 'Weapons'] },
      'item-phoenix-1',
    );
    expect(r.ok).toBe(true);
  });
});

describe('wfrp-create-item / returnFullPayload regression', () => {
  it('passes returnFullPayload:true on every create to enable post-create verify', async () => {
    mockCreateOk();
    await runCreate({
      userText: 'create a helmet',
      itemType: 'armour',
      name: 'Gilded Helm',
    });
    const createCalls = getCallLog().filter(
      (e) => e.queryKey === 'warhammer-mcp.createCustomItem',
    );
    expect(createCalls).toHaveLength(1);
    expect((createCalls[0].input as CreatePayload).returnFullPayload).toBe(true);
  });
});
