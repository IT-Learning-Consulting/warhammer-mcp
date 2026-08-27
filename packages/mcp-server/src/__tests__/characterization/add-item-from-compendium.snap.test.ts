// Characterization snapshot — AddItemFromCompendiumTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// BUG-869 (Phase 3, D5, task 4.1 widened): AddItemFromCompendiumTool.handle() now returns a
// content+structuredContent envelope instead of the bare query passthrough. This tool has no
// separate human-prose summary — its content[0].text was ALWAYS the auto-wrapped
// JSON.stringify(result) that backend.ts's fallback branch produces for any bare-object tool
// return (backend.ts:325). The tool now constructs that same text explicitly
// (`JSON.stringify(data)`) so the wire text is byte-identical to what the transport boundary
// already emitted — CCR-7 additive envelope: structuredContent is new, the text is not.

import { describe, it, expect } from 'vitest';
import { AddItemFromCompendiumTool } from '../../tools/add-item-from-compendium.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new AddItemFromCompendiumTool(makeToolDeps(mockReturn));

describe('AddItemFromCompendiumTool — characterization', () => {
  it('add item by itemUuid — envelope, wire text matches the pre-existing auto-wrap shape', async () => {
    const r: any = await tool({
      itemId: 'item-new-001',
      itemName: 'Longsword',
      itemType: 'weapon',
      actorId: 'actor-001',
      actorName: 'Test Actor',
      message: 'Successfully added "Longsword" to Test Actor from compendium',
      outcome: 'applied',
    }).handle({
      actorId: 'actor-001',
      itemUuid: 'Compendium.wfrp4e-core.items.Item.sgBDLL1iLenHJ5um',
    });
    // Wire-text equivalence (CCR-7): content[0].text is byte-identical to
    // JSON.stringify(structuredContent) — the exact text backend.ts's auto-wrap fallback
    // would have produced for this same bare object before this task, now constructed
    // explicitly by the tool instead of implicitly by the transport boundary.
    expect(r.content[0].text).toBe(JSON.stringify(r.structuredContent));
    expect(r).toMatchSnapshot();
  });

  it('add specialisation skill with skipSpecialisationChoice — envelope, wire text matches the pre-existing auto-wrap shape', async () => {
    const r: any = await tool({
      itemId: 'item-new-002',
      itemName: 'Lore (Beasts)',
      itemType: 'skill',
      actorId: 'actor-002',
      actorName: 'Test Actor 2',
      message: 'Successfully added "Lore (Beasts)" to Test Actor 2 from compendium',
      outcome: 'applied',
    }).handle({
      actorId: 'actor-002',
      itemUuid: 'Compendium.wfrp4e-core.items.Item.loreBeasts001',
      skipSpecialisationChoice: true,
    });
    expect(r.content[0].text).toBe(JSON.stringify(r.structuredContent));
    expect(r).toMatchSnapshot();
  });

  it('repeat call — alreadyApplied dedupe branch — envelope, wire text matches the pre-existing auto-wrap shape', async () => {
    const r: any = await tool({
      itemId: 'item-existing-003',
      itemName: 'Longsword',
      itemType: 'weapon',
      actorId: 'actor-001',
      actorName: 'Test Actor',
      message: '"Longsword" is already present on Test Actor — skipped duplicate create. Pass allowDuplicate:true to force a second copy.',
      outcome: 'alreadyApplied',
      operationId: 'op-aifc003',
      createdDocumentIds: [],
      updatedDocumentIds: [],
      deletedDocumentIds: [],
      warnings: [],
    }).handle({
      actorId: 'actor-001',
      itemUuid: 'Compendium.wfrp4e-core.items.Item.sgBDLL1iLenHJ5um',
    });
    expect(r.content[0].text).toBe(JSON.stringify(r.structuredContent));
    expect(r).toMatchSnapshot();
  });
});
