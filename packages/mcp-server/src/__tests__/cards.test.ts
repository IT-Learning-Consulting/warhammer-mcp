// Phase 7 mcp_coverage_expansion — cards umbrella schema tests (CCR-13).
//
// Tests: action enum (19 values), required create-stack fields + type enum, CCR-4
// confirm:z.literal(true) gate on delete-stack/recall/deal, deal handIds/number guards,
// how enum, unknown-key strict reject, changes non-empty refine, perspectiveUserId optional,
// flip-card nullable face, happy-path parses per group, plus tool-behavior error surfacing.

import { describe, it, expect, vi } from 'vitest';
import { CardsToolInput } from '@foundry-mcp/shared';
import { CardsTool } from '../tools/cards.js';

function makeLogger(): any {
  const noop = () => undefined;
  return { info: noop, warn: noop, error: noop, debug: noop, child: () => makeLogger() };
}

function makeTool(mockReturn: any = null, mockThrow: string | null = null) {
  const foundryClient: any = {
    query: vi.fn(async (_key: string, _args: any) => {
      if (mockThrow) throw new Error(mockThrow);
      return mockReturn;
    }),
  };
  return new CardsTool({ foundryClient, logger: makeLogger() });
}

// ── Schema tests ──────────────────────────────────────────────────────────────

describe('CardsToolInput schema', () => {
  it('action enum contains exactly the 19 cards actions', () => {
    const actions = CardsToolInput.options.map((o) => o.shape.action.value);
    expect(actions.sort()).toEqual(
      [
        'create-stack', 'get-stack', 'list-stacks', 'update-stack', 'delete-stack', 'duplicate-stack',
        'add-card', 'get-card', 'update-card', 'delete-card', 'list-cards', 'flip-card',
        'shuffle', 'recall', 'deal', 'draw', 'pass', 'play', 'discard',
      ].sort(),
    );
  });

  it('create-stack requires name and type', () => {
    expect(() => CardsToolInput.parse({ action: 'create-stack' })).toThrow();
    expect(() => CardsToolInput.parse({ action: 'create-stack', name: 'X' })).toThrow();
    expect(() => CardsToolInput.parse({ action: 'create-stack', type: 'deck' })).toThrow();
  });

  it('create-stack rejects an invalid stack type', () => {
    expect(() => CardsToolInput.parse({ action: 'create-stack', name: 'X', type: 'tarot' })).toThrow();
  });

  it('create-stack parses with name + type (deck/hand/pile)', () => {
    for (const type of ['deck', 'hand', 'pile']) {
      expect(() => CardsToolInput.parse({ action: 'create-stack', name: 'X', type })).not.toThrow();
    }
  });

  it('create-stack rejects an unknown top-level key (strict)', () => {
    expect(() =>
      CardsToolInput.parse({ action: 'create-stack', name: 'X', type: 'deck', bogus: 1 }),
    ).toThrow();
  });

  it('delete-stack requires confirm:true (CCR-4)', () => {
    expect(() => CardsToolInput.parse({ action: 'delete-stack', stackId: 'abc' })).toThrow();
    expect(() => CardsToolInput.parse({ action: 'delete-stack', stackId: 'abc', confirm: false })).toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'delete-stack', stackId: 'abc', confirm: true }),
    ).not.toThrow();
  });

  it('delete-stack defaults dryRun to false', () => {
    const parsed = CardsToolInput.parse({ action: 'delete-stack', stackId: 'abc', confirm: true }) as any;
    expect(parsed.dryRun).toBe(false);
  });

  it('recall requires confirm:true (CCR-4)', () => {
    expect(() => CardsToolInput.parse({ action: 'recall', stackId: 'abc' })).toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'recall', stackId: 'abc', confirm: true }),
    ).not.toThrow();
  });

  it('deal requires confirm:true, a non-empty handIds, and number>=1', () => {
    expect(() => CardsToolInput.parse({ action: 'deal', deckId: 'd', handIds: ['h'] })).toThrow(); // no confirm
    expect(() =>
      CardsToolInput.parse({ action: 'deal', deckId: 'd', handIds: [], confirm: true }),
    ).toThrow(); // empty handIds
    expect(() =>
      CardsToolInput.parse({ action: 'deal', deckId: 'd', handIds: ['h'], number: 0, confirm: true }),
    ).toThrow(); // number < 1
    expect(() =>
      CardsToolInput.parse({ action: 'deal', deckId: 'd', handIds: ['h1', 'h2'], number: 2, confirm: true }),
    ).not.toThrow();
  });

  it('deal defaults number=1 and how="top"', () => {
    const parsed = CardsToolInput.parse({ action: 'deal', deckId: 'd', handIds: ['h'], confirm: true }) as any;
    expect(parsed.number).toBe(1);
    expect(parsed.how).toBe('top');
  });

  it('deal/draw reject an invalid how value', () => {
    expect(() =>
      CardsToolInput.parse({ action: 'deal', deckId: 'd', handIds: ['h'], how: 'middle', confirm: true }),
    ).toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'draw', handId: 'h', deckId: 'd', how: 'middle' }),
    ).toThrow();
  });

  it('update-stack rejects an empty changes object', () => {
    expect(() => CardsToolInput.parse({ action: 'update-stack', stackId: 'abc', changes: {} })).toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'update-stack', stackId: 'abc', changes: { displayCount: true } }),
    ).not.toThrow();
  });

  it('update-card rejects an empty changes object', () => {
    expect(() => CardsToolInput.parse({ action: 'update-card', stackId: 'a', cardId: 'c', changes: {} })).toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'update-card', stackId: 'a', cardId: 'c', changes: { suit: 'cups' } }),
    ).not.toThrow();
  });

  it('get-card / list-cards accept an optional perspectiveUserId', () => {
    expect(() =>
      CardsToolInput.parse({ action: 'get-card', stackId: 'a', cardId: 'c', perspectiveUserId: 'u1' }),
    ).not.toThrow();
    expect(() => CardsToolInput.parse({ action: 'get-card', stackId: 'a', cardId: 'c' })).not.toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'list-cards', stackId: 'a', perspectiveUserId: 'u1' }),
    ).not.toThrow();
  });

  it('flip-card accepts face as a number, null, or omitted', () => {
    expect(() => CardsToolInput.parse({ action: 'flip-card', stackId: 'a', cardId: 'c', face: 0 })).not.toThrow();
    expect(() => CardsToolInput.parse({ action: 'flip-card', stackId: 'a', cardId: 'c', face: null })).not.toThrow();
    expect(() => CardsToolInput.parse({ action: 'flip-card', stackId: 'a', cardId: 'c' })).not.toThrow();
  });

  it('add-card parses faces[] + back face data', () => {
    expect(() =>
      CardsToolInput.parse({
        action: 'add-card',
        stackId: 'a',
        name: 'Ace of Swords',
        suit: 'swords',
        value: 1,
        faces: [{ name: 'Ace', text: 'I', img: 'a.webp' }],
        back: { text: 'BACK' },
        face: null,
      }),
    ).not.toThrow();
  });

  it('pass requires a non-empty cardIds array', () => {
    expect(() => CardsToolInput.parse({ action: 'pass', stackId: 'a', toStackId: 'b', cardIds: [] })).toThrow();
    expect(() =>
      CardsToolInput.parse({ action: 'pass', stackId: 'a', toStackId: 'b', cardIds: ['c1'] }),
    ).not.toThrow();
  });

  it('missing action is rejected', () => {
    expect(() => CardsToolInput.parse({ stackId: 'abc' })).toThrow();
  });
});

