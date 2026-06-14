// Characterization snapshot — UserTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: list, get, update, set-role, hotbar-list, hotbar-assign, hotbar-clear, flag-set, flag-clear

import { describe, it, expect } from 'vitest';
import { UserTool } from '../../tools/user.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new UserTool(makeToolDeps(mockReturn));

const USER_VIEW = {
  id: 'user001',
  name: 'GrimmFM',
  role: 4,
  isGM: true,
  isBanned: false,
  active: true,
  viewedSceneId: 'scene001',
  color: '#ff0000',
  avatar: 'icons/avatar.webp',
  pronouns: 'he/him',
  characterId: 'actor001',
  hotbarSlotsUsed: 3,
  permissions: {},
  flags: { 'warhammer-mcp': { tutorialSeen: true } },
};

describe('UserTool — characterization', () => {
  it('list — user listing', async () => {
    const r = await tool({
      total: 2,
      limit: 50,
      offset: 0,
      items: [
        { id: 'user001', name: 'GrimmFM', role: 4, active: true, color: '#ff0000', characterId: 'actor001', hotbarSlotsUsed: 3, viewedSceneId: 'scene001' },
        { id: 'user002', name: 'Brunhilde', role: 1, active: false, color: '#00ff00', characterId: null, hotbarSlotsUsed: 0, viewedSceneId: null },
      ],
    }).execute({ action: 'list' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — user with hotbar', async () => {
    const r = await tool({
      user: USER_VIEW,
      hotbar: { '1': 'macro001', '5': 'macro002' },
    }).execute({ action: 'get', userId: 'user001', includeHotbar: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — color changed', async () => {
    const r = await tool({
      changedFields: ['color'],
      user: { ...USER_VIEW, color: '#0000ff' },
    }).execute({ action: 'update', userId: 'user001', color: '#0000ff' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-role — promoted to trusted', async () => {
    const r = await tool({
      userId: 'user002',
      previousRole: 'PLAYER',
      role: 'TRUSTED',
      reloadRequired: true,
      user: { ...USER_VIEW, id: 'user002', name: 'Brunhilde', role: 2, isGM: false },
    }).execute({ action: 'set-role', userId: 'user002', role: 'TRUSTED' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('hotbar-list — occupied slots', async () => {
    const r = await tool({
      userId: 'user001',
      occupiedSlotCount: 2,
      orphanSlots: [],
      slots: [
        { slot: 1, macroId: 'macro001', macroName: 'Roll Initiative', isOrphan: false },
        { slot: 5, macroId: 'macro002', macroName: null, isOrphan: false },
      ],
    }).execute({ action: 'hotbar-list', userId: 'user001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('hotbar-list — empty hotbar', async () => {
    const r = await tool({
      userId: 'user002',
      occupiedSlotCount: 0,
      orphanSlots: [],
      slots: [],
    }).execute({ action: 'hotbar-list', userId: 'user002' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('hotbar-assign — slot filled', async () => {
    const r = await tool({
      userId: 'user001',
      slot: 3,
      macroId: 'macro003',
      macroName: 'Apply Bleed',
      assigned: true,
      overwrote: false,
      previousMacroId: null,
    }).execute({ action: 'hotbar-assign', userId: 'user001', slot: 3, macroId: 'macro003' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('hotbar-clear — slot cleared', async () => {
    const r = await tool({
      userId: 'user001',
      slot: 3,
      cleared: true,
      alreadyEmpty: false,
      previousMacroId: 'macro003',
    }).execute({ action: 'hotbar-clear', userId: 'user001', slot: 3 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('flag-set — boolean flag', async () => {
    const r = await tool({
      userId: 'user001',
      scope: 'warhammer-mcp',
      key: 'tutorialSeen',
      value: true,
    }).execute({ action: 'flag-set', userId: 'user001', scope: 'warhammer-mcp', key: 'tutorialSeen', value: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('flag-clear — flag cleared', async () => {
    const r = await tool({
      userId: 'user001',
      scope: 'warhammer-mcp',
      key: 'tutorialSeen',
      cleared: true,
    }).execute({ action: 'flag-clear', userId: 'user001', scope: 'warhammer-mcp', key: 'tutorialSeen' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
