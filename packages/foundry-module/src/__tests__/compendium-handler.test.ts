// BUG-122 + DEDUPE-001 regression guards for the compendium umbrella handler.
//
// BUG-122 (High): update-document-in-pack — `_id` in `changes` overwrites the
//   server-resolved doc.id due to spread order: `{ _id: doc.id, ...input.changes }`.
//   JS spread semantics: later key wins. A caller passing changes: { _id: 'other-id' }
//   causes DocClass.updateDocuments to target the WRONG document in the pack.
//   Fix: swap to `{ ...input.changes, _id: doc.id }` so doc.id always wins.
//   Location: handlers/compendium.ts:503
//
// DEDUPE-001 (Low): createCompendiumPack — lines 180-184 are dead code.
//   The guard `if (input.scope === 'module' && !input.moduleId)` at L180 is
//   unreachable: L174–179 unconditionally returns for every scope==='module' call,
//   so COMPENDIUM_MODULE_ID_REQUIRED is never emitted.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dispatchCompendium } from '../handlers/compendium.js';

function makeMockPack(opts: {
  packId: string;
  docType: string;
  doc: { id: string; name: string };
  locked?: boolean;
}) {
  const { packId, docType, doc } = opts;
  const docObj = {
    id: doc.id,
    name: doc.name,
    uuid: `Compendium.${packId}.${docType}.${doc.id}`,
    toObject: () => ({ _id: doc.id, name: doc.name }),
    _source: { _id: doc.id, name: doc.name },
  };
  return {
    locked: opts.locked ?? false,
    metadata: {
      id: packId,
      type: docType,
      name: packId.split('.')[1] ?? packId,
      label: 'Test Pack',
      packageType: 'world',
      packageName: 'world',
      path: null,
      folder: null,
      sort: 0,
    },
    // Called twice per updateDocumentInPack: initial fetch + post-write re-fetch.
    getDocument: vi.fn(async () => docObj),
    index: { has: vi.fn(() => false), size: 1 },
  };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).game.packs.clear();
  (globalThis as any).ui = {
    notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
});

// ── BUG-122 — _id in changes overwrites server-resolved doc.id ───────────────

