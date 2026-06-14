// Characterization snapshot — ApplyTemplateToTokenTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2 (R0.1).
// ApplyTemplateToTokenTool.handle() explicitly returns { content: [{ type: 'text', text }], structuredContent }.
// We snapshot content[0].text (the formatted summary line) per the exemplar pattern.

import { describe, it, expect } from 'vitest';
import { ApplyTemplateToTokenTool } from '../../tools/apply-template-to-token.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ApplyTemplateToTokenTool(makeToolDeps(mockReturn));

describe('ApplyTemplateToTokenTool — characterization', () => {
  it('token template application — summary line with token id and counts', async () => {
    const r = await tool({
      templateId: 'Item.template-soldier01',
      templateName: 'Veteran Soldier',
      tokenId: 'token-goblin01',
      actorId: 'actor-goblin-base',
      actorName: 'Goblin',
      sceneId: 'scene-battlefield01',
      applied: {
        itemsByType: {
          skill: 2,
          talent: 1,
          spell: 0,
          trapping: 3,
        },
        items: [],
      },
    }).handle({
      sceneId: 'scene-battlefield01',
      tokenId: 'token-goblin01',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.template-soldier01',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('wizard token template — includes spell count', async () => {
    const r = await tool({
      templateId: 'Item.template-wizard-token01',
      templateName: 'Battle Wizard',
      tokenId: 'token-wizard01',
      actorId: 'actor-human-base',
      actorName: 'Human Wizard',
      sceneId: 'scene-city01',
      applied: {
        itemsByType: {
          skill: 4,
          talent: 2,
          spell: 5,
          trapping: 1,
        },
        items: [],
      },
    }).handle({
      sceneId: 'scene-city01',
      tokenId: 'token-wizard01',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.template-wizard-token01',
      preResolvedChoices: {
        lores: ['Heavens'],
        spells: { Heavens: ['Comet of Casandora', 'Iceshard Blizzard', 'Urannon\'s Thunderbolt', 'Chain Lightning', 'Portent of Far'] },
      },
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('token with no actor name — falls back to actorId in summary', async () => {
    const r = await tool({
      templateId: 'Item.template-scout01',
      templateName: 'Scout',
      tokenId: 'token-unknown01',
      actorId: 'actor-unknown-base',
      actorName: undefined,
      sceneId: 'scene-forest01',
      applied: {
        itemsByType: {
          skill: 2,
          talent: 0,
          spell: 0,
          trapping: 1,
        },
        items: [],
      },
    }).handle({
      sceneId: 'scene-forest01',
      tokenId: 'token-unknown01',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.template-scout01',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('stacked second template application — zero-delta applied counts', async () => {
    // Second call on same token for a pure-trapping template (no skill/talent/spell).
    const r = await tool({
      templateId: 'Item.template-cavalry01',
      templateName: 'Cavalry Trappings',
      tokenId: 'token-goblin01',
      actorId: 'actor-goblin-base',
      actorName: 'Goblin',
      sceneId: 'scene-battlefield01',
      applied: {
        itemsByType: {
          skill: 0,
          talent: 0,
          spell: 0,
          trapping: 5,
        },
        items: [],
      },
    }).handle({
      sceneId: 'scene-battlefield01',
      tokenId: 'token-goblin01',
      templateUuid: 'Compendium.wfrp4e-owb1.items.Item.template-cavalry01',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
