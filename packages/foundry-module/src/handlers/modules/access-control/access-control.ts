// Module Integration v1 Phase 7 — module-access-control handler dispatcher.
//
// Central dispatcher for the access-control bundle umbrella (LocknKey + LockView).
// Routes 27 actions across two conditional members.
//
// Guard design (HC1/CCR-1):
//   - get-bundle-status: ALWAYS succeeds (no guard). Reports active state of both members.
//   - get-lock-state: SHARED action — routes to LocknKey when documentId is present,
//     else to LockView. The guard checks the resolved member.
//   - All other actions: guarded via ACTION_MEMBER_MAP (action → member-id).
//     requireModuleActive(member) returns a failure envelope; never throws.
//
// libWrapper (DEPENDENCY_GATED, user decision 2026-06-13): NOT hard-guarded. LockView
// lock-write handlers write the scene flag and surface a libWrapperActive warning in the
// response rather than blocking — the flag persists and enforces once lib-wrapper is on.
//
// Member IDs are capitalized ('LocknKey' / 'LockView') to match game.modules.get(id).
//
// Anchors:
//   - dossiers/access-control.md (capability-complete design)
//   - scene-atmosphere.ts (bundle dispatcher precedent)
//   - phase7_pre_plan.md §Confirmed facts

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleAccessControlInput, BUNDLE_MEMBERS } from './schemas.js';
import {
  handleGetLockStateLnK,
  handleConfigureLock,
  handleConfigureLpAttempts,
  handleCreateKey,
  handleAssignKey,
  handleSetPasskey,
  handleSetCustomPopup,
  handleGrantFreeCircumvent,
  handleCircumventLock,
  handleTransferItems,
} from './locknkey.js';
import {
  handleGetLockStateLockView,
  handleGetSceneFlags,
  handleSetPanLock,
  handleSetZoomLock,
  handleSetBoundingBoxLock,
  handleSetAutoscale,
  handleSetForceInitialView,
  handleSetUiHide,
  handleSetSidebarBehavior,
  handleTriggerInitialView,
  handleTriggerAutoscale,
  handleBroadcastRefresh,
  handlePullStaticUsers,
  handleForceViewportAbsolute,
  handleForceViewportRelative,
  handleCloneGmView,
  handleSetViewDialog,
  handleSetViewWithPanMode,
} from './lockview.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

