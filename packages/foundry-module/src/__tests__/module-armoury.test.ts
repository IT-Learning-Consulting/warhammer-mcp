// Phase 10 module_integration_v1 — Unit test for module-armoury dispatcher (Forien's Armoury).
//
// Deterministic: mocks globalThis.game.modules + game.modules.get('forien-armoury').api (ADR-9.1
// Class-1 accessor) — no live Foundry. Branches:
//   - module inactive            → MODULE_NOT_ACTIVE
//   - non-GM on a write          → ARMOURY_ACCESS_DENIED
//   - bad input (missing field)  → ARMOURY_INVALID_INPUT (parse wrapped in envelope)
//   - missing confirm on equip   → ARMOURY_INVALID_INPUT
//   - actor not found            → ACTOR_NOT_FOUND
//   - API unbound                → ARMOURY_API_UNAVAILABLE
//   - get-me happy               → live ME values
//   - spend-me below 0           → willTriggerEnduranceTest:true
//   - create-scroll world        → Item.create({type:'forien-armoury.scroll'}, {skipAsk:true})
//   - repair-item                → DP-16 verified write
//   - equip-grimoire confirmed   → grants spells
//   - read-combat-fatigue        → combatant flags

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { dispatchModuleArmoury } from '../handlers/modules/forien-armoury/armoury.js';

const MODULE_ID = 'forien-armoury';

function setGame(opts: {
  active: boolean;
  isGM: boolean;
  api?: any;
  actor?: any;
  combat?: any;
  itemCreate?: any;
}) {
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === MODULE_ID ? { active: opts.active, api: opts.api } : { active: true }) },
    user: { isGM: opts.isGM },
    actors: { get: () => opts.actor },
    combat: opts.combat,
    combats: { get: () => opts.combat },
    settings: { get: () => undefined, set: vi.fn().mockResolvedValue(undefined) },
    packs: { get: () => undefined },
  };
  (globalThis as any).Item = { create: opts.itemCreate ?? vi.fn() };
  (globalThis as any).canvas = { tokens: { get: () => undefined } };
}

