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
  // RC1.2 (mcp_code_quality_v2 Phase C1) — additive-only per-item failure detail for batch
  // multi-target writes. Absent (undefined, not []) on every non-batch / all-succeeded call —
  // callers that don't pass `failed` never see the field, preserving byte-identical output for
  // every pre-C1 consumer (CCR-V4).
  failedItems?: Array<{ id: string; reason: string }>;
}

// All inputs default to []; ids are filtered to non-empty strings (handlers sometimes hold nullable ids, e.g.
// trade-item's `destItem?.id ?? null`). Every field is emitted uniformly even when empty — a simpler consumer
// contract is worth a few bytes (PRD design decision; Risk 12.B not triggered — receipts measure <500 bytes).
export function buildOperationReceipt(args?: {
  created?: Array<string | null | undefined>;
  updated?: Array<string | null | undefined>;
  deleted?: Array<string | null | undefined>;
  warnings?: Array<string | null | undefined>;
  failed?: Array<{ id: string | null | undefined; reason: string } | null | undefined>;
}): OperationReceipt {
  const cleanIds = (arr?: Array<string | null | undefined>): string[] =>
    (arr ?? []).filter((id): id is string => typeof id === 'string' && id.length > 0);
  const cleanFailed = (
    arr?: Array<{ id: string | null | undefined; reason: string } | null | undefined>,
  ): Array<{ id: string; reason: string }> | undefined => {
    const filtered = (arr ?? []).filter(
      (f): f is { id: string; reason: string } =>
        f != null && typeof f.id === 'string' && f.id.length > 0 && typeof f.reason === 'string',
    );
    return filtered.length > 0 ? filtered : undefined;
  };
  const receipt: OperationReceipt = {
    operationId: foundry.utils.randomID(),
    createdDocumentIds: cleanIds(args?.created),
    updatedDocumentIds: cleanIds(args?.updated),
    deletedDocumentIds: cleanIds(args?.deleted),
    warnings: cleanIds(args?.warnings),
  };
  const failedItems = cleanFailed(args?.failed);
  if (failedItems) receipt.failedItems = failedItems;
  return receipt;
}
