// Characterization snapshot — ModuleCssTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Covers: get (read), set (write), append (write), reset (write), MODULE_NOT_ACTIVE branch.

import { describe, it, expect } from 'vitest';
import { ModuleCssTool } from '../../tools/modules/custom-css/css.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new ModuleCssTool(makeToolDeps(mockReturn));

describe('ModuleCssTool — characterization', () => {
  it('get — world CSS present', async () => {
    const r = await tool({
      worldStylesheet: '.grim-page { background: #e8dcc0; }',
      worldLength: 38,
      isEmpty: false,
    }).execute({ action: 'get' });
    expect((r as any).content[0].text).toMatchSnapshot();
    // structuredContent is also returned
    expect((r as any).structuredContent).toBeDefined();
  });

  it('get — world CSS empty (sentinel)', async () => {
    const r = await tool({
      worldStylesheet: '',
      worldLength: 0,
      isEmpty: true,
    }).execute({ action: 'get' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — with user stylesheet', async () => {
    const r = await tool({
      worldStylesheet: '.dark { color: #fff; }',
      worldLength: 22,
      isEmpty: false,
      userStylesheet: '.editor { font-size: 14px; }',
      userLength: 28,
      userScopeCaveat: 'userStylesheet is client-scoped (LocalStorage) — GM browser only.',
    }).execute({ action: 'get', includeUserStylesheet: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('set — world CSS written', async () => {
    const r = await tool({
      worldStylesheet: '.grim-page { background: #e8dcc0; }',
      worldLength: 38,
      broadcast: true,
    }).execute({ action: 'set', css: '.grim-page { background: #e8dcc0; }' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('append — CSS appended', async () => {
    const r = await tool({
      worldStylesheet: '.grim-page { background: #e8dcc0; }\n\n/* night */ .dark {}',
      worldLength: 60,
      appendedLength: 20,
      broadcast: true,
    }).execute({ action: 'append', css: '/* night */ .dark {}' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('reset — world CSS cleared', async () => {
    const r = await tool({
      worldStylesheet: '',
      worldLength: 0,
      broadcast: true,
      reset: true,
    }).execute({ action: 'reset' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('MODULE_NOT_ACTIVE — probe inactive branch', async () => {
    const r = await new ModuleCssTool(
      makeToolDeps(null, 'MODULE_NOT_ACTIVE: custom-css is not active'),
    ).execute({ action: 'get' });
    expect((r as any).content[0].text).toMatchSnapshot();
    expect((r as any).isError).toBe(true);
  });
});
