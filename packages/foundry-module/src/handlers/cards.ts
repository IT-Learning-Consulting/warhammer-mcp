// Phase 7 mcp_coverage_expansion — `cards` umbrella handler.
//
// Two-level surface over game.cards (a CardStacks world collection):
//   - Stack CRUD (create/get/list/update/delete/duplicate-stack) — top-level world docs,
//     hand-rolled like playlist.ts top-level Playlist CRUD.
//   - Card CRUD (add/get/update/delete/list/flip-card) — embedded Card docs on a stack.
//   - Gameplay verbs (shuffle/recall/deal/draw/pass/play/discard).
//
// Mirrors handlers/playlist.ts: validateGMAccess gate → getParentOrThrow('cards', id) →
// wrappedWrite → DP-16/CCR-2a re-read + verifyDocWrite(_source) → notify.* bookend.
//
// Three traps (08_cards_contract.md):
//   1. Face-down redaction (handler-level, NOT a Foundry built-in) — get-card / list-cards
//      strip `faces[]` when `face === null` AND the supplied `perspectiveUserId` does not OWN
//      the stack. No perspectiveUserId → GM sees all (the MCP connection runs as GM).
//   2. recall maps to Cards#recall (gameplay return), NOT Cards#reset (DataModel reset).
//   3. deal is non-transactional — pre-validate availableCards count, early-throw, no rollback.
//
// CCR-4: deal / recall / delete-stack honour dryRun (preview, no write) + confirm:true.
// `how` (top/bottom/random) → CONST.CARD_DRAW_MODES (0/1/2) at the write boundary.
// HC1 / CCR-3: thin primitive — no CONFIG reads, no game-rule logic.

