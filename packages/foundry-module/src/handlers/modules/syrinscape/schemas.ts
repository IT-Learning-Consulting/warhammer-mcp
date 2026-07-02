// Module Integration v2 Phase 13C — package-local Zod schema for module-syrinscape (Syrinscape Control v1.0.5, Zhell).
//
// CCR-5: module-specific schemas stay package-local. Every variant is a plain `.strict()` ZodObject (NO
// `.refine`/`.transform` on a discriminatedUnion member).
//
// 8 actions (phase13_pre_plan.md §13C, Q3 answer — 6-action lean + 2 optional cache-read list actions):
//   set-mood / stop-mood / play-element / stop-element (id: string) — direct globalThis.syrinscapeControl.utils.*.
//   stop-all (no args).
//   is-playing (elementId: string) — pure in-memory storage.isPlaying read, no auth needed.
//   list-soundsets (no args) / list-moods (soundsetName?: string) — cache reads of the `bulkData`/`soundsetInfo`
//   world settings, NEVER the REST `sound.*` methods (gap-fill: those need auth and can throw pre-null-check).
//
// Source of truth: .agents/research/module_integration/phase13_pre_plan.md §13C + Post-Q&A gap-fill.

import { z } from 'zod';

export const SYRINSCAPE_ACTIONS = [
  'set-mood',
  'stop-mood',
  'play-element',
  'stop-element',
  'stop-all',
  'is-playing',
  'list-soundsets',
  'list-moods',
] as const;

export type SyrinscapeAction = (typeof SYRINSCAPE_ACTIONS)[number];

export const SyrinscapeInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('set-mood'), id: z.string().min(1) }).strict(),
  z.object({ action: z.literal('stop-mood'), id: z.string().min(1) }).strict(),
  z.object({ action: z.literal('play-element'), id: z.string().min(1) }).strict(),
  z.object({ action: z.literal('stop-element'), id: z.string().min(1) }).strict(),
  z.object({ action: z.literal('stop-all') }).strict(),
  z.object({ action: z.literal('is-playing'), elementId: z.string().min(1) }).strict(),
  z.object({ action: z.literal('list-soundsets') }).strict(),
  z.object({ action: z.literal('list-moods'), soundsetName: z.string().min(1).optional() }).strict(),
]);

export type SyrinscapeInputType = z.infer<typeof SyrinscapeInput>;

export const PLAY_ACTIONS = new Set(['set-mood', 'stop-mood', 'play-element', 'stop-element', 'stop-all']);
