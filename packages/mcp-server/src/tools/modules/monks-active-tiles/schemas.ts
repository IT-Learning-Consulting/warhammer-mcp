// Module Integration v1 Phase 2 — package-local input schema for monks-active-tiles (mcp-server side).
//
// CCR-5: module-specific schemas are package-local. This mirrors the foundry-module discriminated
// union for per-action TS typing (ArgsFor<A>). Authoritative validation lives in the foundry-module
// handler (strict-parse + action-catalog); this server-side schema is light — it types the tool's
// per-action handlers and is not the security boundary.

import { z } from 'zod';
import { RegionId, SceneId, TokenId } from '@foundry-mcp/shared';

const MattActionObj = z.object({
  id: z.string().optional(),
  action: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

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

export const ModuleMattInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('get-capabilities') }),
  // BUG-254 full-payload flag; BUG-330 parity with the published inputSchema.
  z.object({ action: z.literal('get-trigger-tile'), tileUuid: z.string(), returnFullPayload: z.boolean().optional() }),
  z.object({ action: z.literal('list-trigger-tiles'), sceneId: SceneId.optional() }),
  z.object({ action: z.literal('validate-sequence'), actions: z.array(MattActionObj) }),
  z.object({
    action: z.literal('create-trigger-tile'),
    sceneId: SceneId,
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    img: z.string().optional(),
    trigger: z.array(z.string()).min(1),
    actions: z.array(MattActionObj).optional(),
    confirm: z.boolean().optional(),
    ...configFields,
    // BUG-257: nested config accepted at create-time; flattened fields win per key.
    config: z.object(configFields).optional(),
  }),
  z.object({
    action: z.literal('update-trigger-config'),
    tileUuid: z.string(),
    trigger: z.array(z.string()).optional(),
    config: z.object(configFields).optional(),
  }),
  z.object({
    action: z.literal('replace-action-sequence'),
    tileUuid: z.string(),
    actions: z.array(MattActionObj),
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('add-action'),
    tileUuid: z.string(),
    mattAction: MattActionObj,
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('insert-action'),
    tileUuid: z.string(),
    index: z.number().int().min(0),
    mattAction: MattActionObj,
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('update-action'),
    tileUuid: z.string(),
    actionId: z.string(), // not a branded id (polymorphic / non-document) — MATT internal 16-char sequence action id
    data: z.record(z.unknown()),
    newActionKey: z.string().optional(),
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('remove-action'),
    tileUuid: z.string(),
    actionId: z.string(), // not a branded id (polymorphic / non-document) — MATT internal 16-char sequence action id
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('reorder-actions'),
    tileUuid: z.string(),
    order: z.array(z.string()).min(1),
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('duplicate-action'),
    tileUuid: z.string(),
    actionId: z.string(), // not a branded id (polymorphic / non-document) — MATT internal 16-char sequence action id
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('set-variables'),
    tileUuid: z.string(),
    variables: z.record(z.unknown()),
  }),
  z.object({
    action: z.literal('reset-history'),
    tileUuid: z.string(),
    tokenId: TokenId.optional(),
  }),
  z.object({
    action: z.literal('fire-trigger'),
    tileUuid: z.string(),
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('fire-trigger-as'),
    tileUuid: z.string(),
    tokenIds: z.array(TokenId).min(1).max(10),
    method: z.string().optional(),
    // BUG-258: optional anchor tag — fire starts at the action AFTER the named anchor.
    landing: z.string().optional(),
    confirm: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('find-trigger-tile'),
    name: z.string().optional(),
    tileUuid: z.string().optional(),
    tag: z.string().optional(),
    libraryId: z.string().optional(), // not a branded id (polymorphic / non-document)
    sceneId: SceneId.optional(),
  }),
  z.object({
    action: z.literal('link-region-trigger'),
    sceneId: SceneId,
    regionId: RegionId,
    tileUuid: z.string(),
    events: z.array(z.string()).optional(),
    usetiletrigger: z.boolean().optional(),
    name: z.string().optional(),
  }),
]);

export type ModuleMattInputType = z.infer<typeof ModuleMattInput>;