import {
  CardsToolInput,
  CardsCreateStackInput,
  CardsGetStackInput,
  CardsListStacksInput,
  CardsUpdateStackInput,
  CardsDeleteStackInput,
  CardsDuplicateStackInput,
  CardsAddCardInput,
  CardsGetCardInput,
  CardsUpdateCardInput,
  CardsDeleteCardInput,
  CardsListCardsInput,
  CardsFlipCardInput,
  CardsShuffleInput,
  CardsRecallInput,
  CardsDealInput,
  CardsDrawInput,
  CardsPassInput,
  CardsPlayInput,
  CardsDiscardInput,
  type CardsStackView,
  type CardsStackListItem,
  type CardView,
  type CardFaceView,
  type CardListItem,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import { verifyDocWrite } from '../utils/verifyWrite.js';
import {
  validateGMAccess,
  deepStripUndefined,
  getParentOrThrow,
  getEmbeddedFromParentOrThrow,
  type Envelope,
} from '../utils/worldCRUDFactory.js';

const DENY = (op: string) => `Access denied: ${op} cards requires GM`;

// top/bottom/random → CONST.CARD_DRAW_MODES (TOP=0, BOTTOM=1, RANDOM=2).
const DRAW_MODE_TO_CODE: Record<string, number> = { top: 0, bottom: 1, random: 2 };

function getStackOrThrow(stackId: string): any {
  return getParentOrThrow('cards', stackId);
}

function getCardOrThrow(stack: any, cardId: string): any {
  return getEmbeddedFromParentOrThrow(stack, 'cards', cardId, 'Card', 'cards-stack');
}

// ── Serializers ───────────────────────────────────────────────────────────────

function serializeFace(face: any): CardFaceView {
  return {
    name: (face?.name as string) ?? null,
    img: (face?.img as string) ?? null,
    text: (face?.text as string) ?? null,
  };
}

/**
 * Build a CardView. When `redact` is true (face-down + non-owner perspective) the
 * `faces[]` array is omitted entirely — only the back is exposed (trap 1).
 */
function serializeCard(stack: any, card: any, redact: boolean): CardView {
  const src = card._source ?? {};
  const view: CardView = {
    id: card.id as string,
    stackId: stack.id as string,
    name: (src.name as string) ?? '',
    type: (src.type as string) ?? 'base',
    description: (src.description as string) ?? '',
    suit: (src.suit as string) ?? null,
    value: typeof src.value === 'number' ? src.value : null,
    face: typeof src.face === 'number' ? src.face : null,
    back: serializeFace(src.back ?? {}),
    drawn: !!src.drawn,
    origin: (src.origin as string) ?? null,
    sort: typeof src.sort === 'number' ? src.sort : 0,
    flags: (src.flags as Record<string, unknown>) ?? {},
  };
  if (!redact) {
    view.faces = ((src.faces as any[]) ?? []).map(serializeFace);
  }
  return view;
}

function serializeCardListItem(card: any, redact: boolean): CardListItem {
  const src = card._source ?? {};
  const item: CardListItem = {
    id: card.id as string,
    stackId: (card.parent?.id as string) ?? '',
    name: (src.name as string) ?? '',
    face: typeof src.face === 'number' ? src.face : null,
    drawn: !!src.drawn,
  };
  if (!redact) {
    item.faceCount = ((src.faces as any[]) ?? []).length;
  }
  return item;
}

function serializeStack(stack: any): CardsStackView {
  const src = stack._source ?? {};
  return {
    id: stack.id as string,
    name: (src.name as string) ?? '',
    type: (src.type as string) ?? 'deck',
    description: (src.description as string) ?? '',
    img: (src.img as string) ?? null,
    displayCount: !!src.displayCount,
    ownership: (src.ownership as Record<string, number>) ?? {},
    folder: (src.folder as string) ?? null,
    sort: typeof src.sort === 'number' ? src.sort : 0,
    width: typeof src.width === 'number' ? src.width : 0,
    height: typeof src.height === 'number' ? src.height : 0,
    rotation: typeof src.rotation === 'number' ? src.rotation : 0,
    flags: (src.flags as Record<string, unknown>) ?? {},
    cardCount: (stack.cards?.size as number) ?? 0,
    availableCount: ((stack.availableCards as any[]) ?? []).length,
    drawnCount: ((stack.drawnCards as any[]) ?? []).length,
  };
}

function serializeStackListItem(stack: any): CardsStackListItem {
  const src = stack._source ?? {};
  return {
    id: stack.id as string,
    name: (src.name as string) ?? '',
    type: (src.type as string) ?? 'deck',
    cardCount: (stack.cards?.size as number) ?? 0,
    folder: (src.folder as string) ?? null,
  };
}

/**
 * Whether `faces[]` must be redacted for a given card under a perspective.
 * Redact only when a perspectiveUserId is supplied, the card is face-down (face===null),
 * AND that user does NOT have OWNER on the parent stack. No perspectiveUserId → GM → never redacts.
 */
function shouldRedact(stack: any, card: any, perspectiveUserId?: string): boolean {
  if (!perspectiveUserId) return false;
  const faceVal = card._source?.face;
  const isFaceDown = faceVal === null || faceVal === undefined;
  if (!isFaceDown) return false;
  const user = (game as any).users?.get(perspectiveUserId);
  if (!user) return true; // unknown user → safest is to redact
  return !stack.testUserPermission(user, 'OWNER');
}

// ── Stack CRUD ────────────────────────────────────────────────────────────────

export async function createStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('create-stack') };

  const input = CardsCreateStackInput.strict().parse(data ?? {});
  const { action: _action, ...rest } = input as any;
  const requestedChanges = { ...rest };

  return wrappedWrite('cards.createStack', async () => {
    const cleaned = deepStripUndefined({ ...rest });
    const created: any = await (Cards as any).create(cleaned);
    if (!created) {
      throw new Error('CARDS_WRITE_NOT_PERSISTED: Cards.create returned empty');
    }
    const persisted = (game as any).cards?.get(created.id);
    if (!persisted) {
      throw new Error(`CARDS_WRITE_NOT_PERSISTED: Cards "${created.id}" missing from game.cards after create`);
    }
    verifyDocWrite(persisted, { name: input.name, type: input.type }, 'CARDS_WRITE_NOT_PERSISTED');

    notify.created('cards', `Card stack "${persisted._source.name}"`, { summary: input.type });

    return {
      success: true as const,
      data: { success: true, id: persisted.id, stack: serializeStack(persisted), requestedChanges },
    };
  });
}

