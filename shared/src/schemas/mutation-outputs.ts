import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  ApplyTemplateOutput,
  CreateActorFromCompendiumOutput,
  AdvanceCombatOutput,
  AddCombatantsOutput,
  RemoveCombatantsOutput,
  EndCombatOutput,
  ApplyConditionOutput,
  RemoveConditionOutput,
} from './outputs.js';
// apply-damage already has a faithful DTO in combat.ts (Phase 9) — reuse it (DRY)
// rather than redefining. StatusSnapshot is strip-mode, so `.parse()` never throws
// on extra Foundry status fields (e.g. resilience/resolve).
import { ApplyDamageOutput } from './combat.js';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 11 (R11.1 / CCR-Output-Schema): mutation-tool output DTOs + the
// zodToJsonSchema consts wired into 18 mutation tools' `getToolDefinitions()`.
//
// Lives in a SEPARATE file from outputs.ts (already 430 lines, ESLint WARN at
// 400) so this stays under the 400-line ERROR cap for NEW files. The 8 mutation
// DTOs that already shipped in Phase 9 (apply-template / create-actor-from-
// compendium / 4 combat / 2 condition) are imported from ./outputs.js — their
// `*_OUTPUT_JSON_SCHEMA` consts are generated HERE so outputs.ts stays untouched.
//
// All DTOs are `.passthrough()` (forward-compatible against future Foundry
// fields). Required fields are limited to those present in EVERY characterization
// snapshot variant (the derived ground truth) so `.parse()` never throws on a
// real return that omits an optional/variant field (PRD over-narrowing Risk).
// region/MATT get a permissive `z.object({}).passthrough()` — multi-action
// umbrellas whose ~6/~10 per-action shapes would need a union; a tight schema
// sharply raises `.parse()`-throw risk for near-zero contract value (user Q&A
// 2026-06-17).
// ─────────────────────────────────────────────────────────────────────────────

// --- JSON-schema consts for the 8 already-shipped Phase-9 DTOs ---
export const APPLY_TEMPLATE_OUTPUT_JSON_SCHEMA = zodToJsonSchema(ApplyTemplateOutput, { target: 'jsonSchema7' });
export const CREATE_ACTOR_FROM_COMPENDIUM_OUTPUT_JSON_SCHEMA = zodToJsonSchema(CreateActorFromCompendiumOutput, { target: 'jsonSchema7' });
export const ADVANCE_COMBAT_OUTPUT_JSON_SCHEMA = zodToJsonSchema(AdvanceCombatOutput, { target: 'jsonSchema7' });
export const ADD_COMBATANTS_OUTPUT_JSON_SCHEMA = zodToJsonSchema(AddCombatantsOutput, { target: 'jsonSchema7' });
export const REMOVE_COMBATANTS_OUTPUT_JSON_SCHEMA = zodToJsonSchema(RemoveCombatantsOutput, { target: 'jsonSchema7' });
export const END_COMBAT_OUTPUT_JSON_SCHEMA = zodToJsonSchema(EndCombatOutput, { target: 'jsonSchema7' });
export const APPLY_CONDITION_OUTPUT_JSON_SCHEMA = zodToJsonSchema(ApplyConditionOutput, { target: 'jsonSchema7' });
export const REMOVE_CONDITION_OUTPUT_JSON_SCHEMA = zodToJsonSchema(RemoveConditionOutput, { target: 'jsonSchema7' });

// --- apply-template-to-token.ts (token-delta variant of apply-template) ---
export const ApplyTemplateToTokenOutput = z.object({
  templateId: z.string().optional(),
  templateName: z.string().optional(),
  tokenId: z.string().optional(),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  sceneId: z.string().optional(),
  applied: z.object({
    // Keys optional (defensive parity with ApplyTemplateOutput) — tolerate a
    // zero-item token apply where the count map may be partial.
    itemsByType: z.object({
      skill: z.number().optional(),
      talent: z.number().optional(),
      spell: z.number().optional(),
      trapping: z.number().optional(),
    }).passthrough(),
    items: z.array(z.any()).optional(),
  }).passthrough().optional(),
}).passthrough();
export type ApplyTemplateToTokenOutputType = z.infer<typeof ApplyTemplateToTokenOutput>;

// --- update-actor.ts (raw passthrough; faithful to ActorService.updateActor,
//     services/actor.ts:623 — { success, actorId, actorName, updated: string[] }).
//     BUG-390: the prior { updated: boolean, verified: boolean } was a snapshot
//     fiction — `updated` is the array of changed paths and `verified` never existed. ---
export const UpdateActorOutput = z.object({
  actorId: z.string(),
  updated: z.array(z.string()),
  success: z.boolean().optional(),
  actorName: z.string().optional(),
}).passthrough();
export type UpdateActorOutputType = z.infer<typeof UpdateActorOutput>;

// --- update-item.ts (raw passthrough; faithful to ItemService.updateItem,
//     services/item.ts:113 — { success, scope, actorId(nullable), itemId, itemName,
//     updated: string[] }). BUG-390: prior { updated: boolean, verified: boolean }
//     was a snapshot fiction. ---
export const UpdateItemOutput = z.object({
  itemId: z.string(),
  updated: z.array(z.string()),
  success: z.boolean().optional(),
  scope: z.string().optional(),
  actorId: z.string().nullable().optional(), // null for world-scope items
  itemName: z.string().optional(),
}).passthrough();
export type UpdateItemOutputType = z.infer<typeof UpdateItemOutput>;

