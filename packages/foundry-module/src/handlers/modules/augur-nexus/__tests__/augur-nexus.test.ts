// Module Integration v2 Phase 5 — Unit tests for module-augur-nexus dispatcher + guards.
//
// Deterministic: mocks globalThis.game (modules / user / scenes / settings) and injects a fake runtime
// import via globalThis.__augurNexusRuntimeImport so the PATH-A (module-import) ops are coverable without
// a live Foundry. No canvas render.
//
// Coverage (Rule 9 — each test encodes WHY the behavior matters):
//   1. Inactive augur-nexus → MODULE_NOT_ACTIVE for every action (guard returns, never throws).
//      WHY: a tool fired in a world without augur-nexus must fail with the typed token, not a crash.
//   2. delete-scene-branch / delete-custom-category WITHOUT confirm → AUGUR_NEXUS_CONFIRM_REQUIRED, and
//      the destructive module method is NEVER called. WHY: CCR-4 — irreversible ops must gate on confirm,
//      and the reject must precede any module call (a confirm AFTER the delete would be useless).
//   3. delete-scene-branch WITH confirm:true → calls api.deleteSceneBranch (which uses {confirmed:true},
//      skipping the module's DialogV2) and verifies the scene is gone. WHY: HC-v2-6 — we route through the
//      no-dialog path and NEVER call deleteSite (the deadlock path).
//   4. PATH-B raw write (set-global-scene-view-policy) writes the setting and the read-back PASSes; a
//      silent drop → AUGUR_NEXUS_NOT_PERSISTED. WHY: a global policy is a single awaited game.settings.set;
//      DP-16 must catch a non-persisting set.
//   5. PATH-A add-connection resolves BOTH targets via ConnectionTargetResolver and writes the edge into
//      connectionsGraph; covered for ALL 3 target kinds (nexus-scene / nexus-site / foundry-document).
//      WHY: acceptance criterion #3 — every connection kind must resolve to a node id and produce an edge.
//   6. A missing scene → AUGUR_NEXUS_TARGET_NOT_FOUND (before any module call). WHY: the success envelope
//      is only trustworthy if a bad target fails loud.
//   7. An unknown action → AUGUR_NEXUS_INVALID_INPUT (discriminatedUnion reject).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dispatchModuleAugurNexus } from '../augur-nexus.js';

const SCENE_ID = 'scene1';
const PARENT_ID = 'sceneParent';

function makeSceneDoc(id: string, name: string, flags: Record<string, any> = {}) {
  const doc: any = {
    id,
    name,
    getFlag: (scope: string, key: string) => (scope === 'augur-nexus' ? flags[key] : undefined),
  };
  return doc;
}

function makeGame(opts: {
  active: boolean;
  isGM?: boolean;
  scenes?: Record<string, any>;
  settings?: { get: any; set: any };
}) {
  const scenes = opts.scenes ?? {};
  return {
    modules: {
      get: (id: string) =>
        id === 'augur-nexus'
          ? opts.active
            ? { active: true, title: 'Augur: Nexus', version: '1.1.6' }
            : undefined
          : undefined,
    },
    user: { isGM: opts.isGM ?? true, id: 'gm1' },
    scenes: {
      get: (id: string) => scenes[id],
      contents: Object.values(scenes),
    },
    settings: opts.settings,
  };
}

beforeEach(() => {
  (globalThis as any).game = undefined;
});
afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).__augurNexusRuntimeImport;
});

// ── 1. Inactive module guard ────────────────────────────────────────────────────

