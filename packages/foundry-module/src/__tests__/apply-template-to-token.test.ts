// apply-template-to-token — token-delta variant of applyTemplate.
// Covers: Zod strict boundary, scene/token/actorLink guards, delta-write happy path
// (synthetic actor gets the writes while a separate world actor stays untouched),
// preResolvedChoices parity with apply-template. Shares mock scaffolding shape
// with apply-template.test.ts so the two tests are diff-readable.

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../queries.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

function makeTemplate(opts: {
  id?: string;
  name?: string;
  alterName?: { pre: string; post: string };
  characteristics?: Record<string, number>;
  skills?: Array<{ name: string; advances: number; group?: number | null; specialisations?: number | null }>;
  talents?: Array<{ name: string; advances: number; group?: number | null }>;
  lores?: Array<{ name: string; number: number }>;
  trappings?: { structure: any; options: any[] };
}) {
  return {
    id: opts.id ?? 'tpl-1',
    name: opts.name ?? 'Skirmisher',
    type: 'template',
    system: {
      alterName: opts.alterName ?? { pre: '', post: '' },
      characteristics: opts.characteristics ?? {},
      skills: { list: opts.skills ?? [] },
      talents: { list: opts.talents ?? [] },
      lores: { list: opts.lores ?? [] },
      traits: { list: [] },
      trappings: opts.trappings ?? { structure: { type: 'or', id: 'root', options: [] }, options: [] },
    },
  };
}

function makeSyntheticActor(opts: { id: string; name: string; type?: string; isToken?: boolean }) {
  const updates: Array<{ updateData: Record<string, any>; options: any }> = [];
  const creates: Array<{ items: any[]; options: any }> = [];
  return {
    id: opts.id,
    name: opts.name,
    type: opts.type ?? 'creature',
    isToken: opts.isToken ?? true,
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

function makeScene(opts: { id: string; name?: string; tokens: Array<{ id: string; actorLink: boolean; actor: any; actorId?: string; name?: string }> }) {
  const tokensMap = new Map<string, any>();
  for (const t of opts.tokens) {
    const tokenUpdates: Array<Record<string, any>> = [];
    tokensMap.set(t.id, {
      ...t,
      name: t.name ?? t.actor?.name ?? 'Token',
      update: vi.fn(async (updateData: Record<string, any>) => {
        tokenUpdates.push(updateData);
      }),
      __updates: tokenUpdates,
    });
  }
  return {
    id: opts.id,
    name: opts.name ?? 'PoC Scene',
    tokens: tokensMap,
  };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
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
    scenes: new Map(),
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
        magicLores: {},
        groupToType: {},
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

describe('handleApplyTemplateToToken — Zod boundary', () => {
  it('rejects missing required fields', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyTemplateToToken({ sceneId: 's1', tokenId: 't1' }),
    ).rejects.toThrow(/Invalid input/);
  });

  it('rejects unknown extra keys at top level', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyTemplateToToken({
        sceneId: 's1',
        tokenId: 't1',
        templateUuid: 'x',
        extraneous: 1,
      }),
    ).rejects.toThrow(/Invalid input/);
  });

  it('rejects unknown extra keys inside preResolvedChoices', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleApplyTemplateToToken({
        sceneId: 's1',
        tokenId: 't1',
        templateUuid: 'x',
        preResolvedChoices: { bogus: true },
      }),
    ).rejects.toThrow(/Invalid input/);
  });
});

describe('dataAccess.applyTemplateToToken — scene + token + actor guards', () => {
  it('rejects missing scene', async () => {
    const qh = makeHandlers();
    (globalThis as any).game.scenes = new Map();
    await expect(
      qh.templateApply.applyTemplateToToken({ sceneId: 'ghost-scene', tokenId: 't1', templateUuid: 'x' }),
    ).rejects.toThrow(/Scene not found/);
  });

  it('rejects missing token on an existing scene', async () => {
    const qh = makeHandlers();
    const scene = makeScene({ id: 's1', tokens: [] });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    await expect(
      qh.templateApply.applyTemplateToToken({ sceneId: 's1', tokenId: 'ghost-token', templateUuid: 'x' }),
    ).rejects.toThrow(/Token not found/);
  });

  it('rejects actorLink=true tokens with guidance toward apply-template', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'world-1', name: 'Linked Goblin', isToken: false });
    const scene = makeScene({
      id: 's1',
      tokens: [{ id: 't1', actorLink: true, actor: synthetic, actorId: 'world-1' }],
    });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    await expect(
      qh.templateApply.applyTemplateToToken({ sceneId: 's1', tokenId: 't1', templateUuid: 'x' }),
    ).rejects.toThrow(/actorLink=true/);
  });
});

