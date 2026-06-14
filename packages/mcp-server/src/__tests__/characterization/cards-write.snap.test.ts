// Characterization snapshot — CardsTool write actions return-shape lock.
// MCP Code-Quality Hardening v1, Phase 0, sub-phase 0.7.2.
// Split: write (create-stack, update-stack, delete-stack, duplicate-stack,
//   add-card, update-card, delete-card, flip-card, shuffle, recall, deal, draw, pass, play, discard).

import { describe, it, expect } from 'vitest';
import { CardsTool } from '../../tools/cards.js';
import { makeToolDeps } from '../test-utils.js';

const STACK_VIEW = {
  id: 'deck001',
  name: 'Initiative Deck',
  type: 'deck',
  description: '',
  cardCount: 0,
  availableCount: 0,
  drawnCount: 0,
  displayCount: false,
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

describe('CardsTool — characterization (write)', () => {
  it('create-stack — new deck view', async () => {
    const r = await tool({ stack: STACK_VIEW }).execute({ action: 'create-stack', name: 'Initiative Deck', type: 'deck' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-stack — changed fields + view', async () => {
    const r = await tool({
      stack: { ...STACK_VIEW, name: 'Renamed Deck' },
      changedFields: ['name'],
    }).execute({ action: 'update-stack', stackId: 'deck001', changes: { name: 'Renamed Deck' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-stack — confirmed delete', async () => {
    const r = await tool({
      dryRun: false,
      stackId: 'deck001',
      deletedCardCount: 52,
    }).execute({ action: 'delete-stack', stackId: 'deck001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('duplicate-stack — source + new ids', async () => {
    const r = await tool({
      id: 'deck002',
      sourceId: 'deck001',
      stack: { ...STACK_VIEW, id: 'deck002', name: 'Initiative Deck (Copy)' },
    }).execute({ action: 'duplicate-stack', stackId: 'deck001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('add-card — card added to stack', async () => {
    const r = await tool({ stackId: 'deck001', card: CARD_VIEW }).execute({ action: 'add-card', stackId: 'deck001', name: 'Ace of Swords' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('update-card — changed fields + card view', async () => {
    const r = await tool({
      stackId: 'deck001',
      card: { ...CARD_VIEW, suit: 'cups' },
      changedFields: ['suit'],
    }).execute({ action: 'update-card', stackId: 'deck001', cardId: 'card001', changes: { suit: 'cups' } });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('delete-card — card removed', async () => {
    const r = await tool({
      stackId: 'deck001',
      deletedId: 'card001',
      remainingCardCount: 51,
    }).execute({ action: 'delete-card', stackId: 'deck001', cardId: 'card001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('flip-card — new face state', async () => {
    const r = await tool({
      stackId: 'deck001',
      cardId: 'card001',
      face: null,
      card: { ...CARD_VIEW, face: null },
    }).execute({ action: 'flip-card', stackId: 'deck001', cardId: 'card001', face: null });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('shuffle — stack shuffled', async () => {
    const r = await tool({ stackId: 'deck001', cardCount: 52 }).execute({ action: 'shuffle', stackId: 'deck001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('recall — confirmed recall', async () => {
    const r = await tool({
      dryRun: false,
      stackId: 'deck001',
      stackType: 'deck',
      cardCount: 52,
    }).execute({ action: 'recall', stackId: 'deck001', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('deal — cards dealt to hands', async () => {
    const r = await tool({
      dryRun: false,
      deckId: 'deck001',
      dealt: 10,
      deckAvailableAfter: 40,
      hands: [
        { stackId: 'hand001', cardCount: 5 },
        { stackId: 'hand002', cardCount: 5 },
      ],
    }).execute({ action: 'deal', deckId: 'deck001', handIds: ['hand001', 'hand002'], number: 5, how: 'top', confirm: true });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('draw — hand draws from deck', async () => {
    const r = await tool({
      handId: 'hand001',
      deckId: 'deck001',
      drawnCount: 3,
      drawnCardIds: ['card001', 'card002', 'card003'],
      handCardCount: 8,
    }).execute({ action: 'draw', deckId: 'deck001', handId: 'hand001', number: 3 });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('pass — cards moved between stacks', async () => {
    const r = await tool({
      fromStackId: 'hand001',
      toStackId: 'pile001',
      passedCount: 2,
      passedCardIds: ['card001', 'card002'],
    }).execute({ action: 'pass', stackId: 'hand001', toStackId: 'pile001', cardIds: ['card001', 'card002'] });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('play — card played to pile', async () => {
    const r = await tool({
      action: 'play',
      cardId: 'card001',
      fromStackId: 'hand001',
      toStackId: 'pile001',
      newCardId: 'card001new',
    }).execute({ action: 'play', stackId: 'hand001', cardId: 'card001', toStackId: 'pile001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });

  it('discard — card discarded to pile', async () => {
    const r = await tool({
      action: 'discard',
      cardId: 'card002',
      fromStackId: 'hand001',
      toStackId: 'discard001',
      newCardId: 'card002new',
    }).execute({ action: 'discard', stackId: 'hand001', cardId: 'card002', toStackId: 'discard001' });
    expect((r as any).content[0].text).toMatchSnapshot();
  });
});
