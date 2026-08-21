// BUG-779 — delete-pile deleted only the TokenDocument, never a dedicated actor it created,
// despite the safety table calling creation "reversible via delete-pile." This left orphan
// dedicated actors (with their inventory) behind on every routine cleanup. Fix: delete-pile now
// cascade-deletes an actor MARKED dedicated at creation time (warhammer-mcp.dedicatedPile flag)
// and previews the cascade in the CONFIRM_REQUIRED message before it happens — the shared
// Default Item Pile actor (and any pre-existing actor attached by name) is NEVER touched.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleDeletePile } from '../container.js';

function makeActor(opts: { dedicated: boolean; name?: string; uuid?: string }) {
  let deleted = false;
  return {
    uuid: opts.uuid ?? 'Actor.pileactor1',
    name: opts.name ?? 'Some Pile Actor',
    getFlag: (scope: string, key: string) => (scope === 'warhammer-mcp' && key === 'dedicatedPile' ? opts.dedicated : undefined),
    delete: vi.fn(async () => {
      deleted = true;
    }),
    get deleted() {
      return deleted;
    },
  };
}

function mockGlobals(actor: any, tokenUuid = 'Scene.s1.Token.t1') {
  let resolvable: any = {
    documentName: 'Token',
    actor,
    baseActor: actor,
    delete: vi.fn(async () => {
      resolvable = null;
    }),
  };
  (globalThis as any).fromUuid = vi.fn(async (_uuid: string) => resolvable);
  (globalThis as any).fromUuidSync = vi.fn((_uuid: string) => resolvable);
  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
    itempiles: { API: {} },
  };
  return {
    getTokenDoc: () => resolvable,
  };
}

// BUG-779 (unlinked-token cascade fix): item-pile tokens are unlinked (actorLink:false), so
// `tokenDoc.actor` resolves to the token's SYNTHETIC ActorDelta (uuid `Scene.X.Token.Y.Actor.Z`),
// distinct from the world Actor — `tokenDoc.baseActor` is what must resolve to the world Actor.
// A mock that aliases `.actor` and `.baseActor` to the SAME object (as `mockGlobals` above does)
// never models this and gives a false green against the pre-fix `tokenDoc.actor` code. This
// helper models the real unlinked-token shape: distinct synthetic vs. world actor objects.
function mockUnlinkedGlobals(worldActor: any, opts: { tokenId?: string; actorId?: string } = {}) {
  const tokenId = opts.tokenId ?? 't1';
  const actorId = opts.actorId ?? (worldActor.uuid?.replace('Actor.', '') ?? 'pileactor1');
  const syntheticActor = {
    ...worldActor,
    uuid: `Scene.s1.Token.${tokenId}.Actor.${actorId}`,
    delete: vi.fn(async () => {
      throw new Error(`undefined id [${tokenId}] does not exist in the EmbeddedCollection collection`);
    }),
  };
  let resolvable: any = {
    documentName: 'Token',
    actorId,
    actor: syntheticActor, // BUG-779: this is what an unlinked token's `.actor` really returns
    baseActor: worldActor, // v13 TokenDocument#baseActor — resolves the world Actor
    delete: vi.fn(async () => {
      resolvable = null;
    }),
  };
  (globalThis as any).fromUuid = vi.fn(async (_uuid: string) => resolvable);
  (globalThis as any).fromUuidSync = vi.fn((_uuid: string) => resolvable);
  (globalThis as any).game = {
    user: { isGM: true },
    users: [{ isGM: true, active: true }],
    itempiles: { API: {} },
    actors: { get: (id: string) => (id === actorId ? worldActor : null) },
  };
  return {
    getTokenDoc: () => resolvable,
    syntheticActor,
  };
}

afterEach(() => {
  delete (globalThis as any).game;
  delete (globalThis as any).fromUuid;
  delete (globalThis as any).fromUuidSync;
});

