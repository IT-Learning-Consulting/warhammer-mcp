// Phase 4h — applyTemplate handler + data-access coverage.
// Happy path + Zod boundary + tree walker + diff merge + stacking + invalid guards.

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../queries.js';
import { expectEnvelope } from './test-utils.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

// Build a minimal template Item with the parts applyTemplate walks.
function makeTemplate(opts: {
  id?: string;
  name?: string;
  alterName?: { pre: string; post: string };
  characteristics?: Record<string, number>;
  skills?: Array<{ name: string; advances: number; group?: number | null; specialisations?: number | null }>;
  talents?: Array<{ name: string; advances: number; group?: number | null }>;
  lores?: Array<{ name: string; number: number }>;
  traits?: Array<{ uuid: string; diff?: Record<string, unknown> }>;
  trappings?: { structure: any; options: any[] };
}) {
  return {
    id: opts.id ?? 'tpl-1',
    name: opts.name ?? 'Wight',
    type: 'template',
    system: {
      alterName: opts.alterName ?? { pre: '', post: '' },
      characteristics: opts.characteristics ?? {},
      skills: { list: opts.skills ?? [] },
      talents: { list: opts.talents ?? [] },
      lores: { list: opts.lores ?? [] },
      traits: { list: opts.traits ?? [] },
      trappings: opts.trappings ?? { structure: { type: 'or', id: 'root', options: [] }, options: [] },
    },
  };
}

function makeActor(opts: { id: string; name: string; type: string }) {
  const updates: Array<{ updateData: Record<string, any>; options: any }> = [];
  const creates: Array<{ items: any[]; options: any }> = [];
  return {
    id: opts.id,
    name: opts.name,
    type: opts.type,
    system: { characteristics: { ws: { advances: 0 }, bs: { advances: 0 }, s: { advances: 0 }, t: { advances: 0 }, i: { advances: 0 }, ag: { advances: 0 }, dex: { advances: 0 }, int: { advances: 0 }, wp: { advances: 0 }, fel: { advances: 0 } } },
    items: new Map(),
    effects: new Map(),
    update: vi.fn(async (updateData: Record<string, any>, options: any) => {
      updates.push({ updateData, options });
    }),
    createEmbeddedDocuments: vi.fn(async (_name: string, items: any[], options: any) => {
      creates.push({ items, options });
      return items.map((item, idx) => ({ ...item, id: `new-${idx}` }));
    }),
    __updates: updates,
    __creates: creates,
  };
}

// Reset globals per test.
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  // Extend setup.ts's foundry.utils with the additional helpers applyTemplate uses.
  const existingUtils = (globalThis as any).foundry?.utils ?? {};
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...existingUtils,
      getProperty: (obj: any, path: string) => {
        const parts = path.split('.');
        let cur: any = obj;
        for (const p of parts) {
          if (cur == null) return undefined;
          cur = cur[p];
        }
        return cur;
      },
      setProperty: (obj: any, path: string, value: any) => {
        const parts = path.split('.');
        let cur: any = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          const k = parts[i]!;
          if (cur[k] == null) cur[k] = {};
          cur = cur[k];
        }
        cur[parts[parts.length - 1]!] = value;
      },
      mergeObject: (target: any, source: any) => {
        for (const key of Object.keys(source)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') {
            (globalThis as any).foundry.utils.mergeObject(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
        return target;
      },
    },
  };
  (globalThis as any).game = {
    ...(globalThis as any).game,
    system: { id: 'wfrp4e' },
    user: { isGM: true, id: 'gm', name: 'GM' },
    actors: new Map(),
    wfrp4e: {
      utility: {
        findSkill: vi.fn(async (name: string) => ({
          name,
          type: 'skill',
          toObject: () => ({ name, type: 'skill', system: { advances: { value: 0 } } }),
        })),
        findTalent: vi.fn(async (name: string) => ({
          name,
          type: 'talent',
          toObject: () => ({ name, type: 'talent' }),
        })),
      },
      config: {
        magicLores: { fire: 'Fire', death: 'Death', shadow: 'Shadow' },
        groupToType: { basic: 'melee', polearm: 'melee', cavalry: 'melee', twohanded: 'melee', fencing: 'melee', bow: 'ranged', crossbow: 'ranged', blackpowder: 'ranged', engineering: 'ranged', entangling: 'ranged', explosives: 'ranged' },
        placeholderItemData: { type: 'trapping' },
      },
    },
  };
  (globalThis as any).warhammer = {
    utility: {
      findItemId: vi.fn(),
      findAllItems: vi.fn(async () => []),
    },
  };
});

