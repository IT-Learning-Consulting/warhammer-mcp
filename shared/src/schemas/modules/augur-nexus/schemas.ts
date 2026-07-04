// DIALOG-PATH: DIALOG_FREE — pure Zod schema / constant data table; no runtime module-API calls, no dialog risk possible.
// Module Integration v2 Phase 5 — Zod schema (promoted to @foundry-mcp/shared, ADR-020) for module-augur-nexus
// (Augur: Nexus v1.1.6, The Augur).
//
// CCR-5: module-specific schemas are promoted to @foundry-mcp/shared (ADR-020, Phase C2). `.strict()` on
// every top-level action variant rejects unknown keys. Per carry-forward §3 every variant is a plain
// `.strict()` ZodObject (NO `.refine`/`.transform` — a ZodEffects breaks the discriminatedUnion);
// cross-field rules (confirm-gate, target-resolution, "at least one target descriptor") live in the
// handler, never in the schema.
//
// 28 actions across the 8 SUPPORTED idioms + 2 confirm-gated deletes (capability_audit/augur-nexus.md +
// phase5_pre_plan.md §Access model). Connection-target inputs accept all 3 node kinds
// (nexus-scene / nexus-site / foundry-document) via a nested non-strict descriptor; the handler resolves
// them through the module's ConnectionTargetResolver.
//
// Source of truth: .agents/research/module_integration/phase5_pre_plan.md +
// capability_audit/augur-nexus.md (§Capability Inventory, §Flag/Data Model, §API Methods, §Dangerous Ops).

import { z } from 'zod';
import { SceneId } from '../../branded-ids.js';

const siteId = z.string().min(1); // BRANDED-ID-EXEMPT:siteId — module-internal id, not a Foundry document id
const parentSiteId = z.string().min(1); // BRANDED-ID-EXEMPT:parentSiteId — module-internal id, not a Foundry document id
const expectedParentSiteId = z.string().min(1); // BRANDED-ID-EXEMPT:expectedParentSiteId — module-internal id, not a Foundry document id
const edgeId = z.string().min(1); // BRANDED-ID-EXEMPT:edgeId — module-internal id, not a Foundry document id
const categoryId = z.string().min(1); // BRANDED-ID-EXEMPT:categoryId — module-internal id, not a Foundry document id

// ── Shared value enums (kept loose; the module normalizes unknowns to defaults) ──
const policyValue = z.enum(['all', 'explicit']); // global player visibility policies
const sceneViewValue = z.enum(['inherit', 'allow', 'block']); // per-scene player VIEW override
const visibilityValue = z.enum(['inherit', 'show', 'hide']); // per-scene/per-edge/per-site visibility

// A connection target descriptor — accepts all 3 node kinds OR a prebuilt node id. The handler resolves
// it via ConnectionTargetResolver (fromSceneReference / fromSiteReference / fromUuid). NOT `.strict()`
// because it is a nested object inside a strict variant (Zod still rejects unknown TOP-level keys).
const connectionTarget = z.object({
  kind: z.enum(['nexus-scene', 'nexus-site', 'foundry-document']).optional(),
  sceneId: SceneId.optional(), // nexus-scene
  parentSceneId: SceneId.optional(), // nexus-site
  siteId: siteId.optional(), // nexus-site
  uuid: z.string().min(1).optional(), // foundry-document (Actor/Item/JournalEntry/Page/Scene incl. compendium)
  category: z.string().min(1).optional(), // optional category hint for foundry-document
  id: z.string().min(1).optional(), // prebuilt node id (escape hatch)
});

