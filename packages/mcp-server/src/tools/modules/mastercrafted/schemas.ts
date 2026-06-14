// Module Integration v1 Phase 14 — module-mastercrafted mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

import { UserId } from '@foundry-mcp/shared';

export interface RecipeSummary {
  bookName: string;
  recipeName: string;
  pageUuid: string;
  time: number | null;
  ingredients: string[];
  products: string[];
}

export interface ListRecipesResult {
  count: number;
  recipes: RecipeSummary[];
}

export interface GetRecipeResult {
  pageUuid: string;
  name: string;
  bookName?: string;
  mastercrafted: Record<string, unknown>;
}

export interface CheckCraftableResult {
  pageUuid: string;
  name: string;
  canCraft: boolean;
  detail: unknown;
}

export interface PendingCraft {
  actorName: string;
  actorUuid: string;
  craftId: string; // not a branded id (polymorphic / non-document)
  resolveAt: number;
  remainingSeconds: number;
  itemsToDeliver: string[];
  ready: boolean;
}

export interface ListPendingResult {
  count: number;
  pending: PendingCraft[];
}

export interface ExecuteCraftResult {
  pageUuid: string;
  recipeName: string;
  actorUuid: string;
  timed: boolean;
  pendingCraftIds: string[]; // not a branded id (polymorphic / non-document)
  quantityPathFixed: boolean;
  quantityPathWarning?: string;
  products: string[];
}

export interface ProcessDelayedResult {
  actorsProcessed: number;
  resolved: number;
  perActor: { actorName: string; resolved: number }[];
}

export interface GrantDiscoveryResult {
  pageUuid: string;
  name: string;
  userId: UserId;
  level: number;
}

// Phase 14 full-functionality expansion.
export interface SearchResult {
  query: string;
  count: number;
  recipes: { name: string; pageUuid: string; ingredients: string[]; products: string[] }[];
}

export interface GetBookResult {
  bookUuid: string;
  name: string;
  book: Record<string, unknown>;
  recipeCount: number;
}

export interface GenericMastercraftedResult {
  [k: string]: unknown;
}
