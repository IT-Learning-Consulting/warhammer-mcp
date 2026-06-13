// Module Integration v1 Phase 14 — Unit test for module-patrol dispatcher (patrol).
//
// Deterministic: mocks globalThis.game.modules + game.user + game.patrol + game.scenes + fromUuid.
// Branches:
//   - module inactive               → MODULE_NOT_ACTIVE
//   - non-GM on a write             → PATROL_ACCESS_DENIED
//   - enable-token path w/o Drawing → PATROL_PATH_DRAWING_MISSING (§2.4 write-order guard)
//   - enable-token wander happy     → enablePatrol flag set
//   - disable-token                 → all 7 flags unset
//   - toggle-global missing confirm → PATROL_INVALID_INPUT (CCR-4)
//   - toggle-global happy           → game.patrol._patrol/_pathPatrol.started set
//   - apply-undetectable            → toggleStatusEffect called

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModulePatrol } from '../handlers/modules/patrol/patrol.js';

function makeToken(name: string, scene: any) {
  const flags: Record<string, any> = {};
  return {
    name,
    parent: scene,
    getFlag: (scope: string, key: string) => flags[`${scope}.${key}`],
    setFlag: vi.fn(async (scope: string, key: string, val: any) => {
      flags[`${scope}.${key}`] = val;
    }),
    unsetFlag: vi.fn(async (scope: string, key: string) => {
      delete flags[`${scope}.${key}`];
    }),
    _flags: flags,
  };
}

let TOKENS: Record<string, any> = {};
let ACTORS: Record<string, any> = {};

function setGame(opts: { active: boolean; isGM?: boolean; patrol?: any; scene?: any }) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === 'patrol' ? { active: opts.active } : { active: true }) },
    user: { isGM: opts.isGM ?? true },
    patrol: opts.patrol,
    scenes: { get: (id: string) => (opts.scene && opts.scene.id === id ? opts.scene : undefined) },
  };
  (globalThis as any).fromUuid = vi.fn(async (uuid: string) => TOKENS[uuid] ?? ACTORS[uuid]);
}

beforeEach(() => {
  (globalThis as any).game = undefined;
  (globalThis as any).fromUuid = undefined;
  TOKENS = {};
  ACTORS = {};
});

describe('dispatchModulePatrol', () => {
  it('returns MODULE_NOT_ACTIVE when inactive', async () => {
    setGame({ active: false });
    const r = (await dispatchModulePatrol({ action: 'get-token-config', tokenUuid: 't1' })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('MODULE_NOT_ACTIVE');
  });

  it('set-path rejects a pathName without the substring "Path" (engine filter)', async () => {
    const scene = { id: 's1', name: 'Crypt', drawings: { contents: [], get: () => undefined }, createEmbeddedDocuments: vi.fn() };
    setGame({ active: true, scene });
    const r = (await dispatchModulePatrol({ action: 'set-path', sceneId: 's1', pathName: 'GuardRoute', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('PATROL_PATH_NAME_INVALID');
    expect(scene.createEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('configure writes world settings', async () => {
    const sets: Record<string, any> = {};
    setGame({ active: true });
    (globalThis as any).game.settings = { get: (m: string, k: string) => sets[k], set: vi.fn(async (m: string, k: string, v: any) => { sets[k] = v; }) };
    const r = (await dispatchModulePatrol({ action: 'configure', patrolDelay: 3000, patrolDiagonals: true })) as any;
    expect(r.success).toBe(true);
    expect(sets.patrolDelay).toBe(3000);
    expect(sets.patrolDiagonals).toBe(true);
  });

  it('denies a write to a non-GM', async () => {
    setGame({ active: true, isGM: false });
    const r = (await dispatchModulePatrol({ action: 'disable-token', tokenUuids: ['t1'] })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('PATROL_ACCESS_DENIED');
  });

  it('refuses path mode when the named Drawing is missing (§2.4)', async () => {
    const scene = { id: 's1', name: 'Crypt', drawings: { contents: [] } };
    const token = makeToken('Guard', scene);
    TOKENS['t1'] = token;
    setGame({ active: true, scene });
    const r = (await dispatchModulePatrol({ action: 'enable-token', tokenUuids: ['t1'], mode: 'path', patrolPathName: 'Beat A' })) as any;
    expect(r.success).toBe(true); // batch result — per-token failure inside
    expect(r.data.results[0].ok).toBe(false);
    expect(r.data.results[0].error).toContain('PATROL_PATH_DRAWING_MISSING');
    expect(token.setFlag).not.toHaveBeenCalled();
  });

  it('enable-token wander sets enablePatrol', async () => {
    const scene = { id: 's1', name: 'Crypt', drawings: { contents: [] } };
    const token = makeToken('Wanderer', scene);
    TOKENS['t1'] = token;
    setGame({ active: true, scene });
    const r = (await dispatchModulePatrol({ action: 'enable-token', tokenUuids: ['t1'], mode: 'wander', spotting: true })) as any;
    expect(r.success).toBe(true);
    expect(token.setFlag).toHaveBeenCalledWith('patrol', 'enablePatrol', true);
    expect(token.setFlag).toHaveBeenCalledWith('patrol', 'enableSpotting', true);
  });

  it('disable-token clears all 7 patrol flags', async () => {
    const token = makeToken('Guard', {});
    TOKENS['t1'] = token;
    setGame({ active: true });
    const r = (await dispatchModulePatrol({ action: 'disable-token', tokenUuids: ['t1'] })) as any;
    expect(r.success).toBe(true);
    const cleared = token.unsetFlag.mock.calls.map((c: any[]) => c[1]);
    for (const f of ['enablePatrol', 'enableSpotting', 'makePatroller', 'multiPath', 'patrolPathName', 'pathNodeIndex', 'pathID']) {
      expect(cleared).toContain(f);
    }
  });

  it('toggle-global requires confirm:true', async () => {
    setGame({ active: true, patrol: { _patrol: {}, _pathPatrol: {} } });
    const r = (await dispatchModulePatrol({ action: 'toggle-global', started: true })) as any;
    expect(r.success).toBe(false);
    expect(r.error).toContain('PATROL_INVALID_INPUT');
  });

  it('toggle-global sets both runtime started flags', async () => {
    const patrol = { _patrol: { started: false }, _pathPatrol: { started: false } };
    setGame({ active: true, patrol });
    const r = (await dispatchModulePatrol({ action: 'toggle-global', started: true, confirm: true })) as any;
    expect(r.success).toBe(true);
    expect(patrol._patrol.started).toBe(true);
    expect(patrol._pathPatrol.started).toBe(true);
  });

  it('apply-undetectable creates the ActiveEffect directly (status id is dropped by wfrp4e)', async () => {
    const created: any[] = [];
    const actor = {
      name: 'Shadow',
      effects: { contents: [] as any[] },
      createEmbeddedDocuments: vi.fn(async (_t: string, data: any[]) => {
        created.push(...data);
      }),
      deleteEmbeddedDocuments: vi.fn(async () => {}),
    };
    ACTORS['a1'] = actor;
    setGame({ active: true });
    const r = (await dispatchModulePatrol({ action: 'apply-undetectable', actorUuid: 'a1', active: true })) as any;
    expect(r.success).toBe(true);
    expect(actor.createEmbeddedDocuments).toHaveBeenCalled();
    expect(created[0].statuses).toContain('patrolundetectable');
  });
});
