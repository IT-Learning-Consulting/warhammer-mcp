// Characterization snapshot tests for the previously-uncovered roll-button surface:
//   RollButtonService.buildRollResultPayload (the awaitResult WFRP SL/success computation)
//   RollRequestService.requestPlayerRolls   (the structured player-not-found error path)
//
// Phase 4 (Risk 4.A): authored BEFORE the Phase 4.3 listener-leak fix so the verbatim extraction (4.2) is
// provably zero-diff. buildRollResultPayload is private on RollButtonService — pierced via an `any` cast.
// These services were extracted verbatim from data-access.ts; the snapshots pin their exact output shape.

import { describe, it, expect, beforeEach } from 'vitest';
import { RollButtonService, RollRequestService } from '../../services/index.js';

const rollButton: any = new RollButtonService();

// A minimal fake Roll: buildRollResultPayload reads roll.dice[0].total (the d100) then roll.total.
function fakeRoll(d100: number, total?: number): any {
  return { total: total ?? d100, dice: [{ total: d100 }] };
}

describe('RollButtonService.buildRollResultPayload — characterization', () => {
  it('snapshot: normal-zone success (roll <= target)', () => {
    const result = rollButton.buildRollResultPayload('1d100<=50', fakeRoll(30));
    expect(result).toMatchSnapshot();
  });

  it('snapshot: normal-zone failure (roll > target)', () => {
    const result = rollButton.buildRollResultPayload('1d100<=50', fakeRoll(70));
    expect(result).toMatchSnapshot();
  });

  it('snapshot: auto-success on roll <= 5 (SL floored to +1)', () => {
    const result = rollButton.buildRollResultPayload('1d100<=20', fakeRoll(3));
    expect(result).toMatchSnapshot();
  });

  it('snapshot: auto-failure on roll >= 96 (SL clamped to -1)', () => {
    const result = rollButton.buildRollResultPayload('1d100<=90', fakeRoll(98));
    expect(result).toMatchSnapshot();
  });

  it('snapshot: target carries an appended modifier (1d100<=50+10 → 60)', () => {
    const result = rollButton.buildRollResultPayload('1d100<=50+10', fakeRoll(55));
    expect(result).toMatchSnapshot();
  });

  it('snapshot: custom formula without a <=target clause reports raw total only', () => {
    const result = rollButton.buildRollResultPayload('2d6+3', fakeRoll(0, 11));
    expect(result).toMatchSnapshot();
  });
});

describe('RollRequestService.requestPlayerRolls — characterization', () => {
  beforeEach(() => {
    // No users and no actors → resolveTargetPlayer returns a structured PLAYER_NOT_FOUND error,
    // and requestPlayerRolls returns before any ChatMessage.create.
    (globalThis as any).game = {
      ...(globalThis as any).game,
      users: { values: () => [][Symbol.iterator]() },
      actors: { find: () => undefined },
    };
  });

  it('snapshot: structured error when the target player/character is not found', async () => {
    const rollRequest = new RollRequestService(() => {});
    const result = await rollRequest.requestPlayerRolls({
      rollType: 'characteristic',
      rollTarget: 'ws',
      targetPlayer: 'Nonexistent Player',
      isPublic: true,
      rollModifier: '',
      flavor: '',
    });
    expect(result).toMatchSnapshot();
  });
});
