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
