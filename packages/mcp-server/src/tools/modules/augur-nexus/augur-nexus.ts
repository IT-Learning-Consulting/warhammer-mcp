// Module Integration v2 Phase 5 — module-augur-nexus MCP tool (Augur: Nexus v1.1.6, The Augur).
//
// Always-registered umbrella. The foundry-module handler guards on augur-nexus being active; when inactive
// it returns MODULE_NOT_ACTIVE which BaseTool.query() converts to a throw → moduleNotActiveContent().
// Pre-flight with module-probe.is-active augur-nexus.
//
// 28 actions across 8 idioms (scene-jump, link-scene, reparent-scene, connection-add, connection-query,
// access-policy, visibility-sync, lineage-read) + 2 confirm-gated deletes. Anchors: DP-15 (concrete
// this.query<AugurNexusResult> — never <any>); R2.4 (errors via errorResponse). create-linked-site and
// apply-scene-visibility are LIVE-SMOKE-ONLY (embed/depend-on placeables with no MCP enumerate primitive).

import { BaseTool, BaseToolOptions } from '../../../base-tool.js';
import { ErrorTokens } from '@foundry-mcp/shared';
import { moduleNotActiveContent } from '../_shared/module-guard.js';
import { AUGUR_NEXUS_ACTIONS, type AugurNexusResult } from './schemas.js';

// ── Single discriminated formatter (one text line per action) ──────────────────

function formatResult(d: AugurNexusResult): string {
  const p = 'module-augur-nexus';
  switch (d.action) {
    case 'get-scene-navigation':
    case 'set-scene-navigation':
      return `${p}.${d.action}: scene ${d.sceneName} (${d.sceneId}) — navigation ${d.navigation ? `→ parent ${d.navigation.parentSceneId}` : 'none'}.`;
    case 'create-linked-site':
      return `${p}.create-linked-site: site ${d.siteId} pinned on ${d.parentSceneId} → linked scene ${d.linkedSceneId}. ${d.note}`;
    case 'read-site-records':
      return `${p}.read-site-records: scene ${d.sceneName} (${d.sceneId}) has ${d.count} site record(s).`;
    case 'remove-site-record':
      return `${p}.remove-site-record: site ${d.siteId} removed from ${d.sceneId} (deleted ${d.deletedDocuments.length} placeable doc(s)).`;
    case 'set-scene-parent':
    case 'clear-scene-parent':
      return `${p}.${d.action}: scene ${d.sceneName} (${d.sceneId}) — parent ${d.lineage?.parentSceneId ?? 'cleared'}.`;
    case 'set-root-scene':
      return `${p}.set-root-scene: ${d.sceneName} (${d.sceneId}) is now the Nexus root.`;
    case 'add-connection':
      return `${p}.add-connection: edge ${d.edgeId} (${d.sourceNodeId} ↔ ${d.targetNodeId}, category ${d.category}).`;
    case 'update-connection':
      return `${p}.update-connection: edge ${d.edgeId} → category ${d.category}, visibility ${d.playerVisibility}.`;
    case 'remove-connections-for-target':
      return `${p}.remove-connections-for-target: node ${d.nodeId} ${d.removed ? 'removed' : 'not found'}.`;
    case 'upsert-custom-category':
      return `${p}.upsert-custom-category: category ${d.id} "${d.label}".`;
    case 'get-connections-for-node':
      return `${p}.get-connections-for-node: node ${d.nodeId} has ${d.count} connection(s).`;
    case 'get-connections-graph':
      return `${p}.get-connections-graph: ${d.nodeCount} node(s), ${d.edgeCount} edge(s), ${d.customCategories.length} custom categor(ies).`;
    case 'get-access-policies':
      return `${p}.get-access-policies: scene-view=${d.playerSceneViewing}, nexus=${d.playerNexusVisibility}, connections=${d.playerConnectionVisibility}${d.scene ? ` | scene ${d.scene.sceneId}: view=${d.scene.view}, nexus=${d.scene.nexus}` : ''}.`;
    case 'set-global-scene-view-policy':
    case 'set-global-nexus-visibility-policy':
    case 'set-global-connection-visibility-policy':
      return `${p}.${d.action}: ${d.settingKey} → ${d.policy}.`;
    case 'set-player-scene-view-override':
    case 'set-player-nexus-visibility-override':
      return `${p}.${d.action}: scene ${d.sceneId} → ${d.value}.`;
    case 'set-connection-player-visibility':
      return `${p}.set-connection-player-visibility: edge ${d.edgeId} → ${d.playerVisibility}.`;
    case 'set-site-player-visibility':
      return `${p}.set-site-player-visibility: site ${d.siteId} on ${d.parentSceneId} → ${d.playerVisibility}.`;
    case 'apply-scene-visibility':
      return `${p}.apply-scene-visibility: scene ${d.sceneId} re-synced (${d.siteCount} site(s)). ${d.note}`;
    case 'get-lineage-tree':
      return `${p}.get-lineage-tree: root ${d.rootSceneName ?? 'none'} (${d.rootSceneId ?? '—'}), ${d.rowCount} row(s).`;
    case 'get-parent-scene':
      return `${p}.get-parent-scene: scene ${d.sceneId} → parent ${d.parent ? `${d.parent.name} (${d.parent.id})` : 'none'}.`;
    case 'get-child-scenes':
      return `${p}.get-child-scenes: scene ${d.sceneId} has ${d.count} child scene(s).`;
    case 'delete-scene-branch':
      return `${p}.delete-scene-branch: ${d.sceneName} (${d.sceneId}) ${d.deleted ? 'and its branch deleted' : 'not deleted'}.`;
    case 'delete-custom-category':
      return `${p}.delete-custom-category: category ${d.categoryId} ${d.deleted ? 'deleted (edges → unassigned)' : 'not deleted'}.`;
    default: {
      const _exhaustive: never = d;
      return `${p}: ${JSON.stringify(_exhaustive)}`;
    }
  }
}

