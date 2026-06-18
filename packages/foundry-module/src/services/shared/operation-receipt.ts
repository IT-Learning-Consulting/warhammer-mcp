// services/shared/operation-receipt.ts — MCP Code-Quality Hardening v1, Phase 12 (R12.2).
//
// Builds a uniform "operation receipt" for the 7 multi-step mutation tools: an ephemeral operationId plus the
// created / updated / deleted document-id arrays that a workflow which fails mid-op needs to drive cleanup.
// In-memory only — PRD §4.2 explicitly rejects persistence / audit-log for v1 (no DB, no flag write).
//
// PLACEMENT (Phase 7 finding): services/shared/ is caps-exempt under the lint-ratchet `**/services/**` glob
// and dep-cruiser permits cross-service import from here (unlike a flat services/<svc>.ts). Serves 7 call-sites.
//
// `foundry.utils.randomID()` runs in the Foundry browser sandbox — same idiom as transaction-manager.ts:40.

export interface OperationReceipt {
  operationId: string;
  createdDocumentIds: string[];
  updatedDocumentIds: string[];
  deletedDocumentIds: string[];
  warnings: string[];
}

// All inputs default to []; ids are filtered to non-empty strings (handlers sometimes hold nullable ids, e.g.
// trade-item's `destItem?.id ?? null`). Every field is emitted uniformly even when empty — a simpler consumer
// contract is worth a few bytes (PRD design decision; Risk 12.B not triggered — receipts measure <500 bytes).
export function buildOperationReceipt(args?: {
  created?: Array<string | null | undefined>;
  updated?: Array<string | null | undefined>;
  deleted?: Array<string | null | undefined>;
  warnings?: Array<string | null | undefined>;
}): OperationReceipt {
  const cleanIds = (arr?: Array<string | null | undefined>): string[] =>
    (arr ?? []).filter((id): id is string => typeof id === 'string' && id.length > 0);
  return {
    operationId: foundry.utils.randomID(),
    createdDocumentIds: cleanIds(args?.created),
    updatedDocumentIds: cleanIds(args?.updated),
    deletedDocumentIds: cleanIds(args?.deleted),
    warnings: cleanIds(args?.warnings),
  };
}
