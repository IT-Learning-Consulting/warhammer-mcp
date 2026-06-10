// Module Integration v1 Phase 2 — package-local input schema for monks-active-tiles.
//
// CCR-5 convention: module-specific Zod schemas live package-local (not in @foundry-mcp/shared).
// Discriminated union on `action` over the 17 umbrella actions (memo §2). Per-MATT-action `data`
// payloads stay catalog-validated (action-catalog.ts) rather than 72 hand-typed unions — strict
// Zod for the high-value/dangerous actions is applied at the catalog layer (STRICT_ACTION_DATA).
//
// `.strict()` at the umbrella level (CCR-5) — unknown top-level keys are rejected.

import { z } from 'zod';
import { TRIGGER_MODES, DEPRECATED_TRIGGER_ALIASES } from './action-catalog.js';

// ── A single MATT action item ({id?, action, data}) — audit §5 flag shape ─────
export const MattActionObj = z
  .object({
    id: z.string().optional(),
    action: z.string().min(1),
    data: z.record(z.unknown()).optional().default({}),
  })
  .strict();

export type MattActionObjType = z.infer<typeof MattActionObj>;

// ── Trigger-mode array (catalog-validated; deprecated aliases tolerated) ───────
const VALID_TRIGGERS = new Set<string>([...TRIGGER_MODES, ...DEPRECATED_TRIGGER_ALIASES]);
const triggerArray = z
  .array(z.string())
  .min(1)
  .refine((arr) => arr.every((t) => VALID_TRIGGERS.has(t)), {
    message: 'trigger[] contains an unknown trigger mode (see action-catalog TRIGGER_MODES)',
  });

// ── Config field subset (create + update-trigger-config) ──────────────────────
const configFields = {
  active: z.boolean().optional(),
  record: z.boolean().optional(),
  restriction: z.enum(['all', 'player', 'gm']).optional(),
  controlled: z.enum(['all', 'player', 'gm']).optional(),
  allowpaused: z.boolean().optional(),
  usealpha: z.boolean().optional(),
  pointer: z.boolean().optional(),
  vision: z.boolean().optional(),
  pertoken: z.boolean().optional(),
  minrequired: z.number().int().min(0).optional(),
  cooldown: z.number().min(0).optional(),
  chance: z.number().min(0).max(100).optional(),
  name: z.string().optional(),
  files: z.array(z.string()).optional(),
  fileindex: z.number().int().min(0).optional(),
};

// ── 19 umbrella action variants ───────────────────────────────────────────────

export const ModuleMattInput = z.discriminatedUnion('action', [
  // — reads —
  z.object({ action: z.literal('get-capabilities') }).strict(),
  z
    .object({
      action: z.literal('get-trigger-tile'),
      tileUuid: z.string().min(1),
      // BUG-254 — when true, the mcp-server formatter emits the full machine-readable bundle
      // (geometry + texture + full actions[] + variables + region-link metadata) as JSON
      // instead of the prose summary, so tilepack export can round-trip a complete tile.
      returnFullPayload: z.boolean().optional(),
    })
    .strict(),
  z.object({ action: z.literal('list-trigger-tiles'), sceneId: z.string().optional() }).strict(),
  z.object({ action: z.literal('validate-sequence'), actions: z.array(MattActionObj) }).strict(),

  // — create + config —
  z
    .object({
      action: z.literal('create-trigger-tile'),
      sceneId: z.string().min(1),
      x: z.number(),
      y: z.number(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      img: z.string().optional(),
      trigger: triggerArray,
      actions: z.array(MattActionObj).optional(),
      confirm: z.boolean().optional(),
      ...configFields,
    })
    .strict(),
  z
    .object({
      action: z.literal('update-trigger-config'),
      tileUuid: z.string().min(1),
      trigger: triggerArray.optional(),
      config: z.object(configFields).strict().optional(),
    })
    .strict(),

  // — sequence editing —
  z
    .object({
      action: z.literal('replace-action-sequence'),
      tileUuid: z.string().min(1),
      actions: z.array(MattActionObj),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('add-action'),
      tileUuid: z.string().min(1),
      mattAction: MattActionObj,
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('insert-action'),
      tileUuid: z.string().min(1),
      index: z.number().int().min(0),
      mattAction: MattActionObj,
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('update-action'),
      tileUuid: z.string().min(1),
      actionId: z.string().min(1),
      data: z.record(z.unknown()),
      newActionKey: z.string().optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('remove-action'),
      tileUuid: z.string().min(1),
      actionId: z.string().min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('reorder-actions'),
      tileUuid: z.string().min(1),
      order: z.array(z.string().min(1)).min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('duplicate-action'),
      tileUuid: z.string().min(1),
      actionId: z.string().min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),

  // — state —
  z
    .object({
      action: z.literal('set-variables'),
      tileUuid: z.string().min(1),
      variables: z.record(z.unknown()),
    })
    .strict(),
  z
    .object({
      action: z.literal('reset-history'),
      tileUuid: z.string().min(1),
      tokenId: z.string().optional(),
    })
    .strict(),

  // — runtime + region bridge —
  z
    .object({
      action: z.literal('fire-trigger'),
      tileUuid: z.string().min(1),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('fire-trigger-as'),
      tileUuid: z.string().min(1),
      tokenIds: z.array(z.string().min(1)).min(1).max(10),
      method: z.string().optional(),
      confirm: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('find-trigger-tile'),
      name: z.string().min(1).max(200).optional(),
      tileUuid: z.string().min(1).optional(),
      tag: z.string().min(1).max(200).optional(),
      libraryId: z.string().min(1).max(200).optional(),
      sceneId: z.string().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('link-region-trigger'),
      sceneId: z.string().min(1),
      regionId: z.string().min(1),
      tileUuid: z.string().min(1),
      events: z.array(z.string()).optional(),
      usetiletrigger: z.boolean().optional(),
      name: z.string().optional(),
    })
    .strict(),
]);

export type ModuleMattInputType = z.infer<typeof ModuleMattInput>;
