import { beforeEach, describe, expect, it } from 'vitest';
import { PlayerLookupService } from '../../services/index.js';

// Phase 5 (R4.3): Contract — the player-lookup helpers left FoundryDataAccess for PlayerLookupService.
// These characterizations now instantiate the service directly (validateState injected as a no-op),
// matching the sibling da-roll-button characterization. Describe titles renamed accordingly; the one
// sanctioned snapshot key change (--update-snapshots) is journal-ADR-backed per HC3.
function makeLookup() {
  return new PlayerLookupService(() => {});
}

describe('PlayerLookupService.getFriendlyNPCs — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('returns friendly tokens from active scene', async () => {
    const friendlyToken = {
      id: 'tok-f1',
      name: 'Village Elder',
      disposition: 1,
      actor: { id: 'actor-npc-1', name: 'Village Elder' },
    };
    const hostileToken = {
      id: 'tok-h1',
      name: 'Goblin',
      disposition: -1,
      actor: { id: 'actor-npc-2', name: 'Goblin' },
    };
    const activeScene = {
      id: 'scene-1',
      active: true,
      tokens: {
        filter: (fn: (t: any) => boolean) => [friendlyToken, hostileToken].filter(fn),
      },
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        find: (fn: (s: any) => boolean) => (fn(activeScene) ? activeScene : null),
      },
    };

    const svc = makeLookup();
    const result = await svc.getFriendlyNPCs();
    expect(result).toMatchSnapshot();
  });

  it('returns empty array when no active scene exists', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      scenes: {
        find: () => null,
      },
    };

    const svc = makeLookup();
    const result = await svc.getFriendlyNPCs();
    expect(result).toMatchSnapshot();
  });
});

describe('PlayerLookupService.getPartyCharacters — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('returns player-owned character actors', async () => {
    const pc1 = { id: 'pc-1', name: 'Brunhilde', type: 'character', hasPlayerOwner: true };
    const pc2 = { id: 'pc-2', name: 'Otto', type: 'character', hasPlayerOwner: true };
    const npc = { id: 'npc-1', name: 'Innkeeper', type: 'npc', hasPlayerOwner: false };
    const creature = { id: 'cre-1', name: 'Rat', type: 'creature', hasPlayerOwner: false };
    const allActors = [pc1, pc2, npc, creature];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { values: () => allActors.values() },
    };

    const svc = makeLookup();
    const result = await svc.getPartyCharacters();
    expect(result).toMatchSnapshot();
  });

  it('returns empty array when no player-owned characters exist', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: { values: () => [].values() },
    };

    const svc = makeLookup();
    const result = await svc.getPartyCharacters();
    expect(result).toMatchSnapshot();
  });
});

describe('PlayerLookupService.getConnectedPlayers — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('returns active non-GM users', async () => {
    const users = [
      { id: 'gm-1', name: 'Game Master', active: true, isGM: true },
      { id: 'player-1', name: 'Alice', active: true, isGM: false },
      { id: 'player-2', name: 'Bob', active: false, isGM: false },
      { id: 'player-3', name: 'Carol', active: true, isGM: false },
    ];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      users: { values: () => users.values() },
    };

    const svc = makeLookup();
    const result = await svc.getConnectedPlayers();
    expect(result).toMatchSnapshot();
  });

  it('returns empty array when no players are connected', async () => {
    const users = [{ id: 'gm-1', name: 'Game Master', active: true, isGM: true }];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      users: { values: () => users.values() },
    };

    const svc = makeLookup();
    const result = await svc.getConnectedPlayers();
    expect(result).toMatchSnapshot();
  });
});

describe('PlayerLookupService.findPlayers — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('finds a player by exact user name', async () => {
    const users = [
      { id: 'gm-1', name: 'GM', isGM: true },
      { id: 'player-1', name: 'Alice', isGM: false },
      { id: 'player-2', name: 'Bob', isGM: false },
    ];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      users: { values: () => users.values() },
      actors: { values: () => [].values() },
    };

    const svc = makeLookup();
    const result = await svc.findPlayers({ identifier: 'Alice' });
    expect(result).toMatchSnapshot();
  });

  it('finds player via owned character name when user name does not match', async () => {
    const user = { id: 'player-1', name: 'Alice', isGM: false };
    const users = [user];
    const characterActor = {
      id: 'char-1',
      name: 'Brunhilde the Bold',
      type: 'character',
      testUserPermission: (u: any, _perm: string) => u.id === 'player-1',
    };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      users: { values: () => users.values() },
      actors: { values: () => [characterActor].values() },
    };

    const svc = makeLookup();
    const result = await svc.findPlayers({ identifier: 'brunhilde', includeCharacterOwners: true });
    expect(result).toMatchSnapshot();
  });

  it('returns empty array when no match is found', async () => {
    const users = [{ id: 'gm-1', name: 'GM', isGM: true }];
    (globalThis as any).game = {
      ...(globalThis as any).game,
      users: { values: () => users.values() },
      actors: { values: () => [].values() },
    };

    const svc = makeLookup();
    const result = await svc.findPlayers({ identifier: 'nobody' });
    expect(result).toMatchSnapshot();
  });
});

describe('PlayerLookupService.findActor — characterization', () => {
  beforeEach(() => {
    (globalThis as any).foundry.utils.randomID = () => 'fixed-id';
  });

  it('finds actor by exact id', async () => {
    const actor = { id: 'actor-1', name: 'Sigmar the Great' };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (id: string) => (id === 'actor-1' ? actor : undefined),
        getName: (_name: string) => undefined,
        values: () => [actor].values(),
      },
    };

    const svc = makeLookup();
    const result = await svc.findActor({ identifier: 'actor-1' });
    expect(result).toMatchSnapshot();
  });

  it('finds actor by partial name match', async () => {
    const actor = { id: 'actor-2', name: 'Brunhilde the Bold' };
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: (_id: string) => undefined,
        getName: (_name: string) => undefined,
        values: () => [actor].values(),
      },
    };

    const svc = makeLookup();
    const result = await svc.findActor({ identifier: 'brunhilde' });
    expect(result).toMatchSnapshot();
  });

  it('returns null when actor is not found', async () => {
    (globalThis as any).game = {
      ...(globalThis as any).game,
      actors: {
        get: () => undefined,
        getName: () => undefined,
        values: () => [].values(),
      },
    };

    const svc = makeLookup();
    const result = await svc.findActor({ identifier: 'nobody' });
    expect(result).toMatchSnapshot();
  });
});
