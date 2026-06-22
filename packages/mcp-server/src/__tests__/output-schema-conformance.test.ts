// Phase 11 (R11.1 / CCR-Output-Schema): runtime conformance test.
//
// For every mutation tool that gained an `outputSchema` in Phase 11, this suite
// drives the tool's registered handler with a representative mocked query payload
// and asserts the returned envelope:
//   1. carries a `structuredContent` object, AND
//   2. that structuredContent validates against the tool's declared `outputSchema`
//      (compiled with Ajv).
//
// This is the runtime half of the R11.1 gate; the static half
// (scripts/check-output-schema-conformance.mjs) asserts the SCHEMAS compile.
//
// Tools are driven uniformly via getRegistration() → handler, so single-purpose and
// umbrella tools share one harness. region/matt are exercised on one mutation action
// each (the umbrella attaches structuredContent on mutation actions only).

import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import { makeToolDeps } from './test-utils.js';

import { ApplyTemplateTool } from '../tools/apply-template.js';
import { ApplyTemplateToTokenTool } from '../tools/apply-template-to-token.js';
import { ApplyDamageTool } from '../tools/apply-damage.js';
import { UpdateActorTool } from '../tools/update-actor.js';
import { UpdateItemTool } from '../tools/update-item.js';
import { CreateCustomItemTool } from '../tools/create-custom-item.js';
import { AddActiveEffectTool } from '../tools/add-active-effect.js';
import { UpdateActiveEffectTool } from '../tools/update-active-effect.js';
import { DeleteActiveEffectTool } from '../tools/delete-active-effect.js';
import { ActorCreationTools } from '../tools/actor-creation.js';
import { ManageCombatTools } from '../tools/manage-combat.js';
import { ManageConditionsTools } from '../tools/manage-conditions.js';
import { RegionTool } from '../tools/region.js';
import { ModuleMattTool } from '../tools/modules/monks-active-tiles/matt.js';
import { ModuleImperialArcanaTool } from '../tools/modules/imperial-arcana/imperial-arcana.js';

const ajv = new Ajv({ strict: false, allowUnionTypes: true, allErrors: true });

const STATUS = {
  wounds: { value: 10, max: 15 },
  criticalWounds: { value: 0, max: 0 },
  fate: { value: 2 },
  fortune: { value: 2 },
  resilience: { value: 1 },
  resolve: { value: 1 },
  advantage: { value: 0 },
  conditions: [],
};

interface ConformanceCase {
  toolName: string;
  makeTool: () => any; // tool instance with a canned query response
  args: any;
}

