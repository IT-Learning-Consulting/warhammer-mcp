// BUG-777 — the four baseline named-pile templates (assets/components/pile-defaults.json:
// pile/container/merchant/vault) supplied `pileActorName` without `createDedicatedActor:true`;
// handleCreatePile then forwarded the name as an EXISTING-actor lookup, which upstream throws
// on in a clean world instead of creating the advertised Loot/Chest/Merchant/Party-Vault actor.
// Fix: the templates now set createDedicatedActor:true (asset-side); this file proves the
// handler's createDedicatedActor branch actually creates the actor for all four pile types
// and regression-guards the old broken shape (pileActorName alone still fails, as expected —
// it's an existing-actor lookup by design when createDedicatedActor is intentionally omitted).
//
// BUG-779 — same file/handler: a hook veto / `false` return / verify-failure AFTER the dedicated
// actor is created must roll that actor back (no orphan), and a successful create must NOT roll
// back and must report `actorOwnership` lifecycle metadata.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleCreatePile } from '../container.js';

let actorSeq = 0;
let createdActors: MockActor[] = [];

class MockActor {
  id: string;
  uuid: string;
  name: string;
  type: string;
  deleted = false;
  private flagStore: Record<string, Record<string, unknown>> = {};

  constructor(data: { name: string; type: string }) {
    actorSeq += 1;
    this.id = `actor${actorSeq}`;
    this.uuid = `Actor.${this.id}`;
    this.name = data.name;
    this.type = data.type;
  }

  async setFlag(scope: string, key: string, value: unknown): Promise<void> {
    this.flagStore[scope] = this.flagStore[scope] ?? {};
    this.flagStore[scope][key] = value;
  }

  getFlag(scope: string, key: string): unknown {
    return this.flagStore[scope]?.[key];
  }

  async delete(): Promise<void> {
    this.deleted = true;
  }
}

// Mirrors assets/components/pile-defaults.json post-BUG-777-fix (createDedicatedActor:true on
// all four). Hardcoded here (not cross-package-imported — this test package cannot resolve a
// path into the vault's .claude/skills/ asset tree) but kept byte-shape-identical to the asset.
const BASELINE_TEMPLATES: Array<{ type: string; pileActorName: string }> = [
  { type: 'pile', pileActorName: 'Loot' },
  { type: 'container', pileActorName: 'Chest' },
  { type: 'merchant', pileActorName: 'Merchant' },
  { type: 'vault', pileActorName: 'Party Vault' },
];

function mockGlobals(opts: { createItemPileImpl?: (options: any) => any; getActorFlagDataImpl?: (uuid: string) => any } = {}) {
  createdActors = [];
  actorSeq = 0;
  (globalThis as any).Actor = {
    create: vi.fn(async (data: { name: string; type: string }) => {
      const a = new MockActor(data);
      createdActors.push(a);
      return a;
    }),
  };
  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
    itempiles: {
      API: {
        ACTOR_CLASS_TYPE: 'npc',
        createItemPile: vi.fn(
          opts.createItemPileImpl ?? (async (options: any) => ({ tokenUuid: 'Scene.s1.Token.t1', actorUuid: options.actor ?? 'Actor.default' })),
        ),
        updateItemPile: vi.fn(async () => true),
        getActorFlagData: vi.fn(opts.getActorFlagDataImpl ?? ((_uuid: string) => ({ type: 'pile', enabled: true }))),
      },
    },
  };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).Actor;
});

