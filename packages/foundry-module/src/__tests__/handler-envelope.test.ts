// Phase 3b — BUG-015 / CCR-1 / R3: every handler emits a uniform envelope.
// One test per category (read, actor-write, item-write, journal-write,
// rolltable-write, scene-read). Stubs dataAccess; asserts full envelope shape.

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../queries.js';
import { expectEnvelope } from './test-utils.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).game = {
    ...(globalThis as any).game,
    system: { id: 'wfrp4e' },
    user: { isGM: true, id: 'gm', name: 'GM' },
    tables: new Map(),
    actors: new Map(),
  };
});

describe('handler envelope — read (handleListActors)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).listActors = async () => [
      { id: 'a1', name: 'Hero' },
    ];
    const result = await (qh as any).handleListActors({});
    expectEnvelope<Array<{ id: string; name: string }>>(result);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('a1');
  });
});

describe('handler envelope — scene umbrella (handleScene action=list)', () => {
  // Phase 4 mcp_crud_expansion — 5 legacy scene handlers folded into the
  // `scene` umbrella. The list action is the simplest envelope test because
  // it delegates to dataAccess.listScenes (stubbable) rather than touching
  // the live game.scenes collection. Other actions (create/update/delete/
  // clone/activate/view/thumbnail/get) exercise Foundry document calls and
  // are covered by live smoke at validate stage.
  it('returns { success: true, data } on action=list', async () => {
    const qh = makeHandlers();
    (qh.scenePlacement as any).listScenes = async () => [
      { id: 's1', name: 'Stage', active: true, navigation: true },
    ];
    const result = await (qh as any).handleScene({ action: 'list' });
    expectEnvelope<{ success: true; scenes: Array<{ id: string; name: string }> }>(result);
    expect(result.data.scenes).toHaveLength(1);
    expect(result.data.scenes[0].id).toBe('s1');
  });
});

describe('handler envelope — actor-write (handleUpdateActor)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.actorService as any).updateActor = async () => ({
      actorId: 'a1',
      updated: true,
    });
    const result = await (qh as any).handleUpdateActor({
      actorId: 'a1',
      updateData: { name: 'Renamed' },
    });
    expectEnvelope<{ actorId: string; updated: boolean }>(result);
    expect(result.data.updated).toBe(true);
  });
});

describe('handler envelope — item-write (handleCreateItem)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.itemService as any).createItem = async () => ({
      itemId: 'i1',
      itemName: 'Sword',
    });
    // Phase 5: createItem now takes a destination discriminator (actor|world) +
    // itemData. Legacy {actorId, itemData} shape is gone.
    const result = await (qh as any).handleCreateItem({
      itemData: { name: 'Sword', type: 'weapon' },
      destination: { type: 'actor', actorId: 'a1' },
    });
    expectEnvelope<{ itemId: string; itemName: string }>(result);
    expect(result.data.itemId).toBe('i1');
  });
});

// Phase 4b — envelope tests for 11 new handlers.

describe('handler envelope — combat-read (handleGetCombat)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.combat as any).getCombat = async () => ({ id: 'c1', round: 1, turn: 0 });
    const result = await (qh as any).handleGetCombat({});
    expectEnvelope<{ id: string }>(result);
    expect(result.data.id).toBe('c1');
  });
});

describe('handler envelope — combat-read (handleListCombatants)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.combat as any).listCombatants = async () => [{ id: 'co1', name: 'Hero' }];
    const result = await (qh as any).handleListCombatants({});
    expectEnvelope<Array<{ id: string; name: string }>>(result);
    expect(result.data[0].id).toBe('co1');
  });
});

describe('handler envelope — combat-write (handleAdvanceCombat)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.combat as any).advanceCombat = async () => ({ combatId: 'c1', round: 1, turn: 1, combatantId: 'co2' });
    const result = await (qh as any).handleAdvanceCombat({ action: 'next' });
    expectEnvelope<{ combatantId: string }>(result);
    expect(result.data.combatantId).toBe('co2');
  });
});

describe('handler envelope — combat-write (handleAddCombatants)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.combat as any).addCombatants = async () => ({ added: ['co3'] });
    const result = await (qh as any).handleAddCombatants({ actorIds: ['a1'] });
    expectEnvelope<{ added: string[] }>(result);
    expect(result.data.added).toEqual(['co3']);
  });
});

describe('handler envelope — combat-write (handleRemoveCombatants)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.combat as any).removeCombatants = async () => ({ removed: ['co3'] });
    const result = await (qh as any).handleRemoveCombatants({ combatantIds: ['co3'] });
    expectEnvelope<{ removed: string[] }>(result);
    expect(result.data.removed).toEqual(['co3']);
  });
});

describe('handler envelope — combat-write (handleEndCombat)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.combat as any).endCombat = async () => ({ ended: 'c1' });
    const result = await (qh as any).handleEndCombat({});
    expectEnvelope<{ ended: string }>(result);
    expect(result.data.ended).toBe('c1');
  });
});

describe('handler envelope — damage-write (handleApplyDamage)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    const snap = {
      wounds: { value: 10, max: 12 },
      criticalWounds: { value: 0, max: 2 },
      fate: { value: 2 },
      fortune: { value: 2 },
      advantage: { value: 0 },
      conditions: [],
    };
    (qh.dataAccess as any).applyDamage = async () => ({
      actorId: 'a1',
      damage: { amount: 0, damageType: 'NORMAL' },
      before: snap,
      after: snap,
    });
    const result = await (qh as any).handleApplyDamage({ actorId: 'a1', amount: 0 });
    expectEnvelope<{ actorId: string }>(result);
    expect(result.data.actorId).toBe('a1');
  });
});

describe('handler envelope — condition-write (handleApplyCondition)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.conditions as any).applyCondition = async () => ({ actorId: 'a1', conditionKey: 'prone', stackCount: 1 });
    const result = await (qh as any).handleApplyCondition({ actorId: 'a1', conditionKey: 'prone' });
    expectEnvelope<{ stackCount: number }>(result);
    expect(result.data.stackCount).toBe(1);
  });
});

describe('handler envelope — condition-write (handleRemoveCondition)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.conditions as any).removeCondition = async () => ({ actorId: 'a1', conditionKey: 'prone', remainingCount: 0 });
    const result = await (qh as any).handleRemoveCondition({ actorId: 'a1', conditionKey: 'prone' });
    expectEnvelope<{ remainingCount: number }>(result);
    expect(result.data.remainingCount).toBe(0);
  });
});

describe('handler envelope — condition-read (handleListConditions)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.conditions as any).listConditions = async () => [{ conditionKey: 'prone', value: 1, effectId: 'e1' }];
    const result = await (qh as any).handleListConditions({ actorId: 'a1' });
    expectEnvelope<Array<{ conditionKey: string }>>(result);
    expect(result.data[0].conditionKey).toBe('prone');
  });
});

describe('handler envelope — effects-read (handleListActiveEffects)', () => {
  it('returns { success: true, data } on success', async () => {
    const qh = makeHandlers();
    (qh.dataAccess as any).listActiveEffects = async () => [
      { id: 'e1', name: 'Prone', img: null, statuses: ['prone'], disabled: false, duration: {}, origin: null, changes: [] },
    ];
    const result = await (qh as any).handleListActiveEffects({ actorId: 'a1' });
    expectEnvelope<Array<{ id: string }>>(result);
    expect(result.data[0].id).toBe('e1');
  });
});