// ── Tool-behavior tests ─────────────────────────────────────────────────────

describe('CardsTool behavior', () => {
  it('create-stack formats the created stack', async () => {
    const tool = makeTool({
      success: true,
      id: 'newstack',
      stack: { id: 'newstack', name: 'Deck', type: 'deck', description: '', img: null, displayCount: false, ownership: {}, folder: null, sort: 0, width: 0, height: 0, rotation: 0, flags: {}, cardCount: 0, availableCount: 0, drawnCount: 0 },
    });
    const res: any = await tool.execute({ action: 'create-stack', name: 'Deck', type: 'deck' } as any);
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toContain('newstack');
  });

  it('surfaces a typed handler error as isError content', async () => {
    const tool = makeTool(null, 'CARDS_DEAL_INSUFFICIENT: deck has 1 available card(s) but 4 required');
    const res: any = await tool.execute({ action: 'deal', deckId: 'd', handIds: ['h1', 'h2'], number: 2, confirm: true } as any);
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('CARDS_DEAL_INSUFFICIENT');
  });

  it('get-card surfaces the redaction note when redacted', async () => {
    const tool = makeTool({
      success: true,
      stackId: 'h1',
      redacted: true,
      card: { id: 'c1', stackId: 'h1', name: 'Hidden', type: 'base', description: '', suit: null, value: null, face: null, back: { name: null, img: null, text: 'BACK' }, drawn: true, origin: 'd1', sort: 0, flags: {} },
    });
    const res: any = await tool.execute({ action: 'get-card', stackId: 'h1', cardId: 'c1', perspectiveUserId: 'u1' } as any);
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toContain('redacted');
  });
});
