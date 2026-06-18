// Foundry document type-name literals used in foundry-module RUNTIME calls
// (PRD MCP Code-Quality Hardening — Phase 13, R13.2).
//
// Foundry identifies document classes by these `documentName` string literals
// (`getDocumentClass('Actor')`, `pack.metadata.type === 'Actor'`, etc.). Centralizing
// the foundry-module runtime set here removes the scattered bare-string literals.
//
// SCOPE: foundry-module runtime only. The mcp-server package keeps its own Zod
// `z.enum([...])` arrays (a different representation, and no import path
// foundry-module → mcp-server exists — both import from `@foundry-mcp/shared`,
// not each other). A `shared/`-level doc-types primitive is deferred to v2.

export const FOUNDRY_DOCUMENT_TYPES = {
  ACTOR: 'Actor',
  ITEM: 'Item',
  SCENE: 'Scene',
  JOURNAL_ENTRY: 'JournalEntry',
  MACRO: 'Macro',
  ROLL_TABLE: 'RollTable',
  PLAYLIST: 'Playlist',
  CARDS: 'Cards',
  USER: 'User',
  FOLDER: 'Folder',
  CHAT_MESSAGE: 'ChatMessage',
  // Scene-embedded placeables addressed by documentName at runtime.
  TOKEN: 'Token',
  WALL: 'Wall',
  NOTE: 'Note',
  TILE: 'Tile',
  DRAWING: 'Drawing',
  REGION: 'Region',
  AMBIENT_LIGHT: 'AmbientLight',
  AMBIENT_SOUND: 'AmbientSound',
  MEASURED_TEMPLATE: 'MeasuredTemplate',
} as const;

export type FoundryDocumentType =
  (typeof FOUNDRY_DOCUMENT_TYPES)[keyof typeof FOUNDRY_DOCUMENT_TYPES];