describe('dataAccess.applyTemplateToToken — happy path (delta write)', () => {
  it('writes name, characteristics, and embedded items into the synthetic actor without touching a sibling world actor', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'goblin', name: 'Goblin' });
    const worldActor = makeSyntheticActor({ id: 'goblin', name: 'Goblin', isToken: false });
    const scene = makeScene({
      id: 's1',
      tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'goblin' }],
    });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    (globalThis as any).game.actors = new Map([['goblin', worldActor]]);

    const template = makeTemplate({
      id: 'tpl-skirmisher',
      alterName: { pre: 'Skirmisher', post: '' },
      characteristics: { ws: 5 },
      skills: [{ name: 'Stealth (Rural)', advances: 10 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    const result = await qh.templateApply.applyTemplateToToken({
      sceneId: 's1',
      tokenId: 't1',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.tpl-skirmisher',
    });

    expect(result.success).toBe(true);
    expect(result.sceneId).toBe('s1');
    expect(result.tokenId).toBe('t1');
    // Synthetic (delta) gets the writes.
    expect(synthetic.__updates).toHaveLength(1);
    expect(synthetic.__updates[0]!.updateData.name).toBe('Skirmisher Goblin');
    expect(synthetic.__updates[0]!.updateData['system.characteristics.ws.advances']).toBe(5);
    expect(synthetic.__creates).toHaveLength(1);
    expect(synthetic.__creates[0]!.options.fromTemplate).toBe('tpl-skirmisher');
    // A separate mock for the world actor proves delta isolation:
    // the primitive never reached for it.
    expect(worldActor.__updates).toHaveLength(0);
    expect(worldActor.__creates).toHaveLength(0);
    // BUG-055: tokenDoc.name is stale after the delta rename (captured from the
    // base actor "Goblin" at token-create time). Primitive must sync it and
    // replicate Foundry's create-time auto-numbering — singleton → "(1)".
    const tokenDoc = scene.tokens.get('t1') as any;
    expect(tokenDoc.__updates).toHaveLength(1);
    expect(tokenDoc.__updates[0]!.name).toBe('Skirmisher Goblin (1)');
  });

  it('numbers the sync suffix based on existing sibling tokens with the same applied name', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'goblin', name: 'Goblin' });
    const scene = makeScene({
      id: 's1',
      tokens: [
        { id: 't1', actorLink: false, actor: synthetic, actorId: 'goblin', name: 'Skirmisher Goblin (1)' },
        { id: 't2', actorLink: false, actor: synthetic, actorId: 'goblin', name: 'Skirmisher Goblin (2)' },
        { id: 't3', actorLink: false, actor: synthetic, actorId: 'goblin', name: 'Goblin' },
      ],
    });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);

    const template = makeTemplate({
      alterName: { pre: 'Skirmisher', post: '' },
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    // Apply to t3 — two existing "Skirmisher Goblin (N)" siblings, so t3 should become "(3)".
    await qh.templateApply.applyTemplateToToken({
      sceneId: 's1',
      tokenId: 't3',
      templateUuid: 'x',
    });
    const t3 = scene.tokens.get('t3') as any;
    expect(t3.__updates).toHaveLength(1);
    expect(t3.__updates[0]!.name).toBe('Skirmisher Goblin (3)');
  });

  it('skips tokenDoc.update for templates with no alterName (Chaos Knight / Druchii Sorceress shape)', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'cw', name: 'Chaos Warrior' });
    const scene = makeScene({
      id: 's1',
      tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'cw', name: 'Chaos Warrior (2)' }],
    });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);

    const template = makeTemplate({
      alterName: { pre: '', post: '' },
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    await qh.templateApply.applyTemplateToToken({
      sceneId: 's1',
      tokenId: 't1',
      templateUuid: 'x',
    });

    // Non-renaming template → keep drop-time auto-numbering, don't force a new suffix.
    const tokenDoc = scene.tokens.get('t1') as any;
    expect(tokenDoc.__updates).toHaveLength(0);
  });
});