// ── ACTION_MEMBER_MAP ─────────────────────────────────────────────────────────
// Maps action → primary member module ID for the guard block.
// get-bundle-status and get-lock-state are excluded (handled specially above the map).
export const ACTION_MEMBER_MAP: Record<string, string> = {
  // LocknKey actions
  'configure-lock':        'LocknKey',
  'configure-lp-attempts': 'LocknKey',
  'create-key':            'LocknKey',
  'assign-key':            'LocknKey',
  'set-passkey':           'LocknKey',
  'set-custom-popup':      'LocknKey',
  'grant-free-circumvent': 'LocknKey',
  'circumvent-lock':       'LocknKey',
  'transfer-items':        'LocknKey',

  // LockView actions
  'get-scene-flags':           'LockView',
  'set-pan-lock':              'LockView',
  'set-zoom-lock':             'LockView',
  'set-bounding-box-lock':     'LockView',
  'set-autoscale':             'LockView',
  'set-force-initial-view':    'LockView',
  'set-ui-hide':               'LockView',
  'set-sidebar-behavior':      'LockView',
  'trigger-initial-view':      'LockView',
  'trigger-autoscale':         'LockView',
  'broadcast-refresh':         'LockView',
  'pull-static-users':         'LockView',
  'force-viewport-absolute':   'LockView',
  'force-viewport-relative':   'LockView',
  'clone-gm-view':             'LockView',
  'set-view-dialog':           'LockView',
  'set-view-with-pan-mode':    'LockView',
};

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleAccessControl(data: unknown): Promise<any> {
  const parsed = ModuleAccessControlInput.parse(data);
  const action = parsed.action;

  // ── Guard block ─────────────────────────────────────────────────────────────
  if (action === 'get-bundle-status') {
    // unguarded
  } else if (action === 'get-lock-state') {
    // Shared action: documentId present → LocknKey; absent → LockView.
    const member = parsed.documentId ? 'LocknKey' : 'LockView';
    const g = requireModuleActive(member);
    if (g) return g;
  } else {
    const member = ACTION_MEMBER_MAP[action];
    if (member) {
      const g = requireModuleActive(member);
      if (g) return g;
    }
  }

  // ── Action dispatch ───────────────────────────────────────────────────────
  switch (parsed.action) {
    case 'get-bundle-status':
      return handleGetBundleStatus();

    // ── Shared: get-lock-state (route by input shape) ─────────────────────
    case 'get-lock-state':
      return parsed.documentId ? handleGetLockStateLnK(parsed) : handleGetLockStateLockView(parsed);

    // ── LocknKey ──────────────────────────────────────────────────────────
    case 'configure-lock':        return handleConfigureLock(parsed);
    case 'configure-lp-attempts': return handleConfigureLpAttempts(parsed);
    case 'create-key':            return handleCreateKey(parsed);
    case 'assign-key':            return handleAssignKey(parsed);
    case 'set-passkey':           return handleSetPasskey(parsed);
    case 'set-custom-popup':      return handleSetCustomPopup(parsed);
    case 'grant-free-circumvent': return handleGrantFreeCircumvent(parsed);
    case 'circumvent-lock':       return handleCircumventLock(parsed);
    case 'transfer-items':        return handleTransferItems(parsed);

    // ── LockView ──────────────────────────────────────────────────────────
    case 'get-scene-flags':            return handleGetSceneFlags(parsed);
    case 'set-pan-lock':               return handleSetPanLock(parsed);
    case 'set-zoom-lock':              return handleSetZoomLock(parsed);
    case 'set-bounding-box-lock':      return handleSetBoundingBoxLock(parsed);
    case 'set-autoscale':              return handleSetAutoscale(parsed);
    case 'set-force-initial-view':     return handleSetForceInitialView(parsed);
    case 'set-ui-hide':                return handleSetUiHide(parsed);
    case 'set-sidebar-behavior':       return handleSetSidebarBehavior(parsed);
    case 'trigger-initial-view':       return handleTriggerInitialView(parsed);
    case 'trigger-autoscale':          return handleTriggerAutoscale(parsed);
    case 'broadcast-refresh':          return handleBroadcastRefresh(parsed);
    case 'pull-static-users':          return handlePullStaticUsers(parsed);
    case 'force-viewport-absolute':    return handleForceViewportAbsolute(parsed);
    case 'force-viewport-relative':    return handleForceViewportRelative(parsed);
    case 'clone-gm-view':              return handleCloneGmView(parsed);
    case 'set-view-dialog':            return handleSetViewDialog(parsed);
    case 'set-view-with-pan-mode':     return handleSetViewWithPanMode(parsed);

    default: {
      // Exhaustiveness guard — `const _exhaustive: never` (NOT `as never`) per Phase-1 lesson.
      const _exhaustive: never = parsed;
      return {
        success: false,
        error: `UNKNOWN_ACTION: module-access-control action "${(_exhaustive as any).action}" is not implemented.`,
      };
    }
  }
}

// ── get-bundle-status ─────────────────────────────────────────────────────────
// Unguarded. Reports active state for both members via game.modules.get(id).

async function handleGetBundleStatus(): Promise<Envelope<unknown>> {
  const game = (globalThis as any).game;
  const members = BUNDLE_MEMBERS.map((id) => {
    const mod = game?.modules?.get?.(id);
    return { id, active: Boolean(mod?.active), title: mod?.title ?? null, version: mod?.version ?? null };
  });
  const libWrapper = game?.modules?.get?.('lib-wrapper');
  return {
    success: true,
    data: {
      members,
      libWrapper: { id: 'lib-wrapper', active: Boolean(libWrapper?.active), version: libWrapper?.version ?? null },
      note: 'LockView lock ENFORCEMENT requires lib-wrapper active (DEPENDENCY_GATED). Flag writes persist regardless.',
    },
  };
}
