// Actor / character handler input schemas + character info value schemas.
// CCR-4 per-domain file. Input schemas use .strict() per CCR-5.

import { z } from 'zod';

export const CharacterItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  img: z.string().optional(),
  system: z.record(z.unknown()),
});

export const CharacterEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  disabled: z.boolean(),
  duration: z.object({
    type: z.string(),
    duration: z.number().optional(),
    remaining: z.number().optional(),
  }).optional(),
});

export const CharacterInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  img: z.string().optional(),
  system: z.record(z.unknown()),
  items: z.array(CharacterItemSchema),
  effects: z.array(CharacterEffectSchema),
});

// Handler inputs (.strict())

export const GetCharacterInfoInput = z.object({
  characterName: z.string().optional(),
  characterId: z.string().optional(),
}).strict();

export const ListActorsInput = z.object({
  type: z.string().optional(),
}).strict();

export const CreateActorInput = z.object({
  actorData: z.record(z.unknown()),
  folderId: z.string().optional(),
}).strict();

export const UpdateActorInput = z.object({
  actorId: z.string(),
  updateData: z.record(z.unknown()),
}).strict();

export const CreateActorFromCompendiumInput = z.object({
  packId: z.string(),
  itemId: z.string(),
  customNames: z.array(z.string()).optional(),
  quantity: z.number().optional(),
  addToScene: z.boolean().optional(),
  placement: z.object({
    type: z.enum(['random', 'grid', 'center', 'coordinates']),
    coordinates: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  }).optional(),
}).strict();

export const ValidateWritePermissionsInput = z.object({
  operation: z.enum(['createActor', 'modifyScene']),
}).strict();

export const SetActorOwnershipInput = z.object({
  actorId: z.string(),
  userId: z.string(),
  permission: z.union([z.string(), z.number()]),
}).strict();

export const GetActorOwnershipInput = z.object({
  actorId: z.string().optional(),
}).strict();

export const GetFriendlyNPCsInput = z.object({}).strict();

export const GetPartyCharactersInput = z.object({}).strict();

export const GetConnectedPlayersInput = z.object({}).strict();

export const FindPlayersInput = z.object({
  identifier: z.string(),
}).strict();

export const FindActorInput = z.object({
  identifier: z.string(),
}).strict();
