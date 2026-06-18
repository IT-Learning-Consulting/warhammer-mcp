// Phase 7 mcp_coverage_expansion — `cards` umbrella tool (19 actions).
//
// Wraps the `cards` Foundry-side handler (dispatchCards) over game.cards.
// Stack CRUD (6) + Card CRUD (6) + Ops (2) + Movement (5).
//
// **CCR-Envelope-Consumer / BUG-069:** every handler uses a concrete typed generic on
// `this.query<...>` — never `<any>`. query returns BARE unwrapped data; never re-check a
// success field. Each handler wraps its call in try/catch → BaseTool.errorResponse.
//
// Traps surfaced in descriptions: face-down redaction (perspectiveUserId), recall-not-reset,
// non-transactional deal (pre-validated, no rollback). CCR-4 dryRun+confirm on deal/recall/
// delete-stack. `how` ∈ top|bottom|random. `chatNotification` defaults OFF.

import { z } from 'zod';
import {
  CardsToolInput,
  CardsId,
  CardId,
  type CardsStackView,
  type CardsStackListItem,
  type CardView,
  type CardListItem,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type CardsArgs = z.infer<typeof CardsToolInput>;
type ArgsFor<A extends CardsArgs['action']> = Extract<CardsArgs, { action: A }>;

// ── Inline response interfaces (mirror foundry-module handler data payloads) ──

interface StackResponse {
  success: true;
  id?: string;
  stackId?: CardsId;
  sourceId?: string; // not a branded id (polymorphic / non-document)
  stack: CardsStackView;
  requestedChanges?: Record<string, unknown>;
  changedFields?: string[];
}
interface StackListResponse { success: true; stacks?: CardsStackListItem[]; total?: number; page?: number; pageSize?: number; pageCount?: number; filterApplied?: string | null; }
interface StackDeleteResponse { success: true; dryRun: boolean; stackId: CardsId; stackName?: string; embeddedCardCount?: number; deletedCardCount?: number; }
interface CardResponse { success: true; stackId: CardsId; card: CardView; requestedChanges?: Record<string, unknown>; changedFields?: string[]; redacted?: boolean; }
interface CardDeleteResponse {
  success: true;
  stackId: CardsId;
  deletedId: string; // not a branded id (polymorphic / non-document)
  remainingCardCount: number;
}
interface CardListResponse { success: true; stackId: CardsId; cards?: CardListItem[]; total?: number; page?: number; pageSize?: number; pageCount?: number; }
interface FlipResponse { success: true; stackId: CardsId; cardId: CardId; face: number | null; card: CardView; }
interface ShuffleResponse { success: true; stackId: CardsId; cardCount: number; }
interface RecallResponse { success: true; dryRun: boolean; stackId: CardsId; stackType: string; cardCount: number; projectedReturn?: number; }
interface DealResponse {
  success: true;
  dryRun?: boolean;
  deckId: CardsId;
  dealt?: number;
  deckAvailableAfter?: number;
  hands?: Array<{ stackId: CardsId; cardCount: number }>;
  destinationCount?: number;
  cardsPerHand?: number;
  sourceDeckCardCount?: number;
  cardsAfterDeal?: number;
  sufficient?: boolean;
}
interface DrawResponse { success: true; handId: CardsId; deckId: CardsId; drawnCount: number; drawnCardIds: string[]; handCardCount: number; }
interface PassResponse { success: true; fromStackId: CardsId; toStackId: CardsId; passedCount: number; passedCardIds: string[]; }
interface PlayDiscardResponse { success: true; action: string; cardId: CardId; fromStackId: CardsId; toStackId: CardsId; newCardId: CardId; }

// ── Utilities ────────────────────────────────────────────────────────────────


function formatStack(s: CardsStackView): string {
  return [
    `## Card stack \`${s.id}\` — ${s.type}`,
    `**Name:** ${s.name}`,
    s.description ? `**Description:** ${s.description}` : '',
    `**Cards:** ${s.cardCount} (available ${s.availableCount}, drawn ${s.drawnCount})`,
    `**displayCount:** ${s.displayCount ? 'yes' : 'no'} · **folder:** ${s.folder ?? '_(none)_'}`,
  ].filter(Boolean).join('\n');
}

function formatCard(c: CardView): string {
  const facesLine = c.faces === undefined
    ? '_(faces redacted — face-down, viewer not owner)_'
    : `${c.faces.length} face(s)`;
  return [
    `## Card \`${c.id}\` — ${c.name}`,
    `**Stack:** \`${c.stackId}\` · **type:** ${c.type}`,
    `**face:** ${c.face === null ? 'face-down (back shown)' : c.face} · **drawn:** ${c.drawn ? 'yes' : 'no'}`,
    `**suit:** ${c.suit ?? '_(none)_'} · **value:** ${c.value ?? '_(none)_'}`,
    `**faces:** ${facesLine}`,
  ].join('\n');
}

export interface CardsToolOptions extends BaseToolOptions {}

export class CardsTool extends BaseTool {
  constructor(options: CardsToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
      { name: 'cards', handler: (args: any) => this.execute(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'cards',
        title: 'Manage Card Stacks',
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          `Manage Foundry VTT Cards (decks/hands/piles) and embedded Card documents via 19 actions over game.cards. A "stack" is a world-level Cards document (type deck | hand | pile); each stack owns embedded Card documents. Use for initiative decks, fortune-card hands, discard piles, and any card-driven subsystem.

**Stack actions (6):**
- **create-stack**: New stack. Required: name, type (deck|hand|pile). Optional: description, img, displayCount, ownership, folder, sort, width, height, rotation, flags.
- **get-stack**: Full stack view by stackId (card counts incl. available/drawn).
- **list-stacks**: All stacks; optional type filter; page/pageSize/countOnly.
- **update-stack**: Partial-diff via changes (≥1 field).
- **delete-stack**: ⚠️ Irreversible. CCR-4: dryRun:true previews {stackName, embeddedCardCount}; confirm:true required to execute.
- **duplicate-stack**: Clone a stack (top-level + embedded card ids re-keyed); name suffixed "(Copy)".

**Card actions (6):**
- **add-card**: Add one embedded Card to a stack. Required: stackId, name. Optional: type, description, suit, value, faces[{name,img,text}], face (index or null=face-down), back, width, height, rotation, sort, flags.
- **get-card**: One card by stackId+cardId. ⚠️ Face-down redaction: pass perspectiveUserId to evaluate visibility AS that user — a face-down card (face===null) the user does NOT own returns with faces[] omitted. No perspectiveUserId → GM sees all (this connection is GM).
- **update-card**: Partial-diff via changes (≥1 field).
- **delete-card**: ⚠️ Hard-delete one embedded card (use pass to move instead).
- **list-cards**: Cards in a stack; perspectiveUserId redaction as get-card; page/pageSize/countOnly.
- **flip-card**: Flip a card. face:null → face-down; face:number → that face index; omit face → toggle.

**Ops (2):**
- **shuffle**: Randomise card order in a stack. chatNotification (default false) broadcasts to the table.
- **recall**: Return cards (Cards#recall — NOT a DataModel reset). On a deck: pull drawn cards back. On a hand/pile: return cards to their origin decks. CCR-4: dryRun previews; confirm:true required.

**Movement (5):**
- **deal**: Deal N cards from a deck to each of handIds[]. Called on the source deck. how ∈ top|bottom|random. ⚠️ Non-transactional: handler pre-validates the deck has ≥ number×hands available cards and early-throws if short — there is NO rollback on a mid-deal failure. CCR-4: dryRun previews {sourceDeckCardCount, cardsAfterDeal, sufficient}; confirm:true required.
- **draw**: A hand draws N cards from a deck (called on the receiving hand). how ∈ top|bottom|random.
- **pass**: Move specific cards (cardIds[]) from one stack to another. All ids pre-validated to exist in the source.
- **play**: Play one card to a destination stack (Card#play → pile). Required: stackId (parent), cardId, toStackId.
- **discard**: Discard one card to a destination stack (Card#discard → pile). Required: stackId (parent), cardId, toStackId.

**Examples:**
- {action:"create-stack", name:"Initiative Deck", type:"deck"}
- {action:"add-card", stackId:"abc", name:"Ace of Swords", suit:"swords", value:1, faces:[{name:"Ace",text:"I"}], back:{text:"BACK"}}
- {action:"deal", deckId:"abc", handIds:["h1","h2"], number:2, how:"top", confirm:true}
- {action:"get-card", stackId:"h1", cardId:"c9", perspectiveUserId:"playerUserId"}
- {action:"delete-stack", stackId:"abc", dryRun:true, confirm:true}
- {action:"recall", stackId:"abc", confirm:true}`,
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'create-stack', 'get-stack', 'list-stacks', 'update-stack', 'delete-stack', 'duplicate-stack',
                'add-card', 'get-card', 'update-card', 'delete-card', 'list-cards', 'flip-card',
                'shuffle', 'recall', 'deal', 'draw', 'pass', 'play', 'discard',
              ],
              description: 'The cards action to perform.',
            },
            stackId: { type: 'string', description: '[get/update/delete/duplicate-stack, add/get/update/delete/list-card, flip-card, shuffle, recall, pass(source), play/discard(parent)] Cards stack id.' },
            name: { type: 'string', description: '[create-stack] Required stack name. [add-card] Required card name.' },
            type: { type: 'string', enum: ['deck', 'hand', 'pile'], description: '[create-stack] Required stack type. [list-stacks] Optional type filter. [add-card/update-card] Optional card subtype (string).' },
            description: { type: 'string', description: '[create-stack/add-card + their changes] HTML description.' },
            img: { type: 'string', description: '[create-stack/update-stack.changes] Stack image path.' },
            displayCount: { type: 'boolean', description: '[create-stack/update-stack.changes] Publicly show card count.' },
            ownership: { type: 'object', description: '[create-stack/update-stack.changes] DocumentOwnershipField {userId|default: level 0-3}.' },
            folder: { type: ['string', 'null'], description: '[create-stack/update-stack.changes] Folder id (null clears).' },
            sort: { type: 'integer', description: '[create-stack/add-card + changes] Sort order.' },
            width: { type: 'number', description: '[create-stack/add-card + changes] Visible width.' },
            height: { type: 'number', description: '[create-stack/add-card + changes] Visible height.' },
            rotation: { type: 'number', description: '[create-stack/add-card + changes] Rotation angle.' },
            flags: { type: 'object', description: '[create-stack/add-card + changes] Foundry flag bag.' },
            suit: { type: 'string', description: '[add-card/update-card.changes] Card suit (sorting).' },
            value: { type: 'number', description: '[add-card/update-card.changes] Card numeric value (sorting).' },
            faces: { type: 'array', description: '[add-card/update-card.changes] Array of {name?, img?, text?} face entries.' },
            face: { type: ['integer', 'null'], description: '[add-card/update-card.changes] Shown face index; null = face-down (back shown). [flip-card] target face; null = face-down; omit = toggle.' },
            back: { type: 'object', description: '[add-card/update-card.changes] Back face {name?, img?, text?}.' },
            cardId: { type: 'string', description: '[get/update/delete-card, flip-card, play, discard] Embedded Card id.' },
            perspectiveUserId: { type: 'string', description: '[get-card/list-cards] Evaluate face-down redaction AS this user. Omit → GM sees all faces. Supplied → faces[] stripped for face-down cards this user does not OWN.' },
            changes: { type: 'object', description: '[update-stack/update-card] Partial-diff object (≥1 field) of the writable surface.' },
            toStackId: { type: 'string', description: '[pass/play/discard] Destination stack id.' },
            cardIds: { type: 'array', items: { type: 'string' }, description: '[pass] Card ids to move (≥1, all pre-validated to exist in the source).' },
            deckId: { type: 'string', description: '[deal/draw] Source deck id.' },
            handId: { type: 'string', description: '[draw] Receiving hand id.' },
            handIds: { type: 'array', items: { type: 'string' }, description: '[deal] Destination hand ids (≥1).' },
            number: { type: 'integer', minimum: 1, description: '[deal/draw] Cards per destination (default 1).' },
            how: { type: 'string', enum: ['top', 'bottom', 'random'], description: '[deal/draw] Draw mode (default top).' },
            chatNotification: { type: 'boolean', description: '[shuffle/recall/deal/draw/pass/play/discard] Broadcast a player-visible chat message (default false).' },
            dryRun: { type: 'boolean', description: '[delete-stack/recall/deal] CCR-4 preview — return the impact report without mutating (default false).' },
            confirm: { type: 'boolean', description: '[delete-stack/recall/deal] Must be true to execute the destructive/bulk op.' },
            page: { type: 'integer', minimum: 1, description: '[list-stacks/list-cards] 1-based page.' },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, description: '[list-stacks/list-cards] Items per page.' },
            countOnly: { type: 'boolean', description: '[list-stacks/list-cards] Return {total} only.' },
          },
          required: ['action'],
        },
      },
    ];
  }

  async execute(args: CardsArgs) {
    this.logger.info('Executing cards action', { action: args.action });
    switch (args.action) {
      case 'create-stack': return this.handleCreateStack(args);
      case 'get-stack': return this.handleGetStack(args);
      case 'list-stacks': return this.handleListStacks(args);
      case 'update-stack': return this.handleUpdateStack(args);
      case 'delete-stack': return this.handleDeleteStack(args);
      case 'duplicate-stack': return this.handleDuplicateStack(args);
      case 'add-card': return this.handleAddCard(args);
      case 'get-card': return this.handleGetCard(args);
      case 'update-card': return this.handleUpdateCard(args);
      case 'delete-card': return this.handleDeleteCard(args);
      case 'list-cards': return this.handleListCards(args);
      case 'flip-card': return this.handleFlipCard(args);
      case 'shuffle': return this.handleShuffle(args);
      case 'recall': return this.handleRecall(args);
      case 'deal': return this.handleDeal(args);
      case 'draw': return this.handleDraw(args);
      case 'pass': return this.handlePass(args);
      case 'play': return this.handlePlay(args);
      case 'discard': return this.handleDiscard(args);
    }
  }

  // ── Stack handlers ────────────────────────────────────────────────────────

  private async handleCreateStack(args: ArgsFor<'create-stack'>) {
    try {
      const data = await this.query<StackResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Stack Created**\n\n${formatStack(data.stack)}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('create-stack', e instanceof Error ? e.message : String(e)); }
  }

  private async handleGetStack(args: ArgsFor<'get-stack'>) {
    try {
      const data = await this.query<StackResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: formatStack(data.stack) }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('get-stack', e instanceof Error ? e.message : String(e)); }
  }

  private async handleListStacks(args: ArgsFor<'list-stacks'>) {
    try {
      const data = await this.query<StackListResponse>('cards', args);
      if (data.stacks === undefined) {
        return { content: [{ type: 'text' as const, text: `**Card stack count**\n\n**Total:** ${data.total ?? 0}` }], structuredContent: data as unknown as Record<string, unknown> };
      }
      if (data.stacks.length === 0) {
        return { content: [{ type: 'text' as const, text: '**No card stacks found**' }], structuredContent: data as unknown as Record<string, unknown> };
      }
      const lines = data.stacks.map((s) => `- \`${s.id}\` · ${s.type} · "${s.name}" · ${s.cardCount} card(s)`);
      const total = data.total ?? data.stacks.length;
      return { content: [{ type: 'text' as const, text: `**Card stacks** (${total})\n\n${lines.join('\n')}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('list-stacks', e instanceof Error ? e.message : String(e)); }
  }

  private async handleUpdateStack(args: ArgsFor<'update-stack'>) {
    try {
      const data = await this.query<StackResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Stack Updated**\n\n**Changed:** ${(data.changedFields ?? []).join(', ')}\n\n${formatStack(data.stack)}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('update-stack', e instanceof Error ? e.message : String(e)); }
  }

  private async handleDeleteStack(args: ArgsFor<'delete-stack'>) {
    try {
      const data = await this.query<StackDeleteResponse>('cards', args);
      if (data.dryRun) {
        return { content: [{ type: 'text' as const, text: `**Delete preview (dryRun)**\n\n**Stack:** "${data.stackName}" \`${data.stackId}\`\n**Cards that would be removed:** ${data.embeddedCardCount}\n\nRe-run with confirm:true (no dryRun) to delete.` }], structuredContent: data as unknown as Record<string, unknown> };
      }
      return { content: [{ type: 'text' as const, text: `**Card Stack Deleted**\n\n**ID:** \`${data.stackId}\`\n**Cards removed:** ${data.deletedCardCount}\n\n⚠️ Permanent.` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('delete-stack', e instanceof Error ? e.message : String(e)); }
  }

  private async handleDuplicateStack(args: ArgsFor<'duplicate-stack'>) {
    try {
      const data = await this.query<StackResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Stack Duplicated**\n\n**Source:** \`${data.sourceId}\` → **New:** \`${data.id}\`\n\n${formatStack(data.stack)}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('duplicate-stack', e instanceof Error ? e.message : String(e)); }
  }

  // ── Card handlers ─────────────────────────────────────────────────────────

  private async handleAddCard(args: ArgsFor<'add-card'>) {
    try {
      const data = await this.query<CardResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Added**\n\n${formatCard(data.card)}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('add-card', e instanceof Error ? e.message : String(e)); }
  }

  private async handleGetCard(args: ArgsFor<'get-card'>) {
    try {
      const data = await this.query<CardResponse>('cards', args);
      const redactNote = data.redacted ? '\n\n_(faces redacted for the supplied perspective)_' : '';
      return { content: [{ type: 'text' as const, text: `${formatCard(data.card)}${redactNote}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('get-card', e instanceof Error ? e.message : String(e)); }
  }

  private async handleUpdateCard(args: ArgsFor<'update-card'>) {
    try {
      const data = await this.query<CardResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Updated**\n\n**Changed:** ${(data.changedFields ?? []).join(', ')}\n\n${formatCard(data.card)}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('update-card', e instanceof Error ? e.message : String(e)); }
  }

  private async handleDeleteCard(args: ArgsFor<'delete-card'>) {
    try {
      const data = await this.query<CardDeleteResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Deleted**\n\n**ID:** \`${data.deletedId}\` from stack \`${data.stackId}\`\n**Remaining cards:** ${data.remainingCardCount}\n\n⚠️ Permanent.` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('delete-card', e instanceof Error ? e.message : String(e)); }
  }

  private async handleListCards(args: ArgsFor<'list-cards'>) {
    try {
      const data = await this.query<CardListResponse>('cards', args);
      if (data.cards === undefined) {
        return { content: [{ type: 'text' as const, text: `**Card count**\n\n**Total:** ${data.total ?? 0}` }], structuredContent: data as unknown as Record<string, unknown> };
      }
      if (data.cards.length === 0) {
        return { content: [{ type: 'text' as const, text: '**No cards in stack**' }], structuredContent: data as unknown as Record<string, unknown> };
      }
      const lines = data.cards.map((c) => {
        const faceState = c.face === null ? 'face-down' : `face ${c.face}`;
        const facesPart = c.faceCount === undefined ? ' · _redacted_' : ` · ${c.faceCount} face(s)`;
        return `- \`${c.id}\` · "${c.name}" · ${faceState}${c.drawn ? ' · drawn' : ''}${facesPart}`;
      });
      return { content: [{ type: 'text' as const, text: `**Cards** (${data.total ?? data.cards.length})\n\n${lines.join('\n')}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('list-cards', e instanceof Error ? e.message : String(e)); }
  }

  private async handleFlipCard(args: ArgsFor<'flip-card'>) {
    try {
      const data = await this.query<FlipResponse>('cards', args);
      const state = data.face === null ? 'face-down (back shown)' : `face ${data.face}`;
      return { content: [{ type: 'text' as const, text: `**Card Flipped** → ${state}\n\n${formatCard(data.card)}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('flip-card', e instanceof Error ? e.message : String(e)); }
  }

  // ── Ops handlers ──────────────────────────────────────────────────────────

  private async handleShuffle(args: ArgsFor<'shuffle'>) {
    try {
      const data = await this.query<ShuffleResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Stack Shuffled**\n\n**Stack:** \`${data.stackId}\` · ${data.cardCount} card(s)` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('shuffle', e instanceof Error ? e.message : String(e)); }
  }

  private async handleRecall(args: ArgsFor<'recall'>) {
    try {
      const data = await this.query<RecallResponse>('cards', args);
      if (data.dryRun) {
        return { content: [{ type: 'text' as const, text: `**Recall preview (dryRun)**\n\n**Stack:** \`${data.stackId}\` (${data.stackType})\n**Cards held:** ${data.cardCount}\n**Projected return:** ${data.projectedReturn}\n\nRe-run with confirm:true (no dryRun) to recall.` }], structuredContent: data as unknown as Record<string, unknown> };
      }
      return { content: [{ type: 'text' as const, text: `**Stack Recalled**\n\n**Stack:** \`${data.stackId}\` (${data.stackType}) · now ${data.cardCount} card(s)` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('recall', e instanceof Error ? e.message : String(e)); }
  }

  // ── Movement handlers ─────────────────────────────────────────────────────

  private async handleDeal(args: ArgsFor<'deal'>) {
    try {
      const data = await this.query<DealResponse>('cards', args);
      if (data.dryRun) {
        return { content: [{ type: 'text' as const, text: `**Deal preview (dryRun)**\n\n**Deck:** \`${data.deckId}\` — ${data.sourceDeckCardCount} available\n**Hands:** ${data.destinationCount} × ${data.cardsPerHand} = ${(data.destinationCount ?? 0) * (data.cardsPerHand ?? 0)} cards\n**Deck after:** ${data.cardsAfterDeal}\n**Sufficient:** ${data.sufficient ? 'yes' : 'NO — would be rejected'}\n\nRe-run with confirm:true (no dryRun) to deal.` }], structuredContent: data as unknown as Record<string, unknown> };
      }
      const handLines = (data.hands ?? []).map((h) => `  - \`${h.stackId}\`: ${h.cardCount} card(s)`).join('\n');
      return { content: [{ type: 'text' as const, text: `**Cards Dealt**\n\n**Deck:** \`${data.deckId}\` · dealt ${data.dealt} · ${data.deckAvailableAfter} available after\n${handLines}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('deal', e instanceof Error ? e.message : String(e)); }
  }

  private async handleDraw(args: ArgsFor<'draw'>) {
    try {
      const data = await this.query<DrawResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Cards Drawn**\n\n**Hand:** \`${data.handId}\` drew ${data.drawnCount} from \`${data.deckId}\` (hand now ${data.handCardCount})\n**Drawn ids:** ${data.drawnCardIds.map((i) => `\`${i}\``).join(', ')}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('draw', e instanceof Error ? e.message : String(e)); }
  }

  private async handlePass(args: ArgsFor<'pass'>) {
    try {
      const data = await this.query<PassResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Cards Passed**\n\n\`${data.fromStackId}\` → \`${data.toStackId}\` · ${data.passedCount} card(s)\n**Passed ids:** ${data.passedCardIds.map((i) => `\`${i}\``).join(', ')}` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('pass', e instanceof Error ? e.message : String(e)); }
  }

  private async handlePlay(args: ArgsFor<'play'>) {
    try {
      const data = await this.query<PlayDiscardResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Played**\n\n\`${data.cardId}\` from \`${data.fromStackId}\` → \`${data.toStackId}\` (new id \`${data.newCardId}\`)` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('play', e instanceof Error ? e.message : String(e)); }
  }

  private async handleDiscard(args: ArgsFor<'discard'>) {
    try {
      const data = await this.query<PlayDiscardResponse>('cards', args);
      return { content: [{ type: 'text' as const, text: `**Card Discarded**\n\n\`${data.cardId}\` from \`${data.fromStackId}\` → \`${data.toStackId}\` (new id \`${data.newCardId}\`)` }], structuredContent: data as unknown as Record<string, unknown> };
    } catch (e) { return this.errorResponse('discard', e instanceof Error ? e.message : String(e)); }
  }
}