export async function getStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('get-stack') };

  const input = CardsGetStackInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  return { success: true, data: { success: true, stack: serializeStack(stack) } };
}

export async function listStacks(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('list-stacks') };

  const input = CardsListStacksInput.strict().parse(data ?? {});
  const all: any[] = ((game as any).cards?.contents as any[] | undefined) ?? [];
  let filtered = all;
  if (input.type !== undefined) {
    filtered = filtered.filter((s) => (s._source?.type as string) === input.type);
  }
  const total = filtered.length;

  if (input.countOnly) {
    return {
      success: true,
      data: { success: true, total, filterApplied: input.type !== undefined ? `type=${input.type}` : null },
    };
  }
  if (input.page !== undefined || input.pageSize !== undefined) {
    const pageSize = input.pageSize ?? 20;
    const page = input.page ?? 1;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const offset = (page - 1) * pageSize;
    const paged = filtered.slice(offset, offset + pageSize);
    return {
      success: true,
      data: { success: true, total, page, pageSize, pageCount, stacks: paged.map(serializeStackListItem) },
    };
  }
  return { success: true, data: { success: true, stacks: filtered.map(serializeStackListItem) } };
}

export async function updateStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('update-stack') };

  const input = CardsUpdateStackInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const requestedChanges = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('cards.updateStack', async () => {
    await stack.update(requestedChanges);
    const persisted = (game as any).cards?.get(input.stackId);
    if (!persisted) {
      throw new Error(`CARDS_WRITE_NOT_PERSISTED: Cards "${input.stackId}" missing after update`);
    }
    // 'flags'/'ownership' are nested records — skip raw-value compare (F08).
    verifyDocWrite(persisted, requestedChanges, 'CARDS_WRITE_NOT_PERSISTED', {
      skipPaths: ['flags', 'ownership'],
    });

    notify.updated('cards', `Card stack "${persisted._source.name}"`, { summary: changedFields.join(', ') });

    return {
      success: true as const,
      data: { success: true, stackId: input.stackId, stack: serializeStack(persisted), requestedChanges, changedFields },
    };
  });
}

export async function deleteStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('delete-stack') };

  const input = CardsDeleteStackInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const cardCount = (stack.cards?.size as number) ?? 0;
  const stackName = (stack._source?.name as string) ?? '(unnamed)';

  // CCR-4 preview: report impact, no mutation.
  if (input.dryRun) {
    return {
      success: true,
      data: { success: true, dryRun: true, stackId: input.stackId, stackName, embeddedCardCount: cardCount },
    };
  }

  return wrappedWrite('cards.deleteStack', async () => {
    await stack.delete();
    const stillPresent = (game as any).cards?.get(input.stackId);
    if (stillPresent) {
      throw new Error(`CARDS_WRITE_NOT_PERSISTED: Cards "${input.stackId}" still present after delete`);
    }
    notify.deleted('cards', `Card stack "${stackName}"`, {
      summary: cardCount > 0 ? `${cardCount} card(s) removed` : 'empty',
    });
    return {
      success: true as const,
      data: { success: true, dryRun: false, stackId: input.stackId, deletedCardCount: cardCount },
    };
  });
}

