// Phase 12 R12.3 — handleUpdateActor enforces the field allow-list at the QUERY HANDLER boundary (the single
// entry the update-actor tool AND manage-character both cross). Encodes WHERE the gate lives: if a future edit
// drops the assertAllowedActorFields call from the handler, the reject test fails.

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../queries.js';

function makeHandlers(): QueryHandlers {
  const qh = new QueryHandlers();
  (qh.dataAccess as any).validateFoundryState = () => {};
  // Stub the service write so the accept-case doesn't run the full DP-16 verify path.
  (qh.actorService as any).updateActor = vi.fn(async (d: any) => ({
    success: true, actorId: d.actorId, actorName: 'Hero', updated: Object.keys(d.updateData),
  }));
  return qh;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  (globalThis as any).game = {
    ...(globalThis as any).game,
    user: { isGM: true, id: 'gm', name: 'GM' },
    actors: new Map([['hero-1', { id: 'hero-1', name: 'Hero', type: 'character' }]]),
  };
});

describe('handleUpdateActor — Phase 12 R12.3 allow-list gate', () => {
  it('rejects a derived/forbidden field with FIELD_NOT_ALLOWED before any write', async () => {
    const qh = makeHandlers();
    await expect(
      (qh as any).handleUpdateActor({ actorId: 'hero-1', updateData: { 'system.characteristics.ws.value': 99 } }),
    ).rejects.toThrow(/FIELD_NOT_ALLOWED/);
    expect((qh.actorService as any).updateActor).not.toHaveBeenCalled();
  });

  it('accepts an allow-listed field and reaches the service', async () => {
    const qh = makeHandlers();
    const result = await (qh as any).handleUpdateActor({
      actorId: 'hero-1',
      // character gmnotes path is system.gmnotes.value (BUG-321 split — system.details.gmnotes.value is npc/creature).
      updateData: { 'system.status.wounds.value': 8, 'system.gmnotes.value': 'note' },
    });
    expect(result.success).toBe(true);
    expect((qh.actorService as any).updateActor).toHaveBeenCalledOnce();
  });

  it('skips the gate when the actor is absent (service throws the canonical not-found)', async () => {
    const qh = makeHandlers();
    (qh.actorService as any).updateActor = vi.fn(async () => { throw new Error('Actor not found with ID: ghost'); });
    await expect(
      (qh as any).handleUpdateActor({ actorId: 'ghost', updateData: { 'system.characteristics.ws.value': 1 } }),
    ).rejects.toThrow(/Actor not found/);
  });
});
