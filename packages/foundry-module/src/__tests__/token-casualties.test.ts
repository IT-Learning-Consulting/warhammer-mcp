import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplyTokenCasualtiesInput } from '@foundry-mcp/shared';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { TokenCasualtiesService } from '../services/token-casualties.js';

function setPath(target: any, path: string, value: unknown): void {
  const parts = path.split('.');
  let cursor = target;
  for (const part of parts.slice(0, -1)) cursor = (cursor[part] ??= {});
  cursor[parts.at(-1)!] = value;
}

function wire() {
  const events: string[] = [];
  const embedded = new Map<string, any>();
  const actor: any = {
    id: 'syntheticActor1',
    uuid: 'Scene.scene1.Token.token1.Actor.syntheticActor1',
    name: 'Casualty',
    system: { status: { wounds: { value: 13, max: 20 }, criticalWounds: { value: 0 } } },
    _source: { system: { status: { wounds: { value: 13, max: 20 }, criticalWounds: { value: 0 } } } },
    flags: {},
    items: { get: (id: string) => embedded.get(id) },
    update: vi.fn(async (changes: Record<string, unknown>) => {
      for (const [path, value] of Object.entries(changes)) {
        setPath(actor, path, value);
        setPath(actor._source, path, value);
        if (path === 'system.status.wounds.value') events.push(`wounds:${value}`);
      }
      return actor;
    }),
    addCondition: vi.fn(async () => undefined),
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) => {
      return payloads.map((rawPayload, index) => {
        const payload = structuredClone(rawPayload);
        events.push(`embed:${payload.system.wounds.value}`);
        // Live-captured WFRP4e CriticalModel._onCreate behavior: a numeric wounds value is
        // subtracted on embed. An empty value is deliberately non-numeric and performs no update.
        const hookWounds = Number.parseInt(payload.system.wounds.value, 10);
        if (Number.isInteger(hookWounds)) {
          actor.system.status.wounds.value -= hookWounds;
          actor._source.system.status.wounds.value -= hookWounds;
        }
        const id = `critEmbedded${index + 1}`;
        const item: any = {
          id,
          uuid: `${actor.uuid}.Item.${id}`,
          system: structuredClone(payload.system),
          _source: { system: structuredClone(payload.system) },
          update: vi.fn(async (changes: Record<string, unknown>) => {
            for (const [path, value] of Object.entries(changes)) {
              setPath(item, path, value);
              setPath(item._source, path, value);
            }
            events.push(`crit-value:${item.system.wounds.value}`);
            return item;
          }),
        };
        embedded.set(item.id, item);
        return item;
      });
    }),
  };

  const criticalSource = {
    toObject: () => ({
      _id: 'sourceCrit1',
      name: 'Ruptured Bowel',
      type: 'critical',
      system: { wounds: { value: '4' }, location: { key: 'body' } },
    }),
  };
  const headCriticalSource = {
    toObject: () => ({
      _id: 'sourceCrit2',
      name: 'Shattered Jaw',
      type: 'critical',
      system: { wounds: { value: '2' }, location: { key: 'head' } },
    }),
  };
  const worldActor = { system: { status: { wounds: { value: 13 } } } };
  const token = { id: 'token1', uuid: 'Scene.scene1.Token.token1', actorId: 'worldActor1', actorLink: false, actor };
  const scene = { id: 'scene1', name: 'Test Scene', tokens: new Map([['token1', token]]) };

  (globalThis as any).game = {
    ...(globalThis as any).game,
    wfrp4e: { config: { conditions: {} } },
    scenes: new Map([['scene1', scene]]),
    actors: new Map([['worldActor1', worldActor]]),
  };
  (globalThis as any).fromUuid = vi.fn(async (uuid: string) => {
    if (uuid === 'Compendium.artantares.items.Item.rupturedBowel') return criticalSource;
    if (uuid === 'Compendium.artantares.items.Item.shatteredJaw') return headCriticalSource;
    if (uuid === actor.uuid) return actor;
    if (uuid.startsWith(`${actor.uuid}.Item.`)) return embedded.get(uuid.split('.').at(-1)!);
    return null;
  });
  return { actor, embedded, events };
}

