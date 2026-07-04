// Characterization snapshot — TemplateTool return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Actions: create / update / delete / get / list (normal, countOnly) / duplicate.

import { describe, it, expect } from 'vitest';
import { TemplateTool } from '../../tools/template.js';
import { makeToolDeps } from '../test-utils.js';

const TEMPLATE_VM = {
  id: 'tmpl-id-001',
  sceneId: 'scene-id-001',
  t: 'circle',
  x: 500,
  y: 300,
  distance: 10,
  direction: 0,
  angle: 360,
  width: 0,
  borderColor: '#ff0000',
  fillColor: '#ff0000',
  texture: null,
  hidden: false,
  elevation: 0,
  sort: 0,
  author: 'user-id-001',
  flags: {},
};

const TEMPLATE_LIST_ITEM = {
  id: 'tmpl-id-001',
  sceneId: 'scene-id-001',
  t: 'circle',
  distance: 10,
  author: 'user-id-001',
  hidden: false,
};

const tool = (mockReturn: any) => new TemplateTool(makeToolDeps(mockReturn));

describe('TemplateTool — characterization', () => {
  it('create — measured template created with requested fields', async () => {
    const r = await tool({
      template: TEMPLATE_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, t: 'circle', distance: 10, fillColor: '#ff0000' },
    }).execute({ action: 'create', sceneId: 'scene-id-001', x: 500, y: 300, t: 'circle', distance: 10, fillColor: '#ff0000' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update — changed fields + updated template view', async () => {
    const r = await tool({
      template: { ...TEMPLATE_VM, hidden: true, distance: 20 },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', templateId: 'tmpl-id-001', changes: { hidden: true, distance: 20 } },
      changedFields: ['hidden', 'distance'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', templateId: 'tmpl-id-001', changes: { hidden: true, distance: 20 } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete — deleted confirmation with remaining count', async () => {
    const r = await tool({
      deletedId: 'tmpl-id-001',
      sceneId: 'scene-id-001',
      remainingTemplates: 0,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', templateId: 'tmpl-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get — single template view', async () => {
    const r = await tool({
      template: TEMPLATE_VM,
    }).execute({ action: 'get', sceneId: 'scene-id-001', templateId: 'tmpl-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — paginated templates', async () => {
    const r = await tool({
      templates: [TEMPLATE_LIST_ITEM],
      total: 1,
      page: 1,
      pageSize: 20,
      countOnly: false,
    }).execute({ action: 'list', sceneId: 'scene-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list — countOnly path', async () => {
    // BUG-435: foundry-module countOnly is LEAN — {total, filterApplied}, no templates array.
    const r = await tool({
      total: 3,
      filterApplied: null,
    }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate — cloned template with sourceId', async () => {
    const r = await tool({
      template: { ...TEMPLATE_VM, id: 'tmpl-id-002' },
      sourceId: 'tmpl-id-001',
    }).execute({ action: 'duplicate', sceneId: 'scene-id-001', templateId: 'tmpl-id-001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
