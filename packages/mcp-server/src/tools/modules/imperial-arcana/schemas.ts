// wfrp_imperial_arcana Phase 7 — mcp-server typing aid for imperial-arcana.
//
// CCR-5: server-side schema is a typing aid ONLY — no .strict() on variants.
// The foundry-module handler owns .strict() + the actual security gate.

import { z } from 'zod';

export const ImperialArcanaToolInput = z.object({
  action: z.enum(['draw-reading', 'record-reading', 'search-omens', 'recall-callbacks']),
  spread: z.string().optional(),
  question: z.string().optional(),
  numerals: z.array(z.number().int()).optional(),
  dominantOmen: z.number().int().nullable().optional(),
  linkedUuids: z.array(z.string()).optional(),
  linkedUuid: z.string().optional(),
  session: z.string().optional(),
  date: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  journalId: z.string().optional(),
  limit: z.number().int().optional(),
});

export type ImperialArcanaToolInputType = z.infer<typeof ImperialArcanaToolInput>;
