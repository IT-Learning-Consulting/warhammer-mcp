// Phase 1 — Polymorphic ownership input schemas.
// PRD: mcp_crud_expansion v1, Phase 1. Replaces the actor-only
// SetActorOwnershipInput / GetActorOwnershipInput surface (those remain
// exported from ./actor.ts with @deprecated for the deprecation wrappers).
//
// Anchors:
//   ADR-024 — Folder write-rejected (BaseFolder has no `ownership` field).
//   ADR-025 — Bulk per-class atomic + cross-class best-effort `per_class` envelope.
//   ADR-026 — Reject Compendium UUIDs, META levels (-10/-20), `-1 INHERIT` on `default`.
//
// Level integer convention (matches CONST/variables/DOCUMENT_OWNERSHIP_LEVELS.md):
//   -1 = INHERIT, 0 = NONE, 1 = LIMITED, 2 = OBSERVER, 3 = OWNER.
//   META levels (-10 NOCHANGE, -20 DEFAULT) are UI sentinels — never accepted.

import { z } from 'zod';
import { FoundryUuid, UserId } from './branded-ids.js';

// All 7 doc types Phase 1 accepts on the polymorphic surface. Folder is
// read-allowed but write-rejected per ADR-024 (handler / single-target schemas
// surface this; bulk schema parses through and handler reports per-class).
export const DocumentTypeEnum = z.enum([
  'actor',
  'item',
  'journal',
  'scene',
  'rolltable',
  'folder',
  'macro',
]);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

// Shared target shape: documentType + exactly one of uuid / id / name.
const DocumentTargetShape = {
  documentType: DocumentTypeEnum,
  uuid: FoundryUuid.optional(),
  id: z.string().optional(), // polymorphic: not branded (Phase 1 design)
  name: z.string().optional(),
};

// Per-target validation: identifier present + reject Compendium UUIDs.
// Used by both single-target schemas and per-target inside bulk.
function checkTargetIdentifier(
  v: { uuid?: string | undefined; id?: string | undefined; name?: string | undefined },
  ctx: z.RefinementCtx,
  path: (string | number)[] = []
): void {
  if (!v.uuid && !v.id && !v.name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'OWNERSHIP_NO_IDENTIFIER: one of uuid, id, or name is required to identify the document',
      path,
    });
  }
  if (v.uuid && v.uuid.startsWith('Compendium.')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'OWNERSHIP_COMPENDIUM_NOT_SUPPORTED: Compendium-sourced UUIDs are not supported in Phase 1 (Phase 9 will add pack-document ownership)',
      path: [...path, 'uuid'],
    });
  }
}

// Per-user level: { -1, 0, 1, 2, 3 }. META reject is explicit, INHERIT allowed.
function checkPerUserLevel(level: number, ctx: z.RefinementCtx, path: (string | number)[] = ['level']): void {
  if (level === -10 || level === -20) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `OWNERSHIP_META_LEVEL_FORBIDDEN: META levels -10 (NOCHANGE) and -20 (DEFAULT) are UI-only sentinels and may not be persisted (received: ${level})`,
      path,
    });
    return;
  }
  if (![-1, 0, 1, 2, 3].includes(level)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `OWNERSHIP_INVALID_LEVEL: level must be -1 (INHERIT) | 0 (NONE) | 1 (LIMITED) | 2 (OBSERVER) | 3 (OWNER) (received: ${level})`,
      path,
    });
  }
}

// Default level: { 0, 1, 2, 3 }. -1 INHERIT explicitly invalid for the
// `default` key per ADR-026 (default is the terminal fallback).
function checkDefaultLevel(level: number, ctx: z.RefinementCtx, path: (string | number)[] = ['level']): void {
  if (level === -10 || level === -20) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `OWNERSHIP_META_LEVEL_FORBIDDEN: META levels -10 (NOCHANGE) and -20 (DEFAULT) are UI-only sentinels and may not be persisted (received: ${level})`,
      path,
    });
    return;
  }
  if (level === -1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'OWNERSHIP_INVALID_DEFAULT_INHERIT: -1 (INHERIT) is not valid for the `default` key; default is the terminal fallback and has no upstream to inherit from',
      path,
    });
    return;
  }
  if (![0, 1, 2, 3].includes(level)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `OWNERSHIP_INVALID_LEVEL: default-level must be 0 (NONE) | 1 (LIMITED) | 2 (OBSERVER) | 3 (OWNER) (received: ${level})`,
      path,
    });
  }
}