const CASES: ConformanceCase[] = [
  {
    toolName: 'apply-template',
    // Phase 12 R12.2: mock includes the operation-receipt fields the real apply emits (capture-faithful).
    makeTool: () => new ApplyTemplateTool(makeToolDeps({
      success: true, actorId: 'a1', actorName: 'Grunt', templateId: 't1', templateName: 'Soldier',
      applied: { name: 'Soldier', characteristics: { ws: 5 }, itemIds: ['i1'], itemsByType: { skill: 2, spell: 0, talent: 1, trait: 0, trapping: 3 } },
      operationId: 'op-at1', createdDocumentIds: ['i1'], updatedDocumentIds: ['a1'], deletedDocumentIds: [], warnings: [],
    })),
    args: { actorId: 'a1', templateUuid: 'Compendium.wfrp4e-owb1.items.Item.t1' },
  },
  {
    toolName: 'apply-template-to-token',
    makeTool: () => new ApplyTemplateToTokenTool(makeToolDeps({
      templateId: 't1', templateName: 'Soldier', tokenId: 'tok1', actorId: 'a1', actorName: 'Goblin', sceneId: 's1',
      applied: { itemsByType: { skill: 2, talent: 1, spell: 0, trapping: 3 }, items: [] },
      operationId: 'op-att1', createdDocumentIds: [], updatedDocumentIds: ['a1', 'tok1'], deletedDocumentIds: [], warnings: [],
    })),
    args: { sceneId: 's1', tokenId: 'tok1', templateUuid: 'Compendium.wfrp4e-owb1.items.Item.t1' },
  },
  {
    toolName: 'apply-damage',
    makeTool: () => new ApplyDamageTool(makeToolDeps({
      actorId: 'a1', damage: { amount: 5, damageType: 'NORMAL', hitLocation: 'body' }, before: STATUS, after: { ...STATUS, wounds: { value: 5, max: 15 } },
    })),
    args: { actorId: 'a1', amount: 5, damageType: 'NORMAL', hitLocation: 'body' },
  },
  {
    toolName: 'update-actor',
    makeTool: () => new UpdateActorTool(makeToolDeps({ success: true, actorId: 'a1', actorName: 'Grunt', updated: ['system.characteristics.ws.advances'] })),
    args: { actorId: 'a1', updateData: { 'system.characteristics.ws.advances': 3 } },
  },
  {
    toolName: 'update-item',
    makeTool: () => new UpdateItemTool(makeToolDeps({ success: true, scope: 'actor', actorId: 'a1', itemId: 'i1', itemName: 'Sword', updated: ['system.advances.value'] })),
    args: { actorId: 'a1', itemId: 'i1', updateData: { 'system.advances.value': 2 } },
  },
  {
    toolName: 'create-custom-item',
    makeTool: () => new CreateCustomItemTool(makeToolDeps({
      success: true, scope: 'world', itemId: 'i1', itemName: 'Fire Sword', itemType: 'weapon', folderId: null, folderPath: [],
      operationId: 'op-cci1', createdDocumentIds: ['i1'], updatedDocumentIds: [], deletedDocumentIds: [], warnings: [],
    })),
    args: { itemType: 'weapon', name: 'Fire Sword', destination: { type: 'world' } },
  },
  {
    toolName: 'add-active-effect',
    makeTool: () => new AddActiveEffectTool(makeToolDeps({
      success: true, scope: 'actor', actorId: 'a1', itemId: 'i1', itemName: 'Dagger', effectId: 'e1', effectName: 'Poison',
    })),
    args: { target: { scope: 'actor', actorName: 'Grunt', itemName: 'Dagger' }, effect: { name: 'Poison', trigger: 'applyDamage' } },
  },
  {
    toolName: 'update-active-effect',
    makeTool: () => new UpdateActiveEffectTool(makeToolDeps({
      success: true, scope: 'actor', actorId: 'a1', itemId: 'i1', effectId: 'e1', effectName: 'Poison', updated: ['disabled'],
    })),
    args: { target: { scope: 'actor', actorName: 'Grunt', itemName: 'Dagger' }, effectId: 'e1', updates: { disabled: true } },
  },
  {
    toolName: 'delete-active-effect',
    makeTool: () => new DeleteActiveEffectTool(makeToolDeps({
      success: true, scope: 'actor', actorId: 'a1', itemId: 'i1', effectId: 'e1', effectName: 'Poison',
    })),
    args: { target: { scope: 'actor', actorName: 'Grunt', itemName: 'Dagger' }, effectId: 'e1' },
  },
  {
    toolName: 'create-actor-from-compendium',
    makeTool: () => new ActorCreationTools(makeToolDeps({
      // Real createActorFromCompendium summaries carry { id, name, originalName } — NO `type` (BUG-390).
      totalCreated: 1, totalRequested: 1, tokensPlaced: 0, actors: [{ id: 'a1', name: 'Bob', originalName: 'Goblin' }], errors: [],
      // Phase 12 R12.2: receipt forwarded through formatSimpleActorCreationResponse.
      operationId: 'op-cafc1', createdDocumentIds: ['a1'], updatedDocumentIds: [], deletedDocumentIds: [], warnings: [],
    })),
    args: { packId: 'wfrp4e-core.bestiary', itemId: 'item1234567890ab', names: ['Bob'] },
  },
  {
    toolName: 'advance-combat',
    makeTool: () => new ManageCombatTools(makeToolDeps({ combatId: 'cmb1', round: 1, turn: null, combatantId: null })),
    args: { action: 'next' },
  },
  {
    toolName: 'add-combatants',
    // Phase 12 R12.2: combatId now surfaced + receipt (createdDocumentIds = combatants + any new combat).
    makeTool: () => new ManageCombatTools(makeToolDeps({
      added: ['c1'], combatId: 'cmb1',
      operationId: 'op-ac1', createdDocumentIds: ['c1'], updatedDocumentIds: [], deletedDocumentIds: [], warnings: [],
    })),
    args: { actorIds: ['a1'] },
  },
  {
    toolName: 'remove-combatants',
    makeTool: () => new ManageCombatTools(makeToolDeps({ removed: ['c1'] })),
    args: { combatantIds: ['c1'] },
  },
  {
    toolName: 'end-combat',
    makeTool: () => new ManageCombatTools(makeToolDeps({ ended: 'cmb1' })),
    args: {},
  },
  {
    toolName: 'apply-condition',
    makeTool: () => new ManageConditionsTools(makeToolDeps({ actorId: 'a1', conditionKey: 'bleeding', stackCount: 1 })),
    args: { actorId: 'a1', conditionKey: 'bleeding' },
  },
  {
    toolName: 'remove-condition',
    makeTool: () => new ManageConditionsTools(makeToolDeps({ actorId: 'a1', conditionKey: 'bleeding', remainingCount: 0 })),
    args: { actorId: 'a1', conditionKey: 'bleeding' },
  },
  {
    toolName: 'region',
    makeTool: () => new RegionTool(makeToolDeps({ deletedId: 'r1', sceneId: 's1', remainingRegions: 0 })),
    args: { action: 'delete', sceneId: 's1', regionId: 'r1' },
  },
  {
    toolName: 'module-matt',
    makeTool: () => new ModuleMattTool(makeToolDeps({ uuid: 'Scene.s1.Tile.t1', tileId: 't1', variables: { phase: 1 } })),
    args: { action: 'set-variables', tileUuid: 'Scene.s1.Tile.t1', variables: { phase: 1 } },
  },
  {
    toolName: 'imperial-arcana',
    // record-reading is the write action; structuredContent = the CCR-10 record data (passthrough outputSchema).
    makeTool: () => new ModuleImperialArcanaTool(makeToolDeps({
      journalId: 'ImperialRecord00', name: 'Reading: The Three Omens — 2026-06-21',
      flags: { schemaVersion: 1, numerals: [4, 32, 33], spread: 'A', dominantOmen: 32, ninefold: false, conjunctions: ['4|32'], linkedUuids: [] },
    })),
    args: { action: 'record-reading', spread: 'A', numerals: [4, 32, 33], dominantOmen: 32 },
  },
];

