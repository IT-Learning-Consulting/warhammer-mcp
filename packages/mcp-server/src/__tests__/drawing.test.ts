// Phase 5 mcp_coverage_expansion — drawing umbrella schema tests (CCR-13).
//
// Tests: action enum (6 values), required create fields (sceneId/x/y/shape),
// update changes allow-list + non-empty refine + unknown-key reject, shape.type enum,
// polygon points type, hex-colour validation, boolean/number type guards, invalid
// discriminant → safeParse false, unknown top-level key → throw (strict), missing
// action → throw, duplicate/get/delete require drawingId, plus tool-behavior
// formatting + typed-error surfacing.

import { describe, it, expect, vi } from 'vitest';
import { DrawingToolInput } from '@foundry-mcp/shared';
import { DrawingTool } from '../tools/drawing.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn;
    }),
  };
  return new DrawingTool({ foundryClient, logger: makeLogger() });
}

const minimalShape = { type: 'rectangle', width: 100, height: 60 };

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('DrawingToolInput schema', () => {
  it('action enum contains exactly 6 values', () => {
    const actions = DrawingToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(
      ['create', 'delete', 'duplicate', 'get', 'list', 'update'].sort(),
    );
  });

  it('create requires sceneId, x, y, and shape', () => {
    expect(() => DrawingToolInput.parse({ action: 'create' })).toThrow();
    expect(() => DrawingToolInput.parse({ action: 'create', sceneId: 'abc' })).toThrow();
    expect(() => DrawingToolInput.parse({ action: 'create', sceneId: 'abc', x: 0, y: 0 })).toThrow();
    expect(() =>
      DrawingToolInput.parse({ action: 'create', sceneId: 'abc', x: 0, shape: minimalShape }),
    ).toThrow();
  });

  it('create parses with the minimal required fields', () => {
    expect(() =>
      DrawingToolInput.parse({ action: 'create', sceneId: 'abc', x: 100, y: 100, shape: minimalShape }),
    ).not.toThrow();
  });

  it('create parses a polygon shape with a points array', () => {
    expect(() =>
      DrawingToolInput.parse({
        action: 'create',
        sceneId: 'abc',
        x: 0,
        y: 0,
        shape: { type: 'polygon', points: [0, 0, 100, 0, 50, 80] },
      }),
    ).not.toThrow();
  });

  it('create rejects an invalid shape.type', () => {
    const result = DrawingToolInput.safeParse({
      action: 'create',
      sceneId: 'abc',
      x: 0,
      y: 0,
      shape: { type: 'freehand' },
    });
    expect(result.success).toBe(false);
  });

  it('create rejects non-number points in a polygon', () => {
    expect(() =>
      DrawingToolInput.parse({
        action: 'create',
        sceneId: 'abc',
        x: 0,
        y: 0,
        shape: { type: 'polygon', points: [0, 'x', 100] },
      }),
    ).toThrow();
  });

  it('create rejects a non-6-digit-hex colour', () => {
    expect(() =>
      DrawingToolInput.parse({
        action: 'create',
        sceneId: 'abc',
        x: 0,
        y: 0,
        shape: minimalShape,
        strokeColor: 'red',
      }),
    ).toThrow();
    expect(() =>
      DrawingToolInput.parse({
        action: 'create',
        sceneId: 'abc',
        x: 0,
        y: 0,
        shape: minimalShape,
        fillColor: '#fff',
      }),
    ).toThrow();
  });

  it('create rejects a non-number x', () => {
    expect(() =>
      DrawingToolInput.parse({ action: 'create', sceneId: 'abc', x: 'left', y: 0, shape: minimalShape }),
    ).toThrow();
  });

  it('update requires changes', () => {
    expect(() =>
      DrawingToolInput.parse({ action: 'update', sceneId: 'abc', drawingId: 'xyz' }),
    ).toThrow();
  });

  it('update requires a non-empty changes object (refine)', () => {
    expect(() =>
      DrawingToolInput.parse({ action: 'update', sceneId: 'abc', drawingId: 'xyz', changes: {} }),
    ).toThrow();
  });

  it('update parses with valid allow-list changes (incl. x/y move)', () => {
    expect(() =>
      DrawingToolInput.parse({
        action: 'update',
        sceneId: 'abc',
        drawingId: 'xyz',
        changes: { x: 50, hidden: true, fillColor: '#00ff00', fillType: 1 },
      }),
    ).not.toThrow();
  });

  it('update rejects an unknown change key (strict)', () => {
    expect(() =>
      DrawingToolInput.parse({
        action: 'update',
        sceneId: 'abc',
        drawingId: 'xyz',
        changes: { bogusField: 1 },
      }),
    ).toThrow();
  });

  it('update rejects a non-boolean hidden', () => {
    expect(() =>
      DrawingToolInput.parse({
        action: 'update',
        sceneId: 'abc',
        drawingId: 'xyz',
        changes: { hidden: 'yes' },
      }),
    ).toThrow();
  });

  it('get / delete / duplicate require drawingId', () => {
    expect(() => DrawingToolInput.parse({ action: 'get', sceneId: 'abc' })).toThrow();
    expect(() => DrawingToolInput.parse({ action: 'delete', sceneId: 'abc' })).toThrow();
    expect(() => DrawingToolInput.parse({ action: 'duplicate', sceneId: 'abc' })).toThrow();
  });

  it('list parses with no sceneId (defaults to active scene) and optional filters', () => {
    expect(() => DrawingToolInput.parse({ action: 'list' })).not.toThrow();
    expect(() =>
      DrawingToolInput.parse({ action: 'list', sceneId: 'abc', shapeType: 'polygon', hidden: true }),
    ).not.toThrow();
  });

  it('list rejects an invalid shapeType filter', () => {
    const result = DrawingToolInput.safeParse({ action: 'list', shapeType: 'blob' });
    expect(result.success).toBe(false);
  });

  it('invalid action discriminant → safeParse false', () => {
    const result = DrawingToolInput.safeParse({ action: 'clear-layer', sceneId: 'abc' });
    expect(result.success).toBe(false);
  });

  it('unknown top-level key → throw (strict mode)', () => {
    expect(() =>
      DrawingToolInput.parse({ action: 'get', sceneId: 'abc', drawingId: 'xyz', sneaky: true }),
    ).toThrow();
  });

  it('missing action → throw', () => {
    expect(() => DrawingToolInput.parse({})).toThrow();
    expect(() => DrawingToolInput.parse({ sceneId: 'abc' })).toThrow();
  });
});