describe('module-active guard', () => {
  it('inactive augur-nexus → MODULE_NOT_ACTIVE on a write action (returns, never throws)', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleAugurNexus({ action: 'set-scene-parent', sceneId: SCENE_ID, parentSceneId: PARENT_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
    expect(res.error).toContain('augur-nexus');
  });

  it('inactive augur-nexus → MODULE_NOT_ACTIVE on a read action too', async () => {
    (globalThis as any).game = makeGame({ active: false });
    const res: any = await dispatchModuleAugurNexus({ action: 'get-connections-graph' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('MODULE_NOT_ACTIVE');
  });
});

// ── 2/3. Confirm-gated deletes ────────────────────────────────────────────────────

describe('confirm-gated deletes (CCR-4)', () => {
  it('delete-scene-branch WITHOUT confirm → AUGUR_NEXUS_CONFIRM_REQUIRED, module never called', async () => {
    const scene = makeSceneDoc(SCENE_ID, 'Doomed');
    (globalThis as any).game = makeGame({ active: true, scenes: { [SCENE_ID]: scene } });
    const deleteSceneBranch = vi.fn();
    (globalThis as any).__augurNexusRuntimeImport = () => ({ deleteSceneBranch });
    const res: any = await dispatchModuleAugurNexus({ action: 'delete-scene-branch', sceneId: SCENE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('AUGUR_NEXUS_CONFIRM_REQUIRED');
    expect(deleteSceneBranch).not.toHaveBeenCalled();
  });

  it('delete-custom-category WITHOUT confirm → AUGUR_NEXUS_CONFIRM_REQUIRED', async () => {
    (globalThis as any).game = makeGame({ active: true });
    const res: any = await dispatchModuleAugurNexus({ action: 'delete-custom-category', categoryId: 'faction' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('AUGUR_NEXUS_CONFIRM_REQUIRED');
  });

  it('delete-scene-branch WITH confirm:true → api.deleteSceneBranch (no dialog) + scene-gone verify', async () => {
    const scenes: Record<string, any> = { [SCENE_ID]: makeSceneDoc(SCENE_ID, 'Doomed') };
    (globalThis as any).game = makeGame({ active: true, scenes });
    const deleteSceneBranch = vi.fn(async (_scene: any) => {
      delete scenes[SCENE_ID]; // simulate the cascade delete
      return true;
    });
    const deleteSite = vi.fn(); // the DEADLOCK path — must never be touched
    (globalThis as any).__augurNexusRuntimeImport = (spec: string) =>
      spec.includes('api/index.js') ? { deleteSceneBranch } : { SiteDeletionManager: { deleteSite } };
    const res: any = await dispatchModuleAugurNexus({ action: 'delete-scene-branch', sceneId: SCENE_ID, confirm: true });
    expect(res.success).toBe(true);
    expect(res.data.deleted).toBe(true);
    expect(deleteSceneBranch).toHaveBeenCalledTimes(1);
    expect(deleteSite).not.toHaveBeenCalled();
  });
});

// ── 4. PATH-B raw setting write ──────────────────────────────────────────────────

describe('path-B global policy write (raw game.settings.set)', () => {
  it('set-global-scene-view-policy writes the setting and the read-back PASSes', async () => {
    const store: Record<string, any> = {};
    const settings = {
      get: (_s: string, k: string) => store[k],
      set: vi.fn(async (_s: string, k: string, v: any) => {
        store[k] = v;
      }),
    };
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleAugurNexus({ action: 'set-global-scene-view-policy', policy: 'explicit' });
    expect(res.success).toBe(true);
    expect(res.data.policy).toBe('explicit');
    expect(settings.set).toHaveBeenCalledWith('augur-nexus', 'playerSceneViewing', 'explicit');
  });

  it('a silent setting drop → AUGUR_NEXUS_NOT_PERSISTED (DP-16 catches it)', async () => {
    const settings = {
      get: (_s: string, _k: string) => 'all', // never reflects the set
      set: vi.fn(async () => undefined),
    };
    (globalThis as any).game = makeGame({ active: true, settings });
    const res: any = await dispatchModuleAugurNexus({ action: 'set-global-nexus-visibility-policy', policy: 'explicit' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('AUGUR_NEXUS_NOT_PERSISTED');
  });
});

// ── 5. PATH-A add-connection — all 3 target kinds resolve + edge persists ─────────

describe('add-connection resolves all 3 target kinds', () => {
  function makeResolverAndStore() {
    const graph = { version: 1, nodes: {} as Record<string, any>, edges: {} as Record<string, any>, customCategories: {} };
    const ConnectionTargetResolver = {
      fromSceneReference: ({ sceneId }: any) => ({ id: `nexus-scene:${sceneId}`, kind: 'nexus-scene', sceneId, name: 'S', category: 'place' }),
      fromSiteReference: ({ parentSceneId, siteId }: any) => ({ id: `nexus-site:${parentSceneId}:${siteId}`, kind: 'nexus-site', parentSceneId, siteId, name: 'Site', category: 'place' }),
      fromUuid: async (uuid: string, { category }: any) => ({ id: `foundry:${uuid}`, kind: 'foundry-document', uuid, name: 'Doc', category: category ?? 'npc' }),
      getNodeId: (t: any) => t?.id ?? '',
    };
    const ConnectionStore = {
      addConnection: vi.fn(async (src: any, rel: any, _opts: any) => {
        const edge = { id: 'edge1', sourceNodeId: src.id, targetNodeId: rel.id, category: 'npc', role: 'NPC', note: '' };
        graph.nodes[src.id] = src;
        graph.nodes[rel.id] = rel;
        graph.edges[edge.id] = edge;
        return edge;
      }),
      getGraph: () => graph,
    };
    return { ConnectionTargetResolver, ConnectionStore, graph };
  }

  function inject(resolver: any, store: any) {
    (globalThis as any).__augurNexusRuntimeImport = (spec: string) => {
      if (spec.includes('ConnectionTargetResolver')) return { ConnectionTargetResolver: resolver };
      if (spec.includes('ConnectionStore')) return { ConnectionStore: store };
      return {};
    };
  }

  it('nexus-scene ↔ foundry-document → edge with both node ids', async () => {
    const { ConnectionTargetResolver, ConnectionStore } = makeResolverAndStore();
    (globalThis as any).game = makeGame({ active: true });
    inject(ConnectionTargetResolver, ConnectionStore);
    const res: any = await dispatchModuleAugurNexus({
      action: 'add-connection',
      source: { kind: 'nexus-scene', sceneId: 'sc1' },
      related: { kind: 'foundry-document', uuid: 'Actor.abc' },
      category: 'faction',
    });
    expect(res.success).toBe(true);
    expect(res.data.sourceNodeId).toBe('nexus-scene:sc1');
    expect(res.data.targetNodeId).toBe('foundry:Actor.abc');
    expect(ConnectionStore.addConnection).toHaveBeenCalledTimes(1);
  });

  it('nexus-site source resolves via fromSiteReference', async () => {
    const { ConnectionTargetResolver, ConnectionStore } = makeResolverAndStore();
    const spy = vi.spyOn(ConnectionTargetResolver, 'fromSiteReference');
    (globalThis as any).game = makeGame({ active: true });
    inject(ConnectionTargetResolver, ConnectionStore);
    const res: any = await dispatchModuleAugurNexus({
      action: 'add-connection',
      source: { kind: 'nexus-site', parentSceneId: 'p1', siteId: 's9' },
      related: { kind: 'nexus-scene', sceneId: 'sc2' },
    });
    expect(res.success).toBe(true);
    expect(spy).toHaveBeenCalledWith({ parentSceneId: 'p1', siteId: 's9' });
    expect(res.data.sourceNodeId).toBe('nexus-site:p1:s9');
  });

  it('foundry-document source resolves via fromUuid (async)', async () => {
    const { ConnectionTargetResolver, ConnectionStore } = makeResolverAndStore();
    const spy = vi.spyOn(ConnectionTargetResolver, 'fromUuid');
    (globalThis as any).game = makeGame({ active: true });
    inject(ConnectionTargetResolver, ConnectionStore);
    const res: any = await dispatchModuleAugurNexus({
      action: 'add-connection',
      source: { kind: 'foundry-document', uuid: 'JournalEntry.def', category: 'place' },
      related: { kind: 'nexus-scene', sceneId: 'sc3' },
    });
    expect(res.success).toBe(true);
    expect(spy).toHaveBeenCalledWith('JournalEntry.def', { category: 'place' });
    expect(res.data.sourceNodeId).toBe('foundry:JournalEntry.def');
  });
});

// ── 6. Target resolution failure ──────────────────────────────────────────────────

describe('target resolution', () => {
  it('set-scene-parent with a missing scene → AUGUR_NEXUS_TARGET_NOT_FOUND (before any module call)', async () => {
    (globalThis as any).game = makeGame({ active: true, scenes: {} });
    const res: any = await dispatchModuleAugurNexus({ action: 'set-scene-parent', sceneId: 'nope', parentSceneId: PARENT_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('AUGUR_NEXUS_TARGET_NOT_FOUND');
  });
});

// ── 7. discriminatedUnion rejects an off-list action ────────────────────────────

describe('schema discriminatedUnion', () => {
  it('an unknown action is rejected at parse → AUGUR_NEXUS_INVALID_INPUT', async () => {
    (globalThis as any).game = makeGame({ active: true });
    const res: any = await dispatchModuleAugurNexus({ action: 'frobnicate', sceneId: SCENE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('AUGUR_NEXUS_INVALID_INPUT');
  });

  it('a write action fired by a non-GM → AUGUR_NEXUS_ACCESS_DENIED', async () => {
    (globalThis as any).game = makeGame({ active: true, isGM: false });
    const res: any = await dispatchModuleAugurNexus({ action: 'set-root-scene', sceneId: SCENE_ID });
    expect(res.success).toBe(false);
    expect(res.error).toContain('AUGUR_NEXUS_ACCESS_DENIED');
  });
});
