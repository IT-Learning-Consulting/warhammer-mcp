// Compendium handler input schemas + compendium value schemas.
// CCR-4 per-domain file. Input schemas use .strict() per CCR-5.

import { z } from 'zod';

export const CompendiumSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  img: z.string().optional(),
  pack: z.string(),
  packLabel: z.string(),
  system: z.record(z.unknown()).optional(),
});

export const CompendiumPackSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  system: z.string(),
  private: z.boolean(),
});

const SearchFilters = z.object({
  challengeRating: z.union([
    z.number(),
    z.object({ min: z.number().optional(), max: z.number().optional() }),
  ]).optional(),
  creatureType: z.string().optional(),
  size: z.string().optional(),
  spellcaster: z.boolean().optional(),
});

// itemType field added here (optional, unused until 3d per plan task 1.3) so
// schema does not need to change twice between 3a and 3d.
export const SearchCompendiumInput = z.object({
  query: z.string(),
  packType: z.string().optional(),
  filters: SearchFilters.optional(),
  itemType: z.string().optional(),
}).strict();

export const ListCreaturesByCriteriaInput = z.object({
  challengeRating: z.union([
    z.number(),
    z.object({ min: z.number().optional(), max: z.number().optional() }),
  ]).optional(),
  creatureType: z.string().optional(),
  size: z.string().optional(),
  hasSpells: z.boolean().optional(),
  hasSpecialAbilities: z.boolean().optional(),
  limit: z.number().optional(),
}).strict();

export const GetAvailablePacksInput = z.object({}).strict();

export const GetCompendiumDocumentFullInput = z.object({
  packId: z.string(),
  documentId: z.string(),
}).strict();

export const GetEnhancedCreatureIndexInput = z.object({}).strict();
