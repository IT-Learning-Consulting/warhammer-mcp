// opportunity_scan_2026-08-21 F11 — WallTool vitest.
// Covers: Zod schema validation, action dispatch (all 5 actions), error envelope.
//
// Fixture shapes (WallViewModel/WallListItem field names + WALL_DOOR_TYPES/
// WALL_DOOR_STATES enum values) are sourced from
// kb/foundry_docs_v13/documents/interfaces/types.WallData.md +
// CONST/variables/WALL_DOOR_TYPES.md + WALL_DOOR_STATES.md (both version: v13) —
// not invented (PF-003). No live Foundry capture exists yet for this brand-new
// tool; live functional verification is task 3.7's round-trip, run after 3.6's
// LIVE-CONFIRM restart.

import { describe, it, expect } from 'vitest';
import { WallTool } from '../wall.js';
import { WallToolInput } from '@foundry-mcp/shared';
import { makeToolDeps } from '../../__tests__/test-utils.js';

const WALL_VM = {
  id: 'wall-id-001',
  sceneId: 'scene-id-001',
  c: [100, 100, 300, 100],
  dir: 0, // WALL_DIRECTIONS.BOTH
  door: 1, // WALL_DOOR_TYPES.DOOR
  doorSound: null,
  ds: 0, // WALL_DOOR_STATES.CLOSED
  light: 20, // WALL_SENSE_TYPES.NORMAL
  move: 20, // WALL_MOVEMENT_TYPES.NORMAL
  sight: 20,
  sound: 20,
  threshold: { attenuation: false, light: 0, sight: 0, sound: 0 },
  flags: {},
};

const WALL_LIST_ITEM = {
  id: 'wall-id-001',
  sceneId: 'scene-id-001',
  c: [100, 100, 300, 100],
  door: 1,
  ds: 0,
};

const tool = (mockReturn: any, mockThrow: string | null = null) => new WallTool(makeToolDeps(mockReturn, mockThrow));

describe('WallToolInput — Zod schema validation', () => {
  it('accepts a valid create payload (plain wall, c only)', () => {
    const parsed = WallToolInput.safeParse({ action: 'create', sceneId: 'scene-id-001', c: [0, 0, 100, 0] });
    expect(parsed.success).toBe(true);
  });

  it('accepts a valid create payload with door fields', () => {
    const parsed = WallToolInput.safeParse({
      action: 'create',
      sceneId: 'scene-id-001',
      c: [0, 0, 100, 0],
      door: 1,
      ds: 0,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects create with a c array of the wrong length', () => {
    const parsed = WallToolInput.safeParse({ action: 'create', sceneId: 'scene-id-001', c: [0, 0, 100] });
    expect(parsed.success).toBe(false);
  });

  it('rejects create missing required sceneId', () => {
    const parsed = WallToolInput.safeParse({ action: 'create', c: [0, 0, 100, 0] });
    expect(parsed.success).toBe(false);
  });

  it('rejects update with an empty changes object', () => {
    const parsed = WallToolInput.safeParse({
      action: 'update',
      sceneId: 'scene-id-001',
      wallId: 'wall-id-001',
      changes: {},
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts a valid update payload', () => {
    const parsed = WallToolInput.safeParse({
      action: 'update',
      sceneId: 'scene-id-001',
      wallId: 'wall-id-001',
      changes: { ds: 1 },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an unknown top-level field (strict schema)', () => {
    const parsed = WallToolInput.safeParse({ action: 'create', sceneId: 'scene-id-001', c: [0, 0, 100, 0], bogus: true });
    expect(parsed.success).toBe(false);
  });

  it('accepts a valid list payload with doorOnly filter', () => {
    const parsed = WallToolInput.safeParse({ action: 'list', sceneId: 'scene-id-001', doorOnly: true });
    expect(parsed.success).toBe(true);
  });
});

describe('WallTool — action dispatch', () => {
  it('create — wall created with requested fields', async () => {
    const r = await tool({
      wall: WALL_VM,
      requestedChanges: { action: 'create', sceneId: 'scene-id-001', c: [100, 100, 300, 100], door: 1, ds: 0 },
    }).execute({ action: 'create', sceneId: 'scene-id-001', c: [100, 100, 300, 100], door: 1, ds: 0 } as any);
    expect((r as any).content[0].text).toContain('Wall Created');
    expect((r as any).content[0].text).toContain('DOOR');
  });

  it('update — changed fields + updated wall view', async () => {
    const r = await tool({
      wall: { ...WALL_VM, ds: 1 },
      requestedChanges: { action: 'update', sceneId: 'scene-id-001', wallId: 'wall-id-001', changes: { ds: 1 } },
      changedFields: ['ds'],
    }).execute({ action: 'update', sceneId: 'scene-id-001', wallId: 'wall-id-001', changes: { ds: 1 } } as any);
    expect((r as any).content[0].text).toContain('Wall Updated');
    expect((r as any).content[0].text).toContain('ds');
  });

  it('delete — deleted confirmation with remaining count', async () => {
    const r = await tool({
      deletedId: 'wall-id-001',
      remainingWalls: 3,
    }).execute({ action: 'delete', sceneId: 'scene-id-001', wallId: 'wall-id-001' } as any);
    expect((r as any).content[0].text).toContain('Wall Deleted');
    expect((r as any).content[0].text).toContain('3');
  });

  it('get — single wall view', async () => {
    const r = await tool({ wall: WALL_VM }).execute({ action: 'get', sceneId: 'scene-id-001', wallId: 'wall-id-001' } as any);
    expect((r as any).content[0].text).toContain('Wall `wall-id-001`');
  });

  it('list — bare list of walls', async () => {
    const r = await tool({ walls: [WALL_LIST_ITEM] }).execute({ action: 'list', sceneId: 'scene-id-001' } as any);
    expect((r as any).content[0].text).toContain('Walls');
    expect((r as any).content[0].text).toContain('wall-id-001');
  });

  it('list — paginated walls', async () => {
    const r = await tool({
      walls: [WALL_LIST_ITEM],
      total: 5,
      page: 1,
      pageSize: 20,
      pageCount: 1,
    }).execute({ action: 'list', sceneId: 'scene-id-001', page: 1, pageSize: 20 } as any);
    expect((r as any).content[0].text).toContain('page 1 of 1');
  });

  it('list — countOnly path', async () => {
    const r = await tool({ total: 4, filterApplied: false }).execute({ action: 'list', sceneId: 'scene-id-001', countOnly: true } as any);
    expect((r as any).content[0].text).toContain('Total:** 4');
  });
});

describe('WallTool — error envelope', () => {
  it('unknown action throws before dispatch', async () => {
    await expect(
      tool(null).execute({ action: 'bogus' } as any),
    ).rejects.toThrow(/Unknown action/);
  });

  it('a thrown query error returns the typed isError envelope, not a crash', async () => {
    const r = await tool(null, 'WALL_NOT_FOUND: no such wall').execute({
      action: 'get',
      sceneId: 'scene-id-001',
      wallId: 'missing-id',
    } as any);
    expect((r as any).isError).toBe(true);
    expect((r as any).content[0].text).toContain('get failed');
    expect((r as any).content[0].text).toContain('WALL_NOT_FOUND');
  });
});