describe('handleCreatePile — BUG-777 baseline named-pile templates', () => {
  for (const tmpl of BASELINE_TEMPLATES) {
    it(`creates a dedicated actor for the "${tmpl.type}" baseline template instead of throwing`, async () => {
      mockGlobals();
      const result: any = await handleCreatePile({
        action: 'create-pile',
        sceneId: 'Scene.s1',
        type: tmpl.type as any,
        pileActorName: tmpl.pileActorName,
        createDedicatedActor: true,
      } as any);

      expect(result.success).toBe(true);
      expect((globalThis as any).Actor.create).toHaveBeenCalledTimes(1);
      expect((globalThis as any).Actor.create).toHaveBeenCalledWith(
        { name: tmpl.pileActorName, type: 'npc' },
        { skipItems: true },
      );
      expect(createdActors).toHaveLength(1);
      expect(createdActors[0].deleted).toBe(false);
      expect(result.data.actorOwnership).toBe('dedicated');
    });
  }

  it('regression: pileActorName WITHOUT createDedicatedActor is an existing-actor lookup that still fails when the name does not resolve (the pre-fix template shape)', async () => {
    mockGlobals({
      createItemPileImpl: async () => {
        throw new Error('Could not find actor with name "Loot"');
      },
    });

    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'pile',
      pileActorName: 'Loot',
      // createDedicatedActor intentionally omitted — the BUG-777 defect shape
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('CREATE_PILE_ERROR');
    expect((globalThis as any).Actor.create).not.toHaveBeenCalled();
  });

  it('actorOwnership is "shared" when neither createDedicatedActor nor pileActorName is supplied', async () => {
    mockGlobals();
    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'pile',
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.actorOwnership).toBe('shared');
  });

  it('actorOwnership is "existing" when pileActorName is supplied without createDedicatedActor and resolution succeeds', async () => {
    mockGlobals({
      createItemPileImpl: async (options: any) => ({ tokenUuid: 'Scene.s1.Token.t1', actorUuid: `Actor.byname.${options.actor}` }),
    });
    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'pile',
      pileActorName: 'Pre-Existing NPC',
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.actorOwnership).toBe('existing');
  });
});

describe('handleCreatePile — BUG-779 rollback on post-creation failure', () => {
  // BUG-784: createItemPile returning bare `false` with the mocked GM still active (as it is
  // throughout this file's mockGlobals()) is classified as a business-condition veto (hook veto,
  // etc.), not assumed to be a GM disconnect — see false-return-classification.test.ts for the
  // dedicated GM-disconnect-still-yields-NO_ACTIVE_GM coverage of this same handler.
  it('rolls back the created actor when createItemPile returns false (hook veto, GM still active)', async () => {
    mockGlobals({ createItemPileImpl: async () => false });

    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'merchant',
      pileActorName: 'Old Fatsack',
      createDedicatedActor: true,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_OPERATION_VETOED');
    expect(result.error).not.toContain('NO_ACTIVE_GM');
    expect(createdActors).toHaveLength(1);
    expect(createdActors[0].deleted).toBe(true);
  });

  it('rolls back the created actor when createItemPile throws', async () => {
    mockGlobals({
      createItemPileImpl: async () => {
        throw new Error('upstream boom');
      },
    });

    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'vault',
      pileActorName: 'Party Vault',
      createDedicatedActor: true,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('CREATE_PILE_ERROR');
    expect(createdActors).toHaveLength(1);
    expect(createdActors[0].deleted).toBe(true);
  });

  it('rolls back the created actor when the post-write flagData verify fails', async () => {
    mockGlobals({ getActorFlagDataImpl: () => null });

    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'container',
      pileActorName: 'Chest',
      createDedicatedActor: true,
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('ITEM_PILES_CREATE_NOT_PERSISTED');
    expect(createdActors).toHaveLength(1);
    expect(createdActors[0].deleted).toBe(true);
  });

  it('does NOT roll back on a successful creation (positive control)', async () => {
    mockGlobals();

    const result: any = await handleCreatePile({
      action: 'create-pile',
      sceneId: 'Scene.s1',
      type: 'pile',
      pileActorName: 'Loot',
      createDedicatedActor: true,
    } as any);

    expect(result.success).toBe(true);
    expect(createdActors).toHaveLength(1);
    expect(createdActors[0].deleted).toBe(false);
    expect(createdActors[0].getFlag('warhammer-mcp', 'dedicatedPile')).toBe(true);
  });
});
