// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 5B — package-local Zod schema for module-sequencer.
//
// CCR-5: module-specific schemas stay package-local.
// SA2 macro-guard correction: section type allowlist, NOT a type:"macro" denylist.
//   Allowed section types: ["effect","sound","scrollingText","canvasPan","wait"]
//   .macro() creates FunctionSection — NOT serializable, toJSON() THROWS on it.
// Confirm required on destructive broadcast/scene-level actions (CCR-4).
// .strict() rejects unknown top-level keys.

import { z } from 'zod';

// Allowed serializable section types (SA2 allowlist — deny everything else)
const ALLOWED_SECTION_TYPES = ['effect', 'sound', 'scrollingText', 'canvasPan', 'wait'] as const;
type AllowedSectionType = (typeof ALLOWED_SECTION_TYPES)[number];

// A single sequence section node (type must be in allowlist)
const SequenceSection = z.object({
  type: z.string(),
}).passthrough(); // additional fields allowed — handler validates type allowlist

// EffectManager / SoundManager filter params
const EffectFilter = z.object({
  name: z.string().optional(),
  sceneId: z.string().optional(),
  source: z.string().optional(),
  target: z.string().optional(),
  origin: z.string().optional(),
  effects: z.array(z.unknown()).optional(),
}).strict();

const SoundFilter = z.object({
  name: z.string().optional(),
  sceneId: z.string().optional(),
  effects: z.array(z.unknown()).optional(), // SoundManager reuses 'effects' key for its array param
}).strict();

export const ModuleSequencerInput = z.discriminatedUnion('action', [
  // play-sequence-json — session-transport; macro-node ALLOWLIST guard required
  z.object({
    action: z.literal('play-sequence-json'),
    sequence: z.array(SequenceSection).min(1),
    options: z.record(z.unknown()).optional(),
  }).strict(),

  // EffectManager actions
  z.object({ action: z.literal('end-effects'), filter: EffectFilter.optional(), confirm: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('end-all-effects'), sceneId: z.string().optional(), confirm: z.boolean() }).strict(),
  z.object({ action: z.literal('get-effects'), filter: EffectFilter.optional() }).strict(),
  z.object({ action: z.literal('update-effects'), filter: EffectFilter.optional(), updates: z.record(z.unknown()).optional() }).strict(),

  // SoundManager actions
  z.object({ action: z.literal('play-sound'), file: z.string().min(1), options: z.record(z.unknown()).optional() }).strict(),
  z.object({ action: z.literal('end-sounds'), filter: SoundFilter.optional() }).strict(),
  // Sequencer 4.2.x dropped the sceneId param from SoundManager.endAllSounds — it now ends all sounds globally.
  z.object({ action: z.literal('end-all-sounds'), confirm: z.boolean() }).strict(),
  z.object({ action: z.literal('get-sounds'), filter: SoundFilter.optional() }).strict(),

  // Database actions (read-only)
  z.object({ action: z.literal('database-search'), path: z.string().min(1) }).strict(),
  z.object({ action: z.literal('database-get-paths'), path: z.string().min(1) }).strict(),
  z.object({ action: z.literal('database-entry-exists'), path: z.string().min(1) }).strict(),
  z.object({ action: z.literal('database-get-entry'), path: z.string().min(1), softFail: z.boolean().optional() }).strict(),

  // Preloader
  z.object({ action: z.literal('preload'), files: z.array(z.string().min(1)).min(1), showProgressBar: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('preload-for-clients'), files: z.array(z.string().min(1)).min(1), showProgressBar: z.boolean().optional(), confirm: z.boolean() }).strict(),

  // Permission write
  z.object({
    action: z.literal('permission-write'),
    key: z.enum(['permissions-effect-create', 'permissions-effect-delete', 'permissions-sound-create', 'permissions-preload', 'permissions-sidebar-tools']),
    value: z.number().int().min(0).max(3),
  }).strict(),
]);

export type ModuleSequencerInputType = z.infer<typeof ModuleSequencerInput>;
export { ALLOWED_SECTION_TYPES };
export type { AllowedSectionType };