export async function duplicateStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('duplicate-stack') };

  const input = CardsDuplicateStackInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);

  return wrappedWrite('cards.duplicateStack', async () => {
    // toObject() then strip ids (top-level + embedded) so Foundry re-keys everything.
    const obj = stack.toObject();
    delete obj._id;
    delete obj.folder;
    delete obj.sort;
    if (Array.isArray(obj.cards)) {
      for (const c of obj.cards) delete c._id;
    }
    obj.name = `${(stack._source?.name as string) ?? 'Cards'} (Copy)`;

    const created: any = await (Cards as any).create(obj);
    if (!created) {
      throw new Error('CARDS_WRITE_NOT_PERSISTED: duplicate Cards.create returned empty');
    }
    const persisted = (game as any).cards?.get(created.id);
    if (!persisted) {
      throw new Error(`CARDS_WRITE_NOT_PERSISTED: duplicated Cards "${created.id}" missing after create`);
    }

    notify.created('cards', `Card stack "${persisted._source.name}"`, { summary: `duplicate of ${input.stackId}` });

    return {
      success: true as const,
      data: { success: true, sourceId: input.stackId, id: persisted.id, stack: serializeStack(persisted) },
    };
  });
}

// ── Card CRUD ─────────────────────────────────────────────────────────────────

export async function addCard(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('add-card') };

  const input = CardsAddCardInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const { action: _action, stackId: _stackId, ...cardFields } = input as any;
  const requestedChanges = { ...cardFields };

  return wrappedWrite('cards.addCard', async () => {
    const cleaned = deepStripUndefined({ ...cardFields });
    const createdDocs = await stack.createEmbeddedDocuments('Card', [cleaned]);
    const arr = Array.isArray(createdDocs) ? createdDocs : [createdDocs];
    const createdCard = arr[0];
    if (!createdCard) {
      throw new Error('CARD_WRITE_NOT_PERSISTED: createEmbeddedDocuments returned empty');
    }
    const persistedStack = (game as any).cards?.get(input.stackId);
    const persistedCard = persistedStack?.cards?.get(createdCard.id);
    if (!persistedCard) {
      throw new Error(`CARD_WRITE_NOT_PERSISTED: Card "${createdCard.id}" missing from stack after create`);
    }
    verifyDocWrite(persistedCard, { name: input.name }, 'CARD_WRITE_NOT_PERSISTED');

    notify.created('card', `Card "${input.name}"`, { summary: `in stack ${input.stackId}` });

    return {
      success: true as const,
      data: { success: true, stackId: input.stackId, card: serializeCard(persistedStack, persistedCard, false), requestedChanges },
    };
  });
}

export async function getCard(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('get-card') };

  const input = CardsGetCardInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const card = getCardOrThrow(stack, input.cardId);
  const redact = shouldRedact(stack, card, input.perspectiveUserId);
  return { success: true, data: { success: true, card: serializeCard(stack, card, redact), redacted: redact } };
}

export async function updateCard(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('update-card') };

  const input = CardsUpdateCardInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  getCardOrThrow(stack, input.cardId); // existence guard
  const requestedChanges = { ...input.changes };
  const changedFields = Object.keys(requestedChanges);

  return wrappedWrite('cards.updateCard', async () => {
    await stack.updateEmbeddedDocuments('Card', [{ _id: input.cardId, ...requestedChanges }]);
    const persistedStack = (game as any).cards?.get(input.stackId);
    const persistedCard = persistedStack?.cards?.get(input.cardId);
    if (!persistedCard) {
      throw new Error(`CARD_WRITE_NOT_PERSISTED: Card "${input.cardId}" missing after update`);
    }
    // faces/back/flags are nested — skip raw-value compare (F08).
    verifyDocWrite(persistedCard, requestedChanges, 'CARD_WRITE_NOT_PERSISTED', {
      skipPaths: ['faces', 'back', 'flags'],
    });

    notify.updated('card', `Card "${persistedCard._source.name}"`, { summary: changedFields.join(', ') });

    return {
      success: true as const,
      data: { success: true, stackId: input.stackId, card: serializeCard(persistedStack, persistedCard, false), requestedChanges, changedFields },
    };
  });
}

