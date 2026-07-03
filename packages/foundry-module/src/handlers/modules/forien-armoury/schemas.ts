// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v1 Phase 10 — package-local Zod schema for module-armoury (Forien's Armoury).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared). `.strict()` on
// every variant rejects unknown top-level keys.
//
// 14 actions over Forien's Armoury v4.0.4 server-reachable surface (dossier forien-armoury.md §7,
// capability-manifest.json). Confirm-gated (z.literal(true)) per CCR-4 on the three irreversible /
// side-effecting writes: equip-grimoire (auto-fires applySpells), configure-integration (one-shot
// preset/currency rewrite), cantrip (spends spell SL + posts chat).
//
// Source of truth: .agents/research/module_integration/phase10_pre_plan.md (per-action classification
// + method signatures) + dossiers/forien-armoury.md.

import { z } from 'zod';

// Integration one-shot toggles (dossier §5.14 / §10).
const Integration = z.enum(['setCurrencies', 'rolltablesImport', 'atlResetPresets']);

// wfrp4e armour hit locations (for repair-item on armour).
const ArmourLocation = z.enum(['head', 'body', 'lArm', 'rArm', 'lLeg', 'rLeg']);

export const ModuleArmouryInput = z.discriminatedUnion('action', [
  // ── Magical Endurance (§5.1) ──────────────────────────────────────────────
  z
    .object({
      action: z.literal('get-me'),
      actorId: z.string().min(1, 'actorId is required (actor UUID or world-document ID)'),
    })
    .strict(),
  z
    .object({
      action: z.literal('spend-me'),
      actorId: z.string().min(1, 'actorId is required'),
      amount: z.number().int().positive('amount must be a positive integer of ME points to drain'),
    })
    .strict(),

  // ── Scrolls (§5.2) ────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('create-scroll'),
      // actorId optional → world-scope Item when absent, actor-embedded when present.
      actorId: z.string().min(1).optional(),
      spellUuid: z.string().min(1, 'spellUuid is required (the spell the scroll casts)'),
      name: z.string().min(1).optional(),
      language: z.string().min(1).optional(), // default "Magick" applied in handler
      quantity: z.number().int().nonnegative().optional(), // default 1
      encumbrance: z.number().nonnegative().optional(), // default from scrolls.defaultEncumbrance
      availability: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('read-scroll'),
      actorId: z.string().min(1, 'actorId is required'),
      itemId: z.string().min(1, 'itemId is required'),
    })
    .strict(),

  // ── Grimoires (§5.3) ──────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('create-grimoire'),
      actorId: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      spells: z
        .array(
          z
            .object({ name: z.string().min(1).optional(), uuid: z.string().min(1) })
            .strict(),
        )
        .default([]),
      language: z.string().min(1).optional(),
      twohanded: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('read-grimoire-spells'),
      actorId: z.string().min(1, 'actorId is required'),
      itemId: z.string().min(1, 'itemId is required'),
    })
    .strict(),
  z
    .object({
      // SUPPORTED_WITH_CONFIRMATION — writing equipped:true auto-fires applySpells() on the GM client.
      action: z.literal('equip-grimoire'),
      actorId: z.string().min(1, 'actorId is required'),
      itemId: z.string().min(1, 'itemId is required (the grimoire)'),
      equipped: z.boolean().default(true), // false → unequip (removeSpells)
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'equip-grimoire requires confirm:true (auto-grants/removes spells on the actor)' }),
      }),
    })
    .strict(),

  // ── Item Repair (§5.4) ────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('check-damage'),
      actorId: z.string().min(1, 'actorId is required'),
    })
    .strict(),
  z
    .object({
      action: z.literal('repair-item'),
      actorId: z.string().min(1, 'actorId is required'),
      itemId: z.string().min(1, 'itemId is required'),
      // location present → armour APdamage.<loc>; absent → weapon/trapping damageToItem.value.
      location: ArmourLocation.optional(),
      newValue: z.number().int().nonnegative().default(0), // 0 = full repair
    })
    .strict(),

  // ── Ammo Reclamation queue (§5.5) ─────────────────────────────────────────
  z
    .object({
      action: z.literal('read-ammo-queue'),
      combatId: z.string().min(1).optional(), // default: active combat
    })
    .strict(),

  // ── Combat Fatigue (§5.6) ─────────────────────────────────────────────────
  z
    .object({
      action: z.literal('read-combat-fatigue'),
      combatId: z.string().min(1).optional(),
      combatantId: z.string().min(1).optional(), // absent → all combatants in the combat
    })
    .strict(),

  // ── Species / career content catalog (§14) ────────────────────────────────
  z
    .object({
      // Read-only catalog of the forien-armoury Items pack (Runebound species, 16 careers,
      // Fortified Mind / Fighting Style talents). Embedding routes through the core
      // add-item-from-compendium tool — this action surfaces WHAT is importable.
      action: z.literal('add-species-career-content'),
      filter: z.enum(['species', 'careers', 'talents', 'all']).default('all'),
    })
    .strict(),

  // ── Integration one-shot settings (§5.14) ─────────────────────────────────
  z
    .object({
      action: z.literal('configure-integration'),
      integration: Integration,
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'configure-integration requires confirm:true (irreversible currency/preset/rolltable rewrite)' }),
      }),
    })
    .strict(),

  // ── Cantrip macro (§5.13) ─────────────────────────────────────────────────
  z
    .object({
      // SUPPORTED_WITH_CONFIRMATION — spends accumulated spell SL + posts chat. Derives the actor
      // from the canvas speaker: the handler controls `tokenId` first, then calls api.macros.cantrip.
      action: z.literal('cantrip'),
      tokenId: z.string().min(1, 'tokenId is required (cantrip derives the actor from the selected token)'),
      requiredSL: z.number().int().positive().default(1),
      lore: z.string().min(1).default('fire'),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'cantrip requires confirm:true (spends spell SL and posts to chat)' }),
      }),
    })
    .strict(),
]);

export type ModuleArmouryInputType = z.infer<typeof ModuleArmouryInput>;
