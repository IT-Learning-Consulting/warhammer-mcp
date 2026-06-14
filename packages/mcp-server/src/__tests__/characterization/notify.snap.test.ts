// Characterization snapshot — NotifyTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// NotifyTool.execute() returns { content:[{type:"text",text}] }.
// One action (notify) with multiple severity branches.

import { describe, it, expect } from 'vitest';
import { NotifyTool } from '../../tools/notify.js';
import { makeToolDeps } from '../test-utils.js';

const tool = (mockReturn: any) => new NotifyTool(makeToolDeps(mockReturn));

describe('NotifyTool — characterization', () => {
  it('notify — info severity acknowledged', async () => {
    const r = await tool({ acknowledged: true }).execute({
      severity: 'info',
      message: 'Building encounter: 5 hostiles',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('notify — lifecycle/workflow-end acknowledged', async () => {
    const r = await tool({ acknowledged: true }).execute({
      severity: 'lifecycle',
      message: 'Encounter built: 5 actors',
      lifecycleEvent: 'workflow-end',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('notify — warn severity acknowledged', async () => {
    const r = await tool({ acknowledged: true }).execute({
      severity: 'warn',
      message: 'Some species rolls produced duplicates',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('notify — error severity acknowledged', async () => {
    const r = await tool({ acknowledged: true }).execute({
      severity: 'error',
      message: 'Failed to apply template: actor not found',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('notify — dispatcher threw (acknowledged: false)', async () => {
    const r = await tool({ acknowledged: false }).execute({
      severity: 'info',
      message: 'This notification failed internally',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('notify — created severity acknowledged', async () => {
    const r = await tool({ acknowledged: true }).execute({
      severity: 'created',
      message: 'Actor created: Hans Gruber',
    });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