export const AugurNexusInput = z.discriminatedUnion('action', [
  // ── scene-jump idiom ──────────────────────────────────────────────────────────
  z.object({ action: z.literal('get-scene-navigation'), sceneId: SceneId }).strict(),
  z
    .object({
      action: z.literal('set-scene-navigation'),
      sceneId: SceneId,
      parentSceneId: SceneId.optional(), // omit/null clears the navigation flag
      parentSiteId: parentSiteId.optional(),
      transitionStyle: z.string().min(1).optional(),
    })
    .strict(),

  // ── link-scene idiom (create-linked-site is LIVE-SMOKE-ONLY — embeds Tile + Drawing) ──
  z
    .object({
      action: z.literal('create-linked-site'),
      parentSceneId: SceneId,
      linkedSceneId: SceneId,
      // Passthrough to createLinkedSceneSite (siteName, iconSrc, x, y, iconSize, siteColor, …).
      siteData: z.record(z.unknown()).optional(),
    })
    .strict(),
  z.object({ action: z.literal('read-site-records'), sceneId: SceneId }).strict(),
  z
    .object({ action: z.literal('remove-site-record'), sceneId: SceneId, siteId: siteId })
    .strict(),

  // ── reparent-scene idiom ────────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('set-scene-parent'),
      sceneId: SceneId,
      parentSceneId: SceneId,
      parentSiteId: parentSiteId.optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('clear-scene-parent'),
      sceneId: SceneId,
      expectedParentSceneId: SceneId.optional(),
      expectedParentSiteId: expectedParentSiteId.optional(),
    })
    .strict(),
  z.object({ action: z.literal('set-root-scene'), sceneId: SceneId }).strict(),

  // ── connection-add idiom ──────────────────────────────────────────────────────
  z
    .object({
      action: z.literal('add-connection'),
      source: connectionTarget,
      related: connectionTarget,
      category: z.string().min(1).optional(),
      role: z.string().min(1).optional(),
      note: z.string().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('update-connection'),
      edgeId: edgeId,
      category: z.string().min(1).optional(),
      role: z.string().min(1).optional(),
      note: z.string().optional(),
      playerVisibility: visibilityValue.optional(),
    })
    .strict(),
  z
    .object({ action: z.literal('remove-connections-for-target'), target: connectionTarget })
    .strict(),
  z
    .object({
      action: z.literal('upsert-custom-category'),
      id: z.string().min(1).optional(),
      label: z.string().min(1),
      singular: z.string().min(1).optional(),
      icon: z.string().min(1).optional(),
      color: z.string().min(1).optional(),
    })
    .strict(),

  // ── connection-query idiom ──────────────────────────────────────────────────────
  z.object({ action: z.literal('get-connections-for-node'), target: connectionTarget }).strict(),
  z.object({ action: z.literal('get-connections-graph') }).strict(),

  // ── access-policy idiom (global ×3 + per-scene ×2 + per-edge + per-site) ──────────
  z.object({ action: z.literal('get-access-policies'), sceneId: SceneId.optional() }).strict(),
  z.object({ action: z.literal('set-global-scene-view-policy'), policy: policyValue }).strict(),
  z.object({ action: z.literal('set-global-nexus-visibility-policy'), policy: policyValue }).strict(),
  z.object({ action: z.literal('set-global-connection-visibility-policy'), policy: policyValue }).strict(),
  z
    .object({ action: z.literal('set-player-scene-view-override'), sceneId: SceneId, value: sceneViewValue })
    .strict(),
  z
    .object({
      action: z.literal('set-player-nexus-visibility-override'),
      sceneId: SceneId,
      value: visibilityValue,
    })
    .strict(),
  z
    .object({ action: z.literal('set-connection-player-visibility'), edgeId: edgeId, value: visibilityValue })
    .strict(),
  z
    .object({
      action: z.literal('set-site-player-visibility'),
      parentSceneId: SceneId,
      siteId: siteId,
      value: visibilityValue,
    })
    .strict(),

  // ── visibility-sync idiom (LIVE-SMOKE-ONLY — batch tile/drawing hidden state) ──────
  z.object({ action: z.literal('apply-scene-visibility'), sceneId: SceneId }).strict(),

  // ── lineage-read idiom ────────────────────────────────────────────────────────
  z.object({ action: z.literal('get-lineage-tree') }).strict(),
  z.object({ action: z.literal('get-parent-scene'), sceneId: SceneId }).strict(),
  z.object({ action: z.literal('get-child-scenes'), sceneId: SceneId }).strict(),

  // ── destructive deletes (CCR-4 confirm-gated; confirm:z.boolean().optional(), NOT z.literal(true)) ──
  z.object({ action: z.literal('delete-scene-branch'), sceneId: SceneId, confirm: z.boolean().optional() }).strict(),
  z
    .object({ action: z.literal('delete-custom-category'), categoryId: categoryId, confirm: z.boolean().optional() })
    .strict(),
]);

export type AugurNexusInputType = z.infer<typeof AugurNexusInput>;
