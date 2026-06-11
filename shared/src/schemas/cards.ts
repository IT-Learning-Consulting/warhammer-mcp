// Phase 7 mcp_coverage_expansion — `cards` umbrella schema.
//
// Cards (deck/hand/pile) + embedded Card CRUD + gameplay verbs over game.cards.
// Two-level: a Cards "stack" is a WORLD-collection document (game.cards); each stack
// owns an embedded Card collection (stack.cards). Mirrors the playlist+sound shape.
//
// Three traps (research memo 08_cards_contract.md):
//   1. Face-down redaction: a card is face-down when `face === null`. Foundry does NOT
//      strip `faces[]` from non-owners. get-card / list-cards take an optional
//      `perspectiveUserId`; when supplied the handler strips `faces[]` for face-down
//      cards that user does not OWN. No param → GM sees all (the MCP connection is GM).
//   2. `recall` (NOT `reset`): Cards#recall is the gameplay return-cards op; Cards#reset
//      is a non-persistent DataModel reset and is intentionally NOT exposed.
//   3. Non-transactional deal: handler pre-validates availableCards count, early-throws,
//      and does NOT roll back on partial failure.
//
// CCR-4: deal / recall / delete-stack carry `dryRun` (preview, no write) + `confirm:z.literal(true)`
// (plain literal — GM-only, no CSRF token; mirrors cross-doc-fk repair-orphans).
// `how` is a friendly enum (top/bottom/random) mapped to CONST.CARD_DRAW_MODES (0/1/2) at the
// handler boundary (the drawing word↔code idiom). `chatNotification` defaults OFF (notify.* toast
// covers GM feedback; opt in to broadcast a deal to the table).
//
// Thin primitive (HC1 / CCR-3): no CONFIG reads, no game-rule logic.

import { z } from 'zod';

const FOUNDRY_ID = z.string().min(1);
const STACK_TYPE = z.enum(['deck', 'hand', 'pile']);
const DRAW_MODE = z.enum(['top', 'bottom', 'random']);
// DocumentOwnershipField: { userId | "default": level(0-3) }.
const OWNERSHIP = z.record(z.number().int().min(0).max(3));

// CardFaceData sub-schema (faces[] entries + back).
const CardFaceInput = z
  .object({
    name: z.string().optional(),
    img: z.string().optional(),
    text: z.string().optional(),
  })
  .strict();

// ── Stack writable surface ────────────────────────────────────────────────────
const StackWritableFields = {
  name: z.string().optional(),
  description: z.string().optional(),
  img: z.string().optional(),
  displayCount: z.boolean().optional(),
  ownership: OWNERSHIP.optional(),
  folder: z.string().nullable().optional(),
  sort: z.number().int().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
  flags: z.record(z.unknown()).optional(),
};

// ── Card writable surface ─────────────────────────────────────────────────────
const CardWritableFields = {
  name: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  suit: z.string().optional(),
  value: z.number().optional(),
  faces: z.array(CardFaceInput).optional(),
  // face: null = face-down (back shown); number = index of shown face.
  face: z.number().int().nullable().optional(),
  back: CardFaceInput.optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
  sort: z.number().int().optional(),
  flags: z.record(z.unknown()).optional(),
};

// ── Stack actions (6) ─────────────────────────────────────────────────────────

export const CardsCreateStackInput = z
  .object({
    action: z.literal('create-stack'),
    ...StackWritableFields,
    // required overrides — must follow the spread (StackWritableFields.name is optional).
    name: z.string().min(1),
    type: STACK_TYPE,
  })
  .strict();

export const CardsGetStackInput = z
  .object({
    action: z.literal('get-stack'),
    stackId: FOUNDRY_ID,
  })
  .strict();

