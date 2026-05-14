import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const GetCharacterOutput = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  basicInfo: z.record(z.any()).optional(),
  stats: z.record(z.any()).optional(),
  conditions: z.object({
    injuries: z.array(z.any()).optional(),
    mutations: z.array(z.any()).optional(),
    diseases: z.array(z.any()).optional(),
    psychology: z.array(z.any()).optional(),
  }).passthrough().optional(),
  items: z.array(z.any()).optional(),
  effects: z.array(z.any()).optional(),
  hasImage: z.boolean().optional(),
}).passthrough();

export const SearchCompendiumOutput = z.object({
  query: z.string(),
  results: z.array(z.object({ id: z.string(), name: z.string() }).passthrough()),
  totalFound: z.number(),
  showing: z.number(),
  hasMore: z.boolean(),
}).passthrough();

export const GetCurrentSceneOutput = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  active: z.boolean().optional(),
}).passthrough();

export const GetWfrpConfigOutput = z.record(z.any());

export const GET_CHARACTER_OUTPUT_JSON_SCHEMA = zodToJsonSchema(GetCharacterOutput, { target: 'jsonSchema7' });
export const SEARCH_COMPENDIUM_OUTPUT_JSON_SCHEMA = zodToJsonSchema(SearchCompendiumOutput, { target: 'jsonSchema7' });
export const GET_CURRENT_SCENE_OUTPUT_JSON_SCHEMA = zodToJsonSchema(GetCurrentSceneOutput, { target: 'jsonSchema7' });
export const GET_WFRP_CONFIG_OUTPUT_JSON_SCHEMA = zodToJsonSchema(GetWfrpConfigOutput, { target: 'jsonSchema7' });
