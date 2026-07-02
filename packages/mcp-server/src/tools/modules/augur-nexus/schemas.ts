// Module Integration v2 Phase 5 — module-augur-nexus mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Augur: Nexus v1.1.6. 28 actions across 8 idioms + 2 confirm-gated deletes. Each handler return carries
// `action` as a discriminant; AugurNexusResult is their union so the tool stays typed without <any>.

export interface AugurNexusSceneNavigationResult {
  action: 'get-scene-navigation' | 'set-scene-navigation';
  sceneId: string;
  sceneName: string;
  navigation: { parentSceneId?: string; parentSiteId?: string | null; transitionStyle?: string } | null;
}

export interface AugurNexusCreateLinkedSiteResult {
  action: 'create-linked-site';
  parentSceneId: string;
  linkedSceneId: string;
  siteId: string | null;
  placeableId: string | null;
  note: string;
}

export interface AugurNexusSiteRecord {
  siteId: string;
  siteName: string;
  linkedSceneId: string | null;
  placeableId: string | null;
  placeableDocumentName: string | null;
  playerVisibility: string;
}

export interface AugurNexusReadSiteRecordsResult {
  action: 'read-site-records';
  sceneId: string;
  sceneName: string;
  count: number;
  records: AugurNexusSiteRecord[];
}

export interface AugurNexusRemoveSiteRecordResult {
  action: 'remove-site-record';
  sceneId: string;
  siteId: string;
  deletedDocuments: string[];
}

export interface AugurNexusLineageWriteResult {
  action: 'set-scene-parent' | 'clear-scene-parent';
  sceneId: string;
  sceneName: string;
  lineage: { parentSceneId?: string | null; parentSiteId?: string | null } | null;
}

export interface AugurNexusSetRootResult {
  action: 'set-root-scene';
  sceneId: string;
  sceneName: string;
  nexusRoot: boolean;
}

export interface AugurNexusAddConnectionResult {
  action: 'add-connection';
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  category: string;
  role: string;
  note: string;
}

export interface AugurNexusUpdateConnectionResult {
  action: 'update-connection';
  edgeId: string;
  category: string;
  role: string;
  note: string;
  playerVisibility: string;
}

export interface AugurNexusRemoveConnectionsResult {
  action: 'remove-connections-for-target';
  nodeId: string;
  removed: boolean;
}

export interface AugurNexusUpsertCategoryResult {
  action: 'upsert-custom-category';
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface AugurNexusConnection {
  edgeId: string;
  category: string;
  role: string;
  note: string;
  playerVisibility: string;
  otherNodeId: string;
  otherNodeName: string;
  otherNodeKind: string;
}

export interface AugurNexusConnectionsForNodeResult {
  action: 'get-connections-for-node';
  nodeId: string;
  count: number;
  connections: AugurNexusConnection[];
}

export interface AugurNexusConnectionsGraphResult {
  action: 'get-connections-graph';
  version: number;
  nodeCount: number;
  edgeCount: number;
  customCategories: string[];
  nodeIds: string[];
  edgeIds: string[];
}

export interface AugurNexusAccessPoliciesResult {
  action: 'get-access-policies';
  playerSceneViewing: string;
  playerNexusVisibility: string;
  playerConnectionVisibility: string;
  scene?: { sceneId: string; view: string; nexus: string };
}

export interface AugurNexusGlobalPolicyResult {
  action: 'set-global-scene-view-policy' | 'set-global-nexus-visibility-policy' | 'set-global-connection-visibility-policy';
  settingKey: string;
  policy: string;
}

export interface AugurNexusSceneOverrideResult {
  action: 'set-player-scene-view-override' | 'set-player-nexus-visibility-override';
  sceneId: string;
  value: string;
}

export interface AugurNexusConnectionVisibilityResult {
  action: 'set-connection-player-visibility';
  edgeId: string;
  playerVisibility: string;
}

export interface AugurNexusSiteVisibilityResult {
  action: 'set-site-player-visibility';
  parentSceneId: string;
  siteId: string;
  playerVisibility: string;
}

export interface AugurNexusApplyVisibilityResult {
  action: 'apply-scene-visibility';
  sceneId: string;
  siteCount: number;
  note: string;
}

export interface AugurNexusLineageRow {
  id: string;
  nodeKind: string;
  sceneId: string | null;
  siteId: string | null;
  name: string;
  parentSceneId: string | null;
  depth: number;
  hasChildren: boolean;
  isRoot: boolean;
}

export interface AugurNexusLineageTreeResult {
  action: 'get-lineage-tree';
  rootSceneId: string | null;
  rootSceneName: string | null;
  rowCount: number;
  rows: AugurNexusLineageRow[];
}

export interface AugurNexusParentSceneResult {
  action: 'get-parent-scene';
  sceneId: string;
  parent: { id: string; name: string } | null;
}

export interface AugurNexusChildScenesResult {
  action: 'get-child-scenes';
  sceneId: string;
  count: number;
  children: { id: string; name: string }[];
}

export interface AugurNexusDeleteBranchResult {
  action: 'delete-scene-branch';
  sceneId: string;
  sceneName: string;
  deleted: boolean;
}

export interface AugurNexusDeleteCategoryResult {
  action: 'delete-custom-category';
  categoryId: string;
  deleted: boolean;
}

export type AugurNexusResult =
  | AugurNexusSceneNavigationResult
  | AugurNexusCreateLinkedSiteResult
  | AugurNexusReadSiteRecordsResult
  | AugurNexusRemoveSiteRecordResult
  | AugurNexusLineageWriteResult
  | AugurNexusSetRootResult
  | AugurNexusAddConnectionResult
  | AugurNexusUpdateConnectionResult
  | AugurNexusRemoveConnectionsResult
  | AugurNexusUpsertCategoryResult
  | AugurNexusConnectionsForNodeResult
  | AugurNexusConnectionsGraphResult
  | AugurNexusAccessPoliciesResult
  | AugurNexusGlobalPolicyResult
  | AugurNexusSceneOverrideResult
  | AugurNexusConnectionVisibilityResult
  | AugurNexusSiteVisibilityResult
  | AugurNexusApplyVisibilityResult
  | AugurNexusLineageTreeResult
  | AugurNexusParentSceneResult
  | AugurNexusChildScenesResult
  | AugurNexusDeleteBranchResult
  | AugurNexusDeleteCategoryResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 28 actions) ──

export const AUGUR_NEXUS_ACTIONS = [
  'get-scene-navigation',
  'set-scene-navigation',
  'create-linked-site',
  'read-site-records',
  'remove-site-record',
  'set-scene-parent',
  'clear-scene-parent',
  'set-root-scene',
  'add-connection',
  'update-connection',
  'remove-connections-for-target',
  'upsert-custom-category',
  'get-connections-for-node',
  'get-connections-graph',
  'get-access-policies',
  'set-global-scene-view-policy',
  'set-global-nexus-visibility-policy',
  'set-global-connection-visibility-policy',
  'set-player-scene-view-override',
  'set-player-nexus-visibility-override',
  'set-connection-player-visibility',
  'set-site-player-visibility',
  'apply-scene-visibility',
  'get-lineage-tree',
  'get-parent-scene',
  'get-child-scenes',
  'delete-scene-branch',
  'delete-custom-category',
] as const;

export type AugurNexusAction = (typeof AUGUR_NEXUS_ACTIONS)[number];
