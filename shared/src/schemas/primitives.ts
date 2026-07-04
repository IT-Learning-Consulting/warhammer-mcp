// Shared Zod primitives (PRD MCP Code-Quality Hardening — Phase 13, R13.3).
//
// FOUNDRY_ID is the canonical *polymorphic* (un-branded) Foundry document-id
// primitive: a plain non-empty string used for fields that genuinely hold an id
// of more than one document type (`documentId`, `sourceDocId`, echoed
// `newId`/`oldId`/`deletedId`, etc.). An umbrella brand would falsely imply
// cross-type substitutability — see the POLYMORPHIC note in `branded-ids.ts`.
//
// Type-specific ids stay branded in `branded-ids.ts`; branded ids intentionally
// inline `z.string().min(1)` rather than composing this primitive (the brand IS
// the distinguishing value). This module owns only the un-branded variant, which
// before Phase 13 was redeclared byte-identically across four schema files.

import { z } from 'zod';

/** Polymorphic (un-branded) Foundry document id — a non-empty string. */
export const FOUNDRY_ID = z.string().min(1);

// ── Pagination factories (mcp_code_quality_v2 Phase C2, task 5.3 — D2) ─────────────────────────
//
// FACTORY FUNCTIONS, deliberately NOT shared Zod instances: a single shared instance referenced
// from multiple schemas makes zodToJsonSchema emit unresolvable `$ref`s (the same constraint that
// keeps targets.ts/item-target.ts non-DRY — see the C2 plan Design Decisions). Each call returns
// FRESH field fragments for spreading into a `.strict()` object.
//
// Two shapes exist in the wild (both centralized here):
//   - optional form (15 files): `page?/pageSize?` — list actions where pagination is opt-in.
//   - defaulted form (2 files: chat-message, cross-doc-fk): `.default()`-carrying — actions where
//     the handler always paginates and the schema supplies the defaults.
// `countOnly` stays per-site — not all list schemas carry it.

/** Opt-in pagination pair: `page?: int ≥1`, `pageSize?: int 1..maxPageSize`. */
export function paginationFields(maxPageSize = 100) {
  return {
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(maxPageSize).optional(),
  };
}

/** Always-on pagination pair with defaults: `page: int ≥1 =1`, `pageSize: int 1..max =default`. */
export function paginationFieldsDefaulted(maxPageSize: number, defaultPageSize: number) {
  return {
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(maxPageSize).default(defaultPageSize),
  };
}
