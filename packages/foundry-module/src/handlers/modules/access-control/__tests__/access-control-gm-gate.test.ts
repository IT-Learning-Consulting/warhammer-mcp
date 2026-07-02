// BUG-424 (MOD-02) regression guard — module-access-control GM gate.
//
// access-control was the ONLY module handler dir with no GM gate on its write actions.
// This test iterates the exported WRITE_ACTIONS set (never a hardcoded action list) so a
// newly-added action cannot silently ship ungated: the payload map below must cover the
// set exactly, or the drift-guard case fails.
//
// Ordering contract: the GM gate fires BEFORE requireModuleActive — a non-GM caller gets
// GM_REQUIRED even when LocknKey/LockView are absent; a GM caller falls through to the
// module guard (MODULE_NOT_ACTIVE in this unmocked test env), proving the gate does not
// block the GM path.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dispatchModuleAccessControl, WRITE_ACTIONS } from '../access-control.js';

/** Minimal schema-valid payload per write action (satisfies each .strict() Zod variant). */
const MINIMAL_WRITE_INPUTS: Record<string, Record<string, unknown>> = {
  // LocknKey writes
  'configure-lock':        { action: 'configure-lock', documentId: 'd1', documentType: 'wall' },
  'configure-lp-attempts': { action: 'configure-lp-attempts', documentId: 'd1', documentType: 'wall' },
  'create-key':            { action: 'create-key', keyName: 'Test Key' },
  'assign-key':            { action: 'assign-key', lockDocumentId: 'd1', lockDocumentType: 'wall' },
  'set-passkey':           { action: 'set-passkey', documentId: 'd1', documentType: 'wall', passkey: 'p' },
  'set-custom-popup':      { action: 'set-custom-popup', documentId: 'd1', documentType: 'wall', popups: { '0': 'msg' } },
  'grant-free-circumvent': { action: 'grant-free-circumvent', tokenId: 't1' },
  'circumvent-lock':       { action: 'circumvent-lock', documentId: 'd1', documentType: 'wall', method: 'pick', outcome: 'success', confirm: true },
  'transfer-items':        { action: 'transfer-items', sourceId: 's1', targetId: 't1', itemInfos: [{ id: 'i1' }], confirm: true },
  // LockView writes
  'set-pan-lock':            { action: 'set-pan-lock', locked: true },
  'set-zoom-lock':           { action: 'set-zoom-lock', locked: true },
  'set-bounding-box-lock':   { action: 'set-bounding-box-lock', locked: true },
  'set-autoscale':           { action: 'set-autoscale', mode: 'off' },
  'set-force-initial-view':  { action: 'set-force-initial-view', enabled: true },
  'set-ui-hide':             { action: 'set-ui-hide', ui: { sidebar: true } },
  'set-sidebar-behavior':    { action: 'set-sidebar-behavior' },
  'trigger-initial-view':    { action: 'trigger-initial-view' },
  'trigger-autoscale':       { action: 'trigger-autoscale' },
  'broadcast-refresh':       { action: 'broadcast-refresh' },
  'pull-static-users':       { action: 'pull-static-users' },
  'force-viewport-absolute': { action: 'force-viewport-absolute', userId: 'u1', position: { x: 0, y: 0 }, confirm: true },
  'force-viewport-relative': { action: 'force-viewport-relative', userId: 'u1', position: {}, confirm: true },
  'clone-gm-view':           { action: 'clone-gm-view', userIds: ['u1'], confirm: true },
  'set-view-dialog':         { action: 'set-view-dialog', data: {}, userIds: ['u1'], confirm: true },
  'set-view-with-pan-mode':  { action: 'set-view-with-pan-mode', userIds: ['u1'], confirm: true },
};

function setGM(isGM: boolean): void {
  (globalThis as any).game = { user: { isGM } };
}

const savedGame = (globalThis as any).game;

describe('module-access-control — GM gate (BUG-424 / MOD-02)', () => {
  beforeEach(() => setGM(false));
  afterEach(() => { (globalThis as any).game = savedGame; });

  it('drift-guard: payload map covers WRITE_ACTIONS exactly', () => {
    expect(Object.keys(MINIMAL_WRITE_INPUTS).sort()).toEqual([...WRITE_ACTIONS].sort());
  });

  it('WRITE_ACTIONS excludes exactly the 3 read actions', () => {
    for (const read of ['get-bundle-status', 'get-lock-state', 'get-scene-flags']) {
      expect(WRITE_ACTIONS.has(read)).toBe(false);
    }
  });

  for (const action of [...WRITE_ACTIONS].sort()) {
    it(`${action} → GM_REQUIRED when caller is not GM`, async () => {
      const input = MINIMAL_WRITE_INPUTS[action];
      expect(input, `missing minimal payload for write action "${action}" — add it to MINIMAL_WRITE_INPUTS`).toBeDefined();
      const r = await dispatchModuleAccessControl(input);
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/^GM_REQUIRED/);
    });
  }

  it('read actions are NOT GM-gated (non-GM falls through to normal handling)', async () => {
    const bundle = await dispatchModuleAccessControl({ action: 'get-bundle-status' });
    expect(bundle.success).toBe(true);

    const lockState = await dispatchModuleAccessControl({ action: 'get-lock-state', documentId: 'd1' });
    expect(String(lockState.error ?? '')).not.toMatch(/GM_REQUIRED/);

    const sceneFlags = await dispatchModuleAccessControl({ action: 'get-scene-flags' });
    expect(String(sceneFlags.error ?? '')).not.toMatch(/GM_REQUIRED/);
  });

  it('gate ordering: GM caller passes the gate and reaches the module guard', async () => {
    setGM(true);
    const r = await dispatchModuleAccessControl(MINIMAL_WRITE_INPUTS['set-pan-lock']);
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/MODULE_NOT_ACTIVE/); // gate passed; module absent in test env
  });
});
