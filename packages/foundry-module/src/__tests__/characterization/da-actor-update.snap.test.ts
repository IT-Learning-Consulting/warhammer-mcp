// Characterization snapshot tests — FoundryDataAccess.updateActor write-path + notification summary.
//
// Phase 7 (R7.2) BYTE-IDENTITY ORACLE. updateActor's ~228-line notification-formatting block
// (formatFieldName / formatValue / isInternalField / flattenObject + assembly → updateSummary)
// is extracted to utils/actor-update-summary.ts:formatActorUpdateSummary() and the 123-line
// formatFieldName is decomposed into per-section helpers (Phase 7.3.2 / 7.6.2). The ONLY sanctioned
// non-verbatim tidy in the whole phase is that decomposition — so this net captures, on the MONOLITH:
//   (a) the actor.update(updateData, { skipExperienceChecks: true }) write args, and
//   (b) the EXACT summary string notify.updated receives,
// across every formatter branch (characteristics / status / details / experience / internal-field skip /
// {value:N} leaf extraction / 4-field cap + "and N more" / deletion-marker key / "various fields").
// After the split these snapshots MUST stay ZERO-diff (HC1 / HC3 / Risk 7.A).

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryDataAccess } from '../../data-access.js';
import { notify } from '../../notify.js';

vi.mock('../../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));

function installFoundryUtils() {
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...(globalThis as any).foundry?.utils,
      flattenObject(obj: any): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            const nested = this.flattenObject(v as any);
            for (const [nk, nv] of Object.entries(nested)) { result[`${k}.${nk}`] = nv; }
          } else { result[k] = v; }
        }
        return result;
      },
      getProperty(obj: any, path: string): any {
        return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
      },
    },
  };
}

function makeDA() {
  const da = new FoundryDataAccess();
  (da as any).validateFoundryState = () => {};
  return da;
}

// A mock actor with a known prior `system` so the before→after branch of the formatter is exercised.
function makeActor(system: Record<string, any>) {
  const actor: any = {
    id: 'actor-upd-001',
    name: 'Sigmar Recruit',
    uuid: 'Actor.actor-upd-001',
    system,
    update: vi.fn(async () => actor),
  };
  return actor;
}

function installGame(actor: any) {
  (globalThis as any).game = {
    ...(globalThis as any).game,
    actors: { get: (id: string) => (id === actor.id ? actor : null) },
  };
}

// Pull the summary string that notify.updated received (3rd arg .summary).
function lastSummary(): string | undefined {
  const calls = (notify.updated as any).mock.calls;
  return calls.at(-1)?.[2]?.summary;
}

describe('FoundryDataAccess.updateActor — formatter byte-identity oracle (Phase 7 R7.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installFoundryUtils();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('snapshot: characteristic + status + details + experience (dot-notation, before→after)', async () => {
    const actor = makeActor({
      characteristics: { ws: { value: 35 } },
      status: { wounds: { value: 12 } },
      details: { age: { value: 24 }, experience: { spent: 100 } },
    });
    installGame(actor);
    const da = makeDA();
    const result = await da.updateActor({
      actorId: actor.id,
      updateData: {
        'system.characteristics.ws.value': 40,
        'system.status.wounds.value': 10,
        'system.details.age.value': 25,
        'system.details.experience.spent': 150,
      },
      verifyPersistence: false,
    });

    // (b) byte-identity oracle: the exact human-readable summary the formatter produced.
    expect(lastSummary()).toBeDefined();
    expect(lastSummary()).toMatchSnapshot('summary');
    // (a) write args: single merged update with skipExperienceChecks (BUG-043/018).
    expect(actor.update.mock.calls).toMatchSnapshot('update-args');
    expect(actor.update.mock.calls[0]![1]).toEqual({ skipExperienceChecks: true });
    expect(result).toMatchSnapshot('result');
  });

  it('snapshot: internal fields (_id / flags / sort) are filtered from the summary', async () => {
    const actor = makeActor({ status: { fate: { value: 2 } } });
    installGame(actor);
    const da = makeDA();
    await da.updateActor({
      actorId: actor.id,
      updateData: {
        '_id': 'should-not-appear',
        'flags.world.note': 'hidden',
        'sort': 100,
        'system.status.fate.value': 3,
      },
      verifyPersistence: false,
    });
    expect(lastSummary()).toMatchSnapshot('summary');
  });

  it('snapshot: {value:N} leaf extraction via nested-object updateData', async () => {
    const actor = makeActor({ characteristics: { ws: { value: 30 } } });
    installGame(actor);
    const da = makeDA();
    await da.updateActor({
      actorId: actor.id,
      updateData: { system: { characteristics: { ws: { value: 45 } } } },
      verifyPersistence: false,
    });
    expect(lastSummary()).toMatchSnapshot('summary');
  });

  it('snapshot: >4 fields collapse to "and N more field(s)"', async () => {
    const actor = makeActor({
      characteristics: { ws: { value: 1 }, bs: { value: 1 }, s: { value: 1 }, t: { value: 1 }, i: { value: 1 }, ag: { value: 1 } },
    });
    installGame(actor);
    const da = makeDA();
    await da.updateActor({
      actorId: actor.id,
      updateData: {
        'system.characteristics.ws.value': 10,
        'system.characteristics.bs.value': 10,
        'system.characteristics.s.value': 10,
        'system.characteristics.t.value': 10,
        'system.characteristics.i.value': 10,
        'system.characteristics.ag.value': 10,
      },
      verifyPersistence: false,
    });
    expect(lastSummary()).toMatchSnapshot('summary');
  });

  it('snapshot: all-internal (whole-segment) keys → "various fields"', async () => {
    // isInternalField only filters whole segments — `_id`, `sort`, top-level `flags`, `folder`, etc.
    // (a dotted `flags.world.x` survives, see the prior case). All-internal here → empty → "various fields".
    const actor = makeActor({});
    installGame(actor);
    const da = makeDA();
    await da.updateActor({
      actorId: actor.id,
      updateData: { 'flags': { world: { x: 1 } }, '_id': 'y', 'sort': 5, 'folder': 'f1' },
      verifyPersistence: false,
    });
    expect(lastSummary()).toMatchSnapshot('summary');
  });

  it('snapshot: deletion-marker (.-=) key formatting + warnings array dispatch', async () => {
    const actor = makeActor({ status: { fortune: { value: 1 } } });
    installGame(actor);
    const da = makeDA();
    await da.updateActor({
      actorId: actor.id,
      updateData: {
        'system.status.fortune.value': 2,
        'system.skills.-=oldskill': null,
      },
      warnings: ['WARNING: Out-of-career advance costs double XP'],
      verifyPersistence: false,
    });
    expect(lastSummary()).toMatchSnapshot('summary');
    // The out-of-band warnings array is coerced + stripped of the "WARNING:" prefix → notify.warn.
    expect((notify.warn as any).mock.calls).toMatchSnapshot('warn-calls');
  });
});