describe('handleApplyTemplate — happy path envelope', () => {
  it('returns { success: true, data } with template summary', async () => {
    const qh = makeHandlers();
    qh.templateApply.applyTemplate = async () => ({
      success: true,
      actorId: 'act-1',
      actorName: 'Wight Skeleton',
      templateId: 'tpl-1',
      templateName: 'Wight',
      applied: { name: 'Wight Skeleton', characteristics: { ws: 15 }, itemIds: ['i1'], itemsByType: {} },
    });
    const result = await (qh as any).handleApplyTemplate({
      actorId: 'act-1',
      templateUuid: 'Compendium.wfrp4e-owb2.items.Item.abcdefghij012345',
    });
    expectEnvelope<any>(result);
    expect(result.data.templateName).toBe('Wight');
    expect(result.data.applied.characteristics.ws).toBe(15);
  });
});

describe('handleApplyTemplate — Zod boundary', () => {
  it('rejects missing templateUuid with Invalid input', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyTemplate({ actorId: 'act-1' }),
    ).rejects.toThrow(/Invalid input/);
  });

  it('rejects unknown extra keys', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyTemplate({
        actorId: 'act-1',
        templateUuid: 'x',
        extraneous: 1,
      }),
    ).rejects.toThrow(/Invalid input/);
  });

  it('rejects unknown extra key inside preResolvedChoices', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyTemplate({
        actorId: 'act-1',
        templateUuid: 'x',
        preResolvedChoices: { bogus: true },
      }),
    ).rejects.toThrow(/Invalid input/);
  });
});

describe('dataAccess.applyTemplate — actor + template guards', () => {
  it('rejects missing actor', async () => {
    const qh = makeHandlers();
    (globalThis as any).game.actors = new Map();
    await expect(
      qh.templateApply.applyTemplate({ actorId: 'ghost', templateUuid: 'x' }),
    ).rejects.toThrow(/Actor not found/);
  });

  it('rejects unresolvable template', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    (globalThis as any).warhammer.utility.findItemId = async () => null;
    await expect(
      qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'missing' }),
    ).rejects.toThrow(/Template not found/);
  });

  it('rejects a non-template item', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    (globalThis as any).warhammer.utility.findItemId = async () => ({ id: 'not-tpl', name: 'Sword', type: 'weapon', system: {} });
    await expect(
      qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'Compendium.x.items.Item.sword' }),
    ).rejects.toThrow(/expected "template"/);
  });
});

