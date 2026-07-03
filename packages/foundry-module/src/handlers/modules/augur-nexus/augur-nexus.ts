// DIALOG-PATH: DIALOG_GUARDED — the module header (below) documents the confirmed deadlock path (deleteSite -> confirmDestructiveAction DialogV2) and states it is NEVER called; remove-site-record routes through SiteRecordManager instead.
// Module Integration v2 Phase 5 — module-augur-nexus handler (Augur: Nexus v1.1.6, The Augur).
//
// Always-registered umbrella. requireModuleActive('augur-nexus') is the FIRST active-state check —
// RETURNS the MODULE_NOT_ACTIVE envelope, never throws (v1 Phase 1 contract).
//
// 28 actions across 8 SUPPORTED idioms + 2 confirm-gated deletes (capability_audit/augur-nexus.md +
// phase5_pre_plan.md §Access model). Access is PER-OP HYBRID, decided by SOURCE SOUNDNESS, not preference:
//
//   PATH A (runtime-import the module's own ESM + call its awaited method) — every augur-nexus write
//   method PROPERLY AWAITS its underlying Foundry write (verified by reading the method bodies:
//   NexusLineageManager / NexusSceneNavigationManager / ConnectionStore / SiteRecordManager /
//   SiteSceneVisibilityManager all `await scene.update`/`scene.setFlag`/`game.settings.set`). So there is
//   NO settle-poll anywhere — immediate read-back is consistent (the deliberate contrast with Phase-3/4
//   fire-and-forget traps). We runtime-import:
//     • api/index.js (servable, side-effect-free re-exports — the perceptive precedent, NOT the
//       simple-quest single-bundle 404 case) for the exported scene / scene-access / site ops.
//     • ConnectionStore.js + ConnectionTargetResolver.js DIRECTLY (NOT re-exported via api/index.js).
//     • NexusLineageManager / SiteRecordManager / SiteSceneVisibilityManager DIRECTLY for the few ops
//       not surfaced through api/index.js (setRootScene, getLineageRows, removeSceneRecord,
//       applySceneVisibility, setSitePlayerVisibilityOverride).
//
//   PATH B (raw awaited write WE issue) — the 3 global player-visibility policies are a single
//   `game.settings.set('augur-nexus', <key>, value)`; the module's onChange/Hooks side-effect (browser
//   refresh) is UI-only and irrelevant to MCP, so a raw awaited set is the simplest sound path.
//
// ⚠ TRAP (HC-v2-6 class, [[feedback_module_api_dialog_deadlock]]): SiteDeletionManager.deleteSite opens a
//   DialogV2.wait → MCP socket DEADLOCK. We NEVER call it. `remove-site-record` = SiteRecordManager
//   .removeSceneRecord (raw-awaited flag write + connection cleanup) + scene.deleteEmbeddedDocuments for
//   the pin's Tile/Note + its Drawing label. Branch delete routes through api.deleteSceneBranch(scene),
//   which calls deleteSceneBranch(scene,{confirmed:true}) — the {confirmed:true} SKIPS the module's own
//   confirmDestructiveAction DialogV2 (NexusSceneDeletionCoordinator.js:99).
//
// Confirm-gate (CCR-4): the 2 deletes use confirm:z.boolean().optional() + a handler `!== true` reject
// (item-piles/simple-quest precedent; NOT z.literal(true)).
//
// Source of truth: .agents/research/module_integration/phase5_pre_plan.md.

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { AugurNexusInput, type AugurNexusInputType } from './schemas.js';
import { notify } from '../../../notify.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

const MODULE_ID = 'augur-nexus';
const FLAG_SCOPE = 'augur-nexus';
const SETTING_SCOPE = 'augur-nexus';

// Global player-visibility setting keys (raw path-B writes).
const VIEW_POLICY_KEY = 'playerSceneViewing';
const NEXUS_VISIBILITY_POLICY_KEY = 'playerNexusVisibility';
const CONNECTION_VISIBILITY_POLICY_KEY = 'playerConnectionVisibility';

// Write actions are GM-gated (warhammer-mcp runs as GM; the module fns also self-guard on isGM and would
// silently no-op for a non-GM, which our DP-16 verify would then surface as NOT_PERSISTED — so reject early).
const WRITE_ACTIONS = new Set([
  'set-scene-navigation',
  'create-linked-site',
  'remove-site-record',
  'set-scene-parent',
  'clear-scene-parent',
  'set-root-scene',
  'add-connection',
  'update-connection',
  'remove-connections-for-target',
  'upsert-custom-category',
  'set-global-scene-view-policy',
  'set-global-nexus-visibility-policy',
  'set-global-connection-visibility-policy',
  'set-player-scene-view-override',
  'set-player-nexus-visibility-override',
  'set-connection-player-visibility',
  'set-site-player-visibility',
  'apply-scene-visibility',
  'delete-scene-branch',
  'delete-custom-category',
]);

