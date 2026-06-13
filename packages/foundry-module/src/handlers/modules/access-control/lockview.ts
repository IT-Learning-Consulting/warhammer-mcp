// Module Integration v1 Phase 7C — LockView (Lock View) action handlers.
//
// Handlers run inside Foundry via CONFIG.queries. LockView's API is the global
// `globalThis.lockView` (registered in the module's setup hook — there is NO
// game.modules.get('LockView').api).
//
// Confirmed signatures (modules-docs/LockView/audit.md + live drift-check 2026-06-13, v2.1.0):
//   lockView.locks.get() → {pan,zoom,boundingBox}
//   lockView.locks.update({pan?,zoom?,boundingBox?}, {fromSocket?, save?})   ({save:true} persists+broadcasts)
//   lockView.sceneHandler.forceInitialView(scene?) / setAutoscale(scene?) / onSceneUpdate(scene, source, emitUpdate?)
//   lockView.socket.refresh() / pullStaticUsers(sceneId) / setView(data) / setViewDialog(data, users[])
//   lockView.apps.cloneView.apply(pan, zoom, users)   (users = {userId:true} map)
//   Scene flags: flags.LockView.{locks,ui,sidebar,avDock,autoscale,forceInitialView}
//   Per-Drawing: Drawing.flags.LockView.boundingBox ∈ {'disabled','owned','always'}
//
// libWrapper (DEPENDENCY_GATED): lock ENFORCEMENT needs lib-wrapper (Canvas.prototype.pan
// wrap). LockView loads without it (bundled shim) but locks won't enforce. Per user
// decision (2026-06-13): lock-write actions WRITE the flag + return libWrapperActive —
// they do NOT hard-block.
//
// onSceneUpdate is called best-effort after scene-flag writes (wrapped in try/catch) so the
// persistent flag write always succeeds even if the live-refresh call shape differs.
//
// notify on writes (CCR-3): 'scene' kind. Reads (get-lock-state, get-scene-flags) silent.

import { notify } from '../../../notify.js';
import type { ModuleAccessControlInputType } from './schemas.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

function getGame(): any {
  return (globalThis as any).game;
}
function getCanvas(): any {
  return (globalThis as any).canvas;
}

/** The LockView global API. Throws a typed error if unavailable. */
function getLockView(): any {
  const lv = (globalThis as any).lockView;
  if (!lv) throw new Error('LOCKVIEW_API_UNAVAILABLE: globalThis.lockView is not registered (LockView may be loading).');
  return lv;
}

function isLibWrapperActive(): boolean {
  return Boolean(getGame()?.modules?.get?.('lib-wrapper')?.active);
}

function resolveScene(sceneId?: string): any {
  const game = getGame();
  if (!sceneId) {
    const scene = getCanvas()?.scene;
    if (!scene) throw new Error('CANVAS_UNAVAILABLE: No active canvas scene; provide sceneId explicitly.');
    return scene;
  }
  const byId = game?.scenes?.get?.(sceneId);
  if (byId) return byId;
  const byUuid = game?.scenes?.find?.((s: any) => s.uuid === sceneId);
  if (byUuid) return byUuid;
  throw new Error(`SCENE_NOT_FOUND: No scene with id/UUID "${sceneId}".`);
}

/** Best-effort live re-apply after a scene-flag write. Never throws. */
function tryOnSceneUpdate(scene: any): void {
  try {
    getLockView()?.sceneHandler?.onSceneUpdate?.(scene, 'mcp', true);
  } catch { /* live-refresh is best-effort; the flag write is the source of truth */ }
}

/** Write a nested flags.LockView.<key> object onto the scene, merging. */
async function updateSceneFlag(scene: any, key: string, value: unknown): Promise<void> {
  await scene.update({ flags: { LockView: { [key]: value } } });
}