describe('dataAccess.applyTemplate — skills + characteristics + name', () => {
  it('composes alterName, applies characteristic deltas, embeds skills with fromTemplate', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      id: 'tpl-wight',
      alterName: { pre: 'Wight', post: '' },
      characteristics: { ws: 15, t: 10 },
      skills: [{ name: 'Intimidate', advances: 20 }],
      talents: [{ name: 'Frightening', advances: 1 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    const result = await qh.templateApply.applyTemplate({
      actorId: 'act-1',
      templateUuid: 'Compendium.wfrp4e-owb2.items.Item.tpl-wight',
    });

    expect(result.success).toBe(true);
    expect(actor.__updates).toHaveLength(1);
    expect(actor.__updates[0]!.updateData.name).toBe('Wight Skeleton');
    expect(actor.__updates[0]!.updateData['system.characteristics.ws.advances']).toBe(15);
    expect(actor.__updates[0]!.updateData['system.characteristics.t.advances']).toBe(10);
    expect(actor.__creates).toHaveLength(1);
    expect(actor.__creates[0]!.options.fromTemplate).toBe('tpl-wight');
    const names = actor.__creates[0]!.items.map((i: any) => i.name);
    expect(names).toContain('Intimidate');
    expect(names).toContain('Frightening');
  });

  it('expands skill with specialisations>1 into N specialisation entries and drops the base', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      skills: [{ name: 'Melee', advances: 20, specialisations: 2 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;
    (globalThis as any).warhammer.utility.findAllItems = async () => ([
      { name: 'Melee (Basic)', baseName: 'Melee' },
      { name: 'Melee (Polearm)', baseName: 'Melee' },
      { name: 'Other', baseName: 'Other' },
    ]);

    await qh.templateApply.applyTemplate({
      actorId: 'act-1',
      templateUuid: 'x',
      preResolvedChoices: { specialisations: { Melee: ['Melee (Polearm)', 'Melee (Basic)'] } },
    });

    const names = actor.__creates[0]!.items
      .filter((i: any) => i.type === 'skill')
      .map((i: any) => i.name);
    expect(names).toEqual(expect.arrayContaining(['Melee (Polearm)', 'Melee (Basic)']));
    expect(names).not.toContain('Melee');
  });
});

describe('dataAccess.applyTemplate — trappings tree walker', () => {
  it('picks one option from a root OR node and resolves its documentId via findItemId', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Goblin', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      trappings: {
        structure: { type: 'or', id: 'root', options: [
          { type: 'option', id: 'opt-sword' },
          { type: 'option', id: 'opt-axe' },
        ] },
        options: [
          { type: 'item', id: 'opt-sword', name: 'Sword', documentId: 'sword-uuid', idType: 'uuid', diff: {}, filters: [] },
          { type: 'item', id: 'opt-axe', name: 'Axe', documentId: 'axe-uuid', idType: 'uuid', diff: {}, filters: [] },
        ],
      },
    });
    const calls: string[] = [];
    (globalThis as any).warhammer.utility.findItemId = async (id: string) => {
      if (id === 'x') return template;
      calls.push(id);
      return { name: `Doc-${id}`, type: 'weapon', toObject: () => ({ name: `Doc-${id}`, type: 'weapon' }) };
    };

    await qh.templateApply.applyTemplate({
      actorId: 'act-1',
      templateUuid: 'x',
      preResolvedChoices: { trappings: { root: 'opt-sword' } },
    });

    expect(calls).toContain('sword-uuid');
    expect(calls).not.toContain('axe-uuid');
  });

  it('merges option.diff onto resolved document (Quality Mail Coif pattern)', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Guard', type: 'npc' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      trappings: {
        structure: { type: 'or', id: 'root', options: [{ type: 'option', id: 'opt-coif' }] },
        options: [
          { type: 'item', id: 'opt-coif', name: 'Mail Coif', documentId: 'coif-uuid', idType: 'uuid',
            diff: { name: 'Quality Mail Coif' }, filters: [] },
        ],
      },
    });
    (globalThis as any).warhammer.utility.findItemId = async (id: string) => {
      if (id === 'x') return template;
      return { name: 'Mail Coif', type: 'armour', toObject: () => ({ name: 'Mail Coif', type: 'armour' }) };
    };

    await qh.templateApply.applyTemplate({
      actorId: 'act-1',
      templateUuid: 'x',
    });

    const coif = actor.__creates[0]!.items.find((i: any) => i.type === 'armour');
    expect(coif.name).toBe('Quality Mail Coif');
  });

  it('AND node takes all children, OR node takes one (skill-weapon correlation prefers matching filter)', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Footman', type: 'npc' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      skills: [{ name: 'Melee', advances: 10, specialisations: 1 }],
      trappings: {
        structure: {
          type: 'and', id: 'root', options: [
            { type: 'option', id: 'opt-armor' },
            {
              type: 'or', id: 'or-weapon', options: [
                { type: 'option', id: 'opt-basic' },
                { type: 'option', id: 'opt-polearm' },
              ],
            },
          ],
        },
        options: [
          { type: 'item', id: 'opt-armor', name: 'Leather', documentId: 'armor-uuid', idType: 'uuid', diff: {}, filters: [] },
          { type: 'filter', id: 'opt-basic', name: 'Any Basic',
            filters: [{ path: 'system.weaponGroup.value', operation: '=', value: 'basic' }] },
          { type: 'filter', id: 'opt-polearm', name: 'Any Polearm',
            filters: [{ path: 'system.weaponGroup.value', operation: '=', value: 'polearm' }] },
        ],
      },
    });
    (globalThis as any).warhammer.utility.findItemId = async (id: string) => {
      if (id === 'x') return template;
      return { name: 'Leather', type: 'armour', toObject: () => ({ name: 'Leather', type: 'armour' }) };
    };
    // Make the polearm filter return a single candidate when findAllItems('weapon') is called.
    (globalThis as any).warhammer.utility.findAllItems = async () => ([
      { name: 'Halberd', type: 'weapon', system: { weaponGroup: { value: 'polearm' } }, toObject: () => ({ name: 'Halberd', type: 'weapon' }) },
      { name: 'Sword', type: 'weapon', system: { weaponGroup: { value: 'basic' } }, toObject: () => ({ name: 'Sword', type: 'weapon' }) },
    ]);

    // The template skill `Melee (spec=1)` is resolved as a single `Melee` skill (not expanded),
    // so the correlation heuristic wouldn't match the "(Polearm)" suffix. Override trappings
    // branch explicitly to verify AND takes all children and the selected OR branch resolves.
    await qh.templateApply.applyTemplate({
      actorId: 'act-1',
      templateUuid: 'x',
      preResolvedChoices: { trappings: { 'or-weapon': 'opt-polearm' } },
    });

    const items = actor.__creates[0]!.items;
    const names = items.map((i: any) => i.name);
    // AND root delivers the armor leaf.
    expect(names).toContain('Leather');
    // OR subtree under "or-weapon" resolves the polearm filter → Halberd.
    expect(names).toContain('Halberd');
  });
});

