import { describe, expect, it } from 'vitest';
import { DiceRollTools } from '../tools/dice-roll.js';
import { RequestPlayerRollsInput } from '@foundry-mcp/shared';

const stubLogger: any = {
  child: () => stubLogger,
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe('BUG-146 request-player-rolls awaitResult schema parity', () => {
  it('advertises awaitResult in MCP inputSchema.properties', () => {
    const tool = new DiceRollTools({ foundryClient: {} as any, logger: stubLogger });
    const def = tool.getToolDefinitions().find((d) => d.name === 'request-player-rolls');
    const props = (def?.inputSchema as any)?.properties ?? {};

    expect(props.awaitResult).toBeDefined();
    expect(props.awaitResult.type).toBe('boolean');
    expect(props.awaitResult.default).toBe(false);
  });

  it('shared Zod schema accepts awaitResult and defaults to false when omitted', () => {
    const parsed = RequestPlayerRollsInput.parse({
      rollType: 'skill',
      rollTarget: 'melee',
      targetPlayer: 'Camila',
      isPublic: true,
      rollModifier: '',
      flavor: '',
    });
    expect(parsed.awaitResult).toBe(false);
  });
});
