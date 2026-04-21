// Scene handler input schemas + scene value schemas.
// CCR-4 per-domain file. Input schemas use .strict() per CCR-5.

import { z } from 'zod';
import { ApplyTemplateInput } from './actor.js';

export const SceneTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  actorId: z.string().optional(),
  img: z.string(),
  hidden: z.boolean(),
  disposition: z.number(),
});

export const SceneNoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number(),
  y: z.number(),
});

export const SceneInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  img: z.string().optional(),
  background: z.string().optional(),
  width: z.number(),
  height: z.number(),
  padding: z.number(),
  active: z.boolean(),
  navigation: z.boolean(),
  tokens: z.array(SceneTokenSchema),
  walls: z.number(),
  lights: z.number(),
  sounds: z.number(),
  notes: z.array(SceneNoteSchema),
});

// Handler inputs (.strict())

export const GetActiveSceneInput = z.object({}).strict();

export const ListScenesInput = z.object({
  filter: z.string().optional(),
  include_active_only: z.boolean().optional(),
}).strict();

export const SwitchSceneInput = z.object({
  scene_identifier: z.string(),
  optimize_view: z.boolean().optional(),
}).strict();

// BUG-051 hotfix (prototype-token pattern): `quantities` is a parallel array to `actorIds`
// — quantities[i] = number of tokens to drop for actorIds[i]. Missing/undefined → 1 (back-compat).
// Lets one world actor with `prototypeToken.actorLink: false` produce N unlinked tokens,
// each carrying its own ActorDelta (independent HP / conditions, shared sheet).
export const AddActorsToSceneInput = z.object({
  actorIds: z.array(z.string()).min(1),
  quantities: z.array(z.number().int().positive()).optional(),
  placement: z.enum(['random', 'grid', 'center']).optional(),
  hidden: z.boolean().optional(),
}).strict().refine(
  (v) => v.quantities === undefined || v.quantities.length === v.actorIds.length,
  { message: 'quantities must have the same length as actorIds' },
);

// BUG-051 hotfix companion — delete a single token on a scene. Thin pass-through;
// pairs with addActorsToScene for encounter unwind and orphan-token cleanup.
export const DeleteTokenInput = z.object({
  sceneId: z.string().min(1),
  tokenId: z.string().min(1),
}).strict();

// Prototype-sheet routing primitive: apply a template to a single unlinked token's
// ActorDelta rather than a world actor. /wfrp-encounter-builder uses this when
// multiple entries share a base creature but vary templates/weapons per entry —
// one world actor + N unlinked tokens + N per-token template calls avoids N-actor
// sidebar pollution. Rejects tokens with actorLink=true (their delta is a passthrough
// to the world actor; writes would appear to succeed but be semantically wrong).
// Shape stays in lockstep with ApplyTemplateInput so both primitives evolve together.
export const ApplyTemplateToTokenInput = z.object({
  sceneId: z.string().min(1),
  tokenId: z.string().min(1),
  templateUuid: ApplyTemplateInput.shape.templateUuid,
  preResolvedChoices: ApplyTemplateInput.shape.preResolvedChoices,
}).strict();
