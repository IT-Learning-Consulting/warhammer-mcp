// Item handler input schemas. CCR-4 per-domain file. All .strict() per CCR-5.

import { z } from 'zod';

export const CreateItemInput = z.object({
  actorId: z.string(),
  itemData: z.record(z.unknown()),
}).strict();

export const UpdateItemInput = z.object({
  actorId: z.string(),
  itemId: z.string(),
  updateData: z.record(z.unknown()),
}).strict();

export const DeleteItemInput = z.object({
  actorId: z.string(),
  itemId: z.string(),
}).strict();

const QualityEntry = z.object({
  name: z.string(),
  value: z.number().optional(),
});

export const ModifyItemQualitiesInput = z.object({
  characterName: z.string(),
  itemName: z.string(),
  addQualities: z.array(QualityEntry),
  removeQualities: z.array(z.string()),
  addFlaws: z.array(QualityEntry),
  removeFlaws: z.array(z.string()),
}).strict();

export const AddItemFromCompendiumInput = z.object({
  actorId: z.string(),
  compendiumId: z.string(),
}).strict();
