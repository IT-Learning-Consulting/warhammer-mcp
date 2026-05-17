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
  // HC9: passthrough to Foundry Actor.create(data, options). Required by
  // /wfrp-build-npc --with-details to suppress wfrp4e ActorWFRP4e._preCreate
  // basic-skills DialogV2.confirm on npc/creature creation. See
  // phase3_system_hooks_audit §1 + §8. Mirror of BUG-089 (Item.update options).
  options: z.object({
    skipItems: z.boolean().optional(),
  }).strict().optional(),
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

/**
 * @deprecated Phase 1 mcp_crud_expansion (2026-05-14). Use `SetDocumentOwnershipInput`
 * from `./ownership.ts` with `{documentType: 'actor', ...}`. Kept exported solely so
 * the Foundry-side deprecation-wrapper handlers (`handleSetActorOwnership`) can still
 * parse legacy input shapes and return a deprecation error per PRD R1.5.
 */
export const SetActorOwnershipInput = z.object({
  actorId: z.string(),
  userId: z.string(),
  permission: z.union([z.string(), z.number()]),
}).strict();

/**
 * @deprecated Phase 1 mcp_crud_expansion (2026-05-14). Use `GetDocumentOwnershipInput`
 * from `./ownership.ts` with `{documentType: 'actor', ...}`. Kept exported solely for
 * the deprecation-wrapper handler.
 */
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

// Phase 4g — /wfrp-build-npc primitives.

export const DuplicateActorInput = z.object({
  sourceActorId: z.string(),
  newName: z.string().optional(),
}).strict();

export const ApplyNpcCareerAdvanceInput = z.object({
  actorId: z.string(),
  careerItemId: z.string(),
}).strict();

export const ListActorItemsInput = z.object({
  actorId: z.string(),
  typeFilter: z.string().optional(),
}).strict();

// Phase 4h — /wfrp-encounter-builder template-composition primitive.
// BUG-051 post-hotfix: `specialisations` also overrides `(Any)` wildcard resolution.
// For a skill named `Melee (Any)` in the template, `specialisations["Melee (Any)"] = ["Basic"]`
// resolves to `Melee (Basic)` (first array entry wins; bypasses the random pick / lore+trapping
// correlation). Multi-spec expansion (the original use, skill.specialisations > 1) still uses
// the base-name key (e.g. `specialisations["Melee"] = ["Melee (Basic)", "Melee (Polearm)"]`).
// Both key conventions coexist — wildcard key is the full `(Any)`-suffixed name; expansion key
// is the bare base name. Resolution order: override → lore/weapon-group correlation → random.
export const ApplyTemplateInput = z.object({
  actorId: z.string(),
  templateUuid: z.string(),
  preResolvedChoices: z.object({
    skillGroups:     z.record(z.string()).optional(),
    talentGroups:    z.record(z.string()).optional(),
    specialisations: z.record(z.array(z.string())).optional(),
    lores:           z.array(z.string()).optional(),
    spells:          z.record(z.array(z.string())).optional(),
    trappings:       z.record(z.string()).optional(),
  }).strict().optional(),
}).strict();
