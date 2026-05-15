// Phase 5 mcp_crud_expansion — MeasuredTemplate handlers (umbrella, 5 actions).
//
// Foundry-side write/read surface for the `template` MCP umbrella tool.
// Operates on `scene.templates` (EmbeddedCollectionField of MeasuredTemplateDocument).
//
// CCR-Trust: every write function starts with validateGMAccess().
//            GM-only scope per plan §Design Decisions — no author-or-GM exemption.
// CCR-Transactions: every write routes through wrappedWrite('template.<name>', ...).
// CCR-Envelope: returns {success, data} or {success, error}.
// CCR-Schema-Fidelity: input field paths mirror Foundry defineSchema 1:1
//                      (phase5_probes.md §MeasuredTemplate — Foundry 13.351).
// BUG-075: snapshot-clone input.changes BEFORE every mutating call.
// DP-15: typed return on every handler (no `any` payloads).
// DP-16: post-verify each write by re-reading via getEmbeddedOrThrow.
//
// MeasuredTemplate.texture is a bare FilePathField (string), NOT TextureData.
// MeasuredTemplate.author is DocumentAuthorField — excluded from write surface,
// surfaced read-only in ViewModel (as user id string).
// t enum: 'circle' | 'cone' | 'rect' | 'ray'  (note: "rect" not "rectangle").

import {
  TemplateToolInput,
  TemplateCreateInput,
  TemplateUpdateInput,
  TemplateDeleteInput,
  TemplateGetInput,
  TemplateListInput,
  type TemplateToolInputType,
  type TemplateCreateInputType,
  type TemplateUpdateInputType,
  type TemplateDeleteInputType,
  type TemplateGetInputType,
  type TemplateListInputType,
  type TemplateViewModel,
  type TemplateListItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { getEmbeddedOrThrow } from '../utils/getEmbeddedOrThrow.js';

// ── Local types ──────────────────────────────────────────────────────────────

type EnvelopeOK<T> = { success: true; data: T };
type EnvelopeErr = { success: false; error: string };
type Envelope<T> = EnvelopeOK<T> | EnvelopeErr;

interface TemplateCreateResponse {
  success: true;
  template: TemplateViewModel;
  requestedChanges: Record<string, unknown>;
}
interface TemplateUpdateResponse {
  success: true;
  template: TemplateViewModel;
  requestedChanges: Record<string, unknown>;
  changedFields: string[];
}
interface TemplateDeleteResponse {
  success: true;
  deletedId: string;
  sceneId: string;
  remainingTemplates: number;
}
interface TemplateGetResponse {
  success: true;
  template: TemplateViewModel;
}
interface TemplateListResponse {
  success: true;
  templates: TemplateListItem[];
  total: number;
  page: number;
  pageSize: number;
  countOnly: boolean;
}

type TemplateResponse =
  | TemplateCreateResponse
  | TemplateUpdateResponse
  | TemplateDeleteResponse
  | TemplateGetResponse
  | TemplateListResponse;

// ── Access gate ──────────────────────────────────────────────────────────────

function validateGMAccess(): { allowed: boolean } {
  if (!(game as any).user?.isGM) return { allowed: false };
  return { allowed: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function deepStripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepStripUndefined) as any;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue;
      out[k] = deepStripUndefined(v);
    }
    return out as any;
  }
  return value;
}

function getSceneOrThrow(sceneId: string): any {
  const scene = (game as any).scenes?.get(sceneId);
  if (!scene) {
    throw new Error(`SCENE_NOT_FOUND: no Scene with id "${sceneId}"`);
  }
  return scene;
}

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
    // author is DocumentAuthorField (auto-set by Foundry) — surfaced as user id string.
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

// ── 1. createTemplate ────────────────────────────────────────────────────────

export async function createTemplate(data: unknown): Promise<Envelope<TemplateCreateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return {
      success: false,
      error: 'Access denied: createTemplate requires GM (MeasuredTemplate is GM-only in Phase 5)',
    };
  }

  const input: TemplateCreateInputType = TemplateCreateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);

  // BUG-075: snapshot BEFORE Foundry mutates the payload.
  const { action: _action, sceneId: _sceneId, ...rest } = input;
  const requestedChanges: Record<string, unknown> = { ...rest };

  return wrappedWrite('template.createTemplate', async () => {
    const payload = deepStripUndefined({ ...rest });
    const created = await scene.createEmbeddedDocuments('MeasuredTemplate', [payload]);
    const createdDoc = created?.[0];
    if (!createdDoc) {
      throw new Error('TEMPLATE_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned empty array');
    }

    // DP-16 post-verify: re-read from scene.templates.
    const persisted = getEmbeddedOrThrow<any>(scene, 'templates', createdDoc.id, 'MeasuredTemplate');

    return {
      success: true as const,
      data: {
        success: true,
        template: serializeTemplateViewModel(scene, persisted),
        requestedChanges,
      } satisfies TemplateCreateResponse,
    };
  });
}

// ── 2. updateTemplate ────────────────────────────────────────────────────────