describe('dataAccess.applyTemplateToToken — Phase 12 dryRun (R12.1)', () => {
  it('dryRun:true returns the plan + WRITE#3 token-rename preview and performs ZERO writes', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'goblin', name: 'Goblin' });
    const scene = makeScene({ id: 's1', tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'goblin' }] });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    const template = makeTemplate({ alterName: { pre: 'Skirmisher', post: '' }, characteristics: { ws: 5 } });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    const result = await qh.templateApply.applyTemplateToToken({ sceneId: 's1', tokenId: 't1', templateUuid: 'x', dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(result.sceneId).toBe('s1');
    expect(result.tokenId).toBe('t1');
    // WRITE #3 preview: would rename, but does NOT.
    expect(result.tokenRename).toEqual({ wouldRename: true, plannedName: 'Skirmisher Goblin (1)' });
    expect(synthetic.__updates).toHaveLength(0);
    expect(synthetic.__creates).toHaveLength(0);
    const tokenDoc = scene.tokens.get('t1') as any;
    expect(tokenDoc.__updates).toHaveLength(0);
    expect(result.operationId).toBeUndefined();
  });

  it('dryRun reports wouldRename:false for a non-renaming template', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'cw', name: 'Chaos Warrior' });
    const scene = makeScene({ id: 's1', tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'cw' }] });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    const template = makeTemplate({ alterName: { pre: '', post: '' } });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    const result = await qh.templateApply.applyTemplateToToken({ sceneId: 's1', tokenId: 't1', templateUuid: 'x', dryRun: true });
    expect(result.tokenRename.wouldRename).toBe(false);
  });
});

describe('dataAccess.applyTemplateToToken — Phase 12 operation receipt (R12.2)', () => {
  it('a real apply returns operationId + createdDocumentIds (= item ids) + updatedDocumentIds ([actorId, tokenId])', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'goblin', name: 'Goblin' });
    const scene = makeScene({ id: 's1', tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'goblin' }] });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    const template = makeTemplate({ skills: [{ name: 'Stealth (Rural)', advances: 10 }] });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    const result = await qh.templateApply.applyTemplateToToken({ sceneId: 's1', tokenId: 't1', templateUuid: 'x' });
    expect(typeof result.operationId).toBe('string');
    expect(result.operationId.length).toBeGreaterThan(0);
    expect(result.createdDocumentIds).toEqual(result.applied.itemIds);
    expect(result.updatedDocumentIds).toEqual(['goblin', 't1']);
    expect(result.deletedDocumentIds).toEqual([]);
  });
});

describe('dataAccess.applyTemplateToToken — preResolvedChoices parity with apply-template', () => {
  it('honors preResolvedChoices.specialisations identically to applyTemplate', async () => {
    const qh = makeHandlers();
    const synthetic = makeSyntheticActor({ id: 'goblin', name: 'Goblin' });
    const scene = makeScene({
      id: 's1',
      tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'goblin' }],
    });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);

    const template = makeTemplate({
      skills: [{ name: 'Melee', advances: 20, specialisations: 2 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;
    (globalThis as any).warhammer.utility.findAllItems = async () => ([
      { name: 'Melee (Basic)', baseName: 'Melee' },
      { name: 'Melee (Polearm)', baseName: 'Melee' },
      { name: 'Other', baseName: 'Other' },
    ]);

    await qh.templateApply.applyTemplateToToken({
      sceneId: 's1',
      tokenId: 't1',
      templateUuid: 'x',
      preResolvedChoices: { specialisations: { Melee: ['Melee (Polearm)', 'Melee (Basic)'] } },
    });

    const names = synthetic.__creates[0]!.items
      .filter((i: any) => i.type === 'skill')
      .map((i: any) => i.name);
    expect(names).toEqual(expect.arrayContaining(['Melee (Polearm)', 'Melee (Basic)']));
    expect(names).not.toContain('Melee');
  });
});