// ── Local helpers ──────────────────────────────────────────────────────────────

function getGame(): any {
  return (globalThis as any).game;
}

function isGM(): boolean {
  return Boolean(getGame()?.user?.isGM);
}

/**
 * Runtime ESM import that EVADES esbuild/tsc static resolution (Function indirection). Used for the
 * servable augur-nexus ESM files. augur-nexus ships its sub-files as individual servable modules (NOT a
 * single bundle — module.json esmodules is a thin loader), so these URLs resolve and return the cached
 * (or freshly-evaluated, side-effect-free) module namespace. Mirrors perceptive.ts L79-80.
 */
const runtimeImport = (specifier: string): Promise<any> => {
  // Test seam: the Function-wrapped dynamic import is un-mockable by vitest (it evades static
  // resolution by design). When `globalThis.__augurNexusRuntimeImport` is a function (set ONLY by the
  // unit tests), use it so the hybrid dispatch + 3-kind target resolution are deterministically
  // coverable. The global is never set in Foundry → the real Function-wrapped import always runs.
  const override = (globalThis as any).__augurNexusRuntimeImport;
  if (typeof override === 'function') return Promise.resolve(override(specifier));
  return (Function('s', 'return import(s)') as (s: string) => Promise<any>)(specifier);
};

const importApi = (): Promise<any> => runtimeImport(`/modules/${MODULE_ID}/scripts/api/index.js`);
const importConnectionStore = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/scripts/features/connections/services/ConnectionStore.js`).then(
    (m) => m.ConnectionStore,
  );
const importTargetResolver = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/scripts/features/connections/services/ConnectionTargetResolver.js`).then(
    (m) => m.ConnectionTargetResolver,
  );
const importLineageManager = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/scripts/features/nexus/services/NexusLineageManager.js`).then(
    (m) => m.NexusLineageManager,
  );
const importSiteRecordManager = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/scripts/features/site/services/SiteRecordManager.js`).then(
    (m) => m.SiteRecordManager,
  );
const importVisibilityManager = (): Promise<any> =>
  runtimeImport(`/modules/${MODULE_ID}/scripts/features/site/services/SiteSceneVisibilityManager.js`).then(
    (m) => m.SiteSceneVisibilityManager,
  );

function resolveScene(sceneId: string): any | null {
  return getGame()?.scenes?.get?.(sceneId) ?? null;
}