export async function deleteCard(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('delete-card') };

  const input = CardsDeleteCardInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const card = getCardOrThrow(stack, input.cardId);
  const cardName = (card._source?.name as string) ?? '(unnamed)';

  return wrappedWrite('cards.deleteCard', async () => {
    await stack.deleteEmbeddedDocuments('Card', [input.cardId]);
    const persistedStack = (game as any).cards?.get(input.stackId);
    const stillPresent = persistedStack?.cards?.get(input.cardId);
    if (stillPresent) {
      throw new Error(`CARD_WRITE_NOT_PERSISTED: Card "${input.cardId}" still present after delete`);
    }
    notify.deleted('card', `Card "${cardName}"`, { summary: `from stack ${input.stackId}` });
    return {
      success: true as const,
      data: { success: true, stackId: input.stackId, deletedId: input.cardId, remainingCardCount: (persistedStack?.cards?.size as number) ?? 0 },
    };
  });
}

export async function listCards(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('list-cards') };

  const input = CardsListCardsInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const all: any[] = (stack.cards?.contents as any[] | undefined) ?? [];
  const total = all.length;

  if (input.countOnly) {
    return { success: true, data: { success: true, total } };
  }
  let items = all;
  let page: number | undefined;
  let pageSize: number | undefined;
  let pageCount: number | undefined;
  if (input.page !== undefined || input.pageSize !== undefined) {
    pageSize = input.pageSize ?? 20;
    page = input.page ?? 1;
    pageCount = Math.max(1, Math.ceil(total / pageSize));
    const offset = (page - 1) * pageSize;
    items = all.slice(offset, offset + pageSize);
  }
  const cards: CardListItem[] = items.map((c) => serializeCardListItem(c, shouldRedact(stack, c, input.perspectiveUserId)));
  const payload: Record<string, unknown> = { success: true, stackId: input.stackId, cards, total };
  if (page !== undefined) {
    payload.page = page;
    payload.pageSize = pageSize;
    payload.pageCount = pageCount;
  }
  return { success: true, data: payload };
}

export async function flipCard(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('flip-card') };

  const input = CardsFlipCardInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const card = getCardOrThrow(stack, input.cardId);

  return wrappedWrite('cards.flipCard', async () => {
    // Card#flip(face?): null = back, number = that face index, undefined = toggle.
    await card.flip(input.face === undefined ? undefined : input.face);
    const persistedStack = (game as any).cards?.get(input.stackId);
    const persistedCard = persistedStack?.cards?.get(input.cardId);
    if (!persistedCard) {
      throw new Error(`CARD_WRITE_NOT_PERSISTED: Card "${input.cardId}" missing after flip`);
    }
    const newFace = persistedCard._source?.face ?? null;
    notify.updated('card', `Card "${persistedCard._source.name}"`, {
      summary: newFace === null ? 'face-down' : `face ${newFace}`,
    });
    return {
      success: true as const,
      data: { success: true, stackId: input.stackId, cardId: input.cardId, face: newFace, card: serializeCard(persistedStack, persistedCard, false) },
    };
  });
}

// ── Ops ─────────────────────────────────────────────────────────────────────

export async function shuffleStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('shuffle') };

  const input = CardsShuffleInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);

  return wrappedWrite('cards.shuffle', async () => {
    await stack.shuffle({ chatNotification: input.chatNotification });
    const persisted = (game as any).cards?.get(input.stackId);
    notify.updated('cards', `Card stack "${persisted?._source?.name ?? input.stackId}"`, { summary: 'shuffled' });
    return {
      success: true as const,
      data: { success: true, stackId: input.stackId, cardCount: (persisted?.cards?.size as number) ?? 0 },
    };
  });
}

