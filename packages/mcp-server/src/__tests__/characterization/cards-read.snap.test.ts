// Characterization snapshot — CardsTool read actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: read (get-stack, list-stacks, get-card, list-cards, delete-stack dryRun, recall dryRun, deal dryRun).

import { describe, it, expect } from 'vitest';
import { CardsTool } from '../../tools/cards.js';
import { makeToolDeps } from '../test-utils.js';

const STACK_VIEW = {
  id: 'deck001',
  name: 'Initiative Deck',
  type: 'deck',
  description: 'Cards for initiative order.',
  cardCount: 52,
  availableCount: 50,
  drawnCount: 2,
  displayCount: true,
  folder: null,
};

const CARD_VIEW = {
  id: 'card001',
  name: 'Ace of Swords',
  stackId: 'deck001',
  type: 'base',
  face: 0,
  drawn: false,
  suit: 'swords',
  value: 1,
  faces: [{ name: 'Ace', img: '', text: 'I' }],
};

const tool = (mockReturn: any) => new CardsTool(makeToolDeps(mockReturn));

describe('CardsTool — characterization (read)', () => {
  it('get-stack — full stack view', async () => {
    const r = await tool({ stack: STACK_VIEW }).execute({ action: 'get-stack', stackId: 'deck001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-stacks — bare list', async () => {
    const r = await tool({
      stacks: [
        { id: 'deck001', name: 'Initiative Deck', type: 'deck', cardCount: 52 },
        { id: 'hand001', name: 'GM Hand', type: 'hand', cardCount: 5 },
      ],
      total: 2,
    }).execute({ action: 'list-stacks' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-stacks — countOnly', async () => {
    const r = await tool({ total: 7, stacks: undefined }).execute({ action: 'list-stacks', countOnly: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-card — face-up card', async () => {
    const r = await tool({ card: CARD_VIEW, redacted: false }).execute({ action: 'get-card', stackId: 'deck001', cardId: 'card001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('get-card — face-down redacted', async () => {
    const r = await tool({
      card: { ...CARD_VIEW, face: null, faces: undefined },
      redacted: true,
    }).execute({ action: 'get-card', stackId: 'deck001', cardId: 'card001', perspectiveUserId: 'player1' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('list-cards — card list', async () => {
    const r = await tool({
      stackId: 'deck001',
      cards: [
        { id: 'card001', name: 'Ace of Swords', face: 0, drawn: false, faceCount: 1 },
        { id: 'card002', name: 'Two of Cups', face: null, drawn: true, faceCount: undefined },
      ],
      total: 2,
    }).execute({ action: 'list-cards', stackId: 'deck001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-stack — dryRun preview', async () => {
    const r = await tool({
      dryRun: true,
      stackId: 'deck001',
      stackName: 'Initiative Deck',
      embeddedCardCount: 52,
    }).execute({ action: 'delete-stack', stackId: 'deck001', dryRun: true, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('recall — dryRun preview', async () => {
    const r = await tool({
      dryRun: true,
      stackId: 'deck001',
      stackType: 'deck',
      cardCount: 50,
      projectedReturn: 2,
    }).execute({ action: 'recall', stackId: 'deck001', dryRun: true, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('deal — dryRun preview', async () => {
    const r = await tool({
      dryRun: true,
      deckId: 'deck001',
      sourceDeckCardCount: 50,
      destinationCount: 2,
      cardsPerHand: 5,
      cardsAfterDeal: 40,
      sufficient: true,
    }).execute({ action: 'deal', deckId: 'deck001', handIds: ['hand001', 'hand002'], number: 5, how: 'top', dryRun: true, confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