describe('TokenCasualtiesService critical apply semantics (BUG-611)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('accepts the ordered plural critical contract while retaining the legacy singular field (BUG-612)', () => {
    const base = { sceneId: 'scene1', confirmedApply: true as const };
    expect(ApplyTokenCasualtiesInput.parse({
      ...base,
      casualties: [{ tokenId: 'token1', criticalUuids: ['Compendium.artantares.items.Item.rupturedBowel'] }],
    }).casualties[0].criticalUuids).toHaveLength(1);
    expect(ApplyTokenCasualtiesInput.parse({
      ...base,
      casualties: [{ tokenId: 'token1', criticalUuid: 'Compendium.artantares.items.Item.rupturedBowel' }],
    }).casualties[0].criticalUuid).toContain('rupturedBowel');
  });

  it('keeps the simulator absolute Wounds while embedding the authored critical value', async () => {
    const { actor, embedded, events } = wire();
    const service = new TokenCasualtiesService(() => undefined);
    const result = await service.applyTokenCasualties({
      sceneId: 'scene1',
      confirmedApply: true,
      casualties: [{ tokenId: 'token1', wounds: 8, criticalUuid: 'Compendium.artantares.items.Item.rupturedBowel' }],
    });

    expect(result.results[0]).toMatchObject({ applied: true, woundsBefore: 13, woundsAfter: 8, critEmbedded: 'critEmbedded1' });
    expect(actor.system.status.wounds.value).toBe(8);
    expect(embedded.get('critEmbedded1').system.wounds.value).toBe('4');
    expect(events).toEqual(['wounds:8', 'embed:', 'crit-value:4']);
  });

  it('embeds every ordered critical and returns every created id (BUG-612)', async () => {
    const { actor, embedded } = wire();
    const service = new TokenCasualtiesService(() => undefined);
    const result = await service.applyTokenCasualties({
      sceneId: 'scene1',
      confirmedApply: true,
      batchId: 'bug-612-batch',
      casualties: [{
        tokenId: 'token1',
        wounds: 7,
        criticalUuids: [
          'Compendium.artantares.items.Item.rupturedBowel',
          'Compendium.artantares.items.Item.shatteredJaw',
          'Compendium.artantares.items.Item.rupturedBowel',
        ],
      }],
    });

    expect(result.results[0]).toMatchObject({
      applied: true,
      woundsAfter: 7,
      critEmbedded: 'critEmbedded1',
      critsEmbedded: ['critEmbedded1', 'critEmbedded2', 'critEmbedded3'],
    });
    expect(result.createdDocumentIds).toEqual(['critEmbedded1', 'critEmbedded2', 'critEmbedded3']);
    expect(actor.system.status.wounds.value).toBe(7);
    expect(actor.system.status.criticalWounds.value).toBe(3);
    expect([...embedded.values()].map((item) => item.system.wounds.value)).toEqual(['4', '2', '4']);

    const retry = await service.applyTokenCasualties({
      sceneId: 'scene1',
      confirmedApply: true,
      batchId: 'bug-612-batch',
      casualties: [{ tokenId: 'token1', criticalUuids: ['Compendium.artantares.items.Item.shatteredJaw'] }],
    });
    expect(retry.results[0]).toMatchObject({ applied: true, alreadyApplied: true });
    expect(embedded.size).toBe(3);
    expect(actor.system.status.criticalWounds.value).toBe(3);
  });

  it('dry-run reports the same absolute outcome without embedding or mutating', async () => {
    const { actor } = wire();
    const service = new TokenCasualtiesService(() => undefined);
    const result = await service.applyTokenCasualties({
      sceneId: 'scene1',
      confirmedApply: true,
      dryRun: true,
      casualties: [{ tokenId: 'token1', wounds: 8, criticalUuid: 'Compendium.artantares.items.Item.rupturedBowel' }],
    });
    expect(result.results[0]).toMatchObject({ applied: true, woundsBefore: 13, woundsAfter: 8, critEmbedded: '(dry-run)' });
    expect(actor.update).not.toHaveBeenCalled();
    expect(actor.createEmbeddedDocuments).not.toHaveBeenCalled();
  });
});