function targetNotFound(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.AUGUR_NEXUS_TARGET_NOT_FOUND}: ${detail}` };
}

function notPersisted(detail: string): { success: false; error: string } {
  return { success: false, error: `${ErrorTokens.AUGUR_NEXUS_NOT_PERSISTED}: ${detail}` };
}

type RawTarget = {
  kind?: 'nexus-scene' | 'nexus-site' | 'foundry-document' | undefined;
  sceneId?: string | undefined;
  parentSceneId?: string | undefined;
  siteId?: string | undefined;
  uuid?: string | undefined;
  category?: string | undefined;
  id?: string | undefined;
};

/**
 * Resolve a connection-target descriptor through the module's ConnectionTargetResolver. Returns the FULL
 * descriptor ({ id, kind, name, … }) that ConnectionStore.normalizeNode needs (a bare {kind,sceneId} has
 * no `id` and would be dropped). All 3 kinds supported. Returns null when unresolvable.
 */
async function resolveTargetDescriptor(resolver: any, t: RawTarget): Promise<any | null> {
  if (!t) return null;
  if (t.kind === 'nexus-scene' || (!t.kind && t.sceneId)) {
    return resolver.fromSceneReference({ sceneId: t.sceneId });
  }
  if (t.kind === 'nexus-site' || (!t.kind && t.parentSceneId && t.siteId)) {
    return resolver.fromSiteReference({ parentSceneId: t.parentSceneId, siteId: t.siteId });
  }
  if (t.kind === 'foundry-document' || (!t.kind && t.uuid)) {
    return await resolver.fromUuid(t.uuid, { category: t.category ?? null });
  }
  return null;
}

// ── Public dispatcher ───────────────────────────────────────────────────────────

export async function dispatchModuleAugurNexus(data: unknown): Promise<Envelope<unknown>> {
  const guard = requireModuleActive(MODULE_ID);
  if (guard) return guard;

  let input: AugurNexusInputType;
  try {
    input = AugurNexusInput.parse(data);
  } catch (e) {
    return { success: false, error: `AUGUR_NEXUS_INVALID_INPUT: ${e instanceof Error ? e.message : String(e)}` };
  }

  if (WRITE_ACTIONS.has(input.action) && !isGM()) {
    return { success: false, error: `AUGUR_NEXUS_ACCESS_DENIED: ${input.action} requires GM` };
  }

  try {
    switch (input.action) {
      case 'get-scene-navigation':
        return await handleGetSceneNavigation(input);
      case 'set-scene-navigation':
        return await handleSetSceneNavigation(input);
      case 'create-linked-site':
        return await handleCreateLinkedSite(input);
      case 'read-site-records':
        return await handleReadSiteRecords(input);
      case 'remove-site-record':
        return await handleRemoveSiteRecord(input);
      case 'set-scene-parent':
        return await handleSetSceneParent(input);
      case 'clear-scene-parent':
        return await handleClearSceneParent(input);
      case 'set-root-scene':
        return await handleSetRootScene(input);
      case 'add-connection':
        return await handleAddConnection(input);
      case 'update-connection':
        return await handleUpdateConnection(input);
      case 'remove-connections-for-target':
        return await handleRemoveConnectionsForTarget(input);
      case 'upsert-custom-category':
        return await handleUpsertCustomCategory(input);
      case 'get-connections-for-node':
        return await handleGetConnectionsForNode(input);
      case 'get-connections-graph':
        return await handleGetConnectionsGraph();
      case 'get-access-policies':
        return await handleGetAccessPolicies(input);
      case 'set-global-scene-view-policy':
        return await handleSetGlobalPolicy(input.action, VIEW_POLICY_KEY, input.policy);
      case 'set-global-nexus-visibility-policy':
        return await handleSetGlobalPolicy(input.action, NEXUS_VISIBILITY_POLICY_KEY, input.policy);
      case 'set-global-connection-visibility-policy':
        return await handleSetGlobalPolicy(input.action, CONNECTION_VISIBILITY_POLICY_KEY, input.policy);
      case 'set-player-scene-view-override':
        return await handleSetPlayerSceneViewOverride(input);
      case 'set-player-nexus-visibility-override':
        return await handleSetPlayerNexusVisibilityOverride(input);
      case 'set-connection-player-visibility':
        return await handleSetConnectionPlayerVisibility(input);
      case 'set-site-player-visibility':
        return await handleSetSitePlayerVisibility(input);
      case 'apply-scene-visibility':
        return await handleApplySceneVisibility(input);
      case 'get-lineage-tree':
        return await handleGetLineageTree();
      case 'get-parent-scene':
        return await handleGetParentScene(input);
      case 'get-child-scenes':
        return await handleGetChildScenes(input);
      case 'delete-scene-branch':
        return await handleDeleteSceneBranch(input);
      case 'delete-custom-category':
        return await handleDeleteCustomCategory(input);
      default: {
        const _exhaustive: never = input;
        return { success: false, error: `AUGUR_NEXUS_UNKNOWN_ACTION: ${String((_exhaustive as any)?.action)}` };
      }
    }
  } catch (e) {
    return { success: false, error: `AUGUR_NEXUS_HANDLER_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── scene-jump ────────────────────────────────────────────────────────────────

type GetNavInput = Extract<AugurNexusInputType, { action: 'get-scene-navigation' }>;
async function handleGetSceneNavigation(input: GetNavInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  const navigation = api.getSceneNavigation(scene) ?? null;
  return { success: true, data: { action: 'get-scene-navigation', sceneId: scene.id, sceneName: scene.name, navigation } };
}

type SetNavInput = Extract<AugurNexusInputType, { action: 'set-scene-navigation' }>;
async function handleSetSceneNavigation(input: SetNavInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  // setSceneNavigation writes the lineage parent AND the navigation flag (awaited). When parentSceneId
  // is omitted the module UNSETS the navigation flag — that's a valid "clear back-nav" call.
  await api.setSceneNavigation(scene, {
    parentSceneId: input.parentSceneId ?? null,
    parentSiteId: input.parentSiteId ?? null,
    ...(input.transitionStyle ? { transitionStyle: input.transitionStyle } : {}),
  });
  const navigation = scene.getFlag(FLAG_SCOPE, 'navigation') ?? null;
  if (input.parentSceneId && (navigation as any)?.parentSceneId !== input.parentSceneId) {
    return notPersisted(`navigation.parentSceneId expected ${input.parentSceneId}, got ${(navigation as any)?.parentSceneId ?? 'null'}`);
  }
  notify.updated('scene', scene.name, { summary: input.parentSceneId ? `nav → parent ${input.parentSceneId}` : 'nav cleared' });
  return { success: true, data: { action: 'set-scene-navigation', sceneId: scene.id, sceneName: scene.name, navigation } };
}

// ── link-scene ──────────────────────────────────────────────────────────────────

