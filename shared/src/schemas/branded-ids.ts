// Branded Foundry document-ID types (PRD MCP Code-Quality Hardening — Phase 1, R1.1/R1.2, CCR-Branded-ID).
//
// Every Foundry document ID is, on the wire, a plain string. Branding them at the
// Zod layer makes an ActorId and a TokenId *distinct* TypeScript types so a caller
// cannot pass the wrong id-class into the wrong tool/handler and have the compiler
// stay silent.
//
// RUNTIME-ZERO: Zod's `.brand<'X'>()` is a pure compile-time phantom
// (node_modules/zod/v3/types.js:3453-3467 — `ZodBranded._parse` delegates 100% to the
// inner type and returns the value byte-identical; the brand symbol is never written
// onto the value). The base `.min(1)` runtime check is preserved. The branded type is a
// *subtype* of `string`, so a branded id flows OUTWARD into string-typed Foundry APIs
// (`game.actors.get(id)`, `fromUuid(id)`) for free; only the reverse (plain string →
// branded slot) is a compile error — exactly the bug seam we want to close.
//
// IDIOM (const + type, same name — TS keeps value & type namespaces separate):
//   export const ActorId = z.string().min(1).brand<'ActorId'>();
//   export type  ActorId = z.infer<typeof ActorId>;
// `.optional()`, `.nullable()`, and `z.array(ActorId)` all preserve the brand.
//
// POLYMORPHIC IDs ARE NOT BRANDED. Fields that genuinely hold an id of more than one
// document type (`documentId`, `sourceDocId`, `parentId` on conditions, `docId`, `refId`,
// `newId`/`oldId`/`deletedId` echoes, etc.) stay bare `z.string().min(1)` with a comment
// at the use site — an umbrella "WorldDocumentId" brand would falsely imply cross-type
// substitutability.
//
// FOUNDRY_ID is intentionally NOT exported here. Phase 1 migrated ~19 of the original
// local `const FOUNDRY_ID` redeclarations to named brands; the 4 genuinely-polymorphic
// ones that remained were centralized into the shared `FOUNDRY_ID` primitive in
// `primitives.ts` in PRD Phase 13 (R13.3). Branded ids still inline `z.string().min(1)`
// — the brand is the distinguishing value, so they do NOT compose the primitive.

import { z } from 'zod';

// ── Core world/scene documents ────────────────────────────────────────────────
export const ActorId = z.string().min(1).brand<'ActorId'>();
export type ActorId = z.infer<typeof ActorId>;

export const ItemId = z.string().min(1).brand<'ItemId'>();
export type ItemId = z.infer<typeof ItemId>;

export const SceneId = z.string().min(1).brand<'SceneId'>();
export type SceneId = z.infer<typeof SceneId>;

export const TokenId = z.string().min(1).brand<'TokenId'>();
export type TokenId = z.infer<typeof TokenId>;

export const FolderId = z.string().min(1).brand<'FolderId'>();
export type FolderId = z.infer<typeof FolderId>;

export const UserId = z.string().min(1).brand<'UserId'>();
export type UserId = z.infer<typeof UserId>;

export const MacroId = z.string().min(1).brand<'MacroId'>();
export type MacroId = z.infer<typeof MacroId>;

// ── Journals ──────────────────────────────────────────────────────────────────
export const JournalEntryId = z.string().min(1).brand<'JournalEntryId'>();
export type JournalEntryId = z.infer<typeof JournalEntryId>;

export const JournalEntryPageId = z.string().min(1).brand<'JournalEntryPageId'>();
export type JournalEntryPageId = z.infer<typeof JournalEntryPageId>;

export const JournalCategoryId = z.string().min(1).brand<'JournalCategoryId'>();
export type JournalCategoryId = z.infer<typeof JournalCategoryId>;

// ── Tables ──────────────────────────────────────────────────────────────────
export const RollTableId = z.string().min(1).brand<'RollTableId'>();
export type RollTableId = z.infer<typeof RollTableId>;