// ── Tool behavior tests ───────────────────────────────────────────────────────

const viewModel = {
  id: 'd1',
  sceneId: 'abc',
  x: 100,
  y: 100,
  shape: { type: 'rectangle', width: 200, height: 120, radius: 0, points: [] },
  bezierFactor: 0,
  text: 'Hazard',
  fontFamily: 'Signika',
  fontSize: 48,
  textColor: '#ffffff',
  textAlpha: 1,
  fillType: 1,
  fillColor: '#ff0000',
  fillAlpha: 0.5,
  strokeWidth: 8,
  strokeColor: '#ff0000',
  strokeAlpha: 1,
  texture: null,
  rotation: 0,
  elevation: 0,
  sort: 0,
  hidden: false,
  locked: false,
  interface: false,
  flags: {},
  author: 'user1',
};

describe('DrawingTool.execute', () => {
  it('exposes the drawing tool definition with 6 actions', () => {
    const tool = makeTool();
    const defs = tool.getToolDefinitions();
    expect(defs.map((d: any) => d.name)).toEqual(['drawing']);
    expect(defs[0].inputSchema.properties.action.enum).toHaveLength(6);
  });

  it('create formats the drawing view', async () => {
    const tool = makeTool({ success: true, drawing: viewModel, requestedChanges: {} });
    const result = await tool.execute({
      action: 'create',
      sceneId: 'abc',
      x: 100,
      y: 100,
      shape: minimalShape,
    });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('Drawing Created');
    expect(result.content[0].text).toContain('d1');
  });

  it('duplicate surfaces source → new id', async () => {
    const tool = makeTool({ success: true, drawing: viewModel, sourceId: 'src9' });
    const result = await tool.execute({ action: 'duplicate', sceneId: 'abc', drawingId: 'src9' });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('src9');
    expect(result.content[0].text).toContain('d1');
  });

  it('returns isError on tool throw (typed token surfaced)', async () => {
    const tool = makeTool(null, 'DRAWING_NOT_FOUND: no Drawing with id "bad"');
    const result = await tool.execute({ action: 'get', sceneId: 'abc', drawingId: 'bad' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('DRAWING_NOT_FOUND');
  });
});