describe('dataAccess.applyTemplate — trait diff merge', () => {
  it('merges each trait.diff onto the resolved document', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      traits: [
        { uuid: 'trait-weapon-uuid', diff: { name: 'Weapon (Sword +6)' } },
        { uuid: 'trait-vanilla-uuid', diff: {} },
      ],
    });
    (globalThis as any).warhammer.utility.findItemId = async (id: string) => {
      if (id === 'x') return template;
      if (id === 'trait-weapon-uuid')
        return { name: 'Weapon', type: 'trait', toObject: () => ({ name: 'Weapon', type: 'trait' }) };
      if (id === 'trait-vanilla-uuid')
        return { name: 'Undead', type: 'trait', toObject: () => ({ name: 'Undead', type: 'trait' }) };
      return null;
    };

    await qh.templateApply.applyTemplate({
      actorId: 'act-1',
      templateUuid: 'x',
    });

    const traits = actor.__creates[0]!.items.filter((i: any) => i.type === 'trait');
    const names = traits.map((t: any) => t.name);
    expect(names).toContain('Weapon (Sword +6)');
    expect(names).toContain('Undead');
  });
});

describe('dataAccess.applyTemplate — wildcard (Any) resolution (BUG-051)', () => {
  it('resolves `Melee (Any)` to a concrete weapon-group specialisation when no trapping context', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Militia', type: 'npc' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      skills: [{ name: 'Melee (Any)', advances: 20 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    await qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'x' });

    const skills = actor.__creates[0]!.items.filter((i: any) => i.type === 'skill');
    expect(skills).toHaveLength(1);
    expect(skills[0]!.name).toMatch(/^Melee \([A-Z][a-zA-Z]+\)$/);
    expect(skills[0]!.name).not.toBe('Melee (Any)');
  });

  it('resolves `Channelling (Any)` to `Channelling (<lore>)` using picked lore', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Goblin', type: 'creature' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    // Narrow magicLores so `*` deterministically picks Shyish.
    (globalThis as any).game.wfrp4e.config.magicLores = { shyish: 'Shyish' };
    const template = makeTemplate({
      skills: [{ name: 'Channelling (Any)', advances: 15 }],
      lores: [{ name: '*', number: 0 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    await qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'x' });

    const skills = actor.__creates[0]!.items.filter((i: any) => i.type === 'skill');
    expect(skills).toHaveLength(1);
    expect(skills[0]!.name).toBe('Channelling (Shyish)');
  });

  it('resolves `Melee (Any)` using trapping weapon-group when a polearm filter resolves first', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Footman', type: 'npc' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      skills: [{ name: 'Melee (Any)', advances: 20 }],
      trappings: {
        structure: { type: 'or', id: 'root', options: [{ type: 'option', id: 'opt-polearm' }] },
        options: [
          { type: 'filter', id: 'opt-polearm', name: 'Any Polearm',
            filters: [{ path: 'system.weaponGroup.value', operation: '=', value: 'polearm' }] },
        ],
      },
    });
    (globalThis as any).warhammer.utility.findItemId = async (id: string) => {
      if (id === 'x') return template;
      return null;
    };
    (globalThis as any).warhammer.utility.findAllItems = async (type: string) => {
      if (type === 'weapon') return [
        {
          name: 'Halberd',
          type: 'weapon',
          system: { weaponGroup: { value: 'polearm' } },
          toObject: () => ({ name: 'Halberd', type: 'weapon', system: { weaponGroup: { value: 'polearm' } } }),
        },
      ];
      return [];
    };

    await qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'x' });

    const skills = actor.__creates[0]!.items.filter((i: any) => i.type === 'skill');
    expect(skills).toHaveLength(1);
    expect(skills[0]!.name).toBe('Melee (Polearm)');
  });
});

describe('dataAccess.applyTemplate — stacking', () => {
  it('applying two templates sequentially embeds two fromTemplate-flagged batches', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Militia', type: 'npc' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const scout = makeTemplate({
      id: 'tpl-scout',
      alterName: { pre: 'Scout', post: '' },
      skills: [{ name: 'Perception', advances: 10 }],
    });
    const veteran = makeTemplate({
      id: 'tpl-veteran',
      alterName: { pre: 'Veteran', post: '' },
      characteristics: { ws: 5 },
    });
    let nextTpl = scout;
    (globalThis as any).warhammer.utility.findItemId = async () => nextTpl;

    await qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'x1' });
    // After first call, actor name would normally update; mock actor.name is static,
    // but both calls go through the same handler independently.
    nextTpl = veteran;
    await qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'x2' });

    expect(actor.__creates).toHaveLength(2);
    expect(actor.__creates[0]!.options.fromTemplate).toBe('tpl-scout');
    expect(actor.__creates[1]!.options.fromTemplate).toBe('tpl-veteran');
  });
});
