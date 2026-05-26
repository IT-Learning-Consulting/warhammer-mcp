// Item handler input schemas. CCR-4 per-domain file. All .strict() per CCR-5.

import { z } from 'zod';
import { Destination } from './create-custom/destination.js';

// Phase 5 expansion: createItem now takes a destination discriminator
// (actor | world) + optional fromCompendium seed + optional returnFullPayload.
// Legacy `{actorId, itemData}` callers are migrated — the destination shape
// replaces the flat actorId.
export const CreateItemInput = z.object({
  itemData: z.record(z.unknown()),
  destination: Destination,
  fromCompendium: z.string().optional(),
  returnFullPayload: z.boolean().optional(),
}).strict();

// Phase 5 follow-up A: world-scope item update/delete.
// Legacy `{actorId, itemId, updateData}` callers (manage-character + 3 skill
// test suites) keep working because actorId is retained as optional. New
// callers pass `destination: Destination` to route actor-embedded vs. world
// lookup; itemName enables name-based resolution for world items whose id
// the caller doesn't track. Handler enforces: either `actorId` or
// `destination` must be present; either `itemId` or `itemName` must be
// present for the world branch.
export const UpdateItemInput = z.object({
  actorId: z.string().optional(),
  itemId: z.string().optional(),
  itemName: z.string().optional(),
  destination: Destination.optional(),
  updateData: z.record(z.unknown()),
  // BUG-089: passthrough to Foundry Item.update(data, options). Required by
  // /wfrp-build-pc --auto to suppress wfrp4e SkillModel._preUpdate advancement-cost
  // dialog on character skill-advance writes. See phase3_system_hooks_audit §E.
  options: z.object({
    skipExperienceChecks: z.boolean().optional(),
  }).strict().optional(),
  verifyPersistence: z.boolean().optional(),
}).strict();

export const DeleteItemInput = z.object({
  actorId: z.string().optional(),
  itemId: z.string().optional(),
  itemName: z.string().optional(),
  destination: Destination.optional(),
}).strict();

const QualityEntry = z.object({
  name: z.string(),
  value: z.number().optional(),
});

// Legacy modify-item-qualities input (actor-owned items only, character+name lookup).
// Retained for back-compat with the broken create-item.ts tool until Phase C deletes it.
// New callers should use ModifyItemQualitiesV2Input from ./modify-item-qualities.ts
// which supports the unified destination discriminator.
export const ModifyItemQualitiesInput = z.object({
  characterName: z.string().optional(),
  itemName: z.string().optional(),
  itemId: z.string().optional(),
  destination: Destination.optional(),
  addQualities: z.array(QualityEntry),
  removeQualities: z.array(z.string()),
  addFlaws: z.array(QualityEntry),
  removeFlaws: z.array(z.string()),
}).strict();

export const AddItemFromCompendiumInput = z.object({
  actorId: z.string(),
  itemUuid: z.string().optional(),
  compendiumId: z.string().optional(),
  skipSpecialisationChoice: z.boolean().optional(),
}).strict();