export async function recallStack(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('recall') };

  const input = CardsRecallInput.strict().parse(data ?? {});
  const stack = getStackOrThrow(input.stackId);
  const stackType = (stack._source?.type as string) ?? 'deck';
  const cardCount = (stack.cards?.size as number) ?? 0;

  // CCR-4 preview: report impact, no mutation.
  if (input.dryRun) {
    // deck: cards drawn FROM it return; hand/pile: cards return to their origin decks.
    const drawnFromDeck = ((stack.drawnCards as any[]) ?? []).length;
    return {
      success: true,
      data: {
        success: true,
        dryRun: true,
        stackId: input.stackId,
        stackType,
        cardCount,
        projectedReturn: stackType === 'deck' ? drawnFromDeck : cardCount,
      },
    };
  }

  return wrappedWrite('cards.recall', async () => {
    await stack.recall({ chatNotification: input.chatNotification });
    const persisted = (game as any).cards?.get(input.stackId);
    notify.updated('cards', `Card stack "${persisted?._source?.name ?? input.stackId}"`, { summary: 'recalled' });
    return {
      success: true as const,
      data: { success: true, dryRun: false, stackId: input.stackId, stackType, cardCount: (persisted?.cards?.size as number) ?? 0 },
    };
  });
}

// ── Movement ──────────────────────────────────────────────────────────────────

export async function dealCards(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('deal') };

  const input = CardsDealInput.strict().parse(data ?? {});
  const deck = getStackOrThrow(input.deckId);
  const hands = input.handIds.map((id) => getStackOrThrow(id));

  const available = ((deck.availableCards as any[]) ?? []).length;
  const required = input.number * input.handIds.length;

  // CCR-4 preview: report impact, no mutation.
  if (input.dryRun) {
    return {
      success: true,
      data: {
        success: true,
        dryRun: true,
        deckId: input.deckId,
        destinationCount: input.handIds.length,
        cardsPerHand: input.number,
        sourceDeckCardCount: available,
        cardsAfterDeal: Math.max(0, available - required),
        sufficient: available >= required,
      },
    };
  }

  // Trap 3 — non-transactional deal: pre-validate count, early-throw, NO rollback.
  if (available < required) {
    throw new Error(
      `CARDS_DEAL_INSUFFICIENT: deck has ${available} available card(s) but ${required} required ` +
        `(${input.number} × ${input.handIds.length} hands). No cards were dealt.`,
    );
  }

  return wrappedWrite('cards.deal', async () => {
    try {
      await deck.deal(hands, input.number, {
        how: DRAW_MODE_TO_CODE[input.how],
        chatNotification: input.chatNotification,
      });
    } catch (e) {
      // Trap 3: no compensating rollback — surface the affected stack ids for GM cleanup.
      notify.warn('Card deal failed mid-operation — stacks may be inconsistent', {
        summary: `deck ${input.deckId}; hands ${input.handIds.join(', ')}`,
        sticky: true,
      });
      throw e;
    }
    const persistedDeck = (game as any).cards?.get(input.deckId);
    notify.updated('cards', `Card stack "${persistedDeck?._source?.name ?? input.deckId}"`, {
      summary: `dealt ${input.number} to ${input.handIds.length} hand(s)`,
    });
    const handCounts = input.handIds.map((id) => {
      const h = (game as any).cards?.get(id);
      return { stackId: id, cardCount: (h?.cards?.size as number) ?? 0 };
    });
    return {
      success: true as const,
      data: {
        success: true,
        deckId: input.deckId,
        dealt: required,
        deckAvailableAfter: ((persistedDeck?.availableCards as any[]) ?? []).length,
        hands: handCounts,
      },
    };
  });
}

export async function drawCards(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('draw') };

  const input = CardsDrawInput.strict().parse(data ?? {});
  const hand = getStackOrThrow(input.handId);
  const deck = getStackOrThrow(input.deckId);

  return wrappedWrite('cards.draw', async () => {
    const drawn = await hand.draw(deck, input.number, {
      how: DRAW_MODE_TO_CODE[input.how],
      chatNotification: input.chatNotification,
    });
    const drawnArr = Array.isArray(drawn) ? drawn : [drawn];
    const persistedHand = (game as any).cards?.get(input.handId);
    notify.updated('cards', `Card stack "${persistedHand?._source?.name ?? input.handId}"`, {
      summary: `drew ${drawnArr.length} from ${input.deckId}`,
    });
    return {
      success: true as const,
      data: {
        success: true,
        handId: input.handId,
        deckId: input.deckId,
        drawnCount: drawnArr.length,
        drawnCardIds: drawnArr.map((c: any) => c.id as string),
        handCardCount: (persistedHand?.cards?.size as number) ?? 0,
      },
    };
  });
}

