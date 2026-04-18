// Scene handler input schemas + scene value schemas.
// CCR-4 per-domain file. Input schemas use .strict() per CCR-5.

import { z } from 'zod';

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

export const AddActorsToSceneInput = z.object({
  actorIds: z.array(z.string()).min(1),
  placement: z.enum(['random', 'grid', 'center']).optional(),
  hidden: z.boolean().optional(),
}).strict();