// --- create-custom-item.ts (envelope structuredContent; from formatResult) ---
export const CreateCustomItemOutput = z.object({
  success: z.boolean(),
  scope: z.string(),
  itemId: z.string().nullable(),
  itemName: z.string(),
  itemType: z.string(),
  folderId: z.string().nullable().optional(),   // world scope
  folderPath: z.array(z.string()).optional(),    // world scope
  actorId: z.string().nullable().optional(),     // actor scope
  actorName: z.string().nullable().optional(),   // actor scope
  itemData: z.any().optional(),                  // returnFullPayload only
  effectIds: z.any().optional(),                 // returnFullPayload only
}).passthrough();
export type CreateCustomItemOutputType = z.infer<typeof CreateCustomItemOutput>;

// --- add-active-effect.ts (raw passthrough; faithful to EffectsService.addActiveEffect,
//     services/effects.ts:58-173 — multi-branch: { success, scope, actorId(nullable),
//     effectId(nullable), effectName, itemId?, itemName?, actorName?, parentType?,
//     fired?, autoDeleted?, effectData? }). BUG-390: prior parentId/parentName never
//     existed and effectId can be null on self-deleting immediate effects. ---
export const AddActiveEffectOutput = z.object({
  effectId: z.string().nullable(),
  effectName: z.string(),
  success: z.boolean().optional(),
  scope: z.string().optional(),
  parentType: z.string().optional(),
  actorId: z.string().nullable().optional(),
  actorName: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
  itemName: z.string().nullable().optional(),
  fired: z.boolean().optional(),
  autoDeleted: z.boolean().optional(),
  effectData: z.any().optional(), // returnFullPayload only
}).passthrough();
export type AddActiveEffectOutputType = z.infer<typeof AddActiveEffectOutput>;

// --- update-active-effect.ts (raw passthrough; faithful to EffectsService.updateActiveEffect,
//     services/effects.ts:399 — { success, scope, actorId(nullable), itemId, effectId,
//     effectName, updated: string[], effectData? }). BUG-390: the real field is `updated`
//     (a string[]), NOT `updatedFields`; parentId/parentName/parentType never existed. ---
export const UpdateActiveEffectOutput = z.object({
  effectId: z.string(),
  effectName: z.string(),
  success: z.boolean().optional(),
  scope: z.string().optional(),
  actorId: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
  updated: z.array(z.string()).optional(),
  effectData: z.any().optional(), // returnFullPayload only
}).passthrough();
export type UpdateActiveEffectOutputType = z.infer<typeof UpdateActiveEffectOutput>;

// --- delete-active-effect.ts (raw passthrough; faithful to EffectsService.deleteActiveEffect,
//     services/effects.ts:449-475 — { success, scope, actorId(nullable), itemId(nullable),
//     effectId, effectName, actorName?, parentType? }). BUG-390: prior `deleted`,
//     parentId, parentName never existed in the real return. ---
export const DeleteActiveEffectOutput = z.object({
  effectId: z.string(),
  effectName: z.string(),
  success: z.boolean().optional(),
  scope: z.string().optional(),
  parentType: z.string().optional(),
  actorId: z.string().nullable().optional(),
  actorName: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
}).passthrough();
export type DeleteActiveEffectOutputType = z.infer<typeof DeleteActiveEffectOutput>;

// --- region.ts (mutation paths) — permissive passthrough (user Q&A 2026-06-17) ---
export const RegionMutationOutput = z.object({}).passthrough();
export type RegionMutationOutputType = z.infer<typeof RegionMutationOutput>;

// --- modules/monks-active-tiles/matt.ts (mutation paths) — permissive passthrough ---
export const MattMutationOutput = z.object({}).passthrough();
export type MattMutationOutputType = z.infer<typeof MattMutationOutput>;

// --- JSON-schema consts for the 10 new DTOs ---
export const APPLY_DAMAGE_OUTPUT_JSON_SCHEMA = zodToJsonSchema(ApplyDamageOutput, { target: 'jsonSchema7' });
export const APPLY_TEMPLATE_TO_TOKEN_OUTPUT_JSON_SCHEMA = zodToJsonSchema(ApplyTemplateToTokenOutput, { target: 'jsonSchema7' });
export const UPDATE_ACTOR_OUTPUT_JSON_SCHEMA = zodToJsonSchema(UpdateActorOutput, { target: 'jsonSchema7' });
export const UPDATE_ITEM_OUTPUT_JSON_SCHEMA = zodToJsonSchema(UpdateItemOutput, { target: 'jsonSchema7' });
export const CREATE_CUSTOM_ITEM_OUTPUT_JSON_SCHEMA = zodToJsonSchema(CreateCustomItemOutput, { target: 'jsonSchema7' });
export const ADD_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA = zodToJsonSchema(AddActiveEffectOutput, { target: 'jsonSchema7' });
export const UPDATE_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA = zodToJsonSchema(UpdateActiveEffectOutput, { target: 'jsonSchema7' });
export const DELETE_ACTIVE_EFFECT_OUTPUT_JSON_SCHEMA = zodToJsonSchema(DeleteActiveEffectOutput, { target: 'jsonSchema7' });
export const REGION_MUTATION_OUTPUT_JSON_SCHEMA = zodToJsonSchema(RegionMutationOutput, { target: 'jsonSchema7' });
export const MATT_MUTATION_OUTPUT_JSON_SCHEMA = zodToJsonSchema(MattMutationOutput, { target: 'jsonSchema7' });
