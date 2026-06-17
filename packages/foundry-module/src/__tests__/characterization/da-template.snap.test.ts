// Characterization snapshot tests — the template-apply engine (applyTemplate / applyTemplateToToken).
// Phase 6 (R6.1/R6.2, Risk 6.B/HC3): NO characterization net existed for template-apply before Phase 6.
// This net is captured on the MONOLITH (Job B 6.3) BEFORE the move into services/template-apply.ts and
// must stay ZERO-diff through the split (6.4) + the planTemplateApply/executeTemplatePlan refactor — that
// is the zero-behavioral-drift proof. It pierces the stable public surface (dataAccess.applyTemplate*),
// which remains a thin facade delegate post-move, so the same writes are captured before and after.
//
// Determinism: inputs avoid every Math.random() path in _runTemplateApply (ungrouped skills, no `(Any)`
// wildcards, no specialisations>1 without an override, no lores) so the captured writes are stable.
//
// Snapshots freeze the THREE writes (PRD Risk 6.A "derive, don't invent"):
//   WRITE #1  actor.update(updateData, { skipExperienceChecks: true })
//   WRITE #2  actor.createEmbeddedDocuments('Item', allItems, { fromTemplate, skipSpecialisationChoice: true })
//   WRITE #3  tokenDoc.update({ name }) — token variant only (BUG-055 (N) suffix)

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../../queries.js';
import { TemplateApplyService } from '../../services/index.js';

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
      lores: { list: [] },
      traits: { list: [] },
      trappings: { structure: { type: 'or', id: 'root', options: [] }, options: [] },
    },
  };
}

