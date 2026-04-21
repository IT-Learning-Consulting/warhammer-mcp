// wfrp-cast-spell.test.ts — memorize / forget / learn housekeeping flows.
// HC3: no cast math — skills only flip `system.memorized.value` and push
// compendium Items. rollCastTest stays in the wfrp4e system.

import { describe, it, expect, beforeEach } from 'vitest';
import { callMcp, clearMcpMocks, getCallLog, mockMcpCall } from './_harness.js';

interface SpellItemStub {
  id: string;
  name: string;
  type: 'spell';
  system: {
    memorized: { value: boolean };
    lore: { value: string };
  };
}

interface WizardStub {
  id: string;
  name: string;
  type: 'character';
  items: SpellItemStub[];
}

async function runMemorize(actorId: string, spellName: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: WizardStub;
  };
  const spell = env.data.items.find(
    (i) => i.type === 'spell' && i.name.toLowerCase() === spellName.toLowerCase(),
  );
  if (!spell) return { ok: false, reason: 'spell not on actor' };
  await callMcp('warhammer-mcp.update-item', {
    actorId,
    itemId: spell.id,
    updateData: { 'system.memorized.value': true },
  });
  return { ok: true };
}

async function runForget(actorId: string, spellName: string) {
  const env = (await callMcp('warhammer-mcp.getCharacterInfo', { characterId: actorId })) as {
    success: boolean; data: WizardStub;
  };
  const spell = env.data.items.find(
    (i) => i.type === 'spell' && i.name.toLowerCase() === spellName.toLowerCase(),
  );
  if (!spell) return { ok: false };
  await callMcp('warhammer-mcp.update-item', {
    actorId,
    itemId: spell.id,
    updateData: { 'system.memorized.value': false },
  });
  return { ok: true };
}

async function runLearn(actorId: string, spellName: string, lore?: string) {
  const env = (await callMcp('warhammer-mcp.searchCompendium', {
    itemType: 'spell',
    query: spellName,
    ...(lore ? { lore } : {}),
  })) as { success: boolean; data: Array<{ uuid: string; name: string; system: { lore: { value: string } } }> };
  if (env.data.length === 0) return { ok: false, reason: 'no match' };
  if (env.data.length > 1 && !lore) return { ok: false, reason: 'ambiguous' };
  const hit = env.data[0];
  await callMcp('warhammer-mcp.addItemFromCompendium', { actorId, uuid: hit.uuid });
  return { ok: true, uuid: hit.uuid };
}

function makeWizard(spells: Partial<SpellItemStub>[] = []): WizardStub {
  return {
    id: 'wiz1',
    name: 'Gotrek',
    type: 'character',
    items: spells.map((s, i) => ({
      id: s.id ?? `spell-${i}`,
      name: s.name ?? 'Fireball',
      type: 'spell',
      system: {
        memorized: { value: s.system?.memorized?.value ?? false },
        lore: { value: s.system?.lore?.value ?? 'fire' },
      },
    })),
  };
}

beforeEach(() => clearMcpMocks());

describe('wfrp-cast-spell / memorize', () => {
  it('flips system.memorized.value to true via a single update-item call', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', {
      success: true,
      data: makeWizard([{ id: 'spell-a', name: 'Aethyric Armour', system: { memorized: { value: false }, lore: { value: 'arcane' } } }]),
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-item', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runMemorize('wiz1', 'Aethyric Armour');
    expect(r.ok).toBe(true);
    expect(captured.itemId).toBe('spell-a');
    expect(captured.updateData['system.memorized.value']).toBe(true);
    expect(getCallLog().filter((e) => e.queryKey === 'warhammer-mcp.update-item')).toHaveLength(1);
  });
});

describe('wfrp-cast-spell / forget', () => {
  it('flips system.memorized.value to false', async () => {
    mockMcpCall('warhammer-mcp.getCharacterInfo', {
      success: true,
      data: makeWizard([{ id: 'spell-b', name: 'Fireball', system: { memorized: { value: true }, lore: { value: 'fire' } } }]),
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.update-item', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runForget('wiz1', 'Fireball');
    expect(r.ok).toBe(true);
    expect(captured.updateData['system.memorized.value']).toBe(false);
  });
});

describe('wfrp-cast-spell / learn', () => {
  it('addItemFromCompendium uses the searchCompendium UUID on a single-result learn', async () => {
    mockMcpCall('warhammer-mcp.searchCompendium', {
      success: true,
      data: [{ uuid: 'Compendium.wfrp4e-core.items.spell-xyz', name: 'Bolt', system: { lore: { value: 'fire' } } }],
    });
    let captured: any = null;
    mockMcpCall('warhammer-mcp.addItemFromCompendium', (i: any) => { captured = i; return { success: true, data: {} }; });

    const r = await runLearn('wiz1', 'Bolt');
    expect(r.ok).toBe(true);
    expect(captured.uuid).toBe('Compendium.wfrp4e-core.items.spell-xyz');
  });
});
