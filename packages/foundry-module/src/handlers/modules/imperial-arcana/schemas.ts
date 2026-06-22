// Imperial Arcana Phase 7 — package-local Zod input schemas (foundry-module side).
//
// CCR-5: module-specific schemas stay package-local (not in @foundry-mcp/shared).
// `.strict()` per variant rejects unknown keys at the security boundary.
//
// 4 actions (PRD R18 / mcp-surface.md §Recommended-approach):
//   - draw-reading     { spread, question?, numerals? }                   READ-ONLY (no world write)
//   - record-reading   { spread, numerals[], question?, dominantOmen?,    WRITE (the only one)
//                        linkedUuids?, session?, date?, journalId? }
//   - search-omens     { numerals?, spread?, linkedUuids?, dateFrom?, dateTo? }   READ
//   - recall-callbacks { linkedUuid, limit? }                            READ

import { z } from 'zod';
import { JournalEntryId } from '@foundry-mcp/shared';

const SPREAD_KEY = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']);
const NUMERAL = z.number().int().min(0).max(35);
// ISO yyyy-mm-dd (the CCR-10 record `date` format).
const ISO_DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be ISO yyyy-mm-dd');

export const ImperialArcanaInput = z.discriminatedUnion('action', [
  // draw-reading — lay a spread read-only (select N distinct numerals → positions).
  z.object({
    action: z.literal('draw-reading'),
    spread: SPREAD_KEY,
    question: z.string().optional(),
    // Optional inline / physical reading: supply the already-dealt numerals (in position order)
    // instead of drawing random ones. Length must equal the spread's positionCount and the
    // numerals must be distinct (a deck lays distinct cards) — both validated in the handler.
    // Omit to draw a fresh random spread (the default live-mode behaviour).
    numerals: z.array(NUMERAL).optional(),
  }).strict(),

  // record-reading — write a CCR-10 Reading Record (or annotate an existing one via journalId).
  z.object({
    action: z.literal('record-reading'),
    spread: SPREAD_KEY,
    numerals: z.array(NUMERAL).min(1),
    question: z.string().optional(),
    dominantOmen: NUMERAL.nullable().optional(),
    linkedUuids: z.array(z.string().min(1)).optional(),
    session: z.string().optional(),
    date: ISO_DATE.optional(),
    journalId: JournalEntryId.optional(),
  }).strict(),

  // search-omens — list + filter reading records in TS.
  z.object({
    action: z.literal('search-omens'),
    numerals: z.array(NUMERAL).optional(),
    spread: SPREAD_KEY.optional(),
    linkedUuids: z.array(z.string().min(1)).optional(),
    dateFrom: ISO_DATE.optional(),
    dateTo: ISO_DATE.optional(),
  }).strict(),

  // recall-callbacks — records linked to one entity UUID, newest-first.
  z.object({
    action: z.literal('recall-callbacks'),
    linkedUuid: z.string().min(1),
    limit: z.number().int().min(1).max(100).optional(),
  }).strict(),
]);

export type ImperialArcanaInputType = z.infer<typeof ImperialArcanaInput>;
