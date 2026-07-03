// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 3B — package-local Zod schema for module-token-presentation
// (2-member bundle: boss-splash v1.2.1 + token-notes v3.0.1).
//
// CCR-5: module-specific schemas stay package-local. `.strict()` on every variant.
// CCR-12: two independently-activatable member modules under one umbrella. The handler maps each
// member-prefixed action → member id via ACTION_MEMBER_MAP and guards per-action; get-bundle-status
// is UNGUARDED (reachable when both members are inactive — mirror scene-atmosphere.ts).
//
// boss-splash actions (transient — NO document persisted; verify via game.bossSplash.currentOverlay):
//   boss-splash.show        — game.bossSplash.splashBoss(options). Requires ≥1 of actor/video/message+actorImg
//                             (handler-enforced, NOT via .refine()) to avoid the canvas.tokens.controlled
//                             fallback (boss-splash.js:313). timer is MS; world splashTimer setting is seconds.
//   boss-splash.close       — splashBoss({close:true}).
//   boss-splash.get-config  — read the 18 world settings.
//   boss-splash.set-config  — write one writable world setting (key,value).
//
// token-notes actions (pure flag writes — DP-16 verifiable via verifyFlagWrite):
//   token-notes.write-note   — flags.token-notes.notes on TokenDocument (scope:token) OR Actor (scope:actor).
//   token-notes.read-note    — getFlag("token-notes","notes").
//   token-notes.set-use-actor— flags.token-notes.useActor on TokenDocument.
//   token-notes.get-config   — read the world setting allowplayers.
//   token-notes.set-config   — write allowplayers (0|1|2).
//
// get-bundle-status — unguarded availability map of both members.
//
// discriminatedUnion variants MUST be plain ZodObjects (no .refine() — carry-forward §4).
//
// Source of truth: .agents/research/module_integration/phase3_pre_plan.md §3B +
// capability_audit/boss-splash.md (§Public API, §World settings) + capability_audit/token-notes.md (§3 flag model).

import { z } from 'zod';

export const TokenPresentationInput = z.discriminatedUnion('action', [
  // ── boss-splash ───────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('boss-splash.show'),
      // Identity — at least one of actor / video / (message+actorImg) is required (handler-enforced).
      actor: z.string().min(1).optional(), // Actor id/UUID — pulls name + portrait
      actorImg: z.string().min(1).optional(), // explicit image path (when no actor)
      video: z.string().min(1).optional(), // webm path → video template
      message: z.string().optional(), // Handlebars: {{actor.name}}, {{token.name}}
      subText: z.string().optional(),
      tokenName: z.string().optional(),
      // timer is MILLISECONDS (per-call). 0 = stays open. Distinct from the seconds-based splashTimer setting.
      timerMs: z.number().int().nonnegative().optional(),
      sound: z.string().min(1).optional(), // audio path
      fill: z.boolean().optional(), // object-fit:fill on video
    })
    .strict(),
  z
    .object({
      action: z.literal('boss-splash.close'),
    })
    .strict(),
  z
    .object({
      action: z.literal('boss-splash.get-config'),
    })
    .strict(),
  z
    .object({
      action: z.literal('boss-splash.set-config'),
      key: z.string().min(1, 'key is required'),
      // Settings are strings (colors/fonts/message) or numbers (timer/animation/permissions-emit) or bool.
      value: z.union([z.string(), z.number(), z.boolean()]),
    })
    .strict(),

  // ── token-notes ───────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('token-notes.write-note'),
      scope: z.enum(['token', 'actor']),
      // scope:token → sceneId? + tokenId; scope:actor → actorId. (handler enforces the right id is present)
      sceneId: z.string().min(1).optional(),
      tokenId: z.string().min(1).optional(),
      actorId: z.string().min(1).optional(),
      text: z.string(), // plain text + newlines; '' clears
    })
    .strict(),
  z
    .object({
      action: z.literal('token-notes.read-note'),
      scope: z.enum(['token', 'actor']),
      sceneId: z.string().min(1).optional(),
      tokenId: z.string().min(1).optional(),
      actorId: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('token-notes.set-use-actor'),
      sceneId: z.string().min(1).optional(),
      tokenId: z.string().min(1, 'tokenId is required (useActor lives on the TokenDocument)'),
      useActor: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal('token-notes.get-config'),
    })
    .strict(),
  z
    .object({
      action: z.literal('token-notes.set-config'),
      allowplayers: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    })
    .strict(),

  // ── bundle status (UNGUARDED) ───────────────────────────────────────────────
  z
    .object({
      action: z.literal('get-bundle-status'),
    })
    .strict(),
]);

export type TokenPresentationInputType = z.infer<typeof TokenPresentationInput>;