describe('dispatchModuleArmoury', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
    (globalThis as any).Item = undefined;
    (globalThis as any).fromUuidSync = undefined;
    (globalThis as any).canvas = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when forien-armoury is inactive', async () => {
    setGame({ active: false, isGM: true });
    const r = await dispatchModuleArmoury({ action: 'get-me', actorId: 'Actor.x' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('returns ARMOURY_ACCESS_DENIED for a non-GM on a write action', async () => {
    setGame({ active: true, isGM: false });
    const r = await dispatchModuleArmoury({ action: 'spend-me', actorId: 'Actor.x', amount: 3 });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/ARMOURY_ACCESS_DENIED/);
  });

  it('returns ARMOURY_INVALID_INPUT on bad input (missing amount)', async () => {
    setGame({ active: true, isGM: true });
    const r = await dispatchModuleArmoury({ action: 'spend-me', actorId: 'Actor.x' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^ARMOURY_INVALID_INPUT:/);
  });

  it('returns ARMOURY_INVALID_INPUT when equip-grimoire is missing confirm:true', async () => {
    setGame({ active: true, isGM: true });
    const r = await dispatchModuleArmoury({ action: 'equip-grimoire', actorId: 'A', itemId: 'I' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^ARMOURY_INVALID_INPUT:/);
  });

  it('returns ACTOR_NOT_FOUND when the actorId resolves to no actor', async () => {
    setGame({ active: true, isGM: true, actor: undefined, api: {} });
    const r = await dispatchModuleArmoury({ action: 'get-me', actorId: 'nope' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^ACTOR_NOT_FOUND:/);
  });

  it('returns ARMOURY_API_UNAVAILABLE (via handler error) when the api is unbound', async () => {
    setGame({ active: true, isGM: true, api: undefined, actor: { name: 'Caster', getFlag: () => ({}) } });
    const r = await dispatchModuleArmoury({ action: 'get-me', actorId: 'A' });
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/ARMOURY_(API_UNAVAILABLE|HANDLER_ERROR)/);
  });

  it('get-me returns live ME values from castingFatigue.getMagicalEnduranceData', async () => {
    const api = { castingFatigue: { getMagicalEnduranceData: () => ({ value: 12, regen: 3, maximum: 18, lastRegen: 100, virtual: false }) } };
    setGame({ active: true, isGM: true, api, actor: { name: 'Caster', getFlag: () => ({ value: 12 }) } });
    const r: any = await dispatchModuleArmoury({ action: 'get-me', actorId: 'A' });
    expect(r.success).toBe(true);
    expect(r.data.value).toBe(12);
    expect(r.data.maximum).toBe(18);
    expect(r.data.virtual).toBe(false);
  });

  it('spend-me CROSSING below 0 persists via setFlag + warns, does NOT call the blocking API', async () => {
    // Crossing 0 makes the real API open a blocking Endurance dialog (live timeout) — the handler
    // writes the flag directly instead and returns a resolve-on-sheet note.
    const spend = vi.fn().mockResolvedValue(undefined);
    const setFlag = vi.fn().mockResolvedValue(undefined);
    const api = { castingFatigue: { getMagicalEnduranceData: () => ({ value: 3 }), spendMagicalEndurance: spend } };
    setGame({ active: true, isGM: true, api, actor: { name: 'Caster', getFlag: () => ({ value: 3 }), setFlag } });
    const r: any = await dispatchModuleArmoury({ action: 'spend-me', actorId: 'A', amount: 5 });
    expect(r.success).toBe(true);
    expect(r.data.previousValue).toBe(3);
    expect(r.data.value).toBe(-2);
    expect(r.data.willTriggerEnduranceTest).toBe(true);
    expect(r.data.note).toMatch(/resolve the Endurance test/i);
    expect(spend).not.toHaveBeenCalled(); // the blocking API is NOT invoked on a crossing spend
    expect(setFlag).toHaveBeenCalledWith('forien-armoury', 'magical-endurance', expect.objectContaining({ value: -2 }));
  });

  it('spend-me NOT crossing 0 calls the real spendMagicalEndurance API', async () => {
    const spend = vi.fn().mockResolvedValue(undefined);
    let cur = 10;
    const api = {
      castingFatigue: {
        getMagicalEnduranceData: () => ({ value: cur }),
        spendMagicalEndurance: (_a: any, n: number) => { cur -= n; return spend(_a, n); },
      },
    };
    setGame({ active: true, isGM: true, api, actor: { name: 'Caster', getFlag: () => ({ value: cur }), setFlag: vi.fn() } });
    const r: any = await dispatchModuleArmoury({ action: 'spend-me', actorId: 'A', amount: 4 });
    expect(r.success).toBe(true);
    expect(r.data.value).toBe(6);
    expect(r.data.willTriggerEnduranceTest).toBe(false);
    expect(spend).toHaveBeenCalledWith(expect.anything(), 4);
  });

  it('create-scroll (world scope) calls Item.create with the scroll type and skipAsk', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'scroll1', name: 'Magic Scroll', system: { spellUuid: 'Spell.x', quantity: { value: 1 }, language: 'Magick', canUse: false } });
    setGame({ active: true, isGM: true, api: {}, itemCreate: create });
    const r: any = await dispatchModuleArmoury({ action: 'create-scroll', spellUuid: 'Spell.x' });
    expect(r.success).toBe(true);
    expect(r.data.itemId).toBe('scroll1');
    expect(r.data.scope).toBe('world');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'forien-armoury.scroll' }),
      expect.objectContaining({ skipAsk: true }),
    );
  });

  it('repair-item writes the damage field and DP-16-verifies the read-back', async () => {
    const item: any = {
      id: 'I', name: 'Mail Coat', type: 'armour',
      system: { APdamage: { body: 2 } },
      update: vi.fn().mockImplementation(async (patch: any) => { item.system.APdamage.body = patch['system.APdamage.body']; }),
    };
    const actor = { name: 'Hero', items: { get: () => item } };
    setGame({ active: true, isGM: true, api: {}, actor });
    const r: any = await dispatchModuleArmoury({ action: 'repair-item', actorId: 'A', itemId: 'I', location: 'body', newValue: 0 });
    expect(r.success).toBe(true);
    expect(r.data.previousValue).toBe(2);
    expect(r.data.newValue).toBe(0);
    expect(item.update).toHaveBeenCalledWith({ 'system.APdamage.body': 0 });
  });

  it('equip-grimoire (confirmed) writes equipped:true and reports granted spells', async () => {
    const grantedSpell = { id: 's1', name: 'Dart', type: 'spell', flags: { 'forien-armoury': { sourceGrimoire: 'G' } } };
    const grimoire: any = {
      id: 'G', name: 'Grey Grimoire', type: 'forien-armoury.grimoire',
      update: vi.fn().mockResolvedValue(undefined),
    };
    const actor = {
      name: 'Wizard',
      items: { get: (id: string) => (id === 'G' ? grimoire : undefined) },
      itemTypes: { spell: [grantedSpell] },
    };
    setGame({ active: true, isGM: true, api: {}, actor });
    const r: any = await dispatchModuleArmoury({ action: 'equip-grimoire', actorId: 'A', itemId: 'G', confirm: true });
    expect(r.success).toBe(true);
    expect(r.data.equipped).toBe(true);
    expect(r.data.grantedSpells).toEqual([{ id: 's1', name: 'Dart' }]);
    expect(grimoire.update).toHaveBeenCalledWith({ 'system.equipped.value': true });
  });

  it('read-combat-fatigue reports combatant countdown flags', async () => {
    const combatant = { id: 'C1', name: 'Brawler', getFlag: (_m: string, k: string) => (k === 'roundsBeforeTest' ? 4 : null) };
    const combat = { id: 'combat1', combatants: [combatant], getFlag: () => ({}) };
    setGame({ active: true, isGM: true, api: {}, combat });
    const r: any = await dispatchModuleArmoury({ action: 'read-combat-fatigue', combatId: 'combat1' });
    expect(r.success).toBe(true);
    expect(r.data.combatants[0].roundsBeforeTest).toBe(4);
    expect(r.data.combatants[0].name).toBe('Brawler');
  });
});