type CreateLinkedSiteInput = Extract<AugurNexusInputType, { action: 'create-linked-site' }>;
async function handleCreateLinkedSite(input: CreateLinkedSiteInput): Promise<Envelope<unknown>> {
  const parentScene = resolveScene(input.parentSceneId);
  if (!parentScene) return targetNotFound(`parent scene "${input.parentSceneId}" not found`);
  const linkedScene = resolveScene(input.linkedSceneId);
  if (!linkedScene) return targetNotFound(`linked scene "${input.linkedSceneId}" not found`);

  const api = await importApi();
  // createLinkedSceneSite embeds a Tile + Drawing label, sets navigation, places the child folder, and
  // upserts the site record — all awaited. LIVE-SMOKE-ONLY (no MCP enumerate primitive for the embeds).
  const result = await api.createLinkedSceneSite(parentScene, linkedScene, input.siteData ?? {});
  const siteId = result?.siteId ?? null;

  // Read-back: confirm the record landed on the parent scene.
  const SiteRecordManager = await importSiteRecordManager();
  const records = SiteRecordManager.getSceneRecords(parentScene);
  if (siteId && !records?.[siteId]) {
    return notPersisted(`site record "${siteId}" not present on scene "${parentScene.id}" after createLinkedSceneSite`);
  }

  notify.created('scene', `${parentScene.name} → ${linkedScene.name}`, { summary: `site pin ${siteId}` });
  return {
    success: true,
    data: {
      action: 'create-linked-site',
      parentSceneId: parentScene.id,
      linkedSceneId: linkedScene.id,
      siteId,
      placeableId: result?.note?.id ?? null,
      note: 'Site pin created (embeds a Tile + Drawing label). LIVE-SMOKE-ONLY — re-read site records to confirm.',
    },
  };
}

type ReadSiteRecordsInput = Extract<AugurNexusInputType, { action: 'read-site-records' }>;
async function handleReadSiteRecords(input: ReadSiteRecordsInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const SiteRecordManager = await importSiteRecordManager();
  const list = SiteRecordManager.getSceneRecordList(scene).map((r: any) => ({
    siteId: r.siteId,
    siteName: r.siteName,
    linkedSceneId: r.linkedSceneId ?? r.siteSceneId ?? null,
    placeableId: r.placeableId ?? null,
    placeableDocumentName: r.placeableDocumentName ?? null,
    playerVisibility: r.playerVisibility ?? 'inherit',
  }));
  return { success: true, data: { action: 'read-site-records', sceneId: scene.id, sceneName: scene.name, count: list.length, records: list } };
}

type RemoveSiteRecordInput = Extract<AugurNexusInputType, { action: 'remove-site-record' }>;
async function handleRemoveSiteRecord(input: RemoveSiteRecordInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const SiteRecordManager = await importSiteRecordManager();

  // Capture the record BEFORE removal so we can delete its placeable + label. NOT deleteSite (dialog).
  const record = SiteRecordManager.getSceneRecord(scene, input.siteId);
  if (!record) return targetNotFound(`site record "${input.siteId}" not on scene "${scene.id}"`);
  const placeableId: string | null = record.placeableId ?? null;
  const placeableDocumentName: string = record.placeableDocumentName || 'Note';
  const labelId: string | null = record.labelId ?? null;

  // removeSceneRecord: raw-awaited flag write + connection cleanup (no dialog).
  const removed = await SiteRecordManager.removeSceneRecord(scene, input.siteId);
  if (!removed) return notPersisted(`removeSceneRecord returned false for site "${input.siteId}"`);

  // Delete the pin's embedded placeable (Tile/Note) + its Drawing label.
  const deletedDocs: string[] = [];
  if (placeableId && scene.getEmbeddedCollection?.(placeableDocumentName)?.get?.(placeableId)) {
    await scene.deleteEmbeddedDocuments(placeableDocumentName, [placeableId]);
    deletedDocs.push(`${placeableDocumentName}:${placeableId}`);
  }
  if (labelId && scene.getEmbeddedCollection?.('Drawing')?.get?.(labelId)) {
    await scene.deleteEmbeddedDocuments('Drawing', [labelId]);
    deletedDocs.push(`Drawing:${labelId}`);
  }

  // Verify the record is gone.
  const stillThere = SiteRecordManager.getSceneRecords(scene)?.[input.siteId];
  if (stillThere) return notPersisted(`site record "${input.siteId}" still present after removeSceneRecord`);

  notify.deleted('scene', scene.name, { summary: `site ${input.siteId} removed` });
  return {
    success: true,
    data: { action: 'remove-site-record', sceneId: scene.id, siteId: input.siteId, deletedDocuments: deletedDocs },
  };
}

// ── reparent-scene ──────────────────────────────────────────────────────────────

type SetParentInput = Extract<AugurNexusInputType, { action: 'set-scene-parent' }>;
async function handleSetSceneParent(input: SetParentInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  if (!resolveScene(input.parentSceneId)) return targetNotFound(`parent scene "${input.parentSceneId}" not found`);
  const api = await importApi();
  await api.setSceneParent(scene, { parentSceneId: input.parentSceneId, parentSiteId: input.parentSiteId ?? null });
  const lineage = scene.getFlag(FLAG_SCOPE, 'lineage') ?? null;
  if ((lineage as any)?.parentSceneId !== input.parentSceneId) {
    return notPersisted(`lineage.parentSceneId expected ${input.parentSceneId}, got ${(lineage as any)?.parentSceneId ?? 'null'}`);
  }
  notify.updated('scene', scene.name, { summary: `parent → ${input.parentSceneId}` });
  return { success: true, data: { action: 'set-scene-parent', sceneId: scene.id, sceneName: scene.name, lineage } };
}