export async function updateTemplate(data: unknown): Promise<Envelope<TemplateUpdateResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return {
      success: false,
      error: 'Access denied: updateTemplate requires GM (MeasuredTemplate is GM-only in Phase 5)',
    };
  }

  const input: TemplateUpdateInputType = TemplateUpdateInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const template = getEmbeddedOrThrow<any>(scene, 'templates', input.templateId, 'MeasuredTemplate');

  // BUG-075: snapshot BEFORE Foundry mutates the input.
  const requestedChanges: Record<string, unknown> = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('template.updateTemplate', async () => {
    await template.update(input.changes);

    // DP-16 post-verify: re-read via getEmbeddedOrThrow.
    const persisted = getEmbeddedOrThrow<any>(scene, 'templates', input.templateId, 'MeasuredTemplate');

    // Spot-check scalar fields (flags and texture are nested/nullable — skip deep verify).
    for (const [field, requestedValue] of Object.entries(requestedChanges)) {
      if (field === 'flags' || field === 'texture') continue;
      const persistedValue = (persisted as any)[field];
      if (persistedValue !== requestedValue) {
        throw new Error(
          `TEMPLATE_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} ` +
            `but post-update value is ${JSON.stringify(persistedValue)}`,
        );
      }
    }

    return {
      success: true as const,
      data: {
        success: true,
        template: serializeTemplateViewModel(scene, persisted),
        requestedChanges,
        changedFields,
      } satisfies TemplateUpdateResponse,
    };
  });
}

// ── 3. deleteTemplate ────────────────────────────────────────────────────────

export async function deleteTemplate(data: unknown): Promise<Envelope<TemplateDeleteResponse>> {
  const gate = validateGMAccess();
  if (!gate.allowed) {
    return {
      success: false,
      error: 'Access denied: deleteTemplate requires GM (MeasuredTemplate is GM-only in Phase 5)',
    };
  }

  const input: TemplateDeleteInputType = TemplateDeleteInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const template = getEmbeddedOrThrow<any>(scene, 'templates', input.templateId, 'MeasuredTemplate');
  const sizeBefore: number = scene.templates?.size ?? 0;

  return wrappedWrite('template.deleteTemplate', async () => {
    await template.delete();

    // DP-16 post-verify: confirm removal from collection.
    const postTemplate = scene.templates?.get(input.templateId);
    if (postTemplate) {
      throw new Error(
        `TEMPLATE_WRITE_NOT_PERSISTED: template "${input.templateId}" still present after delete()`,
      );
    }
    const sizeAfter: number = scene.templates?.size ?? 0;
    if (sizeAfter !== sizeBefore - 1) {
      throw new Error(
        `TEMPLATE_WRITE_NOT_PERSISTED: templates.size expected ${sizeBefore - 1} after delete ` +
          `but found ${sizeAfter}`,
      );
    }

    return {
      success: true as const,
      data: {
        success: true,
        deletedId: input.templateId,
        sceneId: input.sceneId,
        remainingTemplates: sizeAfter,
      } satisfies TemplateDeleteResponse,
    };
  });
}

// ── 4. getTemplate ───────────────────────────────────────────────────────────

export async function getTemplate(data: unknown): Promise<Envelope<TemplateGetResponse>> {
  const input: TemplateGetInputType = TemplateGetInput_strict_parse(data);
  const scene = getSceneOrThrow(input.sceneId);
  const template = getEmbeddedOrThrow<any>(scene, 'templates', input.templateId, 'MeasuredTemplate');

  return {
    success: true,
    data: {
      success: true,
      template: serializeTemplateViewModel(scene, template),
    },
  };
}

// ── 5. listTemplates ─────────────────────────────────────────────────────────

export async function listTemplates(data: unknown): Promise<Envelope<TemplateListResponse>> {
  const input: TemplateListInputType = TemplateListInput_strict_parse(data);

  // Resolve scene: explicit sceneId or active scene.
  let sceneId = input.sceneId;
  if (!sceneId) {
    const activeScene = (game as any).scenes?.active;
    if (!activeScene) {
      throw new Error('NO_ACTIVE_SCENE: no sceneId provided and no active scene in the world');
    }
    sceneId = activeScene.id as string;
  }
  const scene = getSceneOrThrow(sceneId);

  // Collect templates from the scene.
  let templates: any[] = Array.from(scene.templates ?? []);

  // Apply filters.
  if (input.filter !== undefined) {
    const needle = input.filter.toLowerCase();
    templates = templates.filter((t: any) =>
      (t.t ?? '').toLowerCase().includes(needle),
    );
  }
  if (input.hidden !== undefined) {
    templates = templates.filter((t: any) => !!t.hidden === input.hidden);
  }

  const total = templates.length;

  if (input.countOnly) {
    return {
      success: true,
      data: {
        success: true,
        templates: [],
        total,
        page: 1,
        pageSize: input.pageSize ?? 20,
        countOnly: true,
      },
    };
  }

  // Pagination.
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const paged = templates.slice(offset, offset + pageSize);

  return {
    success: true,
    data: {
      success: true,
      templates: paged.map((t: any) => serializeTemplateListItem(scene, t)),
      total,
      page,
      pageSize,
      countOnly: false,
    },
  };
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export async function dispatchTemplate(data: unknown): Promise<Envelope<TemplateResponse>> {
  let input: TemplateToolInputType;
  try {
    input = TemplateToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create':
      return createTemplate(input);
    case 'update':
      return updateTemplate(input);
    case 'delete':
      return deleteTemplate(input);
    case 'get':
      return getTemplate(input);
    case 'list':
      return listTemplates(input);
  }
}

// ── Per-handler strict-parse wrappers ────────────────────────────────────────

function TemplateCreateInput_strict_parse(data: unknown): TemplateCreateInputType {
  return TemplateCreateInput.strict().parse(data ?? {});
}
function TemplateUpdateInput_strict_parse(data: unknown): TemplateUpdateInputType {
  return TemplateUpdateInput.strict().parse(data ?? {});
}
function TemplateDeleteInput_strict_parse(data: unknown): TemplateDeleteInputType {
  return TemplateDeleteInput.strict().parse(data ?? {});
}
function TemplateGetInput_strict_parse(data: unknown): TemplateGetInputType {
  return TemplateGetInput.strict().parse(data ?? {});
}
function TemplateListInput_strict_parse(data: unknown): TemplateListInputType {
  return TemplateListInput.strict().parse(data ?? {});
}
