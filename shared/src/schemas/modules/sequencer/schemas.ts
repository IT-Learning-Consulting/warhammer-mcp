// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 5B — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-sequencer.
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2).
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

// BUG-792: live Sequencer v4.2.2 SoundManager._validateFilters expects `sounds` (plus supports
// `origin`), NOT `effects` — the schema previously exposed `effects`, which upstream silently
// ignores, so an intended single-sound-scoped filter fell through to the default whole-scene
// filter and stopped every sound on the scene.
const SoundFilter = z.object({
  name: z.string().optional(),
  sceneId: z.string().optional(),
  origin: z.string().optional(),
  sounds: z.array(z.unknown()).optional(),
}).strict();

export const ModuleSequencerInput = z.discriminatedUnion('action', [
  // play-sequence-json — session-transport; macro-node ALLOWLIST guard required
  // BUG-793: `Sequence.play()`'s ONLY options are {remote, preload, local} (live Sequencer
  // v4.2.2 sequencer.js:27719, confirmed by typings/types.d.ts PlayOptions) — remote/preload
  // smuggle a broadcast/preload straight past the DoS-gated preload-for-clients action, and
  // local has no legitimate use here either. No safe key remains, so options is an empty
  // .strict({}) allowlist: kept for wire-compat, rejects every key.
  z.object({
    action: z.literal('play-sequence-json'),
    sequence: z.array(SequenceSection).min(1),
    options: z.object({}).strict().optional(),
  }).strict(),

  // EffectManager actions
  // BUG-791: an omitted/empty filter matches every effect on the viewed scene — same
  // destructive-confirmation-bypass shape as end-all-effects, so `confirm` is required here too
  // whenever the effective filter doesn't genuinely narrow the scope (handler-enforced).
  z.object({ action: z.literal('end-effects'), filter: EffectFilter.optional(), confirm: z.boolean().optional() }).strict(),
  // BUG-810: confirm optional at parse time (matches sibling 'end-effects' above and the
  // repaired AA play-animation pattern) — the handler's `if (input.confirm !== true)` gate
  // already treats undefined identically to false, so omitting confirm now reaches the clean
  // CONFIRM_REQUIRED token instead of throwing a raw Zod validation error first.
  z.object({ action: z.literal('end-all-effects'), sceneId: z.string().optional(), confirm: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('get-effects'), filter: EffectFilter.optional() }).strict(),
  z.object({ action: z.literal('update-effects'), filter: EffectFilter.optional(), updates: z.record(z.unknown()).optional() }).strict(),

  // SoundManager actions
  // BUG-793: play-sound's `options` reaches the identical Sequence.play({remote,preload,local})
  // call (handler wraps `new Sequence().sound(file)` then `seq.play(options)`) — same hole,
  // same fix: empty .strict({}) allowlist (see play-sequence-json note above).
  z.object({ action: z.literal('play-sound'), file: z.string().min(1), options: z.object({}).strict().optional() }).strict(),
  // BUG-791: same destructive-confirmation-bypass shape as end-all-sounds — confirm required
  // whenever the effective filter doesn't genuinely narrow the scope (handler-enforced).
  z.object({ action: z.literal('end-sounds'), filter: SoundFilter.optional(), confirm: z.boolean().optional() }).strict(),
  // Sequencer 4.2.x dropped the sceneId param from SoundManager.endAllSounds — it now ends all sounds globally.
  // BUG-810: confirm optional at parse time — same reasoning as end-all-effects above.
  z.object({ action: z.literal('end-all-sounds'), confirm: z.boolean().optional() }).strict(),
  z.object({ action: z.literal('get-sounds'), filter: SoundFilter.optional() }).strict(),

  // Database actions (read-only)
  z.object({ action: z.literal('database-search'), path: z.string().min(1) }).strict(),
  z.object({ action: z.literal('database-get-paths'), path: z.string().min(1) }).strict(),
  z.object({ action: z.literal('database-entry-exists'), path: z.string().min(1) }).strict(),
  z.object({ action: z.literal('database-get-entry'), path: z.string().min(1), softFail: z.boolean().optional() }).strict(),

  // Preloader
  z.object({ action: z.literal('preload'), files: z.array(z.string().min(1)).min(1), showProgressBar: z.boolean().optional() }).strict(),
  // BUG-810: confirm optional at parse time — same reasoning as end-all-effects above.
  z.object({ action: z.literal('preload-for-clients'), files: z.array(z.string().min(1)).min(1), showProgressBar: z.boolean().optional(), confirm: z.boolean().optional() }).strict(),

  // Permission write
  // BUG-802: writes a world permission setting (GM-authorization change) with no confirm gate,
  // no preview, and no reload signal — confirm-gated below (handler previews currentValue vs
  // requestedValue and returns reloadRequired:true on the confirmed write; sequencer.ts).
  z.object({
    action: z.literal('permission-write'),
    key: z.enum(['permissions-effect-create', 'permissions-effect-delete', 'permissions-sound-create', 'permissions-preload', 'permissions-sidebar-tools']),
    value: z.number().int().min(0).max(3),
    confirm: z.boolean().optional(),  // CONFIRM-GATE(permission-write):
  }).strict(),
]);

export type ModuleSequencerInputType = z.infer<typeof ModuleSequencerInput>;
export { ALLOWED_SECTION_TYPES };
export type { AllowedSectionType };