export interface ModuleAugurNexusToolOptions extends BaseToolOptions {}

export class ModuleAugurNexusTool extends BaseTool {
  constructor(options: ModuleAugurNexusToolOptions) {
    super(options);
  }

  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [{ name: 'module-augur-nexus', handler: (args: any) => this.execute(args) }];
  }

  getToolDefinitions() {
    return [
      {
        name: 'module-augur-nexus',
        title: 'Augur: Nexus integration — scene-tree navigation + world-relationship (connections) graph',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: false,
        },
        description: `Drive the Augur: Nexus module (WFRP4e/any system) — build a hierarchical scene tree (lineage + navigation), manage site pins that link scenes, maintain a world relationship graph (connections between scenes / sites / Foundry documents), and set player view/visibility policy. State persists as flags.augur-nexus.* on Scenes/Tiles/Notes/Drawings + the connectionsGraph + player-policy world settings (server-verifiable).
Conditional: returns MODULE_NOT_ACTIVE when augur-nexus is absent/inactive. Pre-flight: module-probe.is-active augur-nexus.

CONFIRM-GATED (irreversible): delete-scene-branch (deletes the scene + all child scenes + embedded docs + journals) and delete-custom-category (re-assigns all edges to "unassigned") require confirm:true. Cinematic scene transitions + canvas ghost placement are UI-only and NOT exposed. create-linked-site + apply-scene-visibility are LIVE-SMOKE-ONLY (touch canvas placeables).

28 actions:
scene-jump: get-scene-navigation { sceneId } · set-scene-navigation { sceneId, parentSceneId?, parentSiteId?, transitionStyle? } (omit parentSceneId to clear).
link-scene: create-linked-site { parentSceneId, linkedSceneId, siteData? } · read-site-records { sceneId } · remove-site-record { sceneId, siteId }.
reparent-scene: set-scene-parent { sceneId, parentSceneId, parentSiteId? } · clear-scene-parent { sceneId, expectedParentSceneId?, expectedParentSiteId? } · set-root-scene { sceneId }.
connection-add: add-connection { source, related, category?, role?, note? } · update-connection { edgeId, category?, role?, note?, playerVisibility? } · remove-connections-for-target { target } · upsert-custom-category { label, id?, singular?, icon?, color? }.
connection-query: get-connections-for-node { target } · get-connections-graph {}.
access-policy: get-access-policies { sceneId? } · set-global-scene-view-policy { policy } · set-global-nexus-visibility-policy { policy } · set-global-connection-visibility-policy { policy } · set-player-scene-view-override { sceneId, value } · set-player-nexus-visibility-override { sceneId, value } · set-connection-player-visibility { edgeId, value } · set-site-player-visibility { parentSceneId, siteId, value }.
visibility-sync: apply-scene-visibility { sceneId }.
lineage-read: get-lineage-tree {} · get-parent-scene { sceneId } · get-child-scenes { sceneId }.
deletes: delete-scene-branch { sceneId, confirm } · delete-custom-category { categoryId, confirm }.

A connection "target" is one of: { kind:"nexus-scene", sceneId } | { kind:"nexus-site", parentSceneId, siteId } | { kind:"foundry-document", uuid, category? } | { id } (prebuilt node id). policy ∈ all|explicit; scene-view value ∈ inherit|allow|block; nexus/connection/site visibility value ∈ inherit|show|hide.
Example: { action: "add-connection", source: { kind: "nexus-scene", sceneId: "abc" }, related: { kind: "foundry-document", uuid: "Actor.def" }, category: "faction" }`,
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: [...AUGUR_NEXUS_ACTIONS], description: 'Augur: Nexus action to perform.' },
            sceneId: { type: 'string', description: 'Target scene id (most scene/lineage/nav/site actions).' },
            parentSceneId: { type: 'string', description: 'Parent scene id (set-scene-parent / nexus-site target / set-site-player-visibility).' },
            parentSiteId: { type: 'string', description: 'Parent site id (set-scene-parent / set-scene-navigation).' },
            linkedSceneId: { type: 'string', description: 'create-linked-site: the child scene to wire to the pin.' },
            siteId: { type: 'string', description: 'Site record id (remove-site-record / set-site-player-visibility / nexus-site target).' },
            siteData: { type: 'object', description: 'create-linked-site: optional site fields (siteName, iconSrc, x, y, iconSize, siteColor, …).', additionalProperties: true },
            expectedParentSceneId: { type: 'string', description: 'clear-scene-parent: only clear if the current parent matches.' },
            expectedParentSiteId: { type: 'string', description: 'clear-scene-parent: only clear if the current parent site matches.' },
            source: { type: 'object', description: 'add-connection source target descriptor (nexus-scene | nexus-site | foundry-document | {id}).', additionalProperties: true },
            related: { type: 'object', description: 'add-connection related target descriptor.', additionalProperties: true },
            target: { type: 'object', description: 'get-connections-for-node / remove-connections-for-target target descriptor.', additionalProperties: true },
            edgeId: { type: 'string', description: 'update-connection / set-connection-player-visibility: the connection edge id.' },
            categoryId: { type: 'string', description: 'delete-custom-category: the custom category id to delete.' },
            id: { type: 'string', description: 'upsert-custom-category: optional explicit category id.' },
            label: { type: 'string', description: 'upsert-custom-category: the category display label (required).' },
            singular: { type: 'string', description: 'upsert-custom-category: optional singular label.' },
            icon: { type: 'string', description: 'upsert-custom-category: optional Font Awesome icon class.' },
            color: { type: 'string', description: 'upsert-custom-category: optional hex color.' },
            category: { type: 'string', description: 'add-connection / update-connection: connection category (e.g. npc, faction, place).' },
            role: { type: 'string', description: 'add-connection / update-connection: relationship role label.' },
            note: { type: 'string', description: 'add-connection / update-connection: free-text note on the edge.' },
            playerVisibility: { type: 'string', enum: ['inherit', 'show', 'hide'], description: 'update-connection: per-edge player visibility.' },
            policy: { type: 'string', enum: ['all', 'explicit'], description: 'set-global-*-policy: the global player visibility policy.' },
            value: { type: 'string', description: 'Override value — scene-view: inherit|allow|block; nexus/connection/site visibility: inherit|show|hide.' },
            transitionStyle: { type: 'string', description: 'set-scene-navigation: optional transition style label (cinematic playback is UI-only).' },
            confirm: { type: 'boolean', description: 'delete-scene-branch / delete-custom-category: must be true to execute the irreversible op.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(rawArgs: Record<string, unknown>) {
    const action = String(rawArgs.action ?? 'unknown');
    this.logger.info('Executing module-augur-nexus action', { action });
    if (!(AUGUR_NEXUS_ACTIONS as readonly string[]).includes(action)) {
      return this.errorResponse(action, `unknown action: ${action}`);
    }
    try {
      const data = await this.query<AugurNexusResult>('module-augur-nexus', rawArgs);
      return {
        content: [{ type: 'text' as const, text: formatResult(data) }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes(ErrorTokens.MODULE_NOT_ACTIVE)) return moduleNotActiveContent('module-augur-nexus', msg);
      return this.errorResponse(action, msg);
    }
  }
}