export async function passCards(data: unknown): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY('pass') };

  const input = CardsPassInput.strict().parse(data ?? {});
  const from = getStackOrThrow(input.stackId);
  const to = getStackOrThrow(input.toStackId);
  // Pre-validate every id exists in the source stack (trap 3 — pre-flight, no partial move).
  for (const id of input.cardIds) {
    if (!from.cards?.get(id)) {
      throw new Error(`CARD_NOT_FOUND: no card "${id}" in stack "${input.stackId}" — no cards were passed`);
    }
  }

  return wrappedWrite('cards.pass', async () => {
    const moved = await from.pass(to, input.cardIds, { chatNotification: input.chatNotification });
    const movedArr = Array.isArray(moved) ? moved : [moved];
    notify.updated('cards', `Card stack "${(game as any).cards?.get(input.toStackId)?._source?.name ?? input.toStackId}"`, {
      summary: `received ${movedArr.length} card(s)`,
    });
    return {
      success: true as const,
      data: {
        success: true,
        fromStackId: input.stackId,
        toStackId: input.toStackId,
        passedCount: movedArr.length,
        passedCardIds: movedArr.map((c: any) => c.id as string),
      },
    };
  });
}

async function playOrDiscard(
  data: unknown,
  action: 'play' | 'discard',
): Promise<Envelope<any>> {
  const gate = validateGMAccess();
  if (!gate.allowed) return { success: false, error: DENY(action) };

  const input = (action === 'play' ? CardsPlayInput : CardsDiscardInput).strict().parse(data ?? {});
  const from = getStackOrThrow(input.stackId);
  const to = getStackOrThrow(input.toStackId);
  const card = getCardOrThrow(from, input.cardId);

  return wrappedWrite(`cards.${action}`, async () => {
    // Card#play / Card#discard both delegate to Card#pass.
    const moved = action === 'play'
      ? await card.play(to)
      : await card.discard(to);
    const movedId = (moved?.id as string) ?? input.cardId;
    notify.updated('card', `Card "${card._source?.name ?? input.cardId}"`, {
      summary: `${action} → stack ${input.toStackId}`,
    });
    return {
      success: true as const,
      data: { success: true, action, cardId: input.cardId, fromStackId: input.stackId, toStackId: input.toStackId, newCardId: movedId },
    };
  });
}

export const playCard = (data: unknown) => playOrDiscard(data, 'play');
export const discardCard = (data: unknown) => playOrDiscard(data, 'discard');

// ── Umbrella dispatcher ─────────────────────────────────────────────────────

export async function dispatchCards(data: unknown): Promise<any> {
  let input: any;
  try {
    input = CardsToolInput.parse(data ?? {});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input';
    throw new Error(`Invalid input: ${message}`);
  }

  switch (input.action) {
    case 'create-stack':
      return createStack(input);
    case 'get-stack':
      return getStack(input);
    case 'list-stacks':
      return listStacks(input);
    case 'update-stack':
      return updateStack(input);
    case 'delete-stack':
      return deleteStack(input);
    case 'duplicate-stack':
      return duplicateStack(input);
    case 'add-card':
      return addCard(input);
    case 'get-card':
      return getCard(input);
    case 'update-card':
      return updateCard(input);
    case 'delete-card':
      return deleteCard(input);
    case 'list-cards':
      return listCards(input);
    case 'flip-card':
      return flipCard(input);
    case 'shuffle':
      return shuffleStack(input);
    case 'recall':
      return recallStack(input);
    case 'deal':
      return dealCards(input);
    case 'draw':
      return drawCards(input);
    case 'pass':
      return passCards(input);
    case 'play':
      return playCard(input);
    case 'discard':
      return discardCard(input);
    default:
      throw new Error(`Unknown cards action: ${(input as any).action}`);
  }
}
