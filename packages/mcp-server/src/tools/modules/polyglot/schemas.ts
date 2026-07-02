// Module Integration v2 Phase 9 — module-polyglot mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool layer
// only needs typed response shapes for this.query<T> (DP-15 — never <any>).
//
// Polyglot v2.8.2. 9 actions across 3 write/verify shapes. Each handler return carries `action` as a
// discriminant; PolyglotResult is their union so the tool stays typed without <any>.

export interface PolyglotListWorldLanguagesEntry {
  key: string;
  label: string;
  font: string | null;
}

export interface PolyglotListWorldLanguagesResult {
  action: 'list-world-languages';
  count: number;
  languages: PolyglotListWorldLanguagesEntry[];
  note?: string;
}

export interface PolyglotCheckKnowsLanguageResult {
  action: 'check-knows-language';
  entityId: string;
  language: string;
  knows: boolean;
  known: string[];
}

export interface PolyglotCheckLiteracyResult {
  action: 'check-literacy';
  entityId: string;
  literate: boolean;
  literateLanguages: string[];
}

export interface PolyglotSendInLanguageResult {
  action: 'send-in-language';
  messageId: string;
  language: string;
}

export interface PolyglotGrantLanguageResult {
  action: 'grant-language';
  entityId: string;
  language: string;
  key: string;
  alreadyKnown: boolean;
  itemId: string;
  source?: 'compendium' | 'builtin' | 'homebrew';
}

export interface PolyglotRevokeLanguageResult {
  action: 'revoke-language';
  entityId: string;
  language: string;
  key: string;
  deleted: true;
  count: number;
}

export interface PolyglotGrantLiteracyResult {
  action: 'grant-literacy';
  entityId: string;
  alreadyKnown: boolean;
  itemId: string;
}

export interface PolyglotRevokeLiteracyResult {
  action: 'revoke-literacy';
  entityId: string;
  deleted: true;
  count: number;
}

export interface PolyglotTagJournalPageResult {
  action: 'tag-journal-page';
  pageUuid: string;
  language: string;
  tagged: true;
}

export type PolyglotResult =
  | PolyglotListWorldLanguagesResult
  | PolyglotCheckKnowsLanguageResult
  | PolyglotCheckLiteracyResult
  | PolyglotSendInLanguageResult
  | PolyglotGrantLanguageResult
  | PolyglotRevokeLanguageResult
  | PolyglotGrantLiteracyResult
  | PolyglotRevokeLiteracyResult
  | PolyglotTagJournalPageResult;

// ── The action enum (mirrors the foundry-module discriminatedUnion literals; 9 actions) ──

export const POLYGLOT_ACTIONS = [
  'list-world-languages',
  'check-knows-language',
  'check-literacy',
  'send-in-language',
  'grant-language',
  'grant-literacy',
  'tag-journal-page',
  'revoke-language',
  'revoke-literacy',
] as const;

export type PolyglotAction = (typeof POLYGLOT_ACTIONS)[number];