describe('Phase 11 R11.1 — outputSchema ↔ structuredContent conformance', () => {
  for (const c of CASES) {
    it(`${c.toolName} returns structuredContent that validates against its outputSchema`, async () => {
      const tool = c.makeTool();
      const reg = tool.getRegistration().find((r: any) => r.name === c.toolName);
      expect(reg, `registration for ${c.toolName}`).toBeTruthy();
      const result = await reg.handler(c.args);

      // Not an error envelope.
      expect(result.isError, `${c.toolName} returned an error envelope: ${JSON.stringify(result)}`).toBeFalsy();
      // structuredContent present.
      expect(result.structuredContent, `${c.toolName} missing structuredContent`).toBeTruthy();

      // Validate against the declared outputSchema.
      const def = tool.getToolDefinitions().find((d: any) => d.name === c.toolName);
      expect(def?.outputSchema, `${c.toolName} missing outputSchema`).toBeTruthy();
      const validate = ajv.compile(def.outputSchema);
      const ok = validate(result.structuredContent);
      expect(ok, `${c.toolName} structuredContent failed outputSchema: ${JSON.stringify(validate.errors)}`).toBe(true);
    });
  }

  it('covers ≥18 wired mutation tools', () => {
    expect(CASES.length).toBeGreaterThanOrEqual(18);
  });
});