export const CardsListStacksInput = z
  .object({
    action: z.literal('list-stacks'),
    type: STACK_TYPE.optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const CardsUpdateStackInput = z
  .object({
    action: z.literal('update-stack'),
    stackId: FOUNDRY_ID,
    changes: z
      .object(StackWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'CARDS_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const CardsDeleteStackInput = z
  .object({
    action: z.literal('delete-stack'),
    stackId: FOUNDRY_ID,
    confirm: z.literal(true),
    dryRun: z.boolean().default(false),
  })
  .strict();

export const CardsDuplicateStackInput = z
  .object({
    action: z.literal('duplicate-stack'),
    stackId: FOUNDRY_ID,
  })
  .strict();

// ── Card actions (6) ──────────────────────────────────────────────────────────

export const CardsAddCardInput = z
  .object({
    action: z.literal('add-card'),
    stackId: FOUNDRY_ID,
    ...CardWritableFields,
    // required override — must follow the spread (CardWritableFields.name is optional).
    name: z.string().min(1),
  })
  .strict();

export const CardsGetCardInput = z
  .object({
    action: z.literal('get-card'),
    stackId: FOUNDRY_ID,
    cardId: FOUNDRY_ID,
    // Trap 1 — evaluate face-down redaction from this user's perspective. Omit → GM sees all.
    perspectiveUserId: z.string().optional(),
  })
  .strict();

export const CardsUpdateCardInput = z
  .object({
    action: z.literal('update-card'),
    stackId: FOUNDRY_ID,
    cardId: FOUNDRY_ID,
    changes: z
      .object(CardWritableFields)
      .strict()
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'CARDS_EMPTY_PAYLOAD: changes object must contain at least one field',
      }),
  })
  .strict();

export const CardsDeleteCardInput = z
  .object({
    action: z.literal('delete-card'),
    stackId: FOUNDRY_ID,
    cardId: FOUNDRY_ID,
  })
  .strict();

export const CardsListCardsInput = z
  .object({
    action: z.literal('list-cards'),
    stackId: FOUNDRY_ID,
    perspectiveUserId: z.string().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
    countOnly: z.boolean().optional(),
  })
  .strict();

export const CardsFlipCardInput = z
  .object({
    action: z.literal('flip-card'),
    stackId: FOUNDRY_ID,
    cardId: FOUNDRY_ID,
    // null = flip to back (face-down); number = flip to that face index. Omit → toggle (Card#flip()).
    face: z.number().int().nullable().optional(),
  })
  .strict();

// ── Ops (2) ───────────────────────────────────────────────────────────────────

export const CardsShuffleInput = z
  .object({
    action: z.literal('shuffle'),
    stackId: FOUNDRY_ID,
    chatNotification: z.boolean().default(false),
  })
  .strict();

export const CardsRecallInput = z
  .object({
    action: z.literal('recall'),
    stackId: FOUNDRY_ID,
    confirm: z.literal(true),
    dryRun: z.boolean().default(false),
    chatNotification: z.boolean().default(false),
  })
  .strict();

// ── Movement (5) ──────────────────────────────────────────────────────────────

export const CardsDealInput = z
  .object({
    action: z.literal('deal'),
    deckId: FOUNDRY_ID,
    handIds: z.array(FOUNDRY_ID).min(1),
    number: z.number().int().min(1).default(1),
    how: DRAW_MODE.default('top'),
    confirm: z.literal(true),
    dryRun: z.boolean().default(false),
    chatNotification: z.boolean().default(false),
  })
  .strict();

export const CardsDrawInput = z
  .object({
    action: z.literal('draw'),
    handId: FOUNDRY_ID,
    deckId: FOUNDRY_ID,
    number: z.number().int().min(1).default(1),
    how: DRAW_MODE.default('top'),
    chatNotification: z.boolean().default(false),
  })
  .strict();

export const CardsPassInput = z
  .object({
    action: z.literal('pass'),
    stackId: FOUNDRY_ID,
    toStackId: FOUNDRY_ID,
    cardIds: z.array(FOUNDRY_ID).min(1),
    chatNotification: z.boolean().default(false),
  })
  .strict();

export const CardsPlayInput = z
  .object({
    action: z.literal('play'),
    stackId: FOUNDRY_ID,
    cardId: FOUNDRY_ID,
    toStackId: FOUNDRY_ID,
    chatNotification: z.boolean().default(false),
  })
  .strict();

export const CardsDiscardInput = z
  .object({
    action: z.literal('discard'),
    stackId: FOUNDRY_ID,
    cardId: FOUNDRY_ID,
    toStackId: FOUNDRY_ID,
    chatNotification: z.boolean().default(false),
  })
  .strict();

// ── Umbrella union ──────────────────────────────────────────────────────────
// discriminatedUnion on `action` — every member is a plain strict ZodObject (the inner
// `changes.refine()` lives on a NESTED object, not the member, so the union stays valid;
// Phase 4 fact: discriminatedUnion rejects a member that is itself a ZodEffects).
export const CardsToolInput = z.discriminatedUnion('action', [
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
]);

export type CardsToolInputType = z.infer<typeof CardsToolInput>;

// ── View models (CCR-Envelope-Consumer: concrete typed, no `<any>`) ──────────

export interface CardFaceView {
  name: string | null;
  img: string | null;
  text: string | null;
}

export interface CardView {
  id: string;
  stackId: string;
  name: string;
  type: string;
  description: string;
  suit: string | null;
  value: number | null;
  // Omitted (undefined) when redacted for a non-owner perspective on a face-down card.
  faces?: CardFaceView[];
  face: number | null;
  back: CardFaceView;
  drawn: boolean;
  origin: string | null;
  sort: number;
  flags: Record<string, unknown>;
}

export interface CardListItem {
  id: string;
  stackId: string;
  name: string;
  face: number | null;
  drawn: boolean;
  // Omitted when redacted (face-down + non-owner perspective).
  faceCount?: number;
}

export interface CardsStackView {
  id: string;
  name: string;
  type: string;
  description: string;
  img: string | null;
  displayCount: boolean;
  ownership: Record<string, number>;
  folder: string | null;
  sort: number;
  width: number;
  height: number;
  rotation: number;
  flags: Record<string, unknown>;
  cardCount: number;
  availableCount: number;
  drawnCount: number;
}

export interface CardsStackListItem {
  id: string;
  name: string;
  type: string;
  cardCount: number;
  folder: string | null;
}
