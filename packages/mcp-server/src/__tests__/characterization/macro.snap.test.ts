// Characterization snapshot — MacroTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: create, update, delete, get, list, execute, execute-by-name,
//         import-from-compendium, set-execution-target, list-world-scripts,
//         get-execution-target

import { describe, it, expect } from 'vitest';
import { MacroTool } from '../../tools/macro.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new MacroTool(makeToolDeps(mockReturn));

const MACRO_VIEW = {
  id: 'mac001',
  name: 'Roll Initiative',
  type: 'chat',
  scope: 'global',
  command: '/roll 1d10',
  img: null,
  folder: null,
  author: 'user001',
  ownership: { default: 0, user001: 3 },
  flags: {},
};

describe('MacroTool — characterization', () => {
  it('create — chat macro', async () => {
    const r = await tool({
      macroId: 'mac001',
      macro: MACRO_VIEW,
      requestedChanges: { name: 'Roll Initiative', type: 'chat', command: '/roll 1d10', action: 'create' },
    }).execute({ action: 'create', name: 'Roll Initiative', type: 'chat', command: '/roll 1d10' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — rename', async () => {
    const r = await tool({
      macroId: 'mac001',
      macro: { ...MACRO_VIEW, name: 'Roll Initiative v2' },
      requestedChanges: { name: 'Roll Initiative v2' },
      changedFields: ['name'],
    }).execute({ action: 'update', macroId: 'mac001', changes: { name: 'Roll Initiative v2' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — no orphan refs', async () => {
    const r = await tool({
      deletedId: 'mac001',
      remainingCount: 5,
      hotbarRefs: [],
      regionBehaviorRefs: [],
    }).execute({ action: 'delete', macroId: 'mac001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — with hotbar orphans', async () => {
    const r = await tool({
      deletedId: 'mac001',
      remainingCount: 4,
      hotbarRefs: [{ userId: 'user002', userName: 'Brunhilde', slots: [3, 7] }],
      regionBehaviorRefs: [],
    }).execute({ action: 'delete', macroId: 'mac001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — fetch by id', async () => {
    const r = await tool({
      macro: MACRO_VIEW,
    }).execute({ action: 'get', macroId: 'mac001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated', async () => {
    const r = await tool({
      total: 10,
      page: 1,
      pageSize: 20,
      pageCount: 1,
      items: [
        { id: 'mac001', name: 'Roll Initiative', type: 'chat', scope: 'global', folder: null, commandPreview: '/roll 1d10' },
        { id: 'mac002', name: 'Apply Bleed', type: 'script', scope: 'actor', folder: null, commandPreview: null },
      ],
    }).execute({ action: 'list', page: 1, pageSize: 20 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — count only', async () => {
    const r = await tool({
      total: 12,
      filterApplied: 'initiative',
    }).execute({ action: 'list', countOnly: true, filter: 'initiative' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('execute — chat macro result', async () => {
    const r = await tool({
      macroId: 'mac001',
      macroType: 'chat',
      chatMessageId: 'msg001',
      scriptReturnValue: null,
      threw: false,
      thrownError: null,
      warnings: [],
      elapsedMs: 12,
      executedAt: '2026-06-13T10:00:00.000Z',
    }).execute({ action: 'execute', macroId: 'mac001', confirmedExecution: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('execute — script macro with return value', async () => {
    const r = await tool({
      macroId: 'mac002',
      macroType: 'script',
      chatMessageId: null,
      scriptReturnValue: { success: true },
      threw: false,
      thrownError: null,
      warnings: ['deprecated API used'],
      elapsedMs: 45,
      executedAt: '2026-06-13T10:00:01.000Z',
    }).execute({ action: 'execute', macroId: 'mac002', confirmedExecution: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('execute-by-name — success', async () => {
    const r = await tool({
      macroId: 'mac001',
      macroType: 'chat',
      chatMessageId: 'msg002',
      scriptReturnValue: null,
      threw: false,
      thrownError: null,
      warnings: [],
      elapsedMs: 8,
      executedAt: '2026-06-13T10:00:02.000Z',
    }).execute({ action: 'execute-by-name', name: 'Roll Initiative', confirmedExecution: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('import-from-compendium — macro imported', async () => {
    const r = await tool({
      macroId: 'mac010',
      macro: { ...MACRO_VIEW, id: 'mac010', name: 'Core Macro' },
      sourcePack: 'wfrp4e-core.macros',
    }).execute({ action: 'import-from-compendium', packId: 'wfrp4e-core.macros', documentId: 'srcmac001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set-execution-target — GM target with warning', async () => {
    const r = await tool({
      macroId: 'mac001',
      name: 'Roll Initiative',
      target: 'GM',
      canRunAsGM: false,
      warning: 'canRunAsGM is false — flag NOT written',
      reason: 'Author mismatch',
      note: null,
    }).execute({ action: 'set-execution-target', macroId: 'mac001', target: 'GM', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-world-scripts — scripts found', async () => {
    const r = await tool({
      items: [
        { id: 'mac003', name: 'Setup Script', hook: 'setup', command: 'game.settings.set(...)' },
        { id: 'mac004', name: 'Ready Script', hook: 'ready', command: null },
      ],
    }).execute({ action: 'list-world-scripts', hook: 'all' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-execution-target — target read', async () => {
    const r = await tool({
      macroId: 'mac001',
      name: 'Roll Initiative',
      target: 'runForEveryone',
      canRunAsGM: true,
    }).execute({ action: 'get-execution-target', macroId: 'mac001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
