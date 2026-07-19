import { beforeEach, describe, expect, it } from 'vitest';
import { getToken } from '../handlers/token.js';

const CHAR_KEYS = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];

function makeActor() {
  const characteristics = Object.fromEntries(CHAR_KEYS.map((key) => [key, {
    value: key === 'ws' ? 72 : 30,
    bonus: key === 'ws' ? 7 : 3,
  }]));
  const items = new Map<string, any>();
  items.set('skill', {
    id: 'skill', type: 'skill', name: 'Melee (Basic)',
    system: { characteristic: { value: 'ws' }, advances: { value: 10 }, total: { value: 82 } },
  });
  items.set('trait', {
    id: 'trait', type: 'trait', name: 'Night Vision', system: { specification: { value: '' } },
  });
  items.set('weapon', {
    id: 'weapon', type: 'weapon', name: 'Scarred Axe', attackType: 'melee', Damage: 9, Range: null,
    system: {
      equipped: { value: true }, weaponGroup: { value: 'basic' },
      qualities: { value: [{ name: 'damaging' }] }, flaws: { value: [] },
    },
  });
  const effects = new Map<string, any>();
  effects.set('prone', {
    id: 'prone', name: 'Prone', disabled: false, statuses: new Set(['prone']), conditionValue: 1,
    changes: [],
  });
  effects.set('ws-effect', {
    id: 'ws-effect', name: 'Battle Fury', disabled: false, statuses: new Set(),
    changes: [{ key: 'system.characteristics.ws.value', mode: 2, value: '20', priority: null }],
  });
  return {
    id: 'actor-1', name: 'Scarred Orc', type: 'creature', flags: { core: { sourceId: 'Compendium.pack.Actor.orc' } },
    system: {
      characteristics,
      status: {
        wounds: { value: 5, max: 14 }, advantage: { value: 2 },
        armour: {
          head: { value: 1 }, body: { value: 4 }, rArm: { value: 2 },
          lArm: { value: 2 }, rLeg: { value: 1 }, lLeg: { value: 1 },
        },
      },
      details: { size: { value: 'avg' } },
    },
    items,
    effects,
  };
}

function makeToken(actor: any) {
  return {
    id: 'token-1', name: 'Scarred Orc', actorId: actor.id, actorLink: false, actor,
    _source: { actorId: actor.id }, delta: { _source: { system: { status: { wounds: { value: 5 } } } } },
    disposition: -1,
  };
}

describe('token.get includeCombatSnapshot — effective synthetic Actor read (BUG-618)', () => {
  beforeEach(() => {
    const actor = makeActor();
    const token = makeToken(actor);
    const scene = { id: 'scene-1', tokens: new Map([[token.id, token]]) };
    (globalThis as any).game = {
      scenes: { get: (id: string) => id === scene.id ? scene : undefined },
      actors: new Map([[actor.id, actor]]),
    };
  });

  it('returns prepared Wounds/chars/armour/conditions/equipment/effects only when requested', async () => {
    const withSnapshot: any = await getToken({
      action: 'get', sceneId: 'scene-1', tokenId: 'token-1', includeCombatSnapshot: true,
    });
    expect(withSnapshot.success).toBe(true);
    expect(withSnapshot.data.token.delta).toEqual({ hasOverrides: true });
    expect(withSnapshot.data.token.combatSnapshot).toMatchObject({
      schema: 'wfrp4e-token-combat-snapshot/v1',
      actorType: 'creature',
      sourceId: 'Compendium.pack.Actor.orc',
      wounds: { value: 5, max: 14 },
      advantage: 2,
      characteristics: { ws: { value: 72, bonus: 7 } },
      armour: { body: 4 },
      conditions: [{ key: 'prone', value: 1 }],
      skills: [{ name: 'Melee (Basic)', characteristic: 'ws', advances: 10, total: 82 }],
      traits: [{ name: 'Night Vision', rating: '' }],
      weapons: [{ id: 'weapon', name: 'Scarred Axe', equipped: true, damage: 9 }],
    });
    expect(withSnapshot.data.token.combatSnapshot.effects).toHaveLength(2);

    const lean: any = await getToken({ action: 'get', sceneId: 'scene-1', tokenId: 'token-1' });
    expect(lean.success).toBe(true);
    expect(lean.data.token).not.toHaveProperty('combatSnapshot');
  });
});
