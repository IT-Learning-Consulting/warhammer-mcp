// Characterization snapshot — DiagnosticTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// DiagnosticTool.execute() dispatches to 11 handlers, each returning
// { content:[{type:"text",text}] }. One snapshot per main action.

import { describe, it, expect } from 'vitest';
import { DiagnosticTool } from '../../tools/diagnostic.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new DiagnosticTool(makeToolDeps(mockReturn));

describe('DiagnosticTool — characterization', () => {
  it('recent-errors — empty buffer', async () => {
    const r = await tool({
      events: [],
      bufferSize: 0,
      bufferFull: false,
    }).execute({ action: 'recent-errors' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('recent-errors — events present', async () => {
    const r = await tool({
      events: [
        {
          ts: 1718000000000,
          severity: 'error',
          source: 'window',
          message: 'Cannot read property of undefined',
          location: 'wfrp4e.js:1234',
          phase: 'runtime',
        },
        {
          ts: 1718000001000,
          severity: 'warn',
          source: 'console.warn',
          message: 'Deprecated API usage',
          location: null,
          phase: 'init',
        },
      ],
      bufferSize: 2,
      bufferFull: false,
    }).execute({ action: 'recent-errors', severity: 'error', limit: 20 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('world-issues — mixed bucket counts', async () => {
    const r = await tool({
      counts: { packageCompatibility: 1, usability: 0, validation: 2 },
      packageCompatibilityIssues: {
        'outdated-module': { label: 'Module is outdated', type: 'compat' },
      },
      usabilityIssues: {},
      validationFailures: {
        'missing-field-a': { label: 'Missing required field A' },
        'schema-drift-b': { label: 'Schema drift on field B' },
      },
    }).execute({ action: 'world-issues' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('support-snapshot — version summary with modules', async () => {
    const r = await tool({
      coreVersion: '13.341',
      systemId: 'wfrp4e',
      systemVersion: '6.6.2',
      worldTitle: 'Adventures in the Warhammer World',
      worldId: 'adventures-in-the-warhammer-world',
      activeModuleCount: 2,
      modules: [
        { id: 'warhammer-mcp', version: '1.0.0', title: 'Warhammer MCP' },
        { id: 'wfrp4e-core', version: '3.0.0', title: 'WFRP4e Core' },
      ],
    }).execute({ action: 'support-snapshot' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('validate-wfrp-config — OK', async () => {
    const r = await tool({ ok: true, failures: [] }).execute({ action: 'validate-wfrp-config' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('validate-wfrp-config — failures', async () => {
    const r = await tool({
      ok: false,
      failures: [
        { key: 'xpCost', expected: 'array length>=10', actual: 'length=5' },
        { key: 'species', expected: 'non-empty record', actual: 'empty object' },
      ],
    }).execute({ action: 'validate-wfrp-config' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('scan-broken-uuids — actor scope with details', async () => {
    const r = await tool({
      checked: 3,
      broken: 1,
      uuidsBroken: 2,
      elapsedMs: 42,
      details: [
        { docName: 'Hans Gruber', docId: 'actor-001', embeddedItemId: null, field: 'system.description.value', uuid: 'Actor.missing123' },
        { docName: 'Hans Gruber', docId: 'actor-001', embeddedItemId: 'item-abc', field: 'system.description.value', uuid: 'Item.missingXYZ' },
      ],
    }).execute({ action: 'scan-broken-uuids', scope: { type: 'actor', id: 'actor-001' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('scan-career-refs — world counts-only mode', async () => {
    const r = await tool({
      checked: 10,
      unresolved: 3,
      elapsedMs: 120,
    }).execute({ action: 'scan-career-refs', scope: { type: 'world' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('validate-ae-scripts — item scope with mixed issues', async () => {
    const r = await tool({
      checked: 5,
      invalid: 2,
      schemaDrift: 1,
      elapsedMs: 15,
      details: [
        { docName: 'Fire Sword', aeName: 'Burning Effect', issue: 'syntax-error', trigger: 'applyDamage', error: "SyntaxError: Unexpected token ')'" },
        { docName: 'Ice Blade', aeName: 'Chill Aura', issue: 'unknown-trigger', trigger: 'onMysticalTrigger' },
        { docName: 'Old Wand', aeName: 'Legacy Script', issue: 'schema-drift', expected: 'scriptData must be array' },
      ],
    }).execute({ action: 'validate-ae-scripts', scope: { type: 'item', id: 'item-xyz789' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('inspect-document — actor with effects and items preview', async () => {
    const r = await tool({
      documentName: 'Actor',
      type: 'character',
      name: 'Hans Gruber',
      uuid: 'Actor.actor-abc123',
      sheetClassName: 'ActorSheetWfrp4e',
      system: { characteristics: { ws: { value: 35 } } },
      flags: { 'warhammer-mcp': { version: '1' } },
      ownership: { default: 0, 'user-gm': 3 },
      effects: {
        count: 2,
        preview: [
          { id: 'eff-001', name: 'Prone', disabled: false, transfer: false },
          { id: 'eff-002', name: 'Bleeding', disabled: false, transfer: true },
        ],
      },
      items: {
        count: 3,
        preview: [
          { id: 'item-001', name: 'Sword', type: 'weapon' },
          { id: 'item-002', name: 'Leather Armour', type: 'armour' },
          { id: 'item-003', name: 'Athletics', type: 'skill' },
        ],
      },
    }).execute({ action: 'inspect-document', uuid: 'Actor.actor-abc123' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('hook-inventory — hooks with drift detected', async () => {
    const r = await tool({
      totalHooks: 3,
      totalListeners: 9,
      hooks: [
        { name: 'updateToken', count: 6, drift: true },
        { name: 'renderActorSheet', count: 2, drift: false },
        { name: 'createChatMessage', count: 1, drift: false },
      ],
      drift: [{ hook: 'updateToken', count: 6, threshold: 5 }],
    }).execute({ action: 'hook-inventory' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('module-inventory — mixed active/inactive modules', async () => {
    const r = await tool({
      total: 3,
      active: 2,
      modules: [
        { id: 'warhammer-mcp', version: '1.0.0', active: true, availability: 0, availabilityLabel: 'AVAILABLE', unavailable: false, incompatibleWithCoreVersion: false },
        { id: 'wfrp4e-core', version: '3.0.0', active: true, availability: 0, availabilityLabel: 'AVAILABLE', unavailable: false, incompatibleWithCoreVersion: false },
        { id: 'old-module', version: '0.1.0', active: false, availability: 3, availabilityLabel: 'REQUIRES_UPDATE', unavailable: true, incompatibleWithCoreVersion: true },
      ],
    }).execute({ action: 'module-inventory' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('settings-inventory — namespace-filtered settings', async () => {
    const r = await tool({
      total: 2,
      settings: [
        { namespace: 'warhammer-mcp', key: 'mcpVerboseConsole', scope: 'world', typeLabel: 'Boolean', default: false, current: true },
        { namespace: 'warhammer-mcp', key: 'auditWritesToChat', scope: 'world', typeLabel: 'Boolean', default: false, current: false },
      ],
    }).execute({ action: 'settings-inventory', namespaceFilter: 'warhammer-mcp' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
