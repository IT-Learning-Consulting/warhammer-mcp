// Module Integration v1 Phase 12 — Unit test for the advanced-macros execution-routing actions
// folded into the macro umbrella (set-execution-target / list-world-scripts / get-execution-target).
//
// Deterministic: mocks globalThis.game.modules + game.user + game.macros (Map-backed with
// getFlag/setFlag/unsetFlag/canRunAsGM) + transaction-manager.wrappedWrite (run-fn passthrough) +
// notify. Branches:
//   - module inactive                       → MODULE_NOT_ACTIVE (HC1 — only the NEW actions guard)
//   - non-GM                                → MACRO_ACCESS_DENIED
//   - get-execution-target                  → {target, canRunAsGM}
//   - set-execution-target round-trip       → setFlag + read-back
//   - set-execution-target "" clear         → unsetFlag
//   - set "GM" without confirm              → MACRO_EXECUTION_TARGET_NOT_CONFIRMED
//   - set "GM" canRunAsGM=false             → canRunAsGM_false warning, NO write (no silent dead flag)
//   - set "GM" canRunAsGM=true + confirm    → writes
//   - list-world-scripts hook filter        → setup/ready partition

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../notify.js', () => ({
  notify: { created: vi.fn(), updated: vi.fn(), deleted: vi.fn(), warn: vi.fn() },
}));
vi.mock('../transaction-manager.js', () => ({
  wrappedWrite: (_op: string, fn: () => Promise<unknown>) => fn(),
}));

import { setExecutionTarget, listWorldScripts, getExecutionTarget } from '../handlers/macro.js';

const ADV = 'advanced-macros';
const KEY = 'runForSpecificUser';

function makeMacro(id: string, opts: { name?: string; command?: string; flag?: string; canRunAsGM?: boolean } = {}) {
  const flags: any = opts.flag ? { [ADV]: { [KEY]: opts.flag } } : {};
  return {
    id,
    _source: { name: opts.name ?? id, command: opts.command ?? '' },
    canRunAsGM: opts.canRunAsGM ?? false,
    getFlag: (s: string, k: string) => flags?.[s]?.[k],
    setFlag: vi.fn(async (s: string, k: string, v: unknown) => {
      flags[s] ??= {};
      flags[s][k] = v;
    }),
    unsetFlag: vi.fn(async (s: string, k: string) => {
      if (flags[s]) delete flags[s][k];
    }),
  };
}

function setGame(opts: { active?: boolean; isGM?: boolean; macros?: any[] }) {
  const list = opts.macros ?? [];
  (globalThis as any).game = {
    modules: { get: (id: string) => (id === ADV ? { active: opts.active !== false } : { active: true }) },
    user: { isGM: opts.isGM !== false },
    macros: {
      get: (id: string) => list.find((m) => m.id === id),
      contents: list,
    },
  };
}

describe('macro advanced-macros execution-routing actions', () => {
  beforeEach(() => {
    (globalThis as any).game = undefined;
  });

  it('returns MODULE_NOT_ACTIVE when advanced-macros is inactive', async () => {
    setGame({ active: false, macros: [makeMacro('m1')] });
    const r = await setExecutionTarget({ action: 'set-execution-target', macroId: 'm1', target: 'runForEveryoneElse' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/^MODULE_NOT_ACTIVE:/);
  });

  it('returns MACRO_ACCESS_DENIED for a non-GM', async () => {
    setGame({ active: true, isGM: false, macros: [makeMacro('m1')] });
    const r = await getExecutionTarget({ action: 'get-execution-target', macroId: 'm1' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/MACRO_ACCESS_DENIED/);
  });

  it('get-execution-target returns the flag value + canRunAsGM', async () => {
    setGame({ active: true, macros: [makeMacro('m1', { flag: 'runAsWorldScript', canRunAsGM: true })] });
    const r = await getExecutionTarget({ action: 'get-execution-target', macroId: 'm1' } as any);
    expect(r.success).toBe(true);
    expect((r as any).data.target).toBe('runAsWorldScript');
    expect((r as any).data.canRunAsGM).toBe(true);
  });

  it('set-execution-target writes the flag and reads it back', async () => {
    const macro = makeMacro('m1');
    setGame({ active: true, macros: [macro] });
    const r = await setExecutionTarget({ action: 'set-execution-target', macroId: 'm1', target: 'runForEveryoneElse' } as any);
    expect(r.success).toBe(true);
    expect(macro.setFlag).toHaveBeenCalledWith(ADV, KEY, 'runForEveryoneElse');
    expect((r as any).data.target).toBe('runForEveryoneElse');
  });

  it('set-execution-target "" clears the flag via unsetFlag', async () => {
    const macro = makeMacro('m1', { flag: 'runAsWorldScript' });
    setGame({ active: true, macros: [macro] });
    const r = await setExecutionTarget({ action: 'set-execution-target', macroId: 'm1', target: '' } as any);
    expect(r.success).toBe(true);
    expect(macro.unsetFlag).toHaveBeenCalledWith(ADV, KEY);
    expect((r as any).data.target).toBe('');
  });

  it('set-execution-target "GM" without confirm is rejected', async () => {
    setGame({ active: true, macros: [makeMacro('m1', { canRunAsGM: true })] });
    const r = await setExecutionTarget({ action: 'set-execution-target', macroId: 'm1', target: 'GM' } as any);
    expect(r.success).toBe(false);
    expect((r as any).error).toMatch(/MACRO_EXECUTION_TARGET_NOT_CONFIRMED/);
  });

  it('set-execution-target "GM" with canRunAsGM=false warns and does NOT write the flag', async () => {
    const macro = makeMacro('m1', { canRunAsGM: false });
    setGame({ active: true, macros: [macro] });
    const r = await setExecutionTarget({ action: 'set-execution-target', macroId: 'm1', target: 'GM', confirm: true } as any);
    expect(r.success).toBe(true);
    expect((r as any).data.warning).toBe('canRunAsGM_false');
    expect(macro.setFlag).not.toHaveBeenCalled(); // no silent dead flag
  });

  it('set-execution-target "GM" with canRunAsGM=true + confirm writes the flag', async () => {
    const macro = makeMacro('m1', { canRunAsGM: true });
    setGame({ active: true, macros: [macro] });
    const r = await setExecutionTarget({ action: 'set-execution-target', macroId: 'm1', target: 'GM', confirm: true } as any);
    expect(r.success).toBe(true);
    expect(macro.setFlag).toHaveBeenCalledWith(ADV, KEY, 'GM');
    expect((r as any).data.canRunAsGM).toBe(true);
  });

  it('list-world-scripts partitions by hook (ready vs setup)', async () => {
    const macros = [
      makeMacro('a', { flag: 'runAsWorldScript' }),
      makeMacro('b', { flag: 'runAsWorldScriptSetup' }),
      makeMacro('c', { flag: undefined }),
    ];
    setGame({ active: true, macros });
    const all = await listWorldScripts({ action: 'list-world-scripts', hook: 'all' } as any);
    expect((all as any).data.items).toHaveLength(2);
    const setup = await listWorldScripts({ action: 'list-world-scripts', hook: 'setup' } as any);
    expect((setup as any).data.items).toHaveLength(1);
    expect((setup as any).data.items[0].hook).toBe('setup');
  });
});