type ClearParentInput = Extract<AugurNexusInputType, { action: 'clear-scene-parent' }>;
async function handleClearSceneParent(input: ClearParentInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  await api.clearSceneParent(scene, {
    expectedParentSceneId: input.expectedParentSceneId ?? null,
    expectedParentSiteId: input.expectedParentSiteId ?? null,
  });
  const lineage = scene.getFlag(FLAG_SCOPE, 'lineage') ?? null;
  notify.updated('scene', scene.name, { summary: 'parent cleared' });
  return { success: true, data: { action: 'clear-scene-parent', sceneId: scene.id, sceneName: scene.name, lineage } };
}

type SetRootInput = Extract<AugurNexusInputType, { action: 'set-root-scene' }>;
async function handleSetRootScene(input: SetRootInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  // setRootScene is NOT exported via api/index.js — import the manager directly. Awaited batch update.
  const NexusLineageManager = await importLineageManager();
  await NexusLineageManager.setRootScene(scene);
  if (scene.getFlag(FLAG_SCOPE, 'nexusRoot') !== true) {
    return notPersisted(`nexusRoot flag not true on scene "${scene.id}" after setRootScene`);
  }
  notify.updated('scene', scene.name, { summary: 'set as Nexus root' });
  return { success: true, data: { action: 'set-root-scene', sceneId: scene.id, sceneName: scene.name, nexusRoot: true } };
}

// ── connection-add ──────────────────────────────────────────────────────────────

type AddConnInput = Extract<AugurNexusInputType, { action: 'add-connection' }>;
async function handleAddConnection(input: AddConnInput): Promise<Envelope<unknown>> {
  const resolver = await importTargetResolver();
  const sourceDesc = await resolveTargetDescriptor(resolver, input.source as RawTarget);
  if (!sourceDesc) return targetNotFound(`source target could not be resolved: ${JSON.stringify(input.source)}`);
  const relatedDesc = await resolveTargetDescriptor(resolver, input.related as RawTarget);
  if (!relatedDesc) return targetNotFound(`related target could not be resolved: ${JSON.stringify(input.related)}`);

  const ConnectionStore = await importConnectionStore();
  const options: Record<string, unknown> = {};
  if (input.category) options.category = input.category;
  if (input.role) options.role = input.role;
  if (input.note !== undefined) options.note = input.note;
  const edge = await ConnectionStore.addConnection(sourceDesc, relatedDesc, options);
  if (!edge) {
    return notPersisted('addConnection returned null (same node, or both targets resolved to the same id)');
  }
  // Verify the edge is in the persisted graph.
  const graph = ConnectionStore.getGraph();
  if (!graph.edges?.[edge.id]) return notPersisted(`edge "${edge.id}" not in connectionsGraph after addConnection`);

  notify.created('cross-doc-fk', `connection ${edge.id}`, { summary: `${sourceDesc.id} ↔ ${relatedDesc.id}` });
  return {
    success: true,
    data: {
      action: 'add-connection',
      edgeId: edge.id,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      category: edge.category,
      role: edge.role,
      note: edge.note,
    },
  };
}

type UpdateConnInput = Extract<AugurNexusInputType, { action: 'update-connection' }>;
async function handleUpdateConnection(input: UpdateConnInput): Promise<Envelope<unknown>> {
  const ConnectionStore = await importConnectionStore();
  const patch: Record<string, unknown> = {};
  if (input.category) patch.category = input.category;
  if (input.role) patch.role = input.role;
  if (input.note !== undefined) patch.note = input.note;
  if (input.playerVisibility) patch.playerVisibility = input.playerVisibility;
  const edge = await ConnectionStore.updateConnection(input.edgeId, patch);
  if (!edge) return targetNotFound(`edge "${input.edgeId}" not found in connectionsGraph`);
  notify.updated('cross-doc-fk', `connection ${edge.id}`, { summary: 'updated' });
  return {
    success: true,
    data: {
      action: 'update-connection',
      edgeId: edge.id,
      category: edge.category,
      role: edge.role,
      note: edge.note,
      playerVisibility: edge.playerVisibility,
    },
  };
}