describe('handleDeletePile — BUG-779 cascade-delete', () => {
  it('previews the cascade (does not delete) when confirm is not true, naming the dedicated actor', async () => {
    const actor = makeActor({ dedicated: true, name: 'Old Fatsack', uuid: 'Actor.merchant1' });
    mockGlobals(actor);

    const result: any = await handleDeletePile({
      action: 'delete-pile',
      tokenUuid: 'Scene.s1.Token.t1',
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(result.error).toContain('Old Fatsack');
    expect(result.error).toContain('Actor.merchant1');
    expect(actor.delete).not.toHaveBeenCalled();
  });

  it('preview omits the cascade note for a shared/non-dedicated actor', async () => {
    const actor = makeActor({ dedicated: false, name: 'Default Item Pile' });
    mockGlobals(actor);

    const result: any = await handleDeletePile({
      action: 'delete-pile',
      tokenUuid: 'Scene.s1.Token.t1',
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFIRM_REQUIRED');
    expect(result.error).not.toContain('Default Item Pile');
    expect(result.error).not.toContain('dedicated pile actor');
  });

  it('cascade-deletes a dedicated actor alongside the token when confirmed', async () => {
    const actor = makeActor({ dedicated: true, name: 'Old Fatsack', uuid: 'Actor.merchant1' });
    const globals = mockGlobals(actor);

    const result: any = await handleDeletePile({
      action: 'delete-pile',
      tokenUuid: 'Scene.s1.Token.t1',
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.deleted).toBe(true);
    expect(result.data.dedicatedActorUuid).toBe('Actor.merchant1');
    expect(result.data.actorDeleted).toBe(true);
    expect(actor.delete).toHaveBeenCalledTimes(1);
    expect(actor.deleted).toBe(true);
    expect(globals.getTokenDoc()).toBeNull();
  });

  it('preserves a shared actor — token deleted, actor NOT deleted, even when confirmed', async () => {
    const actor = makeActor({ dedicated: false, name: 'Default Item Pile' });
    mockGlobals(actor);

    const result: any = await handleDeletePile({
      action: 'delete-pile',
      tokenUuid: 'Scene.s1.Token.t1',
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.deleted).toBe(true);
    expect(result.data.dedicatedActorUuid).toBeNull();
    expect(result.data.actorDeleted).toBe(false);
    expect(actor.delete).not.toHaveBeenCalled();
  });

  it('preserves a pre-existing (non-dedicated, name-attached) actor on delete', async () => {
    const actor = makeActor({ dedicated: false, name: 'Some NPC merchant attached by name' });
    mockGlobals(actor);

    const result: any = await handleDeletePile({
      action: 'delete-pile',
      tokenUuid: 'Scene.s1.Token.t1',
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.actorDeleted).toBe(false);
    expect(actor.delete).not.toHaveBeenCalled();
  });

  // BUG-779 live-smoke regression: item-pile tokens are UNLINKED (actorLink:false), so
  // `tokenDoc.actor` returns the token's synthetic ActorDelta, not the world Actor. Deleting
  // the synthetic actor throws ("undefined id [...] does not exist in the EmbeddedCollection
  // collection") and leaves the real world actor orphaned. This test fails against the
  // pre-fix code (which resolved `tokenDoc.actor`) and must pass against the fix (which
  // resolves `tokenDoc.baseActor`, falling back to `game.actors.get(actorId)`).
  it('cascade-deletes the WORLD actor (not the synthetic token-actor) for an unlinked token', async () => {
    const worldActor = makeActor({ dedicated: true, name: 'Old Fatsack', uuid: 'Actor.ej47sFtyKgQMiZjl' });
    const globals = mockUnlinkedGlobals(worldActor, { tokenId: '2jIHUcQLfZshVClt', actorId: 'ej47sFtyKgQMiZjl' });

    const result: any = await handleDeletePile({
      action: 'delete-pile',
      tokenUuid: 'Scene.uLg9GDxNIhztKFVF.Token.2jIHUcQLfZshVClt',
      confirm: true,
    } as any);

    expect(result.success).toBe(true);
    expect(result.data.deleted).toBe(true);
    // The dedicated actor uuid reported back must be the WORLD actor's uuid, never the
    // token-relative synthetic path (Scene.X.Token.Y.Actor.Z).
    expect(result.data.dedicatedActorUuid).toBe('Actor.ej47sFtyKgQMiZjl');
    expect(result.data.actorDeleted).toBe(true);
    expect(result.data.actorDeleteError).toBeUndefined();
    expect(worldActor.delete).toHaveBeenCalledTimes(1);
    expect(worldActor.deleted).toBe(true);
    // The synthetic actor delete() must NEVER be invoked — that's the exact bug this guards.
    expect(globals.syntheticActor.delete).not.toHaveBeenCalled();
    expect(globals.getTokenDoc()).toBeNull();
  });
});
