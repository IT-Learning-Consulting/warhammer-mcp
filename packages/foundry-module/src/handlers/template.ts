// Phase 5 mcp_crud_expansion — MeasuredTemplate CRUD handler (5 actions).
// Phase 6.2 retrofit — factored through createEmbeddedCRUDHandlers (~49% LOC reduction).
//
// External API preserved: createTemplate / updateTemplate / deleteTemplate /
// getTemplate / listTemplates / dispatchTemplate. Behavior identical to
// pre-factory.
//
// FACTORY: template MeasuredTemplate
// Pre-factory template.ts was the canonical F08 _source pattern source — the
// factory's DP-16 loop emits the same pattern.
// MeasuredTemplate is GM-only (every action). Delete uses doc.delete (not
// scene.deleteEmbeddedDocuments).
//
// MeasuredTemplate.texture is a bare FilePathField (string), not TextureData.
// MeasuredTemplate.author is DocumentAuthorField — auto-set by Foundry;
// surfaced read-only in ViewModel.

import {
  TemplateToolInput,
  TemplateCreateInput,
  TemplateUpdateInput,
  TemplateDeleteInput,
  TemplateGetInput,
  TemplateListInput,
  type TemplateViewModel,
  type TemplateListItem,
} from '@foundry-mcp/shared';
import { createEmbeddedCRUDHandlers } from '../utils/embeddedCRUDFactory.js';

// ── Serializers ──────────────────────────────────────────────────────────────
function serializeTemplateViewModel(scene: any, template: any): TemplateViewModel {
  return {
    id: template.id as string,
    sceneId: scene.id as string,
    t: template.t ?? 'circle',
    x: typeof template.x === 'number' ? template.x : 0,
    y: typeof template.y === 'number' ? template.y : 0,
    elevation: typeof template.elevation === 'number' ? template.elevation : 0,
    sort: typeof template.sort === 'number' ? template.sort : 0,
    distance: typeof template.distance === 'number' ? template.distance : 0,
    direction: typeof template.direction === 'number' ? template.direction : 0,
    angle: typeof template.angle === 'number' ? template.angle : 0,
    width: typeof template.width === 'number' ? template.width : 0,
    borderColor: template.borderColor ?? '#000000',
    fillColor: template.fillColor ?? '#000000',
    texture: template.texture ?? null,
    hidden: !!template.hidden,
    author: typeof template.author === 'string'
      ? template.author
      : (template.author?.id ?? template._source?.author ?? ''),
    flags: (template.flags as Record<string, unknown>) ?? {},
  };
}

function serializeTemplateListItem(scene: any, template: any): TemplateListItem {
  return {
    id: template.id as string,
    sceneId: scene.id as string,
    t: template.t ?? 'circle',
    distance: typeof template.distance === 'number' ? template.distance : 0,
    hidden: !!template.hidden,
    author: typeof template.author === 'string'
      ? template.author
      : (template.author?.id ?? template._source?.author ?? ''),
  };
}

// ── List filters ─────────────────────────────────────────────────────────────
function applyTemplateListFilters(input: any, items: any[]): any[] {
  let filtered = items;
  if (input.filter !== undefined) {
    const needle = String(input.filter).toLowerCase();
    filtered = filtered.filter((t: any) => (t.t ?? '').toLowerCase().includes(needle));
  }
  if (input.hidden !== undefined) {
    filtered = filtered.filter((t: any) => !!t.hidden === input.hidden);
  }
  return filtered;
}

// ── Factory wiring ───────────────────────────────────────────────────────────
const handlers = createEmbeddedCRUDHandlers<any, any, TemplateViewModel, TemplateListItem>({
  documentName: 'MeasuredTemplate',
  documentLabel: 'template',
  collection: 'templates',
  idField: 'templateId',
  gmGateReads: false, // matches pre-factory behavior (get + list ungated)
  deleteApi: 'doc.delete',
  schemas: {
    create: TemplateCreateInput,
    update: TemplateUpdateInput,
    delete: TemplateDeleteInput,
    get: TemplateGetInput,
    list: TemplateListInput,
    toolInput: TemplateToolInput,
  },
  // texture is a bare FilePathField (string) — _source compare works fine.
  // flags is always skipped.
  dp16SkipFields: ['texture'],
  formatter: serializeTemplateViewModel,
  listItemFormatter: serializeTemplateListItem,
  applyListFilters: applyTemplateListFilters,
  responseKeys: {
    viewModel: 'template',
    listArray: 'templates',
    remainingCount: 'remainingTemplates',
  },
  // template always paginates (pre-factory list never returned bare-array shape).
  listAlwaysPaginated: true,
  responseBuilders: {
    // Template's countOnly shape: {success, templates: [], total, page, pageSize, countOnly: true}.
    listCount: ({ total, page, pageSize }) => ({
      templates: [],
      total,
      page: page ?? 1,
      pageSize: pageSize ?? 20,
      countOnly: true,
    }),
    // Template's paginated shape: {success, templates, total, page, pageSize, countOnly: false} — no pageCount.
    listPaginated: ({ items, total, page, pageSize }) => ({
      templates: items,
      total,
      page,
      pageSize,
      countOnly: false,
    }),
  },
});

export const createTemplate = handlers.create;
export const updateTemplate = handlers.update;
export const deleteTemplate = handlers.delete;
export const getTemplate = handlers.get;
export const listTemplates = handlers.list;
export const dispatchTemplate = handlers.dispatch;
