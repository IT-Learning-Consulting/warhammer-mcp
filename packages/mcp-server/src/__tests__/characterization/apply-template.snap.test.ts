// Characterization snapshot — ApplyTemplateTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// ApplyTemplateTool.handle() explicitly returns { content: [{ type: 'text', text }], structuredContent }.
// We snapshot content[0].text (the formatted summary line) per the exemplar pattern.

import { describe, it, expect } from 'vitest';
import { ApplyTemplateTool } from '../../tools/apply-template.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ApplyTemplateTool(makeToolDeps(mockReturn));

describe('ApplyTemplateTool — characterization', () => {
  it('basic template application — summary line with counts', async () => {
    const r = await tool({
      templateId: 'Item.template-scout01',
      templateName: 'Scout',
      actorId: 'actor-goblin01',
      actorName: 'Goblin Skirmisher',
      applied: {
        itemsByType: {
          skill: 3,
          talent: 2,
          spell: 0,
          trapping: 4,
        },
        items: [],
      },
    }).handle({
      actorId: 'actor-goblin01',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.template-scout01',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('template with spells — wizard template summary', async () => {
    const r = await tool({
      templateId: 'Item.template-wizard01',
      templateName: 'Apprentice Wizard',
      actorId: 'actor-wizard01',
      actorName: 'Human Wizard',
      applied: {
        itemsByType: {
          skill: 4,
          talent: 1,
          spell: 3,
          trapping: 2,
        },
        items: [],
      },
    }).handle({
      actorId: 'actor-wizard01',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.template-wizard01',
      preResolvedChoices: {
        lores: ['Fire'],
        spells: { Fire: ['Fireball', 'Flaming Sword of Rhuin', 'Burning Head'] },
      },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('template with no name — falls back to templateId in summary', async () => {
    const r = await tool({
      templateId: 'template-noname99',
      templateName: undefined,
      actorId: 'actor-npc01',
      actorName: undefined,
      applied: {
        itemsByType: {
          skill: 1,
          talent: 0,
          spell: 0,
          trapping: 0,
        },
        items: [],
      },
    }).handle({
      actorId: 'actor-npc01',
      templateUuid: 'template-noname99',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('template with zero items applied — all-zero summary', async () => {
    const r = await tool({
      templateId: 'Item.template-empty01',
      templateName: 'Empty Template',
      actorId: 'actor-test01',
      actorName: 'Test Actor',
      applied: {
        itemsByType: {},
        items: [],
      },
    }).handle({
      actorId: 'actor-test01',
      templateUuid: 'Compendium.wfrp4e-core.items.Item.template-empty01',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