export const TableResultId = z.string().min(1).brand<'TableResultId'>();
export type TableResultId = z.infer<typeof TableResultId>;

// ── Combat ──────────────────────────────────────────────────────────────────
export const CombatId = z.string().min(1).brand<'CombatId'>();
export type CombatId = z.infer<typeof CombatId>;

export const CombatantId = z.string().min(1).brand<'CombatantId'>();
export type CombatantId = z.infer<typeof CombatantId>;

// ── Audio ──────────────────────────────────────────────────────────────────
export const PlaylistId = z.string().min(1).brand<'PlaylistId'>();
export type PlaylistId = z.infer<typeof PlaylistId>;

// PlaylistSound (embedded in a Playlist) vs AmbientSound (a scene placeable) share the
// field name `soundId` in different files — branded by file context, never interchanged.
export const PlaylistSoundId = z.string().min(1).brand<'PlaylistSoundId'>();
export type PlaylistSoundId = z.infer<typeof PlaylistSoundId>;

export const AmbientSoundId = z.string().min(1).brand<'AmbientSoundId'>();
export type AmbientSoundId = z.infer<typeof AmbientSoundId>;

// ── Scene placeables ──────────────────────────────────────────────────────────
export const AmbientLightId = z.string().min(1).brand<'AmbientLightId'>();
export type AmbientLightId = z.infer<typeof AmbientLightId>;

export const NoteId = z.string().min(1).brand<'NoteId'>();
export type NoteId = z.infer<typeof NoteId>;

export const TileId = z.string().min(1).brand<'TileId'>();
export type TileId = z.infer<typeof TileId>;

export const DrawingId = z.string().min(1).brand<'DrawingId'>();
export type DrawingId = z.infer<typeof DrawingId>;

export const MeasuredTemplateId = z.string().min(1).brand<'MeasuredTemplateId'>();
export type MeasuredTemplateId = z.infer<typeof MeasuredTemplateId>;

// mcp_code_quality_v2 Phase C2 (task 3.2) — Wall document id (doors are Walls; needed by the
// promoted levels + perceptive module schemas' wallId/doorId fields).
export const WallId = z.string().min(1).brand<'WallId'>();
export type WallId = z.infer<typeof WallId>;

export const RegionId = z.string().min(1).brand<'RegionId'>();
export type RegionId = z.infer<typeof RegionId>;

export const RegionBehaviorId = z.string().min(1).brand<'RegionBehaviorId'>();
export type RegionBehaviorId = z.infer<typeof RegionBehaviorId>;

// ── Effects / chat / cards ────────────────────────────────────────────────────
export const ActiveEffectId = z.string().min(1).brand<'ActiveEffectId'>();
export type ActiveEffectId = z.infer<typeof ActiveEffectId>;

export const ChatMessageId = z.string().min(1).brand<'ChatMessageId'>();
export type ChatMessageId = z.infer<typeof ChatMessageId>;

// `Cards` is the stack document (deck/hand/pile); `Card` is a single card within it.
export const CardsId = z.string().min(1).brand<'CardsId'>();
export type CardsId = z.infer<typeof CardsId>;

export const CardId = z.string().min(1).brand<'CardId'>();
export type CardId = z.infer<typeof CardId>;

// ── Non-document id classes (distinct, still worth their own brand) ─────────────
// A Foundry UUID ("Compendium.pack.Type.id" / "Scene.x.Token.y") — a 3-to-5-segment
// path, NOT a 16-char document id. One brand prevents id↔uuid mixing.
export const FoundryUuid = z.string().min(1).brand<'FoundryUuid'>();
export type FoundryUuid = z.infer<typeof FoundryUuid>;

// A compendium pack id ("wfrp4e-core.actors") — dotted, NOT a document id.
export const PackId = z.string().min(1).brand<'PackId'>();
export type PackId = z.infer<typeof PackId>;
