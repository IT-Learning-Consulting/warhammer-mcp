// BUG-476 (Wave 2, D3) — add-item-from-compendium deadlocked on wfrp4e items with
// system.prompt:true (all core critical wounds): LocationalItemModel._preCreate
// opens a blocking DialogV2 gated ONLY on `!location && this.prompt` (wfrp4e.js:26930,
// source-verified). The fix pre-strips prompt on the carried copy so the headless
// embed returns immediately with exactly one embed. Item shape mirrors the live
// wfrp4e critical schema (prompt BooleanField + location.key), not invented.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn() },
}));

import { ItemService } from '../services/item.js';

function wire(itemSource: Record<string, unknown>) {
  const created: any[] = [];
  const actor: any = {
    id: 'actorAAAAAAAAAA1',
    name: 'Test Victim',
    items: { get: (id: string) => created.find((c) => c.id === id) },
    createEmbeddedDocuments: vi.fn(async (_type: string, payloads: any[]) => {
      const docs = payloads.map((p, i) => ({ id: `embedded${i}AAAAAAA`, name: p.name, type: p.type, uuid: `Actor.x.Item.embedded${i}` }));
      created.push(...docs);
      return docs;
    }),
  };
  (globalThis as any).game = { actors: { get: () => actor } };
  (globalThis as any).fromUuid = vi.fn(async () => ({ toObject: () => JSON.parse(JSON.stringify(itemSource)) }));
  return actor;
}

describe('BUG-476: prompt-dialog pre-strip on the headless embed path', () => {
  beforeEach(() => {
    delete (globalThis as any).fromUuid;
  });

  it('strips system.prompt on a locationless prompt:true item (critical wound shape)', async () => {
    const actor = wire({
      name: 'Torn Thigh',
      type: 'critical',
      system: { prompt: true, location: { key: '', value: '' }, wounds: { value: 2 } },
    });
    const svc = new ItemService(() => undefined);
    const result = await svc.addItemFromCompendium({
      actorId: 'actorAAAAAAAAAA1',
      itemUuid: 'Compendium.wfrp4e-core.items.Item.tornThighAAAAAA1',
    });
    expect(result.itemName).toBe('Torn Thigh');
    expect(actor.createEmbeddedDocuments).toHaveBeenCalledOnce();
    const payload = actor.createEmbeddedDocuments.mock.calls[0][1][0];
    expect(payload.system.prompt).toBe(false);
    // Location is left for the GM — never invented.
    expect(payload.system.location.key).toBe('');
  });

  it('leaves prompt untouched when a location.key is already set (no dialog fires then)', async () => {
    const actor = wire({
      name: 'Torn Thigh',
      type: 'critical',
      system: { prompt: true, location: { key: 'lArm', value: '' } },
    });
    const svc = new ItemService(() => undefined);
    await svc.addItemFromCompendium({ actorId: 'actorAAAAAAAAAA1', itemUuid: 'Compendium.x.items.Item.y1' });
    const payload = actor.createEmbeddedDocuments.mock.calls[0][1][0];
    expect(payload.system.prompt).toBe(true);
  });

  it('non-prompt items pass through unchanged (exactly one embed)', async () => {
    const actor = wire({ name: 'Hand Weapon', type: 'weapon', system: { damage: { value: 'SB+4' } } });
    const svc = new ItemService(() => undefined);
    const result = await svc.addItemFromCompendium({ actorId: 'actorAAAAAAAAAA1', itemUuid: 'Compendium.x.items.Item.y2' });
    expect(result.itemName).toBe('Hand Weapon');
    expect(actor.createEmbeddedDocuments).toHaveBeenCalledOnce();
    expect(actor.createEmbeddedDocuments.mock.calls[0][1]).toHaveLength(1);
  });
});