function makeActor(opts: { id: string; name: string; type: string; isToken?: boolean }) {
  const updates: Array<{ updateData: Record<string, any>; options: any }> = [];
  const creates: Array<{ items: any[]; options: any }> = [];
  return {
    id: opts.id,
    name: opts.name,
    type: opts.type,
    isToken: opts.isToken ?? false,
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

describe('template-apply engine — applyTemplate (world actor) write capture', () => {
  it('captures WRITE #1 (actor.update + skipExperienceChecks) and WRITE #2 (createEmbeddedDocuments + fromTemplate)', async () => {
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

    expect({
      write1_actorUpdate: actor.__updates,
      write2_createEmbedded: actor.__creates,
      result,
    }).toMatchSnapshot();
    // WRITE #1 carries the skipExperienceChecks option; on a world actor (isToken=false)
    // the name update includes prototypeToken.name (BUG-275 only skips it for token deltas).
    expect(actor.__updates[0]!.options.skipExperienceChecks).toBe(true);
    expect(actor.__updates[0]!.updateData['prototypeToken.name']).toBe('Wight Skeleton');
  });
});

describe('template-apply engine — applyTemplateToToken (synthetic delta) write capture', () => {
  it('captures WRITE #1 (no prototypeToken.name on a token delta), WRITE #2, and WRITE #3 token name-sync', async () => {
    const qh = makeHandlers();
    const synthetic = makeActor({ id: 'goblin', name: 'Goblin', type: 'creature', isToken: true });
    const worldActor = makeActor({ id: 'goblin', name: 'Goblin', type: 'creature', isToken: false });
    const scene = makeScene({
      id: 's1',
      tokens: [{ id: 't1', actorLink: false, actor: synthetic, actorId: 'goblin' }],
    });
    (globalThis as any).game.scenes = new Map([['s1', scene]]);
    (globalThis as any).game.actors = new Map([['goblin', worldActor]]);

    const template = makeTemplate({
      id: 'tpl-skirmisher',
      name: 'Skirmisher',
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

    const tokenDoc = scene.tokens.get('t1') as any;
    expect({
      write1_deltaUpdate: synthetic.__updates,
      write2_createEmbedded: synthetic.__creates,
      write3_tokenNameSync: tokenDoc.__updates,
      worldActorUntouched: { updates: worldActor.__updates.length, creates: worldActor.__creates.length },
      result,
    }).toMatchSnapshot();
    // Token-delta isolation: the world actor is never written.
    expect(worldActor.__updates).toHaveLength(0);
    expect(worldActor.__creates).toHaveLength(0);
    // BUG-275: prototypeToken.name is NOT written for a synthetic token-delta actor.
    expect(synthetic.__updates[0]!.updateData['prototypeToken.name']).toBeUndefined();
    // BUG-055: WRITE #3 syncs the stale token name + replicates create-time auto-numbering.
    expect(tokenDoc.__updates[0]!.name).toBe('Skirmisher Goblin (1)');
  });
});

describe('template-apply engine — BUG-242 bare-specialisation skill', () => {
  it('embeds a bare-spec skill ("Channelling") with skipSpecialisationChoice:true so no dialog blocks execution', async () => {
    const qh = makeHandlers();
    const actor = makeActor({ id: 'act-1', name: 'Apprentice', type: 'npc' });
    (globalThis as any).game.actors = new Map([['act-1', actor]]);
    const template = makeTemplate({
      id: 'tpl-mage',
      skills: [{ name: 'Channelling', advances: 0 }],
    });
    (globalThis as any).warhammer.utility.findItemId = async () => template;

    await qh.templateApply.applyTemplate({ actorId: 'act-1', templateUuid: 'x' });

    expect(actor.__creates[0]!.options).toMatchSnapshot();
    // The BUG-242 fix (2026-05-25): skipSpecialisationChoice short-circuits
    // SkillModel._handleSpecialisationChoice's blocking dialog for bare isSpec skills.
    // This MUST survive the Phase 6 plan/apply split (it lives in WRITE #2's options).
    expect(actor.__creates[0]!.options.skipSpecialisationChoice).toBe(true);
  });
});

// Phase 6 (R6.2): the plan/apply split is the INTERNAL dry-run proof — planTemplateApply() returns a
// serializable write plan without touching Foundry; executeTemplatePlan() applies it. These pierce the
// service directly (the split methods live only on TemplateApplyService). Tool-level --dryRun is deferred
// to Phase 12 (scope #31); Phase 6 satisfies R6.2 entirely at the function level.
describe('template-apply engine — planTemplateApply / executeTemplatePlan split (R6.2 internal dry-run)', () => {
  function makeService() {
    return new TemplateApplyService(() => {});
  }

  function wightTemplate() {
    return makeTemplate({
      id: 'tpl-wight',
      alterName: { pre: 'Wight', post: '' },
      characteristics: { ws: 15, t: 10 },
      skills: [{ name: 'Intimidate', advances: 20 }],
      talents: [{ name: 'Frightening', advances: 1 }],
    });
  }

  it('planTemplateApply builds the serializable 2-write plan and performs NO Foundry writes (dry-run)', async () => {
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    const svc = makeService();

    const plan = await svc.planTemplateApply(actor, wightTemplate(), 'tpl-wight', {});

    // R6.2: planning performs ZERO Foundry writes — the mock actor's capture arrays stay empty.
    expect(actor.__updates).toHaveLength(0);
    expect(actor.__creates).toHaveLength(0);
    // The write plan is JSON-serializable (no functions / circular refs in the writes array).
    expect(() => JSON.stringify(plan.writes)).not.toThrow();
    expect(plan.writes).toMatchSnapshot();
  });

  it('executeTemplatePlan applies the planned writes (WRITE #1 then WRITE #2) — identical to the monolith baseline', async () => {
    const actor = makeActor({ id: 'act-1', name: 'Skeleton', type: 'creature' });
    const svc = makeService();

    const plan = await svc.planTemplateApply(actor, wightTemplate(), 'tpl-wight', {});
    const result = await svc.executeTemplatePlan(plan);

    // Writes are now applied — the captured writes mirror the applyTemplate (world actor) baseline above.
    expect({
      write1_actorUpdate: actor.__updates,
      write2_createEmbedded: actor.__creates,
      result,
    }).toMatchSnapshot();
    // HC1 / BUG-242: the engine options survive the split.
    expect(actor.__updates[0]!.options.skipExperienceChecks).toBe(true);
    expect(actor.__creates[0]!.options.skipSpecialisationChoice).toBe(true);
  });
});