// Exactly one of userId / default:true must be present on write-payloads.
function checkUserOrDefault(
  v: { userId?: string | undefined; default?: boolean | undefined },
  ctx: z.RefinementCtx
): 'user' | 'default' | null {
  const hasUser = Boolean(v.userId);
  const hasDefault = v.default === true;
  if (hasUser && hasDefault) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'OWNERSHIP_USERID_AND_DEFAULT_CONFLICT: provide either userId (per-user grant) or default:true (default-level update), not both',
    });
    return null;
  }
  if (!hasUser && !hasDefault) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'OWNERSHIP_USERID_OR_DEFAULT_REQUIRED: provide userId (per-user grant) or default:true (default-level update)',
    });
    return null;
  }
  return hasUser ? 'user' : 'default';
}

// SetDocumentOwnershipInput — single-target write. Folder is rejected here
// per ADR-024 (single-target writes have no per-class semantics).
export const SetDocumentOwnershipInput = z
  .object({
    ...DocumentTargetShape,
    userId: UserId.optional(),
    default: z.boolean().optional(),
    level: z.number().int(),
  })
  .strict()
  .superRefine((v, ctx) => {
    checkTargetIdentifier(v, ctx);
    if (v.documentType === 'folder') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'OWNERSHIP_FOLDER_NOT_SUPPORTED: BaseFolder has no `ownership` field; Folder visibility is governed by USER_ROLES + visibility-of-contained-docs (ADR-024). Grant ownership on individual contained documents instead.',
        path: ['documentType'],
      });
    }
    const mode = checkUserOrDefault(v, ctx);
    if (mode === 'user') checkPerUserLevel(v.level, ctx);
    else if (mode === 'default') checkDefaultLevel(v.level, ctx);
  });
export type SetDocumentOwnershipInputType = z.infer<typeof SetDocumentOwnershipInput>;

// GetDocumentOwnershipInput — single-target read. Folder is accepted; handler
// returns `{ownership: null, reason: "folder_no_ownership_field"}`.
export const GetDocumentOwnershipInput = z
  .object({
    ...DocumentTargetShape,
  })
  .strict()
  .superRefine((v, ctx) => {
    checkTargetIdentifier(v, ctx);
  });
export type GetDocumentOwnershipInputType = z.infer<typeof GetDocumentOwnershipInput>;

// BulkSetDocumentOwnershipInput — multi-target write. ADR-025: per-class atomic
// via Foundry's static `<Class>.updateDocuments`; cross-class best-effort with
// `per_class` envelope. Folder targets are NOT rejected at the schema level
// (the handler reports them in per_class[folder].failed so the non-Folder
// classes still ship — that is the point of the per_class envelope).
const BulkTargetSchema = z.object(DocumentTargetShape).strict();

export const BulkSetDocumentOwnershipInput = z
  .object({
    targets: z.array(BulkTargetSchema).min(1),
    userId: UserId.optional(),
    default: z.boolean().optional(),
    level: z.number().int(),
  })
  .strict()
  .superRefine((v, ctx) => {
    v.targets.forEach((t, i) => {
      checkTargetIdentifier(t, ctx, ['targets', i]);
    });
    const mode = checkUserOrDefault(v, ctx);
    if (mode === 'user') checkPerUserLevel(v.level, ctx);
    else if (mode === 'default') checkDefaultLevel(v.level, ctx);
  });
export type BulkSetDocumentOwnershipInputType = z.infer<typeof BulkSetDocumentOwnershipInput>;

// ResetDocumentOwnershipInput — clear all per-user entries; restore
// `default: 0` (NONE). Folder rejected at schema level (single-target write).
export const ResetDocumentOwnershipInput = z
  .object({
    ...DocumentTargetShape,
  })
  .strict()
  .superRefine((v, ctx) => {
    checkTargetIdentifier(v, ctx);
    if (v.documentType === 'folder') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'OWNERSHIP_FOLDER_NOT_SUPPORTED: BaseFolder has no `ownership` field to reset (ADR-024).',
        path: ['documentType'],
      });
    }
  });
export type ResetDocumentOwnershipInputType = z.infer<typeof ResetDocumentOwnershipInput>;