const libWrapperWarning = (active: boolean): string | null =>
  active ? null : 'libWrapperActive:false — the scene flag is persisted and will enforce once lib-wrapper is enabled, but pan/zoom/boundingBox enforcement is INACTIVE right now (LockView uses libWrapper to wrap Canvas.prototype.pan). Enable lib-wrapper in Module Management.';

// ── Type aliases ────────────────────────────────────────────────────────────────
type GetLockStateInput = Extract<ModuleAccessControlInputType, { action: 'get-lock-state' }>;
type GetSceneFlagsInput = Extract<ModuleAccessControlInputType, { action: 'get-scene-flags' }>;
type SetPanLockInput = Extract<ModuleAccessControlInputType, { action: 'set-pan-lock' }>;
type SetZoomLockInput = Extract<ModuleAccessControlInputType, { action: 'set-zoom-lock' }>;
type SetBoundingBoxLockInput = Extract<ModuleAccessControlInputType, { action: 'set-bounding-box-lock' }>;
type SetAutoscaleInput = Extract<ModuleAccessControlInputType, { action: 'set-autoscale' }>;
type SetForceInitialViewInput = Extract<ModuleAccessControlInputType, { action: 'set-force-initial-view' }>;
type SetUiHideInput = Extract<ModuleAccessControlInputType, { action: 'set-ui-hide' }>;
type SetSidebarBehaviorInput = Extract<ModuleAccessControlInputType, { action: 'set-sidebar-behavior' }>;
type TriggerInitialViewInput = Extract<ModuleAccessControlInputType, { action: 'trigger-initial-view' }>;
type TriggerAutoscaleInput = Extract<ModuleAccessControlInputType, { action: 'trigger-autoscale' }>;
type BroadcastRefreshInput = Extract<ModuleAccessControlInputType, { action: 'broadcast-refresh' }>;
type PullStaticUsersInput = Extract<ModuleAccessControlInputType, { action: 'pull-static-users' }>;
type ForceViewportAbsoluteInput = Extract<ModuleAccessControlInputType, { action: 'force-viewport-absolute' }>;
type ForceViewportRelativeInput = Extract<ModuleAccessControlInputType, { action: 'force-viewport-relative' }>;
type CloneGmViewInput = Extract<ModuleAccessControlInputType, { action: 'clone-gm-view' }>;
type SetViewDialogInput = Extract<ModuleAccessControlInputType, { action: 'set-view-dialog' }>;
type SetViewWithPanModeInput = Extract<ModuleAccessControlInputType, { action: 'set-view-with-pan-mode' }>;

// ── get-lock-state (LockView branch — documentId absent) ─────────────────────────

