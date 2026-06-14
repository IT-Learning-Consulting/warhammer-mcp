// Characterization snapshot — ModuleAccessControlTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get-bundle-status (formatted), get-lock-state (LocknKey), configure-lock (write),
// get-scene-flags (LockView), set-pan-lock (write), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleAccessControlTool } from '../../tools/modules/access-control/access-control.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) =>
  new ModuleAccessControlTool(makeToolDeps(mockReturn));

describe('ModuleAccessControlTool — characterization', () => {
  it('get-bundle-status — formatted member list', async () => {
    const r = await tool({
      members: [
        { id: 'LocknKey', active: true, title: 'LnK', version: '1.4.0' },
        { id: 'LockView', active: false, title: null, version: null },
      ],
      libWrapper: { active: true },
    }).execute({ action: 'get-bundle-status' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-lock-state (LocknKey — documentId present)', async () => {
    const r = await tool({
      isLockable: true,
      locked: true,
      pickDC: 30,
      breakDC: -1,
      jammed: false,
      lockOnClose: true,
    }).execute({ action: 'get-lock-state', documentId: 'Wall.abc123', documentType: 'wall' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('configure-lock — write result', async () => {
    const r = await tool({
      documentId: 'Wall.abc123',
      documentType: 'wall',
      locked: true,
      jammed: false,
      pickDC: 30,
    }).execute({ action: 'configure-lock', documentId: 'Wall.abc123', documentType: 'wall', locked: true, pickDC: 30 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-scene-flags — LockView scene flags', async () => {
    const r = await tool({
      panLocked: false,
      zoomLocked: true,
      boundingBoxLocked: false,
      autoscale: 'horizontal',
      forceInitialView: true,
    }).execute({ action: 'get-scene-flags' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-pan-lock — write result', async () => {
    const r = await tool({
      panLocked: true,
      sceneId: 'Scene.xyz',
    }).execute({ action: 'set-pan-lock', locked: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await tool(null).execute
      ? await new ModuleAccessControlTool(
          makeToolDeps(null, 'MODULE_NOT_ACTIVE: LocknKey is not active'),
        ).execute({ action: 'get-bundle-status' })
      : null;
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
