// Phase 4g — /wfrp-build-npc branch selection logic.
// The skill itself is MD-only, so this test pins the decision table from
// SKILL.md §"Branch decision" as a pure function. Any future skill rewrite
// that changes the table must keep this function in sync.

import { describe, it, expect } from 'vitest';

type ActorType = 'creature' | 'npc' | undefined;
type Branch = 1 | 2 | 3;

interface BranchInput {
  asType?: ActorType;       // --as flag
  xp?: number;              // --xp flag
  defaultActorType: ActorType;  // config.json.default_actor_type
  subcommand?: 'build' | 'advance';
  existingActorType?: ActorType; // for 'advance' subcommand
}

/**
 * Branch selection per SKILL.md §"Branch decision".
 * Default branch when no --as flag is from config.json.default_actor_type.
 */
export function selectBranch(i: BranchInput): Branch {
  if (i.subcommand === 'advance') {
    // `/wfrp-build-npc advance` targets an existing actor; always Branch 3.
    if (i.existingActorType !== 'npc') {
      throw new Error('advance sub-command requires an npc-type target');
    }
    return 3;
  }
  const actorType = i.asType ?? i.defaultActorType;
  if (actorType === 'creature') return 1;
  if (actorType === 'npc') {
    return (i.xp !== undefined && i.xp > 0) ? 3 : 2;
  }
  throw new Error(`unknown actor type: ${actorType}`);
}

describe('build-npc branch selection', () => {
  it('creature + no xp → Branch 1', () => {
    expect(selectBranch({ asType: 'creature', defaultActorType: 'creature' })).toBe(1);
  });

  it('default creature + no flags → Branch 1', () => {
    expect(selectBranch({ defaultActorType: 'creature' })).toBe(1);
  });

  it('npc + no xp → Branch 2 (Fast-NPC, dialog-bypass)', () => {
    expect(selectBranch({ asType: 'npc', defaultActorType: 'creature' })).toBe(2);
  });

  it('npc + xp=500 → Branch 3 (XP-spend)', () => {
    expect(selectBranch({ asType: 'npc', xp: 500, defaultActorType: 'creature' })).toBe(3);
  });

  it('default npc + xp → Branch 3', () => {
    expect(selectBranch({ xp: 1000, defaultActorType: 'npc' })).toBe(3);
  });

  it('default npc + no xp → Branch 2', () => {
    expect(selectBranch({ defaultActorType: 'npc' })).toBe(2);
  });

  it('explicit --as creature overrides default npc', () => {
    expect(selectBranch({ asType: 'creature', xp: 500, defaultActorType: 'npc' })).toBe(1);
  });

  it('advance sub-command on npc → Branch 3', () => {
    expect(selectBranch({
      subcommand: 'advance',
      existingActorType: 'npc',
      defaultActorType: 'creature',
    })).toBe(3);
  });

  it('advance sub-command on creature → error', () => {
    expect(() => selectBranch({
      subcommand: 'advance',
      existingActorType: 'creature',
      defaultActorType: 'creature',
    })).toThrow(/npc-type/);
  });

  it('xp=0 (not a budget) still routes to Branch 2, not Branch 3', () => {
    expect(selectBranch({ asType: 'npc', xp: 0, defaultActorType: 'creature' })).toBe(2);
  });
});