export async function handleGetLockStateLockView(input: GetLockStateInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const scene = resolveScene(input.sceneId);
    const liveLocks = (() => { try { return lockView.locks?.get?.(); } catch { return null; } })();
    const sceneLocks = scene.getFlag?.('LockView', 'locks') ?? null;
    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName: scene.name ?? scene.id,
        liveLocks,
        sceneLocks,
        libWrapperActive: isLibWrapperActive(),
      },
    };
  } catch (e) {
    return { success: false, error: `GET_LOCK_STATE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── get-scene-flags ──────────────────────────────────────────────────────────────

export async function handleGetSceneFlags(input: GetSceneFlagsInput): Promise<Envelope<unknown>> {
  try {
    const scene = resolveScene(input.sceneId);
    const all = scene.flags?.LockView ?? {};
    const value = input.key ? (scene.getFlag?.('LockView', input.key) ?? null) : all;
    return {
      success: true,
      data: { sceneId: scene.id, sceneName: scene.name ?? scene.id, key: input.key ?? null, flags: value },
    };
  } catch (e) {
    return { success: false, error: `GET_SCENE_FLAGS_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── lock writes (pan / zoom / boundingBox) ────────────────────────────────────────

async function applyLockUpdate(
  sceneId: string | undefined,
  patch: { pan?: boolean; zoom?: boolean; boundingBox?: boolean },
  label: string,
): Promise<Envelope<unknown>> {
  const lockView = getLockView();
  const scene = resolveScene(sceneId);
  // lockView.locks.update operates on the active scene's live locks + persists to its flags.
  await lockView.locks?.update?.(patch, { save: true });
  const verified = scene.getFlag?.('LockView', 'locks') ?? (() => { try { return lockView.locks?.get?.(); } catch { return null; } })();
  const active = isLibWrapperActive();
  notify.updated('scene', scene.name ?? scene.id, { summary: `${label}: ${JSON.stringify(patch)}` });
  return {
    success: true,
    data: {
      sceneId: scene.id,
      sceneName: scene.name ?? scene.id,
      applied: patch,
      verifiedLocks: verified,
      libWrapperActive: active,
      libWrapperWarning: libWrapperWarning(active),
    },
  };
}

export async function handleSetPanLock(input: SetPanLockInput): Promise<Envelope<unknown>> {
  try { return await applyLockUpdate(input.sceneId, { pan: input.locked }, 'set-pan-lock'); }
  catch (e) { return { success: false, error: `SET_PAN_LOCK_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetZoomLock(input: SetZoomLockInput): Promise<Envelope<unknown>> {
  try { return await applyLockUpdate(input.sceneId, { zoom: input.locked }, 'set-zoom-lock'); }
  catch (e) { return { success: false, error: `SET_ZOOM_LOCK_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetBoundingBoxLock(input: SetBoundingBoxLockInput): Promise<Envelope<unknown>> {
  try {
    if (input.drawingId && !input.mode) {
      return { success: false, error: 'SET_BOUNDING_BOX_LOCK_ERROR: mode is required when drawingId is supplied.' };
    }
    const lockView = getLockView();
    const scene = resolveScene(input.sceneId);
    await lockView.locks?.update?.({ boundingBox: input.locked }, { save: true });

    let drawingApplied: { drawingId: string; mode: string } | null = null;
    if (input.drawingId && input.mode) {
      const drawing = scene.drawings?.get?.(input.drawingId);
      if (!drawing) return { success: false, error: `SET_BOUNDING_BOX_LOCK_ERROR: drawing "${input.drawingId}" not found on scene.` };
      await drawing.setFlag('LockView', 'boundingBox', input.mode);
      drawingApplied = { drawingId: input.drawingId, mode: input.mode };
    }

    const active = isLibWrapperActive();
    notify.updated('scene', scene.name ?? scene.id, { summary: `set-bounding-box-lock: locked=${input.locked}${drawingApplied ? ` drawing=${input.mode}` : ''}` });
    return {
      success: true,
      data: {
        sceneId: scene.id,
        sceneName: scene.name ?? scene.id,
        boundingBoxLocked: input.locked,
        drawingApplied,
        verifiedLocks: scene.getFlag?.('LockView', 'locks') ?? null,
        libWrapperActive: active,
        libWrapperWarning: libWrapperWarning(active),
      },
    };
  } catch (e) {
    return { success: false, error: `SET_BOUNDING_BOX_LOCK_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── scene-config flag writes ──────────────────────────────────────────────────────

async function applySceneConfig(sceneId: string | undefined, key: string, value: unknown, label: string): Promise<Envelope<unknown>> {
  const scene = resolveScene(sceneId);
  await updateSceneFlag(scene, key, value);
  tryOnSceneUpdate(scene);
  notify.updated('scene', scene.name ?? scene.id, { summary: `${label}: ${JSON.stringify(value)}` });
  return {
    success: true,
    data: {
      sceneId: scene.id,
      sceneName: scene.name ?? scene.id,
      key,
      verified: scene.getFlag?.('LockView', key) ?? null,
    },
  };
}

export async function handleSetAutoscale(input: SetAutoscaleInput): Promise<Envelope<unknown>> {
  try { return await applySceneConfig(input.sceneId, 'autoscale', input.mode, 'set-autoscale'); }
  catch (e) { return { success: false, error: `SET_AUTOSCALE_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetForceInitialView(input: SetForceInitialViewInput): Promise<Envelope<unknown>> {
  try { return await applySceneConfig(input.sceneId, 'forceInitialView', input.enabled, 'set-force-initial-view'); }
  catch (e) { return { success: false, error: `SET_FORCE_INITIAL_VIEW_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetUiHide(input: SetUiHideInput): Promise<Envelope<unknown>> {
  try {
    const res = await applySceneConfig(input.sceneId, 'ui', input.ui, 'set-ui-hide');
    if (res.success) {
      (res.data as any).note = 'UI hide is GUIDANCE_ONLY for the DOM effect — a player refresh reveals elements. The scene flag write is server-side and authoritative.';
    }
    return res;
  } catch (e) { return { success: false, error: `SET_UI_HIDE_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetSidebarBehavior(input: SetSidebarBehaviorInput): Promise<Envelope<unknown>> {
  try {
    if (input.sceneLoad === undefined && input.exclude === undefined && input.blacken === undefined) {
      return { success: false, error: 'SET_SIDEBAR_BEHAVIOR_ERROR: Provide sceneLoad, exclude, or blacken.' };
    }
    const scene = resolveScene(input.sceneId);
    const existing = (scene.getFlag?.('LockView', 'sidebar') ?? {}) as Record<string, unknown>;
    const merged = { ...existing };
    if (input.sceneLoad !== undefined) merged.sceneLoad = input.sceneLoad;
    if (input.exclude !== undefined) merged.exclude = input.exclude;
    if (input.blacken !== undefined) merged.blacken = input.blacken;
    await updateSceneFlag(scene, 'sidebar', merged);
    tryOnSceneUpdate(scene);
    notify.updated('scene', scene.name ?? scene.id, { summary: `set-sidebar-behavior: ${JSON.stringify(merged)}` });
    return {
      success: true,
      data: { sceneId: scene.id, sceneName: scene.name ?? scene.id, verified: scene.getFlag?.('LockView', 'sidebar') ?? null },
    };
  } catch (e) { return { success: false, error: `SET_SIDEBAR_BEHAVIOR_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

// ── triggers ────────────────────────────────────────────────────────────────────

export async function handleTriggerInitialView(input: TriggerInitialViewInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const scene = input.sceneId ? resolveScene(input.sceneId) : undefined;
    await lockView.sceneHandler?.forceInitialView?.(scene);
    notify.updated('scene', scene?.name ?? 'active scene', { summary: 'trigger-initial-view' });
    return { success: true, data: { sceneId: scene?.id ?? null, triggered: 'forceInitialView' } };
  } catch (e) { return { success: false, error: `TRIGGER_INITIAL_VIEW_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleTriggerAutoscale(input: TriggerAutoscaleInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const scene = input.sceneId ? resolveScene(input.sceneId) : undefined;
    await lockView.sceneHandler?.setAutoscale?.(scene);
    notify.updated('scene', scene?.name ?? 'active scene', { summary: 'trigger-autoscale' });
    return { success: true, data: { sceneId: scene?.id ?? null, triggered: 'setAutoscale' } };
  } catch (e) { return { success: false, error: `TRIGGER_AUTOSCALE_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleBroadcastRefresh(_input: BroadcastRefreshInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    await lockView.socket?.refresh?.();
    notify.updated('scene', 'all clients', { summary: 'broadcast-refresh: LockView refresh pushed to all clients' });
    return { success: true, data: { broadcast: 'refresh', note: 'Causes a transient canvas re-layout on all clients.' } };
  } catch (e) { return { success: false, error: `BROADCAST_REFRESH_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handlePullStaticUsers(input: PullStaticUsersInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const scene = resolveScene(input.sceneId);
    await lockView.socket?.pullStaticUsers?.(scene.id);
    notify.updated('scene', scene.name ?? scene.id, { summary: 'pull-static-users' });
    return { success: true, data: { sceneId: scene.id, sceneName: scene.name ?? scene.id, pulled: 'static users' } };
  } catch (e) { return { success: false, error: `PULL_STATIC_USERS_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

// ── forced-viewport (SUPPORTED_WITH_CONFIRMATION) ─────────────────────────────────

export async function handleForceViewportAbsolute(input: ForceViewportAbsoluteInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const data: Record<string, unknown> = { type: 'absolute', userId: input.userId, position: input.position };
    if (input.width !== undefined) data.width = input.width;
    await lockView.socket?.setView?.(data);
    notify.updated('scene', `user ${input.userId}`, { summary: `force-viewport-absolute → (${input.position.x},${input.position.y})` });
    return { success: true, data: { userId: input.userId, position: input.position, width: input.width ?? null, forced: 'absolute' } };
  } catch (e) { return { success: false, error: `FORCE_VIEWPORT_ABSOLUTE_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleForceViewportRelative(input: ForceViewportRelativeInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    await lockView.socket?.setView?.({ type: 'relative', userId: input.userId, position: input.position });
    notify.updated('scene', `user ${input.userId}`, { summary: `force-viewport-relative ${JSON.stringify(input.position)}` });
    return { success: true, data: { userId: input.userId, position: input.position, forced: 'relative' } };
  } catch (e) { return { success: false, error: `FORCE_VIEWPORT_RELATIVE_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleCloneGmView(input: CloneGmViewInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const usersMap: Record<string, boolean> = {};
    for (const id of input.userIds) usersMap[id] = true;
    await lockView.apps?.cloneView?.apply?.(input.pan ?? true, input.zoom ?? true, usersMap);
    notify.updated('scene', `${input.userIds.length} user(s)`, { summary: `clone-gm-view (pan=${input.pan ?? true}, zoom=${input.zoom ?? true})` });
    return { success: true, data: { userIds: input.userIds, pan: input.pan ?? true, zoom: input.zoom ?? true, cloned: true } };
  } catch (e) { return { success: false, error: `CLONE_GM_VIEW_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetViewDialog(input: SetViewDialogInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    await lockView.socket?.setViewDialog?.(input.data, input.userIds);
    notify.updated('scene', `${input.userIds.length} user(s)`, { summary: `set-view-dialog ${JSON.stringify(input.data)}` });
    return { success: true, data: { userIds: input.userIds, data: input.data, applied: true } };
  } catch (e) { return { success: false, error: `SET_VIEW_DIALOG_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}

export async function handleSetViewWithPanMode(input: SetViewWithPanModeInput): Promise<Envelope<unknown>> {
  try {
    const lockView = getLockView();
    const data: Record<string, unknown> = {};
    if (input.pan !== undefined) data.pan = input.pan;
    if (input.zoom !== undefined) data.zoom = input.zoom;
    if (input.coordinates !== undefined) data.coordinates = input.coordinates;
    if (input.gridSpaces !== undefined) data.gridSpaces = input.gridSpaces;
    if (input.scale !== undefined) data.scale = input.scale;
    if (Object.keys(data).length === 0) {
      return { success: false, error: 'SET_VIEW_WITH_PAN_MODE_ERROR: Provide pan, zoom, coordinates, gridSpaces, or scale.' };
    }
    await lockView.socket?.setViewDialog?.(data, input.userIds);
    notify.updated('scene', `${input.userIds.length} user(s)`, { summary: `set-view-with-pan-mode ${JSON.stringify(data)}` });
    return { success: true, data: { userIds: input.userIds, data, applied: true } };
  } catch (e) { return { success: false, error: `SET_VIEW_WITH_PAN_MODE_ERROR: ${e instanceof Error ? e.message : String(e)}` }; }
}
