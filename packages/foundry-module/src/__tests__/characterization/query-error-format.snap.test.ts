// Phase 8 Risk 8.B — characterization snapshot locking the EXACT thrown-error
// wire-format produced by the QueryHandlers handler catch blocks, across BOTH
// prefix forms — "Failed to <verb> <noun>:" (core/rolltable handlers) and
// "Failed to dispatch <op> action:" (module/umbrella dispatchers) — plus the
// shared rethrowAsInvalidInput ZodError path ("Invalid input:").
//
// The Phase-A wrapQuery refactor (A.2/A.3) collapses ~107 of these catch blocks
// into a single inline helper. This snapshot MUST show ZERO diff after that
// collapse — it is the byte-identity proof that the error contract is unchanged
// (HC8 / Risk 8.B). If a prefix string or the message interpolation drifts during
// the mechanical collapse, a snapshot here fails loud.
//
// Seam: every collapsing handler reaches its catch through the same two error
// classes — a non-Zod inner failure (-> operation prefix) and a ZodError
// (-> "Invalid input:"). We force the non-Zod failure by stubbing the first
// internal call each handler makes (validateFoundryState, or the data-access
// write for the handlers that skip it). Both prefix forms are represented:
//   verb-noun form  : getCharacterInfo, listActors, addItemFromCompendium,
//                     applyDamage, addActiveEffect, createActor
//   dispatch-action : journal, scene
// (The plan's `module-matt` / `createRollTable` reps are the SAME two forms and
// would only fire their prefix on an unexpected delegate throw, reachable solely
// by brittle ESM module-mocking that disrupts the shared setup.ts globals — no
// additional contract is locked, so they are intentionally omitted here. See the
// Phase-A note in the execution report.)

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { QueryHandlers } from '../../queries.js';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  (globalThis as any).game = {
    ...(globalThis as any).game,
    system: { id: 'wfrp4e' },
    user: { isGM: true, id: 'gm', name: 'GM' },
  };
});

async function captureThrow(fn: () => Promise<any>): Promise<string> {
  try {
    const r = await fn();
    return `<NO THROW: ${JSON.stringify(r)}>`;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

// ---- Operation-prefix form, forced via a non-Zod inner failure ----
describe('query error wire-format — operation prefix (non-Zod inner error)', () => {
  // Handlers that call validateFoundryState() before any parse: stub it to throw
  // so the catch produces the operation prefix without needing valid input.
  const VFS_OPS: Array<[string, string]> = [
    ['getCharacterInfo', 'handleGetCharacterInfo'], // verb-noun form
    ['listActors', 'handleListActors'],             // verb-noun form
    ['addItemFromCompendium', 'handleAddItemFromCompendium'],
    ['applyDamage', 'handleApplyDamage'],
    ['addActiveEffect', 'handleAddActiveEffect'],
    ['journal', 'handleJournal'],                   // dispatch-action form
    ['scene', 'handleScene'],                       // dispatch-action form
  ];
  for (const [name, method] of VFS_OPS) {
    it(name, async () => {
      const qh = new QueryHandlers();
      (qh.dataAccess as any).validateFoundryState = () => { throw new Error('FROZEN_INNER_ERROR'); };
      expect(await captureThrow(() => (qh as any)[method]({}))).toMatchSnapshot();
    });
  }

  // createActor: no early validateFoundryState; pass valid input and stub the
  // data-access write (permissionManager allows writes when isGM === true).
  it('createActor', async () => {
    const qh = new QueryHandlers();
    (qh.dataAccess as any).validateFoundryState = () => {};
    (qh.actorService as any).createActor = async () => { throw new Error('FROZEN_INNER_ERROR'); };
    expect(await captureThrow(() => (qh as any).handleCreateActor({ actorData: {} }))).toMatchSnapshot();
  });
});

// ---- Shared ZodError path: rethrowAsInvalidInput -> "Invalid input:" ----
describe('query error wire-format — ZodError path (Invalid input)', () => {
  // Unknown key fails .strict().parse(); validateFoundryState() is stubbed to a
  // no-op so the parse is reached. Covers the path shared by every handler.
  it('listActors invalid input', async () => {
    const qh = new QueryHandlers();
    (qh.dataAccess as any).validateFoundryState = () => {};
    expect(await captureThrow(() => (qh as any).handleListActors({ bogusKey: true }))).toMatchSnapshot();
  });
});