type RemoveConnInput = Extract<AugurNexusInputType, { action: 'remove-connections-for-target' }>;
async function handleRemoveConnectionsForTarget(input: RemoveConnInput): Promise<Envelope<unknown>> {
  const resolver = await importTargetResolver();
  const desc = await resolveTargetDescriptor(resolver, input.target as RawTarget);
  if (!desc) return targetNotFound(`target could not be resolved: ${JSON.stringify(input.target)}`);

  const ConnectionStore = await importConnectionStore();
  const nodeId = resolver.getNodeId(desc);
  const removed = await ConnectionStore.removeConnectionsForTarget(desc);
  // Verify the node is gone.
  const graph = ConnectionStore.getGraph();
  if (graph.nodes?.[nodeId]) return notPersisted(`node "${nodeId}" still in connectionsGraph after removeConnectionsForTarget`);

  notify.deleted('cross-doc-fk', `node ${nodeId}`, { summary: 'connections removed' });
  return { success: true, data: { action: 'remove-connections-for-target', nodeId, removed: Boolean(removed) } };
}

type UpsertCategoryInput = Extract<AugurNexusInputType, { action: 'upsert-custom-category' }>;
async function handleUpsertCustomCategory(input: UpsertCategoryInput): Promise<Envelope<unknown>> {
  const ConnectionStore = await importConnectionStore();
  const category: Record<string, unknown> = { label: input.label };
  if (input.id) category.id = input.id;
  if (input.singular) category.singular = input.singular;
  if (input.icon) category.icon = input.icon;
  if (input.color) category.color = input.color;
  const normalized = await ConnectionStore.upsertCustomCategory(category);
  if (!normalized) return notPersisted('upsertCustomCategory returned null (empty label?)');
  const graph = ConnectionStore.getGraph();
  if (!graph.customCategories?.[normalized.id]) {
    return notPersisted(`category "${normalized.id}" not in connectionsGraph after upsertCustomCategory`);
  }
  notify.created('cross-doc-fk', `category ${normalized.id}`, { summary: normalized.label });
  return {
    success: true,
    data: { action: 'upsert-custom-category', id: normalized.id, label: normalized.label, color: normalized.color, icon: normalized.icon },
  };
}

// ── connection-query ──────────────────────────────────────────────────────────────

type GetConnForNodeInput = Extract<AugurNexusInputType, { action: 'get-connections-for-node' }>;
async function handleGetConnectionsForNode(input: GetConnForNodeInput): Promise<Envelope<unknown>> {
  const resolver = await importTargetResolver();
  const desc = await resolveTargetDescriptor(resolver, input.target as RawTarget);
  if (!desc) return targetNotFound(`target could not be resolved: ${JSON.stringify(input.target)}`);
  const nodeId = resolver.getNodeId(desc);
  const ConnectionStore = await importConnectionStore();
  const connections = ConnectionStore.getConnectionsForNode(nodeId).map((c: any) => ({
    edgeId: c.edge?.id,
    category: c.edge?.category,
    role: c.edge?.role,
    note: c.edge?.note,
    playerVisibility: c.edge?.playerVisibility,
    otherNodeId: c.node?.id,
    otherNodeName: c.node?.name,
    otherNodeKind: c.node?.kind,
  }));
  return { success: true, data: { action: 'get-connections-for-node', nodeId, count: connections.length, connections } };
}

async function handleGetConnectionsGraph(): Promise<Envelope<unknown>> {
  const ConnectionStore = await importConnectionStore();
  const graph = ConnectionStore.getGraph();
  return {
    success: true,
    data: {
      action: 'get-connections-graph',
      version: graph.version ?? 1,
      nodeCount: Object.keys(graph.nodes ?? {}).length,
      edgeCount: Object.keys(graph.edges ?? {}).length,
      customCategories: Object.keys(graph.customCategories ?? {}),
      nodeIds: Object.keys(graph.nodes ?? {}),
      edgeIds: Object.keys(graph.edges ?? {}),
    },
  };
}

// ── access-policy ──────────────────────────────────────────────────────────────

type GetPoliciesInput = Extract<AugurNexusInputType, { action: 'get-access-policies' }>;
async function handleGetAccessPolicies(input: GetPoliciesInput): Promise<Envelope<unknown>> {
  const settings = getGame()?.settings;
  const data: Record<string, unknown> = {
    action: 'get-access-policies',
    playerSceneViewing: settings?.get?.(SETTING_SCOPE, VIEW_POLICY_KEY) ?? 'all',
    playerNexusVisibility: settings?.get?.(SETTING_SCOPE, NEXUS_VISIBILITY_POLICY_KEY) ?? 'all',
    playerConnectionVisibility: settings?.get?.(SETTING_SCOPE, CONNECTION_VISIBILITY_POLICY_KEY) ?? 'all',
  };
  if (input.sceneId) {
    const scene = resolveScene(input.sceneId);
    if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
    const playerAccess = (scene.getFlag(FLAG_SCOPE, 'playerAccess') as any) ?? {};
    data.scene = {
      sceneId: scene.id,
      view: playerAccess.view ?? 'inherit',
      nexus: playerAccess.nexus ?? 'inherit',
    };
  }
  return { success: true, data };
}

