// Phase 4h Phase 4.1 — tree-walker fixtures for /wfrp-encounter-builder.
// Plan path was tests/skills/encounter-builder/tree-walker.test.ts; relocated here
// to leverage the existing warhammer-mcp vitest infrastructure (no top-level vitest setup).
//
// Walker lives in data-access.ts:walkTrappingsTree. These fixtures exercise:
//   - Simple AND root with 3 option leaves (all returned).
//   - Nested AND containing one OR of 2 options (one OR-branch picked, the rest preserved).
//   - Hahnbrandt Captain-style tree (full AND with embedded OR-of-3 kits, nested OR for helm type).

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../../queries.js';
import { expectEnvelope } from '../test-utils.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  return qh;
}

function makeTemplate(structure: any, options: any[]) {
  return {
    id: 'tpl-walker',
    name: 'WalkerFixture',
    type: 'template',
    system: {
      alterName: { pre: '', post: '' },
      characteristics: {},
      skills: { list: [] },
      talents: { list: [] },
      lores: { list: [] },
      traits: { list: [] },
      trappings: { structure, options },
    },
  };
}

function makeActor(opts: { id: string; name: string; type: string }) {
  const updates: Array<{ updateData: Record<string, any>; options: any }> = [];
  const creates: Array<{ items: any[]; options: any }> = [];
  return {
    id: opts.id,
    name: opts.name,
    type: opts.type,
    system: { characteristics: {} },
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

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  const existingUtils = (globalThis as any).foundry?.utils ?? {};
  (globalThis as any).foundry = {
    ...(globalThis as any).foundry,
    utils: {
      ...existingUtils,
      getProperty: (obj: any, path: string) => path.split('.').reduce((o: any, k: string) => (o == null ? o : o[k]), obj),
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
        for (const key of Object.keys(source ?? {})) {
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
});

function setupGameWith(actor: any, template: any) {
  void template;
  (globalThis as any).game = {
    ...(globalThis as any).game,
    actors: new Map([[actor.id, actor]]),
    wfrp4e: {
      utility: {
        findSkill: vi.fn(),
        findTalent: vi.fn(),
      },
      config: { magicLores: {}, placeholderItemData: { type: 'trapping' } },
    },
  };
  (globalThis as any).warhammer = {
    utility: {
      findItemId: vi.fn(async (id: string) => {
        if (id === template.id) return template;
        return { id, name: `Item-${id}`, toObject: () => ({ id, name: `Item-${id}`, type: 'weapon', system: {} }) };
      }),
      findAllItems: vi.fn(async () => []),
    },
  };
}

describe('encounter-builder tree-walker fixtures', () => {
  it('Simple AND root with 3 leaves embeds all 3 items', async () => {
    const structure = {
      type: 'and', id: 'root',
      options: [
        { type: 'option', id: 'opt-a' },
        { type: 'option', id: 'opt-b' },
        { type: 'option', id: 'opt-c' },
      ],
    };
    const options = [
      { type: 'item', id: 'opt-a', name: 'Hand Weapon', documentId: 'item-hw',     idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'opt-b', name: 'Shield',      documentId: 'item-shield', idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'opt-c', name: 'Helm',        documentId: 'item-helm',   idType: 'id', diff: {}, filters: [] },
    ];
    const template = makeTemplate(structure, options);
    const actor = makeActor({ id: 'actor-1', name: 'TestNpc', type: 'creature' });
    setupGameWith(actor, template);

    const result: any = await (makeHandlers() as any).handleApplyTemplate({ actorId: actor.id, templateUuid: template.id });
    expectEnvelope<any>(result);
    const embedded = actor.__creates.flatMap((c) => c.items);
    const names = embedded.map((i: any) => i.name).filter(Boolean);
    expect(names).toEqual(expect.arrayContaining(['Item-item-hw', 'Item-item-shield', 'Item-item-helm']));
  });

  it('Nested AND containing OR of 2 picks one of the 2 OR-branches', async () => {
    const structure = {
      type: 'and', id: 'root',
      options: [
        { type: 'option', id: 'fixed-helm' },
        { type: 'or', id: 'weapon-pick',
          options: [
            { type: 'option', id: 'opt-sword' },
            { type: 'option', id: 'opt-axe' },
          ],
        },
      ],
    };
    const options = [
      { type: 'item', id: 'fixed-helm', name: 'Plate Helm', documentId: 'item-helm',   idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'opt-sword',  name: 'Sword',      documentId: 'item-sword',  idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'opt-axe',    name: 'Axe',        documentId: 'item-axe',    idType: 'id', diff: {}, filters: [] },
    ];
    const template = makeTemplate(structure, options);
    const actor = makeActor({ id: 'actor-2', name: 'TestNpc', type: 'creature' });
    setupGameWith(actor, template);

    const result: any = await (makeHandlers() as any).handleApplyTemplate({ actorId: actor.id, templateUuid: template.id });
    expectEnvelope<any>(result);
    const embedded = actor.__creates.flatMap((c) => c.items);
    const names = embedded.map((i: any) => i.name).filter(Boolean);
    expect(names).toContain('Item-item-helm');
    const orPicks = names.filter((n: string) => n === 'Item-item-sword' || n === 'Item-item-axe');
    expect(orPicks.length).toBe(1);
  });

  it('Hahnbrandt Captain-style tree (AND with 4 fixed + outer OR of 3 kits, nested OR for helm type)', async () => {
    // Structure mirrors the Captain template shape: outer AND with the always-included
    // armour pieces + an OR over 3 kit choices, where one kit nests another OR.
    const structure = {
      type: 'and', id: 'root',
      options: [
        { type: 'option', id: 'fixed-leg' },
        { type: 'option', id: 'fixed-bracer' },
        { type: 'option', id: 'fixed-cloak' },
        { type: 'option', id: 'fixed-belt' },
        { type: 'or', id: 'kit-pick',
          options: [
            { type: 'option', id: 'kit-sword-shield' },
            { type: 'option', id: 'kit-twohander' },
            { type: 'and', id: 'kit-polearm-helmed',
              options: [
                { type: 'option', id: 'opt-polearm' },
                { type: 'or', id: 'helm-type',
                  options: [
                    { type: 'option', id: 'opt-mail-coif' },
                    { type: 'option', id: 'opt-big-hat' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const options = [
      { type: 'item', id: 'fixed-leg',         name: 'Leg Plates',      documentId: 'item-leg',       idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'fixed-bracer',      name: 'Bracers',         documentId: 'item-bracer',    idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'fixed-cloak',       name: 'Cloak',           documentId: 'item-cloak',     idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'fixed-belt',        name: 'Belt',            documentId: 'item-belt',      idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'kit-sword-shield',  name: 'Sword + Shield',  documentId: 'item-sw-sh',     idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'kit-twohander',     name: 'Two-Hander',      documentId: 'item-2h',        idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'opt-polearm',       name: 'Polearm',         documentId: 'item-polearm',   idType: 'id', diff: {}, filters: [] },
      { type: 'item', id: 'opt-mail-coif',     name: 'Quality Mail Coif', documentId: 'item-coif',    idType: 'id', diff: { name: 'Quality Mail Coif' }, filters: [] },
      { type: 'item', id: 'opt-big-hat',       name: 'Big Hat',         documentId: 'item-hat',       idType: 'id', diff: { name: 'Big Hat' },          filters: [] },
    ];
    const template = makeTemplate(structure, options);
    const actor = makeActor({ id: 'actor-3', name: 'TestCaptain', type: 'creature' });
    setupGameWith(actor, template);

    const result: any = await (makeHandlers() as any).handleApplyTemplate({ actorId: actor.id, templateUuid: template.id });
    expectEnvelope<any>(result);
    const embedded = actor.__creates.flatMap((c) => c.items);
    const names = embedded.map((i: any) => i.name).filter(Boolean);
    // The 4 fixed items always present.
    expect(names).toEqual(expect.arrayContaining(['Item-item-leg', 'Item-item-bracer', 'Item-item-cloak', 'Item-item-belt']));
    // Exactly one of the 3 kit options resolved.
    const kitsHit = ['Item-item-sw-sh', 'Item-item-2h', 'Item-item-polearm'].filter((n) => names.includes(n));
    expect(kitsHit.length).toBe(1);
    // If polearm was picked, the nested OR also produced exactly 1 helm.
    if (names.includes('Item-item-polearm')) {
      const helmsHit = ['Quality Mail Coif', 'Big Hat'].filter((n) => names.includes(n));
      expect(helmsHit.length).toBe(1);
    }
  });
});
