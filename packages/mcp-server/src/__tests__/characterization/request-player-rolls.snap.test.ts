// Characterization snapshot — DiceRollTools.handleRequestPlayerRolls return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// handleRequestPlayerRolls() returns bare strings (not { content:[...] } envelopes).
// Covers: fire-and-forget (awaitResult=false), awaitResult=true success, awaitResult=true timeout.

import { describe, it, expect, vi } from 'vitest';
import { DiceRollTools } from '../../tools/dice-roll.js';
import { makeToolDeps } from '../test-utils.js';

/** Build a tool whose foundryClient.query resolves mockReturn and optionally
 *  has a pendingEvents.register stub that resolves pendingResult (or rejects
 *  with pendingThrow). */
function makeTool(
  mockReturn: any,
  pendingResult?: any,
  pendingThrow?: string,
): DiceRollTools {
  const deps = makeToolDeps(mockReturn) as any;
  deps.foundryClient.pendingEvents = {
    register: vi.fn(async (_requestId: string) => {
      if (pendingThrow !== undefined) throw new Error(pendingThrow);
      return pendingResult;
    }),
  };
  return new DiceRollTools(deps);
}

describe('request-player-rolls — characterization', () => {
  it('fire-and-forget: single player characteristic roll (WFRP)', async () => {
    const r = await makeTool({
      requestId: 'req-001',
      message: 'Roll request sent to Hans Müller (Weapon Skill)',
    }).handleRequestPlayerRolls({
      rollType: 'characteristic',
      rollTarget: 'ws',
      targetPlayer: 'Hans Müller',
      isPublic: true,
      userConfirmedVisibility: true,
      rollModifier: '',
      flavor: 'Testing against beastmen',
      awaitResult: false,
    });
    expect(r).toMatchSnapshot();
  });

  it('fire-and-forget: multi-target group skill roll (no message suffix)', async () => {
    // Foundry handler may omit `message`; test that the trailing space is stable.
    const r = await makeTool({
      requestId: 'req-002',
    }).handleRequestPlayerRolls({
      rollType: 'skill',
      rollTarget: 'stealth',
      targetPlayer: 'Clark Kent',
      isPublic: false,
      userConfirmedVisibility: true,
      rollModifier: '-10',
      flavor: '',
      awaitResult: false,
    });
    expect(r).toMatchSnapshot();
  });

  it('awaitResult=true: returns result envelope when player completes roll', async () => {
    const r = await makeTool(
      { requestId: 'req-003', message: 'Roll requested' },
      { outcome: 'success', total: 42, sl: 2, success: true },
    ).handleRequestPlayerRolls({
      rollType: 'characteristic',
      rollTarget: 'wp',
      targetPlayer: 'Damien',
      isPublic: false,
      userConfirmedVisibility: true,
      rollModifier: '',
      flavor: 'Fear test',
      awaitResult: true,
    });
    expect(r).toMatchSnapshot();
  });

  it('awaitResult=true: timeout/failure message when await fails', async () => {
    const r = await makeTool(
      { requestId: 'req-004', message: 'Roll requested' },
      undefined,
      'Timed out waiting for player roll',
    ).handleRequestPlayerRolls({
      rollType: 'characteristic',
      rollTarget: 'fel',
      targetPlayer: 'Sigrid',
      isPublic: true,
      userConfirmedVisibility: true,
      rollModifier: '+10',
      flavor: '',
      awaitResult: true,
    });
    expect(r).toMatchSnapshot();
  });
});
