// Module Integration v1 Phase 14 — package-local Zod schema for module-mastercrafted
// (mastercrafted v5.0.8).
//
// CCR-5: module-specific schemas stay package-local. `.strict()` on every variant.
//
// 7 actions over the verified server-reachable surface (dossier thin-session.md §4.6):
//   reads:  list-recipes, get-recipe, check-craftable, list-pending-crafts
//   GM writes: execute-craft (confirm-gated — consumes ingredients), process-delayed-crafts,
//              grant-recipe-discovery
//
// REACHABILITY (verified vs live source, mid-execution): the module exposes NO open API for crafting
// — `Recipe`/`RecipeBook` classes are ESM-only (not on a global; API only has processDelayedCrafting).
// The handler reaches them via dynamic import of the module's served ESM files, so crafting works even
// though the module has no public craft API.
//
// WFRP4e quantity (drift #1, verified): `MASTERCRAFTED_CONST.QUANTITY` is a LIVE getter reading the
// world setting `customQuantityPath` on every access. For WFRP4e it must be "quantity.value" (else the
// {value,max} qty object is clobbered). execute-craft auto-sets it (under its confirm gate) when unset
// or the broken "quantity" default — but respects any other deliberate custom value (warn-only).
//
// Source: phase14_pre_plan.md + dossiers/thin-session.md §4.

import { z } from 'zod';

export const ModuleMastercraftedInput = z.discriminatedUnion('action', [
  // ── Reads ─────────────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('list-recipes'),
      filter: z.string().optional(), // ingredient name or partial recipe/book title
    })
    .strict(),
  z
    .object({
      action: z.literal('get-recipe'),
      pageUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('check-craftable'),
      pageUuid: z.string().min(1),
      actorUuid: z.string().min(1),
      inventoryActorUuid: z.string().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('list-pending-crafts'),
      actorUuids: z.array(z.string().min(1)).optional(), // all actors if omitted
    })
    .strict(),

  // ── GM writes ───────────────────────────────────────────────────────────────
  z
    .object({
      // CONFIRM-GATED — consumes ingredients + delivers products (irreversible).
      action: z.literal('execute-craft'),
      pageUuid: z.string().min(1),
      actorUuid: z.string().min(1),
      inventoryActorUuid: z.string().optional(),
      componentSelections: z.record(z.string(), z.string()).optional(), // ingredientId → componentId
      productId: z.string().optional(),
      confirm: z.literal(true, {
        errorMap: () => ({
          message: 'execute-craft requires confirm:true (consumes ingredient items and delivers products)',
        }),
      }),
    })
    .strict(),
  z
    .object({
      action: z.literal('process-delayed-crafts'),
      actorUuids: z.array(z.string().min(1)).optional(), // all actors if omitted
    })
    .strict(),
  z
    .object({
      action: z.literal('grant-recipe-discovery'),
      pageUuid: z.string().min(1),
      userId: z.string().min(1),
      level: z.union([z.literal(1), z.literal(2)]).optional(), // Observer=1 (default) / Owner=2
    })
    .strict(),

  // ── Phase 14 full-functionality expansion — recipe/book authoring ────────────
  z
    .object({
      action: z.literal('create-recipe-book'),
      folderId: z.string().optional(),
      name: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('create-recipe'),
      bookUuid: z.string().min(1),
      name: z.string().min(1),
      img: z.string().optional(),
      time: z.number().int().min(0).nullable().optional(), // minutes; null = inherit book default
    })
    .strict(),
  z
    .object({
      // Edit a recipe page's flags (direct page.update — full flag patch).
      action: z.literal('update-recipe'),
      pageUuid: z.string().min(1),
      name: z.string().min(1).optional(),
      time: z.number().int().min(0).nullable().optional(),
      macroName: z.string().optional(),
      expression: z.string().optional(),
      require: z.string().optional(),
      sound: z.string().optional(),
      img: z.string().optional(),
      modifierList: z.array(z.object({ DC: z.number(), modifier: z.string() }).strict()).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('update-recipe-book'),
      bookUuid: z.string().min(1),
      name: z.string().min(1).optional(),
      img: z.string().optional(),
      sound: z.string().optional(),
      require: z.string().optional(),
      time: z.number().int().min(0).nullable().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('get-recipe-book'),
      bookUuid: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-item-tags'),
      itemUuid: z.string().min(1),
      tags: z.array(z.string()),
    })
    .strict(),
  z
    .object({
      // Add a component to an ingredient or product slot (slotId omitted = new slot).
      action: z.literal('add-component'),
      pageUuid: z.string().min(1),
      slot: z.enum(['ingredient', 'product']),
      slotId: z.string().optional(),
      uuid: z.string().min(1),
      name: z.string().min(1),
      img: z.string().optional(),
      tags: z.array(z.string()).optional(), // ingredient slots only
      quantity: z.number().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-component'),
      pageUuid: z.string().min(1),
      slot: z.enum(['ingredient', 'product']),
      slotId: z.string().min(1),
      componentId: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('set-component-quantity'),
      pageUuid: z.string().min(1),
      slot: z.enum(['ingredient', 'product']),
      slotId: z.string().min(1),
      componentId: z.string().min(1),
      quantity: z.number(),
    })
    .strict(),
  z
    .object({
      action: z.literal('search-by-ingredient'),
      name: z.string().min(1),
    })
    .strict(),
  z
    .object({
      action: z.literal('configure-settings'),
      customQuantityPath: z.string().optional(),
      enableCauldron: z.boolean().optional(),
      mainFolderName: z.string().optional(),
      dontShowButtonOnNpc: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('cancel-pending-craft'),
      actorUuid: z.string().min(1),
      craftId: z.string().min(1),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'cancel-pending-craft requires confirm:true (the queued items are lost)' }),
      }),
    })
    .strict(),
  z
    .object({
      action: z.literal('delete-recipe'),
      pageUuid: z.string().min(1),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'delete-recipe requires confirm:true (permanently deletes the recipe page)' }),
      }),
    })
    .strict(),
  z
    .object({
      action: z.literal('delete-recipe-book'),
      bookUuid: z.string().min(1),
      confirm: z.literal(true, {
        errorMap: () => ({ message: 'delete-recipe-book requires confirm:true (deletes the book AND all its recipes)' }),
      }),
    })
    .strict(),
]);

export type ModuleMastercraftedInputType = z.infer<typeof ModuleMastercraftedInput>;