describe('update-document-in-pack — BUG-122 (_id in changes must not overwrite server-resolved doc.id)', () => {
  it('uses doc.id from the server, not a caller-supplied _id in changes', async () => {
    // Arrange
    const updateDocuments = vi.fn(async () => []);
    (globalThis as any).CONFIG = { Item: { documentClass: { updateDocuments } } };

    const pack = makeMockPack({
      packId: 'world.test-pack',
      docType: 'Item',
      doc: { id: 'real-id', name: 'Test Item' },
    });
    (globalThis as any).game.packs.set('world.test-pack', pack);

    // Act: caller passes _id: 'attacker-id' inside changes
    const result = await dispatchCompendium({
      action: 'update-document-in-pack',
      packId: 'world.test-pack',
      documentId: 'real-id',
      changes: { _id: 'attacker-id', name: 'Renamed' },
    });

    // Assert: handler returns success and updateDocuments was called with
    // _id = 'real-id' (server-resolved), never 'attacker-id' (caller-supplied).
    expect(result.success).toBe(true);
    expect(updateDocuments).toHaveBeenCalledOnce();
    const updatePayload: any[] = (updateDocuments.mock.calls[0] as any)[0];
    expect(updatePayload[0]._id).toBe('real-id');
    expect(updatePayload[0]._id).not.toBe('attacker-id');
  });

  it('passes through all legitimate changes fields alongside the server-resolved _id', async () => {
    // Verifies the fix does not accidentally strip valid fields from the payload.
    const updateDocuments = vi.fn(async () => []);
    (globalThis as any).CONFIG = { Item: { documentClass: { updateDocuments } } };

    const pack = makeMockPack({
      packId: 'world.test-pack',
      docType: 'Item',
      doc: { id: 'doc-1', name: 'Sword' },
    });
    (globalThis as any).game.packs.set('world.test-pack', pack);

    await dispatchCompendium({
      action: 'update-document-in-pack',
      packId: 'world.test-pack',
      documentId: 'doc-1',
      changes: { name: 'Renamed Sword', img: 'icons/weapons/sword.png' },
    });

    expect(updateDocuments).toHaveBeenCalledOnce();
    const updatePayload: any[] = (updateDocuments.mock.calls[0] as any)[0];
    expect(updatePayload[0]._id).toBe('doc-1');
    expect(updatePayload[0].name).toBe('Renamed Sword');
    expect(updatePayload[0].img).toBe('icons/weapons/sword.png');
  });

  it('returns error when pack is locked, before reaching updateDocuments', async () => {
    const updateDocuments = vi.fn();
    (globalThis as any).CONFIG = { Item: { documentClass: { updateDocuments } } };

    const pack = makeMockPack({
      packId: 'world.locked-pack',
      docType: 'Item',
      doc: { id: 'doc-1', name: 'Sword' },
      locked: true,
    });
    (globalThis as any).game.packs.set('world.locked-pack', pack);

    const result = await dispatchCompendium({
      action: 'update-document-in-pack',
      packId: 'world.locked-pack',
      documentId: 'doc-1',
      changes: { name: 'Renamed' },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('COMPENDIUM_PACK_LOCKED');
    expect(updateDocuments).not.toHaveBeenCalled();
  });

  it('returns error when document is not found in pack', async () => {
    const updateDocuments = vi.fn();
    (globalThis as any).CONFIG = { Item: { documentClass: { updateDocuments } } };

    const pack = makeMockPack({
      packId: 'world.test-pack',
      docType: 'Item',
      doc: { id: 'real-id', name: 'Test Item' },
    });
    // Override getDocument to return null (document not found)
    pack.getDocument = vi.fn(async () => null);
    (globalThis as any).game.packs.set('world.test-pack', pack);

    const result = await dispatchCompendium({
      action: 'update-document-in-pack',
      packId: 'world.test-pack',
      documentId: 'missing-id',
      changes: { name: 'Renamed' },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('COMPENDIUM_DOCUMENT_NOT_FOUND');
    expect(updateDocuments).not.toHaveBeenCalled();
  });
});

// ── DEDUPE-001 — dead COMPENDIUM_MODULE_ID_REQUIRED branch ───────────────────

describe('create-pack — DEDUPE-001 (dead COMPENDIUM_MODULE_ID_REQUIRED branch at L180-184)', () => {
  it('scope=module without moduleId → COMPENDIUM_MODULE_SCOPE_RUNTIME_NOT_SUPPORTED, not MODULE_ID_REQUIRED', async () => {
    // The guard at L180 (`scope === 'module' && !moduleId`) is dead code:
    // L174-179 already returns for ALL scope==='module' calls before L180 is reached.
    const result = await dispatchCompendium({
      action: 'create-pack',
      name: 'mypack',
      label: 'My Pack',
      type: 'Item',
      scope: 'module',
      // moduleId intentionally omitted — if the dead branch fired, we'd see MODULE_ID_REQUIRED
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('COMPENDIUM_MODULE_SCOPE_RUNTIME_NOT_SUPPORTED');
    expect(result.error).not.toContain('COMPENDIUM_MODULE_ID_REQUIRED');
  });

  it('scope=module with moduleId → also COMPENDIUM_MODULE_SCOPE_RUNTIME_NOT_SUPPORTED (not a bypass)', async () => {
    // Confirms the PC1 guard (L174-179) fires regardless of whether moduleId is
    // present — the second guard (L180) can never be reached from either branch.
    const result = await dispatchCompendium({
      action: 'create-pack',
      name: 'mypack',
      label: 'My Pack',
      type: 'Item',
      scope: 'module',
      moduleId: 'some-module',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('COMPENDIUM_MODULE_SCOPE_RUNTIME_NOT_SUPPORTED');
  });
});