async function handleSetGlobalPolicy(action: string, settingKey: string, policy: string): Promise<Envelope<unknown>> {
  // PATH B — raw awaited setting write. The module's onChange/Hooks side-effect is UI-only (browser
  // refresh), so a direct set is the simplest sound path; verify via read-back.
  await getGame().settings.set(SETTING_SCOPE, settingKey, policy);
  const persisted = getGame().settings.get(SETTING_SCOPE, settingKey);
  if (persisted !== policy) return notPersisted(`setting "${settingKey}" expected ${policy}, got ${persisted}`);
  notify.updated('setting', `augur-nexus.${settingKey}`, { summary: policy });
  return { success: true, data: { action, settingKey, policy: persisted } };
}

type SetSceneViewInput = Extract<AugurNexusInputType, { action: 'set-player-scene-view-override' }>;
async function handleSetPlayerSceneViewOverride(input: SetSceneViewInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  // Module setter handles the merge + delete-key-on-inherit + unsetFlag-when-empty (awaited).
  await api.setPlayerSceneViewOverride(scene, input.value);
  const persisted = (scene.getFlag(FLAG_SCOPE, 'playerAccess') as any)?.view ?? 'inherit';
  const expected = input.value; // 'inherit' read-back surfaces as 'inherit' (key deleted) — the
  // `?? 'inherit'` default above already captures that, so compare `persisted` directly against
  // `expected` (RC1.1a — the prior ternary short-circuited to the literal 'inherit' string on
  // BOTH sides of the comparison whenever expected was 'inherit', provably never firing
  // regardless of what actually persisted).
  if (persisted !== expected) {
    return notPersisted(`playerAccess.view expected ${expected}, got ${persisted}`);
  }
  notify.updated('scene', scene.name, { summary: `player view override → ${input.value}` });
  return { success: true, data: { action: 'set-player-scene-view-override', sceneId: scene.id, value: persisted } };
}

type SetNexusVisInput = Extract<AugurNexusInputType, { action: 'set-player-nexus-visibility-override' }>;
async function handleSetPlayerNexusVisibilityOverride(input: SetNexusVisInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  await api.setPlayerNexusVisibilityOverride(scene, input.value);
  const persisted = (scene.getFlag(FLAG_SCOPE, 'playerAccess') as any)?.nexus ?? 'inherit';
  // RC1.1a — same tautology fix as set-player-scene-view-override above: compare `persisted`
  // (already 'inherit'-defaulted) directly against `input.value`.
  if (persisted !== input.value) {
    return notPersisted(`playerAccess.nexus expected ${input.value}, got ${persisted}`);
  }
  notify.updated('scene', scene.name, { summary: `player nexus visibility → ${input.value}` });
  return { success: true, data: { action: 'set-player-nexus-visibility-override', sceneId: scene.id, value: persisted } };
}

type SetConnVisInput = Extract<AugurNexusInputType, { action: 'set-connection-player-visibility' }>;
async function handleSetConnectionPlayerVisibility(input: SetConnVisInput): Promise<Envelope<unknown>> {
  const ConnectionStore = await importConnectionStore();
  const edge = await ConnectionStore.setConnectionPlayerVisibility(input.edgeId, input.value);
  if (!edge) return targetNotFound(`edge "${input.edgeId}" not found in connectionsGraph`);
  notify.updated('cross-doc-fk', `connection ${edge.id}`, { summary: `visibility ${input.value}` });
  return {
    success: true,
    data: { action: 'set-connection-player-visibility', edgeId: edge.id, playerVisibility: edge.playerVisibility },
  };
}

type SetSiteVisInput = Extract<AugurNexusInputType, { action: 'set-site-player-visibility' }>;
async function handleSetSitePlayerVisibility(input: SetSiteVisInput): Promise<Envelope<unknown>> {
  const parentScene = resolveScene(input.parentSceneId);
  if (!parentScene) return targetNotFound(`parent scene "${input.parentSceneId}" not found`);
  const VisibilityManager = await importVisibilityManager();
  const result = await VisibilityManager.setSitePlayerVisibilityOverride({
    parentScene,
    siteId: input.siteId,
    value: input.value,
  });
  if (result === null || result === undefined) {
    return targetNotFound(`site "${input.siteId}" not found on scene "${parentScene.id}"`);
  }
  notify.updated('scene', parentScene.name, { summary: `site ${input.siteId} visibility → ${input.value}` });
  return {
    success: true,
    data: { action: 'set-site-player-visibility', parentSceneId: parentScene.id, siteId: input.siteId, playerVisibility: result },
  };
}

// ── visibility-sync (LIVE-SMOKE-ONLY) ──────────────────────────────────────────────

