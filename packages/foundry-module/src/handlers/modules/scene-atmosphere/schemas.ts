// Module Integration v1 Phase 6 — module-scene-atmosphere handler schemas.
//
// Discriminated union over the full ~65-action surface of the six atmosphere
// members: fxmaster / tokenmagic / scenery / scene-transitions / multiface-tiles /
// dynamic-soundscapes.
//
// Structure: each member phase adds a <member>-schemas.ts exporting an array of
// .strict() z.object variants keyed on action. This file spreads them all into the
// top-level discriminated union so later phases are file-isolated.
//
// Phase 1 — only `get-bundle-status` is defined here; all member variant arrays are
// empty stubs (commented insertion points). Expand per phase.
//
// CCR-5: module-specific schemas stay package-local.
// CCR-4: confirm-gated destructive actions defined per member phase.
// .strict() rejects unknown top-level keys on every variant.

import { z } from 'zod';
import { fxmasterVariants } from './fxmaster-schemas.js';
import { tokenmagicVariants } from './tokenmagic-schemas.js';
import { sceneryVariants } from './scenery-schemas.js';
import { sceneTransitionsVariants } from './scene-transitions-schemas.js';
import { multifaceTilesVariants } from './multiface-tiles-schemas.js';
import { dynamicSoundscapesVariants } from './dynamic-soundscapes-schemas.js';

// ── Phase 1 action: get-bundle-status ────────────────────────────────────────
//
// Always succeeds (unguarded). Returns active-state for all 6 bundle members.

const getBundleStatusInput = z.object({
  action: z.literal('get-bundle-status'),
}).strict();

// ── Member variant arrays (insertion points for phases 2–5) ──────────────────
//
// Phase 2 (fxmaster)          → fxmasterVariants imported above + spread below. ✓
// Phase 3 (tokenmagic/wounds) → tokenmagicVariants imported above + spread below. ✓
// Phase 4 (scenery/transitions/multiface-tiles) → import those arrays and spread.
// Phase 5 (dynamic-soundscapes) → import soundscapes array and spread below.
//
// Each member phase file exports:
//   export const <member>Variants: z.ZodObject<...>[] = [ ... ];
// This file spreads them into the discriminatedUnion tuple below.

// ── Discriminated union ───────────────────────────────────────────────────────

export const ModuleSceneAtmosphereInput = z.discriminatedUnion('action', [
  // Phase 1 always-available action
  getBundleStatusInput,

  // Phase 2: fxmaster actions
  ...fxmasterVariants,

  // Phase 3: tokenmagic + automatic-wounds companion actions
  ...tokenmagicVariants,

  // Phase 4B: scenery actions
  ...sceneryVariants,

  // Phase 4B: scene-transitions actions
  ...sceneTransitionsVariants,

  // Phase 4B: multiface-tiles actions
  ...multifaceTilesVariants,

  // Phase 5: dynamic-soundscapes actions
  ...dynamicSoundscapesVariants,
]);

export type ModuleSceneAtmosphereInputType = z.infer<typeof ModuleSceneAtmosphereInput>;

// ── Bundle member registry ───────────────────────────────────────────────────
//
// Authoritative list of the 6 atmosphere member module IDs.
// get-bundle-status iterates this array. Member phases use these IDs for
// ACTION_MEMBER_MAP entries and requireModuleActive / requireCompanionActive calls.

export const BUNDLE_MEMBERS = [
  'fxmaster',
  'tokenmagic',
  'scenery',
  'scene-transitions',
  'multiface-tiles',
  'dynamic-soundscapes',
] as const;

export type BundleMemberId = (typeof BUNDLE_MEMBERS)[number];