type ApplyVisInput = Extract<AugurNexusInputType, { action: 'apply-scene-visibility' }>;
async function handleApplySceneVisibility(input: ApplyVisInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const VisibilityManager = await importVisibilityManager();
  await VisibilityManager.applySceneVisibility(scene);
  const summary = VisibilityManager.getSceneSummary(scene);
  notify.updated('scene', scene.name, { summary: `visibility synced (${summary?.siteCount ?? 0} sites)` });
  return {
    success: true,
    data: { action: 'apply-scene-visibility', sceneId: scene.id, siteCount: summary?.siteCount ?? 0, note: 'Tile + Drawing-label hidden state re-synced to current policy. LIVE-SMOKE-ONLY.' },
  };
}

// ── lineage-read ──────────────────────────────────────────────────────────────

async function handleGetLineageTree(): Promise<Envelope<unknown>> {
  const NexusLineageManager = await importLineageManager();
  const { rootScene, rows } = NexusLineageManager.getLineageRows();
  const lightRows = (rows ?? []).map((r: any) => ({
    id: r.id,
    nodeKind: r.nodeKind,
    sceneId: r.sceneId ?? null,
    siteId: r.siteId ?? null,
    name: r.name,
    parentSceneId: r.parentSceneId ?? null,
    depth: r.depth,
    hasChildren: r.hasChildren,
    isRoot: r.isRoot,
  }));
  return {
    success: true,
    data: { action: 'get-lineage-tree', rootSceneId: rootScene?.id ?? null, rootSceneName: rootScene?.name ?? null, rowCount: lightRows.length, rows: lightRows },
  };
}

type GetParentInput = Extract<AugurNexusInputType, { action: 'get-parent-scene' }>;
async function handleGetParentScene(input: GetParentInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  const parent = api.getParentScene(scene);
  return {
    success: true,
    data: { action: 'get-parent-scene', sceneId: scene.id, parent: parent ? { id: parent.id, name: parent.name } : null },
  };
}

type GetChildrenInput = Extract<AugurNexusInputType, { action: 'get-child-scenes' }>;
async function handleGetChildScenes(input: GetChildrenInput): Promise<Envelope<unknown>> {
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const api = await importApi();
  const children = (api.getChildScenes(scene) ?? []).map((c: any) => ({ id: c.id, name: c.name }));
  return { success: true, data: { action: 'get-child-scenes', sceneId: scene.id, count: children.length, children } };
}

// ── destructive deletes (confirm-gated) ──────────────────────────────────────────

type DeleteBranchInput = Extract<AugurNexusInputType, { action: 'delete-scene-branch' }>;
async function handleDeleteSceneBranch(input: DeleteBranchInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return {
      success: false,
      error: `${ErrorTokens.AUGUR_NEXUS_CONFIRM_REQUIRED}: delete-scene-branch is IRREVERSIBLE (deletes the scene, all child scenes, embedded tiles/notes/drawings, and owned journals). Re-call with confirm:true.`,
    };
  }
  const scene = resolveScene(input.sceneId);
  if (!scene) return targetNotFound(`scene "${input.sceneId}" not found`);
  const sceneName = scene.name;
  const api = await importApi();
  // api.deleteSceneBranch(scene) calls deleteSceneBranch(scene,{confirmed:true}) — {confirmed:true} SKIPS
  // the module's own confirmDestructiveAction DialogV2 (the deadlock path). We NEVER call deleteSite.
  const ok = await api.deleteSceneBranch(scene);
  if (getGame()?.scenes?.get?.(input.sceneId)) {
    return notPersisted(`scene "${input.sceneId}" still exists after deleteSceneBranch`);
  }
  notify.deleted('scene', sceneName, { summary: 'Nexus branch deleted' });
  return { success: true, data: { action: 'delete-scene-branch', sceneId: input.sceneId, sceneName, deleted: Boolean(ok) } };
}

type DeleteCategoryInput = Extract<AugurNexusInputType, { action: 'delete-custom-category' }>;
async function handleDeleteCustomCategory(input: DeleteCategoryInput): Promise<Envelope<unknown>> {
  if (input.confirm !== true) {
    return {
      success: false,
      error: `${ErrorTokens.AUGUR_NEXUS_CONFIRM_REQUIRED}: delete-custom-category re-assigns ALL edges/nodes using "${input.categoryId}" to "unassigned" (may scramble categorized connections). Re-call with confirm:true.`,
    };
  }
  const ConnectionStore = await importConnectionStore();
  const removed = await ConnectionStore.deleteCustomCategory(input.categoryId);
  if (!removed) return targetNotFound(`custom category "${input.categoryId}" not found`);
  const graph = ConnectionStore.getGraph();
  if (graph.customCategories?.[input.categoryId]) {
    return notPersisted(`category "${input.categoryId}" still present after deleteCustomCategory`);
  }
  notify.deleted('cross-doc-fk', `category ${input.categoryId}`, { summary: 'edges re-assigned to unassigned' });
  return { success: true, data: { action: 'delete-custom-category', categoryId: input.categoryId, deleted: true } };
}
